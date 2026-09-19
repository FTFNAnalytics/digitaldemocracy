import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CEC_HOMEPAGE_SOURCE_ID,
  CEC_HOMEPAGE_URL,
  ENTITY_OFFICE_IDS,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  GORAZDE_2022_EVENT_ID,
  GORAZDE_2022_SOURCE_ID,
  GORAZDE_2022_URL_ALIAS,
  GORAZDE_NEXT_EVENT_ID,
  LINEAGE_ID as BOSNIA_LINEAGE,
  NEXT_POLLING_DATE,
  RS_PRESIDENT_2022_EVENT_ID,
  SCREENING_SOURCE_ID,
  SCREENING_URL,
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
import { BosniaPreflightError, scanBosniaInventory, type BosniaInventory } from "./inventory";
import { projectBosnia, type BosniaProjection } from "./project";
import { writeBosniaProjection } from "./write";

export type ImportBosniaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: BosniaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportBosniaResult = {
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

export function importBosnia(options: ImportBosniaOptions): ImportBosniaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: BOSNIA_LINEAGE,
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

    let inventory: BosniaInventory;
    try {
      inventory = scanBosniaInventory({
        root: options.root,
        packageDir: options.packageDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof BosniaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: BOSNIA_LINEAGE,
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
      lineageId: BOSNIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectBosnia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(BOSNIA_LINEAGE, inventory.fingerprint);
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
      writeBosniaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertBosniaFidelity(staging, projection);
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

export function assertBosniaFidelity(db: DatabaseSync, projection?: BosniaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [BOSNIA_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [BOSNIA_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [BOSNIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [BOSNIA_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [BOSNIA_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [BOSNIA_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [BOSNIA_LINEAGE]);
  const yearDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'year' AND certainty = 'unknown'",
    [BOSNIA_LINEAGE],
  );
  const expectedDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND precision = 'day' AND certainty = 'expected'",
    [BOSNIA_LINEAGE],
  );
  const calledDates = countRows(
    db,
    "research_date",
    "lineage_id = ? AND certainty = 'called'",
    [BOSNIA_LINEAGE],
  );
  if (offices !== EXPECTED_COUNTS.current_offices) throw new Error(`office count ${offices}`);
  if (events !== EXPECTED_COUNTS.total_events) throw new Error(`event count ${events}`);
  if (selected !== EXPECTED_COUNTS.selected_histories) throw new Error(`selected histories ${selected}`);
  if (prospective !== EXPECTED_COUNTS.prospective_events) throw new Error(`prospective events ${prospective}`);
  if (results !== EXPECTED_COUNTS.result_rows) throw new Error(`result count ${results}`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== 0) throw new Error(`municipal count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.regional_offices) throw new Error(`regional count ${regional}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== 52 || yearDates !== 39 || expectedDates !== 13 || calledDates !== 0) {
    throw new Error(`date certainty counts ${dates}/${yearDates}/${expectedDates}/${calledDates}`);
  }

  const brcko = db
    .prepare(
      `SELECT office_id FROM office WHERE country_id = 'bosnia-and-herzegovina' AND (
         office_id LIKE '%BRC%' OR office_id LIKE '%BRCKO%' OR name LIKE '%Brčko%' OR name LIKE '%Brcko%'
       )`,
    )
    .all();
  if (brcko.length !== 0) throw new Error("Brčko office must not be invented");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id FROM country WHERE country_id = 'bosnia-and-herzegovina'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "BA" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe"
  ) {
    throw new Error("Bosnia and Herzegovina country projection mismatch");
  }

  const president = db.prepare("SELECT office_type, geography_id FROM office WHERE office_id = ?").get("BA-G");
  if (!president || String(president.office_type) !== "President") {
    throw new Error("BA-G must remain the Republika Srpska President");
  }
  if (String(president.geography_id) !== EXPECTED_OFFICES["BA-G"]!.geographyId) {
    throw new Error("BA-G geography mismatch");
  }
  const assembly = db.prepare("SELECT office_type, geography_id FROM office WHERE office_id = ?").get("BA-R");
  if (
    !assembly ||
    String(assembly.office_type) !== "National Assembly" ||
    String(assembly.geography_id) === String(president.geography_id)
  ) {
    throw new Error("BA-R must remain a distinct RS National Assembly geography");
  }

  for (const [officeId, expected] of Object.entries(EXPECTED_OFFICES)) {
    const office = db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = ?").get(officeId);
    if (!office || String(office.geography_id) !== expected.geographyId || String(office.office_type) !== expected.officeType) {
      throw new Error(`${officeId} geography/type mismatch`);
    }
  }

  for (const officeId of ENTITY_OFFICE_IDS) {
    const row = db
      .prepare("SELECT review_status FROM office_tier_classification WHERE office_id = ?")
      .get(officeId);
    if (!row || String(row.review_status) !== "needs_review") {
      throw new Error(`${officeId} focused review must stay needs_review`);
    }
  }

  const next = db
    .prepare("SELECT next_date_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
    .get("BA-205");
  if (!next || String(next.next_date_resolution) !== "resolved" || next.next_history_key == null) {
    throw new Error("BA-205 next-event pointer mismatch");
  }
  const expected = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(String(next.next_date_id));
  if (
    !expected ||
    String(expected.label) !== NEXT_POLLING_DATE ||
    String(expected.precision) !== "day" ||
    String(expected.certainty) !== "expected" ||
    Number(expected.year) !== 2026 ||
    Number(expected.month) !== 10 ||
    Number(expected.day) !== 4
  ) {
    throw new Error("BA-205 expected date mismatch");
  }

  const historical = db
    .prepare("SELECT event_id, history_key, event_kind, selected_history_role FROM election_event WHERE event_id = ?")
    .get(GORAZDE_2022_EVENT_ID);
  if (
    !historical ||
    String(historical.history_key) !== "BA-205::2022::" ||
    String(historical.event_kind) !== "unknown" ||
    String(historical.selected_history_role) !== "selected"
  ) {
    throw new Error("BA-205 2022 selected event mismatch");
  }
  const nextEvent = db.prepare("SELECT event_id, history_key FROM election_event WHERE event_id = ?").get(GORAZDE_NEXT_EVENT_ID);
  if (!nextEvent || String(nextEvent.history_key) !== GORAZDE_NEXT_EVENT_ID) {
    throw new Error("BA-205 next event identity mismatch");
  }
  if (String(next.next_history_key) !== GORAZDE_NEXT_EVENT_ID) {
    throw new Error("BA-205 next_history_key must stay the documented next-event id");
  }

  const seatsOnly = db
    .prepare(
      "SELECT candidate_or_list_label, votes, votes_status, share, share_status, seats, seats_status FROM result_row WHERE result_row_id = ?",
    )
    .get(`${GORAZDE_2022_EVENT_ID}-r0`);
  if (
    !seatsOnly ||
    String(seatsOnly.candidate_or_list_label) !== "SDA - STRANKA DEMOKRATSKE AKCIJE" ||
    Number(seatsOnly.votes) !== 2128 ||
    String(seatsOnly.votes_status) !== "recorded" ||
    Number(seatsOnly.share) !== 15.155615696887686 ||
    Number(seatsOnly.seats) !== 5 ||
    String(seatsOnly.seats_status) !== "recorded"
  ) {
    throw new Error("BA-205 2022 r0 mismatch");
  }

  const zeroSeat = db
    .prepare("SELECT seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get(`${GORAZDE_2022_EVENT_ID}-r13`);
  if (!zeroSeat || Number(zeroSeat.seats) !== 0 || String(zeroSeat.seats_status) !== "zero") {
    throw new Error("Zero-seat status mismatch");
  }
  const unknownSeat = db
    .prepare("SELECT candidate_or_list_label, seats, seats_status FROM result_row WHERE result_row_id = ?")
    .get(`${RS_PRESIDENT_2022_EVENT_ID}-r0`);
  if (
    !unknownSeat ||
    String(unknownSeat.candidate_or_list_label) !== "MILORAD DODIK" ||
    unknownSeat.seats != null ||
    String(unknownSeat.seats_status) !== "unknown"
  ) {
    throw new Error("BA-G missing-seat status mismatch");
  }

  const others = db
    .prepare("SELECT votes, share, seats FROM result_row WHERE result_row_id = ?")
    .get("event-b3192e9a1f294ef5deebd1c7-r0");
  if (!others || Number(others.votes) !== 3373 || Number(others.share) !== 23.859 || Number(others.seats) !== 5) {
    throw new Error("Published Others row mismatch");
  }

  const extraGap = db
    .prepare(
      "SELECT COUNT(*) AS n FROM election_event WHERE office_id = 'BA-G' AND selected_history_role = 'selected'",
    )
    .get();
  if (Number(extraGap?.n) !== 3) {
    throw new Error("BA-G must keep exactly three supplied histories");
  }

  const alias = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'observatory:bosnia-and-herzegovina' AND upstream_id = ?",
    )
    .get(GORAZDE_2022_URL_ALIAS);
  const canonicalSource = db
    .prepare(
      "SELECT record_key FROM identity_crosswalk WHERE entity_kind = 'source' AND upstream_namespace = 'bosnia-and-herzegovina:source-catalogue' AND upstream_id = ?",
    )
    .get("S7dc4e82fd3");
  if (!alias || !canonicalSource || String(alias.record_key) !== String(canonicalSource.record_key)) {
    throw new Error("Catalogue URL alias does not resolve to S7dc4e82fd3");
  }

  const source = db
    .prepare("SELECT publisher, title, url, data_rights FROM source WHERE source_id = ?")
    .get(GORAZDE_2022_SOURCE_ID);
  if (
    !source ||
    source.publisher != null ||
    String(source.title) !== "CEC Bosnia and Herzegovina: certified 2022 Bosnian-Podrinje Goražde Cantonal assembly" ||
    String(source.url) !== "https://www.izbori.ba/Rezultati_izbora/?resId=32&langId=3#/7/205/0/0/0" ||
    String(source.data_rights) !== "unknown"
  ) {
    throw new Error("S7dc4e82fd3 source projection mismatch");
  }

  const homepage = db
    .prepare("SELECT title, publisher, checked_as_of_label, evidence_grade, url FROM source WHERE source_id = ?")
    .get(CEC_HOMEPAGE_SOURCE_ID);
  if (
    !homepage ||
    homepage.title != null ||
    homepage.publisher != null ||
    homepage.checked_as_of_label != null ||
    homepage.evidence_grade != null ||
    String(homepage.url) !== CEC_HOMEPAGE_URL
  ) {
    throw new Error("Inline CEC homepage source mismatch");
  }
  const screening = db
    .prepare("SELECT title, publisher, checked_as_of_label, evidence_grade, url FROM source WHERE source_id = ?")
    .get(SCREENING_SOURCE_ID);
  if (
    !screening ||
    screening.title != null ||
    screening.publisher != null ||
    screening.checked_as_of_label != null ||
    screening.evidence_grade != null ||
    String(screening.url) !== SCREENING_URL
  ) {
    throw new Error("Inline 2027 screening source mismatch");
  }

  const fingerprintRow = db
    .prepare("SELECT fingerprint_sha256 FROM dataset_release WHERE lineage_id = ?")
    .get(BOSNIA_LINEAGE);
  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(BOSNIA_LINEAGE, projection.release.release_id);
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
      .get(BOSNIA_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Bosnia tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [BOSNIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  } else if (String(fingerprintRow?.fingerprint_sha256) === CANDIDATE_FINGERPRINT) {
    const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [BOSNIA_LINEAGE]);
    if (unresolved !== 0) throw new Error(`Frozen baseline unresolved_evidence ${unresolved}`);
  }
}
