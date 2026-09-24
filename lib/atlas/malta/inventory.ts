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
  CALENDAR_RELATIVE,
  COUNTS_RELATIVE,
  COUNT_TOTALS_RELATIVE,
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  EXTRACTION_ISSUES_RELATIVE,
  FIELD_MAP_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  NOMINATIONS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  OMITTED_STV_RELATIVE,
  PARTY_AGGREGATES_RELATIVE,
  PINNED_INPUTS,
  POST_ELECTION_RELATIVE,
  PREDECESSOR_DRAFT_TIER_SHA256,
  REGISTER_RELATIVE,
  REPORTING_UNITS_RELATIVE,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  SOURCE_INVENTORY_RELATIVE,
  TERRITORIAL_GATES_RELATIVE,
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

export type MaltaOfficeRow = {
  office_id: string;
  name: string;
  office_type: string;
  status: string;
  tier: string;
  selection_mode: string;
  standalone_popular_executive_ballot: boolean;
  locality?: string;
  island?: string;
  region?: string;
  parent_council_id?: string;
  separate_contest?: boolean;
  next_poll_date?: string | null;
  justin_approved?: boolean;
  [key: string]: unknown;
};

export type MaltaEventRow = {
  event_id: string;
  office_id: string;
  date: string;
  date_precision: string;
  event_type: string;
  electoral_system: string | null;
  ballot_basis: string;
  result_status: string;
  certified_status: string;
  [key: string]: unknown;
};

export type MaltaNominationRow = {
  region: string;
  name: string;
  date: string;
  elected: null;
  votes: null;
  status: string;
  [key: string]: unknown;
};

export type MaltaCountsFile = {
  current_offices: number;
  historical_offices: number;
  events: number;
  results: number;
  numeric_first_preference_rows: number;
  stv_count_observations: number;
  distinct_source_files: number;
  [key: string]: unknown;
};

export type MaltaSourceInventoryRow = {
  source_id: string;
  path: string;
  sha256: string;
  [key: string]: unknown;
};

export type MaltaTierClassification = {
  office_id: string;
  tier: string;
  review_status: string;
  rationale: string;
  human_review_required?: boolean;
  [key: string]: unknown;
};

