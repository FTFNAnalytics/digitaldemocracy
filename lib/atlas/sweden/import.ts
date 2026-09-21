import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BARA_HISTORICAL_ID,
  BASTAD_2014_HK,
  BASTAD_2015_EVENT_ID,
  BASTAD_2015_HK,
  BASTAD_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DALARNA_REGION_ID,
  EP_ID,
  EXPECTED_COUNTS,
  FALUN_2018_EVENT_ID,
  FALUN_2018_HK,
  FARGELANDA_DISPUTED_RESULT_ID,
  FARGELANDA_ID,
  GOTLAND_COUNCIL_ID,
  GOTLAND_GEOGRAPHY_ID,
  LANDSTING_EXAMPLE_ID,
  LINEAGE_ID as SWEDEN_LINEAGE,
  LIVE_2026_SAMPLE_HK,
  RIKSDAG_ID,
  SAMI_ID,
  SAMI_MAY_2025_EVENT_ID,
  SAMI_MAY_2025_HK,
  SAMI_NEXT_DATE_ID,
  SAMI_OCT_2025_EVENT_ID,
  SAMI_OCT_2025_HK,
  STOCKHOLM_COUNCIL_ID,
  STOCKHOLM_GEOGRAPHY_ID,
  STOCKHOLM_NEXT_DATE_ID,
  SVEDALA_CURRENT_ID,
  SVEDALA_PRE1976_ID,
  TIER_PATH,
  TIER_SHA256,
  UNKNOWN_SEAT_RESULT_ID,
  ZERO_SEAT_RESULT_ID,
} from "./identity";
import { failAttempt, reconcileStartedAttempts, startAttempt, succeedAttempt } from "../ledger";
import { migrateAttemptsDatabase, migrateMasterDatabase } from "../apply-migrations";
import {
  acquireWriterLock,
  backupPublishedToStaging,
  discardStaging,
  publishStaging,
  releaseWriterLock,
  stagingPathFor,
} from "../publish";
import { assertIntegrity, countRows, openAtlasDatabase } from "../sqlite";
import { SwedenPreflightError, scanSwedenInventory, type SwedenInventory } from "./inventory";
import { projectSweden, type SwedenProjection } from "./project";
import { writeSwedenProjection } from "./write";

export type ImportSwedenOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: SwedenProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportSwedenResult = {
  attemptId: string;
  releaseId: string;
  fingerprint: string;
  reusedRelease: boolean;
  counts: Record<string, number>;
};

function fixtureEnvEnabled(): boolean {
  return process.env.OBSERVATORY_FIXTURES === "1";
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function importSweden(options: ImportSwedenOptions): ImportSwedenResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: SWEDEN_LINEAGE,
    intended_tier_path: options.tierPath ?? TIER_PATH,
  };

  const finishFailure = (error: unknown): never => {
    if (lockFd != null) discardStaging(options.sqlitePath);
    if (started) {
      failAttempt(options.attemptsPath, attemptId, errorText(error));
    }
    throw error;
  };

  try {
    lockFd = acquireWriterLock(options.sqlitePath);
    migrateAttemptsDatabase(options.root, options.attemptsPath);
    reconcileStartedAttempts(options.attemptsPath, options.sqlitePath, existsSync(options.sqlitePath));

    let inventory: SwedenInventory;
    try {
      inventory = scanSwedenInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof SwedenPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: SWEDEN_LINEAGE,
          operator,
          scriptVersion: SCRIPT_VERSION,
          inputInventory: inventoryJson,
        });
        started = true;
      }
      throw error;
    }

    startAttempt(options.attemptsPath, {
      attemptId,
      lineageId: SWEDEN_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectSweden(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(SWEDEN_LINEAGE, inventory.fingerprint);
        reusedRelease = Boolean(existing && String(existing.release_id) === inventory.releaseId);
      } finally {
        published.close();
      }
      backupPublishedToStaging(options.sqlitePath);
    } else {
      discardStaging(options.sqlitePath);
      migrateMasterDatabase(options.root, stagingPathFor(options.sqlitePath));
    }

    const staging = openAtlasDatabase(stagingPathFor(options.sqlitePath));
    try {
      writeSwedenProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertSwedenFidelity(staging, projection);
    } finally {
      staging.close();
    }

    if (options.failBeforeRename) {
      throw new Error("Injected failure before rename");
    }

    publishStaging(options.sqlitePath);

    const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    let publicationSet: { lineage_id: string; release_id: string }[] = [];
    try {
      assertIntegrity(published);
      publicationSet = published
        .prepare("SELECT lineage_id, release_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => ({ lineage_id: String(row.lineage_id), release_id: String(row.release_id) }));
      const receipt = published.prepare("SELECT last_publish_attempt_id FROM publication_receipt WHERE singleton = 1").get();
      if (String(receipt?.last_publish_attempt_id) !== attemptId) {
        throw new Error("Published receipt does not match this attempt");
      }
    } finally {
      published.close();
    }

    succeedAttempt(options.attemptsPath, attemptId, inventory.releaseId, publicationSet, projection.validatedCounts);
    return {
      attemptId,
      releaseId: inventory.releaseId,
      fingerprint: inventory.fingerprint,
      reusedRelease,
      counts: projection.validatedCounts,
    };
  } catch (error) {
    return finishFailure(error);
  } finally {
    releaseWriterLock(options.sqlitePath, lockFd);
  }
}

