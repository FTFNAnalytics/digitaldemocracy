import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BRCKO_ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GAP_STATUS,
  IDENTITY_VECTOR_GIT_BLOB,
  IDENTITY_VECTORS_RELATIVE,
  IDENTITY_VECTORS_SHA256,
  LINEAGE_ID as BOSNIA_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PROMPT_O_OFFICE_CROSSWALK,
  PROMPT_O_REFERENCE_RELATIVE,
  RS_PRESIDENT_ID,
  RS_VP_IDS,
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
import { BosniaPreflightError, scanBosniaInventory, type BosniaInventory } from "./inventory";
import { projectBosnia, type BosniaProjection } from "./project";
import { writeBosniaProjection } from "./write";

export type ImportBosniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: BosniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportBosniaResult = {
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

export function importBosnia(options: ImportBosniaOptions): ImportBosniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BOSNIA_LINEAGE,
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

    let inventory: BosniaInventory;
    try {
      inventory = scanBosniaInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof BosniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: BOSNIA_LINEAGE,
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
      lineageId: BOSNIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Bosnia fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBosnia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(BOSNIA_LINEAGE, inventory.fingerprint);
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
      writeBosniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertBosniaFidelity(staging, projection);
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

export function assertBosniaFidelity(db: DatabaseSync, projection?: BosniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [BOSNIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [BOSNIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BOSNIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BOSNIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [BOSNIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [BOSNIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [BOSNIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [BOSNIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [BOSNIA_LINEAGE]);

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
  if (sources !== 0) throw new Error("omitted source extracts must not be invented");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; historical transitions stay unasserted`);
  if (dates !== 0) throw new Error(`research dates ${dates}; null next dates must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [BOSNIA_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [BOSNIA_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [BOSNIA_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      BOSNIA_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Bosnia geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [BOSNIA_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [BOSNIA_LINEAGE, "data/countries/bosnia-and-herzegovina%"]) !== 0) {
    throw new Error("The Prompt O country package must not be the publish source");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [BOSNIA_LINEAGE]) !== 0) {
    throw new Error("Bosnia offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [BOSNIA_LINEAGE]) !== 0) {
    throw new Error("Bosnia offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [BOSNIA_LINEAGE]) !== 0) {
    throw new Error("Bosnia next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [BOSNIA_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Bosnia offices must keep bosnia-herzegovina-research-aw-v1");
  }

  for (const priorId of Object.keys(PROMPT_O_OFFICE_CROSSWALK)) {
    if (countRows(db, "office", "lineage_id = ? AND office_id = ?", [BOSNIA_LINEAGE, priorId]) !== 0) {
      throw new Error(`Prompt O subset id ${priorId} must not be published as an AW office`);
    }
    const target = PROMPT_O_OFFICE_CROSSWALK[priorId];
    if (!target || countRows(db, "office", "lineage_id = ? AND office_id = ?", [BOSNIA_LINEAGE, target]) !== 1) {
      throw new Error(`Prompt O crosswalk target ${target ?? priorId} must stay in the AW register`);
    }
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(BOSNIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'bosnia-and-herzegovina'")
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
    throw new Error("Bosnia and Herzegovina country projection mismatch");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.review_status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(RS_PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "entity_direct_executive" ||
    String(president.office_status) !== "current" ||
    String(president.id_namespace) !== CURRENT_NAMESPACE ||
    String(president.tier) !== "regional" ||
    String(president.review_status) !== "needs_review" ||
    String(president.draft_tier) !== "regional" ||
    String(president.file_status) !== "draft_for_human_review" ||
    Number(president.approved) !== 0 ||
    Number(president.direct_executive) !== 1
  ) {
    throw new Error("The RS President must stay draft tier regional, needs_review, and a direct executive");
  }

  for (const vpId of RS_VP_IDS) {
    const vp = db
      .prepare("SELECT name, office_type, office_status FROM office WHERE office_id = ?")
      .get(vpId) as { name?: unknown; office_type?: unknown; office_status?: unknown } | undefined;
    if (
      !vp ||
      String(vp.office_type) !== "entity_direct_executive" ||
      String(vp.office_status) !== "current" ||
      !/constitutional office/.test(String(vp.name)) ||
      /bosniak|croat|serb/i.test(String(vp.name))
    ) {
      throw new Error(`${vpId} must stay the supplied RS vice-president placeholder`);
    }
  }

  const brcko = db
    .prepare("SELECT office_type, office_status, name FROM office WHERE office_id = ?")
    .get(BRCKO_ASSEMBLY_ID) as { office_type?: unknown; office_status?: unknown; name?: unknown } | undefined;
  if (!brcko || String(brcko.office_type) !== "district_assembly" || String(brcko.office_status) !== "current") {
    throw new Error("Brčko Assembly must stay the current district assembly");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (name LIKE '%Mayor of Brčko%' OR name LIKE '%Mayor of Brcko%' OR office_id LIKE '%BRCKO-MAYOR%' OR office_id LIKE '%BRC-MAYOR%')",
      [BOSNIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No Brčko mayor may be invented");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%-EP%' OR office_id LIKE 'EP-%' OR name LIKE '%European Parliament%' OR office_type LIKE '%european%')",
      [BOSNIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament office may be invented");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (name LIKE '%House of Peoples%' OR name LIKE '%Council of Peoples%' OR name LIKE '%Council of Ministers%' OR name LIKE '%Mayor of Sarajevo%' OR name LIKE '%Mayor of Mostar%')",
      [BOSNIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Excluded indirect chambers and mayors must stay out of the register");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'draft_for_human_review'",
    [BOSNIA_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay draft_for_human_review");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.tier') != 'regional') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'municipal')
    )`,
    [BOSNIA_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Bosnia draft tiers must stay on the classification row");

  const stateHor = db
    .prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'BA-NAT-HOR'")
    .get() as { tier?: unknown } | undefined;
  if (!stateHor || String(stateHor.tier) !== "national_context") {
    throw new Error("The state House of Representatives must interchange to national_context");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(BOSNIA_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim Bosnia fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(BOSNIA_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Bosnia tier retained-input hash mismatch");
    }
    const vectors = db
      .prepare("SELECT sha256, byte_count FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(BOSNIA_LINEAGE, IDENTITY_VECTORS_RELATIVE) as { sha256?: unknown; byte_count?: unknown } | undefined;
    if (!vectors || String(vectors.sha256) !== IDENTITY_VECTORS_SHA256 || Number(vectors.byte_count) !== 1159136) {
      throw new Error("Prompt O identity-vector retained input drifted");
    }
    const reference = db
      .prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(BOSNIA_LINEAGE, PROMPT_O_REFERENCE_RELATIVE) as { sha256?: unknown } | undefined;
    if (!reference) throw new Error("Prompt O detailed-results reference must stay a retained input");
    const retained = countRows(db, "retained_input", "lineage_id = ?", [BOSNIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(BOSNIA_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    const countryRaw = db.prepare("SELECT raw_json FROM country WHERE country_id = 'bosnia-and-herzegovina'").get() as
      | { raw_json?: unknown }
      | undefined;
    const supplemental = JSON.parse(String(countryRaw?.raw_json))?.supplemental;
    if (
      supplemental?.prompt_o_office_crosswalk_imported_as_edges !== false ||
      supplemental?.prompt_o_result_rows_imported !== 0 ||
      supplemental?.identity_vector_git_blob !== IDENTITY_VECTOR_GIT_BLOB ||
      supplemental?.successor_edges !== 0
    ) {
      throw new Error("Prompt O continuity must stay documentary and must not import result rows or successor edges");
    }
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Bosnia slim import must not invent documented omitted totals");
    }
  }
}
