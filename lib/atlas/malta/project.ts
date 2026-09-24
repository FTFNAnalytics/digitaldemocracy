import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  CALENDAR_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GOZO_CIVIC_GEOGRAPHY_ID,
  GOZO_CIVIC_ID,
  GOZO_CIVIC_PRESIDENT_ID,
  HOUSE_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  NOMINATIONS_RELATIVE,
  OFFICE_NAMESPACE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  OMITTED_STV_RELATIVE,
  PRESIDENT_ID,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  isFixtureId,
  locator,
  maltaUnresolvedId,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type { MaltaEventRow, MaltaInventory, MaltaOfficeRow } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type MaltaProjection = {
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

const ALLOWED_TYPES = new Set<string>(ALLOWED_OFFICE_TYPES);
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function parseDay(label: string, where: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Malta day label is not ISO at ${where}: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label} at ${where}`);
  }
  return { year, month, day };
}

function originFor(relativePath: string, sha256: string, index: number): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: `/${index}`,
  });
}

function sliceHash(inventory: MaltaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: { derivedPath: string; derivedPointer?: string | null }): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
    source_row: null,
  });
}

function mapTier(tier: string): string {
  if (tier === "municipal" || tier === "regional" || tier === "other") return tier;
  if (tier === "national") return "national_context";
  throw new Error(`Unsupported Malta classification tier ${JSON.stringify(tier)}`);
}

function expectedTier(officeType: string): string {
  if (officeType === "local_council" || officeType === "mayor" || officeType === "deputy_mayor") return "municipal";
  if (
    officeType === "regional_president" ||
    officeType === "historic_regional_council" ||
    officeType === "historic_regional_president"
  ) {
    return "regional";
  }
  if (officeType === "national_parliament" || officeType === "head_of_state") return "national";
  if (officeType === "ep_delegation") return "other";
  throw new Error(`Unsupported Malta office type ${officeType}`);
}

function regionSlug(region: string): string {
  return region
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function regionGeographyId(region: string): string {
  return `MT-REG-${regionSlug(region)}`;
}

function localityGeographyId(councilId: string): string {
  if (!councilId.startsWith("MT-LC-")) throw new Error(`Local council id ${councilId} is not an MT-LC office`);
  return `MT-LOC-${councilId.slice("MT-LC-".length)}`;
}

function eventKind(eventType: string): "ordinary" | "indirect" | "unknown" | "special" {
  if (eventType === "election" || eventType === "uncontested_return") return "ordinary";
  if (eventType === "indirect_election") return "indirect";
  if (eventType === "historic_election") return "unknown";
  if (eventType === "article_52_additional_seats" || eventType === "article_52A_additional_seats") return "special";
  throw new Error(`Unsupported Malta event_type ${eventType}`);
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
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

export function projectMalta(inventory: MaltaInventory): MaltaProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  rejectFixtures(
    inventory.offices.map((row) => row.office_id),
    "office register",
  );
  rejectFixtures(
    inventory.events.map((row) => row.event_id),
    "events",
  );
  for (const item of inventory.tracked) {
    if (
      item.input_path === OMITTED_RESULTS_RELATIVE ||
      item.input_path === OMITTED_STV_RELATIVE ||
      item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`)
    ) {
      throw new Error("Omitted Malta results, STV counts, or sources must not be hashed into the release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Malta offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Malta events, found ${inventory.events.length}`);
  }
  if (inventory.successorCrosswalk.length !== 0) {
    throw new Error("Malta successor crosswalk must stay empty");
  }
  if (inventory.nominations.length !== EXPECTED_COUNTS.regional_nominations) {
    throw new Error(`Expected ${EXPECTED_COUNTS.regional_nominations} regional nominations`);
  }
  if (inventory.countTotals.length !== EXPECTED_COUNTS.count_total_rows) {
    throw new Error(`count-totals.json length ${inventory.countTotals.length} drifted`);
  }
  if (inventory.partyAggregates.length !== EXPECTED_COUNTS.party_aggregate_rows) {
    throw new Error(`party aggregate length ${inventory.partyAggregates.length} drifted`);
  }
  if (inventory.reportingUnits.length !== EXPECTED_COUNTS.reporting_units) {
    throw new Error(`reporting unit length ${inventory.reportingUnits.length} drifted`);
  }
  if (inventory.postElectionObservations.length !== EXPECTED_COUNTS.post_election_observations) {
    throw new Error(`post-election observation length ${inventory.postElectionObservations.length} drifted`);
  }
  if (inventory.calendar.length !== EXPECTED_COUNTS.calendar_rows) {
    throw new Error(`calendar length ${inventory.calendar.length} drifted`);
  }
  if (inventory.territorialGates.length !== EXPECTED_COUNTS.territorial_gates) {
    throw new Error(`territorial gate length ${inventory.territorialGates.length} drifted`);
  }
  if (inventory.extractionIssues.length !== 0) {
    throw new Error("extraction-issues.json must stay an empty array");
  }
  if (inventory.fieldMap.length !== EXPECTED_COUNTS.field_map_rows) {
    throw new Error(`field map length ${inventory.fieldMap.length} drifted`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Malta classifications`);
  }
  if (inventory.tiers.status !== "approved" || inventory.tiers.production_accepted !== true) {
    throw new Error("Malta tier file must stay the approved production-accepted bytes");
  }
  if (inventory.countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error("counts.json omitted result total drifted");
  }
  if (inventory.countsFile.stv_count_observations !== EXPECTED_COUNTS.documented_stv_count_observations_omitted) {
    throw new Error("counts.json omitted STV total drifted");
  }
  for (const row of inventory.partyAggregates) {
    if (typeof row.basis !== "string" || !row.basis.includes("not a separate ballot")) {
      throw new Error("Party aggregate basis must stay a derived envelope, not a separate ballot");
    }
  }
  for (const row of inventory.calendar) {
    if (row.exact_poll_date != null) {
      throw new Error("Calendar exact_poll_date must stay null; no prospective poll day is invented");
    }
  }
  for (const row of inventory.nominations) {
    if (row.votes != null || row.elected != null || row.status !== "nomination_only_declaration_not_retrieved") {
      throw new Error(`Regional nomination ${row.region} must stay a nomination without votes`);
    }
  }

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path.endsWith(".json") ? item.text : null,
  }));

  const registerHash = sliceHash(inventory, REGISTER_RELATIVE);
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);
  const countsHash = sliceHash(inventory, COUNTS_RELATIVE);
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
      row: { country_id: COUNTRY_ID, name: COUNTRY_NAME },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_holds: NAMED_HOLDS.map((hold) => hold.token),
        omitted_results: OMITTED_RESULTS_RELATIVE,
        omitted_stv_counts: OMITTED_STV_RELATIVE,
        omitted_sources_dir: OMITTED_SOURCES_DIR,
        count_totals_are_not_results: "data/research/malta/count-totals.json",
        party_aggregates_are_not_results: "data/research/malta/party-aggregates-derived.json",
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        documented_stv_count_observations_omitted: EXPECTED_COUNTS.documented_stv_count_observations_omitted,
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
        successor_crosswalk_rows: 0,
      },
    }),
  };

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const officeById = new Map<string, MaltaOfficeRow>();
  const officeIndex = new Map<string, number>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let currentCouncils = 0;
  let maltaCouncils = 0;
  let gozoCouncils = 0;
  let mayors = 0;
  let deputies = 0;
  let regionalPresidents = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted Malta office type ${row.office_type}`);
    if (row.status !== "current" && row.status !== "historical") {
      throw new Error(`Office ${row.office_id} status ${row.status} is not current or historical`);
    }
    if (row.standalone_popular_executive_ballot !== false) {
      throw new Error(`Refusing a standalone popular executive ballot on ${row.office_id}`);
    }
    if (row.justin_approved !== false) throw new Error(`Office ${row.office_id} research justin_approved must stay false`);
    if (row.next_poll_date != null) throw new Error(`Office ${row.office_id} next_poll_date must stay null`);
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.review_status !== "needs_review") {
      throw new Error(`Office ${row.office_id} classification must stay needs_review`);
    }
    if (classification.human_review_required !== true) {
      throw new Error(`Office ${row.office_id} classification must stay human_review_required`);
    }
    if (classification.tier !== expectedTier(row.office_type) || classification.tier !== row.tier) {
      throw new Error(`Office ${row.office_id} tier ${classification.tier} does not match ${row.office_type}`);
    }
    if (inventory.tiers.classifications[i]?.office_id !== row.office_id) {
      throw new Error(`Classification order drifted at ${row.office_id}`);
    }
    if (row.office_type === "mayor" || row.office_type === "deputy_mayor") {
      if (row.separate_contest !== false) throw new Error(`${row.office_id} must not be a separate contest`);
      if (row.selection_mode !== "conditional_first_preference_rule_or_council_election") {
        throw new Error(`${row.office_id} selection mode drifted`);
      }
      if (!row.parent_council_id) throw new Error(`${row.office_id} is missing parent_council_id`);
    }
    if (row.office_type === "head_of_state" && row.selection_mode !== "indirect_House_resolution") {
      throw new Error("President selection mode must stay indirect_House_resolution");
    }
    if (row.status === "historical") {
      historicalOffices += 1;
      if (row.office_id !== GOZO_CIVIC_ID && row.office_id !== GOZO_CIVIC_PRESIDENT_ID) {
        throw new Error(`Historical office ${row.office_id} is not the Gozo Civic Council register`);
      }
    } else {
      currentOffices += 1;
      if (row.office_type === "local_council") {
        currentCouncils += 1;
        if (row.island === "Malta") maltaCouncils += 1;
        else if (row.island === "Gozo") gozoCouncils += 1;
        else throw new Error(`Local council ${row.office_id} island ${row.island} is not Malta or Gozo`);
      }
      if (row.office_type === "mayor") mayors += 1;
      if (row.office_type === "deputy_mayor") deputies += 1;
      if (row.office_type === "regional_president") regionalPresidents += 1;
    }
    officeById.set(row.office_id, row);
    officeIndex.set(row.office_id, i);
  }
  if (officeById.size !== classById.size) throw new Error("Malta classifications do not match the register");

  const geographies: SqlRow[] = [
    {
      country_id: COUNTRY_ID,
      geography_id: COUNTRY_GEOGRAPHY_ID,
      name: COUNTRY_NAME,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
        row: { geography_id: COUNTRY_GEOGRAPHY_ID, name: COUNTRY_NAME, role: "country" },
      }),
    },
  ];
  const geoIds = new Set<string>([COUNTRY_GEOGRAPHY_ID]);
  const pushGeo = (row: SqlRow) => {
    const id = String(row.geography_id);
    if (geoIds.has(id)) throw new Error(`Duplicate geography ${id}`);
    if (row.effective_from_label != null || row.effective_to_label != null) {
      throw new Error(`Geography ${id} must not gain an effective date`);
    }
    geoIds.add(id);
    geographies.push(row);
  };

  const regionNames = new Set<string>();
  for (const row of inventory.offices) {
    if (row.office_type === "regional_president" && row.region) regionNames.add(row.region);
  }
  for (const region of [...regionNames].sort()) {
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: regionGeographyId(region),
      name: region,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: REGISTER_RELATIVE, sha256: registerHash, json_pointer: "" }),
        row: { geography_id: regionGeographyId(region), region, role: "region" },
      }),
    });
  }
  pushGeo({
    country_id: COUNTRY_ID,
    geography_id: GOZO_CIVIC_GEOGRAPHY_ID,
    name: "Gozo Civic Council",
    parent_geography_id: COUNTRY_GEOGRAPHY_ID,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: originFor(REGISTER_RELATIVE, registerHash, officeIndex.get(GOZO_CIVIC_ID)!),
      row: {
        geography_id: GOZO_CIVIC_GEOGRAPHY_ID,
        office_id: GOZO_CIVIC_ID,
        role: "historical_body",
        successor_edge: null,
      },
    }),
  });
  for (const row of inventory.offices) {
    if (row.office_type !== "local_council") continue;
    if (!row.locality || !row.region) throw new Error(`Local council ${row.office_id} is missing locality or region`);
    if (!regionNames.has(row.region)) throw new Error(`Local council ${row.office_id} region ${row.region} has no regional office`);
    const geographyId = localityGeographyId(row.office_id);
    const index = officeIndex.get(row.office_id)!;
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: row.locality,
      parent_geography_id: regionGeographyId(row.region),
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(REGISTER_RELATIVE, registerHash, index),
        row: {
          geography_id: geographyId,
          locality: row.locality,
          island: row.island ?? null,
          region: row.region,
          office_id: row.office_id,
        },
      }),
    });
  }

  function geographyFor(row: MaltaOfficeRow): string {
    if (row.office_type === "local_council") return localityGeographyId(row.office_id);
    if (row.office_type === "mayor" || row.office_type === "deputy_mayor") {
      const parent = officeById.get(row.parent_council_id ?? "");
      if (!parent || parent.office_type !== "local_council") {
        throw new Error(`${row.office_id} parent council ${row.parent_council_id} is missing`);
      }
      if (parent.locality !== row.locality) throw new Error(`${row.office_id} locality does not match its council`);
      return localityGeographyId(parent.office_id);
    }
    if (row.office_type === "regional_president") {
      if (!row.region) throw new Error(`Regional president ${row.office_id} is missing a region`);
      return regionGeographyId(row.region);
    }
    if (row.office_id === GOZO_CIVIC_ID || row.office_id === GOZO_CIVIC_PRESIDENT_ID) return GOZO_CIVIC_GEOGRAPHY_ID;
    if (row.office_id === HOUSE_ID || row.office_id === PRESIDENT_ID || row.office_id === EP_ID) return COUNTRY_GEOGRAPHY_ID;
    throw new Error(`Refusing a geography for unlisted office ${row.office_id}`);
  }

  const offices: SqlRow[] = inventory.offices.map((row, index) => ({
    id_namespace: N,
    office_id: row.office_id,
    country_id: COUNTRY_ID,
    geography_id: geographyFor(row),
    name: row.name,
    office_type: row.office_type,
    office_status: row.status,
    record_state: "active",
    state_note: null,
    registry_qualified: 1,
    next_date_id: null,
    next_date_resolution: "unknown",
    next_history_key: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({ origin: originFor(REGISTER_RELATIVE, registerHash, index), row }),
  }));

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (row.review_status !== "needs_review") {
      throw new Error(`Refusing to rewrite ${row.office_id} review_status ${row.review_status}`);
    }
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapTier(row.tier),
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
      }),
    };
  });

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const events: SqlRow[] = [];
  const eventByKey = new Map<string, MaltaEventRow>();
  const eventsByOffice = new Map<string, number>();
  let ordinaryElections = 0;
  let uncontestedReturns = 0;
  let indirectEvents = 0;
  let historicEvents = 0;
  let additionalSeats = 0;

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    const office = officeById.get(row.office_id);
    if (!office) throw new Error(`Event ${row.event_id} office ${row.office_id} is not in the register`);
    if (eventByKey.has(row.event_id)) throw new Error(`Duplicate event ${row.event_id}`);
    if (row.date_precision !== "day") throw new Error(`Event ${row.event_id} must stay day precision`);
    if (office.office_type === "mayor" || office.office_type === "deputy_mayor") {
      throw new Error(`Refusing an event on conditional office ${row.office_id}`);
    }
    const kind = eventKind(row.event_type);
    if (row.event_type === "election") ordinaryElections += 1;
    if (row.event_type === "uncontested_return") uncontestedReturns += 1;
    if (row.event_type === "indirect_election") indirectEvents += 1;
    if (row.event_type === "historic_election") historicEvents += 1;
    if (row.event_type === "article_52_additional_seats" || row.event_type === "article_52A_additional_seats") {
      additionalSeats += 1;
    }
    if (row.electoral_system != null && row.electoral_system !== "STV") {
      throw new Error(`Event ${row.event_id} electoral system ${row.electoral_system} is not STV or null`);
    }
    const parsed = parseDay(row.date, row.event_id);
    const dateIdValue = dateId("event", row.event_id, "election");
    if (dateIds.has(dateIdValue)) throw new Error(`Malta date_id collided: ${dateIdValue}`);
    dateIds.add(dateIdValue);
    dates.push({
      date_id: dateIdValue,
      label: row.date,
      precision: "day",
      certainty: "called",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(EVENTS_RELATIVE, eventsHash, i),
        row: { date: row.date, date_precision: row.date_precision },
      }),
    });
    eventByKey.set(row.event_id, row);
    eventsByOffice.set(row.office_id, (eventsByOffice.get(row.office_id) ?? 0) + 1);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: kind,
      selected_history_role: "selected",
      electoral_system: row.electoral_system,
      comparability: null,
      ballot_basis: "unknown",
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: `${row.event_type}; ballot_basis=${row.ballot_basis}; result_status=${row.result_status}; certified_status=${row.certified_status}`,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(EVENTS_RELATIVE, eventsHash, i), row }),
    });
  }

  const regionalByRegion = new Map<string, string>();
  for (const row of inventory.offices) {
    if (row.office_type === "regional_president" && row.region) regionalByRegion.set(row.region, row.office_id);
  }
  const nominationOffices = new Set<string>();
  for (const nomination of inventory.nominations) {
    const officeId = regionalByRegion.get(nomination.region);
    if (!officeId) throw new Error(`Nomination region ${nomination.region} has no regional president`);
    if ((eventsByOffice.get(officeId) ?? 0) !== 0) {
      throw new Error(`Sole nominee ${officeId} must not gain an election event`);
    }
    nominationOffices.add(officeId);
  }
  if (nominationOffices.size !== EXPECTED_COUNTS.regional_nominations) {
    throw new Error("Regional nominations must cover four distinct presidencies");
  }

  let officesWithoutEvents = 0;
  for (const row of inventory.offices) {
    const nEvents = eventsByOffice.get(row.office_id) ?? 0;
    if (nEvents === 0) {
      officesWithoutEvents += 1;
      const allowed =
        row.office_type === "mayor" ||
        row.office_type === "deputy_mayor" ||
        nominationOffices.has(row.office_id);
      if (!allowed) throw new Error(`Office ${row.office_id} is missing an authored event`);
    }
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({ derivedPath: TIER_PATH, derivedPointer: "/country_id" }),
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
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, row.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.events.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("event", [N, row.office_id, row.event_id]),
      entity_kind: "event",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: EVENTS_RELATIVE, derivedPointer: `/${index}` }),
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
      source_row_locator: sourceRowLocator({ derivedPath: item.input_path }),
    });
  }

  const unresolved: SqlRow[] = NAMED_HOLDS.map((hold, index) => {
    const occurrence = { input_path: TIER_PATH, json_pointer: `/justin_approval/holds_open/${index}`, id: hold.token };
    return {
      unresolved_id: maltaUnresolvedId(countryRec, occurrence, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: canonical(occurrence),
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/justin_approval/holds_open/${index}` }),
        row: { token: hold.token, status: hold.status },
      }),
    };
  });

  const tierCounts = {
    municipal: tiers.filter((row) => row.tier === "municipal").length,
    regional: tiers.filter((row) => row.tier === "regional").length,
    national: tiers.filter((row) => row.tier === "national_context").length,
    other: tiers.filter((row) => row.tier === "other").length,
  };

  const validatedCounts: Record<string, number> = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: events.length,
    prospective_events: 0,
    total_events: events.length,
    proceedings: 0,
    result_rows: 0,
    documented_result_rows_omitted: inventory.countsFile.results,
    documented_numeric_first_preference_rows_omitted: inventory.countsFile.numeric_first_preference_rows,
    documented_stv_count_observations_omitted: inventory.countsFile.stv_count_observations,
    count_total_rows: inventory.countTotals.length,
    party_aggregate_rows: inventory.partyAggregates.length,
    reporting_units: inventory.reportingUnits.length,
    post_election_observations: inventory.postElectionObservations.length,
    regional_nominations: inventory.nominations.length,
    municipal_offices: tierCounts.municipal,
    regional_offices: tierCounts.regional,
    national_offices: tierCounts.national,
    other_offices: tierCounts.other,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    resolved_exclusions: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    guessed_merger_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    direct_executive_offices: 0,
    standalone_popular_executive_offices: 0,
    current_local_councils: currentCouncils,
    malta_local_councils: maltaCouncils,
    gozo_local_councils: gozoCouncils,
    current_mayors: mayors,
    current_deputy_mayors: deputies,
    current_indirect_regional_presidents: regionalPresidents,
    historical_gozo_civic_offices: historicalOffices,
    parliament_offices: officeById.get(HOUSE_ID)?.office_type === "national_parliament" ? 1 : 0,
    ep_delegations: officeById.get(EP_ID)?.office_type === "ep_delegation" ? 1 : 0,
    ordinary_election_events: ordinaryElections,
    uncontested_return_events: uncontestedReturns,
    indirect_events: indirectEvents,
    historic_events: historicEvents,
    additional_seat_events: additionalSeats,
    offices_without_events: officesWithoutEvents,
    year_only_events: 0,
    evidence_links: 0,
    source_inventory_rows: inventory.sourceInventory.length,
    distinct_source_files_documented: EXPECTED_COUNTS.distinct_source_files_documented,
    calendar_rows: inventory.calendar.length,
    extraction_issues: inventory.extractionIssues.length,
    successor_crosswalk_rows: inventory.successorCrosswalk.length,
    field_map_rows: inventory.fieldMap.length,
    territorial_gates: inventory.territorialGates.length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Malta ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (validatedCounts.result_rows !== 0) throw new Error("Malta slim import must publish 0 result rows");
  if (validatedCounts.documented_result_rows_omitted === validatedCounts.count_total_rows) {
    throw new Error("Refusing to treat count-totals.json as the omitted result total");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Malta Prompt AP register. Justin accepted 213 current and 2 historical offices with named holds left open. 223 events and 0 published result rows. The omitted results.json documents 4,084 rows and the omitted stv-counts.json documents 64,204 observations; neither file is invented. The successor crosswalk stays empty.",
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
      origin: locator({ input_path: COUNTS_RELATIVE, sha256: countsHash }),
      row: {
        fingerprint: inventory.fingerprint,
        release_id: R,
        coverage_complete: false,
        tier_status: "approved",
        production_accepted: true,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        documented_stv_count_observations_omitted: EXPECTED_COUNTS.documented_stv_count_observations_omitted,
        published_result_rows: 0,
        calendar_not_prospective: CALENDAR_RELATIVE,
        nominations_not_results: NOMINATIONS_RELATIVE,
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
    events,
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
