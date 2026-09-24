import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  AKMENE_COUNCIL_ID,
  AKMENE_GEOGRAPHY_ID,
  AKMENE_MAYOR_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_2004_EVENT_ID,
  EP_2004_HK,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as LITHUANIA_LINEAGE,
  MALFORMED_INVALID_TOKEN,
  NAMED_HOLDS,
  OMITTED_SOURCES_PREFIX,
  PRESIDENT_2019_EVENT_ID,
  PRESIDENT_2019_FIRST_ID,
  PRESIDENT_2019_HK,
  PRESIDENT_2019_RUNOFF_ID,
  PRESIDENT_DISPUTED_RESULT_ID,
  PRESIDENT_ID,
  SEIMAS_2016_EVENT_ID,
  SEIMAS_2016_HK,
  SEIMAS_ID,
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
import { LithuaniaPreflightError, scanLithuaniaInventory, type LithuaniaInventory } from "./inventory";
import { projectLithuania, type LithuaniaProjection } from "./project";
import { writeLithuaniaProjection } from "./write";

export type ImportLithuaniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: LithuaniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportLithuaniaResult = {
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

export function importLithuania(options: ImportLithuaniaOptions): ImportLithuaniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: LITHUANIA_LINEAGE,
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

    let inventory: LithuaniaInventory;
    try {
      inventory = scanLithuaniaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof LithuaniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: LITHUANIA_LINEAGE,
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
      lineageId: LITHUANIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectLithuania(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(LITHUANIA_LINEAGE, inventory.fingerprint);
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
      writeLithuaniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertLithuaniaFidelity(staging, projection);
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

export function assertLithuaniaFidelity(db: DatabaseSync, projection?: LithuaniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [LITHUANIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [LITHUANIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [LITHUANIA_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [LITHUANIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LITHUANIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LITHUANIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [LITHUANIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [LITHUANIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [LITHUANIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [LITHUANIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [LITHUANIA_LINEAGE]);
  const councils = countRows(db, "office", "lineage_id = ? AND office_status = 'current' AND office_type = 'municipal_council'", [LITHUANIA_LINEAGE]);
  const directExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type IN ('direct_mayor','direct_president')",
    [LITHUANIA_LINEAGE],
  );
  const mayorOffices = countRows(db, "office", "lineage_id = ? AND office_type = 'direct_mayor'", [LITHUANIA_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== 0) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== 0) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; draft tiers stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`date count ${dates}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (councils !== EXPECTED_COUNTS.current_councils) throw new Error(`current council count ${councils}`);
  if (directExec !== EXPECTED_COUNTS.current_direct_executive_offices) throw new Error(`direct executive count ${directExec}`);
  if (mayorOffices !== EXPECTED_COUNTS.mayor_offices) throw new Error(`mayor office count ${mayorOffices}`);
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [LITHUANIA_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [LITHUANIA_LINEAGE, `${OMITTED_SOURCES_PREFIX}%`]) !== 0) {
    throw new Error("omitted raw sources/ must not be retained inputs");
  }
  if (countRows(db, "result_row", "lineage_id = ? AND share_status = 'disputed'", [LITHUANIA_LINEAGE]) !== EXPECTED_COUNTS.disputed_shares) {
    throw new Error("disputed presidential shares drifted");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'lithuania'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "LT" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Lietuva"
  ) {
    throw new Error("Lithuania country projection mismatch");
  }

  const council = db
    .prepare("SELECT office_status, office_type, geography_id, next_date_id, next_history_key, registry_qualified FROM office WHERE office_id = ?")
    .get(AKMENE_COUNCIL_ID);
  const mayor = db
    .prepare("SELECT office_status, office_type, geography_id, next_date_id, next_history_key FROM office WHERE office_id = ?")
    .get(AKMENE_MAYOR_ID);
  if (
    !council ||
    !mayor ||
    String(council.office_type) !== "municipal_council" ||
    String(mayor.office_type) !== "direct_mayor" ||
    String(council.geography_id) !== AKMENE_GEOGRAPHY_ID ||
    String(mayor.geography_id) !== AKMENE_GEOGRAPHY_ID ||
    council.next_date_id != null ||
    mayor.next_date_id != null ||
    council.next_history_key != null ||
    mayor.next_history_key != null ||
    Number(council.registry_qualified) !== 0
  ) {
    throw new Error("Akmenė council and direct mayor must stay separate current offices without a next date");
  }

  const seimas = db
    .prepare("SELECT o.office_status, t.tier, t.review_status, e.electoral_system FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) JOIN election_event e USING (id_namespace, office_id) WHERE o.office_id = ? AND e.history_key = ?")
    .get(SEIMAS_ID, SEIMAS_2016_HK);
  if (!seimas || String(seimas.tier) !== "national_context" || String(seimas.review_status) !== "needs_review" || String(seimas.electoral_system) !== "direct_popular_mixed") {
    throw new Error("Seimas must stay national_context needs_review with a mixed system");
  }
  const president = db
    .prepare("SELECT o.office_status, o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(PRESIDENT_ID);
  if (!president || String(president.office_type) !== "direct_president" || String(president.tier) !== "national_context" || String(president.review_status) !== "needs_review") {
    throw new Error("Presidency must stay a directly elected national_context needs_review row");
  }
  const ep = db
    .prepare("SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Lithuania EP delegation must stay the other/needs_review row");
  }

  const ep2004 = db
    .prepare("SELECT e.event_id, e.event_kind, e.ballot_basis, e.electoral_system, d.label, d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?")
    .get(EP_2004_HK);
  if (
    !ep2004 ||
    String(ep2004.event_id) !== EP_2004_EVENT_ID ||
    String(ep2004.precision) !== "year" ||
    ep2004.month != null ||
    ep2004.day != null ||
    String(ep2004.ballot_basis) !== "unknown"
  ) {
    throw new Error("EP 2004 must stay year precision without an invented election day");
  }
  const seimas2016 = db
    .prepare("SELECT e.event_id, d.label, d.precision, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?")
    .get(SEIMAS_2016_HK);
  if (!seimas2016 || String(seimas2016.event_id) !== SEIMAS_2016_EVENT_ID || String(seimas2016.precision) !== "month" || String(seimas2016.label) !== "2016-10" || seimas2016.day != null) {
    throw new Error("Seimas 2016 must stay month precision");
  }
  const president2019 = db
    .prepare("SELECT event_id, event_kind, ballot_basis, electoral_system FROM election_event WHERE history_key = ?")
    .get(PRESIDENT_2019_HK);
  if (
    !president2019 ||
    String(president2019.event_id) !== PRESIDENT_2019_EVENT_ID ||
    String(president2019.event_kind) !== "ordinary" ||
    String(president2019.ballot_basis) !== "unknown" ||
    String(president2019.electoral_system) !== "direct_popular_two_round"
  ) {
    throw new Error("2019 presidency must stay one direct two-round cycle");
  }
  const first = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2019_FIRST_ID);
  const runoff = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2019_RUNOFF_ID);
  if (!first || String(first.kind) !== "first_round" || Number(first.sequence_no) !== 1 || first.supersedes_id != null) {
    throw new Error("2019 presidential first round mismatch");
  }
  if (!runoff || String(runoff.kind) !== "runoff" || Number(runoff.sequence_no) !== 2 || runoff.supersedes_id != null) {
    throw new Error("2019 presidential runoff must not invent a supersedes edge");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND office_id = ?", [LITHUANIA_LINEAGE, PRESIDENT_ID]) !== 1) {
    throw new Error("Only the recovered 2019 presidential cycle may be stored");
  }
  const disputed = db
    .prepare("SELECT votes, share, share_status, evidence_status, elected_flag FROM result_row WHERE result_row_id = ?")
    .get(PRESIDENT_DISPUTED_RESULT_ID);
  if (
    !disputed ||
    Number(disputed.votes) !== 446719 ||
    Number(disputed.share) !== 31.31 ||
    String(disputed.share_status) !== "disputed" ||
    String(disputed.evidence_status) !== "disputed" ||
    Number(disputed.elected_flag) !== 0
  ) {
    throw new Error("2019 disputed presidential share must stay numeric and disputed");
  }
  if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [LITHUANIA_LINEAGE, MALFORMED_INVALID_TOKEN]) !== 1) {
    throw new Error("Malformed invalid token 1,7205 must stay unresolved");
  }
  if (countRows(db, "office", "lineage_id = ? AND (office_type LIKE '%deputy%' OR office_type LIKE '%director%' OR office_type LIKE '%cabinet%' OR name LIKE '%seniūn%')", [LITHUANIA_LINEAGE]) !== 0) {
    throw new Error("Appointed deputy, director, cabinet, or seniūnija offices must not be invented");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(LITHUANIA_LINEAGE, projection.release.release_id);
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
    if (String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT || String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Slim Lithuania fingerprint does not match the pinned candidate release");
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(LITHUANIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Draft Lithuania tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [LITHUANIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
