import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BISKUPIJA_2017_HISTORY_KEY,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DEPUTY_EXAMPLE_ID,
  DUGO_SELO_COUNCIL_ID,
  DUGO_SELO_EXECUTIVE_ID,
  EP_ID,
  EXPECTED_COUNTS,
  FORBIDDEN_ZAGREB_DUPLICATE_IDS,
  HISTORICAL_DEPUTY_ID,
  LINEAGE_ID as CROATIA_LINEAGE,
  NAMED_HOLDS,
  PRESIDENT_ID,
  RESULT_EXAMPLE_ID,
  SABOR_ID,
  STARI_GRAD_2017_HISTORY_KEY,
  STARI_GRAD_THIRD_PROCEEDING_ID,
  TAR_VABRIGA_HISTORY_KEY,
  TIER_PATH,
  TIER_SHA256,
  ZAGREB_COUNCIL_ID,
  ZAGREB_EXECUTIVE_ID,
  ZAGREBACKA_COUNCIL_ID,
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
import { CroatiaPreflightError, scanCroatiaInventory, type CroatiaInventory } from "./inventory";
import { projectCroatia, type CroatiaProjection } from "./project";
import { writeCroatiaProjection } from "./write";

export type ImportCroatiaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: CroatiaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportCroatiaResult = {
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

export function importCroatia(options: ImportCroatiaOptions): ImportCroatiaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: CROATIA_LINEAGE,
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

    let inventory: CroatiaInventory;
    try {
      inventory = scanCroatiaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof CroatiaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: CROATIA_LINEAGE,
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
      lineageId: CROATIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectCroatia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(CROATIA_LINEAGE, inventory.fingerprint);
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
      writeCroatiaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertCroatiaFidelity(staging, projection);
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

export function assertCroatiaFidelity(db: DatabaseSync, projection?: CroatiaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [CROATIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [CROATIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [CROATIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [CROATIA_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [CROATIA_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [CROATIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [CROATIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [CROATIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [CROATIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [CROATIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [CROATIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [CROATIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [CROATIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [CROATIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [CROATIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [CROATIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [CROATIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [CROATIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [CROATIA_LINEAGE]);
  const knownSeats = countRows(db, "result_row", "lineage_id = ? AND seats IS NOT NULL", [CROATIA_LINEAGE]);
  const elected = countRows(db, "result_row", "lineage_id = ? AND elected_flag IS NOT NULL", [CROATIA_LINEAGE]);
  const nextDates = countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [CROATIA_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.placeholder_events) throw new Error(`placeholder events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`date count ${dates}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (knownSeats !== 0 || elected !== 0) throw new Error("typed seats and elected flags must stay unknown");
  if (nextDates !== 0) throw new Error("next dates must stay unknown");
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [CROATIA_LINEAGE, hold]) !== 1) {
      throw new Error(`Named hold ${hold} must remain unresolved`);
    }
  }
  for (const id of FORBIDDEN_ZAGREB_DUPLICATE_IDS) {
    if (countRows(db, "office", "office_id = ?", [id]) !== 0) {
      throw new Error(`Duplicate Zagreb office ${id} must not be invented`);
    }
  }
  if (countRows(db, "election_event", "history_key = ?", [BISKUPIJA_2017_HISTORY_KEY]) !== 0) {
    throw new Error("Biskupija 2017 deputy return must not be invented");
  }
  if (countRows(db, "result_row", "history_key = ?", [TAR_VABRIGA_HISTORY_KEY]) !== 0) {
    throw new Error("Tar-Vabriga placeholder must not gain typed result rows");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'croatia'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "HR" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Republika Hrvatska"
  ) {
    throw new Error("Croatia country projection mismatch");
  }

  const zagreb = db
    .prepare(
      "SELECT o.office_status, o.next_date_id, o.geography_id, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(ZAGREB_COUNCIL_ID);
  if (
    !zagreb ||
    String(zagreb.office_status) !== "current" ||
    zagreb.next_date_id != null ||
    String(zagreb.geography_id) !== "HR-Z21" ||
    String(zagreb.tier) !== "regional" ||
    String(zagreb.review_status) !== "needs_review"
  ) {
    throw new Error("Zagreb assembly must stay one regional needs_review body");
  }
  const zagrebExec = db
    .prepare("SELECT t.tier, t.review_status FROM office_tier_classification t WHERE t.office_id = ?")
    .get(ZAGREB_EXECUTIVE_ID);
  if (!zagrebExec || String(zagrebExec.tier) !== "regional" || String(zagrebExec.review_status) !== "needs_review") {
    throw new Error("Zagreb mayor must stay the paired regional executive");
  }
  const zagrebacka = db
    .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
    .get(ZAGREBACKA_COUNCIL_ID);
  if (!zagrebacka || String(zagrebacka.tier) !== "regional") {
    throw new Error("Zagrebačka županija must stay a distinct regional office");
  }

  const council = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(DUGO_SELO_COUNCIL_ID);
  const executive = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(DUGO_SELO_EXECUTIVE_ID);
  if (!council || String(council.office_type) !== "council" || !executive || String(executive.office_type) !== "direct_executive") {
    throw new Error("Dugo Selo must keep separate council and executive ballots");
  }
  const deputy = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(DEPUTY_EXAMPLE_ID);
  if (!deputy || String(deputy.office_status) !== "current" || String(deputy.office_type) !== "direct_deputy") {
    throw new Error("Independent deputy example must stay a current direct_deputy office");
  }
  const historicalDeputy = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_DEPUTY_ID);
  if (
    !historicalDeputy ||
    String(historicalDeputy.office_status) !== "historical" ||
    String(historicalDeputy.record_state) !== "active" ||
    historicalDeputy.next_date_id != null
  ) {
    throw new Error("Historical deputy must stay active without an inferred successor or end date");
  }

  const sabor = db
    .prepare("SELECT t.tier, t.review_status FROM office_tier_classification t WHERE t.office_id = ?")
    .get(SABOR_ID);
  if (!sabor || String(sabor.tier) !== "national_context" || String(sabor.review_status) !== "approved") {
    throw new Error("Sabor must stay national_context");
  }
  const president = db
    .prepare("SELECT t.tier FROM office_tier_classification t WHERE t.office_id = ?")
    .get(PRESIDENT_ID);
  if (!president || String(president.tier) !== "national_context") {
    throw new Error("President must stay national_context");
  }
  const ep = db
    .prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Croatia EP delegation must stay other/needs_review");
  }

  const third = db
    .prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?")
    .get(STARI_GRAD_THIRD_PROCEEDING_ID);
  if (!third || String(third.kind) !== "runoff" || Number(third.sequence_no) !== 3 || third.supersedes_id != null) {
    throw new Error("Stari Grad 2017 third round must stay a non-superseding runoff");
  }
  if (countRows(db, "proceeding", "history_key = ? AND sequence_no = 3", [STARI_GRAD_2017_HISTORY_KEY]) !== 1) {
    throw new Error("Only the sourced Stari Grad third round may use sequence 3");
  }

  const example = db
    .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status, elected_flag FROM result_row WHERE result_row_id = ?")
    .get(RESULT_EXAMPLE_ID);
  if (
    !example ||
    Number(example.votes) !== 140 ||
    String(example.votes_status) !== "recorded" ||
    Number(example.share) !== 12.26 ||
    String(example.share_status) !== "recorded" ||
    example.seats != null ||
    String(example.seats_status) !== "unknown" ||
    example.elected_flag != null
  ) {
    throw new Error("Example result must keep source votes and unknown seats");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(CROATIA_LINEAGE, projection.release.release_id);
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
      .get(CROATIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Croatia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [CROATIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
