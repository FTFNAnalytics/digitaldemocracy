import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
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
import { writeBulgariaProjection } from "./write";
import { BulgariaBiPreflightError, scanBulgariaBiInventory } from "./bi-inventory";
import { projectBulgariaPromptBi } from "./bi-project";
import type { BulgariaProjection } from "./project";
import {
  BI_DRAFT_OFFICE_IDS,
  BI_EXPECTED_COUNTS,
  BI_SCHEMA_TIER_SHA256,
  GRADEC_OFFICE_ID,
  HELD_EXAMPLE_OFFICE_IDS,
  LINEAGE_ID as BULGARIA_LINEAGE,
  TIER_PATH,
  geographyIdFor,
} from "./identity";

export type ImportBulgariaPromptBiOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  allowFixtures?: boolean;
};

export type ImportBulgariaPromptBiResult = {
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

export function importBulgariaPromptBi(options: ImportBulgariaPromptBiOptions): ImportBulgariaPromptBiResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BULGARIA_LINEAGE,
    intended_tier_path: TIER_PATH,
    prompt: "BI",
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

    let inventory;
    try {
      inventory = scanBulgariaBiInventory({ root: options.root });
      inventoryJson = {
        lineage_id: BULGARIA_LINEAGE,
        prompt: "BI",
        tier_path: TIER_PATH,
        tier_sha256: BI_SCHEMA_TIER_SHA256,
        inherited_offices: inventory.inheritedIds.length,
        draft_offices: inventory.draftIds.length,
        held_offices: inventory.holdIds.length,
        fingerprint: inventory.fingerprint,
      };
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

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBulgariaPromptBi(inventory);
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
      assertIntegrity(staging);
      assertBulgariaPromptBiFidelity(staging, projection);
    } finally {
      staging.close();
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

export function assertBulgariaPromptBiFidelity(db: DatabaseSync, projection?: BulgariaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [BULGARIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [BULGARIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [BULGARIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BULGARIA_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [BULGARIA_LINEAGE],
  );
  const other = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [BULGARIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BULGARIA_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [BULGARIA_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [BULGARIA_LINEAGE],
  );
  if (offices !== BI_EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== BI_EXPECTED_COUNTS.current_offices || historical !== BI_EXPECTED_COUNTS.historical_offices) {
    throw new Error(`office status ${current}/${historical}`);
  }
  if (events !== 0 || results !== 0 || sources !== 0) throw new Error(`BI slim publication imported ${events}/${results}/${sources}`);
  if (municipal !== 530 || national !== 3 || other !== 1 || regional !== 0) {
    throw new Error(`tier split ${municipal}/${national}/${other}/${regional}`);
  }
  if (approved !== 530 || needsReview !== 4) throw new Error(`review split ${approved}/${needsReview}`);

  const avren = db.prepare("SELECT geography_id, office_type, office_status, next_date_id FROM office WHERE office_id = 'BG-VAR01-M'").get();
  if (
    !avren ||
    String(avren.geography_id) !== geographyIdFor("BG-VAR01-M") ||
    String(avren.office_type) !== "Mayor" ||
    String(avren.office_status) !== "current" ||
    avren.next_date_id != null
  ) {
    throw new Error("Inherited Avren mayor identity drifted");
  }
  const gna = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = 'BG-GRAND-NATIONAL-ASSEMBLY-1990'",
    )
    .get();
  if (!gna || String(gna.office_status) !== "historical" || String(gna.tier) !== "national_context" || String(gna.review_status) !== "needs_review") {
    throw new Error("Grand National Assembly draft status drifted");
  }
  const ep = db
    .prepare(
      "SELECT t.tier, t.review_status, o.next_date_resolution FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = 'BG-EUROPEAN-PARLIAMENT'",
    )
    .get();
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review" || String(ep.next_date_resolution) !== "unknown") {
    throw new Error("European Parliament draft status drifted");
  }
  for (const officeId of BI_DRAFT_OFFICE_IDS) {
    const raw = db.prepare("SELECT raw_json FROM office_tier_classification WHERE office_id = ?").get(officeId) as
      | { raw_json?: string }
      | undefined;
    if (!raw?.raw_json) throw new Error(`Missing draft classification ${officeId}`);
    const parsed = JSON.parse(String(raw.raw_json)) as { row?: { justin_approved?: boolean; applied?: boolean } };
    if (parsed.row?.justin_approved !== false || parsed.row?.applied !== false) {
      throw new Error(`Draft ${officeId} flipped justin_approved or applied`);
    }
  }
  for (const officeId of [...HELD_EXAMPLE_OFFICE_IDS, GRADEC_OFFICE_ID]) {
    const row = db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(officeId);
    if (row) throw new Error(`Held office ${officeId} published`);
  }
  if (projection) {
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(BULGARIA_LINEAGE, TIER_PATH) as { sha256?: string; input_kind?: string } | undefined;
    if (!tierInput || tierInput.sha256 !== BI_SCHEMA_TIER_SHA256 || tierInput.input_kind !== "tier_classification") {
      throw new Error("BI schema tier retained-input hash mismatch");
    }
    if (countRows(db, "election_event", "lineage_id = ?", [BULGARIA_LINEAGE]) !== 0) {
      throw new Error("BI events were projected");
    }
  }
}
