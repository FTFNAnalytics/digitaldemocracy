import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { resolveAtlasSqlitePath } from "../paths";
import { openAtlasDatabase, tableExists } from "../sqlite";

export type AtlasJurisdiction = {
  jurisdictionKey: string;
  countryId: string;
  geographyId: string | null;
  parentKey: string | null;
  depth: number;
  levelLabel: string;
  name: string;
  slug: string;
  slugPath: string;
  officeCount: number;
  eventCount: number;
  firstEventYear: number | null;
  lastEventYear: number | null;
  coverageStatus: string;
  ambiguous: number;
};

export type AtlasJurisdictionMatch = {
  jurisdiction: AtlasJurisdiction;
  matchedSlugPath: string;
  aliasReason: string | null;
};

export type AtlasSlugAlias = {
  slugPath: string;
  jurisdictionKey: string;
  reason: string;
};

export type AtlasSeatStatus = {
  idNamespace: string;
  officeId: string;
  countryId: string;
  currentHolderLabel: string | null;
  currentHolderPartyLabel: string | null;
  currentSinceDateId: string | null;
  lastSelectedEventId: string | null;
  lastShare: number | null;
  lastShareUnit: string | null;
  lastMargin: number | null;
  nextDateId: string | null;
  statusReason: string | null;
};

export type AtlasCycle = {
  cycleKey: string;
  countryId: string;
  dateId: string;
  isoDate: string;
  contestCount: number;
  scopeKey: string;
  tiers: string[];
  kinds: string[];
  label: string;
};

export type AtlasUnplacedCycle = {
  idNamespace: string;
  officeId: string;
  historyKey: string;
  countryId: string;
  year: number | null;
  dateId: string | null;
  datePrecision: string | null;
  dateResolution: string;
};

