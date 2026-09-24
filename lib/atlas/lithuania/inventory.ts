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
  COUNTS_RELATIVE,
  COUNTRY_RELATIVE,
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OMITTED_SOURCES_PREFIX,
  OMITTED_VALIDATOR_RELATIVE,
  PROCEEDINGS_RELATIVE,
  RECONCILIATION_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  RESULTS_SHA256,
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

export type LithuaniaOrigin = {
  input_path: string;
  sha256?: string;
  source_id?: string;
  locator?: Record<string, unknown>;
  [key: string]: unknown;
};

export type LithuaniaAuthoredDate = {
  label: string;
  precision: string;
  certainty: string;
  year?: number | null;
  month?: number | null;
  day?: number | null;
};

export type LithuaniaOfficeRow = {
  office_id: string;
  office_name: string;
  office_type: string;
  geography_id: string;
  current: boolean;
  historical?: boolean;
  proposed_tier?: string;
  electoral_mode?: string;
  next_date?: LithuaniaAuthoredDate | null;
  next_history_key?: string | null;
  successor_office_id?: string;
  holds?: string[];
  origins?: LithuaniaOrigin[];
  [key: string]: unknown;
};

export type LithuaniaEventRow = {
  office_id: string;
  history_key: string;
  event_id: string;
  cycle?: string;
  date: LithuaniaAuthoredDate;
  election_mode: string;
  role?: string;
  event_kind?: string;
  legal_outcome?: string;
  origins?: LithuaniaOrigin[];
  raw?: { date_origin?: LithuaniaOrigin; [key: string]: unknown };
  [key: string]: unknown;
};

export type LithuaniaProceedingRow = {
  office_id: string;
  history_key: string;
  event_id: string;
  proceeding_id: string;
  sequence: number;
  kind: string;
  date: LithuaniaAuthoredDate;
  origins?: LithuaniaOrigin[];
  supersedes_id?: string | null;
  legal_outcome?: string;
  [key: string]: unknown;
};

export type LithuaniaResultRow = {
  result_row_id: string;
  office_id: string;
  history_key: string;
  event_id?: string;
  proceeding_id?: string | null;
  candidate_or_list_label?: string | null;
  candidate_source_id: string;
  original_party_label?: string | null;
  original_party_code?: string | null;
  votes?: number | null;
  votes_status: string;
  share?: number | null;
  share_status: string;
  share_unit?: string;
  seats?: number | null;
  seats_status: string;
  elected_flag?: boolean | null;
  evidence_status: string;
  is_substitute?: boolean | null;
  origins?: LithuaniaOrigin[];
  [key: string]: unknown;
};

export type LithuaniaGeographyRow = {
  geography_id: string;
  name: string;
  parent_geography_id?: string | null;
  origins?: LithuaniaOrigin[];
  [key: string]: unknown;
};

export type LithuaniaSourceRow = {
  source_id: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  retrieved_on?: string | null;
  evidence_grade?: string;
  [key: string]: unknown;
};

export type LithuaniaCrosswalkRow = {
  entity_kind: string;
  upstream_namespace: string;
  upstream_id: string;
  record_key: string;
  reason: string;
  [key: string]: unknown;
};

export type LithuaniaCountryRow = {
  country_id: string;
  country_code: string;
  name: string;
  polity_kind: string;
  region_id: string;
  coverage_status: string;
  screening_as_of_label?: string;
  research_snapshot_label?: string;
  historical_office_universe_complete?: boolean;
  research_coverage_complete?: boolean;
  notes?: string[];
  [key: string]: unknown;
};

export type LithuaniaCountsRow = {
  current_offices: number;
  historical_offices: number;
  total_offices: number;
  result_rows: number;
  events: number;
  proceedings: number;
  sources: number;
  historical_office_universe_complete: boolean;
  research_coverage_complete: boolean;
  [key: string]: unknown;
};

export type LithuaniaUnresolvedClaim = {
  token: string;
  target_table: string;
  target_key: { office_id: string; history_key: string; result_row_id: string };
  reason: string;
  claims?: LithuaniaOrigin[];
  [key: string]: unknown;
};

export type LithuaniaReconciliationRow = {
  event_id?: string;
  proceeding_id?: string;
  raw_invalid_text?: string;
  invalid_status?: string;
  invalid_numeric?: number | null;
  [key: string]: unknown;
};

export type LithuaniaTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  review_categories?: string[];
  [key: string]: unknown;
};

