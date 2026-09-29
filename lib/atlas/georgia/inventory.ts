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
  ADJARA_GEOGRAPHY_ID,
  ADJARA_SUPREME_COUNCIL_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
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
  GEOGRAPHY_RELATIVE,
  HOLDS_RELATIVE,
  IDENTITY_CROSSWALK_RELATIVE,
  LINEAGE_ID,
  MANIFEST_RELATIVE,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OBSERVATIONS_RELATIVE,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PINNED_INPUTS,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VALIDATION_RELATIVE,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  canonical,
  expectedDraftTier,
  fingerprintSha256,
  geographyIdForOffice,
  inputKindFor,
  isDirectExecutive,
  officeTypeFor,
  releaseIdFor,
  sha256Hex,
  type GeorgiaDraftTier,
  type GeorgiaRegisterStatus,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type GeorgiaTierOffice = {
  office_id: string;
  tier: GeorgiaDraftTier;
  draft_tier: GeorgiaDraftTier;
  status: string;
  justin_approved: boolean;
  rationale: string;
  applied: boolean;
  tier_index: number;
};

export type GeorgiaDraftOffice = {
  office_id: string;
  draft_tier: GeorgiaDraftTier;
  status: string;
  justin_approved: boolean;
  basis: string;
  applied: boolean;
};

export type GeorgiaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_type: string;
  level: string;
  geography_id: string;
  municipality_name: string | null;
  office_status: GeorgiaRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  statutory_continuation: boolean;
  hold_id: string | null;
  successor_office_id: null;
  predecessor_office_id: null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type GeorgiaGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: string | null;
  geography_index: number;
  office_ids: string[];
  source_register_index: number;
};

export type GeorgiaGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
  source_index: number;
};

export type GeorgiaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: GeorgiaTierOffice[];
  drafts: GeorgiaDraftOffice[];
  offices: GeorgiaRegisterOffice[];
  geographies: GeorgiaGeography[];
  gaps: GeorgiaGap[];
  successorEdges: number;
  parentsLeftNull: number;
  upcomingCalendarRows: number;
  unassignedObservations: number;
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

export class GeorgiaPreflightError extends Error {
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
  "name_local",
  "office_family",
  "level",
  "status",
  "selection_mode",
  "registry_qualified",
  "review_status",
  "approval_justin",
  "source_ids",
  "source_locator",
  "predecessor_office_id",
  "successor_office_id",
  "seats_current",
  "chamber",
  "next_calendar_id",
  "era_label",
  "geography_id",
  "municipality_name",
  "municipality_name_local",
  "source_electoral_code",
  "geostat_region",
  "territorial_class",
  "identity_note",
  "hold_id",
]);

const GEOGRAPHY_KEYS = new Set(["cec_electoral_code", "name_en", "name_ka", "row", "source_label", "region"]);
const DRAFT_TIERS = new Set<string>(["national", "regional", "local"]);
const REGISTER_STATUSES = new Set<string>(["current", "current_scope_hold", "historical_only"]);
const CROSSWALK_REASON =
  "Observed municipality in 2025 return; English label crosschecked against Geostat; Tbilisi DECs 1–10 group into one municipality";

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

