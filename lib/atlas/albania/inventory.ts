import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
  ASSEMBLY_ID,
  COUNTS_RELATIVE,
  COUNTRY_ID,
  CURRENT_NAMESPACE,
  DIMAL_COUNCIL_ID,
  DIMAL_MAYOR_ID,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  GAP_IDS,
  GAP_STATUS,
  IDENTITY_CROSSWALK_RELATIVE,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PHASE1_APPROVED_TIER_PATH,
  PHASE1_APPROVED_TIER_SHA256,
  PHASE1_DOCUMENTED_OFFICES,
  PHASE1_PACKAGE_PREFIX,
  PINNED_INPUTS,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  TRANSITIONS_RELATIVE,
  APPROVAL_STATE_RELATIVE,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  isDirectExecutiveType,
  publishGeographyId,
  releaseIdFor,
  sha256Hex,
  type AlbaniaDraftTier,
  type AlbaniaRegisterStatus,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type AlbaniaTierOffice = {
  office_id: string;
  tier: AlbaniaDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
};

export type AlbaniaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  name: string;
  geography: string;
  geography_id: string;
  geography_id_supplied: boolean;
  office_type: string;
  office_status: AlbaniaRegisterStatus;
  tier_scope: string;
  selection_mode: string;
  direct_executive: boolean;
  term_years: number | null;
  territory_vintage: string | null;
  parent_office_ids: string[];
  source_ids: string[];
  legacy_office_id: string | null;
  identity_status: string | null;
  seats_2011: number | null;
  seats_current: number | null;
  register_index: number;
};

export type AlbaniaGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  supplied: boolean;
  geography_index: number;
};

export type AlbaniaGap = {
  gap_id: string;
  topic: string;
  status: string;
  finding: string;
};

export type AlbaniaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: AlbaniaTierOffice[];
  offices: AlbaniaRegisterOffice[];
  geographies: AlbaniaGeography[];
  gaps: AlbaniaGap[];
  phase1OfficeIds: string[];
  successorEdges: number;
  metadata: {
    research_coverage_complete: boolean;
    applied_changes: number;
    justin_approved: boolean;
  };
  intendedInventory: Record<string, unknown>;
};

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function gitTracked(root: string, spec: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", spec], { encoding: "buffer" });
  return output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel))
    .sort();
}

export class AlbaniaPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const DRAFT_TIERS = new Set<string>(["national", "municipal", "other"]);
const SELECTION_MODES = new Set(["direct_popular_plurality", "direct_popular_list_pr", "direct_popular_election"]);

