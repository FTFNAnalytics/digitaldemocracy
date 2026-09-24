import { readFileSync } from "node:fs";
import {
  ADAPTER_VERSION,
  COMMONS_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_STATUS,
  LINEAGE_ID,
  LONDON_ASSEMBLY_ID,
  LONDON_MAYOR_ID,
  METHOD_VERSION,
  METADATA_RELATIVE,
  OFFICE_NAMESPACE,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  RESEARCH_SNAPSHOT_LABEL,
  SCILLY_COUNCIL_ID,
  SCILLY_NEXT_DATE,
  SCHEMA_VERSION,
  SHADOW_EAST_ID,
  SHADOW_WEST_ID,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  canonical,
  dateId,
  isFixtureId,
  isPrincipalCouncilType,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  unitedKingdomUnresolvedId,
  usesCountryGeography,
  type Locator,
} from "./identity";
import type { UnitedKingdomInventory, UnitedKingdomRegisterOffice, UnitedKingdomTierOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type UnitedKingdomProjection = {
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

export function projectUnitedKingdom(inventory: UnitedKingdomInventory): UnitedKingdomProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;
  const registerById = new Map(inventory.offices.map((row) => [row.office_id, row]));

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path === METADATA_RELATIVE ? readFileSync(item.absPath, "utf8") : null,
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
        open_holds: inventory.gaps.map((gap) => gap.gap_id),
        omitted_events: "docs/phase1/united-kingdom/data/events.jsonl",
        omitted_results: "docs/phase1/united-kingdom/data/results.jsonl.gz",
        published_result_rows: 0,
        published_events: 0,
        numeric_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
      },
    }),
  };

  const paired: Array<{ tier: UnitedKingdomTierOffice; register: UnitedKingdomRegisterOffice; index: number }> = [];
  for (let index = 0; index < inventory.tiers.offices.length; index++) {
    const tier = inventory.tiers.offices[index]!;
    const register = registerById.get(tier.office_id);
    if (!register) throw new Error(`Tier office ${tier.office_id} is missing from the register`);
    rejectFixtures([tier.office_id, register.name], "united kingdom office");
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (tier.justin_approved !== false || tier.review_status !== "draft_unapproved") {
      throw new Error(`Office ${tier.office_id} must stay draft_unapproved`);
    }
    if (register.nation === "United Kingdom" && !usesCountryGeography(register.office_id)) {
      throw new Error(`Refusing unlisted United Kingdom-nation office ${register.office_id}`);
    }
    if (register.office_type === "historical_european_parliament_delegation" && register.office_id !== EP_ID) {
      throw new Error(`Refusing extra EP office ${register.office_id}`);
    }
    if (register.office_id === EP_ID && register.status !== "historical_only") {
      throw new Error("The UK EP delegation must stay historical_only");
    }
    if (register.status === "current" && /european_parliament/i.test(register.office_type)) {
      throw new Error(`Refusing a current EP office ${register.office_id}`);
    }
    paired.push({ tier, register, index });
  }

  const territoryNames = new Map<string, string>();
  for (const { register } of paired) {
    if (!register.territory_code) continue;
    if (!register.territory_name) continue;
    const existing = territoryNames.get(register.territory_code);
    if (existing && existing !== register.territory_name) {
      throw new Error(`Territory ${register.territory_code} has conflicting names`);
    }
    territoryNames.set(register.territory_code, register.territory_name);
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

  const territoryCodes = [...new Set(paired.map((row) => row.register.territory_code).filter((code): code is string => Boolean(code)))].sort();
  for (const code of territoryCodes) {
    const name = territoryNames.get(code);
    if (!name) throw new Error(`Territory ${code} has no supplied name`);
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: code,
      name,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: OFFICE_REGISTER_RELATIVE, sha256: OFFICE_REGISTER_SHA256 }),
        row: { geography_id: code, name, successor_edge: null },
      }),
    });
  }

  for (const { register } of paired) {
    if (register.territory_code || usesCountryGeography(register.office_id)) continue;
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: register.office_id,
      name: register.name,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: OFFICE_REGISTER_RELATIVE,
          sha256: OFFICE_REGISTER_SHA256,
          source_row: register.register_line,
        }),
        row: { geography_id: register.office_id, office_id: register.office_id, successor_edge: null },
      }),
    });
  }

  const scilly = registerById.get(SCILLY_COUNCIL_ID);
  if (!scilly || scilly.next_ordinary_poll_date !== SCILLY_NEXT_DATE || scilly.next_date_status !== "explicit_council_statement") {
    throw new Error("Isles of Scilly next date must stay the explicit 2029-05-03 council statement");
  }
  const otherDates = paired.filter(
    (row) => row.register.office_id !== SCILLY_COUNCIL_ID && row.register.next_ordinary_poll_date != null,
  );
  if (otherDates.length !== 0) {
    throw new Error(`Refusing an extra next date on ${otherDates[0]?.register.office_id}`);
  }
  const scillyDateId = dateId("office", SCILLY_COUNCIL_ID, "next_ordinary_poll");
  const dates: SqlRow[] = [
    {
      date_id: scillyDateId,
      label: SCILLY_NEXT_DATE,
      precision: "day",
      certainty: "called",
      year: 2029,
      month: 5,
      day: 3,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: OFFICE_REGISTER_RELATIVE,
          sha256: OFFICE_REGISTER_SHA256,
          source_row: scilly.register_line,
        }),
        row: {
          office_id: SCILLY_COUNCIL_ID,
          next_ordinary_poll_date: SCILLY_NEXT_DATE,
          next_date_status: "explicit_council_statement",
          alert_created: false,
        },
      }),
    },
  ];

  const offices: SqlRow[] = paired.map(({ tier, register }) => {
    const origin: Locator = locator({
      input_path: OFFICE_REGISTER_RELATIVE,
      sha256: OFFICE_REGISTER_SHA256,
      source_row: register.register_line,
    });
    const geographyId = usesCountryGeography(register.office_id)
      ? COUNTRY_GEOGRAPHY_ID
      : (register.territory_code ?? register.office_id);
    return {
      id_namespace: N,
      office_id: register.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: register.name,
      office_type: register.office_type,
      office_status: sqlOfficeStatus(register.status),
      record_state: "active",
      state_note: register.status === "current_shadow" ? "current_shadow" : null,
      registry_qualified: null,
      next_date_id: register.office_id === SCILLY_COUNCIL_ID ? scillyDateId : null,
      next_date_resolution: register.office_id === SCILLY_COUNCIL_ID ? "resolved" : "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row: register,
        supplemental: {
          register_status: register.status,
          direct_executive: register.direct_executive,
          numeric_tier: tier.draft_tier,
          selection_mode: register.selection_mode,
          successor_edge: null,
        },
      }),
    };
  });

  const tiers: SqlRow[] = paired.map(({ tier, index }) => ({
    id_namespace: N,
    office_id: tier.office_id,
    tier: schemaInterchangeTier(tier.draft_tier),
    review_status: "needs_review",
    rationale: tier.rationale,
    lineage_id: L,
    release_id: R,
    classification_path: TIER_PATH,
    classification_kind: "tier_classification",
    classification_sha256: TIER_SHA256,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/offices/${index}` }),
      row: tier,
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
  for (const { register } of paired) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, register.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: register.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator(OFFICE_REGISTER_RELATIVE, null),
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
    const occurrence = { input_path: RESEARCH_GAPS_PATH, json_pointer: `/${index}`, id: gap.gap_id };
    return {
      unresolved_id: unitedKingdomUnresolvedId(countryRec, occurrence, gap.gap_id),
      record_key: countryRec,
      original_token: gap.gap_id,
      source_locator: canonical(occurrence),
      reason: gap.detail,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: "docs/phase1/united-kingdom/research-gaps.jsonl",
          sha256: inventory.byPath.get("docs/phase1/united-kingdom/research-gaps.jsonl")?.sha256 ?? null,
          source_row: index + 1,
        }),
        row: { token: gap.gap_id, status: HOLD_STATUS, disposition: gap.status, topic: gap.topic, closed: false },
      }),
    };
  });

  const countRegister = (status: string, officeType?: string) =>
    paired.filter((row) => row.register.status === status && (officeType == null || row.register.office_type === officeType)).length;

  const principalByNation = (nation: string) =>
    paired.filter(
      (row) => row.register.status === "current" && row.register.nation === nation && isPrincipalCouncilType(row.register.office_type),
    ).length;

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: countRegister("current"),
    current_shadow_offices: countRegister("current_shadow"),
    historical_offices: countRegister("historical_only"),
    geographies: geographies.length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    draft_tier_1: paired.filter((row) => row.tier.draft_tier === 1).length,
    draft_tier_2: paired.filter((row) => row.tier.draft_tier === 2).length,
    draft_tier_3: paired.filter((row) => row.tier.draft_tier === 3).length,
    draft_tier_4: paired.filter((row) => row.tier.draft_tier === 4).length,
    schema_national: tiers.filter((row) => row.tier === "national_context").length,
    schema_regional: tiers.filter((row) => row.tier === "regional").length,
    schema_municipal: tiers.filter((row) => row.tier === "municipal").length,
    schema_other: tiers.filter((row) => row.tier === "other").length,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: inventory.gaps.length,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    direct_executive_offices: paired.filter((row) => row.register.status === "current" && row.register.direct_executive).length,
    historical_direct_executives: paired.filter((row) => row.register.status === "historical_only" && row.register.direct_executive).length,
    direct_mayors:
      countRegister("current", "direct_local_mayor") +
      countRegister("current", "direct_strategic_authority_mayor") +
      countRegister("current", "direct_london_mayor"),
    direct_local_mayors: countRegister("current", "direct_local_mayor"),
    direct_strategic_mayors: countRegister("current", "direct_strategic_authority_mayor"),
    direct_london_mayors: countRegister("current", "direct_london_mayor"),
    standalone_pcc: countRegister("current", "direct_policing_commissioner"),
    principal_councils: paired.filter((row) => row.register.status === "current" && isPrincipalCouncilType(row.register.office_type)).length,
    england_principal: principalByNation("England"),
    northern_ireland_principal: principalByNation("Northern Ireland"),
    scotland_principal: principalByNation("Scotland"),
    wales_principal: principalByNation("Wales"),
    parish_town_councils: countRegister("current", "parish_council") + countRegister("current", "town_council"),
    parish_councils: countRegister("current", "parish_council"),
    town_councils: countRegister("current", "town_council"),
    devolved_legislatures: countRegister("current", "devolved_legislature"),
    london_assembly: countRegister("current", "london_assembly"),
    commons_offices: countRegister("current", "national_lower_chamber"),
    historical_ep_offices: countRegister("historical_only", "historical_european_parliament_delegation"),
    current_ep_offices: paired.filter((row) => row.register.status === "current" && /european/i.test(row.register.office_type)).length,
    special_components:
      countRegister("current", "elected_aldermanic_body") +
      countRegister("current", "elected_national_park_component") +
      countRegister("current", "elected_regulatory_component"),
    shadow_authorities: countRegister("current_shadow", "shadow_unitary_council"),
    current_collective_bodies: paired.filter((row) => row.register.status === "current" && row.register.collective_body).length,
    evidence_links: 0,
    england_current: paired.filter((row) => row.register.nation === "England" && row.register.status === "current").length,
    england_shadow: paired.filter((row) => row.register.nation === "England" && row.register.status === "current_shadow").length,
    england_historical: paired.filter((row) => row.register.nation === "England" && row.register.status === "historical_only").length,
    scotland_current: paired.filter((row) => row.register.nation === "Scotland" && row.register.status === "current").length,
    wales_current: paired.filter((row) => row.register.nation === "Wales" && row.register.status === "current").length,
    northern_ireland_current: paired.filter((row) => row.register.nation === "Northern Ireland" && row.register.status === "current").length,
    united_kingdom_current: paired.filter((row) => row.register.nation === "United Kingdom" && row.register.status === "current").length,
    united_kingdom_historical: paired.filter((row) => row.register.nation === "United Kingdom" && row.register.status === "historical_only").length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`United Kingdom ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if ("documented_result_rows_omitted" in validatedCounts || "documented_event_rows_omitted" in validatedCounts) {
    throw new Error("United Kingdom slim import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0) {
    throw new Error("United Kingdom slim import must publish 0 result rows and 0 events");
  }
  if (!offices.some((row) => row.office_id === COMMONS_ID)) throw new Error("Commons missing");
  if (!offices.some((row) => row.office_id === EP_ID)) throw new Error("Historical EP delegation missing");
  if (!offices.some((row) => row.office_id === LONDON_MAYOR_ID)) throw new Error("Mayor of London missing");
  if (!offices.some((row) => row.office_id === LONDON_ASSEMBLY_ID)) throw new Error("London Assembly missing");
  if (!offices.some((row) => row.office_id === SHADOW_EAST_ID) || !offices.some((row) => row.office_id === SHADOW_WEST_ID)) {
    throw new Error("Surrey shadow authorities missing");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "United Kingdom Prompt AU register. Justin accepted 482 current, 2 current_shadow, and 26 historical-only offices with G01 through G27 left open. 0 published events and 0 published result rows. Omitted results and events are not invented. Successor edges stay empty.",
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
    dates,
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

const RESEARCH_GAPS_PATH = "docs/phase1/united-kingdom/research-gaps.jsonl";
