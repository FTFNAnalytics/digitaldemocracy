import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { cyclePublicPath } from "./routes";
import { isSingleSeatOfficeType, WITHHELD_EVIDENCE } from "./derive/seat";
import type { AtlasCoverage, AtlasJurisdiction } from "./derive/read";
import { resolveAtlasSqlitePath } from "./paths";
import { RESERVED_SLUG_SEGMENTS } from "./derive/slug";
import { loadPlaceMetrics } from "./map/child-facts";
import { openAtlasDatabase, tableExists } from "./sqlite";

export const SEAT_PAGE_SIZE = 50;
export const ATLAS_ALIAS_REDIRECT_STATUS = 301;
export const SITEMAP_URL_LIMIT = 50_000;

const RESERVED_ATLAS_ROOTS = new Set([
  "explorer",
  "offices",
  "elections",
  "releases",
  "search",
  "reading-kit",
  "countries",
  "downloads",
  "seat-alias",
  "people",
  "_kit",
]);

export function isReservedSlugSegment(segment: string): boolean {
  return RESERVED_SLUG_SEGMENTS.has(segment);
}

export function isStaticAtlasRoot(segment: string): boolean {
  return RESERVED_ATLAS_ROOTS.has(segment);
}

export function jurisdictionPublicPath(slugPath: string): string {
  const encoded = slugPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/atlas/${encoded}`;
}

export function jurisdictionLevelLabel(level: string): string {
  const trimmed = level.trim();
  if (!trimmed) return "Area";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function jurisdictionTitle(name: string, countryName: string): string {
  return `${name} · ${countryName} · Election Atlas`;
}

export function jurisdictionDescription(
  name: string,
  countryName: string,
  levelLabel: string,
  facts: Array<{ label: string; value: string }>,
): string {
  const body = facts.map((fact) => `${fact.label}: ${fact.value}`).join(". ");
  return `${name} · ${levelLabel} · ${countryName}. ${body}.`;
}

export function jurisdictionJsonLd(name: string, parentName: string | null): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name,
  };
  if (parentName) {
    data.containedInPlace = { "@type": "AdministrativeArea", name: parentName };
  }
  return data;
}

export type JurisdictionHit =
  | { status: "canonical"; jurisdiction: AtlasJurisdiction }
  | { status: "alias"; jurisdiction: AtlasJurisdiction; canonicalPath: string }
  | { status: "reserved"; segment: string }
  | { status: "not_found" }
  | { status: "unavailable"; message: string; sqlitePath: string };

export function reservedSegment(country: string, path: string[] | undefined): string | null {
  if (isReservedSlugSegment(country)) return country;
  for (const segment of path ?? []) {
    if (isReservedSlugSegment(segment)) return segment;
  }
  return null;
}

export function slugPathFromRoute(country: string, path: string[] | undefined): string | null {
  const segments = [country, ...(path ?? [])];
  if (segments.some((segment) => segment.trim() === "")) return null;
  return segments.join("/");
}

export type JurisdictionPlace = {
  id: string;
  name: string;
  slugPath: string;
  level: string;
  offices: number | null;
  officesWithAnyEvent: number | null;
  officesWithResults: number | null;
  eventsTotal: number | null;
  eventsWithResults: number | null;
  notSuppliedNextDates: number | null;
  latestSnapshotLabel: string | null;
  officeCount: number | null;
  firstEventYear: number | null;
  lastEventYear: number | null;
  nextDateId: string | null;
  nextYear: number | null;
  margin: number | null;
  marginUnit: string | null;
  turnout: number | null;
};

export type JurisdictionSeat = {
  id: string;
  officeId: string;
  name: string;
  executive: boolean;
  heldBy: string | null;
  since: string | null;
  lastShare: number | null;
  lastShareUnit: string | null;
  eventDates: string[];
  nextLabel: string | null;
  nextYear: number | null;
  nextMonth: number | null;
  nextDay: number | null;
};

export type JurisdictionCycle = {
  id: string;
  isoDate: string;
  year: string;
  contestCount: number;
  label: string;
  hasResults: boolean;
  eventId: string | null;
};

export type JurisdictionView = {
  jurisdiction: AtlasJurisdiction;
  countryName: string;
  parentName: string | null;
  ancestors: Array<{ name: string; slugPath: string }>;
  coverage: AtlasCoverage | null;
  children: JurisdictionPlace[];
  seats: JurisdictionSeat[];
  cycles: JurisdictionCycle[];
  nextElectionLabel: string | null;
};

export type CountryCard = {
  countryId: string;
  slugPath: string;
  coverage: AtlasCoverage | null;
};

export type SitemapEntry = {
  url: string;
  changeFrequency?: "weekly" | "monthly";
  priority?: number;
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

const JURISDICTION_COLUMNS = `jurisdiction_key, country_id, geography_id, parent_key, depth, level_label, name,
  slug, slug_path, office_count, event_count, first_event_year, last_event_year, coverage_status, ambiguous`;

function mapJurisdiction(row: Record<string, unknown>): AtlasJurisdiction {
  return {
    jurisdictionKey: text(row.jurisdiction_key),
    countryId: text(row.country_id),
    geographyId: textOrNull(row.geography_id),
    parentKey: textOrNull(row.parent_key),
    depth: num(row.depth),
    levelLabel: text(row.level_label),
    name: text(row.name),
    slug: text(row.slug),
    slugPath: text(row.slug_path),
    officeCount: num(row.office_count),
    eventCount: num(row.event_count),
    firstEventYear: numOrNull(row.first_event_year),
    lastEventYear: numOrNull(row.last_event_year),
    coverageStatus: text(row.coverage_status),
    ambiguous: num(row.ambiguous),
  };
}

function mapCoverage(row: Record<string, unknown>): AtlasCoverage {
  return {
    jurisdictionKey: text(row.jurisdiction_key),
    countryId: text(row.country_id),
    offices: num(row.offices),
    officesWithAnyEvent: num(row.offices_with_any_event),
    officesWithResults: num(row.offices_with_results),
    eventsTotal: num(row.events_total),
    eventsWithResults: num(row.events_with_results),
    notSuppliedNextDates: num(row.not_supplied_next_dates),
    latestSnapshotLabel: textOrNull(row.latest_snapshot_label),
  };
}

export function isExecutiveOfficeType(officeType: string): boolean {
  if (officeType.toLowerCase().includes("executive")) return true;
  return isSingleSeatOfficeType(officeType);
}

export function compareSeats(a: Pick<JurisdictionSeat, "executive" | "name" | "id">, b: Pick<JurisdictionSeat, "executive" | "name" | "id">): number {
  if (a.executive !== b.executive) return a.executive ? -1 : 1;
  const byName = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  if (byName !== 0) return byName;
  return a.id.localeCompare(b.id);
}

export function filterSeatsByDate<T extends { eventDates: string[] }>(seats: T[], date: string): T[] {
  if (!date) return seats;
  return seats.filter((seat) => seat.eventDates.includes(date));
}

export function filterPlaces<T extends { name: string; level: string }>(
  places: T[],
  query: { q?: string; kind?: string },
): T[] {
  const q = (query.q ?? "").trim().toLowerCase();
  const kind = (query.kind ?? "").trim().toLowerCase();
  return places.filter((place) => {
    if (q && !place.name.toLowerCase().includes(q)) return false;
    if (kind && kind !== "all" && place.level.toLowerCase() !== kind) return false;
    return true;
  });
}

/** Cycle chips open the election-day page. A deeper place keeps that place as the scope. */
export function cycleListHref(args: {
  contestCount: number;
  eventId: string | null;
  isoDate: string;
  slugPath: string;
}): string {
  const segments = args.slugPath.split("/").filter((segment) => segment.length > 0);
  const country = segments[0];
  if (!country || !args.isoDate) {
    return args.eventId ? `/atlas/elections/${encodeURIComponent(args.eventId)}` : "/atlas";
  }
  return cyclePublicPath(country, args.isoDate, segments.slice(1));
}

export function jurisdictionFacts(
  jurisdiction: AtlasJurisdiction,
  coverage: AtlasCoverage | null,
): Array<{ label: string; value: string }> {
  const offices = coverage?.offices ?? jurisdiction.officeCount;
  const events = coverage?.eventsTotal ?? jurisdiction.eventCount;
  const withResults = coverage ? coverage.officesWithResults.toLocaleString() : "not supplied";
  let span = "not supplied";
  if (jurisdiction.firstEventYear != null && jurisdiction.lastEventYear != null) {
    span =
      jurisdiction.firstEventYear === jurisdiction.lastEventYear
        ? String(jurisdiction.firstEventYear)
        : `${jurisdiction.firstEventYear}–${jurisdiction.lastEventYear}`;
  } else if (jurisdiction.firstEventYear != null) {
    span = String(jurisdiction.firstEventYear);
  } else if (jurisdiction.lastEventYear != null) {
    span = String(jurisdiction.lastEventYear);
  }
  return [
    { label: "Offices", value: offices.toLocaleString() },
    { label: "Elections", value: events.toLocaleString() },
    { label: "Offices with results", value: withResults },
    { label: "Results span", value: span },
  ];
}

export function earliestNextElectionLabel(seats: JurisdictionSeat[]): string | null {
  const dated = seats.filter((seat) => seat.nextLabel);
  if (dated.length === 0) return null;
  dated.sort((a, b) => {
    const ay = a.nextYear ?? 9999;
    const by = b.nextYear ?? 9999;
    if (ay !== by) return ay - by;
    const am = a.nextMonth ?? 99;
    const bm = b.nextMonth ?? 99;
    if (am !== bm) return am - bm;
    const ad = a.nextDay ?? 99;
    const bd = b.nextDay ?? 99;
    if (ad !== bd) return ad - bd;
    return a.id.localeCompare(b.id);
  });
  return dated[0]?.nextLabel ?? null;
}

function unavailable(sqlitePath: string): JurisdictionHit {
  if (!existsSync(sqlitePath)) {
    return {
      status: "unavailable",
      sqlitePath,
      message:
        "No Atlas SQLite file was found. Import approved packs locally with npm run import:atlas, or set ATLAS_SQLITE_PATH (production expects /var/lib/cdd/atlas.sqlite).",
    };
  }
  return {
    status: "unavailable",
    sqlitePath,
    message: "The Atlas SQLite file exists but the place index is not readable.",
  };
}

export function resolveJurisdictionPath(
  country: string,
  path: string[] | undefined,
  sqlitePath = resolveAtlasSqlitePath(),
): JurisdictionHit {
  const reserved = reservedSegment(country, path);
  if (reserved) return { status: "reserved", segment: reserved };
  const slugPath = slugPathFromRoute(country, path);
  if (!slugPath) return { status: "not_found" };
  if (!existsSync(sqlitePath)) return unavailable(sqlitePath);

  return withRead(sqlitePath, unavailable(sqlitePath), (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return unavailable(sqlitePath);
    const canonical = db
      .prepare(`SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE slug_path = ?`)
      .get(slugPath);
    if (canonical) return { status: "canonical", jurisdiction: mapJurisdiction(canonical) };
    if (!tableExists(db, "derived_slug_alias")) return { status: "not_found" };
    const alias = db
      .prepare(
        `SELECT j.jurisdiction_key, j.country_id, j.geography_id, j.parent_key, j.depth, j.level_label, j.name,
                j.slug, j.slug_path, j.office_count, j.event_count, j.first_event_year, j.last_event_year,
                j.coverage_status, j.ambiguous
         FROM derived_slug_alias a
         JOIN derived_jurisdiction j ON j.jurisdiction_key = a.jurisdiction_key
         WHERE a.slug_path = ?`,
      )
      .get(slugPath);
    if (!alias) return { status: "not_found" };
    const jurisdiction = mapJurisdiction(alias);
    return { status: "alias", jurisdiction, canonicalPath: jurisdictionPublicPath(jurisdiction.slugPath) };
  });
}

export function countryCanonicalPath(countryId: string, sqlitePath = resolveAtlasSqlitePath()): string | null {
  if (!existsSync(sqlitePath)) return null;
  return withRead(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return null;
    const row = db
      .prepare("SELECT slug_path FROM derived_jurisdiction WHERE country_id = ? AND depth = 0")
      .get(countryId);
    return row ? jurisdictionPublicPath(text(row.slug_path)) : null;
  });
}

export function aliasCanonicalPath(slugPath: string, sqlitePath = resolveAtlasSqlitePath()): string | null {
  const parts = slugPath.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((segment) => isReservedSlugSegment(segment) || isStaticAtlasRoot(segment))) return null;
  const hit = resolveJurisdictionPath(parts[0]!, parts.slice(1), sqlitePath);
  if (hit.status !== "alias") return null;
  return hit.canonicalPath;
}

function loadCoverage(db: DatabaseSync, jurisdictionKey: string): AtlasCoverage | null {
  if (!tableExists(db, "derived_coverage")) return null;
  const row = db
    .prepare(
      `SELECT c.jurisdiction_key, j.country_id, c.offices, c.offices_with_any_event, c.offices_with_results,
              c.events_total, c.events_with_results, c.not_supplied_next_dates, c.latest_snapshot_label
       FROM derived_coverage c
       JOIN derived_jurisdiction j ON j.jurisdiction_key = c.jurisdiction_key
       WHERE c.jurisdiction_key = ?`,
    )
    .get(jurisdictionKey);
  return row ? mapCoverage(row) : null;
}

function loadAncestors(
  db: DatabaseSync,
  jurisdictionKey: string,
): Array<{ name: string; slugPath: string; depth: number; key: string }> {
  return db
    .prepare(
      `WITH RECURSIVE chain AS (
         SELECT jurisdiction_key, parent_key, name, slug_path, depth
         FROM derived_jurisdiction WHERE jurisdiction_key = ?
         UNION ALL
         SELECT j.jurisdiction_key, j.parent_key, j.name, j.slug_path, j.depth
         FROM derived_jurisdiction j
         JOIN chain c ON j.jurisdiction_key = c.parent_key
       )
       SELECT jurisdiction_key, name, slug_path, depth FROM chain ORDER BY depth`,
    )
    .all(jurisdictionKey)
    .map((row) => ({
      key: text(row.jurisdiction_key),
      name: text(row.name),
      slugPath: text(row.slug_path),
      depth: num(row.depth),
    }));
}

function loadChildren(db: DatabaseSync, parentKey: string): JurisdictionPlace[] {
  const metrics = loadPlaceMetrics(db, parentKey);
  const rows = db
    .prepare(
      `SELECT j.jurisdiction_key, j.name, j.slug_path, j.level_label,
              j.office_count, j.first_event_year, j.last_event_year,
              c.offices, c.offices_with_any_event, c.offices_with_results,
              c.events_total, c.events_with_results, c.not_supplied_next_dates, c.latest_snapshot_label
       FROM derived_jurisdiction j
       LEFT JOIN derived_coverage c ON c.jurisdiction_key = j.jurisdiction_key
       WHERE j.parent_key = ?
       ORDER BY j.name COLLATE NOCASE, j.slug_path`,
    )
    .all(parentKey);
  return rows.map((row) => {
    const id = text(row.jurisdiction_key);
    const metric = metrics.get(id);
    return {
      id,
      name: text(row.name),
      slugPath: text(row.slug_path),
      level: text(row.level_label),
      offices: numOrNull(row.offices),
      officesWithAnyEvent: numOrNull(row.offices_with_any_event),
      officesWithResults: numOrNull(row.offices_with_results),
      eventsTotal: numOrNull(row.events_total),
      eventsWithResults: numOrNull(row.events_with_results),
      notSuppliedNextDates: numOrNull(row.not_supplied_next_dates),
      latestSnapshotLabel: textOrNull(row.latest_snapshot_label),
      officeCount: numOrNull(row.office_count),
      firstEventYear: numOrNull(row.first_event_year),
      lastEventYear: numOrNull(row.last_event_year),
      nextDateId: metric?.nextDateId ?? null,
      nextYear: metric?.nextYear ?? null,
      margin: metric?.margin ?? null,
      marginUnit: metric?.marginUnit ?? null,
      turnout: metric?.turnout ?? null,
    };
  });
}

function geographyClause(geographyId: string | null): { sql: string; params: Array<string | null> } {
  if (geographyId == null) return { sql: "o.geography_id IS NULL", params: [] };
  return { sql: "o.geography_id = ?", params: [geographyId] };
}

function loadSeats(db: DatabaseSync, countryId: string, geographyId: string | null): JurisdictionSeat[] {
  const geo = geographyClause(geographyId);
  const rows = db
    .prepare(
      `SELECT o.id_namespace, o.office_id, o.name, o.office_type,
              s.current_holder_label, s.current_holder_party_label,
              since.label AS since_label,
              s.last_share, s.last_share_unit,
              next.label AS next_label, next.year AS next_year, next.month AS next_month, next.day AS next_day
       FROM office o
       LEFT JOIN derived_seat_status s
         ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id
       LEFT JOIN research_date since ON since.date_id = s.current_since_date_id
       LEFT JOIN research_date next ON next.date_id = o.next_date_id
       WHERE o.country_id = ? AND ${geo.sql}`,
    )
    .all(countryId, ...geo.params);

  const dates = new Map<string, string[]>();
  if (tableExists(db, "election_event") && tableExists(db, "research_date")) {
    const eventRows = db
      .prepare(
        `SELECT o.id_namespace, o.office_id,
                printf('%04d-%02d-%02d', d.year, d.month, d.day) AS iso_date
         FROM office o
         JOIN election_event e ON e.id_namespace = o.id_namespace AND e.office_id = o.office_id
         JOIN research_date d ON d.date_id = e.date_id
         WHERE o.country_id = ? AND ${geo.sql}
           AND e.date_resolution = 'resolved'
           AND d.precision = 'day'
           AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL`,
      )
      .all(countryId, ...geo.params);
    for (const row of eventRows) {
      const id = `${text(row.id_namespace)}:${text(row.office_id)}`;
      const list = dates.get(id) ?? [];
      const iso = text(row.iso_date);
      if (iso && !list.includes(iso)) list.push(iso);
      dates.set(id, list);
    }
  }

  const seats: JurisdictionSeat[] = rows.map((row) => {
    const holder = textOrNull(row.current_holder_label);
    const party = textOrNull(row.current_holder_party_label);
    const id = `${text(row.id_namespace)}:${text(row.office_id)}`;
    return {
      id,
      officeId: text(row.office_id),
      name: text(row.name),
      executive: isExecutiveOfficeType(text(row.office_type)),
      heldBy: holder && party ? `${holder} · ${party}` : holder ?? party,
      since: textOrNull(row.since_label),
      lastShare: numOrNull(row.last_share),
      lastShareUnit: textOrNull(row.last_share_unit),
      eventDates: (dates.get(id) ?? []).sort(),
      nextLabel: textOrNull(row.next_label),
      nextYear: numOrNull(row.next_year),
      nextMonth: numOrNull(row.next_month),
      nextDay: numOrNull(row.next_day),
    };
  });
  seats.sort(compareSeats);
  return seats;
}

function loadCycles(db: DatabaseSync, jurisdictionKey: string, countryId: string): JurisdictionCycle[] {
  if (!tableExists(db, "derived_cycle")) return [];
  const canMatchContests =
    tableExists(db, "election_event") && tableExists(db, "research_date") && tableExists(db, "office");
  const cycles = (
    canMatchContests
      ? db
          .prepare(
            `WITH RECURSIVE descent AS (
               SELECT jurisdiction_key FROM derived_jurisdiction WHERE jurisdiction_key = ?
               UNION ALL
               SELECT j.jurisdiction_key
               FROM derived_jurisdiction j
               JOIN descent d ON j.parent_key = d.jurisdiction_key
             )
             SELECT DISTINCT c.cycle_key, c.iso_date, c.contest_count, c.label
             FROM derived_cycle c
             JOIN election_event e ON e.date_resolution = 'resolved'
             JOIN research_date d ON d.date_id = e.date_id
               AND d.precision = 'day'
               AND printf('%04d-%02d-%02d', d.year, d.month, d.day) = c.iso_date
             JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id AND o.country_id = c.country_id
             JOIN derived_jurisdiction place
               ON place.country_id = o.country_id AND place.geography_id = o.geography_id
             WHERE c.country_id = ?
               AND place.jurisdiction_key IN (SELECT jurisdiction_key FROM descent)
             ORDER BY c.iso_date, c.cycle_key`,
          )
          .all(jurisdictionKey, countryId)
      : db
          .prepare(
            `WITH RECURSIVE descent AS (
               SELECT jurisdiction_key FROM derived_jurisdiction WHERE jurisdiction_key = ?
               UNION ALL
               SELECT j.jurisdiction_key
               FROM derived_jurisdiction j
               JOIN descent d ON j.parent_key = d.jurisdiction_key
             )
             SELECT c.cycle_key, c.iso_date, c.contest_count, c.label
             FROM derived_cycle c
             WHERE c.country_id = ?
               AND c.scope_key IN (SELECT jurisdiction_key FROM descent)
             ORDER BY c.iso_date, c.cycle_key`,
          )
          .all(jurisdictionKey, countryId)
  ).map((row) => ({
    id: text(row.cycle_key),
    isoDate: text(row.iso_date),
    year: text(row.iso_date).slice(0, 4),
    contestCount: num(row.contest_count),
    label: text(row.label),
    hasResults: false,
    eventId: null as string | null,
  }));
  if (cycles.length === 0 || !canMatchContests) return cycles;

  const hasResultTable = tableExists(db, "result_row");
  const dates = cycles.map((cycle) => cycle.isoDate);
  const placeholders = dates.map(() => "?").join(", ");
  const withheld = [...WITHHELD_EVIDENCE];
  const withheldPlaceholders = withheld.map(() => "?").join(", ");
  const hasRowSql = hasResultTable
    ? `EXISTS (
                SELECT 1 FROM result_row r
                WHERE r.id_namespace = e.id_namespace
                  AND r.office_id = e.office_id
                  AND r.history_key = e.history_key
                  AND r.evidence_status NOT IN (${withheldPlaceholders})
              )`
    : "0";
  const events = db
    .prepare(
      `WITH RECURSIVE descent AS (
         SELECT jurisdiction_key FROM derived_jurisdiction WHERE jurisdiction_key = ?
         UNION ALL
         SELECT j.jurisdiction_key
         FROM derived_jurisdiction j
         JOIN descent d ON j.parent_key = d.jurisdiction_key
       )
       SELECT printf('%04d-%02d-%02d', d.year, d.month, d.day) AS iso_date,
              e.event_id,
              ${hasRowSql} AS has_row
       FROM election_event e
       JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
       JOIN research_date d ON d.date_id = e.date_id
       JOIN derived_jurisdiction place
         ON place.country_id = o.country_id AND place.geography_id = o.geography_id
       WHERE o.country_id = ?
         AND place.jurisdiction_key IN (SELECT jurisdiction_key FROM descent)
         AND e.date_resolution = 'resolved'
         AND d.precision = 'day'
         AND printf('%04d-%02d-%02d', d.year, d.month, d.day) IN (${placeholders})`,
    )
    .all(jurisdictionKey, ...(hasResultTable ? withheld : []), countryId, ...dates);

  const byDate = new Map<string, { eventIds: string[]; hasResults: boolean }>();
  for (const row of events) {
    const iso = text(row.iso_date);
    const bucket = byDate.get(iso) ?? { eventIds: [], hasResults: false };
    const eventId = text(row.event_id);
    if (eventId && !bucket.eventIds.includes(eventId)) bucket.eventIds.push(eventId);
    if (num(row.has_row) === 1) bucket.hasResults = true;
    byDate.set(iso, bucket);
  }
  return cycles.map((cycle) => {
    const bucket = byDate.get(cycle.isoDate);
    return {
      ...cycle,
      hasResults: bucket?.hasResults ?? false,
      eventId: cycle.contestCount === 1 && bucket?.eventIds.length === 1 ? bucket.eventIds[0]! : null,
    };
  });
}

export function loadJurisdictionView(slugPath: string, sqlitePath = resolveAtlasSqlitePath()): JurisdictionView | null {
  if (!existsSync(sqlitePath)) return null;
  return withRead(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return null;
    const row = db
      .prepare(`SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE slug_path = ?`)
      .get(slugPath);
    if (!row) return null;
    const jurisdiction = mapJurisdiction(row);
    const chain = loadAncestors(db, jurisdiction.jurisdictionKey);
    const country = chain.find((item) => item.depth === 0);
    const parent = chain.length >= 2 ? chain[chain.length - 2] : undefined;
    const seats = loadSeats(db, jurisdiction.countryId, jurisdiction.geographyId);
    return {
      jurisdiction,
      countryName: country?.name ?? jurisdiction.name,
      parentName: parent && parent.key !== jurisdiction.jurisdictionKey ? parent.name : null,
      ancestors: chain
        .filter((item) => item.key !== jurisdiction.jurisdictionKey)
        .map((item) => ({ name: item.name, slugPath: item.slugPath })),
      coverage: loadCoverage(db, jurisdiction.jurisdictionKey),
      children: loadChildren(db, jurisdiction.jurisdictionKey),
      seats,
      cycles: loadCycles(db, jurisdiction.jurisdictionKey, jurisdiction.countryId),
      nextElectionLabel: earliestNextElectionLabel(seats),
    };
  });
}

export function listJurisdictionSlugPaths(sqlitePath = resolveAtlasSqlitePath()): string[] {
  if (!existsSync(sqlitePath)) return [];
  return withRead(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return [];
    return db
      .prepare("SELECT slug_path FROM derived_jurisdiction ORDER BY slug_path")
      .all()
      .map((row) => text(row.slug_path));
  });
}

export function listCountryCards(sqlitePath = resolveAtlasSqlitePath()): CountryCard[] {
  if (!existsSync(sqlitePath)) return [];
  return withRead(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return [];
    return db
      .prepare(
        `SELECT j.country_id, j.slug_path, j.jurisdiction_key,
                c.offices, c.offices_with_any_event, c.offices_with_results,
                c.events_total, c.events_with_results, c.not_supplied_next_dates, c.latest_snapshot_label
         FROM derived_jurisdiction j
         LEFT JOIN derived_coverage c ON c.jurisdiction_key = j.jurisdiction_key
         WHERE j.depth = 0
         ORDER BY j.slug_path`,
      )
      .all()
      .map((row) => ({
        countryId: text(row.country_id),
        slugPath: text(row.slug_path),
        coverage:
          row.offices == null
            ? null
            : mapCoverage({
                jurisdiction_key: row.jurisdiction_key,
                country_id: row.country_id,
                offices: row.offices,
                offices_with_any_event: row.offices_with_any_event,
                offices_with_results: row.offices_with_results,
                events_total: row.events_total,
                events_with_results: row.events_with_results,
                not_supplied_next_dates: row.not_supplied_next_dates,
                latest_snapshot_label: row.latest_snapshot_label,
              }),
      }));
  });
}

export function buildSitemapChunks(args: {
  staticEntries: SitemapEntry[];
  jurisdictionPaths: string[];
  cyclePaths?: string[];
  origin: string;
  limit?: number;
}): SitemapEntry[][] {
  const limit = args.limit ?? SITEMAP_URL_LIMIT;
  const jurisdictionEntries: SitemapEntry[] = args.jurisdictionPaths.map((slugPath) => ({
    url: `${args.origin}${jurisdictionPublicPath(slugPath)}`,
    changeFrequency: "weekly" as const,
    priority: slugPath.includes("/") ? 0.5 : 0.6,
  }));
  const cycleEntries: SitemapEntry[] = (args.cyclePaths ?? []).map((cyclePath) => ({
    url: `${args.origin}${cyclePath}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));
  const all = [...args.staticEntries, ...jurisdictionEntries, ...cycleEntries];
  if (all.length <= limit) return [all];
  const chunks: SitemapEntry[][] = [];
  for (let index = 0; index < all.length; index += limit) {
    chunks.push(all.slice(index, index + limit));
  }
  return chunks;
}
