import { readdirSync } from "node:fs";
import path from "node:path";

/** Checked-in SQL migrations. Prompt B uses two databases, not one bootstrap file. */
export const ATLAS_MIGRATIONS_DIR = "schemas/atlas/migrations";

/** Apply only to the durable sibling ledger (`ATLAS_ATTEMPTS_SQLITE_PATH`). */
export const ATLAS_ATTEMPT_LOG_FILENAME = "0001_atlas_attempt_log.sql";

/** Apply only to the master/staging DB (`ATLAS_SQLITE_PATH`). */
export const ATLAS_MASTER_FILENAME = "0002_atlas_master.sql";

/** Derived tables on the master/staging DB, after 0002. Never applied to the attempt ledger. */
export const ATLAS_DERIVED_FILENAME = "0003_atlas_derived.sql";

/** Search indexes on the master/staging DB, after 0003. Rebuilt by derive:atlas. */
export const ATLAS_SEARCH_FILENAME = "0004_atlas_search.sql";

const MIGRATION_FILE = /^(\d{4})_([a-z0-9_]+)\.sql$/;

export type AtlasMigration = {
  version: number;
  name: string;
  filename: string;
};

export type AtlasMigrationTarget = "attempts" | "master";

export function parseMigrationFilename(filename: string): AtlasMigration | null {
  const match = MIGRATION_FILE.exec(filename);
  if (!match) return null;
  return {
    version: Number(match[1]),
    name: match[2],
    filename,
  };
}

export function atlasMigrationTarget(filename: string): AtlasMigrationTarget {
  if (filename === ATLAS_ATTEMPT_LOG_FILENAME) return "attempts";
  const parsed = parseMigrationFilename(filename);
  if (parsed && parsed.version >= 2) return "master";
  throw new Error(
    `Unknown Atlas migration ${filename}. ${ATLAS_ATTEMPT_LOG_FILENAME} applies to the attempts DB. Master migrations start at ${ATLAS_MASTER_FILENAME}.`,
  );
}

export function listAtlasMigrations(root: string): AtlasMigration[] {
  const dir = path.join(root, ATLAS_MIGRATIONS_DIR);
  const files = readdirSync(dir);
  const migrations = files
    .map(parseMigrationFilename)
    .filter((entry): entry is AtlasMigration => entry !== null)
    .sort((a, b) => a.version - b.version || a.filename.localeCompare(b.filename));

  const seen = new Set<number>();
  for (const migration of migrations) {
    if (seen.has(migration.version)) {
      throw new Error(`Duplicate Atlas migration version ${migration.version}`);
    }
    seen.add(migration.version);
    atlasMigrationTarget(migration.filename);
  }
  return migrations;
}

export function listAtlasMigrationsForTarget(root: string, target: AtlasMigrationTarget): AtlasMigration[] {
  return listAtlasMigrations(root).filter((migration) => atlasMigrationTarget(migration.filename) === target);
}
