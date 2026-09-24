import {
  ADAPTER_VERSION,
  ALBA_PRESIDENT_ID,
  ANNULLED_EVENT_ID,
  BUCHAREST_COUNCIL_ID,
  BUCHAREST_MAYOR_ID,
  CHAMBER_ID,
  COUNCIL_ASSEMBLY_TYPES,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  DIRECT_EXECUTIVE_TYPES,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  PRESIDENT_ID,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULT_EVENT_IDS,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SENATE_ID,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  romaniaEvidenceId,
  romaniaUnresolvedId,
  type Locator,
} from "./identity";
import type {
  RomaniaEventRow,
  RomaniaGeographyRow,
  RomaniaInventory,
  RomaniaOfficeRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type RomaniaProjection = {
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

const OMITTED_PATH = "data/research/romania/events.json";
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DIRECT_TYPES = new Set<string>(DIRECT_EXECUTIVE_TYPES);
const COUNCIL_TYPES = new Set<string>(COUNCIL_ASSEMBLY_TYPES);
const ALLOWED_TYPES = new Set<string>([...DIRECT_EXECUTIVE_TYPES, ...COUNCIL_ASSEMBLY_TYPES, "european_parliament_delegation"]);
const RESULT_EVENTS = new Set<string>(RESULT_EVENT_IDS);
const HEX64 = /^[0-9a-f]{64}$/;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function parseDayLabel(label: string, where: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Romania date is not an ISO day at ${where}: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label} at ${where}`);
  }
  return { year, month, day };
}

function pointerFor(index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: pointerFor(index),
  });
}

function sliceHash(inventory: RomaniaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: { derivedPath: string; derivedPointer?: string | null }): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
  });
}

function mapTier(tier: string): string {
  if (tier === "municipal" || tier === "regional" || tier === "other") return tier;
  if (tier === "national") return "national_context";
  throw new Error(`Unsupported Romania classification tier ${JSON.stringify(tier)}`);
}

function expectedTier(officeType: string): string {
  if (officeType === "local_council" || officeType === "mayor" || officeType === "sector_council" || officeType === "sector_mayor") {
    return "municipal";
  }
  if (
    officeType === "county_council" ||
    officeType === "county_president" ||
    officeType === "bucharest_general_council" ||
    officeType === "bucharest_general_mayor"
  ) {
    return "regional";
  }
  if (officeType === "national_chamber" || officeType === "president") return "national";
  if (officeType === "european_parliament_delegation") return "other";
  throw new Error(`Unsupported Romania office type ${officeType}`);
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function measure(
  kind: "votes" | "share" | "seats",
  value: number | null | undefined,
  where: string,
): { value: number | null; status: string } {
  if (value == null) return { value: null, status: "unknown" };
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${kind} is not a finite number at ${where}`);
  }
  if ((kind === "votes" || kind === "seats") && !Number.isInteger(value)) {
    throw new Error(`${kind} is not an integer at ${where}`);
  }
  if (value < 0) throw new Error(`${kind} is negative at ${where}`);
  if (kind === "share" && value > 100) throw new Error(`share exceeds 100 at ${where}`);
  if (value === 0) return { value: 0, status: "zero" };
  return { value, status: "recorded" };
}

