import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ALTHINGI_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CLOSED_GAP_IDS,
  COUNTRY_CODE,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GAP_STATUS,
  HISTORICAL_NAMESPACE,
  LINEAGE_ID as ICELAND_LINEAGE,
  MERGER_UPSTREAM_NAMESPACE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
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
import { IcelandPreflightError, scanIcelandInventory, type IcelandInventory } from "./inventory";
import { projectIceland, type IcelandProjection } from "./project";
import { writeIcelandProjection } from "./write";

export type ImportIcelandOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: IcelandProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportIcelandResult = {
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

export function importIceland(options: ImportIcelandOptions): ImportIcelandResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ICELAND_LINEAGE,
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

    let inventory: IcelandInventory;
    try {
      inventory = scanIcelandInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof IcelandPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ICELAND_LINEAGE,
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
      lineageId: ICELAND_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Iceland fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectIceland(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ICELAND_LINEAGE, inventory.fingerprint);
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
      writeIcelandProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertIcelandFidelity(staging, projection);
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

export function assertIcelandFidelity(db: DatabaseSync, projection?: IcelandProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ICELAND_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [ICELAND_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [ICELAND_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ICELAND_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [ICELAND_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ICELAND_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ICELAND_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ICELAND_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [ICELAND_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ICELAND_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [ICELAND_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [ICELAND_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ICELAND_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ICELAND_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [ICELAND_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ICELAND_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; slim land must publish 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; slim land must publish 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== 0) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== 0) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted source extracts must not be invented");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== EXPECTED_COUNTS.explicit_predecessor_edges) {
    throw new Error(`successor edge count ${crosswalks}; only documented identity-crosswalk edges are published`);
  }
  if (dates !== 0) throw new Error(`research dates ${dates}; supplied next-date labels must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [ICELAND_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [ICELAND_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [ICELAND_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      ICELAND_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Iceland geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [ICELAND_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [ICELAND_LINEAGE]) !== 0) {
    throw new Error("Iceland offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [ICELAND_LINEAGE]) !== 0) {
    throw new Error("Iceland offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [ICELAND_LINEAGE]) !== 0) {
    throw new Error("Iceland next_date_id must stay null");
  }
  if (
    countRows(db, "identity_crosswalk", "lineage_id = ? AND upstream_namespace != ?", [
      ICELAND_LINEAGE,
      MERGER_UPSTREAM_NAMESPACE,
    ]) !== 0
  ) {
    throw new Error("Iceland successor edges must stay in the documented merger namespace");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_status = 'current' AND id_namespace != ?", [ICELAND_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Current Iceland offices must keep iceland-research-av-v1");
  }
  if (
    countRows(db, "office", "lineage_id = ? AND office_status = 'historical' AND id_namespace != ?", [
      ICELAND_LINEAGE,
      HISTORICAL_NAMESPACE,
    ]) !== 0
  ) {
    throw new Error("Historical Iceland offices must keep iceland-research-av-v2");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(ICELAND_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }
  for (const token of CLOSED_GAP_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(ICELAND_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 1) {
      throw new Error(`Closed gap ${token} must stay ${GAP_STATUS[token]}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'iceland'")
    .get() as { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown } | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Iceland country projection mismatch");
  }

  const althingi = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.review_status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(ALTHINGI_ID) as Record<string, unknown> | undefined;
  if (
    !althingi ||
    String(althingi.office_type) !== "legislature" ||
    String(althingi.office_status) !== "current" ||
    String(althingi.id_namespace) !== CURRENT_NAMESPACE ||
    String(althingi.tier) !== "national_context" ||
    String(althingi.review_status) !== "needs_review" ||
    String(althingi.draft_tier) !== "national" ||
    String(althingi.file_status) !== "draft_for_human_review" ||
    Number(althingi.approved) !== 0 ||
    Number(althingi.direct_executive) !== 0
  ) {
    throw new Error("Alþingi must stay draft tier national, needs_review, and not a direct executive");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, t.tier, t.review_status,
              json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive,
              json_extract(o.raw_json, '$.supplemental.next_date_preserved_on_row.precision') AS precision,
              json_extract(o.raw_json, '$.supplemental.next_date_not_coerced') AS not_coerced,
              o.next_date_id AS next_date_id
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "direct_executive" ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_executive) !== 1 ||
    String(president.precision) !== "month_range" ||
    Number(president.not_coerced) !== 1 ||
    president.next_date_id != null
  ) {
    throw new Error("The presidency must stay the only current direct executive, with its next date uncoerced");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type = 'direct_executive' OR json_extract(raw_json, '$.row.direct_executive') = 1) AND office_id != ?",
      [ICELAND_LINEAGE, PRESIDENT_ID],
    ) !== 0
  ) {
    throw new Error("No municipal or extra direct executive may be invented");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%EP%' OR office_type LIKE '%european%' OR name LIKE '%European Parliament%')",
      [ICELAND_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament office may be invented");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (name LIKE '%forsætisráðherra%' OR name LIKE '%Prime Minister%' OR office_type LIKE '%cabinet%')",
      [ICELAND_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No prime-minister or cabinet office may be invented");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'draft_for_human_review'",
    [ICELAND_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay draft_for_human_review");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'municipal')
    )`,
    [ICELAND_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Iceland draft tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ICELAND_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim Iceland fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(ICELAND_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Iceland tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ICELAND_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(ICELAND_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Iceland slim import must not invent documented omitted totals");
    }
  }
}
