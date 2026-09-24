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
  ACCEPTANCE_EXAMPLES_RELATIVE,
  ADAPTER_VERSION,
  CALENDAR_RELATIVE,
  COUNTS_RELATIVE,
  CROSSWALK_RELATIVE,
  DISCREPANCIES_RELATIVE,
  DRAFT_TIERS_RELATIVE,
  EXCLUSIONS_RELATIVE,
  EXPECTED_COUNTS,
  EXTRACTION_ISSUES_RELATIVE,
  FIELD_MAP_RELATIVE,
  HISTORY_COVERAGE_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  MOVEMENTS_RELATIVE,
  NAMED_HOLDS,
  OFFICE_HISTORY_RELATIVE,
  OMITTED_EVENTS_RELATIVE,
  OMITTED_REPORTING_UNITS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PINNED_INPUTS,
  PREDECESSOR_DRAFT_TIER_SHA256,
  REGISTER_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  SOURCE_INVENTORY_RELATIVE,
  SOURCES_NOTE_RELATIVE,
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

export type FranceOfficeRow = {
  office_id: string;
  label: string;
  office_type: string;
  territory_code: string;
  level: string;
  status: string;
  selection_mode: string;
  direct_executive: boolean;
  seats: number | null;
  source_id: string;
  territorial_vintage?: string;
  justin_approved: boolean;
  department?: string | null;
  region?: string | null;
  overseas: boolean;
  executive_mode?: string | null;
  competence_note?: string | null;
  [key: string]: unknown;
};

export type FranceCalendarRow = {
  office_id: string;
  date: string | null;
  date_precision: string | null;
  date_status: string;
  alert_window_class: string;
  alert_created: boolean;
  source_id: string | null;
};

export type FranceCountsFile = {
  current_offices: number;
  historical_offices: number;
  office_rows: number;
  events: number;
  reporting_units: number;
  results: number;
  current_by_type: Record<string, number>;
  historical_by_type: Record<string, number>;
  direct_executive_current: number;
  draft_tier_histogram: Record<string, number>;
  current_overseas_offices: number;
  municipal_councils: number;
  cog_COM_units: number;
  additional_COM_municipalities: number;
  appointed_commune_exclusions: number;
  issues: number;
  result_kinds: {
    list_ballot: number;
    candidate_mark_multi_vote: number;
    candidate_or_list_vote_regime_unresolved: number;
    candidate_vote: number;
    binomial_ballot: number;
    electoral_college_candidate_mark: number;
    electoral_college_list_ballot: number;
    party_share_and_seats: number;
    returned_representative: number;
  };
};

export type FranceSourceInventoryRow = {
  source_id: string;
  input_path: string;
  sha256: string;
  [key: string]: unknown;
};

export type FranceTierClassification = {
  office_id: string;
  draft_tier: string;
  tier: string;
  schema_v1_tier: string;
  review_status: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
};

export type FranceGapRow = {
  gap_id: string;
  topic: string;
  status: string;
  detail: string;
  justin_approved?: boolean;
  [key: string]: unknown;
};

export type FranceDraftTierRow = {
  office_id: string;
  tier: string;
  status: string;
  justin_approved: boolean;
};

export type FranceExtractionIssue = {
  kind: string;
  [key: string]: unknown;
};

export type FranceHistoryCoverageRow = {
  office_type: string;
  year: number;
  events: number;
};

export type FranceOfficeHistoryRow = {
  office_id: string;
  status: string;
  normalized_event_count: number;
  history_complete: boolean;
  absence_means: string;
};

export type FranceInventory = {
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
  offices: FranceOfficeRow[];
  successorCrosswalk: unknown[];
  countsFile: FranceCountsFile;
  sourceInventory: FranceSourceInventoryRow[];
  calendar: FranceCalendarRow[];
  researchGaps: FranceGapRow[];
  extractionIssues: FranceExtractionIssue[];
  acceptanceExamples: unknown[];
  draftTiers: FranceDraftTierRow[];
  fieldMap: unknown[];
  historyCoverage: FranceHistoryCoverageRow[];
  officeHistory: FranceOfficeHistoryRow[];
  territorialMovements: unknown[];
  territoryExclusions: Array<{ code: string; name?: string; reason?: string }>;
  discrepancies: unknown[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    predecessor_draft_sha256?: string;
    classifications: FranceTierClassification[];
    counts_by_draft_tier?: Record<string, number>;
    counts_by_proposed_tier?: Record<string, number>;
    justin_approval?: { holds_open?: string[]; holds_resolved?: string[] };
    approval?: { holds_open?: string[]; holds_resolved?: string[] };
  };
  intendedInventory: Record<string, unknown>;
};

function posixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

const OMITTED_FILES = new Set([OMITTED_RESULTS_RELATIVE, OMITTED_EVENTS_RELATIVE, OMITTED_REPORTING_UNITS_RELATIVE]);

function omittedPath(rel: string): boolean {
  return OMITTED_FILES.has(rel) || rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`);
}

function walkRegularFiles(dir: string, relBase: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = posixJoin(relBase, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || lstatSync(abs).isSymbolicLink()) {
      throw new Error(`Unexpected symlink in France research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
        throw new Error(`Omitted France sources directory is present: ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (OMITTED_FILES.has(rel)) {
        throw new Error(`Omitted France pack file is present: ${rel}`);
      }
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in France research pack: ${rel}`);
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
    .filter((rel) => Boolean(rel))
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export class FrancePreflightError extends Error {
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
    omitted_events: OMITTED_EVENTS_RELATIVE,
    omitted_reporting_units: OMITTED_REPORTING_UNITS_RELATIVE,
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

function readJsonl<T>(absPath: string, relativePath: string): T[] {
  const text = readFileSync(absPath, "utf8");
  const rows: T[] = [];
  let lineNo = 0;
  for (const line of text.split("\n")) {
    lineNo += 1;
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line) as T);
    } catch (error) {
      throw new Error(
        `${relativePath} line ${lineNo} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return rows;
}

export function scanFranceInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): FranceInventory {
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
    throw new FrancePreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new FrancePreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.some((rel) => omittedPath(rel))) {
      throw new FrancePreflightError(
        "omitted_bytes_present",
        "France results.jsonl, events.jsonl, reporting-units.jsonl, or sources/ is present. The slim importer does not adopt omitted bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new FrancePreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked France research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new FrancePreflightError(
        "unpinned_worktree",
        "France research worktree files do not match git-tracked paths.",
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
      const asText = bytes.toString("utf8");
      const keepText = logical.endsWith(".json") || logical.endsWith(".md");
      const item: TrackedInput = {
        input_path: logical,
        input_kind: inputKindFor(logical),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
        text: keepText ? asText : null,
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
    throw new FrancePreflightError("missing_tier", `Approved France tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: FranceInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? readFileSync(tierItem.absPath, "utf8")) as FranceInventory["tiers"];
  } catch (error) {
    throw new FrancePreflightError(
      "tier_unreadable",
      `France tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status === "draft_for_human_review") {
    throw new FrancePreflightError(
      "tier_draft_upgrade_rejected",
      "Refusing to upgrade France tiers out of draft_for_human_review.",
      intendedInventory,
    );
  }
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new FrancePreflightError(
      "tier_not_approved",
      `France tiers status is ${JSON.stringify(tierJson.status)}; import requires the already-approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new FrancePreflightError("tier_hash_mismatch", `France tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }
  if (tierJson.predecessor_draft_sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new FrancePreflightError(
      "predecessor_draft_mismatch",
      "France predecessor draft SHA-256 does not match the accepted landing.",
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new FrancePreflightError("lineage_mismatch", "France tier lineage_id is not country-package-france.", intendedInventory);
  }
  const holdTokens = NAMED_HOLDS.map((hold) => hold.token);
  const justinHolds = tierJson.justin_approval?.holds_open ?? [];
  const approvalHolds = tierJson.approval?.holds_open ?? [];
  if (JSON.stringify(justinHolds) !== JSON.stringify(holdTokens) || JSON.stringify(approvalHolds) !== JSON.stringify(holdTokens)) {
    throw new FrancePreflightError(
      "named_holds",
      "France approved tier holds_open does not match G01 through G21.",
      intendedInventory,
    );
  }
  if ((tierJson.justin_approval?.holds_resolved ?? []).length !== 0 || (tierJson.approval?.holds_resolved ?? []).length !== 0) {
    throw new FrancePreflightError("named_holds", "France holds_resolved must stay empty.", intendedInventory);
  }

  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new FrancePreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== Object.keys(PINNED_INPUTS).length) {
      throw new FrancePreflightError(
        "package_inventory",
        `Expected ${Object.keys(PINNED_INPUTS).length} pinned France inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }

  if (tracked.some((item) => omittedPath(item.input_path))) {
    throw new FrancePreflightError(
      "omitted_bytes_present",
      "Omitted France results, events, reporting units, and sources/ must stay out of the slim pack.",
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
    DRAFT_TIERS_RELATIVE,
    CALENDAR_RELATIVE,
    CROSSWALK_RELATIVE,
    COUNTS_RELATIVE,
    SOURCE_INVENTORY_RELATIVE,
    FIELD_MAP_RELATIVE,
    RESEARCH_GAPS_RELATIVE,
    EXTRACTION_ISSUES_RELATIVE,
    ACCEPTANCE_EXAMPLES_RELATIVE,
    HISTORY_COVERAGE_RELATIVE,
    OFFICE_HISTORY_RELATIVE,
    MOVEMENTS_RELATIVE,
    EXCLUSIONS_RELATIVE,
    DISCREPANCIES_RELATIVE,
    SOURCES_NOTE_RELATIVE,
  ];
  for (const rel of required) {
    if (!byPath.has(rel)) {
      throw new FrancePreflightError("package_inventory", `France pack is missing ${rel}.`, intendedInventory);
    }
  }
  for (const rel of [OMITTED_RESULTS_RELATIVE, OMITTED_EVENTS_RELATIVE, OMITTED_REPORTING_UNITS_RELATIVE]) {
    if (byPath.has(rel)) {
      throw new FrancePreflightError(
        "omitted_results_present",
        `${rel} must stay omitted. Do not publish invented rows.`,
        intendedInventory,
      );
    }
  }

  const offices = readJsonl<FranceOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const draftTiers = readJsonl<FranceDraftTierRow>(byPath.get(DRAFT_TIERS_RELATIVE)!.absPath, DRAFT_TIERS_RELATIVE);
  const calendar = readJsonl<FranceCalendarRow>(byPath.get(CALENDAR_RELATIVE)!.absPath, CALENDAR_RELATIVE);
  const officeHistory = readJsonl<FranceOfficeHistoryRow>(byPath.get(OFFICE_HISTORY_RELATIVE)!.absPath, OFFICE_HISTORY_RELATIVE);
  const territorialMovements = readJsonl<unknown>(byPath.get(MOVEMENTS_RELATIVE)!.absPath, MOVEMENTS_RELATIVE);
  const successorCrosswalk = readJson<unknown[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const countsFile = readJson<FranceCountsFile>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const sourceInventory = readJson<FranceSourceInventoryRow[]>(
    byPath.get(SOURCE_INVENTORY_RELATIVE)!.absPath,
    SOURCE_INVENTORY_RELATIVE,
  );
  const researchGaps = readJson<FranceGapRow[]>(byPath.get(RESEARCH_GAPS_RELATIVE)!.absPath, RESEARCH_GAPS_RELATIVE);
  const extractionIssues = readJson<FranceExtractionIssue[]>(
    byPath.get(EXTRACTION_ISSUES_RELATIVE)!.absPath,
    EXTRACTION_ISSUES_RELATIVE,
  );
  const acceptanceExamples = readJson<unknown[]>(byPath.get(ACCEPTANCE_EXAMPLES_RELATIVE)!.absPath, ACCEPTANCE_EXAMPLES_RELATIVE);
  const fieldMap = readJson<unknown[]>(byPath.get(FIELD_MAP_RELATIVE)!.absPath, FIELD_MAP_RELATIVE);
  const historyCoverage = readJson<FranceHistoryCoverageRow[]>(
    byPath.get(HISTORY_COVERAGE_RELATIVE)!.absPath,
    HISTORY_COVERAGE_RELATIVE,
  );
  const territoryExclusions = readJson<FranceInventory["territoryExclusions"]>(
    byPath.get(EXCLUSIONS_RELATIVE)!.absPath,
    EXCLUSIONS_RELATIVE,
  );
  const discrepancies = readJson<unknown[]>(byPath.get(DISCREPANCIES_RELATIVE)!.absPath, DISCREPANCIES_RELATIVE);

  if (!Array.isArray(offices) || !Array.isArray(successorCrosswalk)) {
    throw new FrancePreflightError("research_shape", "France office and successor tables must be arrays.", intendedInventory);
  }
  if (countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new FrancePreflightError(
      "omitted_results_count",
      `counts.json results ${countsFile.results} is not the documented omitted ${EXPECTED_COUNTS.documented_result_rows_omitted}.`,
      intendedInventory,
    );
  }
  if (countsFile.events !== EXPECTED_COUNTS.documented_event_rows_omitted) {
    throw new FrancePreflightError(
      "omitted_events_count",
      `counts.json events ${countsFile.events} is not the documented omitted ${EXPECTED_COUNTS.documented_event_rows_omitted}.`,
      intendedInventory,
    );
  }
  if (countsFile.reporting_units !== EXPECTED_COUNTS.documented_reporting_units_omitted) {
    throw new FrancePreflightError(
      "omitted_reporting_units_count",
      `counts.json reporting_units ${countsFile.reporting_units} is not the documented omitted ${EXPECTED_COUNTS.documented_reporting_units_omitted}.`,
      intendedInventory,
    );
  }
  const kinds = countsFile.result_kinds;
  if (
    !kinds ||
    kinds.list_ballot !== EXPECTED_COUNTS.documented_list_ballot_rows_omitted ||
    kinds.candidate_mark_multi_vote !== EXPECTED_COUNTS.documented_candidate_mark_multi_vote_rows_omitted ||
    kinds.candidate_or_list_vote_regime_unresolved !==
      EXPECTED_COUNTS.documented_candidate_or_list_vote_regime_unresolved_rows_omitted ||
    kinds.candidate_vote !== EXPECTED_COUNTS.documented_candidate_vote_rows_omitted ||
    kinds.binomial_ballot !== EXPECTED_COUNTS.documented_binomial_ballot_rows_omitted ||
    kinds.electoral_college_candidate_mark !== EXPECTED_COUNTS.documented_electoral_college_candidate_mark_rows_omitted ||
    kinds.electoral_college_list_ballot !== EXPECTED_COUNTS.documented_electoral_college_list_ballot_rows_omitted ||
    kinds.party_share_and_seats !== EXPECTED_COUNTS.documented_party_share_and_seats_rows_omitted ||
    kinds.returned_representative !== EXPECTED_COUNTS.documented_returned_representative_rows_omitted
  ) {
    throw new FrancePreflightError(
      "omitted_results_count",
      "counts.json result_kinds do not match the accepted omitted result totals.",
      intendedInventory,
    );
  }
  const kindSum =
    kinds.list_ballot +
    kinds.candidate_mark_multi_vote +
    kinds.candidate_or_list_vote_regime_unresolved +
    kinds.candidate_vote +
    kinds.binomial_ballot +
    kinds.electoral_college_candidate_mark +
    kinds.electoral_college_list_ballot +
    kinds.party_share_and_seats +
    kinds.returned_representative;
  if (kindSum !== countsFile.results) {
    throw new FrancePreflightError(
      "omitted_results_count",
      "counts.json result_kinds do not sum to the documented omitted result total.",
      intendedInventory,
    );
  }
  if (sourceInventory.length !== EXPECTED_COUNTS.source_inventory_rows) {
    throw new FrancePreflightError(
      "source_inventory",
      `Expected ${EXPECTED_COUNTS.source_inventory_rows} omitted source catalogue rows.`,
      intendedInventory,
    );
  }
  const distinctPaths = new Set<string>();
  for (const row of sourceInventory) {
    const rel = String(row.input_path).replace(/\\/g, "/");
    distinctPaths.add(rel);
    if (!rel.startsWith("sources/")) {
      throw new FrancePreflightError(
        "source_inventory",
        `Source inventory path ${rel} is not an omitted sources/ capture.`,
        intendedInventory,
      );
    }
    const abs = path.join(root, RESEARCH_PREFIX, rel);
    if (existsSync(abs)) {
      throw new FrancePreflightError("omitted_sources_present", `Omitted source capture is present on disk: ${rel}.`, intendedInventory);
    }
  }
  if (distinctPaths.size !== EXPECTED_COUNTS.distinct_source_files_documented) {
    throw new FrancePreflightError(
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
    successorCrosswalk,
    countsFile,
    sourceInventory,
    calendar,
    researchGaps,
    extractionIssues,
    acceptanceExamples,
    draftTiers,
    fieldMap,
    historyCoverage,
    officeHistory,
    territorialMovements,
    territoryExclusions,
    discrepancies,
    tiers: tierJson,
    intendedInventory,
  };
}
