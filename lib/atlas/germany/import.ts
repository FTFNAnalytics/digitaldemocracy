import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BUNDESPRAESIDENT_ID,
  BUNDESTAG_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_STATUS,
  INHABITANTS_COUNCIL_IDS,
  LINEAGE_ID as GERMANY_LINEAGE,
  NAMED_HOLDS,
  OMITTED_RESEARCH_DIR,
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
import { GermanyPreflightError, scanGermanyInventory, type GermanyInventory } from "./inventory";
import { projectGermany, type GermanyProjection } from "./project";
import { writeGermanyProjection } from "./write";

export type ImportGermanyOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: GermanyProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportGermanyResult = {
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

export function importGermany(options: ImportGermanyOptions): ImportGermanyResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: GERMANY_LINEAGE,
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

    let inventory: GermanyInventory;
    try {
      inventory = scanGermanyInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof GermanyPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: GERMANY_LINEAGE,
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
      lineageId: GERMANY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Germany fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectGermany(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(GERMANY_LINEAGE, inventory.fingerprint);
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
      writeGermanyProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertGermanyFidelity(staging, projection);
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

export function assertGermanyFidelity(db: DatabaseSync, projection?: GermanyProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [GERMANY_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [GERMANY_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [GERMANY_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [GERMANY_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [GERMANY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [GERMANY_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [GERMANY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [GERMANY_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [GERMANY_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [GERMANY_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [GERMANY_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [GERMANY_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [GERMANY_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [GERMANY_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [GERMANY_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [GERMANY_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
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
  if (dates !== 0) throw new Error(`research dates ${dates}; calendar rows must not be invented`);
  if (countRows(db, "proceeding", "lineage_id = ?", [GERMANY_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [GERMANY_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [GERMANY_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      GERMANY_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Germany geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [GERMANY_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [GERMANY_LINEAGE]) !== 0) {
    throw new Error("Germany offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [GERMANY_LINEAGE]) !== 0) {
    throw new Error("Germany next dates must stay unknown");
  }

  for (const hold of NAMED_HOLDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.disposition') AS disposition,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(GERMANY_LINEAGE, hold.token) as { status?: unknown; disposition?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== HOLD_STATUS || String(row.disposition) !== hold.disposition || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${hold.token} must stay open with disposition ${hold.disposition}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'germany'")
    .get() as { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown } | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Germany country projection mismatch");
  }

  const bundestag = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(t.raw_json, '$.row.tier') AS numeric_tier, json_extract(t.raw_json, '$.row.review_status') AS file_status, json_extract(t.raw_json, '$.row.justin_approved') AS approved FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BUNDESTAG_ID) as Record<string, unknown> | undefined;
  if (
    !bundestag ||
    String(bundestag.office_type) !== "bundestag" ||
    String(bundestag.tier) !== "national_context" ||
    String(bundestag.review_status) !== "needs_review" ||
    Number(bundestag.numeric_tier) !== 1 ||
    String(bundestag.file_status) !== "draft_unapproved" ||
    Number(bundestag.approved) !== 0
  ) {
    throw new Error("Bundestag must stay numeric tier 1, needs_review, draft_unapproved");
  }

  const president = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.supplemental.selection_mode') AS selection_mode, json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BUNDESPRAESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "bundesprasident" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.selection_mode) !== "indirect_electoral_college" ||
    Number(president.direct_executive) !== 0
  ) {
    throw new Error("Bundespräsident must stay an indirect national_context office");
  }

  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID) as Record<string, unknown> | undefined;
  if (!ep || String(ep.office_type) !== "european_parliament_delegation" || String(ep.tier) !== "national_context" || String(ep.review_status) !== "needs_review") {
    throw new Error("Germany EP delegation must stay national_context/needs_review");
  }

  if (countRows(db, "office", "lineage_id = ? AND office_id LIKE '%BUNDESRAT%'", [GERMANY_LINEAGE]) !== 0) {
    throw new Error("No Bundesrat office may be invented");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_type IN ('minister_president','chancellor','bundesrat')", [GERMANY_LINEAGE]) !== 0) {
    throw new Error("No Land executive, Chancellor, or Bundesrat office may be invented");
  }
  if (
    countRows(db, "office", "lineage_id = ? AND (office_id LIKE 'DE-LANDRAT-01%' OR office_id LIKE 'DE-LANDRAT-08%')", [
      GERMANY_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("SH and BW Landräte must stay absent");
  }
  if (
    countRows(db, "office", "lineage_id = ? AND office_id LIKE 'DE-MAYOR-01%' AND office_id NOT LIKE 'DE-MAYOR-HIST-%'", [
      GERMANY_LINEAGE,
    ]) !== EXPECTED_COUNTS.schleswig_holstein_direct_mayors
  ) {
    throw new Error("Schleswig-Holstein direct mayors must stay the verified 86");
  }
  for (const id of INHABITANTS_COUNCIL_IDS) {
    const row = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(id) as
      | { office_type?: unknown; office_status?: unknown }
      | undefined;
    if (!row || String(row.office_type) !== "inhabitants_council" || String(row.office_status) !== "current") {
      throw new Error(`${id} must stay a current inhabitants council`);
    }
  }
  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'draft_unapproved'",
    [GERMANY_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay draft_unapproved");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 1) OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.tier') NOT IN (2, 3)) OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 4)
    )`,
    [GERMANY_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Numeric Germany tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(GERMANY_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim Germany fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(GERMANY_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Germany tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [GERMANY_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(GERMANY_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
  }
}
