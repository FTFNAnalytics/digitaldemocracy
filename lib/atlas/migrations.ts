import { readdirSync } from "node:fs";
import path from "node:path";

/** Checked-in SQL migrations. Entity DDL is not in this bootstrap set. */
export const ATLAS_MIGRATIONS_DIR = "schemas/atlas/migrations";

const MIGRATION_FILE = /^(\d{4})_([a-z0-9_]+)\.sql$/;

export type AtlasMigration = {
  version: number;
  name: string;
  filename: string;
};

export function parseMigrationFilename(filename: string): AtlasMigration | null {
  const match = MIGRATION_FILE.exec(filename);
  if (!match) return null;
  return {
    version: Number(match[1]),
    name: match[2],
    filename,
  };
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
  }
  return migrations;
}
