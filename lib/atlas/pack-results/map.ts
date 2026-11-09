import { canonical, sha256Hex } from "../identity";

/**
 * Map one research-pack JSON object onto the Atlas master columns.
 *
 * Office, event, reporting-unit, and geography links that are not in the
 * published database or the pack are rejected. Vote, seat, and share numbers
 * are copied only when the pack already stores them. Enum columns that the
 * pack does not speak (`local`, `completed`, `reported`) stay `unknown` or the
 * schema's name for a supplied number (`recorded` / `zero`). The original
 * object is kept on raw_json. Nothing is inferred from a label, a share, or a
 * neighbouring row.
 */

const EVENT_KINDS = new Set(["ordinary", "special", "repeated", "indirect", "unknown"]);
const BALLOT_BASES = new Set([
  "valid_votes",
  "list_votes",
  "candidate_marks",
  "electors",
  "including_blank_invalid",
  "unknown",
]);
const LEGAL_OUTCOMES = new Set([
  "unknown",
  "not_held",
  "certified",
  "annulled",
  "preliminary",
  "disputed",
  "superseded",
]);
const HISTORY_ROLES = new Set(["selected", "other", "none"]);
const CERTAINTIES = new Set(["called", "statutory", "expected", "conditional", "unknown"]);
const EVIDENCE = new Set([
  "recorded",
  "zero",
  "unknown",
  "not_applicable",
  "structurally_unavailable",
  "preliminary",
  "disputed",
  "superseded",
]);
const NULL_SCALAR = new Set(["unknown", "not_applicable", "structurally_unavailable", "not_supplied", "missing"]);
const NON_CANDIDATE_KINDS = new Set(["metric", "council_capacity", "published_capacity", "turnout"]);

export type RejectReason = { reason: string };

export type ShareConvention = "explicit" | "proportion_0_1";

export type MappedDate = {
  dateId: string | null;
  label: string;
  precision: "day" | "month" | "year" | "unknown";
  certainty: string;
  resolution: "resolved" | "unknown" | "conflicting";
  year: number | null;
  month: number | null;
  day: number | null;
};

export type MappedEvent = {
  eventId: string;
  officeId: string;
  historyKey: string;
  date: MappedDate;
  eventKind: string;
  ballotBasis: string;
  legalOutcome: string;
  selectedHistoryRole: string;
  electoralSystem: string | null;
  comparability: string | null;
  shareUnit: string;
  stateNote: string | null;
  source: Record<string, unknown>;
};

export type MappedResult = {
  resultId: string;
  eventId: string;
  officeId: string;
  historyKey: string;
  label: string | null;
  partyLabel: string | null;
  partyCode: string | null;
  partyNamespace: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  shareUnit: string;
  seats: number | null;
  seatsStatus: string;
  electedFlag: number | null;
  isSubstitute: number | null;
  evidenceStatus: string;
  source: Record<string, unknown>;
};

export type PublishedContext = {
  offices: Set<string>;
  geographies: Set<string>;
  /** reporting-unit id -> event id. Null when the pack has no units file. */
  units: Map<string, string> | null;
  /** Ticket-component ids from ticket_components.json. Null when that file is absent. */
  ticketComponents: Set<string> | null;
  events: Map<string, { officeId: string; historyKey: string }>;
  shareConvention: ShareConvention;
};

