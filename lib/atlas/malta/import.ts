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
  GOZO_CIVIC_ID,
  GOZO_CIVIC_PRESIDENT_ID,
  HOUSE_ID,
  LINEAGE_ID as MALTA_LINEAGE,
  NAMED_HOLDS,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  OMITTED_STV_RELATIVE,
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
import { MaltaPreflightError, scanMaltaInventory, type MaltaInventory } from "./inventory";
import { projectMalta, type MaltaProjection } from "./project";
import { writeMaltaProjection } from "./write";

export type ImportMaltaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: MaltaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportMaltaResult = {
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

export function importMalta(options: ImportMaltaOptions): ImportMaltaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: MALTA_LINEAGE,
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

    let inventory: MaltaInventory;
    try {
      inventory = scanMaltaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof MaltaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: MALTA_LINEAGE,
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
      lineageId: MALTA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectMalta(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(MALTA_LINEAGE, inventory.fingerprint);
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
      writeMaltaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertMaltaFidelity(staging, projection);
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

export function assertMaltaFidelity(db: DatabaseSync, projection?: MaltaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [MALTA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [MALTA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [MALTA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [MALTA_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [MALTA_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [MALTA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [MALTA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [MALTA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [MALTA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [MALTA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [MALTA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [MALTA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [MALTA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [MALTA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [MALTA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [MALTA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [MALTA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [MALTA_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [MALTA_LINEAGE]);
  const evidence = countRows(db, "evidence_link", "lineage_id = ?", [MALTA_LINEAGE]);
  const councils = countRows(db, "office", "lineage_id = ? AND office_type = 'local_council'", [MALTA_LINEAGE]);
  const mayors = countRows(db, "office", "lineage_id = ? AND office_type = 'mayor'", [MALTA_LINEAGE]);
  const deputies = countRows(db, "office", "lineage_id = ? AND office_type = 'deputy_mayor'", [MALTA_LINEAGE]);
  const mayorEvents = countRows(
    db,
    "election_event",
    "lineage_id = ? AND office_id IN (SELECT office_id FROM office WHERE lineage_id = ? AND office_type IN ('mayor','deputy_mayor'))",
    [MALTA_LINEAGE, MALTA_LINEAGE],
  );

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
  if (councils !== EXPECTED_COUNTS.current_local_councils) throw new Error(`local councils ${councils}`);
  if (mayors !== EXPECTED_COUNTS.current_mayors) throw new Error(`mayors ${mayors}`);
  if (deputies !== EXPECTED_COUNTS.current_deputy_mayors) throw new Error(`deputy mayors ${deputies}`);
  if (mayorEvents !== 0) throw new Error("Mayor and deputy mayor offices must not gain election events");
  if (
    countRows(db, "office", "lineage_id = ? AND json_extract(raw_json, '$.row.standalone_popular_executive_ballot') = 1", [
      MALTA_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Standalone popular executive ballots must stay false");
  }
  if (countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [MALTA_LINEAGE]) !== 0) {
    throw new Error("Malta geographies must not gain effective dates or successor intervals");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [MALTA_LINEAGE, OMITTED_RESULTS_RELATIVE]) !== 0) {
    throw new Error("omitted results.json must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [MALTA_LINEAGE, OMITTED_STV_RELATIVE]) !== 0) {
    throw new Error("omitted stv-counts.json must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [MALTA_LINEAGE, `${OMITTED_SOURCES_DIR}%`]) !== 0) {
    throw new Error("omitted sources/ must not be a retained input");
  }
  for (const hold of NAMED_HOLDS) {
    const row = db
      .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
      .get(MALTA_LINEAGE, hold.token);
    if (!row || String(row.status) !== "open") {
      throw new Error(`Named hold ${hold.token} must stay open`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'malta'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Malta country projection mismatch");
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
    String(president.office_type) !== "head_of_state" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.selection_mode) !== "indirect_House_resolution"
  ) {
    throw new Error("President of Malta must stay an indirect national_context office");
  }
  if (countRows(db, "result_row", "lineage_id = ? AND office_id = ?", [MALTA_LINEAGE, PRESIDENT_ID]) !== 0) {
    throw new Error("Presidential House division tallies must stay missing");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "ep_delegation" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Malta EP delegation must stay other/needs_review");
  }
  const gozo = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(GOZO_CIVIC_ID);
  const gozoPresident = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(GOZO_CIVIC_PRESIDENT_ID);
  if (!gozo || String(gozo.office_status) !== "historical" || String(gozo.office_type) !== "historic_regional_council") {
    throw new Error("Gozo Civic Council must stay a historical regional council");
  }
  if (!gozoPresident || String(gozoPresident.office_status) !== "historical" || String(gozoPresident.office_type) !== "historic_regional_president") {
    throw new Error("Gozo Civic Council president must stay historical");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND legal_outcome != 'unknown'", [MALTA_LINEAGE]) !== 0) {
    throw new Error("Certified-versus-preliminary rows must stay legal_outcome unknown");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND ballot_basis != 'unknown'", [MALTA_LINEAGE]) !== 0) {
    throw new Error("Research ballot labels stay in raw_json; schema ballot_basis stays unknown");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [MALTA_LINEAGE]) !== 0) {
    throw new Error("Next dates must stay unknown; calendar exact days are null");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(MALTA_LINEAGE, projection.release.release_id);
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
        `Slim Malta fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(MALTA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Malta tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [MALTA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
