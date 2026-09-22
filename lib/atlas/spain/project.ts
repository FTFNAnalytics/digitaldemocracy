import {
  ACCEPTANCE_RELATIVE,
  ALLOWED_OFFICE_TYPES,
  ARAN_ID,
  BIZKAIA_JUNTAS_ID,
  CEUTA_ID,
  CONCEJO_EXAMPLE_ID,
  CONGRESO_ID,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  CROSSWALK_RELATIVE,
  DISPUTED_HISTORY_KEYS,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  FORBIDDEN_ISLAND_DUPLICATE_ID,
  FORBIDDEN_NAVARRA_DIPUTACION_ID,
  FORMENTERA_ID,
  FUERTEVENTURA_CABILDO_ID,
  GEOGRAPHY_RELATIVE,
  HISTORICAL_OFFICE_IDS,
  HOLD_REASONS,
  LINEAGE_ID,
  MADRID_COUNCIL_ID,
  MADRID_RECORD_KEY,
  MELILLA_ID,
  METHOD_VERSION,
  MODE_PENDING_EXAMPLE_ID,
  NAMED_HOLDS,
  NAVARRA_PARLIAMENT_ID,
  OFFICE_NAMESPACE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SENADO_ID,
  TIER_PATH,
  TIER_SHA256,
  ADAPTER_VERSION,
  canonical,
  dateId,
  eventIdFor,
  isFixtureId,
  isInventedExecutive,
  locator,
  rawEnvelope,
  recordKey,
  unresolvedId,
  type Locator,
} from "./identity";
import type { SpainEventRow, SpainInventory, SpainOfficeRow } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type SpainProjection = {
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
const MUNICIPAL_OFFICE_ID = /^ES-M(\d{5})-REP$/;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Spain date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
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

function sliceHash(inventory: SpainInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Spain classification tier ${JSON.stringify(tier)}`);
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function assertNoParentCycle(rows: Array<{ geography_id: string; parent_geography_id?: string | null }>): void {
  const parent = new Map(rows.map((row) => [row.geography_id, row.parent_geography_id ?? null]));
  for (const id of parent.keys()) {
    const seen = new Set<string>();
    let cursor: string | null = id;
    while (cursor) {
      if (seen.has(cursor)) throw new Error(`Geography parent cycle at ${id}`);
      seen.add(cursor);
      cursor = parent.get(cursor) ?? null;
    }
  }
}

export function projectSpain(inventory: SpainInventory): SpainProjection {
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
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Spain offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Spain events, found ${inventory.events.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Spain geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.crosswalks.length !== EXPECTED_COUNTS.identity_crosswalks) {
    throw new Error(`Expected ${EXPECTED_COUNTS.identity_crosswalks} Spain crosswalks, found ${inventory.crosswalks.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Spain classifications`);
  }
  if (inventory.unboundBlockCount !== EXPECTED_COUNTS.unbound_municipal_blocks) {
    throw new Error(`Unbound municipal block count ${inventory.unboundBlockCount}`);
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
    name: "España",
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
        name: "España",
        country_code: COUNTRY_CODE,
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [...NAMED_HOLDS],
        omitted_results: "data/research/spain/results.json",
        omitted_sources: "data/research/spain/sources/",
        events_encoding: EVENTS_RELATIVE,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    if (dateIds.has(String(row.date_id))) throw new Error(`Duplicate Spain date_id ${row.date_id}`);
    dateIds.add(String(row.date_id));
    dates.push(row);
  };

  const geoById = new Map<string, string>();
  const geographies: SqlRow[] = inventory.geographies.map((row, index) => {
    if (geoById.has(row.geography_id)) throw new Error(`Duplicate geography ${row.geography_id}`);
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
  assertNoParentCycle(
    geographies.map((row) => ({
      geography_id: String(row.geography_id),
      parent_geography_id: row.parent_geography_id == null ? null : String(row.parent_geography_id),
    })),
  );

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, SpainOfficeRow>();
  const officeIds = new Set<string>();
  const officeTypeById = new Map<string, string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let provincialCouncils = 0;
  let islandCouncils = 0;
  let foralAssemblies = 0;
  let autonomousParliaments = 0;
  let concejoAbierto = 0;
  let modePending = 0;
  let modePendingCurrent = 0;
  let autonomousCities = 0;
  let successorEdges = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.id_namespace !== N) throw new Error(`Office ${row.office_id} namespace is not ${N}`);
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Spain`);
    if (!ALLOWED_TYPES.has(row.office_type)) {
      throw new Error(`Refusing unlisted Spain office type ${row.office_type} on ${row.office_id}`);
    }
    if (isInventedExecutive(row.office_type)) {
      throw new Error(`Refusing invented executive office ${row.office_id} (${row.office_type})`);
    }
    if (row.office_id === FORBIDDEN_ISLAND_DUPLICATE_ID || row.office_id === FORBIDDEN_NAVARRA_DIPUTACION_ID) {
      throw new Error(`Refusing duplicate special-regime office ${row.office_id}`);
    }
    if (row.successor_office_id) {
      successorEdges += 1;
      throw new Error(`Refusing successor edge on ${row.office_id}; historical codes stay unbound`);
    }
    if (row.next_date != null) {
      throw new Error(`Refusing invented next date on ${row.office_id}; ES-G09 stays open`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing an approved classification`);
    if (classification.office && classification.office !== row.office_type) {
      throw new Error(`Office type drift on ${row.office_id}: register ${row.office_type} vs tier ${classification.office}`);
    }
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} has unsupported status ${row.office_status}`);
    }
    if (row.record_state && row.record_state !== "active") {
      throw new Error(`Office ${row.office_id} record_state must stay active`);
    }
    const holdCount = Array.isArray(row.holds) ? row.holds.length : 0;
    const qualified = holdCount === 0 ? 1 : 0;
    if (row.registry_qualified !== qualified) {
      throw new Error(`Office ${row.office_id} registry_qualified does not match its holds`);
    }
    if (officeIds.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    officeIds.add(row.office_id);
    officeById.set(row.office_id, row);
    officeTypeById.set(row.office_id, row.office_type);

    if (row.office_type === "provincial_council") provincialCouncils += 1;
    if (row.office_type === "island_council") islandCouncils += 1;
    if (row.office_type === "foral_general_assembly") foralAssemblies += 1;
    if (row.office_type === "autonomous_community_parliament") autonomousParliaments += 1;
    if (row.office_type === "concejo_abierto_alcalde") concejoAbierto += 1;
    if (row.office_type === "municipal_elected_mandate_mode_pending") {
      modePending += 1;
      if (row.office_status === "current") modePendingCurrent += 1;
    }
    if (row.office_type === "autonomous_city_assembly") autonomousCities += 1;

    if (row.office_status === "historical") historicalOffices += 1;
    else currentOffices += 1;

    const origin = originFor(REGISTER_RELATIVE, registerHash, i);
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
      registry_qualified: qualified,
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
    const mappedFromVocabulary = mapTier(row.tier);
    const mapped = row.schema_v1_tier ? mapTier(row.schema_v1_tier) : mappedFromVocabulary;
    if (row.schema_v1_tier && mapped !== mappedFromVocabulary && !(row.tier === "national" && mapped === "national_context")) {
      throw new Error(`Tier interchange drift on ${row.office_id}`);
    }
    if (row.tier === "national" && mapped !== "national_context") {
      throw new Error(`National office ${row.office_id} must map to national_context`);
    }
    const office = officeById.get(row.office_id)!;
    if (office.office_type === "provincial_council" && mapped !== "regional") {
      throw new Error(`ES-G05: refusing to reclassify Diputación ${row.office_id}`);
    }
    if (office.office_type === "island_council" && mapped !== "regional") {
      throw new Error(`ES-G08: island council ${row.office_id} must stay regional`);
    }
    if (
      (office.office_id === CEUTA_ID || office.office_id === MELILLA_ID || office.office_id === FORMENTERA_ID || office.office_id === ARAN_ID) &&
      mapped !== "other"
    ) {
      throw new Error(`ES-G07: ${office.office_id} must stay other`);
    }
    if (office.office_type === "municipal_elected_mandate_mode_pending" && mapped !== "municipal") {
      throw new Error(`ES-G01: mode-pending ${row.office_id} must stay municipal`);
    }
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
  const eventIds = new Set<string>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let prospectiveEvents = 0;
  let diputacionEvents = 0;
  let notHeldEvents = 0;
  let disputedEvents = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);
  const disputedKeys = new Set<string>(DISPUTED_HISTORY_KEYS);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    const expectedEventId = eventIdFor(row.history_key);
    if (row.event_id !== expectedEventId) {
      throw new Error(`Event id drift for ${row.history_key}: ${row.event_id} != ${expectedEventId}`);
    }
    if (eventIds.has(row.event_id)) throw new Error(`Duplicate event id ${row.event_id}`);
    eventIds.add(row.event_id);
    const label = row.date?.label;
    const precision = row.date?.precision;
    const certainty = row.date?.certainty;
    if (!label || !precision || !certainty) throw new Error(`Event ${row.history_key} is missing a sourced date`);
    if (precision !== "day") {
      throw new Error(`Event ${row.history_key} must keep a sourced day label; found ${precision}`);
    }
    const parsed = parseDayLabel(label);
    if (row.date?.year !== parsed.year || row.date?.month !== parsed.month || row.date?.day !== parsed.day) {
      throw new Error(`Event ${row.history_key} date parts do not match ${label}`);
    }
    const dateIdValue = dateId("event", row.event_id, "election");
    pushDate({
      date_id: dateIdValue,
      label,
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

    const role = row.selected_history_role;
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else if (role === "none") {
      prospectiveEvents += 1;
      throw new Error(`Refusing prospective event ${row.history_key}; ES-G09 does not synthesize a next contest`);
    } else throw new Error(`Unsupported selected_history_role ${role} for ${row.history_key}`);

    const shareUnit = row.share_unit ?? "percent_0_100";
    if (shareUnit !== "percent_0_100" && shareUnit !== "proportion_0_1") {
      throw new Error(`Unsupported share_unit ${shareUnit} on ${row.history_key}`);
    }
    const ballotBasis = row.ballot_basis ?? "unknown";
    if (
      ballotBasis !== "valid_votes" &&
      ballotBasis !== "list_votes" &&
      ballotBasis !== "candidate_marks" &&
      ballotBasis !== "electors" &&
      ballotBasis !== "including_blank_invalid" &&
      ballotBasis !== "unknown"
    ) {
      throw new Error(`Unsupported ballot_basis ${ballotBasis} on ${row.history_key}`);
    }
    const legalOutcome = row.legal_outcome ?? "unknown";
    if (legalOutcome === "not_held") notHeldEvents += 1;
    if (legalOutcome === "disputed") disputedEvents += 1;
    if (disputedKeys.has(row.history_key) && legalOutcome !== "disputed") {
      throw new Error(`ES-G03: ${row.history_key} must stay disputed`);
    }
    if (officeTypeById.get(row.office_id) === "provincial_council") diputacionEvents += 1;
    if (row.event_kind && row.event_kind !== "ordinary") {
      throw new Error(`Refusing inferred event kind ${row.event_kind} on ${row.history_key}`);
    }
    const origin = originFor(EVENTS_RELATIVE, eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: "ordinary",
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
      raw_json: rawEnvelope({ origin, row: eventRowWithoutBulk(row) }),
    });
  }

  const proceedings: SqlRow[] = [];
  const sources: SqlRow[] = [];
  const results: SqlRow[] = [];
  const evidence: SqlRow[] = [];

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
    if (row.office_id === MADRID_COUNCIL_ID && rec !== MADRID_RECORD_KEY) {
      throw new Error(`Madrid council record_key drifted: ${rec}`);
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

  const unresolved: SqlRow[] = [];
  for (const token of NAMED_HOLDS) {
    const occurrence = [ACCEPTANCE_RELATIVE, token];
    unresolved.push({
      unresolved_id: unresolvedId(countryRec, occurrence, token),
      record_key: countryRec,
      original_token: token,
      source_locator: canonical({ input_path: ACCEPTANCE_RELATIVE, original_token: token }),
      reason: HOLD_REASONS[token],
      lineage_id: L,
      release_id: R,
      raw_json: canonical({
        original_token: token,
        reason: HOLD_REASONS[token],
        acceptance: ACCEPTANCE_RELATIVE,
        status: "open",
      }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  const municipalCrosswalks = new Set<string>();
  const crosswalkHash = sliceHash(inventory, CROSSWALK_RELATIVE);
  for (const [index, row] of inventory.crosswalks.entries()) {
    const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(key)) throw new Error(`Duplicate crosswalk ${key}`);
    crosswalkSeen.add(key);
    let record: string;
    if (row.entity_kind === "office") {
      if (row.upstream_namespace !== "ine:municipality:representation") {
        throw new Error(`Unsupported office crosswalk namespace ${row.upstream_namespace}`);
      }
      const officeId = `ES-M${row.upstream_id}-REP`;
      if (!officeIds.has(officeId)) throw new Error(`Crosswalk target ${officeId} is not in the accepted register`);
      record = recordKey("office", [N, officeId]);
      municipalCrosswalks.add(officeId);
    } else if (row.entity_kind === "geography") {
      if (row.upstream_namespace !== "spain-research:geography") {
        throw new Error(`Unsupported geography crosswalk namespace ${row.upstream_namespace}`);
      }
      if (!geoById.has(row.upstream_id)) throw new Error(`Crosswalk geography ${row.upstream_id} is not authored`);
      record = recordKey("geography", [COUNTRY_ID, row.upstream_id]);
    } else {
      throw new Error(`Unsupported crosswalk entity_kind ${row.entity_kind}`);
    }
    if (row.record_key !== record) {
      throw new Error(`Crosswalk record_key drift for ${row.upstream_namespace}:${row.upstream_id}`);
    }
    if (/successor edge|merged into|abolished by/i.test(row.reason)) {
      throw new Error(`Refusing successor assertion in crosswalk ${row.upstream_id}`);
    }
    crosswalks.push({
      entity_kind: row.entity_kind,
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: record,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(CROSSWALK_RELATIVE, crosswalkHash, index),
        row,
      }),
    });
  }
  for (const officeId of officeIds) {
    if (MUNICIPAL_OFFICE_ID.test(officeId) && !municipalCrosswalks.has(officeId)) {
      throw new Error(`Municipal office ${officeId} is missing its INE representation crosswalk`);
    }
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
    provincial_councils: provincialCouncils,
    island_councils: islandCouncils,
    foral_assemblies: foralAssemblies,
    autonomous_parliaments: autonomousParliaments,
    concejo_abierto: concejoAbierto,
    mode_pending_offices: modePending,
    mode_pending_current: modePendingCurrent,
    autonomous_cities: autonomousCities,
    diputacion_events: diputacionEvents,
    not_held_events: notHeldEvents,
    disputed_events: disputedEvents,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    unresolved_evidence: unresolved.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    proceedings: proceedings.length,
    party_mappings: 0,
    successor_edges: successorEdges,
    unbound_municipal_blocks: inventory.unboundBlockCount,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Spain ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  for (const officeId of HISTORICAL_OFFICE_IDS) {
    const office = officeById.get(officeId);
    if (!office || office.office_status !== "historical") {
      throw new Error(`Historical INE office ${officeId} must stay in the register`);
    }
  }
  for (const officeId of [
    MADRID_COUNCIL_ID,
    MODE_PENDING_EXAMPLE_ID,
    CONCEJO_EXAMPLE_ID,
    FORMENTERA_ID,
    CEUTA_ID,
    MELILLA_ID,
    NAVARRA_PARLIAMENT_ID,
    BIZKAIA_JUNTAS_ID,
    FUERTEVENTURA_CABILDO_ID,
    ARAN_ID,
    CONGRESO_ID,
    SENADO_ID,
    EP_ID,
  ]) {
    if (!officeIds.has(officeId)) throw new Error(`Spain anchor office ${officeId} is missing`);
  }
  if (officeIds.has(FORBIDDEN_ISLAND_DUPLICATE_ID) || officeIds.has(FORBIDDEN_NAVARRA_DIPUTACION_ID)) {
    throw new Error("Duplicate Formentera island council or Navarra Diputación was invented");
  }
  if (disputedEvents !== disputedKeys.size) {
    throw new Error("ES-G03 disputed event set drifted");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Spain Prompt AE accepted register: INE municipal mandates, autonomous parliaments, ordinary Diputaciones, Basque Juntas, island councils, Congress, Senate, and the EP delegation. Named holds ES-G01–ES-G12 stay open. 8,204 current + 4 historical offices.",
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

/**
 * Event raw envelopes keep identity, holds, and locators. The proclamation
 * `raw_text` stays in events.json.gz (retained_input) and is not copied into
 * every SQLite row; result scalars from that text are not invented.
 */
function eventRowWithoutBulk(row: SpainEventRow): Record<string, unknown> {
  const rest: Record<string, unknown> = { ...row };
  delete rest.raw_text;
  return {
    ...rest,
    raw_text_retained_in: EVENTS_RELATIVE,
    raw_text_omitted_from_row: true,
  };
}
