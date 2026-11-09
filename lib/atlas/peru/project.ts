import {
  ADAPTER_VERSION,
  ANDEAN_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CURRENT_NAMESPACE,
  DEPUTIES_ID,
  EXPECTED_COUNTS,
  HISTORICAL_CONGRESS_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SANGANI_COUNCIL_ID,
  SANGANI_GEOGRAPHY_ID,
  SANGANI_MAYOR_ID,
  SCHEMA_VERSION,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  canonical,
  isFixtureId,
  locator,
  peruUnresolvedId,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
} from "./identity";
import type { PeruInventory } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type PeruProjection = {
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

export function projectPeru(inventory: PeruInventory): PeruProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const tierById = new Map(inventory.tiers.map((row) => [row.office_id, row]));

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
    region_id: "americas",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "" }),
      row: { country_id: COUNTRY_ID, country_code: COUNTRY_CODE, name: COUNTRY_NAME },
      supplemental: {
        open_holds: inventory.gaps.map((gap) => gap.gap_id),
        coverage_status: "partial",
        production_approved: false,
        justin_approved: false,
        events_file_not_projected: "events.jsonl",
        results_file_not_projected: "results.jsonl",
        upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        applied_calendar_rows: 0,
        draft_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
        ep_offices: 0,
        mercosur_offices: 0,
        centros_poblados_offices: 0,
        andean_offices: 1,
        phase2_classifier_not_imported: true,
      },
    }),
  };

  const geoById = new Map(inventory.geographies.map((row) => [row.geography_id, row]));
  const geographies: SqlRow[] = inventory.geographies.map((geography) => ({
    country_id: COUNTRY_ID,
    geography_id: geography.geography_id,
    name: geography.name,
    parent_geography_id: null,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: geography.source_path,
        sha256: inventory.byPath.get(geography.source_path)?.sha256 ?? null,
        json_pointer: geography.source_pointer,
      }),
      row: {
        geography_id: geography.geography_id,
        name: geography.name,
        parent_geography_id: null,
      },
      supplemental: {
        parent_supplied: false,
        successor_edge: null,
        schema_container: geography.geography_id === COUNTRY_GEOGRAPHY_ID,
      },
    }),
  }));

  const offices: SqlRow[] = inventory.offices.map((register) => {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Office ${register.office_id} lost its tier during projection`);
    rejectFixtures([register.office_id, register.name, register.geography_id], "peru office");
    if (!geoById.has(register.geography_id)) throw new Error(`Office ${register.office_id} has no geography`);
    return {
      id_namespace: CURRENT_NAMESPACE,
      office_id: register.office_id,
      country_id: COUNTRY_ID,
      geography_id: register.geography_id,
      name: register.name,
      office_type: register.office_type,
      office_status: sqlOfficeStatus(register.office_status),
      record_state: "active",
      state_note: null,
      registry_qualified: 0,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: OFFICE_REGISTER_RELATIVE,
          sha256: OFFICE_REGISTER_SHA256,
          json_pointer: `/${register.register_index}`,
        }),
        row: register.raw,
        supplemental: {
          register_status: register.office_status,
          disposition: register.disposition,
          direct_executive: register.direct_executive,
          draft_tier: tier.draft_tier,
          successor_office_id: null,
          predecessor_office_id: null,
          next_date_not_coerced: true,
          calendar_rows_applied: false,
          production_approved: false,
          justin_approved: false,
          held: register.disposition === "hold",
        },
      }),
    };
  });

  const tiers: SqlRow[] = inventory.offices.map((register) => {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Office ${register.office_id} lost its tier during projection`);
    const rationale = `review_status=${tier.review_status}; disposition=${tier.disposition}; draft_tier=${tier.draft_tier}`;
    return {
      id_namespace: CURRENT_NAMESPACE,
      office_id: register.office_id,
      tier: schemaInterchangeTier(tier.draft_tier),
      review_status: "needs_review",
      rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: TIER_PATH,
          sha256: TIER_SHA256,
          json_pointer: `/${tier.tier_index}`,
        }),
        row: tier.raw,
        supplemental: {
          draft_tier_preserved: true,
          schema_interchange_only: true,
          published_review_status: "needs_review",
        },
      }),
    };
  });

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator(TIER_PATH, ""),
  });
  for (const geography of inventory.geographies) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, geography.geography_id]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geography.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(geography.source_path, geography.source_pointer),
    });
  }
  for (const register of inventory.offices) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [CURRENT_NAMESPACE, register.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: CURRENT_NAMESPACE,
      office_id: register.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(OFFICE_REGISTER_RELATIVE, `/${register.register_index}`),
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

  const unresolved: SqlRow[] = inventory.gaps.map((gap) => {
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${gap.source_index}`, id: gap.gap_id };
    return {
      unresolved_id: peruUnresolvedId(countryRec, occurrence, gap.gap_id),
      record_key: countryRec,
      original_token: gap.gap_id,
      source_locator: canonical(occurrence),
      reason: gap.detail,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: RESEARCH_GAPS_RELATIVE,
          sha256: inventory.byPath.get(RESEARCH_GAPS_RELATIVE)?.sha256 ?? null,
          json_pointer: `/${gap.source_index}`,
        }),
        row: {
          token: gap.gap_id,
          status: gap.status,
          title: gap.title,
          closed: false,
        },
      }),
    };
  });

  const currentAccepted = inventory.offices.filter(
    (row) => row.office_status === "current" && row.disposition === "research_accept",
  );
  const validatedCounts: Record<string, number> = {
    offices: inventory.offices.length,
    current_offices: inventory.offices.filter((row) => row.office_status === "current").length,
    historical_offices: inventory.offices.filter((row) => row.office_status === "historical").length,
    current_research_accepted: currentAccepted.length,
    current_held: inventory.offices.filter((row) => row.disposition === "hold").length,
    geographies: geographies.length,
    geographies_without_parent: geographies.length,
    parents_left_null: 0,
    municipalities: inventory.municipalities,
    provincial_municipalities: EXPECTED_COUNTS.provincial_municipalities,
    district_municipalities: inventory.municipalities - EXPECTED_COUNTS.provincial_municipalities,
    regions: inventory.regions,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_national_context: inventory.tiers.filter((row) => row.draft_tier === "national_context").length,
    draft_tier_regional: inventory.tiers.filter((row) => row.draft_tier === "regional").length,
    draft_tier_municipal: inventory.tiers.filter((row) => row.draft_tier === "municipal").length,
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_open_holds: inventory.gaps.length,
    closed_gaps: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    applied_calendar_rows: 0,
    upcoming_calendar_rows: inventory.upcomingCalendarRows,
    current_direct_executives: inventory.offices.filter((row) => row.office_status === "current" && row.direct_executive).length,
    accepted_direct_executives: currentAccepted.filter((row) => row.direct_executive).length,
    current_councils: inventory.offices.filter(
      (row) => row.office_type === "municipal_council" || row.office_type === "regional_council",
    ).length,
    accepted_councils: currentAccepted.filter(
      (row) => row.office_type === "municipal_council" || row.office_type === "regional_council",
    ).length,
    current_national_chambers: inventory.offices.filter(
      (row) => row.office_type === "senate" || row.office_type === "chamber_of_deputies",
    ).length,
    current_mayors: inventory.offices.filter((row) => row.office_type === "municipal_mayor").length,
    current_municipal_councils: inventory.offices.filter((row) => row.office_type === "municipal_council").length,
    current_governors: inventory.offices.filter((row) => row.office_type === "regional_executive_ticket").length,
    current_regional_councils: inventory.offices.filter((row) => row.office_type === "regional_council").length,
    andean_offices: inventory.offices.filter((row) => row.office_id === ANDEAN_ID).length,
    ep_offices: 0,
    mercosur_offices: 0,
    centros_poblados_offices: 0,
    evidence_links: 0,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Peru ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Peru import must not invent documented omitted totals");
  }
  const sangani = inventory.offices.filter((row) => row.geography_id === SANGANI_GEOGRAPHY_ID).map((row) => row.office_id).sort();
  if (sangani.join(",") !== [SANGANI_COUNCIL_ID, SANGANI_MAYOR_ID].sort().join(",")) {
    throw new Error("Sangani mayor and council must stay the only offices on ubigeo 120307");
  }
  if (inventory.offices.filter((row) => row.office_id === HISTORICAL_CONGRESS_ID && row.office_status === "historical").length !== 1) {
    throw new Error("The unicameral congress must stay the only historical office");
  }
  if (inventory.offices.filter((row) => row.office_id === PRESIDENT_ID).length !== 1) {
    throw new Error("The presidential ticket must stay one office");
  }
  if (inventory.offices.filter((row) => row.office_id === SENATE_ID || row.office_id === DEPUTIES_ID).length !== 2) {
    throw new Error("Senate and deputies must stay current national chambers");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Peru Prompt BK register. Justin accepted with holds BK-G01 through BK-G18. 3840 current offices (3838 accepted, 2 Sangani held) and 1 historical unicameral congress. 0 published events, 0 published result rows, and 0 published sources. No successor edges. EP 0. MERCOSUR 0. Centros poblados offices 0. Parlamento Andino 1. October 2026 ERM results stay out. Upcoming calendar stays documentary.",
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
        production_approved: false,
        holds_open: inventory.gaps.map((gap) => gap.gap_id),
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        applied_calendar_rows: 0,
        counts_file: COUNTS_RELATIVE,
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
