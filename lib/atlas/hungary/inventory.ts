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
  CYCLE_GAPS_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  PARTY_MAPPINGS_RELATIVE,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  SOURCES_RELATIVE,
  SUCCESSOR_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  isOmittedBulkPath,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
  text: string | null;
};

export type HungaryOrigin = {
  source_id?: string;
  input_path?: string;
  sha256?: string;
  archive_member?: string;
  sheet?: string;
  row?: number;
  line?: number;
  section?: string;
  columns?: number[];
  [key: string]: unknown;
};

export type HungaryAuthoredDate = {
  label: string;
  precision: string;
  certainty: string;
  year?: number | null;
  month?: number | null;
  day?: number | null;
};

export type HungaryOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  office_name: string;
  office_type: string;
  office_status: string;
  proposed_tier?: string;
  geography_id: string;
  electoral_mode?: string;
  next_date?: HungaryAuthoredDate | null;
  next_cycle?: string | null;
  origins?: HungaryOrigin[];
  successor_office_id?: string;
  [key: string]: unknown;
};

export type HungaryEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  country_id: string;
  event_kind: string;
  selected_history_role: string;
  date: HungaryAuthoredDate;
  date_resolution: string;
  legal_outcome: string;
  ballot_basis: string;
  electoral_system?: string;
  share_unit?: string;
  origins?: HungaryOrigin[];
  [key: string]: unknown;
};

export type HungaryGeographyRow = {
  geography_id: string;
  name: string;
  country_id: string;
  geography_type?: string;
  parent_geography_id?: string | null;
  origins?: HungaryOrigin[];
  [key: string]: unknown;
};

export type HungarySourceRow = {
  source_id: string;
  source_namespace?: string;
  country_id?: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  bytes?: number | null;
  checked_as_of_label?: string | null;
  evidence_grade?: string | null;
  data_rights?: string | null;
  status?: string;
  acquisition_status?: string;
  use?: string;
  [key: string]: unknown;
};

export type HungaryCountryRow = {
  country_id: string;
  country_code: string;
  name: string;
  polity_kind: string;
  region_id: string;
  coverage_status: string;
  screening_as_of_label?: string;
  notes?: string;
  [key: string]: unknown;
};

export type HungaryCountsRow = {
  offices?: number;
  current_offices: number;
  historical_offices: number;
  total_offices: number;
  events: number;
  results: number;
  proceedings: number;
  geographies: number;
  coverage_complete: boolean;
  direct_executive_offices: number;
  council_assembly_offices: number;
  [key: string]: unknown;
};

export type HungaryGapRow = {
  gate: string;
  status: string;
  scope?: string;
  reason: string;
};

export type HungaryCycleGap = {
  office_id: string;
  office_name?: string;
  reason: string;
};

export type HungaryUnresolvedRow = {
  office_id?: string;
  history_key?: string;
  original_token: string;
  source_locator?: string;
  reason: string;
};

