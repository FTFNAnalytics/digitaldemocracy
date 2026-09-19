#!/usr/bin/env npx tsx
/**
 * Import approved Atlas lineages into SQLite.
 *
 * Default scope is Albania + Andorra + Alderney + Armenia + Austria + Bosnia and Herzegovina +
 * approved LatAm packs + New Zealand (`ATLAS_IMPORT_SCOPE=all`). Draft residual-heavy packs are skipped.
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
    if (result.armenia) {
      console.log("lineage=country-package-armenia");
      console.log(`armenia_attempt_id=${result.armenia.attemptId}`);
      console.log(`armenia_release_id=${result.armenia.releaseId}`);
      console.log(`armenia_fingerprint_sha256=${result.armenia.fingerprint}`);
      console.log(`armenia_reused_release=${result.armenia.reusedRelease ? "yes" : "no"}`);
      console.log(`armenia_offices=${result.armenia.counts.current_offices}`);
      console.log(`armenia_municipal=${result.armenia.counts.municipal_offices}`);
      console.log(`armenia_selected_histories=${result.armenia.counts.selected_histories}`);
      console.log(`armenia_prospective_events=${result.armenia.counts.prospective_events}`);
      console.log(`armenia_result_rows=${result.armenia.counts.result_rows}`);
      console.log(`armenia_sources=${result.armenia.counts.sources}`);
      console.log(`armenia_regional=${result.armenia.counts.regional_offices}`);
    }
    if (result.austria) {
      console.log("lineage=country-package-austria");
      console.log(`austria_attempt_id=${result.austria.attemptId}`);
      console.log(`austria_release_id=${result.austria.releaseId}`);
      console.log(`austria_fingerprint_sha256=${result.austria.fingerprint}`);
      console.log(`austria_reused_release=${result.austria.reusedRelease ? "yes" : "no"}`);
      console.log(`austria_offices=${result.austria.counts.current_offices}`);
      console.log(`austria_municipal=${result.austria.counts.municipal_offices}`);
      console.log(`austria_selected_histories=${result.austria.counts.selected_histories}`);
      console.log(`austria_prospective_events=${result.austria.counts.prospective_events}`);
      console.log(`austria_result_rows=${result.austria.counts.result_rows}`);
      console.log(`austria_sources=${result.austria.counts.sources}`);
      console.log(`austria_regional=${result.austria.counts.regional_offices}`);
    }
    if (result.bosnia) {
      console.log("lineage=country-package-bosnia-and-herzegovina");
      console.log(`bosnia_attempt_id=${result.bosnia.attemptId}`);
      console.log(`bosnia_release_id=${result.bosnia.releaseId}`);
      console.log(`bosnia_fingerprint_sha256=${result.bosnia.fingerprint}`);
      console.log(`bosnia_reused_release=${result.bosnia.reusedRelease ? "yes" : "no"}`);
      console.log(`bosnia_offices=${result.bosnia.counts.current_offices}`);
      console.log(`bosnia_regional=${result.bosnia.counts.regional_offices}`);
      console.log(`bosnia_municipal=${result.bosnia.counts.municipal_offices}`);
      console.log(`bosnia_selected_histories=${result.bosnia.counts.selected_histories}`);
      console.log(`bosnia_prospective_events=${result.bosnia.counts.prospective_events}`);
      console.log(`bosnia_result_rows=${result.bosnia.counts.result_rows}`);
      console.log(`bosnia_sources=${result.bosnia.counts.sources}`);
      console.log(`bosnia_approved=${result.bosnia.counts.approved_classifications}`);
      console.log(`bosnia_needs_review=${result.bosnia.counts.needs_review_classifications}`);
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
