#!/usr/bin/env npx tsx
/**
 * Import approved Atlas lineages into SQLite.
 *
 * Default scope is Albania + Andorra + Alderney + Armenia + Austria + Belgium + Bosnia and Herzegovina +
 * Bulgaria + Netherlands + approved LatAm packs + New Zealand (`ATLAS_IMPORT_SCOPE=all`).
 * Draft residual-heavy packs are skipped.
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
    if (result.belgium) {
      console.log("lineage=country-package-belgium");
      console.log(`belgium_attempt_id=${result.belgium.attemptId}`);
      console.log(`belgium_release_id=${result.belgium.releaseId}`);
      console.log(`belgium_fingerprint_sha256=${result.belgium.fingerprint}`);
      console.log(`belgium_reused_release=${result.belgium.reusedRelease ? "yes" : "no"}`);
      console.log(`belgium_offices=${result.belgium.counts.offices}`);
      console.log(`belgium_current=${result.belgium.counts.current_offices}`);
      console.log(`belgium_historical=${result.belgium.counts.historical_offices}`);
      console.log(`belgium_municipal=${result.belgium.counts.municipal_offices}`);
      console.log(`belgium_regional=${result.belgium.counts.regional_offices}`);
      console.log(`belgium_national=${result.belgium.counts.national_offices}`);
      console.log(`belgium_other=${result.belgium.counts.other_offices}`);
      console.log(`belgium_selected_histories=${result.belgium.counts.selected_histories}`);
      console.log(`belgium_prospective_events=${result.belgium.counts.prospective_events}`);
      console.log(`belgium_result_rows=${result.belgium.counts.result_rows}`);
      console.log(`belgium_sources=${result.belgium.counts.sources}`);
      console.log(`belgium_unresolved=${result.belgium.counts.unresolved_evidence}`);
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
    if (result.bulgaria) {
      console.log("lineage=country-package-bulgaria");
      console.log(`bulgaria_attempt_id=${result.bulgaria.attemptId}`);
      console.log(`bulgaria_release_id=${result.bulgaria.releaseId}`);
      console.log(`bulgaria_fingerprint_sha256=${result.bulgaria.fingerprint}`);
      console.log(`bulgaria_reused_release=${result.bulgaria.reusedRelease ? "yes" : "no"}`);
      console.log(`bulgaria_offices=${result.bulgaria.counts.current_offices}`);
      console.log(`bulgaria_municipal=${result.bulgaria.counts.municipal_offices}`);
      console.log(`bulgaria_selected_histories=${result.bulgaria.counts.selected_histories}`);
      console.log(`bulgaria_prospective_events=${result.bulgaria.counts.prospective_events}`);
      console.log(`bulgaria_result_rows=${result.bulgaria.counts.result_rows}`);
      console.log(`bulgaria_sources=${result.bulgaria.counts.sources}`);
      console.log(`bulgaria_regional=${result.bulgaria.counts.regional_offices}`);
      console.log(`bulgaria_held_offices=${result.bulgaria.counts.held_offices}`);
    }
    if (result.netherlands) {
      console.log("lineage=country-package-netherlands");
      console.log(`netherlands_attempt_id=${result.netherlands.attemptId}`);
      console.log(`netherlands_release_id=${result.netherlands.releaseId}`);
      console.log(`netherlands_fingerprint_sha256=${result.netherlands.fingerprint}`);
      console.log(`netherlands_reused_release=${result.netherlands.reusedRelease ? "yes" : "no"}`);
      console.log(`netherlands_offices=${result.netherlands.counts.offices}`);
      console.log(`netherlands_current=${result.netherlands.counts.current_offices}`);
      console.log(`netherlands_historical=${result.netherlands.counts.historical_offices}`);
      console.log(`netherlands_municipal=${result.netherlands.counts.municipal_offices}`);
      console.log(`netherlands_regional=${result.netherlands.counts.regional_offices}`);
      console.log(`netherlands_national=${result.netherlands.counts.national_offices}`);
      console.log(`netherlands_other=${result.netherlands.counts.other_offices}`);
      console.log(`netherlands_selected_histories=${result.netherlands.counts.selected_histories}`);
      console.log(`netherlands_prospective_events=${result.netherlands.counts.prospective_events}`);
      console.log(`netherlands_result_rows=${result.netherlands.counts.result_rows}`);
      console.log(`netherlands_sources=${result.netherlands.counts.sources}`);
      console.log(`netherlands_unresolved=${result.netherlands.counts.unresolved_evidence}`);
      console.log(`netherlands_needs_review=${result.netherlands.counts.needs_review_classifications}`);
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
