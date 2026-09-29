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
  CANELONES_DEPARTMENT_ID,
  COUNTS_RELATIVE,
  COUNTRY_CODE,
  CURRENT_NAMESPACE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_SCOPE,
  DEFERRED_HOLDS_RELATIVE,
  DOCUMENTED_NOT_IMPLEMENTED_ID,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  GEOGRAPHY_RELATIVE,
  IDENTITY_CROSSWALK_RELATIVE,
  LINEAGE_ID,
  MANIFEST_RELATIVE,
  METADATA_RELATIVE,
  METHOD_VERSION,
  MONTEVIDEO_DEPARTMENT_ID,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PINNED_INPUTS,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESOLVED_NOTE_IDS,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VALIDATION_RELATIVE,
  VICE_PRESIDENT_ID,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  canonical,
  expectedDraftTier,
  fingerprintSha256,
  inputKindFor,
  isDirectExecutive,
  isListSelectedAlcalde,
  officeTypeFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type UruguayDraftTier,
  type UruguayRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type UruguayTierOffice = {
  office_id: string;
  tier: UruguayDraftTier;
  draft_tier: UruguayDraftTier;
  status: string;
  justin_approved: boolean;
  rationale: string;
  applied: boolean;
  tier_index: number;
};

export type UruguayDraftOffice = {
  office_id: string;
  draft_tier: UruguayDraftTier;
  status: string;
  justin_approved: boolean;
  basis: string;
  applied: boolean;
};

export type UruguayRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_type: string;
  scope_level: string;
  geography_id: string;
  office_status: UruguayRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  list_selected: boolean;
  separate_executive_ballot: boolean;
  successor_office_id: null;
  predecessor_office_id: null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type UruguayGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: string | null;
  geography_index: number;
  office_ids: string[];
  source_ids: string[];
  boundary_status: string | null;
};

export type UruguayGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
  source_index: number;
};

export type UruguayInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: UruguayTierOffice[];
  drafts: UruguayDraftOffice[];
  offices: UruguayRegisterOffice[];
  geographies: UruguayGeography[];
  gaps: UruguayGap[];
  successorEdges: number;
  parentsLeftNull: number;
  upcomingCalendarRows: number;
  deferredCalendarHoldRows: number;
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

export class UruguayPreflightError extends Error {
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
  "country_id",
  "country_code",
  "country_scope",
  "geography_id",
  "name_local",
  "scope_level",
  "office_kind",
  "office_status",
  "selection_mode",
  "popularly_elected",
  "is_direct_executive",
  "separate_executive_ballot",
  "ep_office",
  "source_ids",
  "effective_from",
  "effective_to",
  "predecessor_id",
  "successor_id",
  "justin_approved",
  "applied",
  "elected_seats",
  "joint_ticket_office_id",
  "next_calendar_ids",
  "ex_officio_role",
  "ex_officio_seats",
  "total_current_members",
  "departmental_constituencies",
  "department_code",
  "selection_note",
  "seat_composition",
  "seat_count_note",
  "department",
  "municipio",
  "electoral_letter",
  "source_name",
  "aliases",
  "territorial_source_locator",
  "parent_geography_id",
  "first_evidenced_poll_year",
  "observed_poll_years",
  "creation_date",
  "creation_date_note",
  "era_gate",
]);

const GEOGRAPHY_KEYS = new Set(["geography_id", "country_id", "name", "parent_geography_id", "source_ids", "boundary_status"]);
const HISTORICAL_BOUNDARY_STATUS = "historical_elected_area_no_geometry_or_successor_claim";
const DRAFT_TIERS = new Set<string>(["national", "regional", "local"]);
const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const SELECTION_MODES = new Set<string>(["direct_popular", "popular_list_result_first_titular", "direct_popular_collective_body"]);
const DEPARTMENT_CODES = new Set([
  "MO",
  "CA",
  "MA",
  "RO",
  "TT",
  "CL",
  "RV",
  "AR",
  "SA",
  "PA",
  "RN",
  "SO",
  "CO",
  "SJ",
  "FS",
  "FD",
  "DU",
  "LA",
  "TA",
]);

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

