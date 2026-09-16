#!/usr/bin/env npx tsx
/**
 * Ingest the frozen Albania country package into the Atlas SQLite master.
 *
 * Phase 1 storage proof: atomic publication, durable attempt ledger, Prompt C
 * field map / identity rules. Does not add /atlas routes, load LatAm/NZ, or
 * modify frozen package bytes.
 *
 * See docs/atlas-plan.md Phase 1, docs/atlas-phase1.md, and
 * docs/phase1/Prompt_C_Field_Map_and_CI.md.
 */
import { importAlbania } from "../../lib/atlas/albania/import";
import { resolveAtlasAttemptsSqlitePath, resolveAtlasSqlitePath } from "../../lib/atlas/paths";

function main() {
  const sqlitePath = resolveAtlasSqlitePath();
  const attemptsPath = resolveAtlasAttemptsSqlitePath();
  try {
    const result = importAlbania({
      root: process.cwd(),
      sqlitePath,
      attemptsPath,
      operator: process.env.ATLAS_OPERATOR,
    });
    console.log("import:atlas");
    console.log(`ATLAS_ATTEMPTS_SQLITE_PATH=${attemptsPath}`);
    console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
    console.log(`attempt_id=${result.attemptId}`);
    console.log(`release_id=${result.releaseId}`);
    console.log(`fingerprint_sha256=${result.fingerprint}`);
    console.log(`reused_release=${result.reusedRelease ? "yes" : "no"}`);
    console.log(`offices=${result.counts.current_offices}`);
    console.log(`selected_histories=${result.counts.selected_histories}`);
    console.log(`result_rows=${result.counts.result_rows}`);
    console.log(`sources=${result.counts.sources}`);
    console.log(`municipal=${result.counts.municipal_offices}`);
    console.log(`regional=${result.counts.regional_offices}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`import:atlas failed: ${message}`);
    process.exit(1);
  }
}

main();
