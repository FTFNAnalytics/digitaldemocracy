import { key } from "../../../scripts/import/normalize";
import {
  ADAPTER_VERSION,
  AKMENE_COUNCIL_ID,
  AKMENE_COUNCIL_RECORD_KEY,
  AKMENE_GEOGRAPHY_ID,
  AKMENE_MAYOR_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RECORD_KEY,
  COUNTRY_RELATIVE,
  CROSSWALK_NAMESPACE_PREFIX,
  EP_2004_EVENT_ID,
  EP_2004_HK,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  MALFORMED_INVALID_TOKEN,
  METHOD_VERSION,
  NAMED_HOLDS,
  NATIONAL_GEOGRAPHY_ID,
  OFFICE_NAMESPACE,
  OMITTED_SOURCES_PREFIX,
  PRESIDENT_2019_EVENT_ID,
  PRESIDENT_2019_FIRST_ID,
  PRESIDENT_2019_HK,
  PRESIDENT_2019_RUNOFF_ID,
  PRESIDENT_DISPUTED_RESULT_ID,
  PRESIDENT_ID,
  PROCEEDINGS_RELATIVE,
  RECONCILIATION_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SEIMAS_2016_EVENT_ID,
  SEIMAS_2016_HK,
  SEIMAS_ID,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  canonical,
  dateId,
  eventIdFor,
  isFixtureId,
  lithuaniaEvidenceId,
  lithuaniaUnresolvedId,
  locator,
  proceedingIdFor,
  rawEnvelope,
  recordKey,
  resultIdFor,
  type Locator,
} from "./identity";
import type {
  LithuaniaAuthoredDate,
  LithuaniaEventRow,
  LithuaniaInventory,
  LithuaniaOrigin,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type LithuaniaProjection = {
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

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Lithuania date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function assertAuthoredDate(date: LithuaniaAuthoredDate, where: string): void {
  if (!date.label || !date.precision || date.certainty !== "called") {
    throw new Error(`Lithuania date is incomplete or not called at ${where}`);
  }
  if (date.precision === "year") {
    if (date.label !== String(date.year) || date.month != null || date.day != null) {
      throw new Error(`Year date must not carry a month or day at ${where}`);
    }
    return;
  }
  if (date.precision === "month") {
    if (date.year == null || date.month == null || date.day != null) {
      throw new Error(`Month date parts disagree at ${where}`);
    }
    if (date.label !== `${date.year}-${pad2(date.month)}`) {
      throw new Error(`Month date label disagrees at ${where}`);
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
  throw new Error(`Unsupported Lithuania date precision ${JSON.stringify(date.precision)} at ${where}`);
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

function sliceHash(inventory: LithuaniaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: {
  derivedPath: string;
  derivedPointer?: string | null;
  origins?: unknown;
}): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
    origins: args.origins ?? null,
  });
}

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other" || raw === "national_context") return raw;
  if (raw === "national") return "national_context";
  throw new Error(`Unsupported Lithuania classification tier ${JSON.stringify(raw)}`);
}

function occurrenceWithoutSource(origin: LithuaniaOrigin): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...origin };
  delete copy.source_id;
  return copy;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function electoralSystem(officeType: string): string {
  if (officeType === "national_parliament") return "direct_popular_mixed";
  if (officeType === "direct_president" || officeType === "direct_mayor") return "direct_popular_two_round";
  if (officeType === "municipal_council" || officeType === "european_parliament_delegation") return "direct_popular_list";
  throw new Error(`Unsupported Lithuania office type ${officeType}`);
}

function flag(value: boolean | null | undefined, where: string): number | null {
  if (value == null) return null;
  if (value === true) return 1;
  if (value === false) return 0;
  throw new Error(`Unsupported boolean at ${where}`);
}

