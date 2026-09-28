import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import type { DatabaseSync as DatabaseSyncType } from "node:sqlite";
import { tableExists } from "../sqlite";

export const SEARCH_SCHEMA_VERSION = 4;
export const SEARCH_MIGRATION_DESCRIPTION = "Atlas search indexes";
export const SEARCH_ENGINE = "trigram-like" as const;

export function searchMigrationSqlPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../schemas/atlas/migrations/0004_atlas_search.sql",
  );
}

let fts5Enabled: boolean | undefined;

/** sqlite_compileoption_used('ENABLE_FTS5') under node:sqlite. */
export function sqliteFts5Enabled(): boolean {
  if (fts5Enabled !== undefined) return fts5Enabled;
  const db = new DatabaseSync(":memory:");
  try {
    const row = db.prepare("SELECT sqlite_compileoption_used('ENABLE_FTS5') AS enabled").get() as
      | { enabled?: number }
      | undefined;
    fts5Enabled = Number(row?.enabled) === 1;
    return fts5Enabled;
  } finally {
    db.close();
  }
}

export function searchSchemaApplied(db: DatabaseSyncType): boolean {
  if (!tableExists(db, "schema_migration")) return false;
  const row = db.prepare("SELECT description FROM schema_migration WHERE version = ?").get(SEARCH_SCHEMA_VERSION) as
    | { description?: string }
    | undefined;
  if (!row) return false;
  if (String(row.description) !== SEARCH_MIGRATION_DESCRIPTION) {
    throw new Error(
      `schema_migration version ${SEARCH_SCHEMA_VERSION} is ${JSON.stringify(row.description)}, expected ${JSON.stringify(SEARCH_MIGRATION_DESCRIPTION)}.`,
    );
  }
  return true;
}

/** Apply 0004 when the master schema is present and the search tables are not. */
export function ensureSearchSchema(db: DatabaseSyncType): "applied" | "skipped" {
  if (!tableExists(db, "schema_migration")) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  const base = db.prepare("SELECT description FROM schema_migration WHERE version = 1").get();
  if (!base) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  if (searchSchemaApplied(db)) return "skipped";
  const sql = readFileSync(searchMigrationSqlPath(), "utf8");
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
  if (!searchSchemaApplied(db)) {
    throw new Error(`0004_atlas_search.sql did not record schema_migration version ${SEARCH_SCHEMA_VERSION}.`);
  }
  return "applied";
}
