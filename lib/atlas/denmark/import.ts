import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COPENHAGEN_COUNCIL_ID,
  COPENHAGEN_GEOGRAPHY_ID,
  COPENHAGEN_NEXT_DATE_ID,
  COUNTY_2001_EVENT_ID,
  COUNTY_2001_HISTORY_KEY,
  COUNTY_EXAMPLE_ID,
  EP_2009_HISTORY_KEY,
  EP_ID,
  EXPECTED_COUNTS,
  FOLKETING_ID,
  GRENAA_HISTORICAL_ID,
  LINEAGE_ID as DENMARK_LINEAGE,
  NORDDJURS_ID,
  OEST_2025_EVENT_ID,
  OEST_2025_HISTORY_KEY,
  OEST_REGION_ID,
  RETIRING_REGION_2021_EVENT_ID,
  RETIRING_REGION_2021_HK,
  RETIRING_REGION_ID,
  SIBLING_RETIRING_REGION_ID,
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
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [DENMARK_LINEAGE]);
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%borgmester%' OR office_id LIKE '%-M')",
    [DENMARK_LINEAGE],
  );
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [DENMARK_LINEAGE]);
  const inventedRealm = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_id LIKE '%GL%' OR office_id LIKE '%FO%' OR name LIKE '%Inatsisartut%' OR name LIKE '%Løgting%')",
    [DENMARK_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
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
  if (inventedRealm !== 0) throw new Error("Greenland/Faroe offices must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'denmark'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "DK" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Danmark"
  ) {
    throw new Error("Denmark country projection mismatch");
  }

  const copenhagen = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id, next_date_id FROM office WHERE office_id = ?")
    .get(COPENHAGEN_COUNCIL_ID);
  if (
    !copenhagen ||
    String(copenhagen.office_status) !== "current" ||
    String(copenhagen.record_state) !== "active" ||
    String(copenhagen.next_date_resolution) !== "resolved" ||
    copenhagen.next_history_key != null ||
    String(copenhagen.geography_id) !== COPENHAGEN_GEOGRAPHY_ID ||
    String(copenhagen.next_date_id) !== COPENHAGEN_NEXT_DATE_ID
  ) {
    throw new Error("Copenhagen council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(COPENHAGEN_NEXT_DATE_ID);
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

  const grenaa = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(GRENAA_HISTORICAL_ID);
  if (
    !grenaa ||
    String(grenaa.office_status) !== "historical" ||
    String(grenaa.record_state) !== "active" ||
    grenaa.next_date_id != null
  ) {
    throw new Error("Historical Grenaa office must stay active without an inferred end date");
  }
  const norddjurs = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(NORDDJURS_ID);
  if (!norddjurs || String(norddjurs.office_status) !== "current") {
    throw new Error("Current Norddjurs 707 must remain distinct from historical Grenaa 707");
  }

  const retiring = db
    .prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?")
    .get(RETIRING_REGION_ID);
  if (!retiring || String(retiring.office_status) !== "current" || retiring.next_date_id != null) {
    throw new Error("Retiring region 084 must stay current without an invented 2025 next date");
  }
  const retiring2025 = countRows(
    db,
    "election_event",
    "office_id IN (?, ?) AND history_key LIKE '%::2025::%'",
    [RETIRING_REGION_ID, SIBLING_RETIRING_REGION_ID],
  );
  if (retiring2025 !== 0) throw new Error("No 2025 election may be invented for retiring regions 084/085");
  const retiring2021 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(RETIRING_REGION_2021_HK);
  if (!retiring2021 || String(retiring2021.event_id) !== RETIRING_REGION_2021_EVENT_ID) {
    throw new Error("Region 084 2021 event identity mismatch");
  }

  const oest = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(OEST_REGION_ID);
  const oestEvent = db.prepare("SELECT event_id, office_id FROM election_event WHERE history_key = ?").get(OEST_2025_HISTORY_KEY);
  if (!oest || String(oest.office_status) !== "current") {
    throw new Error("Preparatory Østdanmark council must stay current");
  }
  if (!oestEvent || String(oestEvent.event_id) !== OEST_2025_EVENT_ID || String(oestEvent.office_id) !== OEST_REGION_ID) {
    throw new Error("Østdanmark 2025 event identity mismatch");
  }

  const county = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(COUNTY_EXAMPLE_ID);
  if (!county || String(county.office_status) !== "historical" || String(county.tier) !== "regional") {
    throw new Error("Former county council must stay a historical regional office");
  }
  const countyEvent = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(COUNTY_2001_HISTORY_KEY);
  if (!countyEvent || String(countyEvent.event_id) !== COUNTY_2001_EVENT_ID) {
    throw new Error("County 2001 event identity mismatch");
  }

  const folketing = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(FOLKETING_ID);
  if (!folketing || String(folketing.office_status) !== "current" || String(folketing.tier) !== "national_context") {
    throw new Error("Folketinget must be the accepted national_context row");
  }
  const ep = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Denmark EP delegation must stay the accepted other/needs_review row");
  }
  const ep2009 = db
    .prepare("SELECT e.date_resolution, d.precision, d.certainty, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?")
    .get(EP_2009_HISTORY_KEY);
  if (
    !ep2009 ||
    String(ep2009.date_resolution) !== "resolved" ||
    String(ep2009.precision) !== "year" ||
    String(ep2009.certainty) !== "called" ||
    Number(ep2009.year) !== 2009 ||
    ep2009.month != null ||
    ep2009.day != null
  ) {
    throw new Error("EP 2009 year-precision event mismatch");
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
