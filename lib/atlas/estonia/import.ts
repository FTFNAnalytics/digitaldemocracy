import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  EXPECTED_COUNTS,
  JOHVI_CURRENT_ID,
  JOHVI_HISTORICAL_ID,
  KOV_2013_EXAMPLE_EVENT_ID,
  KOV_2013_EXAMPLE_HK,
  LINEAGE_ID as ESTONIA_LINEAGE,
  NAMED_HOLDS,
  OMITTED_RESULTS_RELATIVE,
  PRESIDENT_1992_EVENT_ID,
  PRESIDENT_1992_FIRST_ID,
  PRESIDENT_1992_HK,
  PRESIDENT_1992_SECOND_ID,
  PRESIDENT_2016_EVENT_ID,
  PRESIDENT_2016_HK,
  PRESIDENT_2016_REPEAT_ID,
  PRESIDENT_ID,
  PRESIDENT_2026_EVENT_ID,
  PRESIDENT_2026_HK,
  RIIGIKOGU_2023_EVENT_ID,
  RIIGIKOGU_2023_HK,
  RIIGIKOGU_ID,
  TALLINN_ID,
  TIER_PATH,
  TIER_SHA256,
  TOILA_ID,
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
import { EstoniaPreflightError, scanEstoniaInventory, type EstoniaInventory } from "./inventory";
import { projectEstonia, type EstoniaProjection } from "./project";
import { writeEstoniaProjection } from "./write";

