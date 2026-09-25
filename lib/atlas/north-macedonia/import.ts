import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BRVENICA_MAYOR_ID,
  BRVENICA_NEXT_DATE_LABEL,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CLOSED_GAP_IDS,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GAP_STATUS,
  LINEAGE_ID as NORTH_MACEDONIA_LINEAGE,
  OMITTED_PACK_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  SKOPJE_PACK_GEOGRAPHY_ID,
  TIER_PATH,
  TIER_SHA256,
  geographyIdForPackId,
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
import { NorthMacedoniaPreflightError, scanNorthMacedoniaInventory, type NorthMacedoniaInventory } from "./inventory";
import { projectNorthMacedonia, type NorthMacedoniaProjection } from "./project";
import { writeNorthMacedoniaProjection } from "./write";

export type ImportNorthMacedoniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: NorthMacedoniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportNorthMacedoniaResult = {
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

export function importNorthMacedonia(options: ImportNorthMacedoniaOptions): ImportNorthMacedoniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: NORTH_MACEDONIA_LINEAGE,
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

    let inventory: NorthMacedoniaInventory;
    try {
      inventory = scanNorthMacedoniaInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof NorthMacedoniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: NORTH_MACEDONIA_LINEAGE,
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
      lineageId: NORTH_MACEDONIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `North Macedonia fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectNorthMacedonia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(NORTH_MACEDONIA_LINEAGE, inventory.fingerprint);
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
      writeNorthMacedoniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertNorthMacedoniaFidelity(staging, projection);
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

export function assertNorthMacedoniaFidelity(db: DatabaseSync, projection?: NorthMacedoniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [NORTH_MACEDONIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [NORTH_MACEDONIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [NORTH_MACEDONIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [NORTH_MACEDONIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [NORTH_MACEDONIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [NORTH_MACEDONIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [NORTH_MACEDONIA_LINEAGE]);
  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; publication must stay 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; publication must stay 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== 0) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (approved !== 0) throw new Error("approved classification count must stay 0");
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (countRows(db, "source", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== 0) throw new Error("omitted source extracts must not be invented");
  if (countRows(db, "unresolved_evidence", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== EXPECTED_COUNTS.unresolved_evidence) {
    throw new Error("unresolved hold count drifted");
  }
  if (countRows(db, "identity_crosswalk", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== 0) {
    throw new Error("North Macedonia successor edges must stay empty");
  }
  if (countRows(db, "research_date", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== 0) throw new Error("research dates must stay unprojected");
  if (countRows(db, "proceeding", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [NORTH_MACEDONIA_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [NORTH_MACEDONIA_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("North Macedonia offices must keep north-macedonia-research-az-v1");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [NORTH_MACEDONIA_LINEAGE]) !== 0) {
    throw new Error("North Macedonia next_date_id must stay null");
  }
  for (const rel of [OMITTED_RESEARCH_DIR, ...OMITTED_PACK_PATHS]) {
    if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [NORTH_MACEDONIA_LINEAGE, `${rel}%`]) !== 0) {
      throw new Error("omitted research bytes must not be a retained input");
    }
  }
  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(NORTH_MACEDONIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }
  for (const token of CLOSED_GAP_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(NORTH_MACEDONIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 1) {
      throw new Error(`Pack-resolved gap ${token} must stay closed as ${GAP_STATUS[token]}`);
    }
  }
  const country = db.prepare("SELECT country_code, name, coverage_status FROM country WHERE country_id = ?").get(COUNTRY_ID) as
    | { country_code?: unknown; name?: unknown; coverage_status?: unknown }
    | undefined;
  if (!country || String(country.country_code) !== COUNTRY_CODE || String(country.name) !== COUNTRY_NAME || String(country.coverage_status) !== "partial") {
    throw new Error("North Macedonia country projection mismatch");
  }
  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (!president || String(president.office_type) !== "president" || String(president.office_status) !== "current" || String(president.tier) !== "national_context" || String(president.review_status) !== "needs_review" || Number(president.direct_executive) !== 1) {
    throw new Error("The President must stay the current national direct executive");
  }
  const parliament = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(PARLIAMENT_ID) as
    | { office_type?: unknown; office_status?: unknown }
    | undefined;
  if (!parliament || String(parliament.office_type) !== "national_legislature" || String(parliament.office_status) !== "current") {
    throw new Error("Parliament drifted");
  }
  const brvenica = db
    .prepare("SELECT next_date_id, json_extract(raw_json, '$.row.next_date_label') AS next_date_label FROM office WHERE office_id = ?")
    .get(BRVENICA_MAYOR_ID) as { next_date_id?: unknown; next_date_label?: unknown } | undefined;
  if (!brvenica || brvenica.next_date_id != null || String(brvenica.next_date_label) !== BRVENICA_NEXT_DATE_LABEL) {
    throw new Error("The Brvenica next-date label must stay on the office and must not become an event");
  }
  const skopjeId = geographyIdForPackId(SKOPJE_PACK_GEOGRAPHY_ID);
  const aerodrom = db
    .prepare("SELECT parent_geography_id FROM geography WHERE country_id = ? AND name = 'Aerodrom'")
    .get(COUNTRY_ID) as { parent_geography_id?: unknown } | undefined;
  if (!aerodrom || String(aerodrom.parent_geography_id) !== skopjeId) {
    throw new Error("Skopje component geography must nest under the City of Skopje without an office-successor edge");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%-EP%' OR office_id LIKE 'EP-%' OR name LIKE '%European Parliament%' OR office_type LIKE '%european%')",
      [NORTH_MACEDONIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament office may be invented");
  }
  if (projection) {
    const coverage = db
      .prepare("SELECT research_coverage_complete, fingerprint_sha256 FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(NORTH_MACEDONIA_LINEAGE, projection.release.release_id) as
      | { research_coverage_complete?: unknown; fingerprint_sha256?: unknown }
      | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0 || String(coverage?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT) {
      throw new Error("research_coverage_complete must stay false and the fingerprint must stay pinned");
    }
    const tierInput = db.prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(NORTH_MACEDONIA_LINEAGE, TIER_PATH) as
      | { sha256?: unknown; input_kind?: unknown }
      | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("North Macedonia tier retained-input hash mismatch");
    }
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("North Macedonia slim import must not invent documented omitted totals");
    }
    if (String(projection.release.release_id) !== CANDIDATE_RELEASE_ID) throw new Error("release id drifted");
  }
}