export type HungaryTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type HungaryInventory = {
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
  offices: HungaryOfficeRow[];
  events: HungaryEventRow[];
  geographies: HungaryGeographyRow[];
  sourceCatalogue: HungarySourceRow[];
  proceedings: unknown[];
  partyMappings: unknown[];
  successors: unknown[];
  country: HungaryCountryRow;
  counts: HungaryCountsRow;
  gaps: HungaryGapRow[];
  cycleGaps: { ONK2014: HungaryCycleGap[]; ONK2024: HungaryCycleGap[] };
  unresolvedRows: HungaryUnresolvedRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    approval?: { Justin_accepted?: boolean; production_accepted?: boolean };
    justin_approval?: { accepted?: boolean };
    classifications: HungaryTierClassification[];
    source_register?: { sha256?: string; path?: string };
    predecessor_draft_sha256?: string;
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
      throw new Error(`Unexpected symlink in Hungary research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Hungary research pack: ${rel}`);
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

export class HungaryPreflightError extends Error {
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
    omitted_results: "data/research/hungary/results.json",
    omitted_identity_crosswalk: "data/research/hungary/identity-crosswalk.json",
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

export function scanHungaryInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): HungaryInventory {
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
    throw new HungaryPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new HungaryPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    const omitted = [...tracked, ...walked].filter((rel) => isOmittedBulkPath(rel));
    if (omitted.length > 0) {
      throw new HungaryPreflightError(
        "omitted_results_present",
        `Slim Hungary land must not include omitted result, crosswalk, sources/, or unpacked/ bytes: ${omitted.join(", ")}`,
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new HungaryPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Hungary research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new HungaryPreflightError(
        "unpinned_worktree",
        "Hungary research worktree files do not match git-tracked paths.",
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
    throw new HungaryPreflightError("missing_tier", `Hungary tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: HungaryInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as HungaryInventory["tiers"];
  } catch (error) {
    throw new HungaryPreflightError(
      "tier_unreadable",
      `Hungary tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  const justinAccepted = tierJson.approval?.Justin_accepted === true || tierJson.justin_approval?.accepted === true;
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true || !justinAccepted) {
    throw new HungaryPreflightError(
      "tier_not_approved",
      `Hungary tiers status is ${JSON.stringify(tierJson.status)}; import requires the landed approved production-accepted bytes and does not rewrite a draft.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new HungaryPreflightError(
      "tier_hash_mismatch",
      `Hungary tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new HungaryPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new HungaryPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (tracked.some((item) => isOmittedBulkPath(item.input_path))) {
    throw new HungaryPreflightError(
      "omitted_results_present",
      "results.json, identity-crosswalk.json, sources/, and unpacked/ must stay omitted from the slim pack.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new HungaryPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Hungary inputs, found ${tracked.length}.`,
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
    PROCEEDINGS_RELATIVE,
    PARTY_MAPPINGS_RELATIVE,
    COUNTRY_RELATIVE,
    COUNTS_RELATIVE,
    GAPS_RELATIVE,
    CYCLE_GAPS_RELATIVE,
    UNRESOLVED_RELATIVE,
    SUCCESSOR_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new HungaryPreflightError("missing_research_table", `Missing required Hungary research table ${rel}.`, intendedInventory);
    }
  }

  const offices = readJson<HungaryOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<HungaryEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const geographies = readJson<HungaryGeographyRow[]>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE);
  const sourceCatalogue = readJson<HungarySourceRow[]>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE);
  const proceedings = readJson<unknown[]>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE);
  const partyMappings = readJson<unknown[]>(byPath.get(PARTY_MAPPINGS_RELATIVE)!.absPath, PARTY_MAPPINGS_RELATIVE);
  const successors = readJson<unknown[]>(byPath.get(SUCCESSOR_RELATIVE)!.absPath, SUCCESSOR_RELATIVE);
  const country = readJson<HungaryCountryRow>(byPath.get(COUNTRY_RELATIVE)!.absPath, COUNTRY_RELATIVE);
  const counts = readJson<HungaryCountsRow>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const gaps = readJson<HungaryGapRow[]>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE);
  const cycleGaps = readJson<HungaryInventory["cycleGaps"]>(byPath.get(CYCLE_GAPS_RELATIVE)!.absPath, CYCLE_GAPS_RELATIVE);
  const unresolvedRows = readJson<HungaryUnresolvedRow[]>(byPath.get(UNRESOLVED_RELATIVE)!.absPath, UNRESOLVED_RELATIVE);
  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(geographies) || !Array.isArray(sourceCatalogue)) {
    throw new HungaryPreflightError("research_shape", "Hungary office, event, geography, and source tables must be arrays.", intendedInventory);
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
    geographies,
    sourceCatalogue,
    proceedings,
    partyMappings,
    successors,
    country,
    counts,
    gaps,
    cycleGaps,
    unresolvedRows,
    tiers: tierJson,
    intendedInventory,
  };
}
