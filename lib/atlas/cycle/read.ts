import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { jurisdictionPublicPath } from "../jurisdiction";
import { resolveAtlasSqlitePath } from "../paths";
import { atlasRoutes, cycleCsvPath, cyclePublicPath } from "../routes";
import { WITHHELD_EVIDENCE } from "../derive/seat";
import { suppliedCountsFromEventRaw, turnoutPercent, proceedingKindLabel, readerStatus } from "../seat/history";
import { openAtlasDatabase, tableExists } from "../sqlite";
import { cycleCsv, type CycleCsvContest } from "./csv";
import {
  assignEventPage,
  compareContests,
  cycleLevelCounts,
  dateTokenFor,
  dayCycleLabel,
  methodChips,
  parseCycleDateToken,
  precisionLabel,
  tierHeading,
  unplacedCycleLabel,
  type CycleDateToken,
  type CyclePageAssignment,
} from "./format";

export type CycleCrumb = { label: string; href?: string };

export type CycleContestResult = {
  id: string;
  label: string | null;
  partyLabel: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  shareUnit: string;
  seats: number | null;
  seatsStatus: string;
  elected: boolean;
  evidenceStatus: string;
};

export type CycleProceedingView = {
  id: string;
  kindLabel: string;
  legalOutcomeLabel: string;
  superseded: boolean;
};

export type CycleContest = {
  eventId: string;
  officeId: string;
  officeName: string;
  bodyName: string;
  tier: string | null;
  tierHeading: string;
  seatHref: string;
  eventHref: string;
  precisionLabel: string;
  methodChips: string[];
  shareUnit: string;
  results: CycleContestResult[];
  proceedings: CycleProceedingView[];
  provenance: {
    publisher: string | null;
    title: string | null;
    url: string | null;
    snapshotLabel: string | null;
    evidenceGrade: string | null;
    recordId: string;
  };
  record: {
    officeId: string;
    idNamespace: string;
    lineageId: string | null;
    releaseId: string | null;
    historyKey: string;
  };
};

export type CycleSwitcherChip = {
  id: string;
  sortKey: string;
  label: string;
  href: string;
  hasResults: boolean;
  current: boolean;
};

export type CyclePageModel = {
  kind: "day" | "year";
  label: string;
  dateChip: string;
  description: string;
  path: string;
  csvHref: string | null;
  countryName: string;
  placeName: string;
  crumbs: CycleCrumb[];
  ballots: number | null;
  turnout: number | null;
  contests: CycleContest[];
  switcher: CycleSwitcherChip[];
  queued: boolean;
  countryNotes: string | null;
};

export type CycleLoad =
  | { status: "ready"; model: CyclePageModel }
  | { status: "alias"; path: string }
  | { status: "not_found" }
  | { status: "unavailable"; message: string; sqlitePath: string };

const UNAVAILABLE_MESSAGE =
  "No Atlas SQLite file was found. Import approved packs locally with npm run import:atlas, or set ATLAS_SQLITE_PATH (production expects /var/lib/cdd/atlas.sqlite).";

type PlaceRow = {
  jurisdictionKey: string;
  countryId: string;
  name: string;
  slug: string;
  slugPath: string;
  depth: number;
  parentKey: string | null;
};

type EventFacts = {
  eventId: string;
  historyKey: string;
  idNamespace: string;
  officeId: string;
  officeName: string;
  bodyName: string;
  jurisdictionKey: string | null;
  tier: string | null;
  seatSlug: string | null;
  eventKind: string;
  electoralSystem: string | null;
  ballotBasis: string;
  shareUnit: string;
  lineageId: string | null;
  releaseId: string | null;
  rawJson: string | null;
  snapshotLabel: string | null;
  precision: string | null;
  label: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  rangeStartLabel: string | null;
  rangeEndLabel: string | null;
  rangeStartYear: number | null;
  rangeEndYear: number | null;
  dateResolution: string;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function num(value: unknown): number {
  return Number(value ?? 0);
}

function numOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function unavailable(sqlitePath: string, readable = false): CycleLoad {
  return {
    status: "unavailable",
    sqlitePath,
    message: readable ? "The Atlas SQLite file exists but the election cycles are not readable." : UNAVAILABLE_MESSAGE,
  };
}

function withRead<T>(sqlitePath: string, fallback: T, fn: (db: DatabaseSync) => T): T {
  if (!existsSync(sqlitePath)) return fallback;
  try {
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      return fn(db);
    } finally {
      db.close();
    }
  } catch {
    return fallback;
  }
}

