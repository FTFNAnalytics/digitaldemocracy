import {
  ADAPTER_VERSION,
  BRCKO_ASSEMBLY_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GEOGRAPHIES_RELATIVE,
  GEOGRAPHIES_SHA256,
  IDENTITY_VECTOR_GIT_BLOB,
  IDENTITY_VECTORS_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PROMPT_O_REFERENCE_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  RS_PRESIDENT_ID,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  bosniaUnresolvedId,
  canonical,
  gapIsOpen,
  isCouncilType,
  isDirectExecutiveType,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  type Locator,
} from "./identity";
import type { BosniaInventory, BosniaRegisterOffice, BosniaTierOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type BosniaProjection = {
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

export function projectBosnia(inventory: BosniaInventory): BosniaProjection {
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
    region_id: "europe",
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
        omitted_events: "docs/phase1/bosnia-and-herzegovina/data/events.jsonl",
        omitted_results: "docs/phase1/bosnia-and-herzegovina/data/results.jsonl",
        omitted_sources: "docs/phase1/bosnia-and-herzegovina/sources",
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        draft_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
        prompt_o_office_crosswalk_retained: true,
        prompt_o_office_crosswalk_imported_as_edges: false,
        prompt_o_result_rows_imported: 0,
        identity_vector_git_blob: IDENTITY_VECTOR_GIT_BLOB,
        identity_vector_path: IDENTITY_VECTORS_RELATIVE,
        prompt_o_reference_path: PROMPT_O_REFERENCE_RELATIVE,
      },
    }),
  };

  const paired: Array<{ tier: BosniaTierOffice; register: BosniaRegisterOffice }> = [];
  for (const register of inventory.offices) {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Register office ${register.office_id} is missing from the tier file`);
    rejectFixtures([register.office_id, register.name, register.geography_id], "bosnia office");
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review") {
      throw new Error(`Office ${tier.office_id} must stay draft_for_human_review`);
    }
    paired.push({ tier, register });
  }
  if (paired.length !== inventory.offices.length) throw new Error("Bosnia office pairing drifted");

  const geoById = new Map(inventory.geographies.map((row) => [row.geography_id, row]));
  const geographies: SqlRow[] = [];
  const geoIds = new Set<string>();
  for (const geography of inventory.geographies) {
    if (geoIds.has(geography.geography_id)) throw new Error(`Duplicate geography ${geography.geography_id}`);
    geoIds.add(geography.geography_id);
    geographies.push({
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
          input_path: GEOGRAPHIES_RELATIVE,
          sha256: GEOGRAPHIES_SHA256,
          json_pointer: `/${geography.geography_index}`,
        }),
        row: geography,
        supplemental: { successor_edge: null, effective_interval_supplied: false },
      }),
    });
  }
  if (!geoIds.has(COUNTRY_GEOGRAPHY_ID)) throw new Error("Bosnia country geography is missing");

  const offices: SqlRow[] = paired.map(({ tier, register }) => {
    const origin: Locator = locator({
      input_path: OFFICE_REGISTER_RELATIVE,
      sha256: OFFICE_REGISTER_SHA256,
      json_pointer: `/${register.register_index}`,
    });
    if (!geoById.has(register.geography_id)) throw new Error(`Office ${register.office_id} has no geography`);
    return {
      id_namespace: register.id_namespace,
      office_id: register.office_id,
      country_id: COUNTRY_ID,
      geography_id: register.geography_id,
      name: register.name,
      office_type: register.office_type,
      office_status: sqlOfficeStatus(register.office_status),
      record_state: "active",
      state_note: register.state_note ?? null,
      registry_qualified: 0,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row: register,
        supplemental: {
          register_status: register.office_status,
          register_record_state: register.record_state,
          direct_executive: register.direct_executive,
          direct_popular: register.direct_popular,
          draft_tier: tier.tier,
          successor_office_id: null,
          next_date_preserved_on_row: null,
          next_date_not_coerced: true,
          numeric_cells: "not_transcribed",
        },
      }),
    };
  });

  const tiers: SqlRow[] = paired.map(({ tier, register }) => ({
    id_namespace: register.id_namespace,
    office_id: tier.office_id,
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
        json_pointer: `/${inventory.tiers.findIndex((row) => row.office_id === tier.office_id)}`,
      }),
      row: tier,
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
      source_row_locator: sourceRowLocator(GEOGRAPHIES_RELATIVE, `/${geography.geography_index}`),
    });
  }
  for (const register of inventory.offices) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [register.id_namespace, register.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: register.id_namespace,
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

  const unresolved: SqlRow[] = inventory.gaps.map((gap, index) => {
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${index}`, id: gap.gap_id };
    return {
      unresolved_id: bosniaUnresolvedId(countryRec, occurrence, gap.gap_id),
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
          json_pointer: `/${index}`,
        }),
        row: {
          token: gap.gap_id,
          status: gap.status,
          topic: gap.topic,
          closed: false,
        },
      }),
    };
  });

  const current = (row: { register: BosniaRegisterOffice }) => row.register.office_status === "current";
  const localRepresentative = (row: BosniaRegisterOffice) =>
    row.office_status === "current" &&
    row.level === "municipal" &&
    isCouncilType(row.office_type);
  const localExecutive = (row: BosniaRegisterOffice) =>
    row.office_status === "current" &&
    row.level === "municipal" &&
    (row.office_type === "municipal_mayor" || row.office_type === "city_mayor");

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: paired.filter((row) => current(row)).length,
    historical_offices: paired.filter((row) => row.register.office_status === "historical_only").length,
    geographies: geographies.length,
    geography_state: inventory.geographies.filter((row) => row.level === "state").length,
    geography_entity: inventory.geographies.filter((row) => row.level === "entity").length,
    geography_canton: inventory.geographies.filter((row) => row.level === "canton").length,
    geography_municipal: inventory.geographies.filter((row) => row.level === "municipal").length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_national: paired.filter((row) => row.tier.tier === "national").length,
    draft_tier_regional: paired.filter((row) => row.tier.tier === "regional").length,
    draft_tier_municipal: paired.filter((row) => row.tier.tier === "municipal").length,
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_open_holds: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).length,
    closed_gaps: inventory.gaps.filter((gap) => !gapIsOpen(gap.gap_id)).length,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    historical_transitions: inventory.transitions.length,
    successor_edges_asserted: inventory.transitions.filter((row) => row.successor_edge_asserted).length,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    direct_executive_offices: paired.filter((row) => current(row) && isDirectExecutiveType(row.register.office_type)).length,
    historical_direct_executives: paired.filter(
      (row) => row.register.office_status === "historical_only" && isDirectExecutiveType(row.register.office_type),
    ).length,
    current_councils_chambers_assemblies: paired.filter((row) => current(row) && isCouncilType(row.register.office_type)).length,
    current_local_representative_bodies: paired.filter((row) => localRepresentative(row.register)).length,
    current_local_direct_executives: paired.filter((row) => localExecutive(row.register)).length,
    current_state: paired.filter((row) => current(row) && row.register.level === "state").length,
    current_entity: paired.filter((row) => current(row) && row.register.level === "entity").length,
    current_canton: paired.filter((row) => current(row) && row.register.level === "canton").length,
    current_municipal_local: paired.filter((row) => current(row) && row.register.level === "municipal").length,
    ep_offices: paired.filter(
      (row) =>
        /european parliament/i.test(`${row.register.office_id} ${row.register.name}`) ||
        /(^|[-_])EP($|[-_])/i.test(row.register.office_id),
    ).length,
    brcko_assembly_offices: paired.filter((row) => row.register.office_id === BRCKO_ASSEMBLY_ID).length,
    brcko_mayor_offices: paired.filter((row) => /mayor of brčko|mayor of brcko|brcko-mayor|brčko-mayor/i.test(`${row.register.office_id} ${row.register.name}`)).length,
    indirect_local_bodies: paired.filter((row) => row.register.selection_mode.startsWith("indirect")).length,
    prompt_o_subset_office_ids: paired.filter((row) => Object.hasOwn(inventory.promptO.office_crosswalk, row.register.office_id)).length,
    evidence_links: 0,
    namespace_offices: paired.filter((row) => row.register.id_namespace === CURRENT_NAMESPACE).length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Bosnia ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Bosnia slim import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0 || validatedCounts.sources !== 0) {
    throw new Error("Bosnia slim import must publish 0 result rows, 0 events, and 0 sources");
  }
  if (!offices.some((row) => row.office_id === RS_PRESIDENT_ID) || !offices.some((row) => row.office_id === BRCKO_ASSEMBLY_ID)) {
    throw new Error("The RS President and Brčko Assembly must both be present");
  }
  if (inventory.transitions.some((row) => row.successor_edge_asserted)) {
    throw new Error("Bosnia historical transitions must not assert successor edges");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Bosnia and Herzegovina Prompt AW register. 306 current and 40 historical-only offices. BA-AW-G01 through BA-AW-G09 stay open. 0 published events and 0 published result rows. Omitted results, events, and source extracts are not invented. Prompt O identity vectors stay the pinned blob and are not re-imported as result rows. No successor edges.",
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
        holds_open: inventory.gaps.map((gap) => gap.gap_id),
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
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