export function scanUruguayInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): UruguayInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new UruguayPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new UruguayPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new UruguayPreflightError(
        "omitted_bytes_present",
        `Omitted Uruguay pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new UruguayPreflightError(
      "omitted_bytes_present",
      "data/research/uruguay is git-tracked. The importer does not adopt omitted research bytes.",
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
      throw new UruguayPreflightError("package_inventory", "Uruguay git-tracked pack does not match the pinned inputs.", {
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
    events_file_not_projected: "docs/phase1/uruguay/data/events.jsonl",
    results_file_not_projected: "docs/phase1/uruguay/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/uruguay/sources",
    upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new UruguayPreflightError("missing_tier", `Uruguay tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new UruguayPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new UruguayPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Uruguay inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new UruguayPreflightError("tier_hash_mismatch", `Uruguay tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const geographyItem = tracked.find((item) => item.input_path === GEOGRAPHY_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  const calendarItem = tracked.find((item) => item.input_path === UPCOMING_CALENDAR_RELATIVE);
  const crosswalkItem = tracked.find((item) => item.input_path === IDENTITY_CROSSWALK_RELATIVE);
  const deferredItem = tracked.find((item) => item.input_path === DEFERRED_HOLDS_RELATIVE);
  const manifestItem = tracked.find((item) => item.input_path === MANIFEST_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !geographyItem ||
    !countsItem ||
    !gapsItem ||
    !metadataItem ||
    !validationItem ||
    !acceptanceItem ||
    !calendarItem ||
    !crosswalkItem ||
    !deferredItem ||
    !manifestItem
  ) {
    throw new UruguayPreflightError(
      "package_inventory",
      "Uruguay register, tiers, geography, counts, gaps, calendar, crosswalk, metadata, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: UruguayTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tierRows = parsed.map((row, tier_index) => {
      const item = row as Record<string, unknown>;
      return {
        office_id: String(item.office_id ?? ""),
        tier: String(item.tier ?? "") as UruguayDraftTier,
        draft_tier: String(item.draft_tier ?? "") as UruguayDraftTier,
        status: String(item.status ?? ""),
        justin_approved: item.justin_approved === true,
        rationale: String(item.basis ?? ""),
        applied: item.applied === true,
        tier_index,
      };
    });
  } catch (error) {
    throw new UruguayPreflightError(
      "tier_unreadable",
      `Uruguay tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new UruguayPreflightError("office_count", `Uruguay tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJsonl(draftItem.absPath);
  if (draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new UruguayPreflightError("office_count", "Uruguay draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const drafts: UruguayDraftOffice[] = draftParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      office_id: String(item.office_id ?? ""),
      draft_tier: String(item.draft_tier ?? "") as UruguayDraftTier,
      status: String(item.status ?? ""),
      justin_approved: item.justin_approved === true,
      basis: String(item.basis ?? ""),
      applied: item.applied === true,
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, UruguayTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new UruguayPreflightError("duplicate_office", `Duplicate Uruguay tier ${tier.office_id}.`, intendedInventory);
    }
    if (tier.tier !== tier.draft_tier) {
      throw new UruguayPreflightError("numeric_tier", `Uruguay tier ${tier.office_id} draft_tier and tier differ.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const geographyParsed = readJsonl(geographyItem.absPath);
  const geographyRows: Array<{
    geography_id: string;
    name: string;
    parent_geography_id: string | null;
  source_ids: string[];
  boundary_status: string | null;
  index: number;
}> = [];
  const geographySeen = new Set<string>();
  for (const [index, rawUnknown] of geographyParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new UruguayPreflightError("geography", `Geography row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    for (const field of Object.keys(raw)) {
      if (!GEOGRAPHY_KEYS.has(field)) {
        throw new UruguayPreflightError("geography", `Refusing undocumented Uruguay geography field ${field}.`, intendedInventory);
      }
    }
    const geographyId = String(raw.geography_id ?? "");
    if (!geographyId || geographySeen.has(geographyId) || raw.country_id !== COUNTRY_ID) {
      throw new UruguayPreflightError("geography", `Geography ${geographyId || index} drifted.`, intendedInventory);
    }
    geographySeen.add(geographyId);
    const name = String(raw.name ?? "");
    if (!name.trim()) throw new UruguayPreflightError("geography", `Geography ${geographyId} is missing a name.`, intendedInventory);
    if (!Array.isArray(raw.source_ids) || raw.source_ids.length === 0) {
      throw new UruguayPreflightError("geography", `Geography ${geographyId} is missing source ids.`, intendedInventory);
    }
    const parent = raw.parent_geography_id == null ? null : String(raw.parent_geography_id);
    const boundaryStatus = raw.boundary_status == null ? null : String(raw.boundary_status);
    const historicalLocal = geographyId.startsWith("UY-H-JLA-");
    if (historicalLocal) {
      if (boundaryStatus !== HISTORICAL_BOUNDARY_STATUS) {
        throw new UruguayPreflightError(
          "geography",
          `Historical local geography ${geographyId} must keep its no-successor boundary status.`,
          intendedInventory,
        );
      }
    } else if (boundaryStatus != null) {
      throw new UruguayPreflightError("geography", `Geography ${geographyId} must not gain a boundary status.`, intendedInventory);
    }
    geographyRows.push({
      geography_id: geographyId,
      name,
      parent_geography_id: parent,
      source_ids: raw.source_ids.map((item) => String(item)),
      boundary_status: boundaryStatus,
      index,
    });
  }
  if (geographyRows.length !== EXPECTED_COUNTS.geographies) {
    throw new UruguayPreflightError("geography", `Uruguay geography count ${geographyRows.length} drifted.`, intendedInventory);
  }
  for (const geography of geographyRows) {
    if (geography.parent_geography_id == null) {
      if (geography.geography_id !== COUNTRY_GEOGRAPHY_ID) {
        throw new UruguayPreflightError("geography", `Geography ${geography.geography_id} must not drop its parent.`, intendedInventory);
      }
    } else if (!geographySeen.has(geography.parent_geography_id)) {
      throw new UruguayPreflightError(
        "geography",
        `Refusing to invent a geography for parent ${geography.parent_geography_id}.`,
        intendedInventory,
      );
    }
  }
  if (hasParentCycle(geographyRows)) {
    throw new UruguayPreflightError("geography", "Uruguay geography parents contain a cycle.", intendedInventory);
  }

  const registerParsed = readJsonl(registerItem.absPath);
  if (registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new UruguayPreflightError(
      "office_count",
      `Uruguay office register has ${registerParsed.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: UruguayRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const officeIdsByGeo = new Map<string, string[]>();
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new UruguayPreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new UruguayPreflightError("office_register", `Refusing undocumented Uruguay office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (raw.successor_id != null || raw.predecessor_id != null) {
      throw new UruguayPreflightError("successor_edge", `Office ${officeId} supplies a successor or predecessor. None are imported.`, intendedInventory);
    }
    if (raw.country_id !== COUNTRY_ID || raw.country_code !== COUNTRY_CODE || raw.country_scope !== COUNTRY_SCOPE) {
      throw new UruguayPreflightError("office_register", `Office ${officeId} is outside Uruguay scope.`, intendedInventory);
    }
    if (raw.ep_office !== false) {
      throw new UruguayPreflightError("office_register", `Office ${officeId} is an EP office.`, intendedInventory);
    }
    if (raw.justin_approved !== false || raw.applied !== false) {
      throw new UruguayPreflightError("review_status", `Office ${officeId} must stay justin_approved false and unapplied.`, intendedInventory);
    }
    if (raw.effective_from != null || raw.effective_to != null || raw.creation_date != null) {
      throw new UruguayPreflightError("office_register", `Office ${officeId} must not gain an effective or creation date.`, intendedInventory);
    }
    const officeKind = String(raw.office_kind ?? "");
    const scopeLevel = String(raw.scope_level ?? "");
    const officeStatus = String(raw.office_status ?? "");
    const officeType = officeTypeFor({ officeId, officeKind, scopeLevel, officeStatus });
    const direct = raw.is_direct_executive === true;
    if (direct !== (officeKind === "direct_executive") || direct !== isDirectExecutive(officeType)) {
      throw new UruguayPreflightError("office_register", `Office ${officeId} direct-executive flag drifted.`, intendedInventory);
    }
    const separateBallot = raw.separate_executive_ballot === true;
    const listSelected = isListSelectedAlcalde(officeType);
    if (listSelected && (separateBallot || raw.selection_mode !== "popular_list_result_first_titular" || raw.popularly_elected !== true)) {
      throw new UruguayPreflightError(
        "office_register",
        `Alcalde ${officeId} must stay a list-selected role with no separate executive ballot.`,
        intendedInventory,
      );
    }
    if (officeType === "president" && (!separateBallot || raw.joint_ticket_office_id !== VICE_PRESIDENT_ID)) {
      throw new UruguayPreflightError("office_register", "The President must stay a joint ticket with a separate ballot.", intendedInventory);
    }
    if (officeType === "vice_president" && (separateBallot || raw.joint_ticket_office_id !== PRESIDENT_ID)) {
      throw new UruguayPreflightError("office_register", "The Vice President must stay on the presidential ticket without a separate ballot.", intendedInventory);
    }
    if (officeType === "intendente" && !separateBallot) {
      throw new UruguayPreflightError("office_register", `Intendente ${officeId} lost its separate executive ballot flag.`, intendedInventory);
    }
    if ((officeType === "municipal_council" || officeType === "departmental_council") && separateBallot) {
      throw new UruguayPreflightError("office_register", `Council ${officeId} must not gain a separate executive ballot.`, intendedInventory);
    }
    const geographyId = String(raw.geography_id ?? "");
    if (!geographySeen.has(geographyId)) {
      throw new UruguayPreflightError("geography", `Office ${officeId} geography ${geographyId} is not in the geography file.`, intendedInventory);
    }
    const geography = geographyRows.find((row) => row.geography_id === geographyId);
    if (raw.parent_geography_id !== undefined && String(raw.parent_geography_id ?? "") !== String(geography?.parent_geography_id ?? "")) {
      throw new UruguayPreflightError("geography", `Office ${officeId} parent geography drifted from the geography file.`, intendedInventory);
    }
    if (typeof raw.department_code === "string" && !DEPARTMENT_CODES.has(raw.department_code)) {
      throw new UruguayPreflightError("geography", `Office ${officeId} department code drifted.`, intendedInventory);
    }
    const office: UruguayRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: COUNTRY_ID,
      country_code: COUNTRY_CODE,
      name: String(raw.name_local ?? ""),
      office_type: officeType,
      scope_level: scopeLevel,
      geography_id: geographyId,
      office_status: officeStatus as UruguayRegisterStatus,
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: direct,
      list_selected: listSelected,
      separate_executive_ballot: separateBallot,
      successor_office_id: null,
      predecessor_office_id: null,
      register_index: index,
      raw,
    };
    if (!office.office_id || seen.has(office.office_id) || !office.name.trim()) {
      throw new UruguayPreflightError("duplicate_office", `Duplicate or blank Uruguay office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status) || !SELECTION_MODES.has(office.selection_mode)) {
      throw new UruguayPreflightError("office_status", `Office ${office.office_id} status or selection mode drifted.`, intendedInventory);
    }
    if (raw.popularly_elected !== true) {
      throw new UruguayPreflightError("office_register", `Office ${office.office_id} lost popular election.`, intendedInventory);
    }
    if (!Array.isArray(raw.source_ids) || raw.source_ids.length === 0) {
      throw new UruguayPreflightError("office_register", `Office ${office.office_id} is missing source ids.`, intendedInventory);
    }
    const calendarIds = raw.next_calendar_ids;
    if (!Array.isArray(calendarIds)) {
      throw new UruguayPreflightError("office_register", `Office ${office.office_id} calendar ids drifted.`, intendedInventory);
    }
    if (office.office_status === "historical_only" && calendarIds.length !== 0) {
      throw new UruguayPreflightError("office_register", `Historical office ${office.office_id} must not gain an upcoming calendar row.`, intendedInventory);
    }
    if (office.office_status === "current" && calendarIds.length === 0) {
      throw new UruguayPreflightError("office_register", `Current office ${office.office_id} lost its documentary calendar id.`, intendedInventory);
    }
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new UruguayPreflightError("numeric_tier", `Office ${office.office_id} is missing a draft or schema tier row.`, intendedInventory);
    }
    const expectedTier = expectedDraftTier(office.scope_level);
    if (
      tier.tier !== expectedTier ||
      draft.draft_tier !== expectedTier ||
      tier.draft_tier !== draft.draft_tier ||
      tier.rationale !== draft.basis ||
      !tier.rationale.trim()
    ) {
      throw new UruguayPreflightError("numeric_tier", `Office ${office.office_id} draft tier does not match the schema tier file.`, intendedInventory);
    }
    if (
      tier.justin_approved !== false ||
      draft.justin_approved !== false ||
      draft.applied !== false ||
      tier.applied !== false ||
      draft.status !== "draft_unapproved" ||
      tier.status !== "draft_unapproved"
    ) {
      throw new UruguayPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and draft_unapproved.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new UruguayPreflightError("numeric_tier", `Office ${office.office_id} draft tier ${tier.tier} is not a supplied tier.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    const geoOffices = officeIdsByGeo.get(geographyId) ?? [];
    geoOffices.push(office.office_id);
    officeIdsByGeo.set(geographyId, geoOffices);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("local") !== EXPECTED_COUNTS.draft_tier_local
  ) {
    throw new UruguayPreflightError("numeric_tier", "Uruguay draft tier histogram drifted.", intendedInventory);
  }

  const geographies: UruguayGeography[] = geographyRows.map((geography, geography_index) => ({
    geography_id: geography.geography_id,
    name: geography.name,
    country_id: COUNTRY_ID,
    parent_geography_id: geography.parent_geography_id,
    geography_index,
    office_ids: officeIdsByGeo.get(geography.geography_id) ?? [],
    source_ids: geography.source_ids,
    boundary_status: geography.boundary_status,
  }));
  for (const geography of geographies) {
    if (geography.office_ids.length === 0) {
      throw new UruguayPreflightError("geography", `Geography ${geography.geography_id} has no office.`, intendedInventory);
    }
  }
  const nullParents = geographies.filter((row) => row.parent_geography_id == null);
  if (nullParents.length !== EXPECTED_COUNTS.geographies_without_parent) {
    throw new UruguayPreflightError("geography", "Uruguay null-parent geography count drifted.", intendedInventory);
  }
  const municipalByParent = new Map<string, number>();
  for (const office of offices) {
    if (office.office_status !== "current" || office.scope_level !== "municipal" || office.office_type !== "municipal_council") continue;
    const parent = geographies.find((row) => row.geography_id === office.geography_id)?.parent_geography_id ?? "";
    municipalByParent.set(parent, (municipalByParent.get(parent) ?? 0) + 1);
  }
  if (
    municipalByParent.get(MONTEVIDEO_DEPARTMENT_ID) !== EXPECTED_COUNTS.montevideo_municipalities ||
    municipalByParent.get(CANELONES_DEPARTMENT_ID) !== EXPECTED_COUNTS.canelones_municipalities
  ) {
    throw new UruguayPreflightError("geography", "Montevideo or Canelones municipality count drifted.", intendedInventory);
  }
  const currentMunicipalGeos = new Set(
    offices.filter((office) => office.office_status === "current" && office.scope_level === "municipal").map((office) => office.geography_id),
  );
  for (const geographyId of currentMunicipalGeos) {
    const kinds = offices.filter((office) => office.geography_id === geographyId).map((office) => office.office_type);
    if (kinds.length !== 2 || !kinds.includes("municipal_council") || !kinds.includes("alcalde")) {
      throw new UruguayPreflightError(
        "office_register",
        `Municipality ${geographyId} must stay one council and one list-selected alcalde, not a sixth seat or a separate ballot.`,
        intendedInventory,
      );
    }
  }

  const gapParsed = readJson(gapsItem.absPath);
  if (!Array.isArray(gapParsed) || gapParsed.length !== OPEN_HOLD_IDS.length + RESOLVED_NOTE_IDS.length + 1) {
    throw new UruguayPreflightError("named_holds", "Uruguay research-gap count drifted.", intendedInventory);
  }
  const gaps: UruguayGap[] = gapParsed.map((row, source_index) => {
    const item = row as Record<string, unknown>;
    return {
      gap_id: String(item.gap_id ?? ""),
      title: String(item.title ?? ""),
      status: String(item.status ?? ""),
      treatment: String(item.required_research_or_rule ?? ""),
      justin_approved: item.justin_approved === true,
      source_index,
    };
  });
  const expectedGapOrder = [
    "UY-BF-G01",
    "UY-BF-G02",
    "UY-BF-G03",
    "UY-BF-G04",
    "UY-BF-G05",
    "UY-BF-G06",
    "UY-BF-G07",
    "UY-BF-G08",
    "UY-BF-G09",
    "UY-BF-G10",
    "UY-BF-G11",
    "UY-BF-G12",
    "UY-BF-G13",
    "UY-BF-G14",
    "UY-BF-G15",
    "UY-BF-G16",
    "UY-BF-G17",
    "UY-BF-G18",
    "UY-BF-G19",
    "UY-BF-G20",
    "UY-BF-G21",
    "UY-BF-G22",
  ];
  if (
    gaps.some(
      (gap, index) =>
        gap.gap_id !== expectedGapOrder[index] ||
        gap.status !== GAP_STATUS[gap.gap_id] ||
        gap.justin_approved ||
        !gap.treatment.trim() ||
        !gap.title.trim(),
    )
  ) {
    throw new UruguayPreflightError("named_holds", "Uruguay named holds drifted or a hold was closed.", intendedInventory);
  }

  const crosswalk = readJsonl(crosswalkItem.absPath);
  if (crosswalk.length !== EXPECTED_COUNTS.current_municipalities) {
    throw new UruguayPreflightError("successor_edge", "Uruguay identity-crosswalk row count drifted.", intendedInventory);
  }
  for (const rowUnknown of crosswalk) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.entity_kind !== "geography" || String(row.reason ?? "") !== "Signed election annex; no succession edge") {
      throw new UruguayPreflightError("successor_edge", "Uruguay identity crosswalk must not create a successor edge.", intendedInventory);
    }
    if (!currentMunicipalGeos.has(String(row.record_key ?? ""))) {
      throw new UruguayPreflightError("successor_edge", "Uruguay identity crosswalk record is not a current municipal geography.", intendedInventory);
    }
  }

  const deferred = readJsonl(deferredItem.absPath);
  if (deferred.length !== EXPECTED_COUNTS.deferred_calendar_hold_rows) {
    throw new UruguayPreflightError("named_holds", "Uruguay deferred-calendar hold count drifted.", intendedInventory);
  }
  for (const rowUnknown of deferred) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.result_rows_for_original_date !== 0) {
      throw new UruguayPreflightError("named_holds", "A deferred calendar hold created a result row.", intendedInventory);
    }
  }

  const calendar = readJsonl(calendarItem.absPath);
  if (calendar.length !== EXPECTED_COUNTS.upcoming_calendar_family_rows) {
    throw new UruguayPreflightError("calendar", "Uruguay upcoming-calendar row count drifted.", intendedInventory);
  }
  for (const rowUnknown of calendar) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.applied !== false || row.justin_approved !== false || row.exact_date != null) {
      throw new UruguayPreflightError(
        "calendar",
        "Upcoming calendar rows must stay documentary, unapplied, and without an exact date.",
        intendedInventory,
      );
    }
  }

  const counts = readJson(countsItem.absPath) as Record<string, unknown>;
  const histogram = (counts.draft_tier_histogram ?? {}) as Record<string, unknown>;
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.office_rows !== EXPECTED_COUNTS.offices ||
    counts.current_popular_executive_roles !== EXPECTED_COUNTS.current_popular_executive_roles ||
    counts.current_councils !== EXPECTED_COUNTS.current_councils ||
    counts.current_national_chambers !== EXPECTED_COUNTS.current_national_chambers ||
    counts.current_national_departmental_direct_executives !== EXPECTED_COUNTS.current_national_departmental_direct_executives ||
    counts.current_municipal_list_selected_alcaldes !== EXPECTED_COUNTS.current_list_selected_alcaldes ||
    counts.ep_offices !== 0 ||
    counts.mercosur_offices !== 0 ||
    counts.successor_edges !== 0 ||
    counts.upcoming_calendar_family_rows !== EXPECTED_COUNTS.upcoming_calendar_family_rows ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    histogram.local !== EXPECTED_COUNTS.draft_tier_local
  ) {
    throw new UruguayPreflightError("office_count", "Uruguay counts.json office figures drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.source_records !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new UruguayPreflightError(
      "counts_file",
      "Uruguay counts.json event/result/source figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const metadata = readJson(metadataItem.absPath) as {
    research_coverage_complete?: boolean;
    historical_numeric_coverage_complete?: boolean;
    applied_changes?: number;
    justin_approved?: boolean;
    country_code?: string;
    country_name?: string;
    country_id?: string;
    full_pack_zip_sha256?: string;
    open_holds?: string[];
    documented_not_implemented?: string[];
    first_import?: { events?: number; results?: number; sources?: number };
    counts?: { events_omitted?: number; results_omitted?: number; source_records_omitted?: number };
  };
  if (
    metadata.research_coverage_complete === true ||
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
    JSON.stringify(metadata.open_holds ?? []) !== JSON.stringify(OPEN_HOLD_IDS) ||
    JSON.stringify(metadata.documented_not_implemented ?? []) !== JSON.stringify([DOCUMENTED_NOT_IMPLEMENTED_ID])
  ) {
    throw new UruguayPreflightError("coverage", "Uruguay metadata must stay unapproved with research coverage incomplete.", intendedInventory);
  }
  if (
    metadata.counts?.events_omitted !== FULL_PACK_DOCUMENTED_EVENTS ||
    metadata.counts?.results_omitted !== FULL_PACK_DOCUMENTED_RESULTS ||
    metadata.counts?.source_records_omitted !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new UruguayPreflightError(
      "counts_file",
      "Uruguay metadata omitted-total notes drifted. Publication still does not emit those counters.",
      intendedInventory,
    );
  }
  const validation = readJson(validationItem.absPath) as {
    validation_status?: string;
    applied_changes?: number;
    justin_approved?: boolean;
    current_offices?: number;
    historical_only_offices?: number;
    events?: number;
    results?: number;
    sources?: number;
  };
  if (
    validation.validation_status !== "pass" ||
    validation.applied_changes !== 0 ||
    validation.justin_approved !== false ||
    validation.current_offices !== EXPECTED_COUNTS.current_offices ||
    validation.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    validation.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    validation.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    validation.sources !== FULL_PACK_DOCUMENTED_SOURCES
  ) {
    throw new UruguayPreflightError(
      "coverage",
      "Uruguay validation-report.json must stay the pre-import pass receipt. Documentary events, results, and sources are not published.",
      intendedInventory,
    );
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes("UY-BF-G03") || !acceptance.includes("UY-BF-G22") || !acceptance.includes("UY-BF-G06") || !acceptance.includes("0 events")) {
    throw new UruguayPreflightError("coverage", "Uruguay acceptance receipt drifted from the open holds or the zero-event import.", intendedInventory);
  }
  const manifest = readJson(manifestItem.absPath) as {
    country_id?: string;
    applied_changes?: number;
    ui_changes?: number;
    ep_offices?: number;
    successor_edges?: number;
    calendar_convocatoria_verified?: boolean;
    prior_screened_out_filter_rescinded_for_research?: boolean;
  };
  if (
    manifest.country_id !== COUNTRY_ID ||
    manifest.applied_changes !== 0 ||
    manifest.ui_changes !== 0 ||
    manifest.ep_offices !== 0 ||
    manifest.successor_edges !== 0 ||
    manifest.calendar_convocatoria_verified !== false ||
    manifest.prior_screened_out_filter_rescinded_for_research !== true
  ) {
    throw new UruguayPreflightError("coverage", "Uruguay manifest must stay an unapplied research receipt.", intendedInventory);
  }

  const currentDirect = offices.filter((office) => office.office_status === "current" && office.direct_executive).length;
  const alcaldes = offices.filter((office) => office.list_selected).length;
  const separateBallots = offices.filter((office) => office.separate_executive_ballot).length;
  const ep = offices.filter((office) => office.raw.ep_office === true || /european parliament|mercosur/i.test(`${office.office_id} ${office.office_type} ${office.name}`)).length;
  if (currentDirect !== EXPECTED_COUNTS.current_popular_executive_roles || alcaldes !== EXPECTED_COUNTS.current_list_selected_alcaldes || separateBallots !== EXPECTED_COUNTS.separate_executive_ballot_offices || ep !== 0) {
    throw new UruguayPreflightError("office_count", "Uruguay executive, alcalde, or excluded-scope count drifted.", intendedInventory);
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
    deferredCalendarHoldRows: deferred.length,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}

function hasParentCycle(geographies: Array<{ geography_id: string; parent_geography_id: string | null }>): boolean {
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
