import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RECORD_KEY,
  EXPECTED_COUNTS,
  HELSINKI_COUNCIL_ID,
  HELSINKI_RECORD_KEY,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  isFixtureId,
  isMayorToken,
  locator,
  rawEnvelope,
  recordKey,
  finlandEvidenceId,
  finlandUnresolvedId,
  type Locator,
} from "./identity";
import type {
  FinlandAuthoredDate,
  FinlandEventRow,
  FinlandEvidenceRef,
  FinlandInventory,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type FinlandProjection = {
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
  if (!match) throw new Error(`Finland event date is not a valid ISO day: ${JSON.stringify(label)}`);
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
  const match = ISO_YEAR.exec(label.trim());
  if (!match) throw new Error(`Finland year date is not YYYY: ${JSON.stringify(label)}`);
  return Number(match[1]);
}

function authoredDate(value: FinlandAuthoredDate | string | null | undefined): FinlandAuthoredDate | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const precision = ISO_DAY.test(value) ? "day" : "year";
    return { value, precision, certainty: "called" };
  }
  if (!value.value || !value.precision) {
    throw new Error(`Finland authored date is missing value/precision: ${JSON.stringify(value)}`);
  }
  return value;
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

function sliceHash(inventory: FinlandInventory, relativePath: string): string {
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

function joinNotes(notes: string[] | undefined, extra?: Array<string | null | undefined>): string | null {
  const parts = [...(notes ?? []), ...(extra ?? [])].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length ? parts.join(" ") : null;
}

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string | null {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other" || raw === "national_context") return raw;
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported Finland classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function pointerOrLocator(ref: FinlandEvidenceRef): string {
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

export function projectFinland(inventory: FinlandInventory): FinlandProjection {
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
    if (item.input_path.endsWith("results.json")) continue;
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Finland offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Finland events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Finland results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Finland geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Finland classifications`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Finland proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.researchGaps.length !== EXPECTED_COUNTS.unresolved_research_gaps) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_research_gaps} Finland named holds, found ${inventory.researchGaps.length}`);
  }
  const gapTokens = inventory.researchGaps.map((row) => row.original_token);
  for (const hold of NAMED_HOLDS) {
    if (!gapTokens.includes(hold)) {
      throw new Error(`Finland named hold ${hold} is missing from research-gaps.json`);
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
    payload_json:
      item.input_path.endsWith("results.json") || !item.input_path.endsWith(".json") ? null : item.text,
  }));

  const registerHash = sliceHash(inventory, "data/research/finland/office-register.json");
  const countryRec = recordKey("country", [COUNTRY_ID]);
  if (countryRec !== COUNTRY_RECORD_KEY) {
    throw new Error(`Finland country record_key drifted: ${countryRec}`);
  }
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Suomi",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: "data/research/finland/office-register.json",
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        name: "Suomi",
        language: "fi",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
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
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Finland`);
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(
      "data/research/finland/geographies.json",
      sliceHash(inventory, "data/research/finland/geographies.json"),
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
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDayStatutory = 0;
  let mayorOffices = 0;
  let helsinkiCountyOffices = 0;
  let alandCurrentWithoutNext = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Finland`);
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    if (isMayorToken(row.office_id) || isMayorToken(row.office_type) || isMayorToken(row.name)) {
      mayorOffices += 1;
      throw new Error(`Finland must not project popular mayor/executive rows; found ${row.office_id}`);
    }
    if (row.successor_office_id) {
      throw new Error(`Finland must not invent successor edges; found ${row.office_id} -> ${String(row.successor_office_id)}`);
    }
    if (/helsinki/i.test(row.name) && row.office_type === "wellbeing_county_council") {
      helsinkiCountyOffices += 1;
    }
    if (row.office_id.startsWith("FI-M") && row.geography_id.startsWith("FI-M") && row.office_status === "current" && !row.next_election) {
      alandCurrentWithoutNext += 1;
    }
    officeIds.add(row.office_id);
    const historical = row.office_status === "historical" || row.current === false;
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    const historicNote = historical
      ? "Historical coded jurisdiction retained; successor/boundary review remains open. No inferred abolition date."
      : null;
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    const next = authoredDate(row.next_election);
    if (next) {
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      const origin = originFor(
        "data/research/finland/office-register.json",
        registerHash,
        i,
        "next_election",
      );
      if (next.precision === "day") {
        const parsed = parseDayLabel(next.value);
        if (next.certainty !== "statutory") {
          throw new Error(`Finland day next-date must stay statutory; got ${JSON.stringify(next.certainty)} on ${row.office_id}`);
        }
        nextDayStatutory += 1;
        pushDate({
          date_id: nextDateId,
          label: next.value,
          precision: "day",
          certainty: next.certainty,
          year: parsed.year,
          month: parsed.month,
          day: parsed.day,
          range_start_id: null,
          range_end_id: null,
          lineage_id: L,
          release_id: R,
          raw_json: rawEnvelope({ origin, row: next }),
        });
      } else {
        throw new Error(`Unsupported Finland next-election precision ${JSON.stringify(next.precision)} on ${row.office_id}`);
      }
    }
    const origin = originFor("data/research/finland/office-register.json", registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: joinNotes(row.review_notes ?? row.notes, [historicNote]),
      registry_qualified: null,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (helsinkiCountyOffices !== 0) {
    throw new Error(`Finland must not invent a Helsinki county office; found ${helsinkiCountyOffices}`);
  }
  if (inventory.offices.some((row) => row.office_id === "FI-HVA00-C" || /FI-HVA.*091/.test(row.office_id))) {
    throw new Error("Finland must not invent a Helsinki wellbeing-county office");
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
  const eventByHk = new Map<string, FinlandEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  const prospectiveEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let hva2023Events = 0;
  const eventsHash = sliceHash(inventory, "data/research/finland/events.json");

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    eventByHk.set(row.history_key, row);
    const date = authoredDate(row.date);
    if (!date) throw new Error(`Event ${row.history_key} is missing a resolved date`);
    const dateIdValue = dateId("election_event", row.event_id, "ballot");
    if (date.precision === "year") {
      const year = parseYearLabel(date.value);
      eventDatesYear += 1;
      pushDate({
        date_id: dateIdValue,
        label: date.value,
        precision: "year",
        certainty: date.certainty ?? "called",
        year,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor("data/research/finland/events.json", eventsHash, i, "date"),
          row: date,
        }),
      });
    } else if (date.precision === "day") {
      const parsed = parseDayLabel(date.value);
      eventDatesDay += 1;
      pushDate({
        date_id: dateIdValue,
        label: date.value,
        precision: "day",
        certainty: date.certainty ?? "called",
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor("data/research/finland/events.json", eventsHash, i, "date"),
          row: date,
        }),
      });
    } else {
      throw new Error(`Unsupported Finland event precision ${JSON.stringify(date.precision)} on ${row.history_key}`);
    }
    const role = row.selected_history_role ?? "selected";
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else throw new Error(`Finland must not author prospective events; got ${role} for ${row.history_key}`);
    if (row.office_id.startsWith("FI-HVA") && row.history_key.includes("::2023::")) {
      hva2023Events += 1;
    }

    const origin = originFor("data/research/finland/events.json", eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: row.event_kind ?? "ordinary",
      selected_history_role: role,
      electoral_system: null,
      comparability: null,
      ballot_basis: row.ballot_basis ?? "valid_votes",
      share_unit: "percent_0_100",
      legal_outcome: row.legal_outcome ?? "unknown",
      record_state: "active",
      state_note: joinNotes(row.notes),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingIds = new Set<string>();
  let presidentialFirstRounds = 0;
  let presidentialRunoffs = 0;
  let president2018Runoffs = 0;
  const proceedingsHash = sliceHash(inventory, "data/research/finland/proceedings.json");
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    }
    if (row.kind !== "first_round" && row.kind !== "runoff") {
      throw new Error(`Unsupported Finland proceeding kind ${JSON.stringify(row.kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Finland runoff must not supersede its first round; found ${row.proceeding_id}`);
    }
    proceedingIds.add(row.proceeding_id);
    if (row.kind === "first_round") presidentialFirstRounds += 1;
    if (row.kind === "runoff") {
      presidentialRunoffs += 1;
      if (row.history_key.includes("::2018::")) president2018Runoffs += 1;
    }
    const origin = originFor("data/research/finland/proceedings.json", proceedingsHash, i);
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
  const sourceByPath = new Map<string, string>();
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, "data/research/finland/sources.json");
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Finland source catalogue row ${i} is missing source_id/input_path`);
    }
    sourceByPath.set(row.input_path, row.source_id);
    if (sourceById.has(row.source_id)) {
      throw new Error(`Duplicate Finland source_id ${row.source_id}`);
    }
    sourceById.add(row.source_id);
    const origin = originFor("data/research/finland/sources.json", sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? basename(row.input_path),
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_on ?? row.retrieved_at ?? RESEARCH_SNAPSHOT_LABEL,
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
  const resultsHash = sliceHash(inventory, "data/research/finland/results.json");
  let mayorResults = 0;
  let resultPartyCategory = 0;
  let resultCandidate = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.proceeding_id && !proceedingIds.has(row.proceeding_id)) {
      throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
    }
    if (isMayorToken(row.office_id)) mayorResults += 1;
    if (row.row_type === "source_party_category") resultPartyCategory += 1;
    else if (row.row_type === "candidate") resultCandidate += 1;
    const origin = originFor("data/research/finland/results.json", resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id ?? null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.name ?? row.candidate_or_list_label ?? null,
      original_party_label: row.party_label ?? row.original_party_label ?? null,
      original_party_code: row.party_code ?? row.original_party_code ?? null,
      party_namespace: null,
      party_mapping_id: null,
      votes: row.votes ?? null,
      votes_status: row.votes_status,
      share: row.share ?? null,
      share_status: row.share_status,
      share_unit: row.share_unit ?? "percent_0_100",
      seats: row.seats ?? null,
      seats_status: row.seats_status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: row.evidence_status ?? "recorded",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorResults !== 0) throw new Error("Finland must not project mayor vote rows");

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
      inputPath: "data/research/finland/office-register.json",
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
        inputPath: "data/research/finland/geographies.json",
        sha256: sliceHash(inventory, "data/research/finland/geographies.json"),
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === HELSINKI_COUNCIL_ID && rec !== HELSINKI_RECORD_KEY) {
      throw new Error(`Helsinki council record_key drifted: ${rec}`);
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
        inputPath: "data/research/finland/office-register.json",
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
        inputPath: "data/research/finland/events.json",
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
        inputPath: "data/research/finland/proceedings.json",
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
        inputPath: "data/research/finland/results.json",
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
        inputPath: "data/research/finland/sources.json",
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
    refs: FinlandEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      const sourceId = sourceByPath.get(ref.input_path);
      if (!sourceId) {
        throw new Error(`Broken evidence source FK for ${ref.input_path} on ${args.recordKey}`);
      }
      const occurrence = pointerOrLocator(ref);
      const evidenceId = finlandEvidenceId(args.recordKey, sourceId, ref.input_path, occurrence, args.claimKind);
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: sourceId,
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
    const date = authoredDate(source.date);
    pushEvidence({
      recordKey: recordKey("event", [N, event.office_id, event.history_key]),
      refs: source.evidence,
      claimKind: "election_date",
      dateClaimId: event.date_id ? String(event.date_id) : null,
      claim: { history_key: event.history_key, date: date?.value ?? null },
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
  const gapsHash = sliceHash(inventory, "data/research/finland/research-gaps.json");
  for (let i = 0; i < inventory.researchGaps.length; i++) {
    const row = inventory.researchGaps[i]!;
    const origin = originFor("data/research/finland/research-gaps.json", gapsHash, i);
    const sourceLocator = canonical({
      input_path: "data/research/finland/research-gaps.json",
      json_pointer: `/${i}`,
    });
    unresolved.push({
      unresolved_id: finlandUnresolvedId(countryRec, sourceLocator, row.original_token),
      record_key: countryRec,
      original_token: row.original_token,
      source_locator: sourceLocator,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
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
    prospective_events: prospectiveEvents,
    total_events: events.length,
    result_rows: results.length,
    result_rows_source_party_category: resultPartyCategory,
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
    event_dates_year_called: eventDatesYear,
    next_dates_day_statutory: nextDayStatutory,
    proceedings: proceedings.length,
    presidential_first_rounds: presidentialFirstRounds,
    presidential_runoffs: presidentialRunoffs,
    party_mappings: 0,
    mayor_offices: mayorOffices,
    mayor_result_rows: mayorResults,
    named_holds: unresolved.length,
    helsinki_county_offices: helsinkiCountyOffices,
    aland_current_without_next: alandCurrentWithoutNext,
    hva_2023_events: hva2023Events,
    president_2018_runoffs: president2018Runoffs,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Finland ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Finland current-register and historic primary-source research; coverage partial. Prompt Z accepted 333 current + 170 historical offices with named holds. Do not invent merger successors, early Åland contests, wellbeing predecessors, or missing result scalars.",
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
