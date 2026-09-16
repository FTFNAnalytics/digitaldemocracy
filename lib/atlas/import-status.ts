import {
  PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH,
  PRODUCTION_ATLAS_SQLITE_PATH,
  resolveAtlasAttemptsSqlitePath,
  resolveAtlasSqlitePath,
} from "./paths";

export const ATLAS_IMPORT_BLOCKED_CODE = "ATLAS_IMPORT_BLOCKED";

export function atlasImportBlockedMessage(
  sqlitePath = resolveAtlasSqlitePath(),
  attemptsPath = resolveAtlasAttemptsSqlitePath(),
): string {
  return [
    "Election Atlas import is not available yet.",
    "",
    "npm run import:atlas remains blocked until Prompt C field map and importer land.",
    "Prompt B DDL is checked in (0001_atlas_attempt_log.sql / 0002_atlas_master.sql) but does not ingest Albania.",
    "",
    `Resolved ATLAS_SQLITE_PATH: ${sqlitePath}`,
    `Resolved ATLAS_ATTEMPTS_SQLITE_PATH: ${attemptsPath}`,
    `Production VPS path (set ATLAS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_SQLITE_PATH}`,
    `Production VPS attempt ledger (set ATLAS_ATTEMPTS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH}`,
    "",
    "Blocked on remaining artifacts / review:",
    "  - Prompt C Albania field map and importer (docs/phase1/Prompt_C_Field_Map_and_CI.md)",
    "  - Albania tier-classification draft (schemas/atlas/tiers/albania.json) still needs human review",
    "  - Albania map (proposed 46-municipality 2027 map remains unverified)",
    "",
    "Still required for Phase 1 exit (see docs/atlas-plan.md and docs/atlas-phase1.md):",
    "  - Albania import proof (atomic publish, failed-import rollback, unchanged re-import)",
    "  - Named ingest acceptance tests in CI",
    "",
    "The live observatory remains at /electiondatabase. This stub does not add /atlas routes or redirects.",
  ].join("\n");
}