export type ImportEstoniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: EstoniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportEstoniaResult = {
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

export function importEstonia(options: ImportEstoniaOptions): ImportEstoniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ESTONIA_LINEAGE,
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

    let inventory: EstoniaInventory;
    try {
      inventory = scanEstoniaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof EstoniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ESTONIA_LINEAGE,
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
      lineageId: ESTONIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectEstonia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ESTONIA_LINEAGE, inventory.fingerprint);
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
      writeEstoniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertEstoniaFidelity(staging, projection);
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

export function assertEstoniaFidelity(db: DatabaseSync, projection?: EstoniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [ESTONIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [ESTONIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [ESTONIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [ESTONIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ESTONIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ESTONIA_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [ESTONIA_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ESTONIA_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [ESTONIA_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [ESTONIA_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ESTONIA_LINEAGE]);
  const councils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type = 'local_government_council'",
    [ESTONIA_LINEAGE],
  );
  const directExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type NOT IN ('local_government_council','national_parliament','national_president','european_parliament_delegation')",
    [ESTONIA_LINEAGE],
  );
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%linnapea%' OR office_type LIKE '%vallavanem%' OR office_id LIKE '%-M')",
    [ESTONIA_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result count ${results}; omitted results.json must not be invented`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== 0) throw new Error(`regional count ${regional}`);
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
  if (councils !== EXPECTED_COUNTS.current_councils) throw new Error(`current council count ${councils}`);
  if (directExec !== 0 || mayorOffices !== 0) throw new Error("current direct-executive and mayor rows must be 0");
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [ESTONIA_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [ESTONIA_LINEAGE, OMITTED_RESULTS_RELATIVE]) !== 0) {
    throw new Error("omitted results.json must not be a retained input");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'estonia'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "EE" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Eesti"
  ) {
    throw new Error("Estonia country projection mismatch");
  }

  const tallinn = db
    .prepare("SELECT office_status, record_state, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(TALLINN_ID);
  if (
    !tallinn ||
    String(tallinn.office_status) !== "current" ||
    String(tallinn.record_state) !== "active" ||
    tallinn.next_history_key != null ||
    String(tallinn.geography_id) !== "EE-M0784"
  ) {
    throw new Error("Tallinn must stay one current council");
  }
  if (countRows(db, "office", "lineage_id = ? AND name LIKE '%Tallinn%'", [ESTONIA_LINEAGE]) !== 1) {
    throw new Error("Tallinn district offices must not be invented");
  }

  const johvi = db
    .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
    .get(JOHVI_CURRENT_ID);
  if (!johvi || String(johvi.office_status) !== "current" || johvi.next_history_key != null) {
    throw new Error("Current Jõhvi council projection mismatch");
  }
  const johviNext = db
    .prepare(
      "SELECT d.label, d.precision, d.certainty, d.month, d.day FROM office o JOIN research_date d ON d.date_id = o.next_date_id WHERE o.office_id = ?",
    )
    .get(JOHVI_CURRENT_ID);
  if (
    !johviNext ||
    String(johviNext.label) !== "2029" ||
    String(johviNext.precision) !== "year" ||
    String(johviNext.certainty) !== "expected" ||
    johviNext.month != null ||
    johviNext.day != null
  ) {
    throw new Error("Jõhvi 2029 next date must stay year-only");
  }
  for (const officeId of [JOHVI_HISTORICAL_ID, TOILA_ID]) {
    const historicalOffice = db
      .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
      .get(officeId);
    if (
      !historicalOffice ||
      String(historicalOffice.office_status) !== "historical" ||
      String(historicalOffice.record_state) !== "active" ||
      historicalOffice.next_date_id != null
    ) {
      throw new Error(`${officeId} must stay a historical active office without a successor or end date`);
    }
  }

  const riigikogu = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(RIIGIKOGU_ID);
  if (!riigikogu || String(riigikogu.office_status) !== "current" || String(riigikogu.tier) !== "national_context" || String(riigikogu.review_status) !== "approved") {
    throw new Error("Riigikogu must be an accepted national_context row");
  }
  const president = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(PRESIDENT_ID);
  if (!president || String(president.office_status) !== "current" || String(president.tier) !== "national_context" || String(president.review_status) !== "needs_review") {
    throw new Error("Presidency must stay indirect national_context and EE-G03 needs_review");
  }
  const ep = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Estonia EP delegation must stay the other/needs_review row");
  }

  const kov2013 = db.prepare("SELECT event_id, event_kind, ballot_basis FROM election_event WHERE history_key = ?").get(KOV_2013_EXAMPLE_HK);
  if (!kov2013 || String(kov2013.event_id) !== KOV_2013_EXAMPLE_EVENT_ID) {
    throw new Error("2013 council event identity mismatch");
  }
  const kovDate = db
    .prepare(
      "SELECT d.label, d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(KOV_2013_EXAMPLE_HK);
  if (!kovDate || String(kovDate.label) !== "2013" || String(kovDate.precision) !== "year" || kovDate.month != null || kovDate.day != null) {
    throw new Error("2013 local events must stay year precision");
  }
  const rk2023 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(RIIGIKOGU_2023_HK);
  if (!rk2023 || String(rk2023.event_id) !== RIIGIKOGU_2023_EVENT_ID) {
    throw new Error("Riigikogu 2023 event identity mismatch");
  }

  const president1992 = db
    .prepare("SELECT event_id, event_kind, ballot_basis FROM election_event WHERE history_key = ?")
    .get(PRESIDENT_1992_HK);
  if (
    !president1992 ||
    String(president1992.event_id) !== PRESIDENT_1992_EVENT_ID ||
    String(president1992.event_kind) !== "unknown" ||
    String(president1992.ballot_basis) !== "unknown"
  ) {
    throw new Error("1992 presidential event must keep the mixed-franchise exception without a popular office mode");
  }
  const first = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_1992_FIRST_ID);
  const second = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_1992_SECOND_ID);
  if (!first || String(first.kind) !== "first_round" || Number(first.sequence_no) !== 1 || first.supersedes_id != null) {
    throw new Error("1992 popular first ballot mismatch");
  }
  if (!second || String(second.kind) !== "runoff" || Number(second.sequence_no) !== 2 || second.supersedes_id != null) {
    throw new Error("1992 Riigikogu conclusion must not invent a supersedes edge");
  }
  if (
    countRows(db, "election_event", "lineage_id = ? AND office_id = ? AND event_kind = 'indirect'", [ESTONIA_LINEAGE, PRESIDENT_ID]) !==
    EXPECTED_COUNTS.president_indirect_events
  ) {
    throw new Error("Indirect presidential events drifted");
  }
  if (countRows(db, "election_event", "history_key LIKE '%PRES_2021%'", []) !== 0) {
    throw new Error("No 2021 presidential row may be invented");
  }
  const president2016 = db.prepare("SELECT event_id, event_kind, ballot_basis FROM election_event WHERE history_key = ?").get(PRESIDENT_2016_HK);
  if (
    !president2016 ||
    String(president2016.event_id) !== PRESIDENT_2016_EVENT_ID ||
    String(president2016.event_kind) !== "indirect" ||
    String(president2016.ballot_basis) !== "electors"
  ) {
    throw new Error("2016 presidency must stay indirect");
  }
  const repeat = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2016_REPEAT_ID);
  if (!repeat || String(repeat.kind) !== "repeat" || Number(repeat.sequence_no) !== 6 || repeat.supersedes_id != null) {
    throw new Error("2016 renewed Riigikogu ballot must stay a repeat without a supersedes edge");
  }
  if (countRows(db, "proceeding", "history_key = ?", [PRESIDENT_2016_HK]) !== 6) {
    throw new Error("2016 presidency must keep six separate ballots");
  }
  const president2026 = db.prepare("SELECT event_id, event_kind FROM election_event WHERE history_key = ?").get(PRESIDENT_2026_HK);
  if (!president2026 || String(president2026.event_id) !== PRESIDENT_2026_EVENT_ID || String(president2026.event_kind) !== "indirect") {
    throw new Error("2026 presidency must stay indirect");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ESTONIA_LINEAGE, projection.release.release_id);
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
      .get(ESTONIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Estonia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ESTONIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
