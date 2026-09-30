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
  CALENDAR_HOLD_IDS,
  COMUNA_REGISTER_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTS_RELATIVE,
  canonical,
  CURRENT_NAMESPACE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_FILES,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_CONVENTION_ID,
  HISTORICAL_COUNCIL_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PINNED_INPUTS,
  PRESIDENT_ID,
  REGION_REGISTER_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  SHARED_COMUNA_KEY,
  SHARED_MAYOR_ID,
  SHARED_MUNICIPAL_KEY,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VALIDATION_RELATIVE,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  fingerprintSha256,
  inputKindFor,
  isDirectExecutive,
  municipalGeographyId,
  officeTypeFor,
  regionGeographyId,
  releaseIdFor,
  sha256Hex,
  type ChileDraftTier,
  type ChileRegisterStatus,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type ChileTierOffice = {
  office_id: string;
  tier: ChileDraftTier;
  draft_tier: ChileDraftTier;
  status: string;
  justin_approved: boolean;
  applied: boolean;
  rationale: string;
  office_family: string;
  current: boolean;
  historical_only: boolean;
  tier_index: number;
};

export type ChileDraftOffice = {
  office_id: string;
  tier: ChileDraftTier;
  justin_approved: boolean;
  production_applied: boolean;
  rationale: string;
};

export type ChileRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_family: string;
  office_type: string;
  draft_tier: ChileDraftTier;
  geography_id: string;
  geography_key: string;
  office_status: ChileRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  seat_total: number | null;
  successor_office_id: null;
  predecessor_office_id: null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type ChileGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: null;
  geography_index: number;
  office_ids: string[];
  source_register_index: number;
  source_path: string;
  region_code: string | null;
  comuna_keys: string[];
};

export type ChileGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
  source_index: number;
};

export type ChileInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: ChileTierOffice[];
  drafts: ChileDraftOffice[];
  offices: ChileRegisterOffice[];
  geographies: ChileGeography[];
  gaps: ChileGap[];
  successorEdges: number;
  parentsLeftNull: number;
  upcomingCalendarRows: number;
  comunas: number;
  municipalAdministrations: number;
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

export class ChilePreflightError extends Error {
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
  "name",
  "office_family",
  "draft_tier",
  "geography_key",
  "current",
  "historical_only",
  "selection_mode",
  "seat_total",
  "direct_popular_era_start",
  "disposition",
  "production_state",
  "source_ids",
  "upcoming_calendar_id",
]);

const DRAFT_TIERS = new Set<string>(["national_context", "regional", "municipal"]);
const FORBIDDEN_SCOPE =
  /european parliament|\bmercosur\b|\bmercosul\b|\bandean\b|parlamento andino|\bintendente\b/i;

function readJson(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, "utf8")) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseGaps(markdown: string): ChileGap[] {
  const rows: Array<{ title: string; treatment: string }> = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|") || line.startsWith("|---") || line.startsWith("| Gate")) continue;
    const parts = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((part) => part.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("Chile research-gap table row drifted");
    }
    rows.push({ title: parts[0], treatment: parts[1] });
  }
  if (rows.length !== 21) throw new Error(`Chile research-gap table has ${rows.length} rows, not 21`);
  return OPEN_HOLD_IDS.map((gapId, source_index) => {
    const row = rows[source_index];
    if (!row) throw new Error(`Missing Chile hold row for ${gapId}`);
    return {
      gap_id: gapId,
      title: row.title,
      status: GAP_STATUS[gapId] ?? "open_research_hold",
      treatment: row.treatment,
      justin_approved: false,
      source_index,
    };
  });
}

