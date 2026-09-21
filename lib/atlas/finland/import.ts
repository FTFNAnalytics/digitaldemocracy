import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ALAHARMA_HISTORICAL_ID,
  ALAND_LAGTING_ID,
  ALAND_MUNICIPAL_EXAMPLE_ID,
  ALAND_SEAT_ONLY_RESULT_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EDUSKUNTA_ID,
  EP_ID,
  EXPECTED_COUNTS,
  HELSINKI_COUNCIL_ID,
  HELSINKI_GEOGRAPHY_ID,
  HELSINKI_NEXT_DATE_ID,
  HVA20_2022_EVENT_ID,
  HVA20_2022_HK,
  HVA20_ID,
  LAGTING_2023_EVENT_ID,
  LAGTING_2023_HK,
  LINEAGE_ID as FINLAND_LINEAGE,
  MISSING_VOTES_RESULT_ID,
  NAMED_HOLDS,
  PRESIDENT_2018_EVENT_ID,
  PRESIDENT_2018_HK,
  PRESIDENT_2024_EVENT_ID,
  PRESIDENT_2024_FIRST_ID,
  PRESIDENT_2024_HK,
  PRESIDENT_2024_RUNOFF_ID,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
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
import { FinlandPreflightError, scanFinlandInventory, type FinlandInventory } from "./inventory";
import { projectFinland, type FinlandProjection } from "./project";
import { writeFinlandProjection } from "./write";

