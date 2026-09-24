import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  BERDORF_EVENT_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  CROSSWALK_RELATIVE,
  EP_1994_EVENT_ID,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  LINEAGE_ID,
  MERGER_UPSTREAM_NAMESPACE,
  METHOD_VERSION,
  NAMED_HOLDS,
  OBSERVATIONS_RELATIVE,
  OFFICE_NAMESPACE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PARLIAMENT_ID,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESOLVED_EXCLUSIONS,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  isFixtureId,
  locator,
  luxembourgUnresolvedId,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  LuxembourgEventRow,
  LuxembourgInventory,
  LuxembourgMergerEdge,
  LuxembourgOfficeRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type LuxembourgProjection = {
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

const ALLOWED_TYPES = new Set<string>(ALLOWED_OFFICE_TYPES);
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_YEAR = /^(\d{4})$/;
const FORBIDDEN_OFFICE = /grand[-\s]?duc|bourgmestre|\bmaire\b|\bmayor\b|\bcabinet\b|prime minister/i;

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function parseLabel(
  label: string,
  precision: string,
  where: string,
): { precision: "day" | "year"; year: number; month: number | null; day: number | null } {
  if (precision === "day") {
    const match = ISO_DAY.exec(label.trim());
    if (!match) throw new Error(`Luxembourg day label is not ISO at ${where}: ${JSON.stringify(label)}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
      throw new Error(`Invalid Gregorian date ${label} at ${where}`);
    }
    return { precision: "day", year, month, day };
  }
  if (precision === "year") {
    const match = ISO_YEAR.exec(label.trim());
    if (!match) throw new Error(`Luxembourg year label is not a year at ${where}: ${JSON.stringify(label)}`);
    return { precision: "year", year: Number(match[1]), month: null, day: null };
  }
  throw new Error(`Unsupported Luxembourg date precision ${precision} at ${where}`);
}

function pointerFor(index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: pointerFor(index),
  });
}

function sliceHash(inventory: LuxembourgInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: { derivedPath: string; derivedPointer?: string | null }): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
    source_row: null,
  });
}

function mapTier(tier: string): string {
  if (tier === "municipal" || tier === "regional" || tier === "other") return tier;
  if (tier === "national") return "national_context";
  throw new Error(`Unsupported Luxembourg classification tier ${JSON.stringify(tier)}`);
}

function expectedTier(officeType: string): string {
  if (officeType === "communal_council") return "municipal";
  if (officeType === "parliament") return "national";
  if (officeType === "ep_delegation") return "other";
  throw new Error(`Unsupported Luxembourg office type ${officeType}`);
}

function geographyIdFor(row: LuxembourgOfficeRow): string {
  if (row.office_id === PARLIAMENT_ID || row.office_id === EP_ID) return COUNTRY_GEOGRAPHY_ID;
  if (row.office_type !== "communal_council") {
    throw new Error(`Refusing a geography for unlisted office ${row.office_id}`);
  }
  return `LU-G-${row.office_id}`;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function blankLocator(): SqlRow {
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
  };
}

function eventStateNote(row: LuxembourgEventRow): string {
  const units = row.uncontested_reporting_units;
  const unitNote = units && units.length > 0 ? `; uncontested_reporting_units=${JSON.stringify(units)}` : "";
  return `${row.event_type}; result_status=${row.result_status}; date_role=${row.date_role}${unitNote}`;
}

function certaintyFor(role: string, where: string): "called" | "unknown" {
  if (role === "polling_date" || role === "election_year") return "called";
  if (role === "ordinary_cycle_label_not_polling_day") return "unknown";
  throw new Error(`Unsupported Luxembourg date_role ${role} at ${where}`);
}

function sharedSuccessorDate(officeId: string, dates: Array<string | null>): string | null {
  const unique = new Set(dates.map((date) => date ?? ""));
  if (unique.size !== 1) {
    throw new Error(`Successor ${officeId} merger dates disagree; refusing to guess an effective day`);
  }
  return dates[0] ?? null;
}

export function projectLuxembourg(inventory: LuxembourgInventory): LuxembourgProjection {
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
    if (item.input_path === OMITTED_RESULTS_RELATIVE || item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
      throw new Error("Omitted Luxembourg results or sources must not be hashed into the release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Luxembourg offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Luxembourg events, found ${inventory.events.length}`);
  }
  if (inventory.mergers.length !== EXPECTED_COUNTS.explicit_predecessor_edges) {
    throw new Error(`Expected ${EXPECTED_COUNTS.explicit_predecessor_edges} explicit merger edges, found ${inventory.mergers.length}`);
  }
  if (inventory.observations.length !== EXPECTED_COUNTS.observation_envelopes) {
    throw new Error(
      `Expected ${EXPECTED_COUNTS.observation_envelopes} observation envelopes, found ${inventory.observations.length}`,
    );
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Luxembourg classifications`);
  }
  if (inventory.tiers.status !== "approved" || inventory.tiers.production_accepted !== true) {
    throw new Error("Luxembourg tier file must stay the approved production-accepted bytes");
  }
  if (inventory.countsFile.result_rows !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error("counts.json omitted result total drifted");
  }

  let nestedResultCounts = 0;
  for (const row of inventory.observations) {
    if (!row.event_id) throw new Error("Observation envelope is missing event_id");
    if (Array.isArray(row.result_rows) || typeof row.result_rows !== "number") {
      throw new Error(`Observation ${row.event_id} result_rows must stay a count, not a result vector`);
    }
    if (!Number.isInteger(row.result_rows) || row.result_rows < 0) {
      throw new Error(`Observation ${row.event_id} result count is not a non-negative integer`);
    }
    nestedResultCounts += row.result_rows;
  }
  if (nestedResultCounts !== EXPECTED_COUNTS.observation_nested_result_counts) {
    throw new Error(
      `Observation nested result counts ${nestedResultCounts} drifted; they are not published result rows`,
    );
  }
  if (Number(nestedResultCounts) === Number(EXPECTED_COUNTS.documented_result_rows_omitted)) {
    throw new Error("Refusing to treat observation envelopes as the omitted 48,197 result rows");
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
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  const crosswalkHash = sliceHash(inventory, CROSSWALK_RELATIVE);
  const countsHash = sliceHash(inventory, COUNTS_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);

  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: COUNTRY_NAME,
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
      row: { country_id: COUNTRY_ID, name: COUNTRY_NAME },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_holds: NAMED_HOLDS.map((hold) => hold.token),
        resolved_exclusions: RESOLVED_EXCLUSIONS.map((hold) => hold.token),
        omitted_results: OMITTED_RESULTS_RELATIVE,
        omitted_sources_dir: OMITTED_SOURCES_DIR,
        observations_are_not_results: OBSERVATIONS_RELATIVE,
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
      },
    }),
  };

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const pushDate = (row: SqlRow) => {
    const id = String(row.date_id);
    if (dateIds.has(id)) throw new Error(`Luxembourg date_id collided: ${id}`);
    dateIds.add(id);
    dates.push(row);
  };

  const predecessorEdge = new Map<string, LuxembourgMergerEdge>();
  const successorDates = new Map<string, Array<string | null>>();
  for (const edge of inventory.mergers) {
    if (predecessorEdge.has(edge.predecessor_office_id)) {
      throw new Error(`Duplicate predecessor edge ${edge.predecessor_office_id}`);
    }
    predecessorEdge.set(edge.predecessor_office_id, edge);
    const datesForSuccessor = successorDates.get(edge.successor_office_id) ?? [];
    datesForSuccessor.push(edge.effective_date);
    successorDates.set(edge.successor_office_id, datesForSuccessor);
  }

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeById = new Map<string, LuxembourgOfficeRow>();
  const officeIndex = new Map<string, number>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let currentCouncils = 0;
  let historicalCouncils = 0;
  const directExecutives = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted Luxembourg office type ${row.office_type}`);
    if (FORBIDDEN_OFFICE.test(row.office_type) || FORBIDDEN_OFFICE.test(row.name) || FORBIDDEN_OFFICE.test(row.office_id)) {
      throw new Error(`Refusing Grand Duke, mayor, or cabinet office ${row.office_id}`);
    }
    if (row.status !== "current" && row.status !== "historical") {
      throw new Error(`Office ${row.office_id} status ${row.status} is not current or historical`);
    }
    if (row.direct_executive !== false) throw new Error(`Refusing direct_executive on ${row.office_id}`);
    if (row.directly_elected !== true) throw new Error(`Office ${row.office_id} directly_elected flag drifted`);
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.review_status !== "needs_review") {
      throw new Error(`Office ${row.office_id} classification must stay needs_review`);
    }
    if (classification.human_review_required !== true) {
      throw new Error(`Office ${row.office_id} classification must stay human_review_required`);
    }
    if (classification.tier !== expectedTier(row.office_type) || classification.tier !== row.tier) {
      throw new Error(`Office ${row.office_id} tier ${classification.tier} does not match ${row.office_type}`);
    }
    if (inventory.tiers.classifications[i]?.office_id !== row.office_id) {
      throw new Error(`Classification order drifted at ${row.office_id}`);
    }
    if (row.office_type === "communal_council" && !row.commune) {
      throw new Error(`Communal council ${row.office_id} is missing a commune name`);
    }
    if (row.status === "historical") {
      historicalOffices += 1;
      if (row.office_type !== "communal_council") throw new Error(`Historical office ${row.office_id} is not a communal council`);
      historicalCouncils += 1;
      if (!predecessorEdge.has(row.office_id)) {
        throw new Error(`Historical office ${row.office_id} has no explicit predecessor edge`);
      }
    } else {
      currentOffices += 1;
      if (row.office_type === "communal_council") currentCouncils += 1;
      if (predecessorEdge.has(row.office_id)) {
        throw new Error(`Current office ${row.office_id} is listed as a predecessor`);
      }
    }
    officeById.set(row.office_id, row);
    officeIndex.set(row.office_id, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyIdFor(row),
      name: row.name,
      office_type: row.office_type,
      office_status: row.status,
      record_state: "active",
      state_note: row.boundary_note,
      registry_qualified: 1,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(REGISTER_RELATIVE, registerHash, i), row }),
    });
  }
  if (officeById.size !== classById.size) throw new Error("Luxembourg classifications do not match the register");
  if (!officeById.has(PARLIAMENT_ID) || !officeById.has(EP_ID)) {
    throw new Error("Missing Chambre des Députés or Luxembourg EP delegation");
  }

  const geographies: SqlRow[] = [
    {
      country_id: COUNTRY_ID,
      geography_id: COUNTRY_GEOGRAPHY_ID,
      name: COUNTRY_NAME,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
        row: { geography_id: COUNTRY_GEOGRAPHY_ID, name: COUNTRY_NAME, role: "country" },
      }),
    },
  ];
  const geoIds = new Set<string>([COUNTRY_GEOGRAPHY_ID]);
  let predecessorEffectiveTo = 0;
  let successorEffectiveFromCount = 0;
  for (const row of inventory.offices) {
    if (row.office_type !== "communal_council") continue;
    const geographyId = geographyIdFor(row);
    if (geoIds.has(geographyId)) throw new Error(`Duplicate geography ${geographyId}`);
    geoIds.add(geographyId);
    const edge = predecessorEdge.get(row.office_id);
    const fromLabel = successorDates.has(row.office_id)
      ? sharedSuccessorDate(row.office_id, successorDates.get(row.office_id)!)
      : null;
    const toLabel = edge ? edge.effective_date : null;
    if (fromLabel && toLabel) {
      throw new Error(`Geography ${geographyId} cannot be both a dated predecessor and a dated successor`);
    }
    if (fromLabel) successorEffectiveFromCount += 1;
    if (toLabel) predecessorEffectiveTo += 1;
    const index = officeIndex.get(row.office_id)!;
    geographies.push({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: row.commune,
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: fromLabel,
      effective_to_label: toLabel,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(REGISTER_RELATIVE, registerHash, index),
        row: {
          geography_id: geographyId,
          commune: row.commune,
          canton: row.canton ?? null,
          lau2: row.lau2 ?? null,
          office_id: row.office_id,
        },
      }),
    });
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (row.review_status !== "needs_review") {
      throw new Error(`Refusing to rewrite ${row.office_id} review_status ${row.review_status}`);
    }
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapTier(row.tier),
      review_status: "needs_review",
      rationale: row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/classifications/${index}` }),
        row,
      }),
    };
  });

  const events: SqlRow[] = [];
  const eventByKey = new Map<string, LuxembourgEventRow>();
  const eventsByOffice = new Map<string, number>();
  let yearOnly = 0;
  let uncontestedReturns = 0;
  let proclamations = 0;
  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    const office = officeById.get(row.office_id);
    if (!office) throw new Error(`Event ${row.event_id} office ${row.office_id} is not in the register`);
    if (eventByKey.has(row.event_id)) throw new Error(`Duplicate event ${row.event_id}`);
    if (row.event_type !== "ordinary_election" && row.event_type !== "uncontested_return") {
      throw new Error(`Unsupported event_type ${row.event_type} on ${row.event_id}`);
    }
    if (row.result_status !== "unofficial" && row.result_status !== "official_proclamation") {
      throw new Error(`Unsupported result_status ${row.result_status} on ${row.event_id}`);
    }
    if (row.date_precision !== "day" && row.date_precision !== "year") {
      throw new Error(`Unsupported date_precision ${row.date_precision} on ${row.event_id}`);
    }
    if (row.date_precision === "year") {
      yearOnly += 1;
      if (row.date_role !== "election_year") throw new Error(`Year-only event ${row.event_id} is not an election_year label`);
      if (ISO_DAY.test(row.date)) throw new Error(`Refusing to keep a filled day on year-only event ${row.event_id}`);
    }
    if (row.event_type === "uncontested_return") {
      uncontestedReturns += 1;
      if (row.date_role !== "ordinary_cycle_label_not_polling_day") {
        throw new Error(`Uncontested return ${row.event_id} must stay a cycle label, not a polling day`);
      }
    }
    if (row.result_status === "official_proclamation") {
      proclamations += 1;
      if (row.event_id !== BERDORF_EVENT_ID) throw new Error(`Unexpected official proclamation ${row.event_id}`);
    }
    const parsed = parseLabel(row.date, row.date_precision, row.event_id);
    const dateIdValue = dateId("event", row.event_id, "election");
    pushDate({
      date_id: dateIdValue,
      label: row.date,
      precision: parsed.precision,
      certainty: certaintyFor(row.date_role, row.event_id),
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(EVENTS_RELATIVE, eventsHash, i),
        row: { date: row.date, date_precision: row.date_precision, date_role: row.date_role },
      }),
    });
    eventByKey.set(row.event_id, row);
    eventsByOffice.set(row.office_id, (eventsByOffice.get(row.office_id) ?? 0) + 1);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: "ordinary",
      selected_history_role: "selected",
      electoral_system: null,
      comparability: null,
      ballot_basis: "unknown",
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: eventStateNote(row),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(EVENTS_RELATIVE, eventsHash, i), row }),
    });
  }
  for (const officeId of officeById.keys()) {
    if ((eventsByOffice.get(officeId) ?? 0) < 1) throw new Error(`Office ${officeId} has no authored event`);
  }
  if (!eventByKey.has(EP_1994_EVENT_ID)) throw new Error("1994 EP event is missing");
  const ep1994 = eventByKey.get(EP_1994_EVENT_ID)!;
  if (ep1994.date_precision !== "year" || ep1994.date !== "1994") {
    throw new Error("1994 EP event must stay a year label");
  }

  let datedEdges = 0;
  let undatedEdges = 0;
  const crosswalks: SqlRow[] = [];
  const crosswalkKeys = new Set<string>();
  for (let i = 0; i < inventory.mergers.length; i++) {
    const row = inventory.mergers[i]!;
    const predecessor = officeById.get(row.predecessor_office_id);
    const successor = officeById.get(row.successor_office_id);
    if (!predecessor || predecessor.status !== "historical" || predecessor.office_type !== "communal_council") {
      throw new Error(`Predecessor ${row.predecessor_office_id} is not a historical communal council`);
    }
    if (!successor || successor.status !== "current" || successor.office_type !== "communal_council") {
      throw new Error(`Successor ${row.successor_office_id} is not a current communal council`);
    }
    if (row.predecessor_office_id === row.successor_office_id) {
      throw new Error(`Refusing a self-merger edge ${row.predecessor_office_id}`);
    }
    if (row.effective_date == null) undatedEdges += 1;
    else {
      if (!ISO_DAY.test(row.effective_date)) {
        throw new Error(`Merger effective_date ${row.effective_date} is not an ISO day`);
      }
      datedEdges += 1;
    }
    const key = `${MERGER_UPSTREAM_NAMESPACE}|${row.predecessor_office_id}`;
    if (crosswalkKeys.has(key)) throw new Error(`Duplicate merger crosswalk ${key}`);
    crosswalkKeys.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: MERGER_UPSTREAM_NAMESPACE,
      upstream_id: row.predecessor_office_id,
      record_key: recordKey("office", [N, row.successor_office_id]),
      reason: `${row.evidence} predecessor=${row.predecessor_office_id} successor=${row.successor_office_id}`,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(CROSSWALK_RELATIVE, crosswalkHash, i), row }),
    });
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({ derivedPath: TIER_PATH, derivedPointer: "/country_id" }),
  });
  addLocator(locators, locatorSeen, {
    record_key: recordKey("geography", [COUNTRY_ID, COUNTRY_GEOGRAPHY_ID]),
    entity_kind: "geography",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    geography_id: COUNTRY_GEOGRAPHY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({ derivedPath: TIER_PATH, derivedPointer: "/country_id" }),
  });
  for (const row of inventory.offices) {
    if (row.office_type !== "communal_council") continue;
    const index = officeIndex.get(row.office_id)!;
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, geographyIdFor(row)]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geographyIdFor(row),
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, row.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const [index, row] of inventory.events.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("event", [N, row.office_id, row.event_id]),
      entity_kind: "event",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: EVENTS_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, R, item.input_path]),
      entity_kind: "input",
      ...blankLocator(),
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: item.input_path }),
    });
  }

  const unresolved: SqlRow[] = [];
  for (let i = 0; i < inventory.gaps.length; i++) {
    const gap = inventory.gaps[i]!;
    const occurrence = { input_path: GAPS_RELATIVE, json_pointer: `/${i}`, id: gap.id };
    unresolved.push({
      unresolved_id: luxembourgUnresolvedId(countryRec, occurrence, gap.id),
      record_key: countryRec,
      original_token: gap.id,
      source_locator: canonical(occurrence),
      reason: gap.detail,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: GAPS_RELATIVE, sha256: gapsHash, json_pointer: `/${i}` }),
        row: gap,
      }),
    });
  }

  const tierCounts = {
    municipal: tiers.filter((row) => row.tier === "municipal").length,
    regional: tiers.filter((row) => row.tier === "regional").length,
    national: tiers.filter((row) => row.tier === "national_context").length,
    other: tiers.filter((row) => row.tier === "other").length,
  };

  const validatedCounts: Record<string, number> = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: events.length,
    prospective_events: 0,
    total_events: events.length,
    proceedings: 0,
    result_rows: 0,
    documented_result_rows_omitted: inventory.countsFile.result_rows,
    observation_envelopes: inventory.observations.length,
    observation_nested_result_counts: nestedResultCounts,
    municipal_offices: tierCounts.municipal,
    regional_offices: tierCounts.regional,
    national_offices: tierCounts.national,
    other_offices: tierCounts.other,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    resolved_exclusions: RESOLVED_EXCLUSIONS.length,
    party_mappings: 0,
    identity_crosswalks: crosswalks.length,
    explicit_predecessor_edges: crosswalks.length,
    guessed_merger_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    direct_executive_offices: directExecutives,
    current_communal_councils: currentCouncils,
    historical_communal_councils: historicalCouncils,
    parliament_offices: officeById.get(PARLIAMENT_ID)?.office_type === "parliament" ? 1 : 0,
    ep_delegations: officeById.get(EP_ID)?.office_type === "ep_delegation" ? 1 : 0,
    year_only_events: yearOnly,
    uncontested_return_events: uncontestedReturns,
    official_proclamation_events: proclamations,
    evidence_links: 0,
    source_inventory_rows: inventory.sourceInventory.length,
    dated_predecessor_edges: datedEdges,
    undated_predecessor_edges: undatedEdges,
    successor_geographies_with_effective_from: successorEffectiveFromCount,
    predecessor_geographies_with_effective_to: predecessorEffectiveTo,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Luxembourg ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (validatedCounts.result_rows !== 0) throw new Error("Luxembourg slim import must publish 0 result rows");

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Luxembourg Prompt AO register. Justin accepted 102 current and 28 historical offices with holds LU-G03–LU-G11 left open. LU-G01 and LU-G02 stay resolved exclusions. 438 events and 0 published result rows. The omitted results.json documents 48,197 rows and is not invented. 28 explicit predecessor edges only.",
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
      origin: locator({ input_path: COUNTS_RELATIVE, sha256: countsHash }),
      row: {
        fingerprint: inventory.fingerprint,
        release_id: R,
        coverage_complete: false,
        tier_status: "approved",
        production_accepted: true,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
        resolved_exclusions: RESOLVED_EXCLUSIONS.map((hold) => hold.token),
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        published_result_rows: 0,
      },
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
    proceedings: [],
    sources: [],
    results: [],
    locators,
    evidence: [],
    unresolved,
    crosswalks,
    validatedCounts,
  };
}
