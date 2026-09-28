import type { DatabaseSync } from "node:sqlite";
import { WITHHELD_EVIDENCE } from "../derive/seat";
import { tableExists } from "../sqlite";
import { documentTrigrams, foldSearchText, tokenFrequencies } from "./text";

export type SearchRebuildCounts = {
  searchSeats: number;
  searchCycles: number;
  searchCandidates: number;
};

type OfficeRef = {
  officeId: string;
  name: string;
  level: string | null;
};

type PendingDoc = {
  searchId: number;
  folded: string;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value).trim();
  return next === "" ? null : next;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clearSearch(db: DatabaseSync): void {
  db.exec(`
    DELETE FROM search_token;
    DELETE FROM search_meta;
    DELETE FROM search_seat_trigram;
    DELETE FROM search_cycle_trigram;
    DELETE FROM search_candidate_trigram;
    DELETE FROM search_seat;
    DELETE FROM search_cycle;
    DELETE FROM search_candidate;
  `);
}

function writePostings(db: DatabaseSync, mode: string, docs: PendingDoc[]): void {
  const trigramTable =
    mode === "seat" ? "search_seat_trigram" : mode === "cycle" ? "search_cycle_trigram" : "search_candidate_trigram";
  const trigram = db.prepare(`INSERT INTO ${trigramTable} (trigram, search_id) VALUES (?, ?)`);
  const token = db.prepare("INSERT INTO search_token (mode, term, search_id, tf) VALUES (?, ?, ?, ?)");
  let tokenSum = 0;
  for (const doc of docs) {
    const counts = tokenFrequencies(doc.folded);
    let count = 0;
    for (const tf of counts.values()) count += tf;
    tokenSum += count;
    for (const gram of documentTrigrams(doc.folded)) trigram.run(gram, doc.searchId);
    for (const [term, tf] of counts) token.run(mode, term, doc.searchId, tf);
  }
  const docCount = docs.length;
  const avg = docCount === 0 ? 1 : Math.max(tokenSum / docCount, 1);
  db.prepare("INSERT INTO search_meta (mode, doc_count, avg_tokens) VALUES (?, ?, ?)").run(mode, docCount, avg);
}

function holderLine(holder: string | null): string {
  return holder ? `Held by ${holder}` : "Holder not supplied";
}

function contestLine(isoDate: string, contestCount: number): string {
  const noun = contestCount === 1 ? "contest" : "contests";
  return `${isoDate} · ${contestCount} ${noun}`;
}

function candidateLine(countryName: string, offices: OfficeRef[], years: number[]): string {
  const names = offices.map((office) => office.name);
  let officeText = "office not supplied";
  if (names.length === 1) officeText = names[0]!;
  else if (names.length === 2) officeText = `${names[0]} and ${names[1]}`;
  else if (names.length > 2) officeText = `${names[0]} and ${names.length - 1} other offices`;
  let yearText = "year not supplied";
  if (years.length > 0 && years.length <= 6) yearText = years.join(", ");
  else if (years.length > 6) yearText = `${years.slice(0, 6).join(", ")} and ${years.length - 6} other years`;
  return `${countryName} · ${officeText} · ${yearText}`;
}