function mapPlace(row: Record<string, unknown>): PlaceRow {
  return {
    jurisdictionKey: text(row.jurisdiction_key),
    countryId: text(row.country_id),
    name: text(row.name),
    slug: text(row.slug),
    slugPath: text(row.slug_path),
    depth: num(row.depth),
    parentKey: textOrNull(row.parent_key),
  };
}

function lookupPlace(db: DatabaseSync, slugPath: string): { place: PlaceRow; alias: boolean } | null {
  if (!tableExists(db, "derived_jurisdiction")) return null;
  const canonical = db
    .prepare(
      `SELECT jurisdiction_key, country_id, name, slug, slug_path, depth, parent_key
       FROM derived_jurisdiction WHERE slug_path = ?`,
    )
    .get(slugPath);
  if (canonical) return { place: mapPlace(canonical), alias: false };
  if (!tableExists(db, "derived_slug_alias")) return null;
  const alias = db
    .prepare(
      `SELECT j.jurisdiction_key, j.country_id, j.name, j.slug, j.slug_path, j.depth, j.parent_key
       FROM derived_slug_alias a
       JOIN derived_jurisdiction j ON j.jurisdiction_key = a.jurisdiction_key
       WHERE a.slug_path = ?`,
    )
    .get(slugPath);
  if (!alias) return null;
  return { place: mapPlace(alias), alias: true };
}

function descendantKeys(db: DatabaseSync, jurisdictionKey: string): Set<string> {
  const rows = db
    .prepare(`SELECT jurisdiction_key, parent_key FROM derived_jurisdiction`)
    .all();
  const children = new Map<string, string[]>();
  for (const row of rows) {
    const parent = textOrNull(row.parent_key);
    if (!parent) continue;
    const list = children.get(parent) ?? [];
    list.push(text(row.jurisdiction_key));
    children.set(parent, list);
  }
  const keys = new Set<string>();
  const stack = [jurisdictionKey];
  while (stack.length > 0) {
    const key = stack.pop();
    if (!key || keys.has(key)) continue;
    keys.add(key);
    for (const child of children.get(key) ?? []) stack.push(child);
  }
  return keys;
}

function ancestorCrumbs(db: DatabaseSync, jurisdictionKey: string): CycleCrumb[] {
  const chain: PlaceRow[] = [];
  const seen = new Set<string>();
  let key: string | null = jurisdictionKey;
  while (key && !seen.has(key)) {
    seen.add(key);
    const row = db
      .prepare(
        `SELECT jurisdiction_key, country_id, name, slug, slug_path, depth, parent_key
         FROM derived_jurisdiction WHERE jurisdiction_key = ?`,
      )
      .get(key);
    if (!row) break;
    const place = mapPlace(row);
    chain.push(place);
    key = place.parentKey;
  }
  chain.reverse();
  return chain.map((place) => ({
    label: place.name,
    href: jurisdictionPublicPath(place.slugPath),
  }));
}

