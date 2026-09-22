import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  BISKUPIJA_2017_HISTORY_KEY,
  BISKUPIJA_DEPUTY_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  DEPUTY_EXAMPLE_ID,
  DUGO_SELO_2017_EVENT_ID,
  DUGO_SELO_2017_HISTORY_KEY,
  DUGO_SELO_COUNCIL_ID,
  DUGO_SELO_EXECUTIVE_ID,
  EP_2013_EVENT_ID,
  EP_2013_HISTORY_KEY,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  FORBIDDEN_ZAGREB_DUPLICATE_IDS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  HISTORICAL_DEPUTY_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  PRESIDENT_ID,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULT_EXAMPLE_ID,
  RESULTS_RELATIVE,
  SABOR_ID,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  STARI_GRAD_2017_HISTORY_KEY,
  STARI_GRAD_THIRD_PROCEEDING_ID,
  TAR_VABRIGA_EVENT_ID,
  TAR_VABRIGA_HISTORY_KEY,
  TAR_VABRIGA_OFFICE_ID,
  TIER_PATH,
  TIER_SHA256,
  ZAGREB_COUNCIL_ID,
  ZAGREB_EXECUTIVE_ID,
  ZAGREB_GEOGRAPHY_ID,
  ZAGREBACKA_COUNCIL_ID,
  ZAGREBACKA_EXECUTIVE_ID,
  canonical,
  croatiaEvidenceId,
  croatiaUnresolvedId,
  dateId,
  eventIdFor,
  isFixtureId,
  locator,
  proceedingIdFor,
  publisherFor,
  rawEnvelope,
  recordKey,
  resultIdFor,
  type Locator,
} from "./identity";
import type {
  CroatiaEvidenceRef,
  CroatiaEventRow,
  CroatiaInventory,
  CroatiaOfficeRow,
  CroatiaSourceRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type CroatiaProjection = {
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
const ALLOWED_EVENT_KIND = new Set(["ordinary", "special", "repeated", "indirect", "unknown"]);
const ALLOWED_BALLOT = new Set([
  "valid_votes",
  "list_votes",
  "candidate_marks",
  "electors",
  "including_blank_invalid",
  "unknown",
]);
const ALLOWED_ROLE = new Set(["selected", "other", "none"]);
const ALLOWED_CROSSWALK_NS = new Set([
  "dip:local-ballot:2017",
  "dip:local-ballot:2021",
  "dip:local-ballot:2025",
  "atlas-croatia-evidenced-body/1",
]);
const NULL_VOTE_STATUS = new Set(["unknown", "not_applicable", "structurally_unavailable"]);
const OPEN_STATUS = new Set(["preliminary", "disputed", "superseded"]);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Croatia date is not a valid ISO day: ${JSON.stringify(label)}`);
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
  if (!match) throw new Error(`Croatia year label is not a four-digit year: ${JSON.stringify(label)}`);
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
    source_row: relativePath.endsWith(".jsonl.gz") ? index + 1 : null,
  });
}

function sliceHash(inventory: CroatiaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: {
  inputPath: string;
  sha256: string;
  locatorText?: string | null;
  derivedPointer?: string;
  sourceRow?: number | null;
}): string {
  return canonical({
    derived_path: null,
    derived_pointer: args.derivedPointer ?? null,
    input_path: args.inputPath,
    locator: args.locatorText ?? null,
    sha256: args.sha256,
    source_row: args.sourceRow ?? null,
  });
}

function mapTier(tier: string): string | null {
  if (tier === "municipal" || tier === "regional" || tier === "other" || tier === "national_context") return tier;
  if (tier === "national") return "national_context";
  if (tier === "unknown") return null;
  throw new Error(`Unsupported Croatia classification tier ${JSON.stringify(tier)}`);
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

function assertScalar(
  value: number | null | undefined,
  status: string | undefined,
  kind: "votes" | "share" | "seats",
  where: string,
): number | null {
  if (kind === "seats") {
    if (value != null || status !== "unknown") {
      throw new Error(`Refusing typed seats on ${where}; SEATS-AND-LEGAL-FINALITY stays open`);
    }
    return null;
  }
  if (value == null) {
    if (!status || !NULL_VOTE_STATUS.has(status)) {
      throw new Error(`${kind} on ${where} is null with status ${JSON.stringify(status)}`);
    }
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${kind} on ${where} is not a non-negative number`);
  }
  if (kind === "votes" && !Number.isInteger(value)) {
    throw new Error(`votes on ${where} must stay a whole number`);
  }
  if (kind === "share" && value > 100) {
    throw new Error(`share on ${where} exceeds percent_0_100`);
  }
  if (value === 0) {
    if (status !== "zero" && !(status && OPEN_STATUS.has(status))) {
      throw new Error(`${kind} zero on ${where} must stay status zero`);
    }
    return value;
  }
  if (status !== "recorded" && !(status && OPEN_STATUS.has(status))) {
    throw new Error(`${kind} on ${where} has unsupported status ${JSON.stringify(status)}`);
  }
  return value;
}

