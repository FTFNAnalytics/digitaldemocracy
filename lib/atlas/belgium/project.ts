import {
  AARTSELAAR_COUNCIL_ID,
  AARTSELAAR_COUNCIL_RECORD_KEY,
  ADAPTER_VERSION,
  BILZEN_2018_HISTORY_KEY,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  EXPECTED_COUNTS,
  LINEAGE_ID,
  METHOD_VERSION,
  MUNICIPAL_ROSTER_AS_OF,
  OFFICE_NAMESPACE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SAINT_JOSSE_2024_HISTORY_KEY,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  belgiumEvidenceId,
  belgiumUnresolvedId,
  canonical,
  dateId,
  hostnameOf,
  isFixtureId,
  isWalloniaPortalPath,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type {
  BelgiumEventRow,
  BelgiumEvidenceRef,
  BelgiumInventory,
  BelgiumResultRow,
  BelgiumSourceRow,
} from "./inventory";

export type SqlRow = Record<string, unknown>;

export type BelgiumProjection = {
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

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Belgium event date is not a valid ISO day: ${JSON.stringify(label)}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
    throw new Error(`Invalid Gregorian date ${label}`);
  }
  return { year, month, day };
}

function pointerFor(relativePath: string, index: number): string {
  return `/${index}`;
}

function originFor(relativePath: string, sha256: string, index: number, field?: string): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: field ? `/${index}/${field}` : pointerFor(relativePath, index),
  });
}