export function scanChileInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): ChileInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new ChilePreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new ChilePreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new ChilePreflightError(
        "omitted_bytes_present",
        `Omitted Chile pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new ChilePreflightError(
      "omitted_bytes_present",
      "data/research/chile is git-tracked. The importer does not adopt omitted research bytes.",
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
      throw new ChilePreflightError("package_inventory", "Chile git-tracked pack does not match the pinned inputs.", {
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
    events_file_not_projected: "docs/phase1/chile/data/events.jsonl",
    results_file_not_projected: "docs/phase1/chile/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/chile/sources",
    upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
    country_code: COUNTRY_CODE,
    prior_coverage_status: "screened_out",
    coverage_status: "partial",
    production_approved: false,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new ChilePreflightError("missing_tier", `Chile tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new ChilePreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new ChilePreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Chile inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new ChilePreflightError("tier_hash_mismatch", `Chile tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const comunaItem = tracked.find((item) => item.input_path === COMUNA_REGISTER_RELATIVE);
  const regionItem = tracked.find((item) => item.input_path === REGION_REGISTER_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  const calendarItem = tracked.find((item) => item.input_path === UPCOMING_CALENDAR_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !comunaItem ||
    !regionItem ||
    !countsItem ||
    !gapsItem ||
    !validationItem ||
    !acceptanceItem ||
    !calendarItem
  ) {
    throw new ChilePreflightError(
      "package_inventory",
      "Chile register, tiers, comunas, regions, counts, holds, calendar, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: ChileTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!isRecord(parsed) || !Array.isArray(parsed.classifications)) throw new Error("tier file has no classifications array");
    if (parsed.status !== "draft_research_accept_with_holds") throw new Error("tier status drifted");
    if (parsed.country_id !== COUNTRY_ID || parsed.country_code !== COUNTRY_CODE) throw new Error("tier country drifted");
    if (parsed.applied_changes !== 0) throw new Error("tier applied_changes drifted");
    const approval = isRecord(parsed.approval) ? parsed.approval : {};
    if (approval.justin_approved !== false || approval.production_applied !== false) throw new Error("tier approval drifted");
    const policy = isRecord(parsed.importer_policy) ? parsed.importer_policy : {};
    if (policy.publish_events !== 0 || policy.publish_results !== 0 || policy.publish_sources !== 0 || policy.slim_land !== true) {
      throw new Error("tier importer policy drifted");
    }
    tierRows = parsed.classifications.map((row, tier_index) => {
      if (!isRecord(row)) throw new Error(`tier row ${tier_index} is not an object`);
      return {
        office_id: String(row.office_id ?? ""),
        tier: String(row.tier ?? "") as ChileDraftTier,
        draft_tier: String(row.draft_tier ?? "") as ChileDraftTier,
        status: String(row.status ?? ""),
        justin_approved: row.justin_approved === true,
        applied: row.applied === true,
        rationale: String(row.basis ?? ""),
        office_family: String(row.office_family ?? ""),
        current: row.current === true,
        historical_only: row.historical_only === true,
        tier_index,
      };
    });
  } catch (error) {
    throw new ChilePreflightError(
      "tier_unreadable",
      `Chile tier file is not a valid tier document: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new ChilePreflightError("office_count", `Chile tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJson(draftItem.absPath);
  if (!Array.isArray(draftParsed) || draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new ChilePreflightError("office_count", "Chile draft_tiers.json row count drifted.", intendedInventory);
  }
  const drafts: ChileDraftOffice[] = draftParsed.map((row) => {
    if (!isRecord(row)) throw new ChilePreflightError("office_register", "Chile draft tier row is not an object.", intendedInventory);
    return {
      office_id: String(row.office_id ?? ""),
      tier: String(row.tier ?? "") as ChileDraftTier,
      justin_approved: row.justin_approved === true,
      production_applied: row.production_applied === true,
      rationale: String(row.rationale ?? ""),
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, ChileTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new ChilePreflightError("duplicate_office", `Duplicate Chile tier ${tier.office_id}.`, intendedInventory);
    }
    if (!DRAFT_TIERS.has(tier.tier) || tier.tier !== tier.draft_tier) {
      throw new ChilePreflightError("numeric_tier", `Chile tier ${tier.office_id} draft_tier and tier differ.`, intendedInventory);
    }
    if (tier.justin_approved || tier.applied || tier.status !== "draft_unapproved" || !tier.rationale.trim()) {
      throw new ChilePreflightError("review_status", `Chile tier ${tier.office_id} must stay draft_unapproved.`, intendedInventory);
    }
    const draft = draftById.get(tier.office_id);
    if (!draft || draft.tier !== tier.tier || draft.justin_approved || draft.production_applied) {
      throw new ChilePreflightError("review_status", `Chile draft tier ${tier.office_id} does not match the schema row.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const regionParsed = readJson(regionItem.absPath);
  if (!isRecord(regionParsed)) {
    throw new ChilePreflightError("geography", "Chile region register is not an object.", intendedInventory);
  }
  const regionNames = new Map<string, string>();
  for (const [code, name] of Object.entries(regionParsed)) {
    if (!/^\d{2}$/.test(code) || typeof name !== "string" || !name.trim()) {
      throw new ChilePreflightError("geography", `Chile region ${code} drifted.`, intendedInventory);
    }
    regionNames.set(code, name);
  }
  if (regionNames.size !== 16) {
    throw new ChilePreflightError("geography", `Chile region count ${regionNames.size} is not 16.`, intendedInventory);
  }

  const comunaParsed = readJson(comunaItem.absPath);
  if (!Array.isArray(comunaParsed)) {
    throw new ChilePreflightError("geography", "Chile comuna register is not an array.", intendedInventory);
  }
  const comunasByMunicipal = new Map<string, string[]>();
  const comunaKeys = new Set<string>();
  for (const [index, raw] of comunaParsed.entries()) {
    if (!isRecord(raw)) throw new ChilePreflightError("geography", `Comuna row ${index} is not an object.`, intendedInventory);
    const comunaKey = String(raw.comuna_key ?? "");
    const municipalKey = String(raw.municipal_key ?? "");
    const regionCode = String(raw.region_code ?? "");
    const comunaName = String(raw.comuna_name ?? "");
    if (!/^[a-z0-9]+$/.test(comunaKey) || !/^[a-z0-9]+$/.test(municipalKey) || !regionNames.has(regionCode) || !comunaName.trim()) {
      throw new ChilePreflightError("geography", `Comuna row ${index} drifted.`, intendedInventory);
    }
    if (comunaKeys.has(comunaKey)) {
      throw new ChilePreflightError("geography", `Duplicate comuna ${comunaKey}.`, intendedInventory);
    }
    comunaKeys.add(comunaKey);
    const list = comunasByMunicipal.get(municipalKey) ?? [];
    list.push(comunaKey);
    comunasByMunicipal.set(municipalKey, list);
  }
  if (comunaKeys.size !== EXPECTED_COUNTS.comunas || comunasByMunicipal.size !== EXPECTED_COUNTS.municipal_administrations) {
    throw new ChilePreflightError("geography", "Chile comuna or municipal-administration count drifted.", intendedInventory);
  }
  const shared = comunasByMunicipal.get(SHARED_MUNICIPAL_KEY) ?? [];
  if (shared.length !== 2 || !shared.includes(SHARED_COMUNA_KEY) || !shared.includes(SHARED_MUNICIPAL_KEY)) {
    throw new ChilePreflightError("geography", "Cabo de Hornos and Antártica must share one municipal administration.", intendedInventory);
  }
  for (const [key, members] of comunasByMunicipal) {
    if (key !== SHARED_MUNICIPAL_KEY && members.length !== 1) {
      throw new ChilePreflightError("geography", `Municipal key ${key} groups more than one comuna.`, intendedInventory);
    }
  }

  const registerParsed = readJson(registerItem.absPath);
  if (!Array.isArray(registerParsed) || registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new ChilePreflightError(
      "office_count",
      `Chile office register has ${Array.isArray(registerParsed) ? registerParsed.length : "no"} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: ChileRegisterOffice[] = [];
  const seen = new Set<string>();
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!isRecord(rawUnknown)) {
      throw new ChilePreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new ChilePreflightError("office_register", `Refusing undocumented Chile office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (seen.has(officeId)) {
      throw new ChilePreflightError("duplicate_office", `Duplicate Chile office ${officeId}.`, intendedInventory);
    }
    seen.add(officeId);
    if (raw.country_id !== COUNTRY_ID || raw.country_code !== COUNTRY_CODE) {
      throw new ChilePreflightError("office_register", `Office ${officeId} is outside Chile CL scope.`, intendedInventory);
    }
    if (raw.production_state !== "not_applied" || raw.selection_mode !== "popular_direct") {
      throw new ChilePreflightError("review_status", `Office ${officeId} must stay unapplied and popular.`, intendedInventory);
    }
    const officeFamily = String(raw.office_family ?? "");
    const name = String(raw.name ?? "");
    assertAllowedOfficeIdentity(officeId, officeFamily, name);
    const current = raw.current === true;
    const historicalOnly = raw.historical_only === true;
    if (current === historicalOnly) {
      throw new ChilePreflightError("office_register", `Office ${officeId} must be current or historical, not both.`, intendedInventory);
    }
    const tier = tierById.get(officeId);
    if (!tier || tier.office_family !== officeFamily || tier.current !== current || tier.historical_only !== historicalOnly) {
      throw new ChilePreflightError("office_register", `Office ${officeId} does not match its tier row.`, intendedInventory);
    }
    if (String(raw.draft_tier ?? "") !== tier.draft_tier) {
      throw new ChilePreflightError("numeric_tier", `Office ${officeId} draft tier drifted from the schema.`, intendedInventory);
    }
    const officeType = officeTypeFor(officeFamily, historicalOnly);
    const direct = isDirectExecutive(officeType);
    const geographyKey = String(raw.geography_key ?? "");
    let geographyId: string;
    if (tier.draft_tier === "national_context") {
      if (geographyKey !== "chile") {
        throw new ChilePreflightError("geography", `National office ${officeId} must stay on the Chile geography.`, intendedInventory);
      }
      geographyId = COUNTRY_GEOGRAPHY_ID;
    } else if (tier.draft_tier === "regional") {
      if (!regionNames.has(geographyKey)) {
        throw new ChilePreflightError("geography", `Regional office ${officeId} has no region.`, intendedInventory);
      }
      geographyId = regionGeographyId(geographyKey);
    } else {
      if (!comunasByMunicipal.has(geographyKey)) {
        throw new ChilePreflightError("geography", `Municipal office ${officeId} has no administration.`, intendedInventory);
      }
      geographyId = municipalGeographyId(geographyKey);
    }
    if (officeType === "municipal_mayor" && raw.seat_total !== 1) {
      throw new ChilePreflightError("office_register", `Mayor ${officeId} must stay a single-seat direct executive.`, intendedInventory);
    }
    if (officeType === "president" && raw.seat_total !== 1) {
      throw new ChilePreflightError("office_register", "The president must stay a single seat.", intendedInventory);
    }
    if (officeType === "regional_governor" && raw.seat_total !== 1) {
      throw new ChilePreflightError("office_register", `Governor ${officeId} must stay a single seat.`, intendedInventory);
    }
    if (officeType === "chamber_of_deputies" && raw.seat_total !== 155) {
      throw new ChilePreflightError("office_register", "The Chamber of Deputies must stay 155 seats.", intendedInventory);
    }
    if (officeType === "senate" && raw.seat_total !== 50) {
      throw new ChilePreflightError("office_register", "The Senate must stay 50 seats.", intendedInventory);
    }
    if ((officeType === "regional_council" || officeType === "municipal_council") && raw.seat_total != null) {
      throw new ChilePreflightError("office_register", `Council ${officeId} must not gain an invented seat total.`, intendedInventory);
    }
    const disposition = String(raw.disposition ?? "");
    if (historicalOnly && disposition !== "historical_research_accept") {
      throw new ChilePreflightError("office_register", `Historical office ${officeId} disposition drifted.`, intendedInventory);
    }
    if (!historicalOnly && disposition !== "research_accept") {
      throw new ChilePreflightError("office_register", `Current office ${officeId} disposition drifted.`, intendedInventory);
    }
    offices.push({
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: COUNTRY_ID,
      country_code: COUNTRY_CODE,
      name,
      office_family: officeFamily,
      office_type: officeType,
      draft_tier: tier.draft_tier,
      geography_id: geographyId,
      geography_key: geographyKey,
      office_status: historicalOnly ? "historical_only" : "current",
      selection_mode: "popular_direct",
      direct_executive: direct,
      seat_total: typeof raw.seat_total === "number" ? raw.seat_total : null,
      successor_office_id: null,
      predecessor_office_id: null,
      register_index: index,
      raw,
    });
  }
  if (offices.length !== tierById.size || [...tierById.keys()].some((id) => !seen.has(id))) {
    throw new ChilePreflightError("office_count", "Chile register and tier office ids diverged.", intendedInventory);
  }

  const geographies: ChileGeography[] = [];
  const countryOffices = offices.filter((office) => office.geography_id === COUNTRY_GEOGRAPHY_ID);
  geographies.push({
    geography_id: COUNTRY_GEOGRAPHY_ID,
    name: "Chile",
    country_id: COUNTRY_ID,
    parent_geography_id: null,
    geography_index: 0,
    office_ids: countryOffices.map((office) => office.office_id),
    source_register_index: countryOffices[0]?.register_index ?? 0,
    source_path: OFFICE_REGISTER_RELATIVE,
    region_code: null,
    comuna_keys: [],
  });
  const regionCodes = [...regionNames.keys()].sort();
  for (const code of regionCodes) {
    const geographyId = regionGeographyId(code);
    const members = offices.filter((office) => office.geography_id === geographyId);
    if (members.length !== 2) {
      throw new ChilePreflightError("geography", `Region ${code} must have one governor and one CORE.`, intendedInventory);
    }
    geographies.push({
      geography_id: geographyId,
      name: regionNames.get(code) ?? code,
      country_id: COUNTRY_ID,
      parent_geography_id: null,
      geography_index: geographies.length,
      office_ids: members.map((office) => office.office_id),
      source_register_index: members[0]?.register_index ?? 0,
      source_path: REGION_REGISTER_RELATIVE,
      region_code: code,
      comuna_keys: [],
    });
  }
  const municipalKeys = [...comunasByMunicipal.keys()].sort();
  for (const key of municipalKeys) {
    const geographyId = municipalGeographyId(key);
    const members = offices.filter((office) => office.geography_id === geographyId);
    if (members.length !== 2) {
      throw new ChilePreflightError("geography", `Administration ${key} must have one mayor and one council.`, intendedInventory);
    }
    const mayor = members.find((office) => office.office_type === "municipal_mayor");
    const place = mayor?.name.replace(/^Alcalde — /, "") ?? key;
    if (!mayor || place === mayor.name) {
      throw new ChilePreflightError("geography", `Administration ${key} is missing its mayor name.`, intendedInventory);
    }
    geographies.push({
      geography_id: geographyId,
      name: place,
      country_id: COUNTRY_ID,
      parent_geography_id: null,
      geography_index: geographies.length,
      office_ids: members.map((office) => office.office_id),
      source_register_index: mayor.register_index,
      source_path: OFFICE_REGISTER_RELATIVE,
      region_code: null,
      comuna_keys: [...(comunasByMunicipal.get(key) ?? [])].sort(),
    });
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new ChilePreflightError("geography", `Chile geography count ${geographies.length} drifted.`, intendedInventory);
  }
  if (geographies.some((row) => row.parent_geography_id != null)) {
    throw new ChilePreflightError("geography", "Chile geographies must not gain invented parents.", intendedInventory);
  }

  const gaps = parseGaps(readFileSync(gapsItem.absPath, "utf8"));
  if (gaps.length !== EXPECTED_COUNTS.named_open_holds || gaps.some((gap) => gap.justin_approved || gap.status !== "open_research_hold")) {
    throw new ChilePreflightError("named_holds", "Chile named holds must stay the open CL-BJ-G01–G20 set.", intendedInventory);
  }

  const calendarParsed = readJson(calendarItem.absPath);
  if (!Array.isArray(calendarParsed) || calendarParsed.length !== EXPECTED_COUNTS.upcoming_calendar_rows) {
    throw new ChilePreflightError("calendar", "Chile upcoming calendar row count drifted.", intendedInventory);
  }
  const calendarIds = new Set<string>();
  for (const row of calendarParsed) {
    if (!isRecord(row)) throw new ChilePreflightError("calendar", "Chile calendar row is not an object.", intendedInventory);
    const calendarId = String(row.calendar_id ?? "");
    if (!calendarId || calendarIds.has(calendarId)) {
      throw new ChilePreflightError("calendar", `Chile calendar id ${calendarId} drifted.`, intendedInventory);
    }
    calendarIds.add(calendarId);
    if (row.exact_date != null || row.production_applied !== false) {
      throw new ChilePreflightError("calendar", `Chile calendar ${calendarId} must keep exact_date null and stay unapplied.`, intendedInventory);
    }
  }
  for (const holdId of CALENDAR_HOLD_IDS) {
    if (!calendarIds.has(holdId)) {
      throw new ChilePreflightError("calendar", `Chile calendar hold ${holdId} is missing.`, intendedInventory);
    }
  }

  const counts = readJson(countsItem.absPath);
  if (!isRecord(counts)) throw new ChilePreflightError("counts_file", "Chile Count_Summary.json drifted.", intendedInventory);
  const family = isRecord(counts.current_family_counts) ? counts.current_family_counts : {};
  const histogram = isRecord(counts.draft_tier_histogram) ? counts.draft_tier_histogram : {};
  const approvals = isRecord(counts.justin_approvals) ? counts.justin_approvals : {};
  if (
    counts.country_id !== COUNTRY_ID ||
    counts.country_code !== COUNTRY_CODE ||
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.total_offices !== EXPECTED_COUNTS.offices ||
    counts.national_current !== 3 ||
    counts.regional_current !== EXPECTED_COUNTS.schema_regional ||
    counts.municipal_current !== EXPECTED_COUNTS.schema_municipal ||
    counts.municipal_administrations !== EXPECTED_COUNTS.municipal_administrations ||
    counts.comunas !== EXPECTED_COUNTS.comunas ||
    counts.direct_executive_current !== EXPECTED_COUNTS.current_direct_executives ||
    counts.council_current !== EXPECTED_COUNTS.current_councils ||
    counts.national_legislative_current !== EXPECTED_COUNTS.current_national_chambers ||
    counts.EP_offices !== 0 ||
    counts.provincial_elected_offices !== 0 ||
    counts.appointed_era_popular_offices !== 0 ||
    counts.successor_edges !== 0 ||
    counts.research_coverage_complete !== false ||
    counts.applied_changes !== 0 ||
    counts.current_office_inventory_complete !== true ||
    family.president !== 1 ||
    family.deputies !== 1 ||
    family.senate !== 1 ||
    family.governor !== 16 ||
    family.core !== 16 ||
    family.mayor !== 345 ||
    family.council !== 345 ||
    histogram.national_context !== 5 ||
    histogram.regional !== 32 ||
    histogram.municipal !== 690 ||
    approvals.register !== false ||
    approvals.tiers !== false ||
    approvals.history !== false ||
    approvals.calendar !== false ||
    approvals.production !== false
  ) {
    throw new ChilePreflightError("office_count", "Chile Count_Summary.json office figures drifted.", intendedInventory);
  }
  if (
    counts.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    counts.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    counts.source_files !== FULL_PACK_DOCUMENTED_SOURCE_FILES
  ) {
    throw new ChilePreflightError(
      "counts_file",
      "Chile Count_Summary.json event/result/source figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const validation = readJson(validationItem.absPath);
  if (!isRecord(validation) || validation.passed !== true || validation.applied_changes !== 0 || validation.checks_passed !== 58) {
    throw new ChilePreflightError("coverage", "Chile Validation_Report.json must stay the pre-import pass receipt.", intendedInventory);
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes("ACCEPT WITH HOLDS") || !acceptance.includes("CL-BJ-G01") || !acceptance.includes("CL-BJ-G20")) {
    throw new ChilePreflightError("coverage", "Chile acceptance receipt drifted from the open holds.", intendedInventory);
  }
  if (acceptance.includes("[x]") || !acceptance.includes("applied_changes=0")) {
    throw new ChilePreflightError("coverage", "Chile acceptance must stay unchecked with applied_changes 0.", intendedInventory);
  }

  const current = offices.filter((office) => office.office_status === "current").length;
  const historical = offices.filter((office) => office.office_status === "historical_only").length;
  const currentMayors = offices.filter((office) => office.office_type === "municipal_mayor").length;
  const currentCouncils = offices.filter((office) => office.office_type === "municipal_council").length;
  const currentGovernors = offices.filter((office) => office.office_type === "regional_governor").length;
  const currentCore = offices.filter((office) => office.office_type === "regional_council").length;
  const currentDirect = offices.filter((office) => office.office_status === "current" && office.direct_executive).length;
  const historicalDirect = offices.filter((office) => office.office_status === "historical_only" && office.direct_executive).length;
  const excluded = offices.filter((office) =>
    FORBIDDEN_SCOPE.test(`${office.office_id} ${office.office_type} ${office.name}`),
  ).length;
  if (
    current !== EXPECTED_COUNTS.current_offices ||
    historical !== EXPECTED_COUNTS.historical_offices ||
    currentMayors !== EXPECTED_COUNTS.current_mayors ||
    currentCouncils !== EXPECTED_COUNTS.current_municipal_councils ||
    currentGovernors !== EXPECTED_COUNTS.current_governors ||
    currentCore !== EXPECTED_COUNTS.current_core ||
    currentDirect !== EXPECTED_COUNTS.current_direct_executives ||
    historicalDirect !== EXPECTED_COUNTS.historical_direct_executives ||
    excluded !== 0 ||
    offices.filter((office) => office.office_id === PRESIDENT_ID).length !== 1 ||
    offices.filter((office) => office.office_id === SHARED_MAYOR_ID).length !== 1 ||
    offices.filter((office) => office.office_id === HISTORICAL_CONVENTION_ID && office.office_status === "historical_only").length !== 1 ||
    offices.filter((office) => office.office_id === HISTORICAL_COUNCIL_ID && office.office_status === "historical_only").length !== 1 ||
    offices.some((office) => office.geography_key === SHARED_COMUNA_KEY)
  ) {
    throw new ChilePreflightError("office_count", "Chile executive, council, or excluded-scope count drifted.", intendedInventory);
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
    upcomingCalendarRows: calendarParsed.length,
    comunas: comunaKeys.size,
    municipalAdministrations: comunasByMunicipal.size,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}
