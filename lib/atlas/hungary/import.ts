import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BUDAPEST_ASSEMBLY_ID,
  BUDAPEST_MAYOR_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as HUNGARY_LINEAGE,
  NAMED_HOLDS,
  OMITTED_CROSSWALK_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  PARLIAMENT_ID,
  PRESIDENT_2017_EVENT_ID,
  PRESIDENT_2017_HK,
  PRESIDENT_ID,
  RETURN_GAP_OFFICE_IDS,
  TIER_PATH,
  TIER_SHA256,
  returnGapToken,
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
import { HungaryPreflightError, scanHungaryInventory, type HungaryInventory } from "./inventory";
import { projectHungary, type HungaryProjection } from "./project";
import { writeHungaryProjection } from "./write";

export type ImportHungaryOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: HungaryProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportHungaryResult = {
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

export function importHungary(options: ImportHungaryOptions): ImportHungaryResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: HUNGARY_LINEAGE,
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

    let inventory: HungaryInventory;
    try {
      inventory = scanHungaryInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof HungaryPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: HUNGARY_LINEAGE,
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
      lineageId: HUNGARY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectHungary(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(HUNGARY_LINEAGE, inventory.fingerprint);
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
      writeHungaryProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertHungaryFidelity(staging, projection);
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

export function assertHungaryFidelity(db: DatabaseSync, projection?: HungaryProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [HUNGARY_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [HUNGARY_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [HUNGARY_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [HUNGARY_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [HUNGARY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [HUNGARY_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [HUNGARY_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [HUNGARY_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [HUNGARY_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [HUNGARY_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [HUNGARY_LINEAGE]);
  const directExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type IN ('direct_mayor','direct_capital_mayor')",
    [HUNGARY_LINEAGE],
  );
  const councils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type IN ('municipal_council','county_assembly','capital_assembly','national_assembly')",
    [HUNGARY_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== 0) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result count ${results}; omitted results.json must not be invented`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (directExec !== EXPECTED_COUNTS.current_direct_executive_offices) throw new Error(`direct executive count ${directExec}`);
  if (councils !== EXPECTED_COUNTS.council_assembly_offices) throw new Error(`council/assembly count ${councils}`);
  if (countRows(db, "identity_crosswalk", "lineage_id = ?", [HUNGARY_LINEAGE]) !== 0) {
    throw new Error("successor or identity crosswalk rows must stay 0");
  }
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [HUNGARY_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  for (const officeId of RETURN_GAP_OFFICE_IDS) {
    if (countRows(db, "office", "lineage_id = ? AND office_id = ?", [HUNGARY_LINEAGE, officeId]) !== 1) {
      throw new Error(`Return-gap office ${officeId} must stay in the register`);
    }
    if (countRows(db, "election_event", "lineage_id = ? AND history_key = ?", [HUNGARY_LINEAGE, `${officeId}::ONK2024`]) !== 0) {
      throw new Error(`Return-gap office ${officeId} must not gain an ONK2024 event`);
    }
    if (
      countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [
        HUNGARY_LINEAGE,
        returnGapToken(officeId),
      ]) !== 1
    ) {
      throw new Error(`Return gap ${officeId} must stay unresolved`);
    }
  }
  if (countRows(db, "result_row", "lineage_id = ? AND votes = 0", [HUNGARY_LINEAGE]) !== 0) {
    throw new Error("Zero-vote result rows must not be invented");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [HUNGARY_LINEAGE, OMITTED_RESULTS_RELATIVE]) !== 0) {
    throw new Error("omitted results.json must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [HUNGARY_LINEAGE, OMITTED_CROSSWALK_RELATIVE]) !== 0) {
    throw new Error("omitted identity-crosswalk.json must not be a retained input");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%jaras%' OR office_type LIKE '%járás%' OR office_type LIKE '%minister%' OR office_type LIKE '%cabinet%' OR office_id LIKE '%PM%')",
      [HUNGARY_LINEAGE],
    ) !== 0
  ) {
    throw new Error("PM, cabinet, or járás offices must not be invented");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'hungary'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "HU" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Magyarország"
  ) {
    throw new Error("Hungary country projection mismatch");
  }

  const budapestAssembly = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BUDAPEST_ASSEMBLY_ID);
  if (
    !budapestAssembly ||
    String(budapestAssembly.office_status) !== "current" ||
    String(budapestAssembly.tier) !== "regional" ||
    String(budapestAssembly.review_status) !== "needs_review"
  ) {
    throw new Error("Budapest capital assembly must stay regional needs_review");
  }
  const budapestMayor = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(BUDAPEST_MAYOR_ID);
  if (
    !budapestMayor ||
    String(budapestMayor.office_type) !== "direct_capital_mayor" ||
    String(budapestMayor.tier) !== "municipal" ||
    String(budapestMayor.review_status) !== "needs_review"
  ) {
    throw new Error("Budapest capital mayor must stay municipal needs_review");
  }
  const ep = db
    .prepare(
      "SELECT t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Hungary EP delegation must stay other/needs_review");
  }
  const parliament = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PARLIAMENT_ID);
  if (
    !parliament ||
    String(parliament.office_type) !== "national_assembly" ||
    String(parliament.tier) !== "national_context" ||
    String(parliament.review_status) !== "approved"
  ) {
    throw new Error("Országgyűlés tier drifted");
  }
  const president = db
    .prepare(
      "SELECT o.office_type, o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_type) !== "indirect_president" ||
    String(president.office_status) !== "current" ||
    String(president.tier) !== "national_context"
  ) {
    throw new Error("Presidency must stay the indirect national office");
  }
  const president2017 = db
    .prepare("SELECT event_id, event_kind, ballot_basis FROM election_event WHERE history_key = ?")
    .get(PRESIDENT_2017_HK);
  if (
    !president2017 ||
    String(president2017.event_id) !== PRESIDENT_2017_EVENT_ID ||
    String(president2017.event_kind) !== "indirect" ||
    String(president2017.ballot_basis) !== "electors"
  ) {
    throw new Error("2017 presidency must stay an indirect elector ballot");
  }
  if (
    countRows(db, "election_event", "lineage_id = ? AND office_id = ? AND event_kind = 'indirect'", [
      HUNGARY_LINEAGE,
      PRESIDENT_ID,
    ]) !== EXPECTED_COUNTS.president_indirect_events
  ) {
    throw new Error("Indirect presidential events drifted");
  }
  if (
    countRows(
      db,
      "election_event",
      "lineage_id = ? AND office_id = ? AND (event_kind != 'indirect' OR ballot_basis != 'electors')",
      [HUNGARY_LINEAGE, PRESIDENT_ID],
    ) !== 0
  ) {
    throw new Error("A popular presidential ballot must not be invented");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(HUNGARY_LINEAGE, projection.release.release_id);
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
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(HUNGARY_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Hungary tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [HUNGARY_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
