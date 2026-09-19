import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  LINEAGE_ID as AUSTRIA_LINEAGE,
  REGIONAL_OFFICE_IDS,
  ST_GEORGEN_HOLD_EVENT_ID,
  ST_GEORGEN_HOLD_HISTORY_KEY,
  ST_GEORGEN_HOLD_OFFICE_ID,
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
import { AustriaPreflightError, scanAustriaInventory, type AustriaInventory } from "./inventory";
import { projectAustria, type AustriaProjection } from "./project";
import { writeAustriaProjection } from "./write";

export type ImportAustriaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: AustriaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportAustriaResult = {
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

export function importAustria(options: ImportAustriaOptions): ImportAustriaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: AUSTRIA_LINEAGE,
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

    let inventory: AustriaInventory;
    try {
      inventory = scanAustriaInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof AustriaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: AUSTRIA_LINEAGE,
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
      lineageId: AUSTRIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectAustria(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(AUSTRIA_LINEAGE, inventory.fingerprint);
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
      writeAustriaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertAustriaFidelity(staging, projection);
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

export function assertAustriaFidelity(db: DatabaseSync, projection?: AustriaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [AUSTRIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [AUSTRIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [AUSTRIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [AUSTRIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [AUSTRIA_LINEAGE]);
  const dayDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'day'", [AUSTRIA_LINEAGE]);
  const yearDates = countRows(db, "research_date", "lineage_id = ? AND precision = 'year'", [AUSTRIA_LINEAGE]);
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== 0) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.municipal_offices) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates || dayDates !== EXPECTED_COUNTS.historical_dates_day || yearDates !== EXPECTED_COUNTS.historical_dates_year) {
    throw new Error(`date precision counts ${dates}/${dayDates}/${yearDates}`);
  }

  const regionalQuery = db
    .prepare(
      `SELECT o.office_id FROM office o
       JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       WHERE o.country_id = 'austria' AND t.tier = 'regional'
       ORDER BY o.office_id`,
    )
    .all()
    .map((row) => String(row.office_id));
  if (JSON.stringify(regionalQuery) !== JSON.stringify([...REGIONAL_OFFICE_IDS].sort())) {
    throw new Error(`Austria regional IDs ${regionalQuery.join(",")}`);
  }

  const country = db.prepare("SELECT country_code, polity_kind, region_id FROM country WHERE country_id = 'austria'").get();
  if (!country || String(country.country_code) !== "AT" || String(country.polity_kind) !== "sovereign_country" || String(country.region_id) !== "europe") {
    throw new Error("Austria country projection mismatch");
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_OFFICES)) {
    const office = db.prepare("SELECT geography_id, office_type, next_date_id, next_history_key, next_date_resolution FROM office WHERE office_id = ?").get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId || String(office.office_type) !== expected.officeType) {
      throw new Error(`${officeId} geography/type mismatch`);
    }
    if (office.next_date_id != null || office.next_history_key != null || String(office.next_date_resolution) !== "unknown") {
      throw new Error(`${officeId} must keep an unknown next date`);
    }
  }

  const hold = db
    .prepare("SELECT event_id, history_key, selected_history_role, raw_json FROM election_event WHERE event_id = ?")
    .get(ST_GEORGEN_HOLD_EVENT_ID);
  if (!hold || String(hold.history_key) !== ST_GEORGEN_HOLD_HISTORY_KEY || String(hold.selected_history_role) !== "selected") {
    throw new Error("St. Georgen 2015 hold event mismatch");
  }
  const holdRaw = JSON.parse(String(hold.raw_json)) as { supplemental?: { publication_hold?: boolean } };
  if (holdRaw.supplemental?.publication_hold !== true) {
    throw new Error("St. Georgen 2015 hold must remain documented");
  }
  const holdResults = countRows(db, "result_row", "history_key = ?", [ST_GEORGEN_HOLD_HISTORY_KEY]);
  if (holdResults !== 4) throw new Error(`St. Georgen first-ballot rows ${holdResults}`);
  const holdProceedings = countRows(db, "proceeding", "office_id = ?", [ST_GEORGEN_HOLD_OFFICE_ID]);
  if (holdProceedings !== 0) throw new Error("St. Georgen hold must not invent a proceeding");

  const arzl = db
    .prepare("SELECT event_id, date_id FROM election_event WHERE history_key = ?")
    .get("AT-TY-C-70201::2022::");
  if (!arzl || String(arzl.event_id) !== "event-4b14e098bb06b69d66290f60") {
    throw new Error("AT-TY-C-70201 2022 event mismatch");
  }
  const yearDate = db.prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?").get(String(arzl.date_id));
  if (!yearDate || String(yearDate.label) !== "2022" || String(yearDate.precision) !== "year" || yearDate.month != null || yearDate.day != null) {
    throw new Error("AT-TY-C-70201 year date mismatch");
  }

  const repeat = db
    .prepare("SELECT event_id, event_kind, date_id FROM election_event WHERE history_key = ?")
    .get("AT-BG-10602-M::2022::");
  if (!repeat || String(repeat.event_id) !== "event-e41173a85dde8b05f2639a6d" || String(repeat.event_kind) !== "repeated") {
    throw new Error("Forchtenstein 2022 repeat event mismatch");
  }
  const dayDate = db.prepare("SELECT label, precision, year, month, day FROM research_date WHERE date_id = ?").get(String(repeat.date_id));
  if (
    !dayDate ||
    String(dayDate.label) !== "3 September 2023" ||
    String(dayDate.precision) !== "day" ||
    Number(dayDate.year) !== 2023 ||
    Number(dayDate.month) !== 9 ||
    Number(dayDate.day) !== 3
  ) {
    throw new Error("Forchtenstein repeat date mismatch");
  }

  const zeroSeat = db
    .prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get("event-8162895a3aeba5d488afd24f-r6");
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Missing-versus-zero seat example (zero) mismatch");
  }
  const missingSeat = db
    .prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get("event-376a7201dbb826f0af5d9976-r0");
  if (!missingSeat || missingSeat.seats != null || String(missingSeat.seats_status) !== "unknown") {
    throw new Error("Missing-versus-zero seat example (unknown) mismatch");
  }

  const seatsZero = countRows(db, "result_row", "lineage_id = ? AND seats = 0 AND seats_status = 'zero'", [AUSTRIA_LINEAGE]);
  const seatsMissing = countRows(db, "result_row", "lineage_id = ? AND seats IS NULL AND seats_status = 'unknown'", [AUSTRIA_LINEAGE]);
  if (seatsZero !== EXPECTED_COUNTS.seats_zero || seatsMissing !== EXPECTED_COUNTS.seats_missing) {
    throw new Error(`Austria seat status counts ${seatsZero}/${seatsMissing}`);
  }

  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:austria' AND upstream_id = ?",
    )
    .get("austria--url-3ade25872348968d909f32cf");
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'austria:source-catalogue' AND upstream_id = ?",
    )
    .get("Saa268dd490");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to Saa268dd490");
  }

  const source = db
    .prepare("SELECT publisher, title, url, data_rights FROM source WHERE source_id = ?")
    .get("austria--Saa268dd490");
  if (
    !source ||
    source.publisher != null ||
    String(source.url) !== "https://wahlen.tirol.gv.at/gemeinderats_und_buergermeisterwahlen_2022/dokumente/wahl57.csv" ||
    String(source.data_rights) !== "unknown"
  ) {
    throw new Error("Saa268dd490 source projection mismatch");
  }

  const pollInput = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/austria/unpacked/tables/master/polling-evidence.json'",
    )
    .get(AUSTRIA_LINEAGE);
  const controlInput = db
    .prepare(
      "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/austria/unpacked/tables/governing-control.json'",
    )
    .get(AUSTRIA_LINEAGE);
  if (!pollInput) throw new Error("Polling evidence must remain a retained input");
  if (controlInput) throw new Error("Absent control table must not be fabricated");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(AUSTRIA_LINEAGE, projection.release.release_id);
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
      .get(AUSTRIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Austria tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [AUSTRIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
