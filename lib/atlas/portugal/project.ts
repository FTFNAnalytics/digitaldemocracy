import {
  ADAPTER_VERSION,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NOTES,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  LIST_HEAD_OFFICE_TYPES,
  METHOD_VERSION,
  MUNICIPAL_OFFICE_TYPES,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  PARISH_OFFICE_TYPES,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_NAMESPACE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
  canonical,
  dateId,
  isFixtureId,
  locator,
  portugalEvidenceId,
  portugalUnresolvedId,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type { PortugalEvidenceRef, PortugalEventRow, PortugalInventory, PortugalResultRow } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type PortugalProjection = {
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
const LIST_HEAD_TYPES = new Set<string>(LIST_HEAD_OFFICE_TYPES);
const PARISH_TYPES = new Set<string>(PARISH_OFFICE_TYPES);
const MUNICIPAL_TYPES = new Set<string>(MUNICIPAL_OFFICE_TYPES);
const AUTHORED_OFFICE_TYPES = new Set<string>([
  ...PARISH_OFFICE_TYPES,
  ...MUNICIPAL_OFFICE_TYPES,
  "parliament",
  "national_president",
  "regional_parliament",
  "european_parliament_delegation",
]);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) throw new Error(`Portugal date is not a valid ISO day: ${JSON.stringify(label)}`);
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
  if (!match) throw new Error(`Portugal year date is not YYYY: ${JSON.stringify(label)}`);
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

function sliceHash(inventory: PortugalInventory, relativePath: string): string {
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
  throw new Error(`Unsupported Portugal classification tier ${JSON.stringify(raw)}`);
}

function basename(inputPath: string): string {
  return inputPath.split("/").pop() ?? inputPath;
}

function literalPartyCode(row: PortugalResultRow): string | null {
  const header = row.raw?.column_header;
  if (typeof header !== "string") return null;
  const trimmed = header.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return null;
  if (/\s/.test(trimmed)) return null;
  return trimmed;
}

function scalarStatus(
  value: number | null | undefined,
  status: string | undefined,
  label: string,
  kind: "votes" | "share" | "seats",
): { value: number | null; status: string } {
  const normalized = value ?? null;
  const recorded = status ?? (normalized == null ? "unknown" : normalized === 0 ? "zero" : "recorded");
  if (normalized == null) {
    if (recorded !== "unknown" && recorded !== "not_applicable" && recorded !== "structurally_unavailable") {
      throw new Error(`${label} is null with status ${recorded}`);
    }
    return { value: null, status: recorded };
  }
  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error(`${label} is not a non-negative number: ${JSON.stringify(normalized)}`);
  }
  if (kind !== "share" && !Number.isInteger(normalized)) {
    throw new Error(`${label} must stay an integer; got ${JSON.stringify(normalized)}`);
  }
  if (recorded === "zero" && normalized !== 0) throw new Error(`${label} zero status disagrees with ${normalized}`);
  if (recorded === "recorded" && normalized <= 0) throw new Error(`${label} recorded status disagrees with ${normalized}`);
  if (recorded === "unknown" || recorded === "not_applicable" || recorded === "structurally_unavailable") {
    throw new Error(`${label} status ${recorded} cannot carry a scalar`);
  }
  return { value: normalized, status: recorded };
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const key = String(row.record_key);
  if (seen.has(key)) throw new Error(`Duplicate record_key ${key}`);
  seen.add(key);
  locators.push(row);
}

