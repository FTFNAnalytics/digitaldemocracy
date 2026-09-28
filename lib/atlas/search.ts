import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { resolveAtlasSqlitePath } from "./paths";
import { atlasRoutes, cyclePublicPath } from "./routes";
import {
  SEARCH_DEFAULT_LIMIT,
  type SearchMode,
  type SearchQuery,
} from "./search-params";
import { bm25Score, compareRanked, rankScore, regionRank } from "./search/rank";
import { foldSearchText, highlightSnippet, prefixUpperBound, searchTokens, tokensMatch, trigramsForToken } from "./search/text";
import { openAtlasDatabase, tableExists } from "./sqlite";

export type { SearchMode, SearchQuery } from "./search-params";
export { SEARCH_ENGINE, sqliteFts5Enabled } from "./search/schema";
export { SEARCH_QUERY_MAX, SearchInputError, parseAtlasSearchParams, searchModeLabel } from "./search-params";

export type SearchHit = {
  mode: SearchMode;
  title: string;
  snippet: string;
  disambiguation: string;
  href: string;
  countryId: string;
  countryName: string;
  year: number | null;
  officeId: string | null;
  /** Namespace and office id, for the explorer join. Omitted from the public API. */
  joinKey: string;
};

type Doc = {
  searchId: number;
  title: string;
  folded: string;
  display: string;
  disambiguation: string;
  countryId: string;
  countryName: string;
  regionId: string;
  year: number | null;
  tokenCount: number;
  href: string;
  officeId: string | null;
  joinKey: string;
};

const MODE_TABLE = {
  seat: { table: "search_seat", trigram: "search_seat_trigram" },
  cycle: { table: "search_cycle", trigram: "search_cycle_trigram" },
  candidate: { table: "search_candidate", trigram: "search_candidate_trigram" },
} as const;

function cycleResultHref(row: Record<string, unknown>, countryId: string): string {
  const isoDate = text(row.iso_date);
  const slugPath = textOrNull(row.slug_path);
  if (!isoDate || !slugPath) return atlasRoutes.country(countryId);
  const segments = slugPath.split("/").filter((segment) => segment.length > 0);
  const countrySlug = segments[0];
  if (!countrySlug) return atlasRoutes.country(countryId);
  return cyclePublicPath(countrySlug, isoDate, segments.slice(1));
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function chunks<T>(values: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < values.length; index += size) groups.push(values.slice(index, index + size));
  return groups;
}

