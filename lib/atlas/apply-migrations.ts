import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { BOUNDARY_SCHEMA_DESCRIPTION, BOUNDARY_SCHEMA_VERSION } from "./boundaries/types";
import {
  ATLAS_ATTEMPT_LOG_FILENAME,
  ATLAS_MASTER_FILENAME,
  ATLAS_MIGRATIONS_DIR,
  listAtlasMigrationsForTarget,
  type AtlasMigration,
} from "./migrations";
import { userTables } from "./sqlite";

export type AtlasMigrationApplyResult = {
  filename: string;
  result: "applied" | "skipped";
};

export const EXPECTED_ATTEMPT_DESCRIPTION = "Atlas durable attempt ledger draft";
export const EXPECTED_MASTER_DESCRIPTION = "Atlas Phase 1 master draft";

function openDatabase(filePath: string): DatabaseSync {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function schemaMigrationRow(db: DatabaseSync): { version: number; description: string } | undefined {
  const tables = userTables(db);
  if (!tables.includes("schema_migration")) return undefined;
  const row = db.prepare("SELECT version, description FROM schema_migration WHERE version = 1").get();
  if (!row) return undefined;
  return { version: Number(row.version), description: String(row.description) };
}

export function applySqlFile(
  root: string,
  filePath: string,
  migration: AtlasMigration,
  expectedDescription: string,
): "applied" | "skipped" {
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

function schemaVersions(db: DatabaseSync): Map<number, string> {
  const versions = new Map<number, string>();
  if (!userTables(db).includes("schema_migration")) return versions;
  const rows = db.prepare("SELECT version, description FROM schema_migration").all();
  for (const row of rows) {
    versions.set(Number(row.version), String(row.description));
  }
  return versions;
}

const FOLLOW_ON_DESCRIPTIONS: Record<number, string> = {
  [BOUNDARY_SCHEMA_VERSION]: BOUNDARY_SCHEMA_DESCRIPTION,
};

/**
 * Follow-on master files (0003+) run after 0002 on a database that already
 * has schema_migration version 1. Each file must INSERT its filename version.
 * 0003 and 0004 are reserved for OV-01 and OV-02 and are applied in order
 * when those files exist.
 */
function applyFollowOnMigration(root: string, filePath: string, migration: AtlasMigration): "applied" | "skipped" {
  const db = openDatabase(filePath);
  const label = `${String(migration.version).padStart(4, "0")}_${migration.name}`;
  try {
    const versions = schemaVersions(db);
    if (!versions.has(1) || versions.get(1) !== EXPECTED_MASTER_DESCRIPTION) {
      throw new Error(
        `${label} requires ${ATLAS_MASTER_FILENAME} (schema_migration version 1, ${JSON.stringify(EXPECTED_MASTER_DESCRIPTION)}).`,
      );
    }
    const expected = FOLLOW_ON_DESCRIPTIONS[migration.version];
    const existing = versions.get(migration.version);
    if (existing !== undefined) {
      if (expected && existing !== expected) {
        throw new Error(
          `Unexpected schema_migration description for version ${migration.version} at ${filePath}: ${JSON.stringify(existing)}. Expected ${JSON.stringify(expected)}.`,
        );
      }
      return "skipped";
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
    const applied = schemaVersions(db).get(migration.version);
    if (!applied) {
      throw new Error(`Migration ${label} did not record schema_migration version ${migration.version}.`);
    }
    if (expected && applied !== expected) {
      throw new Error(
        `Migration ${label} recorded ${JSON.stringify(applied)}. Expected ${JSON.stringify(expected)}.`,
      );
    }
    return "applied";
  } finally {
    db.close();
  }
}

export function applyMasterMigrations(root: string, sqlitePath: string): AtlasMigrationApplyResult[] {
  const migrations = listAtlasMigrationsForTarget(root, "master");
  const bootstrap = migrations.find((migration) => migration.filename === ATLAS_MASTER_FILENAME);
  if (!bootstrap) throw new Error(`Missing ${ATLAS_MASTER_FILENAME}.`);
  const results: AtlasMigrationApplyResult[] = [
    {
      filename: bootstrap.filename,
      result: applySqlFile(root, sqlitePath, bootstrap, EXPECTED_MASTER_DESCRIPTION),
    },
  ];
  const followOns = migrations
    .filter((migration) => migration.filename !== ATLAS_MASTER_FILENAME)
    .sort((left, right) => left.version - right.version);
  for (const migration of followOns) {
    results.push({
      filename: migration.filename,
      result: applyFollowOnMigration(root, sqlitePath, migration),
    });
  }
  return results;
}

export function migrateAttemptsDatabase(root: string, attemptsPath: string): "applied" | "skipped" {
  const attemptMigration = requireOne(listAtlasMigrationsForTarget(root, "attempts"), ATLAS_ATTEMPT_LOG_FILENAME);
  return applySqlFile(root, attemptsPath, attemptMigration, EXPECTED_ATTEMPT_DESCRIPTION);
}

export function migrateMasterDatabase(root: string, sqlitePath: string): "applied" | "skipped" {
  const results = applyMasterMigrations(root, sqlitePath);
  return results.some((result) => result.result === "applied") ? "applied" : "skipped";
}

export function migrateAtlasDatabases(root: string, sqlitePath: string, attemptsPath: string): {
  attemptResult: "applied" | "skipped";
  masterResult: "applied" | "skipped";
} {
  return {
    attemptResult: migrateAttemptsDatabase(root, attemptsPath),
    masterResult: migrateMasterDatabase(root, sqlitePath),
  };
}
