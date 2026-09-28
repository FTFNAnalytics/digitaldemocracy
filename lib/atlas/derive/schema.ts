import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";

export const DERIVED_SCHEMA_VERSION = 3;
export const DERIVED_MIGRATION_DESCRIPTION = "Atlas derived projections";
export const OFFICE_SLUG_SCHEMA_VERSION = 6;
export const OFFICE_SLUG_MIGRATION_DESCRIPTION = "Atlas office slugs";

export function derivedMigrationSqlPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../schemas/atlas/migrations/0003_atlas_derived.sql",
  );
}

export function officeSlugMigrationSqlPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../schemas/atlas/migrations/0006_atlas_office_slug.sql",
  );
}

export function derivedSchemaApplied(db: DatabaseSync): boolean {
  if (!tableExists(db, "schema_migration")) return false;
  const row = db.prepare("SELECT description FROM schema_migration WHERE version = ?").get(DERIVED_SCHEMA_VERSION);
  if (!row) return false;
  if (String(row.description) !== DERIVED_MIGRATION_DESCRIPTION) {
    throw new Error(
      `schema_migration version ${DERIVED_SCHEMA_VERSION} is ${JSON.stringify(row.description)}, expected ${JSON.stringify(DERIVED_MIGRATION_DESCRIPTION)}.`,
    );
  }
  return true;
}

/** Apply 0003 when the master schema is present and the derived tables are not. */
export function ensureDerivedSchema(db: DatabaseSync): "applied" | "skipped" {
  if (!tableExists(db, "schema_migration")) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  const base = db.prepare("SELECT description FROM schema_migration WHERE version = 1").get();
  if (!base) {
    throw new Error("Atlas master schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  if (derivedSchemaApplied(db)) return "skipped";
  const sql = readFileSync(derivedMigrationSqlPath(), "utf8");
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
  if (!derivedSchemaApplied(db)) {
    throw new Error(
      `0003_atlas_derived.sql did not record schema_migration version ${DERIVED_SCHEMA_VERSION}.`,
    );
  }
  return "applied";
}

function schemaVersionApplied(db: DatabaseSync, version: number, description: string): boolean {
  if (!tableExists(db, "schema_migration")) return false;
  const row = db.prepare("SELECT description FROM schema_migration WHERE version = ?").get(version);
  if (!row) return false;
  if (String(row.description) !== description) {
    throw new Error(
      `schema_migration version ${version} is ${JSON.stringify(row.description)}, expected ${JSON.stringify(description)}.`,
    );
  }
  return true;
}

/** Apply 0006 when office slug tables are not on the master yet. */
export function ensureOfficeSlugSchema(db: DatabaseSync): "applied" | "skipped" {
  if (!derivedSchemaApplied(db)) {
    throw new Error("Atlas derived schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  if (schemaVersionApplied(db, OFFICE_SLUG_SCHEMA_VERSION, OFFICE_SLUG_MIGRATION_DESCRIPTION)) return "skipped";
  const sql = readFileSync(officeSlugMigrationSqlPath(), "utf8");
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
  if (!schemaVersionApplied(db, OFFICE_SLUG_SCHEMA_VERSION, OFFICE_SLUG_MIGRATION_DESCRIPTION)) {
    throw new Error(
      `0006_atlas_office_slug.sql did not record schema_migration version ${OFFICE_SLUG_SCHEMA_VERSION}.`,
    );
  }
  return "applied";
}
