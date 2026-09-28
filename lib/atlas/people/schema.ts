import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";

export const PERSON_SCHEMA_VERSION = 7;
export const PERSON_MIGRATION_DESCRIPTION = "Atlas person entities";

export function personMigrationSqlPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../schemas/atlas/migrations/0007_atlas_person.sql",
  );
}

export function personSchemaApplied(db: DatabaseSync): boolean {
  if (!tableExists(db, "schema_migration")) return false;
  const row = db.prepare("SELECT description FROM schema_migration WHERE version = ?").get(PERSON_SCHEMA_VERSION) as
    | { description?: string }
    | undefined;
  if (!row) return false;
  if (String(row.description) !== PERSON_MIGRATION_DESCRIPTION) {
    throw new Error(
      `schema_migration version ${PERSON_SCHEMA_VERSION} is ${JSON.stringify(row.description)}, expected ${JSON.stringify(PERSON_MIGRATION_DESCRIPTION)}.`,
    );
  }
  return true;
}

/** Apply 0007 when person tables are not on the master yet. */
export function ensurePersonSchema(db: DatabaseSync): "applied" | "skipped" {
  if (!tableExists(db, "schema_migration")) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  const base = db.prepare("SELECT description FROM schema_migration WHERE version = 1").get();
  if (!base) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  if (personSchemaApplied(db)) return "skipped";
  const sql = readFileSync(personMigrationSqlPath(), "utf8");
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
  if (!personSchemaApplied(db)) {
    throw new Error(`0007_atlas_person.sql did not record schema_migration version ${PERSON_SCHEMA_VERSION}.`);
  }
  return "applied";
}
