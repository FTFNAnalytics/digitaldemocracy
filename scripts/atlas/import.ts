#!/usr/bin/env npx tsx
/**
 * Import approved Atlas lineages into SQLite.
 *
 * Default scope is Albania + Andorra + Alderney + Armenia + Austria + Belgium + Bosnia and Herzegovina +
 * Bulgaria + Netherlands + Switzerland + approved LatAm packs + New Zealand + Denmark + Sweden + Finland + Norway + Ireland + Poland + Czechia + Croatia + Portugal + Spain + Estonia (`ATLAS_IMPORT_SCOPE=all`).
 * Latvia is not part of `all`; use `ATLAS_IMPORT_SCOPE=latvia`.
 * Lithuania is not part of `all`; use `ATLAS_IMPORT_SCOPE=lithuania`.
 * Hungary is scoped-only (`ATLAS_IMPORT_SCOPE=hungary`) and is not part of `all`.
 * Romania is not part of `all`; use `ATLAS_IMPORT_SCOPE=romania`.
 * Greece is not part of `all`; use `ATLAS_IMPORT_SCOPE=greece`.
 * Luxembourg is not part of `all`; use `ATLAS_IMPORT_SCOPE=luxembourg`.
 * Malta is not part of `all`; use `ATLAS_IMPORT_SCOPE=malta`.
 * Cyprus is not part of `all`; use `ATLAS_IMPORT_SCOPE=cyprus`.
 * France is not part of `all`; use `ATLAS_IMPORT_SCOPE=france`.
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
    if (result.spain) {
      console.log("lineage=country-package-spain");
      console.log(`spain_attempt_id=${result.spain.attemptId}`);
      console.log(`spain_release_id=${result.spain.releaseId}`);
      console.log(`spain_fingerprint_sha256=${result.spain.fingerprint}`);
      console.log(`spain_reused_release=${result.spain.reusedRelease ? "yes" : "no"}`);
      console.log(`spain_offices=${result.spain.counts.offices}`);
      console.log(`spain_current=${result.spain.counts.current_offices}`);
      console.log(`spain_historical=${result.spain.counts.historical_offices}`);
      console.log(`spain_municipal=${result.spain.counts.municipal_offices}`);
      console.log(`spain_regional=${result.spain.counts.regional_offices}`);
      console.log(`spain_national=${result.spain.counts.national_offices}`);
      console.log(`spain_other=${result.spain.counts.other_offices}`);
      console.log(`spain_diputaciones=${result.spain.counts.provincial_councils}`);
      console.log(`spain_islands=${result.spain.counts.island_councils}`);
      console.log(`spain_concejo_abierto=${result.spain.counts.concejo_abierto}`);
      console.log(`spain_mode_pending=${result.spain.counts.mode_pending_current}`);
      console.log(`spain_selected_histories=${result.spain.counts.selected_histories}`);
      console.log(`spain_prospective_events=${result.spain.counts.prospective_events}`);
      console.log(`spain_result_rows=${result.spain.counts.result_rows}`);
      console.log(`spain_proceedings=${result.spain.counts.proceedings}`);
      console.log(`spain_sources=${result.spain.counts.sources}`);
      console.log(`spain_unresolved=${result.spain.counts.unresolved_evidence}`);
      console.log(`spain_approved=${result.spain.counts.approved_classifications}`);
      console.log(`spain_needs_review=${result.spain.counts.needs_review_classifications}`);
    }
    if (result.estonia) {
      console.log("lineage=country-package-estonia");
      console.log(`estonia_attempt_id=${result.estonia.attemptId}`);
      console.log(`estonia_release_id=${result.estonia.releaseId}`);
      console.log(`estonia_fingerprint_sha256=${result.estonia.fingerprint}`);
      console.log(`estonia_reused_release=${result.estonia.reusedRelease ? "yes" : "no"}`);
      console.log(`estonia_offices=${result.estonia.counts.offices}`);
      console.log(`estonia_current=${result.estonia.counts.current_offices}`);
      console.log(`estonia_historical=${result.estonia.counts.historical_offices}`);
      console.log(`estonia_municipal=${result.estonia.counts.municipal_offices}`);
      console.log(`estonia_regional=${result.estonia.counts.regional_offices}`);
      console.log(`estonia_national=${result.estonia.counts.national_offices}`);
      console.log(`estonia_other=${result.estonia.counts.other_offices}`);
      console.log(`estonia_selected_histories=${result.estonia.counts.selected_histories}`);
      console.log(`estonia_prospective_events=${result.estonia.counts.prospective_events}`);
      console.log(`estonia_result_rows=${result.estonia.counts.result_rows}`);
      console.log(`estonia_proceedings=${result.estonia.counts.proceedings}`);
      console.log(`estonia_sources=${result.estonia.counts.sources}`);
      console.log(`estonia_unresolved=${result.estonia.counts.unresolved_evidence}`);
      console.log(`estonia_approved=${result.estonia.counts.approved_classifications}`);
      console.log(`estonia_needs_review=${result.estonia.counts.needs_review_classifications}`);
      console.log(`estonia_current_councils=${result.estonia.counts.current_councils}`);
      console.log(`estonia_current_direct_executive_offices=${result.estonia.counts.current_direct_executive_offices}`);
    }
    if (result.latvia) {
      console.log("lineage=country-package-latvia");
      console.log(`latvia_attempt_id=${result.latvia.attemptId}`);
      console.log(`latvia_release_id=${result.latvia.releaseId}`);
      console.log(`latvia_fingerprint_sha256=${result.latvia.fingerprint}`);
      console.log(`latvia_reused_release=${result.latvia.reusedRelease ? "yes" : "no"}`);
      console.log(`latvia_offices=${result.latvia.counts.offices}`);
      console.log(`latvia_current=${result.latvia.counts.current_offices}`);
      console.log(`latvia_historical=${result.latvia.counts.historical_offices}`);
      console.log(`latvia_municipal=${result.latvia.counts.municipal_offices}`);
      console.log(`latvia_regional=${result.latvia.counts.regional_offices}`);
      console.log(`latvia_national=${result.latvia.counts.national_offices}`);
      console.log(`latvia_other=${result.latvia.counts.other_offices}`);
      console.log(`latvia_selected_histories=${result.latvia.counts.selected_histories}`);
      console.log(`latvia_prospective_events=${result.latvia.counts.prospective_events}`);
      console.log(`latvia_result_rows=${result.latvia.counts.result_rows}`);
      console.log(`latvia_proceedings=${result.latvia.counts.proceedings}`);
      console.log(`latvia_sources=${result.latvia.counts.sources}`);
      console.log(`latvia_unresolved=${result.latvia.counts.unresolved_evidence}`);
      console.log(`latvia_approved=${result.latvia.counts.approved_classifications}`);
      console.log(`latvia_needs_review=${result.latvia.counts.needs_review_classifications}`);
      console.log(`latvia_current_councils=${result.latvia.counts.current_councils}`);
      console.log(`latvia_current_direct_executive_offices=${result.latvia.counts.current_direct_executive_offices}`);
    }
    if (result.lithuania) {
      console.log("lineage=country-package-lithuania");
      console.log(`lithuania_attempt_id=${result.lithuania.attemptId}`);
      console.log(`lithuania_release_id=${result.lithuania.releaseId}`);
      console.log(`lithuania_fingerprint_sha256=${result.lithuania.fingerprint}`);
      console.log(`lithuania_reused_release=${result.lithuania.reusedRelease ? "yes" : "no"}`);
      console.log(`lithuania_offices=${result.lithuania.counts.offices}`);
      console.log(`lithuania_current=${result.lithuania.counts.current_offices}`);
      console.log(`lithuania_historical=${result.lithuania.counts.historical_offices}`);
      console.log(`lithuania_municipal=${result.lithuania.counts.municipal_offices}`);
      console.log(`lithuania_regional=${result.lithuania.counts.regional_offices}`);
      console.log(`lithuania_national=${result.lithuania.counts.national_offices}`);
      console.log(`lithuania_other=${result.lithuania.counts.other_offices}`);
      console.log(`lithuania_selected_histories=${result.lithuania.counts.selected_histories}`);
      console.log(`lithuania_prospective_events=${result.lithuania.counts.prospective_events}`);
      console.log(`lithuania_result_rows=${result.lithuania.counts.result_rows}`);
      console.log(`lithuania_proceedings=${result.lithuania.counts.proceedings}`);
      console.log(`lithuania_sources=${result.lithuania.counts.sources}`);
      console.log(`lithuania_unresolved=${result.lithuania.counts.unresolved_evidence}`);
      console.log(`lithuania_approved=${result.lithuania.counts.approved_classifications}`);
      console.log(`lithuania_needs_review=${result.lithuania.counts.needs_review_classifications}`);
      console.log(`lithuania_current_councils=${result.lithuania.counts.current_councils}`);
      console.log(`lithuania_current_direct_executive_offices=${result.lithuania.counts.current_direct_executive_offices}`);
    }
    if (result.hungary) {
      console.log("lineage=country-package-hungary");
      console.log(`hungary_attempt_id=${result.hungary.attemptId}`);
      console.log(`hungary_release_id=${result.hungary.releaseId}`);
      console.log(`hungary_fingerprint_sha256=${result.hungary.fingerprint}`);
      console.log(`hungary_reused_release=${result.hungary.reusedRelease ? "yes" : "no"}`);
      console.log(`hungary_offices=${result.hungary.counts.offices}`);
      console.log(`hungary_current=${result.hungary.counts.current_offices}`);
      console.log(`hungary_historical=${result.hungary.counts.historical_offices}`);
      console.log(`hungary_municipal=${result.hungary.counts.municipal_offices}`);
      console.log(`hungary_regional=${result.hungary.counts.regional_offices}`);
      console.log(`hungary_national=${result.hungary.counts.national_offices}`);
      console.log(`hungary_other=${result.hungary.counts.other_offices}`);
      console.log(`hungary_selected_histories=${result.hungary.counts.selected_histories}`);
      console.log(`hungary_prospective_events=${result.hungary.counts.prospective_events}`);
      console.log(`hungary_result_rows=${result.hungary.counts.result_rows}`);
      console.log(`hungary_documented_result_rows_omitted=${result.hungary.counts.documented_result_rows_omitted}`);
      console.log(`hungary_proceedings=${result.hungary.counts.proceedings}`);
      console.log(`hungary_sources=${result.hungary.counts.sources}`);
      console.log(`hungary_unresolved=${result.hungary.counts.unresolved_evidence}`);
      console.log(`hungary_approved=${result.hungary.counts.approved_classifications}`);
      console.log(`hungary_needs_review=${result.hungary.counts.needs_review_classifications}`);
      console.log(`hungary_council_assembly_offices=${result.hungary.counts.council_assembly_offices}`);
      console.log(`hungary_current_direct_executive_offices=${result.hungary.counts.current_direct_executive_offices}`);
    }
    if (result.romania) {
      console.log("lineage=country-package-romania");
      console.log(`romania_attempt_id=${result.romania.attemptId}`);
      console.log(`romania_release_id=${result.romania.releaseId}`);
      console.log(`romania_fingerprint_sha256=${result.romania.fingerprint}`);
      console.log(`romania_reused_release=${result.romania.reusedRelease ? "yes" : "no"}`);
      console.log(`romania_offices=${result.romania.counts.offices}`);
      console.log(`romania_current=${result.romania.counts.current_offices}`);
      console.log(`romania_historical=${result.romania.counts.historical_offices}`);
      console.log(`romania_municipal=${result.romania.counts.municipal_offices}`);
      console.log(`romania_regional=${result.romania.counts.regional_offices}`);
      console.log(`romania_national=${result.romania.counts.national_offices}`);
      console.log(`romania_other=${result.romania.counts.other_offices}`);
      console.log(`romania_selected_histories=${result.romania.counts.selected_histories}`);
      console.log(`romania_prospective_events=${result.romania.counts.prospective_events}`);
      console.log(`romania_result_rows=${result.romania.counts.result_rows}`);
      console.log(`romania_proceedings=${result.romania.counts.proceedings}`);
      console.log(`romania_sources=${result.romania.counts.sources}`);
      console.log(`romania_unresolved=${result.romania.counts.unresolved_evidence}`);
      console.log(`romania_approved=${result.romania.counts.approved_classifications}`);
      console.log(`romania_needs_review=${result.romania.counts.needs_review_classifications}`);
      console.log(`romania_current_councils=${result.romania.counts.council_assembly_offices}`);
      console.log(`romania_current_direct_executive_offices=${result.romania.counts.direct_executive_offices}`);
      console.log(`romania_geographies=${result.romania.counts.geographies}`);
    }
    if (result.greece) {
      console.log("lineage=country-package-greece");
      console.log(`greece_attempt_id=${result.greece.attemptId}`);
      console.log(`greece_release_id=${result.greece.releaseId}`);
      console.log(`greece_fingerprint_sha256=${result.greece.fingerprint}`);
      console.log(`greece_reused_release=${result.greece.reusedRelease ? "yes" : "no"}`);
      console.log(`greece_offices=${result.greece.counts.offices}`);
      console.log(`greece_current=${result.greece.counts.current_offices}`);
      console.log(`greece_historical=${result.greece.counts.historical_offices}`);
      console.log(`greece_municipal=${result.greece.counts.municipal_offices}`);
      console.log(`greece_regional=${result.greece.counts.regional_offices}`);
      console.log(`greece_national=${result.greece.counts.national_offices}`);
      console.log(`greece_other=${result.greece.counts.other_offices}`);
      console.log(`greece_selected_histories=${result.greece.counts.selected_histories}`);
      console.log(`greece_prospective_events=${result.greece.counts.prospective_events}`);
      console.log(`greece_result_rows=${result.greece.counts.result_rows}`);
      console.log(`greece_proceedings=${result.greece.counts.proceedings}`);
      console.log(`greece_sources=${result.greece.counts.sources}`);
      console.log(`greece_unresolved=${result.greece.counts.unresolved_evidence}`);
      console.log(`greece_approved=${result.greece.counts.approved_classifications}`);
      console.log(`greece_needs_review=${result.greece.counts.needs_review_classifications}`);
      console.log(`greece_current_direct_executive_offices=${result.greece.counts.current_direct_executive_offices}`);
      console.log(`greece_historical_direct_executive_offices=${result.greece.counts.historical_direct_executive_offices}`);
      console.log(`greece_current_municipal_councils=${result.greece.counts.current_municipal_councils}`);
      console.log(`greece_current_mayors=${result.greece.counts.current_mayors}`);
      console.log(`greece_current_regional_councils=${result.greece.counts.current_regional_councils}`);
      console.log(`greece_current_governors=${result.greece.counts.current_governors}`);
      console.log(`greece_geographies=${result.greece.counts.geographies}`);
      console.log(`greece_distinct_observations=${result.greece.counts.distinct_observations}`);
    }
    if (result.luxembourg) {
      console.log("lineage=country-package-luxembourg");
      console.log(`luxembourg_attempt_id=${result.luxembourg.attemptId}`);
      console.log(`luxembourg_release_id=${result.luxembourg.releaseId}`);
      console.log(`luxembourg_fingerprint_sha256=${result.luxembourg.fingerprint}`);
      console.log(`luxembourg_reused_release=${result.luxembourg.reusedRelease ? "yes" : "no"}`);
      console.log(`luxembourg_offices=${result.luxembourg.counts.offices}`);
      console.log(`luxembourg_current=${result.luxembourg.counts.current_offices}`);
      console.log(`luxembourg_historical=${result.luxembourg.counts.historical_offices}`);
      console.log(`luxembourg_municipal=${result.luxembourg.counts.municipal_offices}`);
      console.log(`luxembourg_regional=${result.luxembourg.counts.regional_offices}`);
      console.log(`luxembourg_national=${result.luxembourg.counts.national_offices}`);
      console.log(`luxembourg_other=${result.luxembourg.counts.other_offices}`);
      console.log(`luxembourg_selected_histories=${result.luxembourg.counts.selected_histories}`);
      console.log(`luxembourg_prospective_events=${result.luxembourg.counts.prospective_events}`);
      console.log(`luxembourg_result_rows=${result.luxembourg.counts.result_rows}`);
      console.log(`luxembourg_documented_result_rows_omitted=${result.luxembourg.counts.documented_result_rows_omitted}`);
      console.log(`luxembourg_observation_envelopes=${result.luxembourg.counts.observation_envelopes}`);
      console.log(`luxembourg_sources=${result.luxembourg.counts.sources}`);
      console.log(`luxembourg_unresolved=${result.luxembourg.counts.unresolved_evidence}`);
      console.log(`luxembourg_approved=${result.luxembourg.counts.approved_classifications}`);
      console.log(`luxembourg_needs_review=${result.luxembourg.counts.needs_review_classifications}`);
      console.log(`luxembourg_current_communal_councils=${result.luxembourg.counts.current_communal_councils}`);
      console.log(`luxembourg_historical_communal_councils=${result.luxembourg.counts.historical_communal_councils}`);
      console.log(`luxembourg_direct_executive_offices=${result.luxembourg.counts.direct_executive_offices}`);
      console.log(`luxembourg_explicit_predecessor_edges=${result.luxembourg.counts.explicit_predecessor_edges}`);
      console.log(`luxembourg_geographies=${result.luxembourg.counts.geographies}`);
    }
    if (result.malta) {
      console.log("lineage=country-package-malta");
      console.log(`malta_attempt_id=${result.malta.attemptId}`);
      console.log(`malta_release_id=${result.malta.releaseId}`);
      console.log(`malta_fingerprint_sha256=${result.malta.fingerprint}`);
      console.log(`malta_reused_release=${result.malta.reusedRelease ? "yes" : "no"}`);
      console.log(`malta_offices=${result.malta.counts.offices}`);
      console.log(`malta_current=${result.malta.counts.current_offices}`);
      console.log(`malta_historical=${result.malta.counts.historical_offices}`);
      console.log(`malta_municipal=${result.malta.counts.municipal_offices}`);
      console.log(`malta_regional=${result.malta.counts.regional_offices}`);
      console.log(`malta_national=${result.malta.counts.national_offices}`);
      console.log(`malta_other=${result.malta.counts.other_offices}`);
      console.log(`malta_selected_histories=${result.malta.counts.selected_histories}`);
      console.log(`malta_prospective_events=${result.malta.counts.prospective_events}`);
      console.log(`malta_result_rows=${result.malta.counts.result_rows}`);
      console.log(`malta_documented_result_rows_omitted=${result.malta.counts.documented_result_rows_omitted}`);
      console.log(`malta_documented_stv_count_observations_omitted=${result.malta.counts.documented_stv_count_observations_omitted}`);
      console.log(`malta_documented_numeric_first_preference_rows_omitted=${result.malta.counts.documented_numeric_first_preference_rows_omitted}`);
      console.log(`malta_sources=${result.malta.counts.sources}`);
      console.log(`malta_unresolved=${result.malta.counts.unresolved_evidence}`);
      console.log(`malta_approved=${result.malta.counts.approved_classifications}`);
      console.log(`malta_needs_review=${result.malta.counts.needs_review_classifications}`);
      console.log(`malta_current_local_councils=${result.malta.counts.current_local_councils}`);
      console.log(`malta_malta_local_councils=${result.malta.counts.malta_local_councils}`);
      console.log(`malta_gozo_local_councils=${result.malta.counts.gozo_local_councils}`);
      console.log(`malta_current_mayors=${result.malta.counts.current_mayors}`);
      console.log(`malta_current_deputy_mayors=${result.malta.counts.current_deputy_mayors}`);
      console.log(`malta_current_indirect_regional_presidents=${result.malta.counts.current_indirect_regional_presidents}`);
      console.log(`malta_direct_executive_offices=${result.malta.counts.direct_executive_offices}`);
      console.log(`malta_explicit_predecessor_edges=${result.malta.counts.explicit_predecessor_edges}`);
      console.log(`malta_regional_nominations=${result.malta.counts.regional_nominations}`);
      console.log(`malta_geographies=${result.malta.counts.geographies}`);
    }
    if (result.cyprus) {
      console.log("lineage=country-package-cyprus");
      console.log(`cyprus_attempt_id=${result.cyprus.attemptId}`);
      console.log(`cyprus_release_id=${result.cyprus.releaseId}`);
      console.log(`cyprus_fingerprint_sha256=${result.cyprus.fingerprint}`);
      console.log(`cyprus_reused_release=${result.cyprus.reusedRelease ? "yes" : "no"}`);
      console.log(`cyprus_offices=${result.cyprus.counts.offices}`);
      console.log(`cyprus_current=${result.cyprus.counts.current_offices}`);
      console.log(`cyprus_historical=${result.cyprus.counts.historical_offices}`);
      console.log(`cyprus_municipal=${result.cyprus.counts.municipal_offices}`);
      console.log(`cyprus_regional=${result.cyprus.counts.regional_offices}`);
      console.log(`cyprus_national=${result.cyprus.counts.national_offices}`);
      console.log(`cyprus_other=${result.cyprus.counts.other_offices}`);
      console.log(`cyprus_selected_histories=${result.cyprus.counts.selected_histories}`);
      console.log(`cyprus_prospective_events=${result.cyprus.counts.prospective_events}`);
      console.log(`cyprus_result_rows=${result.cyprus.counts.result_rows}`);
      console.log(`cyprus_documented_result_rows_omitted=${result.cyprus.counts.documented_result_rows_omitted}`);
      console.log(`cyprus_sources=${result.cyprus.counts.sources}`);
      console.log(`cyprus_unresolved=${result.cyprus.counts.unresolved_evidence}`);
      console.log(`cyprus_approved=${result.cyprus.counts.approved_classifications}`);
      console.log(`cyprus_needs_review=${result.cyprus.counts.needs_review_classifications}`);
      console.log(`cyprus_current_local_councils=${result.cyprus.counts.current_local_councils}`);
      console.log(`cyprus_current_municipal_councils=${result.cyprus.counts.current_municipal_councils}`);
      console.log(`cyprus_current_mayors=${result.cyprus.counts.current_mayors}`);
      console.log(`cyprus_current_deputy_mayors=${result.cyprus.counts.current_deputy_mayors}`);
      console.log(`cyprus_current_community_councils=${result.cyprus.counts.current_community_councils}`);
      console.log(`cyprus_current_community_leaders=${result.cyprus.counts.current_community_leaders}`);
      console.log(`cyprus_current_dlgo_presidents=${result.cyprus.counts.current_dlgo_presidents}`);
      console.log(`cyprus_direct_executive_offices=${result.cyprus.counts.direct_executive_offices}`);
      console.log(`cyprus_historical_direct_executives=${result.cyprus.counts.historical_direct_executives}`);
      console.log(`cyprus_explicit_predecessor_edges=${result.cyprus.counts.explicit_predecessor_edges}`);
      console.log(`cyprus_named_communities=${result.cyprus.counts.named_communities}`);
      console.log(`cyprus_ministry_overview_communities=${result.cyprus.counts.ministry_overview_communities}`);
      console.log(`cyprus_year_only_events=${result.cyprus.counts.year_only_events}`);
      console.log(`cyprus_offices_without_events=${result.cyprus.counts.offices_without_events}`);
      console.log(`cyprus_geographies=${result.cyprus.counts.geographies}`);
    }
    if (result.france) {
      console.log("lineage=country-package-france");
      console.log(`france_attempt_id=${result.france.attemptId}`);
      console.log(`france_release_id=${result.france.releaseId}`);
      console.log(`france_fingerprint_sha256=${result.france.fingerprint}`);
      console.log(`france_reused_release=${result.france.reusedRelease ? "yes" : "no"}`);
      console.log(`france_offices=${result.france.counts.offices}`);
      console.log(`france_current=${result.france.counts.current_offices}`);
      console.log(`france_historical=${result.france.counts.historical_offices}`);
      console.log(`france_municipal=${result.france.counts.municipal_offices}`);
      console.log(`france_regional=${result.france.counts.regional_offices}`);
      console.log(`france_national=${result.france.counts.national_offices}`);
      console.log(`france_other=${result.france.counts.other_offices}`);
      console.log(`france_selected_histories=${result.france.counts.selected_histories}`);
      console.log(`france_prospective_events=${result.france.counts.prospective_events}`);
      console.log(`france_result_rows=${result.france.counts.result_rows}`);
      console.log(`france_documented_result_rows_omitted=${result.france.counts.documented_result_rows_omitted}`);
      console.log(`france_documented_event_rows_omitted=${result.france.counts.documented_event_rows_omitted}`);
      console.log(`france_documented_reporting_units_omitted=${result.france.counts.documented_reporting_units_omitted}`);
      console.log(`france_sources=${result.france.counts.sources}`);
      console.log(`france_unresolved=${result.france.counts.unresolved_evidence}`);
      console.log(`france_approved=${result.france.counts.approved_classifications}`);
      console.log(`france_needs_review=${result.france.counts.needs_review_classifications}`);
      console.log(`france_current_municipal_councils=${result.france.counts.current_municipal_councils}`);
      console.log(`france_current_departmental_councils=${result.france.counts.current_departmental_councils}`);
      console.log(`france_current_regional_councils=${result.france.counts.current_regional_councils}`);
      console.log(`france_current_single_territorial_assemblies=${result.france.counts.current_single_territorial_assemblies}`);
      console.log(`france_current_metropolitan_councils=${result.france.counts.current_metropolitan_councils}`);
      console.log(`france_current_sector_councils=${result.france.counts.current_sector_councils}`);
      console.log(`france_direct_executive_offices=${result.france.counts.direct_executive_offices}`);
      console.log(`france_historical_direct_executives=${result.france.counts.historical_direct_executives}`);
      console.log(`france_explicit_predecessor_edges=${result.france.counts.explicit_predecessor_edges}`);
      console.log(`france_research_dates=${result.france.counts.research_dates}`);
      console.log(`france_calendar_called_days=${result.france.counts.calendar_called_days}`);
      console.log(`france_geographies=${result.france.counts.geographies}`);
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
