#!/usr/bin/env npx tsx
/**
 * Apply checked-in Atlas SQL migrations to ATLAS_SQLITE_PATH.
 *
 * Bootstrap only: schema_version + atlas_meta. Full entity DDL waits for
 * review against docs/atlas-plan.md identity rules. See docs/atlas-phase1.md.
 */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { listAtlasMigrations } from "../../lib/atlas/migrations";
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";

const SCHEMA_VERSION_DDL = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL
);
`;

function openDatabase(filePath: string): DatabaseSync {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function appliedVersions(db: DatabaseSync): Set<number> {
  db.exec(SCHEMA_VERSION_DDL);
  const rows = db.prepare("SELECT version FROM schema_version").all();
  return new Set(rows.map((row) => Number(row.version)));
}

function applyMigrations(root: string, filePath: string): { applied: string[]; skipped: string[] } {
  const db = openDatabase(filePath);
  const applied: string[] = [];
  const skipped: string[] = [];
  try {
    const done = appliedVersions(db);
    const migrations = listAtlasMigrations(root);
    if (migrations.length === 0) {
      throw new Error("No Atlas SQL migrations found under schemas/atlas/migrations.");
    }
    for (const migration of migrations) {
      const label = `${String(migration.version).padStart(4, "0")}_${migration.name}`;
      if (done.has(migration.version)) {
        skipped.push(label);
        continue;
      }
      const sql = readFileSync(path.join(root, "schemas/atlas/migrations", migration.filename), "utf8");
      db.exec("BEGIN;");
      try {
        db.exec(sql);
        db.prepare(
          "INSERT INTO schema_version (version, name, applied_at) VALUES (?, ?, ?)",
        ).run(migration.version, migration.name, new Date().toISOString());
        db.exec("COMMIT;");
      } catch (error) {
        db.exec("ROLLBACK;");
        throw error;
      }
      applied.push(label);
    }
  } finally {
    db.close();
  }
  return { applied, skipped };
}

function main() {
  const root = process.cwd();
  const sqlitePath = resolveAtlasSqlitePath();
  const { applied, skipped } = applyMigrations(root, sqlitePath);

  console.log("migrate:atlas");
  console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
  if (applied.length === 0) {
    console.log("No new migrations. Bootstrap schema_version is already applied.");
  } else {
    console.log(`Applied: ${applied.join(", ")}`);
  }
  if (skipped.length > 0) {
    console.log(`Already applied: ${skipped.join(", ")}`);
  }
  console.log("Entity DDL is not included. Albania ingest is still blocked. See docs/atlas-phase1.md.");
}

main();
