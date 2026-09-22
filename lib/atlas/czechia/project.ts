import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  BOROUGH_EXAMPLE_ID,
  CHAMBER_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID,
  LOCAL_COUNCIL_TYPES,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  PRAGUE_ASSEMBLY_ID,
  PRAGUE_RECORD_KEY,
  PRESIDENT_ID,
  PROCEEDINGS_RELATIVE,
  PROSPECTIVE_EXAMPLE_EVENT_ID,
  PROSPECTIVE_EXAMPLE_HISTORY_KEY,
  PROSPECTIVE_LOCAL_DATE,
  REGISTER_RELATIVE,
  REGIONAL_2008_EVENT_ID,
  REGIONAL_2008_HISTORY_KEY,
  REGIONAL_EXAMPLE_ID,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SENATE_ID,
  SENATE_REPEAT_EVENT_ID,
  SENATE_REPEAT_HISTORY_KEY,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  czechiaEvidenceId,
  czechiaUnresolvedId,
  dateId,
  eventIdFor,
  isCouncilSelectedExecutive,
  isFixtureId,
  locator,
  proceedingIdFor,
  prospectiveHistoryKey,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  CzechiaEvidenceRef,
  CzechiaEventRow,
  CzechiaInventory,
  CzechiaOfficeRow,
  CzechiaSourceRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type CzechiaProjection = {
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

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_LABEL = /^(\d{4})$/;
const ALLOWED_TYPES = new Set<string>(ALLOWED_OFFICE_TYPES);
const ALLOWED_CERTAINTY = new Set(["called", "statutory", "expected", "conditional", "unknown"]);
const ALLOWED_EVENT_KIND = new Set(["ordinary", "special", "repeated", "indirect", "unknown"]);
const ALLOWED_BALLOT = new Set([
  "valid_votes",
  "list_votes",
  "candidate_marks",
  "electors",
  "including_blank_invalid",
  "unknown",
]);
const ALLOWED_SHARE = new Set(["percent_0_100", "proportion_0_1"]);
const ALLOWED_LEGAL = new Set(["unknown", "not_held", "certified", "annulled", "preliminary", "disputed", "superseded"]);
const ALLOWED_CROSSWALK_NS = new Set(["csu:KODZASTUP", "csu:KRZAST", "atlas-czechia-body-name/1"]);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Czechia date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function parseYearLabel(label: string): number {
  const match = YEAR_LABEL.exec(label.trim());
  if (!match) throw new Error(`Czechia year label is not a four-digit year: ${JSON.stringify(label)}`);
  return Number(match[1]);
}

function pointerFor(index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number, field?: string): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: field ? `/${index}/${field}` : pointerFor(index),
  });
}

function sliceHash(inventory: CzechiaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: {
  inputPath: string;
  sha256: string;
  locatorText?: string | null;
  derivedPointer?: string;
}): string {
  return canonical({
    derived_path: null,
    derived_pointer: args.derivedPointer ?? null,
    input_path: args.inputPath,
    locator: args.locatorText ?? null,
    sha256: args.sha256,
  });
}

