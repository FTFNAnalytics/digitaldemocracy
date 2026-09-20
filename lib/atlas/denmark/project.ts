import {
  ADAPTER_VERSION,
  CONTINUING_REGION_ID,
  COPENHAGEN_COUNCIL_ID,
  COPENHAGEN_COUNCIL_RECORD_KEY,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  CROSSWALK_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_NAMESPACE,
  PREPARATORY_REGION_ID,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RETIRING_REGION_ID,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  canonical,
  dateId,
  denmarkEvidenceId,
  denmarkUnresolvedId,
  hostnameOf,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  DenmarkEventRow,
  DenmarkEvidenceRef,
  DenmarkInventory,
  DenmarkOfficeRow,
  DenmarkResultRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type DenmarkProjection = {
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
const CATALOGUE_LOOKUP_NOTE = "data/research/denmark/sources.json";

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Denmark day date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function parseMonthLabel(label: string): { year: number; month: number } {
  const match = ISO_MONTH.exec(label.trim());
  if (!match) throw new Error(`Denmark month date is not YYYY-MM: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) throw new Error(`Invalid month ${label}`);
  return { year, month };
}

function parseYearLabel(label: string): number {
  const match = ISO_YEAR.exec(label.trim());
  if (!match) throw new Error(`Denmark year date is not YYYY: ${JSON.stringify(label)}`);
  return Number(match[1]);
}

function pointerFor(index: number, field?: string): string {
  return field ? `/${index}/${field}` : `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number, field?: string): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: pointerFor(index, field),
  });
}

