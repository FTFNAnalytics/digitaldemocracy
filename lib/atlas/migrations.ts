import { readdirSync } from "node:fs";
import path from "node:path";

/** Checked-in SQL migrations. Prompt B uses two databases, not one bootstrap file. */
export const ATLAS_MIGRATIONS_DIR = "schemas/atlas/migrations";

/** Apply only to the durable sibling ledger (`ATLAS_ATTEMPTS_SQLITE_PATH`). */
export const ATLAS_ATTEMPT_LOG_FILENAME = "0001_atlas_attempt_log.sql";

/** Apply only to the master/staging DB (`ATLAS_SQLITE_PATH`). */
export const ATLAS_MASTER_FILENAME = "0002_atlas_master.sql";

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
  if (filename === ATLAS_MASTER_FILENAME) return "master";
  throw new Error(
    `Unknown Atlas migration ${filename}. Prompt B applies ${ATLAS_ATTEMPT_LOG_FILENAME} to the attempts DB and ${ATLAS_MASTER_FILENAME} to the master DB.`,
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
