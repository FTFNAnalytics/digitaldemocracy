import type { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** True when every country that has offices has a summary row. */
export function catalogSummaryReady(db: DatabaseSync): boolean {
  if (!tableExists(db, "derived_country_summary") || !tableExists(db, "country") || !tableExists(db, "office")) {
    return false;
  }
  const missing = db
    .prepare(
      `SELECT COUNT(*) AS n
       FROM country c
       WHERE EXISTS (SELECT 1 FROM office o WHERE o.country_id = c.country_id)
         AND NOT EXISTS (SELECT 1 FROM derived_country_summary s WHERE s.country_id = c.country_id)`,
    )
    .get() as { n?: number } | undefined;
  return num(missing?.n) === 0 && tableExists(db, "derived_lineage_office");
}

export function summaryResultRowsByCountry(db: DatabaseSync): Map<string, number> | null {
  if (!catalogSummaryReady(db)) return null;
  const counts = new Map<string, number>();
  for (const row of db.prepare("SELECT country_id, result_rows FROM derived_country_summary").all() as Array<{
    country_id: string;
    result_rows: number;
  }>) {
    counts.set(String(row.country_id), num(row.result_rows));
  }
  return counts;
}

export type SummaryTotals = {
  countriesWithOffices: number;
  offices: number;
  events: number;
  resultRows: number;
};

export function summaryTotals(db: DatabaseSync): SummaryTotals | null {
  if (!catalogSummaryReady(db)) return null;
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(CASE WHEN offices > 0 THEN 1 ELSE 0 END), 0) AS countries,
              COALESCE(SUM(offices), 0) AS offices,
              COALESCE(SUM(events), 0) AS events,
              COALESCE(SUM(result_rows), 0) AS result_rows
       FROM derived_country_summary`,
    )
    .get() as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    countriesWithOffices: num(row.countries),
    offices: num(row.offices),
    events: num(row.events),
    resultRows: num(row.result_rows),
  };
}

export function countryHasSummary(db: DatabaseSync, countryId: string): boolean {
  if (!tableExists(db, "derived_country_summary")) return false;
  const row = db.prepare("SELECT 1 AS ok FROM derived_country_summary WHERE country_id = ?").get(countryId) as
    | { ok?: number }
    | undefined;
  return row != null;
}
