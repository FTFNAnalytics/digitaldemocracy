import { PRODUCTION_ATLAS_SQLITE_PATH, resolveAtlasSqlitePath } from "./paths";

export const ATLAS_IMPORT_BLOCKED_CODE = "ATLAS_IMPORT_BLOCKED";

export function atlasImportBlockedMessage(sqlitePath = resolveAtlasSqlitePath()): string {
  return [
    "Election Atlas import is not available yet.",
    "",
    "npm run import:atlas is a Phase 1 stub. It will not ingest Albania (or any other package)",
    "until reviewed entity DDL lands and the Albania tier-classification draft is accepted.",
    "",
    `Resolved ATLAS_SQLITE_PATH: ${sqlitePath}`,
    `Production VPS path (set ATLAS_SQLITE_PATH to use it): ${PRODUCTION_ATLAS_SQLITE_PATH}`,
    "",
    "Blocked on remaining artifacts / review:",
    "  - Full entity DDL (identity table, lineage release_id vs attempt_id, namespaced keys)",
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