function joinDistinct(values: Array<string | null>): string | null {
  const unique = [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
  return unique.length > 0 ? unique.join(" · ") : null;
}

const EVENT_SELECT = `
  SELECT e.event_id, e.history_key, e.id_namespace, e.office_id, e.event_kind, e.electoral_system,
         e.ballot_basis, e.share_unit, e.lineage_id, e.release_id, e.raw_json, e.date_resolution,
         o.name AS office_name, o.geography_id,
         t.tier,
         d.label AS date_label, d.precision, d.year, d.month, d.day, d.range_start_id, d.range_end_id,
         rs.label AS range_start_label, rs.year AS range_start_year,
         re.label AS range_end_label, re.year AS range_end_year,
         COALESCE(j.name, g.name) AS body_name,
         j.jurisdiction_key,
         s.slug_path AS seat_slug,
         rel.research_snapshot_label AS snapshot_label
  FROM election_event e
  JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
  LEFT JOIN office_tier_classification t
    ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
  LEFT JOIN research_date d ON d.date_id = e.date_id
  LEFT JOIN research_date rs ON rs.date_id = d.range_start_id
  LEFT JOIN research_date re ON re.date_id = d.range_end_id
  LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
  LEFT JOIN derived_jurisdiction j ON j.country_id = o.country_id AND j.geography_id = o.geography_id
  LEFT JOIN derived_office_slug s ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id
  LEFT JOIN dataset_release rel ON rel.lineage_id = e.lineage_id AND rel.release_id = e.release_id
`;

function mapEvent(row: Record<string, unknown>): EventFacts {
  return {
    eventId: text(row.event_id),
    historyKey: text(row.history_key),
    idNamespace: text(row.id_namespace),
    officeId: text(row.office_id),
    officeName: text(row.office_name),
    bodyName: text(row.body_name) || "not supplied",
    jurisdictionKey: textOrNull(row.jurisdiction_key),
    tier: textOrNull(row.tier),
    seatSlug: textOrNull(row.seat_slug),
    eventKind: text(row.event_kind),
    electoralSystem: textOrNull(row.electoral_system),
    ballotBasis: text(row.ballot_basis),
    shareUnit: text(row.share_unit),
    lineageId: textOrNull(row.lineage_id),
    releaseId: textOrNull(row.release_id),
    rawJson: textOrNull(row.raw_json),
    snapshotLabel: textOrNull(row.snapshot_label),
    precision: textOrNull(row.precision),
    label: textOrNull(row.date_label),
    year: numOrNull(row.year),
    month: numOrNull(row.month),
    day: numOrNull(row.day),
    rangeStartLabel: textOrNull(row.range_start_label),
    rangeEndLabel: textOrNull(row.range_end_label),
    rangeStartYear: numOrNull(row.range_start_year),
    rangeEndYear: numOrNull(row.range_end_year),
    dateResolution: text(row.date_resolution),
  };
}

function pageOf(event: EventFacts): CyclePageAssignment {
  return assignEventPage({
    dateResolution: event.dateResolution,
    precision: event.precision,
    year: event.year,
    month: event.month,
    day: event.day,
    rangeStartYear: event.rangeStartYear,
    rangeEndYear: event.rangeEndYear,
  });
}

function loadDayEvents(db: DatabaseSync, countryId: string, isoDate: string): EventFacts[] {
  return db
    .prepare(
      `${EVENT_SELECT}
       WHERE o.country_id = ?
         AND e.date_resolution = 'resolved'
         AND d.precision = 'day'
         AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL
         AND printf('%04d-%02d-%02d', d.year, d.month, d.day) = ?`,
    )
    .all(countryId, isoDate)
    .map((row) => mapEvent(row));
}

function loadUnplacedEvents(db: DatabaseSync, countryId: string): EventFacts[] {
  if (!tableExists(db, "derived_cycle_unplaced")) return [];
  return db
    .prepare(
      `${EVENT_SELECT}
       JOIN derived_cycle_unplaced u
         ON u.id_namespace = e.id_namespace AND u.office_id = e.office_id AND u.history_key = e.history_key
       WHERE u.country_id = ?`,
    )
    .all(countryId)
    .map((row) => mapEvent(row));
}

function inScope(event: EventFacts, keys: Set<string> | null): boolean {
  if (!keys) return true;
  if (!event.jurisdictionKey) return false;
  return keys.has(event.jurisdictionKey);
}

type ResultBucket = Map<string, CycleContestResult[]>;
type ProceedingBucket = Map<string, CycleProceedingView[]>;
type SourceBucket = Map<string, { publisher: string | null; title: string | null; url: string | null; evidenceGrade: string | null }>;

function eventKey(event: EventFacts): string {
  return `${event.idNamespace}\n${event.officeId}\n${event.historyKey}`;
}

function loadResults(db: DatabaseSync, countryId: string, events: EventFacts[]): ResultBucket {
  const bucket: ResultBucket = new Map();
  if (!tableExists(db, "result_row") || events.length === 0) return bucket;
  const wanted = new Set(events.map(eventKey));
  const rows = db
    .prepare(
      `SELECT id_namespace, office_id, history_key, result_row_id, candidate_or_list_label, original_party_label,
              votes, votes_status, share, share_status, share_unit, seats, seats_status, elected_flag, evidence_status
       FROM result_row
       WHERE country_id = ?
       ORDER BY result_row_id`,
    )
    .all(countryId);
  for (const row of rows) {
    const key = `${text(row.id_namespace)}\n${text(row.office_id)}\n${text(row.history_key)}`;
    if (!wanted.has(key)) continue;
    const evidence = text(row.evidence_status);
    if (WITHHELD_EVIDENCE.has(evidence)) continue;
    const list = bucket.get(key) ?? [];
    list.push({
      id: text(row.result_row_id),
      label: textOrNull(row.candidate_or_list_label),
      partyLabel: textOrNull(row.original_party_label),
      votes: numOrNull(row.votes),
      votesStatus: text(row.votes_status),
      share: numOrNull(row.share),
      shareStatus: text(row.share_status),
      shareUnit: text(row.share_unit),
      seats: numOrNull(row.seats),
      seatsStatus: text(row.seats_status),
      elected: num(row.elected_flag) === 1,
      evidenceStatus: evidence,
    });
    bucket.set(key, list);
  }
  return bucket;
}

function loadProceedings(db: DatabaseSync, events: EventFacts[]): ProceedingBucket {
  const bucket: ProceedingBucket = new Map();
  if (!tableExists(db, "proceeding") || events.length === 0) return bucket;
  const wanted = new Set(events.map(eventKey));
  const rows = db
    .prepare(
      `SELECT id_namespace, office_id, history_key, proceeding_id, kind, sequence_no, legal_outcome
       FROM proceeding`,
    )
    .all();
  const grouped = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const key = `${text(row.id_namespace)}\n${text(row.office_id)}\n${text(row.history_key)}`;
    if (!wanted.has(key)) continue;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }
  for (const [key, list] of grouped) {
    list.sort((a, b) => {
      const aSeq = numOrNull(a.sequence_no);
      const bSeq = numOrNull(b.sequence_no);
      if (aSeq == null && bSeq != null) return 1;
      if (aSeq != null && bSeq == null) return -1;
      if (aSeq != null && bSeq != null && aSeq !== bSeq) return aSeq - bSeq;
      return text(a.proceeding_id).localeCompare(text(b.proceeding_id));
    });
    bucket.set(
      key,
      list.map((row) => {
        const outcome = text(row.legal_outcome);
        return {
          id: text(row.proceeding_id),
          kindLabel: proceedingKindLabel(text(row.kind)),
          legalOutcomeLabel: readerStatus(outcome),
          superseded: outcome === "superseded" || outcome === "annulled",
        };
      }),
    );
  }
  return bucket;
}