export type LithuaniaInventory = {
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
  offices: LithuaniaOfficeRow[];
  events: LithuaniaEventRow[];
  results: LithuaniaResultRow[];
  geographies: LithuaniaGeographyRow[];
  sourceCatalogue: LithuaniaSourceRow[];
  crosswalks: LithuaniaCrosswalkRow[];
  proceedings: LithuaniaProceedingRow[];
  country: LithuaniaCountryRow;
  counts: LithuaniaCountsRow;
  unresolvedClaims: LithuaniaUnresolvedClaim[];
  reconciliation: LithuaniaReconciliationRow[];
  tiers: {
    status: string;
    approval?: { Justin_accepted?: boolean; production_accepted?: boolean };
    classifications: LithuaniaTierClassification[];
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
      throw new Error(`Unexpected symlink in Lithuania research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_PREFIX.replace(/\/$/, "") || rel.startsWith(OMITTED_SOURCES_PREFIX)) {
        throw new Error(`Omitted Lithuania sources tree is present at ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Lithuania research pack: ${rel}`);
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

export class LithuaniaPreflightError extends Error {
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
    omitted_sources: OMITTED_SOURCES_PREFIX,
    omitted_validator: OMITTED_VALIDATOR_RELATIVE,
  };
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function scanLithuaniaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): LithuaniaInventory {
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
    throw new LithuaniaPreflightError(
      "schema_hash_mismatch",
      "Attempt-log SQL bytes do not match the Identity Rules digest.",
      {},
    );
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new LithuaniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (
      tracked.some((rel) => rel.startsWith(OMITTED_SOURCES_PREFIX) || rel === OMITTED_VALIDATOR_RELATIVE) ||
      walked.some((rel) => rel.startsWith(OMITTED_SOURCES_PREFIX) || rel === OMITTED_VALIDATOR_RELATIVE)
    ) {
      throw new LithuaniaPreflightError(
        "omitted_sources_present",
        "Raw sources/ or validate.py is present. The slim importer does not invent or silently adopt omitted source bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new LithuaniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Lithuania research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new LithuaniaPreflightError(
        "unpinned_worktree",
        "Lithuania research worktree files do not match git-tracked paths.",
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
    throw new LithuaniaPreflightError(
      "missing_tier",
      `Lithuania tier file is missing at ${TIER_PATH}.`,
      intendedInventory,
    );
  }

  let tierJson: LithuaniaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as LithuaniaInventory["tiers"];
  } catch (error) {
    throw new LithuaniaPreflightError(
      "tier_unreadable",
      `Lithuania tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "draft_for_human_review") {
    throw new LithuaniaPreflightError(
      "tier_not_draft",
      `Lithuania tiers status is ${JSON.stringify(tierJson.status)}. Import the landed draft_for_human_review bytes; do not rewrite them to approved.`,
      intendedInventory,
    );
  }
  if (tierJson.approval?.production_accepted === true || tierJson.approval?.Justin_accepted === true) {
    throw new LithuaniaPreflightError(
      "tier_approval_rewritten",
      "Lithuania tier approval flags must stay false. Draft acceptance did not rewrite the tier file.",
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new LithuaniaPreflightError(
      "tier_hash_mismatch",
      `Lithuania tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new LithuaniaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new LithuaniaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }
  const resultsFile = tracked.find((item) => item.input_path === RESULTS_RELATIVE);
  if (!resultsFile || resultsFile.sha256 !== RESULTS_SHA256) {
    throw new LithuaniaPreflightError(
      "results_hash_mismatch",
      `Results SHA-256 mismatch; expected ${RESULTS_SHA256}.`,
      intendedInventory,
    );
  }
  if (tracked.some((item) => item.input_path.startsWith(OMITTED_SOURCES_PREFIX) || item.input_path === OMITTED_VALIDATOR_RELATIVE)) {
    throw new LithuaniaPreflightError(
      "omitted_sources_present",
      "Raw sources/ and validate.py must stay omitted from the slim pack.",
      intendedInventory,
    );
  }
  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new LithuaniaPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Lithuania inputs, found ${tracked.length}.`,
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
    RESULTS_RELATIVE,
    GEOGRAPHY_RELATIVE,
    SOURCES_RELATIVE,
    CROSSWALK_RELATIVE,
    PROCEEDINGS_RELATIVE,
    COUNTRY_RELATIVE,
    COUNTS_RELATIVE,
    UNRESOLVED_RELATIVE,
    RECONCILIATION_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new LithuaniaPreflightError("missing_research_table", `Missing required Lithuania research table ${rel}.`, intendedInventory);
    }
  }

  const offices = readJson<LithuaniaOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<LithuaniaEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const results = readJson<LithuaniaResultRow[]>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE);
  const geographies = readJson<LithuaniaGeographyRow[]>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE);
  const sourceCatalogue = readJson<LithuaniaSourceRow[]>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE);
  const crosswalks = readJson<LithuaniaCrosswalkRow[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const proceedings = readJson<LithuaniaProceedingRow[]>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE);
  const country = readJson<LithuaniaCountryRow>(byPath.get(COUNTRY_RELATIVE)!.absPath, COUNTRY_RELATIVE);
  const counts = readJson<LithuaniaCountsRow>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const unresolvedClaims = readJson<LithuaniaUnresolvedClaim[]>(
    byPath.get(UNRESOLVED_RELATIVE)!.absPath,
    UNRESOLVED_RELATIVE,
  );
  const reconciliation = readJson<LithuaniaReconciliationRow[]>(
    byPath.get(RECONCILIATION_RELATIVE)!.absPath,
    RECONCILIATION_RELATIVE,
  );
  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(geographies) || !Array.isArray(results)) {
    throw new LithuaniaPreflightError(
      "research_shape",
      "Lithuania office, event, geography, and result tables must be arrays.",
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
    offices,
    events,
    results,
    geographies,
    sourceCatalogue,
    crosswalks,
    proceedings,
    country,
    counts,
    unresolvedClaims,
    reconciliation,
    tiers: tierJson,
    intendedInventory,
  };
}
