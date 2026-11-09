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
  ANDEAN_ID,
  COUNTS_RELATIVE,
  canonical,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  DEPUTIES_ID,
  DOCS_PREFIX,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_ZIP_SHA256_ABBREVIATION,
  HISTORICAL_CONGRESS_ID,
  LINEAGE_ID,
  MANIFEST_RELATIVE,
  METHOD_VERSION,
  MUNICIPAL_ROSTER_RELATIVE,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  PHASE2_OFFICE_COUNT,
  PHASE2_TIER_PATH,
  PHASE2_TIER_SHA256,
  PINNED_INPUTS,
  PRESIDENT_ID,
  REGIONAL_ROSTER_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  SANGANI_COUNCIL_ID,
  SANGANI_GEOGRAPHY_ID,
  SANGANI_MAYOR_ID,
  SANGANI_UBIGEO,
  SAMPLE_REGION_GEOGRAPHY_ID,
  SCHEMA_VERSION,
  SENATE_ID,
  SUCCESSOR_EDGES_RELATIVE,
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
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type PeruDraftTier,
  type PeruRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type PeruTierOffice = {
  office_id: string;
  tier: PeruDraftTier;
  draft_tier: PeruDraftTier;
  disposition: "research_accept" | "hold";
  review_status: "needs_review";
  justin_approved: false;
  production_approved: false;
  tier_index: number;
  raw: Record<string, unknown>;
};

export type PeruRegisterOffice = {
  office_id: string;
  name: string;
  office_family: string;
  office_type: string;
  geography_id: string;
  office_status: PeruRegisterStatus;
  disposition: "research_accept" | "hold";
  direct_executive: boolean;
  register_index: number;
  raw: Record<string, unknown>;
};

export type PeruGeography = {
  geography_id: string;
  name: string;
  parent_geography_id: null;
  source_path: string;
  source_pointer: string;
};

export type PeruGap = {
  gap_id: string;
  title: string;
  status: string;
  detail: string;
  justin_approved: false;
  source_index: number;
};