function readJsonl(absPath: string): unknown[] {
  const text = readFileSync(absPath, "utf8");
  const rows: unknown[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

function asNullableNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error(`Expected a number or null, received ${typeof value}`);
}

export function scanAlbaniaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): AlbaniaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new AlbaniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new AlbaniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new AlbaniaPreflightError(
        "omitted_bytes_present",
        `Omitted Albania pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new AlbaniaPreflightError(
      "omitted_bytes_present",
      "data/research/albania is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, DOCS_PREFIX);
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.some((rel) => rel.startsWith(PHASE1_PACKAGE_PREFIX))) {
      throw new AlbaniaPreflightError(
        "package_inventory",
        "The Phase 1 country package must not be a slim-land pinned input.",
        { tracked },
      );
    }
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new AlbaniaPreflightError(
        "package_inventory",
        "Albania git-tracked pack does not match the pinned slim inputs.",
        { missing, extra },
      );
    }
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> = [];
  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const abs = rel === TIER_PATH && options.tierPath ? tierAbs : path.join(root, rel);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: rel,
        input_kind: inputKindFor(rel),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
      };
      tracked.push(item);
      packageFilesMeta.push({ input_path: rel, sha256: item.sha256, byte_count: item.byte_count });
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
  const intendedInventory: Record<string, unknown> = {
    lineage_id: LINEAGE_ID,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
    git_commit: gitCommit,
    package_files: packageFilesMeta,
    tier: {
      input_path: TIER_PATH,
      sha256: tierItem?.sha256 ?? null,
      byte_count: tierItem?.byte_count ?? null,
    },
    overrides: [],
    omitted_research_dir: OMITTED_RESEARCH_DIR,
    publish_source: OFFICE_REGISTER_RELATIVE,
    phase1_package_not_publish_source: PHASE1_PACKAGE_PREFIX,
    phase1_approved_tiers_documentary: PHASE1_APPROVED_TIER_PATH,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new AlbaniaPreflightError("missing_tier", `Albania tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new AlbaniaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new AlbaniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Albania inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new AlbaniaPreflightError(
      "tier_hash_mismatch",
      `Albania tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const phase1Item = tracked.find((item) => item.input_path === PHASE1_APPROVED_TIER_PATH);
  if (!phase1Item || phase1Item.sha256 !== PHASE1_APPROVED_TIER_SHA256) {
    throw new AlbaniaPreflightError(
      "phase1_tiers",
      "Phase 1 approved Albania tier bytes must stay the documentary SHA-256.",
      intendedInventory,
    );
  }
  const phase1 = JSON.parse(readFileSync(phase1Item.absPath, "utf8")) as {
    status?: string;
    classifications?: Array<{ office_id?: string; tier?: string; justin_approved?: boolean }>;
  };
  const phase1OfficeIds = (phase1.classifications ?? []).map((row) => String(row.office_id ?? ""));
  if (
    phase1.status !== "approved" ||
    phase1OfficeIds.length !== PHASE1_DOCUMENTED_OFFICES ||
    phase1.classifications?.some((row) => row.tier !== "municipal")
  ) {
    throw new AlbaniaPreflightError(
      "phase1_tiers",
      "Phase1_approved_tiers.json must stay the 122 approved municipal rows.",
      intendedInventory,
    );
  }

  let tiers: AlbaniaTierOffice[];
  try {
    const parsed = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tiers = parsed as AlbaniaTierOffice[];
  } catch (error) {
    throw new AlbaniaPreflightError(
      "tier_unreadable",
      `Albania tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.length !== EXPECTED_COUNTS.offices) {
    throw new AlbaniaPreflightError(
      "office_count",
      `Albania tier rows ${tiers.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const transitionItem = tracked.find((item) => item.input_path === TRANSITIONS_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === IDENTITY_CROSSWALK_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const approvalItem = tracked.find((item) => item.input_path === APPROVAL_STATE_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !transitionItem || !crosswalkItem || !metadataItem || !approvalItem) {
    throw new AlbaniaPreflightError(
      "package_inventory",
      "Albania register, tiers, counts, gaps, transitions, crosswalk, metadata, or approval state is missing.",
      intendedInventory,
    );
  }

  const draftRows = readJsonl(draftItem.absPath) as AlbaniaTierOffice[];
  if (draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new AlbaniaPreflightError("office_count", "Albania draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));

  const registerRows = readJsonl(registerItem.absPath) as Array<Record<string, unknown>>;
  if (registerRows.length !== EXPECTED_COUNTS.offices) {
    throw new AlbaniaPreflightError(
      "office_count",
      `Albania office register has ${registerRows.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: AlbaniaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const geoSeen = new Map<string, string>();
  for (const [index, raw] of registerRows.entries()) {
    const officeId = String(raw.office_id ?? "");
    assertKnownRegisterKeys(officeId, raw);
    const geographyName = String(raw.geography ?? "");
    if (!geographyName.trim()) {
      throw new AlbaniaPreflightError("geography", `Office ${officeId} is missing a geography name.`, intendedInventory);
    }
    let geography: { geographyId: string; supplied: boolean };
    try {
      geography = publishGeographyId(geographyName, officeId, raw.geography_id, String(raw.office_type ?? ""));
    } catch (error) {
      throw new AlbaniaPreflightError(
        "geography",
        error instanceof Error ? error.message : String(error),
        intendedInventory,
      );
    }
    const prior = geoSeen.get(geography.geographyId);
    if (prior) {
      throw new AlbaniaPreflightError(
        "geography",
        `Geography ${geography.geographyId} is shared by ${prior} and ${officeId}. Mayor and council geographies must not collapse.`,
        intendedInventory,
      );
    }
    geoSeen.set(geography.geographyId, officeId);
    const office: AlbaniaRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: String(raw.country_id ?? ""),
      name: String(raw.name ?? ""),
      geography: geographyName,
      geography_id: geography.geographyId,
      geography_id_supplied: geography.supplied,
      office_type: String(raw.office_type ?? ""),
      office_status: String(raw.status ?? "") as AlbaniaRegisterStatus,
      tier_scope: String(raw.tier_scope ?? ""),
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: raw.direct_executive === true,
      term_years: asNullableNumber(raw.term_years),
      territory_vintage: typeof raw.territory_vintage === "string" ? raw.territory_vintage : null,
      parent_office_ids: Array.isArray(raw.parent_office_ids) ? raw.parent_office_ids.map((item) => String(item)) : [],
      source_ids: Array.isArray(raw.source_ids) ? raw.source_ids.map((item) => String(item)) : [],
      legacy_office_id: typeof raw.legacy_office_id === "string" ? raw.legacy_office_id : null,
      identity_status: typeof raw.identity_status === "string" ? raw.identity_status : null,
      seats_2011: asNullableNumber(raw.seats_2011),
      seats_current: asNullableNumber(raw.seats_current),
      register_index: index,
    };
    if (seen.has(office.office_id)) {
      throw new AlbaniaPreflightError("duplicate_office", `Duplicate Albania office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    const draft = draftById.get(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!draft || !tier) {
      throw new AlbaniaPreflightError(
        "office_count",
        `Office ${office.office_id} is missing from the draft tiers or schema tier file.`,
        intendedInventory,
      );
    }
    if (
      draft.tier !== tier.tier ||
      draft.review_status !== tier.review_status ||
      draft.justin_approved !== tier.justin_approved ||
      draft.rationale !== tier.rationale
    ) {
      throw new AlbaniaPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.jsonl does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    if (tier.justin_approved !== false || tier.review_status !== "draft_unapproved" || raw.justin_approved === true) {
      throw new AlbaniaPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_unapproved.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new AlbaniaPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft tier ${String(tier.tier)} is not a supplied tier.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status)) {
      throw new AlbaniaPreflightError(
        "office_status",
        `Office ${office.office_id} status is not a supplied register value.`,
        intendedInventory,
      );
    }
    if (office.country_id !== COUNTRY_ID || String(raw.country_code) !== "AL") {
      throw new AlbaniaPreflightError("office_register", `Office ${office.office_id} must stay country albania.`, intendedInventory);
    }
    if (raw.next_polling_date != null) {
      throw new AlbaniaPreflightError(
        "office_register",
        `Office ${office.office_id} next polling date must stay null. Supplied labels are not coerced.`,
        intendedInventory,
      );
    }
    if (!SELECTION_MODES.has(office.selection_mode) || office.source_ids.length === 0) {
      throw new AlbaniaPreflightError(
        "office_register",
        `Office ${office.office_id} selection mode or source ids drifted.`,
        intendedInventory,
      );
    }
    const expectsExecutive = isDirectExecutiveType(office.office_type);
    if (office.direct_executive !== expectsExecutive) {
      throw new AlbaniaPreflightError(
        "office_register",
        `Office ${office.office_id} direct_executive flag does not match its office type.`,
        intendedInventory,
      );
    }
    if (office.office_type === "mayor" || office.office_type === "borough_mayor") {
      if (office.selection_mode !== "direct_popular_plurality") {
        throw new AlbaniaPreflightError("office_register", `Mayor ${office.office_id} must stay plurality.`, intendedInventory);
      }
    } else if (office.office_type === "municipal_council" || office.office_type === "borough_council") {
      if (office.selection_mode !== "direct_popular_list_pr") {
        throw new AlbaniaPreflightError("office_register", `Council ${office.office_id} must stay list PR.`, intendedInventory);
      }
    } else if (office.office_id === ASSEMBLY_ID) {
      if (office.selection_mode !== "direct_popular_election" || office.office_status !== "current" || office.direct_executive) {
        throw new AlbaniaPreflightError("office_register", "The Assembly must stay the current national legislature.", intendedInventory);
      }
    }
    if (office.office_status === "current" && office.office_type !== "national_legislature" && !geography.supplied) {
      throw new AlbaniaPreflightError(
        "geography",
        `Current local office ${office.office_id} must keep its supplied geography id.`,
        intendedInventory,
      );
    }
    if ((office.office_status === "historical_only" || office.office_id === ASSEMBLY_ID) && geography.supplied) {
      throw new AlbaniaPreflightError(
        "geography",
        `Office ${office.office_id} must not gain a supplied geography id the register left null.`,
        intendedInventory,
      );
    }
    if (office.legacy_office_id && office.legacy_office_id !== office.office_id) {
      throw new AlbaniaPreflightError(
        "office_register",
        `Office ${office.office_id} legacy id must stay the same office. No successor is invented.`,
        intendedInventory,
      );
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (seen.size !== draftById.size || seen.size !== tierById.size) {
    throw new AlbaniaPreflightError("office_count", "Albania tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal ||
    draftHistogram.get("other") !== EXPECTED_COUNTS.draft_tier_other
  ) {
    throw new AlbaniaPreflightError("numeric_tier", "Albania draft tier histogram drifted.", intendedInventory);
  }

  const phase1Set = new Set(phase1OfficeIds);
  const currentLocal = offices.filter((row) => row.office_status === "current" && row.tier_scope === "local");
  if (
    currentLocal.length !== PHASE1_DOCUMENTED_OFFICES ||
    currentLocal.some((row) => !phase1Set.has(row.office_id)) ||
    phase1OfficeIds.some((id) => !currentLocal.some((row) => row.office_id === id))
  ) {
    throw new AlbaniaPreflightError(
      "phase1_tiers",
      "The 122 Phase 1 municipal ids must stay current local offices inside the 891-row register.",
      intendedInventory,
    );
  }

  const registerById = new Map(offices.map((row) => [row.office_id, row]));
  for (const office of offices) {
    if (office.parent_office_ids.length === 0) continue;
    if (office.office_type !== "borough_mayor" && office.office_type !== "borough_council") {
      throw new AlbaniaPreflightError(
        "crosswalk",
        `Office ${office.office_id} has parent ids but is not a 2011 Tirana borough.`,
        intendedInventory,
      );
    }
    for (const parentId of office.parent_office_ids) {
      const parent = registerById.get(parentId);
      if (!parent || parent.office_status !== "historical_only") {
        throw new AlbaniaPreflightError(
          "crosswalk",
          `Borough parent ${parentId} must stay a historical office. It is not a successor edge.`,
          intendedInventory,
        );
      }
    }
  }

  const transitions = JSON.parse(readFileSync(transitionItem.absPath, "utf8")) as {
    office_successor_edges?: unknown[];
    rename?: { office_ids?: string[]; creates_new_office?: boolean; old_name?: string; new_name?: string; type?: string };
  };
  if (!Array.isArray(transitions.office_successor_edges) || transitions.office_successor_edges.length !== 0) {
    throw new AlbaniaPreflightError("crosswalk", "Albania office_successor_edges must stay empty.", intendedInventory);
  }
  const renameIds = transitions.rename?.office_ids ?? [];
  if (
    transitions.rename?.creates_new_office !== false ||
    transitions.rename?.type !== "same_unit_rename" ||
    transitions.rename?.new_name !== "Dimal" ||
    renameIds.join(",") !== `${DIMAL_MAYOR_ID},${DIMAL_COUNCIL_ID}`
  ) {
    throw new AlbaniaPreflightError(
      "crosswalk",
      "The Dimal rename must stay AL-05-M/C and must not create a new office.",
      intendedInventory,
    );
  }
  for (const officeId of renameIds) {
    const office = registerById.get(officeId);
    if (!office || office.office_status !== "current" || !office.name.includes("Dimal")) {
      throw new AlbaniaPreflightError("crosswalk", `${officeId} must stay the current Dimal office.`, intendedInventory);
    }
  }

  const crosswalk = JSON.parse(readFileSync(crosswalkItem.absPath, "utf8")) as Array<{
    entity_kind?: string;
    upstream_id?: string;
    research_id?: string;
  }>;
  if (
    !Array.isArray(crosswalk) ||
    crosswalk.length !== PHASE1_DOCUMENTED_OFFICES ||
    crosswalk.some((row) => row.entity_kind !== "office" || row.upstream_id !== row.research_id || !phase1Set.has(String(row.upstream_id)))
  ) {
    throw new AlbaniaPreflightError(
      "crosswalk",
      "The identity crosswalk must stay 122 same-id retentions. It is not imported as successor edges.",
      intendedInventory,
    );
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    offices_total: number;
    offices_current: number;
    offices_historical_only: number;
    current_national: number;
    current_mayors: number;
    current_councils: number;
    current_direct_executives: number;
    historical_direct_executives: number;
    historical_tirana_borough_offices: number;
    events: number;
    results: number;
    sources: number;
    draft_tiers: number;
    draft_tier_histogram: Record<string, number>;
    ep_offices: number;
    popular_presidential_offices: number;
    popular_regional_offices: number;
    applied_changes: number;
  };
  if (
    countsFile.offices_total !== EXPECTED_COUNTS.offices ||
    countsFile.offices_current !== EXPECTED_COUNTS.current_offices ||
    countsFile.offices_historical_only !== EXPECTED_COUNTS.historical_offices ||
    countsFile.current_national !== EXPECTED_COUNTS.current_national ||
    countsFile.current_mayors !== EXPECTED_COUNTS.current_mayors ||
    countsFile.current_councils !== EXPECTED_COUNTS.current_councils ||
    countsFile.current_direct_executives !== EXPECTED_COUNTS.current_direct_executives ||
    countsFile.historical_direct_executives !== EXPECTED_COUNTS.historical_direct_executives ||
    countsFile.historical_tirana_borough_offices !== EXPECTED_COUNTS.historical_borough_offices ||
    countsFile.draft_tiers !== EXPECTED_COUNTS.offices ||
    countsFile.draft_tier_histogram?.national !== EXPECTED_COUNTS.draft_tier_national ||
    countsFile.draft_tier_histogram?.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    countsFile.draft_tier_histogram?.other !== EXPECTED_COUNTS.draft_tier_other ||
    countsFile.ep_offices !== 0 ||
    countsFile.popular_presidential_offices !== 0 ||
    countsFile.popular_regional_offices !== 0 ||
    countsFile.applied_changes !== 0
  ) {
    throw new AlbaniaPreflightError("office_count", "Albania counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (
    countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsFile.sources !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new AlbaniaPreflightError(
      "counts_file",
      "Albania counts.json full-pack event/result/source figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as AlbaniaGap[];
  if (!Array.isArray(gaps) || gaps.length !== GAP_IDS.length || gaps.map((gap) => gap.gap_id).join(",") !== GAP_IDS.join(",")) {
    throw new AlbaniaPreflightError("named_holds", "Albania research gaps must stay AL-BA-G01 through AL-BA-G21.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.finding?.trim() || !gap.topic?.trim()) {
      throw new AlbaniaPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
  }

  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as {
    applied_changes: number;
    research_coverage_complete: boolean;
    justin_approved: boolean;
    id_namespace: string;
    lineage_reference: string;
    ep_offices: number;
    popular_regional_offices: number;
  };
  if (
    metadataFile.applied_changes !== 0 ||
    metadataFile.research_coverage_complete !== false ||
    metadataFile.justin_approved !== false ||
    metadataFile.id_namespace !== CURRENT_NAMESPACE ||
    metadataFile.lineage_reference !== LINEAGE_ID ||
    metadataFile.ep_offices !== 0 ||
    metadataFile.popular_regional_offices !== 0
  ) {
    throw new AlbaniaPreflightError(
      "coverage",
      "Albania metadata.json must stay applied_changes 0, research_coverage_complete false, and justin_approved false.",
      intendedInventory,
    );
  }
  const approval = JSON.parse(readFileSync(approvalItem.absPath, "utf8")) as {
    applied_changes: number;
    justin_approvals?: Record<string, boolean>;
  };
  const approvalValues = Object.values(approval.justin_approvals ?? {});
  if (approval.applied_changes !== 0 || approvalValues.length === 0 || approvalValues.some((value) => value !== false)) {
    throw new AlbaniaPreflightError("coverage", "Albania approval-state.json must keep every approval false.", intendedInventory);
  }

  const geographies: AlbaniaGeography[] = offices.map((office, index) => ({
    geography_id: office.geography_id,
    name: office.geography,
    country_id: COUNTRY_ID,
    supplied: office.geography_id_supplied,
    geography_index: index,
  }));
  if (
    geographies.length !== EXPECTED_COUNTS.geographies ||
    geographies.filter((row) => row.supplied).length !== EXPECTED_COUNTS.supplied_geography_ids
  ) {
    throw new AlbaniaPreflightError("geography", "Albania geography histogram drifted.", intendedInventory);
  }

  const metadata = {
    research_coverage_complete: false,
    applied_changes: 0,
    justin_approved: false,
  };

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

  return {
    root,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath: new Map(tracked.map((item) => [item.input_path, item])),
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    tiers,
    offices,
    geographies,
    gaps,
    phase1OfficeIds,
    successorEdges: 0,
    metadata,
    intendedInventory,
  };
}
