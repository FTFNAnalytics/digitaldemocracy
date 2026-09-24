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
  COMMUNITIES_RELATIVE,
  COUNTS_RELATIVE,
  COVERAGE_RELATIVE,
  CROSSWALK_RELATIVE,
  DRAFT_TIERS_RELATIVE,
  EVENTS_RELATIVE,
  EXCLUDED_RELATIVE,
  EXPECTED_COUNTS,
  EXTRACTION_ISSUES_RELATIVE,
  FIELD_MAP_RELATIVE,
  IDENTITY_ALIASES_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  MUNICIPALITIES_RELATIVE,
  NAMED_HOLDS,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PINNED_INPUTS,
  PREDECESSOR_DRAFT_TIER_SHA256,
  QUARTERS_RELATIVE,
  QUARTER_ALIASES_RELATIVE,
  RECONCILIATION_RELATIVE,
  REGISTER_RELATIVE,
  REPORTING_UNITS_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
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

export type CyprusOfficeRow = {
  office_id: string;
  name: string;
  office_type: string;
  status: string;
  level: string;
  geography_id: string;
  selection_mode: string;
  direct_executive: boolean;
  justin_approved?: boolean;
  parent_office_id?: string;
  ec_area_id?: number | null;
  seats?: number;
  reserved_vacant_seats?: number;
  constitutional_seats?: number;
  parliamentary_voting_right?: boolean;
  end_date?: string | null;
  [key: string]: unknown;
};

export type CyprusEventRow = {
  event_id: string;
  office_id: string;
  date: string;
  date_precision: string;
  event_type: string;
  electoral_system: string | null;
  ballot_basis: string;
  result_status: string;
  certification: string;
  round?: number | null;
  justin_approved?: boolean;
  [key: string]: unknown;
};

export type CyprusCountsFile = {
  current_offices: number;
  historical_offices: number;
  office_rows: number;
  events: number;
  reporting_units: number;
  results: number;
  named_communities: number;
  ministry_overview_communities: number;
  approved: number;
  applied_changes: number;
  current_register_complete: boolean;
  result_kinds: {
    list_ballot: number;
    candidate_vote: number;
    candidate_preference: number;
    returned_representative: number;
    party_seats: number;
  };
  [key: string]: unknown;
};

export type CyprusSourceInventoryRow = {
  source_id: string;
  input_path: string;
  sha256: string;
  [key: string]: unknown;
};

export type CyprusTierClassification = {
  office_id: string;
  tier: string;
  review_status: string;
  rationale: string;
  human_review_required?: boolean;
  [key: string]: unknown;
};

export type CyprusGapRow = {
  gap_id: string;
  title: string;
  status: string;
  detail: string;
  [key: string]: unknown;
};

export type CyprusCalendarRow = {
  office_id: string;
  nominal_next_cycle_year: number;
  date: string | null;
  date_precision: string;
  certainty: string;
  alert_created: boolean;
  alert_window_status: string;
  [key: string]: unknown;
};

