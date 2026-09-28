import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import type { CyclePageModel } from "../cycle/read";
import { WITHHELD_EVIDENCE } from "../derive/seat";
import type { AtlasCycle, AtlasJurisdiction, AtlasSeatStatus } from "../derive/read";
import { getAtlasJurisdictionBySlug } from "../derive/read";
import { loadJurisdictionView, type JurisdictionView } from "../jurisdiction";
import { resolveAtlasSqlitePath } from "../paths";
import { lookupAtlasOffice } from "../read";
import { listOfficeCandidates, readSeatPage, type SeatPageModel } from "../seat/read";
import { openAtlasDatabase, tableExists } from "../sqlite";
import {
  BUNDLE_CONTEST_HEADER,
  BUNDLE_CYCLE_HEADER,
  BUNDLE_JURISDICTION_HEADER,
  BUNDLE_SEAT_HEADER,
  BUNDLE_UNPLACED_HEADER,
  CYCLE_PAGE_CSV_HEADER,
  JURISDICTION_PAGE_CSV_HEADER,
  PERSON_CSV_HEADER,
  SEAT_PAGE_CSV_HEADER,
} from "./columns";
import { AtlasQueryError, emptyCursorPage, pageFromRows, type CursorPage } from "./cursor";
import { joinIds, toCsv } from "./csv";

export const PERSON_DEPENDENCY = "OV-09";

const WITHHELD_LIST = [...WITHHELD_EVIDENCE];
const WITHHELD_SQL = WITHHELD_LIST.map(() => "?").join(", ");

const PERSON_COLUMNS = ["person_id", "canonical_label", "country_id", "review_status"] as const;
const ALIAS_COLUMNS = ["person_id", "country_id", "candidate_or_list_label", "review_status"] as const;

export type ExportProvenance = {
  sourceIds: string[];
  snapshotLabel: string | null;
  evidenceStatus: string | null;
  recordId: string;
  releaseId: string | null;
  idNamespace: string | null;
};

export type JurisdictionListItem = AtlasJurisdiction & { provenance: ExportProvenance };
export type SeatListItem = AtlasSeatStatus & { officeName: string | null; provenance: ExportProvenance };
export type CycleListItem = AtlasCycle & { provenance: ExportProvenance };

export type PersonAliasExport = { label: string; officeScope: string | null };

export type PersonHistoryExport = {
  year: number | null;
  election: string | null;
  seat: string | null;
  result: string | null;
  votes: number | null;
  share: number | null;
  margin: number | null;
  sourceIds: string[];
  snapshotLabel: string | null;
  evidenceStatus: string | null;
  recordId: string | null;
  releaseId: string | null;
};

export type PersonExport = {
  personId: string;
  slug: string;
  canonicalLabel: string;
  countryId: string;
  reviewStatus: string;
  aliases: PersonAliasExport[];
  history: PersonHistoryExport[];
};

export type PersonList = CursorPage<PersonExport> & {
  available: boolean;
  dependency: typeof PERSON_DEPENDENCY | null;
};

type SourceIndex = {
  country: string[];
  geography: Map<string, string[]>;
  office: Map<string, string[]>;
  event: Map<string, string[]>;
  result: Map<string, string[]>;
};

type ReleaseInfo = { releaseId: string | null; snapshotLabel: string | null };

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

function withDb<T>(sqlitePath: string, fallback: T, fn: (db: DatabaseSync) => T): T {
  if (!existsSync(sqlitePath)) return fallback;
  const db = openAtlasDatabase(sqlitePath, { readOnly: true });
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

function pushId(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key) ?? [];
  if (!list.includes(id)) list.push(id);
  map.set(key, list);
}

function sorted(ids: string[] | undefined): string[] {
  return [...(ids ?? [])].sort();
}

function sourceIndex(db: DatabaseSync, countryId: string): SourceIndex {
  const index: SourceIndex = {
    country: [],
    geography: new Map(),
    office: new Map(),
    event: new Map(),
    result: new Map(),
  };
  if (!tableExists(db, "record_locator") || !tableExists(db, "evidence_link") || !tableExists(db, "source")) {
    return index;
  }
  const rows = db
    .prepare(
      `SELECT l.entity_kind, l.geography_id, l.id_namespace, l.office_id, l.history_key, l.result_row_id, s.source_id
       FROM record_locator l
       JOIN evidence_link e ON e.record_key = l.record_key
       JOIN source s
         ON s.country_id = e.source_country_id
        AND s.source_namespace = e.source_namespace
        AND s.source_id = e.source_id
       WHERE l.country_id = ?
       ORDER BY s.source_id`,
    )
    .all(countryId);
  for (const row of rows) {
    const id = text(row.source_id);
    if (!id) continue;
    const kind = text(row.entity_kind);
    if (kind === "country") {
      if (!index.country.includes(id)) index.country.push(id);
    } else if (kind === "geography" && row.geography_id != null) {
      pushId(index.geography, text(row.geography_id), id);
    } else if (kind === "office") {
      pushId(index.office, `${text(row.id_namespace)}\t${text(row.office_id)}`, id);
    } else if (kind === "event") {
      pushId(index.event, `${text(row.id_namespace)}\t${text(row.office_id)}\t${text(row.history_key)}`, id);
    } else if (kind === "result_row") {
      pushId(index.result, `${text(row.id_namespace)}\t${text(row.result_row_id)}`, id);
    }
  }
  index.country.sort();
  return index;
}

function countryRelease(db: DatabaseSync, countryId: string): ReleaseInfo {
  if (!tableExists(db, "country") || !tableExists(db, "publication_release")) {
    return { releaseId: null, snapshotLabel: null };
  }
  const row = db
    .prepare(
      `SELECT p.release_id, r.research_snapshot_label
       FROM country c
       JOIN publication_release p ON p.lineage_id = c.lineage_id
       LEFT JOIN dataset_release r ON r.lineage_id = p.lineage_id AND r.release_id = p.release_id
       WHERE c.country_id = ?`,
    )
    .get(countryId);
  return {
    releaseId: textOrNull(row?.release_id),
    snapshotLabel: textOrNull(row?.research_snapshot_label),
  };
}

