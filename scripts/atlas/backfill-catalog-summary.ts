#!/usr/bin/env npx tsx
/**
 * Fill derived catalog summary tables from the master with SQL aggregates.
 *
 * Does not edit election facts. Does not run derive:atlas. Does not import.
 * Refuses ATLAS_IMPORT_SCOPE=all. Node does not load result rows.
 *
 * One-shot VPS path (preferred). One GROUP BY pass per statement:
 *   ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite npm run backfill:catalog-summary
 *
 * Slice repair. Still scans result_row, because that table has no country_id index:
 *   npm run backfill:catalog-summary -- --country=<country_id>
 *
 * After this, derive:atlas:country refreshes that country's slice.
 * Do not follow this script with npm run derive:atlas.
 */
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { backfillCatalogSummary } from "../../lib/atlas/summary/write";

function countryArgument(): string | undefined {
  const fromArg = process.argv
    .slice(2)
    .find((arg) => arg.startsWith("--country="))
    ?.slice("--country=".length)
    .trim();
  if (!fromArg) return undefined;
  if (fromArg.toLowerCase() === "all") {
    throw new Error(
      "Refusing --country=all. Run npm run backfill:catalog-summary with no country filter. Do not set ATLAS_IMPORT_SCOPE=all.",
    );
  }
  return fromArg;
}

function main() {
  const scope = process.env.ATLAS_IMPORT_SCOPE?.trim().toLowerCase() ?? "";
  if (scope === "all") {
    throw new Error(
      "backfill:catalog-summary refuses ATLAS_IMPORT_SCOPE=all. Unset it. This script only aggregates counts already in the master.",
    );
  }
  const sqlitePath = resolveAtlasSqlitePath();
  const countryId = countryArgument();
  const started = Date.now();
  const db = openAtlasDatabase(sqlitePath);
  try {
    const stats = backfillCatalogSummary(db, countryId);
    const elapsedMs = Date.now() - started;
    console.log("backfill:catalog-summary");
    console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
    if (countryId) console.log(`country_id=${countryId}`);
    console.log(`countries=${stats.countries}`);
    console.log(`events_with_visible_results=${stats.events}`);
    console.log(`elapsed_ms=${elapsedMs}`);
  } finally {
    db.close();
  }
}

main();
