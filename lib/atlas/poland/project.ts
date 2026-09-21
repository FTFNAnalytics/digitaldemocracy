import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  BOLESLAWIEC_COUNCIL_ID,
  BOLESLAWIEC_RECORD_KEY,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_NAMESPACE,
  OSTROWICE_COUNCIL_ID,
  OSTROWICE_EXECUTIVE_ID,
  POWIAT_EXAMPLE_ID,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SEJM_ID,
  SEJMIK_EXAMPLE_ID,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  WARSAW_DISTRICT_EXAMPLE_ID,
  canonical,
  dateId,
  eventIdFor,
  isAppointedVoivodeOrCabinet,
  isFixtureId,
  locator,
  polandEvidenceId,
  polandUnresolvedId,
  proceedingIdFor,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  PolandEvidenceRef,
  PolandEventRow,
  PolandInventory,
  PolandOfficeRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type PolandProjection = {
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

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Poland date is not a valid ISO day: ${JSON.stringify(label)}`);
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
  if (!match) throw new Error(`Poland year label is not a four-digit year: ${JSON.stringify(label)}`);
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

function sliceHash(inventory: PolandInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Poland classification tier ${JSON.stringify(tier)}`);
}

function pointerOrLocator(ref: PolandEvidenceRef): unknown {
  if (typeof ref.json_pointer === "string" && ref.json_pointer.length > 0) return ref.json_pointer;
  if (ref.locator != null && ref.locator !== "") return ref.locator;
  return ref.input_path;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

export function projectPoland(inventory: PolandInventory): PolandProjection {
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
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Poland offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Poland events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Poland geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Poland proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Poland classifications`);
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
    name: "Polska",
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
        name: "Polska",
        language: "pl",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [
          "PL-HISTORIC-TERRITORIES",
          "PL-1990-1999-REFORMS",
          "PL-CYCLE-LEGAL-STATUS",
          "PL-2019-SHARE-UNIT",
          "PL-SPECIAL-RETURN-DETAIL",
          "PL-WARSAW-AUXILIARY",
          "PL-POWIAT-TIER",
          "PL-EP-SCOPE",
          "PL-TITLE-AND-BOUNDARY-CHANGES",
          "PL-OLDER-NATIONAL-HISTORY",
          "PL-MARGINS-AND-PARTIES",
          "PL-NEXT-DATES",
        ],
        omitted_results: "data/research/poland/results.jsonl.gz",
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
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Poland`);
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

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, PolandOfficeRow>();
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDates = 0;
  let powiatCouncils = 0;
  let sejmiks = 0;
  let warsawDistricts = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Poland`);
    if (!ALLOWED_TYPES.has(row.office_type)) {
      throw new Error(`Refusing unlisted Poland office type ${row.office_type} on ${row.office_id}`);
    }
    if (isAppointedVoivodeOrCabinet(row.office_type, row.name)) {
      throw new Error(`Refusing appointed voivode or cabinet office ${row.office_id}`);
    }
    if (row.successor_office_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}; Ostrowice and other offices stay unbound`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing an approved classification`);
    if (row.office_type === "county_council") {
      powiatCouncils += 1;
      if (classification.tier !== "regional") {
        throw new Error(
          `PL-POWIAT-TIER: refusing to reclassify powiat ${row.office_id} from regional to ${JSON.stringify(classification.tier)}`,
        );
      }
    }
    if (row.office_type === "voivodeship_sejmik") {
      sejmiks += 1;
      if (classification.tier !== "regional") {
        throw new Error(`Voivodeship sejmik ${row.office_id} must stay regional`);
      }
    }
    if (row.office_type === "warsaw_district_council") warsawDistricts += 1;
    officeIds.add(row.office_id);
    officeById.set(row.office_id, row);
    const historical = row.office_status === "historical";
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} has unsupported status ${row.office_status}`);
    }
    if (historical) historicalOffices += 1;
    else currentOffices += 1;

    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_election) {
      if (row.next_election.precision !== "year") {
        throw new Error(`Poland next date for ${row.office_id} must keep sourced precision; found ${row.next_election.precision}`);
      }
      const year = parseYearLabel(row.next_election.value);
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextDates += 1;
      pushDate({
        date_id: nextDateId,
        label: row.next_election.value,
        precision: "year",
        certainty: row.next_election.certainty,
        year,
        month: null,
        day: null,
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
    const office = officeById.get(row.office_id)!;
    if (office.office_type === "county_council" && row.tier !== "regional") {
      throw new Error(`PL-POWIAT-TIER: powiat classification ${row.office_id} is not regional`);
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
  const eventByHk = new Map<string, PolandEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let prospectiveEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
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
    const certainty = row.date?.certainty ?? "called";
    if (!dateValue || !precision) throw new Error(`Event ${row.history_key} is missing a sourced date`);
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

    const shareUnit = row.share_unit ?? "percent_0_100";
    if (shareUnit !== "percent_0_100" && shareUnit !== "proportion_0_1") {
      throw new Error(`Unsupported share_unit ${shareUnit} on ${row.history_key}`);
    }
    const ballotBasis = row.ballot_basis ?? "unknown";
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
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
      ballot_basis: ballotBasis,
      share_unit: shareUnit,
      legal_outcome: row.legal_outcome ?? "unknown",
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
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    }
    if (row.kind !== "first_round" && row.kind !== "runoff") {
      throw new Error(`Unsupported Poland proceeding kind ${JSON.stringify(row.kind)}`);
    }
    if (row.supersedes_id) {
      throw new Error(`Proceeding ${row.proceeding_id} must not supersede the first round`);
    }
    const expectedId = proceedingIdFor(row.office_id, row.history_key, row.sequence_no);
    if (row.proceeding_id !== expectedId) {
      throw new Error(`Proceeding id drift for ${row.history_key}: ${row.proceeding_id} != ${expectedId}`);
    }
    if (row.kind === "first_round") firstRounds += 1;
    else runoffs += 1;
    proceedingIds.add(row.proceeding_id);
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
  const sourceByPath = new Map<string, string>();
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Poland source catalogue row ${i} is missing source_id/input_path`);
    }
    if (sourceByPath.has(row.input_path)) {
      throw new Error(`Duplicate Poland source path ${row.input_path}`);
    }
    sourceByPath.set(row.input_path, row.source_id);
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Poland source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? null,
      url: row.url ?? null,
      checked_as_of_label: row.checked_as_of ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: row.evidence_grade ?? null,
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
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === BOLESLAWIEC_COUNCIL_ID && rec !== BOLESLAWIEC_RECORD_KEY) {
      throw new Error(`Bolesławiec council record_key drifted: ${rec}`);
    }
    addLocator(locators, locatorSeen, {
      record_key: rec,
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
    refs: PolandEvidenceRef[] | undefined;
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
      const evidenceId = polandEvidenceId(args.recordKey, sourceId, ref.input_path, occurrence, args.claimKind);
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
      claimKind: "proceeding_round",
      claim: { proceeding_id: row.proceeding_id, kind: row.kind, sequence_no: row.sequence_no },
    });
  }

  const unresolved: SqlRow[] = [];
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  for (let i = 0; i < inventory.researchGaps.length; i++) {
    const row = inventory.researchGaps[i]!;
    const origin = originFor(GAPS_RELATIVE, gapsHash, i);
    unresolved.push({
      unresolved_id: polandUnresolvedId(countryRec, GAPS_RELATIVE, row.original_token),
      record_key: countryRec,
      original_token: row.original_token,
      source_locator: canonical({ input_path: GAPS_RELATIVE, json_pointer: `/${i}` }),
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.crosswalks) {
    if (row.entity_kind !== "office") {
      throw new Error(`Unsupported crosswalk entity_kind ${row.entity_kind}`);
    }
    if (!officeIds.has(row.target_office_id)) {
      throw new Error(`Crosswalk target ${row.target_office_id} is not in the accepted register`);
    }
    const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
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
    prospective_events: prospectiveEvents,
    total_events: events.length,
    result_rows: results.length,
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    powiat_councils: powiatCouncils,
    voivodeship_sejmiks: sejmiks,
    warsaw_district_councils: warsawDistricts,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDatesDay,
    event_dates_year_called: eventDatesYear,
    next_dates_year_expected: nextDates,
    proceedings: proceedings.length,
    proceedings_first_round: firstRounds,
    proceedings_runoff: runoffs,
    party_mappings: 0,
    successor_edges: successorEdges,
    appointed_voivode_offices: 0,
    cabinet_offices: 0,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Poland ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  if (!officeIds.has(OSTROWICE_COUNCIL_ID) || !officeIds.has(OSTROWICE_EXECUTIVE_ID)) {
    throw new Error("Historic Ostrowice council and executive must both be retained");
  }
  if (!officeIds.has(SEJM_ID) || !officeIds.has(EP_ID) || !officeIds.has(POWIAT_EXAMPLE_ID) || !officeIds.has(SEJMIK_EXAMPLE_ID)) {
    throw new Error("Poland anchor offices are missing from the register");
  }
  if (!officeIds.has(WARSAW_DISTRICT_EXAMPLE_ID)) {
    throw new Error("Warsaw district example is missing");
  }
  void proceedingIds;

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Current elected Polish councils and direct executives, national chambers, presidency, and EP delegation; PKW historic returns and special-election index; documented territorial and result holds. Prompt AC accepted 5,310 current + 2 historical offices.",
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