function sliceHash(inventory: DenmarkInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Denmark classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
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

function nextElectionRefs(row: DenmarkOfficeRow): DenmarkEvidenceRef[] {
  const next = row.next_election;
  if (!next) return [];
  const refs = next.evidence ?? next.source;
  if (!refs) return [];
  return Array.isArray(refs) ? refs : [refs];
}

function eventKindFor(row: DenmarkEventRow): string {
  const kind = row.event_kind ?? "ordinary";
  if (kind === "ordinary" || kind === "special" || kind === "repeated" || kind === "indirect" || kind === "unknown") {
    return kind;
  }
  throw new Error(`Unsupported Denmark event_kind ${JSON.stringify(kind)} for ${row.history_key}`);
}

function ballotBasisFor(row: DenmarkEventRow): string {
  const basis = row.ballot_basis ?? "list_votes";
  const allowed = new Set(["valid_votes", "list_votes", "candidate_marks", "electors", "including_blank_invalid", "unknown"]);
  if (!allowed.has(basis)) throw new Error(`Unsupported ballot_basis ${basis} on ${row.history_key}`);
  return basis;
}

function legalOutcomeFor(row: DenmarkEventRow): string {
  const outcome = row.legal_outcome ?? "unknown";
  const allowed = new Set(["unknown", "not_held", "certified", "annulled", "preliminary", "disputed", "superseded"]);
  if (!allowed.has(outcome)) throw new Error(`Unsupported legal_outcome ${outcome} on ${row.history_key}`);
  return outcome;
}

function evidenceStatusFor(row: DenmarkResultRow): string {
  const status = row.evidence_status ?? "recorded";
  const allowed = new Set([
    "recorded",
    "zero",
    "unknown",
    "not_applicable",
    "structurally_unavailable",
    "preliminary",
    "disputed",
    "superseded",
  ]);
  if (!allowed.has(status)) throw new Error(`Unsupported evidence_status ${status} on ${row.result_row_id}`);
  return status;
}

export function projectDenmark(inventory: DenmarkInventory): DenmarkProjection {
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
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Denmark offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Denmark events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Denmark results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Denmark geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Denmark classifications`);
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

  const registerHash = sliceHash(inventory, "data/research/denmark/office-register.json");
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Danmark",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: "data/research/denmark/office-register.json",
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        name: "Danmark",
        language: "da",
        coverage_complete: false,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [
          "greenland_faroe_realm_coverage_gates",
          "merger_successor_bindings_2007_and_earlier",
          "kmd_dst_detail_holes",
          "unresolved_candidate_bindings_98",
          "ep_detail_gaps",
          "no_popular_mayor_rows",
        ],
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
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor(
      "data/research/denmark/geographies.json",
      sliceHash(inventory, "data/research/denmark/geographies.json"),
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

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const offices: SqlRow[] = [];
  const officeIds = new Set<string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let mayorOffices = 0;
  let nextDayStatutory = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    officeIds.add(row.office_id);
    const historical = row.current === false;
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    if (row.office_type === "mayor") mayorOffices += 1;
    const retiringRegion = row.office_id === RETIRING_REGION_ID;
    const historicNote = historical
      ? "Historical coded jurisdiction retained; successor/code-change review remains open. No inferred abolition date."
      : retiringRegion
        ? "Hovedstaden 2021 term extended through 2026; no invented 2025 election or 2029 next date."
        : row.office_id === PREPARATORY_REGION_ID
          ? "Østdanmark is the elected preparatory regional council in 2026; operating from 2027. No second office for the functional-phase change."
          : null;
    const reviewNotes = Array.isArray(row.review_notes) ? (row.review_notes as string[]) : row.notes;
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_election) {
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      const precision = row.next_election.precision;
      const origin = originFor(
        "data/research/denmark/office-register.json",
        registerHash,
        i,
        "next_election",
      );
      if (precision === "day") {
        const parsed = parseDayLabel(row.next_election.label);
        nextDayStatutory += 1;
        pushDate({
          date_id: nextDateId,
          label: row.next_election.label,
          precision: "day",
          certainty: row.next_election.certainty === "statutory" ? "statutory" : "expected",
          year: parsed.year,
          month: parsed.month,
          day: parsed.day,
          range_start_id: null,
          range_end_id: null,
          lineage_id: L,
          release_id: R,
          raw_json: rawEnvelope({ origin, row: row.next_election }),
        });
      } else {
        throw new Error(`Unsupported Denmark next-election precision ${JSON.stringify(precision)} on ${row.office_id}`);
      }
    } else if (retiringRegion && row.next_election != null) {
      throw new Error(`${row.office_id} retiring region must not carry a next_election`);
    }
    const origin = originFor("data/research/denmark/office-register.json", registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: joinNotes(reviewNotes, [historicNote]),
      registry_qualified: null,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorOffices !== 0) throw new Error("Denmark must not invent mayor offices");

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
  const eventByHk = new Map<string, DenmarkEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let eventDays = 0;
  let eventYears = 0;
  const eventsHash = sliceHash(inventory, "data/research/denmark/events.json");

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (row.prospective) throw new Error(`Denmark must not author prospective events; ${row.history_key}`);
    eventByHk.set(row.history_key, row);
    const precision = row.precision ?? (row.date && ISO_DAY.test(row.date) ? "day" : "year");
    const dateIdValue = dateId("election_event", row.event_id, "ballot");
    if (precision === "day") {
      if (!row.date) throw new Error(`Event ${row.history_key} is missing a resolved day date`);
      const parsed = parseDayLabel(row.date);
      eventDays += 1;
      pushDate({
        date_id: dateIdValue,
        label: row.date,
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
          origin: originFor("data/research/denmark/events.json", eventsHash, i, "date"),
          row: { date: row.date, precision, certainty: row.certainty },
        }),
      });
    } else if (precision === "year") {
      const year = Number(row.year ?? parseYearLabel(row.date ?? ""));
      if (!Number.isFinite(year) || year < 1800) {
        throw new Error(`Event ${row.history_key} is missing a year-precision date`);
      }
      const label = row.date ?? String(year);
      eventYears += 1;
      pushDate({
        date_id: dateIdValue,
        label,
        precision: "year",
        certainty: "called",
        year,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor("data/research/denmark/events.json", eventsHash, i, "date"),
          row: { date: row.date ?? null, year, precision, certainty: row.certainty },
        }),
      });
    } else {
      throw new Error(`Unsupported Denmark event precision ${JSON.stringify(precision)} on ${row.history_key}`);
    }
    const role = row.selected_history_role ?? "selected";
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else throw new Error(`Denmark must not author prospective events; got ${role} for ${row.history_key}`);

    const origin = originFor("data/research/denmark/events.json", eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: eventKindFor(row),
      selected_history_role: role,
      electoral_system: null,
      comparability: null,
      ballot_basis: ballotBasisFor(row),
      share_unit: "percent_0_100",
      legal_outcome: legalOutcomeFor(row),
      record_state: "active",
      state_note: joinNotes(
        [],
        [
          precision === "year" ? "EP source-year precision retained; no guessed polling day." : null,
          typeof row.raw?.numeric_certification_not_inferred === "boolean"
            ? "Numeric certification is not inferred from structural zeros."
            : null,
        ],
      ),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceByPath = new Map<string, string>();
  const sourceById = new Set<string>();
  for (const row of inventory.sourceCatalogue) {
    if (!row.source_id || !row.input_path) {
      throw new Error("Denmark catalogue row is missing source_id or input_path");
    }
    sourceByPath.set(row.input_path, row.source_id);
    if (sourceById.has(row.source_id)) continue;
    sourceById.add(row.source_id);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? hostnameOf(row.url),
      title: basename(row.input_path),
      url: row.url ?? null,
      checked_as_of_label: row.checked_as_of_label ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: null,
      file_sha256: row.sha256 ?? null,
      locator: row.input_path,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: CATALOGUE_LOOKUP_NOTE,
          sha256: row.sha256 ?? null,
          json_pointer: null,
        }),
        row,
        supplemental: {
          bulky_source_bytes: "omitted_from_slim_pack",
          catalogue_lookup: CATALOGUE_LOOKUP_NOTE,
        },
      }),
    });
  }

  const results: SqlRow[] = [];
  const resultsHash = sliceHash(inventory, "data/research/denmark/results.json");
  let mayorResults = 0;
  let zeroSeats = 0;
  let missingSeats = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.office_id.endsWith("-M")) mayorResults += 1;
    if (row.seats_status === "zero") zeroSeats += 1;
    if (row.seats_status === "unknown") missingSeats += 1;
    const origin = originFor("data/research/denmark/results.json", resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: null,
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
      elected_flag: row.elected_flag ?? null,
      is_substitute: null,
      evidence_status: evidenceStatusFor(row),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorResults !== 0) throw new Error("Denmark must not project mayor vote rows");

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
      inputPath: "data/research/denmark/office-register.json",
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
        inputPath: "data/research/denmark/geographies.json",
        sha256: sliceHash(inventory, "data/research/denmark/geographies.json"),
        derivedPointer: `/${index}`,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === COPENHAGEN_COUNCIL_ID && rec !== COPENHAGEN_COUNCIL_RECORD_KEY) {
      throw new Error(`Copenhagen council record_key drifted: ${rec}`);
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
        inputPath: "data/research/denmark/office-register.json",
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
        inputPath: "data/research/denmark/events.json",
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
      result_row_id: row.result_row_id,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({
        inputPath: "data/research/denmark/results.json",
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
        inputPath: CATALOGUE_LOOKUP_NOTE,
        sha256: String(row.file_sha256 ?? ""),
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
    refs: DenmarkEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      const sourceId = sourceByPath.get(ref.input_path);
      if (!sourceId) {
        throw new Error(`Broken evidence source FK for ${ref.input_path} on ${args.recordKey}`);
      }
      const locatorText = ref.locator ?? ref.json_pointer ?? ref.input_path;
      const evidenceId = denmarkEvidenceId(args.recordKey, ref.input_path, locatorText, args.claimKind);
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: sourceId,
        source_locator: locatorText,
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
      claimKind: "institutional_scope",
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
    const nextRefs = nextElectionRefs(row);
    if (nextRefs.length) {
      pushEvidence({
        recordKey: rec,
        refs: nextRefs,
        claimKind: "next_cycle_metadata",
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
      claimKind: "ballot_date",
      dateClaimId: event.date_id ? String(event.date_id) : null,
      claim: { history_key: event.history_key, date: source.date ?? null },
    });
  }
  for (const [index, row] of inventory.results.entries()) {
    pushEvidence({
      recordKey: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      refs: row.evidence,
      claimKind: "result_vector",
      claim: { result_row_id: row.result_row_id, index },
    });
  }

  const unresolved: SqlRow[] = [];
  const unresolvedHash = sliceHash(inventory, UNRESOLVED_RELATIVE);
  let unresolvedCandidateBindings = 0;
  for (let i = 0; i < inventory.unresolved.length; i++) {
    const row = inventory.unresolved[i]!;
    const origin = originFor(UNRESOLVED_RELATIVE, unresolvedHash, i);
    const token =
      row.original_token ??
      row.original_label ??
      [row.table, row.candidate_code].filter(Boolean).join(":");
    if (!token) throw new Error(`Denmark unresolved candidate row ${i} is missing an original token`);
    unresolvedCandidateBindings += 1;
    const rec = recordKey("input", [L, UNRESOLVED_RELATIVE]);
    unresolved.push({
      unresolved_id: denmarkUnresolvedId(rec, token, UNRESOLVED_RELATIVE, `/${i}`),
      record_key: rec,
      original_token: token,
      source_locator: `${UNRESOLVED_RELATIVE}#/${i}`,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  let unresolvedResearchGaps = 0;
  for (let i = 0; i < inventory.gaps.length; i++) {
    const row = inventory.gaps[i]!;
    const origin = originFor(GAPS_RELATIVE, gapsHash, i);
    const token = row.original_token ?? `denmark-research-gap-${i}`;
    unresolvedResearchGaps += 1;
    const rec = recordKey("input", [L, GAPS_RELATIVE]);
    unresolved.push({
      unresolved_id: denmarkUnresolvedId(rec, token, GAPS_RELATIVE, `/${i}`),
      record_key: rec,
      original_token: token,
      source_locator: `${GAPS_RELATIVE}#/${i}`,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  const crosswalkHash = sliceHash(inventory, CROSSWALK_RELATIVE);
  for (const [index, row] of inventory.crosswalks.entries()) {
    if (!officeIds.has(row.target_office_id)) {
      throw new Error(`Denmark identity-crosswalk target ${row.target_office_id} is not in the accepted register`);
    }
    addCrosswalk(crosswalks, crosswalkSeen, {
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: recordKey("office", [N, row.target_office_id]),
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: canonical({
        origin: originFor(CROSSWALK_RELATIVE, crosswalkHash, index),
        row,
      }),
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
    municipal_offices: municipal,
    regional_offices: regional,
    national_offices: national,
    other_offices: other,
    approved_classifications: tiers.filter((row) => row.review_status === "approved").length,
    needs_review_classifications: tiers.filter((row) => row.review_status === "needs_review").length,
    sources: sources.length,
    catalogue_rows: inventory.sourceCatalogue.length,
    unresolved_evidence: unresolved.length,
    unresolved_candidate_bindings: unresolvedCandidateBindings,
    unresolved_research_gaps: unresolvedResearchGaps,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDays,
    event_dates_year_called: eventYears,
    next_dates_day_statutory: nextDayStatutory,
    proceedings: 0,
    party_mappings: 0,
    mayor_offices: mayorOffices,
    mayor_result_rows: mayorResults,
    explicit_zero_seats: zeroSeats,
    missing_seats: missingSeats,
    identity_crosswalks: crosswalks.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Denmark ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Denmark current-register and qualified historic primary-source research; coverage partial. Prompt X accepted 106 current + 240 historical offices.",
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
      row: { fingerprint: inventory.fingerprint, release_id: R },
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
