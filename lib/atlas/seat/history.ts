import { marginFromResults, pickLatestSelectedEvent, WITHHELD_EVIDENCE, type ResultFacts, type SelectedEventFacts } from "../derive/seat";

export const NOT_SUPPLIED = "not supplied";

const PROCEEDING_LABELS: Record<string, string> = {
  first_round: "First round",
  runoff: "Runoff",
  repeat: "Repeat",
  recount: "Recount",
  annulment: "Annulment",
  certification: "Certification",
};

const REGISTERED_KEYS = ["registered_voters", "registeredVoters"] as const;
const BALLOT_KEYS = ["ballots_cast", "ballotsCast", "votes_cast"] as const;

export type SeatCycleResult = {
  resultRowId: string;
  proceedingId: string | null;
  label: string | null;
  partyLabel: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  shareUnit: string;
  electedFlag: number | null;
  evidenceStatus: string;
};

export type SeatCycleProceeding = {
  proceedingId: string;
  kind: string;
  sequenceNo: number | null;
  legalOutcome: string;
};

export type SeatCycleEvent = {
  eventId: string;
  historyKey: string;
  selectedHistoryRole: string;
  legalOutcome: string;
  recordState: string;
  electoralSystem: string | null;
  dateResolution: string;
  precision: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  dateId: string | null;
  dateLabel: string | null;
  rawJson: string | null;
  shareUnit: string;
  results: SeatCycleResult[];
  proceedings: SeatCycleProceeding[];
};

export type ProceedingResultDisplay = {
  id: string;
  label: string;
  party: string;
  votes: string;
  share: string;
  struck: boolean;
};

export type ProceedingDisplay = {
  id: string;
  kindLabel: string;
  legalOutcomeLabel: string;
  superseded: boolean;
  results: ProceedingResultDisplay[];
};

export type HistoryDisplayRow = {
  eventId: string;
  historyKey: string;
  cycle: string;
  winner: string;
  party: string;
  votes: string;
  share: string;
  margin: string;
  turnout: string;
  /** Winner share used by the chart. Null when no single winner share was supplied. */
  winnerShare: number | null;
  winnerShareUnit: string | null;
  proceedings: ProceedingDisplay[];
};

export type TimelineEntry = {
  kind: "holder" | "gap";
  eventId: string;
  cycle: string;
  holder: string | null;
  party: string | null;
};

