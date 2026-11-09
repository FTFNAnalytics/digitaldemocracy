import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ANDEAN_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  DEPUTIES_ID,
  EXPECTED_COUNTS,
  HISTORICAL_CONGRESS_ID,
  LINEAGE_ID as PERU_LINEAGE,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  SANGANI_COUNCIL_ID,
  SANGANI_GEOGRAPHY_ID,
  SANGANI_MAYOR_ID,
  SAMPLE_COUNCIL_ID,
  SAMPLE_GOVERNOR_ID,
  SAMPLE_REGION_GEOGRAPHY_ID,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
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
import { PeruPreflightError, scanPeruInventory, type PeruInventory } from "./inventory";
import { projectPeru, type PeruProjection } from "./project";
import { writePeruProjection } from "./write";

export type ImportPeruOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: PeruProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportPeruResult = {
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

export function importPeru(options: ImportPeruOptions): ImportPeruResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: PERU_LINEAGE,
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

    let inventory: PeruInventory;
    try {
      inventory = scanPeruInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof PeruPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: PERU_LINEAGE,
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
      lineageId: PERU_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Peru fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectPeru(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(PERU_LINEAGE, inventory.fingerprint);
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
      writePeruProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertPeruFidelity(staging, projection);
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

export function assertPeruFidelity(db: DatabaseSync, projection?: PeruProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [PERU_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [PERU_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [PERU_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [PERU_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [PERU_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [PERU_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [PERU_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [PERU_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [PERU_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [PERU_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [PERU_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [PERU_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [PERU_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [PERU_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; publication must stay 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; publication must stay 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.schema_regional) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== 0) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted sources must not be projected into source rows");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (countRows(db, "identity_crosswalk", "lineage_id = ?", [PERU_LINEAGE]) !== 0) {
    throw new Error("successor edge count must stay 0");
  }
  if (countRows(db, "research_date", "lineage_id = ?", [PERU_LINEAGE]) !== 0) {
    throw new Error("calendar labels must not be coerced into research dates");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [PERU_LINEAGE]) !== 0) {
    throw new Error("Peru next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [PERU_LINEAGE]) !== 0) {
    throw new Error("Peru offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [PERU_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Peru offices must keep peru-research-bk-v1");
  }
  if (countRows(db, "geography", "lineage_id = ? AND parent_geography_id IS NOT NULL", [PERU_LINEAGE]) !== 0) {
    throw new Error("Peru geographies must not gain invented parents");
  }
  for (const rel of OMITTED_PATHS) {
    if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [PERU_LINEAGE, rel]) !== 0) {
      throw new Error(`omitted path ${rel} must not be a retained input`);
    }
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(PERU_LINEAGE, token) as { closed?: unknown } | undefined;
    if (!row || Number(row.closed) !== 0) throw new Error(`Named hold ${token} must stay open`);
  }
  const g17 = db
    .prepare(
      `SELECT json_extract(raw_json, '$.row.status') AS status
       FROM unresolved_evidence WHERE lineage_id = ? AND original_token = 'BK-G17'`,
    )
    .get(PERU_LINEAGE) as { status?: unknown } | undefined;
  if (String(g17?.status) !== "open_transcription_hold") throw new Error("BK-G17 must stay an open transcription hold");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name, lineage_id FROM country WHERE country_id = 'peru'")
    .get() as Record<string, unknown> | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "americas" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME ||
    String(country.lineage_id) !== PERU_LINEAGE
  ) {
    throw new Error("Peru country projection mismatch");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.geography_id, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.review_status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(t.raw_json, '$.row.draft_tier') AS draft_tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "presidential_ticket" ||
    String(president.office_status) !== "current" ||
    String(president.geography_id) !== COUNTRY_GEOGRAPHY_ID ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.file_status) !== "needs_review" ||
    String(president.draft_tier) !== "national_context" ||
    Number(president.approved) !== 0
  ) {
    throw new Error("The presidential ticket must stay draft tier national_context and needs_review");
  }

  const governor = db
    .prepare("SELECT office_type, geography_id FROM office WHERE office_id = ?")
    .get(SAMPLE_GOVERNOR_ID) as Record<string, unknown> | undefined;
  const council = db
    .prepare("SELECT office_type, geography_id FROM office WHERE office_id = ?")
    .get(SAMPLE_COUNCIL_ID) as Record<string, unknown> | undefined;
  if (
    !governor ||
    !council ||
    String(governor.office_type) !== "regional_executive_ticket" ||
    String(council.office_type) !== "regional_council" ||
    String(governor.geography_id) !== SAMPLE_REGION_GEOGRAPHY_ID ||
    String(governor.geography_id) !== String(council.geography_id)
  ) {
    throw new Error("Amazonas governor and council must stay separate regional offices on one geography");
  }

  const sangani = db
    .prepare(
      `SELECT office_id, geography_id, json_extract(raw_json, '$.supplemental.disposition') AS disposition
       FROM office WHERE office_id IN (?, ?) ORDER BY office_id`,
    )
    .all(SANGANI_COUNCIL_ID, SANGANI_MAYOR_ID) as Array<Record<string, unknown>>;
  if (
    sangani.length !== 2 ||
    sangani.some((row) => String(row.geography_id) !== SANGANI_GEOGRAPHY_ID || String(row.disposition) !== "hold")
  ) {
    throw new Error("Sangani mayor and council must stay held on ubigeo 120307");
  }

  const congress = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_CONGRESS_ID) as
    | Record<string, unknown>
    | undefined;
  if (!congress || String(congress.office_status) !== "historical" || String(congress.office_type) !== "historical_unicameral_congress") {
    throw new Error("The unicameral congress must stay historical");
  }
  const senate = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(SENATE_ID) as
    | Record<string, unknown>
    | undefined;
  const deputies = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(DEPUTIES_ID) as
    | Record<string, unknown>
    | undefined;
  if (!senate || String(senate.office_type) !== "senate" || String(senate.office_status) !== "current") {
    throw new Error("The Senate must stay a current national chamber");
  }
  if (!deputies || String(deputies.office_type) !== "chamber_of_deputies" || String(deputies.office_status) !== "current") {
    throw new Error("The Chamber of Deputies must stay a current national chamber");
  }
  const andean = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(ANDEAN_ID) as
    | Record<string, unknown>
    | undefined;
  if (!andean || String(andean.office_type) !== "andean_delegation" || String(andean.office_status) !== "current") {
    throw new Error("Parlamento Andino must stay one current delegation");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (name LIKE '%Centro Poblado%' OR name LIKE '%Centros Poblados%' OR office_type LIKE '%centro_poblado%' OR name LIKE '%MERCOSUR%' OR name LIKE '%European Parliament%')",
      [PERU_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No centros poblados, MERCOSUR, or European Parliament office may be published");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [PERU_LINEAGE, UPCOMING_CALENDAR_RELATIVE]) !== 1) {
    throw new Error("Upcoming calendar bytes must stay a retained documentary input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [PERU_LINEAGE, TIER_PATH]) !== 1) {
    throw new Error("Peru tier file must stay a retained input");
  }
  const tierInput = db
    .prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?")
    .get(PERU_LINEAGE, TIER_PATH) as { sha256?: unknown } | undefined;
  if (String(tierInput?.sha256) !== TIER_SHA256) throw new Error("Peru tier retained-input hash mismatch");

  if (projection) {
    if (projection.validatedCounts.applied_calendar_rows !== 0 || projection.validatedCounts.result_rows !== 0) {
      throw new Error("Peru import must not apply calendar rows or publish results");
    }
    if (projection.validatedCounts.documented_result_rows_omitted != null) {
      throw new Error("Peru import must not invent documented omitted totals");
    }
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(PERU_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
  }
}
