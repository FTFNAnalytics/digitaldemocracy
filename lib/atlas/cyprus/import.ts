import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  HOUSE_ID,
  LINEAGE_ID as CYPRUS_LINEAGE,
  NAMED_HOLDS,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PRESIDENT_ID,
  REL_ARM_ID,
  REL_LAT_ID,
  REL_MAR_ID,
  SPILIA_ANTONIOS_COUNCIL_ID,
  SPILIA_ANTONIOS_GEOGRAPHY_ID,
  SPILIA_KOURDALI_COUNCIL_ID,
  SPILIA_KOURDALI_GEOGRAPHY_ID,
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
import { CyprusPreflightError, scanCyprusInventory, type CyprusInventory } from "./inventory";
import { projectCyprus, type CyprusProjection } from "./project";
import { writeCyprusProjection } from "./write";

export type ImportCyprusOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: CyprusProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportCyprusResult = {
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

export function importCyprus(options: ImportCyprusOptions): ImportCyprusResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: CYPRUS_LINEAGE,
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

    let inventory: CyprusInventory;
    try {
      inventory = scanCyprusInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof CyprusPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: CYPRUS_LINEAGE,
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
      lineageId: CYPRUS_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectCyprus(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(CYPRUS_LINEAGE, inventory.fingerprint);
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
      writeCyprusProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertCyprusFidelity(staging, projection);
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

export function assertCyprusFidelity(db: DatabaseSync, projection?: CyprusProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [CYPRUS_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [CYPRUS_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [CYPRUS_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [CYPRUS_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [CYPRUS_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [CYPRUS_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [CYPRUS_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [CYPRUS_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [CYPRUS_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [CYPRUS_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const evidence = countRows(db, "evidence_link", "lineage_id = ?", [CYPRUS_LINEAGE]);
  const yearOnly = countRows(db, "research_date", "lineage_id = ? AND precision = 'year'", [CYPRUS_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result count ${results}; slim land must publish 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error(`source count ${sources}; omitted sources/ must not be invented`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; the crosswalk must stay empty`);
  if (evidence !== 0) throw new Error("evidence links must stay empty while source bytes are omitted");
  if (yearOnly !== EXPECTED_COUNTS.year_only_events) throw new Error(`year-only dates ${yearOnly}`);
  if (countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [CYPRUS_LINEAGE]) !== 0) {
    throw new Error("Cyprus geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [CYPRUS_LINEAGE, OMITTED_RESULTS_RELATIVE]) !== 0) {
    throw new Error("omitted results.json must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [CYPRUS_LINEAGE, `${OMITTED_SOURCES_DIR}%`]) !== 0) {
    throw new Error("omitted sources/ must not be a retained input");
  }
  for (const hold of NAMED_HOLDS) {
    const row = db
      .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
      .get(CYPRUS_LINEAGE, hold.token);
    if (!row || String(row.status) !== "open") {
      throw new Error(`Named hold ${hold.token} must stay open`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'cyprus'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Cyprus country projection mismatch");
  }

  const house = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(HOUSE_ID);
  if (!house || String(house.office_type) !== "national_parliament" || String(house.tier) !== "national_context" || String(house.review_status) !== "needs_review") {
    throw new Error("House of Representatives must stay national_context needs_review");
  }
  const president = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.selection_mode') AS selection_mode FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.selection_mode) !== "direct_popular"
  ) {
    throw new Error("President of Cyprus must stay a direct national_context office");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "european_parliament_delegation" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Cyprus EP delegation must stay other/needs_review");
  }
  for (const officeId of [REL_ARM_ID, REL_LAT_ID, REL_MAR_ID]) {
    const row = db
      .prepare(
        "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.parliamentary_voting_right') AS voting FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
      )
      .get(officeId);
    if (!row || String(row.office_type) !== "religious_group_representative" || String(row.tier) !== "national_context" || String(row.review_status) !== "needs_review" || Number(row.voting) !== 0) {
      throw new Error(`${officeId} must stay a non-voting national_context representative`);
    }
  }
  const antonios = db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = ?").get(SPILIA_ANTONIOS_COUNCIL_ID);
  const kourdali = db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = ?").get(SPILIA_KOURDALI_COUNCIL_ID);
  if (!antonios || String(antonios.geography_id) !== SPILIA_ANTONIOS_GEOGRAPHY_ID || String(antonios.office_status) !== "current") {
    throw new Error("Spilia Agios Antonios must stay a current separate council");
  }
  if (!kourdali || String(kourdali.geography_id) !== SPILIA_KOURDALI_GEOGRAPHY_ID || String(kourdali.office_status) !== "current") {
    throw new Error("Spilia Kourdali must stay a current separate council");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND legal_outcome != 'unknown'", [CYPRUS_LINEAGE]) !== 0) {
    throw new Error("Gazette certification stays open; legal_outcome must stay unknown");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND ballot_basis != 'unknown'", [CYPRUS_LINEAGE]) !== 0) {
    throw new Error("Research ballot labels stay in raw_json; schema ballot_basis stays unknown");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [CYPRUS_LINEAGE]) !== 0) {
    throw new Error("Next dates must stay unknown; calendar projections are not called polls");
  }
  if (countRows(db, "research_date", "lineage_id = ? AND precision = 'year' AND (month IS NOT NULL OR day IS NOT NULL)", [CYPRUS_LINEAGE]) !== 0) {
    throw new Error("Year-only Cyprus dates must not gain a month or day");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(CYPRUS_LINEAGE, projection.release.release_id);
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
    if (String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT || String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slim Cyprus fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(CYPRUS_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Cyprus tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [CYPRUS_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
