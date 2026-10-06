import type { DatabaseSync } from "node:sqlite";
import type { MasterSnapshot } from "../derive/project";
import { WITHHELD_EVIDENCE } from "../derive/seat";
import { insertMany } from "../sqlite";
import { ensureCatalogSummarySchema } from "./schema";

export type CatalogSummaryRows = {
  countries: Array<{ country_id: string; offices: number; events: number; result_rows: number }>;
  lineages: Array<{ lineage_id: string; country_id: string; offices: number }>;
  events: Array<{
    id_namespace: string;
    office_id: string;
    history_key: string;
    country_id: string;
    visible_count: number;
  }>;
  evidence: Array<{ country_id: string; evidence_status: string; n: number }>;
};

function officeKey(idNamespace: string, officeId: string): string {
  return `${idNamespace}\n${officeId}`;
}

function eventKey(idNamespace: string, officeId: string, historyKey: string): string {
  return `${idNamespace}\n${officeId}\n${historyKey}`;
}

/** Aggregate counts already loaded for derive. Does not scan the database again. */
export function summarizeSnapshot(master: MasterSnapshot): CatalogSummaryRows {
  const countryByOffice = new Map<string, string>();
  const offices = new Map<string, number>();
  const lineages = new Map<string, number>();
  for (const office of master.offices) {
    countryByOffice.set(officeKey(office.idNamespace, office.officeId), office.countryId);
    offices.set(office.countryId, (offices.get(office.countryId) ?? 0) + 1);
    const lineageKey = `${office.lineageId}\n${office.countryId}`;
    lineages.set(lineageKey, (lineages.get(lineageKey) ?? 0) + 1);
  }

  const events = new Map<string, number>();
  for (const event of master.events) {
    events.set(event.countryId, (events.get(event.countryId) ?? 0) + 1);
  }

  const resultRows = new Map<string, number>();
  const visible = new Map<string, { countryId: string; count: number }>();
  const evidence = new Map<string, number>();
  for (const result of master.results) {
    const countryId = countryByOffice.get(officeKey(result.idNamespace, result.officeId));
    if (!countryId) continue;
    resultRows.set(countryId, (resultRows.get(countryId) ?? 0) + 1);
    const evidenceKey = `${countryId}\n${result.evidenceStatus}`;
    evidence.set(evidenceKey, (evidence.get(evidenceKey) ?? 0) + 1);
    if (WITHHELD_EVIDENCE.has(result.evidenceStatus)) continue;
    const key = eventKey(result.idNamespace, result.officeId, result.historyKey);
    const current = visible.get(key);
    if (current) current.count += 1;
    else visible.set(key, { countryId, count: 1 });
  }

  const countryIds = new Set<string>([
    ...master.countries.map((country) => country.countryId),
    ...offices.keys(),
    ...events.keys(),
    ...resultRows.keys(),
  ]);

  return {
    countries: [...countryIds]
      .sort((a, b) => a.localeCompare(b))
      .map((countryId) => ({
        country_id: countryId,
        offices: offices.get(countryId) ?? 0,
        events: events.get(countryId) ?? 0,
        result_rows: resultRows.get(countryId) ?? 0,
      })),
    lineages: [...lineages.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => {
        const split = key.indexOf("\n");
        return {
          lineage_id: key.slice(0, split),
          country_id: key.slice(split + 1),
          offices: count,
        };
      }),
    events: [...visible.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, row]) => {
        const [idNamespace, officeId, historyKey] = key.split("\n");
        return {
          id_namespace: idNamespace!,
          office_id: officeId!,
          history_key: historyKey!,
          country_id: row.countryId,
          visible_count: row.count,
        };
      }),
    evidence: [...evidence.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, n]) => {
        const split = key.indexOf("\n");
        return {
          country_id: key.slice(0, split),
          evidence_status: key.slice(split + 1),
          n,
        };
      }),
  };
}

export function deleteCatalogSummary(db: DatabaseSync, countryId?: string): void {
  if (countryId) {
    db.prepare("DELETE FROM derived_country_summary WHERE country_id = ?").run(countryId);
    db.prepare("DELETE FROM derived_lineage_office WHERE country_id = ?").run(countryId);
    db.prepare("DELETE FROM derived_event_result_count WHERE country_id = ?").run(countryId);
    db.prepare("DELETE FROM derived_evidence_count WHERE country_id = ?").run(countryId);
    return;
  }
  db.exec(`
    DELETE FROM derived_evidence_count;
    DELETE FROM derived_event_result_count;
    DELETE FROM derived_lineage_office;
    DELETE FROM derived_country_summary;
  `);
}

