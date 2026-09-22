#!/usr/bin/env npx tsx
/**
 * Import approved Atlas lineages into SQLite.
 *
 * Default scope is Albania + Andorra + Alderney + Armenia + Austria + Belgium + Bosnia and Herzegovina +
 * Bulgaria + Netherlands + Switzerland + approved LatAm packs + New Zealand + Denmark + Sweden + Finland + Norway + Ireland + Poland + Czechia + Croatia + Portugal (`ATLAS_IMPORT_SCOPE=all`).
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
    if (result.switzerland) {
      console.log("lineage=country-package-switzerland");
      console.log(`switzerland_attempt_id=${result.switzerland.attemptId}`);
      console.log(`switzerland_release_id=${result.switzerland.releaseId}`);
      console.log(`switzerland_fingerprint_sha256=${result.switzerland.fingerprint}`);
      console.log(`switzerland_reused_release=${result.switzerland.reusedRelease ? "yes" : "no"}`);
      console.log(`switzerland_offices=${result.switzerland.counts.offices}`);
      console.log(`switzerland_current=${result.switzerland.counts.current_offices}`);
      console.log(`switzerland_historical=${result.switzerland.counts.historical_offices}`);
      console.log(`switzerland_municipal=${result.switzerland.counts.municipal_offices}`);
      console.log(`switzerland_regional=${result.switzerland.counts.regional_offices}`);
      console.log(`switzerland_national=${result.switzerland.counts.national_offices}`);
      console.log(`switzerland_other=${result.switzerland.counts.other_offices}`);
      console.log(`switzerland_selected_histories=${result.switzerland.counts.selected_histories}`);
      console.log(`switzerland_prospective_events=${result.switzerland.counts.prospective_events}`);
      console.log(`switzerland_result_rows=${result.switzerland.counts.result_rows}`);
      console.log(`switzerland_proceedings=${result.switzerland.counts.proceedings}`);
      console.log(`switzerland_sources=${result.switzerland.counts.sources}`);
      console.log(`switzerland_unresolved=${result.switzerland.counts.unresolved_evidence}`);
      console.log(`switzerland_held_commune_executives=${result.switzerland.counts.held_commune_executive_gaps}`);
    }
    if (result.ireland) {
      console.log("lineage=country-package-ireland");
      console.log(`ireland_attempt_id=${result.ireland.attemptId}`);
      console.log(`ireland_release_id=${result.ireland.releaseId}`);
      console.log(`ireland_fingerprint_sha256=${result.ireland.fingerprint}`);
      console.log(`ireland_reused_release=${result.ireland.reusedRelease ? "yes" : "no"}`);
      console.log(`ireland_offices=${result.ireland.counts.offices}`);
      console.log(`ireland_current=${result.ireland.counts.current_offices}`);
      console.log(`ireland_historical=${result.ireland.counts.historical_offices}`);
      console.log(`ireland_municipal=${result.ireland.counts.municipal_offices}`);
      console.log(`ireland_regional=${result.ireland.counts.regional_offices}`);
      console.log(`ireland_national=${result.ireland.counts.national_offices}`);
      console.log(`ireland_other=${result.ireland.counts.other_offices}`);
      console.log(`ireland_selected_histories=${result.ireland.counts.selected_histories}`);
      console.log(`ireland_prospective_events=${result.ireland.counts.prospective_events}`);
      console.log(`ireland_result_rows=${result.ireland.counts.result_rows}`);
      console.log(`ireland_sources=${result.ireland.counts.sources}`);
      console.log(`ireland_unresolved=${result.ireland.counts.unresolved_evidence}`);
      console.log(`ireland_approved=${result.ireland.counts.approved_classifications}`);
      console.log(`ireland_needs_review=${result.ireland.counts.needs_review_classifications}`);
    }
    if (result.denmark) {
      console.log("lineage=country-package-denmark");
      console.log(`denmark_attempt_id=${result.denmark.attemptId}`);
      console.log(`denmark_release_id=${result.denmark.releaseId}`);
      console.log(`denmark_fingerprint_sha256=${result.denmark.fingerprint}`);
      console.log(`denmark_reused_release=${result.denmark.reusedRelease ? "yes" : "no"}`);
      console.log(`denmark_offices=${result.denmark.counts.offices}`);
      console.log(`denmark_current=${result.denmark.counts.current_offices}`);
      console.log(`denmark_historical=${result.denmark.counts.historical_offices}`);
      console.log(`denmark_municipal=${result.denmark.counts.municipal_offices}`);
      console.log(`denmark_regional=${result.denmark.counts.regional_offices}`);
      console.log(`denmark_national=${result.denmark.counts.national_offices}`);
      console.log(`denmark_other=${result.denmark.counts.other_offices}`);
      console.log(`denmark_selected_histories=${result.denmark.counts.selected_histories}`);
      console.log(`denmark_prospective_events=${result.denmark.counts.prospective_events}`);
      console.log(`denmark_result_rows=${result.denmark.counts.result_rows}`);
      console.log(`denmark_sources=${result.denmark.counts.sources}`);
      console.log(`denmark_unresolved=${result.denmark.counts.unresolved_evidence}`);
      console.log(`denmark_approved=${result.denmark.counts.approved_classifications}`);
      console.log(`denmark_needs_review=${result.denmark.counts.needs_review_classifications}`);
    }
    if (result.czechia) {
      console.log("lineage=country-package-czechia");
      console.log(`czechia_attempt_id=${result.czechia.attemptId}`);
      console.log(`czechia_release_id=${result.czechia.releaseId}`);
      console.log(`czechia_fingerprint_sha256=${result.czechia.fingerprint}`);
      console.log(`czechia_reused_release=${result.czechia.reusedRelease ? "yes" : "no"}`);
      console.log(`czechia_offices=${result.czechia.counts.offices}`);
      console.log(`czechia_current=${result.czechia.counts.current_offices}`);
      console.log(`czechia_historical=${result.czechia.counts.historical_offices}`);
      console.log(`czechia_municipal=${result.czechia.counts.municipal_offices}`);
      console.log(`czechia_regional=${result.czechia.counts.regional_offices}`);
      console.log(`czechia_national=${result.czechia.counts.national_offices}`);
      console.log(`czechia_other=${result.czechia.counts.other_offices}`);
      console.log(`czechia_boroughs=${result.czechia.counts.borough_councils}`);
      console.log(`czechia_prague=${result.czechia.counts.prague_assemblies}`);
      console.log(`czechia_selected_histories=${result.czechia.counts.selected_histories}`);
      console.log(`czechia_prospective_events=${result.czechia.counts.prospective_events}`);
      console.log(`czechia_result_rows=${result.czechia.counts.result_rows}`);
      console.log(`czechia_proceedings=${result.czechia.counts.proceedings}`);
      console.log(`czechia_sources=${result.czechia.counts.sources}`);
      console.log(`czechia_unresolved=${result.czechia.counts.unresolved_evidence}`);
      console.log(`czechia_approved=${result.czechia.counts.approved_classifications}`);
      console.log(`czechia_needs_review=${result.czechia.counts.needs_review_classifications}`);
    }
    if (result.sweden) {
      console.log("lineage=country-package-sweden");
      console.log(`sweden_attempt_id=${result.sweden.attemptId}`);
      console.log(`sweden_release_id=${result.sweden.releaseId}`);
      console.log(`sweden_fingerprint_sha256=${result.sweden.fingerprint}`);
      console.log(`sweden_reused_release=${result.sweden.reusedRelease ? "yes" : "no"}`);
      console.log(`sweden_offices=${result.sweden.counts.offices}`);
      console.log(`sweden_current=${result.sweden.counts.current_offices}`);
      console.log(`sweden_historical=${result.sweden.counts.historical_offices}`);
      console.log(`sweden_municipal=${result.sweden.counts.municipal_offices}`);
      console.log(`sweden_regional=${result.sweden.counts.regional_offices}`);
      console.log(`sweden_national=${result.sweden.counts.national_offices}`);
      console.log(`sweden_other=${result.sweden.counts.other_offices}`);
      console.log(`sweden_selected_histories=${result.sweden.counts.selected_histories}`);
      console.log(`sweden_prospective_events=${result.sweden.counts.prospective_events}`);
      console.log(`sweden_result_rows=${result.sweden.counts.result_rows}`);
      console.log(`sweden_sources=${result.sweden.counts.sources}`);
      console.log(`sweden_unresolved=${result.sweden.counts.unresolved_evidence}`);
      console.log(`sweden_approved=${result.sweden.counts.approved_classifications}`);
      console.log(`sweden_needs_review=${result.sweden.counts.needs_review_classifications}`);
    }
    if (result.finland) {
      console.log("lineage=country-package-finland");
      console.log(`finland_attempt_id=${result.finland.attemptId}`);
      console.log(`finland_release_id=${result.finland.releaseId}`);
      console.log(`finland_fingerprint_sha256=${result.finland.fingerprint}`);
      console.log(`finland_reused_release=${result.finland.reusedRelease ? "yes" : "no"}`);
      console.log(`finland_offices=${result.finland.counts.offices}`);
      console.log(`finland_current=${result.finland.counts.current_offices}`);
      console.log(`finland_historical=${result.finland.counts.historical_offices}`);
      console.log(`finland_municipal=${result.finland.counts.municipal_offices}`);
      console.log(`finland_regional=${result.finland.counts.regional_offices}`);
      console.log(`finland_national=${result.finland.counts.national_offices}`);
      console.log(`finland_other=${result.finland.counts.other_offices}`);
      console.log(`finland_selected_histories=${result.finland.counts.selected_histories}`);
      console.log(`finland_prospective_events=${result.finland.counts.prospective_events}`);
      console.log(`finland_result_rows=${result.finland.counts.result_rows}`);
      console.log(`finland_proceedings=${result.finland.counts.proceedings}`);
      console.log(`finland_sources=${result.finland.counts.sources}`);
      console.log(`finland_unresolved=${result.finland.counts.unresolved_evidence}`);
      console.log(`finland_approved=${result.finland.counts.approved_classifications}`);
      console.log(`finland_needs_review=${result.finland.counts.needs_review_classifications}`);
    }
    if (result.norway) {
      console.log("lineage=country-package-norway");
      console.log(`norway_attempt_id=${result.norway.attemptId}`);
      console.log(`norway_release_id=${result.norway.releaseId}`);
      console.log(`norway_fingerprint_sha256=${result.norway.fingerprint}`);
      console.log(`norway_reused_release=${result.norway.reusedRelease ? "yes" : "no"}`);
      console.log(`norway_offices=${result.norway.counts.offices}`);
      console.log(`norway_current=${result.norway.counts.current_offices}`);
      console.log(`norway_historical=${result.norway.counts.historical_offices}`);
      console.log(`norway_municipal=${result.norway.counts.municipal_offices}`);
      console.log(`norway_regional=${result.norway.counts.regional_offices}`);
      console.log(`norway_national=${result.norway.counts.national_offices}`);
      console.log(`norway_other=${result.norway.counts.other_offices}`);
      console.log(`norway_selected_histories=${result.norway.counts.selected_histories}`);
      console.log(`norway_prospective_events=${result.norway.counts.prospective_events}`);
      console.log(`norway_result_rows=${result.norway.counts.result_rows}`);
      console.log(`norway_sources=${result.norway.counts.sources}`);
      console.log(`norway_unresolved=${result.norway.counts.unresolved_evidence}`);
      console.log(`norway_approved=${result.norway.counts.approved_classifications}`);
      console.log(`norway_needs_review=${result.norway.counts.needs_review_classifications}`);
    }
    if (result.poland) {
      console.log("lineage=country-package-poland");
      console.log(`poland_attempt_id=${result.poland.attemptId}`);
      console.log(`poland_release_id=${result.poland.releaseId}`);
      console.log(`poland_fingerprint_sha256=${result.poland.fingerprint}`);
      console.log(`poland_reused_release=${result.poland.reusedRelease ? "yes" : "no"}`);
      console.log(`poland_offices=${result.poland.counts.offices}`);
      console.log(`poland_current=${result.poland.counts.current_offices}`);
      console.log(`poland_historical=${result.poland.counts.historical_offices}`);
      console.log(`poland_municipal=${result.poland.counts.municipal_offices}`);
      console.log(`poland_regional=${result.poland.counts.regional_offices}`);
      console.log(`poland_national=${result.poland.counts.national_offices}`);
      console.log(`poland_other=${result.poland.counts.other_offices}`);
      console.log(`poland_powiat=${result.poland.counts.powiat_councils}`);
      console.log(`poland_sejmiks=${result.poland.counts.voivodeship_sejmiks}`);
      console.log(`poland_selected_histories=${result.poland.counts.selected_histories}`);
      console.log(`poland_prospective_events=${result.poland.counts.prospective_events}`);
      console.log(`poland_result_rows=${result.poland.counts.result_rows}`);
      console.log(`poland_proceedings=${result.poland.counts.proceedings}`);
      console.log(`poland_sources=${result.poland.counts.sources}`);
      console.log(`poland_unresolved=${result.poland.counts.unresolved_evidence}`);
      console.log(`poland_approved=${result.poland.counts.approved_classifications}`);
      console.log(`poland_needs_review=${result.poland.counts.needs_review_classifications}`);
    }
    if (result.croatia) {
      console.log("lineage=country-package-croatia");
      console.log(`croatia_attempt_id=${result.croatia.attemptId}`);
      console.log(`croatia_release_id=${result.croatia.releaseId}`);
      console.log(`croatia_fingerprint_sha256=${result.croatia.fingerprint}`);
      console.log(`croatia_reused_release=${result.croatia.reusedRelease ? "yes" : "no"}`);
      console.log(`croatia_offices=${result.croatia.counts.offices}`);
      console.log(`croatia_current=${result.croatia.counts.current_offices}`);
      console.log(`croatia_historical=${result.croatia.counts.historical_offices}`);
      console.log(`croatia_municipal=${result.croatia.counts.municipal_offices}`);
      console.log(`croatia_regional=${result.croatia.counts.regional_offices}`);
      console.log(`croatia_national=${result.croatia.counts.national_offices}`);
      console.log(`croatia_other=${result.croatia.counts.other_offices}`);
      console.log(`croatia_selected_histories=${result.croatia.counts.selected_histories}`);
      console.log(`croatia_prospective_events=${result.croatia.counts.prospective_events}`);
      console.log(`croatia_result_rows=${result.croatia.counts.result_rows}`);
      console.log(`croatia_proceedings=${result.croatia.counts.proceedings}`);
      console.log(`croatia_sources=${result.croatia.counts.sources}`);
      console.log(`croatia_unresolved=${result.croatia.counts.unresolved_evidence}`);
      console.log(`croatia_approved=${result.croatia.counts.approved_classifications}`);
      console.log(`croatia_needs_review=${result.croatia.counts.needs_review_classifications}`);
      console.log(`croatia_executives=${result.croatia.counts.executive_tickets}`);
      console.log(`croatia_deputies=${result.croatia.counts.current_deputies}`);
      console.log(`croatia_assemblies=${result.croatia.counts.assemblies}`);
    }
    if (result.portugal) {
      console.log("lineage=country-package-portugal");
      console.log(`portugal_attempt_id=${result.portugal.attemptId}`);
      console.log(`portugal_release_id=${result.portugal.releaseId}`);
      console.log(`portugal_fingerprint_sha256=${result.portugal.fingerprint}`);
      console.log(`portugal_reused_release=${result.portugal.reusedRelease ? "yes" : "no"}`);
      console.log(`portugal_offices=${result.portugal.counts.offices}`);
      console.log(`portugal_current=${result.portugal.counts.current_offices}`);
      console.log(`portugal_historical=${result.portugal.counts.historical_offices}`);
      console.log(`portugal_municipal=${result.portugal.counts.municipal_offices}`);
      console.log(`portugal_regional=${result.portugal.counts.regional_offices}`);
      console.log(`portugal_national=${result.portugal.counts.national_offices}`);
      console.log(`portugal_other=${result.portugal.counts.other_offices}`);
      console.log(`portugal_selected_histories=${result.portugal.counts.selected_histories}`);
      console.log(`portugal_prospective_events=${result.portugal.counts.prospective_events}`);
      console.log(`portugal_result_rows=${result.portugal.counts.result_rows}`);
      console.log(`portugal_proceedings=${result.portugal.counts.proceedings}`);
      console.log(`portugal_sources=${result.portugal.counts.sources}`);
      console.log(`portugal_unresolved=${result.portugal.counts.unresolved_evidence}`);
      console.log(`portugal_approved=${result.portugal.counts.approved_classifications}`);
      console.log(`portugal_needs_review=${result.portugal.counts.needs_review_classifications}`);
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