export function scanGeorgiaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): GeorgiaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new GeorgiaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new GeorgiaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new GeorgiaPreflightError(
        "omitted_bytes_present",
        `Omitted Georgia pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new GeorgiaPreflightError(
      "omitted_bytes_present",
      "data/research/georgia is git-tracked. The importer does not adopt omitted research bytes.",
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
      throw new GeorgiaPreflightError("package_inventory", "Georgia git-tracked pack does not match the pinned inputs.", {
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
    events_file_not_projected: "docs/phase1/georgia/data/events.jsonl",
    results_file_not_projected: "docs/phase1/georgia/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/georgia/sources",
    upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
    country_code: COUNTRY_CODE,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new GeorgiaPreflightError("missing_tier", `Georgia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new GeorgiaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new GeorgiaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Georgia inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new GeorgiaPreflightError("tier_hash_mismatch", `Georgia tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const geographyItem = tracked.find((item) => item.input_path === GEOGRAPHY_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const dataCountsItem = tracked.find((item) => item.input_path === DATA_COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const holdsItem = tracked.find((item) => item.input_path === HOLDS_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  const calendarItem = tracked.find((item) => item.input_path === UPCOMING_CALENDAR_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === IDENTITY_CROSSWALK_RELATIVE);
  const observationsItem = tracked.find((item) => item.input_path === OBSERVATIONS_RELATIVE);
  const manifestItem = tracked.find((item) => item.input_path === MANIFEST_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !geographyItem ||
    !countsItem ||
    !dataCountsItem ||
    !gapsItem ||
    !holdsItem ||
    !metadataItem ||
    !validationItem ||
    !acceptanceItem ||
    !calendarItem ||
    !crosswalkItem ||
    !observationsItem ||
    !manifestItem
  ) {
    throw new GeorgiaPreflightError(
      "package_inventory",
      "Georgia register, tiers, geography, counts, holds, calendar, crosswalk, metadata, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: GeorgiaTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tierRows = parsed.map((row, tier_index) => {
      const item = row as Record<string, unknown>;
      return {
        office_id: String(item.office_id ?? ""),
        tier: String(item.tier ?? "") as GeorgiaDraftTier,
        draft_tier: String(item.draft_tier ?? "") as GeorgiaDraftTier,
        status: String(item.status ?? ""),
        justin_approved: item.justin_approved === true,
        rationale: String(item.basis ?? ""),
        applied: item.applied === true,
        tier_index,
      };
    });
  } catch (error) {
    throw new GeorgiaPreflightError(
      "tier_unreadable",
      `Georgia tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new GeorgiaPreflightError("office_count", `Georgia tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJsonl(draftItem.absPath);
  if (draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new GeorgiaPreflightError("office_count", "Georgia draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const drafts: GeorgiaDraftOffice[] = draftParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      office_id: String(item.office_id ?? ""),
      draft_tier: String(item.draft_tier ?? "") as GeorgiaDraftTier,
      status: String(item.status ?? ""),
      justin_approved: item.justin_approved === true,
      basis: String(item.basis ?? ""),
      applied: item.applied === true,
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, GeorgiaTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new GeorgiaPreflightError("duplicate_office", `Duplicate Georgia tier ${tier.office_id}.`, intendedInventory);
    }
    if (tier.tier !== tier.draft_tier) {
      throw new GeorgiaPreflightError("numeric_tier", `Georgia tier ${tier.office_id} draft_tier and tier differ.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const geographyParsed = readJsonl(geographyItem.absPath);
  if (geographyParsed.length !== EXPECTED_COUNTS.cec_geography_rows) {
    throw new GeorgiaPreflightError("geography", `Georgia CEC geography count ${geographyParsed.length} drifted.`, intendedInventory);
  }
  const cecByCode = new Map<number, { name_en: string }>();
  for (const [index, rawUnknown] of geographyParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new GeorgiaPreflightError("geography", `Geography row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    for (const field of Object.keys(raw)) {
      if (!GEOGRAPHY_KEYS.has(field)) {
        throw new GeorgiaPreflightError("geography", `Refusing undocumented Georgia geography field ${field}.`, intendedInventory);
      }
    }
    const code = Number(raw.cec_electoral_code);
    const name = String(raw.name_en ?? "");
    if (!Number.isInteger(code) || !name.trim() || cecByCode.has(code)) {
      throw new GeorgiaPreflightError("geography", `CEC geography ${String(raw.cec_electoral_code)} drifted.`, intendedInventory);
    }
    cecByCode.set(code, { name_en: name });
  }

  const registerParsed = readJsonl(registerItem.absPath);
  if (registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new GeorgiaPreflightError(
      "office_count",
      `Georgia office register has ${registerParsed.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: GeorgiaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new GeorgiaPreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new GeorgiaPreflightError("office_register", `Refusing undocumented Georgia office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (raw.successor_office_id != null || raw.predecessor_office_id != null) {
      throw new GeorgiaPreflightError("successor_edge", `Office ${officeId} supplies a successor or predecessor. None are imported.`, intendedInventory);
    }
    if (raw.country_id !== COUNTRY_ID || raw.country_code !== COUNTRY_CODE || raw.id_namespace !== CURRENT_NAMESPACE) {
      throw new GeorgiaPreflightError("office_register", `Office ${officeId} is outside Georgia GE scope.`, intendedInventory);
    }
    if (raw.approval_justin !== false || raw.registry_qualified !== false || raw.review_status !== "draft_unapproved") {
      throw new GeorgiaPreflightError("review_status", `Office ${officeId} must stay unapproved and registry-unqualified.`, intendedInventory);
    }
    const officeFamily = String(raw.office_family ?? "");
    const level = String(raw.level ?? "");
    const officeStatus = String(raw.status ?? "");
    const officeType = officeTypeFor({ officeId, officeFamily, level, officeStatus });
    const direct = isDirectExecutive(officeType);
    if (officeType === "municipal_mayor" && raw.seats_current !== 1) {
      throw new GeorgiaPreflightError("office_register", `Mayor ${officeId} must stay a single-seat direct executive.`, intendedInventory);
    }
    if ((officeType === "statutory_continuation_council" || officeType === "municipal_council") && officeFamily === "municipal_mayor") {
      throw new GeorgiaPreflightError("office_register", `Council ${officeId} must not become a mayor.`, intendedInventory);
    }
    const geographyId = geographyIdForOffice(officeId, level, raw.geography_id);
    if (level === "municipal" && raw.geography_id !== geographyId) {
      throw new GeorgiaPreflightError("geography", `Municipal office ${officeId} is missing its register geography id.`, intendedInventory);
    }
    if ((level === "national" || level === "Adjara") && raw.geography_id != null) {
      throw new GeorgiaPreflightError("geography", `Office ${officeId} must not gain a register geography id.`, intendedInventory);
    }
    const municipalityName = raw.municipality_name == null ? null : String(raw.municipality_name);
    if (officeStatus === "current" && level === "municipal") {
      const code = Number(raw.source_electoral_code);
      const cec = cecByCode.get(code);
      if (!cec || cec.name_en !== municipalityName) {
        throw new GeorgiaPreflightError("geography", `Office ${officeId} does not match the CEC geography file.`, intendedInventory);
      }
    }
    const statutory = officeStatus === "current_scope_hold";
    const holdId = raw.hold_id == null ? null : String(raw.hold_id);
    if (statutory && holdId !== "GE-BG-G06") {
      throw new GeorgiaPreflightError("named_holds", `Statutory continuation ${officeId} must keep hold GE-BG-G06.`, intendedInventory);
    }
    if (!statutory && holdId != null) {
      throw new GeorgiaPreflightError("named_holds", `Office ${officeId} must not gain a hold id.`, intendedInventory);
    }
    const office: GeorgiaRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: COUNTRY_ID,
      country_code: COUNTRY_CODE,
      name: String(raw.name ?? ""),
      office_type: officeType,
      level,
      geography_id: geographyId,
      municipality_name: municipalityName,
      office_status: officeStatus as GeorgiaRegisterStatus,
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: direct,
      statutory_continuation: statutory,
      hold_id: holdId,
      successor_office_id: null,
      predecessor_office_id: null,
      register_index: index,
      raw,
    };
    if (!office.office_id || seen.has(office.office_id) || !office.name.trim()) {
      throw new GeorgiaPreflightError("duplicate_office", `Duplicate or blank Georgia office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status) || office.selection_mode !== "direct_popular") {
      throw new GeorgiaPreflightError("office_status", `Office ${office.office_id} status or selection mode drifted.`, intendedInventory);
    }
    if (!Array.isArray(raw.source_ids) || raw.source_ids.length === 0) {
      throw new GeorgiaPreflightError("office_register", `Office ${office.office_id} is missing source ids.`, intendedInventory);
    }
    const calendarId = raw.next_calendar_id;
    if (office.office_status === "historical_only" && calendarId != null) {
      throw new GeorgiaPreflightError("office_register", `Historical office ${office.office_id} must not gain an upcoming calendar id.`, intendedInventory);
    }
    if (office.office_status !== "historical_only" && (typeof calendarId !== "string" || !calendarId)) {
      throw new GeorgiaPreflightError("office_register", `Current office ${office.office_id} lost its documentary calendar id.`, intendedInventory);
    }
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new GeorgiaPreflightError("numeric_tier", `Office ${office.office_id} is missing a draft or schema tier row.`, intendedInventory);
    }
    const expectedTier = expectedDraftTier(office.level);
    if (tier.tier !== expectedTier || draft.draft_tier !== expectedTier || tier.draft_tier !== draft.draft_tier || tier.rationale !== draft.basis || !tier.rationale.trim()) {
      throw new GeorgiaPreflightError("numeric_tier", `Office ${office.office_id} draft tier does not match the schema tier file.`, intendedInventory);
    }
    if (
      tier.justin_approved !== false ||
      draft.justin_approved !== false ||
      draft.applied !== false ||
      tier.applied !== false ||
      draft.status !== "draft_unapproved" ||
      tier.status !== "draft_unapproved"
    ) {
      throw new GeorgiaPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and draft_unapproved.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new GeorgiaPreflightError("numeric_tier", `Office ${office.office_id} draft tier ${tier.tier} is not a supplied tier.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("local") !== EXPECTED_COUNTS.draft_tier_local
  ) {
    throw new GeorgiaPreflightError("numeric_tier", "Georgia draft tier histogram drifted.", intendedInventory);
  }

  const officeIdsByGeo = new Map<string, string[]>();
  const geoNames = new Map<string, string>();
  const geoSourceIndex = new Map<string, number>();
  for (const office of offices) {
    const list = officeIdsByGeo.get(office.geography_id) ?? [];
    list.push(office.office_id);
    officeIdsByGeo.set(office.geography_id, list);
    if (!geoSourceIndex.has(office.geography_id)) geoSourceIndex.set(office.geography_id, office.register_index);
    const supplied = office.municipality_name;
    if (supplied) {
      const previous = geoNames.get(office.geography_id);
      if (previous && previous !== supplied) {
        throw new GeorgiaPreflightError("geography", `Geography ${office.geography_id} has conflicting names.`, intendedInventory);
      }
      geoNames.set(office.geography_id, supplied);
    }
  }
  geoNames.set(COUNTRY_GEOGRAPHY_ID, COUNTRY_NAME);
  geoNames.set(ADJARA_GEOGRAPHY_ID, "Autonomous Republic of Adjara");
  const geographies: GeorgiaGeography[] = [...officeIdsByGeo.keys()].map((geographyId, geography_index) => {
    let name = geoNames.get(geographyId) ?? "";
    if (!name && geographyId.startsWith("GE-HOLD-")) {
      const office = offices.find((row) => row.geography_id === geographyId);
      const place = office?.name.split(" Sakrebulo")[0] ?? "";
      name = place;
    }
    if (!name.trim()) {
      throw new GeorgiaPreflightError("geography", `Geography ${geographyId} is missing a name.`, intendedInventory);
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
    throw new GeorgiaPreflightError("geography", `Georgia geography count ${geographies.length} drifted.`, intendedInventory);
  }
  const nullParents = geographies.filter((row) => row.parent_geography_id == null);
  if (nullParents.length !== EXPECTED_COUNTS.geographies_without_parent) {
    throw new GeorgiaPreflightError("geography", "Georgia null-parent geography count drifted.", intendedInventory);
  }

  const currentMunicipal = new Map<string, string[]>();
  for (const office of offices) {
    if (office.office_status !== "current" || office.level !== "municipal") continue;
    const kinds = currentMunicipal.get(office.geography_id) ?? [];
    kinds.push(office.office_type);
    currentMunicipal.set(office.geography_id, kinds);
  }
  if (currentMunicipal.size !== EXPECTED_COUNTS.current_ordinary_municipalities) {
    throw new GeorgiaPreflightError("office_register", "Ordinary-cycle municipality count drifted.", intendedInventory);
  }
  for (const [geographyId, kinds] of currentMunicipal) {
    if (kinds.length !== 2 || !kinds.includes("municipal_council") || !kinds.includes("municipal_mayor")) {
      throw new GeorgiaPreflightError(
        "office_register",
        `Municipality ${geographyId} must stay one council and one direct mayor.`,
        intendedInventory,
      );
    }
  }
  const holdGeos = offices.filter((office) => office.statutory_continuation).map((office) => office.geography_id);
  if (new Set(holdGeos).size !== EXPECTED_COUNTS.statutory_continuation_offices) {
    throw new GeorgiaPreflightError("office_register", "Statutory-continuation geography count drifted.", intendedInventory);
  }
  for (const geographyId of holdGeos) {
    const kinds = offices.filter((office) => office.geography_id === geographyId).map((office) => office.office_type);
    if (kinds.length !== 1 || kinds[0] !== "statutory_continuation_council") {
      throw new GeorgiaPreflightError("office_register", `Hold geography ${geographyId} must stay one council with no popular mayor.`, intendedInventory);
    }
  }

  const gapParsed = readJson(gapsItem.absPath);
  const holdParsed = readJsonl(holdsItem.absPath);
  if (!Array.isArray(gapParsed) || gapParsed.length !== OPEN_HOLD_IDS.length || holdParsed.length !== OPEN_HOLD_IDS.length) {
    throw new GeorgiaPreflightError("named_holds", "Georgia research-gap count drifted.", intendedInventory);
  }
  const gaps: GeorgiaGap[] = gapParsed.map((row, source_index) => {
    const item = row as Record<string, unknown>;
    return {
      gap_id: String(item.hold_id ?? ""),
      title: String(item.topic ?? ""),
      status: String(item.status ?? ""),
      treatment: String(item.resolution_needed ?? ""),
      justin_approved: item.justin_approved === true,
      source_index,
    };
  });
  if (
    gaps.some(
      (gap, index) =>
        gap.gap_id !== OPEN_HOLD_IDS[index] ||
        gap.status !== GAP_STATUS[gap.gap_id] ||
        gap.justin_approved ||
        !gap.treatment.trim() ||
        !gap.title.trim(),
    )
  ) {
    throw new GeorgiaPreflightError("named_holds", "Georgia named holds drifted or a hold was closed.", intendedInventory);
  }
  const holdIds = holdParsed.map((row) => String((row as Record<string, unknown>).hold_id ?? ""));
  if (holdIds.some((holdId, index) => holdId !== OPEN_HOLD_IDS[index])) {
    throw new GeorgiaPreflightError("named_holds", "Georgia holds.jsonl order drifted.", intendedInventory);
  }

  const crosswalk = readJsonl(crosswalkItem.absPath);
  if (crosswalk.length !== EXPECTED_COUNTS.identity_crosswalk_rows) {
    throw new GeorgiaPreflightError("successor_edge", "Georgia identity-crosswalk row count drifted.", intendedInventory);
  }
  const ordinaryIds = new Set(
    offices.filter((office) => office.office_status === "current" && office.level === "municipal").map((office) => office.office_id),
  );
  for (const rowUnknown of crosswalk) {
    const row = rowUnknown as Record<string, unknown>;
    if (String(row.reason ?? "") !== CROSSWALK_REASON || row.entity_kind == null) {
      throw new GeorgiaPreflightError("successor_edge", "Georgia identity crosswalk must not create a successor edge.", intendedInventory);
    }
    if (!ordinaryIds.has(String(row.office_id ?? ""))) {
      throw new GeorgiaPreflightError("successor_edge", "Georgia identity crosswalk office is not an ordinary-cycle municipal office.", intendedInventory);
    }
  }

  const observations = readJsonl(observationsItem.absPath);
  if (observations.length !== EXPECTED_COUNTS.unassigned_observations) {
    throw new GeorgiaPreflightError("calendar", "Georgia unassigned-observation count drifted.", intendedInventory);
  }
  for (const rowUnknown of observations) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.result_rows !== 0) {
      throw new GeorgiaPreflightError("calendar", "An unassigned observation created a result row.", intendedInventory);
    }
  }

  const calendar = readJsonl(calendarItem.absPath);
  if (calendar.length !== EXPECTED_COUNTS.upcoming_calendar_rows) {
    throw new GeorgiaPreflightError("calendar", "Georgia upcoming-calendar row count drifted.", intendedInventory);
  }
  const calendarIds = new Set<string>();
  for (const rowUnknown of calendar) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.justin_approved !== false || row.next_exact_date != null || row.country_surface_prominent !== true) {
      throw new GeorgiaPreflightError(
        "calendar",
        "Upcoming calendar rows must stay documentary, unapproved, and without an exact date.",
        intendedInventory,
      );
    }
    calendarIds.add(String(row.calendar_id ?? ""));
  }
  for (const office of offices) {
    if (office.office_status === "historical_only") continue;
    const calendarId = String(office.raw.next_calendar_id ?? "");
    if (!calendarIds.has(calendarId)) {
      throw new GeorgiaPreflightError("calendar", `Office ${office.office_id} calendar id is not in the documentary calendar.`, intendedInventory);
    }
  }

  const counts = readJson(countsItem.absPath) as Record<string, unknown>;
  const dataCounts = readJson(dataCountsItem.absPath) as Record<string, unknown>;
  if (JSON.stringify(counts) !== JSON.stringify(dataCounts)) {
    throw new GeorgiaPreflightError("counts_file", "Georgia counts.json copies drifted.", intendedInventory);
  }
  const histogram = (counts.draft_tier_histogram ?? {}) as Record<string, unknown>;
  const slim = (counts.slim_first_import ?? {}) as Record<string, unknown>;
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.current_ordinary_cycle_offices !== EXPECTED_COUNTS.ordinary_cycle_offices ||
    counts.current_scope_hold_offices !== EXPECTED_COUNTS.statutory_continuation_offices ||
    counts.historical_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.office_rows !== EXPECTED_COUNTS.offices ||
    counts.current_direct_executive_offices !== EXPECTED_COUNTS.current_direct_executives ||
    counts.historical_direct_executive_offices !== EXPECTED_COUNTS.historical_direct_executives ||
    counts.current_municipal_councils !== EXPECTED_COUNTS.current_municipal_councils ||
    counts.historical_municipal_councils !== EXPECTED_COUNTS.historical_municipal_councils ||
    counts.EP_offices !== 0 ||
    counts.parallel_institution_offices !== 0 ||
    counts.successor_edges !== 0 ||
    counts.upcoming_calendar_rows !== EXPECTED_COUNTS.upcoming_calendar_rows ||
    counts.open_research_holds !== EXPECTED_COUNTS.named_open_holds ||
    counts.research_coverage_complete !== false ||
    counts.applied_changes !== 0 ||
    slim.events !== 0 ||
    slim.results !== 0 ||
    slim.sources !== 0 ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    histogram.local !== EXPECTED_COUNTS.draft_tier_local
  ) {
    throw new GeorgiaPreflightError("office_count", "Georgia counts.json office figures drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.source_inventory_rows !== FULL_PACK_DOCUMENTED_SOURCE_ROWS
  ) {
    throw new GeorgiaPreflightError(
      "counts_file",
      "Georgia counts.json event/result/source figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const metadata = readJson(metadataItem.absPath) as {
    applied_changes?: number;
    justin_approved?: boolean;
    country_code?: string;
    country_name?: string;
    country_id?: string;
    historical_numeric_coverage_complete?: boolean;
    full_pack_zip_sha256?: string;
    open_holds?: string[];
    first_import?: { events?: number; results?: number; sources?: number };
    counts?: {
      ordinary_current_offices?: number;
      statutory_continuation_holds?: number;
      historical_only_offices?: number;
      events_omitted?: number;
      results_omitted?: number;
      source_inventory_rows_omitted?: number;
    };
  };
  if (
    metadata.historical_numeric_coverage_complete !== false ||
    metadata.applied_changes !== 0 ||
    metadata.justin_approved !== false ||
    metadata.country_code !== COUNTRY_CODE ||
    metadata.country_name !== COUNTRY_NAME ||
    metadata.country_id !== COUNTRY_ID ||
    metadata.full_pack_zip_sha256 !== FULL_ZIP_SHA256 ||
    metadata.first_import?.events !== 0 ||
    metadata.first_import?.results !== 0 ||
    metadata.first_import?.sources !== 0 ||
    metadata.counts?.ordinary_current_offices !== EXPECTED_COUNTS.ordinary_cycle_offices ||
    metadata.counts?.statutory_continuation_holds !== EXPECTED_COUNTS.statutory_continuation_offices ||
    metadata.counts?.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    JSON.stringify(metadata.open_holds ?? []) !== JSON.stringify(OPEN_HOLD_IDS)
  ) {
    throw new GeorgiaPreflightError("coverage", "Georgia metadata must stay unapproved with research coverage incomplete.", intendedInventory);
  }
  if (
    metadata.counts?.events_omitted !== FULL_PACK_DOCUMENTED_EVENTS ||
    metadata.counts?.results_omitted !== FULL_PACK_DOCUMENTED_RESULTS ||
    metadata.counts?.source_inventory_rows_omitted !== FULL_PACK_DOCUMENTED_SOURCE_ROWS
  ) {
    throw new GeorgiaPreflightError(
      "counts_file",
      "Georgia metadata omitted-total notes drifted. Publication still does not emit those counters.",
      intendedInventory,
    );
  }
  const validation = readJson(validationItem.absPath) as {
    validation_status?: string;
    applied_changes?: number;
    checks?: Array<{ check?: string; status?: string }>;
  };
  if (validation.validation_status !== "pass" || validation.applied_changes !== 0 || validation.checks?.length !== 13) {
    throw new GeorgiaPreflightError("coverage", "Georgia validation-report.json must stay the pre-import pass receipt.", intendedInventory);
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes("GE-BG-G01") || !acceptance.includes("GE-BG-G21") || !acceptance.includes("0 events")) {
    throw new GeorgiaPreflightError("coverage", "Georgia acceptance receipt drifted from the open holds or the zero-event import.", intendedInventory);
  }
  const manifest = readJson(manifestItem.absPath) as {
    country_id?: string;
    country_code?: string;
    applied_changes?: number;
    importer_supplied?: boolean;
    EP_offices?: number;
    parallel_institution_offices?: number;
    successor_edges?: number;
    research_coverage_complete?: boolean;
    slim_land?: boolean;
    first_import?: { events?: number; results?: number; sources?: number };
  };
  if (
    manifest.country_id !== COUNTRY_ID ||
    manifest.country_code !== COUNTRY_CODE ||
    manifest.applied_changes !== 0 ||
    manifest.importer_supplied !== false ||
    manifest.EP_offices !== 0 ||
    manifest.parallel_institution_offices !== 0 ||
    manifest.successor_edges !== 0 ||
    manifest.research_coverage_complete !== false ||
    manifest.slim_land !== true ||
    manifest.first_import?.events !== 0 ||
    manifest.first_import?.results !== 0 ||
    manifest.first_import?.sources !== 0
  ) {
    throw new GeorgiaPreflightError("coverage", "Georgia manifest must stay an unapplied research receipt.", intendedInventory);
  }

  const ordinary = offices.filter((office) => office.office_status === "current").length;
  const holds = offices.filter((office) => office.statutory_continuation).length;
  const historical = offices.filter((office) => office.office_status === "historical_only").length;
  const currentMayors = offices.filter((office) => office.office_type === "municipal_mayor").length;
  const currentCouncils = offices.filter((office) => office.office_type === "municipal_council" || office.office_type === "statutory_continuation_council").length;
  const currentDirect = offices.filter((office) => office.office_status === "current" && office.direct_executive).length;
  const historicalDirect = offices.filter((office) => office.office_status === "historical_only" && office.direct_executive).length;
  const parallel = offices.filter((office) => /abkhaz|ossetia|ossetian|european parliament/i.test(`${office.office_id} ${office.office_type} ${office.name}`)).length;
  if (
    ordinary !== EXPECTED_COUNTS.ordinary_cycle_offices ||
    holds !== EXPECTED_COUNTS.statutory_continuation_offices ||
    historical !== EXPECTED_COUNTS.historical_offices ||
    currentMayors !== EXPECTED_COUNTS.current_mayors ||
    currentCouncils !== EXPECTED_COUNTS.current_municipal_councils ||
    currentDirect !== EXPECTED_COUNTS.current_direct_executives ||
    historicalDirect !== EXPECTED_COUNTS.historical_direct_executives ||
    parallel !== 0 ||
    offices.filter((office) => office.office_id === PARLIAMENT_ID).length !== 1 ||
    offices.filter((office) => office.office_id === ADJARA_SUPREME_COUNCIL_ID).length !== 1
  ) {
    throw new GeorgiaPreflightError("office_count", "Georgia executive, council, or excluded-scope count drifted.", intendedInventory);
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
    unassignedObservations: observations.length,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}