function assertParentAcyclic(rows: RomaniaGeographyRow[]): void {
  const parent = new Map(rows.map((row) => [row.geography_id, row.parent_geography_id ?? null]));
  for (const start of parent.keys()) {
    const seen = new Set<string>();
    let cursor: string | null = start;
    while (cursor) {
      if (seen.has(cursor)) throw new Error(`Geography parent cycle includes ${start}`);
      seen.add(cursor);
      cursor = parent.get(cursor) ?? null;
    }
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

export function projectRomania(inventory: RomaniaInventory): RomaniaProjection {
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
  rejectFixtures(
    inventory.results.map((row) => row.result_id),
    "results",
  );
  for (const item of inventory.tracked) {
    if (item.input_path === OMITTED_PATH) {
      throw new Error("Uncompressed events.json must not be hashed into the Romania release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Romania offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Romania events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Romania geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Romania results, found ${inventory.results.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Romania classifications`);
  }
  if (inventory.gaps.length !== EXPECTED_COUNTS.named_holds) {
    throw new Error(`Expected ${EXPECTED_COUNTS.named_holds} open Romania holds`);
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
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  const geographyHash = sliceHash(inventory, GEOGRAPHY_RELATIVE);
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const countryGeo = inventory.geographies.find((row) => row.geography_id === "RO");
  if (!countryGeo || countryGeo.name !== COUNTRY_NAME || countryGeo.kind !== "country") {
    throw new Error("Romania country geography RO drifted");
  }

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
      origin: locator({ input_path: GEOGRAPHY_RELATIVE, sha256: geographyHash, json_pointer: "/0" }),
      row: countryGeo,
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: NAMED_HOLDS.map((hold) => hold.token),
        omitted_events_json: "data/research/romania/events.json",
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    if (dateIds.has(id)) throw new Error(`Romania date_id collided: ${id}`);
    dateIds.add(id);
    dates.push(row);
  };

  assertParentAcyclic(inventory.geographies);
  const geoById = new Set<string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (geoById.has(row.geography_id)) throw new Error(`Duplicate geography ${row.geography_id}`);
    geoById.add(row.geography_id);
    if (!row.name || !row.kind) throw new Error(`Geography ${row.geography_id} is missing name or kind`);
    const parent = row.parent_geography_id ?? null;
    if (parent === row.geography_id) throw new Error(`Geography ${row.geography_id} parents itself`);
    return {
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      parent_geography_id: parent,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(GEOGRAPHY_RELATIVE, geographyHash, index), row }),
    };
  });
  let sectorGeographies = 0;
  for (const row of inventory.geographies) {
    if (row.kind === "bucharest_sector") sectorGeographies += 1;
    const parent = row.parent_geography_id ?? null;
    if (row.geography_id === "RO") {
      if (parent) throw new Error("Country geography RO must not have a parent");
      continue;
    }
    if (!parent || !geoById.has(parent)) {
      throw new Error(`Geography ${row.geography_id} parent ${parent} is not authored`);
    }
  }

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, RomaniaOfficeRow>();
  let currentOffices = 0;
  let directExecutives = 0;
  let councilAssemblies = 0;
  let judetCouncils = 0;
  let judetPresidents = 0;
  let bucharestGeneral = 0;
  let ordinaryLocal = 0;
  let localCouncilsExGeneral = 0;
  let localMayorsExGeneral = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Romania`);
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted Romania office type ${row.office_type}`);
    if (row.successor_office_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}`);
    }
    if (row.current !== true) throw new Error(`Office ${row.office_id} is not a current register row`);
    if (row.elected !== true) throw new Error(`Office ${row.office_id} is not marked elected`);
    if (row.next_election_date != null) throw new Error(`Refusing an invented next date on ${row.office_id}`);
    if (!geoById.has(row.geography_id)) throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    if (!Array.isArray(row.source_ids) || row.source_ids.length === 0) {
      throw new Error(`Office ${row.office_id} is missing source_ids`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.tier !== expectedTier(row.office_type) || classification.tier !== row.proposed_tier) {
      throw new Error(`Office ${row.office_id} tier ${classification.tier} does not match ${row.office_type}`);
    }
    if (classification.human_review_required !== true) {
      throw new Error(`Office ${row.office_id} classification must stay human_review_required`);
    }
    if (row.office_id === EP_ID) {
      if (row.direct_election !== false || classification.tier_uncertain !== true || classification.tier !== "other") {
        throw new Error("RO-EP must stay other, tier_uncertain, and direct_election false");
      }
    } else if (classification.tier_uncertain) {
      throw new Error(`Only RO-EP is tier_uncertain; found ${row.office_id}`);
    }
    if (row.office_id === PRESIDENT_ID && row.direct_election !== true) {
      throw new Error("RO-PRES must stay directly elected");
    }
    if (row.office_type === "county_president" && row.direct_election !== true) {
      throw new Error(`County president ${row.office_id} must stay direct for current law`);
    }
    if (DIRECT_TYPES.has(row.office_type)) directExecutives += 1;
    if (COUNCIL_TYPES.has(row.office_type)) councilAssemblies += 1;
    if (row.office_type === "county_council") judetCouncils += 1;
    if (row.office_type === "county_president") judetPresidents += 1;
    if (row.office_type === "bucharest_general_council" || row.office_type === "bucharest_general_mayor") bucharestGeneral += 1;
    if (row.office_type === "local_council") ordinaryLocal += 1;
    if (row.office_type === "local_council" || row.office_type === "sector_council") localCouncilsExGeneral += 1;
    if (row.office_type === "mayor" || row.office_type === "sector_mayor") localMayorsExGeneral += 1;
    currentOffices += 1;
    officeById.set(row.office_id, row);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: 1,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(REGISTER_RELATIVE, registerHash, i), row }),
    });
  }
  if (officeById.size !== classById.size) throw new Error("Romania classifications do not match the register");
  for (const id of [PRESIDENT_ID, CHAMBER_ID, SENATE_ID, EP_ID, BUCHAREST_COUNCIL_ID, BUCHAREST_MAYOR_ID, ALBA_PRESIDENT_ID]) {
    if (!officeById.has(id)) throw new Error(`Missing authored Romania office ${id}`);
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => ({
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
  }));

  const events: SqlRow[] = [];
  const eventById = new Map<string, { row: RomaniaEventRow; historyKey: string; dateId: string; office: RomaniaOfficeRow }>();
  let annulledEvents = 0;
  let countyPresident2016 = 0;
  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    const office = officeById.get(row.office_id);
    if (!office) throw new Error(`Event ${row.event_id} office ${row.office_id} is not in the register`);
    if (eventById.has(row.event_id)) throw new Error(`Duplicate event ${row.event_id}`);
    if (row.event_type !== "ordinary" && row.event_type !== "presidential" && row.event_type !== "european_parliament") {
      throw new Error(`Unsupported Romania event_type ${row.event_type} on ${row.event_id}`);
    }
    if (row.certification_status !== "source_catalogued_result_detail_not_fully_projected") {
      throw new Error(`Refusing to upgrade certification on ${row.event_id}`);
    }
    if (row.round != null && row.round !== 1 && row.round !== 2) {
      throw new Error(`Unsupported round ${row.round} on ${row.event_id}`);
    }
    let legalOutcome: string;
    if (row.status === "annulled") {
      legalOutcome = "annulled";
      annulledEvents += 1;
      if (row.event_id !== ANNULLED_EVENT_ID) throw new Error(`Unexpected annulled event ${row.event_id}`);
    } else if (row.status === "completed") {
      legalOutcome = "unknown";
    } else {
      throw new Error(`Unsupported event status ${row.status} on ${row.event_id}`);
    }
    if (office.office_type === "county_president" && (row.event_id.includes("2016") || row.election_date.startsWith("2016"))) {
      countyPresident2016 += 1;
    }
    if (!Array.isArray(row.source_ids) || row.source_ids.length === 0) {
      throw new Error(`Event ${row.event_id} is missing source_ids`);
    }
    const parsed = parseDayLabel(row.election_date, row.event_id);
    const dateIdValue = dateId("event", row.event_id, "election");
    pushDate({
      date_id: dateIdValue,
      label: row.election_date,
      precision: "day",
      certainty: "unknown",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(EVENTS_RELATIVE, eventsHash, i),
        row: { election_date: row.election_date },
      }),
    });
    const historyKey = row.event_id;
    eventById.set(row.event_id, { row, historyKey, dateId: dateIdValue, office });
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: historyKey,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: "ordinary",
      selected_history_role: "selected",
      electoral_system: null,
      comparability: null,
      ballot_basis: "unknown",
      share_unit: "percent_0_100",
      legal_outcome: legalOutcome,
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(EVENTS_RELATIVE, eventsHash, i), row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Set<string>();
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id) throw new Error(`Romania source row ${i} is missing source_id`);
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Romania source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    const fileSha = row.sha256 ?? null;
    if (fileSha != null && !HEX64.test(fileSha)) throw new Error(`Source ${row.source_id} sha256 is not 64 lowercase hex`);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? null,
      url: row.url ?? null,
      checked_as_of_label: row.captured ?? null,
      evidence_grade: null,
      file_sha256: fileSha,
      locator: row.url ?? null,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(SOURCES_RELATIVE, sourcesHash, i), row }),
    });
  }

  const results: SqlRow[] = [];
  let zeroSeatRows = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    const event = eventById.get(row.event_id);
    if (!event) throw new Error(`Result ${row.result_id} event ${row.event_id} is not authored`);
    if (!RESULT_EVENTS.has(row.event_id)) {
      throw new Error(`Refusing a result outside the supplied national/EP events: ${row.result_id}`);
    }
    if (!row.contestant) throw new Error(`Result ${row.result_id} is missing a contestant label`);
    if (!sourceById.has(row.source_id)) throw new Error(`Result ${row.result_id} source ${row.source_id} is not catalogued`);
    const votes = measure("votes", row.votes, row.result_id);
    const share = measure("share", row.vote_share_pct, row.result_id);
    const seats = measure("seats", row.seats, row.result_id);
    if (seats.status === "zero") zeroSeatRows += 1;
    if (COUNCIL_TYPES.has(event.office.office_type) && event.office.office_type !== "national_chamber") {
      throw new Error(`Refusing a local or county result row ${row.result_id}`);
    }
    if (DIRECT_TYPES.has(event.office.office_type) && event.office.office_id !== PRESIDENT_ID) {
      throw new Error(`Refusing a local executive result row ${row.result_id}`);
    }
    results.push({
      id_namespace: N,
      office_id: event.office.office_id,
      history_key: event.historyKey,
      result_row_id: row.result_id,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.contestant,
      original_party_label: null,
      original_party_code: null,
      party_namespace: null,
      party_mapping_id: null,
      votes: votes.value,
      votes_status: votes.status,
      share: share.value,
      share_status: share.status,
      share_unit: "percent_0_100",
      seats: seats.value,
      seats_status: seats.status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: "recorded",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(RESULTS_RELATIVE, resultsHash, i), row }),
    });
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
    source_row_locator: sourceRowLocator({ derivedPath: GEOGRAPHY_RELATIVE, derivedPointer: "/0" }),
  });
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: GEOGRAPHY_RELATIVE, derivedPointer: `/${index}` }),
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
  for (const [index, row] of inventory.results.entries()) {
    const event = eventById.get(row.event_id)!;
    addLocator(locators, locatorSeen, {
      record_key: recordKey("result_row", [N, event.office.office_id, event.historyKey, row.result_id]),
      entity_kind: "result_row",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: event.office.office_id,
      history_key: event.historyKey,
      result_row_id: row.result_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: RESULTS_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.sourceCatalogue.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
      entity_kind: "source",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: SOURCES_RELATIVE, derivedPointer: `/${index}` }),
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

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: { recordKey: string; sourceId: string; claimKind: string; claim: unknown; dateClaimId?: string | null }) => {
    if (!sourceById.has(args.sourceId)) throw new Error(`Broken evidence source FK ${args.sourceId}`);
    const evidenceId = romaniaEvidenceId(args.recordKey, args.sourceId, args.claim, args.claimKind);
    if (evidenceSeen.has(evidenceId)) return;
    evidenceSeen.add(evidenceId);
    evidence.push({
      evidence_id: evidenceId,
      record_key: args.recordKey,
      source_country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: args.sourceId,
      source_locator: canonical({ source_id: args.sourceId, claim_kind: args.claimKind }),
      claim_kind: args.claimKind,
      date_claim_id: args.dateClaimId ?? null,
      claim_json: canonical(args.claim),
      lineage_id: L,
      release_id: R,
    });
  };
  for (const row of inventory.offices) {
    const rec = recordKey("office", [N, row.office_id]);
    for (const sourceId of row.source_ids) {
      pushEvidence({
        recordKey: rec,
        sourceId,
        claimKind: "register_identity",
        claim: { office_id: row.office_id },
      });
    }
  }
  for (const row of inventory.events) {
    const rec = recordKey("event", [N, row.office_id, row.event_id]);
    const event = eventById.get(row.event_id)!;
    for (const sourceId of row.source_ids) {
      pushEvidence({
        recordKey: rec,
        sourceId,
        claimKind: "election_date",
        dateClaimId: event.dateId,
        claim: { event_id: row.event_id, election_date: row.election_date },
      });
    }
  }
  for (const row of inventory.results) {
    const event = eventById.get(row.event_id)!;
    pushEvidence({
      recordKey: recordKey("result_row", [N, event.office.office_id, event.historyKey, row.result_id]),
      sourceId: row.source_id,
      claimKind: "result",
      claim: { result_id: row.result_id, event_id: row.event_id },
    });
  }

  const unresolved: SqlRow[] = [];
  for (let i = 0; i < inventory.gaps.length; i++) {
    const gap = inventory.gaps[i]!;
    const occurrence = { input_path: GAPS_RELATIVE, json_pointer: `/${i}`, id: gap.id };
    unresolved.push({
      unresolved_id: romaniaUnresolvedId(countryRec, occurrence, gap.id),
      record_key: countryRec,
      original_token: gap.id,
      source_locator: canonical(occurrence),
      reason: gap.detail,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: GAPS_RELATIVE, sha256: gapsHash, json_pointer: `/${i}` }),
        row: gap,
      }),
    });
  }

  const tierCounts = {
    municipal: tiers.filter((row) => row.tier === "municipal").length,
    regional: tiers.filter((row) => row.tier === "regional").length,
    national: tiers.filter((row) => row.tier === "national_context").length,
    other: tiers.filter((row) => row.tier === "other").length,
  };

  const validatedCounts: Record<string, number> = {
    current_offices: currentOffices,
    historical_offices: 0,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: events.length,
    prospective_events: 0,
    total_events: events.length,
    result_rows: results.length,
    municipal_offices: tierCounts.municipal,
    regional_offices: tierCounts.regional,
    national_offices: tierCounts.national,
    other_offices: tierCounts.other,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    proceedings: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    direct_executive_offices: directExecutives,
    council_assembly_offices: councilAssemblies,
    judet_councils: judetCouncils,
    judet_presidents: judetPresidents,
    bucharest_general_bodies: bucharestGeneral,
    ordinary_local_uats: ordinaryLocal,
    bucharest_sector_geographies: sectorGeographies,
    local_council_offices_excluding_general_council: localCouncilsExGeneral,
    local_mayor_offices_excluding_general_mayor: localMayorsExGeneral,
    annulled_events: annulledEvents,
    county_president_2016_events: countyPresident2016,
    explicit_zero_seat_rows: zeroSeatRows,
    evidence_links: evidence.length,
    successor_edges: successorEdges,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Romania ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Romania current SIRUTA register. Prompt AL accepted 6460 current offices and 0 historical-only offices with named holds RO-G01–RO-G07 left open. 19343 events and 23 national/EP result rows. Do not invent local results, successor edges, 2016 county-president popular contests, or the omitted events.json twin.",
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
        tier_status: "approved",
        production_accepted: true,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
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
    sources,
    results,
    locators,
    evidence,
    unresolved,
    crosswalks: [],
    validatedCounts,
  };
}