export type ImportFinlandOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: FinlandProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportFinlandResult = {
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

export function importFinland(options: ImportFinlandOptions): ImportFinlandResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: FINLAND_LINEAGE,
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

    let inventory: FinlandInventory;
    try {
      inventory = scanFinlandInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof FinlandPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: FINLAND_LINEAGE,
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
      lineageId: FINLAND_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectFinland(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(FINLAND_LINEAGE, inventory.fingerprint);
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
      writeFinlandProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertFinlandFidelity(staging, projection);
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

export function assertFinlandFidelity(db: DatabaseSync, projection?: FinlandProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [FINLAND_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [FINLAND_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [FINLAND_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [FINLAND_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [FINLAND_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [FINLAND_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [FINLAND_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [FINLAND_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [FINLAND_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [FINLAND_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [FINLAND_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [FINLAND_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [FINLAND_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [FINLAND_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [FINLAND_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [FINLAND_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [FINLAND_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [FINLAND_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [FINLAND_LINEAGE]);
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%kaupunginjohtaja%' OR office_type LIKE '%pääministeri%' OR office_id LIKE '%-M')",
    [FINLAND_LINEAGE],
  );
  const mayorResults = countRows(db, "result_row", "lineage_id = ? AND office_id LIKE '%-M'", [FINLAND_LINEAGE]);
  const helsinkiCounty = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'wellbeing_county_council' AND name LIKE '%Helsinki%'",
    [FINLAND_LINEAGE],
  );
  const hva2023 = countRows(
    db,
    "election_event",
    "lineage_id = ? AND office_id LIKE 'FI-HVA%' AND history_key LIKE '%::2023::%'",
    [FINLAND_LINEAGE],
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
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`date count ${dates}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (mayorOffices !== 0 || mayorResults !== 0) throw new Error("mayor office/result rows must be 0");
  if (helsinkiCounty !== 0) throw new Error("Helsinki county office must not be invented");
  if (hva2023 !== 0) throw new Error("2023 wellbeing transition must not invent an election");
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [FINLAND_LINEAGE, hold]) !== 1) {
      throw new Error(`Named hold ${hold} must remain unresolved`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'finland'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "FI" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Suomi"
  ) {
    throw new Error("Finland country projection mismatch");
  }

  const helsinki = db
    .prepare("SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id, next_date_id FROM office WHERE office_id = ?")
    .get(HELSINKI_COUNCIL_ID);
  if (
    !helsinki ||
    String(helsinki.office_status) !== "current" ||
    String(helsinki.record_state) !== "active" ||
    String(helsinki.next_date_resolution) !== "resolved" ||
    helsinki.next_history_key != null ||
    String(helsinki.geography_id) !== HELSINKI_GEOGRAPHY_ID ||
    String(helsinki.next_date_id) !== HELSINKI_NEXT_DATE_ID
  ) {
    throw new Error("Helsinki council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(HELSINKI_NEXT_DATE_ID);
  if (
    !next ||
    String(next.label) !== "2029-04-15" ||
    String(next.precision) !== "day" ||
    String(next.certainty) !== "statutory" ||
    Number(next.year) !== 2029 ||
    Number(next.month) !== 4 ||
    Number(next.day) !== 15
  ) {
    throw new Error("Helsinki 2029-04-15 next-date mismatch");
  }

  const historicalOffice = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(ALAHARMA_HISTORICAL_ID);
  if (
    !historicalOffice ||
    String(historicalOffice.office_status) !== "historical" ||
    String(historicalOffice.record_state) !== "active" ||
    historicalOffice.next_date_id != null
  ) {
    throw new Error("Historical Alahärmä office must stay active without an inferred end date");
  }

  const lagting = db
    .prepare(
      "SELECT o.office_status, o.next_date_id, o.next_date_resolution, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(ALAND_LAGTING_ID);
  if (
    !lagting ||
    String(lagting.office_status) !== "current" ||
    lagting.next_date_id != null ||
    String(lagting.next_date_resolution) !== "unknown" ||
    String(lagting.tier) !== "regional"
  ) {
    throw new Error("Åland Lagting must stay current regional without an invented next date");
  }
  const alandMunicipal = db
    .prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?")
    .get(ALAND_MUNICIPAL_EXAMPLE_ID);
  if (!alandMunicipal || String(alandMunicipal.office_status) !== "current" || alandMunicipal.next_date_id != null) {
    throw new Error("Åland municipal next dates must stay unknown");
  }

  const hva = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(HVA20_ID);
  if (!hva || String(hva.office_status) !== "current" || String(hva.tier) !== "regional") {
    throw new Error("Wellbeing-county council must stay a current regional office");
  }
  const hva2022 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(HVA20_2022_HK);
  if (!hva2022 || String(hva2022.event_id) !== HVA20_2022_EVENT_ID) {
    throw new Error("County 2022 event identity mismatch");
  }

  const eduskunta = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EDUSKUNTA_ID);
  if (!eduskunta || String(eduskunta.office_status) !== "current" || String(eduskunta.tier) !== "national_context") {
    throw new Error("Eduskunta must be an accepted national_context row");
  }
  const president = db
    .prepare("SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(PRESIDENT_ID);
  if (!president || String(president.office_status) !== "current" || String(president.tier) !== "national_context") {
    throw new Error("Elected presidency must be an accepted national_context row");
  }
  const ep = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Finland EP delegation must stay the accepted other/needs_review row");
  }

  const president2018 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(PRESIDENT_2018_HK);
  if (!president2018 || String(president2018.event_id) !== PRESIDENT_2018_EVENT_ID) {
    throw new Error("Presidential 2018 event identity mismatch");
  }
  if (countRows(db, "proceeding", "history_key = ?", [PRESIDENT_2018_HK]) !== 1) {
    throw new Error("Presidential 2018 must keep a single first-round proceeding; do not invent a runoff");
  }
  if (countRows(db, "proceeding", "history_key = ? AND kind = 'runoff'", [PRESIDENT_2018_HK]) !== 0) {
    throw new Error("No 2018 presidential runoff may be invented");
  }
  const president2024 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(PRESIDENT_2024_HK);
  if (!president2024 || String(president2024.event_id) !== PRESIDENT_2024_EVENT_ID) {
    throw new Error("Presidential 2024 event identity mismatch");
  }
  const first = db.prepare("SELECT kind, sequence_no FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2024_FIRST_ID);
  const runoff = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2024_RUNOFF_ID);
  if (!first || String(first.kind) !== "first_round" || Number(first.sequence_no) !== 1) {
    throw new Error("Presidential 2024 first round mismatch");
  }
  if (!runoff || String(runoff.kind) !== "runoff" || Number(runoff.sequence_no) !== 2 || runoff.supersedes_id != null) {
    throw new Error("Presidential 2024 runoff must not supersede the first round");
  }
  const lagting2023 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(LAGTING_2023_HK);
  if (!lagting2023 || String(lagting2023.event_id) !== LAGTING_2023_EVENT_ID) {
    throw new Error("Åland Lagting 2023 event identity mismatch");
  }

  const zeroSeat = db.prepare("SELECT votes, seats, seats_status FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Reported zero seat must stay integer 0/zero");
  }
  const missingVotes = db
    .prepare("SELECT votes, votes_status, seats FROM result_row WHERE result_row_id = ?")
    .get(MISSING_VOTES_RESULT_ID);
  if (!missingVotes || missingVotes.votes != null || String(missingVotes.votes_status) !== "unknown") {
    throw new Error("Missing votes must stay NULL/unknown; missing ≠ zero");
  }
  const seatOnly = db
    .prepare("SELECT votes, votes_status, seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get(ALAND_SEAT_ONLY_RESULT_ID);
  if (
    !seatOnly ||
    seatOnly.votes != null ||
    String(seatOnly.votes_status) !== "unknown" ||
    Number(seatOnly.seats) !== 11 ||
    String(seatOnly.seats_status) !== "recorded"
  ) {
    throw new Error("Åland seat-only history must keep NULL votes");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(FINLAND_LINEAGE, projection.release.release_id);
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
      .get(FINLAND_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Finland tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [FINLAND_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
