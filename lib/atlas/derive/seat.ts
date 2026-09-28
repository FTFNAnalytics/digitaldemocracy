export const SEAT_STATUS_REASONS = [
  "multi_seat",
  "no_elected_flag",
  "withheld",
  "no_history",
  "conflicting_date",
  "superseded",
] as const;

export type SeatStatusReason = (typeof SEAT_STATUS_REASONS)[number];

/** Evidence states that must not be read as a settled holder or a supplied share. */
export const WITHHELD_EVIDENCE = new Set([
  "preliminary",
  "disputed",
  "superseded",
  "structurally_unavailable",
  "not_applicable",
]);

const MULTI_TOKENS = new Set([
  "council",
  "councils",
  "assembly",
  "assemblies",
  "parliament",
  "legislature",
  "congress",
  "senate",
  "chamber",
  "chambers",
  "house",
  "houses",
  "board",
  "boards",
  "delegation",
  "delegations",
  "diet",
]);

const SINGLE_TOKENS = new Set([
  "mayor",
  "president",
  "governor",
  "premier",
  "chancellor",
  "monarch",
  "burgomaster",
  "prefect",
]);

const SINGLE_EXACT = new Set([
  "direct_executive",
  "direct_deputy",
  "prime_minister",
  "head_of_government",
  "head_of_state",
  "national_president",
  "county_president",
  "regional_governor",
  "directly_elected_mayor",
  "borough_mayor",
  "sector_mayor",
  "bucharest_general_mayor",
  "district_mayor",
]);

export function isSingleSeatOfficeType(officeType: string): boolean {
  const normalized = officeType.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return false;
  if (SINGLE_EXACT.has(normalized)) return true;
  const tokens = normalized.split("_").filter((token) => token.length > 0);
  if (tokens.some((token) => MULTI_TOKENS.has(token))) return false;
  return tokens.some((token) => SINGLE_TOKENS.has(token));
}

export type SelectedEventFacts = {
  eventId: string;
  historyKey: string;
  dateId: string | null;
  dateResolution: string;
  precision: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  legalOutcome: string;
  recordState: string;
};

export type ResultFacts = {
  resultRowId: string;
  proceedingId: string | null;
  proceedingOutcome: string | null;
  label: string | null;
  partyLabel: string | null;
  share: number | null;
  shareStatus: string;
  shareUnit: string;
  electedFlag: number | null;
  evidenceStatus: string;
};

export type SeatStatusDraft = {
  currentHolderLabel: string | null;
  currentHolderPartyLabel: string | null;
  currentSinceDateId: string | null;
  lastSelectedEventId: string | null;
  lastShare: number | null;
  lastShareUnit: string | null;
  lastMargin: number | null;
  nextDateId: string | null;
  statusReason: SeatStatusReason | null;
};

function isoDay(event: SelectedEventFacts): string | null {
  if (event.dateResolution !== "resolved") return null;
  if (event.precision !== "day") return null;
  if (event.year == null || event.month == null || event.day == null) return null;
  return `${String(event.year).padStart(4, "0")}-${String(event.month).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`;
}

function blankStatus(
  reason: SeatStatusReason | null,
  eventId: string | null,
  nextDateId: string | null,
  margin: number | null,
): SeatStatusDraft {
  return {
    currentHolderLabel: null,
    currentHolderPartyLabel: null,
    currentSinceDateId: null,
    lastSelectedEventId: eventId,
    lastShare: null,
    lastShareUnit: null,
    lastMargin: margin,
    nextDateId,
    statusReason: reason,
  };
}

export function pickLatestSelectedEvent(
  events: SelectedEventFacts[],
): { kind: "none" } | { kind: "conflict" } | { kind: "one"; event: SelectedEventFacts } {
  if (events.length === 0) return { kind: "none" };
  if (events.length === 1) {
    if (events[0]!.dateResolution === "conflicting") return { kind: "conflict" };
    return { kind: "one", event: events[0]! };
  }
  const days = events.map(isoDay);
  if (days.some((day) => day == null)) return { kind: "conflict" };
  const latest = [...days].sort()[days.length - 1]!;
  const tops = events.filter((event) => isoDay(event) === latest);
  if (tops.length !== 1) return { kind: "conflict" };
  return { kind: "one", event: tops[0]! };
}

function suppliedShare(row: ResultFacts): boolean {
  if (row.share == null) return false;
  if (row.shareStatus !== "recorded" && row.shareStatus !== "zero") return false;
  if (WITHHELD_EVIDENCE.has(row.evidenceStatus)) return false;
  if (row.proceedingOutcome === "superseded" || row.proceedingOutcome === "annulled") return false;
  return true;
}

/** Margin only when the top two supplied shares share a unit and a proceeding. */
export function marginFromResults(rows: ResultFacts[]): number | null {
  const groups = new Map<string, ResultFacts[]>();
  for (const row of rows) {
    if (!suppliedShare(row)) continue;
    const key = row.proceedingId ?? "";
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const qualifying: number[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ranked = [...group].sort(
      (a, b) => (b.share ?? 0) - (a.share ?? 0) || a.resultRowId.localeCompare(b.resultRowId),
    );
    const top = ranked[0]!;
    const second = ranked[1]!;
    if (top.share == null || second.share == null) continue;
    if (top.shareUnit !== second.shareUnit) continue;
    qualifying.push(top.share - second.share);
  }
  if (qualifying.length !== 1) return null;
  return qualifying[0]!;
}

function eventIsSuperseded(event: SelectedEventFacts): boolean {
  return (
    event.legalOutcome === "superseded" ||
    event.legalOutcome === "annulled" ||
    event.recordState === "superseded" ||
    event.recordState === "withdrawn"
  );
}

export function deriveSeatStatus(args: {
  officeType: string;
  nextDateId: string | null;
  nextDateResolution: string;
  selectedEvents: SelectedEventFacts[];
  results: ResultFacts[];
}): SeatStatusDraft {
  const nextDateId = args.nextDateResolution === "resolved" ? args.nextDateId : null;
  const latest = pickLatestSelectedEvent(args.selectedEvents);
  if (latest.kind === "none") return blankStatus("no_history", null, nextDateId, null);
  if (latest.kind === "conflict") return blankStatus("conflicting_date", null, nextDateId, null);

  const event = latest.event;
  const margin = marginFromResults(args.results);
  if (eventIsSuperseded(event)) return blankStatus("superseded", event.eventId, nextDateId, margin);
  if (!isSingleSeatOfficeType(args.officeType)) {
    return blankStatus("multi_seat", event.eventId, nextDateId, margin);
  }

  const elected = args.results.filter((row) => row.electedFlag === 1);
  if (elected.length === 1 && WITHHELD_EVIDENCE.has(elected[0]!.evidenceStatus)) {
    return blankStatus("withheld", event.eventId, nextDateId, margin);
  }
  if (elected.length !== 1) return blankStatus("no_elected_flag", event.eventId, nextDateId, margin);

  const winner = elected[0]!;
  const shareSupplied = suppliedShare(winner);
  return {
    currentHolderLabel: winner.label,
    currentHolderPartyLabel: winner.partyLabel,
    currentSinceDateId: event.dateId,
    lastSelectedEventId: event.eventId,
    lastShare: shareSupplied ? winner.share : null,
    lastShareUnit: shareSupplied ? winner.shareUnit : null,
    lastMargin: margin,
    nextDateId,
    statusReason: null,
  };
}
