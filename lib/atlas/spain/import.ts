import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ARAN_ID,
  BIZKAIA_JUNTAS_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CEUTA_ID,
  CONCEJO_EXAMPLE_ID,
  CONGRESO_ID,
  DISPUTED_HISTORY_KEYS,
  EP_ID,
  EXPECTED_COUNTS,
  FORBIDDEN_ISLAND_DUPLICATE_ID,
  FORBIDDEN_NAVARRA_DIPUTACION_ID,
  FORMENTERA_ID,
  FUERTEVENTURA_CABILDO_ID,
  HISTORICAL_OFFICE_IDS,
  LINEAGE_ID as SPAIN_LINEAGE,
  MADRID_COUNCIL_ID,
  MADRID_GEOGRAPHY_ID,
  MELILLA_ID,
  MODE_PENDING_EXAMPLE_ID,
  NAMED_HOLDS,
  NAVARRA_PARLIAMENT_ID,
  SENADO_ID,
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
import { SpainPreflightError, scanSpainInventory, type SpainInventory } from "./inventory";
import { projectSpain, type SpainProjection } from "./project";
import { writeSpainProjection } from "./write";

export type ImportSpainOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: SpainProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportSpainResult = {
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

export function importSpain(options: ImportSpainOptions): ImportSpainResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: SPAIN_LINEAGE,
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

    let inventory: SpainInventory;
    try {
      inventory = scanSpainInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof SpainPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: SPAIN_LINEAGE,
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
      lineageId: SPAIN_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectSpain(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(SPAIN_LINEAGE, inventory.fingerprint);
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
      writeSpainProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertSpainFidelity(staging, projection);
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

export function assertSpainFidelity(db: DatabaseSync, projection?: SpainProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [SPAIN_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [SPAIN_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [SPAIN_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [SPAIN_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [SPAIN_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [SPAIN_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [SPAIN_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [SPAIN_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [SPAIN_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [SPAIN_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [SPAIN_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [SPAIN_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [SPAIN_LINEAGE]);
  const diputaciones = countRows(db, "office", "lineage_id = ? AND office_type = 'provincial_council'", [SPAIN_LINEAGE]);
  const diputacionEvents = countRows(
    db,
    "election_event e JOIN office o USING (id_namespace, office_id)",
    "e.lineage_id = ? AND o.office_type = 'provincial_council'",
    [SPAIN_LINEAGE],
  );
  const islands = countRows(db, "office", "lineage_id = ? AND office_type = 'island_council'", [SPAIN_LINEAGE]);
  const modePending = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'municipal_elected_mandate_mode_pending'",
    [SPAIN_LINEAGE],
  );
  const concejo = countRows(db, "office", "lineage_id = ? AND office_type = 'concejo_abierto_alcalde'", [SPAIN_LINEAGE]);
  const inventedExecutives = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type != 'concejo_abierto_alcalde' AND (office_type LIKE '%mayor%' OR office_type LIKE '%alcalde%' OR office_type LIKE '%president%' OR office_type LIKE '%premier%' OR office_id LIKE '%-MAYOR')",
    [SPAIN_LINEAGE],
  );
  const nextDates = countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [SPAIN_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result rows must stay 0 while results.json is omitted; found ${results}`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (sources !== 0) throw new Error(`source rows must stay 0 while sources.json is omitted; found ${sources}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (diputaciones !== EXPECTED_COUNTS.provincial_councils) throw new Error(`Diputación count ${diputaciones}`);
  if (diputacionEvents !== 0) throw new Error("ES-G05: Diputación events must not be inferred");
  if (islands !== EXPECTED_COUNTS.island_councils) throw new Error(`island council count ${islands}`);
  if (modePending !== EXPECTED_COUNTS.mode_pending_offices) throw new Error(`mode-pending count ${modePending}`);
  if (concejo !== EXPECTED_COUNTS.concejo_abierto) throw new Error(`concejo abierto count ${concejo}`);
  if (inventedExecutives !== 0) throw new Error("ordinary mayor or popular executive offices must not be invented");
  if (nextDates !== 0) throw new Error("ES-G09: next dates must stay unknown");
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [SPAIN_LINEAGE, hold]) !== 1) {
      throw new Error(`Named hold ${hold} must remain unresolved`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'spain'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "ES" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "España"
  ) {
    throw new Error("Spain country projection mismatch");
  }

  const madrid = db
    .prepare(
      "SELECT o.office_status, o.office_type, o.next_date_id, o.next_date_resolution, o.geography_id, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(MADRID_COUNCIL_ID);
  if (
    !madrid ||
    String(madrid.office_status) !== "current" ||
    String(madrid.office_type) !== "municipal_council" ||
    madrid.next_date_id != null ||
    String(madrid.next_date_resolution) !== "unknown" ||
    String(madrid.geography_id) !== MADRID_GEOGRAPHY_ID ||
    String(madrid.tier) !== "municipal" ||
    String(madrid.review_status) !== "approved"
  ) {
    throw new Error("Madrid council must stay an approved municipal body with no separate mayor and no next date");
  }

  const pending = db
    .prepare(
      "SELECT o.office_type, o.registry_qualified, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(MODE_PENDING_EXAMPLE_ID);
  if (
    !pending ||
    String(pending.office_type) !== "municipal_elected_mandate_mode_pending" ||
    Number(pending.registry_qualified) !== 0 ||
    String(pending.tier) !== "municipal" ||
    String(pending.review_status) !== "needs_review"
  ) {
    throw new Error("ES-G01: mode-pending municipal example must stay unresolved");
  }

  const concejoRow = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(CONCEJO_EXAMPLE_ID);
  if (
    !concejoRow ||
    String(concejoRow.office_type) !== "concejo_abierto_alcalde" ||
    String(concejoRow.tier) !== "municipal" ||
    String(concejoRow.review_status) !== "needs_review"
  ) {
    throw new Error("Concejo abierto must stay the same municipal mandate, needs_review");
  }

  const formentera = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(FORMENTERA_ID);
  if (
    !formentera ||
    String(formentera.office_type) !== "combined_municipal_island_council" ||
    String(formentera.tier) !== "other" ||
    String(formentera.review_status) !== "needs_review"
  ) {
    throw new Error("Formentera must stay one combined other body");
  }
  if (countRows(db, "office", "office_id = ?", [FORBIDDEN_ISLAND_DUPLICATE_ID]) !== 0) {
    throw new Error("Formentera must not gain a second island council");
  }

  for (const officeId of [CEUTA_ID, MELILLA_ID]) {
    const row = db
      .prepare(
        "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
      )
      .get(officeId);
    if (
      !row ||
      String(row.office_type) !== "autonomous_city_assembly" ||
      String(row.tier) !== "other" ||
      String(row.review_status) !== "needs_review"
    ) {
      throw new Error(`${officeId} must stay one autonomous-city assembly in other/needs_review`);
    }
  }

  const navarra = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(NAVARRA_PARLIAMENT_ID);
  if (!navarra || String(navarra.office_type) !== "autonomous_community_parliament" || String(navarra.tier) !== "regional") {
    throw new Error("Navarra parliament must stay a single regional assembly");
  }
  if (countRows(db, "office", "office_id = ?", [FORBIDDEN_NAVARRA_DIPUTACION_ID]) !== 0) {
    throw new Error("Navarra must not gain a generic provincial council");
  }

  const bizkaia = db
    .prepare(
      "SELECT o.office_type, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BIZKAIA_JUNTAS_ID);
  if (!bizkaia || String(bizkaia.office_type) !== "foral_general_assembly" || String(bizkaia.tier) !== "regional") {
    throw new Error("Bizkaia Juntas must stay a regional foral assembly, distinct from a Diputación");
  }

  const fuerteventura = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(FUERTEVENTURA_CABILDO_ID);
  if (
    !fuerteventura ||
    String(fuerteventura.office_type) !== "island_council" ||
    String(fuerteventura.tier) !== "regional" ||
    String(fuerteventura.review_status) !== "needs_review"
  ) {
    throw new Error("Fuerteventura cabildo must stay a regional island council under ES-G08");
  }

  const aran = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(ARAN_ID);
  if (!aran || String(aran.office_type) !== "special_territorial_assembly" || String(aran.tier) !== "other") {
    throw new Error("Aran must stay a special-territory other assembly");
  }

  const congreso = db
    .prepare("SELECT t.tier, t.review_status FROM office_tier_classification t WHERE t.office_id = ?")
    .get(CONGRESO_ID);
  if (!congreso || String(congreso.tier) !== "national_context" || String(congreso.review_status) !== "approved") {
    throw new Error("Congress must stay approved national_context");
  }
  const senado = db
    .prepare("SELECT t.tier, t.review_status FROM office_tier_classification t WHERE t.office_id = ?")
    .get(SENADO_ID);
  if (!senado || String(senado.tier) !== "national_context" || String(senado.review_status) !== "needs_review") {
    throw new Error("Senate must stay national_context needs_review");
  }
  const ep = db.prepare("SELECT t.tier, t.review_status FROM office_tier_classification t WHERE t.office_id = ?").get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "approved") {
    throw new Error("Spain EP delegation must stay the accepted other row");
  }

  for (const officeId of HISTORICAL_OFFICE_IDS) {
    const row = db.prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?").get(officeId);
    if (!row || String(row.office_status) !== "historical" || String(row.record_state) !== "active" || row.next_date_id != null) {
      throw new Error(`Historical office ${officeId} must stay active without an invented end date`);
    }
  }

  for (const historyKey of DISPUTED_HISTORY_KEYS) {
    const row = db.prepare("SELECT legal_outcome FROM election_event WHERE history_key = ?").get(historyKey);
    if (!row || String(row.legal_outcome) !== "disputed") {
      throw new Error(`ES-G03: ${historyKey} must stay disputed`);
    }
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(SPAIN_LINEAGE, projection.release.release_id);
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (
      parsed.adapter_version !== hashes?.adapter_version ||
      parsed.method_version !== hashes?.method_version ||
      parsed.schema_version !== hashes?.schema_version
    ) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (!Array.isArray(parsed.schema_inputs) || parsed.schema_inputs[0]?.input_path !== "0001_atlas_attempt_log.sql") {
      throw new Error("schema_inputs must use checked-in migration filenames");
    }
    if (String(hashes?.release_id) === CANDIDATE_RELEASE_ID && String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT) {
      throw new Error("Candidate release ID does not match documented fingerprint");
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(SPAIN_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Spain tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [SPAIN_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