export type AtlasCoverage = {
  jurisdictionKey: string;
  countryId: string;
  offices: number;
  officesWithAnyEvent: number;
  officesWithResults: number;
  eventsTotal: number;
  eventsWithResults: number;
  notSuppliedNextDates: number;
  latestSnapshotLabel: string | null;
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

function withDatabase<T>(sqlitePath: string, fallback: T, fn: (db: DatabaseSync) => T): T {
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

function jsonStrings(value: unknown): string[] {
  if (typeof value !== "string" || value === "") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

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

function mapSeat(row: Record<string, unknown>): AtlasSeatStatus {
  return {
    idNamespace: text(row.id_namespace),
    officeId: text(row.office_id),
    countryId: text(row.country_id),
    currentHolderLabel: textOrNull(row.current_holder_label),
    currentHolderPartyLabel: textOrNull(row.current_holder_party_label),
    currentSinceDateId: textOrNull(row.current_since_date_id),
    lastSelectedEventId: textOrNull(row.last_selected_event_id),
    lastShare: numOrNull(row.last_share),
    lastShareUnit: textOrNull(row.last_share_unit),
    lastMargin: numOrNull(row.last_margin),
    nextDateId: textOrNull(row.next_date_id),
    statusReason: textOrNull(row.status_reason),
  };
}

function mapCycle(row: Record<string, unknown>): AtlasCycle {
  return {
    cycleKey: text(row.cycle_key),
    countryId: text(row.country_id),
    dateId: text(row.date_id),
    isoDate: text(row.iso_date),
    contestCount: num(row.contest_count),
    scopeKey: text(row.scope_key),
    tiers: jsonStrings(row.tiers_json),
    kinds: jsonStrings(row.kinds_json),
    label: text(row.label),
  };
}

function mapUnplaced(row: Record<string, unknown>): AtlasUnplacedCycle {
  return {
    idNamespace: text(row.id_namespace),
    officeId: text(row.office_id),
    historyKey: text(row.history_key),
    countryId: text(row.country_id),
    year: numOrNull(row.year),
    dateId: textOrNull(row.date_id),
    datePrecision: textOrNull(row.date_precision),
    dateResolution: text(row.date_resolution),
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

const JURISDICTION_COLUMNS = `jurisdiction_key, country_id, geography_id, parent_key, depth, level_label, name,
  slug, slug_path, office_count, event_count, first_event_year, last_event_year, coverage_status, ambiguous`;

export function listAtlasJurisdictions(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasJurisdiction[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return [];
    return db
      .prepare(
        `SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE country_id = ? ORDER BY slug_path`,
      )
      .all(countryId)
      .map((row) => mapJurisdiction(row));
  });
}

export function getAtlasJurisdiction(
  jurisdictionKey: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasJurisdiction | null {
  return withDatabase(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return null;
    const row = db
      .prepare(`SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE jurisdiction_key = ?`)
      .get(jurisdictionKey);
    return row ? mapJurisdiction(row) : null;
  });
}

export function getAtlasJurisdictionBySlug(
  slugPath: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasJurisdictionMatch | null {
  return withDatabase(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return null;
    const canonical = db
      .prepare(`SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE slug_path = ?`)
      .get(slugPath);
    if (canonical) {
      return { jurisdiction: mapJurisdiction(canonical), matchedSlugPath: slugPath, aliasReason: null };
    }
    if (!tableExists(db, "derived_slug_alias")) return null;
    const alias = db
      .prepare(
        `SELECT ${JURISDICTION_COLUMNS}, a.reason AS alias_reason
         FROM derived_slug_alias a
         JOIN derived_jurisdiction j ON j.jurisdiction_key = a.jurisdiction_key
         WHERE a.slug_path = ?`,
      )
      .get(slugPath);
    if (!alias) return null;
    return {
      jurisdiction: mapJurisdiction(alias),
      matchedSlugPath: slugPath,
      aliasReason: textOrNull(alias.alias_reason),
    };
  });
}

export function listAtlasSlugAliases(sqlitePath = resolveAtlasSqlitePath()): AtlasSlugAlias[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_slug_alias")) return [];
    return db
      .prepare("SELECT slug_path, jurisdiction_key, reason FROM derived_slug_alias ORDER BY slug_path")
      .all()
      .map((row) => ({
        slugPath: text(row.slug_path),
        jurisdictionKey: text(row.jurisdiction_key),
        reason: text(row.reason),
      }));
  });
}

export function listAtlasSeatStatuses(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasSeatStatus[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_seat_status")) return [];
    return db
      .prepare(
        `SELECT id_namespace, office_id, country_id, current_holder_label, current_holder_party_label,
                current_since_date_id, last_selected_event_id, last_share, last_share_unit, last_margin,
                next_date_id, status_reason
         FROM derived_seat_status WHERE country_id = ?
         ORDER BY office_id, id_namespace`,
      )
      .all(countryId)
      .map((row) => mapSeat(row));
  });
}

export function getAtlasSeatStatus(
  idNamespace: string,
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasSeatStatus | null {
  return withDatabase(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_seat_status")) return null;
    const row = db
      .prepare(
        `SELECT id_namespace, office_id, country_id, current_holder_label, current_holder_party_label,
                current_since_date_id, last_selected_event_id, last_share, last_share_unit, last_margin,
                next_date_id, status_reason
         FROM derived_seat_status WHERE id_namespace = ? AND office_id = ?`,
      )
      .get(idNamespace, officeId);
    return row ? mapSeat(row) : null;
  });
}

export function listAtlasCycles(countryId: string, sqlitePath = resolveAtlasSqlitePath()): AtlasCycle[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_cycle")) return [];
    return db
      .prepare(
        `SELECT cycle_key, country_id, date_id, iso_date, contest_count, scope_key, tiers_json, kinds_json, label
         FROM derived_cycle WHERE country_id = ? ORDER BY iso_date, cycle_key`,
      )
      .all(countryId)
      .map((row) => mapCycle(row));
  });
}

export function listAtlasUnplacedCycles(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasUnplacedCycle[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_cycle_unplaced")) return [];
    return db
      .prepare(
        `SELECT id_namespace, office_id, history_key, country_id, year, date_id, date_precision, date_resolution
         FROM derived_cycle_unplaced WHERE country_id = ?
         ORDER BY year IS NULL, year, office_id, history_key`,
      )
      .all(countryId)
      .map((row) => mapUnplaced(row));
  });
}

export function listAtlasCoverage(countryId: string, sqlitePath = resolveAtlasSqlitePath()): AtlasCoverage[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "derived_coverage") || !tableExists(db, "derived_jurisdiction")) return [];
    return db
      .prepare(
        `SELECT c.jurisdiction_key, j.country_id, c.offices, c.offices_with_any_event, c.offices_with_results,
                c.events_total, c.events_with_results, c.not_supplied_next_dates, c.latest_snapshot_label
         FROM derived_coverage c
         JOIN derived_jurisdiction j ON j.jurisdiction_key = c.jurisdiction_key
         WHERE j.country_id = ?
         ORDER BY j.slug_path`,
      )
      .all(countryId)
      .map((row) => mapCoverage(row));
  });
}

export function getAtlasCoverage(
  jurisdictionKey: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasCoverage | null {
  return withDatabase(sqlitePath, null, (db) => {
    if (!tableExists(db, "derived_coverage") || !tableExists(db, "derived_jurisdiction")) return null;
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
  });
}
