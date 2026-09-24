import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BERDORF_EVENT_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_1994_EVENT_ID,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as LUXEMBOURG_LINEAGE,
  MERGER_UPSTREAM_NAMESPACE,
  NAMED_HOLDS,
  OBSERVATIONS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PARLIAMENT_ID,
  RESOLVED_EXCLUSIONS,
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
import { LuxembourgPreflightError, scanLuxembourgInventory, type LuxembourgInventory } from "./inventory";
import { projectLuxembourg, type LuxembourgProjection } from "./project";
import { writeLuxembourgProjection } from "./write";

export type ImportLuxembourgOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: LuxembourgProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportLuxembourgResult = {
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

export function importLuxembourg(options: ImportLuxembourgOptions): ImportLuxembourgResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: LUXEMBOURG_LINEAGE,
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

    let inventory: LuxembourgInventory;
    try {
      inventory = scanLuxembourgInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof LuxembourgPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: LUXEMBOURG_LINEAGE,
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
      lineageId: LUXEMBOURG_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectLuxembourg(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(LUXEMBOURG_LINEAGE, inventory.fingerprint);
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
      writeLuxembourgProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertLuxembourgFidelity(staging, projection);
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

export function assertLuxembourgFidelity(db: DatabaseSync, projection?: LuxembourgProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [LUXEMBOURG_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [LUXEMBOURG_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [LUXEMBOURG_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [LUXEMBOURG_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LUXEMBOURG_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LUXEMBOURG_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [LUXEMBOURG_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [LUXEMBOURG_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [LUXEMBOURG_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [LUXEMBOURG_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const evidence = countRows(db, "evidence_link", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
  const direct = countRows(db, "office", "lineage_id = ? AND office_type IN ('mayor','bourgmestre','grand_duke','president')", [
    LUXEMBOURG_LINEAGE,
  ]);
  const currentCouncils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type = 'communal_council'",
    [LUXEMBOURG_LINEAGE],
  );
  const historicalCouncils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'historical' AND office_type = 'communal_council'",
    [LUXEMBOURG_LINEAGE],
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
  if (regional !== 0) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error(`source count ${sources}; omitted sources/ must not be invented`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== EXPECTED_COUNTS.explicit_predecessor_edges) throw new Error(`predecessor edge count ${crosswalks}`);
  if (evidence !== 0) throw new Error("evidence links must stay empty while source bytes are omitted");
  if (direct !== 0) throw new Error(`direct executive count ${direct}`);
  if (currentCouncils !== EXPECTED_COUNTS.current_communal_councils) throw new Error(`current communal councils ${currentCouncils}`);
  if (historicalCouncils !== EXPECTED_COUNTS.historical_communal_councils) {
    throw new Error(`historical communal councils ${historicalCouncils}`);
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%mayor%' OR office_type LIKE '%duke%' OR office_type LIKE '%president%' OR name LIKE '%Grand-Duc%' OR name LIKE '%Grand Duc%' OR name LIKE '%Bourgmestre%')",
      [LUXEMBOURG_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Grand Duke, mayor, or presidential offices must not be invented");
  }
  if (countRows(db, "identity_crosswalk", "lineage_id = ? AND upstream_namespace != ?", [LUXEMBOURG_LINEAGE, MERGER_UPSTREAM_NAMESPACE]) !== 0) {
    throw new Error("Identity crosswalk must stay the explicit predecessor edges");
  }
  if (countRows(db, "result_row", "lineage_id = ? AND (history_key = ? OR office_id = ?)", [LUXEMBOURG_LINEAGE, EP_1994_EVENT_ID, EP_ID]) !== 0) {
    throw new Error("1994 EP Grevenmacher LSAP votes must stay missing");
  }
  for (const hold of NAMED_HOLDS) {
    const row = db
      .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
      .get(LUXEMBOURG_LINEAGE, hold.token);
    if (!row || String(row.status) !== hold.status) {
      throw new Error(`Named hold ${hold.token} must stay ${hold.status}`);
    }
  }
  for (const exclusion of RESOLVED_EXCLUSIONS) {
    const row = db
      .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
      .get(LUXEMBOURG_LINEAGE, exclusion.token);
    if (!row || String(row.status) !== "resolved_exclusion") {
      throw new Error(`${exclusion.token} must stay a resolved exclusion`);
    }
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [LUXEMBOURG_LINEAGE, OMITTED_RESULTS_RELATIVE]) !== 0) {
    throw new Error("omitted results.json must not be a retained input");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [LUXEMBOURG_LINEAGE, `${OMITTED_SOURCES_DIR}%`]) !== 0) {
    throw new Error("omitted sources/ must not be a retained input");
  }
  const observations = db
    .prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?")
    .get(LUXEMBOURG_LINEAGE, OBSERVATIONS_RELATIVE);
  if (!observations) throw new Error("observations.json must stay a retained envelope file, not a result table");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'luxembourg'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Luxembourg country projection mismatch");
  }

  const parliament = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PARLIAMENT_ID);
  if (!parliament || String(parliament.office_type) !== "parliament" || String(parliament.tier) !== "national_context" || String(parliament.review_status) !== "needs_review") {
    throw new Error("Chambre des Députés must stay national_context needs_review");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "ep_delegation" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Luxembourg EP delegation must stay other/needs_review");
  }
  const ep1994 = db
    .prepare(
      "SELECT e.legal_outcome, d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.event_id = ?",
    )
    .get(EP_1994_EVENT_ID);
  if (!ep1994 || String(ep1994.precision) !== "year" || ep1994.month != null || ep1994.day != null || String(ep1994.legal_outcome) !== "unknown") {
    throw new Error("1994 EP event must stay a year-only label");
  }
  const berdorf = db
    .prepare(
      "SELECT legal_outcome, json_extract(raw_json, '$.row.result_status') AS result_status FROM election_event WHERE event_id = ?",
    )
    .get(BERDORF_EVENT_ID);
  if (!berdorf || String(berdorf.legal_outcome) !== "unknown" || String(berdorf.result_status) !== "official_proclamation") {
    throw new Error("Berdorf 2023 proclamation must stay unofficial-to-certified unpromoted");
  }
  const yearOnly = countRows(db, "research_date", "lineage_id = ? AND precision = 'year'", [LUXEMBOURG_LINEAGE]);
  if (yearOnly !== EXPECTED_COUNTS.year_only_events) throw new Error(`year-only dates ${yearOnly}`);
  if (countRows(db, "research_date", "lineage_id = ? AND precision = 'year' AND (month IS NOT NULL OR day IS NOT NULL)", [LUXEMBOURG_LINEAGE]) !== 0) {
    throw new Error("Year-only dates must not gain a 1 January fill");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(LUXEMBOURG_LINEAGE, projection.release.release_id);
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
        `Slim Luxembourg fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(LUXEMBOURG_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Luxembourg tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [LUXEMBOURG_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