function loadSources(db: DatabaseSync, events: EventFacts[]): SourceBucket {
  const bucket: SourceBucket = new Map();
  if (!tableExists(db, "evidence_link") || !tableExists(db, "record_locator") || !tableExists(db, "source")) {
    return bucket;
  }
  const wanted = new Set(events.map(eventKey));
  const rows = db
    .prepare(
      `SELECT l.id_namespace, l.office_id, l.history_key, s.publisher, s.title, s.url, s.evidence_grade
       FROM record_locator l
       JOIN evidence_link e ON e.record_key = l.record_key
       JOIN source s
         ON s.country_id = e.source_country_id
        AND s.source_namespace = e.source_namespace
        AND s.source_id = e.source_id
       WHERE l.entity_kind = 'event'
       ORDER BY s.source_id`,
    )
    .all();
  const grouped = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const key = `${text(row.id_namespace)}\n${text(row.office_id)}\n${text(row.history_key)}`;
    if (!wanted.has(key)) continue;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }
  for (const [key, list] of grouped) {
    bucket.set(key, {
      publisher: joinDistinct(list.map((row) => textOrNull(row.publisher))),
      title: joinDistinct(list.map((row) => textOrNull(row.title))),
      url: joinDistinct(list.map((row) => textOrNull(row.url))),
      evidenceGrade: joinDistinct(list.map((row) => textOrNull(row.evidence_grade))),
    });
  }
  return bucket;
}

