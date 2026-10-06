import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";

export const CATALOG_SUMMARY_SCHEMA_VERSION = 8;
export const CATALOG_SUMMARY_MIGRATION_DESCRIPTION = "Atlas catalog summary";

export const SUMMARY_TABLES = [
  "derived_country_summary",
  "derived_lineage_office",
  "derived_event_result_count",
  "derived_evidence_count",
] as const;

export function catalogSummaryMigrationSqlPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../schemas/atlas/migrations/0008_atlas_catalog_summary.sql",
  );
}

export function catalogSummarySchemaApplied(db: DatabaseSync): boolean {
  if (!tableExists(db, "schema_migration")) return false;
  const row = db.prepare("SELECT description FROM schema_migration WHERE version = ?").get(CATALOG_SUMMARY_SCHEMA_VERSION) as
    | { description?: string }
    | undefined;
  if (!row) return false;
  if (String(row.description) !== CATALOG_SUMMARY_MIGRATION_DESCRIPTION) {
    throw new Error(
      `schema_migration version ${CATALOG_SUMMARY_SCHEMA_VERSION} is ${JSON.stringify(row.description)}, expected ${JSON.stringify(CATALOG_SUMMARY_MIGRATION_DESCRIPTION)}.`,
    );
  }
  return true;
}

/** Apply 0008 when catalog summary tables are not on the master yet. */
export function ensureCatalogSummarySchema(db: DatabaseSync): "applied" | "skipped" {
  if (!tableExists(db, "schema_migration")) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  const base = db.prepare("SELECT description FROM schema_migration WHERE version = 1").get();
  if (!base) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  if (catalogSummarySchemaApplied(db)) return "skipped";
  const sql = readFileSync(catalogSummaryMigrationSqlPath(), "utf8");
  try {
    db.exec(sql);
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // No transaction was left open.
    }
    throw error;
  }
  if (!catalogSummarySchemaApplied(db)) {
    throw new Error(
      `0008_atlas_catalog_summary.sql did not record schema_migration version ${CATALOG_SUMMARY_SCHEMA_VERSION}.`,
    );
  }
  return "applied";
}
