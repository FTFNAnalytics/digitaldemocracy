import { readFileSync } from "node:fs";
import {
  ADAPTER_VERSION,
  ALTHINGI_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CROSSWALK_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHIES_RELATIVE,
  GEOGRAPHIES_SHA256,
  HUMAN_REVIEW_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  canonical,
  gapIsOpen,
  icelandUnresolvedId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  type Locator,
} from "./identity";
import type { IcelandCrosswalk, IcelandGeography, IcelandInventory, IcelandRegisterOffice, IcelandTierOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type IcelandProjection = {
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

export function projectIceland(inventory: IcelandInventory): IcelandProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const tierById = new Map(inventory.tiers.map((row) => [row.office_id, row]));
  const registerById = new Map(inventory.offices.map((row) => [row.office_id, row]));

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path === HUMAN_REVIEW_RELATIVE ? readFileSync(item.absPath, "utf8") : null,
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
      row: { country_id: COUNTRY_ID, country_code: COUNTRY_CODE, name: COUNTRY_NAME, register_country_id: "IS" },
      supplemental: {
        open_holds: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
        closed_gaps: inventory.gaps.filter((gap) => !gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
        omitted_events: "docs/phase1/iceland/data/events.json",
        omitted_results: "docs/phase1/iceland/data/results.json",
        omitted_sources: "docs/phase1/iceland/sources",
        published_result_rows: 0,
        published_events: 0,
        published_sources: 0,
        draft_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: inventory.crosswalks.length,
      },
    }),
  };

  const paired: Array<{ tier: IcelandTierOffice; register: IcelandRegisterOffice }> = [];
  for (const register of inventory.offices) {
    const tier = tierById.get(register.office_id);
    if (!tier) throw new Error(`Register office ${register.office_id} is missing from the tier file`);
    rejectFixtures([register.office_id, register.name, register.geography_id], "iceland office");
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review") {
      throw new Error(`Office ${tier.office_id} must stay draft_for_human_review`);
    }
    if (register.direct_executive && register.office_type === "municipal_council") {
      throw new Error(`Refusing a direct municipal executive ${register.office_id}`);
    }
    paired.push({ tier, register });
  }
  if (paired.length !== inventory.offices.length) throw new Error("Iceland office pairing drifted");

  const geoById = new Map(inventory.geographies.map((row) => [row.geography_id, row]));
  const geographies: SqlRow[] = [];
  const geoIds = new Set<string>();
  const pushGeo = (geography: IcelandGeography) => {
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
  };
  for (const geography of inventory.geographies) pushGeo(geography);
  if (!geoIds.has(COUNTRY_GEOGRAPHY_ID)) throw new Error("Iceland country geography IS is missing");

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
      office_status: sqlOfficeStatus(register.status),
      record_state: "active",
      state_note: register.state_note,
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
          register_status: register.status,
          register_record_state: register.record_state,
          direct_executive: register.direct_executive,
          draft_tier: tier.tier,
          successor_office_id: register.successor_office_id ?? null,
          next_date_preserved_on_row: register.next_date,
          next_date_not_coerced: true,
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

  const officeRecordKey = new Map<string, string>();
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
    const key = recordKey("office", [register.id_namespace, register.office_id]);
    officeRecordKey.set(register.office_id, key);
    addLocator(locators, locatorSeen, {
      record_key: key,
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

  const crosswalks: SqlRow[] = inventory.crosswalks.map((edge: IcelandCrosswalk) => {
    const successorKey = officeRecordKey.get(edge.record_key);
    const predecessor = registerById.get(edge.upstream_id);
    if (!successorKey || !predecessor || predecessor.successor_office_id !== edge.record_key) {
      throw new Error(`Refusing to invent or retarget Iceland successor edge ${edge.upstream_id}`);
    }
    return {
      entity_kind: "office",
      upstream_namespace: edge.upstream_namespace,
      upstream_id: edge.upstream_id,
      record_key: successorKey,
      reason: edge.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: CROSSWALK_RELATIVE,
          sha256: inventory.byPath.get(CROSSWALK_RELATIVE)?.sha256 ?? null,
          json_pointer: `/${edge.crosswalk_index}`,
        }),
        row: edge,
        supplemental: {
          predecessor_office_id: edge.upstream_id,
          successor_office_id: edge.record_key,
          guessed: false,
        },
      }),
    };
  });
  if (crosswalks.length !== inventory.offices.filter((row) => row.status === "historical_only").length) {
    throw new Error("Iceland successor edges must stay 1:1 with historical offices and no extras");
  }

  const unresolved: SqlRow[] = inventory.gaps.map((gap, index) => {
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${index}`, id: gap.gap_id };
    const open = gapIsOpen(gap.gap_id);
    return {
      unresolved_id: icelandUnresolvedId(countryRec, occurrence, gap.gap_id),
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
          closed: !open,
        },
      }),
    };
  });

  const countRegister = (status: IcelandRegisterOffice["status"], officeType?: string) =>
    paired.filter((row) => row.register.status === status && (officeType == null || row.register.office_type === officeType)).length;

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: countRegister("current"),
    historical_offices: countRegister("historical_only"),
    geographies: geographies.length,
    current_geographies: inventory.geographies.filter((row) => row.status === "current").length,
    historical_geographies: inventory.geographies.filter((row) => row.status === "historical_only").length,
    municipality_geographies: inventory.geographies.filter((row) => row.type === "municipality").length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_national: paired.filter((row) => row.tier.tier === "national").length,
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
    identity_crosswalks: crosswalks.length,
    explicit_predecessor_edges: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: 0,
    direct_executive_offices: paired.filter((row) => row.register.status === "current" && row.register.direct_executive).length,
    direct_municipal_executive_offices: paired.filter(
      (row) => row.register.direct_executive && row.register.office_type === "municipal_council",
    ).length,
    current_municipal_councils: countRegister("current", "municipal_council"),
    historical_municipal_councils: countRegister("historical_only", "municipal_council"),
    current_council_or_chamber_offices: paired.filter(
      (row) =>
        row.register.status === "current" &&
        (row.register.office_type === "municipal_council" || row.register.office_type === "legislature"),
    ).length,
    ep_offices: paired.filter((row) => /european.?parliament|\bEP\b/i.test(`${row.register.office_id} ${row.register.office_type}`)).length,
    althingi_offices: paired.filter((row) => row.register.office_id === ALTHINGI_ID).length,
    president_offices: paired.filter((row) => row.register.office_id === PRESIDENT_ID).length,
    evidence_links: 0,
    current_namespace_offices: paired.filter((row) => row.register.id_namespace === "iceland-research-av-v1").length,
    historical_namespace_offices: paired.filter((row) => row.register.id_namespace === "iceland-research-av-v2").length,
    election_mode_restricted_proportional_list: paired.filter((row) => row.register.election_mode_2026 === "restricted_proportional_list").length,
    election_mode_unrestricted: paired.filter((row) => row.register.election_mode_2026 === "unrestricted").length,
    election_mode_unopposed_no_poll: paired.filter((row) => row.register.election_mode_2026 === "unopposed_no_poll").length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Iceland ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (
    "documented_result_rows_omitted" in validatedCounts ||
    "documented_event_rows_omitted" in validatedCounts ||
    "documented_sources_omitted" in validatedCounts
  ) {
    throw new Error("Iceland slim import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0 || validatedCounts.sources !== 0) {
    throw new Error("Iceland slim import must publish 0 result rows, 0 events, and 0 sources");
  }
  if (!offices.some((row) => row.office_id === ALTHINGI_ID) || !offices.some((row) => row.office_id === PRESIDENT_ID)) {
    throw new Error("Alþingi and the President must both be present");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Iceland Prompt AV register. Justin accepted 63 current and 24 historical-only offices with IS-G01 and IS-G06 left open. 0 published events and 0 published result rows. Omitted results, events, and source extracts are not invented. 24 source-supported predecessor edges only.",
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
        holds_open: inventory.gaps.filter((gap) => gapIsOpen(gap.gap_id)).map((gap) => gap.gap_id),
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
    crosswalks,
    validatedCounts,
  };
}
