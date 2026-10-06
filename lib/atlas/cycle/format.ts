import { cycleLabel, placeEvent } from "../derive/cycle";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const BALLOT_LABELS: Record<string, string> = {
  valid_votes: "Valid votes",
  list_votes: "List votes",
  candidate_marks: "Candidate marks",
  electors: "Electors",
  including_blank_invalid: "Including blank and invalid",
};

const KIND_LABELS: Record<string, string> = {
  ordinary: "Ordinary",
  special: "Special",
  repeated: "Repeated",
  indirect: "Indirect",
};

const TIER_RANK: Record<string, number> = {
  national_context: 0,
  regional: 1,
  municipal: 2,
  other: 3,
};

export type CyclePageAssignment =
  | { kind: "day"; isoDate: string }
  | { kind: "year"; year: number }
  | { kind: "undated" };

export type CycleDateToken =
  | { kind: "day"; isoDate: string }
  | { kind: "year"; year: number }
  | { kind: "undated" };

const DAY_TOKEN = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_TOKEN = /^(\d{4})$/;

export function parseCycleDateToken(token: string): CycleDateToken | null {
  if (DAY_TOKEN.test(token)) return { kind: "day", isoDate: token };
  if (token === "undated") return { kind: "undated" };
  const yearMatch = YEAR_TOKEN.exec(token);
  if (!yearMatch) return null;
  const year = Number(yearMatch[1]);
  if (year < 1 || year > 9999) return null;
  return { kind: "year", year };
}

export function dateTokenFor(assignment: CyclePageAssignment): string {
  if (assignment.kind === "day") return assignment.isoDate;
  if (assignment.kind === "year") return String(assignment.year);
  return "undated";
}

/**
 * A resolved day is one page. Month and year precision use that year.
 * A range uses the start year when the source supplies one, otherwise the end year.
 * An event with no year is the undated page. Each event therefore has one page.
 */
export function assignEventPage(args: {
  dateResolution: string;
  precision: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  rangeStartYear: number | null;
  rangeEndYear: number | null;
}): CyclePageAssignment {
  const placed = placeEvent({
    dateResolution: args.dateResolution,
    precision: args.precision,
    year: args.year,
    month: args.month,
    day: args.day,
  });
  if (placed.placed) return { kind: "day", isoDate: placed.isoDate };
  const year = unplacedPageYear({
    precision: args.precision,
    year: placed.year,
    rangeStartYear: args.rangeStartYear,
    rangeEndYear: args.rangeEndYear,
  });
  if (year == null) return { kind: "undated" };
  return { kind: "year", year };
}

export function unplacedPageYear(args: {
  precision: string | null;
  year: number | null;
  rangeStartYear: number | null;
  rangeEndYear: number | null;
}): number | null {
  if (args.year != null) return args.year;
  if (args.precision === "range") {
    if (args.rangeStartYear != null) return args.rangeStartYear;
    if (args.rangeEndYear != null) return args.rangeEndYear;
  }
  return null;
}

/** Reader label for a date that is not a resolved day. */
export function precisionLabel(args: {
  precision: string | null;
  label: string | null;
  year: number | null;
  month: number | null;
  rangeStartLabel: string | null;
  rangeEndLabel: string | null;
}): string {
  if (args.precision === "range") {
    const start = args.rangeStartLabel?.trim();
    const end = args.rangeEndLabel?.trim();
    if (start && end) return `between ${start} and ${end}`;
  }
  if (args.precision === "month" && args.year != null && args.month != null) {
    const name = MONTHS[args.month - 1];
    if (name) return `${name} ${args.year}`;
  }
  if (args.precision === "year" && args.year != null) return String(args.year);
  const label = args.label?.trim();
  if (label) return label;
  if (args.year != null) return String(args.year);
  return "date not supplied";
}

export function unplacedCycleLabel(args: { yearLabel: string; countryName: string; contestCount: number }): string {
  const noun = args.contestCount === 1 ? "contest" : "contests";
  return `${args.yearLabel} · ${args.countryName} · ${args.contestCount} ${noun} without a resolved day`;
}

export function dayCycleLabel(args: {
  isoDate: string;
  countryName: string;
  contestCount: number;
  tiers: string[];
}): string {
  return cycleLabel(args);
}

export function methodChips(args: {
  electoralSystem: string | null;
  ballotBasis: string | null;
  eventKind: string | null;
}): string[] {
  const chips: string[] = [];
  const system = args.electoralSystem?.trim();
  if (system) chips.push(system);
  const basis = args.ballotBasis?.trim();
  if (basis && basis !== "unknown") chips.push(BALLOT_LABELS[basis] ?? basis.replaceAll("_", " "));
  const kind = args.eventKind?.trim();
  if (kind && kind !== "unknown") chips.push(KIND_LABELS[kind] ?? kind.replaceAll("_", " "));
  return chips;
}

export function tierHeading(tier: string | null): string {
  if (tier === "national_context") return "National";
  if (tier === "regional") return "Regional";
  if (tier === "municipal") return "Municipal";
  if (tier === "other") return "Other";
  return "Not supplied";
}

export function compareContests(
  a: { tier: string | null; bodyName: string; officeName: string; eventId: string },
  b: { tier: string | null; bodyName: string; officeName: string; eventId: string },
): number {
  const rank = (TIER_RANK[a.tier ?? ""] ?? 9) - (TIER_RANK[b.tier ?? ""] ?? 9);
  if (rank !== 0) return rank;
  const body = a.bodyName.localeCompare(b.bodyName, "en", { sensitivity: "base" });
  if (body !== 0) return body;
  const name = a.officeName.localeCompare(b.officeName, "en", { sensitivity: "base" });
  if (name !== 0) return name;
  return a.eventId.localeCompare(b.eventId);
}

/**
 * A count is a cycle-level figure only when every contest in view supplies that same number.
 * Differing contest counts are not added together and a missing count is not treated as zero.
 */
export function cycleLevelCounts(
  rows: Array<{ registered: number | null; ballots: number | null }>,
): { registered: number | null; ballots: number | null } {
  return {
    registered: sharedCount(rows.map((row) => row.registered)),
    ballots: sharedCount(rows.map((row) => row.ballots)),
  };
}

function sharedCount(values: Array<number | null>): number | null {
  if (values.length === 0) return null;
  const first = values[0];
  if (first == null) return null;
  for (const value of values) {
    if (value == null || value !== first) return null;
  }
  return first;
}

export function contestHref(
  path: string,
  contestId: string | null,
  q: string,
  extra?: { results?: number; list?: number },
): string {
  const params = new URLSearchParams();
  const query = q.trim();
  if (query) params.set("q", query);
  if (contestId) params.set("contest", contestId);
  if (extra?.list && extra.list > 1) params.set("list", String(extra.list));
  if (extra?.results && extra.results > 1) params.set("results", String(extra.results));
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

export function selectedContestId(eventIds: string[], requested: string): string | null {
  if (eventIds.length === 0) return null;
  if (requested && eventIds.includes(requested)) return requested;
  return eventIds[0] ?? null;
}

export function filterContestText(officeName: string, bodyName: string, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return officeName.toLowerCase().includes(needle) || bodyName.toLowerCase().includes(needle);
}
