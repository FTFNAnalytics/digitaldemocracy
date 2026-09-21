import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BOROUGH_EXAMPLE_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  HISTORICAL_METADATA_ID,
  LINEAGE_ID as NORWAY_LINEAGE,
  LONGYEARBYEN_GEOGRAPHY_ID,
  LONGYEARBYEN_ID,
  OSLO_COUNCIL_ID,
  OSLO_COUNTY_OFFICE_ID,
  OSLO_GEOGRAPHY_ID,
  OSLO_NEXT_DATE_ID,
  OSTFOLD_HISTORICAL_ID,
  ROGALAND_COUNCIL_ID,
  SAMI_2025_DISPUTED_RESULT_ID,
  SAMI_2025_EVENT_ID,
  SAMI_2025_HK,
  SAMI_ID,
  SAMI_NEXT_DATE_ID,
  STORTING_1945_EVENT_ID,
  STORTING_1945_HK,
  STORTING_ID,
  STORTING_NEXT_DATE_ID,
  TIER_PATH,
  TIER_SHA256,
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
import { NorwayPreflightError, scanNorwayInventory, type NorwayInventory } from "./inventory";
import { projectNorway, type NorwayProjection } from "./project";
import { writeNorwayProjection } from "./write";

export type ImportNorwayOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: NorwayProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportNorwayResult = {
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

export function importNorway(options: ImportNorwayOptions): ImportNorwayResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: NORWAY_LINEAGE,
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

    let inventory: NorwayInventory;
    try {
      inventory = scanNorwayInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof NorwayPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: NORWAY_LINEAGE,
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
      lineageId: NORWAY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectNorway(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(NORWAY_LINEAGE, inventory.fingerprint);
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
      writeNorwayProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertNorwayFidelity(staging, projection);
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

export function assertNorwayFidelity(db: DatabaseSync, projection?: NorwayProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [NORWAY_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [NORWAY_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [NORWAY_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [NORWAY_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [NORWAY_LINEAGE],
  );
  const otherHistories = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [NORWAY_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [NORWAY_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [NORWAY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [NORWAY_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [NORWAY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [NORWAY_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [NORWAY_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [NORWAY_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [NORWAY_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [NORWAY_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [NORWAY_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [NORWAY_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [NORWAY_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [NORWAY_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [NORWAY_LINEAGE]);
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%ordfører%' OR office_type LIKE '%statsminister%' OR office_id LIKE '%-M')",
    [NORWAY_LINEAGE],
  );
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [NORWAY_LINEAGE]);
  const inventedOsloCounty = countRows(db, "office", "office_id = ?", [OSLO_COUNTY_OFFICE_ID]);
  const epOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_id LIKE '%-EP%' OR name LIKE '%Europaparlament%')",
    [NORWAY_LINEAGE],
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
  if (inventedOsloCounty !== 0) throw new Error("A separate Oslo fylkesting office must not be invented");
  if (epOffices !== 0) throw new Error("Norway EP offices must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'norway'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "NO" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Norge"
  ) {
    throw new Error("Norway country projection mismatch");
  }

  const oslo = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id, next_date_id FROM office WHERE office_id = ?")
    .get(OSLO_COUNCIL_ID);
  if (
    !oslo ||
    String(oslo.office_status) !== "current" ||
    String(oslo.record_state) !== "active" ||
    String(oslo.next_date_resolution) !== "resolved" ||
    oslo.next_history_key != null ||
    String(oslo.geography_id) !== OSLO_GEOGRAPHY_ID ||
    String(oslo.next_date_id) !== OSLO_NEXT_DATE_ID
  ) {
    throw new Error("Oslo bystyre projection mismatch");
  }
  const osloTier = db
    .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
    .get(OSLO_COUNCIL_ID);
  if (!osloTier || String(osloTier.tier) !== "municipal") {
    throw new Error("Oslo bystyre must stay the accepted municipal office");
  }
  const osloNext = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(OSLO_NEXT_DATE_ID);
  if (
    !osloNext ||
    String(osloNext.label) !== "2027-09-13" ||
    String(osloNext.precision) !== "day" ||
    String(osloNext.certainty) !== "called" ||
    Number(osloNext.year) !== 2027 ||
    Number(osloNext.month) !== 9 ||
    Number(osloNext.day) !== 13
  ) {
    throw new Error("Oslo 2027-09-13 next-date mismatch");
  }

  const rogaland = db
    .prepare(
      "SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(ROGALAND_COUNCIL_ID);
  if (!rogaland || String(rogaland.office_status) !== "current" || String(rogaland.tier) !== "regional") {
    throw new Error("Rogaland fylkesting must stay a current regional office");
  }
  const ostfold = db
    .prepare(
      "SELECT o.office_status, o.record_state, o.next_date_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(OSTFOLD_HISTORICAL_ID);
  if (
    !ostfold ||
    String(ostfold.office_status) !== "historical" ||
    String(ostfold.record_state) !== "active" ||
    ostfold.next_date_id != null ||
    String(ostfold.tier) !== "regional"
  ) {
    throw new Error("Historical Østfold county council must stay active without an inferred end date");
  }

  const storting = db
    .prepare("SELECT o.office_status, o.next_date_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(STORTING_ID);
  if (
    !storting ||
    String(storting.office_status) !== "current" ||
    String(storting.tier) !== "national_context" ||
    String(storting.next_date_id) !== STORTING_NEXT_DATE_ID
  ) {
    throw new Error("Stortinget must be the accepted national_context row");
  }
  const stortingNext = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(STORTING_NEXT_DATE_ID);
  if (
    !stortingNext ||
    String(stortingNext.label) !== "2029" ||
    String(stortingNext.precision) !== "year" ||
    String(stortingNext.certainty) !== "expected" ||
    Number(stortingNext.year) !== 2029 ||
    stortingNext.month != null ||
    stortingNext.day != null
  ) {
    throw new Error("Storting 2029 year-expected next-date mismatch");
  }
  const storting1945 = db
    .prepare("SELECT event_id, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(STORTING_1945_HK);
  if (
    !storting1945 ||
    String(storting1945.event_id) !== STORTING_1945_EVENT_ID ||
    String(storting1945.selected_history_role) !== "selected" ||
    String(storting1945.legal_outcome) !== "unknown"
  ) {
    throw new Error("Storting 1945 year-precision event mismatch");
  }

  const sami = db
    .prepare("SELECT o.office_status, o.next_date_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(SAMI_ID);
  if (
    !sami ||
    String(sami.office_status) !== "current" ||
    String(sami.tier) !== "other" ||
    String(sami.next_date_id) !== SAMI_NEXT_DATE_ID
  ) {
    throw new Error("Sámediggi must stay the accepted other row with 2029 year metadata");
  }
  const samiNext = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(SAMI_NEXT_DATE_ID);
  if (
    !samiNext ||
    String(samiNext.label) !== "2029" ||
    String(samiNext.precision) !== "year" ||
    String(samiNext.certainty) !== "expected" ||
    Number(samiNext.year) !== 2029 ||
    samiNext.month != null ||
    samiNext.day != null
  ) {
    throw new Error("Sámi 2029 year-expected next-date mismatch");
  }
  const sami2025 = db
    .prepare("SELECT event_id, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(SAMI_2025_HK);
  if (
    !sami2025 ||
    String(sami2025.event_id) !== SAMI_2025_EVENT_ID ||
    String(sami2025.selected_history_role) !== "selected" ||
    String(sami2025.legal_outcome) !== "unknown"
  ) {
    throw new Error("Sámi 2025 event identity mismatch");
  }
  const disputed = db
    .prepare("SELECT votes, votes_status, seats, seats_status, evidence_status FROM result_row WHERE result_row_id = ?")
    .get(SAMI_2025_DISPUTED_RESULT_ID);
  if (
    !disputed ||
    Number(disputed.votes) !== 0 ||
    String(disputed.votes_status) !== "zero" ||
    Number(disputed.seats) !== 1 ||
    String(disputed.seats_status) !== "recorded" ||
    String(disputed.evidence_status) !== "disputed"
  ) {
    throw new Error("Sami 2025 98d zero-vote/one-seat conflict must stay disputed");
  }

  const longyear = db
    .prepare("SELECT o.office_status, o.next_date_id, o.next_date_resolution, o.geography_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(LONGYEARBYEN_ID);
  if (
    !longyear ||
    String(longyear.office_status) !== "current" ||
    String(longyear.tier) !== "other" ||
    String(longyear.geography_id) !== LONGYEARBYEN_GEOGRAPHY_ID ||
    longyear.next_date_id != null ||
    String(longyear.next_date_resolution) !== "unknown"
  ) {
    throw new Error("Longyearbyen must stay other without invented next-date or election returns");
  }
  if (countRows(db, "result_row", "office_id = ?", [LONGYEARBYEN_ID]) !== 0) {
    throw new Error("Longyearbyen result histories must not be invented");
  }
  if (countRows(db, "election_event", "office_id = ?", [LONGYEARBYEN_ID]) !== 0) {
    throw new Error("Longyearbyen events must not be invented");
  }

  const borough = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(BOROUGH_EXAMPLE_ID);
  if (!borough || String(borough.office_status) !== "current" || String(borough.tier) !== "other") {
    throw new Error("Oslo borough committees must stay other");
  }
  if (countRows(db, "office", "office_id LIKE 'NO-B%'", []) !== 15) {
    throw new Error("Oslo borough office count mismatch");
  }
  if (countRows(db, "election_event", "office_id LIKE 'NO-B%'", []) !== 0) {
    throw new Error("Oslo borough result histories must not be invented");
  }

  const historicalOffice = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_METADATA_ID);
  if (
    !historicalOffice ||
    String(historicalOffice.office_status) !== "historical" ||
    String(historicalOffice.record_state) !== "active" ||
    historicalOffice.next_date_id != null
  ) {
    throw new Error("Historical metadata-only Øymark office must stay active without an inferred end date");
  }
  if (countRows(db, "election_event", "office_id = ?", [HISTORICAL_METADATA_ID]) !== 0) {
    throw new Error("Metadata-only historical offices must not invent events");
  }

  const unknownLegal = countRows(
    db,
    "election_event",
    "lineage_id = ? AND legal_outcome != 'unknown'",
    [NORWAY_LINEAGE],
  );
  if (unknownLegal !== 0) throw new Error("Norway legal_outcome values must stay unknown");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(NORWAY_LINEAGE, projection.release.release_id);
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
      .get(NORWAY_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Norway tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [NORWAY_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
