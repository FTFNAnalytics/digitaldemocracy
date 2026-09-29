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
  ALL_GAP_IDS,
  APPROVAL_STATE_RELATIVE,
  ASSEMBLY_ID,
  BH_LINEAGE_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_GEOGRAPHY_NAME,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTS_RELATIVE,
  CURRENT_NAMESPACE,
  DATA_COUNTS_RELATIVE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_ROWS,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_ASSEMBLY_ID,
  HISTORICAL_NATIONAL_GEOGRAPHY_LABEL,
  HOLDS_RELATIVE,
  IDENTITY_CROSSWALK_RELATIVE,
  LINEAGE_ID,
  MANIFEST_RELATIVE,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PINNED_INPUTS,
  RESEARCH_GAPS_COPY_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  RESOLVED_NOTE_IDS,
  SCHEMA_VERSION,
  SERBIA_AX_AUDIT_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VALIDATION_RELATIVE,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  canonical,
  expectedDraftTier,
  fingerprintSha256,
  gapIsOpen,
  gapIsResolvedNote,
  inputKindFor,
  isDirectExecutive,
  officeTypeFor,
  releaseIdFor,
  sha256Hex,
  type KosovoDraftTier,
  type KosovoRegisterStatus,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type KosovoTierOffice = {
  office_id: string;
  tier: KosovoDraftTier;
  draft_tier: KosovoDraftTier;
  status: string;
  justin_approved: boolean;
  rationale: string;
  applied: boolean;
  tier_index: number;
};

export type KosovoDraftOffice = {
  office_id: string;
  draft_tier: KosovoDraftTier;
  status: string;
  justin_approved: boolean;
  basis: string;
  applied: boolean;
};

export type KosovoRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_type: string;
  tier_scope: string;
  geography_id: string;
  geography_name: string;
  territorial_unit_id: string;
  office_status: KosovoRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  successor_office_id: null;
  predecessor_office_id: null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type KosovoGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: string | null;
  geography_index: number;
  office_ids: string[];
  source_register_index: number;
};

export type KosovoGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
  source_index: number;
};

export type KosovoInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: KosovoTierOffice[];
  drafts: KosovoDraftOffice[];
  offices: KosovoRegisterOffice[];
  geographies: KosovoGeography[];
  gaps: KosovoGap[];
  successorEdges: number;
  parentsLeftNull: number;
  upcomingCalendarRows: number;
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

export class KosovoPreflightError extends Error {
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
  "country_code",
  "country_id",
  "country_label",
  "name",
  "geography",
  "geography_id",
  "territorial_unit_id",
  "office_type",
  "status",
  "tier_scope",
  "selection_mode",
  "direct_executive",
  "term_years",
  "next_polling_date",
  "territory_vintage",
  "parent_office_ids",
  "source_ids",
  "legacy_office_id",
  "identity_status",
  "valid_from",
  "valid_to",
]);

const DRAFT_TIERS = new Set<string>(["national", "municipal"]);
const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const IDENTITY_STATUS = "unapproved_research_identity; no successor or cross-state edge";

function readJson(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, "utf8")) as unknown;
}