function rebuildSeats(db: DatabaseSync): PendingDoc[] {
  const rows = db
    .prepare(
      `SELECT o.id_namespace, o.office_id, o.name AS office_name, o.office_type,
              o.country_id, c.name AS country_name, c.region_id,
              g.name AS geography_name,
              j.slug_path, j.level_label,
              (SELECT MAX(d.year)
                 FROM election_event e
                 JOIN research_date d ON d.date_id = e.date_id
                WHERE e.id_namespace = o.id_namespace
                  AND e.office_id = o.office_id
                  AND d.year IS NOT NULL) AS event_year,
              t.tier, s.current_holder_label
       FROM office o
       JOIN country c ON c.country_id = o.country_id
       LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
       LEFT JOIN derived_jurisdiction j
         ON j.country_id = o.country_id AND j.geography_id = o.geography_id
       LEFT JOIN office_tier_classification t
         ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       LEFT JOIN derived_seat_status s
         ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id
       ORDER BY o.id_namespace, o.office_id`,
    )
    .all() as Array<Record<string, unknown>>;
  const insert = db.prepare(
    `INSERT INTO search_seat (
       search_id, id_namespace, office_id, country_id, region_id, level_label, tier, slug_path,
       office_name, office_type, geography_name, country_name, holder_label, disambiguation,
       event_year, folded, token_count
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const docs: PendingDoc[] = [];
  rows.forEach((row, index) => {
    const searchId = index + 1;
    const officeName = text(row.office_name);
    const officeType = text(row.office_type);
    const geographyName = textOrNull(row.geography_name);
    const countryName = text(row.country_name);
    const slugPath = textOrNull(row.slug_path);
    const tier = textOrNull(row.tier);
    const holder = textOrNull(row.current_holder_label);
    const folded = foldSearchText(
      [officeName, officeType, geographyName ?? "", countryName, slugPath ?? "", tier ?? ""].join(" "),
    );
    const tokenCount = folded ? folded.split(" ").length : 0;
    const path = slugPath ?? countryName;
    insert.run(
      searchId,
      text(row.id_namespace),
      text(row.office_id),
      text(row.country_id),
      text(row.region_id),
      textOrNull(row.level_label),
      tier,
      slugPath,
      officeName,
      officeType,
      geographyName,
      countryName,
      holder,
      `${path} · ${holderLine(holder)}`,
      numOrNull(row.event_year),
      folded,
      tokenCount,
    );
    docs.push({ searchId, folded });
  });
  writePostings(db, "seat", docs);
  return docs;
}

function rebuildCycles(db: DatabaseSync): PendingDoc[] {
  const rows = db
    .prepare(
      `SELECT y.cycle_key, y.country_id, y.iso_date, y.contest_count, y.tiers_json, y.label,
              y.scope_key, j.name AS scope_name, j.slug_path, j.level_label,
              c.name AS country_name, c.region_id
       FROM derived_cycle y
       JOIN derived_jurisdiction j ON j.jurisdiction_key = y.scope_key
       JOIN country c ON c.country_id = y.country_id
       ORDER BY y.cycle_key`,
    )
    .all() as Array<Record<string, unknown>>;
  const insert = db.prepare(
    `INSERT INTO search_cycle (
       search_id, cycle_key, country_id, region_id, country_name, level_label, iso_date, event_year, label,
       scope_name, scope_key, slug_path, tiers_json, contest_count, disambiguation, folded, token_count
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const docs: PendingDoc[] = [];
  rows.forEach((row, index) => {
    const searchId = index + 1;
    const label = text(row.label);
    const isoDate = text(row.iso_date);
    const year = Number(isoDate.slice(0, 4));
    const countryName = text(row.country_name);
    const scopeName = text(row.scope_name);
    const tiers = text(row.tiers_json);
    const folded = foldSearchText([label, isoDate, String(year), countryName, tiers, scopeName].join(" "));
    const tokenCount = folded ? folded.split(" ").length : 0;
    insert.run(
      searchId,
      text(row.cycle_key),
      text(row.country_id),
      text(row.region_id),
      countryName,
      textOrNull(row.level_label),
      isoDate,
      year,
      label,
      scopeName,
      text(row.scope_key),
      textOrNull(row.slug_path),
      tiers,
      Number(row.contest_count),
      contestLine(isoDate, Number(row.contest_count)),
      folded,
      tokenCount,
    );
    docs.push({ searchId, folded });
  });
  writePostings(db, "cycle", docs);
  return docs;
}

type CandidateGroup = {
  countryId: string;
  countryName: string;
  regionId: string;
  label: string;
  partyLabel: string | null;
  partyKey: string;
  offices: Map<string, OfficeRef>;
  years: Set<number>;
  levels: Set<string>;
};

function rebuildCandidates(db: DatabaseSync): PendingDoc[] {
  const withheld = [...WITHHELD_EVIDENCE];
  const placeholders = withheld.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT r.country_id, r.candidate_or_list_label AS label, r.original_party_label AS party_label,
              r.office_id, o.name AS office_name, j.level_label, d.year AS event_year,
              c.name AS country_name, c.region_id
       FROM result_row r
       JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
       JOIN country c ON c.country_id = r.country_id
       JOIN election_event e
         ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
       LEFT JOIN research_date d ON d.date_id = e.date_id
       LEFT JOIN derived_jurisdiction j
         ON j.country_id = o.country_id AND j.geography_id = o.geography_id
       WHERE r.candidate_or_list_label IS NOT NULL
         AND length(trim(r.candidate_or_list_label)) > 0
         AND r.evidence_status NOT IN (${placeholders})
       ORDER BY r.country_id, r.candidate_or_list_label, r.original_party_label, r.office_id`,
    )
    .all(...withheld) as Array<Record<string, unknown>>;

  const groups = new Map<string, CandidateGroup>();
  for (const row of rows) {
    const label = text(row.label);
    const partyLabel = textOrNull(row.party_label);
    const partyKey = partyLabel ?? "";
    const countryId = text(row.country_id);
    const key = `${countryId}\u0000${label}\u0000${partyKey}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        countryId,
        countryName: text(row.country_name),
        regionId: text(row.region_id),
        label,
        partyLabel,
        partyKey,
        offices: new Map(),
        years: new Set(),
        levels: new Set(),
      };
      groups.set(key, group);
    }
    const officeId = text(row.office_id);
    const level = textOrNull(row.level_label);
    if (!group.offices.has(officeId)) {
      group.offices.set(officeId, { officeId, name: text(row.office_name), level });
    }
    if (level) group.levels.add(level);
    const year = numOrNull(row.event_year);
    if (year != null) group.years.add(year);
  }

  const ordered = [...groups.values()].sort(
    (a, b) => a.countryId.localeCompare(b.countryId) || a.label.localeCompare(b.label) || a.partyKey.localeCompare(b.partyKey),
  );
  const insert = db.prepare(
    `INSERT INTO search_candidate (
       search_id, country_id, region_id, label, party_label, party_key, offices_json, years_json,
       levels_json, event_year, country_name, disambiguation, folded, token_count
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const docs: PendingDoc[] = [];
  ordered.forEach((group, index) => {
    const searchId = index + 1;
    const offices = [...group.offices.values()].sort((a, b) => a.officeId.localeCompare(b.officeId) || a.name.localeCompare(b.name));
    const years = [...group.years].sort((a, b) => a - b);
    const levels = [...group.levels].sort((a, b) => a.localeCompare(b));
    const officeNames = offices.map((office) => office.name).join(" ");
    const folded = foldSearchText(
      [group.label, group.partyLabel ?? "", group.countryName, officeNames, years.join(" ")].join(" "),
    );
    const tokenCount = folded ? folded.split(" ").length : 0;
    const latest = years.length > 0 ? years[years.length - 1]! : null;
    insert.run(
      searchId,
      group.countryId,
      group.regionId,
      group.label,
      group.partyLabel,
      group.partyKey,
      JSON.stringify(offices),
      JSON.stringify(years),
      JSON.stringify(levels),
      latest,
      group.countryName,
      candidateLine(group.countryName, offices, years),
      folded,
      tokenCount,
    );
    docs.push({ searchId, folded });
  });
  writePostings(db, "candidate", docs);
  return docs;
}

/** Replace search rows from the master and derived tables. Caller owns the transaction. */
export function rebuildSearchIndexes(db: DatabaseSync): SearchRebuildCounts {
  if (!tableExists(db, "search_seat") || !tableExists(db, "derived_jurisdiction")) {
    throw new Error("Search schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  clearSearch(db);
  const seats = rebuildSeats(db);
  const cycles = rebuildCycles(db);
  const candidates = rebuildCandidates(db);
  return {
    searchSeats: seats.length,
    searchCycles: cycles.length,
    searchCandidates: candidates.length,
  };
}
