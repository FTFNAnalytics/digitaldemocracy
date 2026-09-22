import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CLONMEL_2009_EVENT_ID,
  CLONMEL_2009_HISTORY_KEY,
  CLONMEL_ID,
  COUNCIL_EXAMPLE_ID,
  COUNCIL_EXAMPLE_NEXT_DATE_ID,
  DAIL_DUBLIN_EVENT_ID,
  DAIL_DUBLIN_HISTORY_KEY,
  DAIL_GALWAY_EVENT_ID,
  DAIL_GALWAY_HISTORY_KEY,
  DAIL_ID,
  EP_2024_EVENT_ID,
  EP_2024_HISTORY_KEY,
  EP_ID,
  EXPECTED_COUNTS,
  LIMERICK_COUNCIL_ID,
  LIMERICK_GEOGRAPHY_ID,
  LIMERICK_MAYOR_EVENT_ID,
  LIMERICK_MAYOR_HISTORY_KEY,
  LIMERICK_MAYOR_ID,
  LINEAGE_ID as IRELAND_LINEAGE,
  NAMED_HOLDS,
  PRESIDENT_2011_EVENT_ID,
  PRESIDENT_2011_HISTORY_KEY,
  PRESIDENT_ID,
  SEANAD_EVENT_ID,
  SEANAD_HISTORY_KEY,
  SEANAD_ID,
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
import { IrelandPreflightError, scanIrelandInventory, type IrelandInventory } from "./inventory";
import { projectIreland, type IrelandProjection } from "./project";
import { writeIrelandProjection } from "./write";

