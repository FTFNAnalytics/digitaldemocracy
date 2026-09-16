#!/usr/bin/env npx tsx
/**
 * Import approved Atlas lineages into SQLite.
 *
 * Default scope is Albania + Andorra + Alderney + approved LatAm packs + New Zealand
 * (`ATLAS_IMPORT_SCOPE=all`). Draft residual-heavy packs are skipped.
 * Does not deploy to VPS or merge publication cutover.
 *
 * See docs/phase2/Continuity_Import.md.
 */
import { importAtlasLineages, parseImportScope } from "../../lib/atlas/continuity/import";
import { resolveAtlasAttemptsSqlitePath, resolveAtlasSqlitePath } from "../../lib/atlas/paths";

function main() {
  const sqlitePath = resolveAtlasSqlitePath();
  const attemptsPath = resolveAtlasAttemptsSqlitePath();
  const scope = parseImportScope();
  try {
    const result = importAtlasLineages(
      {
        root: process.cwd(),
        sqlitePath,
        attemptsPath,
        operator: process.env.ATLAS_OPERATOR,
      },
      scope,
    );
    console.log("import:atlas");
    console.log(`scope=${scope}`);
    console.log(`ATLAS_ATTEMPTS_SQLITE_PATH=${attemptsPath}`);
    console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
    if (result.albania) {
      console.log("lineage=country-package-albania");
      console.log(`attempt_id=${result.albania.attemptId}`);
      console.log(`release_id=${result.albania.releaseId}`);
      console.log(`fingerprint_sha256=${result.albania.fingerprint}`);
      console.log(`reused_release=${result.albania.reusedRelease ? "yes" : "no"}`);
      console.log(`offices=${result.albania.counts.current_offices}`);
      console.log(`selected_histories=${result.albania.counts.selected_histories}`);
      console.log(`result_rows=${result.albania.counts.result_rows}`);
      console.log(`sources=${result.albania.counts.sources}`);
      console.log(`municipal=${result.albania.counts.municipal_offices}`);
      console.log(`regional=${result.albania.counts.regional_offices}`);
    }
    if (result.andorra) {
      console.log("lineage=country-package-andorra");
      console.log(`andorra_attempt_id=${result.andorra.attemptId}`);
      console.log(`andorra_release_id=${result.andorra.releaseId}`);
      console.log(`andorra_fingerprint_sha256=${result.andorra.fingerprint}`);
      console.log(`andorra_reused_release=${result.andorra.reusedRelease ? "yes" : "no"}`);
      console.log(`andorra_offices=${result.andorra.counts.current_offices}`);
      console.log(`andorra_selected_histories=${result.andorra.counts.selected_histories}`);
      console.log(`andorra_result_rows=${result.andorra.counts.result_rows}`);
      console.log(`andorra_sources=${result.andorra.counts.sources}`);
      console.log(`andorra_municipal=${result.andorra.counts.municipal_offices}`);
      console.log(`andorra_regional=${result.andorra.counts.regional_offices}`);
    }
    if (result.alderney) {
      console.log("lineage=country-package-alderney");
      console.log(`alderney_attempt_id=${result.alderney.attemptId}`);
      console.log(`alderney_release_id=${result.alderney.releaseId}`);
      console.log(`alderney_fingerprint_sha256=${result.alderney.fingerprint}`);
      console.log(`alderney_reused_release=${result.alderney.reusedRelease ? "yes" : "no"}`);
      console.log(`alderney_offices=${result.alderney.counts.current_offices}`);
      console.log(`alderney_other=${result.alderney.counts.other_offices}`);
      console.log(`alderney_selected_histories=${result.alderney.counts.selected_histories}`);
      console.log(`alderney_prospective_events=${result.alderney.counts.prospective_events}`);
      console.log(`alderney_result_rows=${result.alderney.counts.result_rows}`);
      console.log(`alderney_sources=${result.alderney.counts.sources}`);
      console.log(`alderney_regional=${result.alderney.counts.regional_offices}`);
    }
    if (result.latam) {
      console.log("lineage=latin-america-fe5e91689def");
      console.log(`latam_attempt_id=${result.latam.attemptId}`);
      console.log(`latam_release_id=${result.latam.releaseId}`);
      console.log(`latam_offices=${result.latam.counts.offices}`);
      console.log(`latam_events=${result.latam.counts.events}`);
      console.log(`latam_result_rows=${result.latam.counts.result_rows}`);
      console.log(`latam_skipped_drafts=${result.latam.skippedDraftCountries.join(",")}`);
    }
    if (result.nz) {
      console.log("lineage=country-package-new-zealand");
      console.log(`nz_attempt_id=${result.nz.attemptId}`);
      console.log(`nz_release_id=${result.nz.releaseId}`);
      console.log(`nz_offices=${result.nz.counts.offices}`);
      console.log(`nz_events=${result.nz.counts.events}`);
      console.log(`nz_result_rows=${result.nz.counts.result_rows}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`import:atlas failed: ${message}`);
    process.exit(1);
  }
}

main();
