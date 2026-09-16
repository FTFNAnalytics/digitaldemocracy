import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  EXPECTED_GEOGRAPHIES,
  LINEAGE_ID as ANDORRA_LINEAGE,
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
import { AndorraPreflightError, scanAndorraInventory, type AndorraInventory } from "./inventory";
import { projectAndorra, type AndorraProjection } from "./project";
import { writeAndorraProjection } from "./write";

export type ImportAndorraOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: AndorraProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportAndorraResult = {
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

export function importAndorra(options: ImportAndorraOptions): ImportAndorraResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ANDORRA_LINEAGE,
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

    let inventory: AndorraInventory;
    try {
      inventory = scanAndorraInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof AndorraPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ANDORRA_LINEAGE,
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
      lineageId: ANDORRA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectAndorra(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ANDORRA_LINEAGE, inventory.fingerprint);
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
      writeAndorraProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertAndorraFidelity(staging, projection);
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

export function assertAndorraFidelity(db: DatabaseSync, projection?: AndorraProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ANDORRA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ANDORRA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ANDORRA_LINEAGE]);
  const dayDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'day'", [ANDORRA_LINEAGE]);
  const yearDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'year'", [ANDORRA_LINEAGE]);
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.selected_histories) throw new Error(`event count ${events}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== 21 || dayDates !== 7 || yearDates !== 14) {
    throw new Error(`date precision counts ${dates}/${dayDates}/${yearDates}`);
  }

  const regionalQuery = db
    .prepare(
      `SELECT o.office_id FROM office o
       JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       WHERE o.country_id = 'andorra' AND t.tier = 'regional'`,
    )
    .all();
  if (regionalQuery.length !== 0) {
    throw new Error("Andorra regional calendar must be empty");
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_GEOGRAPHIES)) {
    const office = db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId) {
      throw new Error(`${officeId} geography mismatch`);
    }
  }

  const nextUnknown = countRows(
    db,
    "office",
    "lineage_id = ? AND next_date_id IS NULL AND next_date_resolution = 'unknown' AND next_history_key IS NULL",
    [ANDORRA_LINEAGE],
  );
  if (nextUnknown !== 7) throw new Error("All seven Andorra next dates must stay unknown");

  const fingerprintRow = db
    .prepare("SELECT fingerprint_sha256 FROM dataset_release WHERE lineage_id = ?")
    .get(ANDORRA_LINEAGE);
  const isFrozenBaseline = String(fingerprintRow?.fingerprint_sha256) === CANDIDATE_FINGERPRINT;

  const event = db
    .prepare("SELECT event_id, history_key, date_resolution, event_kind FROM election_event WHERE event_id = ?")
    .get("event-321b029bb122c1284e83dd89");
  if (
    !event ||
    String(event.history_key) !== "AD-M-05::2023::2023-12-17" ||
    String(event.date_resolution) !== "resolved" ||
    String(event.event_kind) !== "ordinary"
  ) {
    throw new Error("AD-M-05 2023 event mismatch");
  }

  const yearEvent = db
    .prepare("SELECT history_key, date_id FROM election_event WHERE event_id = ?")
    .get("event-02706181e65e03e35a10c899");
  if (!yearEvent || String(yearEvent.history_key) !== "AD-M-05::2019::") {
    throw new Error("AD-M-05 2019 trailing-empty HK mismatch");
  }
  const yearDate = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(String(yearEvent.date_id));
  if (
    !yearDate ||
    String(yearDate.label) !== "2019" ||
    String(yearDate.precision) !== "year" ||
    String(yearDate.certainty) !== "unknown" ||
    Number(yearDate.year) !== 2019 ||
    yearDate.month != null ||
    yearDate.day != null
  ) {
    throw new Error("AD-M-05 2019 year-only date mismatch");
  }

  const enclar = db
    .prepare(
      "SELECT candidate_or_list_label, votes, seats, seats_status, share, elected_flag, is_substitute FROM result_row WHERE result_row_id = ?",
    )
    .get("event-321b029bb122c1284e83dd89-r0");
  if (
    !enclar ||
    String(enclar.candidate_or_list_label) !== "ENCLAR" ||
    Number(enclar.votes) !== 1989 ||
    Number(enclar.seats) !== 9 ||
    Number(enclar.share) !== 52.46636771300449 ||
    enclar.elected_flag != null ||
    enclar.is_substitute != null
  ) {
    throw new Error("ENCLAR r0 mismatch");
  }

  if (isFrozenBaseline) {
    const zeroSeat = db
      .prepare("SELECT candidate_or_list_label, seats, seats_status, votes FROM result_row WHERE result_row_id = ?")
      .get("event-02706181e65e03e35a10c899-r2");
    if (
      !zeroSeat ||
      String(zeroSeat.candidate_or_list_label) !== "Terceravia + Independents" ||
      Number(zeroSeat.seats) !== 0 ||
      String(zeroSeat.seats_status) !== "zero" ||
      Number(zeroSeat.votes) !== 394
    ) {
      throw new Error("AD-M-05 2019 r2 zero-seat mismatch");
    }
    const zeroSeats = countRows(db, "result_row", "lineage_id = ? AND seats = 0 AND seats_status = 'zero'", [ANDORRA_LINEAGE]);
    const nullSeats = countRows(db, "result_row", "lineage_id = ? AND seats IS NULL", [ANDORRA_LINEAGE]);
    if (zeroSeats !== 9 || nullSeats !== 0) {
      throw new Error(`Andorra seat zero/missing ${zeroSeats}/${nullSeats}`);
    }
    const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ANDORRA_LINEAGE]);
    if (unresolved !== 0) throw new Error(`Frozen baseline unresolved_evidence ${unresolved}`);
  }

  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:andorra' AND upstream_id = ?",
    )
    .get("andorra--url-af1b164b6b3206a3d8ee9824");
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'andorra:source-catalogue' AND upstream_id = ?",
    )
    .get("S6550aa0914");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to S6550aa0914");
  }

  const source = db
    .prepare("SELECT publisher, title, url, data_rights FROM source WHERE source_id = ?")
    .get("andorra--S6550aa0914");
  if (
    !source ||
    source.publisher != null ||
    String(source.title) !== "Government of Andorra: communal election 2023 results" ||
    String(source.url) !== "https://www.eleccions.ad/resultats" ||
    String(source.data_rights) !== "unknown"
  ) {
    throw new Error("S6550aa0914 source projection mismatch");
  }

  if (projection) {
    const hashes = db
      .prepare("SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(ANDORRA_LINEAGE, projection.release.release_id);
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (parsed.adapter_version !== hashes?.adapter_version || parsed.method_version !== hashes?.method_version || parsed.schema_version !== hashes?.schema_version) {
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
      .get(ANDORRA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Andorra tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
  }
}