function trigramIds(db: DatabaseSync, table: string, grams: string[]): number[] {
  if (grams.length === 0) return [];
  const placeholders = grams.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT search_id FROM ${table}
       WHERE trigram IN (${placeholders})
       GROUP BY search_id
       HAVING COUNT(DISTINCT trigram) = ?`,
    )
    .all(...grams, grams.length) as Array<{ search_id: number }>;
  return rows.map((row) => Number(row.search_id));
}

function candidateIds(db: DatabaseSync, mode: SearchMode, queryTokens: string[]): number[] | null {
  const table = MODE_TABLE[mode].trigram;
  let selected: Set<number> | null = null;
  for (const token of queryTokens) {
    const grams = trigramsForToken(token);
    if (grams.length === 0) continue;
    const ids = new Set<number>(trigramIds(db, table, grams));
    selected =
      selected == null
        ? ids
        : new Set<number>([...selected].filter((id: number) => ids.has(id)));
    if (selected.size === 0) return [];
  }
  return selected == null ? null : [...selected];
}

function filterClause(mode: SearchMode): { sql: string; bind: (query: SearchQuery) => unknown[] } {
  const country = "(? IS NULL OR country_id = ?)";
  if (mode === "candidate") {
    return {
      sql: `${country}
        AND (? IS NULL OR EXISTS (SELECT 1 FROM json_each(levels_json) WHERE value = ?))
        AND (? IS NULL OR EXISTS (
          SELECT 1 FROM json_each(years_json)
          WHERE (? IS NULL OR CAST(value AS INTEGER) >= ?)
            AND (? IS NULL OR CAST(value AS INTEGER) <= ?)
        ))`,
      bind: (query) => [
        query.country ?? null,
        query.country ?? null,
        query.level ?? null,
        query.level ?? null,
        query.yearFrom == null && query.yearTo == null ? null : 1,
        query.yearFrom ?? null,
        query.yearFrom ?? null,
        query.yearTo ?? null,
        query.yearTo ?? null,
      ],
    };
  }
  const level =
    mode === "seat"
      ? "(? IS NULL OR level_label = ? OR tier = ?)"
      : "(? IS NULL OR level_label = ?)";
  return {
    sql: `${country} AND ${level}
      AND (? IS NULL OR (event_year IS NOT NULL AND event_year >= ?))
      AND (? IS NULL OR (event_year IS NOT NULL AND event_year <= ?))`,
    bind: (query) => {
      const levelBinds =
        mode === "seat"
          ? [query.level ?? null, query.level ?? null, query.level ?? null]
          : [query.level ?? null, query.level ?? null];
      return [
        query.country ?? null,
        query.country ?? null,
        ...levelBinds,
        query.yearFrom ?? null,
        query.yearFrom ?? null,
        query.yearTo ?? null,
        query.yearTo ?? null,
      ];
    },
  };
}

function mapRow(mode: SearchMode, row: Record<string, unknown>): Doc {
  if (mode === "seat") {
    const officeName = text(row.office_name);
    const geography = textOrNull(row.geography_name);
    const countryName = text(row.country_name);
    const officeId = text(row.office_id);
    return {
      searchId: Number(row.search_id),
      title: officeName,
      folded: text(row.folded),
      display: [officeName, text(row.office_type).replaceAll("_", " "), geography ?? "place not supplied", countryName].join(" · "),
      disambiguation: text(row.disambiguation),
      countryId: text(row.country_id),
      countryName,
      regionId: text(row.region_id),
      year: numOrNull(row.event_year),
      tokenCount: Number(row.token_count),
      href: atlasRoutes.office(officeId),
      officeId,
      joinKey: `${text(row.id_namespace)}\u0000${officeId}`,
    };
  }
  if (mode === "cycle") {
    const countryId = text(row.country_id);
    return {
      searchId: Number(row.search_id),
      title: text(row.label),
      folded: text(row.folded),
      display: text(row.label),
      disambiguation: text(row.disambiguation),
      countryId,
      countryName: text(row.country_name) || countryId,
      regionId: text(row.region_id),
      year: numOrNull(row.event_year),
      tokenCount: Number(row.token_count),
      href: cycleResultHref(row, countryId),
      officeId: null,
      joinKey: text(row.cycle_key),
    };
  }
  const label = text(row.label);
  const countryId = text(row.country_id);
  const offices = JSON.parse(text(row.offices_json) || "[]") as Array<{ officeId?: string }>;
  const onlyOffice = offices.length === 1 ? (offices[0]?.officeId ?? null) : null;
  const params = new URLSearchParams({ mode: "candidate", q: label, country: countryId });
  return {
    searchId: Number(row.search_id),
    title: label,
    folded: text(row.folded),
    display: label,
    disambiguation: text(row.disambiguation),
    countryId,
    countryName: text(row.country_name),
    regionId: text(row.region_id),
    year: numOrNull(row.event_year),
    tokenCount: Number(row.token_count),
    href: onlyOffice ? atlasRoutes.office(onlyOffice) : `${atlasRoutes.search}?${params.toString()}`,
    officeId: onlyOffice,
    joinKey: `${countryId}\u0000${label}\u0000${text(row.party_key)}`,
  };
}

const SELECT_LIST: Record<SearchMode, string> = {
  seat: `search_id, id_namespace, office_id, office_name, office_type, geography_name, country_name,
         country_id, region_id, disambiguation, event_year, folded, token_count`,
  cycle: `search_id, cycle_key, label, country_id, country_name, region_id, iso_date, slug_path, disambiguation, event_year, folded, token_count`,
  candidate: `search_id, label, country_id, country_name, region_id, party_key, offices_json, disambiguation,
              event_year, folded, token_count`,
};

function loadDocs(db: DatabaseSync, mode: SearchMode, query: SearchQuery, ids: number[] | null): Doc[] {
  if (ids && ids.length === 0) return [];
  const filter = filterClause(mode);
  const table = MODE_TABLE[mode].table;
  const groups = ids == null ? [null] : chunks(ids, 400);
  const docs: Doc[] = [];
  for (const group of groups) {
    const idSql = group == null ? "" : ` AND search_id IN (${group.map(() => "?").join(", ")})`;
    const rows = db
      .prepare(`SELECT ${SELECT_LIST[mode]} FROM ${table} WHERE ${filter.sql}${idSql}`)
      .all(...filter.bind(query), ...(group ?? [])) as Array<Record<string, unknown>>;
    for (const row of rows) docs.push(mapRow(mode, row));
  }
  return docs;
}

function loadTerms(db: DatabaseSync, mode: SearchMode, ids: number[]): Map<number, Map<string, number>> {
  const terms = new Map<number, Map<string, number>>();
  for (const group of chunks(ids, 400)) {
    if (group.length === 0) continue;
    const rows = db
      .prepare(
        `SELECT search_id, term, tf FROM search_token
         WHERE mode = ? AND search_id IN (${group.map(() => "?").join(", ")})`,
      )
      .all(mode, ...group) as Array<{ search_id: number; term: string; tf: number }>;
    for (const row of rows) {
      const id = Number(row.search_id);
      const bucket = terms.get(id) ?? new Map<string, number>();
      bucket.set(String(row.term), Number(row.tf));
      terms.set(id, bucket);
    }
  }
  return terms;
}

function documentFrequency(db: DatabaseSync, mode: SearchMode, token: string): number {
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT search_id) AS n FROM search_token
       WHERE mode = ? AND term >= ? AND term < ?`,
    )
    .get(mode, token, prefixUpperBound(token)) as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

