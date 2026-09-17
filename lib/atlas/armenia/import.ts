import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BOUNDARY_CALENDAR_REVIEW_OFFICES,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  FORBIDDEN_VEDI_TOKEN,
  LINEAGE_ID as ARMENIA_LINEAGE,
  MAYOR_OFFICE_IDS,
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
import { ArmeniaPreflightError, scanArmeniaInventory, type ArmeniaInventory } from "./inventory";
import { projectArmenia, type ArmeniaProjection } from "./project";
import { writeArmeniaProjection } from "./write";

export type ImportArmeniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: ArmeniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportArmeniaResult = {
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

export function importArmenia(options: ImportArmeniaOptions): ImportArmeniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ARMENIA_LINEAGE,
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

    let inventory: ArmeniaInventory;
    try {
      inventory = scanArmeniaInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof ArmeniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ARMENIA_LINEAGE,
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
      lineageId: ARMENIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectArmenia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ARMENIA_LINEAGE, inventory.fingerprint);
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
      writeArmeniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertArmeniaFidelity(staging, projection);
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

export function assertArmeniaFidelity(db: DatabaseSync, projection?: ArmeniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [ARMENIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [ARMENIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [ARMENIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ARMENIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ARMENIA_LINEAGE]);
  const calledDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'called'",
    [ARMENIA_LINEAGE],
  );
  const unknownDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'unknown'",
    [ARMENIA_LINEAGE],
  );
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== 63 || calledDates !== 30 || unknownDates !== 33) {
    throw new Error(`date certainty counts ${dates}/${calledDates}/${unknownDates}`);
  }

  const regionalQuery = db
    .prepare(
      `SELECT o.office_id FROM office o
       JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       WHERE o.country_id = 'armenia' AND t.tier = 'regional'`,
    )
    .all();
  if (regionalQuery.length !== 0) {
    throw new Error("Armenia regional calendar must be empty");
  }

  const country = db.prepare("SELECT country_code, polity_kind, region_id FROM country WHERE country_id = 'armenia'").get();
  if (!country || country.country_code != null || String(country.polity_kind) !== "sovereign_country" || String(country.region_id) !== "europe") {
    throw new Error("Armenia country projection mismatch");
  }

  const forbidden = db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(FORBIDDEN_VEDI_TOKEN);
  if (forbidden) throw new Error("Unsuffixed Vedi token must not be an office");
  const forbiddenAlias = db
    .prepare("SELECT 1 AS ok FROM identity_crosswalk WHERE upstream_id = ?")
    .get(FORBIDDEN_VEDI_TOKEN);
  if (forbiddenAlias) throw new Error("Unsuffixed Vedi token must not be an alias");

  for (const mayorId of MAYOR_OFFICE_IDS) {
    const mayor = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(mayorId);
    if (!mayor || String(mayor.office_type) !== "Mayor") {
      throw new Error(`Existing mayor ${mayorId} missing`);
    }
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_OFFICES)) {
    const office = db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId) {
      throw new Error(`${officeId} geography mismatch`);
    }
  }

  const akhuryan = db
    .prepare("SELECT next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
    .get("AM-AKHURYAN-C");
  if (
    !akhuryan ||
    String(akhuryan.next_history_key) !== "next-6fdd004459069a780b5f2d39" ||
    String(akhuryan.next_date_resolution) !== "resolved"
  ) {
    throw new Error("AM-AKHURYAN-C next-event pointer mismatch");
  }
  const called = db
    .prepare("SELECT label, precision, certainty, year, month, day, range_start_id, range_end_id FROM research_date WHERE date_id = ?")
    .get(String(akhuryan.next_date_id));
  if (
    !called ||
    String(called.label) !== "2026-10-25" ||
    String(called.precision) !== "day" ||
    String(called.certainty) !== "called" ||
    Number(called.year) !== 2026 ||
    Number(called.month) !== 10 ||
    Number(called.day) !== 25 ||
    called.range_start_id != null ||
    called.range_end_id != null
  ) {
    throw new Error("AM-AKHURYAN-C called date mismatch");
  }

  for (const officeId of BOUNDARY_CALENDAR_REVIEW_OFFICES) {
    const office = db
      .prepare("SELECT next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
      .get(officeId);
    if (!office || office.next_date_id != null || office.next_history_key != null || String(office.next_date_resolution) !== "unknown") {
      throw new Error(`${officeId} must keep unknown next date`);
    }
  }

  const vedi2022 = db
    .prepare("SELECT event_id, history_key, event_kind, selected_history_role FROM election_event WHERE event_id = ?")
    .get("event-3709c57863b238002e1c27a2");
  if (
    !vedi2022 ||
    String(vedi2022.history_key) !== "AM-VEDI-C::2022::2022-03-27" ||
    String(vedi2022.event_kind) !== "special" ||
    String(vedi2022.selected_history_role) !== "selected"
  ) {
    throw new Error("Vedi 2022 replacement event mismatch");
  }
  const vedi2021 = db
    .prepare("SELECT history_key, event_kind, legal_outcome FROM election_event WHERE event_id = ?")
    .get("event-af17499c6f00b387a428f510");
  if (
    !vedi2021 ||
    String(vedi2021.history_key) !== "AM-VEDI-C::2021::2021-12-05" ||
    String(vedi2021.event_kind) !== "ordinary" ||
    String(vedi2021.legal_outcome) !== "preliminary"
  ) {
    throw new Error("Vedi 2021 ordinary event mismatch");
  }
  const extra2016 = db
    .prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ? AND history_key LIKE 'AM-VEDI-C::2016::%'")
    .get(ARMENIA_LINEAGE);
  if (Number(extra2016?.n) !== 0) {
    throw new Error("Vedi 2016 predecessor context must not become a selected event");
  }

  const seatsOnly = db
    .prepare(
      "SELECT candidate_or_list_label, votes, votes_status, share, share_status, seats, seats_status, elected_flag, is_substitute FROM result_row WHERE result_row_id = ?",
    )
    .get("event-3709c57863b238002e1c27a2-r0");
  if (
    !seatsOnly ||
    String(seatsOnly.candidate_or_list_label) !== "Civil Contract" ||
    seatsOnly.votes != null ||
    String(seatsOnly.votes_status) !== "unknown" ||
    seatsOnly.share != null ||
    String(seatsOnly.share_status) !== "unknown" ||
    Number(seatsOnly.seats) !== 16 ||
    String(seatsOnly.seats_status) !== "recorded" ||
    seatsOnly.elected_flag != null ||
    seatsOnly.is_substitute != null
  ) {
    throw new Error("Vedi seats-only r0 mismatch");
  }

  const partial = db
    .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get("event-d9c3dd52ffb136ac20ac08b9-r0");
  if (
    !partial ||
    Number(partial.votes) !== 2299 ||
    String(partial.votes_status) !== "recorded" ||
    partial.share != null ||
    String(partial.share_status) !== "unknown" ||
    partial.seats != null ||
    String(partial.seats_status) !== "unknown"
  ) {
    throw new Error("Tsaghkahovit partial-count r0 mismatch");
  }

  const fingerprintRow = db
    .prepare("SELECT fingerprint_sha256 FROM dataset_release WHERE lineage_id = ?")
    .get(ARMENIA_LINEAGE);
  const isFrozenBaseline = String(fingerprintRow?.fingerprint_sha256) === CANDIDATE_FINGERPRINT;
  if (isFrozenBaseline) {
    const nullVotes = countRows(db, "result_row", "lineage_id = ? AND votes IS NULL AND votes_status = 'unknown'", [ARMENIA_LINEAGE]);
    const nullShares = countRows(db, "result_row", "lineage_id = ? AND share IS NULL AND share_status = 'unknown'", [ARMENIA_LINEAGE]);
    const nullSeats = countRows(db, "result_row", "lineage_id = ? AND seats IS NULL AND seats_status = 'unknown'", [ARMENIA_LINEAGE]);
    const zeroNumeric = countRows(
      db,
      "result_row",
      "lineage_id = ? AND (votes = 0 OR share = 0 OR seats = 0)",
      [ARMENIA_LINEAGE],
    );
    if (nullVotes !== 2 || nullShares !== 20 || nullSeats !== 95 || zeroNumeric !== 0) {
      throw new Error(`Armenia missing/zero counts ${nullVotes}/${nullShares}/${nullSeats}/${zeroNumeric}`);
    }
    const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ARMENIA_LINEAGE]);
    if (unresolved !== 0) throw new Error(`Frozen baseline unresolved_evidence ${unresolved}`);
    const controlInput = db
      .prepare(
        "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/armenia/unpacked/tables/governing-control.json'",
      )
      .get(ARMENIA_LINEAGE);
    const pollInput = db
      .prepare(
        "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/armenia/unpacked/tables/polling-evidence.json'",
      )
      .get(ARMENIA_LINEAGE);
    if (controlInput || pollInput) {
      throw new Error("Absent optional observation tables must not be fabricated");
    }
  }

  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:armenia' AND upstream_id = ?",
    )
    .get("armenia--url-80d015195f108a8bd7b8de20");
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'armenia:source-catalogue' AND upstream_id = ?",
    )
    .get("S33ef796aa5");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to S33ef796aa5");
  }

  const source = db
    .prepare("SELECT publisher, title, url, data_rights FROM source WHERE source_id = ?")
    .get("armenia--S33ef796aa5");
  if (
    !source ||
    source.publisher != null ||
    String(source.title) !== "CEC October 25, 2026 community schedule" ||
    String(source.url) !== "https://news.am/en/news/1056666" ||
    String(source.data_rights) !== "unknown"
  ) {
    throw new Error("S33ef796aa5 source projection mismatch");
  }

  const inline = db
    .prepare("SELECT title, publisher, checked_as_of_label, evidence_grade, url FROM source WHERE source_id = ?")
    .get("armenia--url-45e690d8d677bdccd9b32e52");
  if (
    !inline ||
    inline.title != null ||
    inline.publisher != null ||
    inline.checked_as_of_label != null ||
    inline.evidence_grade != null ||
    String(inline.url) !== "https://www.crrc.am/publications/public-perceptions-of-democracy/"
  ) {
    throw new Error("Inline CRRC screening source mismatch");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ARMENIA_LINEAGE, projection.release.release_id);
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
      .get(ARMENIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Armenia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [ARMENIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
