import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  LINEAGE_ID as ALDERNEY_LINEAGE,
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
import { AlderneyPreflightError, scanAlderneyInventory, type AlderneyInventory } from "./inventory";
import { projectAlderney, type AlderneyProjection } from "./project";
import { writeAlderneyProjection } from "./write";

export type ImportAlderneyOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: AlderneyProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportAlderneyResult = {
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

export function importAlderney(options: ImportAlderneyOptions): ImportAlderneyResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: ALDERNEY_LINEAGE,
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

    let inventory: AlderneyInventory;
    try {
      inventory = scanAlderneyInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof AlderneyPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: ALDERNEY_LINEAGE,
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
      lineageId: ALDERNEY_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectAlderney(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(ALDERNEY_LINEAGE, inventory.fingerprint);
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
      writeAlderneyProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertAlderneyFidelity(staging, projection);
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

export function assertAlderneyFidelity(db: DatabaseSync, projection?: AlderneyProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [ALDERNEY_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [ALDERNEY_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const other = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [ALDERNEY_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [ALDERNEY_LINEAGE]);
  const municipal = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'municipal'",
    [ALDERNEY_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [ALDERNEY_LINEAGE]);
  const conditionalDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'conditional'",
    [ALDERNEY_LINEAGE],
  );
  const unknownDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'unknown'",
    [ALDERNEY_LINEAGE],
  );
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (other !== EXPECTED_COUNTS.other_offices) throw new Error(`other count ${other}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== 8 || conditionalDates !== 2 || unknownDates !== 6) {
    throw new Error(`date certainty counts ${dates}/${conditionalDates}/${unknownDates}`);
  }

  const regionalQuery = db
    .prepare(
      `SELECT o.office_id FROM office o
       JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       WHERE o.country_id = 'alderney' AND t.tier = 'regional'`,
    )
    .all();
  if (regionalQuery.length !== 0) {
    throw new Error("Alderney regional calendar must be empty");
  }

  const country = db.prepare("SELECT country_code, polity_kind, region_id FROM country WHERE country_id = 'alderney'").get();
  if (!country || String(country.country_code) !== "GG-ALD" || String(country.polity_kind) !== "territory" || String(country.region_id) !== "europe") {
    throw new Error("Alderney country projection mismatch");
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_OFFICES)) {
    const office = db
      .prepare("SELECT geography_id, next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
      .get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId) {
      throw new Error(`${officeId} geography mismatch`);
    }
    if (String(office.next_history_key) !== expected.nextEventId || String(office.next_date_resolution) !== "resolved") {
      throw new Error(`${officeId} next-event pointer mismatch`);
    }
    const date = db
      .prepare("SELECT label, precision, certainty, range_start_id, range_end_id FROM research_date WHERE date_id = ?")
      .get(String(office.next_date_id));
    if (
      !date ||
      String(date.label) !== expected.nextDate ||
      String(date.precision) !== "day" ||
      String(date.certainty) !== "conditional" ||
      date.range_start_id != null ||
      date.range_end_id != null
    ) {
      throw new Error(`${officeId} conditional date mismatch`);
    }
    const nextEvent = db
      .prepare("SELECT event_id, event_kind, selected_history_role, legal_outcome FROM election_event WHERE event_id = ?")
      .get(expected.nextEventId);
    if (
      !nextEvent ||
      String(nextEvent.event_kind) !== "unknown" ||
      String(nextEvent.selected_history_role) !== "none" ||
      String(nextEvent.legal_outcome) !== "not_held"
    ) {
      throw new Error(`${officeId} prospective event mismatch`);
    }
  }

  const replacement = db
    .prepare("SELECT event_id, history_key, event_kind FROM election_event WHERE event_id = ?")
    .get("event-1e4346e3f46e487f877780f8");
  if (
    !replacement ||
    String(replacement.history_key) !== "GG-ALD-STATES::2025::2025-03-08" ||
    String(replacement.event_kind) !== "special"
  ) {
    throw new Error("STATES 2025 replacement event mismatch");
  }

  const cameron = db
    .prepare(
      "SELECT candidate_or_list_label, votes, seats, seats_status, share, elected_flag, is_substitute, original_party_label FROM result_row WHERE result_row_id = ?",
    )
    .get("event-1e4346e3f46e487f877780f8-r0");
  if (
    !cameron ||
    String(cameron.candidate_or_list_label) !== "Jeannie Cameron" ||
    Number(cameron.votes) !== 501 ||
    Number(cameron.seats) !== 1 ||
    Number(cameron.share) !== 38.92773892773893 ||
    cameron.elected_flag != null ||
    cameron.is_substitute != null ||
    String(cameron.original_party_label) !== "Independent"
  ) {
    throw new Error("Jeannie Cameron r0 mismatch");
  }

  const fingerprintRow = db
    .prepare("SELECT fingerprint_sha256 FROM dataset_release WHERE lineage_id = ?")
    .get(ALDERNEY_LINEAGE);
  const isFrozenBaseline = String(fingerprintRow?.fingerprint_sha256) === CANDIDATE_FINGERPRINT;
  if (isFrozenBaseline) {
    const zeroSeat = db
      .prepare("SELECT candidate_or_list_label, seats, seats_status, votes FROM result_row WHERE result_row_id = ?")
      .get("event-7fa40c8eb8a5b88a5a05ec45-r2");
    if (
      !zeroSeat ||
      String(zeroSeat.candidate_or_list_label) !== "Stuart Clark" ||
      Number(zeroSeat.seats) !== 0 ||
      String(zeroSeat.seats_status) !== "zero" ||
      Number(zeroSeat.votes) !== 260
    ) {
      throw new Error("PLEB 2024 r2 zero-seat mismatch");
    }
    const zeroSeats = countRows(db, "result_row", "lineage_id = ? AND seats = 0 AND seats_status = 'zero'", [ALDERNEY_LINEAGE]);
    const oneSeats = countRows(db, "result_row", "lineage_id = ? AND seats = 1 AND seats_status = 'recorded'", [ALDERNEY_LINEAGE]);
    const nullSeats = countRows(db, "result_row", "lineage_id = ? AND seats IS NULL", [ALDERNEY_LINEAGE]);
    if (zeroSeats !== 13 || oneSeats !== 14 || nullSeats !== 0) {
      throw new Error(`Alderney seat one/zero/missing ${oneSeats}/${zeroSeats}/${nullSeats}`);
    }
    const extra2024 = db
      .prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ? AND history_key LIKE 'GG-ALD-STATES::2024::%'")
      .get(ALDERNEY_LINEAGE);
    if (Number(extra2024?.n) !== 1) {
      throw new Error("Duplicate 2024 States context must not mint a second event");
    }
    const unopposed = db
      .prepare("SELECT 1 AS ok FROM election_event WHERE history_key = 'GG-ALD-STATES::2022::2022-11-26'")
      .get();
    if (unopposed) {
      throw new Error("Unopposed 2022 additional context must not become a selected event");
    }
    const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [ALDERNEY_LINEAGE]);
    if (unresolved !== 0) throw new Error(`Frozen baseline unresolved_evidence ${unresolved}`);
    const controlInput = db
      .prepare("SELECT 1 AS ok FROM retained_input WHERE input_path = 'data/countries/alderney/tables/governing-control.json'")
      .get();
    const pollInput = db
      .prepare("SELECT 1 AS ok FROM retained_input WHERE input_path = 'data/countries/alderney/tables/polling-evidence.json'")
      .get();
    if (controlInput || pollInput) {
      throw new Error("Absent optional observation tables must not be fabricated");
    }
  }

  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:alderney' AND upstream_id = ?",
    )
    .get("alderney--url-f4ddef124d321842f7f7d256");
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'alderney:source-catalogue' AND upstream_id = ?",
    )
    .get("S5951ed7d0e");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to S5951ed7d0e");
  }

  const source = db
    .prepare("SELECT publisher, title, url, data_rights FROM source WHERE source_id = ?")
    .get("alderney--S5951ed7d0e");
  if (
    !source ||
    source.publisher != null ||
    String(source.title) !== "Alderney 2024-12-07 election result" ||
    String(source.url) !== "https://en.wikipedia.org/wiki/2024_Alderney_general_election" ||
    String(source.data_rights) !== "unknown"
  ) {
    throw new Error("S5951ed7d0e source projection mismatch");
  }

  const inline = db
    .prepare("SELECT title, publisher, checked_as_of_label, evidence_grade, url FROM source WHERE source_id = ?")
    .get("alderney--url-5eba820f0cac748728ed06f2");
  if (
    !inline ||
    inline.title != null ||
    inline.publisher != null ||
    inline.checked_as_of_label != null ||
    inline.evidence_grade != null ||
    String(inline.url) !== "https://alderney.gov.gg/CHttpHandler.ashx?id=202055&p=0"
  ) {
    throw new Error("Inline official-proposal source mismatch");
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(ALDERNEY_LINEAGE, projection.release.release_id);
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
      .get(ALDERNEY_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Alderney tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
  }
}
