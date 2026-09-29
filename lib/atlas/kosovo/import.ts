import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  DECAN_GEOGRAPHY_ID,
  EXPECTED_COUNTS,
  GAP_STATUS,
  HISTORICAL_ASSEMBLY_ID,
  LINEAGE_ID as KOSOVO_LINEAGE,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  RESOLVED_NOTE_IDS,
  SAMPLE_COUNCIL_ID,
  SAMPLE_HISTORICAL_COUNCIL_ID,
  SAMPLE_HISTORICAL_MAYOR_ID,
  SAMPLE_MAYOR_ID,
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
import { KosovoPreflightError, scanKosovoInventory, type KosovoInventory } from "./inventory";
import { projectKosovo, type KosovoProjection } from "./project";
import { writeKosovoProjection } from "./write";

export type ImportKosovoOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: KosovoProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportKosovoResult = {
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

export function importKosovo(options: ImportKosovoOptions): ImportKosovoResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: KOSOVO_LINEAGE,
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

    let inventory: KosovoInventory;
    try {
      inventory = scanKosovoInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof KosovoPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: KOSOVO_LINEAGE,
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
      lineageId: KOSOVO_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Kosovo fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectKosovo(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(KOSOVO_LINEAGE, inventory.fingerprint);
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
      writeKosovoProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertKosovoFidelity(staging, projection);
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

export function assertKosovoFidelity(db: DatabaseSync, projection?: KosovoProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [KOSOVO_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [KOSOVO_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [KOSOVO_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [KOSOVO_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [KOSOVO_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [KOSOVO_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [KOSOVO_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [KOSOVO_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [KOSOVO_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [KOSOVO_LINEAGE]);

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
  if (dates !== 0) throw new Error(`research dates ${dates}; calendar labels must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [KOSOVO_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [KOSOVO_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [KOSOVO_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (countRows(db, "geography", "lineage_id = ? AND parent_geography_id IS NOT NULL", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo geographies must not gain invented parents");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      KOSOVO_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Kosovo geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [KOSOVO_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [KOSOVO_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Kosovo offices must keep kosovo-research-bb-v1");
  }
  if (countRows(db, "office", "lineage_id = ? AND registry_qualified != 0", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo offices must stay registry-unqualified");
  }
  if (countRows(db, "office", "lineage_id = ? AND country_id != 'kosovo'", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo offices must stay on country slug kosovo");
  }
  if (countRows(db, "country", "country_id = 'serbia' AND lineage_id = ?", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("Kosovo import must not write a Serbia country row");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(KOSOVO_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay documentary as ${GAP_STATUS[token]}`);
    }
  }
  for (const token of RESOLVED_NOTE_IDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [KOSOVO_LINEAGE, token]) !== 0) {
      throw new Error(`Resolved research note ${token} must not be reopened as an unresolved hold`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'kosovo'")
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
    throw new Error("Kosovo country projection mismatch");
  }

  const assembly = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, o.geography_id, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(ASSEMBLY_ID) as Record<string, unknown> | undefined;
  if (
    !assembly ||
    String(assembly.office_type) !== "national_legislature" ||
    String(assembly.office_status) !== "current" ||
    String(assembly.id_namespace) !== CURRENT_NAMESPACE ||
    String(assembly.geography_id) !== COUNTRY_GEOGRAPHY_ID ||
    String(assembly.tier) !== "national_context" ||
    String(assembly.review_status) !== "needs_review" ||
    String(assembly.draft_tier) !== "national" ||
    String(assembly.file_status) !== "draft_unapproved" ||
    Number(assembly.approved) !== 0
  ) {
    throw new Error("The Assembly must stay draft tier national, needs_review, and on the Kosovo geography");
  }

  const historicalAssembly = db
    .prepare("SELECT office_status, office_type, geography_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_ASSEMBLY_ID) as Record<string, unknown> | undefined;
  if (
    !historicalAssembly ||
    String(historicalAssembly.office_status) !== "historical" ||
    String(historicalAssembly.office_type) !== "national_legislature" ||
    String(historicalAssembly.geography_id) !== COUNTRY_GEOGRAPHY_ID
  ) {
    throw new Error("The provisional Assembly must stay historical on the same Kosovo geography");
  }

  const pair = db
    .prepare("SELECT office_id, geography_id, office_type, office_status FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(SAMPLE_COUNCIL_ID, SAMPLE_MAYOR_ID) as Array<{
    geography_id?: unknown;
    office_type?: unknown;
    office_status?: unknown;
  }>;
  if (
    pair.length !== 2 ||
    String(pair[0]?.geography_id) !== DECAN_GEOGRAPHY_ID ||
    String(pair[0]?.geography_id) !== String(pair[1]?.geography_id) ||
    String(pair[0]?.office_type) !== "municipal_assembly" ||
    String(pair[1]?.office_type) !== "mayor" ||
    String(pair[0]?.office_status) !== "current" ||
    String(pair[1]?.office_status) !== "current"
  ) {
    throw new Error("Deçan assembly and mayor must stay separate current offices on one geography");
  }

  const oldCouncil = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(SAMPLE_HISTORICAL_COUNCIL_ID) as Record<string, unknown> | undefined;
  const oldMayor = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(SAMPLE_HISTORICAL_MAYOR_ID) as Record<string, unknown> | undefined;
  if (!oldCouncil || String(oldCouncil.office_status) !== "historical" || String(oldCouncil.office_type) !== "municipal_assembly") {
    throw new Error("The UNMIK Deçan assembly must stay historical with no successor");
  }
  if (!oldMayor || String(oldMayor.office_status) !== "historical" || String(oldMayor.office_type) !== "mayor") {
    throw new Error("The UNMIK Deçan mayor must stay historical with no successor");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%european%' OR name LIKE '%European Parliament%' OR office_id LIKE 'RS-%' OR office_id LIKE 'EP-%')",
      [KOSOVO_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament or Serbia-scope office may be published");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_type LIKE '%president%'", [KOSOVO_LINEAGE]) !== 0) {
    throw new Error("No popular president may be published");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'municipal') OR
      json_extract(raw_json, '$.row.tier') != json_extract(raw_json, '$.row.draft_tier') OR
      json_extract(raw_json, '$.row.status') != 'draft_unapproved' OR
      json_extract(raw_json, '$.row.justin_approved') != 0
    )`,
    [KOSOVO_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Draft Kosovo tiers must stay on the classification row");

  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [KOSOVO_LINEAGE, UPCOMING_CALENDAR_RELATIVE]) !== 1) {
    throw new Error("Upcoming calendar bytes must stay a retained documentary input");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(KOSOVO_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Kosovo fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(KOSOVO_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Kosovo tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [KOSOVO_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(KOSOVO_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Kosovo import must not invent documented omitted totals");
    }
    if (projection.validatedCounts.applied_calendar_rows !== 0) {
      throw new Error("Kosovo import must not apply calendar rows");
    }
  }
}
