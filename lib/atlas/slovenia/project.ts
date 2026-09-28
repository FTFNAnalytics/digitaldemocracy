import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  CURRENT_NAMESPACE,
  DS_ID,
  DZ_ID,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OMITTED_RESEARCH_DIR,
  PRESIDENT_ID,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  classifySloveniaOffice,
  gapIsOpen,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sloveniaUnresolvedId,
  type Locator,
  type SloveniaOfficeClass,
} from "./identity";
import type { SloveniaInventory, SloveniaOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type SloveniaProjection = {
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

export function projectSlovenia(inventory: SloveniaInventory): SloveniaProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = CURRENT_NAMESPACE;

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: null,
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
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
      row: { country_id: COUNTRY_ID, country_code: COUNTRY_CODE, name: COUNTRY_NAME },
      supplemental: {
        open_holds: NAMED_HOLDS.filter((hold) => gapIsOpen(hold.token)).map((hold) => hold.token),
        omitted_research_dir: OMITTED_RESEARCH_DIR,
        events_file_not_projected: "data/research/slovenia/events.json",
        results_file_not_projected: "data/research/slovenia/results.json",
        sources_file_not_projected: "data/research/slovenia/sources.json",
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        draft_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
      },
    }),
  };

  const paired: SloveniaOffice[] = [];
  for (const office of inventory.offices) {
    rejectFixtures([office.row.office_id, office.cls.geographyId], "slovenia office");
    const again = classifySloveniaOffice(office.row.office_id, office.row.tier);
    if (again.officeType !== office.cls.officeType || again.geographyId !== office.cls.geographyId) {
      throw new Error(`Office ${office.row.office_id} classification drifted during projection`);
    }
    if (office.row.human_review_required !== (office.row.office_id === EP_ID)) {
      throw new Error(`Office ${office.row.office_id} focused-review flag drifted`);
    }
    paired.push(office);
  }
  if (paired.length !== EXPECTED_COUNTS.offices) throw new Error("Slovenia office pairing drifted");

  const geographies: SqlRow[] = [];
  const geoMeta: Array<{ geographyId: string; index: number }> = [];
  const geoIds = new Set<string>();
  const geoOfficeIds = new Map<string, string[]>();
  const pushGeo = (geographyId: string, name: string, index: number, officeIds: string[]) => {
    if (geoIds.has(geographyId)) throw new Error(`Duplicate geography ${geographyId}`);
    geoIds.add(geographyId);
    geoMeta.push({ geographyId, index });
    const parent = geographyId === COUNTRY_GEOGRAPHY_ID ? null : COUNTRY_GEOGRAPHY_ID;
    geographies.push({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name,
      parent_geography_id: parent,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/classifications/${index}` }),
        row: { geography_id: geographyId, name, office_ids: officeIds, parent_geography_id: parent },
        supplemental: {
          parent_from_identity_rules: parent != null,
          official_place_name_omitted: true,
          successor_edge: null,
          effective_interval_supplied: false,
        },
      }),
    });
  };

  for (const office of paired) {
    const list = geoOfficeIds.get(office.cls.geographyId) ?? [];
    list.push(office.row.office_id);
    geoOfficeIds.set(office.cls.geographyId, list);
  }
  pushGeo(COUNTRY_GEOGRAPHY_ID, COUNTRY_NAME, 0, geoOfficeIds.get(COUNTRY_GEOGRAPHY_ID) ?? []);
  const orderedGeoIds = [...geoOfficeIds.keys()].filter((id) => id !== COUNTRY_GEOGRAPHY_ID);
  for (const geographyId of orderedGeoIds) {
    const first = paired.find((office) => office.cls.geographyId === geographyId);
    pushGeo(geographyId, geographyId, first?.index ?? 0, geoOfficeIds.get(geographyId) ?? []);
  }

  const offices: SqlRow[] = paired.map(({ row, index, cls }) => {
    const origin: Locator = locator({
      input_path: TIER_PATH,
      sha256: TIER_SHA256,
      json_pointer: `/classifications/${index}`,
    });
    if (!geoIds.has(cls.geographyId)) throw new Error(`Office ${row.office_id} has no geography`);
    return {
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: cls.geographyId,
      name: row.office_id,
      office_type: cls.officeType,
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: 0,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row,
        supplemental: {
          office_type: cls.officeType,
          direct_executive: cls.directExecutive,
          draft_tier: row.tier,
          official_name_omitted: true,
          successor_office_id: null,
          next_date_not_coerced: true,
        },
      }),
    };
  });

  const tiers: SqlRow[] = paired.map(({ row, index }) => ({
    id_namespace: N,
    office_id: row.office_id,
    tier: schemaInterchangeTier(row.tier),
    review_status: "needs_review",
    rationale: row.rationale,
    lineage_id: L,
    release_id: R,
    classification_path: TIER_PATH,
    classification_kind: "tier_classification",
    classification_sha256: TIER_SHA256,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/classifications/${index}` }),
      row,
      supplemental: {
        draft_tier_preserved: true,
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
    source_row_locator: sourceRowLocator(TIER_PATH, "/country_id"),
  });
  for (const geography of geoMeta) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, geography.geographyId]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geography.geographyId,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(
        TIER_PATH,
        geography.geographyId === COUNTRY_GEOGRAPHY_ID ? "/country_id" : `/classifications/${geography.index}`,
      ),
    });
  }
  for (const office of paired) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, office.row.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: office.row.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(TIER_PATH, `/classifications/${office.index}`),
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
      unresolved_id: sloveniaUnresolvedId(countryRec, occurrence, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: canonical(occurrence),
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/holds/${index}` }),
        row: { token: hold.token, status: hold.status, closed: false },
      }),
    };
  });

  const countType = (officeType: SloveniaOfficeClass["officeType"]) => paired.filter((office) => office.cls.officeType === officeType).length;
  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: offices.filter((row) => row.office_status === "current").length,
    historical_offices: offices.filter((row) => row.office_status === "historical").length,
    geographies: geographies.length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_municipal: paired.filter((office) => office.row.tier === "municipal").length,
    draft_tier_regional: paired.filter((office) => office.row.tier === "regional").length,
    draft_tier_national: paired.filter((office) => office.row.tier === "national").length,
    draft_tier_other: paired.filter((office) => office.row.tier === "other").length,
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_open_holds: NAMED_HOLDS.filter((hold) => gapIsOpen(hold.token)).length,
    closed_gaps: NAMED_HOLDS.filter((hold) => !gapIsOpen(hold.token)).length,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    direct_executive_offices: paired.filter((office) => office.cls.directExecutive).length,
    councils_chambers_delegation: paired.filter((office) => !office.cls.directExecutive).length,
    municipal_councils: countType("municipal_council"),
    municipal_mayors: countType("direct_mayor"),
    national_assembly_offices: paired.filter((office) => office.row.office_id === DZ_ID).length,
    national_council_offices: paired.filter((office) => office.row.office_id === DS_ID).length,
    president_offices: paired.filter((office) => office.row.office_id === PRESIDENT_ID).length,
    ep_offices: paired.filter((office) => office.row.office_id === EP_ID).length,
    evidence_links: 0,
    local_jurisdictions: [...geoOfficeIds.keys()].filter((id) => id.startsWith("SI-OB-")).length,
    focused_review_offices: paired.filter((office) => office.row.human_review_required).length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Slovenia ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Slovenia import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0 || validatedCounts.sources !== 0) {
    throw new Error("Slovenia import must publish 0 result rows, 0 events, and 0 sources");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Slovenia Prompt AJ register. Justin accepted 428 current and 0 historical offices with SI-HISTORICAL-MUNICIPAL-UNIVERSE through SI-NEXT-CALLS left open. 0 published events, 0 published result rows, and 0 published sources. No successor edges.",
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
        justin_accepted_rows: false,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
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
