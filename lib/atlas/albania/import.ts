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
  DIMAL_COUNCIL_ID,
  DIMAL_MAYOR_ID,
  EXPECTED_COUNTS,
  GAP_STATUS,
  LINEAGE_ID as ALBANIA_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PHASE1_APPROVED_TIER_PATH,
  PHASE1_APPROVED_TIER_SHA256,
  PHASE1_PACKAGE_PREFIX,
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
import { AlbaniaPreflightError, scanAlbaniaInventory, type AlbaniaInventory } from "./inventory";
import { projectAlbania, type AlbaniaProjection } from "./project";
import { writeAlbaniaProjection } from "./write";

export type ImportAlbaniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
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
    lineage_id: ALBANIA_LINEAGE,
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

    let inventory: AlbaniaInventory;
    try {
      inventory = scanAlbaniaInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof AlbaniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ALBANIA_LINEAGE,
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
      lineageId: ALBANIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Albania fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

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
          .get(ALBANIA_LINEAGE, inventory.fingerprint);
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

export function assertAlbaniaFidelity(db: DatabaseSync, projection?: AlbaniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [ALBANIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [ALBANIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ALBANIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ALBANIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [ALBANIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ALBANIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [ALBANIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [ALBANIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [ALBANIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ALBANIA_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; slim land must publish 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; slim land must publish 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== 0) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.schema_other) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted source extracts must not be invented");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; identity crosswalk stays documentary`);
  if (dates !== 0) throw new Error(`research dates ${dates}; null next dates must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [ALBANIA_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [ALBANIA_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [ALBANIA_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      ALBANIA_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Albania geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [ALBANIA_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [ALBANIA_LINEAGE, `${PHASE1_PACKAGE_PREFIX}%`]) !== 0) {
    throw new Error("The Phase 1 country package must not be the publish source");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [ALBANIA_LINEAGE]) !== 0) {
    throw new Error("Albania offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [ALBANIA_LINEAGE]) !== 0) {
    throw new Error("Albania offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [ALBANIA_LINEAGE]) !== 0) {
    throw new Error("Albania next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [ALBANIA_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Albania offices must keep cdd-observatory-v1");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(ALBANIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'albania'")
    .get() as
    | { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown }
    | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Albania country projection mismatch");
  }

  const assembly = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.review_status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(ASSEMBLY_ID) as Record<string, unknown> | undefined;
  if (
    !assembly ||
    String(assembly.office_type) !== "national_legislature" ||
    String(assembly.office_status) !== "current" ||
    String(assembly.id_namespace) !== CURRENT_NAMESPACE ||
    String(assembly.tier) !== "national_context" ||
    String(assembly.review_status) !== "needs_review" ||
    String(assembly.draft_tier) !== "national" ||
    String(assembly.file_status) !== "draft_unapproved" ||
    Number(assembly.approved) !== 0 ||
    Number(assembly.direct_executive) !== 0
  ) {
    throw new Error("The Assembly must stay draft tier national, needs_review, and not a direct executive");
  }

  for (const officeId of [DIMAL_MAYOR_ID, DIMAL_COUNCIL_ID]) {
    const dimal = db
      .prepare("SELECT name, office_status FROM office WHERE office_id = ?")
      .get(officeId) as { name?: unknown; office_status?: unknown } | undefined;
    if (!dimal || String(dimal.office_status) !== "current" || !String(dimal.name).includes("Dimal")) {
      throw new Error(`${officeId} must stay the current Dimal office`);
    }
  }

  const belsh = db
    .prepare("SELECT geography_id, office_type, office_status FROM office WHERE office_id = 'AL-13-M'")
    .get() as { geography_id?: unknown; office_type?: unknown; office_status?: unknown } | undefined;
  if (
    !belsh ||
    String(belsh.geography_id) !== "geo-99a7b8d0e325a448c5e7c7ca" ||
    String(belsh.office_type) !== "mayor" ||
    String(belsh.office_status) !== "current"
  ) {
    throw new Error("AL-13-M must keep the frozen Belsh mayor geography id");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%-EP%' OR office_id LIKE 'EP-%' OR name LIKE '%European Parliament%' OR office_type LIKE '%european%' OR name LIKE '%President%' OR name LIKE '%Prefekt%' OR name LIKE '%Qark%')",
      [ALBANIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament, popular president, qark, or prefect office may be invented");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'draft_unapproved'",
    [ALBANIA_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay draft_unapproved");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'municipal') OR
      (tier = 'other' AND json_extract(raw_json, '$.row.tier') != 'other')
    )`,
    [ALBANIA_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Albania draft tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ALBANIA_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim Albania fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(ALBANIA_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Albania tier retained-input hash mismatch");
    }
    const phase1 = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(ALBANIA_LINEAGE, PHASE1_APPROVED_TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!phase1 || String(phase1.sha256) !== PHASE1_APPROVED_TIER_SHA256 || String(phase1.input_kind) !== "package") {
      throw new Error("Phase 1 approved tiers must stay a documentary retained input");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ALBANIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(ALBANIA_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    const countryRaw = db.prepare("SELECT raw_json FROM country WHERE country_id = 'albania'").get() as
      | { raw_json?: unknown }
      | undefined;
    const supplemental = JSON.parse(String(countryRaw?.raw_json))?.supplemental;
    if (
      supplemental?.phase1_offices_published_as_live_register !== false ||
      supplemental?.phase1_result_rows_imported !== 0 ||
      supplemental?.identity_crosswalk_imported_as_edges !== false ||
      supplemental?.successor_edges !== 0
    ) {
      throw new Error("Phase 1 continuity must stay documentary and must not import result rows or successor edges");
    }
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Albania slim import must not invent documented omitted totals");
    }
  }
}
