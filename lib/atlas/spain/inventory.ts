import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
} from "../identity";
import { ATLAS_ATTEMPT_LOG_FILENAME, ATLAS_MASTER_FILENAME, ATLAS_MIGRATIONS_DIR } from "../migrations";
import {
  ADAPTER_VERSION,
  EXPECTED_COUNTS,
  EVENTS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  CROSSWALK_RELATIVE,
  DRAFT_TIER_SHA256,
  LINEAGE_ID,
  METHOD_VERSION,
  MUNICIPAL_BLOCKS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UNBOUND_RELATIVE,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
  text: string | null;
};

export type SpainOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  office_status: string;
  electoral_mode?: string;
  record_state?: string;
  registry_qualified?: number;
  proposed_tier?: string;
  next_date?: unknown;
  holds?: string[];
  successor_office_id?: string | null;
  [key: string]: unknown;
};

export type SpainEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  date?: {
    label?: string;
    precision?: string;
    certainty?: string;
    year?: number | null;
    month?: number | null;
    day?: number | null;
  } | null;
  event_kind?: string;
  selected_history_role?: string;
  legal_outcome?: string;
  ballot_basis?: string;
  share_unit?: string;
  record_state?: string;
  holds?: string[];
  [key: string]: unknown;
};

export type SpainGeographyRow = {
  geography_id: string;
  name: string;
  parent_geography_id?: string | null;
  kind?: string;
  [key: string]: unknown;
};

export type SpainCrosswalkRow = {
  entity_kind: string;
  upstream_namespace: string;
  upstream_id: string;
  record_key: string;
  reason: string;
  [key: string]: unknown;
};

export type SpainTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  office?: string;
  [key: string]: unknown;
};

export type SpainInventory = {
  root: string;
  researchDir: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  offices: SpainOfficeRow[];
  events: SpainEventRow[];
  geographies: SpainGeographyRow[];
  crosswalks: SpainCrosswalkRow[];
  unboundBlockCount: number;
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: SpainTierClassification[];
    source_register?: { sha256?: string; path?: string; input_path?: string };
  };
  intendedInventory: Record<string, unknown>;
};

function posixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

function isDocumentationName(name: string): boolean {
  return name === "README.md" || name === "SOURCES_NOTE.md";
}

function walkRegularFiles(dir: string, relBase: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = posixJoin(relBase, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || lstatSync(abs).isSymbolicLink()) {
      throw new Error(`Unexpected symlink in Spain research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (isDocumentationName(entry.name)) continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Spain research pack: ${rel}`);
    }
  }
  return out.sort();
}

function gitTrackedResearchFiles(root: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", RESEARCH_PREFIX, TIER_PATH], {
    encoding: "buffer",
  });
  return output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel) && !isDocumentationName(path.posix.basename(rel)))
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export class SpainPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

function buildIntendedInventory(args: {
  gitCommit: string | null;
  packageFiles: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }>;
  tier: { input_path: string; sha256: string | null; byte_count: number | null; error?: string; status?: string | null };
}): Record<string, unknown> {
  return {
    lineage_id: LINEAGE_ID,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
    git_commit: args.gitCommit,
    package_files: args.packageFiles,
    tier: args.tier,
    overrides: [],
    omitted_slim_inputs: [
      "data/research/spain/results.json",
      "data/research/spain/sources/",
      "data/research/spain/sources.json",
      "data/research/spain/register-source-rows.json",
      "data/research/spain/events.json",
      "docs/phase1/spain/Spain_Identity_Vectors.json",
    ],
  };
}

function readJsonArray<T>(absPath: string, relativePath: string): T[] {
  const parsed = JSON.parse(readFileSync(absPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a JSON array`);
  }
  return parsed as T[];
}

function readGzipJsonArray<T>(absPath: string, relativePath: string): T[] {
  const text = gunzipSync(readFileSync(absPath)).toString("utf8");
  if (/\bFIX-/i.test(text) || /\bFXT-/i.test(text)) {
    throw new Error(`Fixture token rejected in retained input ${relativePath}`);
  }
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must gunzip to a JSON array`);
  }
  return parsed as T[];
}

function assertNoFixtureGzip(absPath: string, relativePath: string): void {
  const text = gunzipSync(readFileSync(absPath)).toString("utf8");
  if (/\bFIX-/i.test(text) || /\bFXT-/i.test(text)) {
    throw new Error(`Fixture token rejected in retained input ${relativePath}`);
  }
}

