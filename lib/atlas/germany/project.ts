import { readFileSync } from "node:fs";
import {
  ADAPTER_VERSION,
  BUNDESPRAESIDENT_ID,
  BUNDESTAG_ID,
  COUNCIL_BY_LAND,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  EP_ID,
  EXPECTED_COUNTS,
  KREIS_BY_LAND,
  LAND_CODES,
  LANDRAT_BY_LAND,
  LINEAGE_ID,
  MAYOR_BY_LAND,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  OMITTED_RESEARCH_DIR,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  VERBAND_COUNCIL_BY_LAND,
  canonical,
  classifyGermanyOffice,
  germanyUnresolvedId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  type GermanyOfficeClass,
  type Locator,
} from "./identity";
import type { GermanyInventory, GermanyTierOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type GermanyProjection = {
  lineage: SqlRow;
  release: SqlRow;
  publicationRelease: SqlRow;
  retainedInputs: SqlRow[];
  country: SqlRow;
  geographies: SqlRow[];
  offices: SqlRow[];
  tiers: SqlRow[];
  dates: SqlRow[];
  events: SqlRow[];
  proceedings: SqlRow[];
  sources: SqlRow[];
  results: SqlRow[];
  locators: SqlRow[];
  evidence: SqlRow[];
  unresolved: SqlRow[];
  crosswalks: SqlRow[];
  validatedCounts: Record<string, number>;
};

const FORBIDDEN_ID = /BUNDESRAT|KANZLER|CHANCELLOR|MINISTER|GDR|PRIME/i;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function blankLocator(): SqlRow {
  return {
    country_id: null,
    geography_id: null,
    id_namespace: null,
    office_id: null,
    history_key: null,
    proceeding_id: null,
    result_row_id: null,
    party_namespace: null,
    party_mapping_id: null,
    source_namespace: null,
    source_id: null,
    input_path: null,
  };
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function sourceRowLocator(derivedPath: string, derivedPointer?: string | null): string {
  return canonical({
    derived_json_pointer: derivedPointer ?? null,
    derived_path: derivedPath,
    source_row: null,
  });
}

function emptyLandCounts(): Record<string, number> {
  return Object.fromEntries(LAND_CODES.map((code) => [code, 0]));
}

function assertLandCounts(label: string, actual: Record<string, number>, expected: Record<string, number>): void {
  for (const code of LAND_CODES) {
    if ((actual[code] ?? 0) !== expected[code]) {
      throw new Error(`${label} land ${code} count ${actual[code] ?? 0} != ${expected[code]}`);
    }
  }
}

export function projectGermany(inventory: GermanyInventory): GermanyProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;
  const officesIn = inventory.tiers.offices;

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path.endsWith("metadata.json") ? readMetadataPayload(inventory) : null,
  }));

  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: COUNTRY_NAME,
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country" }),
      row: { country_id: COUNTRY_ID, name: COUNTRY_NAME },
      supplemental: {
        open_holds: NAMED_HOLDS.map((hold) => hold.token),
        omitted_research_dir: OMITTED_RESEARCH_DIR,
        published_result_rows: 0,
        published_events: 0,
        numeric_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
      },
    }),
  };

  const classified: Array<{ office: GermanyTierOffice; index: number; cls: GermanyOfficeClass }> = [];
  const mayors = emptyLandCounts();
  const councils = emptyLandCounts();
  const kreis = emptyLandCounts();
  const landrat = emptyLandCounts();
  const verband = emptyLandCounts();
  const typeCounts = new Map<string, number>();
  let currentDirect = 0;
  let historicalDirect = 0;

  for (let index = 0; index < officesIn.length; index++) {
    const office = officesIn[index]!;
    rejectFixtures([office.office_id], "germany office");
    if (FORBIDDEN_ID.test(office.office_id)) {
      throw new Error(`Refusing invented or excluded office ${office.office_id}`);
    }
    const cls = classifyGermanyOffice(office.office_id);
    if (cls.expectedDraftTier !== office.tier) {
      throw new Error(`Refusing to remap ${office.office_id} from numeric tier ${office.tier}`);
    }
    if (office.justin_approved !== false || office.review_status !== "draft_unapproved") {
      throw new Error(`Office ${office.office_id} must stay draft_unapproved`);
    }
    const bucket = `${cls.officeStatus}|${cls.officeType}`;
    typeCounts.set(bucket, (typeCounts.get(bucket) ?? 0) + 1);
    if (cls.directExecutive && cls.officeStatus === "current") currentDirect += 1;
    if (cls.directExecutive && cls.officeStatus === "historical") historicalDirect += 1;
    if (cls.officeType === "municipal_mayor" && cls.officeStatus === "current" && cls.landCode) mayors[cls.landCode] += 1;
    if (cls.officeType === "municipal_council" && cls.officeStatus === "current" && cls.landCode) councils[cls.landCode] += 1;
    if (cls.officeType === "kreis_council" && cls.landCode) kreis[cls.landCode] += 1;
    if (cls.officeType === "kreis_executive" && cls.landCode) landrat[cls.landCode] += 1;
    if (cls.officeType === "association_council" && cls.landCode) verband[cls.landCode] += 1;
    classified.push({ office, index, cls });
  }

  assertLandCounts("municipal mayor", mayors, MAYOR_BY_LAND);
  assertLandCounts("municipal council", councils, COUNCIL_BY_LAND);
  assertLandCounts("kreis council", kreis, KREIS_BY_LAND);
  assertLandCounts("kreis executive", landrat, LANDRAT_BY_LAND);
  assertLandCounts("association council", verband, VERBAND_COUNCIL_BY_LAND);

  const countType = (status: string, officeType: string) => typeCounts.get(`${status}|${officeType}`) ?? 0;
  if (countType("current", "bundesprasident") !== 1) throw new Error("Bundespräsident must stay one indirect office");
  if (countType("current", "bundestag") !== 1) throw new Error("Bundestag must stay one office");
  if (countType("current", "european_parliament_delegation") !== 1) throw new Error("Germany EP delegation must stay one office");
  if (currentDirect !== EXPECTED_COUNTS.direct_executive_offices) {
    throw new Error(`Current direct executives ${currentDirect} != ${EXPECTED_COUNTS.direct_executive_offices}`);
  }

  const geographies: SqlRow[] = [];
  const geoIds = new Set<string>();
  const pushGeo = (row: SqlRow) => {
    const id = String(row.geography_id);
    if (geoIds.has(id)) throw new Error(`Duplicate geography ${id}`);
    if (row.effective_from_label != null || row.effective_to_label != null) {
      throw new Error(`Geography ${id} must not gain an effective date or successor interval`);
    }
    geoIds.add(id);
    geographies.push(row);
  };
  pushGeo({
    country_id: COUNTRY_ID,
    geography_id: COUNTRY_GEOGRAPHY_ID,
    name: COUNTRY_NAME,
    parent_geography_id: null,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country" }),
      row: { geography_id: COUNTRY_GEOGRAPHY_ID, name: COUNTRY_NAME, role: "country" },
    }),
  });

  for (const { office, index, cls } of classified) {
    if (cls.national) continue;
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: office.office_id,
      name: office.office_id,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/offices/${index}` }),
        row: { geography_id: office.office_id, office_id: office.office_id, successor_edge: null },
      }),
    });
  }

  const offices: SqlRow[] = classified.map(({ office, index, cls }) => {
    const origin: Locator = locator({
      input_path: TIER_PATH,
      sha256: TIER_SHA256,
      json_pointer: `/offices/${index}`,
    });
    return {
      id_namespace: N,
      office_id: office.office_id,
      country_id: COUNTRY_ID,
      geography_id: cls.national ? COUNTRY_GEOGRAPHY_ID : office.office_id,
      name: office.office_id,
      office_type: cls.officeType,
      office_status: cls.officeStatus,
      record_state: "active",
      state_note: null,
      registry_qualified: null,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row: office,
        supplemental: {
          office_type: cls.officeType,
          direct_executive: cls.directExecutive,
          selection_mode: office.office_id === BUNDESPRAESIDENT_ID ? "indirect_electoral_college" : cls.directExecutive ? "direct_popular" : null,
          numeric_tier: office.tier,
        },
      }),
    };
  });

  const tiers: SqlRow[] = classified.map(({ office, index }) => ({
    id_namespace: N,
    office_id: office.office_id,
    tier: schemaInterchangeTier(office.tier),
    review_status: "needs_review",
    rationale: office.rationale,
    lineage_id: L,
    release_id: R,
    classification_path: TIER_PATH,
    classification_kind: "tier_classification",
    classification_sha256: TIER_SHA256,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/offices/${index}` }),
      row: office,
      supplemental: {
        numeric_tier_preserved: true,
        schema_interchange_only: true,
        published_review_status: "needs_review",
      },
    }),
  }));

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator(TIER_PATH, "/country"),
  });
  for (const geo of geographies) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, geo.geography_id]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geo.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(TIER_PATH),
    });
  }
  for (const { office, index } of classified) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, office.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: office.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(TIER_PATH, `/offices/${index}`),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, R, item.input_path]),
      entity_kind: "input",
      ...blankLocator(),
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(item.input_path),
    });
  }

  const unresolved: SqlRow[] = NAMED_HOLDS.map((hold, index) => {
    const occurrence = { input_path: TIER_PATH, json_pointer: `/holds/${index}`, id: hold.token };
    return {
      unresolved_id: germanyUnresolvedId(countryRec, occurrence, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: canonical(occurrence),
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/holds/${index}` }),
        row: { token: hold.token, status: hold.status, disposition: hold.disposition, closed: false },
      }),
    };
  });

  const otherBodies =
    countType("current", "bezirkstag") +
    countType("current", "berlin_borough_assembly") +
    countType("current", "hamburg_district_assembly") +
    countType("current", "bremen_beirat") +
    countType("current", "munich_borough_assembly") +
    countType("current", "nrw_borough_council") +
    countType("current", "regional_assembly") +
    countType("current", "saxony_local_council") +
    countType("current", "inhabitants_council");

  const localCouncils =
    countType("current", "municipal_council") +
    countType("current", "kreis_council") +
    countType("current", "association_council") +
    otherBodies;

  const validatedCounts: Record<string, number> = {
    current_offices: offices.filter((row) => row.office_status === "current").length,
    historical_offices: offices.filter((row) => row.office_status === "historical").length,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_1: classified.filter((row) => row.office.tier === 1).length,
    draft_tier_2: classified.filter((row) => row.office.tier === 2).length,
    draft_tier_3: classified.filter((row) => row.office.tier === 3).length,
    draft_tier_4: classified.filter((row) => row.office.tier === 4).length,
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    direct_executive_offices: currentDirect,
    historical_direct_executives: historicalDirect,
    current_municipal_councils: countType("current", "municipal_council"),
    current_municipal_mayors: countType("current", "municipal_mayor"),
    historical_mayor_codes: countType("historical", "municipal_mayor"),
    historical_council_codes: countType("historical", "municipal_council"),
    historical_assemblies: countType("historical", "historical_land_assembly") + countType("historical", "historical_city_assembly"),
    current_kreis_councils: countType("current", "kreis_council"),
    current_kreis_executives: countType("current", "kreis_executive"),
    current_association_councils: countType("current", "association_council"),
    current_association_executives: countType("current", "association_executive"),
    current_land_parliaments: countType("current", "land_parliament"),
    current_local_councils: localCouncils,
    other_elected_bodies: otherBodies,
    schleswig_holstein_direct_mayors: mayors["01"] ?? 0,
    bundestag_offices: countType("current", "bundestag"),
    bundesprasident_offices: countType("current", "bundesprasident"),
    ep_offices: countType("current", "european_parliament_delegation"),
    evidence_links: 0,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Germany ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if ("documented_result_rows_omitted" in validatedCounts || "documented_event_rows_omitted" in validatedCounts) {
    throw new Error("Germany slim import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0) {
    throw new Error("Germany slim import must publish 0 result rows and 0 events");
  }
  if (offices.some((row) => row.office_id === BUNDESTAG_ID) === false) throw new Error("Bundestag missing");
  if (offices.some((row) => row.office_id === EP_ID) === false) throw new Error("EP delegation missing");

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Germany Prompt AS register. Justin accepted 21,960 current and 670 historical offices with DE-G01 through DE-G23 left open. 0 published events and 0 published result rows. Omitted results and events are not invented. Successor edges stay empty.",
  };
  const release = {
    lineage_id: L,
    release_id: R,
    fingerprint_sha256: inventory.fingerprint,
    hash_inputs_json: inventory.hashInputsJson,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
    upstream_release_id: null,
    validated_counts_json: canonical(validatedCounts),
    research_coverage_complete: 0,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256 }),
      row: {
        fingerprint: inventory.fingerprint,
        release_id: R,
        coverage_complete: false,
        tier_review_status: "needs_review",
        justin_accepted: false,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
        published_result_rows: 0,
        published_events: 0,
      },
    }),
  };

  return {
    lineage,
    release,
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    country,
    geographies,
    offices,
    tiers,
    dates: [],
    events: [],
    proceedings: [],
    sources: [],
    results: [],
    locators,
    evidence: [],
    unresolved,
    crosswalks: [],
    validatedCounts,
  };
}

function readMetadataPayload(inventory: GermanyInventory): string {
  const item = inventory.byPath.get("docs/phase1/germany/metadata.json");
  if (!item) throw new Error("Germany metadata.json missing from inventory");
  return readFileSync(item.absPath, "utf8");
}
