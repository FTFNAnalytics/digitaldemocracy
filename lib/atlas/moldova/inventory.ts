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
  ACCEPTANCE_RELATIVE,
  ADAPTER_VERSION,
  COUNTS_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  CROSSWALK_RELATIVE,
  CURRENT_NAMESPACE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_INVENTORY_ENTRIES,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  GEOGRAPHIES_RELATIVE,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PINNED_INPUTS,
  REFERENCE_CROSSWALK_ROWS,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TIER_FILE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  VALIDATION_RELATIVE,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  canonical,
  expectedDraftTier,
  fingerprintSha256,
  inputKindFor,
  isDirectExecutive,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type MoldovaDraftTier,
  type MoldovaRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type MoldovaTierOffice = {
  office_id: string;
  id_namespace: string;
  tier: MoldovaDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
  classification_kind: string;
  tier_index: number;
};

export type MoldovaDraftOffice = {
  office_id: string;
  draft_tier: MoldovaDraftTier;
  status: string;
  justin_approved: boolean;
  basis: string;
  applied: boolean;
};

export type MoldovaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_type: string;
  scope_level: string;
  geography_id: string;
  office_status: MoldovaRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  successor_office_id: null;
  predecessor_office_id: null;
  next_election_date: string | null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type MoldovaGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: string | null;
  office_status_context: string;
  geography_index: number;
  office_ids: string[];
};

export type MoldovaGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
};

export type MoldovaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: MoldovaTierOffice[];
  drafts: MoldovaDraftOffice[];
  offices: MoldovaRegisterOffice[];
  geographies: MoldovaGeography[];
  gaps: MoldovaGap[];
  successorEdges: number;
  referenceCrosswalkRows: number;
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

export class MoldovaPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_KEYS = new Set([
  "office_id",
  "id_namespace",
  "country_id",
  "country_code",
  "name",
  "office_type",
  "scope_level",
  "geography_id",
  "office_status",
  "selection_mode",
  "register_as_of",
  "term_seats",
  "record_state",
  "registry_qualified",
  "source_refs",
  "successor_office_id",
  "predecessor_office_id",
  "next_election_date",
  "selection_era_gate",
  "geography_name",
  "identity_gate",
  "cec_name",
  "district",
  "cuatm_code",
  "local_unit_status",
  "parent_geography_id",
  "nested_under_municipality",
  "within_gagauzia",
  "legacy_reference_id",
  "territory_version",
  "territorial_change_effective",
  "mandate_end_date",
]);

const DRAFT_TIERS = new Set<string>(["national", "autonomous", "raion", "municipal"]);
const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const CROSSWALK_RELATIONSHIPS = new Set(["source_context_cross_reference_only", "same_named_institution_reference"]);

function readJson(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, "utf8")) as unknown;
}

