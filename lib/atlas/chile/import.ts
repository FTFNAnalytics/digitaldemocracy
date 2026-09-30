import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  DEPUTIES_ID,
  EXPECTED_COUNTS,
  GAP_STATUS,
  HISTORICAL_CONVENTION_ID,
  HISTORICAL_COUNCIL_ID,
  LINEAGE_ID as CHILE_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  SAMPLE_CORE_ID,
  SAMPLE_GOVERNOR_ID,
  SENATE_ID,
  SHARED_COUNCIL_ID,
  SHARED_GEOGRAPHY_ID,
  SHARED_MAYOR_ID,
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
import { ChilePreflightError, scanChileInventory, type ChileInventory } from "./inventory";
import { projectChile, type ChileProjection } from "./project";
import { writeChileProjection } from "./write";

export type ImportChileOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: ChileProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportChileResult = {
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

export function importChile(options: ImportChileOptions): ImportChileResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: CHILE_LINEAGE,
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

    let inventory: ChileInventory;
    try {
      inventory = scanChileInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof ChilePreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: CHILE_LINEAGE,
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
      lineageId: CHILE_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Chile fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectChile(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(CHILE_LINEAGE, inventory.fingerprint);
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
      writeChileProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertChileFidelity(staging, projection);
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

export function assertChileFidelity(db: DatabaseSync, projection?: ChileProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [CHILE_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [CHILE_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [CHILE_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [CHILE_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [CHILE_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [CHILE_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [CHILE_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [CHILE_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [CHILE_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [CHILE_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [CHILE_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [CHILE_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [CHILE_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [CHILE_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [CHILE_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [CHILE_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; publication must stay 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; publication must stay 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.schema_regional) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.schema_other) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted sources must not be projected into source rows");
  if (countRows(db, "source", "country_id = 'chile'") !== 0) throw new Error("Chile must publish 0 sources, including stub catalogue rows");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; no successor edge is imported`);
  if (dates !== 0) throw new Error(`research dates ${dates}; calendar labels must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [CHILE_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [CHILE_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [CHILE_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (countRows(db, "geography", "lineage_id = ? AND parent_geography_id IS NOT NULL", [CHILE_LINEAGE]) !== 0) {
    throw new Error("Chile geographies must not gain invented parents");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      CHILE_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Chile geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [CHILE_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [CHILE_LINEAGE]) !== 0) {
    throw new Error("Chile offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [CHILE_LINEAGE]) !== 0) {
    throw new Error("Chile offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [CHILE_LINEAGE]) !== 0) {
    throw new Error("Chile next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [CHILE_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Chile offices must keep chile-research-bj-v1");
  }
  if (countRows(db, "office", "lineage_id = ? AND registry_qualified != 0", [CHILE_LINEAGE]) !== 0) {
    throw new Error("Chile offices must stay registry-unqualified");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(CHILE_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name, lineage_id FROM country WHERE country_id = 'chile'")
    .get() as
    | {
        country_code?: unknown;
        polity_kind?: unknown;
        region_id?: unknown;
        coverage_status?: unknown;
        name?: unknown;
        lineage_id?: unknown;
      }
    | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "americas" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME ||
    String(country.lineage_id) !== CHILE_LINEAGE
  ) {
    throw new Error("Chile country projection mismatch");
  }
  if (countRows(db, "country", "country_id = 'chile' AND coverage_status = 'screened_out'") !== 0) {
    throw new Error("Chile screened_out stub must be cleared");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, o.geography_id, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(t.raw_json, '$.row.applied') AS applied
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.office_status) !== "current" ||
    String(president.id_namespace) !== CURRENT_NAMESPACE ||
    String(president.geography_id) !== COUNTRY_GEOGRAPHY_ID ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.draft_tier) !== "national_context" ||
    String(president.file_status) !== "draft_unapproved" ||
    Number(president.approved) !== 0 ||
    Number(president.applied) !== 0
  ) {
    throw new Error("The president must stay draft tier national_context, needs_review, and unapplied");
  }

  const governor = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.geography_id, t.tier, t.review_status
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SAMPLE_GOVERNOR_ID) as Record<string, unknown> | undefined;
  const core = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.geography_id, t.tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SAMPLE_CORE_ID) as Record<string, unknown> | undefined;
  if (
    !governor ||
    !core ||
    String(governor.office_type) !== "regional_governor" ||
    String(core.office_type) !== "regional_council" ||
    String(governor.tier) !== "regional" ||
    String(core.tier) !== "regional" ||
    String(governor.geography_id) !== String(core.geography_id) ||
    String(governor.review_status) !== "needs_review"
  ) {
    throw new Error("Tarapacá governor and CORE must stay separate regional offices on one geography");
  }

  const pair = db
    .prepare("SELECT office_id, geography_id, office_type FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(SHARED_COUNCIL_ID, SHARED_MAYOR_ID) as Array<{ geography_id?: unknown; office_type?: unknown }>;
  if (
    pair.length !== 2 ||
    String(pair[0]?.geography_id) !== SHARED_GEOGRAPHY_ID ||
    String(pair[0]?.geography_id) !== String(pair[1]?.geography_id) ||
    String(pair[0]?.office_type) !== "municipal_council" ||
    String(pair[1]?.office_type) !== "municipal_mayor"
  ) {
    throw new Error("Cabo de Hornos council and mayor must stay separate offices on one geography");
  }
  if (countRows(db, "office", "office_id LIKE '%antartica%' OR geography_id LIKE '%antartica%'") !== 0) {
    throw new Error("Antártica must not gain a second mayor or council");
  }

  const deputies = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(DEPUTIES_ID) as
    | Record<string, unknown>
    | undefined;
  const senate = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(SENATE_ID) as
    | Record<string, unknown>
    | undefined;
  if (!deputies || String(deputies.office_type) !== "chamber_of_deputies" || String(deputies.office_status) !== "current") {
    throw new Error("The Chamber of Deputies must stay a current national chamber");
  }
  if (!senate || String(senate.office_type) !== "senate" || String(senate.office_status) !== "current") {
    throw new Error("The Senate must stay a current national chamber");
  }

  const convention = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(HISTORICAL_CONVENTION_ID) as Record<string, unknown> | undefined;
  const council = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(HISTORICAL_COUNCIL_ID) as Record<string, unknown> | undefined;
  if (!convention || String(convention.office_status) !== "historical" || String(convention.office_type) !== "historical_constitutional_convention") {
    throw new Error("The 2021 convention must stay a historical extraordinary office");
  }
  if (!council || String(council.office_status) !== "historical" || String(council.office_type) !== "historical_constitutional_council") {
    throw new Error("The 2023 constitutional council must stay a historical extraordinary office");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%european%' OR name LIKE '%European Parliament%' OR name LIKE '%MERCOSUR%' OR name LIKE '%MERCOSUL%' OR name LIKE '%Andean%' OR name LIKE '%intendente%' OR office_type LIKE '%intendente%')",
      [CHILE_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament, MERCOSUR, Andean, or intendente office may be published");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      json_extract(raw_json, '$.row.tier') != json_extract(raw_json, '$.row.draft_tier') OR
      json_extract(raw_json, '$.row.status') != 'draft_unapproved' OR
      json_extract(raw_json, '$.row.justin_approved') != 0 OR
      json_extract(raw_json, '$.row.applied') != 0 OR
      review_status != 'needs_review'
    )`,
    [CHILE_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Draft Chile tiers must stay needs_review and unapproved");

  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [CHILE_LINEAGE, UPCOMING_CALENDAR_RELATIVE]) !== 1) {
    throw new Error("Upcoming calendar bytes must stay a retained documentary input");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(CHILE_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (
      parsed.adapter_version !== hashes?.adapter_version ||
      parsed.method_version !== hashes?.method_version ||
      parsed.schema_version !== hashes?.schema_version
    ) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT || String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Chile fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(CHILE_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Chile tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [CHILE_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(CHILE_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Chile import must not invent documented omitted totals");
    }
    if (projection.validatedCounts.applied_calendar_rows !== 0) {
      throw new Error("Chile import must not apply calendar rows");
    }
  }
}