function toContest(
  event: EventFacts,
  results: ResultBucket,
  proceedings: ProceedingBucket,
  sources: SourceBucket,
): CycleContest {
  const key = eventKey(event);
  const source = sources.get(key);
  return {
    eventId: event.eventId,
    officeId: event.officeId,
    officeName: event.officeName,
    bodyName: event.bodyName,
    tier: event.tier,
    tierHeading: tierHeading(event.tier),
    seatHref: event.seatSlug ? atlasRoutes.seat(event.seatSlug) : atlasRoutes.office(event.officeId),
    eventHref: atlasRoutes.event(event.eventId),
    precisionLabel: precisionLabel({
      precision: event.precision,
      label: event.label,
      year: event.year,
      month: event.month,
      rangeStartLabel: event.rangeStartLabel,
      rangeEndLabel: event.rangeEndLabel,
    }),
    methodChips: methodChips({
      electoralSystem: event.electoralSystem,
      ballotBasis: event.ballotBasis,
      eventKind: event.eventKind,
    }),
    shareUnit: event.shareUnit,
    results: results.get(key) ?? [],
    proceedings: proceedings.get(key) ?? [],
    provenance: {
      publisher: source?.publisher ?? null,
      title: source?.title ?? null,
      url: source?.url ?? null,
      snapshotLabel: event.snapshotLabel,
      evidenceGrade: source?.evidenceGrade ?? null,
      recordId: event.eventId,
    },
    record: {
      officeId: event.officeId,
      idNamespace: event.idNamespace,
      lineageId: event.lineageId,
      releaseId: event.releaseId,
      historyKey: event.historyKey,
    },
  };
}

function hasVisibleResult(results: ResultBucket, event: EventFacts): boolean {
  return (results.get(eventKey(event))?.length ?? 0) > 0;
}

