import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CURRENT_NAMESPACE,
  DOCUMENTED_NOT_IMPLEMENTED_ID,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  GEOGRAPHY_SHA256,
  HISTORICAL_CNA_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SAMPLE_HISTORICAL_LOCAL_ID,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VICE_PRESIDENT_ID,
  canonical,
  gapIsDocumentedNotImplemented,
  gapIsOpen,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  uruguayUnresolvedId,
  type Locator,
} from "./identity";
import type { UruguayInventory, UruguayRegisterOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type UruguayProjection = {
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

export function projectUruguay(inventory: UruguayInventory): UruguayProjection {
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
  const publishedGaps = inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id) || gapIsDocumentedNotImplemented(gap.gap_id));
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
        documented_not_implemented: [DOCUMENTED_NOT_IMPLEMENTED_ID],
        events_file_not_projected: "docs/phase1/uruguay/data/events.jsonl",
        results_file_not_projected: "docs/phase1/uruguay/data/results.jsonl",
        sources_file_not_projected: "docs/phase1/uruguay/sources",
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
        mercosur_offices: 0,
      },
    }),
  };

  const paired: UruguayRegisterOffice[] = [];
  for (const register of inventory.offices) {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Register office ${register.office_id} is missing from the tier file`);
    rejectFixtures([register.office_id, register.name, register.geography_id], "uruguay office");
    if (tier.justin_approved !== false || tier.status !== "draft_unapproved") {
      throw new Error(`Office ${tier.office_id} must stay draft_unapproved`);
    }
    if (register.successor_office_id != null || register.predecessor_office_id != null) {
      throw new Error(`Office ${register.office_id} must keep successor and predecessor null`);
    }
    if (register.list_selected && register.separate_executive_ballot) {
      throw new Error(`Alcalde ${register.office_id} must not gain a separate executive ballot`);
    }
    paired.push(register);
  }
  if (paired.length !== inventory.offices.length || inventory.successorEdges !== 0) {
    throw new Error("Uruguay office pairing drifted");
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
        input_path: GEOGRAPHY_RELATIVE,
        sha256: GEOGRAPHY_SHA256,
        json_pointer: `/${geography.geography_index}`,
      }),
      row: {
        geography_id: geography.geography_id,
        name: geography.name,
        parent_geography_id: geography.parent_geography_id,
        office_ids: geography.office_ids,
      },
      supplemental: {
        supplied_geography_file: true,
        parent_from_supplied_geography: geography.parent_geography_id != null,
        successor_edge: null,
        boundary_status: geography.boundary_status,
        effective_interval_supplied: false,
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
      registry_qualified: 1,
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
          list_selected: register.list_selected,
          separate_executive_ballot: register.separate_executive_ballot,
          separate_ballot_contest_invented: false,
          draft_tier: tier.tier,
          successor_office_id: null,
          predecessor_office_id: null,
          next_date_not_coerced: true,
          calendar_rows_applied: false,
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
          json_pointer: `/${tier.tier_index}`,
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
      source_row_locator: sourceRowLocator(GEOGRAPHY_RELATIVE, `/${geography.geography_index}`),
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

  const unresolved: SqlRow[] = publishedGaps.map((gap) => {
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${gap.source_index}`, id: gap.gap_id };
    return {
      unresolved_id: uruguayUnresolvedId(countryRec, occurrence, gap.gap_id),
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
          documented_not_implemented: gapIsDocumentedNotImplemented(gap.gap_id),
        },
      }),
    };
  });

  const countStatusType = (status: UruguayRegisterOffice["office_status"], officeType: string) =>
    paired.filter((row) => row.office_status === status && row.office_type === officeType).length;
  const draftCount = (tier: string) => paired.filter((row) => tierById.get(row.office_id)?.tier === tier).length;
  const municipalCouncilsByParent = (parentId: string) =>
    paired.filter((row) => {
      if (row.office_type !== "municipal_council" || row.office_status !== "current") return false;
      return geoById.get(row.geography_id)?.parent_geography_id === parentId;
    }).length;

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: paired.filter((row) => row.office_status === "current").length,
    historical_offices: paired.filter((row) => row.office_status === "historical_only").length,
    geographies: geographies.length,
    geographies_without_parent: inventory.geographies.filter((row) => row.parent_geography_id == null).length,
    parents_left_null: inventory.parentsLeftNull,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_national: draftCount("national"),
    draft_tier_regional: draftCount("regional"),
    draft_tier_local: draftCount("local"),
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_open_holds: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).length,
    documented_not_implemented_holds: inventory.gaps.filter((gap) => gapIsDocumentedNotImplemented(gap.gap_id)).length,
    closed_gaps: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    applied_calendar_rows: 0,
    upcoming_calendar_family_rows: inventory.upcomingCalendarRows,
    deferred_calendar_hold_rows: inventory.deferredCalendarHoldRows,
    current_popular_executive_roles: paired.filter((row) => row.office_status === "current" && row.direct_executive).length,
    current_national_departmental_direct_executives: paired.filter(
      (row) => row.office_status === "current" && row.direct_executive && !row.list_selected,
    ).length,
    current_list_selected_alcaldes: paired.filter((row) => row.list_selected).length,
    current_councils: paired.filter(
      (row) => row.office_status === "current" && (row.office_type === "departmental_council" || row.office_type === "municipal_council"),
    ).length,
    current_national_chambers: paired.filter((row) => row.office_type === "senate" || row.office_type === "chamber_of_representatives").length,
    current_intendentes: countStatusType("current", "intendente"),
    current_departmental_councils: countStatusType("current", "departmental_council"),
    current_municipal_councils: countStatusType("current", "municipal_council"),
    historical_collective_executives: paired.filter((row) => row.office_type.endsWith("collective_executive")).length,
    historical_national_collective_executives: paired.filter((row) => row.office_id === HISTORICAL_CNA_ID || row.office_type === "national_collective_executive").length,
    historical_departmental_collective_executives: countStatusType("historical_only", "departmental_collective_executive"),
    historical_local_councils: paired.filter((row) => row.office_id === SAMPLE_HISTORICAL_LOCAL_ID || row.office_type === "historical_local_council").length,
    president_offices: paired.filter((row) => row.office_id === PRESIDENT_ID).length,
    vice_president_offices: paired.filter((row) => row.office_id === VICE_PRESIDENT_ID).length,
    separate_executive_ballot_offices: paired.filter((row) => row.separate_executive_ballot).length,
    current_departments: new Set(paired.filter((row) => row.office_type === "intendente").map((row) => row.geography_id)).size,
    current_municipalities: new Set(paired.filter((row) => row.office_type === "municipal_council").map((row) => row.geography_id)).size,
    montevideo_municipalities: municipalCouncilsByParent("UY-D-MO"),
    canelones_municipalities: municipalCouncilsByParent("UY-D-CA"),
    ep_offices: paired.filter((row) => row.raw.ep_office === true).length,
    mercosur_offices: paired.filter((row) => /mercosur/i.test(`${row.office_id} ${row.name}`)).length,
    evidence_links: 0,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Uruguay ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Uruguay import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0 || validatedCounts.sources !== 0) {
    throw new Error("Uruguay import must publish 0 result rows, 0 events, and 0 sources");
  }
  if (validatedCounts.applied_calendar_rows !== 0 || validatedCounts.research_dates !== 0) {
    throw new Error("Uruguay import must not apply calendar rows or coerce research dates");
  }
  if (inventory.geographies.filter((row) => row.geography_id === COUNTRY_GEOGRAPHY_ID && row.parent_geography_id == null).length !== 1) {
    throw new Error("Uruguay country geography must keep a null parent");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Uruguay Prompt BF register. Justin accepted 314 current and 24 historical-only offices with named holds left open. 0 published events, 0 published result rows, and 0 published sources. No successor edges. EP 0. MERCOSUR 0. Upcoming calendar stays documentary.",
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
        holds_open: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
        documented_not_implemented: DOCUMENTED_NOT_IMPLEMENTED_ID,
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