export function insertCatalogSummary(db: DatabaseSync, rows: CatalogSummaryRows): void {
  insertMany(db, "derived_country_summary", rows.countries);
  insertMany(db, "derived_lineage_office", rows.lineages);
  insertMany(db, "derived_event_result_count", rows.events);
  insertMany(db, "derived_evidence_count", rows.evidence);
}

const WITHHELD_SQL = [...WITHHELD_EVIDENCE].map((status) => `'${status}'`).join(", ");

/**
 * Fill summary tables with SQL aggregates. One pass over result_row per statement.
 * Node does not load result rows. Safe to rerun. Pass countryId to replace one slice.
 */
export function backfillCatalogSummary(db: DatabaseSync, countryId?: string): { countries: number; events: number } {
  ensureCatalogSummarySchema(db);
  const id = countryId?.trim() || "";
  db.exec("PRAGMA temp_store = FILE;");
  db.exec("PRAGMA cache_size = -16384;");
  db.exec("PRAGMA mmap_size = 0;");
  db.exec("BEGIN IMMEDIATE;");
  try {
    deleteCatalogSummary(db, id || undefined);
    const countryFilter = id ? "WHERE country_id = ?" : "";
    const officeFilter = id ? "WHERE o.country_id = ?" : "";
    const params = id ? [id] : [];
    db.prepare(
      `INSERT INTO derived_country_summary (country_id, offices, events, result_rows)
       SELECT c.country_id,
              COALESCE(oc.n, 0),
              COALESCE(ec.n, 0),
              COALESCE(rc.n, 0)
       FROM country c
       LEFT JOIN (
         SELECT country_id, COUNT(*) AS n FROM office ${countryFilter} GROUP BY country_id
       ) oc ON oc.country_id = c.country_id
       LEFT JOIN (
         SELECT o.country_id AS country_id, COUNT(*) AS n
         FROM election_event e
         JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
         ${officeFilter}
         GROUP BY o.country_id
       ) ec ON ec.country_id = c.country_id
       LEFT JOIN (
         SELECT country_id, COUNT(*) AS n FROM result_row ${countryFilter} GROUP BY country_id
       ) rc ON rc.country_id = c.country_id
       WHERE (COALESCE(oc.n, 0) > 0 OR COALESCE(ec.n, 0) > 0 OR COALESCE(rc.n, 0) > 0)
         ${id ? "AND c.country_id = ?" : ""}`,
    ).run(...params, ...params, ...params, ...(id ? [id] : []));

    db.prepare(
      `INSERT INTO derived_lineage_office (lineage_id, country_id, offices)
       SELECT lineage_id, country_id, COUNT(*)
       FROM office
       ${countryFilter}
       GROUP BY lineage_id, country_id`,
    ).run(...params);

    db.prepare(
      `INSERT INTO derived_event_result_count (id_namespace, office_id, history_key, country_id, visible_count)
       SELECT id_namespace, office_id, history_key, country_id, COUNT(*)
       FROM result_row
       WHERE evidence_status NOT IN (${WITHHELD_SQL})
         ${id ? "AND country_id = ?" : ""}
       GROUP BY id_namespace, office_id, history_key, country_id`,
    ).run(...params);

    db.prepare(
      `INSERT INTO derived_evidence_count (country_id, evidence_status, n)
       SELECT country_id, evidence_status, COUNT(*)
       FROM result_row
       ${countryFilter}
       GROUP BY country_id, evidence_status`,
    ).run(...params);

    const countries = db.prepare("SELECT COUNT(*) AS n FROM derived_country_summary").get() as { n?: number };
    const events = db.prepare("SELECT COUNT(*) AS n FROM derived_event_result_count").get() as { n?: number };
    db.exec("COMMIT;");
    return { countries: Number(countries?.n ?? 0), events: Number(events?.n ?? 0) };
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // The transaction may already be closed.
    }
    throw error;
  }
}