export type MaltaInventory = {
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
  offices: MaltaOfficeRow[];
  events: MaltaEventRow[];
  successorCrosswalk: unknown[];
  nominations: MaltaNominationRow[];
  countsFile: MaltaCountsFile;
  sourceInventory: MaltaSourceInventoryRow[];
  countTotals: unknown[];
  partyAggregates: Array<{ basis?: string; [key: string]: unknown }>;
  reportingUnits: unknown[];
  postElectionObservations: unknown[];
  calendar: Array<{ exact_poll_date: string | null; [key: string]: unknown }>;
  territorialGates: unknown[];
  extractionIssues: unknown[];
  fieldMap: unknown[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    predecessor_draft_sha256?: string;
    classifications: MaltaTierClassification[];
    counts_by_proposed_tier?: Record<string, number>;
    justin_approval?: { holds_open?: string[]; holds_resolved?: string[] };
    approval?: { holds_open?: string[] };
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
      throw new Error(`Unexpected symlink in Malta research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
        throw new Error(`Omitted Malta sources directory is present: ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      if (rel === OMITTED_RESULTS_RELATIVE || rel === OMITTED_STV_RELATIVE) {
        throw new Error(`Omitted Malta results or STV file is present: ${rel}`);
      }
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Malta research pack: ${rel}`);
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

export class MaltaPreflightError extends Error {
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
    omitted_results: OMITTED_RESULTS_RELATIVE,
    omitted_stv_counts: OMITTED_STV_RELATIVE,
    omitted_sources_dir: OMITTED_SOURCES_DIR,
  };
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch (error) {
    throw new Error(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function omittedPath(rel: string): boolean {
  return (
    rel === OMITTED_RESULTS_RELATIVE ||
    rel === OMITTED_STV_RELATIVE ||
    rel === OMITTED_SOURCES_DIR ||
    rel.startsWith(`${OMITTED_SOURCES_DIR}/`)
  );
}

export function scanMaltaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): MaltaInventory {
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
    throw new MaltaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new MaltaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.some((rel) => omittedPath(rel))) {
      throw new MaltaPreflightError(
        "omitted_bytes_present",
        "Malta results.json, stv-counts.json, or sources/ is present. The slim importer does not adopt omitted bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new MaltaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Malta research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new MaltaPreflightError(
        "unpinned_worktree",
        "Malta research worktree files do not match git-tracked paths.",
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
    throw new MaltaPreflightError("missing_tier", `Approved Malta tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: MaltaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? readFileSync(tierItem.absPath, "utf8")) as MaltaInventory["tiers"];
  } catch (error) {
    throw new MaltaPreflightError(
      "tier_unreadable",
      `Malta tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status === "draft_for_human_review") {
    throw new MaltaPreflightError(
      "tier_draft_upgrade_rejected",
      "Refusing to upgrade Malta tiers out of draft_for_human_review.",
      intendedInventory,
    );
  }
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new MaltaPreflightError(
      "tier_not_approved",
      `Malta tiers status is ${JSON.stringify(tierJson.status)}; import requires the already-approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new MaltaPreflightError("tier_hash_mismatch", `Malta tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }
  if (tierJson.predecessor_draft_sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new MaltaPreflightError(
      "predecessor_draft_mismatch",
      "Malta predecessor draft SHA-256 does not match the accepted landing.",
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new MaltaPreflightError("lineage_mismatch", "Malta tier lineage_id is not country-package-malta.", intendedInventory);
  }
  const holdTokens = NAMED_HOLDS.map((hold) => hold.token);
  const justinHolds = tierJson.justin_approval?.holds_open ?? [];
  const approvalHolds = tierJson.approval?.holds_open ?? [];
  if (JSON.stringify(justinHolds) !== JSON.stringify(holdTokens) || JSON.stringify(approvalHolds) !== JSON.stringify(holdTokens)) {
    throw new MaltaPreflightError(
      "named_holds",
      "Malta approved tier holds_open does not match the accepted named holds.",
      intendedInventory,
    );
  }
  if ((tierJson.justin_approval?.holds_resolved ?? []).length !== 0) {
    throw new MaltaPreflightError("named_holds", "Malta holds_resolved must stay empty.", intendedInventory);
  }

  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new MaltaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== Object.keys(PINNED_INPUTS).length) {
      throw new MaltaPreflightError(
        "package_inventory",
        `Expected ${Object.keys(PINNED_INPUTS).length} pinned Malta inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }

  if (tracked.some((item) => omittedPath(item.input_path))) {
    throw new MaltaPreflightError(
      "omitted_bytes_present",
      "Omitted Malta results.json, stv-counts.json, and sources/ must stay out of the slim pack.",
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

  const required = [
    REGISTER_RELATIVE,
    EVENTS_RELATIVE,
    CROSSWALK_RELATIVE,
    COUNTS_RELATIVE,
    SOURCE_INVENTORY_RELATIVE,
    CALENDAR_RELATIVE,
    COUNT_TOTALS_RELATIVE,
    PARTY_AGGREGATES_RELATIVE,
    POST_ELECTION_RELATIVE,
    NOMINATIONS_RELATIVE,
    REPORTING_UNITS_RELATIVE,
    TERRITORIAL_GATES_RELATIVE,
    EXTRACTION_ISSUES_RELATIVE,
    FIELD_MAP_RELATIVE,
  ];
  for (const rel of required) {
    if (!byPath.has(rel)) {
      throw new MaltaPreflightError("package_inventory", `Malta pack is missing ${rel}.`, intendedInventory);
    }
  }
  if (byPath.has(OMITTED_RESULTS_RELATIVE) || byPath.has(OMITTED_STV_RELATIVE)) {
    throw new MaltaPreflightError(
      "omitted_results_present",
      "Malta results.json and stv-counts.json must stay omitted. Do not publish invented result rows.",
      intendedInventory,
    );
  }

  const offices = readJson<MaltaOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<MaltaEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const successorCrosswalk = readJson<unknown[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const nominations = readJson<MaltaNominationRow[]>(byPath.get(NOMINATIONS_RELATIVE)!.absPath, NOMINATIONS_RELATIVE);
  const countsFile = readJson<MaltaCountsFile>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const sourceInventory = readJson<MaltaSourceInventoryRow[]>(
    byPath.get(SOURCE_INVENTORY_RELATIVE)!.absPath,
    SOURCE_INVENTORY_RELATIVE,
  );
  const countTotals = readJson<unknown[]>(byPath.get(COUNT_TOTALS_RELATIVE)!.absPath, COUNT_TOTALS_RELATIVE);
  const partyAggregates = readJson<MaltaInventory["partyAggregates"]>(
    byPath.get(PARTY_AGGREGATES_RELATIVE)!.absPath,
    PARTY_AGGREGATES_RELATIVE,
  );
  const reportingUnits = readJson<unknown[]>(byPath.get(REPORTING_UNITS_RELATIVE)!.absPath, REPORTING_UNITS_RELATIVE);
  const postElectionObservations = readJson<unknown[]>(byPath.get(POST_ELECTION_RELATIVE)!.absPath, POST_ELECTION_RELATIVE);
  const calendar = readJson<MaltaInventory["calendar"]>(byPath.get(CALENDAR_RELATIVE)!.absPath, CALENDAR_RELATIVE);
  const territorialGates = readJson<unknown[]>(byPath.get(TERRITORIAL_GATES_RELATIVE)!.absPath, TERRITORIAL_GATES_RELATIVE);
  const extractionIssues = readJson<unknown[]>(byPath.get(EXTRACTION_ISSUES_RELATIVE)!.absPath, EXTRACTION_ISSUES_RELATIVE);
  const fieldMap = readJson<unknown[]>(byPath.get(FIELD_MAP_RELATIVE)!.absPath, FIELD_MAP_RELATIVE);

  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(successorCrosswalk) || !Array.isArray(nominations)) {
    throw new MaltaPreflightError(
      "research_shape",
      "Malta office, event, successor, and nomination tables must be arrays.",
      intendedInventory,
    );
  }
  if (countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new MaltaPreflightError(
      "omitted_results_count",
      `counts.json results ${countsFile.results} is not the documented omitted ${EXPECTED_COUNTS.documented_result_rows_omitted}.`,
      intendedInventory,
    );
  }
  if (countsFile.stv_count_observations !== EXPECTED_COUNTS.documented_stv_count_observations_omitted) {
    throw new MaltaPreflightError(
      "omitted_stv_count",
      `counts.json stv_count_observations ${countsFile.stv_count_observations} is not the documented omitted ${EXPECTED_COUNTS.documented_stv_count_observations_omitted}.`,
      intendedInventory,
    );
  }
  if (countsFile.numeric_first_preference_rows !== EXPECTED_COUNTS.documented_numeric_first_preference_rows_omitted) {
    throw new MaltaPreflightError(
      "omitted_results_count",
      "counts.json numeric_first_preference_rows does not match the accepted pack count.",
      intendedInventory,
    );
  }
  if (
    countTotals.length === countsFile.results ||
    countTotals.length === countsFile.stv_count_observations ||
    partyAggregates.length === countsFile.results
  ) {
    throw new MaltaPreflightError(
      "omitted_results_count",
      "Refusing to treat count-totals or party aggregates as the omitted result or STV totals.",
      intendedInventory,
    );
  }
  if (sourceInventory.length !== EXPECTED_COUNTS.source_inventory_rows) {
    throw new MaltaPreflightError(
      "source_inventory",
      `Expected ${EXPECTED_COUNTS.source_inventory_rows} omitted source catalogue rows.`,
      intendedInventory,
    );
  }
  const distinctPaths = new Set<string>();
  for (const row of sourceInventory) {
    const rel = row.path.replace(/\\/g, "/");
    distinctPaths.add(rel);
    if (!rel.startsWith("sources/")) {
      throw new MaltaPreflightError(
        "source_inventory",
        `Source inventory path ${rel} is not an omitted sources/ capture.`,
        intendedInventory,
      );
    }
    const abs = path.join(root, RESEARCH_PREFIX, rel);
    if (existsSync(abs)) {
      throw new MaltaPreflightError("omitted_sources_present", `Omitted source capture is present on disk: ${rel}.`, intendedInventory);
    }
  }
  if (distinctPaths.size !== EXPECTED_COUNTS.distinct_source_files_documented) {
    throw new MaltaPreflightError(
      "source_inventory",
      `Expected ${EXPECTED_COUNTS.distinct_source_files_documented} distinct omitted source paths.`,
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
    successorCrosswalk,
    nominations,
    countsFile,
    sourceInventory,
    countTotals,
    partyAggregates,
    reportingUnits,
    postElectionObservations,
    calendar,
    territorialGates,
    extractionIssues,
    fieldMap,
    tiers: tierJson,
    intendedInventory,
  };
}
