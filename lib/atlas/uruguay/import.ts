import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CANELONES_DEPARTMENT_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  DOCUMENTED_NOT_IMPLEMENTED_ID,
  EXPECTED_COUNTS,
  GAP_STATUS,
  HISTORICAL_CNA_ID,
  LINEAGE_ID as URUGUAY_LINEAGE,
  MONTEVIDEO_DEPARTMENT_ID,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  SAMPLE_ALCALDE_ID,
  SAMPLE_DEPARTMENTAL_COUNCIL_ID,
  SAMPLE_HISTORICAL_DEPARTMENTAL_ID,
  SAMPLE_HISTORICAL_LOCAL_ID,
  SAMPLE_INTENDENTE_ID,
  SAMPLE_MUNICIPAL_COUNCIL_ID,
  SAMPLE_MUNICIPAL_GEOGRAPHY_ID,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
  UPCOMING_CALENDAR_RELATIVE,
  VICE_PRESIDENT_ID,
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
import { UruguayPreflightError, scanUruguayInventory, type UruguayInventory } from "./inventory";
import { projectUruguay, type UruguayProjection } from "./project";
import { writeUruguayProjection } from "./write";

export type ImportUruguayOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: UruguayProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportUruguayResult = {
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

export function importUruguay(options: ImportUruguayOptions): ImportUruguayResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: URUGUAY_LINEAGE,
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

    let inventory: UruguayInventory;
    try {
      inventory = scanUruguayInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof UruguayPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: URUGUAY_LINEAGE,
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
      lineageId: URUGUAY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Uruguay fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectUruguay(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(URUGUAY_LINEAGE, inventory.fingerprint);
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
      writeUruguayProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertUruguayFidelity(staging, projection);
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

export function assertUruguayFidelity(db: DatabaseSync, projection?: UruguayProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [URUGUAY_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [URUGUAY_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [URUGUAY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [URUGUAY_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [URUGUAY_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [URUGUAY_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [URUGUAY_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [URUGUAY_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [URUGUAY_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [URUGUAY_LINEAGE]);

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
  if (countRows(db, "proceeding", "lineage_id = ?", [URUGUAY_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [URUGUAY_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [URUGUAY_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND geography_id = ? AND parent_geography_id IS NOT NULL", [
      URUGUAY_LINEAGE,
      COUNTRY_GEOGRAPHY_ID,
    ]) !== 0
  ) {
    throw new Error("Uruguay country geography must keep a null parent");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND parent_geography_id IS NULL", [URUGUAY_LINEAGE]) !==
    EXPECTED_COUNTS.geographies_without_parent
  ) {
    throw new Error("Uruguay null-parent geography count drifted");
  }
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      URUGUAY_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Uruguay geographies must not gain effective dates");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [URUGUAY_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [URUGUAY_LINEAGE]) !== 0) {
    throw new Error("Uruguay offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [URUGUAY_LINEAGE]) !== 0) {
    throw new Error("Uruguay offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [URUGUAY_LINEAGE]) !== 0) {
    throw new Error("Uruguay next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [URUGUAY_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Uruguay offices must keep atlas-research-uy-bf");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(URUGUAY_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== GAP_STATUS[token] || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open as ${GAP_STATUS[token]}`);
    }
  }
  const calendarHold = db
    .prepare(
      `SELECT json_extract(raw_json, '$.row.status') AS status,
              json_extract(raw_json, '$.row.closed') AS closed,
              json_extract(raw_json, '$.row.documented_not_implemented') AS documented
       FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
    )
    .get(URUGUAY_LINEAGE, DOCUMENTED_NOT_IMPLEMENTED_ID) as
    | { status?: unknown; closed?: unknown; documented?: unknown }
    | undefined;
  if (
    !calendarHold ||
    String(calendarHold.status) !== GAP_STATUS[DOCUMENTED_NOT_IMPLEMENTED_ID] ||
    Number(calendarHold.closed) !== 0 ||
    Number(calendarHold.documented) !== 1
  ) {
    throw new Error("UY-BF-G06 must stay documented-not-implemented and unclosed");
  }
  for (const resolved of ["UY-BF-G02", "UY-BF-G07", "UY-BF-G10", "UY-BF-G14", "UY-BF-G15", "UY-BF-G16", "UY-BF-G21"]) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [URUGUAY_LINEAGE, resolved]) !== 0) {
      throw new Error(`Resolved research note ${resolved} must not be reopened as an unresolved hold`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'uruguay'")
    .get() as
    | { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown }
    | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "americas" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Uruguay country projection mismatch");
  }

  const senate = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.status') AS file_status,
              json_extract(t.raw_json, '$.row.justin_approved') AS approved,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(SENATE_ID) as Record<string, unknown> | undefined;
  if (
    !senate ||
    String(senate.office_type) !== "senate" ||
    String(senate.office_status) !== "current" ||
    String(senate.id_namespace) !== CURRENT_NAMESPACE ||
    String(senate.tier) !== "national_context" ||
    String(senate.review_status) !== "needs_review" ||
    String(senate.draft_tier) !== "national" ||
    String(senate.file_status) !== "draft_unapproved" ||
    Number(senate.approved) !== 0 ||
    Number(senate.direct_executive) !== 0
  ) {
    throw new Error("The Senate must stay draft tier national, needs_review, and not a direct executive");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, t.tier, t.review_status,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive,
              json_extract(o.raw_json, '$.supplemental.separate_executive_ballot') AS separate_ballot,
              json_extract(o.raw_json, '$.row.joint_ticket_office_id') AS joint_ticket
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_executive) !== 1 ||
    Number(president.separate_ballot) !== 1 ||
    String(president.joint_ticket) !== VICE_PRESIDENT_ID
  ) {
    throw new Error("The President must stay a current direct executive on a joint ticket");
  }

  const vice = db
    .prepare(
      `SELECT o.office_type, json_extract(o.raw_json, '$.supplemental.separate_executive_ballot') AS separate_ballot
       FROM office o WHERE o.office_id = ?`,
    )
    .get(VICE_PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (!vice || String(vice.office_type) !== "vice_president" || Number(vice.separate_ballot) !== 0) {
    throw new Error("The Vice President must stay on the presidential ticket without a separate ballot");
  }

  const pair = db
    .prepare("SELECT office_id, geography_id, office_type FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(SAMPLE_MUNICIPAL_COUNCIL_ID, SAMPLE_ALCALDE_ID) as Array<{ geography_id?: unknown; office_type?: unknown }>;
  if (
    pair.length !== 2 ||
    String(pair[0]?.geography_id) !== SAMPLE_MUNICIPAL_GEOGRAPHY_ID ||
    String(pair[0]?.geography_id) !== String(pair[1]?.geography_id) ||
    String(pair[0]?.office_type) !== "alcalde" ||
    String(pair[1]?.office_type) !== "municipal_council"
  ) {
    throw new Error("The sample alcalde and municipal council must stay separate offices on one geography");
  }
  const alcalde = db
    .prepare(
      `SELECT json_extract(raw_json, '$.supplemental.list_selected') AS list_selected,
              json_extract(raw_json, '$.supplemental.separate_executive_ballot') AS separate_ballot,
              json_extract(raw_json, '$.supplemental.separate_ballot_contest_invented') AS invented,
              json_extract(raw_json, '$.row.selection_mode') AS selection_mode
       FROM office WHERE office_id = ?`,
    )
    .get(SAMPLE_ALCALDE_ID) as Record<string, unknown> | undefined;
  if (
    !alcalde ||
    Number(alcalde.list_selected) !== 1 ||
    Number(alcalde.separate_ballot) !== 0 ||
    Number(alcalde.invented) !== 0 ||
    String(alcalde.selection_mode) !== "popular_list_result_first_titular"
  ) {
    throw new Error("The sample alcalde must stay list-selected with no invented ballot contest");
  }

  const department = db
    .prepare("SELECT office_id, geography_id, office_type FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(SAMPLE_INTENDENTE_ID, SAMPLE_DEPARTMENTAL_COUNCIL_ID) as Array<{ geography_id?: unknown; office_type?: unknown }>;
  const departmentParent = db
    .prepare("SELECT parent_geography_id FROM geography WHERE geography_id = ?")
    .get(MONTEVIDEO_DEPARTMENT_ID) as { parent_geography_id?: unknown } | undefined;
  if (
    department.length !== 2 ||
    String(department[0]?.geography_id) !== MONTEVIDEO_DEPARTMENT_ID ||
    String(department[0]?.geography_id) !== String(department[1]?.geography_id) ||
    String(department[0]?.office_type) !== "intendente" ||
    String(department[1]?.office_type) !== "departmental_council" ||
    String(departmentParent?.parent_geography_id) !== COUNTRY_GEOGRAPHY_ID
  ) {
    throw new Error("Montevideo intendente and junta must share a department geography under Uruguay");
  }

  const cna = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(HISTORICAL_CNA_ID) as Record<string, unknown> | undefined;
  if (!cna || String(cna.office_status) !== "historical" || String(cna.office_type) !== "national_collective_executive") {
    throw new Error("The Consejo Nacional de Administración must stay a historical collective executive");
  }
  const oldCouncil = db
    .prepare("SELECT office_status, office_type FROM office WHERE office_id = ?")
    .get(SAMPLE_HISTORICAL_DEPARTMENTAL_ID) as Record<string, unknown> | undefined;
  if (!oldCouncil || String(oldCouncil.office_status) !== "historical" || String(oldCouncil.office_type) !== "departmental_collective_executive") {
    throw new Error("The 1952 Montevideo concejo must stay a historical collective executive with no successor");
  }
  const jla = db
    .prepare(
      `SELECT o.office_status, o.office_type, t.tier, g.parent_geography_id
       FROM office o
       JOIN office_tier_classification t USING (id_namespace, office_id)
       JOIN geography g USING (country_id, geography_id)
       WHERE o.office_id = ?`,
    )
    .get(SAMPLE_HISTORICAL_LOCAL_ID) as Record<string, unknown> | undefined;
  if (
    !jla ||
    String(jla.office_status) !== "historical" ||
    String(jla.office_type) !== "historical_local_council" ||
    String(jla.tier) !== "municipal" ||
    jla.parent_geography_id == null
  ) {
    throw new Error("Río Branco must stay a historical local council with no successor edge");
  }

  if (
    countRows(
      db,
      "geography",
      "lineage_id = ? AND parent_geography_id = ? AND geography_id LIKE 'UY-M-%'",
      [URUGUAY_LINEAGE, CANELONES_DEPARTMENT_ID],
    ) !== EXPECTED_COUNTS.canelones_municipalities
  ) {
    throw new Error("Canelones municipality count drifted");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%-EP%' OR office_type LIKE '%european%' OR office_type LIKE '%mercosur%' OR name LIKE '%European Parliament%' OR name LIKE '%MERCOSUR%' OR json_extract(raw_json, '$.row.ep_office') = 1)",
      [URUGUAY_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No European Parliament or MERCOSUR office may be published");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'local') OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.tier') != 'regional') OR
      json_extract(raw_json, '$.row.tier') != json_extract(raw_json, '$.row.draft_tier') OR
      json_extract(raw_json, '$.row.status') != 'draft_unapproved' OR
      json_extract(raw_json, '$.row.justin_approved') != 0
    )`,
    [URUGUAY_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Draft Uruguay tiers must stay on the classification row");

  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [URUGUAY_LINEAGE, UPCOMING_CALENDAR_RELATIVE]) !== 1) {
    throw new Error("Upcoming calendar bytes must stay a retained documentary input");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(URUGUAY_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Uruguay fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(URUGUAY_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Uruguay tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [URUGUAY_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(URUGUAY_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Uruguay import must not invent documented omitted totals");
    }
    if (projection.validatedCounts.applied_calendar_rows !== 0) {
      throw new Error("Uruguay import must not apply calendar rows");
    }
  }
}