export function readerStatus(status: string | null | undefined): string {
  if (!status || status === "unknown" || status === "structurally_unavailable" || status === "not_applicable") {
    return NOT_SUPPLIED;
  }
  const words = status.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function readerNumber(value: number | null | undefined, status?: string | null): string {
  if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString("en-US");
  return readerStatus(status);
}

export function readerShare(share: number | null, status: string, unit?: string | null): string {
  if (share == null || !Number.isFinite(share)) return readerStatus(status);
  if (unit === "percent_0_100") return `${share}%`;
  if (unit === "proportion_0_1") return `${share} proportion`;
  return String(share);
}

export function readerMargin(margin: number | null, unit: string | null): string {
  if (margin == null || !Number.isFinite(margin)) return NOT_SUPPLIED;
  if (unit === "percent_0_100") return `${margin}%`;
  if (unit === "proportion_0_1") return `${margin} proportion`;
  return String(margin);
}

export function readerTurnout(percent: number | null): string {
  if (percent == null || !Number.isFinite(percent)) return NOT_SUPPLIED;
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded}%`;
}

/** Turnout only when both counts are supplied on the same object and the ratio is in range. */
export function turnoutPercent(registered: number, ballots: number): number | null {
  if (!Number.isFinite(registered) || !Number.isFinite(ballots)) return null;
  if (registered <= 0 || ballots < 0 || ballots > registered) return null;
  return (ballots / registered) * 100;
}

function finiteCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pairFromObject(value: unknown): { registered: number; ballots: number } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  let registered: number | null = null;
  for (const key of REGISTERED_KEYS) {
    const count = finiteCount(record[key]);
    if (count != null) {
      registered = count;
      break;
    }
  }
  let ballots: number | null = null;
  for (const key of BALLOT_KEYS) {
    const count = finiteCount(record[key]);
    if (count != null) {
      ballots = count;
      break;
    }
  }
  if (registered == null || ballots == null) return null;
  return { registered, ballots };
}

export function turnoutFromEventRaw(rawJson: string | null): number | null {
  if (!rawJson) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const row = (parsed as { row?: unknown }).row;
  const objects: unknown[] = [row];
  if (row && typeof row === "object" && !Array.isArray(row)) {
    const extensions = (row as { extensions?: unknown }).extensions;
    objects.push(extensions);
    if (extensions && typeof extensions === "object" && !Array.isArray(extensions)) {
      objects.push((extensions as { raw?: unknown }).raw);
    }
  }
  for (const object of objects) {
    const pair = pairFromObject(object);
    if (!pair) continue;
    return turnoutPercent(pair.registered, pair.ballots);
  }
  return null;
}

export function termYearsFromOfficeRaw(rawJson: string | null): number | null {
  if (!rawJson) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const value = (parsed as { row?: { term_years?: unknown } }).row?.term_years;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function holderPhrase(args: {
  holder: string | null;
  since: string | null;
  statusReason: string | null;
  officeType: string;
}): string {
  if (args.holder) {
    return `Held by ${args.holder} since ${args.since ?? NOT_SUPPLIED}`;
  }
  if (args.statusReason === "multi_seat") {
    if (args.officeType.toLowerCase().includes("council")) {
      return "Council seat: results list a slate, not a single holder";
    }
    return "Results list a slate, not a single holder";
  }
  if (args.statusReason === "withheld") return "The latest result is withheld, so no holder is shown";
  if (args.statusReason === "conflicting_date") return "The latest election dates conflict, so no holder is shown";
  if (args.statusReason === "no_history") return "No completed election is on file for this seat";
  if (args.statusReason === "no_elected_flag") return "No single holder is marked on the latest result";
  if (args.statusReason === "superseded") return "The latest result was superseded, so no holder is shown";
  return "No holder is on file";
}

export function kindChip(tierLabel: string | null, officeType: string): string {
  const kind = officeType.replaceAll("_", " ");
  const kindWords = kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : NOT_SUPPLIED;
  const tier = tierLabel && tierLabel !== "unknown" ? tierLabel.charAt(0).toUpperCase() + tierLabel.slice(1) : null;
  return tier ? `${tier} · ${kindWords}` : kindWords;
}

export function proceedingKindLabel(kind: string): string {
  return PROCEEDING_LABELS[kind] ?? readerStatus(kind);
}

function isoDay(event: SeatCycleEvent): string | null {
  if (event.dateResolution !== "resolved") return null;
  if (event.precision !== "day") return null;
  if (event.year == null || event.month == null || event.day == null) return null;
  return `${String(event.year).padStart(4, "0")}-${String(event.month).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`;
}

export function cycleLabelFor(event: SeatCycleEvent): string {
  const label = event.dateLabel?.trim();
  if (label) return label;
  const iso = isoDay(event);
  if (iso) return iso;
  if (event.year != null) return String(event.year);
  return NOT_SUPPLIED;
}

function toSelected(event: SeatCycleEvent): SelectedEventFacts {
  return {
    eventId: event.eventId,
    historyKey: event.historyKey,
    dateId: event.dateId,
    dateResolution: event.dateResolution,
    precision: event.precision,
    year: event.year,
    month: event.month,
    day: event.day,
    legalOutcome: event.legalOutcome,
    recordState: event.recordState,
  };
}

function proceedingOutcome(event: SeatCycleEvent, proceedingId: string | null): string | null {
  if (!proceedingId) return null;
  return event.proceedings.find((row) => row.proceedingId === proceedingId)?.legalOutcome ?? null;
}

function resultFacts(event: SeatCycleEvent): ResultFacts[] {
  return event.results.map((row) => ({
    resultRowId: row.resultRowId,
    proceedingId: row.proceedingId,
    proceedingOutcome: proceedingOutcome(event, row.proceedingId),
    label: row.label,
    partyLabel: row.partyLabel,
    share: row.share,
    shareStatus: row.shareStatus,
    shareUnit: row.shareUnit,
    electedFlag: row.electedFlag,
    evidenceStatus: row.evidenceStatus,
  }));
}

function standingResult(event: SeatCycleEvent, row: SeatCycleResult): boolean {
  if (WITHHELD_EVIDENCE.has(row.evidenceStatus)) return false;
  const outcome = proceedingOutcome(event, row.proceedingId);
  if (outcome === "superseded" || outcome === "annulled") return false;
  return true;
}

function eventClosed(event: SeatCycleEvent): boolean {
  return (
    event.legalOutcome === "superseded" ||
    event.legalOutcome === "annulled" ||
    event.recordState === "superseded" ||
    event.recordState === "withdrawn"
  );
}

/** The single standing elected row on this cycle, or null. Party is this row only. */
export function singleWinner(event: SeatCycleEvent): SeatCycleResult | null {
  if (eventClosed(event)) return null;
  const elected = event.results.filter((row) => row.electedFlag === 1 && standingResult(event, row));
  if (elected.length !== 1) return null;
  return elected[0]!;
}

function sortEvents(events: SeatCycleEvent[]): SeatCycleEvent[] {
  return [...events].sort((a, b) => {
    const aIso = isoDay(a);
    const bIso = isoDay(b);
    if (aIso && bIso && aIso !== bIso) return aIso < bIso ? -1 : 1;
    if (aIso && !bIso) return -1;
    if (!aIso && bIso) return 1;
    return a.eventId.localeCompare(b.eventId);
  });
}

function sortProceedings(proceedings: SeatCycleProceeding[]): SeatCycleProceeding[] {
  return [...proceedings].sort((a, b) => {
    if (a.sequenceNo == null && b.sequenceNo != null) return 1;
    if (a.sequenceNo != null && b.sequenceNo == null) return -1;
    if (a.sequenceNo != null && b.sequenceNo != null && a.sequenceNo !== b.sequenceNo) {
      return a.sequenceNo - b.sequenceNo;
    }
    return a.proceedingId.localeCompare(b.proceedingId);
  });
}

function displayResult(row: SeatCycleResult, struck: boolean): ProceedingResultDisplay {
  return {
    id: row.resultRowId,
    label: row.label?.trim() ? row.label : NOT_SUPPLIED,
    party: row.partyLabel?.trim() ? row.partyLabel : NOT_SUPPLIED,
    votes: readerNumber(row.votes, row.votesStatus),
    share: readerShare(row.share, row.shareStatus, row.shareUnit),
    struck,
  };
}

function proceedingsFor(event: SeatCycleEvent): ProceedingDisplay[] {
  const ordered = sortProceedings(event.proceedings);
  const known = new Set(ordered.map((row) => row.proceedingId));
  const displays: ProceedingDisplay[] = ordered.map((proceeding) => {
    const superseded = proceeding.legalOutcome === "superseded";
    const results = event.results
      .filter((row) => row.proceedingId === proceeding.proceedingId)
      .sort((a, b) => a.resultRowId.localeCompare(b.resultRowId))
      .map((row) => displayResult(row, superseded || row.evidenceStatus === "superseded"));
    return {
      id: proceeding.proceedingId,
      kindLabel: proceedingKindLabel(proceeding.kind),
      legalOutcomeLabel: readerStatus(proceeding.legalOutcome),
      superseded,
      results,
    };
  });
  const loose = event.results
    .filter((row) => row.proceedingId == null || !known.has(row.proceedingId))
    .sort((a, b) => a.resultRowId.localeCompare(b.resultRowId));
  if (loose.length > 0) {
    displays.push({
      id: `${event.eventId}:unattached`,
      kindLabel: "Proceeding not supplied",
      legalOutcomeLabel: NOT_SUPPLIED,
      superseded: false,
      results: loose.map((row) => displayResult(row, row.evidenceStatus === "superseded")),
    });
  }
  return displays;
}

export function historyRows(events: SeatCycleEvent[]): HistoryDisplayRow[] {
  return sortEvents(events).map((event) => {
    const winner = singleWinner(event);
    const facts = resultFacts(event);
    const margin = marginFromResults(facts);
    const marginUnit = winner?.shareUnit ?? facts.find((row) => row.share != null)?.shareUnit ?? event.shareUnit ?? null;
    const shareSupplied =
      winner != null &&
      winner.share != null &&
      (winner.shareStatus === "recorded" || winner.shareStatus === "zero") &&
      !WITHHELD_EVIDENCE.has(winner.evidenceStatus);
    return {
      eventId: event.eventId,
      historyKey: event.historyKey,
      cycle: cycleLabelFor(event),
      winner: winner?.label?.trim() ? winner.label : NOT_SUPPLIED,
      party: winner?.partyLabel?.trim() ? winner.partyLabel : NOT_SUPPLIED,
      votes: winner ? readerNumber(winner.votes, winner.votesStatus) : NOT_SUPPLIED,
      share: winner ? readerShare(winner.share, winner.shareStatus, winner.shareUnit) : NOT_SUPPLIED,
      margin: readerMargin(margin, marginUnit),
      turnout: readerTurnout(turnoutFromEventRaw(event.rawJson)),
      winnerShare: shareSupplied ? winner!.share : null,
      winnerShareUnit: shareSupplied ? winner!.shareUnit : null,
      proceedings: proceedingsFor(event),
    };
  });
}

/**
 * Officeholders from consecutive selected-history events that each have one elected row.
 * A cycle without that row is a gap. The same person is not carried across the gap.
 * Party on a span is the party on that span's own row.
 */
export function officeholderTimeline(events: SeatCycleEvent[]): TimelineEntry[] {
  const selected = events.filter((event) => event.selectedHistoryRole === "selected");
  const ordered = sortEvents(selected.filter((event) => isoDay(event) != null));
  const unordered = sortEvents(selected.filter((event) => isoDay(event) == null));
  const blockMerge = unordered.length > 0;
  const entries: TimelineEntry[] = [];
  let open: TimelineEntry | null = null;

  const close = () => {
    if (!open) return;
    entries.push(open);
    open = null;
  };

  for (const event of ordered) {
    const winner = singleWinner(event);
    if (!winner) {
      close();
      entries.push({
        kind: "gap",
        eventId: event.eventId,
        cycle: cycleLabelFor(event),
        holder: null,
        party: null,
      });
      continue;
    }
    const party = winner.partyLabel?.trim() ? winner.partyLabel : null;
    const holder = winner.label?.trim() ? winner.label : null;
    if (
      !blockMerge &&
      open &&
      open.kind === "holder" &&
      open.holder === holder &&
      open.party === party
    ) {
      continue;
    }
    close();
    open = {
      kind: "holder",
      eventId: event.eventId,
      cycle: cycleLabelFor(event),
      holder,
      party,
    };
  }
  close();

  for (const event of unordered) {
    entries.push({
      kind: "gap",
      eventId: event.eventId,
      cycle: cycleLabelFor(event),
      holder: null,
      party: null,
    });
  }
  return entries;
}

/** Electoral system from the latest selected event only, when that event supplies one. */
export function electoralSystemFromLatest(events: SeatCycleEvent[]): string | null {
  const selected = events.filter((event) => event.selectedHistoryRole === "selected");
  const latest = pickLatestSelectedEvent(selected.map(toSelected));
  if (latest.kind !== "one") return null;
  const event = selected.find((row) => row.eventId === latest.event.eventId);
  const system = event?.electoralSystem?.trim();
  return system ? system : null;
}

export function historyCsv(rows: HistoryDisplayRow[]): string {
  const header = ["cycle", "winner", "party", "votes", "share", "margin", "turnout"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [row.cycle, row.winner, row.party, row.votes, row.share, row.margin, row.turnout].map(csvCell).join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function adjacentCycles(events: SeatCycleEvent[]): {
  previous: SeatCycleEvent | null;
  next: SeatCycleEvent | null;
} {
  const ordered = sortEvents(events).filter((event) => isoDay(event) != null);
  if (ordered.length === 0) return { previous: null, next: null };
  const latest = ordered[ordered.length - 1]!;
  const index = ordered.findIndex((event) => event.eventId === latest.eventId);
  return {
    previous: index > 0 ? ordered[index - 1]! : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1]! : null,
  };
}
