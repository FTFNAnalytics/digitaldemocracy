import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BELLINZONA_EXECUTIVE_ID,
  BELLINZONA_GEOGRAPHY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNCIL_OF_STATES_ID,
  DISPUTED_RESULT_ID,
  EXPECTED_COUNTS,
  HELD_SZ_GAP_OFFICE_ID,
  HELD_VD_GAP_OFFICE_ID,
  HISTORICAL_HORGEN_ID,
  LINEAGE_ID as SWITZERLAND_LINEAGE,
  NATIONAL_COUNCIL_2023_EVENT_ID,
  NATIONAL_COUNCIL_2023_HK,
  NATIONAL_COUNCIL_ID,
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
import { SwitzerlandPreflightError, scanSwitzerlandInventory, type SwitzerlandInventory } from "./inventory";
import { projectSwitzerland, type SwitzerlandProjection } from "./project";
import { writeSwitzerlandProjection } from "./write";

export type ImportSwitzerlandOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: SwitzerlandProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportSwitzerlandResult = {
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

export function importSwitzerland(options: ImportSwitzerlandOptions): ImportSwitzerlandResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: SWITZERLAND_LINEAGE,
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

    let inventory: SwitzerlandInventory;
    try {
      inventory = scanSwitzerlandInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof SwitzerlandPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: SWITZERLAND_LINEAGE,
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
      lineageId: SWITZERLAND_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectSwitzerland(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(SWITZERLAND_LINEAGE, inventory.fingerprint);
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
      writeSwitzerlandProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertSwitzerlandFidelity(staging, projection);
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

export function assertSwitzerlandFidelity(db: DatabaseSync, projection?: SwitzerlandProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [SWITZERLAND_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [SWITZERLAND_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [SWITZERLAND_LINEAGE],
  );
  const other = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [SWITZERLAND_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [SWITZERLAND_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [SWITZERLAND_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [SWITZERLAND_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [SWITZERLAND_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [SWITZERLAND_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [SWITZERLAND_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [SWITZERLAND_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const yearDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'year' AND certainty = 'called'",
    [SWITZERLAND_LINEAGE],
  );
  const monthDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'month' AND certainty = 'expected'",
    [SWITZERLAND_LINEAGE],
  );
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
  const disputed = countRows(db, "result_row", "lineage_id = ? AND evidence_status = 'disputed'", [SWITZERLAND_LINEAGE]);
  const communalExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'communal_executive' AND office_status = 'current'",
    [SWITZERLAND_LINEAGE],
  );

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
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates || yearDates !== EXPECTED_COUNTS.event_dates_year_called || monthDates !== EXPECTED_COUNTS.next_dates_month_expected) {
    throw new Error(`date counts ${dates}/${yearDates}/${monthDates}`);
  }
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (disputed !== EXPECTED_COUNTS.disputed_result_rows) throw new Error(`disputed result count ${disputed}`);
  if (communalExec !== EXPECTED_COUNTS.current_communal_executives) {
    throw new Error(`current communal executive count ${communalExec}`);
  }

  const country = db.prepare("SELECT country_code, polity_kind, region_id, coverage_status FROM country WHERE country_id = 'switzerland'").get();
  if (
    !country ||
    String(country.country_code) !== "CH" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial"
  ) {
    throw new Error("Switzerland country projection mismatch");
  }

  const nr = db
    .prepare("SELECT office_status, record_state, geography_id FROM office WHERE office_id = ?")
    .get(NATIONAL_COUNCIL_ID);
  if (!nr || String(nr.office_status) !== "current" || String(nr.geography_id) !== "CH") {
    throw new Error("National Council projection mismatch");
  }
  const sr = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(COUNCIL_OF_STATES_ID);
  if (!sr || String(sr.office_status) !== "current") throw new Error("Council of States must remain a current office");
  const nrEvent = db.prepare("SELECT event_id, selected_history_role, event_kind FROM election_event WHERE history_key = ?").get(NATIONAL_COUNCIL_2023_HK);
  if (
    !nrEvent ||
    String(nrEvent.event_id) !== NATIONAL_COUNCIL_2023_EVENT_ID ||
    String(nrEvent.selected_history_role) !== "other" ||
    String(nrEvent.event_kind) !== "ordinary"
  ) {
    throw new Error("National Council 2023 CH aggregate projection mismatch");
  }

  const historicalOffice = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_HORGEN_ID);
  if (
    !historicalOffice ||
    String(historicalOffice.office_status) !== "historical" ||
    String(historicalOffice.record_state) !== "active" ||
    historicalOffice.next_date_id != null
  ) {
    throw new Error("Historical office CH-GM0133-E must stay active without an inferred end date");
  }

  const bellinzona = db
    .prepare("SELECT office_status, next_date_resolution, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(BELLINZONA_EXECUTIVE_ID);
  if (
    !bellinzona ||
    String(bellinzona.office_status) !== "current" ||
    String(bellinzona.next_date_resolution) !== "resolved" ||
    bellinzona.next_history_key != null ||
    String(bellinzona.geography_id) !== BELLINZONA_GEOGRAPHY_ID
  ) {
    throw new Error("Bellinzona executive projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = (SELECT next_date_id FROM office WHERE office_id = ?)")
    .get(BELLINZONA_EXECUTIVE_ID);
  if (
    !next ||
    String(next.label) !== "2028-04" ||
    String(next.precision) !== "month" ||
    String(next.certainty) !== "expected" ||
    Number(next.year) !== 2028 ||
    Number(next.month) !== 4 ||
    next.day != null
  ) {
    throw new Error("Bellinzona April 2028 next-date mismatch");
  }

  if (db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(HELD_SZ_GAP_OFFICE_ID)) {
    throw new Error("Do not invent held SZ commune executive CH-GM1311-E");
  }
  if (db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(HELD_VD_GAP_OFFICE_ID)) {
    throw new Error("Do not invent held VD commune executive CH-GM5402-E");
  }

  const disputedRow = db.prepare("SELECT seats, seats_status, evidence_status FROM result_row WHERE result_row_id = ?").get(DISPUTED_RESULT_ID);
  if (!disputedRow || disputedRow.seats != null || String(disputedRow.seats_status) !== "unknown" || String(disputedRow.evidence_status) !== "disputed") {
    throw new Error("Disputed result scalar must stay NULL/unknown");
  }
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
      .get(SWITZERLAND_LINEAGE, projection.release.release_id);
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
      .get(SWITZERLAND_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Switzerland tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [SWITZERLAND_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
