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
    "npm run import:atlas loads Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bulgaria, Netherlands, Switzerland, Denmark, Sweden, Finland, Norway, Ireland, Poland, Czechia, Croatia, Portugal, Spain, Estonia, and approved continuity packs into SQLite (atomic publish + durable attempt ledger).",
    "ATLAS_IMPORT_SCOPE=albania|andorra|alderney|armenia|austria|belgium|bosnia|bulgaria|croatia|czechia|denmark|estonia|latvia|lithuania|romania|greece|luxembourg|malta|cyprus|france|germany|united_kingdom|italy|iceland|hungary|finland|ireland|netherlands|norway|poland|portugal|spain|sweden|switzerland|latam|nz|all (default all). Draft residual-heavy packs are skipped.",
    "Latvia is ATLAS_IMPORT_SCOPE=latvia only. The default all scope does not import Latvia.",
    "Lithuania is ATLAS_IMPORT_SCOPE=lithuania only. The default all scope does not import Lithuania.",
    "ATLAS_IMPORT_SCOPE=hungary loads Hungary only. Hungary is not part of all.",
    "Romania is ATLAS_IMPORT_SCOPE=romania only. The default all scope does not import Romania.",
    "Greece is ATLAS_IMPORT_SCOPE=greece only. The default all scope does not import Greece.",
    "Luxembourg is ATLAS_IMPORT_SCOPE=luxembourg only. The default all scope does not import Luxembourg.",
    "Malta is ATLAS_IMPORT_SCOPE=malta only. The default all scope does not import Malta.",
    "Cyprus is ATLAS_IMPORT_SCOPE=cyprus only. The default all scope does not import Cyprus.",
    "France is ATLAS_IMPORT_SCOPE=france only. The default all scope does not import France.",
    "Germany is ATLAS_IMPORT_SCOPE=germany only. The default all scope does not import Germany.",
    "The United Kingdom is ATLAS_IMPORT_SCOPE=united_kingdom only. The default all scope does not import the United Kingdom.",
    "Italy is ATLAS_IMPORT_SCOPE=italy only. The default all scope does not import Italy.",
    "Iceland is ATLAS_IMPORT_SCOPE=iceland only. The default all scope does not import Iceland.",
    "Bosnia and Herzegovina is ATLAS_IMPORT_SCOPE=bosnia only. The default all scope does not import Bosnia and Herzegovina.",
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
