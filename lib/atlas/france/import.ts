import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  AN_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CHATAIN_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_STATUS,
  LINEAGE_ID as FRANCE_LINEAGE,
  LYON_METRO_ID,
  MAYOTTE_ID,
  NAMED_HOLDS,
  OMITTED_EVENTS_RELATIVE,
  OMITTED_REPORTING_UNITS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PARIS_HISTORICAL_ID,
  PARIS_ID,
  PRESIDENT_ID,
  SENATE_ID,
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
import { FrancePreflightError, scanFranceInventory, type FranceInventory } from "./inventory";
import { projectFrance, type FranceProjection } from "./project";
import { writeFranceProjection } from "./write";

export type ImportFranceOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: FranceProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportFranceResult = {
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

export function importFrance(options: ImportFranceOptions): ImportFranceResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: FRANCE_LINEAGE,
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

    let inventory: FranceInventory;
    try {
      inventory = scanFranceInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof FrancePreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: FRANCE_LINEAGE,
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
      lineageId: FRANCE_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectFrance(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(FRANCE_LINEAGE, inventory.fingerprint);
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
      writeFranceProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertFranceFidelity(staging, projection);
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

export function assertFranceFidelity(db: DatabaseSync, projection?: FranceProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [FRANCE_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [FRANCE_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [FRANCE_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [FRANCE_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [FRANCE_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [FRANCE_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [FRANCE_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [FRANCE_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [FRANCE_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [FRANCE_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [FRANCE_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [FRANCE_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [FRANCE_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [FRANCE_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [FRANCE_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [FRANCE_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [FRANCE_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [FRANCE_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [FRANCE_LINEAGE]);
  const evidence = countRows(db, "evidence_link", "lineage_id = ?", [FRANCE_LINEAGE]);
  const yearOnly = countRows(db, "research_date", "lineage_id = ? AND precision = 'year'", [FRANCE_LINEAGE]);
  const monthDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'month'", [FRANCE_LINEAGE]);
  const dayDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'day'", [FRANCE_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; slim land must publish 0 event rows`);
  if (selected !== 0) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== 0) throw new Error(`result count ${results}; slim land must publish 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== 0) throw new Error(`other tier count ${otherTier}; FR-EP must stay national_context`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error(`source count ${sources}; omitted sources/ must not be invented`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; the crosswalk must stay empty`);
  if (evidence !== 0) throw new Error("evidence links must stay empty while source bytes are omitted");
  if (yearOnly !== EXPECTED_COUNTS.year_only_dates) throw new Error(`year-only dates ${yearOnly}`);
  if (monthDates !== EXPECTED_COUNTS.month_dates) throw new Error(`month dates ${monthDates}`);
  if (dayDates !== EXPECTED_COUNTS.day_dates) throw new Error(`day dates ${dayDates}`);
  if (countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL)", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("France geographies must not gain effective dates or successor intervals");
  }
  for (const rel of [OMITTED_RESULTS_RELATIVE, OMITTED_EVENTS_RELATIVE, OMITTED_REPORTING_UNITS_RELATIVE]) {
    if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [FRANCE_LINEAGE, rel]) !== 0) {
      throw new Error(`omitted ${rel} must not be a retained input`);
    }
  }
  if (
    countRows(db, "retained_input", "lineage_id = ? AND (input_path = ? OR input_path LIKE ?)", [
      FRANCE_LINEAGE,
      OMITTED_SOURCES_DIR,
      `${OMITTED_SOURCES_DIR}/%`,
    ]) !== 0
  ) {
    throw new Error("omitted sources/ must not be a retained input");
  }
  for (const hold of NAMED_HOLDS) {
    const row = db
      .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
      .get(FRANCE_LINEAGE, hold.token);
    if (!row || String(row.status) !== HOLD_STATUS) {
      throw new Error(`Named hold ${hold.token} must stay ${HOLD_STATUS}`);
    }
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'france'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("France country projection mismatch");
  }

  const an = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(AN_ID);
  if (!an || String(an.office_type) !== "national_lower_house" || String(an.tier) !== "national_context" || String(an.review_status) !== "needs_review") {
    throw new Error("Assemblée nationale must stay national_context needs_review");
  }
  const senate = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.selection_mode') AS selection_mode FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(SENATE_ID);
  if (
    !senate ||
    String(senate.office_type) !== "national_upper_house" ||
    String(senate.tier) !== "national_context" ||
    String(senate.review_status) !== "needs_review" ||
    String(senate.selection_mode) !== "indirect_electoral_college"
  ) {
    throw new Error("Sénat must stay an indirect national_context office");
  }
  const president = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.selection_mode') AS selection_mode, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    String(president.selection_mode) !== "direct_popular" ||
    Number(president.direct_executive) !== 1
  ) {
    throw new Error("President of France must stay the single direct national_context office");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "european_parliament_delegation" || String(ep.tier) !== "national_context" || String(ep.review_status) !== "needs_review") {
    throw new Error("France EP delegation must stay national_context/needs_review");
  }
  const lyon = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(LYON_METRO_ID);
  if (!lyon || String(lyon.office_type) !== "metropolitan_council" || String(lyon.tier) !== "regional" || String(lyon.review_status) !== "needs_review") {
    throw new Error("Métropole de Lyon must stay a regional metropolitan council");
  }
  const mayotte = db.prepare("SELECT office_type, office_status, geography_id FROM office WHERE office_id = ?").get(MAYOTTE_ID);
  if (!mayotte || String(mayotte.office_type) !== "departmental_council" || String(mayotte.office_status) !== "current") {
    throw new Error("Mayotte must stay the single current transitional departmental council");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_type = 'mayor'", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("No popular mayor office may be invented");
  }
  const paris = db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = ?").get(PARIS_ID);
  const parisHistorical = db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = ?").get(PARIS_HISTORICAL_ID);
  if (!paris || String(paris.office_status) !== "current" || !parisHistorical || String(parisHistorical.office_status) !== "historical") {
    throw new Error("Paris current and historical councils must both stay");
  }
  if (String(paris.geography_id) === String(parisHistorical.geography_id)) {
    throw new Error("Current and historical Paris must not share a successor geography");
  }
  const chatain = db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(CHATAIN_ID);
  if (!chatain || String(chatain.office_type) !== "municipal_council" || String(chatain.office_status) !== "current") {
    throw new Error("Chatain must stay a current municipal council");
  }
  if (countRows(db, "result_row", "lineage_id = ? AND office_id = ?", [FRANCE_LINEAGE, CHATAIN_ID]) !== 0) {
    throw new Error("Chatain empty list label must not become an invented result row");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("Calendar next dates must not become election events");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution = 'resolved'", [FRANCE_LINEAGE]) !== EXPECTED_COUNTS.research_dates) {
    throw new Error("Resolved next dates must match the authored calendar dates");
  }
  if (countRows(db, "research_date", "lineage_id = ? AND precision = 'year' AND (month IS NOT NULL OR day IS NOT NULL)", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("Year-only France dates must not gain a month or day");
  }
  if (countRows(db, "research_date", "lineage_id = ? AND precision = 'month' AND day IS NOT NULL", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("Month-precision France dates must not gain a day");
  }
  if (countRows(db, "research_date", "lineage_id = ? AND precision = 'year' AND certainty = 'called'", [FRANCE_LINEAGE]) !== 0) {
    throw new Error("The unpinned presidential year must not become a called poll");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(FRANCE_LINEAGE, projection.release.release_id);
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
        `Slim France fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(FRANCE_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("France tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [FRANCE_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
