import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
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
  GAPS_RELATIVE,
  CROSSWALK_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
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

export type CzechiaEvidenceRef = {
  source_id: string;
  input_path: string;
  sha256?: string;
  archive_entry?: string | null;
  locator?: unknown;
};

export type CzechiaAuthoredDate = {
  value: string;
  precision: string;
  certainty: string;
  note?: string;
  evidence?: CzechiaEvidenceRef[];
};

export type CzechiaOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  office_status: string;
  tier_proposal?: string;
  human_review_required?: boolean;
  next_election?: CzechiaAuthoredDate | null;
  evidence?: CzechiaEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CzechiaEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  date?: CzechiaAuthoredDate | null;
  event_kind?: string;
  selected_history_role?: string;
  legal_outcome?: string;
  ballot_basis?: string;
  share_unit?: string;
  prospective?: boolean;
  contest_scope?: string | null;
  evidence?: CzechiaEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CzechiaProceedingRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id?: string;
  proceeding_id: string;
  kind: string;
  sequence_no: number;
  supersedes_id?: string | null;
  legal_outcome?: string;
  evidence?: CzechiaEvidenceRef[];
  [key: string]: unknown;
};

export type CzechiaGeographyRow = {
  geography_id: string;
  name: string;
  country_id?: string;
  parent_geography_id?: string | null;
  evidence?: CzechiaEvidenceRef[];
  [key: string]: unknown;
};

export type CzechiaSourceRow = {
  source_id: string;
  source_namespace?: string;
  country_id?: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  byte_count?: number | null;
  data_rights?: string | null;
  checked_as_of?: string | null;
  [key: string]: unknown;
};

export type CzechiaResearchGapRow = {
  original_token: string;
  reason: string;
  status?: string;
  office_ids?: string[];
  evidence?: CzechiaEvidenceRef[];
  [key: string]: unknown;
};

export type CzechiaCrosswalkRow = {
  entity_kind?: string;
  upstream_namespace: string;
  upstream_id: string;
  target_office_id: string;
  reason: string;
  [key: string]: unknown;
};

export type CzechiaTierClassification = {
  office_id: string;
  tier: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type CzechiaInventory = {
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
  offices: CzechiaOfficeRow[];
  events: CzechiaEventRow[];
  geographies: CzechiaGeographyRow[];
  sourceCatalogue: CzechiaSourceRow[];
  researchGaps: CzechiaResearchGapRow[];
  crosswalks: CzechiaCrosswalkRow[];
  proceedings: CzechiaProceedingRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: CzechiaTierClassification[];
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
      throw new Error(`Unexpected symlink in Czechia research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (isDocumentationName(entry.name)) continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Czechia research pack: ${rel}`);
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

export class CzechiaPreflightError extends Error {
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
      "data/research/czechia/results.jsonl.gz",
      "data/research/czechia/events.json",
      "data/research/czechia/sources/",
      "docs/phase1/czechia/Czechia_Identity_Vectors.json",
      "docs/phase1/czechia/Czechia_Result_Identity_Vectors.jsonl.gz",
    ],
  };
}

function readJson<T>(absPath: string, relativePath: string): T {
  const bytes = readFileSync(absPath);
  const text = relativePath.endsWith(".gz") ? gunzipSync(bytes).toString("utf8") : bytes.toString("utf8");
  return JSON.parse(text) as T;
}

function readJsonArray<T>(absPath: string, relativePath: string): T[] {
  const parsed = readJson<unknown>(absPath, relativePath);
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a JSON array`);
  }
  return parsed as T[];
}

export function scanCzechiaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): CzechiaInventory {
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
    throw new CzechiaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new CzechiaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new CzechiaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Czechia research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new CzechiaPreflightError(
        "unpinned_worktree",
        "Czechia research worktree files do not match git-tracked paths.",
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
    throw new CzechiaPreflightError("missing_tier", `Approved Czechia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: CzechiaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as CzechiaInventory["tiers"];
  } catch (error) {
    throw new CzechiaPreflightError(
      "tier_unreadable",
      `Czechia tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new CzechiaPreflightError(
      "tier_not_approved",
      `Czechia tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new CzechiaPreflightError(
      "tier_hash_mismatch",
      `Czechia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new CzechiaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new CzechiaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (
    tracked.some(
      (item) =>
        item.input_path.endsWith("results.jsonl.gz") ||
        item.input_path.endsWith("results.json") ||
        item.input_path.endsWith("/events.json"),
    )
  ) {
    throw new CzechiaPreflightError(
      "unexpected_results_blob",
      "Czechia slim land must not invent result rows or an uncompressed events.json twin. A results blob needs an explicit importer change.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new CzechiaPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Czechia inputs, found ${tracked.length}.`,
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
  const mustRead = [
    REGISTER_RELATIVE,
    EVENTS_RELATIVE,
    GEOGRAPHY_RELATIVE,
    SOURCES_RELATIVE,
    GAPS_RELATIVE,
    CROSSWALK_RELATIVE,
    PROCEEDINGS_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new CzechiaPreflightError("missing_research_table", `Missing required Czechia research table ${rel}.`, intendedInventory);
    }
  }

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
    offices: readJsonArray<CzechiaOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readJsonArray<CzechiaEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    geographies: readJsonArray<CzechiaGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    sourceCatalogue: readJsonArray<CzechiaSourceRow>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE),
    researchGaps: readJsonArray<CzechiaResearchGapRow>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE),
    crosswalks: readJsonArray<CzechiaCrosswalkRow>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE),
    proceedings: readJsonArray<CzechiaProceedingRow>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE),
    tiers: tierJson,
    intendedInventory,
  };
}