export function projectCroatia(inventory: CroatiaInventory): CroatiaProjection {
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
  rejectFixtures(
    inventory.results.map((row) => row.result_row_id),
    "results",
  );
  for (const item of inventory.tracked) {
    if (item.input_path.endsWith(".jsonl.gz") || item.input_path.endsWith(".json.gz")) continue;
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Croatia offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Croatia events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Croatia results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Croatia geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Croatia proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Croatia classifications`);
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
    name: "Republika Hrvatska",
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
        name: "Republika Hrvatska",
        language: "hr",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [...NAMED_HOLDS],
        omitted_sources: "data/research/croatia/sources/",
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
        throw new Error(`Conflicting Croatia research_date ${id}`);
      }
      return;
    }
    dateById.set(id, row);
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
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

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, CroatiaOfficeRow>();
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let executiveTickets = 0;
  let currentDeputies = 0;
  let historicalDeputies = 0;
  let assemblies = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.id_namespace !== N) throw new Error(`Office ${row.office_id} namespace is not ${N}`);
    if (!ALLOWED_TYPES.has(row.office_type)) {
      throw new Error(`Refusing unlisted Croatia office type ${row.office_type} on ${row.office_id}`);
    }
    if (row.successor_office_id || row.successor_id || row.raw?.successor_office_id || row.raw?.successor_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}`);
    }
    if ((FORBIDDEN_ZAGREB_DUPLICATE_IDS as readonly string[]).includes(row.office_id)) {
      throw new Error(`Refusing duplicate Zagreb office ${row.office_id}; ZAGREB-DUAL stays one HR-Z21 pair`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing an approved classification`);
    if (row.proposed_tier && row.proposed_tier !== classification.tier) {
      throw new Error(`Office ${row.office_id} proposed tier ${row.proposed_tier} does not match ${classification.tier}`);
    }
    if (row.office_id === ZAGREB_COUNCIL_ID || row.office_id === ZAGREB_EXECUTIVE_ID) {
      if (classification.tier !== "regional" || row.geography_id !== ZAGREB_GEOGRAPHY_ID) {
        throw new Error("Zagreb dual pair must stay the single regional HR-Z21 body");
      }
    }
    if (row.office_id === ZAGREBACKA_COUNCIL_ID || row.office_id === ZAGREBACKA_EXECUTIVE_ID) {
      if (classification.tier !== "regional") throw new Error("Zagrebačka županija must stay regional");
    }
    if (row.office_id === SABOR_ID && (row.office_type !== "parliament" || classification.tier !== "national")) {
      throw new Error("Sabor must stay the single national parliament");
    }
    if (row.office_id === PRESIDENT_ID && (row.office_type !== "direct_executive" || classification.tier !== "national")) {
      throw new Error("President must stay the single national direct executive");
    }
    if (row.office_id === EP_ID && (row.office_type !== "european_parliament_delegation" || classification.tier !== "other")) {
      throw new Error("Croatia EP delegation must stay other");
    }
    if (row.office_type === "direct_executive") executiveTickets += 1;
    if (row.office_type === "council") assemblies += 1;
    if (row.office_type === "direct_deputy" && row.office_status === "current") currentDeputies += 1;
    if (row.office_type === "direct_deputy" && row.office_status === "historical") historicalDeputies += 1;
    officeIds.add(row.office_id);
    officeById.set(row.office_id, row);
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} has unsupported status ${row.office_status}`);
    }
    if (row.office_status === "historical" && row.office_type !== "direct_deputy") {
      throw new Error(`Historical office ${row.office_id} is not an independently elected deputy`);
    }
    const historical = row.office_status === "historical";
    if (historical) historicalOffices += 1;
    else currentOffices += 1;

    if (row.next_election?.value) {
      throw new Error(`Refusing to invent a next cycle for ${row.office_id}; DATES-NEXT-CYCLES stays open`);
    }
    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
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
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
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
    if (!row.rationale || !String(row.rationale).trim()) {
      throw new Error(`Classification ${row.office_id} is missing a rationale`);
    }
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
  const eventByHk = new Map<string, CroatiaEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let placeholderEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let saborMinorityEvents = 0;
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
    if (eventByHk.has(row.history_key)) throw new Error(`Duplicate Croatia history key ${row.history_key}`);
    eventByHk.set(row.history_key, row);
    const dateValue = row.date?.value;
    const precision = row.date?.precision;
    const certainty = row.date?.certainty;
    if (!dateValue || !precision || !certainty) throw new Error(`Event ${row.history_key} is missing a sourced date`);
    if (certainty !== "called") {
      throw new Error(`Event ${row.history_key} date certainty must stay called`);
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
    if (!role || !ALLOWED_ROLE.has(role)) {
      throw new Error(`Unsupported selected_history_role ${role} for ${row.history_key}`);
    }
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else if (role === "none") {
      if (row.history_key !== TAR_VABRIGA_HISTORY_KEY) {
        throw new Error(`Refusing an extra unselected event ${row.history_key}`);
      }
      placeholderEvents += 1;
    }
    const ballotBasis = row.ballot_basis;
    if (!ballotBasis || !ALLOWED_BALLOT.has(ballotBasis)) {
      throw new Error(`Unsupported ballot_basis ${ballotBasis} on ${row.history_key}`);
    }
    if (ballotBasis === "unknown") saborMinorityEvents += 1;
    const eventKind = row.event_kind;
    if (!eventKind || !ALLOWED_EVENT_KIND.has(eventKind)) {
      throw new Error(`Unsupported event_kind ${eventKind} on ${row.history_key}`);
    }
    if (eventKind !== "ordinary") {
      throw new Error(`Special or supplementary event ${row.history_key} is not in the accepted ordinary register`);
    }
    const legalOutcome = row.legal_outcome ?? "unknown";
    if (legalOutcome !== "unknown") {
      throw new Error(`Refusing to upgrade legal_outcome on ${row.history_key}; SEATS-AND-LEGAL-FINALITY stays open`);
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
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingIds = new Set<string>();
  let firstRounds = 0;
  let runoffs = 0;
  let sequence3 = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (event.office_id !== row.office_id) {
      throw new Error(`Proceeding ${row.proceeding_id} office does not match its event`);
    }
    const kind = row.proceeding_type;
    if (kind !== "first_round" && kind !== "runoff") {
      throw new Error(`Unsupported Croatia proceeding kind ${JSON.stringify(kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Proceeding ${row.proceeding_id} must not supersede the first round`);
    }
    if (kind === "first_round" && row.sequence_no !== 1) {
      throw new Error(`First round ${row.proceeding_id} must stay sequence 1`);
    }
    if (kind === "runoff" && row.sequence_no !== 2 && row.sequence_no !== 3) {
      throw new Error(`Runoff ${row.proceeding_id} must stay sequence 2 or the sourced Stari Grad third round`);
    }
    if (row.sequence_no === 3) {
      if (row.history_key !== STARI_GRAD_2017_HISTORY_KEY || kind !== "runoff") {
        throw new Error(`Refusing an unsourced third round on ${row.history_key}`);
      }
      sequence3 += 1;
    }
    const expectedId = proceedingIdFor(row.office_id, row.history_key, row.sequence_no);
    if (row.proceeding_id !== expectedId) {
      throw new Error(`Proceeding id drift for ${row.history_key}: ${row.proceeding_id} != ${expectedId}`);
    }
    proceedingIds.add(row.proceeding_id);
    if (kind === "first_round") firstRounds += 1;
    else runoffs += 1;
    if (row.legal_outcome && row.legal_outcome !== "unknown") {
      throw new Error(`Proceeding ${row.proceeding_id} legal outcome must stay unknown`);
    }
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind,
      sequence_no: row.sequence_no,
      supersedes_id: null,
      legal_outcome: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Map<string, CroatiaSourceRow>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Croatia source catalogue row ${i} is missing source_id/input_path`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Croatia source_id ${row.source_id}`);
    sourceById.set(row.source_id, row);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? publisherFor(row.url),
      title: row.title ?? null,
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_at ?? RESEARCH_SNAPSHOT_LABEL,
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
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  let shareUnknown = 0;
  let knownSeats = 0;
  let electedFlags = 0;
  let tarVabrigaResults = 0;
  const resultIds = new Set<string>();
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    if (event.office_id !== row.office_id) {
      throw new Error(`Result ${row.result_row_id} office does not match its event`);
    }
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    if (!row.identity_token) throw new Error(`Result ${row.result_row_id} is missing an identity token`);
    const expectedId = resultIdFor(row.office_id, row.history_key, row.proceeding_id ?? null, row.identity_token);
    if (row.result_row_id !== expectedId) {
      throw new Error(`Result id drift for ${row.history_key}: ${row.result_row_id} != ${expectedId}`);
    }
    if (resultIds.has(row.result_row_id)) throw new Error(`Duplicate result ${row.result_row_id}`);
    resultIds.add(row.result_row_id);
    if (row.history_key === TAR_VABRIGA_HISTORY_KEY) tarVabrigaResults += 1;
    if (row.elected_flag != null) {
      electedFlags += 1;
      throw new Error(`Refusing elected flag on ${row.result_row_id}`);
    }
    const votes = assertScalar(row.votes, row.votes_status, "votes", row.result_row_id);
    const share = assertScalar(row.share, row.share_status, "share", row.result_row_id);
    const seats = assertScalar(row.seats, row.seats_status, "seats", row.result_row_id);
    if (seats != null) knownSeats += 1;
    if (share == null) shareUnknown += 1;
    if (row.share_unit && row.share_unit !== "percent_0_100") {
      throw new Error(`Result ${row.result_row_id} share unit must stay percent_0_100`);
    }
    if (row.evidence_status !== "recorded") {
      throw new Error(`Result ${row.result_row_id} evidence_status must stay recorded`);
    }
    const origin = originFor(RESULTS_RELATIVE, resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id ?? null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_name ?? row.source_label ?? null,
      original_party_label: row.party_name_raw ?? null,
      original_party_code: null,
      party_namespace: null,
      party_mapping_id: null,
      votes,
      votes_status: row.votes_status,
      share,
      share_status: row.share_status,
      share_unit: "percent_0_100",
      seats,
      seats_status: "unknown",
      elected_flag: null,
      is_substitute: null,
      evidence_status: "recorded",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

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
  for (const [index, row] of inventory.results.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      entity_kind: "result_row",
      ...blankLocator,
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: RESULTS_RELATIVE,
        sha256: resultsHash,
        derivedPointer: `/${index}`,
        sourceRow: index + 1,
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
    refs: CroatiaEvidenceRef[] | undefined;
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
      const evidenceId = croatiaEvidenceId(
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
    pushEvidence({
      recordKey: recordKey("office", [N, row.office_id]),
      refs: row.evidence,
      claimKind: "register_identity",
      claim: { office_id: row.office_id },
    });
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
      claim: { proceeding_id: row.proceeding_id, kind: row.proceeding_type, sequence_no: row.sequence_no },
    });
  }
  for (const [index, row] of inventory.results.entries()) {
    pushEvidence({
      recordKey: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      refs: row.evidence,
      claimKind: "source_scalar",
      claim: { result_row_id: row.result_row_id, index },
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
      unresolved_id: croatiaUnresolvedId(countryRec, row.original_token),
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
      throw new Error(`Unsupported Croatia crosswalk namespace ${row.upstream_namespace}`);
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
  const validatedCounts = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: selectedHistories,
    other_histories: otherHistories,
    prospective_events: 0,
    placeholder_events: placeholderEvents,
    total_events: events.length,
    result_rows: results.length,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    executive_tickets: executiveTickets,
    current_deputies: currentDeputies,
    historical_deputies: historicalDeputies,
    assemblies: assemblies,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDatesDay,
    event_dates_year_called: eventDatesYear,
    next_dates: 0,
    proceedings: proceedings.length,
    proceedings_first_round: firstRounds,
    proceedings_runoff: runoffs,
    sequence_3_proceedings: sequence3,
    party_mappings: 0,
    successor_edges: successorEdges,
    sabor_minority_events: saborMinorityEvents,
    share_unknown_results: shareUnknown,
    known_seats: knownSeats,
    elected_flags: electedFlags,
    zagreb_duplicate_offices: FORBIDDEN_ZAGREB_DUPLICATE_IDS.filter((id) => officeIds.has(id)).length,
    tar_vabriga_results: tarVabrigaResults,
    biskupija_2017_deputy_events: eventByHk.has(BISKUPIJA_2017_HISTORY_KEY) ? 1 : 0,
    named_holds: unresolved.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Croatia ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  if (!officeIds.has(ZAGREB_COUNCIL_ID) || !officeIds.has(ZAGREB_EXECUTIVE_ID) || !officeIds.has(PRESIDENT_ID)) {
    throw new Error("Croatia anchor offices are missing from the register");
  }
  if (!officeById.has(DEPUTY_EXAMPLE_ID) || officeById.get(DEPUTY_EXAMPLE_ID)?.office_status !== "current") {
    throw new Error("Bale deputy example must stay a current independently elected office");
  }
  if (!officeById.has(HISTORICAL_DEPUTY_ID) || officeById.get(HISTORICAL_DEPUTY_ID)?.office_status !== "historical") {
    throw new Error("Historical Grožnjan deputy must stay historical without a successor");
  }
  if (!officeById.has(BISKUPIJA_DEPUTY_ID)) {
    throw new Error("Biskupija deputy office must stay on the register without a fabricated 2017 return");
  }
  if (!eventByHk.has(DUGO_SELO_2017_HISTORY_KEY) || eventByHk.get(DUGO_SELO_2017_HISTORY_KEY)?.event_id !== DUGO_SELO_2017_EVENT_ID) {
    throw new Error("Dugo Selo 2017 event identity drifted");
  }
  if (!eventByHk.has(EP_2013_HISTORY_KEY) || eventByHk.get(EP_2013_HISTORY_KEY)?.event_id !== EP_2013_EVENT_ID) {
    throw new Error("EP 2013 year-precision event identity drifted");
  }
  const tarVabriga = eventByHk.get(TAR_VABRIGA_HISTORY_KEY);
  if (!tarVabriga || tarVabriga.event_id !== TAR_VABRIGA_EVENT_ID || tarVabriga.office_id !== TAR_VABRIGA_OFFICE_ID) {
    throw new Error("Tar-Vabriga placeholder event identity drifted");
  }
  if (!proceedingIds.has(STARI_GRAD_THIRD_PROCEEDING_ID)) {
    throw new Error("Stari Grad 2017 third round is missing");
  }
  if (!resultIds.has(RESULT_EXAMPLE_ID)) {
    throw new Error("Example result row is missing");
  }
  if (!officeIds.has(DUGO_SELO_COUNCIL_ID) || !officeIds.has(DUGO_SELO_EXECUTIVE_ID) || !officeIds.has(SABOR_ID) || !officeIds.has(EP_ID)) {
    throw new Error("Croatia example offices are missing");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "New sourced Croatia councils, direct executives, independent deputies, national bodies and historic ballots with holds. Prompt W accepted 1,234 current + 11 historical offices.",
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
