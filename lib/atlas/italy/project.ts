import { readFileSync } from "node:fs";
import {
  ADAPTER_VERSION,
  APPROVAL_STATE_RELATIVE,
  BOLZANO_COUNCIL_ID,
  CAMERA_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  EP_ID,
  EXPECTED_COUNTS,
  FVG_UDINE_COUNCIL_ID,
  FIRENZE_Q1_COUNCIL_ID,
  HOLD_STATUS,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_NAMESPACE,
  OFFICE_REGISTER_RELATIVE,
  OFFICE_REGISTER_SHA256,
  PENDING_STATE_NOTE,
  PRESIDENT_ID,
  REGION_CURRENT_OFFICES,
  RESEARCH_GAPS_RELATIVE,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SENATE_ID,
  TAA_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
  TRENTO_PRESIDENT_ID,
  VDA_COUNCIL_ID,
  assertAllowedOfficeIdentity,
  canonical,
  isFixtureId,
  italyUnresolvedId,
  locator,
  rawEnvelope,
  recordKey,
  schemaInterchangeTier,
  sqlOfficeStatus,
  usesCountryGeography,
  type Locator,
} from "./identity";
import type { ItalyInventory, ItalyRegisterOffice, ItalyTierOffice } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type ItalyProjection = {
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

function placeLabel(name: string): string | null {
  const marker = " — ";
  const index = name.indexOf(marker);
  if (index < 0) return null;
  const label = name.slice(index + marker.length).trim();
  return label || null;
}

function isCollectiveBody(register: ItalyRegisterOffice): boolean {
  return register.status === "current" && !register.direct_executive && register.office_type !== "indirect_head_of_state";
}

export function projectItaly(inventory: ItalyInventory): ItalyProjection {
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
    payload_json: item.input_path === APPROVAL_STATE_RELATIVE ? readFileSync(item.absPath, "utf8") : null,
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
        omitted_events: "docs/phase1/italy/data/events.jsonl",
        omitted_results: "docs/phase1/italy/data/results.jsonl.gz",
        published_result_rows: 0,
        published_events: 0,
        numeric_tiers_preserved: true,
        research_coverage_complete: false,
        successor_edges: 0,
      },
    }),
  };

  const paired: Array<{ tier: ItalyTierOffice; register: ItalyRegisterOffice; index: number }> = [];
  for (let index = 0; index < inventory.tiers.offices.length; index++) {
    const tier = inventory.tiers.offices[index]!;
    const register = registerById.get(tier.office_id);
    if (!register) throw new Error(`Tier office ${tier.office_id} is missing from the register`);
    rejectFixtures([tier.office_id, register.name], "italy office");
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (tier.justin_approved !== false || tier.review_status !== "unapproved_draft") {
      throw new Error(`Office ${tier.office_id} must stay unapproved_draft`);
    }
    if (register.office_id === EP_ID && register.status !== "current") {
      throw new Error("The Italy EP delegation must stay current");
    }
    if ((register.office_id === "IT.REGIONE.02.president" || register.office_id === "IT.REGIONE.04.president") && register) {
      throw new Error(`Refusing an invented regional president ${register.office_id}`);
    }
    if (register.office_id === "IT.PROVINCE.021.president") {
      throw new Error("Refusing an invented Bolzano direct president");
    }
    paired.push({ tier, register, index });
  }
  if (registerById.has("IT.REGIONE.02.president") || registerById.has("IT.REGIONE.04.president") || registerById.has("IT.PROVINCE.021.president")) {
    throw new Error("Refusing an invented regional or Bolzano president");
  }

  const byTerritory = new Map<string, ItalyRegisterOffice[]>();
  for (const { register } of paired) {
    if (!register.territory_code) continue;
    const list = byTerritory.get(register.territory_code) ?? [];
    list.push(register);
    byTerritory.set(register.territory_code, list);
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

  for (const code of [...byTerritory.keys()].sort()) {
    const group = byTerritory.get(code)!;
    const labels = new Set(group.map((office) => placeLabel(office.name)).filter((label): label is string => Boolean(label)));
    if (labels.size !== 1) {
      throw new Error(`Territory ${code} does not have one supplied place label`);
    }
    const label = [...labels][0]!;
    const source = group.find((office) => office.office_type.endsWith("council")) ?? group[0]!;
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: code,
      name: label,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: OFFICE_REGISTER_RELATIVE,
          sha256: OFFICE_REGISTER_SHA256,
          source_row: source.register_line,
        }),
        row: { geography_id: code, name: label, successor_edge: null },
      }),
    });
  }

  const offices: SqlRow[] = paired.map(({ tier, register }) => {
    const origin: Locator = locator({
      input_path: OFFICE_REGISTER_RELATIVE,
      sha256: OFFICE_REGISTER_SHA256,
      source_row: register.register_line,
    });
    const geographyId = usesCountryGeography(register.office_id) ? COUNTRY_GEOGRAPHY_ID : register.territory_code;
    if (!geographyId) throw new Error(`Office ${register.office_id} has no geography`);
    return {
      id_namespace: N,
      office_id: register.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: register.name,
      office_type: register.office_type,
      office_status: sqlOfficeStatus(register.status),
      record_state: "active",
      state_note: register.status === "statutory_pending_first_election" ? PENDING_STATE_NOTE : null,
      registry_qualified: null,
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
    const occurrence = { input_path: RESEARCH_GAPS_RELATIVE, json_pointer: `/${index}`, id: gap.gap_id };
    return {
      unresolved_id: italyUnresolvedId(countryRec, occurrence, gap.gap_id),
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
          source_row: index + 1,
        }),
        row: {
          token: gap.gap_id,
          status: HOLD_STATUS,
          disposition: gap.status,
          topic: gap.scope,
          resolution_needed: gap.resolution_needed,
          closed: false,
        },
      }),
    };
  });

  const countRegister = (status: ItalyRegisterOffice["status"], officeType?: string) =>
    paired.filter((row) => row.register.status === status && (officeType == null || row.register.office_type === officeType)).length;

  const regionCounts: Record<string, number> = {};
  for (const code of Object.keys(REGION_CURRENT_OFFICES)) regionCounts[`region_${code}`] = 0;
  for (const { register } of paired) {
    if (register.status !== "current" || !register.region_code) continue;
    const key = `region_${register.region_code}`;
    if (!(key in regionCounts)) throw new Error(`Office ${register.office_id} has an unlisted region ${register.region_code}`);
    regionCounts[key] = (regionCounts[key] ?? 0) + 1;
  }

  const validatedCounts: Record<string, number> = {
    offices: offices.length,
    current_offices: countRegister("current"),
    historical_offices: countRegister("historical_only"),
    pending_fvg_offices: countRegister("statutory_pending_first_election"),
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
    research_dates: 0,
    direct_executive_offices: paired.filter((row) => row.register.status === "current" && row.register.direct_executive).length,
    historical_direct_executives: paired.filter((row) => row.register.status === "historical_only" && row.register.direct_executive).length,
    pending_direct_executives: paired.filter((row) => row.register.status === "statutory_pending_first_election" && row.register.direct_executive).length,
    current_collective_bodies: paired.filter((row) => isCollectiveBody(row.register)).length,
    current_municipal_offices: paired.filter((row) => row.register.status === "current" && row.register.level === "municipal").length,
    current_municipal_councils: countRegister("current", "municipal_council"),
    current_direct_mayors: countRegister("current", "direct_mayor"),
    deputy_mayors: countRegister("current", "direct_deputy_mayor"),
    historical_councils: countRegister("historical_only", "municipal_council"),
    historical_mayors: countRegister("historical_only", "direct_mayor"),
    pending_councils: countRegister("statutory_pending_first_election", "provincial_council"),
    regional_councils: countRegister("current", "regional_council"),
    direct_regional_presidents: countRegister("current", "direct_regional_president"),
    autonomous_provincial_councils: countRegister("current", "autonomous_provincial_council"),
    direct_autonomous_provincial_presidents: countRegister("current", "direct_autonomous_provincial_president"),
    firenze_quartiere_offices:
      countRegister("current", "quartiere_council") + countRegister("current", "direct_quartiere_president"),
    national_offices: paired.filter((row) => row.register.level === "national").length,
    ep_offices: countRegister("current", "european_parliament_delegation"),
    ordinary_provincial_popular_offices: paired.filter(
      (row) =>
        row.register.status === "current" &&
        (row.register.office_type === "provincial_council" || row.register.office_type === "direct_provincial_president"),
    ).length,
    indirect_head_of_state_offices: countRegister("current", "indirect_head_of_state"),
    vda_regional_presidents: paired.filter((row) => row.register.office_id === "IT.REGIONE.02.president").length,
    taa_regional_presidents: paired.filter((row) => row.register.office_id === "IT.REGIONE.04.president").length,
    bolzano_direct_presidents: paired.filter((row) => row.register.office_id === "IT.PROVINCE.021.president").length,
    evidence_links: 0,
    ...regionCounts,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Italy ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if ("documented_result_rows_omitted" in validatedCounts || "documented_event_rows_omitted" in validatedCounts) {
    throw new Error("Italy slim import must not invent documented omitted totals");
  }
  if (validatedCounts.result_rows !== 0 || validatedCounts.total_events !== 0) {
    throw new Error("Italy slim import must publish 0 result rows and 0 events");
  }
  for (const id of [CAMERA_ID, SENATE_ID, PRESIDENT_ID, EP_ID, VDA_COUNCIL_ID, TAA_COUNCIL_ID, BOLZANO_COUNCIL_ID, TRENTO_PRESIDENT_ID, FVG_UDINE_COUNCIL_ID, FIRENZE_Q1_COUNCIL_ID]) {
    if (!offices.some((row) => row.office_id === id)) throw new Error(`Required Italy office ${id} is missing`);
  }
  const deputyOutsideVda = paired.filter(
    (row) => row.register.office_type === "direct_deputy_mayor" && row.register.region_code !== "02",
  );
  if (deputyOutsideVda.length !== 0) {
    throw new Error(`Refusing a deputy mayor outside Valle d'Aosta on ${deputyOutsideVda[0]?.register.office_id}`);
  }
  const firenzeOutside = paired.filter(
    (row) =>
      (row.register.office_type === "quartiere_council" || row.register.office_type === "direct_quartiere_president") &&
      !row.register.office_id.startsWith("IT.FIRENZE."),
  );
  if (firenzeOutside.length !== 0) {
    throw new Error(`Refusing a non-Firenze submunicipal office ${firenzeOutside[0]?.register.office_id}`);
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Italy Prompt AT register. Justin accepted 15,917 current, 696 historical-only, and 8 statutory pending FVG offices with IT-G01 through IT-G19 left open. 0 published events and 0 published result rows. Omitted results and events are not invented. Successor edges stay empty.",
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
