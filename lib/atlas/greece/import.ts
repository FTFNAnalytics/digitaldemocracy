import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_NAME,
  EP_1981_HISTORY_KEY,
  EP_ID,
  EXPECTED_COUNTS,
  LINEAGE_ID as GREECE_LINEAGE,
  LOCAL_SOURCE_HOLD_AUTHORITIES,
  MESSINI_COUNCIL_ID,
  MESSINI_HISTORY_KEY,
  MESSINI_MAYOR_ID,
  NAMED_HOLDS,
  OMITTED_SOURCES_DIR,
  PARLIAMENT_ID,
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
import { GreecePreflightError, scanGreeceInventory, type GreeceInventory } from "./inventory";
import { projectGreece, type GreeceProjection } from "./project";
import { writeGreeceProjection } from "./write";

export type ImportGreeceOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: GreeceProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportGreeceResult = {
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

export function importGreece(options: ImportGreeceOptions): ImportGreeceResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: GREECE_LINEAGE,
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

    let inventory: GreeceInventory;
    try {
      inventory = scanGreeceInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof GreecePreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: GREECE_LINEAGE,
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
      lineageId: GREECE_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectGreece(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(GREECE_LINEAGE, inventory.fingerprint);
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
      writeGreeceProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertGreeceFidelity(staging, projection);
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

export function assertGreeceFidelity(db: DatabaseSync, projection?: GreeceProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [GREECE_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [GREECE_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [GREECE_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [GREECE_LINEAGE]);
  const selected = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'selected'", [GREECE_LINEAGE]);
  const prospective = countRows(db, "election_event", "lineage_id = ? AND selected_history_role = 'none'", [GREECE_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [GREECE_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [GREECE_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [GREECE_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [GREECE_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [GREECE_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [GREECE_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [GREECE_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [GREECE_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [GREECE_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [GREECE_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [GREECE_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [GREECE_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [GREECE_LINEAGE]);
  const evidence = countRows(db, "evidence_link", "lineage_id = ?", [GREECE_LINEAGE]);
  const currentDirect = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'current' AND office_type IN ('mayor','regional_governor')",
    [GREECE_LINEAGE],
  );
  const historicalDirect = countRows(
    db,
    "office",
    "lineage_id = ? AND office_status = 'historical' AND office_type IN ('mayor','regional_governor')",
    [GREECE_LINEAGE],
  );

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
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
  if (sources !== 0) throw new Error(`source count ${sources}; omitted sources/ must not be invented`);
  if (proceedings !== EXPECTED_COUNTS.proceedings) throw new Error(`proceeding count ${proceedings}`);
  if (parties !== 0) throw new Error("party_mappings must be 0");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== EXPECTED_COUNTS.identity_crosswalks) throw new Error(`identity crosswalk count ${crosswalks}`);
  if (evidence !== 0) throw new Error("evidence links must stay empty while source bytes are omitted");
  if (currentDirect !== EXPECTED_COUNTS.current_direct_executive_offices) throw new Error(`current direct executive count ${currentDirect}`);
  if (historicalDirect !== EXPECTED_COUNTS.historical_direct_executive_offices) {
    throw new Error(`historical direct executive count ${historicalDirect}`);
  }
  if (countRows(db, "proceeding", "lineage_id = ? AND supersedes_id IS NOT NULL", [GREECE_LINEAGE]) !== 0) {
    throw new Error("No Greece proceeding supersession edge is authored");
  }
  if (
    countRows(
      db,
      "identity_crosswalk",
      "lineage_id = ? AND (reason LIKE '%successor edge%' OR upstream_id LIKE '%successor%')",
      [GREECE_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Identity crosswalk must not assert Kallikratis or Kleisthenis successor edges");
  }
  for (const hold of NAMED_HOLDS) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [GREECE_LINEAGE, hold.token]) !== 1) {
      throw new Error(`Named hold ${hold.token} must remain unresolved`);
    }
  }
  for (const authority of LOCAL_SOURCE_HOLD_AUTHORITIES) {
    if (countRows(db, "unresolved_evidence", "lineage_id = ? AND original_token = ?", [GREECE_LINEAGE, authority]) !== 1) {
      throw new Error(`Local source hold ${authority} must remain unresolved`);
    }
  }
  const g04 = db
    .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE original_token = 'GR-G04'")
    .get();
  if (!g04 || String(g04.status) !== "partially_resolved") {
    throw new Error("GR-G04 must stay partially_resolved and unresolved");
  }
  const g09 = db
    .prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE original_token = 'GR-G09'")
    .get();
  if (!g09 || String(g09.status) !== "review_required") {
    throw new Error("GR-G09 must stay review_required and unresolved");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [GREECE_LINEAGE, `${OMITTED_SOURCES_DIR}%`]) !== 0) {
    throw new Error("omitted sources/ must not be a retained input");
  }

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'greece'")
    .get();
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Greece country projection mismatch");
  }

  const president = db
    .prepare(
      "SELECT o.office_type, o.next_date_id, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive, json_extract(o.raw_json, '$.row.election_mechanism') AS election_mechanism FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(PRESIDENT_ID);
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_executive) !== 0 ||
    String(president.election_mechanism) !== "parliamentary_indirect" ||
    president.next_date_id != null
  ) {
    throw new Error("Presidency must stay parliamentary_indirect national_context needs_review");
  }
  if (
    countRows(db, "election_event", "lineage_id = ? AND office_id = ? AND ballot_basis != 'electors'", [GREECE_LINEAGE, PRESIDENT_ID]) !==
    0
  ) {
    throw new Error("Presidential events must stay elector ballots");
  }
  if (countRows(db, "result_row", "lineage_id = ? AND office_id = ? AND share IS NOT NULL", [GREECE_LINEAGE, PRESIDENT_ID]) !== 0) {
    throw new Error("Presidential results must not gain a popular share");
  }
  const ep = db
    .prepare(
      "SELECT o.office_type, t.tier, t.review_status, json_extract(o.raw_json, '$.row.direct_executive') AS direct_executive FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_type) !== "european_parliament" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review" || Number(ep.direct_executive) !== 0) {
    throw new Error("Greece EP delegation must stay other/needs_review");
  }
  const parliament = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(PARLIAMENT_ID);
  if (!parliament || String(parliament.office_type) !== "parliament") throw new Error("GR-PARL must stay parliament");
  if (
    countRows(db, "result_row", "lineage_id = ? AND office_id = ? AND history_key = ?", [GREECE_LINEAGE, EP_ID, EP_1981_HISTORY_KEY]) !==
    0
  ) {
    throw new Error("1981 EP event must stay without an invented return vector");
  }
  const messiniTie = countRows(
    db,
    "result_row",
    "lineage_id = ? AND office_id = ? AND history_key = ? AND votes = 9236 AND elected_flag IS NULL",
    [GREECE_LINEAGE, MESSINI_MAYOR_ID, MESSINI_HISTORY_KEY],
  );
  if (messiniTie !== 2) throw new Error(`Messini 2014 tie rows ${messiniTie}`);
  const messiniSeats = db
    .prepare(
      "SELECT COALESCE(SUM(seats), 0) AS n FROM result_row WHERE lineage_id = ? AND office_id = ? AND history_key = ?",
    )
    .get(GREECE_LINEAGE, MESSINI_COUNCIL_ID, MESSINI_HISTORY_KEY);
  if (Number(messiniSeats?.n) !== 17) throw new Error("Messini 2014 council allocation must stay 17 published seats");
  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type LIKE '%prefect%' OR office_type LIKE '%cabinet%' OR office_type LIKE '%prime%' OR name LIKE '%Πρωθυπουργ%')",
      [GREECE_LINEAGE],
    ) !== 0
  ) {
    throw new Error("Prefect, prime minister, or cabinet offices must not be invented");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(GREECE_LINEAGE, projection.release.release_id);
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
        `Slim Greece fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(GREECE_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Greece tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [GREECE_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const outgoing = db
      .prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(GREECE_LINEAGE, "data/research/greece/EP-outgoing-snapshot-NOT-election-results.json");
    if (!outgoing) throw new Error("EP outgoing snapshot must stay a retained input and not a result table");
  }
}
