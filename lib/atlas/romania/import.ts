import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  ANNULLED_EVENT_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as ROMANIA_LINEAGE,
  NAMED_HOLDS,
  OMITTED_EVENTS_JSON,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
  ZERO_SEAT_RESULT_ID,
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
import { RomaniaPreflightError, scanRomaniaInventory, type RomaniaInventory } from "./inventory";
import { projectRomania, type RomaniaProjection } from "./project";
import { writeRomaniaProjection } from "./write";

export type ImportRomaniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: RomaniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportRomaniaResult = {
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

export function importRomania(options: ImportRomaniaOptions): ImportRomaniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ROMANIA_LINEAGE,
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

    let inventory: RomaniaInventory;
    try {
      inventory = scanRomaniaInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof RomaniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ROMANIA_LINEAGE,
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
      lineageId: ROMANIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectRomania(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ROMANIA_LINEAGE, inventory.fingerprint);
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
      writeRomaniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertRomaniaFidelity(staging, projection);
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

export function assertRomaniaFidelity(db: DatabaseSync, projection?: RomaniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [ROMANIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [ROMANIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [ROMANIA_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [ROMANIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ROMANIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ROMANIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [ROMANIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ROMANIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [ROMANIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [ROMANIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [ROMANIA_LINEAGE]);
  const directExec = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type IN ('mayor','county_president','sector_mayor','bucharest_general_mayor','president')",
    [ROMANIA_LINEAGE],
  );
  const councils = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type IN ('local_council','county_council','sector_council','bucharest_general_council','national_chamber')",
    [ROMANIA_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== 0) throw new Error(`historical office count ${historical}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error("identity crosswalks must stay empty; no successor edges");
  if (directExec !== EXPECTED_COUNTS.direct_executive_offices) throw new Error(`direct executive count ${directExec}`);
  if (councils !== EXPECTED_COUNTS.council_assembly_offices) throw new Error(`council/assembly count ${councils}`);
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [ROMANIA_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path = ?", [ROMANIA_LINEAGE, OMITTED_EVENTS_JSON]) !== 0) {
    throw new Error("omitted uncompressed events.json must not be a retained input");
  }
  if (countRows(db, "election_event", "lineage_id = ? AND legal_outcome = 'annulled'", [ROMANIA_LINEAGE]) !== 1) {
    throw new Error("Exactly one annulled event is authored");
  }
  if (
    countRows(
      db,
      "election_event",
      "lineage_id = ? AND office_id LIKE '%-P' AND event_id LIKE '%2016%'",
      [ROMANIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("2016 county-president popular events must stay absent");
  }
  if (
    countRows(
      db,
      "result_row",
      "lineage_id = ? AND office_id NOT IN ('RO-SEN','RO-CD','RO-EP','RO-PRES')",
      [ROMANIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Local result rows must stay absent");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'romania'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Romania country projection mismatch");
  }

  const president = db
    .prepare(
      "SELECT o.office_type, o.next_date_id, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_election') AS direct_election FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_election) !== 1 ||
    president.next_date_id != null
  ) {
    throw new Error("Presidency must stay a directly elected national_context needs_review row");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_election') AS direct_election FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "european_parliament_delegation" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review" || Number(ep.direct_election) !== 0) {
    throw new Error("Romania EP delegation must stay other/needs_review with direct_election false");
  }
  const annulled = db
    .prepare("SELECT legal_outcome, event_kind, history_key, electoral_system FROM election_event WHERE event_id = ?")
    .get(ANNULLED_EVENT_ID);
  if (
    !annulled ||
    String(annulled.legal_outcome) !== "annulled" ||
    String(annulled.event_kind) !== "ordinary" ||
    String(annulled.history_key) !== ANNULLED_EVENT_ID ||
    annulled.electoral_system != null
  ) {
    throw new Error("2024 presidential first round must stay annulled without a successor edge");
  }
  if (countRows(db, "proceeding", "lineage_id = ? AND supersedes_id IS NOT NULL", [ROMANIA_LINEAGE]) !== 0) {
    throw new Error("No Romania proceeding supersession edge is authored");
  }
  const zeroSeat = db
    .prepare("SELECT seats, seats_status, votes, votes_status, share FROM result_row WHERE result_row_id = ?")
    .get(ZERO_SEAT_RESULT_ID);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero" || zeroSeat.votes != null || String(zeroSeat.votes_status) !== "unknown") {
    throw new Error("EP Other parties explicit zero seats must stay zero, and missing votes must stay null");
  }
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%prefect%' OR office_type LIKE '%cabinet%' OR name LIKE '%Prim-ministru%' OR name LIKE '%Guvern%')",
      [ROMANIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Prefect, prime minister, or cabinet offices must not be invented");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ROMANIA_LINEAGE, projection.release.release_id);
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
      throw new Error("Slim Romania fingerprint does not match the pinned candidate release");
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(ROMANIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Romania tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ROMANIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
  }
}