export type ImportIrelandOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: IrelandProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportIrelandResult = {
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

export function importIreland(options: ImportIrelandOptions): ImportIrelandResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: IRELAND_LINEAGE,
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

    let inventory: IrelandInventory;
    try {
      inventory = scanIrelandInventory({
        root: options.root,
        researchDir: options.researchDir,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof IrelandPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: IRELAND_LINEAGE,
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
      lineageId: IRELAND_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectIreland(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(IRELAND_LINEAGE, inventory.fingerprint);
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
      writeIrelandProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertIrelandFidelity(staging, projection);
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

export function assertIrelandFidelity(db: DatabaseSync, projection?: IrelandProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [IRELAND_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [IRELAND_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [IRELAND_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [IRELAND_LINEAGE]);
  const selected = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'selected'",
    [IRELAND_LINEAGE],
  );
  const prospective = countRows(
    db,
    "election_event",
    "lineage_id = ? AND selected_history_role = 'none'",
    [IRELAND_LINEAGE],
  );
  const results = countRows(db, "result_row", "lineage_id = ?", [IRELAND_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [IRELAND_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [IRELAND_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [IRELAND_LINEAGE]);
  const national = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND tier = 'national_context'",
    [IRELAND_LINEAGE],
  );
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [IRELAND_LINEAGE]);
  const approved = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'approved'",
    [IRELAND_LINEAGE],
  );
  const needsReview = countRows(
    db,
    "office_tier_classification",
    "lineage_id = ? AND review_status = 'needs_review'",
    [IRELAND_LINEAGE],
  );
  const sources = countRows(db, "source", "lineage_id = ?", [IRELAND_LINEAGE]);
  const proceedings = countRows(db, "proceeding", "lineage_id = ?", [IRELAND_LINEAGE]);
  const parties = countRows(db, "party_mapping", "lineage_id = ?", [IRELAND_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [IRELAND_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [IRELAND_LINEAGE]);
  const directMayors = countRows(
    db,
    "office",
    "lineage_id = ? AND office_type = 'directly_elected_mayor'",
    [IRELAND_LINEAGE],
  );
  const epResults = countRows(db, "result_row", "lineage_id = ? AND office_id = ?", [IRELAND_LINEAGE, EP_ID]);
  const northern = countRows(
    db,
    "office",
    "lineage_id = ? AND (name LIKE '%Northern Ireland%' OR office_id LIKE 'NI-%' OR name LIKE '%Stormont%')",
    [IRELAND_LINEAGE],
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
  if (regional !== 0) throw new Error(`regional count ${regional}`);
  if (national !== EXPECTED_COUNTS.national_offices) throw new Error(`national count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.other_offices) throw new Error(`other tier count ${otherTier}`);
  if (approved !== EXPECTED_COUNTS.approved_classifications) throw new Error(`approved classification count ${approved}`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) {
    throw new Error(`needs_review count ${needsReview}`);
  }
  if (sources !== EXPECTED_COUNTS.sources) throw new Error(`source count ${sources}`);
  if (proceedings !== 0 || parties !== 0) throw new Error("proceedings/party_mappings must be 0");
  if (dates !== EXPECTED_COUNTS.research_dates) throw new Error(`date count ${dates}`);
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (directMayors !== 1) throw new Error(`directly elected mayor count ${directMayors}`);
  if (epResults !== 0) throw new Error("EP result rows must not be invented");
  if (northern !== 0) throw new Error("Northern Ireland offices must stay excluded");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'ireland'")
    .get();
  if (
    !country ||
    String(country.country_code) !== "IE" ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== "Ireland"
  ) {
    throw new Error("Ireland country projection mismatch");
  }

  const council = db
    .prepare(
      "SELECT office_status, record_state, next_date_resolution, next_history_key, next_date_id FROM office WHERE office_id = ?",
    )
    .get(COUNCIL_EXAMPLE_ID);
  if (
    !council ||
    String(council.office_status) !== "current" ||
    String(council.record_state) !== "active" ||
    String(council.next_date_resolution) !== "resolved" ||
    council.next_history_key != null ||
    String(council.next_date_id) !== COUNCIL_EXAMPLE_NEXT_DATE_ID
  ) {
    throw new Error("Out-of-window council projection mismatch");
  }
  const next = db
    .prepare("SELECT label, precision, certainty, year, month, day FROM research_date WHERE date_id = ?")
    .get(COUNCIL_EXAMPLE_NEXT_DATE_ID);
  if (
    !next ||
    String(next.label) !== "2029" ||
    String(next.precision) !== "year" ||
    String(next.certainty) !== "expected" ||
    Number(next.year) !== 2029 ||
    next.month != null ||
    next.day != null
  ) {
    throw new Error("Council 2029 year-only next-date mismatch");
  }

  const clonmel = db
    .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
    .get(CLONMEL_ID);
  if (
    !clonmel ||
    String(clonmel.office_status) !== "historical" ||
    String(clonmel.record_state) !== "active" ||
    clonmel.next_date_id != null
  ) {
    throw new Error("Historical Clonmel borough must stay active without an inferred end date");
  }
  const clonmelEvent = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(CLONMEL_2009_HISTORY_KEY);
  if (!clonmelEvent || String(clonmelEvent.event_id) !== CLONMEL_2009_EVENT_ID) {
    throw new Error("Clonmel 2009 event identity mismatch");
  }

  const mayor = db
    .prepare(
      "SELECT o.office_status, o.geography_id, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(LIMERICK_MAYOR_ID);
  const councilGeo = db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(LIMERICK_COUNCIL_ID);
  if (
    !mayor ||
    String(mayor.office_status) !== "current" ||
    String(mayor.tier) !== "municipal" ||
    String(mayor.geography_id) !== LIMERICK_GEOGRAPHY_ID ||
    !councilGeo ||
    String(councilGeo.geography_id) !== LIMERICK_GEOGRAPHY_ID
  ) {
    throw new Error("Limerick mayor must share the council geography and stay municipal");
  }
  const mayorEvent = db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(LIMERICK_MAYOR_HISTORY_KEY);
  if (!mayorEvent || String(mayorEvent.event_id) !== LIMERICK_MAYOR_EVENT_ID) {
    throw new Error("Limerick mayor 2024 event identity mismatch");
  }

  const dail = db
    .prepare(
      "SELECT o.office_status, t.tier FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(DAIL_ID);
  if (!dail || String(dail.office_status) !== "current" || String(dail.tier) !== "national_context") {
    throw new Error("Dáil Éireann must stay the accepted national_context row");
  }
  const dublin = db.prepare("SELECT event_id, event_kind FROM election_event WHERE history_key = ?").get(DAIL_DUBLIN_HISTORY_KEY);
  const galway = db.prepare("SELECT event_id, event_kind FROM election_event WHERE history_key = ?").get(DAIL_GALWAY_HISTORY_KEY);
  if (!dublin || String(dublin.event_id) !== DAIL_DUBLIN_EVENT_ID || String(dublin.event_kind) !== "special") {
    throw new Error("Dublin Central 2026 by-election identity mismatch");
  }
  if (!galway || String(galway.event_id) !== DAIL_GALWAY_EVENT_ID || String(galway.event_kind) !== "special") {
    throw new Error("Galway West 2026 by-election identity mismatch");
  }
  if (String(dublin.event_id) === String(galway.event_id)) {
    throw new Error("2026 Dáil by-elections must stay distinct contests");
  }

  const seanad = db
    .prepare(
      "SELECT e.event_id, e.event_kind, d.precision, d.certainty, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(SEANAD_HISTORY_KEY);
  if (
    !seanad ||
    String(seanad.event_id) !== SEANAD_EVENT_ID ||
    String(seanad.event_kind) !== "indirect" ||
    String(seanad.precision) !== "month" ||
    String(seanad.certainty) !== "called" ||
    Number(seanad.year) !== 2025 ||
    Number(seanad.month) !== 1 ||
    seanad.day != null
  ) {
    throw new Error("Seanad 2025 month-precision event mismatch");
  }
  const nominees = countRows(
    db,
    "result_row",
    "lineage_id = ? AND office_id = ? AND (candidate_or_list_label LIKE '%nominee%' OR candidate_or_list_label LIKE '%Taoiseach%')",
    [IRELAND_LINEAGE, SEANAD_ID],
  );
  if (nominees !== 0) throw new Error("Taoiseach nominee rows must not be election results");

  const president = db
    .prepare(
      "SELECT e.event_id, d.precision, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
    )
    .get(PRESIDENT_2011_HISTORY_KEY);
  if (
    !president ||
    String(president.event_id) !== PRESIDENT_2011_EVENT_ID ||
    String(president.precision) !== "year" ||
    Number(president.year) !== 2011 ||
    president.month != null ||
    president.day != null
  ) {
    throw new Error("Presidential 2011 year-precision event mismatch");
  }
  const laterPresident = countRows(
    db,
    "election_event",
    "office_id = ? AND (history_key LIKE '%::2018::%' OR history_key LIKE '%::2025::%' OR history_key LIKE '%::2024::%')",
    [PRESIDENT_ID],
  );
  if (laterPresident !== 0) throw new Error("Later presidential returns must not be invented");

  const ep = db
    .prepare(
      "SELECT o.office_status, t.tier, t.review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?",
    )
    .get(EP_ID);
  if (!ep || String(ep.office_status) !== "current" || String(ep.tier) !== "other" || String(ep.review_status) !== "needs_review") {
    throw new Error("Ireland EP delegation must stay the accepted other/needs_review row");
  }
  const epEvent = db
    .prepare("SELECT event_id, ballot_basis FROM election_event WHERE history_key = ?")
    .get(EP_2024_HISTORY_KEY);
  if (!epEvent || String(epEvent.event_id) !== EP_2024_EVENT_ID || String(epEvent.ballot_basis) !== "unknown") {
    throw new Error("EP 2024 event must stay result-free with unknown ballot basis");
  }

  const holdRows = db
    .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ?")
    .all(IRELAND_LINEAGE)
    .map((row) => String(row.original_token));
  for (const hold of NAMED_HOLDS) {
    if (!holdRows.includes(hold)) throw new Error(`Named hold ${hold} was not retained as unresolved evidence`);
  }

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT DISTINCT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(IRELAND_LINEAGE, projection.release.release_id);
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
      .get(IRELAND_LINEAGE, TIER_PATH);
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Approved Ireland tier retained-input hash mismatch");
    }
    if (String(hashes?.fingerprint_sha256) === CANDIDATE_FINGERPRINT && String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error("Documented fingerprint must mint the candidate release ID");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [IRELAND_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) {
      throw new Error(`retained_input count ${retained}`);
    }
  }
}