function sliceHash(inventory: BelgiumInventory, relativePath: string): string {
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

function joinNotes(notes: string[] | undefined, extra?: string | null): string | null {
  const parts = [...(notes ?? []), extra].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length ? parts.join(" ") : null;
}

function mapTier(classification: { tier: string; schema_v1_tier?: string }): string | null {
  const raw = classification.schema_v1_tier ?? classification.tier;
  if (raw === "municipal" || raw === "regional" || raw === "other" || raw === "national_context") return raw;
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported Belgium classification tier ${JSON.stringify(raw)}`);
}

function isSubstantiveSource(row: BelgiumSourceRow): boolean {
  if (!row.source_id || !row.input_path) return false;
  if (row.status === "error" || row.status === "human_verification_response_not_evidence") return false;
  return row.status === "downloaded" || row.status === "web_tool_capture";
}

function originalPartyCode(row: BelgiumResultRow): string | null {
  if (typeof row.original_party_code === "string" && row.original_party_code.trim()) return row.original_party_code;
  const raw = row.raw ?? {};
  if (raw.partyId != null) return String(raw.partyId);
  return null;
}

function eventEvidencePaths(row: BelgiumEventRow): string[] {
  return (row.evidence ?? []).map((item) => item.input_path);
}

function resultEvidencePaths(row: BelgiumResultRow): string[] {
  return (row.evidence ?? []).map((item) => item.input_path);
}

function walloniaQualification(paths: string[]): boolean {
  return paths.some((item) => isWalloniaPortalPath(item));
}

function eventKindFor(row: BelgiumEventRow): string {
  if (row.history_key === BILZEN_2018_HISTORY_KEY) return "unknown";
  const kind = row.event_kind ?? "ordinary";
  if (kind === "ordinary" || kind === "special" || kind === "repeated" || kind === "indirect" || kind === "unknown") {
    return kind;
  }
  throw new Error(`Unsupported Belgium event_kind ${JSON.stringify(kind)} for ${row.history_key}`);
}

function legalOutcomeFor(row: BelgiumEventRow): string {
  if (row.history_key === BILZEN_2018_HISTORY_KEY || row.history_key === SAINT_JOSSE_2024_HISTORY_KEY) {
    return "disputed";
  }
  if (walloniaQualification(eventEvidencePaths(row))) return "preliminary";
  return row.legal_outcome === "disputed" || row.legal_outcome === "preliminary" ? row.legal_outcome : "unknown";
}

function evidenceStatusFor(row: BelgiumResultRow): string {
  if (row.history_key === BILZEN_2018_HISTORY_KEY || row.history_key === SAINT_JOSSE_2024_HISTORY_KEY) {
    return "disputed";
  }
  if (walloniaQualification(resultEvidencePaths(row))) return "preliminary";
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

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function addLocator(
  locators: SqlRow[],
  seen: Set<string>,
  row: SqlRow,
): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

function addCrosswalk(
  crosswalks: SqlRow[],
  seen: Set<string>,
  row: SqlRow,
): void {
  const key = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
  if (seen.has(key)) return;
  seen.add(key);
  crosswalks.push(row);
}

export function projectBelgium(inventory: BelgiumInventory): BelgiumProjection {
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
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Belgium offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Belgium events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Belgium results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Belgium geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Belgium classifications`);
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

  const registerHash = sliceHash(inventory, "data/research/belgium-s2/office-register.json");
  const countryRec = recordKey("country", [COUNTRY_ID]);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: "Belgium",
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: "data/research/belgium-s2/office-register.json",
        sha256: registerHash,
        json_pointer: "/0",
      }),
      row: {
        country_id: COUNTRY_ID,
        municipal_roster_as_of: MUNICIPAL_ROSTER_AS_OF,
        research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
      },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_notes: [
          "remaining_universe",
          "historic_binding",
          "bilzen_date_conflict",
          "saint_josse_repeat",
          "ibz_2000_unresolved",
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
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Belgium`);
    geoById.set(row.geography_id, row.geography_id);
    const origin = originFor("data/research/belgium-s2/geography.json", sliceHash(inventory, "data/research/belgium-s2/geography.json"), index);
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
  let nextDates = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Belgium`);
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
    const historicNote = historical
      ? "Historical coded jurisdiction retained; successor/code-change review remains open. No inferred abolition date."
      : null;
    let nextDateId: string | null = null;
    let nextDateResolution: "resolved" | "unknown" = "unknown";
    if (row.next_election) {
      nextDateId = dateId("office", row.office_id, "next");
      nextDateResolution = "resolved";
      nextDates += 1;
      const origin = originFor(
        "data/research/belgium-s2/office-register.json",
        registerHash,
        i,
        "next_election",
      );
      pushDate({
        date_id: nextDateId,
        label: row.next_election.label,
        precision: "year",
        certainty: "expected",
        year: 2030,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row: row.next_election }),
      });
    }
    const origin = originFor("data/research/belgium-s2/office-register.json", registerHash, i);
    offices.push({
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: row.geography_id,
      name: row.name,
      office_type: row.office_type,
      office_status: historical ? "historical" : "current",
      record_state: "active",
      state_note: joinNotes(row.notes, historicNote),
      registry_qualified: null,
      next_date_id: nextDateId,
      next_date_resolution: nextDateResolution,
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
    if (needsReview) {
      throw new Error(`Belgium classification ${row.office_id} is marked for review; Justin accepted all rows`);
    }
    const origin = originFor(TIER_PATH, TIER_SHA256, index);
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: mapped == null ? "unknown" : "approved",
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
  const eventByHk = new Map<string, BelgiumEventRow>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let eventDates = 0;
  const eventsHash = sliceHash(inventory, "data/research/belgium-s2/events.json");

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    eventByHk.set(row.history_key, row);
    const conflicting = row.history_key === BILZEN_2018_HISTORY_KEY || row.date_resolution === "conflicting";
    let dateIdValue: string | null = null;
    if (!conflicting) {
      if (!row.date) throw new Error(`Event ${row.history_key} is missing a resolved date`);
      const parsed = parseDayLabel(row.date);
      dateIdValue = dateId("election_event", row.event_id, "ballot");
      eventDates += 1;
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
          origin: originFor("data/research/belgium-s2/events.json", eventsHash, i, "date"),
          row: { date: row.date, date_precision: row.date_precision, date_certainty: row.date_certainty },
        }),
      });
    }
    const role = row.history_key === BILZEN_2018_HISTORY_KEY || row.history_key === SAINT_JOSSE_2024_HISTORY_KEY
      ? "other"
      : (row.selected_history_role ?? "selected");
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else throw new Error(`Belgium must not author prospective events; got ${role} for ${row.history_key}`);

    const origin = originFor("data/research/belgium-s2/events.json", eventsHash, i);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: conflicting ? "conflicting" : "resolved",
      event_kind: eventKindFor(row),
      selected_history_role: role,
      electoral_system: null,
      comparability: null,
      ballot_basis: "list_votes",
      share_unit: "percent_0_100",
      legal_outcome: legalOutcomeFor(row),
      record_state: "active",
      state_note: joinNotes(
        [],
        conflicting
          ? "Bilzen 2018 header/row dates conflict; competing claims retained."
          : row.history_key === SAINT_JOSSE_2024_HISTORY_KEY
            ? "Saint-Josse 2024 annulment/repeat primary reconciliation remains open."
            : row.result_scope
              ? `result_scope=${JSON.stringify(row.result_scope)}`
              : null,
      ),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceByPath = new Map<string, string>();
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, "data/research/belgium-s2/source-catalogue.json");
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!isSubstantiveSource(row)) continue;
    const sourceId = String(row.source_id);
    const inputPath = String(row.input_path);
    sourceByPath.set(inputPath, sourceId);
    sourceById.add(sourceId);
    const toolCapture = row.status === "web_tool_capture";
    const origin = originFor("data/research/belgium-s2/source-catalogue.json", sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: sourceId,
      publisher: toolCapture ? "www.belgium.be" : hostnameOf(row.url),
      title: basename(inputPath),
      url: toolCapture ? null : row.url ?? null,
      checked_as_of_label: row.retrieved ?? RESEARCH_SNAPSHOT_LABEL,
      evidence_grade: null,
      file_sha256: row.sha256 ?? inventory.byPath.get(inputPath)?.sha256 ?? null,
      locator: inputPath,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const results: SqlRow[] = [];
  const resultsHash = sliceHash(inventory, "data/research/belgium-s2/results.json");
  let mayorResults = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (row.office_id.endsWith("-M")) mayorResults += 1;
    const origin = originFor("data/research/belgium-s2/results.json", resultsHash, i);
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.candidate_or_list_label ?? null,
      original_party_label: row.original_party_label ?? null,
      original_party_code: originalPartyCode(row),
      party_namespace: null,
      party_mapping_id: null,
      votes: row.votes ?? null,
      votes_status: row.votes_status,
      share: row.share ?? null,
      share_status: row.share_status,
      share_unit: "percent_0_100",
      seats: row.seats ?? null,
      seats_status: row.seats_status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: evidenceStatusFor(row),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  if (mayorResults !== 0) throw new Error("Belgium S2 must not project mayor vote rows");

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
      inputPath: "data/research/belgium-s2/office-register.json",
      sha256: registerHash,
      derivedPointer: "/0",
    }),
  });
  for (const row of geographies) {
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
        inputPath: "data/research/belgium-s2/geography.json",
        sha256: sliceHash(inventory, "data/research/belgium-s2/geography.json"),
        derivedPointer: `/${inventory.geographies.findIndex((geo) => geo.geography_id === row.geography_id)}`,
      }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    const rec = recordKey("office", [N, row.office_id]);
    if (row.office_id === AARTSELAAR_COUNCIL_ID && rec !== AARTSELAAR_COUNCIL_RECORD_KEY) {
      throw new Error(`Aartselaar council record_key drifted: ${rec}`);
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
        inputPath: "data/research/belgium-s2/office-register.json",
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
        inputPath: "data/research/belgium-s2/events.json",
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
        inputPath: "data/research/belgium-s2/results.json",
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
        inputPath: "data/research/belgium-s2/source-catalogue.json",
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
    refs: BelgiumEvidenceRef[] | undefined;
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
      const evidenceId = belgiumEvidenceId(args.recordKey, ref.input_path, locatorText, args.claimKind);
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
    if (row.next_election?.evidence) {
      pushEvidence({
        recordKey: rec,
        refs: [row.next_election.evidence],
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
  const unresolvedHash = sliceHash(inventory, "data/research/belgium-s2/unresolved-bindings.json");
  let unresolvedEvents = 0;
  let unresolvedIbz = 0;
  for (let i = 0; i < inventory.unresolved.length; i++) {
    const row = inventory.unresolved[i]!;
    const origin = originFor("data/research/belgium-s2/unresolved-bindings.json", unresolvedHash, i);
    if (row.office_id && row.history_key) {
      unresolvedEvents += 1;
      const rec = recordKey("event", [N, row.office_id, row.history_key]);
      const token = row.history_key;
      unresolved.push({
        unresolved_id: belgiumUnresolvedId(
          rec,
          token,
          "data/research/belgium-s2/unresolved-bindings.json",
          `/${i}`,
        ),
        record_key: rec,
        original_token: token,
        source_locator: `data/research/belgium-s2/unresolved-bindings.json#/${i}`,
        reason: row.reason,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin, row }),
      });
      continue;
    }
    unresolvedIbz += 1;
    const inputPath = row.input
      ? `${RESEARCH_PREFIX}/sources/${row.input}`
      : "data/research/belgium-s2/sources/ibz-municipal-2000.json";
    if (!inventory.byPath.has(inputPath)) {
      throw new Error(`Unresolved binding input ${inputPath} is not a retained input`);
    }
    const rec = recordKey("input", [L, inputPath]);
    const token = row.upstream_id != null
      ? String(row.upstream_id)
      : (row.labels ?? []).map((label) => label.label).filter(Boolean).join("|") || row.reason;
    unresolved.push({
      unresolved_id: belgiumUnresolvedId(rec, token, inputPath, row.json_pointer ?? `/${i}`),
      record_key: rec,
      original_token: token,
      source_locator: `${inputPath}${row.json_pointer ?? ""}`,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkSeen = new Set<string>();
  for (const row of inventory.geographies) {
    if (!row.nis_code) continue;
    addCrosswalk(crosswalks, crosswalkSeen, {
      entity_kind: "geography",
      upstream_namespace: "ibz-nis",
      upstream_id: row.nis_code,
      record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
      reason: "Sourced NIS geography code from the authored register.",
      lineage_id: L,
      release_id: R,
      raw_json: canonical({ geography_id: row.geography_id, nis_code: row.nis_code }),
    });
  }
  for (const row of inventory.offices) {
    const match = /^BE-(\d+)-([A-Z]+)$/.exec(row.office_id);
    if (!match) continue;
    addCrosswalk(crosswalks, crosswalkSeen, {
      entity_kind: "office",
      upstream_namespace: "ibz-nis",
      upstream_id: `${match[1]}-${match[2]}`,
      record_key: recordKey("office", [N, row.office_id]),
      reason: "Sourced NIS + office-kind identifier from the accepted register.",
      lineage_id: L,
      release_id: R,
      raw_json: canonical({ office_id: row.office_id }),
    });
  }
  for (const row of inventory.events) {
    const electionId = row.raw && typeof row.raw.electionId === "number" ? row.raw.electionId : null;
    const upstreamId = row.raw && row.raw.id != null ? String(row.raw.id) : null;
    if (electionId != null && upstreamId) {
      addCrosswalk(crosswalks, crosswalkSeen, {
        entity_kind: "event",
        upstream_namespace: `ibz-election-api/${electionId}`,
        upstream_id: upstreamId,
        record_key: recordKey("event", [N, row.office_id, row.history_key]),
        reason: "IBZ election-level identity scoped by API election id.",
        lineage_id: L,
        release_id: R,
        raw_json: canonical({ history_key: row.history_key, electionId, id: row.raw?.id }),
      });
    }
  }
  for (const row of inventory.results) {
    if (!row.source_row_id) continue;
    addCrosswalk(crosswalks, crosswalkSeen, {
      entity_kind: "result_row",
      upstream_namespace: "belgium-source-row",
      upstream_id: `${row.history_key}::${row.source_row_id}`,
      record_key: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      reason: "Scoped source-row token from the authored result vector.",
      lineage_id: L,
      release_id: R,
      raw_json: canonical({ result_row_id: row.result_row_id, source_row_id: row.source_row_id }),
    });
  }
  for (const row of sources) {
    addCrosswalk(crosswalks, crosswalkSeen, {
      entity_kind: "source",
      upstream_namespace: "belgium:source-catalogue",
      upstream_id: String(row.source_id),
      record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
      reason: "Catalogue source_id for a substantive retained input.",
      lineage_id: L,
      release_id: R,
      raw_json: canonical({ source_id: row.source_id, locator: row.locator }),
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
    diagnostic_sources_excluded: inventory.sourceCatalogue.length - sources.length,
    unresolved_evidence: unresolved.length,
    unresolved_event_holds: unresolvedEvents,
    unresolved_ibz_bindings: unresolvedIbz,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_day_called: eventDates,
    next_dates_year_expected: nextDates,
    proceedings: 0,
    party_mappings: 0,
    mayor_result_rows: mayorResults,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Belgium ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Belgium current-register and historic primary-source research; coverage partial. Prompt S2 accepted 1,179 current + 55 historical offices.",
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
