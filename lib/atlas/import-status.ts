import {
  PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH,
  PRODUCTION_ATLAS_SQLITE_PATH,
  resolveAtlasAttemptsSqlitePath,
  resolveAtlasSqlitePath,
} from "./paths";

/** @deprecated Import is implemented; kept so older callers still resolve. */
export const ATLAS_IMPORT_BLOCKED_CODE = "ATLAS_IMPORT_IMPLEMENTED";

export function atlasImportStatusMessage(
  sqlitePath = resolveAtlasSqlitePath(),
  attemptsPath = resolveAtlasAttemptsSqlitePath(),
): string {
  return [
    "Election Atlas Albania import is available.",
    "",
    "npm run import:atlas loads the frozen Albania package into SQLite (atomic publish + durable attempt ledger).",
    "Use ATLAS_SQLITE_PATH and ATLAS_ATTEMPTS_SQLITE_PATH. CI/tests must use temporary paths, never the VPS production DB.",
    "",
    `Resolved ATLAS_SQLITE_PATH: ${sqlitePath}`,
    `Resolved ATLAS_ATTEMPTS_SQLITE_PATH: ${attemptsPath}`,
    `Production VPS path (set ATLAS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_SQLITE_PATH}`,
    `Production VPS attempt ledger (set ATLAS_ATTEMPTS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH}`,
    "",
    "Still out of scope for this importer:",
    "  - /atlas routes or redirects (live observatory remains /electiondatabase)",
    "  - Latin America / New Zealand ingest",
    "  - tightness / computed competition tables",
    "  - Albania 46-municipality 2027 map (unverified; geometry is not invented)",
    "",
    "See docs/atlas-phase1.md and docs/phase1/Prompt_C_Field_Map_and_CI.md.",
  ].join("\n");
}

/** @deprecated Use atlasImportStatusMessage. Import is no longer blocked. */
export function atlasImportBlockedMessage(
  sqlitePath = resolveAtlasSqlitePath(),
  attemptsPath = resolveAtlasAttemptsSqlitePath(),
): string {
  return atlasImportStatusMessage(sqlitePath, attemptsPath);
}
