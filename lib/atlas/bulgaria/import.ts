import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  GRADEC_OFFICE_ID,
  HELD_EXAMPLE_OFFICE_IDS,
  LINEAGE_ID as BULGARIA_LINEAGE,
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
import { BulgariaPreflightError, scanBulgariaInventory, type BulgariaInventory } from "./inventory";
import { projectBulgaria, type BulgariaProjection } from "./project";
import { writeBulgariaProjection } from "./write";

export type ImportBulgariaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: BulgariaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportBulgariaResult = {
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

export function importBulgaria(options: ImportBulgariaOptions): ImportBulgariaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BULGARIA_LINEAGE,
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

    let inventory: BulgariaInventory;
    try {
      inventory = scanBulgariaInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof BulgariaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: BULGARIA_LINEAGE,
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
      lineageId: BULGARIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBulgaria(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(BULGARIA_LINEAGE, inventory.fingerprint);
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
      writeBulgariaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertBulgariaFidelity(staging, projection);
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

export function assertBulgariaFidelity(db: DatabaseSync, projection?: BulgariaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [BULGARIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [BULGARIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BULGARIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BULGARIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const dayDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'day'", [BULGARIA_LINEAGE]);
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates || dayDates !== EXPECTED_COUNTS.historical_dates_day) {
    throw new Error(`date precision counts ${dates}/${dayDates}`);
  }

  const heldPublished = db
    .prepare(
      `SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id IN (${HELD_EXAMPLE_OFFICE_IDS.map(() => "?").join(",")})`,
    )
    .get(BULGARIA_LINEAGE, ...HELD_EXAMPLE_OFFICE_IDS);
  if (Number(heldPublished?.n) !== 0) {
    throw new Error("Held district/village offices must not publish");
  }
  const gradecOffice = db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID);
  if (gradecOffice) throw new Error("Градец village office must not publish");
  const gradecEvents = countRows(db, "election_event", "office_id = ?", [GRADEC_OFFICE_ID]);
  if (gradecEvents !== 0) throw new Error("Градец must not mint typed events");

  const country = db.prepare("SELECT country_code, polity_kind, region_id FROM country WHERE country_id = 'bulgaria'").get();
  if (!country || String(country.country_code) !== "BG" || String(country.polity_kind) !== "sovereign_country" || String(country.region_id) !== "europe") {
    throw new Error("Bulgaria country projection mismatch");
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_OFFICES)) {
    const office = db
      .prepare("SELECT geography_id, office_type, next_date_id, next_history_key, next_date_resolution FROM office WHERE office_id = ?")
      .get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId || String(office.office_type) !== expected.officeType) {
      throw new Error(`${officeId} geography/type mismatch`);
    }
    if (office.next_date_id != null || office.next_history_key != null || String(office.next_date_resolution) !== "unknown") {
      throw new Error(`${officeId} must keep an unknown next date`);
    }
  }

  const votesZero = countRows(db, "result_row", "lineage_id = ? AND votes = 0 AND votes_status = 'zero'", [BULGARIA_LINEAGE]);
  const seatsZero = countRows(db, "result_row", "lineage_id = ? AND seats = 0 AND seats_status = 'zero'", [BULGARIA_LINEAGE]);
  if (votesZero !== EXPECTED_COUNTS.votes_zero || seatsZero !== EXPECTED_COUNTS.seats_zero) {
    throw new Error(`Bulgaria missing-versus-zero counts ${votesZero}/${seatsZero}`);
  }

  const firstRound = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/bulgaria/unpacked/tables/companion/first-round-returns.json'",
    )
    .get(BULGARIA_LINEAGE);
  const unresolvedHistory = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/bulgaria/unpacked/tables/companion/unresolved-history.json'",
    )
    .get(BULGARIA_LINEAGE);
  if (!firstRound || !unresolvedHistory) {
    throw new Error("First-round and unresolved-history tables must remain retained inputs");
  }
  const pollInput = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/bulgaria/unpacked/tables/master/polling-evidence.json'",
    )
    .get(BULGARIA_LINEAGE);
  const controlInput = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/bulgaria/unpacked/tables/governing-control.json'",
    )
    .get(BULGARIA_LINEAGE);
  if (pollInput || controlInput) {
    throw new Error("Absent poll/control tables must not be fabricated");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(BULGARIA_LINEAGE, projection.release.release_id);
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
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(BULGARIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Bulgaria tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [BULGARIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
