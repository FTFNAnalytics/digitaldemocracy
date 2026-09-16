#!/usr/bin/env npx tsx
/**
 * Apply checked-in Atlas SQL migrations to two databases:
 *   - 0001_atlas_attempt_log.sql → ATLAS_ATTEMPTS_SQLITE_PATH
 *   - 0002_atlas_master.sql      → ATLAS_SQLITE_PATH
 *
 * Each SQL file already contains BEGIN IMMEDIATE / COMMIT and must be
 * executed outside an existing transaction. Do not wrap exec in BEGIN.
 * Never apply either file to the other database.
 *
 * See docs/atlas-phase1.md and docs/phase1/Phase1_DDL_Rationale.md.
 */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  ATLAS_ATTEMPT_LOG_FILENAME,
  ATLAS_MASTER_FILENAME,
  ATLAS_MIGRATIONS_DIR,
  listAtlasMigrationsForTarget,
  type AtlasMigration,
} from "../../lib/atlas/migrations";
import { resolveAtlasAttemptsSqlitePath, resolveAtlasSqlitePath } from "../../lib/atlas/paths";

const EXPECTED_ATTEMPT_DESCRIPTION = "Atlas durable attempt ledger draft";
const EXPECTED_MASTER_DESCRIPTION = "Atlas Phase 1 master draft";

function openDatabase(filePath: string): DatabaseSync {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function userTables(db: DatabaseSync): string[] {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all()
    .map((row) => String(row.name));
}

function schemaMigrationRow(db: DatabaseSync): { version: number; description: string } | undefined {
  const tables = userTables(db);
  if (!tables.includes("schema_migration")) return undefined;
  const row = db.prepare("SELECT version, description FROM schema_migration WHERE version = 1").get();
  if (!row) return undefined;
  return { version: Number(row.version), description: String(row.description) };
}

function applySqlFile(root: string, filePath: string, migration: AtlasMigration, expectedDescription: string): "applied" | "skipped" {
  const db = openDatabase(filePath);
  const label = `${String(migration.version).padStart(4, "0")}_${migration.name}`;
  try {
    const existing = schemaMigrationRow(db);
    const tables = userTables(db);
    if (existing) {
      if (existing.description !== expectedDescription) {
        throw new Error(
          `Unexpected schema_migration description at ${filePath}: ${JSON.stringify(existing.description)}. Expected ${JSON.stringify(expectedDescription)}.`,
        );
      }
      return "skipped";
    }
    if (tables.length > 0) {
      throw new Error(
        `Unexpected existing schema at ${filePath} (${tables.join(", ")}). ${label} must be applied to a new empty database. Refusing to migrate an unidentified/live file.`,
      );
    }

    const sql = readFileSync(path.join(root, ATLAS_MIGRATIONS_DIR, migration.filename), "utf8");
    try {
      db.exec(sql);
    } catch (error) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // Ignore rollback failures when no transaction is open.
      }
      throw error;
    }

    const applied = schemaMigrationRow(db);
    if (!applied || applied.description !== expectedDescription) {
      throw new Error(`Migration ${label} did not record expected schema_migration at ${filePath}.`);
    }
    return "applied";
  } finally {
    db.close();
  }
}

function requireOne(migrations: AtlasMigration[], filename: string): AtlasMigration {
  if (migrations.length !== 1 || migrations[0].filename !== filename) {
    throw new Error(
      `Expected exactly ${filename} for this database, found ${migrations.map((m) => m.filename).join(", ") || "(none)"}.`,
    );
  }
  return migrations[0];
}

function main() {
  const root = process.cwd();
  const sqlitePath = resolveAtlasSqlitePath();
  const attemptsPath = resolveAtlasAttemptsSqlitePath();

  const attemptMigration = requireOne(listAtlasMigrationsForTarget(root, "attempts"), ATLAS_ATTEMPT_LOG_FILENAME);
  const masterMigration = requireOne(listAtlasMigrationsForTarget(root, "master"), ATLAS_MASTER_FILENAME);

  const attemptResult = applySqlFile(root, attemptsPath, attemptMigration, EXPECTED_ATTEMPT_DESCRIPTION);
  const masterResult = applySqlFile(root, sqlitePath, masterMigration, EXPECTED_MASTER_DESCRIPTION);

  console.log("migrate:atlas");
  console.log(`ATLAS_ATTEMPTS_SQLITE_PATH=${attemptsPath}`);
  console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
  console.log(
    attemptResult === "applied"
      ? `Applied to attempts DB: ${ATLAS_ATTEMPT_LOG_FILENAME.replace(/\.sql$/, "")}`
      : `Already applied to attempts DB: ${ATLAS_ATTEMPT_LOG_FILENAME.replace(/\.sql$/, "")}`,
  );
  console.log(
    masterResult === "applied"
      ? `Applied to master DB: ${ATLAS_MASTER_FILENAME.replace(/\.sql$/, "")}`
      : `Already applied to master DB: ${ATLAS_MASTER_FILENAME.replace(/\.sql$/, "")}`,
  );
  console.log("import:atlas remains blocked until Prompt C field map and importer. See docs/phase1/.");
}

main();