function readJsonl(absPath: string): unknown[] {
  const text = readFileSync(absPath, "utf8");
  const rows: unknown[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

export function scanKosovoInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): KosovoInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new KosovoPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new KosovoPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new KosovoPreflightError(
        "omitted_bytes_present",
        `Omitted Kosovo pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new KosovoPreflightError(
      "omitted_bytes_present",
      "data/research/kosovo is git-tracked. The importer does not adopt omitted research bytes.",
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
      throw new KosovoPreflightError("package_inventory", "Kosovo git-tracked pack does not match the pinned inputs.", {
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
    events_file_not_projected: "docs/phase1/kosovo/data/events.jsonl",
    results_file_not_projected: "docs/phase1/kosovo/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/kosovo/sources",
    upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
    country_code: COUNTRY_CODE,
    serbia_ax_unmodified: true,
    serbia_scope_offices: 0,
    ep_offices: 0,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new KosovoPreflightError("missing_tier", `Kosovo tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new KosovoPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new KosovoPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Kosovo inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new KosovoPreflightError("tier_hash_mismatch", `Kosovo tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const dataCountsItem = tracked.find((item) => item.input_path === DATA_COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const gapsCopyItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_COPY_RELATIVE);
  const holdsItem = tracked.find((item) => item.input_path === HOLDS_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  const calendarItem = tracked.find((item) => item.input_path === UPCOMING_CALENDAR_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === IDENTITY_CROSSWALK_RELATIVE);
  const serbiaAuditItem = tracked.find((item) => item.input_path === SERBIA_AX_AUDIT_RELATIVE);
  const approvalItem = tracked.find((item) => item.input_path === APPROVAL_STATE_RELATIVE);
  const manifestItem = tracked.find((item) => item.input_path === MANIFEST_RELATIVE);
  const lineageItem = tracked.find((item) => item.input_path === BH_LINEAGE_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !countsItem ||
    !dataCountsItem ||
    !gapsItem ||
    !gapsCopyItem ||
    !holdsItem ||
    !metadataItem ||
    !validationItem ||
    !acceptanceItem ||
    !calendarItem ||
    !crosswalkItem ||
    !serbiaAuditItem ||
    !approvalItem ||
    !manifestItem ||
    !lineageItem
  ) {
    throw new KosovoPreflightError(
      "package_inventory",
      "Kosovo register, tiers, counts, holds, calendar, crosswalk, Serbia audit, metadata, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: KosovoTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tierRows = parsed.map((row, tier_index) => {
      const item = row as Record<string, unknown>;
      return {
        office_id: String(item.office_id ?? ""),
        tier: String(item.tier ?? "") as KosovoDraftTier,
        draft_tier: String(item.draft_tier ?? "") as KosovoDraftTier,
        status: String(item.status ?? ""),
        justin_approved: item.justin_approved === true,
        rationale: String(item.basis ?? ""),
        applied: item.applied === true,
        tier_index,
      };
    });
  } catch (error) {
    throw new KosovoPreflightError(
      "tier_unreadable",
      `Kosovo tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new KosovoPreflightError("office_count", `Kosovo tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJsonl(draftItem.absPath);
  if (draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new KosovoPreflightError("office_count", "Kosovo draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const drafts: KosovoDraftOffice[] = draftParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      office_id: String(item.office_id ?? ""),
      draft_tier: String(item.draft_tier ?? "") as KosovoDraftTier,
      status: String(item.status ?? ""),
      justin_approved: item.justin_approved === true,
      basis: String(item.basis ?? ""),
      applied: item.applied === true,
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, KosovoTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new KosovoPreflightError("duplicate_office", `Duplicate Kosovo tier ${tier.office_id}.`, intendedInventory);
    }
    if (tier.tier !== tier.draft_tier) {
      throw new KosovoPreflightError("numeric_tier", `Kosovo tier ${tier.office_id} draft_tier and tier differ.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const registerParsed = readJsonl(registerItem.absPath);
  if (registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new KosovoPreflightError(
      "office_count",
      `Kosovo office register has ${registerParsed.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: KosovoRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new KosovoPreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new KosovoPreflightError("office_register", `Refusing undocumented Kosovo office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (!Array.isArray(raw.parent_office_ids) || raw.parent_office_ids.length !== 0) {
      throw new KosovoPreflightError("successor_edge", `Office ${officeId} supplies a parent office. None are imported.`, intendedInventory);
    }
    if (raw.legacy_office_id != null) {
      throw new KosovoPreflightError("successor_edge", `Office ${officeId} supplies a legacy office id. None are imported.`, intendedInventory);
    }
    if (raw.country_id !== COUNTRY_ID || raw.country_code !== COUNTRY_CODE || raw.country_label !== COUNTRY_NAME) {
      throw new KosovoPreflightError("office_register", `Office ${officeId} is outside Kosovo XK scope.`, intendedInventory);
    }
    if (raw.identity_status !== IDENTITY_STATUS) {
      throw new KosovoPreflightError("review_status", `Office ${officeId} must stay an unapproved research identity.`, intendedInventory);
    }
    if (raw.next_polling_date != null || raw.valid_from != null || raw.valid_to != null) {
      throw new KosovoPreflightError("calendar", `Office ${officeId} must not gain a polling date or validity interval.`, intendedInventory);
    }
    const suppliedType = String(raw.office_type ?? "");
    const tierScope = String(raw.tier_scope ?? "");
    const officeStatus = String(raw.status ?? "");
    const directExecutive = raw.direct_executive === true;
    const officeType = officeTypeFor({
      officeId,
      officeType: suppliedType,
      tierScope,
      officeStatus,
      directExecutive,
    });
    const direct = isDirectExecutive(officeType);
    if (direct !== directExecutive) {
      throw new KosovoPreflightError("office_register", `Office ${officeId} direct-executive flag drifted.`, intendedInventory);
    }
    const geographyId = String(raw.geography_id ?? "");
    const geographyName = String(raw.geography ?? "");
    if (!geographyId.trim() || !geographyName.trim()) {
      throw new KosovoPreflightError("geography", `Office ${officeId} is missing a geography.`, intendedInventory);
    }
    const selectionMode = String(raw.selection_mode ?? "");
    if (officeType === "mayor" && selectionMode !== "direct_popular_majority_runoff") {
      throw new KosovoPreflightError("office_register", `Mayor ${officeId} must stay a direct majority-runoff executive.`, intendedInventory);
    }
    if (officeType !== "mayor" && selectionMode !== "direct_popular_list_pr") {
      throw new KosovoPreflightError("office_register", `Assembly ${officeId} must stay a list-PR office.`, intendedInventory);
    }
    if (officeType === "mayor" && raw.term_years !== (officeStatus === "current" ? 4 : null)) {
      throw new KosovoPreflightError("office_register", `Mayor ${officeId} term years drifted.`, intendedInventory);
    }
    const office: KosovoRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: COUNTRY_ID,
      country_code: COUNTRY_CODE,
      name: String(raw.name ?? ""),
      office_type: officeType,
      tier_scope: tierScope,
      geography_id: geographyId,
      geography_name: geographyName,
      territorial_unit_id: String(raw.territorial_unit_id ?? ""),
      office_status: officeStatus as KosovoRegisterStatus,
      selection_mode: selectionMode,
      direct_executive: direct,
      successor_office_id: null,
      predecessor_office_id: null,
      register_index: index,
      raw,
    };
    if (!office.office_id || seen.has(office.office_id) || !office.name.trim()) {
      throw new KosovoPreflightError("duplicate_office", `Duplicate or blank Kosovo office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status)) {
      throw new KosovoPreflightError("office_status", `Office ${office.office_id} status drifted.`, intendedInventory);
    }
    if (!Array.isArray(raw.source_ids) || raw.source_ids.length === 0) {
      throw new KosovoPreflightError("office_register", `Office ${office.office_id} is missing source ids.`, intendedInventory);
    }
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new KosovoPreflightError("numeric_tier", `Office ${office.office_id} is missing a draft or schema tier row.`, intendedInventory);
    }
    const expectedTier = expectedDraftTier(office.tier_scope);
    if (
      tier.tier !== expectedTier ||
      draft.draft_tier !== expectedTier ||
      tier.draft_tier !== draft.draft_tier ||
      tier.rationale !== draft.basis ||
      !tier.rationale.trim()
    ) {
      throw new KosovoPreflightError("numeric_tier", `Office ${office.office_id} draft tier does not match the schema tier file.`, intendedInventory);
    }
    if (
      tier.justin_approved !== false ||
      draft.justin_approved !== false ||
      draft.applied !== false ||
      tier.applied !== false ||
      draft.status !== "draft_unapproved" ||
      tier.status !== "draft_unapproved"
    ) {
      throw new KosovoPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and draft_unapproved.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new KosovoPreflightError("numeric_tier", `Office ${office.office_id} draft tier ${tier.tier} is not a supplied tier.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new KosovoPreflightError("numeric_tier", "Kosovo draft tier histogram drifted.", intendedInventory);
  }

  const officeIdsByGeo = new Map<string, string[]>();
  const geoNames = new Map<string, Set<string>>();
  const geoSourceIndex = new Map<string, number>();
  const currentNameByGeo = new Map<string, string>();
  for (const office of offices) {
    const list = officeIdsByGeo.get(office.geography_id) ?? [];
    list.push(office.office_id);
    officeIdsByGeo.set(office.geography_id, list);
    if (!geoSourceIndex.has(office.geography_id)) geoSourceIndex.set(office.geography_id, office.register_index);
    const names = geoNames.get(office.geography_id) ?? new Set<string>();
    names.add(office.geography_name);
    geoNames.set(office.geography_id, names);
    if (office.office_status === "current") {
      const previous = currentNameByGeo.get(office.geography_id);
      if (previous && previous !== office.geography_name) {
        throw new KosovoPreflightError("geography", `Geography ${office.geography_id} has conflicting current names.`, intendedInventory);
      }
      currentNameByGeo.set(office.geography_id, office.geography_name);
    }
  }
  const geographies: KosovoGeography[] = [...officeIdsByGeo.keys()].map((geographyId, geography_index) => {
    const names = geoNames.get(geographyId) ?? new Set<string>();
    let name = currentNameByGeo.get(geographyId) ?? [...names][0] ?? "";
    if (geographyId === COUNTRY_GEOGRAPHY_ID) {
      if (names.size !== 2 || !names.has(COUNTRY_GEOGRAPHY_NAME) || !names.has(HISTORICAL_NATIONAL_GEOGRAPHY_LABEL)) {
        throw new KosovoPreflightError(
          "geography",
          "The shared national geography must keep the current Kosovo* label and the provisional vintage label on the historical row only.",
          intendedInventory,
        );
      }
      name = COUNTRY_GEOGRAPHY_NAME;
    } else if (names.size !== 1) {
      throw new KosovoPreflightError("geography", `Geography ${geographyId} has conflicting names.`, intendedInventory);
    }
    if (!name.trim()) {
      throw new KosovoPreflightError("geography", `Geography ${geographyId} is missing a name.`, intendedInventory);
    }
    return {
      geography_id: geographyId,
      name,
      country_id: COUNTRY_ID,
      parent_geography_id: null,
      geography_index,
      office_ids: officeIdsByGeo.get(geographyId) ?? [],
      source_register_index: geoSourceIndex.get(geographyId) ?? 0,
    };
  });
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new KosovoPreflightError("geography", `Kosovo geography count ${geographies.length} drifted.`, intendedInventory);
  }
  const nullParents = geographies.filter((row) => row.parent_geography_id == null);
  if (nullParents.length !== EXPECTED_COUNTS.geographies_without_parent) {
    throw new KosovoPreflightError("geography", "Kosovo null-parent geography count drifted.", intendedInventory);
  }

  const currentMunicipal = new Map<string, string[]>();
  const historicalMunicipal = new Map<string, string[]>();
  for (const office of offices) {
    if (office.tier_scope !== "local") continue;
    const target = office.office_status === "current" ? currentMunicipal : historicalMunicipal;
    const kinds = target.get(office.geography_id) ?? [];
    kinds.push(office.office_type);
    target.set(office.geography_id, kinds);
  }
  if (currentMunicipal.size !== EXPECTED_COUNTS.current_municipalities) {
    throw new KosovoPreflightError("office_register", "Current municipality count drifted.", intendedInventory);
  }
  if (historicalMunicipal.size !== EXPECTED_COUNTS.historical_municipalities) {
    throw new KosovoPreflightError("office_register", "Historical municipality count drifted.", intendedInventory);
  }
  for (const [geographyId, kinds] of currentMunicipal) {
    if (historicalMunicipal.has(geographyId)) {
      throw new KosovoPreflightError(
        "successor_edge",
        `Municipality ${geographyId} must not share a geography between current and historical offices.`,
        intendedInventory,
      );
    }
    if (kinds.length !== 2 || !kinds.includes("municipal_assembly") || !kinds.includes("mayor")) {
      throw new KosovoPreflightError(
        "office_register",
        `Current municipality ${geographyId} must stay one assembly and one direct mayor.`,
        intendedInventory,
      );
    }
  }
  for (const [geographyId, kinds] of historicalMunicipal) {
    if (kinds.length !== 2 || !kinds.includes("municipal_assembly") || !kinds.includes("mayor")) {
      throw new KosovoPreflightError(
        "office_register",
        `Historical municipality ${geographyId} must stay one assembly and one direct mayor.`,
        intendedInventory,
      );
    }
  }

  const gapParsed = readJson(gapsItem.absPath);
  const gapCopy = readJson(gapsCopyItem.absPath);
  const holdParsed = readJsonl(holdsItem.absPath);
  if (JSON.stringify(gapParsed) !== JSON.stringify(gapCopy)) {
    throw new KosovoPreflightError("named_holds", "Kosovo research-gap copies drifted.", intendedInventory);
  }
  if (!Array.isArray(gapParsed) || gapParsed.length !== ALL_GAP_IDS.length || holdParsed.length !== ALL_GAP_IDS.length) {
    throw new KosovoPreflightError("named_holds", "Kosovo research-gap count drifted.", intendedInventory);
  }
  const gaps: KosovoGap[] = gapParsed.map((row, source_index) => {
    const item = row as Record<string, unknown>;
    return {
      gap_id: String(item.gap_id ?? ""),
      title: String(item.title ?? ""),
      status: String(item.status ?? ""),
      treatment: String(item.closure_requirement ?? ""),
      justin_approved: item.justin_approved === true,
      source_index,
    };
  });
  if (
    gaps.some(
      (gap, index) =>
        gap.gap_id !== ALL_GAP_IDS[index] ||
        gap.status !== GAP_STATUS[gap.gap_id] ||
        gap.justin_approved ||
        !gap.treatment.trim() ||
        !gap.title.trim() ||
        (gapIsOpen(gap.gap_id) === gapIsResolvedNote(gap.gap_id)),
    )
  ) {
    throw new KosovoPreflightError("named_holds", "Kosovo named holds drifted or a hold was closed.", intendedInventory);
  }
  const holdIds = holdParsed.map((row) => String((row as Record<string, unknown>).gap_id ?? ""));
  if (holdIds.some((holdId, index) => holdId !== ALL_GAP_IDS[index])) {
    throw new KosovoPreflightError("named_holds", "Kosovo holds.jsonl order drifted.", intendedInventory);
  }
  const openCount = gaps.filter((gap) => gapIsOpen(gap.gap_id)).length;
  const resolvedCount = gaps.filter((gap) => gapIsResolvedNote(gap.gap_id)).length;
  if (openCount !== OPEN_HOLD_IDS.length || resolvedCount !== RESOLVED_NOTE_IDS.length) {
    throw new KosovoPreflightError("named_holds", "Kosovo open-hold and resolved-note counts drifted.", intendedInventory);
  }

  const crosswalk = readJson(crosswalkItem.absPath) as {
    current_municipality_lookup?: Array<Record<string, unknown>>;
    old_new_matching?: string;
    north_south_mitrovica?: string;
  };
  const lookup = crosswalk.current_municipality_lookup ?? [];
  if (lookup.length !== EXPECTED_COUNTS.identity_crosswalk_rows) {
    throw new KosovoPreflightError("successor_edge", "Kosovo identity-crosswalk row count drifted.", intendedInventory);
  }
  if (!String(crosswalk.old_new_matching ?? "").includes("never authorizes a merger")) {
    throw new KosovoPreflightError("successor_edge", "Kosovo identity crosswalk must not authorize a merger.", intendedInventory);
  }
  const currentUnits = new Map(
    offices
      .filter((office) => office.office_status === "current" && office.tier_scope === "local")
      .map((office) => [office.territorial_unit_id, office.geography_name]),
  );
  const seenUnits = new Set<string>();
  for (const row of lookup) {
    const unitId = String(row.internal_unit_id ?? "");
    if (row.automatic_cross_vintage_edge !== false || seenUnits.has(unitId) || currentUnits.get(unitId) !== String(row.canonical_name ?? "")) {
      throw new KosovoPreflightError("successor_edge", "Kosovo identity crosswalk must not create a successor edge.", intendedInventory);
    }
    seenUnits.add(unitId);
  }

  const calendar = readJsonl(calendarItem.absPath);
  if (calendar.length !== EXPECTED_COUNTS.upcoming_calendar_rows) {
    throw new KosovoPreflightError("calendar", "Kosovo upcoming-calendar row count drifted.", intendedInventory);
  }
  const officeIds = new Set(offices.map((office) => office.office_id));
  for (const rowUnknown of calendar) {
    const row = rowUnknown as Record<string, unknown>;
    if (
      row.justin_approved !== false ||
      row.applied_changes !== 0 ||
      row.scheduled_date != null ||
      row.country_surface_prominent !== true
    ) {
      throw new KosovoPreflightError(
        "calendar",
        "Upcoming calendar rows must stay documentary, unapproved, and without an exact date.",
        intendedInventory,
      );
    }
    if (!Array.isArray(row.office_ids)) {
      throw new KosovoPreflightError("calendar", "Upcoming calendar office ids drifted.", intendedInventory);
    }
    for (const officeId of row.office_ids) {
      if (!officeIds.has(String(officeId))) {
        throw new KosovoPreflightError("calendar", `Calendar office ${String(officeId)} is not in the register.`, intendedInventory);
      }
    }
  }

  const counts = readJson(countsItem.absPath) as Record<string, unknown>;
  const dataCounts = readJson(dataCountsItem.absPath) as Record<string, unknown>;
  if (JSON.stringify(counts) !== JSON.stringify(dataCounts)) {
    throw new KosovoPreflightError("counts_file", "Kosovo counts.json copies drifted.", intendedInventory);
  }
  const histogram = (counts.draft_tier_histogram ?? {}) as Record<string, unknown>;
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.total_offices !== EXPECTED_COUNTS.offices ||
    counts.current_direct_executive_offices !== EXPECTED_COUNTS.current_direct_executives ||
    counts.historical_direct_executive_offices !== EXPECTED_COUNTS.historical_direct_executives ||
    counts.current_municipal_assemblies !== EXPECTED_COUNTS.current_municipal_assemblies ||
    counts.historical_municipal_assemblies !== EXPECTED_COUNTS.historical_municipal_assemblies ||
    counts.ep_offices !== 0 ||
    counts.popular_president_offices !== 0 ||
    counts.popular_regional_offices !== 0 ||
    counts.serbia_scope_offices !== 0 ||
    counts.applied_changes !== 0 ||
    counts.upcoming_calendar_rows !== EXPECTED_COUNTS.upcoming_calendar_rows ||
    counts.research_gap_rows !== ALL_GAP_IDS.length ||
    counts.landed_events !== 0 ||
    counts.landed_results !== 0 ||
    counts.landed_sources !== 0 ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new KosovoPreflightError("office_count", "Kosovo counts.json office figures drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.source_inventory_rows !== FULL_PACK_DOCUMENTED_SOURCE_ROWS
  ) {
    throw new KosovoPreflightError(
      "counts_file",
      "Kosovo counts.json event/result/source figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const metadata = readJson(metadataItem.absPath) as {
    applied_changes?: number;
    justin_approved?: boolean;
    country_code?: string;
    country_name?: string;
    country_id?: string;
    research_coverage_complete?: boolean;
    id_namespace?: string;
    ep_offices?: number;
    serbia_scope_offices?: number;
    merged_into_serbia_AX?: boolean;
    AX_kosovo_scope_offices_audited?: number;
  };
  if (
    metadata.research_coverage_complete !== false ||
    metadata.applied_changes !== 0 ||
    metadata.justin_approved !== false ||
    metadata.country_code !== COUNTRY_CODE ||
    metadata.country_name !== COUNTRY_NAME ||
    metadata.country_id !== COUNTRY_ID ||
    metadata.id_namespace !== CURRENT_NAMESPACE ||
    metadata.ep_offices !== 0 ||
    metadata.serbia_scope_offices !== 0 ||
    metadata.merged_into_serbia_AX !== false ||
    metadata.AX_kosovo_scope_offices_audited !== 0
  ) {
    throw new KosovoPreflightError("coverage", "Kosovo metadata must stay unapproved with research coverage incomplete.", intendedInventory);
  }
  const validation = readJson(validationItem.absPath) as {
    status?: string;
    applied_changes?: number;
    check_count?: number;
    passed?: number;
    human_approval?: boolean;
    research_gaps_closed?: boolean;
  };
  if (
    validation.status !== "PASS" ||
    validation.applied_changes !== 0 ||
    validation.check_count !== 65 ||
    validation.passed !== 65 ||
    validation.human_approval !== false ||
    validation.research_gaps_closed !== false
  ) {
    throw new KosovoPreflightError("coverage", "Kosovo validation-report.json must stay the pre-import pass receipt.", intendedInventory);
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes("XK-BB-G04") || !acceptance.includes("XK-BH-G24") || !acceptance.includes("0 events")) {
    throw new KosovoPreflightError("coverage", "Kosovo acceptance receipt drifted from the open holds or the zero-event import.", intendedInventory);
  }
  const manifest = readJson(manifestItem.absPath) as {
    full_pack_sha256?: string;
    as_of?: string;
  };
  if (manifest.full_pack_sha256 !== FULL_ZIP_SHA256 || manifest.as_of !== RESEARCH_SNAPSHOT_LABEL) {
    throw new KosovoPreflightError("coverage", "Kosovo manifest full-ZIP SHA drifted. Publication still does not adopt that archive.", intendedInventory);
  }
  const lineageNote = readJson(lineageItem.absPath) as { applied_changes?: number; supersedes?: string };
  if (lineageNote.applied_changes !== 0 || lineageNote.supersedes !== "BB") {
    throw new KosovoPreflightError("coverage", "Kosovo BH lineage note must stay an unapplied supersession of BB.", intendedInventory);
  }
  const approval = readJson(approvalItem.absPath) as Record<string, unknown>;
  if (approval.applied_changes !== 0 || Object.entries(approval).some(([key, value]) => key !== "applied_changes" && value !== false)) {
    throw new KosovoPreflightError("review_status", "Kosovo approval-state must stay unchecked.", intendedInventory);
  }
  const serbiaAudit = readJson(serbiaAuditItem.absPath) as {
    AX_kosovo_scope_offices?: number;
    BB_serbia_scope_offices?: number;
    AX_modified?: boolean;
    BB_merged_into_AX?: boolean;
  };
  if (
    serbiaAudit.AX_kosovo_scope_offices !== 0 ||
    serbiaAudit.BB_serbia_scope_offices !== 0 ||
    serbiaAudit.AX_modified !== false ||
    serbiaAudit.BB_merged_into_AX !== false
  ) {
    throw new KosovoPreflightError("serbia_scope", "Serbia AX scope audit must stay unmodified with Kosovo-scope and Serbia-scope at 0.", intendedInventory);
  }

  const current = offices.filter((office) => office.office_status === "current").length;
  const historical = offices.filter((office) => office.office_status === "historical_only").length;
  const currentMayors = offices.filter((office) => office.office_status === "current" && office.office_type === "mayor").length;
  const currentAssemblies = offices.filter(
    (office) => office.office_status === "current" && office.office_type === "municipal_assembly",
  ).length;
  const historicalMayors = offices.filter((office) => office.office_status === "historical_only" && office.office_type === "mayor").length;
  const historicalAssemblies = offices.filter(
    (office) => office.office_status === "historical_only" && office.office_type === "municipal_assembly",
  ).length;
  const excluded = offices.filter((office) =>
    /european parliament|serbia|president|prime minister/i.test(`${office.office_id} ${office.office_type} ${office.name}`),
  ).length;
  if (
    current !== EXPECTED_COUNTS.current_offices ||
    historical !== EXPECTED_COUNTS.historical_offices ||
    currentMayors !== EXPECTED_COUNTS.current_mayors ||
    currentAssemblies !== EXPECTED_COUNTS.current_municipal_assemblies ||
    historicalMayors !== EXPECTED_COUNTS.historical_mayors ||
    historicalAssemblies !== EXPECTED_COUNTS.historical_municipal_assemblies ||
    excluded !== 0 ||
    offices.filter((office) => office.office_id === ASSEMBLY_ID && office.office_status === "current").length !== 1 ||
    offices.filter((office) => office.office_id === HISTORICAL_ASSEMBLY_ID && office.office_status === "historical_only").length !== 1
  ) {
    throw new KosovoPreflightError("office_count", "Kosovo executive, assembly, or excluded-scope count drifted.", intendedInventory);
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
    parentsLeftNull: 0,
    upcomingCalendarRows: calendar.length,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}
