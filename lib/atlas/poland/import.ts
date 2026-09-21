import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BOLESLAWIEC_COUNCIL_ID,
  BOLESLAWIEC_GEOGRAPHY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as POLAND_LINEAGE,
  OSTROWICE_COUNCIL_ID,
  OSTROWICE_EXECUTIVE_ID,
  POWIAT_EXAMPLE_ID,
  PRESIDENT_ID,
  SEJM_2019_HISTORY_KEY,
  SEJM_ID,
  SEJMIK_EXAMPLE_ID,
  SENAT_ID,
  TIER_PATH,
  TIER_SHA256,
  WARSAW_DISTRICT_EXAMPLE_ID,
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
import { PolandPreflightError, scanPolandInventory, type PolandInventory } from "./inventory";
import { projectPoland, type PolandProjection } from "./project";
import { writePolandProjection } from "./write";

export type ImportPolandOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: PolandProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportPolandResult = {
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

export function importPoland(options: ImportPolandOptions): ImportPolandResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: POLAND_LINEAGE,
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

    let inventory: PolandInventory;
    try {
      inventory = scanPolandInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof PolandPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: POLAND_LINEAGE,
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
      lineageId: POLAND_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectPoland(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(POLAND_LINEAGE, inventory.fingerprint);
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
      writePolandProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertPolandFidelity(staging, projection);
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

export function assertPolandFidelity(db: DatabaseSync, projection?: PolandProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [POLAND_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [POLAND_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [POLAND_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [POLAND_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [POLAND_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [POLAND_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [POLAND_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [POLAND_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [POLAND_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [POLAND_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [POLAND_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [POLAND_LINEAGE]);
  const powiatRegional = countRows(
    db,
    "office o JOIN office_tier_classification t USING (id_namespace, office_id)",
    "o.lineage_id = ? AND o.office_type = 'county_council' AND t.tier = 'regional'",
    [POLAND_LINEAGE],
  );
  const powiatOtherTier = countRows(
    db,
    "office o JOIN office_tier_classification t USING (id_namespace, office_id)",
    "o.lineage_id = ? AND o.office_type = 'county_council' AND t.tier != 'regional'",
    [POLAND_LINEAGE],
  );
  const appointed = countRows(
    db,
    "office",
    "lineage_id = ? AND (office_type IN ('appointed_voivode','voivode','wojewoda','cabinet','premier','prime_minister') OR name LIKE 'Wojewoda %' OR name LIKE '%Prezes Rady Ministrów%' OR name LIKE '%Rada Ministrów%')",
    [POLAND_LINEAGE],
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
  if (powiatRegional !== EXPECTED_COUNTS.powiat_councils) throw new Error(`powiat regional count ${powiatRegional}`);
  if (powiatOtherTier !== 0) throw new Error("powiat councils must stay regional");
  if (appointed !== 0) throw new Error("appointed voivode or cabinet offices must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'poland'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "PL" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Polska"
  ) {
    throw new Error("Poland country projection mismatch");
  }

  const boleslawiec = db
    .prepare(
      "SELECT office_status, record_state, next_date_resolution, next_history_key, geography_id FROM office WHERE office_id = ?",
    )
    .get(BOLESLAWIEC_COUNCIL_ID);
  if (
    !boleslawiec ||
    String(boleslawiec.office_status) !== "current" ||
    String(boleslawiec.record_state) !== "active" ||
    String(boleslawiec.next_date_resolution) !== "resolved" ||
    boleslawiec.next_history_key != null ||
    String(boleslawiec.geography_id) !== BOLESLAWIEC_GEOGRAPHY_ID
  ) {
    throw new Error("Bolesławiec council projection mismatch");
  }
  const next = db
    .prepare(
      "SELECT d.label, d.precision, d.certainty, d.year, d.month, d.day FROM office o JOIN research_date d ON d.date_id = o.next_date_id WHERE o.office_id = ?",
    )
    .get(BOLESLAWIEC_COUNCIL_ID);
  if (
    !next ||
    String(next.label) !== "2029" ||
    String(next.precision) !== "year" ||
    String(next.certainty) !== "expected" ||
    Number(next.year) !== 2029 ||
    next.month != null ||
    next.day != null
  ) {
    throw new Error("Bolesławiec 2029 year-precision next date mismatch");
  }

  for (const officeId of [OSTROWICE_COUNCIL_ID, OSTROWICE_EXECUTIVE_ID]) {
    const row = db
      .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
      .get(officeId);
    if (!row || String(row.office_status) !== "historical" || String(row.record_state) !== "active" || row.next_date_id != null) {
      throw new Error(`Historic Ostrowice ${officeId} must stay active without an invented end date`);
    }
  }

  const powiat = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(POWIAT_EXAMPLE_ID);
  if (!powiat || String(powiat.tier) !== "regional" || String(powiat.review_status) !== "needs_review") {
    throw new Error("Powiat example must stay regional needs_review");
  }
  const sejmik = db
    .prepare(
      "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(SEJMIK_EXAMPLE_ID);
  if (!sejmik || String(sejmik.tier) !== "regional" || String(sejmik.review_status) !== "approved") {
    throw new Error("Voivodeship sejmik example must stay approved regional");
  }
  for (const officeId of [SEJM_ID, SENAT_ID, PRESIDENT_ID]) {
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
    throw new Error("Poland EP delegation must stay other/needs_review");
  }
  const warsaw = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(WARSAW_DISTRICT_EXAMPLE_ID);
  if (
    !warsaw ||
    String(warsaw.office_type) !== "warsaw_district_council" ||
    String(warsaw.tier) !== "other" ||
    String(warsaw.review_status) !== "needs_review"
  ) {
    throw new Error("Warsaw district council must stay other/needs_review");
  }

  const sejm2019 = db
    .prepare(
      "SELECT e.date_resolution, d.precision, d.certainty, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(SEJM_2019_HISTORY_KEY);
  if (
    !sejm2019 ||
    String(sejm2019.date_resolution) !== "resolved" ||
    String(sejm2019.precision) !== "year" ||
    String(sejm2019.certainty) !== "called" ||
    Number(sejm2019.year) !== 2019 ||
    sejm2019.month != null ||
    sejm2019.day != null
  ) {
    throw new Error("Sejm 2019 year-precision event mismatch");
  }

  const supersedes = countRows(db, "proceeding", "lineage_id = ? AND supersedes_id IS NOT NULL", [POLAND_LINEAGE]);
  if (supersedes !== 0) throw new Error("runoff proceedings must not supersede the first round");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(POLAND_LINEAGE, projection.release.release_id);
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
      .get(POLAND_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Poland tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [POLAND_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