function coverageLabel(db: DatabaseSync, jurisdictionKey: string): string | null {
  if (!tableExists(db, "derived_coverage")) return null;
  const row = db
    .prepare(`SELECT latest_snapshot_label FROM derived_coverage WHERE jurisdiction_key = ?`)
    .get(jurisdictionKey);
  return textOrNull(row?.latest_snapshot_label);
}

function provenance(args: {
  sourceIds: string[];
  snapshotLabel: string | null;
  evidenceStatus: string | null;
  recordId: string;
  releaseId: string | null;
  idNamespace: string | null;
}): ExportProvenance {
  return {
    sourceIds: [...args.sourceIds].sort(),
    snapshotLabel: args.snapshotLabel,
    evidenceStatus: args.evidenceStatus,
    recordId: args.recordId,
    releaseId: args.releaseId,
    idNamespace: args.idNamespace,
  };
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

const JURISDICTION_COLUMNS = `jurisdiction_key, country_id, geography_id, parent_key, depth, level_label, name,
  slug, slug_path, office_count, event_count, first_event_year, last_event_year, coverage_status, ambiguous`;

export function listJurisdictionExport(
  args: { cursor: string | null; country: string | null; limit: number },
  sqlitePath = resolveAtlasSqlitePath(),
): CursorPage<JurisdictionListItem> {
  return withDb(sqlitePath, emptyCursorPage(args.limit), (db) => {
    if (!tableExists(db, "derived_jurisdiction")) return emptyCursorPage(args.limit);
    if (args.cursor) {
      const found = db
        .prepare(
          `SELECT 1 AS ok FROM derived_jurisdiction
           WHERE slug_path = ? AND (? IS NULL OR country_id = ?)`,
        )
        .get(args.cursor, args.country, args.country);
      if (!found) throw new AtlasQueryError("invalid_cursor");
    }
    const rows = db
      .prepare(
        `SELECT ${JURISDICTION_COLUMNS}
         FROM derived_jurisdiction
         WHERE (? IS NULL OR country_id = ?)
           AND (? IS NULL OR slug_path > ?)
         ORDER BY slug_path
         LIMIT ?`,
      )
      .all(args.country, args.country, args.cursor, args.cursor, args.limit + 1)
      .map((row) => mapJurisdiction(row));
    const page = pageFromRows(rows, args.limit, (row) => row.slugPath);
    const indexes = new Map<string, SourceIndex>();
    const releases = new Map<string, ReleaseInfo>();
    const items = page.items.map((row) => {
      let index = indexes.get(row.countryId);
      if (!index) {
        index = sourceIndex(db, row.countryId);
        indexes.set(row.countryId, index);
      }
      let release = releases.get(row.countryId);
      if (!release) {
        release = countryRelease(db, row.countryId);
        releases.set(row.countryId, release);
      }
      const sourceIds = row.geographyId ? sorted(index.geography.get(row.geographyId)) : index.country;
      return {
        ...row,
        provenance: provenance({
          sourceIds,
          snapshotLabel: coverageLabel(db, row.jurisdictionKey) ?? release.snapshotLabel,
          evidenceStatus: null,
          recordId: row.jurisdictionKey,
          releaseId: release.releaseId,
          idNamespace: null,
        }),
      };
    });
    return { items, pageSize: page.pageSize, nextCursor: page.nextCursor };
  });
}

export function listSeatExport(
  args: { cursor: string | null; country: string | null; limit: number },
  sqlitePath = resolveAtlasSqlitePath(),
): CursorPage<SeatListItem> {
  return withDb(sqlitePath, emptyCursorPage(args.limit), (db) => {
    if (!tableExists(db, "derived_seat_status")) return emptyCursorPage(args.limit);
    let cursorNs: string | null = null;
    let cursorOffice: string | null = null;
    if (args.cursor) {
      const split = args.cursor.split("\t");
      if (split.length !== 2 || !split[0] || !split[1]) throw new AtlasQueryError("invalid_cursor");
      cursorNs = split[0];
      cursorOffice = split[1];
      const found = db
        .prepare(
          `SELECT 1 AS ok FROM derived_seat_status
           WHERE id_namespace = ? AND office_id = ? AND (? IS NULL OR country_id = ?)`,
        )
        .get(cursorNs, cursorOffice, args.country, args.country);
      if (!found) throw new AtlasQueryError("invalid_cursor");
    }
    const rows = db
      .prepare(
        `SELECT s.id_namespace, s.office_id, s.country_id, o.name AS office_name,
                s.current_holder_label, s.current_holder_party_label, s.current_since_date_id,
                s.last_selected_event_id, s.last_share, s.last_share_unit, s.last_margin,
                s.next_date_id, s.status_reason, o.release_id
         FROM derived_seat_status s
         LEFT JOIN office o ON o.id_namespace = s.id_namespace AND o.office_id = s.office_id
         WHERE (? IS NULL OR s.country_id = ?)
           AND (
             ? IS NULL
             OR s.id_namespace > ?
             OR (s.id_namespace = ? AND s.office_id > ?)
           )
         ORDER BY s.id_namespace, s.office_id
         LIMIT ?`,
      )
      .all(
        args.country,
        args.country,
        cursorNs,
        cursorNs,
        cursorNs,
        cursorOffice,
        args.limit + 1,
      );
    const mapped = rows.map((row) => ({
      status: {
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
      } satisfies AtlasSeatStatus,
      officeName: textOrNull(row.office_name),
      releaseId: textOrNull(row.release_id),
    }));
    const page = pageFromRows(mapped, args.limit, (row) => `${row.status.idNamespace}\t${row.status.officeId}`);
    const indexes = new Map<string, SourceIndex>();
    const releases = new Map<string, ReleaseInfo>();
    const items = page.items.map((row) => {
      let index = indexes.get(row.status.countryId);
      if (!index) {
        index = sourceIndex(db, row.status.countryId);
        indexes.set(row.status.countryId, index);
      }
      let release = releases.get(row.status.countryId);
      if (!release) {
        release = countryRelease(db, row.status.countryId);
        releases.set(row.status.countryId, release);
      }
      return {
        ...row.status,
        officeName: row.officeName,
        provenance: provenance({
          sourceIds: sorted(index.office.get(`${row.status.idNamespace}\t${row.status.officeId}`)),
          snapshotLabel: release.snapshotLabel,
          evidenceStatus: null,
          recordId: `${row.status.idNamespace}:${row.status.officeId}`,
          releaseId: row.releaseId ?? release.releaseId,
          idNamespace: row.status.idNamespace,
        }),
      };
    });
    return { items, pageSize: page.pageSize, nextCursor: page.nextCursor };
  });
}

export function listCycleExport(
  args: { cursor: string | null; country: string | null; limit: number },
  sqlitePath = resolveAtlasSqlitePath(),
): CursorPage<CycleListItem> {
  return withDb(sqlitePath, emptyCursorPage(args.limit), (db) => {
    if (!tableExists(db, "derived_cycle")) return emptyCursorPage(args.limit);
    if (args.cursor) {
      const found = db
        .prepare(
          `SELECT 1 AS ok FROM derived_cycle WHERE cycle_key = ? AND (? IS NULL OR country_id = ?)`,
        )
        .get(args.cursor, args.country, args.country);
      if (!found) throw new AtlasQueryError("invalid_cursor");
    }
    const rows = db
      .prepare(
        `SELECT cycle_key, country_id, date_id, iso_date, contest_count, scope_key, tiers_json, kinds_json, label
         FROM derived_cycle
         WHERE (? IS NULL OR country_id = ?)
           AND (? IS NULL OR cycle_key > ?)
         ORDER BY cycle_key
         LIMIT ?`,
      )
      .all(args.country, args.country, args.cursor, args.cursor, args.limit + 1);
    const mapped = rows.map((row) => ({
      cycleKey: text(row.cycle_key),
      countryId: text(row.country_id),
      dateId: text(row.date_id),
      isoDate: text(row.iso_date),
      contestCount: num(row.contest_count),
      scopeKey: text(row.scope_key),
      tiers: jsonStrings(row.tiers_json),
      kinds: jsonStrings(row.kinds_json),
      label: text(row.label),
    }));
    const page = pageFromRows(mapped, args.limit, (row) => row.cycleKey);
    const indexes = new Map<string, SourceIndex>();
    const releases = new Map<string, ReleaseInfo>();
    const dateSources = new Map<string, string[]>();
    const items = page.items.map((row) => {
      let index = indexes.get(row.countryId);
      if (!index) {
        index = sourceIndex(db, row.countryId);
        indexes.set(row.countryId, index);
      }
      let release = releases.get(row.countryId);
      if (!release) {
        release = countryRelease(db, row.countryId);
        releases.set(row.countryId, release);
      }
      const dateKey = `${row.countryId}\t${row.isoDate}`;
      let sourceIds = dateSources.get(dateKey);
      if (!sourceIds) {
        sourceIds = eventSourceIdsForDate(db, index, row.countryId, row.isoDate);
        dateSources.set(dateKey, sourceIds);
      }
      return {
        ...row,
        provenance: provenance({
          sourceIds,
          snapshotLabel: coverageLabel(db, row.scopeKey) ?? release.snapshotLabel,
          evidenceStatus: null,
          recordId: row.cycleKey,
          releaseId: release.releaseId,
          idNamespace: null,
        }),
      };
    });
    return { items, pageSize: page.pageSize, nextCursor: page.nextCursor };
  });
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

function eventSourceIdsForDate(db: DatabaseSync, index: SourceIndex, countryId: string, isoDate: string): string[] {
  if (!tableExists(db, "election_event") || !tableExists(db, "research_date")) return [];
  const rows = db
    .prepare(
      `SELECT e.id_namespace, e.office_id, e.history_key
       FROM election_event e
       JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
       JOIN research_date d ON d.date_id = e.date_id
       WHERE o.country_id = ?
         AND d.precision = 'day'
         AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL
         AND printf('%04d-%02d-%02d', d.year, d.month, d.day) = ?`,
    )
    .all(countryId, isoDate);
  const ids = new Set<string>();
  for (const row of rows) {
    for (const id of index.event.get(`${text(row.id_namespace)}\t${text(row.office_id)}\t${text(row.history_key)}`) ?? []) {
      ids.add(id);
    }
  }
  return [...ids].sort();
}

export function withheldResultIds(db: DatabaseSync, idNamespace: string, officeId: string): Set<string> {
  if (!tableExists(db, "result_row")) return new Set();
  const rows = db
    .prepare(
      `SELECT result_row_id FROM result_row
       WHERE id_namespace = ? AND office_id = ? AND evidence_status IN (${WITHHELD_SQL})`,
    )
    .all(idNamespace, officeId, ...WITHHELD_LIST);
  return new Set(rows.map((row) => text(row.result_row_id)));
}

/** Page JSON with withheld proceeding rows removed. Unchanged when none are withheld. */
export function seatExportModel(model: SeatPageModel, withheldIds: Set<string>): SeatPageModel {
  if (withheldIds.size === 0) return model;
  return {
    ...model,
    history: model.history.map((row) => ({
      ...row,
      proceedings: row.proceedings.map((proceeding) => ({
        ...proceeding,
        results: proceeding.results.filter((result) => !withheldIds.has(result.id)),
      })),
    })),
  };
}

export function readSeatExport(
  idNamespace: string,
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): SeatPageModel | null {
  const model = readSeatPage(idNamespace, officeId, sqlitePath);
  if (!model) return null;
  return withDb(sqlitePath, model, (db) => seatExportModel(model, withheldResultIds(db, idNamespace, officeId)));
}

function splitSeatId(seatId: string): { idNamespace: string; officeId: string } | null {
  const index = seatId.indexOf(":");
  if (index <= 0 || index === seatId.length - 1) return null;
  return { idNamespace: seatId.slice(0, index), officeId: seatId.slice(index + 1) };
}

export function jurisdictionPageCsv(slugPath: string, sqlitePath = resolveAtlasSqlitePath()): string | null {
  const view = loadJurisdictionView(slugPath, sqlitePath);
  if (!view) return null;
  return withDb(sqlitePath, null, (db) => jurisdictionCsvFromView(db, view));
}

function jurisdictionCsvFromView(db: DatabaseSync, view: JurisdictionView): string {
  const index = sourceIndex(db, view.jurisdiction.countryId);
  const release = countryRelease(db, view.jurisdiction.countryId);
  const snapshot = view.coverage?.latestSnapshotLabel ?? release.snapshotLabel;
  const rows: Array<Array<string | number | null>> = [];
  for (const child of view.children) {
    const geographyId = geographyIdFor(db, child.id);
    const childSources = geographyId ? sorted(index.geography.get(geographyId)) : sorted(index.country);
    rows.push([
      "child",
      child.name,
      child.level,
      child.slugPath,
      child.id,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      joinIds(childSources),
      child.latestSnapshotLabel ?? snapshot,
      "",
      child.id,
      release.releaseId,
    ]);
  }
  for (const seat of view.seats) {
    const identity = splitSeatId(seat.id);
    const officeKey = identity ? `${identity.idNamespace}\t${identity.officeId}` : "";
    rows.push([
      "seat",
      seat.name,
      "",
      "",
      "",
      seat.officeId,
      identity?.idNamespace ?? "",
      seat.heldBy,
      seat.since,
      seat.lastShare,
      seat.lastShareUnit,
      "",
      "",
      "",
      "",
      joinIds(officeKey ? index.office.get(officeKey) : []),
      snapshot,
      "",
      seat.id,
      release.releaseId,
    ]);
  }
  for (const cycle of view.cycles) {
    rows.push([
      "cycle",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      cycle.id,
      cycle.isoDate,
      cycle.contestCount,
      cycle.label,
      joinIds(eventSourceIdsForDate(db, index, view.jurisdiction.countryId, cycle.isoDate)),
      snapshot,
      "",
      cycle.id,
      release.releaseId,
    ]);
  }
  return toCsv(JURISDICTION_PAGE_CSV_HEADER, rows);
}

export function seatPageCsv(
  idNamespace: string,
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): string | null {
  const model = readSeatPage(idNamespace, officeId, sqlitePath);
  if (!model) return null;
  return withDb(sqlitePath, null, (db) => {
    const index = sourceIndex(db, model.countryId);
    const withheld = withheldResultIds(db, idNamespace, officeId);
    const rows: Array<Array<string | number | null>> = [];
    for (const row of model.history) {
      const standing = standingWinner(db, idNamespace, officeId, row.historyKey, withheld);
      const eventSources = index.event.get(`${idNamespace}\t${officeId}\t${row.historyKey}`) ?? [];
      const resultSources = standing ? index.result.get(`${idNamespace}\t${standing.resultRowId}`) ?? [] : [];
      const snap = model.provenance.find((item) => item.eventId === row.eventId);
      const release = eventRelease(db, idNamespace, row.eventId);
      rows.push([
        row.cycle,
        row.winner,
        row.party,
        row.votes,
        row.share,
        row.margin,
        row.turnout,
        joinIds([...eventSources, ...resultSources]),
        snap?.snapshotLabel ?? null,
        standing?.evidenceStatus ?? null,
        row.eventId,
        row.historyKey,
        officeId,
        idNamespace,
        standing?.resultRowId ?? null,
        row.eventId,
        release,
      ]);
    }
    return toCsv(SEAT_PAGE_CSV_HEADER, rows);
  });
}

function geographyIdFor(db: DatabaseSync, jurisdictionKey: string): string | null {
  if (!tableExists(db, "derived_jurisdiction")) return null;
  const row = db
    .prepare(`SELECT geography_id FROM derived_jurisdiction WHERE jurisdiction_key = ?`)
    .get(jurisdictionKey);
  return textOrNull(row?.geography_id);
}

function standingWinner(
  db: DatabaseSync,
  idNamespace: string,
  officeId: string,
  historyKey: string,
  withheld: Set<string>,
): { resultRowId: string; evidenceStatus: string } | null {
  if (!tableExists(db, "result_row")) return null;
  const event = tableExists(db, "election_event")
    ? db
        .prepare(
          `SELECT legal_outcome, record_state FROM election_event
           WHERE id_namespace = ? AND office_id = ? AND history_key = ?`,
        )
        .get(idNamespace, officeId, historyKey)
    : undefined;
  if (event) {
    const outcome = text(event.legal_outcome);
    const state = text(event.record_state);
    if (outcome === "superseded" || outcome === "annulled" || state === "superseded" || state === "withdrawn") {
      return null;
    }
  }
  const rows = db
    .prepare(
      `SELECT r.result_row_id, r.evidence_status, p.legal_outcome
       FROM result_row r
       LEFT JOIN proceeding p
         ON p.id_namespace = r.id_namespace AND p.office_id = r.office_id
        AND p.history_key = r.history_key AND p.proceeding_id = r.proceeding_id
       WHERE r.id_namespace = ? AND r.office_id = ? AND r.history_key = ? AND r.elected_flag = 1
       ORDER BY r.result_row_id`,
    )
    .all(idNamespace, officeId, historyKey)
    .filter((row) => {
      if (withheld.has(text(row.result_row_id)) || WITHHELD_EVIDENCE.has(text(row.evidence_status))) return false;
      const outcome = text(row.legal_outcome);
      return outcome !== "superseded" && outcome !== "annulled";
    });
  if (rows.length !== 1) return null;
  return { resultRowId: text(rows[0]?.result_row_id), evidenceStatus: text(rows[0]?.evidence_status) };
}

function eventRelease(db: DatabaseSync, idNamespace: string, eventId: string): string | null {
  if (!tableExists(db, "election_event")) return null;
  const row = db
    .prepare(`SELECT release_id FROM election_event WHERE id_namespace = ? AND event_id = ?`)
    .get(idNamespace, eventId);
  return textOrNull(row?.release_id);
}

export function cyclePageCsv(model: CyclePageModel, sqlitePath = resolveAtlasSqlitePath()): string {
  return withDb(sqlitePath, toCsv(CYCLE_PAGE_CSV_HEADER, []), (db) => {
    const countryId = countryIdForSlug(db, model.path.split("/")[2] ?? "") ?? "";
    const index = countryId ? sourceIndex(db, countryId) : emptySourceIndex();
    const rows: Array<Array<string | number | boolean | null>> = [];
    for (const contest of model.contests) {
      const eventSources = index.event.get(
        `${contest.record.idNamespace}\t${contest.officeId}\t${contest.record.historyKey}`,
      );
      for (const result of contest.results) {
        if (WITHHELD_EVIDENCE.has(result.evidenceStatus)) continue;
        const resultSources = index.result.get(`${contest.record.idNamespace}\t${result.id}`);
        rows.push([
          contest.officeName,
          result.label,
          result.partyLabel,
          result.votes,
          result.votesStatus,
          result.share,
          result.shareStatus,
          result.shareUnit,
          result.seats,
          result.seatsStatus,
          result.elected,
          joinIds([...(eventSources ?? []), ...(resultSources ?? [])]),
          contest.provenance.snapshotLabel,
          result.evidenceStatus,
          contest.eventId,
          contest.record.historyKey,
          contest.officeId,
          contest.record.idNamespace,
          result.id,
          result.id,
          contest.record.releaseId,
        ]);
      }
    }
    return toCsv(CYCLE_PAGE_CSV_HEADER, rows);
  });
}

function emptySourceIndex(): SourceIndex {
  return { country: [], geography: new Map(), office: new Map(), event: new Map(), result: new Map() };
}

function countryIdForSlug(db: DatabaseSync, slug: string): string | null {
  if (!slug || !tableExists(db, "derived_jurisdiction")) return null;
  const row = db
    .prepare(`SELECT country_id FROM derived_jurisdiction WHERE slug = ? AND depth = 0`)
    .get(slug);
  return textOrNull(row?.country_id);
}

export type JurisdictionHit =
  | { status: "ready"; view: JurisdictionView }
  | { status: "alias"; slugPath: string }
  | { status: "missing" };

export function resolveJurisdictionExport(slugPath: string, sqlitePath = resolveAtlasSqlitePath()): JurisdictionHit {
  const match = getAtlasJurisdictionBySlug(slugPath, sqlitePath);
  if (!match) return { status: "missing" };
  if (match.aliasReason) return { status: "alias", slugPath: match.jurisdiction.slugPath };
  const view = loadJurisdictionView(match.jurisdiction.slugPath, sqlitePath);
  if (!view) return { status: "missing" };
  return { status: "ready", view };
}

export type SeatHit =
  | { status: "ready"; model: SeatPageModel }
  | { status: "ambiguous"; namespaces: string[]; candidates: ReturnType<typeof listOfficeCandidates> }
  | { status: "missing" };

export function resolveSeatExport(segments: string[], sqlitePath = resolveAtlasSqlitePath()): SeatHit {
  if (segments.length === 1) {
    const officeId = segments[0] ?? "";
    const lookup = lookupAtlasOffice(officeId, sqlitePath);
    if (lookup.status === "missing") return { status: "missing" };
    if (lookup.status === "ambiguous") {
      return { status: "ambiguous", namespaces: lookup.namespaces, candidates: listOfficeCandidates(officeId, sqlitePath) };
    }
    const model = readSeatExport(lookup.record.idNamespace, lookup.record.officeId, sqlitePath);
    return model ? { status: "ready", model } : { status: "missing" };
  }
  if (segments.length === 2) {
    const model = readSeatExport(segments[0] ?? "", segments[1] ?? "", sqlitePath);
    return model ? { status: "ready", model } : { status: "missing" };
  }
  return { status: "missing" };
}

export function columnSet(db: DatabaseSync, table: string): Set<string> {
  if (!tableExists(db, table)) return new Set();
  const names = db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((row) => text(row.name));
  return new Set(names);
}

export function personTablesReady(db: DatabaseSync): boolean {
  const person = columnSet(db, "person");
  const alias = columnSet(db, "person_alias");
  return PERSON_COLUMNS.every((column) => person.has(column)) && ALIAS_COLUMNS.every((column) => alias.has(column));
}

function personSlugColumn(db: DatabaseSync): boolean {
  return columnSet(db, "person").has("slug");
}

function aliasOfficeScope(db: DatabaseSync): boolean {
  return columnSet(db, "person_alias").has("office_scope");
}

export function listPersonExport(
  args: { cursor: string | null; country: string | null; limit: number },
  sqlitePath = resolveAtlasSqlitePath(),
): PersonList {
  const unavailable: PersonList = {
    available: false,
    dependency: PERSON_DEPENDENCY,
    ...emptyCursorPage<PersonExport>(args.limit),
  };
  return withDb(sqlitePath, unavailable, (db) => {
    if (!personTablesReady(db)) return unavailable;
    if (args.cursor) {
      const found = db
        .prepare(
          `SELECT 1 AS ok FROM person
           WHERE person_id = ? AND review_status = 'approved' AND (? IS NULL OR country_id = ?)`,
        )
        .get(args.cursor, args.country, args.country);
      if (!found) throw new AtlasQueryError("invalid_cursor");
    }
    const slugSelect = personSlugColumn(db) ? "slug" : "person_id AS slug";
    const rows = db
      .prepare(
        `SELECT person_id, ${slugSelect}, canonical_label, country_id, review_status
         FROM person
         WHERE review_status = 'approved'
           AND (? IS NULL OR country_id = ?)
           AND (? IS NULL OR person_id > ?)
         ORDER BY person_id
         LIMIT ?`,
      )
      .all(args.country, args.country, args.cursor, args.cursor, args.limit + 1);
    const page = pageFromRows(rows, args.limit, (row) => text(row.person_id));
    return {
      available: true,
      dependency: null,
      items: page.items.map((row) => readPersonRow(db, row)),
      pageSize: page.pageSize,
      nextCursor: page.nextCursor,
    };
  });
}

export type PersonRead =
  | { status: "unavailable" }
  | { status: "missing" }
  | { status: "ready"; person: PersonExport };

export function readPersonExport(slug: string, sqlitePath = resolveAtlasSqlitePath()): PersonRead {
  return withDb(sqlitePath, { status: "unavailable" } as PersonRead, (db) => {
    if (!personTablesReady(db)) return { status: "unavailable" };
    if (!slug) return { status: "missing" };
    const slugSelect = personSlugColumn(db) ? "slug" : "person_id AS slug";
    const row = personSlugColumn(db)
      ? db
          .prepare(
            `SELECT person_id, ${slugSelect}, canonical_label, country_id, review_status
             FROM person WHERE review_status = 'approved' AND (person_id = ? OR slug = ?)`,
          )
          .get(slug, slug)
      : db
          .prepare(
            `SELECT person_id, ${slugSelect}, canonical_label, country_id, review_status
             FROM person WHERE review_status = 'approved' AND person_id = ?`,
          )
          .get(slug);
    if (!row) return { status: "missing" };
    return { status: "ready", person: readPersonRow(db, row) };
  });
}

function readPersonRow(db: DatabaseSync, row: Record<string, unknown>): PersonExport {
  const personId = text(row.person_id);
  const scopeSelect = aliasOfficeScope(db) ? "office_scope" : "NULL AS office_scope";
  const countryId = text(row.country_id);
  const aliases = db
    .prepare(
      `SELECT candidate_or_list_label, ${scopeSelect}
       FROM person_alias
       WHERE person_id = ? AND review_status = 'approved'
       ORDER BY candidate_or_list_label`,
    )
    .all(personId)
    .map((alias) => ({
      label: text(alias.candidate_or_list_label),
      officeScope: textOrNull(alias.office_scope),
    }))
    .filter((alias) => aliasHasVisibleResult(db, countryId, alias.label));
  return {
    personId,
    slug: text(row.slug) || personId,
    canonicalLabel: text(row.canonical_label),
    countryId,
    reviewStatus: text(row.review_status),
    aliases,
    history: personHistory(db, personId),
  };
}

function aliasHasVisibleResult(db: DatabaseSync, countryId: string, label: string): boolean {
  if (!label || !tableExists(db, "result_row")) return false;
  const row = db
    .prepare(
      `SELECT 1 AS ok FROM result_row
       WHERE country_id = ? AND candidate_or_list_label = ? AND evidence_status NOT IN (${WITHHELD_SQL})
       LIMIT 1`,
    )
    .get(countryId, label, ...WITHHELD_LIST);
  return Boolean(row);
}

function personHistory(db: DatabaseSync, personId: string): PersonHistoryExport[] {
  if (!tableExists(db, "result_row") || !tableExists(db, "election_event") || !tableExists(db, "office")) return [];
  const index = sourceIndexForPerson(db, personId);
  const rows = db
    .prepare(
      `SELECT r.result_row_id, r.votes, r.share, r.elected_flag, r.evidence_status, r.release_id,
              r.id_namespace, r.office_id, r.history_key, o.name AS office_name,
              d.year AS date_year, d.label AS date_label, e.event_id, rel.research_snapshot_label
       FROM person_alias a
       JOIN result_row r
         ON r.country_id = a.country_id
        AND r.candidate_or_list_label = a.candidate_or_list_label
       JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
       JOIN election_event e
         ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
       LEFT JOIN research_date d ON d.date_id = e.date_id
       LEFT JOIN dataset_release rel ON rel.lineage_id = r.lineage_id AND rel.release_id = r.release_id
       WHERE a.person_id = ?
         AND a.review_status = 'approved'
         AND r.evidence_status NOT IN (${WITHHELD_SQL})
       ORDER BY d.year IS NULL, d.year, e.event_id, r.result_row_id`,
    )
    .all(personId, ...WITHHELD_LIST);
  return rows.map((row) => {
    const elected = numOrNull(row.elected_flag);
    const result = elected === 1 ? "elected" : elected === 0 ? "not elected" : null;
    const eventKey = `${text(row.id_namespace)}\t${text(row.office_id)}\t${text(row.history_key)}`;
    const resultKey = `${text(row.id_namespace)}\t${text(row.result_row_id)}`;
    return {
      year: numOrNull(row.date_year),
      election: textOrNull(row.date_label) ?? textOrNull(row.event_id),
      seat: textOrNull(row.office_name),
      result,
      votes: numOrNull(row.votes),
      share: numOrNull(row.share),
      margin: null,
      sourceIds: sorted([...(index.event.get(eventKey) ?? []), ...(index.result.get(resultKey) ?? [])]),
      snapshotLabel: textOrNull(row.research_snapshot_label),
      evidenceStatus: textOrNull(row.evidence_status),
      recordId: textOrNull(row.result_row_id),
      releaseId: textOrNull(row.release_id),
    };
  });
}

function sourceIndexForPerson(db: DatabaseSync, personId: string): SourceIndex {
  const country = db.prepare(`SELECT country_id FROM person WHERE person_id = ?`).get(personId);
  const countryId = textOrNull(country?.country_id);
  return countryId ? sourceIndex(db, countryId) : emptySourceIndex();
}

export function personCsv(person: PersonExport): string {
  const aliases = joinIds(person.aliases.map((alias) => alias.label));
  if (person.history.length === 0) {
    return toCsv(PERSON_CSV_HEADER, [
      [
        person.personId,
        person.slug,
        person.canonicalLabel,
        person.countryId,
        person.reviewStatus,
        aliases,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "",
        null,
        null,
        person.personId,
        null,
      ],
    ]);
  }
  return toCsv(
    PERSON_CSV_HEADER,
    person.history.map((row) => [
      person.personId,
      person.slug,
      person.canonicalLabel,
      person.countryId,
      person.reviewStatus,
      aliases,
      row.year,
      row.election,
      row.seat,
      row.result,
      row.votes,
      row.share,
      row.margin,
      joinIds(row.sourceIds),
      row.snapshotLabel,
      row.evidenceStatus,
      row.recordId,
      row.releaseId,
    ]),
  );
}

export type BundleFiles = Record<string, string>;

/** CSV members of one country bundle. Withheld result rows are omitted. */
export function countryBundleFiles(db: DatabaseSync, countryId: string): BundleFiles {
  const index = sourceIndex(db, countryId);
  const release = countryRelease(db, countryId);
  const jurisdictions = tableExists(db, "derived_jurisdiction")
    ? db
        .prepare(
          `SELECT ${JURISDICTION_COLUMNS} FROM derived_jurisdiction WHERE country_id = ? ORDER BY slug_path`,
        )
        .all(countryId)
        .map((row) => mapJurisdiction(row))
    : [];
  const jurisdictionCsv = toCsv(
    BUNDLE_JURISDICTION_HEADER,
    jurisdictions.map((row) => {
      const sourceIds = row.geographyId ? sorted(index.geography.get(row.geographyId)) : index.country;
      return [
        row.jurisdictionKey,
        row.countryId,
        row.geographyId,
        row.parentKey,
        row.depth,
        row.levelLabel,
        row.name,
        row.slug,
        row.slugPath,
        row.officeCount,
        row.eventCount,
        row.firstEventYear,
        row.lastEventYear,
        row.coverageStatus,
        row.ambiguous,
        joinIds(sourceIds),
        coverageLabel(db, row.jurisdictionKey) ?? release.snapshotLabel,
        "",
        row.jurisdictionKey,
        release.releaseId,
      ];
    }),
  );

  const seats = tableExists(db, "derived_seat_status")
    ? db
        .prepare(
          `SELECT s.id_namespace, s.office_id, s.country_id, o.name AS office_name,
                  s.current_holder_label, s.current_holder_party_label, s.current_since_date_id,
                  s.last_selected_event_id, s.last_share, s.last_share_unit, s.last_margin,
                  s.next_date_id, s.status_reason, o.release_id
           FROM derived_seat_status s
           LEFT JOIN office o ON o.id_namespace = s.id_namespace AND o.office_id = s.office_id
           WHERE s.country_id = ?
           ORDER BY s.id_namespace, s.office_id`,
        )
        .all(countryId)
    : [];
  const seatsCsv = toCsv(
    BUNDLE_SEAT_HEADER,
    seats.map((row) => [
      text(row.id_namespace),
      text(row.office_id),
      text(row.country_id),
      textOrNull(row.office_name),
      textOrNull(row.current_holder_label),
      textOrNull(row.current_holder_party_label),
      textOrNull(row.current_since_date_id),
      textOrNull(row.last_selected_event_id),
      numOrNull(row.last_share),
      textOrNull(row.last_share_unit),
      numOrNull(row.last_margin),
      textOrNull(row.next_date_id),
      textOrNull(row.status_reason),
      joinIds(index.office.get(`${text(row.id_namespace)}\t${text(row.office_id)}`)),
      release.snapshotLabel,
      "",
      `${text(row.id_namespace)}:${text(row.office_id)}`,
      textOrNull(row.release_id) ?? release.releaseId,
    ]),
  );

  const cycles = tableExists(db, "derived_cycle")
    ? db
        .prepare(
          `SELECT cycle_key, country_id, date_id, iso_date, contest_count, scope_key, tiers_json, kinds_json, label
           FROM derived_cycle WHERE country_id = ? ORDER BY iso_date, cycle_key`,
        )
        .all(countryId)
    : [];
  const cyclesCsv = toCsv(
    BUNDLE_CYCLE_HEADER,
    cycles.map((row) => [
      text(row.cycle_key),
      text(row.country_id),
      text(row.date_id),
      text(row.iso_date),
      num(row.contest_count),
      text(row.scope_key),
      joinIds(jsonStrings(row.tiers_json)),
      joinIds(jsonStrings(row.kinds_json)),
      text(row.label),
      joinIds(eventSourceIdsForDate(db, index, countryId, text(row.iso_date))),
      coverageLabel(db, text(row.scope_key)) ?? release.snapshotLabel,
      "",
      text(row.cycle_key),
      release.releaseId,
    ]),
  );

  const contests = contestRows(db, countryId, index);
  const contestsCsv = toCsv(BUNDLE_CONTEST_HEADER, contests);

  const unplaced = tableExists(db, "derived_cycle_unplaced")
    ? db
        .prepare(
          `SELECT id_namespace, office_id, history_key, country_id, year, date_id, date_precision, date_resolution
           FROM derived_cycle_unplaced WHERE country_id = ?
           ORDER BY year IS NULL, year, office_id, history_key`,
        )
        .all(countryId)
    : [];
  const unplacedCsv = toCsv(
    BUNDLE_UNPLACED_HEADER,
    unplaced.map((row) => [
      text(row.id_namespace),
      text(row.office_id),
      text(row.history_key),
      text(row.country_id),
      numOrNull(row.year),
      textOrNull(row.date_id),
      textOrNull(row.date_precision),
      text(row.date_resolution),
      joinIds(index.event.get(`${text(row.id_namespace)}\t${text(row.office_id)}\t${text(row.history_key)}`)),
      release.snapshotLabel,
      "",
      `${text(row.id_namespace)}:${text(row.office_id)}:${text(row.history_key)}`,
      release.releaseId,
    ]),
  );

  const people = personBundleRows(db, countryId);
  return {
    "jurisdictions.csv": jurisdictionCsv,
    "seats.csv": seatsCsv,
    "cycles.csv": cyclesCsv,
    "contests.csv": contestsCsv,
    "unplaced.csv": unplacedCsv,
    "people.csv": people,
    LICENSE: licenseText(db, countryId),
  };
}

function contestRows(db: DatabaseSync, countryId: string, index: SourceIndex): Array<Array<string | number | null>> {
  if (!tableExists(db, "result_row")) return [];
  const rows = db
    .prepare(
      `SELECT r.country_id, r.id_namespace, r.office_id, o.name AS office_name, e.event_id, r.history_key,
              CASE
                WHEN d.precision = 'day' AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL
                THEN printf('%04d-%02d-%02d', d.year, d.month, d.day)
                ELSE NULL
              END AS iso_date,
              r.candidate_or_list_label, r.original_party_label, r.votes, r.votes_status, r.share, r.share_status,
              r.share_unit, r.seats, r.seats_status, r.elected_flag, r.evidence_status, r.result_row_id, r.release_id,
              rel.research_snapshot_label
       FROM result_row r
       JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
       JOIN election_event e
         ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
       LEFT JOIN research_date d ON d.date_id = e.date_id
       LEFT JOIN dataset_release rel ON rel.lineage_id = r.lineage_id AND rel.release_id = r.release_id
       WHERE r.country_id = ?
         AND r.evidence_status NOT IN (${WITHHELD_SQL})
       ORDER BY iso_date IS NULL, iso_date, r.office_id, r.result_row_id`,
    )
    .all(countryId, ...WITHHELD_LIST);
  return rows.map((row) => {
    const eventKey = `${text(row.id_namespace)}\t${text(row.office_id)}\t${text(row.history_key)}`;
    const resultKey = `${text(row.id_namespace)}\t${text(row.result_row_id)}`;
    return [
      text(row.country_id),
      text(row.id_namespace),
      text(row.office_id),
      textOrNull(row.office_name),
      textOrNull(row.event_id),
      text(row.history_key),
      textOrNull(row.iso_date),
      textOrNull(row.candidate_or_list_label),
      textOrNull(row.original_party_label),
      numOrNull(row.votes),
      text(row.votes_status),
      numOrNull(row.share),
      text(row.share_status),
      text(row.share_unit),
      numOrNull(row.seats),
      text(row.seats_status),
      numOrNull(row.elected_flag),
      joinIds([...(index.event.get(eventKey) ?? []), ...(index.result.get(resultKey) ?? [])]),
      textOrNull(row.research_snapshot_label),
      text(row.evidence_status),
      text(row.result_row_id),
      text(row.result_row_id),
      textOrNull(row.release_id),
    ];
  });
}

function personBundleRows(db: DatabaseSync, countryId: string): string {
  if (!personTablesReady(db)) return toCsv(PERSON_CSV_HEADER, []);
  const people = db
    .prepare(
      `SELECT person_id FROM person
       WHERE country_id = ? AND review_status = 'approved'
       ORDER BY person_id`,
    )
    .all(countryId);
  const blocks = people.flatMap((row) => {
    const identity = personIdentity(db, text(row.person_id));
    return identity ? [personCsv(readPersonRow(db, identity))] : [];
  });
  if (blocks.length === 0) return toCsv(PERSON_CSV_HEADER, []);
  const header = PERSON_CSV_HEADER.join(",");
  const body = blocks
    .map((csv) => csv.split("\n").slice(1).filter((line) => line.length > 0).join("\n"))
    .filter((block) => block.length > 0)
    .join("\n");
  return body ? `${header}\n${body}\n` : `${header}\n`;
}

function personIdentity(db: DatabaseSync, personId: string): Record<string, unknown> | null {
  const slugSelect = personSlugColumn(db) ? "slug" : "person_id AS slug";
  const row = db
    .prepare(
      `SELECT person_id, ${slugSelect}, canonical_label, country_id, review_status
       FROM person WHERE person_id = ?`,
    )
    .get(personId);
  return row ?? null;
}

export function licenseText(db: DatabaseSync, countryId: string): string {
  const lines = [
    "Election Atlas country bundle",
    `country_id: ${countryId}`,
    "",
    "Data rights below are copied from the source table for this country.",
    'A data_rights value of "unknown" means that source row did not name a licence.',
    "This file does not add a licence the source table does not name.",
    "",
  ];
  if (!tableExists(db, "source")) {
    lines.push("The source table is not present in this database.");
    lines.push("");
    return `${lines.join("\n")}\n`;
  }
  const rows = db
    .prepare(
      `SELECT source_namespace, source_id, data_rights, publisher, title, url
       FROM source WHERE country_id = ?
       ORDER BY source_namespace, source_id`,
    )
    .all(countryId);
  if (rows.length === 0) {
    lines.push("The source table has no rows for this country.");
    lines.push("");
    return `${lines.join("\n")}\n`;
  }
  lines.push("source_namespace,source_id,data_rights,publisher,title,url");
  for (const row of rows) {
    lines.push(
      [text(row.source_namespace), text(row.source_id), text(row.data_rights), textOrNull(row.publisher), textOrNull(row.title), textOrNull(row.url)]
        .map((value) => {
          const cell = value ?? "";
          return /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
        })
        .join(","),
    );
  }
  if (!personTablesReady(db)) {
    lines.push("");
    lines.push("people.csv has column headers only. No person table is published in this database.");
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function listCountryIds(db: DatabaseSync): Array<{ countryId: string; slug: string; name: string }> {
  if (!tableExists(db, "derived_jurisdiction")) return [];
  return db
    .prepare(
      `SELECT country_id, slug, name FROM derived_jurisdiction WHERE depth = 0 ORDER BY slug`,
    )
    .all()
    .map((row) => ({
      countryId: text(row.country_id),
      slug: text(row.slug),
      name: text(row.name),
    }));
}
