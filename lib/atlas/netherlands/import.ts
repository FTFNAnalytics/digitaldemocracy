import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  AALSMEER_COUNCIL_ID,
  AALSMEER_GEOGRAPHY_ID,
  BONAIRE_ER_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EK_ID,
  EP_ID,
  EXPECTED_COUNTS,
  GRONINGEN_PS_ID,
  HILVERSUM_ID,
  HISTORICAL_EXAMPLE_ID,
  LEEUWARDERADEEL_2014_HK,
  LEEUWARDERADEEL_RESULT_ID,
  LINEAGE_ID as NETHERLANDS_LINEAGE,
  TK_ID,
  TIER_PATH,
  TIER_SHA256,
  UNKNOWN_SEAT_RESULT_ID,
  WIJDEMEREN_ID,
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
import { NetherlandsPreflightError, scanNetherlandsInventory, type NetherlandsInventory } from "./inventory";
import { projectNetherlands, type NetherlandsProjection } from "./project";
import { writeNetherlandsProjection } from "./write";

export type ImportNetherlandsOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: NetherlandsProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportNetherlandsResult = {
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

export function importNetherlands(options: ImportNetherlandsOptions): ImportNetherlandsResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: NETHERLANDS_LINEAGE,
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

    let inventory: NetherlandsInventory;
    try {
      inventory = scanNetherlandsInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof NetherlandsPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: NETHERLANDS_LINEAGE,
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
      lineageId: NETHERLANDS_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectNetherlands(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(NETHERLANDS_LINEAGE, inventory.fingerprint);
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
      writeNetherlandsProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertNetherlandsFidelity(staging, projection);
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

export function assertNetherlandsFidelity(db: DatabaseSync, projection?: NetherlandsProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [NETHERLANDS_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [NETHERLANDS_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [NETHERLANDS_LINEAGE],
  );
  const other = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'other'",
    [NETHERLANDS_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [NETHERLANDS_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [NETHERLANDS_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [NETHERLANDS_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [NETHERLANDS_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [NETHERLANDS_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [NETHERLANDS_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [NETHERLANDS_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const yearDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'year' AND certainty = 'called'",
    [NETHERLANDS_LINEAGE],
  );
  const monthDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'month' AND certainty = 'expected'",
    [NETHERLANDS_LINEAGE],
  );
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
  const mayorOffices = countRows(db, "office", "lineage_id = ? AND office_type = 'mayor'", [NETHERLANDS_LINEAGE]);
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [NETHERLANDS_LINEAGE]);

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
  if (dates !== EXPECTED_COUNTS.research_dates || yearDates !== EXPECTED_COUNTS.event_dates_year_called || monthDates !== EXPECTED_COUNTS.next_dates_month_expected) {
    throw new Error(`date counts ${dates}/${yearDates}/${monthDates}`);
  }
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (mayorOffices !== 0) throw new Error("mayor offices must be 0");
  if (mayorResults !== 0) throw new Error("mayor result rows must be 0");

  const country = db.prepare("SELECT country_code, polity_kind, region_id, coverage_status FROM country WHERE country_id = 'netherlands'").get();
  if (
    !country ||
    String(country.country_code) !== "NL" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial"
  ) {
    throw new Error("Netherlands country projection mismatch");
  }

  const aalsmeer = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(AALSMEER_COUNCIL_ID);
  if (
    !aalsmeer ||
    String(aalsmeer.office_status) !== "current" ||
    String(aalsmeer.record_state) !== "active" ||
    String(aalsmeer.next_date_resolution) !== "resolved" ||
    aalsmeer.next_history_key != null ||
    String(aalsmeer.geography_id) !== AALSMEER_GEOGRAPHY_ID
  ) {
    throw new Error("Aalsmeer council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = (SELECT next_date_id FROM office WHERE office_id = ?)")
    .get(AALSMEER_COUNCIL_ID);
  if (
    !next ||
    String(next.label) !== "2030-03" ||
    String(next.precision) !== "month" ||
    String(next.certainty) !== "expected" ||
    Number(next.year) !== 2030 ||
    Number(next.month) !== 3 ||
    next.day != null
  ) {
    throw new Error("Aalsmeer 2030-03 next-date mismatch");
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
    throw new Error("Historical office NL-GM0003-C must stay active without an inferred end date");
  }

  for (const officeId of [HILVERSUM_ID, WIJDEMEREN_ID]) {
    const merger = db
      .prepare("SELECT office_status, next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
      .get(officeId);
    if (
      !merger ||
      String(merger.office_status) !== "current" ||
      merger.next_date_id != null ||
      String(merger.next_date_resolution) !== "unknown" ||
      merger.next_history_key != null
    ) {
      throw new Error(`${officeId} merger office must stay current without an invented next date or event`);
    }
  }

  const lee = db
    .prepare("SELECT selected_history_role, legal_outcome, date_resolution FROM election_event WHERE history_key = ?")
    .get(LEEUWARDERADEEL_2014_HK);
  if (
    !lee ||
    String(lee.selected_history_role) !== "other" ||
    String(lee.legal_outcome) !== "disputed" ||
    String(lee.date_resolution) !== "resolved"
  ) {
    throw new Error("Leeuwarderadeel 2014 hold projection mismatch");
  }
  const leeResult = db
    .prepare("SELECT votes, votes_status, evidence_status FROM result_row WHERE result_row_id = ?")
    .get(LEEUWARDERADEEL_RESULT_ID);
  if (
    !leeResult ||
    leeResult.votes != null ||
    String(leeResult.votes_status) !== "unknown" ||
    String(leeResult.evidence_status) !== "disputed"
  ) {
    throw new Error("Leeuwarderadeel collapsed result must stay withheld");
  }

  const chamber = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(TK_ID);
  const senate = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(EK_ID);
  const ep = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(EP_ID);
  const province = db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(GRONINGEN_PS_ID);
  if (!chamber || String(chamber.tier) !== "national_context") throw new Error("Tweede Kamer must be national_context");
  if (!senate || String(senate.office_status) !== "current") throw new Error("Senate office must be retained");
  if (!ep || String(ep.tier) !== "national_context") throw new Error("EP delegation must stay national_context");
  if (!province || String(province.tier) !== "regional") throw new Error("Groningen provincial states must stay regional");

  const zeroSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Explicit zero-seat status mismatch");
  }
  const unknownSeat = db.prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?").get(UNKNOWN_SEAT_RESULT_ID);
  if (!unknownSeat || unknownSeat.seats != null || String(unknownSeat.seats_status) !== "unknown") {
    throw new Error("Missing-seat status mismatch");
  }
  const bonaire = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(BONAIRE_ER_ID);
  if (!bonaire || String(bonaire.office_type) !== "island_council" || String(bonaire.office_status) !== "current") {
    throw new Error("Bonaire island council must remain a current office");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(NETHERLANDS_LINEAGE, projection.release.release_id);
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
      .get(NETHERLANDS_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Netherlands tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [NETHERLANDS_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
