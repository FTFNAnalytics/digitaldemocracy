import {
  ADAPTER_VERSION,
  CLAIMS_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RECORD_KEY,
  COUNTRY_RELATIVE,
  CROSSWALK_REASON,
  CROSSWALK_RELATIVE,
  DISPUTED_SHARE_RESULT_ID,
  EP_2014_EVENT_ID,
  EP_2014_HK,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  HISTORICAL_COUNCIL_EXAMPLE_ID,
  LINEAGE_ID,
  MADONA_2021_ID,
  MADONA_2025_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  OMITTED_RAW_SOURCES_PREFIX,
  PRESIDENT_2003_EVENT_ID,
  PRESIDENT_2003_HK,
  PRESIDENT_2015_EVENT_ID,
  PRESIDENT_2015_HK,
  PRESIDENT_2015_PROCEEDING_ID,
  PRESIDENT_2023_EVENT_ID,
  PRESIDENT_2023_HK,
  PRESIDENT_2023_PROCEEDING_ID,
  PRESIDENT_ID,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULTS_RELATIVE,
  RIGA_2020_EVENT_ID,
  RIGA_2020_HK,
  RIGA_2025_HK,
  RIGA_GEOGRAPHY_ID,
  RIGA_ID,
  SAEIMA_2022_HK,
  SAEIMA_2026_EVENT_ID,
  SAEIMA_2026_HK,
  SAEIMA_ID,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  VARAKLANI_2021_ID,
  canonical,
  dateId,
  hostnameOf,
  isFixtureId,
  latviaEvidenceId,
  latviaUnresolvedId,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  LatviaAuthoredDate,
  LatviaEventRow,
  LatviaInventory,
  LatviaOrigin,
  LatviaResultRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type LatviaProjection = {
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
const ALLOWED_OFFICE_TYPES = new Set([
  "local_government_council",
  "national_parliament",
  "national_president",
  "european_parliament_delegation",
]);
const HOLD_TOKENS = new Set<string>(NAMED_HOLDS.map((hold) => hold.token));

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Latvia date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function assertAuthoredDate(date: LatviaAuthoredDate, where: string, expectedCertainty: string): void {
  if (!date.label || !date.precision || !date.certainty) {
    throw new Error(`Latvia date is incomplete at ${where}`);
  }
  if (date.certainty !== expectedCertainty) {
    throw new Error(`Latvia date certainty ${JSON.stringify(date.certainty)} != ${expectedCertainty} at ${where}`);
  }
  if (date.precision === "year") {
    if (date.label !== String(date.year) || date.month != null || date.day != null) {
      throw new Error(`Year date must not carry a month or day at ${where}`);
    }
    return;
  }
  if (date.precision === "day") {
    const parsed = parseDayLabel(date.label);
    if (date.year !== parsed.year || date.month !== parsed.month || date.day !== parsed.day) {
      throw new Error(`Day date parts disagree with the label at ${where}`);
    }
    return;
  }
  throw new Error(`Unsupported Latvia date precision ${JSON.stringify(date.precision)} at ${where}`);
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

function sliceHash(inventory: LatviaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: {
  inputPath: string;
  sha256: string;
  locatorText?: string | null;
  derivedPath?: string;
  derivedPointer?: string;
}): string {
  return canonical({
    derived_path: args.derivedPath ?? null,
    derived_pointer: args.derivedPointer ?? null,
    input_path: args.inputPath,
    locator: args.locatorText ?? null,
    sha256: args.sha256,
  });
}

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string | null {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other" || raw === "national_context") return raw;
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported Latvia classification tier ${JSON.stringify(raw)}`);
}

function publisherFor(url: string | null | undefined): string | null {
  const host = hostnameOf(url)?.toLowerCase() ?? "";
  if (!host) return null;
  if (host === "data.gov.lv" || host === "cvk.lv" || host.endsWith(".cvk.lv")) return "CVK";
  if (host === "likumi.lv" || host.endsWith(".likumi.lv")) return "Latvijas Vēstnesis";
  if (host === "president.lv" || host.endsWith(".president.lv")) return "Presidential Chancery";
  if (host === "saeima.lv" || host.endsWith(".saeima.lv")) return "Saeima";
  throw new Error(`Unmapped Latvia source host ${host}`);
}

function occurrenceWithoutSource(origin: LatviaOrigin): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...origin };
  delete copy.source_id;
  return copy;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function integerCount(value: number | null, where: string): number | null {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Latvia count must be a non-negative integer at ${where}; got ${JSON.stringify(value)}`);
  }
  return value;
}

function electedFlag(value: boolean | null, where: string): number | null {
  if (value == null) return null;
  if (value === true) return 1;
  if (value === false) return 0;
  throw new Error(`Unsupported elected_flag at ${where}`);
}

function mapEvent(row: LatviaEventRow): {
  event_kind: string;
  ballot_basis: string;
  selected_history_role: string;
  legal_outcome: string;
} {
  const prospective = row.event_role === "prospective" || row.status === "prospective";
  if (prospective && row.history_key !== SAEIMA_2026_HK) {
    throw new Error(`The only prospective Latvia event is ${SAEIMA_2026_HK}; found ${row.history_key}`);
  }
  if (row.office_id === PRESIDENT_ID || row.election_mode === "indirect_saeima") {
    if (row.office_id !== PRESIDENT_ID || row.election_mode !== "indirect_saeima") {
      throw new Error(`Indirect Saeima franchise is presidential only; found ${row.history_key}`);
    }
    if (prospective) throw new Error("No prospective presidential event is authored");
    return {
      event_kind: "indirect",
      ballot_basis: "electors",
      selected_history_role: "selected",
      legal_outcome: "unknown",
    };
  }
  if (row.election_mode !== "direct_popular_list") {
    throw new Error(`Unsupported Latvia election_mode ${JSON.stringify(row.election_mode)} on ${row.history_key}`);
  }
  if (row.cycle === "RD2020" || row.history_key === RIGA_2020_HK) {
    if (row.history_key !== RIGA_2020_HK) {
      throw new Error(`RD2020 is the Riga extraordinary contest only; found ${row.history_key}`);
    }
    return {
      event_kind: "special",
      ballot_basis: "unknown",
      selected_history_role: "selected",
      legal_outcome: "unknown",
    };
  }
  if (prospective) {
    return {
      event_kind: "ordinary",
      ballot_basis: "unknown",
      selected_history_role: "none",
      legal_outcome: "not_held",
    };
  }
  return {
    event_kind: "ordinary",
    ballot_basis: "unknown",
    selected_history_role: "selected",
    legal_outcome: row.history_key === EP_2014_HK ? "certified" : "unknown",
  };
}

export function projectLatvia(inventory: LatviaInventory): LatviaProjection {
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
  rejectFixtures(
    inventory.proceedings.map((row) => row.proceeding_id),
    "proceedings",
  );
  for (const item of inventory.tracked) {
    if (item.input_path.startsWith(OMITTED_RAW_SOURCES_PREFIX)) {
      throw new Error("Omitted raw sources/ must not be hashed into the Latvia release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (!inventory.byPath.has(RESULTS_RELATIVE)) {
    throw new Error("results.json is part of the Latvia slim pack and must be published");
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Latvia offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Latvia events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Latvia results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Latvia geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Latvia classifications`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Latvia proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.shareClaims.length !== EXPECTED_COUNTS.unresolved_share_claims) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_share_claims} Latvia share conflicts`);
  }
  if (inventory.country.country_id !== COUNTRY_ID || inventory.country.name !== "Latvija") {
    throw new Error("Latvia country.json identity drifted");
  }
  if (
    inventory.counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    inventory.counts.historical_office_identity_records !== EXPECTED_COUNTS.historical_offices ||
    inventory.counts.current_councils !== EXPECTED_COUNTS.current_councils ||
    inventory.counts.result_rows !== EXPECTED_COUNTS.result_rows ||
    inventory.counts.prospective_events !== EXPECTED_COUNTS.prospective_events ||
    inventory.counts.direct_executive_offices !== 0 ||
    inventory.counts.current_state_city_councils !== EXPECTED_COUNTS.current_state_city_councils ||
    inventory.counts.current_novads_councils !== EXPECTED_COUNTS.current_novads_councils
  ) {
    throw new Error("Latvia counts.json drifted from the accepted register");
  }

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.text,
  }));

  const registerHash = sliceHash(inventory, REGISTER_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);
  if (countryRec !== COUNTRY_RECORD_KEY) {
    throw new Error(`Latvia country record_key drifted: ${countryRec}`);
  }
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Latvija",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: inventory.country.screening_as_of_label ?? RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: COUNTRY_RELATIVE,
        sha256: sliceHash(inventory, COUNTRY_RELATIVE),
        json_pointer: "",
      }),
      row: inventory.country,
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: NAMED_HOLDS.map((hold) => hold.token),
        omitted_raw_sources: OMITTED_RAW_SOURCES_PREFIX,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Map<string, string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    const previous = dateIds.get(id);
    if (previous && previous !== String(row.label)) {
      throw new Error(`Latvia date_id ${id} collided`);
    }
    if (previous) return;
    dateIds.set(id, String(row.label));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Latvia`);
    if (row.parent_geography_id) {
      throw new Error(`Latvia geography ${row.geography_id} must not invent a parent`);
    }
    if (row.successor_id) {
      throw new Error(`Latvia geography ${row.geography_id} must not invent a successor`);
    }
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(GEOGRAPHY_RELATIVE, sliceHash(inventory, GEOGRAPHY_RELATIVE), index);
    return {
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    };
  });

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDayCalled = 0;
  let mayorOffices = 0;
  let currentCouncils = 0;
  let currentDirectExecutives = 0;
  let currentIndirectPresidencies = 0;
  const rosterCounts = new Map<string, number>();

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Latvia`);
    if (row.id_namespace !== N) throw new Error(`Office ${row.office_id} namespace drifted`);
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    if (!ALLOWED_OFFICE_TYPES.has(row.office_type) || /(?:^|-)M$/.test(row.office_id)) {
      mayorOffices += 1;
      throw new Error(`Latvia must not project mayor or executive rows; found ${row.office_id} (${row.office_type})`);
    }
    if (row.successor_office_id) {
      throw new Error(`Latvia must not invent successor edges; found ${row.office_id}`);
    }
    if (row.current === row.historical) {
      throw new Error(`Office ${row.office_id} current/historical flags disagree`);
    }
    officeIds.add(row.office_id);
    const historical = row.current === false;
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    if (row.office_type === "local_government_council") {
      if (!historical) currentCouncils += 1;
      for (const cycle of row.observed_cycles ?? []) {
        rosterCounts.set(cycle, (rosterCounts.get(cycle) ?? 0) + 1);
      }
    } else if (row.office_type === "national_president") {
      if (row.election_mode !== "indirect_saeima") {
        throw new Error("The presidency office stays Saeima-indirect");
      }
      if (!historical) currentIndirectPresidencies += 1;
    } else if (row.office_type !== "national_parliament" && row.office_type !== "european_parliament_delegation") {
      if (!historical) currentDirectExecutives += 1;
      throw new Error(`Unexpected Latvia office type ${row.office_type} on ${row.office_id}`);
    }
    const holds = row.holds ?? [];
    for (const token of holds) {
      if (!HOLD_TOKENS.has(token)) throw new Error(`Unknown Latvia hold ${token} on ${row.office_id}`);
    }
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    let nextHistoryKey: string | null = null;
    if (row.next_date) {
      if (row.office_id !== SAEIMA_ID) {
        throw new Error(`Only Saeima carries a sourced next date; found ${row.office_id}`);
      }
      assertAuthoredDate(row.next_date, row.office_id, "called");
      if (row.next_date.precision !== "day" || row.next_date.label !== "2026-10-03") {
        throw new Error("Saeima next date must stay the called day 2026-10-03");
      }
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextHistoryKey = row.next_history_key ?? null;
      if (nextHistoryKey !== SAEIMA_2026_HK) {
        throw new Error(`Saeima next history key must stay ${SAEIMA_2026_HK}`);
      }
      nextDayCalled += 1;
      const origin = originFor(REGISTER_RELATIVE, registerHash, i, "next_date");
      pushDate({
        date_id: nextDateId,
        label: row.next_date.label,
        precision: "day",
        certainty: "called",
        year: row.next_date.year,
        month: row.next_date.month,
        day: row.next_date.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row: row.next_date }),
      });
    } else if (row.next_history_key) {
      throw new Error(`Office ${row.office_id} must not invent a next history key without a sourced next date`);
    }
    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.office_name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: null,
      registry_qualified: holds.length > 0 ? 0 : 1,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: nextHistoryKey,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorOffices !== 0 || currentDirectExecutives !== 0) {
    throw new Error("Latvia current direct-executive offices must stay 0");
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    const origin = originFor(TIER_PATH, TIER_SHA256, index);
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
      raw_json: rawEnvelope({ origin, row }),
    };
  });

  const events: SqlRow[] = [];
  const eventByHk = new Map<string, LatviaEventRow>();
  let selectedHistories = 0;
  let prospectiveEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let presidentIndirectEvents = 0;
  let presidentPopularEvents = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (row.history_key !== `${row.office_id}::${row.cycle}`) {
      throw new Error(`Latvia history key must stay office_id::cycle; found ${row.history_key}`);
    }
    if (eventByHk.has(row.history_key)) throw new Error(`Duplicate Latvia history key ${row.history_key}`);
    eventByHk.set(row.history_key, row);
    assertAuthoredDate(row.date, row.history_key, "called");
    const dateIdValue = dateId("event", row.event_id, "election");
    if (row.date.precision === "year") {
      if (row.history_key !== PRESIDENT_2003_HK) {
        throw new Error(`Year precision is the 2003 presidency only; found ${row.history_key}`);
      }
      eventDatesYear += 1;
      pushDate({
        date_id: dateIdValue,
        label: row.date.label,
        precision: "year",
        certainty: "called",
        year: row.date.year,
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
    } else {
      eventDatesDay += 1;
      pushDate({
        date_id: dateIdValue,
        label: row.date.label,
        precision: "day",
        certainty: "called",
        year: row.date.year,
        month: row.date.month,
        day: row.date.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
          row: row.date,
        }),
      });
    }
    const mapped = mapEvent(row);
    if (mapped.selected_history_role === "selected") selectedHistories += 1;
    if (mapped.selected_history_role === "none") prospectiveEvents += 1;
    if (mapped.event_kind === "indirect") presidentIndirectEvents += 1;
    if (row.office_id === PRESIDENT_ID && mapped.ballot_basis !== "electors") presidentPopularEvents += 1;
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: mapped.event_kind,
      selected_history_role: mapped.selected_history_role,
      electoral_system: row.election_mode,
      comparability: null,
      ballot_basis: mapped.ballot_basis,
      share_unit: "percent_0_100",
      legal_outcome: mapped.legal_outcome,
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingIds = new Set<string>();
  let proceedingDates = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (row.event_id !== event.event_id) {
      throw new Error(`Proceeding ${row.proceeding_id} event_id does not match ${row.history_key}`);
    }
    if (row.proceeding_kind !== "first_round" && row.proceeding_kind !== "runoff") {
      throw new Error(`Unsupported Latvia proceeding kind ${JSON.stringify(row.proceeding_kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Latvia proceedings must not invent a supersedes edge; found ${row.proceeding_id}`);
    }
    if (row.office_id !== PRESIDENT_ID) {
      throw new Error(`Proceedings are presidential ballots only; found ${row.office_id}`);
    }
    if (row.proceeding_id === PRESIDENT_2015_PROCEEDING_ID && (row.sequence !== 5 || row.proceeding_kind !== "runoff")) {
      throw new Error("2015 fifth parliamentary ballot must stay sequence 5");
    }
    if (row.proceeding_id === PRESIDENT_2023_PROCEEDING_ID && (row.sequence !== 1 || row.proceeding_kind !== "first_round")) {
      throw new Error("2023 first round must stay sequence 1; source form 6 is not the round number");
    }
    proceedingIds.add(row.proceeding_id);
    const parsed = parseDayLabel(row.date_label);
    const ballotDateId = dateId("proceeding", row.proceeding_id, "ballot");
    proceedingDates += 1;
    pushDate({
      date_id: ballotDateId,
      label: row.date_label,
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
        origin: originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i, "date_label"),
        row: { date_label: row.date_label },
      }),
    });
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.proceeding_kind,
      sequence_no: row.sequence,
      supersedes_id: null,
      legal_outcome: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row,
        supplemental: { ballot_date_id: ballotDateId },
      }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path || !row.sha256) {
      throw new Error(`Latvia source catalogue row ${i} is missing source_id, input_path, or sha256`);
    }
    if (!/^[0-9a-f]{64}$/.test(row.sha256)) {
      throw new Error(`Latvia source ${row.source_id} sha256 is not lowercase hex`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Latvia source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: publisherFor(row.url),
      title: null,
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_on ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: "primary_source",
      file_sha256: row.sha256,
      locator: canonical({ input_path: row.input_path, sha256: row.sha256 }),
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];
  const resultById = new Map<string, LatviaResultRow>();
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  let disputedShares = 0;
  let presidentialResults = 0;
  let electedTrue = 0;
  let electedFalse = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    if (row.event_id !== event.event_id) {
      throw new Error(`Result ${row.result_row_id} event_id does not match ${row.history_key}`);
    }
    if (row.history_key === SAEIMA_2026_HK) {
      throw new Error("The prospective Saeima contest must not gain invented result rows");
    }
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    if (row.office_id === PRESIDENT_ID) {
      presidentialResults += 1;
      if (row.share != null || row.original_party_label != null || row.original_party_code != null) {
        throw new Error(`Presidential support rows stay non-list claims; found a share or party on ${row.result_row_id}`);
      }
    } else if (row.proceeding_id) {
      throw new Error(`List results must not invent a proceeding; found ${row.result_row_id}`);
    }
    if (row.share_status === "disputed" || row.evidence_status === "disputed") {
      if (row.history_key !== SAEIMA_2022_HK || row.share_status !== "disputed" || row.evidence_status !== "disputed") {
        throw new Error(`Disputed Latvia results are the seven 2022 Saeima shares only; found ${row.result_row_id}`);
      }
      disputedShares += 1;
    }
    if (row.is_substitute != null) {
      throw new Error(`No substitute-person normalization is supplied; found ${row.result_row_id}`);
    }
    const flag = electedFlag(row.elected_flag, row.result_row_id);
    if (flag === 1) electedTrue += 1;
    if (flag === 0) electedFalse += 1;
    if (resultById.has(row.result_row_id)) throw new Error(`Duplicate result_row_id ${row.result_row_id}`);
    resultById.set(row.result_row_id, row);
    const origin = originFor(RESULTS_RELATIVE, resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_or_list_label ?? null,
      original_party_label: row.original_party_label ?? null,
      original_party_code: row.original_party_code ?? null,
      party_namespace: null,
      party_mapping_id: null,
      votes: integerCount(row.votes, row.result_row_id),
      votes_status: row.votes_status,
      share: row.share,
      share_status: row.share_status,
      share_unit: row.share_unit ?? "percent_0_100",
      seats: integerCount(row.seats, `${row.result_row_id} seats`),
      seats_status: row.seats_status,
      elected_flag: flag,
      is_substitute: null,
      evidence_status: row.evidence_status,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  const countryHash = sliceHash(inventory, COUNTRY_RELATIVE);
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    country_id: COUNTRY_ID,
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
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({
      inputPath: COUNTRY_RELATIVE,
      sha256: countryHash,
      derivedPointer: "",
    }),
  });
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      entity_kind: "geography",
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
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
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: row.office_id,
      history_key: null,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
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
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
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
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
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
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: null,
      result_row_id: row.result_row_id,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: RESULTS_RELATIVE,
        sha256: resultsHash,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const row of sources) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
      entity_kind: "source",
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: null,
      office_id: null,
      history_key: null,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      input_path: null,
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
      record_key: recordKey("input", [L, item.input_path]),
      entity_kind: "input",
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
    origins: LatviaOrigin[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const origin of args.origins ?? []) {
      const sourceId = origin.source_id;
      if (!sourceId || !sourceById.has(sourceId)) {
        throw new Error(`Broken evidence source FK ${JSON.stringify(sourceId)} on ${args.recordKey}`);
      }
      const occurrence = occurrenceWithoutSource(origin);
      const evidenceId = latviaEvidenceId(args.recordKey, sourceId, occurrence, args.claimKind);
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: sourceId,
        source_locator: canonical(origin),
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
      origins: row.origins,
      claimKind: "geography",
      claim: { geography_id: row.geography_id },
    });
  }
  for (const row of inventory.offices) {
    const rec = recordKey("office", [N, row.office_id]);
    pushEvidence({
      recordKey: rec,
      origins: row.origins,
      claimKind: "identity",
      claim: { office_id: row.office_id },
    });
  }
  for (const row of inventory.events) {
    const rec = recordKey("event", [N, row.office_id, row.history_key]);
    const dateClaimId = dateId("event", row.event_id, "election");
    pushEvidence({
      recordKey: rec,
      origins: row.origins,
      claimKind: "date",
      dateClaimId,
      claim: { history_key: row.history_key, label: row.date.label },
    });
    const dateOrigin = row.raw?.date_origin;
    if (dateOrigin && typeof dateOrigin === "object") {
      pushEvidence({
        recordKey: rec,
        origins: [dateOrigin as LatviaOrigin],
        claimKind: "date",
        dateClaimId,
        claim: { history_key: row.history_key, label: row.date.label, slot: "date_origin" },
      });
    }
  }
  for (const row of inventory.proceedings) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      origins: row.origin ? [row.origin] : [],
      claimKind: "ballot",
      claim: { proceeding_id: row.proceeding_id, date_label: row.date_label, kind: row.proceeding_kind },
    });
  }
  for (const row of inventory.results) {
    pushEvidence({
      recordKey: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      origins: row.origin ? [row.origin] : [],
      claimKind: "result",
      claim: {
        result_row_id: row.result_row_id,
        votes: row.votes,
        share: row.share,
        share_status: row.share_status,
      },
    });
  }

  const unresolved: SqlRow[] = [];
  for (const hold of NAMED_HOLDS) {
    const sourceLocator = canonical({
      input_path: "docs/phase1/latvia/Latvia_Research_Gaps.md",
      heading: hold.token,
    });
    unresolved.push({
      unresolved_id: latviaUnresolvedId(countryRec, sourceLocator, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: sourceLocator,
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: "docs/phase1/latvia/Latvia_Research_Gaps.md",
          json_pointer: null,
        }),
        row: { original_token: hold.token, reason: hold.reason, status: "open" },
      }),
    });
  }
  const claimsHash = sliceHash(inventory, CLAIMS_RELATIVE);
  const claimedIds = new Set<string>();
  for (let i = 0; i < inventory.shareClaims.length; i++) {
    const claim = inventory.shareClaims[i]!;
    const result = resultById.get(claim.target_result_row_id);
    if (!result) throw new Error(`Share conflict ${claim.claim_id} has no result row`);
    if (claim.field !== "share" || claim.disposition !== "needs_human_review") {
      throw new Error(`Share conflict ${claim.claim_id} is not an open share adjudication`);
    }
    if (result.share !== claim.original_claim.value) {
      throw new Error(`Share conflict ${claim.claim_id} must retain the archive percentage`);
    }
    if (result.share === claim.alternate_claim.value) {
      throw new Error(`Share conflict ${claim.claim_id} must not adopt the alternate percentage`);
    }
    if (claimedIds.has(claim.target_result_row_id)) throw new Error(`Duplicate share conflict for ${claim.target_result_row_id}`);
    claimedIds.add(claim.target_result_row_id);
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const sourceLocator = canonical({
      input_path: CLAIMS_RELATIVE,
      sha256: claimsHash,
      json_pointer: `/${i}`,
    });
    unresolved.push({
      unresolved_id: latviaUnresolvedId(rec, sourceLocator, claim.claim_id),
      record_key: rec,
      original_token: claim.claim_id,
      source_locator: sourceLocator,
      reason: claim.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(CLAIMS_RELATIVE, claimsHash, i),
        row: claim,
        supplemental: { retained_share: result.share, alternate_share: claim.alternate_claim.value, status: "open" },
      }),
    });
  }
  if (claimedIds.size !== disputedShares) {
    throw new Error("Every disputed 2022 share must have exactly one open conflict token");
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (row.entity_kind !== "office") {
      throw new Error(`Unexpected Latvia crosswalk entity ${row.entity_kind}`);
    }
    if (!row.upstream_namespace.startsWith("cvk:latvia:")) {
      throw new Error(`Unexpected Latvia crosswalk namespace ${row.upstream_namespace}`);
    }
    if (row.reason !== CROSSWALK_REASON) {
      throw new Error(`Latvia crosswalk must not assert a successor: ${row.reason}`);
    }
    const rec = inventory.offices
      .map((office) => recordKey("office", [N, office.office_id]))
      .find((candidate) => candidate === row.record_key);
    if (!rec) throw new Error(`Crosswalk record_key is not an accepted office: ${row.upstream_id}`);
    const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(key)) throw new Error(`Duplicate Latvia crosswalk ${row.upstream_id}`);
    crosswalkSeen.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: row.record_key,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: CROSSWALK_RELATIVE,
          sha256: sliceHash(inventory, CROSSWALK_RELATIVE),
        }),
        row,
      }),
    });
  }

  const knownEvents = new Map(events.map((row) => [String(row.history_key), String(row.event_id)]));
  if (knownEvents.get(RIGA_2020_HK) !== RIGA_2020_EVENT_ID) throw new Error("Riga 2020 event identity drifted");
  if (knownEvents.has(`${RIGA_ID}::PV2021`)) throw new Error("No 2021 Riga event may be invented");
  if (!knownEvents.has(RIGA_2025_HK)) throw new Error("Riga 2025 contest must stay on the current council");
  if (knownEvents.get(SAEIMA_2026_HK) !== SAEIMA_2026_EVENT_ID) throw new Error("Saeima 2026 event identity drifted");
  if (knownEvents.get(EP_2014_HK) !== EP_2014_EVENT_ID) throw new Error("EP 2014 event identity drifted");
  if (knownEvents.get(PRESIDENT_2003_HK) !== PRESIDENT_2003_EVENT_ID) throw new Error("2003 presidential event identity drifted");
  if (knownEvents.get(PRESIDENT_2015_HK) !== PRESIDENT_2015_EVENT_ID) throw new Error("2015 presidential event identity drifted");
  if (knownEvents.get(PRESIDENT_2023_HK) !== PRESIDENT_2023_EVENT_ID) throw new Error("2023 presidential event identity drifted");
  const epCycles = inventory.events.filter((row) => row.office_id === EP_ID).map((row) => row.cycle).sort();
  if (JSON.stringify(epCycles) !== JSON.stringify(["EP2014", "EP2019", "EP2024"])) {
    throw new Error("EP replacements must not become extra contests");
  }
  if (!proceedingIds.has(PRESIDENT_2015_PROCEEDING_ID) || !proceedingIds.has(PRESIDENT_2023_PROCEEDING_ID)) {
    throw new Error("2015 and 2023 presidential ballots must both be retained");
  }
  if (proceedingIds.size !== 2) throw new Error("Missing presidential rounds must not be synthesized");
  const riga = inventory.offices.filter((row) => row.office_id === RIGA_ID);
  const madona2025 = inventory.offices.find((row) => row.office_id === MADONA_2025_ID);
  const madona2021 = inventory.offices.find((row) => row.office_id === MADONA_2021_ID);
  const varaklani = inventory.offices.find((row) => row.office_id === VARAKLANI_2021_ID);
  const historicalExample = inventory.offices.find((row) => row.office_id === HISTORICAL_COUNCIL_EXAMPLE_ID);
  if (riga.length !== 1 || riga[0]?.current !== true || riga[0]?.geography_id !== RIGA_GEOGRAPHY_ID) {
    throw new Error("Riga must remain one current council");
  }
  if (!madona2025?.current || madona2021?.current !== false || varaklani?.current !== false) {
    throw new Error("2025 Madona stays current; 2021 Madona and Varakļāni stay historical");
  }
  if (historicalExample?.current !== false || !historicalExample?.holds?.includes("LV-G01")) {
    throw new Error("The 2017 example council must stay a historical LV-G01 identity");
  }
  const disputed = resultById.get(DISPUTED_SHARE_RESULT_ID);
  if (!disputed || disputed.share !== 18.97 || disputed.share_status !== "disputed") {
    throw new Error("The documented 2022 share conflict must keep archive percentage 18.97");
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
    other_histories: 0,
    prospective_events: prospectiveEvents,
    total_events: events.length,
    result_rows: results.length,
    disputed_share_rows: disputedShares,
    presidential_result_rows: presidentialResults,
    elected_true_rows: electedTrue,
    elected_false_rows: electedFalse,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    unresolved_named_holds: NAMED_HOLDS.length,
    unresolved_share_claims: inventory.shareClaims.length,
    unresolved_research_gaps: NAMED_HOLDS.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_year_called: eventDatesYear,
    event_dates_day_called: eventDatesDay,
    next_dates_day_called: nextDayCalled,
    proceeding_dates_day: proceedingDates,
    proceedings: proceedings.length,
    party_mappings: 0,
    mayor_offices: mayorOffices,
    current_direct_executive_offices: currentDirectExecutives,
    current_councils: currentCouncils,
    current_indirect_presidential_offices: currentIndirectPresidencies,
    current_state_city_councils: inventory.counts.current_state_city_councils,
    current_novads_councils: inventory.counts.current_novads_councils,
    named_holds: NAMED_HOLDS.length,
    president_indirect_events: presidentIndirectEvents,
    president_popular_events: presidentPopularEvents,
    roster_pv2017: rosterCounts.get("PV2017") ?? 0,
    roster_pv2021: rosterCounts.get("PV2021") ?? 0,
    roster_vrd2021: rosterCounts.get("VRD2021") ?? 0,
    roster_rd2020: rosterCounts.get("RD2020") ?? 0,
    roster_pv2025: rosterCounts.get("PV2025") ?? 0,
    evidence_links: evidence.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Latvia ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Latvia current-register and historic primary-source research; coverage partial. Prompt AG accepted 45 current + 121 historical offices with named holds LV-G01–LV-G09. Do not invent mayors, successor edges, popular presidential ballots, EP replacement contests, or a choice among the seven 2022 percentage claims. The presidency stays Saeima-indirect.",
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
