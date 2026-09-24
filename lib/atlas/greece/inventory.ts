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
  BALLOT_OBSERVATIONS_RELATIVE,
  CROSSWALK_RELATIVE,
  EP_OUTGOING_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  LOCAL_SOURCE_HOLD_AUTHORITIES,
  METHOD_VERSION,
  NAMED_HOLDS,
  OMITTED_SOURCES_DIR,
  PINNED_INPUTS,
  PREDECESSOR_DRAFT_TIER_SHA256,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_HOLDS_RELATIVE,
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

export type GreeceOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  office_status: string;
  record_state: string;
  registry_qualified: boolean;
  proposed_tier: string;
  election_mechanism: string;
  direct_executive: boolean;
  source_code?: string | null;
  source_ids: string[];
  next_date_resolution?: string | null;
  next_date?: string | null;
  next_history_key?: string | null;
  notes?: string | null;
  successor_office_id?: string;
  [key: string]: unknown;
};

export type GreeceEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  date: string;
  date_precision: string;
  event_kind: string;
  ballot_basis: string;
  share_unit: string;
  legal_outcome: string;
  source_ids: string[];
  raw?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type GreeceProceedingRow = {
  proceeding_id: string;
  event_id: string;
  office_id: string;
  history_key: string;
  sequence_no: number;
  kind: string;
  date: string;
  source_ids: string[];
  supersedes_id?: string | null;
  legal_outcome?: string | null;
  raw?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type GreeceResultRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  result_row_id: string;
  proceeding_id: string | null;
  country_id: string;
  candidate_or_list_label: string | null;
  original_party_label: string | null;
  original_party_code: string | null;
  party_mapping_id: string | null;
  votes: number | null;
  votes_status: string;
  share: number | null;
  share_status: string;
  share_unit: string;
  seats: number | null;
  seats_status: string;
  elected_flag: number | null;
  is_substitute: number | null;
  evidence_status: string;
  observation_id: string;
  raw?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type GreeceObservationRow = {
  observation_id: string;
  source_ids?: string[];
  [key: string]: unknown;
};

export type GreeceGeographyRow = {
  geography_id: string;
  name: string;
  parent_geography_id?: string | null;
  office_status?: string | null;
  effective_from_label?: string | null;
  effective_to_label?: string | null;
  source_code?: string | null;
  source_ids?: string[];
  [key: string]: unknown;
};

export type GreeceGapRow = {
  gap_id: string;
  topic: string;
  status: string;
  finding: string;
  needed?: string;
  prohibited_inference?: string;
  scope?: string;
  retained?: string;
  [key: string]: unknown;
};

export type GreeceSourceHoldRow = {
  kind: string;
  authority: string;
  partial_station_snapshot: boolean;
  incomplete_seat_allocation: boolean;
  winner_missing: boolean;
  source_path?: string;
  expected_council_size?: number | null;
  published_seats_total?: number | null;
  [key: string]: unknown;
};

export type GreeceCrosswalkRow = {
  entity_kind: string;
  upstream_namespace: string;
  upstream_id: string;
  office_id: string;
  reason: string;
  [key: string]: unknown;
};

export type GreeceTierClassification = {
  id_namespace?: string;
  office_id: string;
  tier: string;
  review_status: string;
  rationale: string;
  human_review_required?: boolean;
  [key: string]: unknown;
};

export type GreeceInventory = {
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
  offices: GreeceOfficeRow[];
  events: GreeceEventRow[];
  proceedings: GreeceProceedingRow[];
  results: GreeceResultRow[];
  observations: GreeceObservationRow[];
  geographies: GreeceGeographyRow[];
  gaps: GreeceGapRow[];
  sourceHolds: GreeceSourceHoldRow[];
  crosswalks: GreeceCrosswalkRow[];
  epOutgoing: unknown;
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    predecessor_draft_sha256?: string;
    classifications: GreeceTierClassification[];
    counts_by_proposed_tier?: Record<string, number>;
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
      throw new Error(`Unexpected symlink in Greece research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
        throw new Error(`Omitted Greece sources directory is present: ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Greece research pack: ${rel}`);
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

export class GreecePreflightError extends Error {
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
    omitted_sources_dir: OMITTED_SOURCES_DIR,
  };
}

function readBytes(absPath: string, relativePath: string): string {
  const bytes = readFileSync(absPath);
  if (relativePath.endsWith(".gz")) return gunzipSync(bytes).toString("utf8");
  return bytes.toString("utf8");
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readBytes(absPath, relativePath)) as T;
  } catch (error) {
    throw new Error(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function readJsonLines<T>(absPath: string, relativePath: string): T[] {
  const text = readBytes(absPath, relativePath);
  const lines = text.split("\n");
  const out: T[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch (error) {
      throw new Error(
        `${relativePath} line ${i + 1} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return out;
}

export function scanGreeceInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): GreeceInventory {
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
    throw new GreecePreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new GreecePreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.some((rel) => rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`))) {
      throw new GreecePreflightError(
        "omitted_sources_present",
        "Greece sources/ is present. The slim importer does not adopt omitted source bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new GreecePreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Greece research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new GreecePreflightError(
        "unpinned_worktree",
        "Greece research worktree files do not match git-tracked paths.",
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
    throw new GreecePreflightError("missing_tier", `Approved Greece tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: GreeceInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? readFileSync(tierItem.absPath, "utf8")) as GreeceInventory["tiers"];
  } catch (error) {
    throw new GreecePreflightError(
      "tier_unreadable",
      `Greece tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status === "draft_for_human_review") {
    throw new GreecePreflightError(
      "tier_draft_upgrade_rejected",
      "Refusing to upgrade Greece tiers out of draft_for_human_review.",
      intendedInventory,
    );
  }
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new GreecePreflightError(
      "tier_not_approved",
      `Greece tiers status is ${JSON.stringify(tierJson.status)}; import requires the already-approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new GreecePreflightError(
      "tier_hash_mismatch",
      `Greece tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.predecessor_draft_sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new GreecePreflightError(
      "predecessor_draft_mismatch",
      "Greece predecessor draft SHA-256 does not match the accepted landing.",
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new GreecePreflightError("lineage_mismatch", "Greece tier lineage_id is not country-package-greece.", intendedInventory);
  }

  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new GreecePreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== Object.keys(PINNED_INPUTS).length) {
      throw new GreecePreflightError(
        "package_inventory",
        `Expected ${Object.keys(PINNED_INPUTS).length} pinned Greece inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }

  if (tracked.some((item) => item.input_path === OMITTED_SOURCES_DIR || item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`))) {
    throw new GreecePreflightError(
      "omitted_sources_present",
      "Omitted Greece sources/ must stay out of the slim pack.",
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
    PROCEEDINGS_RELATIVE,
    RESULTS_RELATIVE,
    BALLOT_OBSERVATIONS_RELATIVE,
    GEOGRAPHY_RELATIVE,
    GAPS_RELATIVE,
    SOURCE_HOLDS_RELATIVE,
    CROSSWALK_RELATIVE,
    EP_OUTGOING_RELATIVE,
  ];
  for (const rel of required) {
    if (!byPath.has(rel)) {
      throw new GreecePreflightError("package_inventory", `Greece pack is missing ${rel}.`, intendedInventory);
    }
  }

  const offices = readJson<GreeceOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<GreeceEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const proceedings = readJson<GreeceProceedingRow[]>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE);
  const results = readJsonLines<GreeceResultRow>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE);
  const observations = readJsonLines<GreeceObservationRow>(
    byPath.get(BALLOT_OBSERVATIONS_RELATIVE)!.absPath,
    BALLOT_OBSERVATIONS_RELATIVE,
  );
  const geographies = readJson<GreeceGeographyRow[]>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE);
  const gaps = readJson<GreeceGapRow[]>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE);
  const sourceHolds = readJson<GreeceSourceHoldRow[]>(byPath.get(SOURCE_HOLDS_RELATIVE)!.absPath, SOURCE_HOLDS_RELATIVE);
  const crosswalks = readJson<GreeceCrosswalkRow[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const epOutgoing = readJson<unknown>(byPath.get(EP_OUTGOING_RELATIVE)!.absPath, EP_OUTGOING_RELATIVE);

  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(proceedings) || !Array.isArray(geographies)) {
    throw new GreecePreflightError(
      "research_shape",
      "Greece office, event, proceeding, and geography tables must be arrays.",
      intendedInventory,
    );
  }
  if (!Array.isArray(gaps) || gaps.length !== NAMED_HOLDS.length) {
    throw new GreecePreflightError(
      "named_holds",
      `Expected ${NAMED_HOLDS.length} Greece research gaps, found ${Array.isArray(gaps) ? gaps.length : "non-array"}.`,
      intendedInventory,
    );
  }
  for (let i = 0; i < NAMED_HOLDS.length; i++) {
    const gap = gaps[i];
    const hold = NAMED_HOLDS[i]!;
    if (!gap || gap.gap_id !== hold.token || gap.topic !== hold.topic || gap.status !== hold.status) {
      throw new GreecePreflightError(
        "named_holds",
        `Greece gap ${gap?.gap_id ?? i} does not match the open hold ${hold.token} (${hold.status}).`,
        intendedInventory,
      );
    }
  }
  if (!Array.isArray(sourceHolds) || sourceHolds.length !== LOCAL_SOURCE_HOLD_AUTHORITIES.length) {
    throw new GreecePreflightError(
      "local_source_holds",
      `Expected ${LOCAL_SOURCE_HOLD_AUTHORITIES.length} Greece local source holds.`,
      intendedInventory,
    );
  }
  const authorities = sourceHolds.map((row) => row.authority);
  if (JSON.stringify([...authorities].sort()) !== JSON.stringify([...LOCAL_SOURCE_HOLD_AUTHORITIES].sort())) {
    throw new GreecePreflightError(
      "local_source_holds",
      "Greece local source-hold authorities do not match the accepted pack.",
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
    proceedings,
    results,
    observations,
    geographies,
    gaps,
    sourceHolds,
    crosswalks,
    epOutgoing,
    tiers: tierJson,
    intendedInventory,
  };
}
