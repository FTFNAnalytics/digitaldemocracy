import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  DEFAULT_OPERATOR,
  EXPECTED_COUNTS,
  LINEAGE_ID,
  SCRIPT_VERSION,
  TIER_PATH,
  newAttemptId,
} from "../identity";
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
import { AlbaniaPreflightError, scanAlbaniaInventory, type AlbaniaInventory } from "./inventory";
import { projectAlbania, type AlbaniaProjection } from "./project";
import { writeAlbaniaProjection } from "./write";

export type ImportAlbaniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: AlbaniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportAlbaniaResult = {
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

export function importAlbania(options: ImportAlbaniaOptions): ImportAlbaniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: LINEAGE_ID,
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

    let inventory: AlbaniaInventory;
    try {
      inventory = scanAlbaniaInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof AlbaniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: LINEAGE_ID,
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
      lineageId: LINEAGE_ID,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectAlbania(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(LINEAGE_ID, inventory.fingerprint);
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
      writeAlbaniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertAlbaniaFidelity(staging, projection);
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

export function assertAlbaniaFidelity(db: DatabaseSync, projection?: AlbaniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [LINEAGE_ID]);
  const events = countRows(db, "election_event", "lineage_id = ?", [LINEAGE_ID]);
  const results = countRows(db, "result_row", "lineage_id = ?", [LINEAGE_ID]);
  const geos = countRows(db, "geography", "lineage_id = ?", [LINEAGE_ID]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID]);
  const sources = countRows(db, "source", "lineage_id = ?", [LINEAGE_ID]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [LINEAGE_ID]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [LINEAGE_ID]);
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.selected_histories) throw new Error(`event count ${events}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  const al13 = db
    .prepare("SELECT office_id, geography_id FROM office WHERE office_id = 'AL-13-M'")
    .get();
  if (!al13 || String(al13.geography_id) !== "geo-99a7b8d0e325a448c5e7c7ca") {
    throw new Error("AL-13-M geography mismatch");
  }
  const event = db
    .prepare("SELECT event_id, history_key FROM election_event WHERE event_id = 'event-9b7cd1a6a6d27850e712e6a7'")
    .get();
  if (!event || String(event.history_key) !== "AL-13-M::2023::2023-05-14") {
    throw new Error("AL-13-M 2023 event mismatch");
  }
  const arif = db
    .prepare(
      "SELECT candidate_or_list_label, votes, seats, seats_status, share FROM result_row WHERE result_row_id = ?",
    )
    .get("event-9b7cd1a6a6d27850e712e6a7-r0");
  if (!arif || String(arif.candidate_or_list_label) !== "Arif Faik Tafani" || Number(arif.votes) !== 4564 || arif.seats != null) {
    throw new Error("Arif r0 mismatch");
  }
  const bedri = db
    .prepare("SELECT candidate_or_list_label, votes FROM result_row WHERE result_row_id = ?")
    .get("event-9b7cd1a6a6d27850e712e6a7-r1");
  if (!bedri || String(bedri.candidate_or_list_label) !== "Bedri Skënder Qypi" || Number(bedri.votes) !== 4515) {
    throw new Error("Bedri r1 mismatch");
  }
  const agrare = db
    .prepare("SELECT seats, seats_status, votes FROM result_row WHERE result_row_id = ?")
    .get("event-42aa961113176bd7302e00d8-r8");
  if (!agrare || Number(agrare.seats) !== 0 || String(agrare.seats_status) !== "zero" || Number(agrare.votes) !== 326) {
    throw new Error("AL-13-C r8 zero-seat mismatch");
  }
  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:albania' AND upstream_id = ?",
    )
    .get("albania--url-79f33cdf44c3677da541259e");
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'albania:source-catalogue' AND upstream_id = ?",
    )
    .get("Sfaae00802d");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to Sfaae00802d");
  }
  const rrogozhineMay = db
    .prepare("SELECT 1 AS ok FROM election_event WHERE history_key = 'AL-52-M::2023::2023-05-14'")
    .get();
  if (rrogozhineMay) {
    throw new Error("Annulled Rrogozhinë May 2023 must not be inserted");
  }
  if (projection) {
    const hashes = db.prepare("SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json FROM dataset_release WHERE lineage_id = ? AND release_id = ?").get(LINEAGE_ID, projection.release.release_id);
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (parsed.adapter_version !== hashes?.adapter_version || parsed.method_version !== hashes?.method_version || parsed.schema_version !== hashes?.schema_version) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (!Array.isArray(parsed.schema_inputs) || parsed.schema_inputs[0]?.input_path !== "0001_atlas_attempt_log.sql") {
      throw new Error("schema_inputs must use checked-in migration filenames");
    }
  }
}
