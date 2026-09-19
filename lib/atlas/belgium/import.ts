import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  AARTSELAAR_COUNCIL_ID,
  AARTSELAAR_GEOGRAPHY_ID,
  AARTSELAAR_MAYOR_ID,
  BILZEN_2018_HISTORY_KEY,
  BILZEN_OFFICE_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CHAMBER_ID,
  EXPECTED_COUNTS,
  FLEMISH_PARLIAMENT_2024_EVENT_ID,
  FLEMISH_PARLIAMENT_2024_HK,
  FLEMISH_PARLIAMENT_ID,
  FRENCH_COMMUNITY_ID,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID as BELGIUM_LINEAGE,
  SAINT_JOSSE_2024_HISTORY_KEY,
  SAINT_JOSSE_OFFICE_ID,
  SENATE_ID,
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
import { BelgiumPreflightError, scanBelgiumInventory, type BelgiumInventory } from "./inventory";
import { projectBelgium, type BelgiumProjection } from "./project";
import { writeBelgiumProjection } from "./write";

export type ImportBelgiumOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: BelgiumProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportBelgiumResult = {
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

export function importBelgium(options: ImportBelgiumOptions): ImportBelgiumResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BELGIUM_LINEAGE,
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

    let inventory: BelgiumInventory;
    try {
      inventory = scanBelgiumInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof BelgiumPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: BELGIUM_LINEAGE,
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
      lineageId: BELGIUM_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBelgium(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(BELGIUM_LINEAGE, inventory.fingerprint);
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
      writeBelgiumProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertBelgiumFidelity(staging, projection);
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

export function assertBelgiumFidelity(db: DatabaseSync, projection?: BelgiumProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [BELGIUM_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [BELGIUM_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [BELGIUM_LINEAGE],
  );
  const other = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [BELGIUM_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [BELGIUM_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BELGIUM_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BELGIUM_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [BELGIUM_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [BELGIUM_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [BELGIUM_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [BELGIUM_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const yearDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'year' AND certainty = 'expected'",
    [BELGIUM_LINEAGE],
  );
  const calledDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'called'",
    [BELGIUM_LINEAGE],
  );
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [BELGIUM_LINEAGE]);
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [BELGIUM_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (other !== EXPECTED_COUNTS.other_histories) throw new Error(`other histories ${other}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== 0) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates || yearDates !== EXPECTED_COUNTS.next_dates_year_expected || calledDates !== EXPECTED_COUNTS.event_dates_day_called) {
    throw new Error(`date counts ${dates}/${yearDates}/${calledDates}`);
  }
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (mayorResults !== 0) throw new Error("mayor result rows must be 0");

  const country = db.prepare("SELECT country_code, polity_kind, region_id, coverage_status FROM country WHERE country_id = 'belgium'").get();
  if (
    !country ||
    String(country.country_code) !== "BE" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial"
  ) {
    throw new Error("Belgium country projection mismatch");
  }

  const aartselaar = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(AARTSELAAR_COUNCIL_ID);
  if (
    !aartselaar ||
    String(aartselaar.office_status) !== "current" ||
    String(aartselaar.record_state) !== "active" ||
    String(aartselaar.next_date_resolution) !== "resolved" ||
    aartselaar.next_history_key != null ||
    String(aartselaar.geography_id) !== AARTSELAAR_GEOGRAPHY_ID
  ) {
    throw new Error("Aartselaar council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = (SELECT next_date_id FROM office WHERE office_id = ?)")
    .get(AARTSELAAR_COUNCIL_ID);
  if (
    !next ||
    String(next.label) !== "2030" ||
    String(next.precision) !== "year" ||
    String(next.certainty) !== "expected" ||
    Number(next.year) !== 2030 ||
    next.month != null ||
    next.day != null
  ) {
    throw new Error("Aartselaar 2030 next-date mismatch");
  }
  const mayor = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(AARTSELAAR_MAYOR_ID);
  if (!mayor || String(mayor.office_type) !== "mayor" || String(mayor.office_status) !== "current") {
    throw new Error("Aartselaar mayor must remain a current office without fabricated votes");
  }

  const historicalOffice = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_EXAMPLE_ID);
  if (
    !historicalOffice ||
    String(historicalOffice.office_status) !== "historical" ||
    String(historicalOffice.record_state) !== "active" ||
    historicalOffice.next_date_id != null
  ) {
    throw new Error("Historical office BE-46003-C must stay active without an inferred end date");
  }

  const bilzen = db
    .prepare("SELECT date_id, date_resolution, event_kind, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(BILZEN_2018_HISTORY_KEY);
  if (
    !bilzen ||
    bilzen.date_id != null ||
    String(bilzen.date_resolution) !== "conflicting" ||
    String(bilzen.event_kind) !== "unknown" ||
    String(bilzen.selected_history_role) !== "other" ||
    String(bilzen.legal_outcome) !== "disputed"
  ) {
    throw new Error("Bilzen 2018 conflict projection mismatch");
  }
  const saintJosse = db
    .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(SAINT_JOSSE_2024_HISTORY_KEY);
  if (
    !saintJosse ||
    String(saintJosse.selected_history_role) !== "other" ||
    String(saintJosse.legal_outcome) !== "disputed"
  ) {
    throw new Error("Saint-Josse 2024 hold projection mismatch");
  }

  const flemish = db.prepare("SELECT event_id, office_id FROM election_event WHERE history_key = ?").get(FLEMISH_PARLIAMENT_2024_HK);
  if (!flemish || String(flemish.event_id) !== FLEMISH_PARLIAMENT_2024_EVENT_ID || String(flemish.office_id) !== FLEMISH_PARLIAMENT_ID) {
    throw new Error("Flemish Parliament 2024 event identity mismatch");
  }
  const chamber = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(CHAMBER_ID);
  const senate = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SENATE_ID);
  const french = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(FRENCH_COMMUNITY_ID);
  if (!chamber || String(chamber.tier) !== "national_context") throw new Error("Chamber must be national_context");
  if (!senate || String(senate.office_status) !== "current") throw new Error("Senate office must be retained without copied votes");
  if (!french || String(french.tier) !== "regional") throw new Error("French Community parliament must stay the accepted regional row");

  const zeroSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Explicit zero-seat status mismatch");
  }
  const unknownSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(UNKNOWN_SEAT_RESULT_ID);
  if (!unknownSeat || unknownSeat.seats != null || String(unknownSeat.seats_status) !== "unknown") {
    throw new Error("Missing-seat status mismatch");
  }

  const wallonia = db
    .prepare(
      "SELECT legal_outcome FROM election_event WHERE office_id = 'BE-25005-C' AND history_key = 'BE-25005-C::2018::2018-10-14'",
    )
    .get();
  if (!wallonia || String(wallonia.legal_outcome) !== "preliminary") {
    throw new Error("Wallonia 2018 unofficial figures must stay preliminary");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(BELGIUM_LINEAGE, projection.release.release_id);
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
      .get(BELGIUM_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Belgium tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [BELGIUM_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }

  void BILZEN_OFFICE_ID;
  void SAINT_JOSSE_OFFICE_ID;
}
