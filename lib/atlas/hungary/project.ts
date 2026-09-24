import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  BUDAPEST_2014_HK,
  BUDAPEST_ASSEMBLY_ID,
  BUDAPEST_MAYOR_ID,
  COUNCIL_ASSEMBLY_TYPES,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  COUNTRY_RELATIVE,
  CYCLE_GAPS_RELATIVE,
  DIRECT_EXECUTIVE_TYPES,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  MIXED_2014_ELECTORAL_SYSTEM,
  NAMED_HOLDS,
  NEEDS_REVIEW_OFFICE_IDS,
  OFFICE_NAMESPACE,
  OMITTED_CROSSWALK_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  PARLIAMENT_2022_EVENT_ID,
  PARLIAMENT_2022_HK,
  PARLIAMENT_ID,
  PRESIDENT_2017_EVENT_ID,
  PRESIDENT_2017_HK,
  PRESIDENT_2022_EVENT_ID,
  PRESIDENT_2022_HK,
  PRESIDENT_2024_EVENT_ID,
  PRESIDENT_2024_HK,
  PRESIDENT_ID,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RETURN_GAP_OFFICE_IDS,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  canonical,
  dateId,
  hungaryEvidenceId,
  hungaryUnresolvedId,
  isFixtureId,
  isForbiddenInventedOffice,
  isOmittedBulkPath,
  locator,
  rawEnvelope,
  recordKey,
  returnGapToken,
  type Locator,
} from "./identity";
import type {
  HungaryAuthoredDate,
  HungaryEventRow,
  HungaryInventory,
  HungaryOrigin,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type HungaryProjection = {
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
const ALLOWED_TYPES = new Set<string>(ALLOWED_OFFICE_TYPES);
const NEEDS_REVIEW = new Set<string>(NEEDS_REVIEW_OFFICE_IDS);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Hungary date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function assertCalledDay(date: HungaryAuthoredDate, where: string): { year: number; month: number; day: number } {
  if (!date || date.precision !== "day" || date.certainty !== "called") {
    throw new Error(`Hungary event date must stay a called day at ${where}`);
  }
  const parsed = parseDayLabel(date.label);
  if (date.year !== parsed.year || date.month !== parsed.month || date.day !== parsed.day) {
    throw new Error(`Day date parts disagree with the label at ${where}`);
  }
  return parsed;
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

function sliceHash(inventory: HungaryInventory, relativePath: string): string {
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

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other") return raw;
  if (raw === "national" || raw === "national_context") return "national_context";
  throw new Error(`Unsupported Hungary classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function occurrenceWithoutSource(origin: HungaryOrigin): Record<string, unknown> {
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

function emptyTarget(overrides: Record<string, unknown>): SqlRow {
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
    ...overrides,
  };
}

export function projectHungary(inventory: HungaryInventory): HungaryProjection {
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
  for (const item of inventory.tracked) {
    if (isOmittedBulkPath(item.input_path)) {
      throw new Error(`Omitted Hungary bytes must not be hashed into the release: ${item.input_path}`);
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.byPath.has(OMITTED_RESULTS_RELATIVE) || inventory.byPath.has(OMITTED_CROSSWALK_RELATIVE)) {
    throw new Error("results.json and identity-crosswalk.json are omitted and must not be invented");
  }
  if (inventory.counts.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error(`Documentary omitted result count drifted: ${inventory.counts.results}`);
  }
  if (inventory.counts.coverage_complete !== false) {
    throw new Error("Hungary coverage_complete must stay false");
  }
  if (inventory.counts.events !== EXPECTED_COUNTS.total_events || inventory.counts.total_offices !== EXPECTED_COUNTS.offices) {
    throw new Error("Hungary counts.json drifted from the accepted register");
  }
  if (!Array.isArray(inventory.proceedings) || inventory.proceedings.length !== 0) {
    throw new Error("Hungary proceedings must stay an empty array; no rounds are invented");
  }
  if (!Array.isArray(inventory.partyMappings) || inventory.partyMappings.length !== 0) {
    throw new Error("Hungary party mappings must stay empty");
  }
  if (!Array.isArray(inventory.successors) || inventory.successors.length !== 0) {
    throw new Error("Hungary successor-crosswalk must stay empty; no successor edges are invented");
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Hungary offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Hungary events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Hungary geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Hungary classifications`);
  }
  if (inventory.country.country_id !== COUNTRY_ID || inventory.country.country_code !== COUNTRY_CODE) {
    throw new Error("Hungary country.json identity drifted");
  }
  if (inventory.country.name !== "Magyarország") {
    throw new Error(`Hungary country name drifted: ${inventory.country.name}`);
  }
  if (inventory.tiers.predecessor_draft_sha256 !== "fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a") {
    throw new Error("Landed tier file must keep the predecessor draft digest and must not be rewritten");
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
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: inventory.country.name,
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
        omitted_identity_crosswalk: OMITTED_CROSSWALK_RELATIVE,
        documented_result_rows_omitted: inventory.counts.results,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Map<string, string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    const previous = dateIds.get(id);
    if (previous && previous !== String(row.label)) {
      throw new Error(`Hungary date_id ${id} collided`);
    }
    if (previous) return;
    dateIds.set(id, String(row.label));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  for (const row of inventory.geographies) geoById.set(row.geography_id, row.geography_id);
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Hungary`);
    if (row.parent_geography_id) {
      if (row.parent_geography_id === row.geography_id) {
        throw new Error(`Geography ${row.geography_id} cannot parent itself`);
      }
      if (!geoById.has(row.parent_geography_id)) {
        throw new Error(`Geography ${row.geography_id} parent ${row.parent_geography_id} is not authored`);
      }
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

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  let currentOffices = 0;
  const historicalOffices = 0;
  let directExecutives = 0;
  let councilAssemblies = 0;
  const typeCounts = new Map<string, number>();

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID || row.id_namespace !== N) {
      throw new Error(`Office ${row.office_id} namespace/country drifted`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing a classification`);
    }
    if (!ALLOWED_TYPES.has(row.office_type)) {
      throw new Error(`Unexpected Hungary office type ${row.office_type} on ${row.office_id}`);
    }
    if (isForbiddenInventedOffice(row.office_id, row.office_type, row.office_name)) {
      throw new Error(`Refusing invented executive/járás/chair office ${row.office_id}`);
    }
    if (row.successor_office_id) {
      throw new Error(`Hungary must not invent successor edges; found ${row.office_id}`);
    }
    if (row.office_status !== "current") {
      throw new Error(`Office ${row.office_id} is not current; historical offices are not invented`);
    }
    if (row.next_date != null || row.next_cycle != null) {
      throw new Error(`Office ${row.office_id} next date must stay NULL; HU-UPCOMING stays open`);
    }
    if (row.office_type === "indirect_president") {
      if (row.office_id !== PRESIDENT_ID || row.electoral_mode !== "indirect_parliamentary") {
        throw new Error("The presidency stays one indirect parliamentary office");
      }
    } else if (row.electoral_mode !== "direct_popular") {
      throw new Error(`Office ${row.office_id} electoral mode drifted: ${row.electoral_mode}`);
    }
    officeIds.add(row.office_id);
    currentOffices += 1;
    typeCounts.set(row.office_type, (typeCounts.get(row.office_type) ?? 0) + 1);
    if (DIRECT_EXECUTIVE_TYPES.has(row.office_type)) directExecutives += 1;
    if (COUNCIL_ASSEMBLY_TYPES.has(row.office_type)) councilAssemblies += 1;
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
      registry_qualified: 1,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    if (needsReview !== NEEDS_REVIEW.has(row.office_id)) {
      throw new Error(`needs_review set drifted for ${row.office_id}`);
    }
    const origin = originFor(TIER_PATH, TIER_SHA256, index);
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: needsReview ? "needs_review" : "approved",
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
  const eventByHk = new Map<string, HungaryEventRow>();
  let selectedHistories = 0;
  let presidentIndirectEvents = 0;
  let eventsOnk2014 = 0;
  let eventsOnk2024 = 0;
  let unknownOutcomes = 0;
  let mixed2014 = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);
  const gapOffices = new Set<string>(RETURN_GAP_OFFICE_IDS);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (row.id_namespace !== N || row.country_id !== COUNTRY_ID) {
      throw new Error(`Event ${row.history_key} namespace/country drifted`);
    }
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (eventByHk.has(row.history_key)) throw new Error(`Duplicate history_key ${row.history_key}`);
    eventByHk.set(row.history_key, row);
    if (row.selected_history_role !== "selected") {
      throw new Error(`Hungary must not author prospective events; got ${row.selected_history_role} for ${row.history_key}`);
    }
    if (row.date_resolution !== "resolved") {
      throw new Error(`Event ${row.history_key} date resolution must stay resolved`);
    }
    const parsed = assertCalledDay(row.date, row.history_key);
    const cycle = row.history_key.split("::")[1] ?? "";
    if (cycle === "ONK2024" && gapOffices.has(row.office_id)) {
      throw new Error(`Return-gap office ${row.office_id} must not gain an invented ONK2024 event`);
    }
    if (cycle === "ONK2014") {
      eventsOnk2014 += 1;
      if (row.legal_outcome !== "unknown") {
        throw new Error(`ONK2014 event ${row.history_key} must keep unknown legal outcome`);
      }
    } else if (row.legal_outcome !== "certified") {
      throw new Error(`Event ${row.history_key} legal outcome drifted: ${row.legal_outcome}`);
    }
    if (row.legal_outcome === "unknown") unknownOutcomes += 1;
    if (cycle === "ONK2024") eventsOnk2024 += 1;
    if (row.share_unit !== "percent_0_100") {
      throw new Error(`Event ${row.history_key} share unit drifted`);
    }
    const allowedBallots = new Set(["valid_votes", "candidate_marks", "list_votes", "electors", "unknown"]);
    if (!allowedBallots.has(row.ballot_basis)) {
      throw new Error(`Event ${row.history_key} ballot basis ${row.ballot_basis} is not authored`);
    }
    if (row.office_id === PRESIDENT_ID) {
      if (row.event_kind !== "indirect" || row.ballot_basis !== "electors" || row.electoral_system !== "indirect_parliamentary") {
        throw new Error(`Presidential event ${row.history_key} must stay indirect electors; no popular ballot`);
      }
      presidentIndirectEvents += 1;
    } else if (row.event_kind !== "ordinary") {
      throw new Error(`Non-presidential event ${row.history_key} must stay ordinary`);
    }
    if (row.electoral_system === MIXED_2014_ELECTORAL_SYSTEM) {
      if (row.history_key !== BUDAPEST_2014_HK) {
        throw new Error("2014 mixed capital composition must stay on the Budapest assembly event only");
      }
      mixed2014 += 1;
    }
    if ("votes" in row || "results" in row || "candidates" in row || "seats" in row) {
      throw new Error(`Event ${row.history_key} carries embedded results; this slim importer will not invent result rows from them`);
    }
    selectedHistories += 1;
    const dateIdValue = dateId("event", row.event_id, "election");
    pushDate({
      date_id: dateIdValue,
      label: row.date.label,
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
        origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
        row: row.date,
      }),
    });
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: row.event_kind,
      selected_history_role: "selected",
      electoral_system: row.electoral_system ?? null,
      comparability: null,
      ballot_basis: row.ballot_basis,
      share_unit: "percent_0_100",
      legal_outcome: row.legal_outcome,
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mixed2014 !== 1) throw new Error("Budapest 2014 mixed composition event drifted");
  for (const officeId of RETURN_GAP_OFFICE_IDS) {
    if (!officeIds.has(officeId)) throw new Error(`Return-gap office ${officeId} must stay in the register`);
    if (eventByHk.has(`${officeId}::ONK2024`)) {
      throw new Error(`Return-gap office ${officeId} must not have an ONK2024 event`);
    }
    if (!eventByHk.has(`${officeId}::ONK2014`)) {
      throw new Error(`Return-gap office ${officeId} must keep its authored ONK2014 event`);
    }
  }

  const knownEvents = new Map(events.map((row) => [String(row.history_key), String(row.event_id)]));
  const anchors: Array<[string, string]> = [
    [PRESIDENT_2017_HK, PRESIDENT_2017_EVENT_ID],
    [PRESIDENT_2022_HK, PRESIDENT_2022_EVENT_ID],
    [PRESIDENT_2024_HK, PRESIDENT_2024_EVENT_ID],
    [PARLIAMENT_2022_HK, PARLIAMENT_2022_EVENT_ID],
  ];
  for (const [hk, eventId] of anchors) {
    if (knownEvents.get(hk) !== eventId) throw new Error(`Event identity drifted for ${hk}`);
  }

  const sources: SqlRow[] = [];
  const sourceById = new Set<string>();
  let blockedSources = 0;
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Hungary source catalogue row ${i} is missing source_id/input_path`);
    }
    if (row.country_id && row.country_id !== COUNTRY_ID) {
      throw new Error(`Source ${row.source_id} is not Hungary`);
    }
    if (row.source_namespace && row.source_namespace !== SOURCE_NAMESPACE) {
      throw new Error(`Source ${row.source_id} namespace drifted`);
    }
    if (row.sha256 && !/^[0-9a-f]{64}$/.test(row.sha256)) {
      throw new Error(`Hungary source ${row.source_id} sha256 is not lowercase hex`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Hungary source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    if (row.acquisition_status === "blocked_response") blockedSources += 1;
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? basename(row.input_path),
      url: row.url ?? null,
      checked_as_of_label: row.checked_as_of_label ?? RESEARCH_SNAPSHOT_LABEL,
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
  const proceedings: SqlRow[] = [];
  const crosswalks: SqlRow[] = [];

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  const countryHash = sliceHash(inventory, COUNTRY_RELATIVE);
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...emptyTarget({ country_id: COUNTRY_ID }),
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({ inputPath: COUNTRY_RELATIVE, sha256: countryHash, derivedPointer: "" }),
  });
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      entity_kind: "geography",
      ...emptyTarget({ country_id: COUNTRY_ID, geography_id: row.geography_id }),
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
      ...emptyTarget({ country_id: COUNTRY_ID, id_namespace: N, office_id: row.office_id }),
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
      ...emptyTarget({
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
      }),
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: EVENTS_RELATIVE,
        sha256: eventsHash,
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.sourceCatalogue.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
      entity_kind: "source",
      ...emptyTarget({ country_id: COUNTRY_ID, source_namespace: SOURCE_NAMESPACE, source_id: row.source_id }),
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: SOURCES_RELATIVE,
        sha256: sourcesHash,
        derivedPointer: `/${index}`,
        locatorText: row.input_path,
      }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, item.input_path]),
      entity_kind: "input",
      ...emptyTarget({ input_path: item.input_path }),
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ inputPath: item.input_path, sha256: item.sha256 }),
    });
  }

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: {
    recordKey: string;
    origins: HungaryOrigin[] | undefined;
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
      const evidenceId = hungaryEvidenceId(args.recordKey, sourceId, occurrence, args.claimKind);
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
    pushEvidence({
      recordKey: recordKey("office", [N, row.office_id]),
      origins: row.origins,
      claimKind: "register_identity",
      claim: { office_id: row.office_id },
    });
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

  const unresolved: SqlRow[] = [];
  const gapByToken = new Map(inventory.gaps.map((row) => [row.gate, row]));
  if (inventory.gaps.length !== NAMED_HOLDS.length) {
    throw new Error(`Expected ${NAMED_HOLDS.length} Hungary research gaps, found ${inventory.gaps.length}`);
  }
  for (const hold of NAMED_HOLDS) {
    const authored = gapByToken.get(hold.token);
    if (!authored) throw new Error(`Named hold ${hold.token} is missing from research-gaps.json`);
    const holdStatus: string = authored.status;
    if (holdStatus === "closed" || holdStatus === "resolved") {
      throw new Error(`Named hold ${hold.token} must stay open`);
    }
    if (holdStatus !== hold.status) {
      throw new Error(`Named hold ${hold.token} status drifted: ${holdStatus}`);
    }
    const sourceLocator = canonical({
      input_path: GAPS_RELATIVE,
      json_pointer: `/${inventory.gaps.indexOf(authored)}`,
    });
    unresolved.push({
      unresolved_id: hungaryUnresolvedId(countryRec, sourceLocator, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: sourceLocator,
      reason: authored.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: GAPS_RELATIVE, sha256: sliceHash(inventory, GAPS_RELATIVE) }),
        row: authored,
      }),
    });
  }

  const cycle2024 = inventory.cycleGaps.ONK2024 ?? [];
  if ((inventory.cycleGaps.ONK2014 ?? []).length !== 0) {
    throw new Error("ONK2014 cycle-gap list must stay empty");
  }
  if (cycle2024.length !== RETURN_GAP_OFFICE_IDS.length) {
    throw new Error("ONK2024 return gaps drifted");
  }
  const cycleIds = cycle2024.map((row) => row.office_id).sort();
  if (JSON.stringify(cycleIds) !== JSON.stringify([...RETURN_GAP_OFFICE_IDS].sort())) {
    throw new Error(`ONK2024 return-gap offices drifted: ${cycleIds.join(",")}`);
  }
  for (const gap of cycle2024) {
    const rec = recordKey("office", [N, gap.office_id]);
    const token = returnGapToken(gap.office_id);
    const sourceLocator = canonical({
      input_path: CYCLE_GAPS_RELATIVE,
      office_id: gap.office_id,
    });
    unresolved.push({
      unresolved_id: hungaryUnresolvedId(rec, sourceLocator, token),
      record_key: rec,
      original_token: token,
      source_locator: sourceLocator,
      reason: gap.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: CYCLE_GAPS_RELATIVE, sha256: sliceHash(inventory, CYCLE_GAPS_RELATIVE) }),
        row: gap,
      }),
    });
  }

  if (inventory.unresolvedRows.length !== 1) {
    throw new Error(`Expected 1 unresolved-evidence row, found ${inventory.unresolvedRows.length}`);
  }
  for (const row of inventory.unresolvedRows) {
    if (!row.history_key || !row.original_token || !eventByHk.has(row.history_key)) {
      throw new Error("Unresolved evidence row must bind an authored event");
    }
    const event = eventByHk.get(row.history_key)!;
    const rec = recordKey("event", [N, event.office_id, event.history_key]);
    const sourceLocator = canonical({
      input_path: UNRESOLVED_RELATIVE,
      history_key: row.history_key,
      cited_locator: row.source_locator ?? null,
    });
    unresolved.push({
      unresolved_id: hungaryUnresolvedId(rec, sourceLocator, row.original_token),
      record_key: rec,
      original_token: row.original_token,
      source_locator: sourceLocator,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: UNRESOLVED_RELATIVE, sha256: sliceHash(inventory, UNRESOLVED_RELATIVE) }),
        row,
      }),
    });
  }

  const municipal = tiers.filter((row) => row.tier === "municipal").length;
  const regional = tiers.filter((row) => row.tier === "regional").length;
  const national = tiers.filter((row) => row.tier === "national_context").length;
  const other = tiers.filter((row) => row.tier === "other").length;
  const validatedCounts: Record<string, number> = {
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
    municipal_councils: typeCounts.get("municipal_council") ?? 0,
    direct_mayors: typeCounts.get("direct_mayor") ?? 0,
    direct_capital_mayors: typeCounts.get("direct_capital_mayor") ?? 0,
    county_assemblies: typeCounts.get("county_assembly") ?? 0,
    capital_assemblies: typeCounts.get("capital_assembly") ?? 0,
    national_assemblies: typeCounts.get("national_assembly") ?? 0,
    indirect_presidents: typeCounts.get("indirect_president") ?? 0,
    ep_delegations: typeCounts.get("ep_delegation") ?? 0,
    current_direct_executive_offices: directExecutives,
    council_assembly_offices: councilAssemblies,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    blocked_sources: blockedSources,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    return_gaps: cycle2024.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    proceedings: proceedings.length,
    party_mappings: 0,
    successor_edges: 0,
    president_indirect_events: presidentIndirectEvents,
    events_onk2014: eventsOnk2014,
    events_onk2024: eventsOnk2024,
    unknown_legal_outcomes: unknownOutcomes,
    evidence_links: evidence.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key] !== expected) {
      throw new Error(`Hungary ${key} count ${validatedCounts[key]} != ${expected}`);
    }
  }
  if (!officeIds.has(BUDAPEST_ASSEMBLY_ID) || !officeIds.has(BUDAPEST_MAYOR_ID) || !officeIds.has(PARLIAMENT_ID) || !officeIds.has(EP_ID)) {
    throw new Error("Hungary anchor offices are missing");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Hungary Prompt AK accepted register: 6,378 current offices, 12,753 events, 0 invented result rows. Named holds stay open. Slim land omits results.json (101,526 documented rows).",
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
