import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GAP_STATUS,
  LINEAGE_ID as SERBIA_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  STATUS_CHANGE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  VOJVODINA_ID,
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
import { SerbiaPreflightError, scanSerbiaInventory, type SerbiaInventory } from "./inventory";
import { projectSerbia, type SerbiaProjection } from "./project";
import { writeSerbiaProjection } from "./write";

export type ImportSerbiaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: SerbiaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportSerbiaResult = {
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

export function importSerbia(options: ImportSerbiaOptions): ImportSerbiaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: SERBIA_LINEAGE,
    intended_tier_path: options.tierPath ?? TIER_PATH,
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

    let inventory: SerbiaInventory;
    try {
      inventory = scanSerbiaInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof SerbiaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: SERBIA_LINEAGE,
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
      lineageId: SERBIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Serbia fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectSerbia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(SERBIA_LINEAGE, inventory.fingerprint);
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
      writeSerbiaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertSerbiaFidelity(staging, projection);
    } finally {
      staging.close();
    }

    if (options.failBeforeRename) throw new Error("Injected failure before rename");

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

export function assertSerbiaFidelity(db: DatabaseSync, projection?: SerbiaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [SERBIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [SERBIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [SERBIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [SERBIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [SERBIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [SERBIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [SERBIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [SERBIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [SERBIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [SERBIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [SERBIA_LINEAGE]);
  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; publication must stay 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; publication must stay 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.schema_regional) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (approved !== 0) throw new Error("approved classification count must stay 0");
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (countRows(db, "source", "lineage_id = ?", [SERBIA_LINEAGE]) !== 0) throw new Error("source extracts must not be projected");
  if (countRows(db, "unresolved_evidence", "lineage_id = ?", [SERBIA_LINEAGE]) !== EXPECTED_COUNTS.unresolved_evidence) {
    throw new Error("unresolved hold count drifted");
  }
  if (countRows(db, "identity_crosswalk", "lineage_id = ?", [SERBIA_LINEAGE]) !== EXPECTED_COUNTS.explicit_predecessor_edges) {
    throw new Error("status-change edge count drifted");
  }
  if (countRows(db, "identity_crosswalk", "lineage_id = ? AND upstream_namespace != ?", [SERBIA_LINEAGE, STATUS_CHANGE_NAMESPACE]) !== 0) {
    throw new Error("Serbia edges must stay same-territory status changes");
  }
  if (countRows(db, "research_date", "lineage_id = ?", [SERBIA_LINEAGE]) !== 0) throw new Error("research dates must stay unprojected");
  if (countRows(db, "proceeding", "lineage_id = ?", [SERBIA_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [SERBIA_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [SERBIA_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Serbia offices must keep serbia-research-ax-v1");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [SERBIA_LINEAGE]) !== 0) {
    throw new Error("Serbia next_date_id must stay null");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [SERBIA_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("a parallel research tree must not be a retained input");
  }
  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(SERBIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }
  const country = db.prepare("SELECT country_code, name, coverage_status FROM country WHERE country_id = 'serbia'").get() as
    | { country_code?: unknown; name?: unknown; coverage_status?: unknown }
    | undefined;
  if (!country || String(country.country_code) !== COUNTRY_CODE || String(country.name) !== COUNTRY_NAME || String(country.coverage_status) !== "partial") {
    throw new Error("Serbia country projection mismatch");
  }
  const vojvodina = db
    .prepare(
      `SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(VOJVODINA_ID) as Record<string, unknown> | undefined;
  if (!vojvodina || String(vojvodina.office_type) !== "provincial_assembly" || String(vojvodina.tier) !== "regional" || String(vojvodina.review_status) !== "needs_review" || Number(vojvodina.direct_executive) !== 0) {
    throw new Error("Vojvodina must stay the regional assembly and not a direct executive");
  }
  const president = db
    .prepare("SELECT office_type, office_status FROM office WHERE office_id = ?")
    .get(PRESIDENT_ID) as { office_type?: unknown; office_status?: unknown } | undefined;
  if (!president || String(president.office_type) !== "president" || String(president.office_status) !== "current") {
    throw new Error("The President must stay current");
  }
  const assembly = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(ASSEMBLY_ID) as { office_type?: unknown } | undefined;
  if (!assembly || String(assembly.office_type) !== "national_assembly") throw new Error("The National Assembly drifted");
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (name LIKE '%Kosov%' OR name LIKE '%Metohij%' OR office_id LIKE '%KOSOV%' OR office_id LIKE '%-EP%' OR office_id LIKE 'EP-%' OR name LIKE '%European Parliament%' OR office_type LIKE '%european%')",
      [SERBIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No Kosovo-scope or European Parliament office may be invented");
  }
  if (projection) {
    const coverage = db
      .prepare("SELECT research_coverage_complete, fingerprint_sha256 FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(SERBIA_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown; fingerprint_sha256?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0 || String(coverage?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT) {
      throw new Error("research_coverage_complete must stay false and the fingerprint must stay pinned");
    }
    const tierInput = db.prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(SERBIA_LINEAGE, TIER_PATH) as
      | { sha256?: unknown; input_kind?: unknown }
      | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Serbia tier retained-input hash mismatch");
    }
    if (projection.validatedCounts.documented_result_rows_omitted != null || projection.validatedCounts.documented_event_rows_omitted != null) {
      throw new Error("Serbia import must not invent documented omitted totals");
    }
    if (String(projection.release.release_id) !== CANDIDATE_RELEASE_ID) throw new Error("release id drifted");
  }
}

