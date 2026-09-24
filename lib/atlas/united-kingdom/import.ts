import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COMMONS_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_IDS,
  HOLD_STATUS,
  LINEAGE_ID as UNITED_KINGDOM_LINEAGE,
  LONDON_ASSEMBLY_ID,
  LONDON_MAYOR_ID,
  OMITTED_RESEARCH_DIR,
  SCILLY_COUNCIL_ID,
  SCILLY_NEXT_DATE,
  SHADOW_EAST_ID,
  SHADOW_WEST_ID,
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
import { UnitedKingdomPreflightError, scanUnitedKingdomInventory, type UnitedKingdomInventory } from "./inventory";
import { projectUnitedKingdom, type UnitedKingdomProjection } from "./project";
import { writeUnitedKingdomProjection } from "./write";

export type ImportUnitedKingdomOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: UnitedKingdomProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportUnitedKingdomResult = {
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

export function importUnitedKingdom(options: ImportUnitedKingdomOptions): ImportUnitedKingdomResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: UNITED_KINGDOM_LINEAGE,
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

    let inventory: UnitedKingdomInventory;
    try {
      inventory = scanUnitedKingdomInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof UnitedKingdomPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: UNITED_KINGDOM_LINEAGE,
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
      lineageId: UNITED_KINGDOM_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim United Kingdom fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectUnitedKingdom(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(UNITED_KINGDOM_LINEAGE, inventory.fingerprint);
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
      writeUnitedKingdomProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertUnitedKingdomFidelity(staging, projection);
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

export function assertUnitedKingdomFidelity(db: DatabaseSync, projection?: UnitedKingdomProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const sqlCurrent = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [UNITED_KINGDOM_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [UNITED_KINGDOM_LINEAGE]);
  const shadow = countRows(db, "office", "lineage_id = ? AND state_note = 'current_shadow'", [UNITED_KINGDOM_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [UNITED_KINGDOM_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [UNITED_KINGDOM_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [UNITED_KINGDOM_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [UNITED_KINGDOM_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [UNITED_KINGDOM_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [UNITED_KINGDOM_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (sqlCurrent !== EXPECTED_COUNTS.current_offices + EXPECTED_COUNTS.current_shadow_offices) {
    throw new Error(`sql current office count ${sqlCurrent}`);
  }
  if (shadow !== EXPECTED_COUNTS.current_shadow_offices) throw new Error(`current_shadow count ${shadow}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; slim land must publish 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; slim land must publish 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.schema_regional) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== 0) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted sources must not be invented");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; office continuity stays unasserted`);
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`research dates ${dates}`);
  if (countRows(db, "proceeding", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      UNITED_KINGDOM_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("United Kingdom geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [UNITED_KINGDOM_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [UNITED_KINGDOM_LINEAGE]) !== 0) {
    throw new Error("United Kingdom offices must not gain prospective history keys");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND next_date_resolution != 'unknown' AND office_id != ?",
      [UNITED_KINGDOM_LINEAGE, SCILLY_COUNCIL_ID],
    ) !== 0
  ) {
    throw new Error("Only the explicit Isles of Scilly next date may be resolved");
  }

  for (const token of HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(UNITED_KINGDOM_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== HOLD_STATUS || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'united-kingdom'")
    .get() as { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown } | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("United Kingdom country projection mismatch");
  }

  const commons = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, t.review_status, json_extract(t.raw_json, '$.row.draft_tier') AS numeric_tier, json_extract(t.raw_json, '$.row.review_status') AS file_status, json_extract(t.raw_json, '$.row.justin_approved') AS approved FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(COMMONS_ID) as Record<string, unknown> | undefined;
  if (
    !commons ||
    String(commons.office_type) !== "national_lower_chamber" ||
    String(commons.office_status) !== "current" ||
    String(commons.tier) !== "national_context" ||
    String(commons.review_status) !== "needs_review" ||
    Number(commons.numeric_tier) !== 1 ||
    String(commons.file_status) !== "draft_unapproved" ||
    Number(commons.approved) !== 0
  ) {
    throw new Error("Commons must stay numeric tier 1, needs_review, draft_unapproved");
  }

  const ep = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID) as Record<string, unknown> | undefined;
  if (
    !ep ||
    String(ep.office_type) !== "historical_european_parliament_delegation" ||
    String(ep.office_status) !== "historical" ||
    String(ep.tier) !== "national_context" ||
    String(ep.review_status) !== "needs_review"
  ) {
    throw new Error("UK EP delegation must stay historical national_context/needs_review");
  }

  const londonMayor = db
    .prepare("SELECT office_type, office_status FROM office WHERE office_id = ?")
    .get(LONDON_MAYOR_ID) as { office_type?: unknown; office_status?: unknown } | undefined;
  if (!londonMayor || String(londonMayor.office_type) !== "direct_london_mayor" || String(londonMayor.office_status) !== "current") {
    throw new Error("Mayor of London must stay a current direct office");
  }
  const assembly = db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(LONDON_ASSEMBLY_ID) as
    | { tier?: unknown; review_status?: unknown }
    | undefined;
  if (!assembly || String(assembly.tier) !== "regional" || String(assembly.review_status) !== "needs_review") {
    throw new Error("London Assembly must stay regional/needs_review");
  }

  for (const id of [SHADOW_EAST_ID, SHADOW_WEST_ID]) {
    const row = db
      .prepare("SELECT office_status, state_note, office_type FROM office WHERE office_id = ?")
      .get(id) as { office_status?: unknown; state_note?: unknown; office_type?: unknown } | undefined;
    if (!row || String(row.office_status) !== "current" || String(row.state_note) !== "current_shadow" || String(row.office_type) !== "shadow_unitary_council") {
      throw new Error(`${id} must stay a current_shadow unitary authority`);
    }
  }

  const scilly = db
    .prepare(
      "SELECT o.next_date_resolution, d.label, d.precision, d.certainty FROM office o JOIN research_date d ON d.date_id = o.next_date_id WHERE o.office_id = ?",
    )
    .get(SCILLY_COUNCIL_ID) as { next_date_resolution?: unknown; label?: unknown; precision?: unknown; certainty?: unknown } | undefined;
  if (
    !scilly ||
    String(scilly.next_date_resolution) !== "resolved" ||
    String(scilly.label) !== SCILLY_NEXT_DATE ||
    String(scilly.precision) !== "day" ||
    String(scilly.certainty) !== "called"
  ) {
    throw new Error("Isles of Scilly next date must stay the explicit 2029-05-03 statement");
  }

  if (countRows(db, "office", "lineage_id = ? AND (office_id LIKE '%LORDS%' OR office_type LIKE '%prime_minister%' OR name LIKE '%Prime Minister%')", [UNITED_KINGDOM_LINEAGE]) !== 0) {
    throw new Error("No Lords or Prime Minister office may be invented");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_status = 'current' AND office_type LIKE '%european_parliament%'", [UNITED_KINGDOM_LINEAGE]) !== 0) {
    throw new Error("No current EP office may be invented");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'draft_unapproved'",
    [UNITED_KINGDOM_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay draft_unapproved");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.draft_tier') != 1) OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.draft_tier') NOT IN (2, 3)) OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.draft_tier') != 4)
    )`,
    [UNITED_KINGDOM_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Numeric United Kingdom tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(UNITED_KINGDOM_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim United Kingdom fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(UNITED_KINGDOM_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("United Kingdom tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [UNITED_KINGDOM_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(UNITED_KINGDOM_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null
    ) {
      throw new Error("United Kingdom slim import must not invent documented omitted totals");
    }
  }
}
