import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  AGUEDA_AM_ID,
  AGUEDA_CM_ID,
  AGUEDA_PCM_ID,
  ALPHANUMERIC_AF_ID,
  ALPHANUMERIC_GEOGRAPHY_ID,
  AZORES_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_ID,
  EP_ID,
  EXPECTED_COUNTS,
  HISTORICAL_PARISH_AF_ID,
  LINEAGE_ID as PORTUGAL_LINEAGE,
  MADEIRA_ID,
  NAMED_HOLDS,
  PARISH_AF_ID,
  PARLIAMENT_ID,
  PLENARY_AF_ID,
  PLENARY_JF_ID,
  PRESIDENT_2026_EVENT_ID,
  PRESIDENT_2026_FIRST_ID,
  PRESIDENT_2026_HK,
  PRESIDENT_2026_RUNOFF_ID,
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
import { PortugalPreflightError, scanPortugalInventory, type PortugalInventory } from "./inventory";
import { projectPortugal, type PortugalProjection } from "./project";
import { writePortugalProjection } from "./write";

export type ImportPortugalOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: PortugalProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportPortugalResult = {
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

export function importPortugal(options: ImportPortugalOptions): ImportPortugalResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: PORTUGAL_LINEAGE,
    intended_tier_path: options.tierPath ?? TIER_PATH,
  };

  const finishFailure = (error: unknown): never => {
    if (lockFd != null) discardStaging(options.sqlitePath);
    if (started) {
      failAttempt(options.attemptsPath, attemptId, errorText(error));
    }
    throw error;
  };

  try {
    lockFd = acquireWriterLock(options.sqlitePath);
    migrateAttemptsDatabase(options.root, options.attemptsPath);
    reconcileStartedAttempts(options.attemptsPath, options.sqlitePath, existsSync(options.sqlitePath));

    let inventory: PortugalInventory;
    try {
      inventory = scanPortugalInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof PortugalPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: PORTUGAL_LINEAGE,
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
      lineageId: PORTUGAL_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectPortugal(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(PORTUGAL_LINEAGE, inventory.fingerprint);
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
      writePortugalProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertPortugalFidelity(staging, projection);
    } finally {
      staging.close();
    }

    if (options.failBeforeRename) {
      throw new Error("Injected failure before rename");
    }

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

export function assertPortugalFidelity(db: DatabaseSync, projection?: PortugalProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [PORTUGAL_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [PORTUGAL_LINEAGE]);
  const historicalOffices = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [PORTUGAL_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [PORTUGAL_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [PORTUGAL_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [PORTUGAL_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [PORTUGAL_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [PORTUGAL_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [PORTUGAL_LINEAGE]);
  const parishNotOther = countRows(
    db,
    "office o JOIN office_tier_classification t USING (id_namespace, office_id)",
    "o.lineage_id = ? AND o.office_type LIKE 'parish_%' AND t.tier <> 'other'",
    [PORTUGAL_LINEAGE],
  );
  const listHeadEvents = countRows(
    db,
    "election_event e JOIN office o USING (id_namespace, office_id)",
    "e.lineage_id = ? AND o.office_type IN ('municipal_president', 'parish_executive_body', 'parish_president')",
    [PORTUGAL_LINEAGE],
  );
  const listHeadResults = countRows(
    db,
    "result_row r JOIN office o USING (id_namespace, office_id)",
    "r.lineage_id = ? AND o.office_type IN ('municipal_president', 'parish_executive_body', 'parish_president')",
    [PORTUGAL_LINEAGE],
  );
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [PORTUGAL_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [PORTUGAL_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [PORTUGAL_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historicalOffices !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historicalOffices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (parishNotOther !== 0) throw new Error("Parish offices must stay tier other");
  if (listHeadEvents !== 0 || listHeadResults !== 0) throw new Error("List-head mandates must not gain a separate ballot");
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [PORTUGAL_LINEAGE, hold]) !== 1) {
      throw new Error(`Named hold ${hold} must remain unresolved`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = ?")
    .get(COUNTRY_ID);
  if (
    !country ||
    String(country.country_code) !== "PT" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Portugal"
  ) {
    throw new Error("Portugal country projection mismatch");
  }

  const agueda = db
    .prepare(
      "SELECT o.office_status, o.geography_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(AGUEDA_AM_ID);
  if (!agueda || String(agueda.office_status) !== "current" || String(agueda.tier) !== "municipal" || String(agueda.geography_id) !== "PT-M0101") {
    throw new Error("Águeda municipal assembly projection mismatch");
  }
  const pcmEvents = countRows(db, "election_event", "office_id = ?", [AGUEDA_PCM_ID]);
  const cmEvents = countRows(db, "election_event", "office_id = ?", [AGUEDA_CM_ID]);
  if (pcmEvents !== 0 || cmEvents < 1) {
    throw new Error("Águeda president must stay a list-head mandate on the Câmara ballot");
  }
  const parish = db
    .prepare(
      "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PARISH_AF_ID);
  if (!parish || String(parish.tier) !== "other" || String(parish.review_status) !== "needs_review") {
    throw new Error("Aguada de Cima parish assembly must stay other/needs_review");
  }
  const alpha = db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = ?").get(ALPHANUMERIC_AF_ID);
  if (!alpha || String(alpha.geography_id) !== ALPHANUMERIC_GEOGRAPHY_ID || String(alpha.office_status) !== "current") {
    throw new Error("Alphanumeric parish identifier drifted");
  }
  const plenaryAf = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(PLENARY_AF_ID);
  const plenaryJf = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(PLENARY_JF_ID);
  if (!plenaryJf || String(plenaryJf.office_status) !== "current") {
    throw new Error("Plenary junta must stay a current office");
  }
  if (plenaryAf && String(plenaryAf.office_status) === "current") {
    throw new Error("Plenary parish must not have a current assembly");
  }
  const historical = db
    .prepare("SELECT office_status, registry_qualified, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(HISTORICAL_PARISH_AF_ID);
  if (
    !historical ||
    String(historical.office_status) !== "historical" ||
    Number(historical.registry_qualified) !== 0 ||
    String(historical.record_state) !== "active" ||
    historical.next_date_id != null
  ) {
    throw new Error("Historical parish alias must stay active, unqualified, and without an inferred end date");
  }
  for (const [officeId, tier] of [
    [AZORES_ID, "regional"],
    [MADEIRA_ID, "regional"],
    [PARLIAMENT_ID, "national_context"],
    [PRESIDENT_ID, "national_context"],
  ] as const) {
    const row = db
      .prepare(
        "SELECT t.tier, o.office_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
      )
      .get(officeId);
    if (!row || String(row.tier) !== tier || String(row.office_status) !== "current") {
      throw new Error(`${officeId} projection mismatch`);
    }
  }
  const ep = db
    .prepare(
      "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Portugal EP delegation must stay other/needs_review");
  }
  const president2026 = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(PRESIDENT_2026_HK);
  if (!president2026 || String(president2026.event_id) !== PRESIDENT_2026_EVENT_ID) {
    throw new Error("2026 presidential event identity mismatch");
  }
  const first = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2026_FIRST_ID);
  const runoff = db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(PRESIDENT_2026_RUNOFF_ID);
  if (!first || String(first.kind) !== "first_round" || Number(first.sequence_no) !== 1 || first.supersedes_id != null) {
    throw new Error("2026 presidential first round mismatch");
  }
  if (!runoff || String(runoff.kind) !== "runoff" || Number(runoff.sequence_no) !== 2 || runoff.supersedes_id != null) {
    throw new Error("2026 presidential runoff must not supersede the first round");
  }
  if (countRows(db, "election_event", "office_id = ? AND history_key = ?", [PRESIDENT_ID, PRESIDENT_2026_HK]) !== 1) {
    throw new Error("2026 presidential rounds must stay one event");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(PORTUGAL_LINEAGE, projection.release.release_id);
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (
      parsed.adapter_version !== hashes?.adapter_version ||
      parsed.method_version !== hashes?.method_version ||
      parsed.schema_version !== hashes?.schema_version
    ) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(PORTUGAL_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Portugal tier retained-input hash mismatch");
    }
  }
}
