#!/usr/bin/env npx tsx
/**
 * Apply checked-in Atlas SQL migrations to two databases:
 *   - 0001_atlas_attempt_log.sql → ATLAS_ATTEMPTS_SQLITE_PATH
 *   - 0002_atlas_master.sql and later master files (0003 derived,
 *     0004 search, 0005 boundary, 0006 office slugs, 0007 persons) → ATLAS_SQLITE_PATH
 *
 * Each SQL file already contains BEGIN IMMEDIATE / COMMIT and must be
 * executed outside an existing transaction. Do not wrap exec in BEGIN.
 * Never apply either file to the other database.
 *
 * See docs/atlas-phase1.md and docs/phase1/Phase1_DDL_Rationale.md.
 */
import {
  applyMasterMigrations,
  EXPECTED_ATTEMPT_DESCRIPTION,
  EXPECTED_MASTER_DESCRIPTION,
  migrateAttemptsDatabase,
} from "../../lib/atlas/apply-migrations";
import { ATLAS_ATTEMPT_LOG_FILENAME, listAtlasMigrationsForTarget } from "../../lib/atlas/migrations";
import { resolveAtlasAttemptsSqlitePath, resolveAtlasSqlitePath } from "../../lib/atlas/paths";

function main() {
  const root = process.cwd();
  const sqlitePath = resolveAtlasSqlitePath();
  const attemptsPath = resolveAtlasAttemptsSqlitePath();

  const attemptMigrations = listAtlasMigrationsForTarget(root, "attempts");
  if (attemptMigrations.length !== 1 || attemptMigrations[0].filename !== ATLAS_ATTEMPT_LOG_FILENAME) {
    throw new Error(`Expected exactly ${ATLAS_ATTEMPT_LOG_FILENAME} for the attempts DB.`);
  }

  const attemptResult = migrateAttemptsDatabase(root, attemptsPath);
  const masterResults = applyMasterMigrations(root, sqlitePath);

  console.log("migrate:atlas");
  console.log(`ATLAS_ATTEMPTS_SQLITE_PATH=${attemptsPath}`);
  console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
  console.log(
    attemptResult === "applied"
      ? `Applied to attempts DB: ${ATLAS_ATTEMPT_LOG_FILENAME.replace(/\.sql$/, "")}`
      : `Already applied to attempts DB: ${ATLAS_ATTEMPT_LOG_FILENAME.replace(/\.sql$/, "")}`,
  );
  for (const result of masterResults) {
    const label = result.filename.replace(/\.sql$/, "");
    console.log(
      result.result === "applied" ? `Applied to master DB: ${label}` : `Already applied to master DB: ${label}`,
    );
  }
  console.log(
    `schema_migration attempts=${JSON.stringify(EXPECTED_ATTEMPT_DESCRIPTION)}; master=${JSON.stringify(EXPECTED_MASTER_DESCRIPTION)}`,
  );
}

main();