export function searchDatabase(db: DatabaseSync, query: SearchQuery): SearchHit[] {
  const mode = query.mode;
  if (!tableExists(db, MODE_TABLE[mode].table)) return [];
  const foldedQuery = foldSearchText(query.q);
  const queryTokens = searchTokens(foldedQuery);
  if (queryTokens.length === 0) return [];

  const ids = candidateIds(db, mode, queryTokens);
  const docs = loadDocs(db, mode, query, ids).filter((doc) => tokensMatch(searchTokens(doc.folded), queryTokens));
  if (docs.length === 0) return [];

  const meta = db.prepare("SELECT doc_count, avg_tokens FROM search_meta WHERE mode = ?").get(mode) as
    | { doc_count?: number; avg_tokens?: number }
    | undefined;
  const docCount = Number(meta?.doc_count ?? docs.length);
  const avgTokens = Number(meta?.avg_tokens ?? 1);
  const frequencies = queryTokens.map((token) => documentFrequency(db, mode, token));
  const terms = loadTerms(
    db,
    mode,
    docs.map((doc) => doc.searchId),
  );

  const ranked = docs.map((doc) => {
    const bm25 = bm25Score(terms.get(doc.searchId) ?? new Map(), doc.tokenCount, queryTokens, frequencies, docCount, avgTokens);
    const exact = foldSearchText(doc.title) === foldedQuery;
    const score = rankScore(bm25, exact, doc.year);
    return { doc, score };
  });
  ranked.sort((left, right) =>
    compareRanked(
      {
        score: left.score,
        regionRank: regionRank(left.doc.regionId),
        year: left.doc.year,
        title: left.doc.title,
        searchId: left.doc.searchId,
      },
      {
        score: right.score,
        regionRank: regionRank(right.doc.regionId),
        year: right.doc.year,
        title: right.doc.title,
        searchId: right.doc.searchId,
      },
    ),
  );

  const limit = query.limit > 0 ? query.limit : SEARCH_DEFAULT_LIMIT;
  return ranked.slice(0, limit).map(({ doc }) => ({
    mode,
    title: doc.title,
    snippet: highlightSnippet(doc.display, queryTokens),
    disambiguation: doc.disambiguation,
    href: doc.href,
    countryId: doc.countryId,
    countryName: doc.countryName,
    year: doc.year,
    officeId: doc.officeId,
    joinKey: doc.joinKey,
  }));
}

export function search(query: SearchQuery, sqlitePath = resolveAtlasSqlitePath()): SearchHit[] {
  if (!existsSync(sqlitePath)) return [];
  const db = openAtlasDatabase(sqlitePath, { readOnly: true });
  try {
    return searchDatabase(db, query);
  } finally {
    db.close();
  }
}

/** Fields safe to return from the public API. */
export function publicSearchHit(hit: SearchHit): Omit<SearchHit, "joinKey"> {
  return {
    mode: hit.mode,
    title: hit.title,
    snippet: hit.snippet,
    disambiguation: hit.disambiguation,
    href: hit.href,
    countryId: hit.countryId,
    countryName: hit.countryName,
    year: hit.year,
    officeId: hit.officeId,
  };
}
