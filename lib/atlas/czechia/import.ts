import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BOROUGH_EXAMPLE_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CHAMBER_ID,
  EP_ID,
  EXPECTED_COUNTS,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID as CZECHIA_LINEAGE,
  PRAGUE_ASSEMBLY_ID,
  PRAGUE_GEOGRAPHY_ID,
  PRAGUE_NEXT_DATE_ID,
  PRAGUE_NEXT_HISTORY_KEY,
  PRESIDENT_ID,
  PROSPECTIVE_EXAMPLE_EVENT_ID,
  PROSPECTIVE_EXAMPLE_HISTORY_KEY,
  REGIONAL_2008_EVENT_ID,
  REGIONAL_2008_HISTORY_KEY,
  REGIONAL_EXAMPLE_ID,
  SENATE_ID,
  SENATE_REPEAT_EVENT_ID,
  SENATE_REPEAT_HISTORY_KEY,
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
import { CzechiaPreflightError, scanCzechiaInventory, type CzechiaInventory } from "./inventory";
import { projectCzechia, type CzechiaProjection } from "./project";
import { writeCzechiaProjection } from "./write";

export type ImportCzechiaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: CzechiaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportCzechiaResult = {
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

export function importCzechia(options: ImportCzechiaOptions): ImportCzechiaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: CZECHIA_LINEAGE,
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

    let inventory: CzechiaInventory;
    try {
      inventory = scanCzechiaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof CzechiaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: CZECHIA_LINEAGE,
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
      lineageId: CZECHIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectCzechia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(CZECHIA_LINEAGE, inventory.fingerprint);
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
      writeCzechiaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertCzechiaFidelity(staging, projection);
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

export function assertCzechiaFidelity(db: DatabaseSync, projection?: CzechiaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [CZECHIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [CZECHIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [CZECHIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [CZECHIA_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [CZECHIA_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [CZECHIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [CZECHIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [CZECHIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [CZECHIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [CZECHIA_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [CZECHIA_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [CZECHIA_LINEAGE]);
  const pragueBodies = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'capital_regional_municipal_assembly'",
    [CZECHIA_LINEAGE],
  );
  const localExecutives = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type != 'direct_national_executive' AND (office_type LIKE '%executive%' OR office_type LIKE '%mayor%' OR office_type LIKE '%starosta%' OR office_type LIKE '%hejtman%')",
    [CZECHIA_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result rows must stay 0 while results.jsonl.gz is omitted; found ${results}`);
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (pragueBodies !== 1) throw new Error("Prague must stay one city/region assembly");
  if (localExecutives !== 0) throw new Error("council-selected local executives must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'czechia'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "CZ" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Česká republika"
  ) {
    throw new Error("Czechia country projection mismatch");
  }

  const prague = db
    .prepare(
      "SELECT o.office_status, o.geography_id, o.next_date_id, o.next_history_key, o.next_date_resolution, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRAGUE_ASSEMBLY_ID);
  if (
    !prague ||
    String(prague.office_status) !== "current" ||
    String(prague.geography_id) !== PRAGUE_GEOGRAPHY_ID ||
    String(prague.next_date_id) !== PRAGUE_NEXT_DATE_ID ||
    String(prague.next_history_key) !== PRAGUE_NEXT_HISTORY_KEY ||
    String(prague.next_date_resolution) !== "resolved" ||
    String(prague.tier) !== "regional" ||
    String(prague.review_status) !== "needs_review"
  ) {
    throw new Error("Prague assembly must stay one regional needs_review body");
  }
  const pragueNext = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(PRAGUE_NEXT_DATE_ID);
  if (
    !pragueNext ||
    String(pragueNext.label) !== "2026-10-09" ||
    String(pragueNext.precision) !== "day" ||
    String(pragueNext.certainty) !== "called" ||
    Number(pragueNext.year) !== 2026 ||
    Number(pragueNext.month) !== 10 ||
    Number(pragueNext.day) !== 9
  ) {
    throw new Error("Prague 2026-10-09 first polling day mismatch");
  }

  const borough = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BOROUGH_EXAMPLE_ID);
  if (
    !borough ||
    String(borough.office_type) !== "borough_council" ||
    String(borough.tier) !== "other" ||
    String(borough.review_status) !== "needs_review"
  ) {
    throw new Error("Prague 1 borough must stay other/needs_review");
  }

  const regionalOffice = db
    .prepare(
      "SELECT o.office_status, o.next_date_id, o.next_history_key, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(REGIONAL_EXAMPLE_ID);
  if (
    !regionalOffice ||
    String(regionalOffice.office_status) !== "current" ||
    regionalOffice.next_date_id != null ||
    regionalOffice.next_history_key != null ||
    String(regionalOffice.tier) !== "regional" ||
    String(regionalOffice.review_status) !== "approved"
  ) {
    throw new Error("Středočeský kraj assembly must stay approved regional with an unknown next date");
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
    throw new Error("Historical Nemíž must stay active without an invented end date or successor");
  }

  for (const officeId of [PRESIDENT_ID, CHAMBER_ID, SENATE_ID]) {
    const row = db
      .prepare(
        "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
      )
      .get(officeId);
    if (!row || String(row.tier) !== "national_context" || String(row.review_status) !== "approved") {
      throw new Error(`${officeId} must stay approved national_context`);
    }
  }
  const ep = db
    .prepare(
      "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Czech EP delegation must stay other/needs_review");
  }
  const directExecutives = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'direct_national_executive'",
    [CZECHIA_LINEAGE],
  );
  if (directExecutives !== 1) throw new Error(`direct national executives ${directExecutives}`);

  const yearEvent = db
    .prepare(
      "SELECT e.event_id, e.date_resolution, d.precision, d.certainty, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(REGIONAL_2008_HISTORY_KEY);
  if (
    !yearEvent ||
    String(yearEvent.event_id) !== REGIONAL_2008_EVENT_ID ||
    String(yearEvent.date_resolution) !== "resolved" ||
    String(yearEvent.precision) !== "year" ||
    String(yearEvent.certainty) !== "called" ||
    Number(yearEvent.year) !== 2008 ||
    yearEvent.month != null ||
    yearEvent.day != null
  ) {
    throw new Error("2008 regional year-precision event mismatch");
  }

  const prospectiveEvent = db
    .prepare(
      "SELECT e.event_id, e.selected_history_role, e.legal_outcome, d.precision, d.label FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(PROSPECTIVE_EXAMPLE_HISTORY_KEY);
  if (
    !prospectiveEvent ||
    String(prospectiveEvent.event_id) !== PROSPECTIVE_EXAMPLE_EVENT_ID ||
    String(prospectiveEvent.selected_history_role) !== "none" ||
    String(prospectiveEvent.legal_outcome) !== "unknown" ||
    String(prospectiveEvent.precision) !== "day" ||
    String(prospectiveEvent.label) !== "2026-10-09"
  ) {
    throw new Error("2026-10-09 prospective local event mismatch");
  }
  if (countRows(db, "result_row", "history_key = ?", [PROSPECTIVE_EXAMPLE_HISTORY_KEY]) !== 0) {
    throw new Error("Prospective 2026 events must not invent result rows");
  }

  const repeated = db
    .prepare("SELECT event_id, event_kind, selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
    .get(SENATE_REPEAT_HISTORY_KEY);
  if (
    !repeated ||
    String(repeated.event_id) !== SENATE_REPEAT_EVENT_ID ||
    String(repeated.event_kind) !== "repeated" ||
    String(repeated.selected_history_role) !== "other" ||
    String(repeated.legal_outcome) !== "unknown"
  ) {
    throw new Error("Senate repeat must stay other/unknown; LEGAL-OUTCOME-REPEAT-AUDIT stays open");
  }

  const supersedes = countRows(db, "proceeding", "lineage_id = ? AND supersedes_id IS NOT NULL", [CZECHIA_LINEAGE]);
  if (supersedes !== 0) throw new Error("runoff proceedings must not supersede the first round");
  const notHeld = countRows(db, "election_event", "lineage_id = ? AND legal_outcome = 'not_held'", [CZECHIA_LINEAGE]);
  if (notHeld !== EXPECTED_COUNTS.not_held_events) throw new Error(`not_held events ${notHeld}`);

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(CZECHIA_LINEAGE, projection.release.release_id);
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
      .get(CZECHIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Czechia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [CZECHIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