export function scanMoldovaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): MoldovaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new MoldovaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new MoldovaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new MoldovaPreflightError(
        "omitted_bytes_present",
        `Omitted Moldova pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new MoldovaPreflightError(
      "omitted_bytes_present",
      "data/research/moldova is git-tracked. The importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, DOCS_PREFIX);
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new MoldovaPreflightError("package_inventory", "Moldova git-tracked pack does not match the pinned inputs.", {
        missing,
        extra,
      });
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
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: "docs/phase1/moldova/data/events.jsonl",
    results_file_not_projected: "docs/phase1/moldova/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/moldova/sources",
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new MoldovaPreflightError("missing_tier", `Moldova tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new MoldovaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new MoldovaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Moldova inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new MoldovaPreflightError("tier_hash_mismatch", `Moldova tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const geoItem = tracked.find((item) => item.input_path === GEOGRAPHIES_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === CROSSWALK_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !geoItem ||
    !countsItem ||
    !gapsItem ||
    !crosswalkItem ||
    !metadataItem ||
    !validationItem ||
    !acceptanceItem
  ) {
    throw new MoldovaPreflightError(
      "package_inventory",
      "Moldova register, tiers, geographies, counts, gaps, crosswalk, metadata, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: MoldovaTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tierRows = parsed.map((row, tier_index) => {
      const item = row as Record<string, unknown>;
      return {
        office_id: String(item.office_id ?? ""),
        id_namespace: String(item.id_namespace ?? ""),
        tier: String(item.tier ?? "") as MoldovaDraftTier,
        review_status: String(item.review_status ?? ""),
        justin_approved: item.justin_approved === true,
        rationale: String(item.rationale ?? ""),
        classification_kind: String(item.classification_kind ?? ""),
        tier_index,
      };
    });
  } catch (error) {
    throw new MoldovaPreflightError(
      "tier_unreadable",
      `Moldova tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new MoldovaPreflightError("office_count", `Moldova tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJson(draftItem.absPath);
  if (!Array.isArray(draftParsed) || draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new MoldovaPreflightError("office_count", "Moldova draft-tiers.json row count drifted.", intendedInventory);
  }
  const drafts: MoldovaDraftOffice[] = draftParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      office_id: String(item.office_id ?? ""),
      draft_tier: String(item.draft_tier ?? "") as MoldovaDraftTier,
      status: String(item.status ?? ""),
      justin_approved: item.justin_approved === true,
      basis: String(item.basis ?? ""),
      applied: item.applied === true,
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, MoldovaTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new MoldovaPreflightError("duplicate_office", `Duplicate Moldova tier ${tier.office_id}.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const registerParsed = readJson(registerItem.absPath);
  if (!Array.isArray(registerParsed) || registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new MoldovaPreflightError(
      "office_count",
      `Moldova office register has ${Array.isArray(registerParsed) ? registerParsed.length : "non-array"} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: MoldovaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  let scheduledNext = 0;
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new MoldovaPreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new MoldovaPreflightError("office_register", `Refusing undocumented Moldova office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (raw.successor_office_id != null || raw.predecessor_office_id != null) {
      throw new MoldovaPreflightError("successor_edge", `Office ${officeId} supplies a successor or predecessor. None are imported.`, intendedInventory);
    }
    const office: MoldovaRegisterOffice = {
      office_id: officeId,
      id_namespace: String(raw.id_namespace ?? ""),
      country_id: String(raw.country_id ?? ""),
      country_code: String(raw.country_code ?? ""),
      name: String(raw.name ?? ""),
      office_type: String(raw.office_type ?? ""),
      scope_level: String(raw.scope_level ?? ""),
      geography_id: String(raw.geography_id ?? ""),
      office_status: String(raw.office_status ?? "") as MoldovaRegisterStatus,
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: isDirectExecutive(String(raw.office_type ?? "")),
      successor_office_id: null,
      predecessor_office_id: null,
      next_election_date: typeof raw.next_election_date === "string" ? raw.next_election_date : null,
      register_index: index,
      raw,
    };
    if (!office.office_id || seen.has(office.office_id)) {
      throw new MoldovaPreflightError("duplicate_office", `Duplicate or blank Moldova office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (office.id_namespace !== CURRENT_NAMESPACE || office.country_id !== COUNTRY_ID || office.country_code !== COUNTRY_CODE) {
      throw new MoldovaPreflightError("office_register", `Office ${office.office_id} namespace or country drifted.`, intendedInventory);
    }
    if (!REGISTER_STATUSES.has(office.office_status) || office.selection_mode !== "direct_popular") {
      throw new MoldovaPreflightError("office_status", `Office ${office.office_id} status or selection mode drifted.`, intendedInventory);
    }
    if (raw.record_state !== "research_draft" || raw.registry_qualified !== true || !Array.isArray(raw.source_refs) || raw.source_refs.length === 0) {
      throw new MoldovaPreflightError("office_register", `Office ${office.office_id} record state, qualification, or sources drifted.`, intendedInventory);
    }
    if (raw.mandate_end_date != null) {
      throw new MoldovaPreflightError("office_register", `Office ${office.office_id} must not gain a mandate end date.`, intendedInventory);
    }
    const historicalId = office.office_id.endsWith("-PRE2025");
    if (office.office_status === "historical_only" && !historicalId) {
      throw new MoldovaPreflightError("office_status", `Historical office ${office.office_id} is not a PRE2025 identity.`, intendedInventory);
    }
    if (office.office_status === "current" && historicalId) {
      throw new MoldovaPreflightError("office_status", `Current office ${office.office_id} must not use a PRE2025 identity.`, intendedInventory);
    }
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new MoldovaPreflightError("numeric_tier", `Office ${office.office_id} is missing a draft or schema tier row.`, intendedInventory);
    }
    const expectedTier = expectedDraftTier(office.scope_level);
    if (
      tier.tier !== expectedTier ||
      draft.draft_tier !== expectedTier ||
      tier.tier !== draft.draft_tier ||
      tier.rationale !== draft.basis ||
      !tier.rationale.trim()
    ) {
      throw new MoldovaPreflightError("numeric_tier", `Office ${office.office_id} draft tier does not match the schema tier file.`, intendedInventory);
    }
    if (
      tier.justin_approved !== false ||
      draft.justin_approved !== false ||
      draft.applied !== false ||
      draft.status !== "draft_unapproved" ||
      tier.review_status !== "draft_for_human_review" ||
      tier.classification_kind !== "draft_for_human_review" ||
      tier.id_namespace !== TIER_FILE_NAMESPACE
    ) {
      throw new MoldovaPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new MoldovaPreflightError("numeric_tier", `Office ${office.office_id} draft tier ${tier.tier} is not a supplied tier.`, intendedInventory);
    }
    if (office.next_election_date) scheduledNext += 1;
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("autonomous") !== EXPECTED_COUNTS.draft_tier_autonomous ||
    draftHistogram.get("raion") !== EXPECTED_COUNTS.draft_tier_raion ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal ||
    scheduledNext !== EXPECTED_COUNTS.scheduled_next_labels_uncoerced
  ) {
    throw new MoldovaPreflightError("numeric_tier", "Moldova draft tier histogram or scheduled-next count drifted.", intendedInventory);
  }

  const geoParsed = readJson(geoItem.absPath);
  if (!Array.isArray(geoParsed)) {
    throw new MoldovaPreflightError("geography", "Moldova geographies.json is not an array.", intendedInventory);
  }
  const officeIdsByGeo = new Map<string, string[]>();
  for (const office of offices) {
    const list = officeIdsByGeo.get(office.geography_id) ?? [];
    list.push(office.office_id);
    officeIdsByGeo.set(office.geography_id, list);
  }
  const geographies: MoldovaGeography[] = [];
  const geoIds = new Set<string>();
  for (const [index, rawUnknown] of geoParsed.entries()) {
    const raw = rawUnknown as Record<string, unknown>;
    const geographyId = String(raw.geography_id ?? "");
    if (!geographyId || geoIds.has(geographyId)) {
      throw new MoldovaPreflightError("geography", `Duplicate or blank Moldova geography ${geographyId}.`, intendedInventory);
    }
    geoIds.add(geographyId);
    if (raw.country_id !== COUNTRY_ID || raw.effective_from != null || raw.effective_to != null) {
      throw new MoldovaPreflightError("geography", `Geography ${geographyId} country or effective interval drifted.`, intendedInventory);
    }
    geographies.push({
      geography_id: geographyId,
      name: String(raw.name ?? ""),
      country_id: COUNTRY_ID,
      parent_geography_id: typeof raw.parent_geography_id === "string" ? raw.parent_geography_id : null,
      office_status_context: String(raw.office_status_context ?? ""),
      geography_index: index,
      office_ids: officeIdsByGeo.get(geographyId) ?? [],
    });
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new MoldovaPreflightError("geography", `Moldova geography count ${geographies.length} drifted.`, intendedInventory);
  }
  const nullParents = geographies.filter((row) => row.parent_geography_id == null);
  if (nullParents.length !== EXPECTED_COUNTS.geographies_without_parent || !geoIds.has(COUNTRY_GEOGRAPHY_ID)) {
    throw new MoldovaPreflightError("geography", "Moldova null-parent geography count drifted.", intendedInventory);
  }
  for (const geography of geographies) {
    if (geography.parent_geography_id && !geoIds.has(geography.parent_geography_id)) {
      throw new MoldovaPreflightError("geography", `Geography ${geography.geography_id} parent is missing.`, intendedInventory);
    }
    if (geography.office_ids.length === 0) {
      throw new MoldovaPreflightError("geography", `Geography ${geography.geography_id} has no office.`, intendedInventory);
    }
  }
  for (const office of offices) {
    if (!geoIds.has(office.geography_id)) {
      throw new MoldovaPreflightError("geography", `Office ${office.office_id} geography is missing.`, intendedInventory);
    }
  }
  if (hasParentCycle(geographies)) {
    throw new MoldovaPreflightError("geography", "Moldova geography parents contain a cycle.", intendedInventory);
  }

  const gapParsed = readJson(gapsItem.absPath);
  if (!Array.isArray(gapParsed) || gapParsed.length !== OPEN_HOLD_IDS.length) {
    throw new MoldovaPreflightError("named_holds", "Moldova research-gap count drifted.", intendedInventory);
  }
  const gaps: MoldovaGap[] = gapParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      gap_id: String(item.gap_id ?? ""),
      title: String(item.title ?? ""),
      status: String(item.status ?? ""),
      treatment: String(item.treatment ?? ""),
      justin_approved: item.justin_approved === true,
    };
  });
  if (gaps.some((gap, index) => gap.gap_id !== OPEN_HOLD_IDS[index] || gap.status !== GAP_STATUS[OPEN_HOLD_IDS[index]] || gap.justin_approved || !gap.treatment.trim())) {
    throw new MoldovaPreflightError("named_holds", "Moldova named holds drifted or a hold was closed.", intendedInventory);
  }

  const crosswalkParsed = readJson(crosswalkItem.absPath);
  if (!Array.isArray(crosswalkParsed) || crosswalkParsed.length !== REFERENCE_CROSSWALK_ROWS) {
    throw new MoldovaPreflightError("successor_edge", "Moldova identity-crosswalk row count drifted.", intendedInventory);
  }
  for (const rowUnknown of crosswalkParsed) {
    const row = rowUnknown as Record<string, unknown>;
    const relationship = String(row.relationship ?? "");
    if (!CROSSWALK_RELATIONSHIPS.has(relationship)) {
      throw new MoldovaPreflightError("successor_edge", `Refusing Moldova crosswalk relationship ${relationship}.`, intendedInventory);
    }
    if (/successor_office_id|predecessor_office_id/i.test(JSON.stringify(row))) {
      throw new MoldovaPreflightError("successor_edge", "Moldova identity crosswalk must not carry a successor edge.", intendedInventory);
    }
    if (relationship === "source_context_cross_reference_only" && !String(row.condition ?? "").includes("Not a successor link.")) {
      throw new MoldovaPreflightError("successor_edge", "Moldova reference crosswalk must keep the not-a-successor condition.", intendedInventory);
    }
  }

  const counts = readJson(countsItem.absPath) as Record<string, unknown>;
  const histogram = (counts.draft_tier_histogram ?? {}) as Record<string, unknown>;
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.office_rows !== EXPECTED_COUNTS.offices ||
    counts.current_direct_executives !== EXPECTED_COUNTS.current_direct_executives ||
    counts.historical_direct_executives !== EXPECTED_COUNTS.historical_direct_executives ||
    counts.current_local_mayors !== EXPECTED_COUNTS.current_local_mayors ||
    counts.current_local_councils !== EXPECTED_COUNTS.current_local_councils ||
    counts.current_raion_councils !== EXPECTED_COUNTS.current_raion_councils ||
    counts.current_representative_bodies !== EXPECTED_COUNTS.current_representative_bodies ||
    counts.ep_offices !== 0 ||
    counts.transnistria_parallel_offices !== 0 ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.autonomous !== EXPECTED_COUNTS.draft_tier_autonomous ||
    histogram.raion !== EXPECTED_COUNTS.draft_tier_raion ||
    histogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new MoldovaPreflightError("office_count", "Moldova counts.json office figures drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.source_inventory_entries !== FULL_PACK_DOCUMENTED_SOURCE_INVENTORY_ENTRIES
  ) {
    throw new MoldovaPreflightError(
      "counts_file",
      "Moldova counts.json event/result figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const metadata = readJson(metadataItem.absPath) as {
    research_coverage_complete?: boolean;
    applied_changes?: number;
    approvals?: Record<string, boolean>;
    successor_links?: number;
  };
  const approvals = metadata.approvals ?? {};
  if (
    metadata.research_coverage_complete !== false ||
    metadata.applied_changes !== 0 ||
    metadata.successor_links !== 0 ||
    Object.values(approvals).some((value) => value !== false)
  ) {
    throw new MoldovaPreflightError("coverage", "Moldova metadata must stay unapproved with research_coverage_complete false.", intendedInventory);
  }
  const validation = readJson(validationItem.absPath) as {
    status?: string;
    applied_changes?: number;
    counts?: { events?: number; results?: number; sources?: number; offices?: number };
  };
  if (
    validation.status !== "PASS" ||
    validation.applied_changes !== 0 ||
    validation.counts?.offices !== EXPECTED_COUNTS.offices ||
    validation.counts?.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    validation.counts?.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    validation.counts?.sources !== FULL_PACK_DOCUMENTED_SOURCE_INVENTORY_ENTRIES
  ) {
    throw new MoldovaPreflightError(
      "coverage",
      "Moldova validation-report.json must stay the pre-import PASS receipt. Documentary source entries are not published sources.",
      intendedInventory,
    );
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes(FULL_ZIP_SHA256) || !acceptance.includes("MD-BC-G01") || !acceptance.includes("MD-BC-G24")) {
    throw new MoldovaPreflightError("coverage", "Moldova acceptance receipt drifted from the documentary ZIP SHA or hold range.", intendedInventory);
  }

  const currentDirect = offices.filter((office) => office.office_status === "current" && office.direct_executive).length;
  const historicalDirect = offices.filter((office) => office.office_status === "historical_only" && office.direct_executive).length;
  const ep = offices.filter((office) => /european parliament|\bEP\b/i.test(`${office.office_id} ${office.office_type} ${office.name}`)).length;
  const parallel = offices.filter((office) => /transnistr|pridnestrov|\bPMR\b/i.test(`${office.office_id} ${office.office_type} ${office.name}`)).length;
  if (
    currentDirect !== EXPECTED_COUNTS.current_direct_executives ||
    historicalDirect !== EXPECTED_COUNTS.historical_direct_executives ||
    ep !== 0 ||
    parallel !== 0
  ) {
    throw new MoldovaPreflightError("office_count", "Moldova direct-executive or excluded-scope count drifted.", intendedInventory);
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
    tiers: tierRows,
    drafts,
    offices,
    geographies,
    gaps,
    successorEdges: 0,
    referenceCrosswalkRows: REFERENCE_CROSSWALK_ROWS,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}

function hasParentCycle(geographies: MoldovaGeography[]): boolean {
  const parent = new Map(geographies.map((row) => [row.geography_id, row.parent_geography_id]));
  for (const start of parent.keys()) {
    const seen = new Set<string>();
    let cursor: string | null = start;
    while (cursor) {
      if (seen.has(cursor)) return true;
      seen.add(cursor);
      cursor = parent.get(cursor) ?? null;
    }
  }
  return false;
}