function assertScalar(
  kind: "votes" | "share" | "seats",
  value: number | null | undefined,
  status: string,
  where: string,
): void {
  const absent = new Set(["unknown", "not_applicable", "structurally_unavailable"]);
  if (value == null) {
    if (!absent.has(status)) throw new Error(`${kind} is null with status ${status} at ${where}`);
    return;
  }
  if ((kind === "votes" || kind === "seats") && !Number.isInteger(value)) {
    throw new Error(`${kind} is not an integer at ${where}`);
  }
  if (value < 0) throw new Error(`${kind} is negative at ${where}`);
  if (kind === "share" && value > 100) throw new Error(`share exceeds 100 at ${where}`);
  if (status === "zero" && value !== 0) throw new Error(`${kind} zero status mismatch at ${where}`);
  if (status === "recorded" && !(value > 0)) throw new Error(`${kind} recorded must be positive at ${where}`);
  if (absent.has(status)) throw new Error(`${kind} is present with status ${status} at ${where}`);
  if (!["zero", "recorded", "preliminary", "disputed", "superseded"].includes(status)) {
    throw new Error(`Unsupported ${kind} status ${status} at ${where}`);
  }
}

export function projectLithuania(inventory: LithuaniaInventory): LithuaniaProjection {
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
    if (item.input_path.startsWith(OMITTED_SOURCES_PREFIX)) {
      throw new Error("Omitted raw sources/ must not be hashed into the Lithuania release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.counts.historical_office_universe_complete !== false || inventory.counts.research_coverage_complete !== false) {
    throw new Error("Lithuania coverage flags must stay incomplete");
  }
  if (inventory.counts.total_offices !== EXPECTED_COUNTS.offices || inventory.counts.result_rows !== EXPECTED_COUNTS.result_rows) {
    throw new Error("Lithuania counts.json drifted from the accepted pack");
  }
  if (inventory.country.country_id !== COUNTRY_ID || inventory.country.name !== "Lietuva") {
    throw new Error("Lithuania country.json identity drifted");
  }
  if (inventory.country.historical_office_universe_complete !== false || inventory.country.research_coverage_complete !== false) {
    throw new Error("Lithuania country coverage flags must stay false");
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Lithuania offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Lithuania events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Lithuania geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Lithuania results, found ${inventory.results.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Lithuania classifications`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Lithuania proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.unresolvedClaims.length !== EXPECTED_COUNTS.unresolved_denominator_claims) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_denominator_claims} disputed presidential share claims`);
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
    throw new Error(`Lithuania country record_key drifted: ${countryRec}`);
  }
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Lietuva",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: inventory.country.screening_as_of_label ?? "2026-09-21",
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
        omitted_sources: OMITTED_SOURCES_PREFIX,
        draft_tier_status: inventory.tiers.status,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Map<string, string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    const previous = dateIds.get(id);
    if (previous && previous !== String(row.label)) throw new Error(`Lithuania date_id ${id} collided`);
    if (previous) return;
    dateIds.set(id, String(row.label));
    dates.push(row);
  };

  const geoById = new Set<string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (geoById.has(row.geography_id)) throw new Error(`Duplicate geography ${row.geography_id}`);
    geoById.add(row.geography_id);
    if (row.geography_id === NATIONAL_GEOGRAPHY_ID) {
      if (row.parent_geography_id != null) throw new Error("National geography LT must not have a parent");
    } else if (row.parent_geography_id !== NATIONAL_GEOGRAPHY_ID) {
      throw new Error(`Municipal geography ${row.geography_id} must parent to LT`);
    }
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
  if (!geoById.has(NATIONAL_GEOGRAPHY_ID)) throw new Error("National geography LT is missing");

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  const officeTypeById = new Map<string, string>();
  const officeRecordById = new Map<string, string>();
  let currentOffices = 0;
  const historicalOffices = 0;
  let mayorOffices = 0;
  let currentCouncils = 0;
  let currentDirectExecutives = 0;
  let currentDirectPresidents = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing a draft classification`);
    }
    if (row.successor_office_id || row.next_history_key) {
      throw new Error(`Lithuania must not invent successor edges; found ${row.office_id}`);
    }
    if (row.next_date) throw new Error(`Lithuania next dates stay absent; found one on ${row.office_id}`);
    if (row.current !== true || row.historical === true) {
      throw new Error(`Office ${row.office_id} is not a current recovered office`);
    }
    if (officeIds.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    officeIds.add(row.office_id);
    officeTypeById.set(row.office_id, row.office_type);
    currentOffices += 1;
    if (row.office_type === "municipal_council") currentCouncils += 1;
    else if (row.office_type === "direct_mayor") {
      mayorOffices += 1;
      currentDirectExecutives += 1;
    } else if (row.office_type === "direct_president") {
      currentDirectPresidents += 1;
      currentDirectExecutives += 1;
      if (row.electoral_mode !== "direct_popular") {
        throw new Error("The presidency stays directly popular");
      }
    } else if (row.office_type !== "national_parliament" && row.office_type !== "european_parliament_delegation") {
      throw new Error(`Unexpected Lithuania office type ${row.office_type} on ${row.office_id}`);
    }
    const rec = recordKey("office", [N, row.office_id]);
    officeRecordById.set(row.office_id, rec);
    if (row.office_id === AKMENE_COUNCIL_ID && rec !== AKMENE_COUNCIL_RECORD_KEY) {
      throw new Error(`Akmenė council record_key drifted: ${rec}`);
    }
    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.office_name,
      office_type: row.office_type,
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: 0,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (historicalOffices !== 0) throw new Error("Recovered historical offices must stay 0");

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    if (mapped === "regional") throw new Error(`Regional tier is not in the Lithuania register: ${row.office_id}`);
    const origin = locator({
      input_path: TIER_PATH,
      sha256: TIER_SHA256,
      json_pointer: `/classifications/${index}`,
    });
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: "needs_review",
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
  const eventByHk = new Map<string, LithuaniaEventRow>();
  let selectedHistories = 0;
  let eventDatesDay = 0;
  let eventDatesMonth = 0;
  let eventDatesYear = 0;
  let councilEvents = 0;
  let mayorEvents = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (eventByHk.has(row.history_key)) throw new Error(`Duplicate history key ${row.history_key}`);
    const expectedEventId = eventIdFor(row.history_key);
    if (row.event_id !== expectedEventId) {
      throw new Error(`Event id drifted for ${row.history_key}: ${row.event_id} != ${expectedEventId}`);
    }
    eventByHk.set(row.history_key, row);
    assertAuthoredDate(row.date, row.history_key);
    const dateIdValue = dateId("event", row.event_id, "election");
    if (row.date.precision === "year") eventDatesYear += 1;
    else if (row.date.precision === "month") eventDatesMonth += 1;
    else eventDatesDay += 1;
    pushDate({
      date_id: dateIdValue,
      label: row.date.label,
      precision: row.date.precision,
      certainty: "called",
      year: row.date.year,
      month: row.date.precision === "year" ? null : row.date.month,
      day: row.date.precision === "day" ? row.date.day : null,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
        row: row.date,
      }),
    });
    if (row.role !== "historical") {
      throw new Error(`Lithuania must not author prospective events; got ${row.role} for ${row.history_key}`);
    }
    if (row.event_kind !== "ordinary") throw new Error(`Event kind must stay ordinary for ${row.history_key}`);
    if (row.legal_outcome !== "unknown") throw new Error(`Legal outcome must stay unknown for ${row.history_key}`);
    if (row.election_mode !== "direct_popular") {
      throw new Error(`Election mode must stay direct_popular for ${row.history_key}`);
    }
    selectedHistories += 1;
    const officeType = officeTypeById.get(row.office_id)!;
    if (officeType === "municipal_council") councilEvents += 1;
    if (officeType === "direct_mayor") mayorEvents += 1;
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: "ordinary",
      selected_history_role: "selected",
      electoral_system: electoralSystem(officeType),
      comparability: null,
      ballot_basis: "unknown",
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
  let presidentialFirstRounds = 0;
  let presidentialRunoffs = 0;
  let seimasProceedings = 0;
  let mayorProceedings = 0;
  let proceedingDates = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (row.event_id !== event.event_id) {
      throw new Error(`Proceeding ${row.proceeding_id} event_id does not match ${row.history_key}`);
    }
    const expectedProceedingId = proceedingIdFor(row.office_id, row.history_key, row.sequence);
    if (row.proceeding_id !== expectedProceedingId) {
      throw new Error(`Proceeding id drifted for ${row.history_key} sequence ${row.sequence}`);
    }
    if (row.kind !== "first_round" && row.kind !== "runoff") {
      throw new Error(`Unsupported Lithuania proceeding kind ${JSON.stringify(row.kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Lithuania proceedings must not invent a supersedes edge; found ${row.proceeding_id}`);
    }
    if (proceedingIds.has(row.proceeding_id)) throw new Error(`Duplicate proceeding ${row.proceeding_id}`);
    proceedingIds.add(row.proceeding_id);
    const officeType = officeTypeById.get(row.office_id);
    if (row.office_id === PRESIDENT_ID) {
      if (row.kind === "first_round") presidentialFirstRounds += 1;
      if (row.kind === "runoff") presidentialRunoffs += 1;
    } else if (row.office_id === SEIMAS_ID) seimasProceedings += 1;
    else if (officeType === "direct_mayor") {
      if (row.kind !== "first_round") throw new Error(`Mayor proceedings stay first-round observations: ${row.proceeding_id}`);
      mayorProceedings += 1;
    } else {
      throw new Error(`Unexpected proceeding office ${row.office_id}`);
    }
    assertAuthoredDate(row.date, row.proceeding_id);
    if (row.date.precision !== "day") throw new Error(`Proceeding dates stay day precision: ${row.proceeding_id}`);
    const ballotDateId = dateId("proceeding", row.proceeding_id, "ballot");
    proceedingDates += 1;
    pushDate({
      date_id: ballotDateId,
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
        origin: originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i, "date"),
        row: row.date,
      }),
    });
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.kind,
      sequence_no: row.sequence,
      supersedes_id: null,
      legal_outcome: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) throw new Error(`Lithuania source catalogue row ${i} is missing source_id/input_path`);
    if (!row.input_path.startsWith(OMITTED_SOURCES_PREFIX)) {
      throw new Error(`Source catalogue path must point at omitted raw bytes, not a slim file: ${row.input_path}`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Lithuania source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    const expectedSourceId = `${COUNTRY_ID}--${key("url", row.url)}`;
    if (row.url && row.source_id !== expectedSourceId) {
      throw new Error(`Source id drifted for ${row.url}`);
    }
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? null,
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_on ?? null,
      evidence_grade: row.evidence_grade ?? null,
      file_sha256: row.sha256 ?? null,
      locator: canonical({ input_path: row.input_path, sha256: row.sha256 ?? null }),
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];
  const resultIds = new Set<string>();
  const resultRecordById = new Map<string, string>();
  let councilResults = 0;
  let mayorResults = 0;
  let presidentialResults = 0;
  let seimasResults = 0;
  let epResults = 0;
  let disputedShares = 0;
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    const expectedResultId = resultIdFor(row.office_id, row.history_key, row.proceeding_id ?? null, row.candidate_source_id);
    if (row.result_row_id !== expectedResultId) {
      throw new Error(`Result id drifted for ${row.office_id} ${row.history_key} ${row.candidate_source_id}`);
    }
    if (resultIds.has(row.result_row_id)) throw new Error(`Duplicate result ${row.result_row_id}`);
    resultIds.add(row.result_row_id);
    assertScalar("votes", row.votes, row.votes_status, row.result_row_id);
    assertScalar("share", row.share, row.share_status, row.result_row_id);
    assertScalar("seats", row.seats, row.seats_status, row.result_row_id);
    if (row.is_substitute != null) throw new Error(`Substitute mandates are not normalized: ${row.result_row_id}`);
    if (row.share_status === "disputed") disputedShares += 1;
    const officeType = officeTypeById.get(row.office_id);
    if (officeType === "municipal_council") councilResults += 1;
    else if (officeType === "direct_mayor") mayorResults += 1;
    else if (row.office_id === PRESIDENT_ID) presidentialResults += 1;
    else if (row.office_id === SEIMAS_ID) seimasResults += 1;
    else if (row.office_id === EP_ID) epResults += 1;
    else throw new Error(`Unexpected result office ${row.office_id}`);
    const rec = recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]);
    resultRecordById.set(row.result_row_id, rec);
    const origin = originFor(RESULTS_RELATIVE, resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id ?? null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_or_list_label ?? null,
      original_party_label: row.original_party_label ?? null,
      original_party_code: row.original_party_code ?? null,
      party_namespace: null,
      party_mapping_id: null,
      votes: row.votes ?? null,
      votes_status: row.votes_status,
      share: row.share ?? null,
      share_status: row.share_status,
      share_unit: row.share_unit ?? "percent_0_100",
      seats: row.seats ?? null,
      seats_status: row.seats_status,
      elected_flag: flag(row.elected_flag, row.result_row_id),
      is_substitute: null,
      evidence_status: row.evidence_status,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
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
      derivedPath: COUNTRY_RELATIVE,
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
        derivedPath: GEOGRAPHY_RELATIVE,
        derivedPointer: `/${index}`,
        origins: row.origins ?? null,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: officeRecordById.get(row.office_id)!,
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
        derivedPath: REGISTER_RELATIVE,
        derivedPointer: `/${index}`,
        origins: row.origins ?? null,
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
        derivedPath: EVENTS_RELATIVE,
        derivedPointer: `/${index}`,
        origins: row.origins ?? null,
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
        derivedPath: PROCEEDINGS_RELATIVE,
        derivedPointer: `/${index}`,
        origins: row.origins ?? null,
      }),
    });
  }
  for (const [index, row] of inventory.results.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: resultRecordById.get(row.result_row_id)!,
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
        derivedPath: RESULTS_RELATIVE,
        derivedPointer: `/${index}`,
        origins: row.origins ?? null,
      }),
    });
  }
  for (const [index, row] of sources.entries()) {
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
        derivedPath: SOURCES_RELATIVE,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, R, item.input_path]),
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
        derivedPath: item.input_path,
      }),
    });
  }

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: {
    recordKey: string;
    origins: LithuaniaOrigin[] | undefined;
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
      const evidenceId = lithuaniaEvidenceId(args.recordKey, sourceId, occurrence, args.claimKind);
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
    pushEvidence({
      recordKey: officeRecordById.get(row.office_id)!,
      origins: row.origins,
      claimKind: "identity",
      claim: { office_id: row.office_id, holds: row.holds ?? [] },
    });
  }
  for (const row of inventory.events) {
    const eventRec = recordKey("event", [N, row.office_id, row.history_key]);
    const dateClaimId = dateId("event", row.event_id, "election");
    if (row.raw?.date_origin) {
      pushEvidence({
        recordKey: eventRec,
        origins: row.origins,
        claimKind: "provenance",
        claim: { history_key: row.history_key },
      });
      pushEvidence({
        recordKey: eventRec,
        origins: [row.raw.date_origin],
        claimKind: "date",
        dateClaimId,
        claim: { history_key: row.history_key, date: row.date },
      });
    } else {
      pushEvidence({
        recordKey: eventRec,
        origins: row.origins,
        claimKind: "date",
        dateClaimId,
        claim: { history_key: row.history_key, date: row.date },
      });
    }
  }
  for (const row of inventory.proceedings) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      origins: row.origins,
      claimKind: "date",
      dateClaimId: dateId("proceeding", row.proceeding_id, "ballot"),
      claim: { proceeding_id: row.proceeding_id, kind: row.kind, date: row.date },
    });
  }
  for (const row of inventory.results) {
    pushEvidence({
      recordKey: resultRecordById.get(row.result_row_id)!,
      origins: row.origins,
      claimKind: "result",
      claim: { result_row_id: row.result_row_id, share_status: row.share_status, evidence_status: row.evidence_status },
    });
  }

  const unresolved: SqlRow[] = [];
  const unresolvedSeen = new Set<string>();
  const pushUnresolved = (row: SqlRow) => {
    const id = String(row.unresolved_id);
    if (unresolvedSeen.has(id)) throw new Error(`Duplicate unresolved id ${id}`);
    unresolvedSeen.add(id);
    unresolved.push(row);
  };
  for (const hold of NAMED_HOLDS) {
    const occurrence = {
      heading: hold.token,
      input_path: "docs/phase1/lithuania/Lithuania_Research_Gaps.md",
    };
    const sourceLocator = canonical(occurrence);
    pushUnresolved({
      unresolved_id: lithuaniaUnresolvedId(countryRec, occurrence, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: sourceLocator,
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: "docs/phase1/lithuania/Lithuania_Research_Gaps.md",
          json_pointer: null,
        }),
        row: { original_token: hold.token, reason: hold.reason, status: "open" },
      }),
    });
  }
  const unresolvedHash = sliceHash(inventory, UNRESOLVED_RELATIVE);
  for (let i = 0; i < inventory.unresolvedClaims.length; i++) {
    const row = inventory.unresolvedClaims[i]!;
    const resultRec = resultRecordById.get(row.target_key.result_row_id);
    if (!resultRec || row.target_table !== "result_row") {
      throw new Error(`Disputed claim ${row.token} does not target an authored result row`);
    }
    const occurrence = (row.claims ?? []).map((claim) => occurrenceWithoutSource(claim));
    const sourceLocator = canonical({
      input_path: UNRESOLVED_RELATIVE,
      json_pointer: `/${i}`,
      token: row.token,
    });
    pushUnresolved({
      unresolved_id: lithuaniaUnresolvedId(resultRec, occurrence, row.token),
      record_key: resultRec,
      original_token: row.token,
      source_locator: sourceLocator,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(UNRESOLVED_RELATIVE, unresolvedHash, i),
        row,
      }),
    });
  }
  const malformedIndex = inventory.reconciliation.findIndex(
    (row) => row.raw_invalid_text === MALFORMED_INVALID_TOKEN && row.invalid_status === "disputed",
  );
  if (malformedIndex < 0) throw new Error("Malformed runoff invalid token 1,7205 is missing");
  const malformed = inventory.reconciliation[malformedIndex]!;
  if (malformed.invalid_numeric != null) {
    throw new Error("Malformed invalid text must not be coerced to a number");
  }
  if (malformed.proceeding_id !== PRESIDENT_2019_RUNOFF_ID) {
    throw new Error("Malformed invalid token must stay on the 2019 runoff");
  }
  const runoffRec = recordKey("proceeding", [N, PRESIDENT_ID, PRESIDENT_2019_HK, PRESIDENT_2019_RUNOFF_ID]);
  const malformedOccurrence = {
    input_path: RECONCILIATION_RELATIVE,
    json_pointer: `/${malformedIndex}/raw_invalid_text`,
  };
  pushUnresolved({
    unresolved_id: lithuaniaUnresolvedId(runoffRec, malformedOccurrence, MALFORMED_INVALID_TOKEN),
    record_key: runoffRec,
    original_token: MALFORMED_INVALID_TOKEN,
    source_locator: canonical(malformedOccurrence),
    reason: "Printed runoff invalid ballots 1,7205 are retained as malformed text and are not silently corrected.",
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: originFor(RECONCILIATION_RELATIVE, sliceHash(inventory, RECONCILIATION_RELATIVE), malformedIndex),
      row: malformed,
    }),
  });

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (row.entity_kind !== "office") throw new Error(`Unexpected Lithuania crosswalk entity ${row.entity_kind}`);
    if (!row.upstream_namespace.startsWith(CROSSWALK_NAMESPACE_PREFIX)) {
      throw new Error(`Unexpected Lithuania crosswalk namespace ${row.upstream_namespace}`);
    }
    if (!row.reason.includes("not legal successor")) {
      throw new Error(`Lithuania crosswalk must not assert a successor: ${row.reason}`);
    }
    if (!/^https?:\/\//i.test(row.upstream_id)) {
      throw new Error(`Lithuania crosswalk upstream id must stay a source URL: ${row.upstream_id}`);
    }
    const matchedOffice = [...officeRecordById.entries()].find(([, rec]) => rec === row.record_key);
    if (!matchedOffice) throw new Error(`Crosswalk record_key is not an accepted office: ${row.record_key}`);
    const dedupe = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(dedupe)) throw new Error(`Duplicate Lithuania crosswalk ${row.upstream_namespace} ${row.upstream_id}`);
    crosswalkSeen.add(dedupe);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: row.record_key,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: canonical(row),
    });
  }

  if (!proceedingIds.has(PRESIDENT_2019_FIRST_ID) || !proceedingIds.has(PRESIDENT_2019_RUNOFF_ID)) {
    throw new Error("2019 presidential first round and runoff must both be retained");
  }
  if (!resultIds.has(PRESIDENT_DISPUTED_RESULT_ID)) {
    throw new Error("Disputed 2019 presidential result row is missing");
  }
  if (eventByHk.get(EP_2004_HK)?.event_id !== EP_2004_EVENT_ID) throw new Error("EP 2004 event identity drifted");
  if (eventByHk.get(PRESIDENT_2019_HK)?.event_id !== PRESIDENT_2019_EVENT_ID) {
    throw new Error("2019 presidential event identity drifted");
  }
  if (eventByHk.get(SEIMAS_2016_HK)?.event_id !== SEIMAS_2016_EVENT_ID) throw new Error("Seimas 2016 event identity drifted");
  if (!officeIds.has(AKMENE_COUNCIL_ID) || !officeIds.has(AKMENE_MAYOR_ID)) {
    throw new Error("Akmenė council and mayor must both be retained");
  }
  const akmeneCouncil = inventory.offices.find((row) => row.office_id === AKMENE_COUNCIL_ID);
  const akmeneMayor = inventory.offices.find((row) => row.office_id === AKMENE_MAYOR_ID);
  if (
    !akmeneCouncil ||
    !akmeneMayor ||
    akmeneCouncil.geography_id !== AKMENE_GEOGRAPHY_ID ||
    akmeneMayor.geography_id !== AKMENE_GEOGRAPHY_ID ||
    akmeneCouncil.office_type !== "municipal_council" ||
    akmeneMayor.office_type !== "direct_mayor"
  ) {
    throw new Error("Akmenė council and direct mayor must stay distinct offices on one geography");
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
    prospective_events: 0,
    total_events: events.length,
    result_rows: results.length,
    council_result_rows: councilResults,
    mayor_result_rows: mayorResults,
    presidential_result_rows: presidentialResults,
    seimas_result_rows: seimasResults,
    ep_result_rows: epResults,
    disputed_shares: disputedShares,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    unresolved_denominator_claims: inventory.unresolvedClaims.length,
    malformed_invalid_claims: 1,
    named_holds: NAMED_HOLDS.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_year_called: eventDatesYear,
    event_dates_month_called: eventDatesMonth,
    event_dates_day_called: eventDatesDay,
    proceeding_dates_day: proceedingDates,
    proceedings: proceedings.length,
    presidential_first_rounds: presidentialFirstRounds,
    presidential_runoffs: presidentialRunoffs,
    seimas_proceedings: seimasProceedings,
    mayor_proceedings: mayorProceedings,
    party_mappings: 0,
    mayor_offices: mayorOffices,
    current_direct_executive_offices: currentDirectExecutives,
    current_councils: currentCouncils,
    current_direct_presidents: currentDirectPresidents,
    council_events: councilEvents,
    mayor_events: mayorEvents,
    evidence_links: evidence.length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey as keyof typeof validatedCounts] !== expected) {
      throw new Error(
        `Lithuania ${countKey} count ${validatedCounts[countKey as keyof typeof validatedCounts]} != ${expected}`,
      );
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Lithuania current-register research; coverage partial. Prompt AH accepted 123 current offices and 0 recovered historical offices with named holds left open. Draft tiers stay needs_review. Do not invent successor edges, missing result zeros, party mappings, or omitted source bytes.",
  };
  const release = {
    lineage_id: L,
    release_id: R,
    fingerprint_sha256: inventory.fingerprint,
    hash_inputs_json: inventory.hashInputsJson,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    research_snapshot_label: inventory.country.research_snapshot_label ?? RESEARCH_SNAPSHOT_LABEL,
    upstream_release_id: null,
    validated_counts_json: canonical(validatedCounts),
    research_coverage_complete: 0,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256 }),
      row: { fingerprint: inventory.fingerprint, release_id: R, coverage_complete: false, tier_status: "draft_for_human_review" },
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
