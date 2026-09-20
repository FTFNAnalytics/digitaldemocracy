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
    "npm run import:atlas loads Albania, Andorra, Alderney, Armenia, Belgium, Bosnia and Herzegovina, Bulgaria, Denmark, and approved continuity packs into SQLite (atomic publish + durable attempt ledger).",
    "ATLAS_IMPORT_SCOPE=albania|andorra|alderney|armenia|belgium|bosnia|bulgaria|denmark|latam|nz|all (default all). Draft residual-heavy packs are skipped.",
    "Use ATLAS_SQLITE_PATH and ATLAS_ATTEMPTS_SQLITE_PATH. CI/tests must use temporary paths, never the VPS production DB.",
    "Public UI: /atlas (SQLite MVP). Observatory catalogue remains at /electiondatabase.",
    "",
    `Resolved ATLAS_SQLITE_PATH: ${sqlitePath}`,
    `Resolved ATLAS_ATTEMPTS_SQLITE_PATH: ${attemptsPath}`,
    `Production VPS path (set ATLAS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_SQLITE_PATH}`,
    `Production VPS attempt ledger (set ATLAS_ATTEMPTS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH}`,
    "",
    "Still out of scope for this importer:",
    "  - VPS deploy / live cutover (Genevieve after CI is green)",
    "  - residual-heavy draft packs (Prompt H)",
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
