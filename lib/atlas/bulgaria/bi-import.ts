import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BI_CANDIDATE_FINGERPRINT,
  BI_CANDIDATE_RELEASE_ID,
  BI_DRAFT_OFFICE_IDS,
  BI_SCHEMA_TIER_SHA256,
  COUNTRY_GEOGRAPHY_ID,
  EXPECTED_BI_COUNTS,
  GRADEC_OFFICE_ID,
  LINEAGE_ID as BULGARIA_LINEAGE,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  SAMPLE_COUNCIL_ID,
  SAMPLE_MAYOR_ID,
  TIER_PATH,
} from "./bi-identity";
import { BulgariaBiPreflightError, scanBulgariaBiInventory, type BulgariaBiInventory } from "./bi-inventory";
import { projectBulgariaBi } from "./bi-project";
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
import { assertBulgariaBiForeignKeys, writeBulgariaBiRelease, type BulgariaBiWriteMode } from "./bi-write";
import type { BulgariaProjection } from "./project";
import { geographyIdFor } from "./identity";

export type ImportBulgariaBiOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  poisonAfterWrite?: (db: DatabaseSync, projection: BulgariaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportBulgariaBiResult = {
  attemptId: string;
  releaseId: string;
  fingerprint: string;
  reusedRelease: boolean;
  /** fresh inserts the slim projection; additive keeps the 530 office rows; reuse only writes the receipt. */
  writeMode: BulgariaBiWriteMode;
  counts: Record<string, number>;
};

function fixtureEnvEnabled(): boolean {
  return process.env.OBSERVATORY_FIXTURES === "1";
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function importBulgariaBi(options: ImportBulgariaBiOptions): ImportBulgariaBiResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BULGARIA_LINEAGE,
    intended_tier_path: TIER_PATH,
    prompt_bi: true,
  };

  const finishFailure = (error: unknown): never => {
    if (lockFd != null) discardStaging(options.sqlitePath);
    if (started) failAttempt(options.attemptsPath, attemptId, errorText(error));
    throw error;
  };

  try {
    lockFd = acquireWriterLock(options.sqlitePath);
    migrateAttemptsDatabase(options.root, options.attemptsPath);
    reconcileStartedAttempts(options.attemptsPath, options.sqlitePath, existsSync(options.sqlitePath));

    let inventory: BulgariaBiInventory;
    try {
      inventory = scanBulgariaBiInventory({ root: options.root });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof BulgariaBiPreflightError) {
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

    if (inventory.fingerprint !== BI_CANDIDATE_FINGERPRINT || inventory.releaseId !== BI_CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Bulgaria BI fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${BI_CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBulgariaBi(inventory);
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
    let writeMode: BulgariaBiWriteMode = "fresh";
    try {
      writeMode = writeBulgariaBiRelease(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      // A full integrity_check reads every page of the staged atlas. On the
      // live multi-gigabyte file that is a second long silent scan. Fresh
      // databases stay small. Additive upgrades already ran a targeted
      // foreign_key_check; reuse only updates the receipt.
      if (writeMode === "fresh" || options.poisonAfterWrite) assertIntegrity(staging);
      else if (writeMode === "additive") assertBulgariaBiForeignKeys(staging);
      assertBulgariaBiFidelity(staging);
    } finally {
      staging.close();
    }

    if (options.failBeforeRename) throw new Error("Injected failure before rename");

    // Rebuilding derived rows and search postings rewrites the whole atlas.
    // The additive upgrade patches Bulgaria derived pointers in place.
    publishStaging(options.sqlitePath, { rebuildDerived: writeMode === "fresh" });

    const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    let publicationSet: { lineage_id: string; release_id: string }[] = [];
    try {
      if (writeMode === "fresh" || options.poisonAfterWrite) assertIntegrity(published);
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
      writeMode,
      counts: projection.validatedCounts,
    };
  } catch (error) {
    return finishFailure(error);
  } finally {
    releaseWriterLock(options.sqlitePath, lockFd);
  }
}

export function assertBulgariaBiFidelity(db: DatabaseSync): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [BULGARIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [BULGARIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BULGARIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BULGARIA_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [BULGARIA_LINEAGE],
  );
  const other = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [BULGARIA_LINEAGE]);
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [BULGARIA_LINEAGE],
  );
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [BULGARIA_LINEAGE],
  );
  if (offices !== EXPECTED_BI_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_BI_COUNTS.current_offices || historical !== EXPECTED_BI_COUNTS.historical_offices) {
    throw new Error(`current/historical ${current}/${historical}`);
  }
  if (events !== 0 || results !== 0 || sources !== 0 || dates !== 0) {
    throw new Error("Bulgaria BI slim land must publish 0 events, results, sources, and dates");
  }
  if (regional !== 0) throw new Error("regional elected offices must stay 0");
  if (municipal !== EXPECTED_BI_COUNTS.municipal_offices) throw new Error(`municipal ${municipal}`);
  if (national !== EXPECTED_BI_COUNTS.national_offices || other !== EXPECTED_BI_COUNTS.other_offices) {
    throw new Error(`national/other ${national}/${other}`);
  }
  if (needsReview !== EXPECTED_BI_COUNTS.needs_review_classifications || approved !== EXPECTED_BI_COUNTS.approved_classifications) {
    throw new Error(`review counts ${approved}/${needsReview}`);
  }
  const gradec = db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID);
  if (gradec) throw new Error("Градец hold was published");
  const mayor = db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = ?").get(SAMPLE_MAYOR_ID) as
    | { geography_id?: string; office_type?: string }
    | undefined;
  if (!mayor || mayor.geography_id !== geographyIdFor(SAMPLE_MAYOR_ID) || mayor.office_type !== "Mayor") {
    throw new Error("Preserved mayor identity drifted");
  }
  const council = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(SAMPLE_COUNCIL_ID) as
    | { office_type?: string }
    | undefined;
  if (!council || council.office_type !== "Municipal council") throw new Error("Preserved council identity drifted");
  for (const officeId of BI_DRAFT_OFFICE_IDS) {
    const row = db
      .prepare(
        `SELECT o.geography_id, o.office_status, t.review_status,
                json_extract(t.raw_json, '$.row.justin_approved') AS justin_approved,
                json_extract(t.raw_json, '$.row.applied') AS applied
         FROM office o
         JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
         WHERE o.office_id = ?`,
      )
      .get(officeId) as
      | { geography_id?: string; office_status?: string; review_status?: string; justin_approved?: number; applied?: number }
      | undefined;
    if (!row || row.review_status !== "needs_review" || row.geography_id !== COUNTRY_GEOGRAPHY_ID) {
      throw new Error(`Draft office ${officeId} must stay needs_review on the country geography`);
    }
    if (Number(row.justin_approved) !== 0 || Number(row.applied) !== 0) {
      throw new Error(`Draft office ${officeId} must stay justin_approved false and applied false`);
    }
  }
  const gna = db.prepare("SELECT office_status FROM office WHERE office_id = 'BG-GRAND-NATIONAL-ASSEMBLY-1990'").get() as
    | { office_status?: string }
    | undefined;
  if (!gna || gna.office_status !== "historical") throw new Error("Grand National Assembly must stay historical");
  const holds = countRows(db, "unresolved_evidence", "lineage_id = ?", [BULGARIA_LINEAGE]);
  if (holds !== OPEN_HOLD_IDS.length) throw new Error(`open hold count ${holds}`);
  for (const omitted of OMITTED_PATHS) {
    const row = db.prepare("SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(
      BULGARIA_LINEAGE,
      omitted,
    );
    if (row) throw new Error(`Omitted path ${omitted} was retained as an import input`);
  }
  const tier = db.prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(
    BULGARIA_LINEAGE,
    TIER_PATH,
  ) as { sha256?: string } | undefined;
  if (!tier || tier.sha256 !== BI_SCHEMA_TIER_SHA256) throw new Error("BI schema tier hash drifted");
}
