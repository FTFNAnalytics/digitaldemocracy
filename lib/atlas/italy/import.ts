import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BOLZANO_COUNCIL_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CAMERA_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  FVG_UDINE_COUNCIL_ID,
  FIRENZE_Q1_COUNCIL_ID,
  HOLD_IDS,
  HOLD_STATUS,
  LINEAGE_ID as ITALY_LINEAGE,
  OMITTED_RESEARCH_DIR,
  PENDING_STATE_NOTE,
  PRESIDENT_ID,
  TAA_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
  TRENTO_PRESIDENT_ID,
  VDA_COUNCIL_ID,
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
import { ItalyPreflightError, scanItalyInventory, type ItalyInventory } from "./inventory";
import { projectItaly, type ItalyProjection } from "./project";
import { writeItalyProjection } from "./write";

export type ImportItalyOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: ItalyProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportItalyResult = {
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

export function importItaly(options: ImportItalyOptions): ImportItalyResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ITALY_LINEAGE,
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

    let inventory: ItalyInventory;
    try {
      inventory = scanItalyInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof ItalyPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ITALY_LINEAGE,
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
      lineageId: ITALY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Italy fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectItaly(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ITALY_LINEAGE, inventory.fingerprint);
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
      writeItalyProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertItalyFidelity(staging, projection);
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

export function assertItalyFidelity(db: DatabaseSync, projection?: ItalyProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ITALY_LINEAGE]);
  const sqlCurrent = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [ITALY_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [ITALY_LINEAGE]);
  const pending = countRows(db, "office", "lineage_id = ? AND state_note = ?", [ITALY_LINEAGE, PENDING_STATE_NOTE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ITALY_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [ITALY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ITALY_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ITALY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ITALY_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [ITALY_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ITALY_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [ITALY_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [ITALY_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ITALY_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ITALY_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [ITALY_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ITALY_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (sqlCurrent !== EXPECTED_COUNTS.current_offices + EXPECTED_COUNTS.pending_fvg_offices) {
    throw new Error(`sql current office count ${sqlCurrent}`);
  }
  if (pending !== EXPECTED_COUNTS.pending_fvg_offices) throw new Error(`pending FVG count ${pending}`);
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
  if (dates !== 0) throw new Error(`research dates ${dates}; no FVG or runoff date may be invented`);
  if (countRows(db, "proceeding", "lineage_id = ?", [ITALY_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [ITALY_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [ITALY_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [
      ITALY_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Italy geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [ITALY_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [ITALY_LINEAGE]) !== 0) {
    throw new Error("Italy offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [ITALY_LINEAGE]) !== 0) {
    throw new Error("Italy offices must not gain an invented next date");
  }

  for (const token of HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(ITALY_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== HOLD_STATUS || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'italy'")
    .get() as { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown } | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Italy country projection mismatch");
  }

  const camera = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, t.review_status, json_extract(t.raw_json, '$.row.draft_tier') AS numeric_tier, json_extract(t.raw_json, '$.row.review_status') AS file_status, json_extract(t.raw_json, '$.row.justin_approved') AS approved FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(CAMERA_ID) as Record<string, unknown> | undefined;
  if (
    !camera ||
    String(camera.office_type) !== "national_lower_chamber" ||
    String(camera.office_status) !== "current" ||
    String(camera.tier) !== "national_context" ||
    String(camera.review_status) !== "needs_review" ||
    Number(camera.numeric_tier) !== 1 ||
    String(camera.file_status) !== "unapproved_draft" ||
    Number(camera.approved) !== 0
  ) {
    throw new Error("Camera must stay numeric tier 1, needs_review, unapproved_draft");
  }

  const president = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive, json_extract(o.raw_json, '$.row.selection_mode') AS selection_mode FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "indirect_head_of_state" ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context" ||
    Number(president.direct_executive) !== 0 ||
    String(president.selection_mode) !== "parliament_joint_session_and_regional_delegates"
  ) {
    throw new Error("The presidency must stay an indirect national office");
  }

  const ep = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID) as Record<string, unknown> | undefined;
  if (
    !ep ||
    String(ep.office_type) !== "european_parliament_delegation" ||
    String(ep.office_status) !== "current" ||
    String(ep.tier) !== "national_context" ||
    String(ep.review_status) !== "needs_review"
  ) {
    throw new Error("Italy EP delegation must stay current national_context/needs_review");
  }

  for (const id of [VDA_COUNCIL_ID, TAA_COUNCIL_ID, BOLZANO_COUNCIL_ID]) {
    const row = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(id) as
      | { office_type?: unknown; office_status?: unknown }
      | undefined;
    if (!row || String(row.office_status) !== "current") throw new Error(`${id} must stay a current council`);
  }
  const trento = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(TRENTO_PRESIDENT_ID) as
    | { office_type?: unknown; office_status?: unknown }
    | undefined;
  if (!trento || String(trento.office_type) !== "direct_autonomous_provincial_president" || String(trento.office_status) !== "current") {
    throw new Error("Trento president must stay a current direct autonomous provincial office");
  }
  if (countRows(db, "office", "office_id IN ('IT.REGIONE.02.president', 'IT.REGIONE.04.president', 'IT.PROVINCE.021.president')") !== 0) {
    throw new Error("No VDA, TAA, or Bolzano direct president may be invented");
  }

  const fvg = db
    .prepare("SELECT office_status, state_note, office_type, next_date_id FROM office WHERE office_id = ?")
    .get(FVG_UDINE_COUNCIL_ID) as
    | { office_status?: unknown; state_note?: unknown; office_type?: unknown; next_date_id?: unknown }
    | undefined;
  if (
    !fvg ||
    String(fvg.office_status) !== "current" ||
    String(fvg.state_note) !== PENDING_STATE_NOTE ||
    String(fvg.office_type) !== "provincial_council" ||
    fvg.next_date_id != null
  ) {
    throw new Error("FVG Udine council must stay pending with no invented election date");
  }

  const firenze = db
    .prepare("SELECT o.office_type, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?")
    .get(FIRENZE_Q1_COUNCIL_ID) as { office_type?: unknown; tier?: unknown } | undefined;
  if (!firenze || String(firenze.office_type) !== "quartiere_council" || String(firenze.tier) !== "municipal") {
    throw new Error("Firenze quartiere 1 must stay municipal");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_id LIKE '%CIRCOSCRIZ%' OR office_type LIKE '%circoscrizione%' OR name LIKE '%Presidente del Consiglio%')",
      [ITALY_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No circoscrizione or prime-minister office may be invented");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND office_status = 'current' AND office_type IN ('provincial_council', 'direct_provincial_president') AND state_note IS NULL",
      [ITALY_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No current ordinary provincial popular office may be invented");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND json_extract(raw_json, '$.row.review_status') != 'unapproved_draft'",
    [ITALY_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Per-office file review_status must stay unapproved_draft");
  const numericDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.draft_tier') != 1) OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.draft_tier') NOT IN (2, 3)) OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.draft_tier') != 4)
    )`,
    [ITALY_LINEAGE],
  );
  if (numericDrift !== 0) throw new Error("Numeric Italy tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ITALY_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
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
        `Slim Italy fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(ITALY_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Italy tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ITALY_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(ITALY_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null
    ) {
      throw new Error("Italy slim import must not invent documented omitted totals");
    }
  }
}