export type PeruInventory = {
  root: string;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  tiers: PeruTierOffice[];
  offices: PeruRegisterOffice[];
  geographies: PeruGeography[];
  gaps: PeruGap[];
  successorEdges: number;
  parentsLeftNull: number;
  upcomingCalendarRows: number;
  municipalities: number;
  regions: number;
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

export class PeruPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

function readJson(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, "utf8")) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(row: Record<string, unknown>, key: string, where: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${where} is missing ${key}`);
  return value;
}

export function scanPeruInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): PeruInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new PeruPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new PeruPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new PeruPreflightError(
        "omitted_bytes_present",
        `Omitted Peru pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }

  const phase2Abs = path.join(root, PHASE2_TIER_PATH);
  if (!existsSync(phase2Abs) || sha256Hex(readFileSync(phase2Abs)) !== PHASE2_TIER_SHA256) {
    throw new PeruPreflightError(
      "phase2_tier_missing",
      `Phase 2 Peru classifier must stay at ${PHASE2_TIER_PATH} with SHA-256 ${PHASE2_TIER_SHA256}.`,
      {},
    );
  }
  const phase2 = readJson(phase2Abs);
  if (!isRecord(phase2) || !Array.isArray(phase2.classifications) || phase2.classifications.length !== PHASE2_OFFICE_COUNT) {
    throw new PeruPreflightError("phase2_tier_missing", "Phase 2 Peru classifier office count drifted.", {});
  }
  if (phase2.lineage_id !== "latin-america-fe5e91689def" || phase2.status !== "draft_for_human_review") {
    throw new PeruPreflightError("phase2_tier_missing", "Phase 2 Peru classifier status drifted.", {});
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, DOCS_PREFIX).filter((rel) => rel !== PHASE2_TIER_PATH);
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new PeruPreflightError("package_inventory", "Peru git-tracked pack does not match the pinned inputs.", {
        missing,
        extra,
      });
    }
    if (!gitTracked(root, PHASE2_TIER_PATH).includes(PHASE2_TIER_PATH)) {
      throw new PeruPreflightError("phase2_tier_missing", "Phase 2 Peru classifier is not git-tracked.", {});
    }
  }

  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const abs = rel === TIER_PATH && options.tierPath ? tierAbs : path.join(root, rel);
    const bytes = readFileSync(abs);
    tracked.push({
      input_path: rel,
      input_kind: inputKindFor(rel),
      sha256: sha256Hex(bytes),
      byte_count: bytes.length,
      absPath: abs,
    });
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
    tier: {
      input_path: TIER_PATH,
      sha256: tierItem?.sha256 ?? null,
    },
    overrides: [],
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: "events.jsonl",
    results_file_not_projected: "results.jsonl",
    upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
    full_zip_sha256_abbreviation: FULL_ZIP_SHA256_ABBREVIATION,
    phase2_tier_path: PHASE2_TIER_PATH,
    phase2_tier_sha256: PHASE2_TIER_SHA256,
    phase2_office_count: PHASE2_OFFICE_COUNT,
    country_code: COUNTRY_CODE,
    coverage_status: "partial",
    production_approved: false,
  };

  if (!tierItem) {
    throw new PeruPreflightError("missing_tier", `Peru tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new PeruPreflightError("tier_hash_mismatch", `Peru tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new PeruPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
  }

  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const registerItem = byPath.get(OFFICE_REGISTER_RELATIVE);
  const rosterItem = byPath.get(MUNICIPAL_ROSTER_RELATIVE);
  const regionItem = byPath.get(REGIONAL_ROSTER_RELATIVE);
  const gapsItem = byPath.get(RESEARCH_GAPS_RELATIVE);
  const countsItem = byPath.get(COUNTS_RELATIVE);
  const calendarItem = byPath.get(UPCOMING_CALENDAR_RELATIVE);
  const manifestItem = byPath.get(MANIFEST_RELATIVE);
  const validationItem = byPath.get(VALIDATION_RELATIVE);
  const successorItem = byPath.get(SUCCESSOR_EDGES_RELATIVE);
  if (
    !registerItem ||
    !rosterItem ||
    !regionItem ||
    !gapsItem ||
    !countsItem ||
    !calendarItem ||
    !manifestItem ||
    !validationItem ||
    !successorItem
  ) {
    throw new PeruPreflightError("package_inventory", "Peru pack is missing a required register.", intendedInventory);
  }
  if (registerItem.sha256 !== "b25bbc2b8e60f2144715c536e3c8c7811606420e351950b053aa657bad9125e3") {
    throw new PeruPreflightError("package_hash_mismatch", "Peru office register hash drifted.", intendedInventory);
  }

  const tierParsed = readJson(tierItem.absPath);
  const registerParsed = readJson(registerItem.absPath);
  const rosterParsed = readJson(rosterItem.absPath);
  const regionParsed = readJson(regionItem.absPath);
  const gapsParsed = readJson(gapsItem.absPath);
  const countsParsed = readJson(countsItem.absPath);
  const calendarParsed = readJson(calendarItem.absPath);
  const manifestParsed = readJson(manifestItem.absPath);
  const validationParsed = readJson(validationItem.absPath);
  const successorParsed = readJson(successorItem.absPath);
  if (!Array.isArray(tierParsed) || !Array.isArray(registerParsed) || !Array.isArray(rosterParsed) || !Array.isArray(regionParsed)) {
    throw new PeruPreflightError("office_count", "Peru registers must stay arrays.", intendedInventory);
  }
  if (!Array.isArray(gapsParsed) || !Array.isArray(calendarParsed) || !Array.isArray(successorParsed)) {
    throw new PeruPreflightError("office_count", "Peru gaps, calendar, or successor file drifted.", intendedInventory);
  }
  if (successorParsed.length !== 0) {
    throw new PeruPreflightError("successor_edges", "Peru successor edges must stay empty.", intendedInventory);
  }
  if (!isRecord(countsParsed) || !isRecord(manifestParsed) || !isRecord(validationParsed)) {
    throw new PeruPreflightError("counts_file", "Peru counts or manifest drifted.", intendedInventory);
  }
  if (
    countsParsed.office_rows !== EXPECTED_COUNTS.offices ||
    countsParsed.current_office_rows !== EXPECTED_COUNTS.current_offices ||
    countsParsed.current_research_accepted !== EXPECTED_COUNTS.current_research_accepted ||
    countsParsed.current_held !== EXPECTED_COUNTS.current_held ||
    countsParsed.historical_office_rows !== EXPECTED_COUNTS.historical_offices ||
    countsParsed.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsParsed.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsParsed.ep_offices !== 0 ||
    countsParsed.mercosur_offices !== 0 ||
    countsParsed.applied_changes !== 0
  ) {
    throw new PeruPreflightError("counts_file", "Peru counts.json figures drifted. Publication still stays 0 events and 0 results.", intendedInventory);
  }
  if (validationParsed.status !== "PASS" || validationParsed.checks !== 2631 || validationParsed.justin_approved !== false) {
    throw new PeruPreflightError("coverage", "Peru Validation_Report.json must stay the pack PASS receipt.", intendedInventory);
  }
  if (manifestParsed.country_id !== COUNTRY_ID || manifestParsed.applied_changes !== 0 || manifestParsed.production_approved !== false) {
    throw new PeruPreflightError("coverage", "Peru manifest must stay unapproved.", intendedInventory);
  }
  if (manifestParsed.research_coverage_complete !== false) {
    throw new PeruPreflightError("coverage", "Peru research_coverage_complete must stay false.", intendedInventory);
  }

  const tiers: PeruTierOffice[] = tierParsed.map((row, tier_index) => {
    if (!isRecord(row)) throw new Error("Peru tier row is not an object");
    const office_id = requireString(row, "office_id", "tier");
    const draft_tier = requireString(row, "draft_tier", office_id);
    const disposition = requireString(row, "disposition", office_id);
    const review_status = requireString(row, "review_status", office_id);
    if (draft_tier !== "national_context" && draft_tier !== "regional" && draft_tier !== "municipal") {
      throw new Error(`Unsupported Peru draft tier ${draft_tier} on ${office_id}`);
    }
    if (disposition !== "research_accept" && disposition !== "hold") {
      throw new Error(`Unsupported Peru disposition ${disposition} on ${office_id}`);
    }
    if (review_status !== "needs_review" || row.justin_approved !== false || row.production_approved !== false) {
      throw new Error(`Office ${office_id} must stay needs_review and unapproved`);
    }
    return {
      office_id,
      tier: draft_tier,
      draft_tier,
      disposition,
      review_status: "needs_review",
      justin_approved: false,
      production_approved: false,
      tier_index,
      raw: row,
    };
  });
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  if (tierById.size !== tiers.length) throw new Error("Duplicate Peru tier office_id");

  const regionByName = new Map<string, string>();
  for (const row of regionParsed) {
    if (!isRecord(row)) throw new Error("Peru regional roster row is not an object");
    const name = requireString(row, "name", "region");
    const regionId = requireString(row, "region_id", name);
    if (regionByName.has(name)) throw new Error(`Duplicate Peru region ${name}`);
    regionByName.set(name, regionId);
  }

  const rosterUbigeos = new Set<string>();
  let provincialMunicipalities = 0;
  for (const row of rosterParsed) {
    if (!isRecord(row)) throw new Error("Peru municipal roster row is not an object");
    const ubigeo = requireString(row, "ubigeo", "roster");
    const title = requireString(row, "source_office_title", ubigeo);
    if (rosterUbigeos.has(ubigeo)) throw new Error(`Duplicate Peru ubigeo ${ubigeo}`);
    rosterUbigeos.add(ubigeo);
    if (title.includes("Provincial")) provincialMunicipalities += 1;
  }

  const geographies = new Map<string, PeruGeography>();
  geographies.set(COUNTRY_GEOGRAPHY_ID, {
    geography_id: COUNTRY_GEOGRAPHY_ID,
    name: COUNTRY_NAME,
    parent_geography_id: null,
    source_path: OFFICE_REGISTER_RELATIVE,
    source_pointer: "",
  });

  const offices: PeruRegisterOffice[] = registerParsed.map((row, register_index) => {
    if (!isRecord(row)) throw new Error("Peru office row is not an object");
    const office_id = requireString(row, "office_id", "office");
    const name = requireString(row, "name", office_id);
    const office_family = requireString(row, "family", office_id);
    const level = requireString(row, "level", office_id);
    const era = requireString(row, "era_status", office_id);
    const disposition = requireString(row, "disposition", office_id);
    if (row.country_id !== COUNTRY_ID || row.country_code !== COUNTRY_CODE) {
      throw new Error(`Office ${office_id} left Peru`);
    }
    if (row.production_approved !== false) throw new Error(`Office ${office_id} is production approved`);
    if (era !== "current" && era !== "historical") throw new Error(`Office ${office_id} has era ${era}`);
    if (disposition !== "research_accept" && disposition !== "hold") {
      throw new Error(`Office ${office_id} has disposition ${disposition}`);
    }
    if (row.next_regular_election != null) throw new Error(`Office ${office_id} carries an exact next election`);
    assertAllowedOfficeIdentity(office_id, office_family, name);
    const historical = era === "historical";
    const office_type = officeTypeFor(office_family, historical);
    const tier = tierById.get(office_id);
    if (!tier) throw new Error(`Register office ${office_id} is missing from the tier file`);
    if (tier.disposition !== disposition) throw new Error(`Office ${office_id} disposition disagrees with its tier row`);

    let geography_id: string;
    if (level === "national") {
      if (row.territory !== COUNTRY_NAME) throw new Error(`National office ${office_id} territory drifted`);
      geography_id = COUNTRY_GEOGRAPHY_ID;
    } else if (level === "regional") {
      if (typeof row.territory !== "string") throw new Error(`Regional office ${office_id} territory is not a name`);
      const regionId = regionByName.get(row.territory);
      if (!regionId) throw new Error(`Regional office ${office_id} has no roster region`);
      geography_id = regionId;
      if (!geographies.has(geography_id)) {
        geographies.set(geography_id, {
          geography_id,
          name: row.territory,
          parent_geography_id: null,
          source_path: REGIONAL_ROSTER_RELATIVE,
          source_pointer: "",
        });
      }
    } else if (level === "provincial_municipal" || level === "district_municipal") {
      if (!isRecord(row.territory)) throw new Error(`Municipal office ${office_id} territory is not an object`);
      const ubigeo = requireString(row.territory, "inei_ubigeo", office_id);
      if (!rosterUbigeos.has(ubigeo)) throw new Error(`Municipal office ${office_id} ubigeo ${ubigeo} is not on the INEI roster`);
      geography_id = municipalGeographyId(ubigeo);
      const department = requireString(row.territory, "department", office_id);
      const province = requireString(row.territory, "province", office_id);
      const district = requireString(row.territory, "district", office_id);
      if (!geographies.has(geography_id)) {
        geographies.set(geography_id, {
          geography_id,
          name: `${department} / ${province} / ${district}`,
          parent_geography_id: null,
          source_path: OFFICE_REGISTER_RELATIVE,
          source_pointer: `/${register_index}/territory`,
        });
      }
    } else {
      throw new Error(`Office ${office_id} has level ${level}`);
    }

    return {
      office_id,
      name,
      office_family,
      office_type,
      geography_id,
      office_status: era,
      disposition,
      direct_executive: isDirectExecutive(office_type),
      register_index,
      raw: row,
    };
  });

  if (offices.length !== tiers.length || new Set(offices.map((row) => row.office_id)).size !== offices.length) {
    throw new PeruPreflightError("office_count", "Peru office register is not 1:1 with draft tiers.", intendedInventory);
  }
  for (const tier of tiers) {
    if (!offices.some((office) => office.office_id === tier.office_id)) {
      throw new Error(`Tier ${tier.office_id} is missing from the office register`);
    }
  }

  const gaps: PeruGap[] = gapsParsed.map((row, source_index) => {
    if (!isRecord(row)) throw new Error("Peru gap row is not an object");
    const gap_id = requireString(row, "gap_id", "gap");
    return {
      gap_id,
      title: requireString(row, "topic", gap_id),
      status: requireString(row, "status", gap_id),
      detail: requireString(row, "detail", gap_id),
      justin_approved: false,
      source_index,
    };
  });
  if (gaps.length !== OPEN_HOLD_IDS.length || gaps.some((gap, index) => gap.gap_id !== OPEN_HOLD_IDS[index])) {
    throw new PeruPreflightError("holds", "Peru holds must stay BK-G01 through BK-G18 in order.", intendedInventory);
  }
  if (gaps.some((gap) => gap.justin_approved !== false)) {
    throw new PeruPreflightError("holds", "Peru holds must stay unapproved.", intendedInventory);
  }
  const g17 = gaps.find((gap) => gap.gap_id === "BK-G17");
  const g12 = gaps.find((gap) => gap.gap_id === "BK-G12");
  if (!g17 || g17.status !== "open_transcription_hold" || !g17.detail.toLowerCase().includes("october 2026")) {
    throw new PeruPreflightError("holds", "BK-G17 must stay the open October 2026 transcription hold.", intendedInventory);
  }
  if (!g12 || !g12.title.toLowerCase().includes("centros poblados")) {
    throw new PeruPreflightError("holds", "BK-G12 must stay the centros poblados hold.", intendedInventory);
  }

  const held = offices.filter((office) => office.disposition === "hold");
  if (
    held.length !== 2 ||
    held.map((office) => office.office_id).sort().join(",") !== [SANGANI_COUNCIL_ID, SANGANI_MAYOR_ID].sort().join(",")
  ) {
    throw new PeruPreflightError("holds", "Sangani must stay the only two held offices.", intendedInventory);
  }
  if (held.some((office) => office.geography_id !== SANGANI_GEOGRAPHY_ID)) {
    throw new PeruPreflightError("holds", "Sangani offices must stay on ubigeo 120307.", intendedInventory);
  }
  if (!rosterUbigeos.has(SANGANI_UBIGEO)) {
    throw new PeruPreflightError("holds", "Sangani ubigeo left the INEI roster.", intendedInventory);
  }

  const current = offices.filter((office) => office.office_status === "current").length;
  const historical = offices.filter((office) => office.office_status === "historical").length;
  const tierHistogram = {
    national_context: tiers.filter((row) => row.draft_tier === "national_context").length,
    regional: tiers.filter((row) => row.draft_tier === "regional").length,
    municipal: tiers.filter((row) => row.draft_tier === "municipal").length,
  };
  if (
    offices.length !== EXPECTED_COUNTS.offices ||
    current !== EXPECTED_COUNTS.current_offices ||
    historical !== EXPECTED_COUNTS.historical_offices ||
    rosterUbigeos.size !== EXPECTED_COUNTS.municipalities ||
    provincialMunicipalities !== EXPECTED_COUNTS.provincial_municipalities ||
    regionByName.size !== EXPECTED_COUNTS.regions ||
    geographies.size !== EXPECTED_COUNTS.geographies ||
    tierHistogram.national_context !== EXPECTED_COUNTS.draft_tier_national_context ||
    tierHistogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    tierHistogram.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    calendarParsed.length !== EXPECTED_COUNTS.upcoming_calendar_rows ||
    offices.filter((office) => office.office_id === PRESIDENT_ID && office.office_status === "current").length !== 1 ||
    offices.filter((office) => office.office_id === SENATE_ID).length !== 1 ||
    offices.filter((office) => office.office_id === DEPUTIES_ID).length !== 1 ||
    offices.filter((office) => office.office_id === ANDEAN_ID && office.office_type === "andean_delegation").length !== 1 ||
    offices.filter((office) => office.office_id === HISTORICAL_CONGRESS_ID && office.office_status === "historical").length !== 1 ||
    offices.filter((office) => office.office_type === "regional_executive_ticket").length !== EXPECTED_COUNTS.current_governors ||
    !geographies.has(SAMPLE_REGION_GEOGRAPHY_ID)
  ) {
    throw new PeruPreflightError("office_count", "Peru office, tier, or geography counts drifted.", intendedInventory);
  }
  if (offices.some((office) => /centro poblado|centros poblados/i.test(`${office.name} ${office.office_family}`))) {
    throw new PeruPreflightError("office_count", "A centros poblados office row was invented.", intendedInventory);
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
    tracked,
    byPath,
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    tiers,
    offices,
    geographies: [...geographies.values()],
    gaps,
    successorEdges: 0,
    parentsLeftNull: 0,
    upcomingCalendarRows: calendarParsed.length,
    municipalities: rosterUbigeos.size,
    regions: regionByName.size,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}
