import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
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
  CATALOGUE_LOOKUP_PATH,
  EXPECTED_COUNTS,
  EVENTS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
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

export type NetherlandsEvidenceRef = {
  input_path: string;
  sha256?: string;
  locator?: string;
  json_pointer?: string;
};

export type NetherlandsOfficeRow = {
  office_id: string;
  name: string;
  office_type: string;
  geography_id: string;
  current: boolean;
  next_election?: {
    label: string;
    precision: string;
    certainty: string;
    source?: NetherlandsEvidenceRef;
    evidence?: NetherlandsEvidenceRef;
    alert_window_status?: string;
  } | null;
  evidence?: NetherlandsEvidenceRef[];
  notes?: string[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type NetherlandsEventRow = {
  office_id: string;
  history_key: string;
  event_id: string;
  date?: string | null;
  precision?: string | null;
  certainty?: string | null;
  date_resolution?: string;
  event_kind?: string;
  selected_history_role?: string;
  legal_outcome?: string;
  ballot_basis?: string;
  prospective?: boolean;
  evidence?: NetherlandsEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type NetherlandsResultRow = {
  office_id: string;
  history_key: string;
  event_id: string;
  result_row_id: string;
  source_row_id?: string;
  candidate_or_list_label?: string | null;
  original_party_label?: string | null;
  original_party_code?: string | null;
  votes?: number | null;
  votes_status?: string;
  share?: number | null;
  share_status?: string;
  share_unit?: string | null;
  seats?: number | null;
  seats_status?: string;
  elected_flag?: number | null;
  evidence_status?: string;
  evidence?: NetherlandsEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type NetherlandsGeographyRow = {
  geography_id: string;
  name: string;
  parent_geography_id?: string | null;
  evidence?: NetherlandsEvidenceRef[];
  [key: string]: unknown;
};

export type NetherlandsSourceRow = {
  source_id: string;
  input_path: string;
  url?: string | null;
  publisher?: string | null;
  sha256?: string | null;
  bytes?: number | null;
  checked_as_of_label?: string | null;
  [key: string]: unknown;
};

export type NetherlandsUnresolvedRow = {
  original_token: string;
  office_ids?: string[];
  result_row_id?: string;
  history_key?: string;
  reason: string;
  date?: string;
  evidence?: NetherlandsEvidenceRef[];
  [key: string]: unknown;
};

export type NetherlandsTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type NetherlandsInventory = {
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
  offices: NetherlandsOfficeRow[];
  events: NetherlandsEventRow[];
  results: NetherlandsResultRow[];
  geographies: NetherlandsGeographyRow[];
  sourceCatalogue: NetherlandsSourceRow[];
  unresolved: NetherlandsUnresolvedRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: NetherlandsTierClassification[];
    source_register?: { sha256?: string; path?: string };
  };
  intendedInventory: Record<string, unknown>;
};

function posixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

function walkRegularFiles(dir: string, relBase: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = posixJoin(relBase, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || lstatSync(abs).isSymbolicLink()) {
      throw new Error(`Unexpected symlink in Netherlands research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Netherlands research pack: ${rel}`);
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
    .filter((rel) => Boolean(rel) && !rel.endsWith("/README.md") && rel !== `${RESEARCH_PREFIX}/README.md`)
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export class NetherlandsPreflightError extends Error {
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
    omitted_bulky_sources: true,
  };
}

function readJsonArray<T>(absPath: string, relativePath: string): T[] {
  const parsed = JSON.parse(readFileSync(absPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a JSON array`);
  }
  return parsed as T[];
}

function loadSourceCatalogue(root: string, byPath: Map<string, TrackedInput>): NetherlandsSourceRow[] {
  const landed = byPath.get(SOURCES_RELATIVE);
  if (landed) {
    return readJsonArray<NetherlandsSourceRow>(landed.absPath, SOURCES_RELATIVE);
  }
  const lookupAbs = path.join(root, CATALOGUE_LOOKUP_PATH);
  if (!existsSync(lookupAbs)) {
    throw new Error(`Netherlands source catalogue lookup is missing at ${CATALOGUE_LOOKUP_PATH}`);
  }
  const parsed = JSON.parse(readFileSync(lookupAbs, "utf8")) as { sources?: NetherlandsSourceRow[] };
  if (!Array.isArray(parsed.sources)) {
    throw new Error(`${CATALOGUE_LOOKUP_PATH} must contain a sources array`);
  }
  return parsed.sources;
}

export function scanNetherlandsInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): NetherlandsInventory {
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
    throw new NetherlandsPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new NetherlandsPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new NetherlandsPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Netherlands research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new NetherlandsPreflightError(
        "unpinned_worktree",
        "Netherlands research worktree files do not match git-tracked paths.",
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
    throw new NetherlandsPreflightError("missing_tier", `Approved Netherlands tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: NetherlandsInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as NetherlandsInventory["tiers"];
  } catch (error) {
    throw new NetherlandsPreflightError(
      "tier_unreadable",
      `Netherlands tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new NetherlandsPreflightError(
      "tier_not_approved",
      `Netherlands tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new NetherlandsPreflightError(
      "tier_hash_mismatch",
      `Netherlands tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new NetherlandsPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new NetherlandsPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new NetherlandsPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Netherlands inputs, found ${tracked.length}.`,
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
  const mustRead = [REGISTER_RELATIVE, EVENTS_RELATIVE, RESULTS_RELATIVE, GEOGRAPHY_RELATIVE, UNRESOLVED_RELATIVE];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new NetherlandsPreflightError("missing_research_table", `Missing required Netherlands research table ${rel}.`, intendedInventory);
    }
  }

  const sourceCatalogue = loadSourceCatalogue(root, byPath);
  if (sourceCatalogue.length !== EXPECTED_COUNTS.catalogue_rows) {
    throw new NetherlandsPreflightError(
      "source_catalogue",
      `Expected ${EXPECTED_COUNTS.catalogue_rows} documented Netherlands sources, found ${sourceCatalogue.length}.`,
      intendedInventory,
    );
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
    offices: readJsonArray<NetherlandsOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readJsonArray<NetherlandsEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    results: readJsonArray<NetherlandsResultRow>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE),
    geographies: readJsonArray<NetherlandsGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    sourceCatalogue,
    unresolved: readJsonArray<NetherlandsUnresolvedRow>(byPath.get(UNRESOLVED_RELATIVE)!.absPath, UNRESOLVED_RELATIVE),
    tiers: tierJson,
    intendedInventory,
  };
}
