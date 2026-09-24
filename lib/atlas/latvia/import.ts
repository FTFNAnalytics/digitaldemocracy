import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DISPUTED_SHARE_RESULT_ID,
  EP_2014_HK,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as LATVIA_LINEAGE,
  MADONA_2021_ID,
  MADONA_2025_ID,
  NAMED_HOLDS,
  PRESIDENT_2003_HK,
  PRESIDENT_2015_HK,
  PRESIDENT_2015_PROCEEDING_ID,
  PRESIDENT_2023_HK,
  PRESIDENT_2023_PROCEEDING_ID,
  PRESIDENT_ID,
  RIGA_2020_HK,
  RIGA_ID,
  SAEIMA_2022_HK,
  SAEIMA_2026_HK,
  SAEIMA_ID,
  TIER_PATH,
  TIER_SHA256,
  VARAKLANI_2021_ID,
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
import { LatviaPreflightError, scanLatviaInventory, type LatviaInventory } from "./inventory";
import { projectLatvia, type LatviaProjection } from "./project";
import { writeLatviaProjection } from "./write";

export type ImportLatviaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: LatviaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportLatviaResult = {
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

export function importLatvia(options: ImportLatviaOptions): ImportLatviaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: LATVIA_LINEAGE,
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

    let inventory: LatviaInventory;
    try {
      inventory = scanLatviaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof LatviaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: LATVIA_LINEAGE,
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
      lineageId: LATVIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectLatvia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(LATVIA_LINEAGE, inventory.fingerprint);
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
      writeLatviaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertLatviaFidelity(staging, projection);
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

export function assertLatviaFidelity(db: DatabaseSync, projection?: LatviaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [LATVIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [LATVIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [LATVIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [LATVIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [LATVIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [LATVIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [LATVIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [LATVIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LATVIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LATVIA_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [LATVIA_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [LATVIA_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [LATVIA_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [LATVIA_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [LATVIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [LATVIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [LATVIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [LATVIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [LATVIA_LINEAGE]);
  const councils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type = 'local_government_council'",
    [LATVIA_LINEAGE],
  );
  const directExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type NOT IN ('local_government_council','national_parliament','national_president','european_parliament_delegation')",
    [LATVIA_LINEAGE],
  );
  const mayorOffices = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_id LIKE '%-M')",
    [LATVIA_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
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
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [LATVIA_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  if (
    countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token LIKE 'LV-SV2022-SHARE-%'", [LATVIA_LINEAGE]) !==
    EXPECTED_COUNTS.unresolved_share_claims
  ) {
    throw new Error("Seven 2022 share conflicts must stay unresolved");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'latvia'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "LV" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Latvija"
  ) {
    throw new Error("Latvia country projection mismatch");
  }

  const riga = db
    .prepare("SELECT office_status, record_state, next_history_key, geography_id FROM office WHERE office_id = ?")
    .get(RIGA_ID);
  if (
    !riga ||
    String(riga.office_status) !== "current" ||
    String(riga.record_state) !== "active" ||
    riga.next_history_key != null ||
    String(riga.geography_id) !== "LV-LOCAL-2021-riga"
  ) {
    throw new Error("Riga must stay one current council");
  }
  if (countRows(db, "election_event", "office_id = ? AND history_key LIKE '%PV2021%'", [RIGA_ID]) !== 0) {
    throw new Error("No 2021 Riga event may be invented");
  }
  const riga2020 = db.prepare("SELECT event_id, event_kind FROM election_event WHERE history_key = ?").get(RIGA_2020_HK);
  if (!riga2020 || String(riga2020.event_kind) !== "special") {
    throw new Error("Riga 2020 must stay the extraordinary contest");
  }

  for (const officeId of [MADONA_2021_ID, VARAKLANI_2021_ID]) {
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
  const madona = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(MADONA_2025_ID);
  if (!madona || String(madona.office_status) !== "current") {
    throw new Error("2025 Madona must stay the current council");
  }

  const saeima = db
    .prepare(
      "SELECT o.office_status, o.next_history_key, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(SAEIMA_ID);
  if (
    !saeima ||
    String(saeima.office_status) !== "current" ||
    String(saeima.tier) !== "national_context" ||
    String(saeima.review_status) !== "approved" ||
    String(saeima.next_history_key) !== SAEIMA_2026_HK
  ) {
    throw new Error("Saeima must be an accepted national_context row with the 2026 next contest");
  }
  const saeimaNext = db
    .prepare(
      "SELECT d.label, d.precision, d.certainty, d.month, d.day FROM office o JOIN research_date d ON d.date_id = o.next_date_id WHERE o.office_id = ?",
    )
    .get(SAEIMA_ID);
  if (
    !saeimaNext ||
    String(saeimaNext.label) !== "2026-10-03" ||
    String(saeimaNext.precision) !== "day" ||
    String(saeimaNext.certainty) !== "called" ||
    Number(saeimaNext.month) !== 10 ||
    Number(saeimaNext.day) !== 3
  ) {
    throw new Error("Saeima 2026 next date must stay the called day");
  }
  const saeima2026 = db
    .prepare("SELECT event_id, selected_history_role, legal_outcome, event_kind FROM election_event WHERE history_key = ?")
    .get(SAEIMA_2026_HK);
  if (
    !saeima2026 ||
    String(saeima2026.selected_history_role) !== "none" ||
    String(saeima2026.legal_outcome) !== "not_held" ||
    String(saeima2026.event_kind) !== "ordinary"
  ) {
    throw new Error("Saeima 2026 must stay the single prospective contest");
  }
  if (countRows(db, "result_row", "history_key = ?", [SAEIMA_2026_HK]) !== 0) {
    throw new Error("Saeima 2026 must not gain invented results");
  }

  const president = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review"
  ) {
    throw new Error("Presidency must stay indirect national_context and LV-G03 needs_review");
  }
  const ep = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Latvia EP delegation must stay the other/needs_review row");
  }
  if (
    countRows(db, "election_event", "lineage_id = ? AND office_id = ? AND event_kind = 'indirect'", [LATVIA_LINEAGE, PRESIDENT_ID]) !==
    EXPECTED_COUNTS.president_indirect_events
  ) {
    throw new Error("Indirect presidential events drifted");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND office_id = ? AND ballot_basis <> 'electors'", [LATVIA_LINEAGE, PRESIDENT_ID]) !== 0) {
    throw new Error("No popular presidential ballot may be invented");
  }

  const president2003 = db
    .prepare(
      "SELECT e.event_kind, d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(PRESIDENT_2003_HK);
  if (
    !president2003 ||
    String(president2003.event_kind) !== "indirect" ||
    String(president2003.precision) !== "year" ||
    president2003.month != null ||
    president2003.day != null
  ) {
    throw new Error("2003 presidency must stay year precision and indirect");
  }
  if (countRows(db, "result_row", "history_key = ? AND proceeding_id IS NOT NULL", [PRESIDENT_2003_HK]) !== 0) {
    throw new Error("2003 presidency must not gain an invented proceeding");
  }
  const fifth = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2015_PROCEEDING_ID);
  const first = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2023_PROCEEDING_ID);
  if (!fifth || String(fifth.kind) !== "runoff" || Number(fifth.sequence_no) !== 5 || fifth.supersedes_id != null) {
    throw new Error("2015 fifth ballot must stay sequence 5 without a supersedes edge");
  }
  if (!first || String(first.kind) !== "first_round" || Number(first.sequence_no) !== 1 || first.supersedes_id != null) {
    throw new Error("2023 first round must stay sequence 1; source form 6 is not the round");
  }
  if (countRows(db, "proceeding", "history_key = ?", [PRESIDENT_2015_HK]) !== 1) {
    throw new Error("2015 must not synthesize rounds 1–4");
  }
  if (countRows(db, "proceeding", "history_key = ?", [PRESIDENT_2023_HK]) !== 1) {
    throw new Error("2023 must not synthesize later rounds");
  }

  const ep2014 = db
    .prepare("SELECT event_id, legal_outcome, event_kind FROM election_event WHERE history_key = ?")
    .get(EP_2014_HK);
  if (!ep2014 || String(ep2014.legal_outcome) !== "certified" || String(ep2014.event_kind) !== "ordinary") {
    throw new Error("EP 2014 must stay the certified ordinary contest");
  }
  if (countRows(db, "election_event", "office_id = ?", [EP_ID]) !== 3) {
    throw new Error("EP replacements must not become extra contests");
  }

  const disputed = db
    .prepare("SELECT share, share_status, evidence_status, votes FROM result_row WHERE result_row_id = ?")
    .get(DISPUTED_SHARE_RESULT_ID);
  if (
    !disputed ||
    Number(disputed.share) !== 18.97 ||
    String(disputed.share_status) !== "disputed" ||
    String(disputed.evidence_status) !== "disputed" ||
    Number(disputed.votes) !== 173425
  ) {
    throw new Error("The documented 2022 share conflict must keep the archive percentage");
  }
  if (
    countRows(
      db,
      "result_row",
      "lineage_id = ? AND history_key = ? AND share_status = 'disputed'",
      [LATVIA_LINEAGE, SAEIMA_2022_HK],
    ) !== EXPECTED_COUNTS.disputed_share_rows
  ) {
    throw new Error("Seven 2022 disputed shares drifted");
  }
  const presidentialLocator = db
    .prepare(
      "SELECT proceeding_id FROM record_locator WHERE entity_kind = 'result_row' AND result_row_id IN (SELECT result_row_id FROM result_row WHERE history_key = ? AND proceeding_id IS NOT NULL)",
    )
    .all(PRESIDENT_2023_HK);
  if (presidentialLocator.length === 0 || presidentialLocator.some((row) => row.proceeding_id != null)) {
    throw new Error("Result locators keep proceeding_id null even when the result row cites a ballot");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(LATVIA_LINEAGE, projection.release.release_id);
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
      .get(LATVIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Latvia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [LATVIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
