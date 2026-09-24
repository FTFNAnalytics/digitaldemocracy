import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  CROSSWALK_RELATIVE,
  EP_1981_HISTORY_KEY,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  LOCAL_SOURCE_HOLD_AUTHORITIES,
  MESSINI_COUNCIL_ID,
  MESSINI_HISTORY_KEY,
  MESSINI_MAYOR_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  OMITTED_SOURCES_DIR,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_HOLDS_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  greeceUnresolvedId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  GreeceEventRow,
  GreeceGeographyRow,
  GreeceInventory,
  GreeceOfficeRow,
  GreeceResultRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type GreeceProjection = {
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
const ALLOWED_EVENT_KIND = new Set(["ordinary", "indirect", "unknown"]);
const ALLOWED_BALLOT = new Set(["list_votes", "electors"]);
const ALLOWED_LEGAL = new Set(["unknown", "preliminary"]);
const ALLOWED_PROCEEDING_KIND = new Set(["first_round", "runoff", "repeat"]);
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_YEAR = /^(\d{4})$/;
const SUCCESSOR_TEXT = /successor edge|kallikratis successor|kleisthenis successor/i;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function parseLabel(label: string, precision: string, where: string): { precision: "day" | "year"; year: number; month: number | null; day: number | null } {
  if (precision === "day") {
    const match = ISO_DAY.exec(label.trim());
    if (!match) throw new Error(`Greece day label is not ISO at ${where}: ${JSON.stringify(label)}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
      throw new Error(`Invalid Gregorian date ${label} at ${where}`);
    }
    return { precision: "day", year, month, day };
  }
  if (precision === "year") {
    const match = ISO_YEAR.exec(label.trim());
    if (!match) throw new Error(`Greece year label is not a year at ${where}: ${JSON.stringify(label)}`);
    return { precision: "year", year: Number(match[1]), month: null, day: null };
  }
  throw new Error(`Unsupported Greece date precision ${precision} at ${where}`);
}

function precisionForProceedingDate(label: string, where: string): "day" | "year" {
  if (ISO_DAY.test(label.trim())) return "day";
  if (ISO_YEAR.test(label.trim())) return "year";
  throw new Error(`Greece proceeding date ${JSON.stringify(label)} is not day or year precision at ${where}`);
}

function pointerFor(index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number, sourceRow?: number | null): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: pointerFor(index),
    source_row: sourceRow ?? null,
  });
}

function sliceHash(inventory: GreeceInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: { derivedPath: string; derivedPointer?: string | null; sourceRow?: number | null }): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
    source_row: args.sourceRow ?? null,
  });
}

function mapTier(tier: string): string {
  if (tier === "municipal" || tier === "regional" || tier === "other") return tier;
  if (tier === "national") return "national_context";
  throw new Error(`Unsupported Greece classification tier ${JSON.stringify(tier)}`);
}

function expectedTier(officeType: string): string {
  if (officeType === "municipal_council" || officeType === "mayor") return "municipal";
  if (officeType === "regional_council" || officeType === "regional_governor") return "regional";
  if (officeType === "parliament" || officeType === "president") return "national";
  if (officeType === "european_parliament") return "other";
  throw new Error(`Unsupported Greece office type ${officeType}`);
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function assertScalarStatus(
  kind: "votes" | "share" | "seats",
  value: number | null,
  status: string,
  where: string,
): void {
  if (value == null) {
    if (status !== "unknown" && status !== "not_applicable" && status !== "structurally_unavailable") {
      throw new Error(`${kind} null with status ${status} at ${where}`);
    }
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${kind} is not finite at ${where}`);
  if ((kind === "votes" || kind === "seats") && !Number.isInteger(value)) throw new Error(`${kind} is not an integer at ${where}`);
  if (value < 0) throw new Error(`${kind} is negative at ${where}`);
  if (kind === "share" && value > 100) throw new Error(`share exceeds 100 at ${where}`);
  if (value === 0 && status !== "zero") throw new Error(`${kind} zero must stay status zero at ${where}`);
  if (value > 0 && status !== "recorded" && status !== "preliminary" && status !== "disputed" && status !== "superseded") {
    throw new Error(`${kind} ${value} has unsupported status ${status} at ${where}`);
  }
}

function assertParentAcyclic(rows: GreeceGeographyRow[]): void {
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

export function projectGreece(inventory: GreeceInventory): GreeceProjection {
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
    inventory.results.map((row) => row.result_row_id),
    "results",
  );
  for (const item of inventory.tracked) {
    if (item.input_path === OMITTED_SOURCES_DIR || item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
      throw new Error("Omitted Greece sources/ must not be hashed into the release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Greece offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Greece events, found ${inventory.events.length}`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Greece proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Greece results, found ${inventory.results.length}`);
  }
  if (inventory.observations.length !== EXPECTED_COUNTS.distinct_observations) {
    throw new Error(`Expected ${EXPECTED_COUNTS.distinct_observations} Greece ballot observations, found ${inventory.observations.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Greece geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Greece classifications`);
  }
  if (inventory.tiers.status !== "approved" || inventory.tiers.production_accepted !== true) {
    throw new Error("Greece tier file must stay the approved production-accepted bytes");
  }
  if (inventory.crosswalks.length !== EXPECTED_COUNTS.identity_crosswalks) {
    throw new Error(`Expected ${EXPECTED_COUNTS.identity_crosswalks} Greece identity crosswalks`);
  }

  const observationIds = new Set<string>();
  for (const row of inventory.observations) {
    if (!row.observation_id) throw new Error("Ballot observation is missing observation_id");
    if (observationIds.has(row.observation_id)) throw new Error(`Duplicate observation ${row.observation_id}`);
    observationIds.add(row.observation_id);
  }
  const resultObservationIds = new Set(inventory.results.map((row) => row.observation_id));
  if (resultObservationIds.size !== observationIds.size) {
    throw new Error(`Result observations ${resultObservationIds.size} != ballot observations ${observationIds.size}`);
  }
  for (const id of resultObservationIds) {
    if (!observationIds.has(id)) throw new Error(`Result observation ${id} is not in ballot-observations.jsonl.gz`);
  }

  const outgoing = inventory.epOutgoing;
  const outgoingText = JSON.stringify(outgoing);
  if (!outgoingText.includes("outgoing_parliament_NOT_1981_election_return")) {
    throw new Error("EP outgoing snapshot lost its not-an-election-return label");
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
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  const geographyHash = sliceHash(inventory, GEOGRAPHY_RELATIVE);
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  const holdsHash = sliceHash(inventory, SOURCE_HOLDS_RELATIVE);
  const crosswalkHash = sliceHash(inventory, CROSSWALK_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const countryGeo = inventory.geographies.find((row) => row.geography_id === "GR");
  if (!countryGeo || countryGeo.name !== COUNTRY_NAME) {
    throw new Error("Greece country geography GR drifted");
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
        local_source_holds: [...LOCAL_SOURCE_HOLD_AUTHORITIES],
        omitted_sources_dir: OMITTED_SOURCES_DIR,
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    if (dateIds.has(id)) throw new Error(`Greece date_id collided: ${id}`);
    dateIds.add(id);
    dates.push(row);
  };

  assertParentAcyclic(inventory.geographies);
  const geoById = new Set<string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (geoById.has(row.geography_id)) throw new Error(`Duplicate geography ${row.geography_id}`);
    geoById.add(row.geography_id);
    if (!row.name) throw new Error(`Geography ${row.geography_id} is missing a name`);
    const parent = row.parent_geography_id ?? null;
    if (parent === row.geography_id) throw new Error(`Geography ${row.geography_id} parents itself`);
    return {
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      parent_geography_id: parent,
      effective_from_label: row.effective_from_label ?? null,
      effective_to_label: row.effective_to_label ?? null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(GEOGRAPHY_RELATIVE, geographyHash, index), row }),
    };
  });
  for (const row of inventory.geographies) {
    const parent = row.parent_geography_id ?? null;
    if (row.geography_id === "GR") {
      if (parent) throw new Error("Country geography GR must not have a parent");
      continue;
    }
    if (!parent || !geoById.has(parent)) {
      throw new Error(`Geography ${row.geography_id} parent ${parent} is not authored`);
    }
  }

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, GreeceOfficeRow>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let currentDirect = 0;
  let historicalDirect = 0;
  let currentMunicipalCouncils = 0;
  let currentMayors = 0;
  let currentRegionalCouncils = 0;
  let currentGovernors = 0;
  let historicalCouncils = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Greece`);
    if (row.id_namespace !== N) throw new Error(`Office ${row.office_id} namespace is not ${N}`);
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted Greece office type ${row.office_type}`);
    if (row.successor_office_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}`);
    }
    if (SUCCESSOR_TEXT.test(JSON.stringify(row))) throw new Error(`Refusing successor language on ${row.office_id}`);
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} status ${row.office_status} is not current or historical`);
    }
    if (row.record_state !== "active") throw new Error(`Office ${row.office_id} record_state must stay active`);
    if (row.registry_qualified !== true) throw new Error(`Office ${row.office_id} is not registry qualified`);
    if (row.next_date != null || row.next_history_key != null) throw new Error(`Refusing an invented next date on ${row.office_id}`);
    if (!geoById.has(row.geography_id)) throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.review_status !== "needs_review") {
      throw new Error(`Office ${row.office_id} classification must stay needs_review`);
    }
    if (classification.human_review_required !== true) {
      throw new Error(`Office ${row.office_id} classification must stay human_review_required`);
    }
    if (classification.tier !== expectedTier(row.office_type) || classification.tier !== row.proposed_tier) {
      throw new Error(`Office ${row.office_id} tier ${classification.tier} does not match ${row.office_type}`);
    }
    const direct = row.direct_executive === true;
    if (row.office_type === "mayor" || row.office_type === "regional_governor") {
      if (!direct) throw new Error(`${row.office_id} must stay a direct executive`);
    } else if (direct) {
      throw new Error(`Refusing direct_executive on ${row.office_type} ${row.office_id}`);
    }
    if (row.office_id === PRESIDENT_ID) {
      if (row.election_mechanism !== "parliamentary_indirect" || row.direct_executive !== false) {
        throw new Error("GR-PRES must stay parliamentary_indirect and not a direct executive");
      }
    }
    if (row.office_id === EP_ID && (row.proposed_tier !== "other" || row.direct_executive !== false)) {
      throw new Error("GR-EP must stay other and not a direct executive");
    }
    if (row.office_status === "historical") {
      historicalOffices += 1;
      if (!row.office_id.includes("PRE2019")) throw new Error(`Historical office ${row.office_id} is not a PRE2019 pair`);
      if (row.office_type === "municipal_council") historicalCouncils += 1;
      if (direct) historicalDirect += 1;
    } else {
      currentOffices += 1;
      if (direct) currentDirect += 1;
      if (row.office_type === "municipal_council") currentMunicipalCouncils += 1;
      if (row.office_type === "mayor") currentMayors += 1;
      if (row.office_type === "regional_council") currentRegionalCouncils += 1;
      if (row.office_type === "regional_governor") currentGovernors += 1;
    }
    officeById.set(row.office_id, row);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: row.office_status,
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
  if (officeById.size !== classById.size) throw new Error("Greece classifications do not match the register");
  for (const id of [PRESIDENT_ID, PARLIAMENT_ID, EP_ID, MESSINI_COUNCIL_ID, MESSINI_MAYOR_ID]) {
    if (!officeById.has(id)) throw new Error(`Missing authored Greece office ${id}`);
  }

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

  const events: SqlRow[] = [];
  const eventByKey = new Map<string, { row: GreeceEventRow; dateId: string }>();
  let preliminaryEvents = 0;
  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    const office = officeById.get(row.office_id);
    if (!office) throw new Error(`Event ${row.event_id} office ${row.office_id} is not in the register`);
    if (row.id_namespace !== N) throw new Error(`Event ${row.event_id} namespace drifted`);
    const key = `${row.office_id}|${row.history_key}`;
    if (eventByKey.has(key)) throw new Error(`Duplicate event history ${key}`);
    if (!ALLOWED_EVENT_KIND.has(row.event_kind)) throw new Error(`Unsupported event_kind ${row.event_kind} on ${row.event_id}`);
    if (!ALLOWED_BALLOT.has(row.ballot_basis)) throw new Error(`Unsupported ballot_basis ${row.ballot_basis} on ${row.event_id}`);
    if (row.share_unit !== "percent_0_100") throw new Error(`Event ${row.event_id} share unit must stay percent_0_100`);
    if (!ALLOWED_LEGAL.has(row.legal_outcome)) {
      throw new Error(`Refusing to relabel legal_outcome ${row.legal_outcome} on ${row.event_id}`);
    }
    if (row.legal_outcome === "preliminary") preliminaryEvents += 1;
    if (row.office_id === PRESIDENT_ID) {
      if (row.event_kind !== "indirect" || row.ballot_basis !== "electors") {
        throw new Error(`Presidential event ${row.event_id} must stay indirect electors`);
      }
    }
    if (row.office_id === PARLIAMENT_ID && row.event_kind !== "unknown") {
      throw new Error(`Parliament event ${row.event_id} must stay event_kind unknown`);
    }
    const parsed = parseLabel(row.date, row.date_precision, row.event_id);
    const dateIdValue = dateId("event", row.event_id, "election");
    pushDate({
      date_id: dateIdValue,
      label: row.date,
      precision: parsed.precision,
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
    eventByKey.set(key, { row, dateId: dateIdValue });
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: row.event_kind,
      selected_history_role: "selected",
      electoral_system: office.election_mechanism,
      comparability: null,
      ballot_basis: row.ballot_basis,
      share_unit: "percent_0_100",
      legal_outcome: row.legal_outcome,
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(EVENTS_RELATIVE, eventsHash, i), row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingIds = new Set<string>();
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByKey.get(`${row.office_id}|${row.history_key}`);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (event.row.event_id !== row.event_id) throw new Error(`Proceeding ${row.proceeding_id} event_id drifted`);
    if (!ALLOWED_PROCEEDING_KIND.has(row.kind)) throw new Error(`Unsupported proceeding kind ${row.kind} on ${row.proceeding_id}`);
    if (row.supersedes_id) throw new Error(`Proceeding ${row.proceeding_id} must not supersede another proceeding`);
    if (!Number.isInteger(row.sequence_no) || row.sequence_no < 1) {
      throw new Error(`Proceeding ${row.proceeding_id} sequence is not a positive integer`);
    }
    if (proceedingIds.has(row.proceeding_id)) throw new Error(`Duplicate proceeding ${row.proceeding_id}`);
    proceedingIds.add(row.proceeding_id);
    const precision = precisionForProceedingDate(row.date, row.proceeding_id);
    const parsed = parseLabel(row.date, precision, row.proceeding_id);
    const dateIdValue = dateId("proceeding", row.proceeding_id, "ballot");
    pushDate({
      date_id: dateIdValue,
      label: row.date,
      precision: parsed.precision,
      certainty: "called",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i),
        row: { date: row.date },
      }),
    });
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.kind,
      sequence_no: row.sequence_no,
      supersedes_id: null,
      legal_outcome: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i), row }),
    });
  }

  const results: SqlRow[] = [];
  const resultIds = new Set<string>();
  let messiniTie = 0;
  let ep1981Results = 0;
  let messiniCouncilSeats = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    const event = eventByKey.get(`${row.office_id}|${row.history_key}`);
    if (!event) throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    if (event.row.event_id !== row.event_id) throw new Error(`Result ${row.result_row_id} event_id drifted`);
    if (row.id_namespace !== N || row.country_id !== COUNTRY_ID) throw new Error(`Result ${row.result_row_id} identity drifted`);
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    if (resultIds.has(row.result_row_id)) throw new Error(`Duplicate result ${row.result_row_id}`);
    resultIds.add(row.result_row_id);
    if (!row.observation_id || !observationIds.has(row.observation_id)) {
      throw new Error(`Result ${row.result_row_id} observation is not in the ballot file`);
    }
    if (row.party_mapping_id != null) throw new Error(`Refusing a party mapping on ${row.result_row_id}`);
    if (row.is_substitute != null) throw new Error(`Refusing a substitute flag on ${row.result_row_id}`);
    if (row.share_unit !== "percent_0_100") throw new Error(`Result ${row.result_row_id} share unit drifted`);
    if (row.evidence_status !== "recorded" && row.evidence_status !== "preliminary") {
      throw new Error(`Result ${row.result_row_id} evidence_status ${row.evidence_status} is not in the pack`);
    }
    assertScalarStatus("votes", row.votes, row.votes_status, row.result_row_id);
    assertScalarStatus("share", row.share, row.share_status, row.result_row_id);
    assertScalarStatus("seats", row.seats, row.seats_status, row.result_row_id);
    const office = officeById.get(row.office_id)!;
    if (row.elected_flag != null && row.elected_flag !== 0 && row.elected_flag !== 1) {
      throw new Error(`Result ${row.result_row_id} elected_flag is not 0, 1, or null`);
    }
    if (
      (office.office_type === "municipal_council" ||
        office.office_type === "regional_council" ||
        office.office_type === "parliament" ||
        office.office_type === "european_parliament") &&
      row.elected_flag != null
    ) {
      throw new Error(`Refusing an elected flag on assembly result ${row.result_row_id}`);
    }
    if (office.office_type === "mayor" || office.office_type === "regional_governor" || office.office_type === "president") {
      if (row.seats != null || row.seats_status !== "not_applicable") {
        throw new Error(`Executive result ${row.result_row_id} must not carry council seats`);
      }
    }
    if (row.office_id === PRESIDENT_ID && row.share != null) {
      throw new Error(`Refusing a popular share on presidential result ${row.result_row_id}`);
    }
    if (row.office_id === EP_ID && row.history_key === EP_1981_HISTORY_KEY) ep1981Results += 1;
    if (row.history_key === "1979" || row.history_key === "1979-1984") {
      throw new Error(`Refusing outgoing EP composition as a result ${row.result_row_id}`);
    }
    if (row.office_id === MESSINI_MAYOR_ID && row.history_key === MESSINI_HISTORY_KEY && row.votes === 9236) {
      messiniTie += 1;
      if (row.elected_flag != null) throw new Error("Messini 2014 tie must not gain a winner");
    }
    if (row.office_id === MESSINI_COUNCIL_ID && row.history_key === MESSINI_HISTORY_KEY && row.seats != null) {
      messiniCouncilSeats += row.seats;
    }
    results.push(resultRow(row, i, resultsHash, R));
  }
  if (messiniCouncilSeats !== 17) throw new Error(`Messini 2014 council seats ${messiniCouncilSeats} must stay the published 17`);

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
      record_key: recordKey("event", [N, row.office_id, row.history_key]),
      entity_kind: "event",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: EVENTS_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.proceedings.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      entity_kind: "proceeding",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: PROCEEDINGS_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.results.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      entity_kind: "result_row",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        derivedPath: RESULTS_RELATIVE,
        derivedPointer: `/${index}`,
        sourceRow: index + 1,
      }),
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

  const unresolved: SqlRow[] = [];
  for (let i = 0; i < inventory.gaps.length; i++) {
    const gap = inventory.gaps[i]!;
    const occurrence = { input_path: GAPS_RELATIVE, json_pointer: `/${i}`, id: gap.gap_id };
    unresolved.push({
      unresolved_id: greeceUnresolvedId(countryRec, occurrence, gap.gap_id),
      record_key: countryRec,
      original_token: gap.gap_id,
      source_locator: canonical(occurrence),
      reason: gap.finding,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: GAPS_RELATIVE, sha256: gapsHash, json_pointer: `/${i}` }),
        row: gap,
      }),
    });
  }
  for (let i = 0; i < inventory.sourceHolds.length; i++) {
    const hold = inventory.sourceHolds[i]!;
    if (hold.kind !== "local_source_hold") throw new Error(`Source hold ${hold.authority} is not a local source hold`);
    const occurrence = { input_path: SOURCE_HOLDS_RELATIVE, json_pointer: `/${i}`, authority: hold.authority };
    unresolved.push({
      unresolved_id: greeceUnresolvedId(countryRec, occurrence, hold.authority),
      record_key: countryRec,
      original_token: hold.authority,
      source_locator: canonical(occurrence),
      reason: `Local source hold ${hold.authority} stays open. partial_station_snapshot=${hold.partial_station_snapshot}; incomplete_seat_allocation=${hold.incomplete_seat_allocation}; winner_missing=${hold.winner_missing}; expected_council_size=${hold.expected_council_size ?? "null"}; published_seats_total=${hold.published_seats_total ?? "null"}.`,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: SOURCE_HOLDS_RELATIVE, sha256: holdsHash, json_pointer: `/${i}` }),
        row: hold,
      }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkKeys = new Set<string>();
  for (let i = 0; i < inventory.crosswalks.length; i++) {
    const row = inventory.crosswalks[i]!;
    if (row.entity_kind !== "office") throw new Error(`Crosswalk ${row.upstream_id} is not an office identity`);
    if (!officeById.has(row.office_id)) throw new Error(`Crosswalk office ${row.office_id} is not in the register`);
    if (SUCCESSOR_TEXT.test(row.reason) || SUCCESSOR_TEXT.test(row.upstream_id)) {
      throw new Error(`Refusing a successor crosswalk for ${row.office_id}`);
    }
    const key = `${row.entity_kind}|${row.upstream_namespace}|${row.upstream_id}`;
    if (crosswalkKeys.has(key)) throw new Error(`Duplicate crosswalk ${key}`);
    crosswalkKeys.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: recordKey("office", [N, row.office_id]),
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(CROSSWALK_RELATIVE, crosswalkHash, i), row }),
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
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: events.length,
    prospective_events: 0,
    total_events: events.length,
    proceedings: proceedings.length,
    result_rows: results.length,
    distinct_observations: observationIds.size,
    municipal_offices: tierCounts.municipal,
    regional_offices: tierCounts.regional,
    national_offices: tierCounts.national,
    other_offices: tierCounts.other,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    local_source_holds: inventory.sourceHolds.length,
    party_mappings: 0,
    identity_crosswalks: crosswalks.length,
    successor_edges: successorEdges,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    current_direct_executive_offices: currentDirect,
    historical_direct_executive_offices: historicalDirect,
    direct_executive_offices: currentDirect + historicalDirect,
    current_municipal_councils: currentMunicipalCouncils,
    current_mayors: currentMayors,
    current_regional_councils: currentRegionalCouncils,
    current_governors: currentGovernors,
    current_councils_plus_parliament: currentMunicipalCouncils + currentRegionalCouncils + (officeById.has(PARLIAMENT_ID) ? 1 : 0),
    historical_councils: historicalCouncils,
    evidence_links: 0,
    ep_1981_result_rows: ep1981Results,
    messini_runoff_tie_rows: messiniTie,
    preliminary_events: preliminaryEvents,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Greece ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Greece Prompt AM Rebuilt register. Justin accepted 693 current and 10 historical offices with named holds GR-G01–GR-G10 and 14 local source holds left open. 2774 events, 3555 proceedings, and 14004 result rows from 8021 observations. Do not invent sources, Kallikratis successor edges, popular presidential ballots, or zero-filled gaps.",
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
        local_source_holds: LOCAL_SOURCE_HOLD_AUTHORITIES.length,
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
    proceedings,
    sources: [],
    results,
    locators,
    evidence: [],
    unresolved,
    crosswalks,
    validatedCounts,
  };
}

function resultRow(row: GreeceResultRow, index: number, resultsHash: string, releaseId: string): SqlRow {
  return {
    id_namespace: OFFICE_NAMESPACE,
    office_id: row.office_id,
    history_key: row.history_key,
    result_row_id: row.result_row_id,
    proceeding_id: row.proceeding_id,
    country_id: COUNTRY_ID,
    candidate_or_list_label: row.candidate_or_list_label,
    original_party_label: row.original_party_label,
    original_party_code: row.original_party_code,
    party_namespace: null,
    party_mapping_id: null,
    votes: row.votes,
    votes_status: row.votes_status,
    share: row.share,
    share_status: row.share_status,
    share_unit: "percent_0_100",
    seats: row.seats,
    seats_status: row.seats_status,
    elected_flag: row.elected_flag,
    is_substitute: null,
    evidence_status: row.evidence_status,
    lineage_id: LINEAGE_ID,
    release_id: releaseId,
    raw_json: rawEnvelope({
      origin: originFor(RESULTS_RELATIVE, resultsHash, index, index + 1),
      row,
    }),
  };
}