export function packDateId(namespace: string, eventId: string): string {
  return `date-${sha256Hex(canonical([namespace, "pack-results", eventId, "poll"]))}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function parsePackObject(line: string): Record<string, unknown> | RejectReason {
  try {
    const value: unknown = JSON.parse(line);
    if (!isRecord(value)) return { reason: "row_not_object" };
    return value;
  } catch {
    return { reason: "invalid_json" };
  }
}

function forbiddenId(value: string): boolean {
  const upper = value.toUpperCase();
  return upper.startsWith("FIX-") || upper.startsWith("FXT-");
}

function text(row: Record<string, unknown>, key: string): string | null | RejectReason {
  if (!Object.prototype.hasOwnProperty.call(row, key)) return null;
  const value = row[key];
  if (value == null) return null;
  if (typeof value !== "string") return { reason: `${key}_not_a_string` };
  return value;
}

function requiredId(row: Record<string, unknown>, keys: string[]): string | RejectReason {
  const found: string[] = [];
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
    const value = text(row, key);
    if (typeof value === "object" && value && "reason" in value) return value;
    if (typeof value !== "string" || !value.trim()) return { reason: `missing_${key}` };
    found.push(value.trim());
  }
  if (found.length === 0) return { reason: `missing_${keys[0] ?? "id"}` };
  if (new Set(found).size > 1) return { reason: `${keys[0] ?? "id"}_disagrees` };
  if (forbiddenId(found[0]!)) return { reason: `${keys[0] ?? "id"}_forbidden` };
  return found[0]!;
}

function firstPresent(row: Record<string, unknown>, keys: string[]): string | null | RejectReason {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
    return text(row, key);
  }
  return null;
}

function enumOrUnknown(value: unknown, allowed: Set<string>): string {
  return typeof value === "string" && allowed.has(value) ? value : "unknown";
}

function optionalString(value: string | null | RejectReason): string | null | RejectReason {
  if (typeof value === "object" && value && "reason" in value) return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isLeap(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function isRealDay(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || year < 1 || year > 9999) return false;
  const february = isLeap(year) ? 29 : 28;
  const dim = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= dim[month - 1]!;
}

function conflictingSourceDates(row: Record<string, unknown>): boolean {
  const dates = row.source_dates;
  if (!Array.isArray(dates) || dates.length < 2) return false;
  const distinct = new Set(
    dates.flatMap((value) => (typeof value === "string" && value.trim() ? [value.trim()] : [])),
  );
  return distinct.size > 1;
}

function mapDate(namespace: string, eventId: string, row: Record<string, unknown>): MappedDate | RejectReason {
  const precisionRaw = row.date_precision ?? row.precision;
  const precision = typeof precisionRaw === "string" ? precisionRaw : null;
  const poll = Object.prototype.hasOwnProperty.call(row, "poll_date") ? text(row, "poll_date") : null;
  const date = Object.prototype.hasOwnProperty.call(row, "date") ? text(row, "date") : null;
  if (typeof poll === "object" && poll && "reason" in poll) return poll;
  if (typeof date === "object" && date && "reason" in date) return date;
  if (typeof poll === "string" && typeof date === "string" && poll !== date) {
    return { reason: "poll_date_disagrees_with_date" };
  }
  const raw = typeof poll === "string" ? poll : typeof date === "string" ? date : null;
  const yearField = row.year ?? row.election_year;
  const explicitYear = typeof yearField === "number" && Number.isInteger(yearField) ? yearField : null;
  if (yearField != null && explicitYear == null) return { reason: "year_not_an_integer" };
  if (explicitYear != null && raw != null && /^\d{4}/.test(raw) && Number(raw.slice(0, 4)) !== explicitYear) {
    return { reason: "election_year_disagrees_with_date" };
  }
  if (raw == null && conflictingSourceDates(row) && precision !== "year" && precision !== "unknown") {
    return {
      dateId: null,
      label: "conflicting",
      precision: "unknown",
      certainty: "unknown",
      resolution: "conflicting",
      year: null,
      month: null,
      day: null,
    };
  }

  const certainty = enumOrUnknown(row.date_certainty ?? row.certainty, CERTAINTIES);
  const dateId = packDateId(namespace, eventId);

  if (precision === "day" || (precision == null && raw != null && /^\d{4}-\d{2}-\d{2}$/.test(raw))) {
    if (raw == null || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { reason: "day_precision_without_iso_date" };
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(5, 7));
    const day = Number(raw.slice(8, 10));
    if (!isRealDay(year, month, day)) return { reason: "impossible_calendar_day" };
    return {
      dateId,
      label: raw,
      precision: "day",
      certainty,
      resolution: "resolved",
      year,
      month,
      day,
    };
  }

  if (precision === "year") {
    let year = explicitYear;
    if (year == null && raw != null && /^\d{4}$/.test(raw)) year = Number(raw);
    if (year == null && typeof row.cycle_label === "string" && /^\d{4}$/.test(row.cycle_label)) {
      year = Number(row.cycle_label);
    }
    if (year == null || year < 1 || year > 9999) return { reason: "year_precision_without_explicit_year" };
    return {
      dateId,
      label: String(year),
      precision: "year",
      certainty,
      resolution: "resolved",
      year,
      month: null,
      day: null,
    };
  }

  if (precision === "month") {
    const monthField = row.month;
    const month = typeof monthField === "number" && Number.isInteger(monthField) ? monthField : null;
    let year = explicitYear;
    if (raw != null && /^(\d{4})-(\d{2})$/.test(raw)) {
      year = year ?? Number(raw.slice(0, 4));
      if (month == null) {
        const fromRaw = Number(raw.slice(5, 7));
        if (fromRaw >= 1 && fromRaw <= 12 && year != null && year >= 1 && year <= 9999) {
          return {
            dateId,
            label: raw,
            precision: "month",
            certainty,
            resolution: "resolved",
            year,
            month: fromRaw,
            day: null,
          };
        }
      }
    }
    if (year == null || month == null || month < 1 || month > 12 || year < 1 || year > 9999) {
      return { reason: "month_precision_without_explicit_month" };
    }
    return {
      dateId,
      label: `${year}-${String(month).padStart(2, "0")}`,
      precision: "month",
      certainty,
      resolution: "resolved",
      year,
      month,
      day: null,
    };
  }

  if (raw == null && precision == null && explicitYear != null) {
    return {
      dateId,
      label: String(explicitYear),
      precision: "year",
      certainty,
      resolution: "resolved",
      year: explicitYear,
      month: null,
      day: null,
    };
  }

  if (precision === "unknown") {
    return {
      dateId,
      label: "unknown",
      precision: "unknown",
      certainty: "unknown",
      resolution: "unknown",
      year: null,
      month: null,
      day: null,
    };
  }

  return { reason: "date_precision_absent" };
}

const INCOMPLETE_VOTE_TOKENS = new Set([
  "",
  "-",
  "—",
  "--",
  "n/a",
  "na",
  "nd",
  "s/d",
  "s.d.",
  "incomplete",
  "not supplied",
  "not_supplied",
  "missing",
]);

/** True when the pack says the vote cell is incomplete. A real zero has no such mark. */
export function votesAreIncomplete(row: Record<string, unknown>): boolean {
  if (row.votes_incomplete === true || row.incomplete_votes === true || row.votes_complete === false) return true;
  const missing = row.missing_vote_components ?? row.incomplete_vote_components;
  if (typeof missing === "number" && missing > 0) return true;
  if (typeof missing === "string" && missing.trim() !== "" && missing.trim() !== "0") return true;
  if (typeof row.votes === "string" && INCOMPLETE_VOTE_TOKENS.has(row.votes.trim().toLowerCase())) return true;
  const status = row.votes_status ?? row.vote_status;
  if (typeof status === "string" && (status === "incomplete" || status === "partial")) {
    return row.votes == null || row.votes === "" || row.votes === 0;
  }
  return false;
}

function mapShareUnit(
  raw: unknown,
  share: number | null,
  convention: ShareConvention,
): string | RejectReason {
  if (raw == null || raw === "") {
    if (share == null) return convention === "proportion_0_1" ? "proportion_0_1" : "percent_0_100";
    if (convention === "proportion_0_1") {
      if (share > 1) return { reason: "share_above_1" };
      return "proportion_0_1";
    }
    return { reason: "share_without_explicit_unit" };
  }
  if (raw === "percent_0_100" || raw === "percent" || raw === "percentage") return "percent_0_100";
  if (raw === "proportion_0_1" || raw === "proportion") return "proportion_0_1";
  return { reason: "share_unit_unmapped" };
}

function mapScalar(
  value: unknown,
  status: unknown,
  name: "votes" | "seats" | "share",
): { value: number | null; status: string } | RejectReason {
  if (value != null) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return { reason: `${name}_not_a_nonnegative_number` };
    }
    if (name !== "share" && !Number.isInteger(value)) return { reason: `${name}_not_an_integer` };
  }
  const rawStatus = status == null || status === "" ? null : status;
  if (typeof rawStatus === "string" || rawStatus == null) {
    if (value == null) {
      if (rawStatus == null || NULL_SCALAR.has(rawStatus)) {
        if (rawStatus === "not_applicable" || rawStatus === "structurally_unavailable") {
          return { value: null, status: rawStatus };
        }
        return { value: null, status: "unknown" };
      }
      return { reason: `${name}_status_contradicts_null` };
    }
    if (rawStatus == null || rawStatus === "reported" || rawStatus === "recorded") {
      return { value, status: value === 0 ? "zero" : "recorded" };
    }
    if (rawStatus === "zero") {
      if (value !== 0) return { reason: `${name}_status_zero_but_nonzero` };
      return { value: 0, status: "zero" };
    }
    if (rawStatus === "preliminary" || rawStatus === "disputed" || rawStatus === "superseded") {
      return { value, status: rawStatus };
    }
    return { reason: `${name}_status_unmapped` };
  }
  return { reason: `${name}_status_not_a_string` };
}

function mapFlag(row: Record<string, unknown>, keys: string[], reason: string): number | null | RejectReason {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
    const value = row[key];
    if (value == null || value === "") return null;
    if (value === true || value === 1) return 1;
    if (value === false || value === 0) return 0;
    return { reason };
  }
  return null;
}

function placeId(row: Record<string, unknown>): string | null | RejectReason {
  const geography = Object.prototype.hasOwnProperty.call(row, "geography_id") ? text(row, "geography_id") : null;
  const place = Object.prototype.hasOwnProperty.call(row, "place_id") ? text(row, "place_id") : null;
  if (typeof geography === "object" && geography && "reason" in geography) return geography;
  if (typeof place === "object" && place && "reason" in place) return place;
  const left = typeof geography === "string" && geography.trim() ? geography.trim() : null;
  const right = typeof place === "string" && place.trim() ? place.trim() : null;
  if (left && right && left !== right) return { reason: "place_ids_disagree" };
  return left ?? right;
}

export function mapPackEvent(
  namespace: string,
  row: Record<string, unknown>,
  offices: Set<string>,
  geographies: Set<string>,
  shareConvention: ShareConvention = "explicit",
): MappedEvent | RejectReason {
  const eventId = requiredId(row, ["event_id"]);
  if (typeof eventId !== "string") return eventId;
  if (Object.prototype.hasOwnProperty.call(row, "office_id") && (row.office_id == null || row.office_id === "")) {
    return { reason: "office_not_in_register" };
  }
  const officeId = requiredId(row, ["office_id"]);
  if (typeof officeId !== "string") return officeId;
  if (!offices.has(officeId)) return { reason: "office_not_published" };
  const place = placeId(row);
  if (typeof place === "object" && place && "reason" in place) return place;
  if (typeof place === "string" && !geographies.has(place)) return { reason: "place_not_published" };

  const historyValue = Object.prototype.hasOwnProperty.call(row, "history_key") ? text(row, "history_key") : null;
  if (typeof historyValue === "object" && historyValue && "reason" in historyValue) return historyValue;
  const historyKey = typeof historyValue === "string" && historyValue.trim() ? historyValue.trim() : eventId;
  if (!historyKey || forbiddenId(historyKey)) return { reason: "missing_history_key" };

  const date = mapDate(namespace, eventId, row);
  if ("reason" in date) return date;

  const shareUnit = mapShareUnit(row.share_unit, null, shareConvention);
  if (typeof shareUnit !== "string") return shareUnit;

  const electoral = optionalString(firstPresent(row, ["electoral_system"]));
  if (typeof electoral === "object" && electoral && "reason" in electoral) return electoral;
  const comparability = optionalString(firstPresent(row, ["comparability"]));
  if (typeof comparability === "object" && comparability && "reason" in comparability) return comparability;

  const eventKind = enumOrUnknown(row.event_kind, EVENT_KINDS);
  const notes: string[] = [];
  if (typeof row.event_kind === "string" && row.event_kind && row.event_kind !== eventKind) {
    notes.push(`pack_event_kind=${row.event_kind}`);
  }
  const explicitNote = optionalString(firstPresent(row, ["state_note", "notes"]));
  if (typeof explicitNote === "object" && explicitNote && "reason" in explicitNote) return explicitNote;
  if (typeof explicitNote === "string") notes.push(explicitNote);

  const roleRaw = row.selected_history_role;
  const selectedHistoryRole =
    typeof roleRaw === "string" && HISTORY_ROLES.has(roleRaw) ? roleRaw : roleRaw == null || roleRaw === "" ? "none" : "other";

  return {
    eventId,
    officeId,
    historyKey,
    date,
    eventKind,
    ballotBasis: enumOrUnknown(row.ballot_basis, BALLOT_BASES),
    legalOutcome: enumOrUnknown(row.legal_outcome ?? row.result_status, LEGAL_OUTCOMES),
    selectedHistoryRole,
    electoralSystem: typeof electoral === "string" ? electoral : null,
    comparability: typeof comparability === "string" ? comparability : null,
    shareUnit,
    stateNote: notes.length ? notes.join(" | ") : null,
    source: row,
  };
}

export function mapPackResult(
  row: Record<string, unknown>,
  context: PublishedContext,
): MappedResult | RejectReason {
  const resultId = requiredId(row, ["result_row_id", "result_id"]);
  if (typeof resultId !== "string") return resultId;
  const eventId = requiredId(row, ["event_id"]);
  if (typeof eventId !== "string") return eventId;
  const event = context.events.get(eventId);
  if (!event) return { reason: "event_not_in_pack" };

  const officeValue = Object.prototype.hasOwnProperty.call(row, "office_id") ? text(row, "office_id") : null;
  if (typeof officeValue === "object" && officeValue && "reason" in officeValue) return officeValue;
  if (typeof officeValue === "string" && officeValue.trim() && officeValue.trim() !== event.officeId) {
    return { reason: "result_office_mismatch" };
  }
  if (!context.offices.has(event.officeId)) return { reason: "office_not_published" };

  const place = placeId(row);
  if (typeof place === "object" && place && "reason" in place) return place;
  if (typeof place === "string" && !context.geographies.has(place)) return { reason: "place_not_published" };

  if (context.ticketComponents) {
    const component = firstPresent(row, ["ticket_component_id", "component_id"]);
    if (typeof component === "object" && component && "reason" in component) return component;
    if (typeof component === "string" && component.trim() && !context.ticketComponents.has(component.trim())) {
      return { reason: "ticket_component_unknown" };
    }
  }

  if (context.units) {
    const unitA = Object.prototype.hasOwnProperty.call(row, "reporting_unit_id") ? text(row, "reporting_unit_id") : null;
    const unitB = Object.prototype.hasOwnProperty.call(row, "unit_id") ? text(row, "unit_id") : null;
    if (typeof unitA === "object" && unitA && "reason" in unitA) return unitA;
    if (typeof unitB === "object" && unitB && "reason" in unitB) return unitB;
    const left = typeof unitA === "string" && unitA.trim() ? unitA.trim() : null;
    const right = typeof unitB === "string" && unitB.trim() ? unitB.trim() : null;
    if (left && right && left !== right) return { reason: "reporting_unit_ambiguous" };
    const unit = left ?? right;
    if (unit) {
      const owner = context.units.get(unit);
      if (!owner) return { reason: "reporting_unit_unknown" };
      if (owner !== eventId) return { reason: "reporting_unit_event_mismatch" };
    }
  }

  let votes: { value: number | null; status: string } | RejectReason;
  if (votesAreIncomplete(row)) {
    if (typeof row.votes === "number" && row.votes > 0) return { reason: "incomplete_vote_has_number" };
    votes = { value: null, status: "unknown" };
  } else {
    votes = mapScalar(row.votes, row.votes_status ?? row.vote_status, "votes");
  }
  if ("reason" in votes) return votes;
  const seats = mapScalar(row.seats, row.seats_status, "seats");
  if ("reason" in seats) return seats;
  const shareSource = Object.prototype.hasOwnProperty.call(row, "share")
    ? row.share
    : Object.prototype.hasOwnProperty.call(row, "published_percent")
      ? row.published_percent
      : Object.prototype.hasOwnProperty.call(row, "vote_percentage_source")
        ? row.vote_percentage_source
        : Object.prototype.hasOwnProperty.call(row, "percent_raw")
          ? row.percent_raw
          : null;
  const shareStatusSource = Object.prototype.hasOwnProperty.call(row, "share_status") ? row.share_status : null;
  const share = mapScalar(shareSource, shareStatusSource, "share");
  if ("reason" in share) return share;
  const shareUnit = mapShareUnit(row.share_unit, share.value, context.shareConvention);
  if (typeof shareUnit !== "string") return shareUnit;
  if (share.value != null && shareUnit === "percent_0_100" && share.value > 100) return { reason: "share_above_100" };
  if (share.value != null && shareUnit === "proportion_0_1" && share.value > 1) return { reason: "share_above_1" };

  const kind = typeof row.result_kind === "string" ? row.result_kind : "";
  const labelValue = firstPresent(row, ["contestant_label", "candidate_or_label", "candidate_or_list_label", "label"]);
  if (typeof labelValue === "object" && labelValue && "reason" in labelValue) return labelValue;
  const label =
    NON_CANDIDATE_KINDS.has(kind) || typeof labelValue !== "string" || !labelValue.trim() ? null : labelValue;

  const partyLabel = optionalString(firstPresent(row, ["party_label", "original_party_label"]));
  if (typeof partyLabel === "object" && partyLabel && "reason" in partyLabel) return partyLabel;
  const partyCode = optionalString(firstPresent(row, ["original_party_code", "political_nuance", "party_code"]));
  if (typeof partyCode === "object" && partyCode && "reason" in partyCode) return partyCode;
  const partyNamespace = optionalString(firstPresent(row, ["party_namespace"]));
  if (typeof partyNamespace === "object" && partyNamespace && "reason" in partyNamespace) return partyNamespace;

  const electedFlag = mapFlag(row, ["elected_flag", "elected"], "elected_flag_not_explicit");
  if (typeof electedFlag === "object" && electedFlag && "reason" in electedFlag) return electedFlag;
  const isSubstitute = mapFlag(row, ["is_substitute"], "is_substitute_not_explicit");
  if (typeof isSubstitute === "object" && isSubstitute && "reason" in isSubstitute) return isSubstitute;

  return {
    resultId,
    eventId,
    officeId: event.officeId,
    historyKey: event.historyKey,
    label,
    partyLabel: typeof partyLabel === "string" ? partyLabel : null,
    partyCode: typeof partyCode === "string" ? partyCode : null,
    partyNamespace: typeof partyNamespace === "string" ? partyNamespace : null,
    votes: votes.value,
    votesStatus: votes.status,
    share: share.value,
    shareStatus: share.status,
    shareUnit,
    seats: seats.value,
    seatsStatus: seats.status,
    electedFlag,
    isSubstitute,
    evidenceStatus: enumOrUnknown(row.evidence_status, EVIDENCE),
    source: row,
  };
}