export function projectPortugal(inventory: PortugalInventory): PortugalProjection {
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

  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Portugal offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Portugal events, found ${inventory.events.length}`);
  }
  if (inventory.results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} Portugal results, found ${inventory.results.length}`);
  }
  if (inventory.geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} Portugal geographies, found ${inventory.geographies.length}`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Portugal classifications`);
  }
  if (inventory.proceedings.length !== EXPECTED_COUNTS.proceedings) {
    throw new Error(`Expected ${EXPECTED_COUNTS.proceedings} Portugal proceedings, found ${inventory.proceedings.length}`);
  }
  if (inventory.researchGaps.length !== EXPECTED_COUNTS.unresolved_research_gaps) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_research_gaps} Portugal named holds, found ${inventory.researchGaps.length}`);
  }
  if (inventory.unresolvedInputs.length !== EXPECTED_COUNTS.unresolved_inputs) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_inputs} Portugal unresolved inputs, found ${inventory.unresolvedInputs.length}`);
  }
  const gapTokens = inventory.researchGaps.map((row) => row.original_token);
  for (const hold of NAMED_HOLDS) {
    if (!gapTokens.includes(hold)) {
      throw new Error(`Portugal named hold ${hold} is missing from research-gaps.json`);
    }
  }
  if (inventory.researchGaps.some((row) => row.status !== "open")) {
    throw new Error("Portugal named holds must stay open");
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
    name: "Portugal",
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
        name: "Portugal",
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
    if (row.country_id !== COUNTRY_ID) throw new Error(`Geography ${row.geography_id} is not Portugal`);
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
  const officeIds = new Set<string>();
  const officeTypeById = new Map<string, string>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let nextDates = 0;
  let directRegionalPresidents = 0;

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (row.country_id !== COUNTRY_ID) throw new Error(`Office ${row.office_id} country is not Portugal`);
    if (!AUTHORED_OFFICE_TYPES.has(row.office_type)) {
      throw new Error(`Refusing to invent an office class for ${row.office_id} type ${JSON.stringify(row.office_type)}`);
    }
    if (!geoById.has(row.geography_id)) {
      throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    }
    if (!classById.has(row.office_id)) {
      throw new Error(`Office ${row.office_id} is missing an approved classification`);
    }
    if (officeIds.has(row.office_id)) throw new Error(`Duplicate office_id ${row.office_id}`);
    officeIds.add(row.office_id);
    officeTypeById.set(row.office_id, row.office_type);
    if (row.office_status !== "current" && row.office_status !== "historical") {
      throw new Error(`Office ${row.office_id} status ${JSON.stringify(row.office_status)} is not authored`);
    }
    const historical = row.office_status === "historical";
    if (historical) historicalOffices += 1;
    else currentOffices += 1;
    if (historical && row.registry_qualified !== 0) {
      throw new Error(`Historical office ${row.office_id} must stay registry_qualified 0`);
    }
    if (!historical && row.registry_qualified !== 1) {
      throw new Error(`Current office ${row.office_id} must stay registry_qualified 1`);
    }
    if (/regional_government|presidente do governo regional/i.test(row.office_type) || /regional_government/i.test(row.office_id)) {
      directRegionalPresidents += 1;
    }
    const next = row.next_election;
    if (next?.value) {
      nextDates += 1;
      throw new Error(`Portugal office ${row.office_id} has a sourced next date; do not invent one and do not drop a real claim`);
    }
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
      registry_qualified: row.registry_qualified,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const plenary = inventory.researchGaps.find((row) => row.original_token === "PLENARY-37");
  if (!plenary) throw new Error("PLENARY-37 hold is missing");
  let currentPlenaryAf = 0;
  for (const officeId of plenary.office_ids ?? []) {
    if (!officeIds.has(officeId)) throw new Error(`PLENARY-37 office ${officeId} is not in the register`);
    if (officeId.endsWith("-AF")) throw new Error(`PLENARY-37 must not list an assembly office ${officeId}`);
    const afId = officeId.replace(/-(JF|PJF)$/, "-AF");
    const af = inventory.offices.find((row) => row.office_id === afId);
    if (af?.office_status === "current") currentPlenaryAf += 1;
  }
  if (currentPlenaryAf !== 0) {
    throw new Error(`Plenary parishes must not gain a current AF office; found ${currentPlenaryAf}`);
  }

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Classification ${row.office_id} is not in the accepted register`);
    }
    const mapped = mapTier(row);
    const officeType = officeTypeById.get(row.office_id);
    if (officeType && PARISH_TYPES.has(officeType) && mapped !== "other") {
      throw new Error(`PARISH-TIER: ${row.office_id} must stay other, got ${JSON.stringify(mapped)}`);
    }
    if (officeType && MUNICIPAL_TYPES.has(officeType) && mapped !== "municipal") {
      throw new Error(`Municipal office ${row.office_id} must stay municipal, got ${JSON.stringify(mapped)}`);
    }
    if ((officeType === "parliament" || officeType === "national_president") && mapped !== "national_context") {
      throw new Error(`National office ${row.office_id} must stay national_context`);
    }
    if (officeType === "regional_parliament" && mapped !== "regional") {
      throw new Error(`Regional legislature ${row.office_id} must stay regional`);
    }
    if (officeType === "european_parliament_delegation" && mapped !== "other") {
      throw new Error(`EP delegation ${row.office_id} must stay other`);
    }
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
  const eventByHk = new Map<string, PortugalEventRow>();
  const eventIds = new Set<string>();
  let selectedHistories = 0;
  let otherHistories = 0;
  let prospectiveEvents = 0;
  let eventDatesDay = 0;
  let eventDatesYear = 0;
  let listHeadEvents = 0;
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    if (!officeIds.has(row.office_id)) {
      throw new Error(`Event ${row.history_key} office ${row.office_id} is not in the accepted register`);
    }
    if (eventByHk.has(row.history_key)) throw new Error(`Duplicate history_key ${row.history_key}`);
    if (eventIds.has(row.event_id)) throw new Error(`Duplicate event_id ${row.event_id}`);
    eventByHk.set(row.history_key, row);
    eventIds.add(row.event_id);
    const officeType = officeTypeById.get(row.office_id);
    if (officeType && LIST_HEAD_TYPES.has(officeType)) listHeadEvents += 1;
    const date = row.date;
    if (!date?.value) throw new Error(`Event ${row.history_key} is missing a resolved date`);
    const dateIdValue = dateId("event", row.event_id, "election");
    if (date.precision === "year") {
      const year = parseYearLabel(date.value);
      eventDatesYear += 1;
      pushDate({
        date_id: dateIdValue,
        label: date.value,
        precision: "year",
        certainty: date.certainty,
        year,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
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
        certainty: date.certainty,
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(EVENTS_RELATIVE, eventsHash, i, "date"),
          row: date,
        }),
      });
    } else {
      throw new Error(`Unsupported Portugal event precision ${JSON.stringify(date.precision)} on ${row.history_key}`);
    }
    const role = row.selected_history_role ?? "selected";
    if (role === "selected") selectedHistories += 1;
    else if (role === "other") otherHistories += 1;
    else if (role === "none") prospectiveEvents += 1;
    else throw new Error(`Unsupported Portugal selected_history_role ${JSON.stringify(role)} for ${row.history_key}`);
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
      ballot_basis: row.ballot_basis ?? "unknown",
      share_unit: row.share_unit ?? "percent_0_100",
      legal_outcome: row.legal_outcome ?? "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  const proceedings: SqlRow[] = [];
  const proceedingKeys = new Set<string>();
  let presidentialFirstRounds = 0;
  let presidentialRunoffs = 0;
  let proceedingDates = 0;
  const proceedingsHash = sliceHash(inventory, PROCEEDINGS_RELATIVE);
  for (let i = 0; i < inventory.proceedings.length; i++) {
    const row = inventory.proceedings[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Proceeding ${row.proceeding_id} has no authored event ${row.history_key}`);
    }
    if (row.proceeding_type !== "first_round" && row.proceeding_type !== "runoff") {
      throw new Error(`Unsupported Portugal proceeding kind ${JSON.stringify(row.proceeding_type)}`);
    }
    if (row.office_id !== "PT-PR" || row.history_key !== "PT-PR::PR:2026") {
      throw new Error(`Portugal proceedings are the 2026 presidential rounds only; got ${row.proceeding_id}`);
    }
    proceedingKeys.add(`${row.office_id}\0${row.history_key}\0${row.proceeding_id}`);
    if (row.proceeding_type === "first_round") presidentialFirstRounds += 1;
    if (row.proceeding_type === "runoff") presidentialRunoffs += 1;
    const date = row.date;
    let dateClaimId: string | null = null;
    if (date?.value) {
      if (date.precision !== "day") throw new Error(`Proceeding ${row.proceeding_id} date must stay day precision`);
      const parsed = parseDayLabel(date.value);
      dateClaimId = dateId("proceeding", row.proceeding_id, "election");
      proceedingDates += 1;
      pushDate({
        date_id: dateClaimId,
        label: date.value,
        precision: "day",
        certainty: date.certainty,
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        range_start_id: null,
        range_end_id: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i, "date"),
          row: date,
        }),
      });
    }
    const origin = originFor(PROCEEDINGS_RELATIVE, proceedingsHash, i);
    proceedings.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      proceeding_id: row.proceeding_id,
      kind: row.proceeding_type,
      sequence_no: row.sequence_no,
      supersedes_id: null,
      legal_outcome: "certified",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row, supplemental: { date_claim_id: dateClaimId } }),
    });
  }

  const sources: SqlRow[] = [];
  const sourceById = new Set<string>();
  const sourcesHash = sliceHash(inventory, SOURCES_RELATIVE);
  for (let i = 0; i < inventory.sourceCatalogue.length; i++) {
    const row = inventory.sourceCatalogue[i]!;
    if (!row.source_id || !row.input_path) {
      throw new Error(`Portugal source catalogue row ${i} is missing source_id/input_path`);
    }
    if (sourceById.has(row.source_id)) throw new Error(`Duplicate Portugal source_id ${row.source_id}`);
    sourceById.add(row.source_id);
    if (row.sha256 && !/^[0-9a-f]{64}$/.test(row.sha256)) {
      throw new Error(`Portugal source ${row.source_id} sha256 is not 64 hex`);
    }
    const origin = originFor(SOURCES_RELATIVE, sourcesHash, i);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: row.source_id,
      publisher: row.publisher ?? null,
      title: row.title ?? basename(row.input_path),
      url: row.url ?? null,
      checked_as_of_label: row.retrieved_at ?? RESEARCH_SNAPSHOT_LABEL,
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
  const resultIds = new Set<string>();
  const resultsHash = sliceHash(inventory, RESULTS_RELATIVE);
  let listHeadResults = 0;
  let disputedResults = 0;
  let seatsUnknown = 0;
  let seatsZero = 0;
  for (let i = 0; i < inventory.results.length; i++) {
    const row = inventory.results[i]!;
    if (!eventByHk.has(row.history_key)) {
      throw new Error(`Result ${row.result_row_id} has no authored event ${row.history_key}`);
    }
    if (resultIds.has(row.result_row_id)) throw new Error(`Duplicate result_row_id ${row.result_row_id}`);
    resultIds.add(row.result_row_id);
    const officeType = officeTypeById.get(row.office_id);
    if (officeType && LIST_HEAD_TYPES.has(officeType)) listHeadResults += 1;
    if (row.proceeding_id) {
      const key = `${row.office_id}\0${row.history_key}\0${row.proceeding_id}`;
      if (!proceedingKeys.has(key)) {
        throw new Error(`Result ${row.result_row_id} proceeding ${row.proceeding_id} is not authored`);
      }
    }
    const votes = scalarStatus(row.votes, row.votes_status, `votes ${row.result_row_id}`, "votes");
    const share = scalarStatus(row.share, row.share_status, `share ${row.result_row_id}`, "share");
    const seats = scalarStatus(row.seats, row.seats_status, `seats ${row.result_row_id}`, "seats");
    const shareUnit = row.share_unit ?? "percent_0_100";
    if (share.value != null && shareUnit === "percent_0_100" && share.value > 100) {
      throw new Error(`Result ${row.result_row_id} share ${share.value} exceeds 100`);
    }
    if (row.evidence_status === "disputed") disputedResults += 1;
    if (seats.value == null) seatsUnknown += 1;
    if (seats.value === 0) seatsZero += 1;
    const origin = locator({
      input_path: RESULTS_RELATIVE,
      sha256: resultsHash,
      json_pointer: null,
    });
    results.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.history_key,
      result_row_id: row.result_row_id,
      proceeding_id: row.proceeding_id ?? null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: row.source_label ?? null,
      original_party_label: row.party_name_raw ?? null,
      original_party_code: literalPartyCode(row),
      party_namespace: null,
      party_mapping_id: null,
      votes: votes.value,
      votes_status: votes.status,
      share: share.value,
      share_status: share.status,
      share_unit: shareUnit,
      seats: seats.value,
      seats_status: seats.status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: row.evidence_status ?? "recorded",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row,
        supplemental: { decoded_jsonl_line: i + 1 },
      }),
    });
  }

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  const emptyLocator = (extra: SqlRow): SqlRow => ({
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
    ...extra,
  });

  addLocator(
    locators,
    locatorSeen,
    emptyLocator({
      record_key: countryRec,
      entity_kind: "country",
      country_id: COUNTRY_ID,
      source_row_locator: sourceRowLocator({
        inputPath: REGISTER_RELATIVE,
        sha256: registerHash,
        derivedPointer: "/0",
      }),
    }),
  );
  for (const [index, row] of inventory.geographies.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("geography", [COUNTRY_ID, row.geography_id]),
        entity_kind: "geography",
        country_id: COUNTRY_ID,
        geography_id: row.geography_id,
        source_row_locator: sourceRowLocator({
          inputPath: GEOGRAPHY_RELATIVE,
          sha256: sliceHash(inventory, GEOGRAPHY_RELATIVE),
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  const officeRec = new Map<string, string>();
  for (const [index, row] of inventory.offices.entries()) {
    const rec = recordKey("office", [N, row.office_id]);
    officeRec.set(row.office_id, rec);
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: rec,
        entity_kind: "office",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        source_row_locator: sourceRowLocator({
          inputPath: REGISTER_RELATIVE,
          sha256: registerHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.events.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("event", [N, row.office_id, row.history_key]),
        entity_kind: "event",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        source_row_locator: sourceRowLocator({
          inputPath: EVENTS_RELATIVE,
          sha256: eventsHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.proceedings.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
        entity_kind: "proceeding",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        proceeding_id: row.proceeding_id,
        source_row_locator: sourceRowLocator({
          inputPath: PROCEEDINGS_RELATIVE,
          sha256: proceedingsHash,
          derivedPointer: `/${index}`,
        }),
      }),
    );
  }
  for (const [index, row] of inventory.results.entries()) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
        entity_kind: "result_row",
        country_id: COUNTRY_ID,
        id_namespace: N,
        office_id: row.office_id,
        history_key: row.history_key,
        result_row_id: row.result_row_id,
        source_row_locator: sourceRowLocator({
          inputPath: RESULTS_RELATIVE,
          sha256: resultsHash,
          derivedPointer: String(index + 1),
        }),
      }),
    );
  }
  for (const row of sources) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("source", [COUNTRY_ID, L, row.source_id]),
        entity_kind: "source",
        country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: row.source_id,
        source_row_locator: sourceRowLocator({
          inputPath: SOURCES_RELATIVE,
          sha256: sourcesHash,
          locatorText: String(row.locator),
        }),
      }),
    );
  }
  for (const item of inventory.tracked) {
    addLocator(
      locators,
      locatorSeen,
      emptyLocator({
        record_key: recordKey("input", [L, R, item.input_path]),
        entity_kind: "input",
        country_id: null,
        input_path: item.input_path,
        source_row_locator: sourceRowLocator({
          inputPath: item.input_path,
          sha256: item.sha256,
        }),
      }),
    );
  }

  const evidence: SqlRow[] = [];
  const evidenceSeen = new Set<string>();
  const pushEvidence = (args: {
    recordKey: string;
    refs: PortugalEvidenceRef[] | undefined;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }) => {
    for (const ref of args.refs ?? []) {
      if (!ref.source_id || !sourceById.has(ref.source_id)) {
        throw new Error(`Broken evidence source FK for ${ref.input_path} on ${args.recordKey}`);
      }
      const evidenceId = portugalEvidenceId(
        args.recordKey,
        ref.source_id,
        ref.input_path,
        ref.archive_entry ?? null,
        ref.locator ?? null,
        args.claimKind,
      );
      if (evidenceSeen.has(evidenceId)) continue;
      evidenceSeen.add(evidenceId);
      evidence.push({
        evidence_id: evidenceId,
        record_key: args.recordKey,
        source_country_id: COUNTRY_ID,
        source_namespace: SOURCE_NAMESPACE,
        source_id: ref.source_id,
        source_locator: canonical(ref),
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
      refs: row.evidence,
      claimKind: "institutional_mode",
      claim: { geography_id: row.geography_id },
    });
  }
  for (const row of inventory.offices) {
    pushEvidence({
      recordKey: officeRec.get(row.office_id)!,
      refs: row.evidence,
      claimKind: row.office_status === "historical" ? "historical_binding" : "register_identity",
      claim: { office_id: row.office_id, office_status: row.office_status },
    });
  }
  for (const row of inventory.events) {
    pushEvidence({
      recordKey: recordKey("event", [N, row.office_id, row.history_key]),
      refs: row.evidence,
      claimKind: "election_date",
      dateClaimId: dateId("event", row.event_id, "election"),
      claim: { history_key: row.history_key, date: row.date?.value ?? null },
    });
  }
  for (const row of inventory.proceedings) {
    pushEvidence({
      recordKey: recordKey("proceeding", [N, row.office_id, row.history_key, row.proceeding_id]),
      refs: row.evidence,
      claimKind: "election_date",
      dateClaimId: dateId("proceeding", row.proceeding_id, "election"),
      claim: { proceeding_id: row.proceeding_id, date: row.date?.value ?? null },
    });
  }
  for (const row of inventory.results) {
    pushEvidence({
      recordKey: recordKey("result_row", [N, row.office_id, row.history_key, row.result_row_id]),
      refs: row.evidence,
      claimKind: "source_scalar",
      claim: { result_row_id: row.result_row_id },
    });
  }

  const unresolved: SqlRow[] = [];
  const gapsHash = sliceHash(inventory, GAPS_RELATIVE);
  for (let i = 0; i < inventory.researchGaps.length; i++) {
    const row = inventory.researchGaps[i]!;
    const origin = originFor(GAPS_RELATIVE, gapsHash, i);
    const sourceLocator = canonical({
      input_path: GAPS_RELATIVE,
      json_pointer: `/${i}`,
      evidence: row.evidence ?? [],
    });
    unresolved.push({
      unresolved_id: portugalUnresolvedId(countryRec, sourceLocator, row.original_token),
      record_key: countryRec,
      original_token: row.original_token,
      source_locator: sourceLocator,
      reason: row.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }
  const unresolvedHash = sliceHash(inventory, UNRESOLVED_RELATIVE);
  for (let i = 0; i < inventory.unresolvedInputs.length; i++) {
    const row = inventory.unresolvedInputs[i]!;
    const officeKey = row.office_id ? officeRec.get(row.office_id) : undefined;
    if (row.office_id && !officeKey) {
      throw new Error(`Unresolved input ${row.token} office ${row.office_id} is not in the register`);
    }
    const rec = officeKey ?? countryRec;
    const origin = originFor(UNRESOLVED_RELATIVE, unresolvedHash, i);
    const sourceLocator = canonical(row.evidence ?? []);
    unresolved.push({
      unresolved_id: portugalUnresolvedId(rec, sourceLocator, row.token),
      record_key: rec,
      original_token: row.token,
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
    const key = `office\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkSeen.has(key)) {
      throw new Error(`Duplicate Portugal crosswalk ${row.upstream_namespace} ${row.upstream_id}`);
    }
    crosswalkSeen.add(key);
    crosswalks.push({
      entity_kind: "office",
      upstream_namespace: row.upstream_namespace,
      upstream_id: row.upstream_id,
      record_key: officeRec.get(row.target_office_id),
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
    disputed_results: disputedResults,
    seats_unknown: seatsUnknown,
    seats_zero: seatsZero,
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
    unresolved_inputs: inventory.unresolvedInputs.length,
    identity_crosswalks: crosswalks.length,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    event_dates_year_called: eventDatesYear,
    event_dates_day_called: eventDatesDay,
    proceeding_dates: proceedingDates,
    next_dates: nextDates,
    proceedings: proceedings.length,
    presidential_first_rounds: presidentialFirstRounds,
    presidential_runoffs: presidentialRunoffs,
    party_mappings: 0,
    list_head_events: listHeadEvents,
    list_head_results: listHeadResults,
    direct_regional_president_offices: directRegionalPresidents,
    current_plenary_af_offices: currentPlenaryAf,
    named_holds: NAMED_HOLDS.length,
  };

  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[key as keyof typeof validatedCounts] !== expected) {
      throw new Error(`Portugal ${key} count ${validatedCounts[key as keyof typeof validatedCounts]} != ${expected}`);
    }
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Portugal current-register and historic primary-source research; coverage partial. Prompt AD accepted 10666 current + 8168 historical offices with named holds. Parish tiers stay other. Historical rows are unresolved aliases, not proved abolitions. Do not invent a second mayoral ballot, plenary assembly, or regional-government president.",
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