export function assertSwedenFidelity(db: DatabaseSync, projection?: SwedenProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [SWEDEN_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [SWEDEN_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [SWEDEN_LINEAGE],
  );
  const otherHistories = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [SWEDEN_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [SWEDEN_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [SWEDEN_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [SWEDEN_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [SWEDEN_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [SWEDEN_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [SWEDEN_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [SWEDEN_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [SWEDEN_LINEAGE]);
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%kommunalråd%' OR office_type LIKE '%statsminister%' OR office_id LIKE '%-M')",
    [SWEDEN_LINEAGE],
  );
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [SWEDEN_LINEAGE]);
  const inventedGotlandRegional = countRows(
    db,
    "office",
    "lineage_id = ? AND office_id != ? AND (office_id LIKE '%0980%' OR name LIKE '%Gotland%')",
    [SWEDEN_LINEAGE, GOTLAND_COUNCIL_ID],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (otherHistories !== EXPECTED_COUNTS.other_histories) throw new Error(`other histories ${otherHistories}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`none/preliminary events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) {
    throw new Error(`needs_review count ${needsReview}`);
  }
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`date count ${dates}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (mayorOffices !== 0 || mayorResults !== 0) throw new Error("mayor office/result rows must be 0");
  if (inventedGotlandRegional !== 0) throw new Error("A second Gotland office must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'sweden'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "SE" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Sverige"
  ) {
    throw new Error("Sweden country projection mismatch");
  }

  const stockholm = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id, next_date_id FROM office WHERE office_id = ?")
    .get(STOCKHOLM_COUNCIL_ID);
  if (
    !stockholm ||
    String(stockholm.office_status) !== "current" ||
    String(stockholm.record_state) !== "active" ||
    String(stockholm.next_date_resolution) !== "resolved" ||
    stockholm.next_history_key != null ||
    String(stockholm.geography_id) !== STOCKHOLM_GEOGRAPHY_ID ||
    String(stockholm.next_date_id) !== STOCKHOLM_NEXT_DATE_ID
  ) {
    throw new Error("Stockholm council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(STOCKHOLM_NEXT_DATE_ID);
  if (
    !next ||
    String(next.label) !== "2030" ||
    String(next.precision) !== "year" ||
    String(next.certainty) !== "statutory" ||
    Number(next.year) !== 2030 ||
    next.month != null ||
    next.day != null
  ) {
    throw new Error("Stockholm 2030 year-precision next-date mismatch");
  }

  const gotland = db
    .prepare(
      "SELECT o.office_status, o.geography_id, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(GOTLAND_COUNCIL_ID);
  if (
    !gotland ||
    String(gotland.office_status) !== "current" ||
    String(gotland.geography_id) !== GOTLAND_GEOGRAPHY_ID ||
    String(gotland.tier) !== "municipal" ||
    String(gotland.review_status) !== "needs_review"
  ) {
    throw new Error("Gotland must stay the accepted municipal focused-review office");
  }

  const bara = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(BARA_HISTORICAL_ID);
  if (!bara || String(bara.office_status) !== "historical" || String(bara.record_state) !== "active" || bara.next_date_id != null) {
    throw new Error("Historical Bara office must stay active without an inferred end date");
  }
  const svedalaOld = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SVEDALA_PRE1976_ID);
  const svedalaNow = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SVEDALA_CURRENT_ID);
  if (!svedalaOld || String(svedalaOld.office_status) !== "historical") {
    throw new Error("Pre-1976 Svedala must stay a distinct historical office");
  }
  if (!svedalaNow || String(svedalaNow.office_status) !== "current") {
    throw new Error("Current Svedala must remain distinct from the 1973 predecessor");
  }

  const landsting = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(LANDSTING_EXAMPLE_ID);
  if (!landsting || String(landsting.office_status) !== "historical" || String(landsting.tier) !== "regional") {
    throw new Error("Former landsting must stay a historical regional office");
  }
  const dalarna = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(DALARNA_REGION_ID);
  if (!dalarna || String(dalarna.office_status) !== "current" || String(dalarna.tier) !== "regional") {
    throw new Error("Region Dalarna must stay a current regional office");
  }

  const riksdag = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(RIKSDAG_ID);
  if (!riksdag || String(riksdag.office_status) !== "current" || String(riksdag.tier) !== "national_context") {
    throw new Error("Riksdagen must be the accepted national_context row");
  }
  const ep = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Sweden EP delegation must stay the accepted other/needs_review row");
  }
  const sami = db
    .prepare("SELECT o.office_status, o.next_date_id, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(SAMI_ID);
  if (
    !sami ||
    String(sami.office_status) !== "current" ||
    String(sami.tier) !== "other" ||
    String(sami.review_status) !== "needs_review" ||
    String(sami.next_date_id) !== SAMI_NEXT_DATE_ID
  ) {
    throw new Error("Sametinget must stay the accepted other/needs_review row with 2029-05-20 metadata");
  }
  const samiNext = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(SAMI_NEXT_DATE_ID);
  if (
    !samiNext ||
    String(samiNext.label) !== "2029-05-20" ||
    String(samiNext.precision) !== "day" ||
    String(samiNext.certainty) !== "statutory" ||
    Number(samiNext.year) !== 2029 ||
    Number(samiNext.month) !== 5 ||
    Number(samiNext.day) !== 20
  ) {
    throw new Error("Sameting 2029-05-20 next-date mismatch");
  }

  const falun = db.prepare("SELECT event_id, event_kind FROM election_event WHERE history_key = ?").get(FALUN_2018_HK);
  if (!falun || String(falun.event_id) !== FALUN_2018_EVENT_ID || String(falun.event_kind) !== "repeated") {
    throw new Error("Falun 2018/2019 repeat event identity mismatch");
  }
  const bastad2014 = db
    .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(BASTAD_2014_HK);
  if (!bastad2014 || String(bastad2014.selected_history_role) !== "other" || String(bastad2014.legal_outcome) !== "superseded") {
    throw new Error("Båstad 2014 ordinary event must stay other/superseded");
  }
  const bastad2015 = db
    .prepare("SELECT event_id, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(BASTAD_2015_HK);
  if (
    !bastad2015 ||
    String(bastad2015.event_id) !== BASTAD_2015_EVENT_ID ||
    String(bastad2015.selected_history_role) !== "selected" ||
    String(bastad2015.legal_outcome) !== "unknown"
  ) {
    throw new Error("Båstad 2015 repeat event identity mismatch");
  }
  if (countRows(db, "result_row", "history_key = ?", [BASTAD_2015_HK]) !== 0) {
    throw new Error("Båstad 2015 must not invent typed result rows");
  }
  if (countRows(db, "office", "office_id = ?", [BASTAD_ID]) !== 1) {
    throw new Error("Båstad office missing");
  }

  const samiMay = db
    .prepare("SELECT event_id, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(SAMI_MAY_2025_HK);
  if (
    !samiMay ||
    String(samiMay.event_id) !== SAMI_MAY_2025_EVENT_ID ||
    String(samiMay.selected_history_role) !== "other" ||
    String(samiMay.legal_outcome) !== "annulled"
  ) {
    throw new Error("Annulled Sami May 2025 event mismatch");
  }
  const samiOct = db.prepare("SELECT event_id, selected_history_role FROM election_event WHERE history_key = ?").get(SAMI_OCT_2025_HK);
  if (!samiOct || String(samiOct.event_id) !== SAMI_OCT_2025_EVENT_ID || String(samiOct.selected_history_role) !== "selected") {
    throw new Error("Sami October 2025 repeat must stay selected");
  }

  const live2026 = db
    .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(LIVE_2026_SAMPLE_HK);
  if (!live2026 || String(live2026.selected_history_role) !== "none" || String(live2026.legal_outcome) !== "preliminary") {
    throw new Error("2026 local counts must stay preliminary/none; do not fabricate finals");
  }

  const disputed = db
    .prepare("SELECT seats, seats_status, evidence_status FROM result_row WHERE result_row_id = ?")
    .get(FARGELANDA_DISPUTED_RESULT_ID);
  if (!disputed || disputed.seats != null || String(disputed.seats_status) !== "unknown" || String(disputed.evidence_status) !== "disputed") {
    throw new Error("Färgelanda 1973 hypothetical seats must stay withheld/disputed");
  }
  if (countRows(db, "result_row", "office_id = ? AND history_key LIKE '%::1973::%' AND evidence_status = 'disputed'", [FARGELANDA_ID]) !== 7) {
    throw new Error("Färgelanda 1973 disputed row count mismatch");
  }
  const zeroSeat = db.prepare("SELECT votes, seats, seats_status FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Reported zero seat must stay integer 0/zero");
  }
  const unknownSeat = db.prepare("SELECT seats, seats_status, share FROM result_row WHERE result_row_id = ?").get(UNKNOWN_SEAT_RESULT_ID);
  if (!unknownSeat || unknownSeat.seats != null || String(unknownSeat.seats_status) !== "unknown") {
    throw new Error("Unreported seats must stay NULL/unknown");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(SWEDEN_LINEAGE, projection.release.release_id);
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (
      parsed.adapter_version !== hashes?.adapter_version ||
      parsed.method_version !== hashes?.method_version ||
      parsed.schema_version !== hashes?.schema_version
    ) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (!Array.isArray(parsed.schema_inputs) || parsed.schema_inputs[0]?.input_path !== "0001_atlas_attempt_log.sql") {
      throw new Error("schema_inputs must use checked-in migration filenames");
    }
    if (String(hashes?.release_id) === CANDIDATE_RELEASE_ID && String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT) {
      throw new Error("Candidate release ID does not match documented fingerprint");
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(SWEDEN_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Sweden tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [SWEDEN_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
