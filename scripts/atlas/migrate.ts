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
import {
  EXPECTED_ATTEMPT_DESCRIPTION,
  EXPECTED_MASTER_DESCRIPTION,
  migrateAtlasDatabases,
} from "../../lib/atlas/apply-migrations";
import {
  ATLAS_ATTEMPT_LOG_FILENAME,
  ATLAS_MASTER_FILENAME,
  listAtlasMigrationsForTarget,
} from "../../lib/atlas/migrations";
import { resolveAtlasAttemptsSqlitePath, resolveAtlasSqlitePath } from "../../lib/atlas/paths";

function main() {
  const root = process.cwd();
  const sqlitePath = resolveAtlasSqlitePath();
  const attemptsPath = resolveAtlasAttemptsSqlitePath();

  const attemptMigrations = listAtlasMigrationsForTarget(root, "attempts");
  const masterMigrations = listAtlasMigrationsForTarget(root, "master");
  if (attemptMigrations.length !== 1 || attemptMigrations[0].filename !== ATLAS_ATTEMPT_LOG_FILENAME) {
    throw new Error(`Expected exactly ${ATLAS_ATTEMPT_LOG_FILENAME} for the attempts DB.`);
  }
  if (masterMigrations.length !== 1 || masterMigrations[0].filename !== ATLAS_MASTER_FILENAME) {
    throw new Error(`Expected exactly ${ATLAS_MASTER_FILENAME} for the master DB.`);
  }

  const { attemptResult, masterResult } = migrateAtlasDatabases(root, sqlitePath, attemptsPath);

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
  console.log(
    `schema_migration attempts=${JSON.stringify(EXPECTED_ATTEMPT_DESCRIPTION)}; master=${JSON.stringify(EXPECTED_MASTER_DESCRIPTION)}`,
  );
}

main();
