import {
  ADAPTER_VERSION,
  CLONMEL_2009_EVENT_ID,
  CLONMEL_2009_HISTORY_KEY,
  CLONMEL_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNCIL_EXAMPLE_ID,
  COUNCIL_EXAMPLE_NEXT_DATE_ID,
  DAIL_DUBLIN_EVENT_ID,
  DAIL_DUBLIN_HISTORY_KEY,
  DAIL_GALWAY_EVENT_ID,
  DAIL_GALWAY_HISTORY_KEY,
  DAIL_ID,
  DAIL_RECORD_KEY,
  EP_2024_EVENT_ID,
  EP_2024_HISTORY_KEY,
  EP_ID,
  EP_NEXT_DATE_ID,
  EXPECTED_COUNTS,
  LIMERICK_COUNCIL_ID,
  LIMERICK_GEOGRAPHY_ID,
  LIMERICK_MAYOR_EVENT_ID,
  LIMERICK_MAYOR_HISTORY_KEY,
  LIMERICK_MAYOR_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  PRESIDENT_2011_EVENT_ID,
  PRESIDENT_2011_HISTORY_KEY,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SEANAD_EVENT_ID,
  SEANAD_HISTORY_KEY,
  SEANAD_ID,
  SOURCE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  electoralSystemFor,
  eventIdFor,
  irelandEvidenceId,
  irelandUnresolvedId,
  isFixtureId,
  isNorthernIrelandToken,
  locator,
  rawEnvelope,
  recordKey,
  resultIdFor,
  sourceIdFor,
  type Locator,
} from "./identity";
import type {
  IrelandEventRow,
  IrelandEvidenceRef,
  IrelandInventory,
  IrelandOfficeRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type IrelandProjection = {
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
  sources: SqlRow[];
  results: SqlRow[];
  locators: SqlRow[];
  evidence: SqlRow[];
  unresolved: SqlRow[];
  crosswalks: SqlRow[];
  validatedCounts: Record<string, number>;
};

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;
const ISO_YEAR = /^(\d{4})$/;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Ireland date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function parseDatedValue(value: string, precision: string): {
  label: string;
  precision: "day" | "month" | "year";
  year: number;
  month: number | null;
  day: number | null;
} {
  if (precision === "day") {
    const parsed = parseDayLabel(value);
    return { label: value, precision: "day", year: parsed.year, month: parsed.month, day: parsed.day };
  }
  if (precision === "month") {
    const match = ISO_MONTH.exec(value.trim());
    if (!match) throw new Error(`Ireland month date is not YYYY-MM: ${JSON.stringify(value)}`);
    const month = Number(match[2]);
    if (month < 1 || month > 12) throw new Error(`Invalid month ${value}`);
    return { label: value, precision: "month", year: Number(match[1]), month, day: null };
  }
  if (precision === "year") {
    const match = ISO_YEAR.exec(value.trim());
    if (!match) throw new Error(`Ireland year date is not YYYY: ${JSON.stringify(value)}`);
    return { label: value, precision: "year", year: Number(match[1]), month: null, day: null };
  }
  throw new Error(`Unsupported Ireland date precision ${JSON.stringify(precision)} for ${JSON.stringify(value)}`);
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

function sliceHash(inventory: IrelandInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Ireland classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function pointerOrLocator(ref: IrelandEvidenceRef): string {
  if (ref.json_pointer) return ref.json_pointer;
  if (ref.locator) return ref.locator;
  return ref.input_path;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function addCrosswalk(crosswalks: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
  if (seen.has(key)) return;
  seen.add(key);
  crosswalks.push(row);
}

function assertNamedHolds(tokens: string[]): void {
  const found = new Set(tokens);
  for (const hold of NAMED_HOLDS) {
    if (!found.has(hold)) throw new Error(`Named hold ${hold} is missing from research-gaps.json`);
  }
  if (tokens.length !== NAMED_HOLDS.length) {
    throw new Error(`Expected ${NAMED_HOLDS.length} Ireland research gaps, found ${tokens.length}`);
  }
}

export function projectIreland(inventory: IrelandInventory): IrelandProjection {
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
    if (item.input_path.endsWith("results.json") || item.input_path.endsWith("local-book-extract.json")) continue;
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Ireland offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Ireland events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Ireland results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Ireland geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Ireland classifications`);
  }
  if (inventory.proceedings.length !== 0) {
    throw new Error("Ireland proceedings.json must stay empty; STV counts are not legal rounds");
  }
  assertNamedHolds(inventory.researchGaps.map((row) => row.original_token));

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

  const registerHash = sliceHash(inventory, "data/research/ireland/office-register.json");
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Ireland",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: "data/research/ireland/office-register.json",
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        name: "Ireland",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
        northern_ireland_excluded: true,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [...NAMED_HOLDS],
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    if (dateIds.has(String(row.date_id))) return;
    dateIds.add(String(row.date_id));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Ireland`);
    if (isNorthernIrelandToken(row.name) || isNorthernIrelandToken(row.geography_id)) {
      throw new Error(`Northern Ireland geography ${row.geography_id} is excluded from this pack`);
    }
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(
      "data/research/ireland/geographies.json",
      sliceHash(inventory, "data/research/ireland/geographies.json"),
      index,
    );
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

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  const officeById = new Map<string, IrelandOfficeRow>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDates = 0;
  let directMayorOffices = 0;
  let northernIrelandOffices = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Ireland`);
    if (isNorthernIrelandToken(row.name) || isNorthernIrelandToken(row.office_id) || isNorthernIrelandToken(row.geography_id)) {
      northernIrelandOffices += 1;
      throw new Error(`Northern Ireland office ${row.office_id} is excluded from this pack`);
    }
    if (row.successor_office_id) {
      throw new Error(`Office ${row.office_id} has a successor binding; 2014 reform successors stay unresolved`);
    }
    if (row.proposed_tier === "regional") {
      throw new Error(`Office ${row.office_id} is a regional tier; regional assemblies are not a popular tier`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    if (row.office_type === "directly_elected_mayor" || row.office_id === LIMERICK_MAYOR_ID) {
      if (row.office_id !== LIMERICK_MAYOR_ID || row.office_type !== "directly_elected_mayor") {
        throw new Error(`Only the authored Mayor of Limerick may be a directly elected mayor; found ${row.office_id}`);
      }
      directMayorOffices += 1;
    } else if (/mayor|cathaoirleach|chief executive/i.test(`${row.office_type} ${row.name}`)) {
      throw new Error(`Council-selected mayor or CEO office ${row.office_id} is not an authored contest`);
    }
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} has unsupported status ${JSON.stringify(row.office_status)}`);
    }
    officeIds.add(row.office_id);
    officeById.set(row.office_id, row);
    const historical = row.office_status === "historical";
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_election) {
      const parsed = parseDatedValue(row.next_election.value, row.next_election.precision);
      if (parsed.precision !== "year" || row.next_election.certainty !== "expected") {
        throw new Error(`Ireland next dates stay year-precision expected values; got ${row.office_id}`);
      }
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextDates += 1;
      const origin = originFor("data/research/ireland/office-register.json", registerHash, i, "next_election");
      pushDate({
        date_id: nextDateId,
        label: parsed.label,
        precision: parsed.precision,
        certainty: row.next_election.certainty,
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row: row.next_election }),
      });
    }
    const origin = originFor("data/research/ireland/office-register.json", registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: row.office_status,
      record_state: "active",
      state_note: canonical({
        review_notes: row.review_notes ?? [],
        electoral_mode: row.electoral_mode ?? null,
        source_code: row.source_code ?? null,
      }),
      registry_qualified: null,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const mayor = offices.find((row) => row.office_id === LIMERICK_MAYOR_ID);
  const limerickCouncil = offices.find((row) => row.office_id === LIMERICK_COUNCIL_ID);
  if (!mayor || mayor.geography_id !== LIMERICK_GEOGRAPHY_ID) {
    throw new Error("Mayor of Limerick must share the authored Limerick City & County geography");
  }
  if (!limerickCouncil || limerickCouncil.geography_id !== LIMERICK_GEOGRAPHY_ID) {
    throw new Error("Limerick City & County Council geography drifted from the direct mayor");
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    if (mapped === "regional") {
      throw new Error(`Classification ${row.office_id} invented a regional tier`);
    }
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    const origin = locator({
      input_path: TIER_PATH,
      sha256: TIER_SHA256,
      json_pointer: `/classifications/${index}`,
    });
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

  const ballotByHistory = new Map<string, string>();
  for (const row of inventory.results) {
    const basis = row.ballot_basis ?? "unknown";
    const existing = ballotByHistory.get(row.history_key);
    if (existing && existing !== basis) {
      throw new Error(`Result ballot basis conflict on ${row.history_key}`);
    }
    ballotByHistory.set(row.history_key, basis);
  }

  const events: SqlRow[] = [];
  const eventByHk = new Map<string, IrelandEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let eventDatesDay = 0;
  let eventDatesMonth = 0;
  let eventDatesYear = 0;
  const eventsHash = sliceHash(inventory, "data/research/ireland/events.json");

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (row.event_id !== eventIdFor(row.history_key)) {
      throw new Error(`Event identity drifted for ${row.history_key}`);
    }
    eventByHk.set(row.history_key, row);
    const parsed = parseDatedValue(row.date.value, row.date.precision);
    if (row.date.certainty !== "called") {
      throw new Error(`Ireland event ${row.history_key} certainty must stay called`);
    }
    if (parsed.precision === "day") eventDatesDay += 1;
    else if (parsed.precision === "month") eventDatesMonth += 1;
    else eventDatesYear += 1;
    const dateIdValue = dateId("event", row.event_id, "ballot");
    pushDate({
      date_id: dateIdValue,
      label: parsed.label,
      precision: parsed.precision,
      certainty: row.date.certainty,
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor("data/research/ireland/events.json", eventsHash, i, "date"),
        row: row.date,
      }),
    });
    const role = row.selected_history_role ?? "selected";
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else throw new Error(`Ireland must not author prospective events; got ${role} for ${row.history_key}`);
    const office = officeById.get(row.office_id)!;
    const origin = originFor("data/research/ireland/events.json", eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: row.event_kind ?? "ordinary",
      selected_history_role: role,
      electoral_system: electoralSystemFor(office.office_type),
      comparability: null,
      ballot_basis: ballotByHistory.get(row.history_key) ?? "unknown",
      share_unit: "percent_0_100",
      legal_outcome: row.legal_outcome ?? "unknown",
      record_state: "active",
      state_note: canonical({
        notes: row.notes ?? [],
        source_cycle_year: row.source_cycle_year ?? null,
        coverage_complete: row.coverage_complete ?? false,
      }),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceByPath = new Map<string, { sourceId: string; sha256: string | null }>();
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, "data/research/ireland/sources.json");
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path || !row.url) {
      throw new Error(`Ireland source catalogue row ${i} is missing source_id/input_path/url`);
    }
    const expectedId = sourceIdFor(row.url, row.request ?? null);
    if (row.source_id !== expectedId) {
      throw new Error(`Ireland source identity drifted for ${row.input_path}`);
    }
    sourceByPath.set(row.input_path, { sourceId: row.source_id, sha256: row.sha256 ?? null });
    if (sourceById.has(row.source_id)) {
      throw new Error(`Duplicate Ireland source_id ${row.source_id}`);
    }
    sourceById.add(row.source_id);
    const origin = originFor("data/research/ireland/sources.json", sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? basename(row.input_path),
      url: row.url,
      checked_as_of_label: row.accessed_date ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: null,
      file_sha256: row.sha256 ?? null,
      locator: row.input_path,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];
  const resultsHash = sliceHash(inventory, "data/research/ireland/results.json");
  let resultParty = 0;
  let resultCandidate = 0;
  let epResults = 0;
  let seanadResults = 0;
  let limerickMayorResults = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.proceeding_id) {
      throw new Error(`Result ${row.result_row_id} invented a proceeding; STV counts stay in one ballot`);
    }
    if (row.result_row_id !== resultIdFor(row.office_id, row.history_key, row.identity_token)) {
      throw new Error(`Result identity drifted for ${row.identity_token}`);
    }
    if (/nominee|taoiseach/i.test(row.identity_token)) {
      throw new Error(`Seanad nominee row ${row.identity_token} is not an election result`);
    }
    if (row.votes != null && !Number.isInteger(row.votes)) {
      throw new Error(`Result ${row.result_row_id} votes are not an integer`);
    }
    if (row.seats != null && !Number.isInteger(row.seats)) {
      throw new Error(`Result ${row.result_row_id} seats are not an integer`);
    }
    if (row.row_type === "party") resultParty += 1;
    else if (row.row_type === "candidate") resultCandidate += 1;
    else throw new Error(`Unsupported Ireland result row_type ${JSON.stringify(row.row_type)}`);
    if (row.office_id === EP_ID) epResults += 1;
    if (row.office_id === SEANAD_ID) seanadResults += 1;
    if (row.office_id === LIMERICK_MAYOR_ID) limerickMayorResults += 1;
    const origin = originFor("data/research/ireland/results.json", resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_name ?? row.name ?? null,
      original_party_label: row.party_label ?? null,
      original_party_code: row.party_code ?? null,
      party_namespace: null,
      party_mapping_id: null,
      votes: row.votes ?? null,
      votes_status: row.votes_status,
      share: row.share ?? null,
      share_status: row.share_status,
      share_unit: row.share_unit ?? "percent_0_100",
      seats: row.seats ?? null,
      seats_status: row.seats_status,
      elected_flag: row.elected_flag === true ? 1 : row.elected_flag === false ? 0 : null,
      is_substitute: null,
      evidence_status: row.evidence_status ?? "recorded",
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
      inputPath: "data/research/ireland/office-register.json",
      sha256: registerHash,
      derivedPointer: "/0",
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
        inputPath: "data/research/ireland/geographies.json",
        sha256: sliceHash(inventory, "data/research/ireland/geographies.json"),
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === DAIL_ID && rec !== DAIL_RECORD_KEY) {
      throw new Error(`Dáil record_key drifted: ${rec}`);
    }
    addLocator(locators, locatorSeen, {
      record_key: rec,
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
        inputPath: "data/research/ireland/office-register.json",
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
        inputPath: "data/research/ireland/events.json",
        sha256: eventsHash,
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
        inputPath: "data/research/ireland/results.json",
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
        inputPath: "data/research/ireland/sources.json",
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
    refs: IrelandEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      const source = sourceByPath.get(ref.input_path);
      if (!source) {
        throw new Error(`Broken evidence source FK for ${ref.input_path} on ${args.recordKey}`);
      }
      if (ref.sha256 && source.sha256 && ref.sha256 !== source.sha256) {
        throw new Error(`Evidence hash mismatch for ${ref.input_path} on ${args.recordKey}`);
      }
      const occurrence = pointerOrLocator(ref);
      const evidenceId = irelandEvidenceId(args.recordKey, source.sourceId, ref.input_path, occurrence, args.claimKind);
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: source.sourceId,
        source_locator: canonical(ref),
        claim_kind: args.claimKind,
        date_claim_id: args.dateClaimId ?? null,
        claim_json: canonical(args.claim),
        lineage_id: L,
        release_id: R,
      });
    }
  };

  for (const [index, row] of inventory.geographies.entries()) {
    pushEvidence({
      recordKey: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      refs: row.evidence,
      claimKind: "institutional_mode",
      claim: { geography_id: row.geography_id, index },
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
        claim: row.next_election,
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
      claim: { history_key: event.history_key, date: source.date },
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
  const gapsHash = sliceHash(inventory, "data/research/ireland/research-gaps.json");
  for (let i = 0; i < inventory.researchGaps.length; i++) {
    const row = inventory.researchGaps[i]!;
    const origin = originFor("data/research/ireland/research-gaps.json", gapsHash, i);
    const sourceLocator = canonical({
      input_path: "data/research/ireland/research-gaps.json",
      json_pointer: `/${i}`,
    });
    const targets = row.office_ids ?? [];
    const recordKeys = targets.length === 0 ? [countryRec] : targets.map((officeId) => {
      if (!officeIds.has(officeId)) {
        throw new Error(`Research gap ${row.original_token} targets unknown office ${officeId}`);
      }
      return recordKey("office", [N, officeId]);
    });
    for (const recordKeyValue of recordKeys) {
      unresolved.push({
        unresolved_id: irelandUnresolvedId(recordKeyValue, sourceLocator, row.original_token),
        record_key: recordKeyValue,
        original_token: row.original_token,
        source_locator: sourceLocator,
        reason: row.reason,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row }),
      });
    }
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (!officeIds.has(row.target_office_id)) {
      throw new Error(`Crosswalk target ${row.target_office_id} is not in the accepted register`);
    }
    addCrosswalk(crosswalks, crosswalkSeen, {
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
    total_events: events.length,
    result_rows: results.length,
    result_rows_party: resultParty,
    result_rows_candidate: resultCandidate,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    catalogue_rows: inventory.sourceCatalogue.length,
    unresolved_evidence: unresolved.length,
    unresolved_research_gaps: inventory.researchGaps.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDatesDay,
    event_dates_month_called: eventDatesMonth,
    event_dates_year_called: eventDatesYear,
    next_dates_year_expected: nextDates,
    proceedings: 0,
    party_mappings: 0,
    direct_mayor_offices: directMayorOffices,
    limerick_mayor_result_rows: limerickMayorResults,
    ep_result_rows: epResults,
    seanad_result_rows: seanadResults,
    northern_ireland_offices: northernIrelandOffices,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Ireland ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const pinnedEvents: Array<[string, string]> = [
    [DAIL_DUBLIN_HISTORY_KEY, DAIL_DUBLIN_EVENT_ID],
    [DAIL_GALWAY_HISTORY_KEY, DAIL_GALWAY_EVENT_ID],
    [EP_2024_HISTORY_KEY, EP_2024_EVENT_ID],
    [SEANAD_HISTORY_KEY, SEANAD_EVENT_ID],
    [PRESIDENT_2011_HISTORY_KEY, PRESIDENT_2011_EVENT_ID],
    [LIMERICK_MAYOR_HISTORY_KEY, LIMERICK_MAYOR_EVENT_ID],
    [CLONMEL_2009_HISTORY_KEY, CLONMEL_2009_EVENT_ID],
  ];
  for (const [historyKey, eventId] of pinnedEvents) {
    const row = eventByHk.get(historyKey);
    if (!row || row.event_id !== eventId) {
      throw new Error(`Pinned Ireland event drifted: ${historyKey}`);
    }
  }
  const example = offices.find((row) => row.office_id === COUNCIL_EXAMPLE_ID);
  if (!example || example.next_date_id !== COUNCIL_EXAMPLE_NEXT_DATE_ID || example.next_history_key != null) {
    throw new Error("Out-of-window council next date must stay year-only with no prospective event");
  }
  const epOffice = offices.find((row) => row.office_id === EP_ID);
  if (!epOffice || epOffice.next_date_id !== EP_NEXT_DATE_ID) {
    throw new Error("Ireland EP 2029 next-date identity drifted");
  }
  const clonmel = offices.find((row) => row.office_id === CLONMEL_ID);
  if (!clonmel || clonmel.office_status !== "historical" || clonmel.record_state !== "active" || clonmel.next_date_id != null) {
    throw new Error("Historical Clonmel borough must stay active without an inferred end date");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Republic of Ireland current-register and historic primary-source research; coverage partial. Prompt AB accepted 36 current + 86 historical offices with named holds. Northern Ireland remains excluded.",
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
    sources,
    results,
    locators,
    evidence,
    unresolved,
    crosswalks,
    validatedCounts,
  };
}