function switcherFromEvents(args: {
  events: EventFacts[];
  results: ResultBucket;
  keys: Set<string>;
  countrySlug: string;
  scopeSegments: string[];
  currentToken: string;
  kind: "day" | "year";
}): CycleSwitcherChip[] {
  const groups = new Map<string, { hasResults: boolean }>();
  for (const event of args.events) {
    if (!inScope(event, args.keys)) continue;
    const page = pageOf(event);
    if (args.kind === "day" && page.kind !== "day") continue;
    if (args.kind === "year" && page.kind === "day") continue;
    const token = dateTokenFor(page);
    const group = groups.get(token) ?? { hasResults: false };
    if (hasVisibleResult(args.results, event)) group.hasResults = true;
    groups.set(token, group);
  }
  return [...groups.entries()]
    .map(([token, group]) => ({
      id: token,
      sortKey: token === "undated" ? "9999-undated" : token,
      label: token === "undated" ? "Date not supplied" : token,
      href: cyclePublicPath(args.countrySlug, token, args.scopeSegments),
      hasResults: group.hasResults,
      current: token === args.currentToken,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.id.localeCompare(b.id));
}

function coverageOffices(db: DatabaseSync, jurisdictionKey: string): number {
  if (!tableExists(db, "derived_coverage")) return 0;
  const row = db.prepare("SELECT offices FROM derived_coverage WHERE jurisdiction_key = ?").get(jurisdictionKey);
  return num(row?.offices);
}

function countryNotes(db: DatabaseSync, countryId: string): { name: string; notes: string | null } {
  const row = db.prepare("SELECT name, notes FROM country WHERE country_id = ?").get(countryId);
  return { name: text(row?.name) || countryId, notes: textOrNull(row?.notes) };
}

export function loadCyclePage(
  args: { country: string; dateToken: string; scope?: string[] },
  sqlitePath = resolveAtlasSqlitePath(),
): CycleLoad {
  const token = parseCycleDateToken(args.dateToken);
  if (!token) return { status: "not_found" };
  const scopeSegments = (args.scope ?? []).filter((segment) => segment.length > 0);
  if (!existsSync(sqlitePath)) return unavailable(sqlitePath);
  return withRead(sqlitePath, unavailable(sqlitePath, true), (db) =>
    loadFromDatabase(db, args.country, token, scopeSegments, sqlitePath),
  );
}

function loadFromDatabase(
  db: DatabaseSync,
  countrySlug: string,
  token: CycleDateToken,
  scopeSegments: string[],
  sqlitePath: string,
): CycleLoad {
  if (!tableExists(db, "derived_jurisdiction") || !tableExists(db, "derived_cycle") || !tableExists(db, "election_event")) {
    return unavailable(sqlitePath, true);
  }
  const countryHit = lookupPlace(db, countrySlug);
  if (!countryHit || countryHit.place.depth !== 0) return { status: "not_found" };
  if (countryHit.alias) {
    return {
      status: "alias",
      path: cyclePublicPath(countryHit.place.slug, dateTokenFor(token), scopeSegments),
    };
  }
  const country = countryHit.place;

  let scope = country;
  if (scopeSegments.length > 0) {
    const scopeHit = lookupPlace(db, [country.slug, ...scopeSegments].join("/"));
    if (!scopeHit || scopeHit.place.countryId !== country.countryId) return { status: "not_found" };
    if (scopeHit.alias) {
      const rest = scopeHit.place.slugPath.split("/").filter(Boolean).slice(1);
      return { status: "alias", path: cyclePublicPath(country.slug, dateTokenFor(token), rest) };
    }
    scope = scopeHit.place;
  }

  const notes = countryNotes(db, country.countryId);
  const keys = descendantKeys(db, scope.jurisdictionKey);

  if (token.kind === "day") {
    if (!tableExists(db, "derived_cycle")) return { status: "not_found" };
    const cycle = db
      .prepare(`SELECT cycle_key, scope_key, iso_date FROM derived_cycle WHERE country_id = ? AND iso_date = ?`)
      .get(country.countryId, token.isoDate);
    if (!cycle) return { status: "not_found" };
    const events = loadDayEvents(db, country.countryId, token.isoDate).filter((event) => inScope(event, keys));
    if (events.length === 0) return { status: "not_found" };
    const filterKey = scopeSegments.length > 0 ? scope.jurisdictionKey : text(cycle.scope_key);
    const filterKeys = descendantKeys(db, filterKey);
    const allDayEvents = loadDayEventsForSwitcher(db, country.countryId);
    const results = loadResults(db, country.countryId, allDayEvents);
    const proceedings = loadProceedings(db, events);
    const sources = loadSources(db, events);
    const contests = events
      .map((event) => toContest(event, results, proceedings, sources))
      .sort(compareContests);
    const counts = cycleLevelCounts(events.map((event) => suppliedCountsFromEventRaw(event.rawJson)));
    const turnout =
      counts.registered != null && counts.ballots != null ? turnoutPercent(counts.registered, counts.ballots) : null;
    const tiers = [...new Set(contests.map((contest) => contest.tier).filter((tier): tier is string => Boolean(tier)))].sort();
    const label = dayCycleLabel({
      isoDate: token.isoDate,
      countryName: notes.name,
      contestCount: contests.length,
      tiers,
    });
    const path = cyclePublicPath(country.slug, token.isoDate, scopeSegments);
    const offices = coverageOffices(db, scope.jurisdictionKey);
    const queued = offices > 0 && contests.every((contest) => contest.results.length === 0);
    return {
      status: "ready",
      model: {
        kind: "day",
        label,
        dateChip: token.isoDate,
        description: `${label}. Place: ${scope.name}.`,
        path,
        csvHref: cycleCsvPath(country.slug, token.isoDate),
        countryName: notes.name,
        placeName: scope.name,
        crumbs: [{ label: "World", href: atlasRoutes.home }, ...ancestorCrumbs(db, scope.jurisdictionKey), { label: token.isoDate }],
        ballots: counts.ballots,
        turnout,
        contests,
        switcher: switcherFromEvents({
          events: allDayEvents,
          results,
          keys: filterKeys,
          countrySlug: country.slug,
          scopeSegments,
          currentToken: token.isoDate,
          kind: "day",
        }),
        queued,
        countryNotes: notes.notes,
      },
    };
  }

  const unplaced = loadUnplacedEvents(db, country.countryId);
  const matched = unplaced.filter((event) => {
    if (!inScope(event, keys)) return false;
    const page = pageOf(event);
    return dateTokenFor(page) === dateTokenFor(token);
  });
  if (matched.length === 0) return { status: "not_found" };
  const results = loadResults(db, country.countryId, unplaced);
  const proceedings = loadProceedings(db, matched);
  const sources = loadSources(db, matched);
  const contests = matched.map((event) => toContest(event, results, proceedings, sources)).sort(compareContests);
  const yearLabel = token.kind === "year" ? String(token.year) : "Date not supplied";
  const label = unplacedCycleLabel({
    yearLabel,
    countryName: notes.name,
    contestCount: contests.length,
  });
  const path = cyclePublicPath(country.slug, dateTokenFor(token), scopeSegments);
  const offices = coverageOffices(db, scope.jurisdictionKey);
  const queued = offices > 0 && contests.every((contest) => contest.results.length === 0);
  const counts = cycleLevelCounts(matched.map((event) => suppliedCountsFromEventRaw(event.rawJson)));
  const turnout =
    counts.registered != null && counts.ballots != null ? turnoutPercent(counts.registered, counts.ballots) : null;
  return {
    status: "ready",
    model: {
      kind: "year",
      label,
      dateChip: yearLabel,
      description: `${label}. Place: ${scope.name}.`,
      path,
      csvHref: null,
      countryName: notes.name,
      placeName: scope.name,
      crumbs: [{ label: "World", href: atlasRoutes.home }, ...ancestorCrumbs(db, scope.jurisdictionKey), { label: yearLabel }],
      ballots: counts.ballots,
      turnout,
      contests,
      switcher: switcherFromEvents({
        events: unplaced,
        results,
        keys,
        countrySlug: country.slug,
        scopeSegments,
        currentToken: dateTokenFor(token),
        kind: "year",
      }),
      queued,
      countryNotes: notes.notes,
    },
  };
}

function loadDayEventsForSwitcher(db: DatabaseSync, countryId: string): EventFacts[] {
  return db
    .prepare(
      `${EVENT_SELECT}
       WHERE o.country_id = ?
         AND e.date_resolution = 'resolved'
         AND d.precision = 'day'
         AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL`,
    )
    .all(countryId)
    .map((row) => mapEvent(row));
}

export function cycleCsvForDay(countrySlug: string, isoDate: string, sqlitePath = resolveAtlasSqlitePath()): string | null {
  const loaded = loadCyclePage({ country: countrySlug, dateToken: isoDate }, sqlitePath);
  if (loaded.status !== "ready" || loaded.model.kind !== "day") return null;
  return cycleCsv(loaded.model.contests satisfies CycleCsvContest[]);
}

export function cyclePathForEvent(
  idNamespace: string,
  eventId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): string | null {
  if (!existsSync(sqlitePath)) return null;
  return withRead(sqlitePath, null, (db) => {
    if (!tableExists(db, "election_event") || !tableExists(db, "derived_jurisdiction")) return null;
    const row = db
      .prepare(
        `SELECT o.country_id, e.date_resolution, d.precision, d.year, d.month, d.day,
                rs.year AS range_start_year, re.year AS range_end_year, j.slug
         FROM election_event e
         JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
         LEFT JOIN research_date d ON d.date_id = e.date_id
         LEFT JOIN research_date rs ON rs.date_id = d.range_start_id
         LEFT JOIN research_date re ON re.date_id = d.range_end_id
         LEFT JOIN derived_jurisdiction j ON j.country_id = o.country_id AND j.depth = 0
         WHERE e.id_namespace = ? AND e.event_id = ?`,
      )
      .get(idNamespace, eventId);
    if (!row || !textOrNull(row.slug)) return null;
    const page = assignEventPage({
      dateResolution: text(row.date_resolution),
      precision: textOrNull(row.precision),
      year: numOrNull(row.year),
      month: numOrNull(row.month),
      day: numOrNull(row.day),
      rangeStartYear: numOrNull(row.range_start_year),
      rangeEndYear: numOrNull(row.range_end_year),
    });
    return cyclePublicPath(text(row.slug), dateTokenFor(page));
  });
}

export function listCyclePublicPaths(sqlitePath = resolveAtlasSqlitePath()): string[] {
  if (!existsSync(sqlitePath)) return [];
  return withRead(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_jurisdiction") || !tableExists(db, "derived_cycle")) return [];
    const countries = db
      .prepare(`SELECT country_id, slug FROM derived_jurisdiction WHERE depth = 0 ORDER BY slug`)
      .all();
    const paths: string[] = [];
    for (const country of countries) {
      const slug = text(country.slug);
      const countryId = text(country.country_id);
      const days = db
        .prepare(`SELECT iso_date FROM derived_cycle WHERE country_id = ? ORDER BY iso_date`)
        .all(countryId);
      for (const day of days) paths.push(cyclePublicPath(slug, text(day.iso_date)));
      if (!tableExists(db, "derived_cycle_unplaced")) continue;
      const unplaced = loadUnplacedEvents(db, countryId);
      const tokens = new Set<string>();
      for (const event of unplaced) {
        const page = pageOf(event);
        if (page.kind === "day") continue;
        tokens.add(dateTokenFor(page));
      }
      for (const token of [...tokens].sort((a, b) => a.localeCompare(b))) {
        paths.push(cyclePublicPath(slug, token));
      }
    }
    return paths;
  });
}

export function contestsForCsv(model: CyclePageModel): CycleCsvContest[] {
  return model.contests;
}
