import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CONTINUING_REGION_ID,
  COPENHAGEN_COUNCIL_ID,
  COPENHAGEN_GEOGRAPHY_ID,
  COUNTY_EXAMPLE_ID,
  EP_ID,
  EXPECTED_COUNTS,
  FT_ID,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID as DENMARK_LINEAGE,
  PREPARATORY_REGION_ID,
  RETIRING_REGION_ID,
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
import { DenmarkPreflightError, scanDenmarkInventory, type DenmarkInventory } from "./inventory";
import { projectDenmark, type DenmarkProjection } from "./project";
import { writeDenmarkProjection } from "./write";

export type ImportDenmarkOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: DenmarkProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportDenmarkResult = {
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

export function importDenmark(options: ImportDenmarkOptions): ImportDenmarkResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: DENMARK_LINEAGE,
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

    let inventory: DenmarkInventory;
    try {
      inventory = scanDenmarkInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof DenmarkPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: DENMARK_LINEAGE,
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
      lineageId: DENMARK_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectDenmark(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(DENMARK_LINEAGE, inventory.fingerprint);
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
      writeDenmarkProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertDenmarkFidelity(staging, projection);
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

export function assertDenmarkFidelity(db: DatabaseSync, projection?: DenmarkProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [DENMARK_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [DENMARK_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [DENMARK_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [DENMARK_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [DENMARK_LINEAGE],
  );
  const other = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [DENMARK_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [DENMARK_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [DENMARK_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [DENMARK_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [DENMARK_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [DENMARK_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [DENMARK_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [DENMARK_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [DENMARK_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [DENMARK_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [DENMARK_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [DENMARK_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [DENMARK_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [DENMARK_LINEAGE]);
  const yearDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'year' AND certainty = 'called'",
    [DENMARK_LINEAGE],
  );
  const statutoryDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'statutory'",
    [DENMARK_LINEAGE],
  );
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [DENMARK_LINEAGE]);
  const mayorOffices = countRows(db, "office", "lineage_id = ? AND office_type = 'mayor'", [DENMARK_LINEAGE]);
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [DENMARK_LINEAGE]);

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
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (
    dates !== EXPECTED_COUNTS.research_dates ||
    yearDates !== EXPECTED_COUNTS.event_dates_year_called ||
    statutoryDates !== EXPECTED_COUNTS.next_dates_day_statutory
  ) {
    throw new Error(`date counts ${dates}/${yearDates}/${statutoryDates}`);
  }
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (mayorOffices !== 0) throw new Error("mayor offices must be 0");
  if (mayorResults !== 0) throw new Error("mayor result rows must be 0");

  const country = db.prepare("SELECT country_code, polity_kind, region_id, coverage_status FROM country WHERE country_id = 'denmark'").get();
  if (
    !country ||
    String(country.country_code) !== "DK" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial"
  ) {
    throw new Error("Denmark country projection mismatch");
  }

  const copenhagen = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(COPENHAGEN_COUNCIL_ID);
  if (
    !copenhagen ||
    String(copenhagen.office_status) !== "current" ||
    String(copenhagen.record_state) !== "active" ||
    String(copenhagen.next_date_resolution) !== "resolved" ||
    copenhagen.next_history_key != null ||
    String(copenhagen.geography_id) !== COPENHAGEN_GEOGRAPHY_ID
  ) {
    throw new Error("Copenhagen council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = (SELECT next_date_id FROM office WHERE office_id = ?)")
    .get(COPENHAGEN_COUNCIL_ID);
  if (
    !next ||
    String(next.label) !== "2029-11-20" ||
    String(next.precision) !== "day" ||
    String(next.certainty) !== "statutory" ||
    Number(next.year) !== 2029 ||
    Number(next.month) !== 11 ||
    Number(next.day) !== 20
  ) {
    throw new Error("Copenhagen 2029-11-20 next-date mismatch");
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
    throw new Error("Historical office DK-KPRE2007-171-C must stay active without an inferred end date");
  }

  const retiring = db
    .prepare("SELECT office_status, next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
    .get(RETIRING_REGION_ID);
  if (
    !retiring ||
    String(retiring.office_status) !== "current" ||
    retiring.next_date_id != null ||
    String(retiring.next_date_resolution) !== "unknown" ||
    retiring.next_history_key != null
  ) {
    throw new Error("Hovedstaden must stay current without an invented 2029 next date");
  }

  const folketing = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(FT_ID);
  const ep = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(EP_ID);
  const region = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(CONTINUING_REGION_ID);
  const county = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(COUNTY_EXAMPLE_ID);
  const preparatory = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(PREPARATORY_REGION_ID);
  if (!folketing || String(folketing.tier) !== "national_context") throw new Error("Folketinget must be national_context");
  if (!ep || String(ep.tier) !== "other") throw new Error("EP delegation must stay other");
  if (!region || String(region.tier) !== "regional") throw new Error("Nordjylland regional council must stay regional");
  if (!county || String(county.office_status) !== "historical") throw new Error("Former county council must stay historical");
  if (!preparatory || String(preparatory.office_status) !== "current") throw new Error("Østdanmark preparatory council must remain current");

  const zeroSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Explicit zero-seat status mismatch");
  }
  const unknownSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(UNKNOWN_SEAT_RESULT_ID);
  if (!unknownSeat || unknownSeat.seats != null || String(unknownSeat.seats_status) !== "unknown") {
    throw new Error("Missing-seat status mismatch");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(DENMARK_LINEAGE, projection.release.release_id);
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
      .get(DENMARK_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Denmark tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [DENMARK_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