export function scanSpainInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): SpainInventory {
  const root = options.root;
  const researchDir = options.researchDir ?? path.join(root, RESEARCH_PREFIX);
  const researchPrefix = options.researchDir
    ? path.relative(root, researchDir).replace(/\\/g, "/") || RESEARCH_PREFIX
    : RESEARCH_PREFIX;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new SpainPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new SpainPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new SpainPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Spain research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new SpainPreflightError(
        "unpinned_worktree",
        "Spain research worktree files do not match git-tracked paths.",
        {},
      );
    }
    packagePaths = tracked;
  } else {
    packagePaths = [...walkRegularFiles(researchDir, researchPrefix), TIER_PATH].sort();
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> =
    [];
  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const logical = rel === TIER_PATH || requireGit ? rel : posixJoin(RESEARCH_PREFIX, path.relative(researchPrefix, rel));
    const abs = rel === TIER_PATH ? (options.tierPath ? tierAbs : path.join(root, TIER_PATH)) : path.join(root, requireGit ? rel : logical);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: logical,
        input_kind: inputKindFor(logical),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
        text: logical.endsWith(".json") ? bytes.toString("utf8") : null,
      };
      tracked.push(item);
      packageFilesMeta.push({ input_path: item.input_path, sha256: item.sha256, byte_count: item.byte_count });
    } catch (error) {
      packageFilesMeta.push({
        input_path: rel,
        sha256: null,
        byte_count: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const tierItem = tracked.find((item) => item.input_path === TIER_PATH);
  const tierMeta = {
    input_path: TIER_PATH,
    sha256: tierItem?.sha256 ?? null,
    byte_count: tierItem?.byte_count ?? null,
    status: null as string | null,
    error: existsSync(tierAbs) ? undefined : "missing_tier_file",
  };
  const intendedInventory = buildIntendedInventory({
    gitCommit,
    packageFiles: packageFilesMeta,
    tier: tierMeta,
  });

  if (tierMeta.error === "missing_tier_file" || !tierItem) {
    throw new SpainPreflightError("missing_tier", `Approved Spain tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: SpainInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as SpainInventory["tiers"];
  } catch (error) {
    throw new SpainPreflightError(
      "tier_unreadable",
      `Spain tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new SpainPreflightError(
      "tier_not_approved",
      `Spain tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new SpainPreflightError(
      "tier_hash_mismatch",
      `Spain tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 === DRAFT_TIER_SHA256) {
    throw new SpainPreflightError(
      "tier_hash_mismatch",
      "Spain tier bytes still match the predecessor draft digest.",
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new SpainPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new SpainPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (
    tracked.some(
      (item) =>
        item.input_path.endsWith("/results.json") ||
        item.input_path.endsWith("/results.json.gz") ||
        item.input_path.endsWith("/events.json") ||
        item.input_path.includes("/sources/"),
    )
  ) {
    throw new SpainPreflightError(
      "unexpected_omitted_blob",
      "Spain slim land must not invent result rows, an uncompressed events.json twin, or raw source bytes.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new SpainPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Spain inputs, found ${tracked.length}.`,
      intendedInventory,
    );
  }

  const hashInputs = buildHashInputs({
    inputs: tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  const releaseId = releaseIdFor(fingerprint);

  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const mustRead = [REGISTER_RELATIVE, EVENTS_RELATIVE, GEOGRAPHY_RELATIVE, CROSSWALK_RELATIVE, UNBOUND_RELATIVE, MUNICIPAL_BLOCKS_RELATIVE];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new SpainPreflightError("missing_research_table", `Missing required Spain research table ${rel}.`, intendedInventory);
    }
  }

  const unbound = readJsonArray<Record<string, unknown>>(byPath.get(UNBOUND_RELATIVE)!.absPath, UNBOUND_RELATIVE);
  if (unbound.length !== EXPECTED_COUNTS.unbound_municipal_blocks) {
    throw new SpainPreflightError(
      "unbound_block_count",
      `Expected ${EXPECTED_COUNTS.unbound_municipal_blocks} unbound municipal blocks, found ${unbound.length}.`,
      intendedInventory,
    );
  }
  if (unbound.some((row) => typeof row.office_id === "string" && row.office_id.length > 0)) {
    throw new SpainPreflightError(
      "unbound_block_office",
      "Unbound municipal blocks must not carry office ids. ES-G10 stays outside the office register.",
      intendedInventory,
    );
  }

  assertNoFixtureGzip(byPath.get(MUNICIPAL_BLOCKS_RELATIVE)!.absPath, MUNICIPAL_BLOCKS_RELATIVE);

  return {
    root,
    researchDir,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath,
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    offices: readJsonArray<SpainOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readGzipJsonArray<SpainEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    geographies: readJsonArray<SpainGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    crosswalks: readJsonArray<SpainCrosswalkRow>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE),
    unboundBlockCount: unbound.length,
    tiers: tierJson,
    intendedInventory,
  };
}
