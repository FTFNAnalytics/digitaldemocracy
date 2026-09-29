import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ARC_HISTORICAL_ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EXPECTED_COUNTS,
  GAP_STATUS,
  KYIV_COUNCIL_ID,
  KYIV_MAYOR_ID,
  LINEAGE_ID as UKRAINE_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  SAMPLE_CITY_DISTRICT_ID,
  SAMPLE_MUNICIPAL_COUNCIL_ID,
  SAMPLE_MUNICIPAL_MAYOR_ID,
  SAMPLE_RAION_ID,
  SEVASTOPOL_HISTORICAL_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
  VINNYTSIA_HISTORICAL_RAION_ID,
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
import { UkrainePreflightError, scanUkraineInventory, type UkraineInventory } from "./inventory";
import { projectUkraine, type UkraineProjection } from "./project";
import { writeUkraineProjection } from "./write";

export type ImportUkraineOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: UkraineProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportUkraineResult = {
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

export function importUkraine(options: ImportUkraineOptions): ImportUkraineResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: UKRAINE_LINEAGE,
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

    let inventory: UkraineInventory;
    try {
      inventory = scanUkraineInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof UkrainePreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: UKRAINE_LINEAGE,
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
      lineageId: UKRAINE_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Ukraine fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectUkraine(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(UKRAINE_LINEAGE, inventory.fingerprint);
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
      writeUkraineProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertUkraineFidelity(staging, projection);
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

export function assertUkraineFidelity(db: DatabaseSync, projection?: UkraineProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [UKRAINE_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [UKRAINE_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [UKRAINE_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [UKRAINE_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [UKRAINE_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [UKRAINE_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [UKRAINE_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [UKRAINE_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [UKRAINE_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [UKRAINE_LINEAGE]);

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
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; no successor edge is imported`);
  if (dates !== 0) throw new Error(`research dates ${dates}; scheduled labels must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [UKRAINE_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [UKRAINE_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [UKRAINE_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND geography_id = ? AND parent_geography_id IS NOT NULL", [
      UKRAINE_LINEAGE,
      COUNTRY_GEOGRAPHY_ID,
    ]) !== 0
  ) {
    throw new Error("Ukraine country geography must keep a null parent");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND parent_geography_id IS NULL", [UKRAINE_LINEAGE]) !==
    EXPECTED_COUNTS.geographies_without_parent
  ) {
    throw new Error("Ukraine null-parent geography count drifted");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      UKRAINE_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Ukraine geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [UKRAINE_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [UKRAINE_LINEAGE]) !== 0) {
    throw new Error("Ukraine offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [UKRAINE_LINEAGE]) !== 0) {
    throw new Error("Ukraine offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [UKRAINE_LINEAGE]) !== 0) {
    throw new Error("Ukraine next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [UKRAINE_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Ukraine offices must keep atlas-research-ua-bd");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(UKRAINE_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'ukraine'")
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
    throw new Error("Ukraine country projection mismatch");
  }

  const parliament = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PARLIAMENT_ID) as Record<string, unknown> | undefined;
  if (
    !parliament ||
    String(parliament.office_type) !== "national_assembly" ||
    String(parliament.office_status) !== "current" ||
    String(parliament.id_namespace) !== CURRENT_NAMESPACE ||
    String(parliament.tier) !== "national_context" ||
    String(parliament.review_status) !== "needs_review" ||
    String(parliament.draft_tier) !== "national" ||
    String(parliament.file_status) !== "draft_unapproved" ||
    Number(parliament.approved) !== 0 ||
    Number(parliament.direct_executive) !== 0
  ) {
    throw new Error("Parliament must stay draft tier national, needs_review, and not a direct executive");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, t.tier, t.review_status,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_executive) !== 1
  ) {
    throw new Error("The President must stay a current direct executive");
  }

  const raion = db
    .prepare(
      `SELECT o.office_type, t.tier, json_extract(t.raw_json, '$.row.tier') AS draft_tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SAMPLE_RAION_ID) as Record<string, unknown> | undefined;
  if (!raion || String(raion.office_type) !== "raion_council" || String(raion.tier) !== "regional" || String(raion.draft_tier) !== "raion") {
    throw new Error("The sample raion council must stay draft raion and schema regional");
  }

  const pair = db
    .prepare("SELECT office_id, geography_id, office_type FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(SAMPLE_MUNICIPAL_COUNCIL_ID, SAMPLE_MUNICIPAL_MAYOR_ID) as Array<{ geography_id?: unknown; office_type?: unknown }>;
  if (
    pair.length !== 2 ||
    String(pair[0]?.geography_id) !== String(pair[1]?.geography_id) ||
    String(pair[0]?.office_type) !== "local_council" ||
    String(pair[1]?.office_type) !== "mayor"
  ) {
    throw new Error("The sample council and mayor must stay separate offices on one geography");
  }

  const kyiv = db
    .prepare("SELECT office_id, geography_id FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(KYIV_COUNCIL_ID, KYIV_MAYOR_ID) as Array<{ geography_id?: unknown }>;
  const kyivParent = db
    .prepare("SELECT parent_geography_id FROM geography WHERE geography_id = ?")
    .get(String(kyiv[0]?.geography_id)) as { parent_geography_id?: unknown } | undefined;
  if (kyiv.length !== 2 || String(kyiv[0]?.geography_id) !== String(kyiv[1]?.geography_id) || kyivParent?.parent_geography_id != null) {
    throw new Error("Kyiv city council and mayor must share a geography with a null parent");
  }

  const district = db
    .prepare(
      `SELECT o.office_type, t.tier, json_extract(t.raw_json, '$.row.tier') AS draft_tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SAMPLE_CITY_DISTRICT_ID) as Record<string, unknown> | undefined;
  if (
    !district ||
    String(district.office_type) !== "city_district_council" ||
    String(district.tier) !== "municipal" ||
    String(district.draft_tier) !== "city_district"
  ) {
    throw new Error("The sample city-district council must stay draft city_district and schema municipal");
  }

  const arc = db
    .prepare(
      `SELECT o.office_status, o.office_type, t.tier, json_extract(t.raw_json, '$.row.tier') AS draft_tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(ARC_HISTORICAL_ASSEMBLY_ID) as Record<string, unknown> | undefined;
  if (
    !arc ||
    String(arc.office_status) !== "historical" ||
    String(arc.office_type) !== "autonomous_assembly" ||
    String(arc.tier) !== "regional" ||
    String(arc.draft_tier) !== "autonomous"
  ) {
    throw new Error("The Crimean assembly must stay a historical Ukrainian autonomous office");
  }

  const sevastopol = db
    .prepare(
      `SELECT o.office_status, o.office_type, t.tier, json_extract(t.raw_json, '$.row.tier') AS draft_tier
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SEVASTOPOL_HISTORICAL_COUNCIL_ID) as Record<string, unknown> | undefined;
  if (
    !sevastopol ||
    String(sevastopol.office_status) !== "historical" ||
    String(sevastopol.office_type) !== "special_city_council" ||
    String(sevastopol.tier) !== "municipal" ||
    String(sevastopol.draft_tier) !== "local"
  ) {
    throw new Error("Sevastopol must stay a historical Ukrainian special-city council");
  }

  const oldRaion = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(VINNYTSIA_HISTORICAL_RAION_ID) as Record<string, unknown> | undefined;
  if (!oldRaion || String(oldRaion.office_status) !== "historical" || String(oldRaion.office_type) !== "raion_council") {
    throw new Error("Pre-2020 Vinnytsia raion must stay a historical raion council with no successor");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%-EP%' OR office_type LIKE '%european%' OR name LIKE '%European Parliament%' OR name LIKE '%Європейський парламент%' OR json_extract(raw_json, '$.row.ep_office') = 1 OR json_extract(raw_json, '$.row.institutional_scope') != 'Ukrainian_institution')",
      [UKRAINE_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament or occupying-power office may be published");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') NOT IN ('local','city_district')) OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.tier') NOT IN ('regional','autonomous','raion')) OR
      json_extract(raw_json, '$.row.status') != 'draft_unapproved' OR
      json_extract(raw_json, '$.row.justin_approved') != 0
    )`,
    [UKRAINE_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Draft Ukraine tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(UKRAINE_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Ukraine fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(UKRAINE_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Ukraine tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [UKRAINE_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(UKRAINE_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Ukraine import must not invent documented omitted totals");
    }
  }
}