function mapTier(tier: string): string | null {
  if (tier === "municipal" || tier === "regional" || tier === "other" || tier === "national_context") return tier;
  if (tier === "national") return "national_context";
  if (tier === "unknown") return null;
  throw new Error(`Unsupported Czechia classification tier ${JSON.stringify(tier)}`);
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function assertParentAcyclic(rows: Array<{ geography_id: string; parent_geography_id?: string | null }>): void {
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

export function projectCzechia(inventory: CzechiaInventory): CzechiaProjection {
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
    inventory.proceedings.map((row) => row.proceeding_id),
    "proceedings",
  );
  for (const item of inventory.tracked) {
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Czechia offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Czechia events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Czechia geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Czechia proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Czechia classifications`);
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
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Česká republika",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: REGISTER_RELATIVE,
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        name: "Česká republika",
        language: "cs",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [...NAMED_HOLDS],
        omitted_results: "data/research/czechia/results.jsonl.gz",
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateById = new Map<string, SqlRow>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    const existing = dateById.get(id);
    if (existing) {
      if (existing.label !== row.label || existing.precision !== row.precision || existing.certainty !== row.certainty) {
        throw new Error(`Conflicting Czechia research_date ${id}`);
      }
      return;
    }
    dateById.set(id, row);
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id != null && row.country_id !== COUNTRY_ID) {
      throw new Error(`Geography ${row.geography_id} is not Czechia`);
    }
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(GEOGRAPHY_RELATIVE, sliceHash(inventory, GEOGRAPHY_RELATIVE), index);
    return {
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      parent_geography_id: row.parent_geography_id ?? null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    };
  });
  for (const row of geographies) {
    if (row.parent_geography_id && !geoById.has(String(row.parent_geography_id))) {
      throw new Error(`Geography ${row.geography_id} parent ${row.parent_geography_id} is not authored`);
    }
  }
  assertParentAcyclic(inventory.geographies);

  const historyKeys = new Set(inventory.events.map((row) => row.history_key));
  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, CzechiaOfficeRow>();
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDates = 0;
  let nextHistoryKeys = 0;
  let boroughCouncils = 0;
  let regionalAssemblies = 0;
  let pragueAssemblies = 0;
  let directNational = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Czechia`);
    if (!ALLOWED_TYPES.has(row.office_type)) {
      throw new Error(`Refusing unlisted Czechia office type ${row.office_type} on ${row.office_id}`);
    }
    if (isCouncilSelectedExecutive(row.office_type, row.name)) {
      throw new Error(`Refusing council-selected executive office ${row.office_id}`);
    }
    if (row.successor_office_id || row.successor_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}; historical codes stay unbound`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing an approved classification`);
    if (row.office_type === "borough_council") {
      boroughCouncils += 1;
      if (classification.tier !== "other") {
        throw new Error(`Borough ${row.office_id} must stay other; refusing reclassification to ${classification.tier}`);
      }
    }
    if (row.office_type === "regional_assembly") {
      regionalAssemblies += 1;
      if (classification.tier !== "regional") {
        throw new Error(`Regional assembly ${row.office_id} must stay regional`);
      }
    }
    if (row.office_type === "capital_regional_municipal_assembly") {
      pragueAssemblies += 1;
      if (row.office_id !== PRAGUE_ASSEMBLY_ID) {
        throw new Error(`Refusing a second Prague-style assembly ${row.office_id}`);
      }
      if (classification.tier !== "regional") {
        throw new Error("Prague city assembly must stay the single drafted regional body");
      }
    }
    if (row.office_type === "municipal_council" && classification.tier !== "municipal") {
      throw new Error(`Municipal council ${row.office_id} must stay municipal`);
    }
    if (row.office_type === "direct_national_executive") {
      directNational += 1;
      if (row.office_id !== PRESIDENT_ID || classification.tier !== "national") {
        throw new Error("President is the only direct national executive");
      }
    }
    if (
      (row.office_type === "national_lower_chamber" || row.office_type === "national_upper_chamber") &&
      classification.tier !== "national"
    ) {
      throw new Error(`${row.office_id} must stay national`);
    }
    if (row.office_type === "european_parliament_delegation" && classification.tier !== "other") {
      throw new Error("Czech EP delegation must stay other");
    }
    officeIds.add(row.office_id);
    officeById.set(row.office_id, row);
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} has unsupported status ${row.office_status}`);
    }
    const historical = row.office_status === "historical";
    if (historical) historicalOffices += 1;
    else currentOffices += 1;

    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    let nextHistoryKey: string | null = null;
    if (!row.next_election && row.office_status === "current" && LOCAL_COUNCIL_TYPES.has(row.office_type)) {
      throw new Error(`Current local council ${row.office_id} is missing the sourced 2026-10-09 next date`);
    }
    if (row.next_election) {
      if (!LOCAL_COUNCIL_TYPES.has(row.office_type) || historical) {
        throw new Error(`Refusing to attach a local next date to ${row.office_id}`);
      }
      if (row.next_election.precision !== "day" || row.next_election.value !== PROSPECTIVE_LOCAL_DATE) {
        throw new Error(`Czechia next date for ${row.office_id} must stay the sourced first polling day`);
      }
      if (row.next_election.certainty !== "called") {
        throw new Error(`Czechia next date certainty for ${row.office_id} must stay called`);
      }
      const parsed = parseDayLabel(row.next_election.value);
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextDates += 1;
      const historyKey = prospectiveHistoryKey(row.office_id);
      if (!historyKeys.has(historyKey)) {
        throw new Error(`Missing prospective event ${historyKey} for ${row.office_id}`);
      }
      nextHistoryKey = historyKey;
      nextHistoryKeys += 1;
      pushDate({
        date_id: nextDateId,
        label: row.next_election.value,
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
          origin: originFor(REGISTER_RELATIVE, registerHash, i, "next_election"),
          row: row.next_election,
        }),
      });
    }
    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
    const officeRec = recordKey("office", [N, row.office_id]);
    if (row.office_id === PRAGUE_ASSEMBLY_ID && officeRec !== PRAGUE_RECORD_KEY) {
      throw new Error(`Prague assembly record_key drifted: ${officeRec}`);
    }
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: null,
      registry_qualified: 1,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: nextHistoryKey,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row.tier);
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: mapped == null ? "unknown" : needsReview ? "needs_review" : "approved",
      rationale: row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "" }),
        row,
      }),
    };
  });

  const events: SqlRow[] = [];
  const eventByHk = new Map<string, CzechiaEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let prospectiveEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let repeatedEvents = 0;
  let specialEvents = 0;
  let notHeldEvents = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    const expectedEventId = eventIdFor(row.history_key);
    if (row.event_id !== expectedEventId) {
      throw new Error(`Event id drift for ${row.history_key}: ${row.event_id} != ${expectedEventId}`);
    }
    eventByHk.set(row.history_key, row);
    const dateValue = row.date?.value;
    const precision = row.date?.precision;
    const certainty = row.date?.certainty;
    if (!dateValue || !precision || !certainty) throw new Error(`Event ${row.history_key} is missing a sourced date`);
    if (!ALLOWED_CERTAINTY.has(certainty)) {
      throw new Error(`Unsupported date certainty ${certainty} on ${row.history_key}`);
    }
    const dateIdValue = dateId("event", row.event_id, "election");
    if (precision === "year") {
      const year = parseYearLabel(dateValue);
      eventDatesYear += 1;
      pushDate({
        date_id: dateIdValue,
        label: dateValue,
        precision: "year",
        certainty,
        year,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
          row: row.date,
        }),
      });
    } else if (precision === "day") {
      const parsed = parseDayLabel(dateValue);
      eventDatesDay += 1;
      pushDate({
        date_id: dateIdValue,
        label: dateValue,
        precision: "day",
        certainty,
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
          row: row.date,
        }),
      });
    } else {
      throw new Error(`Event ${row.history_key} has unsupported date precision ${precision}`);
    }

    const role = row.selected_history_role;
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else if (role === "none") prospectiveEvents += 1;
    else throw new Error(`Unsupported selected_history_role ${role} for ${row.history_key}`);

    const shareUnit = row.share_unit;
    if (!shareUnit || !ALLOWED_SHARE.has(shareUnit)) {
      throw new Error(`Unsupported share_unit ${shareUnit} on ${row.history_key}`);
    }
    const ballotBasis = row.ballot_basis;
    if (!ballotBasis || !ALLOWED_BALLOT.has(ballotBasis)) {
      throw new Error(`Unsupported ballot_basis ${ballotBasis} on ${row.history_key}`);
    }
    const eventKind = row.event_kind;
    if (!eventKind || !ALLOWED_EVENT_KIND.has(eventKind)) {
      throw new Error(`Unsupported event_kind ${eventKind} on ${row.history_key}`);
    }
    const legalOutcome = row.legal_outcome;
    if (!legalOutcome || !ALLOWED_LEGAL.has(legalOutcome)) {
      throw new Error(`Unsupported legal_outcome ${legalOutcome} on ${row.history_key}`);
    }
    if (eventKind === "repeated") repeatedEvents += 1;
    if (eventKind === "special") specialEvents += 1;
    if (legalOutcome === "not_held") notHeldEvents += 1;
    if (legalOutcome === "certified" || legalOutcome === "preliminary") {
      throw new Error(`Refusing to upgrade legal_outcome on ${row.history_key}; LEGAL-OUTCOME-REPEAT-AUDIT stays open`);
    }
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: eventKind,
      selected_history_role: role,
      electoral_system: null,
      comparability: null,
      ballot_basis: ballotBasis,
      share_unit: shareUnit,
      legal_outcome: legalOutcome,
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  let firstRounds = 0;
  let runoffs = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (event.office_id !== row.office_id) {
      throw new Error(`Proceeding ${row.proceeding_id} office does not match its event`);
    }
    if (row.kind !== "first_round" && row.kind !== "runoff") {
      throw new Error(`Unsupported Czechia proceeding kind ${JSON.stringify(row.kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Proceeding ${row.proceeding_id} must not supersede the first round`);
    }
    if (row.kind === "first_round" && row.sequence_no !== 1) {
      throw new Error(`First round ${row.proceeding_id} must stay sequence 1`);
    }
    if (row.kind === "runoff" && row.sequence_no !== 2) {
      throw new Error(`Runoff ${row.proceeding_id} must stay sequence 2`);
    }
    const expectedId = proceedingIdFor(row.office_id, row.history_key, row.sequence_no);
    if (row.proceeding_id !== expectedId) {
      throw new Error(`Proceeding id drift for ${row.history_key}: ${row.proceeding_id} != ${expectedId}`);
    }
    if (row.kind === "first_round") firstRounds += 1;
    else runoffs += 1;
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.kind,
      sequence_no: row.sequence_no,
      supersedes_id: null,
      legal_outcome: row.legal_outcome ?? "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Map<string, CzechiaSourceRow>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Czechia source catalogue row ${i} is missing source_id/input_path`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Czechia source_id ${row.source_id}`);
    if (row.source_namespace && row.source_namespace !== SOURCE_NAMESPACE) {
      throw new Error(`Source ${row.source_id} namespace is not ${SOURCE_NAMESPACE}`);
    }
    sourceById.set(row.source_id, row);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? null,
      url: row.url ?? null,
      checked_as_of_label: row.checked_as_of ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: null,
      file_sha256: row.sha256 ?? null,
      locator: row.input_path,
      data_rights: row.data_rights ?? "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  const blankLocator = {
    country_id: null as string | null,
    geography_id: null as string | null,
    id_namespace: null as string | null,
    office_id: null as string | null,
    history_key: null as string | null,
    proceeding_id: null as string | null,
    result_row_id: null as string | null,
    party_namespace: null as string | null,
    party_mapping_id: null as string | null,
    source_namespace: null as string | null,
    source_id: null as string | null,
    input_path: null as string | null,
  };
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator,
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({
      inputPath: REGISTER_RELATIVE,
      sha256: registerHash,
      derivedPointer: "/0",
    }),
  });
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      entity_kind: "geography",
      ...blankLocator,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: GEOGRAPHY_RELATIVE,
        sha256: sliceHash(inventory, GEOGRAPHY_RELATIVE),
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, row.office_id]),
      entity_kind: "office",
      ...blankLocator,
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: REGISTER_RELATIVE,
        sha256: registerHash,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.events.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("event", [N, row.office_id, row.history_key]),
      entity_kind: "event",
      ...blankLocator,
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: EVENTS_RELATIVE,
        sha256: eventsHash,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.proceedings.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      entity_kind: "proceeding",
      ...blankLocator,
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: PROCEEDINGS_RELATIVE,
        sha256: proceedingsHash,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const row of sources) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
      entity_kind: "source",
      ...blankLocator,
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id as string,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: SOURCES_RELATIVE,
        sha256: sourcesHash,
        locatorText: String(row.locator),
      }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, R, item.input_path]),
      entity_kind: "input",
      ...blankLocator,
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: item.input_path,
        sha256: item.sha256,
      }),
    });
  }

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: {
    recordKey: string;
    refs: CzechiaEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      const source = sourceById.get(ref.source_id);
      if (!source) {
        throw new Error(`Broken evidence source FK ${ref.source_id} on ${args.recordKey}`);
      }
      if (source.input_path !== ref.input_path) {
        throw new Error(`Evidence input_path for ${ref.source_id} does not match the source catalogue`);
      }
      const evidenceId = czechiaEvidenceId(
        args.recordKey,
        ref.source_id,
        ref.input_path,
        ref.archive_entry ?? null,
        ref.locator ?? null,
        args.claimKind,
      );
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: ref.source_id,
        source_locator: canonical(ref),
        claim_kind: args.claimKind,
        date_claim_id: args.dateClaimId ?? null,
        claim_json: canonical(args.claim),
        lineage_id: L,
        release_id: R,
      });
    }
  };

  for (const row of inventory.geographies) {
    pushEvidence({
      recordKey: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      refs: row.evidence,
      claimKind: "institutional_mode",
      claim: { geography_id: row.geography_id },
    });
  }
  for (const row of inventory.offices) {
    const rec = recordKey("office", [N, row.office_id]);
    pushEvidence({
      recordKey: rec,
      refs: row.evidence,
      claimKind: "register_identity",
      claim: { office_id: row.office_id },
    });
    if (row.next_election?.evidence) {
      pushEvidence({
        recordKey: rec,
        refs: row.next_election.evidence,
        claimKind: "next_date",
        dateClaimId: dateId("office", row.office_id, "next"),
        claim: { office_id: row.office_id, value: row.next_election.value, precision: row.next_election.precision },
      });
    }
  }
  for (const event of events) {
    const source = eventByHk.get(String(event.history_key))!;
    pushEvidence({
      recordKey: recordKey("event", [N, event.office_id, event.history_key]),
      refs: source.evidence,
      claimKind: "election_date",
      dateClaimId: event.date_id ? String(event.date_id) : null,
      claim: { history_key: event.history_key, date: source.date?.value ?? null },
    });
  }
  for (const row of inventory.proceedings) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      refs: row.evidence,
      claimKind: "institutional_mode",
      claim: { proceeding_id: row.proceeding_id, kind: row.kind, sequence_no: row.sequence_no },
    });
  }

  const unresolved: SqlRow[] = [];
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  const gapTokens = new Set<string>();
  for (let i = 0; i < inventory.researchGaps.length; i++) {
    const row = inventory.researchGaps[i]!;
    if (row.status && row.status !== "open") {
      throw new Error(`Named hold ${row.original_token} must stay open`);
    }
    gapTokens.add(row.original_token);
    const origin = originFor(GAPS_RELATIVE, gapsHash, i);
    unresolved.push({
      unresolved_id: czechiaUnresolvedId(countryRec, row.original_token),
      record_key: countryRec,
      original_token: row.original_token,
      source_locator: canonical({ input_path: GAPS_RELATIVE, json_pointer: `/${i}` }),
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  for (const token of NAMED_HOLDS) {
    if (!gapTokens.has(token)) throw new Error(`Named hold ${token} is missing from research-gaps.json`);
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (row.entity_kind != null && row.entity_kind !== "office") {
      throw new Error(`Unsupported crosswalk entity_kind ${row.entity_kind}`);
    }
    if (!ALLOWED_CROSSWALK_NS.has(row.upstream_namespace)) {
      throw new Error(`Unsupported Czechia crosswalk namespace ${row.upstream_namespace}`);
    }
    if (!officeIds.has(row.target_office_id)) {
      throw new Error(`Crosswalk target ${row.target_office_id} is not in the accepted register`);
    }
    const key = `office\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(key)) throw new Error(`Duplicate crosswalk ${key}`);
    crosswalkSeen.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: recordKey("office", [N, row.target_office_id]),
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: canonical(row),
    });
  }

  const municipal = tiers.filter((row) => row.tier === "municipal").length;
  const regional = tiers.filter((row) => row.tier === "regional").length;
  const national = tiers.filter((row) => row.tier === "national_context").length;
  const other = tiers.filter((row) => row.tier === "other").length;
  const councilAssemblies =
    boroughCouncils + regionalAssemblies + pragueAssemblies + inventory.offices.filter((row) => row.office_type === "municipal_council").length;
  const validatedCounts = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: selectedHistories,
    other_histories: otherHistories,
    prospective_events: prospectiveEvents,
    total_events: events.length,
    result_rows: results.length,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    borough_councils: boroughCouncils,
    regional_assemblies: regionalAssemblies,
    prague_assemblies: pragueAssemblies,
    direct_national_executives: directNational,
    direct_local_executives: 0,
    council_assembly_offices: councilAssemblies,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDatesDay,
    event_dates_year_called: eventDatesYear,
    next_dates_day_called: nextDates,
    next_history_keys: nextHistoryKeys,
    proceedings: proceedings.length,
    proceedings_first_round: firstRounds,
    proceedings_runoff: runoffs,
    party_mappings: 0,
    successor_edges: successorEdges,
    repeated_events: repeatedEvents,
    special_events: specialEvents,
    not_held_events: notHeldEvents,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Czechia ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  if (!officeIds.has(HISTORICAL_EXAMPLE_ID) || !officeIds.has(PRESIDENT_ID) || !officeIds.has(PRAGUE_ASSEMBLY_ID)) {
    throw new Error("Czechia anchor offices are missing from the register");
  }
  if (!eventByHk.has(REGIONAL_2008_HISTORY_KEY) || eventByHk.get(REGIONAL_2008_HISTORY_KEY)?.event_id !== REGIONAL_2008_EVENT_ID) {
    throw new Error("Středočeský 2008 year-precision event identity drifted");
  }
  if (
    !eventByHk.has(PROSPECTIVE_EXAMPLE_HISTORY_KEY) ||
    eventByHk.get(PROSPECTIVE_EXAMPLE_HISTORY_KEY)?.event_id !== PROSPECTIVE_EXAMPLE_EVENT_ID
  ) {
    throw new Error("2026-10-09 prospective event identity drifted");
  }
  if (
    !eventByHk.has(SENATE_REPEAT_HISTORY_KEY) ||
    eventByHk.get(SENATE_REPEAT_HISTORY_KEY)?.event_id !== SENATE_REPEAT_EVENT_ID
  ) {
    throw new Error("Senate repeat event identity drifted");
  }
  if (!officeIds.has(BOROUGH_EXAMPLE_ID) || !officeIds.has(REGIONAL_EXAMPLE_ID) || !officeIds.has(CHAMBER_ID)) {
    throw new Error("Czechia example offices are missing");
  }
  if (!officeIds.has(SENATE_ID) || !officeIds.has(EP_ID)) {
    throw new Error("Senate or EP office is missing");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "New sourced Czech elected-body research; whole council roster, Senate constituency-scoped histories, President and EP; named semantic and territorial holds. Prompt V accepted 6,411 current + 13 historical offices.",
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
      row: { fingerprint: inventory.fingerprint, release_id: R, coverage_complete: false },
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
    sources,
    results,
    locators,
    evidence,
    unresolved,
    crosswalks,
    validatedCounts,
  };
}