export type CyprusInventory = {
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
  offices: CyprusOfficeRow[];
  events: CyprusEventRow[];
  successorCrosswalk: unknown[];
  countsFile: CyprusCountsFile;
  sourceInventory: CyprusSourceInventoryRow[];
  reportingUnits: unknown[];
  reconciliation: unknown[];
  communities: unknown[];
  municipalities: unknown[];
  municipalQuarters: unknown[];
  calendar: CyprusCalendarRow[];
  coverage: Array<{ office_id: string; [key: string]: unknown }>;
  territorialGates: CyprusGapRow[];
  researchGaps: CyprusGapRow[];
  extractionIssues: Array<{ kind: string; name?: string; [key: string]: unknown }>;
  excludedObservations: unknown[];
  identityAliases: unknown[];
  quarterAliases: unknown[];
  acceptanceExamples: unknown[];
  draftTiers: Array<{ office_id: string; status: string; justin_approved: boolean; tier: string }>;
  fieldMap: unknown[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    predecessor_draft_sha256?: string;
    classifications: CyprusTierClassification[];
    counts_by_proposed_tier?: Record<string, number>;
    justin_approval?: { holds_open?: string[]; holds_resolved?: string[] };
    approval?: { holds_open?: string[]; holds_resolved?: string[] };
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
      throw new Error(`Unexpected symlink in Cyprus research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
        throw new Error(`Omitted Cyprus sources directory is present: ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      if (rel === OMITTED_RESULTS_RELATIVE) {
        throw new Error(`Omitted Cyprus results file is present: ${rel}`);
      }
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Cyprus research pack: ${rel}`);
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

export class CyprusPreflightError extends Error {
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
  return rel === OMITTED_RESULTS_RELATIVE || rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`);
}

export function scanCyprusInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): CyprusInventory {
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
    throw new CyprusPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new CyprusPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.some((rel) => omittedPath(rel))) {
      throw new CyprusPreflightError(
        "omitted_bytes_present",
        "Cyprus results.json or sources/ is present. The slim importer does not adopt omitted bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new CyprusPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Cyprus research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new CyprusPreflightError(
        "unpinned_worktree",
        "Cyprus research worktree files do not match git-tracked paths.",
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
    throw new CyprusPreflightError("missing_tier", `Approved Cyprus tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: CyprusInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? readFileSync(tierItem.absPath, "utf8")) as CyprusInventory["tiers"];
  } catch (error) {
    throw new CyprusPreflightError(
      "tier_unreadable",
      `Cyprus tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status === "draft_for_human_review") {
    throw new CyprusPreflightError(
      "tier_draft_upgrade_rejected",
      "Refusing to upgrade Cyprus tiers out of draft_for_human_review.",
      intendedInventory,
    );
  }
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new CyprusPreflightError(
      "tier_not_approved",
      `Cyprus tiers status is ${JSON.stringify(tierJson.status)}; import requires the already-approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new CyprusPreflightError("tier_hash_mismatch", `Cyprus tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }
  if (tierJson.predecessor_draft_sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new CyprusPreflightError(
      "predecessor_draft_mismatch",
      "Cyprus predecessor draft SHA-256 does not match the accepted landing.",
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new CyprusPreflightError("lineage_mismatch", "Cyprus tier lineage_id is not country-package-cyprus.", intendedInventory);
  }
  const holdTokens = NAMED_HOLDS.map((hold) => hold.token);
  const justinHolds = tierJson.justin_approval?.holds_open ?? [];
  const approvalHolds = tierJson.approval?.holds_open ?? [];
  if (JSON.stringify(justinHolds) !== JSON.stringify(holdTokens) || JSON.stringify(approvalHolds) !== JSON.stringify(holdTokens)) {
    throw new CyprusPreflightError(
      "named_holds",
      "Cyprus approved tier holds_open does not match CY-G01 through CY-G15.",
      intendedInventory,
    );
  }
  if ((tierJson.justin_approval?.holds_resolved ?? []).length !== 0 || (tierJson.approval?.holds_resolved ?? []).length !== 0) {
    throw new CyprusPreflightError("named_holds", "Cyprus holds_resolved must stay empty.", intendedInventory);
  }

  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new CyprusPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== Object.keys(PINNED_INPUTS).length) {
      throw new CyprusPreflightError(
        "package_inventory",
        `Expected ${Object.keys(PINNED_INPUTS).length} pinned Cyprus inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }

  if (tracked.some((item) => omittedPath(item.input_path))) {
    throw new CyprusPreflightError(
      "omitted_bytes_present",
      "Omitted Cyprus results.json and sources/ must stay out of the slim pack.",
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
    COMMUNITIES_RELATIVE,
    MUNICIPALITIES_RELATIVE,
    QUARTERS_RELATIVE,
    REPORTING_UNITS_RELATIVE,
    RECONCILIATION_RELATIVE,
    COVERAGE_RELATIVE,
    TERRITORIAL_GATES_RELATIVE,
    RESEARCH_GAPS_RELATIVE,
    EXTRACTION_ISSUES_RELATIVE,
    EXCLUDED_RELATIVE,
    IDENTITY_ALIASES_RELATIVE,
    QUARTER_ALIASES_RELATIVE,
    ACCEPTANCE_EXAMPLES_RELATIVE,
    FIELD_MAP_RELATIVE,
    DRAFT_TIERS_RELATIVE,
  ];
  for (const rel of required) {
    if (!byPath.has(rel)) {
      throw new CyprusPreflightError("package_inventory", `Cyprus pack is missing ${rel}.`, intendedInventory);
    }
  }
  if (byPath.has(OMITTED_RESULTS_RELATIVE)) {
    throw new CyprusPreflightError(
      "omitted_results_present",
      "Cyprus results.json must stay omitted. Do not publish invented result rows.",
      intendedInventory,
    );
  }

  const offices = readJson<CyprusOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<CyprusEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const successorCrosswalk = readJson<unknown[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const countsFile = readJson<CyprusCountsFile>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const sourceInventory = readJson<CyprusSourceInventoryRow[]>(
    byPath.get(SOURCE_INVENTORY_RELATIVE)!.absPath,
    SOURCE_INVENTORY_RELATIVE,
  );
  const reportingUnits = readJson<unknown[]>(byPath.get(REPORTING_UNITS_RELATIVE)!.absPath, REPORTING_UNITS_RELATIVE);
  const reconciliation = readJson<unknown[]>(byPath.get(RECONCILIATION_RELATIVE)!.absPath, RECONCILIATION_RELATIVE);
  const communities = readJson<unknown[]>(byPath.get(COMMUNITIES_RELATIVE)!.absPath, COMMUNITIES_RELATIVE);
  const municipalities = readJson<unknown[]>(byPath.get(MUNICIPALITIES_RELATIVE)!.absPath, MUNICIPALITIES_RELATIVE);
  const municipalQuarters = readJson<unknown[]>(byPath.get(QUARTERS_RELATIVE)!.absPath, QUARTERS_RELATIVE);
  const calendar = readJson<CyprusCalendarRow[]>(byPath.get(CALENDAR_RELATIVE)!.absPath, CALENDAR_RELATIVE);
  const coverage = readJson<CyprusInventory["coverage"]>(byPath.get(COVERAGE_RELATIVE)!.absPath, COVERAGE_RELATIVE);
  const territorialGates = readJson<CyprusGapRow[]>(byPath.get(TERRITORIAL_GATES_RELATIVE)!.absPath, TERRITORIAL_GATES_RELATIVE);
  const researchGaps = readJson<CyprusGapRow[]>(byPath.get(RESEARCH_GAPS_RELATIVE)!.absPath, RESEARCH_GAPS_RELATIVE);
  const extractionIssues = readJson<CyprusInventory["extractionIssues"]>(
    byPath.get(EXTRACTION_ISSUES_RELATIVE)!.absPath,
    EXTRACTION_ISSUES_RELATIVE,
  );
  const excludedObservations = readJson<unknown[]>(byPath.get(EXCLUDED_RELATIVE)!.absPath, EXCLUDED_RELATIVE);
  const identityAliases = readJson<unknown[]>(byPath.get(IDENTITY_ALIASES_RELATIVE)!.absPath, IDENTITY_ALIASES_RELATIVE);
  const quarterAliases = readJson<unknown[]>(byPath.get(QUARTER_ALIASES_RELATIVE)!.absPath, QUARTER_ALIASES_RELATIVE);
  const acceptanceExamples = readJson<unknown[]>(byPath.get(ACCEPTANCE_EXAMPLES_RELATIVE)!.absPath, ACCEPTANCE_EXAMPLES_RELATIVE);
  const draftTiers = readJson<CyprusInventory["draftTiers"]>(byPath.get(DRAFT_TIERS_RELATIVE)!.absPath, DRAFT_TIERS_RELATIVE);
  const fieldMap = readJson<unknown[]>(byPath.get(FIELD_MAP_RELATIVE)!.absPath, FIELD_MAP_RELATIVE);

  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(successorCrosswalk)) {
    throw new CyprusPreflightError("research_shape", "Cyprus office, event, and successor tables must be arrays.", intendedInventory);
  }
  if (countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new CyprusPreflightError(
      "omitted_results_count",
      `counts.json results ${countsFile.results} is not the documented omitted ${EXPECTED_COUNTS.documented_result_rows_omitted}.`,
      intendedInventory,
    );
  }
  const kinds = countsFile.result_kinds;
  if (
    !kinds ||
    kinds.list_ballot !== EXPECTED_COUNTS.documented_list_ballot_rows_omitted ||
    kinds.candidate_vote !== EXPECTED_COUNTS.documented_candidate_vote_rows_omitted ||
    kinds.candidate_preference !== EXPECTED_COUNTS.documented_candidate_preference_rows_omitted ||
    kinds.returned_representative !== EXPECTED_COUNTS.documented_returned_representative_rows_omitted ||
    kinds.party_seats !== EXPECTED_COUNTS.documented_party_seat_rows_omitted
  ) {
    throw new CyprusPreflightError(
      "omitted_results_count",
      "counts.json result_kinds do not match the accepted omitted result totals.",
      intendedInventory,
    );
  }
  const kindSum =
    kinds.list_ballot + kinds.candidate_vote + kinds.candidate_preference + kinds.returned_representative + kinds.party_seats;
  if (kindSum !== countsFile.results) {
    throw new CyprusPreflightError(
      "omitted_results_count",
      "counts.json result_kinds do not sum to the documented omitted result total.",
      intendedInventory,
    );
  }
  if (reportingUnits.length === countsFile.results || reconciliation.length === countsFile.results) {
    throw new CyprusPreflightError(
      "omitted_results_count",
      "Refusing to treat reporting units or reconciliation rows as the omitted result total.",
      intendedInventory,
    );
  }
  if (countsFile.named_communities !== EXPECTED_COUNTS.named_communities) {
    throw new CyprusPreflightError("community_count", "counts.json named_communities is not 285.", intendedInventory);
  }
  if (countsFile.ministry_overview_communities !== EXPECTED_COUNTS.ministry_overview_communities) {
    throw new CyprusPreflightError(
      "community_count",
      "counts.json ministry_overview_communities is not the unresolved 286.",
      intendedInventory,
    );
  }
  if (countsFile.approved !== 0 || countsFile.applied_changes !== 0 || countsFile.current_register_complete !== false) {
    throw new CyprusPreflightError(
      "acceptance_flags",
      "counts.json must stay approved 0, applied_changes 0, and current_register_complete false.",
      intendedInventory,
    );
  }
  if (sourceInventory.length !== EXPECTED_COUNTS.source_inventory_rows) {
    throw new CyprusPreflightError(
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
      throw new CyprusPreflightError(
        "source_inventory",
        `Source inventory path ${rel} is not an omitted sources/ capture.`,
        intendedInventory,
      );
    }
    const abs = path.join(root, RESEARCH_PREFIX, rel);
    if (existsSync(abs)) {
      throw new CyprusPreflightError("omitted_sources_present", `Omitted source capture is present on disk: ${rel}.`, intendedInventory);
    }
  }
  if (distinctPaths.size !== EXPECTED_COUNTS.distinct_source_files_documented) {
    throw new CyprusPreflightError(
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
    countsFile,
    sourceInventory,
    reportingUnits,
    reconciliation,
    communities,
    municipalities,
    municipalQuarters,
    calendar,
    coverage,
    territorialGates,
    researchGaps,
    extractionIssues,
    excludedObservations,
    identityAliases,
    quarterAliases,
    acceptanceExamples,
    draftTiers,
    fieldMap,
    tiers: tierJson,
    intendedInventory,
  };
}
