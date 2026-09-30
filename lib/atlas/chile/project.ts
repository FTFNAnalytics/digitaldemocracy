import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  HISTORICAL_CONVENTION_ID,
  HISTORICAL_COUNCIL_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SHARED_COUNCIL_ID,
  SHARED_GEOGRAPHY_ID,
  SHARED_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  canonical,
  chileUnresolvedId,
  gapIsOpen,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  type Locator,
} from "./identity";
import type { ChileInventory, ChileRegisterOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type ChileProjection = {
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

export function projectChile(inventory: ChileInventory): ChileProjection {
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
        open_holds: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
        prior_coverage_status: "screened_out",
        coverage_status: "partial",
        production_approved: false,
        justin_approved: false,
        events_file_not_projected: "docs/phase1/chile/data/events.jsonl",
        results_file_not_projected: "docs/phase1/chile/data/results.jsonl",
        sources_file_not_projected: "docs/phase1/chile/sources",
        upcoming_calendar_not_applied: UPCOMING_CALENDAR_RELATIVE,
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        applied_calendar_rows: 0,
        country_ui_callout: false,
        draft_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
        ep_offices: 0,
        provincial_elected_offices: 0,
        mercosur_offices: 0,
        andean_offices: 0,
        appointed_intendente_offices: 0,
        comunas: inventory.comunas,
        municipal_administrations: inventory.municipalAdministrations,
      },
    }),
  };

  const paired: ChileRegisterOffice[] = [];
  for (const register of inventory.offices) {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Register office ${register.office_id} is missing from the tier file`);
    rejectFixtures([register.office_id, register.name, register.geography_id], "chile office");
    if (tier.justin_approved !== false || tier.applied !== false || tier.status !== "draft_unapproved") {
      throw new Error(`Office ${tier.office_id} must stay draft_unapproved`);
    }
    if (register.successor_office_id != null || register.predecessor_office_id != null) {
      throw new Error(`Office ${register.office_id} must keep successor and predecessor null`);
    }
    paired.push(register);
  }
  if (paired.length !== inventory.offices.length || inventory.successorEdges !== 0) {
    throw new Error("Chile office pairing drifted");
  }

  const geoById = new Map(inventory.geographies.map((row) => [row.geography_id, row]));
  const geographies: SqlRow[] = inventory.geographies.map((geography) => ({
    country_id: COUNTRY_ID,
    geography_id: geography.geography_id,
    name: geography.name,
    parent_geography_id: geography.parent_geography_id,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: geography.source_path,
        sha256: inventory.byPath.get(geography.source_path)?.sha256 ?? null,
        json_pointer: geography.source_path === OFFICE_REGISTER_RELATIVE ? `/${geography.source_register_index}` : "",
      }),
      row: {
        geography_id: geography.geography_id,
        name: geography.name,
        parent_geography_id: geography.parent_geography_id,
        office_ids: geography.office_ids,
      },
      supplemental: {
        parent_supplied: false,
        successor_edge: null,
        effective_interval_supplied: false,
        region_code: geography.region_code,
        comuna_keys: geography.comuna_keys,
        schema_container: geography.geography_id === COUNTRY_GEOGRAPHY_ID,
      },
    }),
  }));

  const offices: SqlRow[] = paired.map((register) => {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Office ${register.office_id} lost its tier during projection`);
    const origin: Locator = locator({
      input_path: OFFICE_REGISTER_RELATIVE,
      sha256: OFFICE_REGISTER_SHA256,
      json_pointer: `/${register.register_index}`,
    });
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
        origin,
        row: register.raw,
        supplemental: {
          register_status: register.office_status,
          direct_executive: register.direct_executive,
          draft_tier: tier.tier,
          successor_office_id: null,
          predecessor_office_id: null,
          next_date_not_coerced: true,
          calendar_rows_applied: false,
          production_approved: false,
          justin_approved: false,
          applied: false,
        },
      }),
    };
  });

  const tiers: SqlRow[] = paired.map((register) => {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Office ${register.office_id} lost its tier during projection`);
    return {
      id_namespace: CURRENT_NAMESPACE,
      office_id: register.office_id,
      tier: schemaInterchangeTier(tier.tier),
      review_status: "needs_review",
      rationale: tier.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: TIER_PATH,
          sha256: TIER_SHA256,
          json_pointer: `/classifications/${tier.tier_index}`,
        }),
        row: {
          office_id: tier.office_id,
          tier: tier.tier,
          draft_tier: tier.draft_tier,
          status: tier.status,
          justin_approved: false,
          basis: tier.rationale,
          applied: false,
        },
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
      source_row_locator: sourceRowLocator(
        geography.source_path,
        geography.source_path === OFFICE_REGISTER_RELATIVE ? `/${geography.source_register_index}` : "",
      ),
    });
  }
  for (const register of paired) {
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

  const unresolved: SqlRow[] = inventory.gaps
    .filter((gap) => gapIsOpen(gap.gap_id))
    .map((gap) => {
      const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${gap.source_index}`, id: gap.gap_id };
      return {
        unresolved_id: chileUnresolvedId(countryRec, occurrence, gap.gap_id),
        record_key: countryRec,
        original_token: gap.gap_id,
        source_locator: canonical(occurrence),
        reason: gap.treatment,
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

  const draftCount = (tier: string) => paired.filter((row) => tierById.get(row.office_id)?.tier === tier).length;
  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: paired.filter((row) => row.office_status === "current").length,
    historical_offices: paired.filter((row) => row.office_status === "historical_only").length,
    geographies: geographies.length,
    geographies_without_parent: inventory.geographies.filter((row) => row.parent_geography_id == null).length,
    parents_left_null: inventory.parentsLeftNull,
    comunas: inventory.comunas,
    municipal_administrations: inventory.municipalAdministrations,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_national_context: draftCount("national_context"),
    draft_tier_regional: draftCount("regional"),
    draft_tier_municipal: draftCount("municipal"),
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_open_holds: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).length,
    closed_gaps: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    applied_calendar_rows: 0,
    upcoming_calendar_rows: inventory.upcomingCalendarRows,
    current_direct_executives: paired.filter((row) => row.office_status === "current" && row.direct_executive).length,
    historical_direct_executives: paired.filter((row) => row.office_status === "historical_only" && row.direct_executive).length,
    current_mayors: paired.filter((row) => row.office_type === "municipal_mayor").length,
    current_municipal_councils: paired.filter((row) => row.office_type === "municipal_council").length,
    current_governors: paired.filter((row) => row.office_type === "regional_governor").length,
    current_core: paired.filter((row) => row.office_type === "regional_council").length,
    current_councils: paired.filter((row) => row.office_type === "municipal_council" || row.office_type === "regional_council").length,
    current_national_chambers: paired.filter((row) => row.office_type === "chamber_of_deputies" || row.office_type === "senate").length,
    historical_extraordinary_offices: paired.filter(
      (row) => row.office_id === HISTORICAL_CONVENTION_ID || row.office_id === HISTORICAL_COUNCIL_ID,
    ).length,
    ep_offices: 0,
    provincial_elected_offices: 0,
    mercosur_offices: 0,
    andean_offices: 0,
    appointed_intendente_offices: 0,
    evidence_links: 0,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Chile ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Chile import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0 || validatedCounts.sources !== 0) {
    throw new Error("Chile import must publish 0 result rows, 0 events, and 0 sources");
  }
  if (validatedCounts.applied_calendar_rows !== 0 || validatedCounts.research_dates !== 0) {
    throw new Error("Chile import must not apply calendar rows or coerce research dates");
  }
  if (!geoById.has(SHARED_GEOGRAPHY_ID) || !geoById.has(COUNTRY_GEOGRAPHY_ID)) {
    throw new Error("Chile country and Cabo de Hornos geographies must stay present");
  }
  const sharedMembers = paired.filter((row) => row.geography_id === SHARED_GEOGRAPHY_ID).map((row) => row.office_id).sort();
  if (sharedMembers.join(",") !== [SHARED_COUNCIL_ID, SHARED_MAYOR_ID].sort().join(",")) {
    throw new Error("Cabo de Hornos mayor and council must stay the only offices on the shared administration");
  }
  if (paired.filter((row) => row.office_id === PRESIDENT_ID && row.office_status === "current").length !== 1) {
    throw new Error("The president must stay a current office");
  }
  if (paired.filter((row) => row.office_id === HISTORICAL_CONVENTION_ID && row.office_status === "historical_only").length !== 1) {
    throw new Error("The 2021 constitutional convention must stay historical-only");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Chile Prompt BJ register. Justin accepted 725 current offices and 2 historical extraordinary offices with CL-BJ-G01 through CL-BJ-G20 left open. 0 published events, 0 published result rows, and 0 published sources. No successor edges. EP 0. Provincial elected 0. MERCOSUR 0. Andean 0. Appointed intendentes 0. The screened_out stub becomes partial draft coverage. Upcoming calendar stays documentary.",
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
        holds_open: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
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
