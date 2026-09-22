import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RECORD_KEY,
  COUNTRY_RELATIVE,
  CROSSWALK_REASON,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  JOHVI_CURRENT_ID,
  JOHVI_HISTORICAL_ID,
  KOV_2013_EXAMPLE_EVENT_ID,
  KOV_2013_EXAMPLE_HK,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  NONADDITIVE_RELATIVE,
  OFFICE_NAMESPACE,
  OMITTED_RESULTS_RELATIVE,
  PRESIDENT_1992_EVENT_ID,
  PRESIDENT_1992_FIRST_ID,
  PRESIDENT_1992_HK,
  PRESIDENT_1992_SECOND_ID,
  PRESIDENT_2016_EVENT_ID,
  PRESIDENT_2016_HK,
  PRESIDENT_2016_REPEAT_ID,
  PRESIDENT_ID,
  PRESIDENT_2026_EVENT_ID,
  PRESIDENT_2026_HK,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RIIGIKOGU_2023_EVENT_ID,
  RIIGIKOGU_2023_HK,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TALLINN_ID,
  TIER_PATH,
  TIER_SHA256,
  TOILA_ID,
  canonical,
  dateId,
  estoniaEvidenceId,
  estoniaUnresolvedId,
  isFixtureId,
  isMayorToken,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  EstoniaAuthoredDate,
  EstoniaEventRow,
  EstoniaInventory,
  EstoniaOrigin,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type EstoniaProjection = {
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

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Estonia date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function assertAuthoredDate(date: EstoniaAuthoredDate, where: string, expectedCertainty: string): void {
  if (!date.label || !date.precision || !date.certainty) {
    throw new Error(`Estonia date is incomplete at ${where}`);
  }
  if (date.certainty !== expectedCertainty) {
    throw new Error(`Estonia date certainty ${JSON.stringify(date.certainty)} != ${expectedCertainty} at ${where}`);
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
  throw new Error(`Unsupported Estonia date precision ${JSON.stringify(date.precision)} at ${where}`);
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

function sliceHash(inventory: EstoniaInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Estonia classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function occurrenceWithoutSource(origin: EstoniaOrigin): Record<string, unknown> {
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

function mapElectionMode(mode: string, officeId: string, historyKey: string): { event_kind: string; ballot_basis: string } {
  if (mode === "direct_popular") {
    if (officeId === PRESIDENT_ID) {
      throw new Error(`Presidency must not be stored as a current popular mode; found direct_popular on ${historyKey}`);
    }
    return { event_kind: "ordinary", ballot_basis: "valid_votes" };
  }
  if (mode === "indirect_riigikogu_or_electoral_body") {
    if (officeId !== PRESIDENT_ID) {
      throw new Error(`Indirect franchise is presidential only; found ${mode} on ${historyKey}`);
    }
    return { event_kind: "indirect", ballot_basis: "electors" };
  }
  if (mode === "transitional_popular_then_riigikogu") {
    if (historyKey !== PRESIDENT_1992_HK) {
      throw new Error(`The popular presidential exception is only the evidenced 1992 cycle; found ${historyKey}`);
    }
    return { event_kind: "unknown", ballot_basis: "unknown" };
  }
  throw new Error(`Unsupported Estonia election_mode ${JSON.stringify(mode)} on ${historyKey}`);
}

export function projectEstonia(inventory: EstoniaInventory): EstoniaProjection {
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
    if (item.input_path === OMITTED_RESULTS_RELATIVE) {
      throw new Error("Omitted results.json must not be hashed into the Estonia release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (!inventory.byPath.has(NONADDITIVE_RELATIVE)) {
    throw new Error("nonadditive-list-summaries.json must stay a retained input and must not be promoted to result rows");
  }
  if (inventory.counts.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error(`Documentary omitted result count drifted: ${inventory.counts.results}`);
  }
  if (inventory.byPath.has(OMITTED_RESULTS_RELATIVE)) {
    throw new Error("results.json is omitted from the slim pack and must not be invented");
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Estonia offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Estonia events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Estonia geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Estonia classifications`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Estonia proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.country.country_id !== COUNTRY_ID || inventory.country.name !== "Eesti") {
    throw new Error("Estonia country.json identity drifted");
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
    throw new Error(`Estonia country record_key drifted: ${countryRec}`);
  }
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Eesti",
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
        omitted_results: OMITTED_RESULTS_RELATIVE,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Map<string, string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    const previous = dateIds.get(id);
    if (previous && previous !== String(row.label)) {
      throw new Error(`Estonia date_id ${id} collided`);
    }
    if (previous) return;
    dateIds.set(id, String(row.label));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Estonia`);
    if (row.parent_geography_id) {
      throw new Error(`Estonia geography ${row.geography_id} must not invent a parent`);
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
  let nextYearExpected = 0;
  let mayorOffices = 0;
  let currentCouncils = 0;
  let currentDirectExecutives = 0;
  let currentIndirectPresidencies = 0;
  const rosterCounts = new Map<number, number>();

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Estonia`);
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    if (isMayorToken(row.office_id) || isMayorToken(row.office_type) || isMayorToken(row.office_name)) {
      mayorOffices += 1;
      throw new Error(`Estonia must not project mayor or executive rows; found ${row.office_id}`);
    }
    if (row.successor_office_id) {
      throw new Error(`Estonia must not invent successor edges; found ${row.office_id}`);
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
      for (const year of row.observed_cycles ?? []) {
        rosterCounts.set(year, (rosterCounts.get(year) ?? 0) + 1);
      }
    } else if (row.office_type === "national_president") {
      if (row.election_mode !== "indirect_riigikogu_or_electoral_body") {
        throw new Error("The presidency office stays indirect; 1992 is an event exception, not an office mode");
      }
      if (!historical) currentIndirectPresidencies += 1;
    } else if (row.office_type !== "national_parliament" && row.office_type !== "european_parliament_delegation") {
      if (!historical) currentDirectExecutives += 1;
      throw new Error(`Unexpected Estonia office type ${row.office_type} on ${row.office_id}`);
    }
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_date) {
      assertAuthoredDate(row.next_date, row.office_id, "expected");
      if (row.next_date.precision !== "year") {
        throw new Error(`Estonia next dates stay year-only; found ${row.next_date.precision} on ${row.office_id}`);
      }
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextYearExpected += 1;
      const origin = originFor(REGISTER_RELATIVE, registerHash, i, "next_date");
      pushDate({
        date_id: nextDateId,
        label: row.next_date.label,
        precision: "year",
        certainty: "expected",
        year: row.next_date.year,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row: row.next_date }),
      });
    }
    const holds = row.holds ?? [];
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
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorOffices !== 0 || currentDirectExecutives !== 0) {
    throw new Error("Estonia current direct-executive offices must stay 0");
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
  const eventByHk = new Map<string, EstoniaEventRow>();
  let selectedHistories = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let presidentIndirectEvents = 0;
  let president1992Events = 0;
  let president2021Events = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (row.history_key.includes("PRES_2021") || row.cycle === "PRES_2021") president2021Events += 1;
    eventByHk.set(row.history_key, row);
    assertAuthoredDate(row.date, row.history_key, "called");
    const dateIdValue = dateId("event", row.event_id, "election");
    if (row.date.precision === "year") {
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
    if ((row.event_role ?? "selected") !== "selected") {
      throw new Error(`Estonia must not author prospective events; got ${row.event_role} for ${row.history_key}`);
    }
    selectedHistories += 1;
    const mapped = mapElectionMode(row.election_mode, row.office_id, row.history_key);
    if (mapped.event_kind === "indirect") presidentIndirectEvents += 1;
    if (row.history_key === PRESIDENT_1992_HK) president1992Events += 1;
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: mapped.event_kind,
      selected_history_role: "selected",
      electoral_system: null,
      comparability: null,
      ballot_basis: mapped.ballot_basis,
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
  let presidentialRepeats = 0;
  let proceedingDates = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    const event = eventByHk.get(row.history_key);
    if (!event) throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    if (row.event_id !== event.event_id) {
      throw new Error(`Proceeding ${row.proceeding_id} event_id does not match ${row.history_key}`);
    }
    if (row.proceeding_kind !== "first_round" && row.proceeding_kind !== "runoff" && row.proceeding_kind !== "repeat") {
      throw new Error(`Unsupported Estonia proceeding kind ${JSON.stringify(row.proceeding_kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Estonia proceedings must not invent a supersedes edge; found ${row.proceeding_id}`);
    }
    if (row.office_id !== PRESIDENT_ID) {
      throw new Error(`Proceedings are presidential ballots only; found ${row.office_id}`);
    }
    proceedingIds.add(row.proceeding_id);
    if (row.proceeding_kind === "first_round") presidentialFirstRounds += 1;
    if (row.proceeding_kind === "runoff") presidentialRunoffs += 1;
    if (row.proceeding_kind === "repeat") presidentialRepeats += 1;
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
    if (!row.source_id || !row.input_path) {
      throw new Error(`Estonia source catalogue row ${i} is missing source_id/input_path`);
    }
    if (row.sha256 && !/^[0-9a-f]{64}$/.test(row.sha256)) {
      throw new Error(`Estonia source ${row.source_id} sha256 is not lowercase hex`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Estonia source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? basename(row.input_path),
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_on ?? RESEARCH_SNAPSHOT_LABEL,
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
    origins: EstoniaOrigin[] | undefined;
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
      const evidenceId = estoniaEvidenceId(args.recordKey, sourceId, occurrence, args.claimKind);
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
      claimKind: "institutional_mode",
      claim: { geography_id: row.geography_id },
    });
  }
  for (const row of inventory.offices) {
    const rec = recordKey("office", [N, row.office_id]);
    pushEvidence({
      recordKey: rec,
      origins: row.origins,
      claimKind: "register_identity",
      claim: { office_id: row.office_id },
    });
    if (row.next_date?.origin) {
      const nextOrigin = row.next_date.origin;
      pushEvidence({
        recordKey: rec,
        origins: nextOrigin ? [nextOrigin] : [],
        claimKind: "next_date",
        dateClaimId: dateId("office", row.office_id, "next"),
        claim: { label: row.next_date.label, precision: row.next_date.precision },
      });
    }
  }
  for (const row of inventory.events) {
    pushEvidence({
      recordKey: recordKey("event", [N, row.office_id, row.history_key]),
      origins: row.origins,
      claimKind: "election_date",
      dateClaimId: dateId("event", row.event_id, "election"),
      claim: { history_key: row.history_key, label: row.date.label },
    });
  }
  for (const row of inventory.proceedings) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      origins: row.origin ? [row.origin] : [],
      claimKind: "ballot_date",
      dateClaimId: dateId("proceeding", row.proceeding_id, "ballot"),
      claim: { proceeding_id: row.proceeding_id, date_label: row.date_label, kind: row.proceeding_kind },
    });
  }

  const unresolved: SqlRow[] = [];
  for (const hold of NAMED_HOLDS) {
    const sourceLocator = canonical({
      input_path: "docs/phase1/estonia/Estonia_Research_Gaps.md",
      heading: hold.token,
    });
    unresolved.push({
      unresolved_id: estoniaUnresolvedId(countryRec, sourceLocator, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: sourceLocator,
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: "docs/phase1/estonia/Estonia_Research_Gaps.md",
          json_pointer: null,
        }),
        row: { original_token: hold.token, reason: hold.reason, status: "open" },
      }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (row.upstream_namespace !== "ehak:volikogu") {
      throw new Error(`Unexpected Estonia crosswalk namespace ${row.upstream_namespace}`);
    }
    if (row.reason !== CROSSWALK_REASON) {
      throw new Error(`Estonia crosswalk must not assert a successor: ${row.reason}`);
    }
    if (!/^\d{4}$/.test(row.upstream_id)) {
      throw new Error(`Estonia EHAK code must stay four digits: ${row.upstream_id}`);
    }
    const officeId = `EE-M${row.upstream_id}-C`;
    if (!officeIds.has(officeId)) {
      throw new Error(`Crosswalk EHAK ${row.upstream_id} is not an accepted council`);
    }
    const rec = recordKey("office", [N, officeId]);
    if (row.record_key !== rec) {
      throw new Error(`Crosswalk record_key drifted for ${officeId}`);
    }
    const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(key)) throw new Error(`Duplicate Estonia crosswalk ${row.upstream_id}`);
    crosswalkSeen.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: rec,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: canonical(row),
    });
  }

  const knownEvents = new Map(events.map((row) => [String(row.history_key), String(row.event_id)]));
  if (knownEvents.get(KOV_2013_EXAMPLE_HK) !== KOV_2013_EXAMPLE_EVENT_ID) {
    throw new Error("2013 example event identity drifted");
  }
  if (knownEvents.get(RIIGIKOGU_2023_HK) !== RIIGIKOGU_2023_EVENT_ID) {
    throw new Error("Riigikogu 2023 event identity drifted");
  }
  if (knownEvents.get(PRESIDENT_1992_HK) !== PRESIDENT_1992_EVENT_ID) {
    throw new Error("1992 presidential event identity drifted");
  }
  if (knownEvents.get(PRESIDENT_2016_HK) !== PRESIDENT_2016_EVENT_ID) {
    throw new Error("2016 presidential event identity drifted");
  }
  if (knownEvents.get(PRESIDENT_2026_HK) !== PRESIDENT_2026_EVENT_ID) {
    throw new Error("2026 presidential event identity drifted");
  }
  if (!proceedingIds.has(PRESIDENT_1992_FIRST_ID) || !proceedingIds.has(PRESIDENT_1992_SECOND_ID)) {
    throw new Error("1992 presidential ballots must both be retained");
  }
  if (!proceedingIds.has(PRESIDENT_2016_REPEAT_ID)) {
    throw new Error("2016 renewed Riigikogu ballot must stay a repeat proceeding");
  }
  const johvi = inventory.offices.find((row) => row.office_id === JOHVI_CURRENT_ID);
  const oldJohvi = inventory.offices.find((row) => row.office_id === JOHVI_HISTORICAL_ID);
  const toila = inventory.offices.find((row) => row.office_id === TOILA_ID);
  const tallinn = inventory.offices.filter((row) => row.office_id === TALLINN_ID || /tallinn/i.test(row.office_name));
  if (!johvi?.current || oldJohvi?.current !== false || toila?.current !== false) {
    throw new Error("Jõhvi 0250 stays current; earlier Jõhvi and Toila stay historical");
  }
  if (tallinn.length !== 1 || tallinn[0]?.office_id !== TALLINN_ID) {
    throw new Error("Tallinn must remain one council");
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
    documented_result_rows_omitted: inventory.counts.results,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    unresolved_research_gaps: NAMED_HOLDS.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_year_called: eventDatesYear,
    event_dates_day_called: eventDatesDay,
    next_dates_year_expected: nextYearExpected,
    proceeding_dates_day: proceedingDates,
    proceedings: proceedings.length,
    presidential_first_rounds: presidentialFirstRounds,
    presidential_runoffs: presidentialRunoffs,
    presidential_repeats: presidentialRepeats,
    party_mappings: 0,
    mayor_offices: mayorOffices,
    current_direct_executive_offices: currentDirectExecutives,
    current_councils: currentCouncils,
    current_indirect_presidential_offices: currentIndirectPresidencies,
    named_holds: unresolved.length,
    president_2021_events: president2021Events,
    president_indirect_events: presidentIndirectEvents,
    president_1992_events: president1992Events,
    roster_2013: rosterCounts.get(2013) ?? 0,
    roster_2017: rosterCounts.get(2017) ?? 0,
    roster_2021: rosterCounts.get(2021) ?? 0,
    roster_2025: rosterCounts.get(2025) ?? 0,
    evidence_links: evidence.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Estonia ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Estonia current-register and historic primary-source research; coverage partial. Prompt AF accepted 81 current + 200 historical offices with named holds EE-G01–EE-G09. Do not invent mayors, successor edges, a 2021 presidential row, or omitted result bytes. The presidency stays indirect except the evidenced 1992 exception.",
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
