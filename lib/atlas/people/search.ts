import type { DatabaseSync } from "node:sqlite";
import { WITHHELD_EVIDENCE } from "../derive/seat";
import { compareRanked, rankScore, regionRank } from "../search/rank";
import { foldSearchText, highlightSnippet, searchTokens, tokensMatch } from "../search/text";
import type { SearchQuery } from "../search-params";
import { tableExists } from "../sqlite";
import { atlasRoutes } from "../routes";
import { assignPersonSlugs } from "./slug";

export type PersonSearchHit = {
  personId: string;
  title: string;
  snippet: string;
  disambiguation: string;
  href: string;
  countryId: string;
  countryName: string;
  regionId: string;
  year: number | null;
};

type PersonGroup = {
  personId: string;
  canonical: string;
  countryId: string;
  countryName: string;
  regionId: string;
  aliases: string[];
  years: Set<number>;
  levels: Set<string>;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function approvedAliasKeys(db: DatabaseSync): Set<string> {
  if (!tableExists(db, "person_alias")) return new Set();
  const rows = db
    .prepare(
      `SELECT country_id, candidate_or_list_label
       FROM person_alias
       WHERE review_status = 'approved'`,
    )
    .all() as Array<{ country_id?: string; candidate_or_list_label?: string }>;
  return new Set(rows.map((row) => `${text(row.country_id)}\u0000${text(row.candidate_or_list_label)}`));
}

function loadGroups(db: DatabaseSync): PersonGroup[] {
  if (!tableExists(db, "person") || !tableExists(db, "person_alias")) return [];
  const rows = db
    .prepare(
      `SELECT p.person_id, p.canonical_label, p.country_id, c.name AS country_name, c.region_id,
              a.candidate_or_list_label
       FROM person p
       JOIN country c ON c.country_id = p.country_id
       JOIN person_alias a ON a.person_id = p.person_id AND a.review_status = 'approved'
       WHERE p.review_status = 'approved'
       ORDER BY p.person_id, a.candidate_or_list_label`,
    )
    .all() as Array<Record<string, unknown>>;
  const groups = new Map<string, PersonGroup>();
  for (const row of rows) {
    const personId = text(row.person_id);
    let group = groups.get(personId);
    if (!group) {
      group = {
        personId,
        canonical: text(row.canonical_label),
        countryId: text(row.country_id),
        countryName: text(row.country_name),
        regionId: text(row.region_id),
        aliases: [],
        years: new Set(),
        levels: new Set(),
      };
      groups.set(personId, group);
    }
    const label = text(row.candidate_or_list_label);
    if (label && !group.aliases.includes(label)) group.aliases.push(label);
  }

  if (groups.size > 0 && tableExists(db, "result_row")) {
    const withheld = [...WITHHELD_EVIDENCE];
    const placeholders = withheld.map(() => "?").join(", ");
    const facts = db
      .prepare(
        `SELECT a.person_id, d.year, j.level_label
         FROM person_alias a
         JOIN result_row r
           ON r.country_id = a.country_id AND r.candidate_or_list_label = a.candidate_or_list_label
         JOIN election_event e
           ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
         JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
         LEFT JOIN research_date d ON d.date_id = e.date_id
         LEFT JOIN derived_jurisdiction j
           ON j.country_id = o.country_id AND j.geography_id = o.geography_id
         WHERE a.review_status = 'approved'
           AND r.evidence_status NOT IN (${placeholders})`,
      )
      .all(...withheld) as Array<Record<string, unknown>>;
    for (const row of facts) {
      const group = groups.get(text(row.person_id));
      if (!group) continue;
      const year = numOrNull(row.year);
      if (year != null) group.years.add(year);
      const level = text(row.level_label);
      if (level) group.levels.add(level);
    }
  }
  return [...groups.values()];
}

function yearMatches(years: Set<number>, query: SearchQuery): boolean {
  if (query.yearFrom == null && query.yearTo == null) return true;
  for (const year of years) {
    if (query.yearFrom != null && year < query.yearFrom) continue;
    if (query.yearTo != null && year > query.yearTo) continue;
    return true;
  }
  return false;
}

/** Approved persons whose folded name or alias matches the query. */
export function searchApprovedPersons(db: DatabaseSync, query: SearchQuery): PersonSearchHit[] {
  const foldedQuery = foldSearchText(query.q);
  const queryTokens = searchTokens(foldedQuery);
  if (queryTokens.length === 0) return [];
  const groups = loadGroups(db);
  const slugs = assignPersonSlugs(
    groups.map((group) => ({
      personId: group.personId,
      canonicalLabel: group.canonical,
      countryId: group.countryId,
    })),
  );
  const matched = groups.filter((group) => {
    if (query.country && group.countryId !== query.country) return false;
    if (query.level && !group.levels.has(query.level)) return false;
    if (!yearMatches(group.years, query)) return false;
    const haystack = foldSearchText([group.canonical, ...group.aliases, group.countryName].join(" "));
    return tokensMatch(searchTokens(haystack), queryTokens);
  });
  const ranked = matched.map((group, index) => {
    const years = [...group.years].sort((a, b) => a - b);
    const year = years.length > 0 ? years[years.length - 1]! : null;
    const exact = foldSearchText(group.canonical) === foldedQuery;
    const score = rankScore(exact ? 2 : 1, exact, year);
    const others = group.aliases.filter((label) => label !== group.canonical);
    const display = [group.canonical, ...others].join(" · ");
    const count = group.aliases.length;
    return {
      score,
      hit: {
        personId: group.personId,
        title: group.canonical,
        snippet: highlightSnippet(display, queryTokens),
        disambiguation: `${group.countryName} · ${count} source ${count === 1 ? "label" : "labels"}`,
        href: atlasRoutes.person(slugs.get(group.personId) ?? group.personId),
        countryId: group.countryId,
        countryName: group.countryName,
        regionId: group.regionId,
        year,
      } satisfies PersonSearchHit,
      region: regionRank(group.regionId),
      year,
      title: group.canonical,
      searchId: index + 1,
    };
  });
  ranked.sort((left, right) =>
    compareRanked(
      { score: left.score, regionRank: left.region, year: left.year, title: left.title, searchId: left.searchId },
      { score: right.score, regionRank: right.region, year: right.year, title: right.title, searchId: right.searchId },
    ),
  );
  return ranked.map((row) => row.hit);
}
