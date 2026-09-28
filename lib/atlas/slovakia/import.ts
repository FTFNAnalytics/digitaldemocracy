import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import {
  BRATISLAVA_COUNCIL_ID,
  BRATISLAVA_MAYOR_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_STATUS,
  LINEAGE_ID as SLOVAKIA_LINEAGE,
  NAMED_HOLDS,
  NRSR_ID,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  STARE_MESTO_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
  VUC_ASSEMBLY_ID,
  VUC_CHAIR_ID,
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
import { SlovakiaPreflightError, scanSlovakiaInventory, type SlovakiaInventory } from "./inventory";
import { projectSlovakia, type SlovakiaProjection } from "./project";
import { writeSlovakiaProjection } from "./write";

export type ImportSlovakiaOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
  poisonAfterWrite?: (db: DatabaseSync, projection: SlovakiaProjection) => void;
  failBeforeRename?: boolean;
  allowFixtures?: boolean;
};

export type ImportSlovakiaResult = {
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

export function importSlovakia(options: ImportSlovakiaOptions): ImportSlovakiaResult {
  const operator = options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = {
    lineage_id: SLOVAKIA_LINEAGE,
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

    let inventory: SlovakiaInventory;
    try {
      inventory = scanSlovakiaInventory({
        root: options.root,
        tierPath: options.tierPath,
        requireGitTrackedPackage: options.requireGitTrackedPackage,
      });
      inventoryJson = inventory.intendedInventory;
    } catch (error) {
      if (error instanceof SlovakiaPreflightError) {
        inventoryJson = error.inventory;
        startAttempt(options.attemptsPath, {
          attemptId,
          lineageId: SLOVAKIA_LINEAGE,
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
      lineageId: SLOVAKIA_LINEAGE,
      operator,
      scriptVersion: SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (inventory.fingerprint !== CANDIDATE_FINGERPRINT || inventory.releaseId !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slovakia fingerprint ${inventory.fingerprint} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }

    if (fixtureEnvEnabled() && !options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = projectSlovakia(inventory);
    const publishedExists = existsSync(options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(SLOVAKIA_LINEAGE, inventory.fingerprint);
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
      writeSlovakiaProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      options.poisonAfterWrite?.(staging, projection);
      assertIntegrity(staging);
      assertSlovakiaFidelity(staging, projection);
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

export function assertSlovakiaFidelity(db: DatabaseSync, projection?: SlovakiaProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const current = countRows(db, "office", "lineage_id = ? AND office_status = 'current'", [SLOVAKIA_LINEAGE]);
  const historical = countRows(db, "office", "lineage_id = ? AND office_status = 'historical'", [SLOVAKIA_LINEAGE]);
  const events = countRows(db, "election_event", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const results = countRows(db, "result_row", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const geos = countRows(db, "geography", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const municipal = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [SLOVAKIA_LINEAGE]);
  const regional = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [SLOVAKIA_LINEAGE]);
  const national = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'national_context'", [SLOVAKIA_LINEAGE]);
  const otherTier = countRows(db, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [SLOVAKIA_LINEAGE]);
  const approved = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [SLOVAKIA_LINEAGE]);
  const needsReview = countRows(db, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [SLOVAKIA_LINEAGE]);
  const sources = countRows(db, "source", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const unresolved = countRows(db, "unresolved_evidence", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const crosswalks = countRows(db, "identity_crosswalk", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
  const dates = countRows(db, "research_date", "lineage_id = ?", [SLOVAKIA_LINEAGE]);

  if (offices !== EXPECTED_COUNTS.offices) throw new Error(`office count ${offices}`);
  if (current !== EXPECTED_COUNTS.current_offices) throw new Error(`current office count ${current}`);
  if (historical !== EXPECTED_COUNTS.historical_offices) throw new Error(`historical office count ${historical}`);
  if (events !== 0) throw new Error(`event count ${events}; publication must stay 0 event rows`);
  if (results !== 0) throw new Error(`result count ${results}; publication must stay 0 result rows`);
  if (geos !== EXPECTED_COUNTS.geographies) throw new Error(`geography count ${geos}`);
  if (municipal !== EXPECTED_COUNTS.schema_municipal) throw new Error(`municipal interchange count ${municipal}`);
  if (regional !== EXPECTED_COUNTS.schema_regional) throw new Error(`regional interchange count ${regional}`);
  if (national !== EXPECTED_COUNTS.schema_national) throw new Error(`national interchange count ${national}`);
  if (otherTier !== EXPECTED_COUNTS.schema_other) throw new Error(`other tier count ${otherTier}`);
  if (approved !== 0) throw new Error(`approved classification count ${approved}; holds stay needs_review`);
  if (needsReview !== EXPECTED_COUNTS.needs_review_classifications) throw new Error(`needs_review count ${needsReview}`);
  if (sources !== 0) throw new Error("omitted sources must not be projected into source rows");
  if (unresolved !== EXPECTED_COUNTS.unresolved_evidence) throw new Error(`unresolved count ${unresolved}`);
  if (crosswalks !== 0) throw new Error(`successor edge count ${crosswalks}; no successor edge is imported`);
  if (dates !== 0) throw new Error(`research dates ${dates}; the 2026 call must not be coerced`);
  if (countRows(db, "proceeding", "lineage_id = ?", [SLOVAKIA_LINEAGE]) !== 0) throw new Error("proceedings must stay 0");
  if (countRows(db, "party_mapping", "lineage_id = ?", [SLOVAKIA_LINEAGE]) !== 0) throw new Error("party mappings must stay 0");
  if (countRows(db, "evidence_link", "lineage_id = ?", [SLOVAKIA_LINEAGE]) !== 0) throw new Error("evidence links must stay 0");
  if (
    countRows(db, "geography", "lineage_id = ? AND (effective_from_label IS NOT NULL OR effective_to_label IS NOT NULL OR parent_geography_id IS NOT NULL)", [
      SLOVAKIA_LINEAGE,
    ]) !== 0
  ) {
    throw new Error("Slovakia geographies must not gain effective dates or invented parents");
  }
  if (countRows(db, "retained_input", "lineage_id = ? AND input_path LIKE ?", [SLOVAKIA_LINEAGE, `${OMITTED_RESEARCH_DIR}%`]) !== 0) {
    throw new Error("omitted research bytes must not be a retained input");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_history_key IS NOT NULL", [SLOVAKIA_LINEAGE]) !== 0) {
    throw new Error("Slovakia offices must not gain prospective history keys");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_resolution != 'unknown'", [SLOVAKIA_LINEAGE]) !== 0) {
    throw new Error("Slovakia offices must not gain a coerced next date");
  }
  if (countRows(db, "office", "lineage_id = ? AND next_date_id IS NOT NULL", [SLOVAKIA_LINEAGE]) !== 0) {
    throw new Error("Slovakia next_date_id must stay null");
  }
  if (countRows(db, "office", "lineage_id = ? AND id_namespace != ?", [SLOVAKIA_LINEAGE, CURRENT_NAMESPACE]) !== 0) {
    throw new Error("Slovakia offices must keep cdd-observatory-v1");
  }

  for (const token of OPEN_HOLD_IDS) {
    const row = db
      .prepare(
        `SELECT json_extract(raw_json, '$.row.status') AS status,
                json_extract(raw_json, '$.row.closed') AS closed
         FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?`,
      )
      .get(SLOVAKIA_LINEAGE, token) as { status?: unknown; closed?: unknown } | undefined;
    if (!row || String(row.status) !== HOLD_STATUS || Number(row.closed) !== 0) {
      throw new Error(`Named hold ${token} must stay open`);
    }
  }
  if (NAMED_HOLDS.length !== OPEN_HOLD_IDS.length) throw new Error("Named hold list drifted");

  const country = db
    .prepare("SELECT country_code, polity_kind, region_id, coverage_status, name FROM country WHERE country_id = 'slovakia'")
    .get() as
    | { country_code?: unknown; polity_kind?: unknown; region_id?: unknown; coverage_status?: unknown; name?: unknown }
    | undefined;
  if (
    !country ||
    String(country.country_code) !== COUNTRY_CODE ||
    String(country.polity_kind) !== "sovereign_country" ||
    String(country.region_id) !== "europe" ||
    String(country.coverage_status) !== "partial" ||
    String(country.name) !== COUNTRY_NAME
  ) {
    throw new Error("Slovakia country projection mismatch");
  }

  const parliament = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.geography_id, o.id_namespace, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(NRSR_ID) as Record<string, unknown> | undefined;
  if (
    !parliament ||
    String(parliament.office_type) !== "national_parliament" ||
    String(parliament.office_status) !== "current" ||
    String(parliament.geography_id) !== COUNTRY_GEOGRAPHY_ID ||
    String(parliament.id_namespace) !== CURRENT_NAMESPACE ||
    String(parliament.tier) !== "national_context" ||
    String(parliament.review_status) !== "needs_review" ||
    String(parliament.draft_tier) !== "national" ||
    Number(parliament.direct_executive) !== 0
  ) {
    throw new Error("The National Council must stay draft tier national, needs_review, and not a direct executive");
  }

  const president = db
    .prepare(
      `SELECT o.office_type, o.office_status, o.geography_id, t.tier, t.review_status,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(PRESIDENT_ID) as Record<string, unknown> | undefined;
  if (
    !president ||
    String(president.office_type) !== "president" ||
    String(president.office_status) !== "current" ||
    String(president.geography_id) !== COUNTRY_GEOGRAPHY_ID ||
    String(president.tier) !== "national_context" ||
    String(president.review_status) !== "needs_review" ||
    Number(president.direct_executive) !== 1
  ) {
    throw new Error("The President must stay a current direct executive");
  }

  const ep = db
    .prepare(
      `SELECT o.office_type, t.tier, t.review_status,
              json_extract(t.raw_json, '$.row.tier') AS draft_tier,
              json_extract(t.raw_json, '$.row.human_review_required') AS focused
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(EP_ID) as Record<string, unknown> | undefined;
  if (
    !ep ||
    String(ep.office_type) !== "european_parliament_delegation" ||
    String(ep.tier) !== "other" ||
    String(ep.review_status) !== "needs_review" ||
    String(ep.draft_tier) !== "other" ||
    Number(ep.focused) !== 1
  ) {
    throw new Error("SK-EP must stay drafted other and needs_review");
  }

  const cityPart = db
    .prepare(
      `SELECT o.office_type, o.geography_id, t.tier,
              json_extract(t.raw_json, '$.row.review_categories') AS categories
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?`,
    )
    .get(STARE_MESTO_COUNCIL_ID) as Record<string, unknown> | undefined;
  if (
    !cityPart ||
    String(cityPart.office_type) !== "city_part_council" ||
    String(cityPart.geography_id) !== "SK-OBEC-528595" ||
    String(cityPart.tier) !== "other" ||
    !String(cityPart.categories).includes("city_part_tier_policy")
  ) {
    throw new Error("Bratislava-Staré Mesto council must stay a city-part office drafted other");
  }

  const bratislava = db
    .prepare("SELECT geography_id, office_type FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
    .all(BRATISLAVA_COUNCIL_ID, BRATISLAVA_MAYOR_ID) as Array<{ geography_id?: unknown; office_type?: unknown }>;
  if (
    bratislava.length !== 2 ||
    String(bratislava[0]?.geography_id) !== "SK-OBEC-582000" ||
    String(bratislava[1]?.geography_id) !== "SK-OBEC-582000" ||
    String(bratislava[0]?.office_type) !== "municipal_council" ||
    String(bratislava[1]?.office_type) !== "direct_mayor"
  ) {
    throw new Error("Bratislava council and mayor must stay separate municipal offices on one geography");
  }

  const vuc = db
    .prepare(
      `SELECT o.office_id, o.office_type, o.geography_id, t.tier,
              json_extract(o.raw_json, '$.supplemental.direct_executive') AS direct_executive
       FROM office o JOIN office_tier_classification t USING (id_namespace, office_id)
       WHERE o.office_id IN (?, ?)`,
    )
    .all(VUC_ASSEMBLY_ID, VUC_CHAIR_ID) as Array<Record<string, unknown>>;
  const assembly = vuc.find((row) => String(row.office_id) === VUC_ASSEMBLY_ID);
  const chair = vuc.find((row) => String(row.office_id) === VUC_CHAIR_ID);
  if (
    !assembly ||
    !chair ||
    String(assembly.office_type) !== "vuc_assembly" ||
    String(chair.office_type) !== "direct_vuc_chair" ||
    String(assembly.geography_id) !== "SK-VUC-1" ||
    String(chair.geography_id) !== "SK-VUC-1" ||
    String(assembly.tier) !== "regional" ||
    String(chair.tier) !== "regional" ||
    Number(assembly.direct_executive) !== 0 ||
    Number(chair.direct_executive) !== 1
  ) {
    throw new Error("VUC 1 must stay a regional assembly plus a separate direct chair");
  }

  if (
    countRows(
      db,
      "office",
      "lineage_id = ? AND (office_type IN ('prime_minister','cabinet','okres_governor','military','referendum') OR office_id LIKE '%OKRES%' OR office_id LIKE '%HIST%')",
      [SLOVAKIA_LINEAGE],
    ) !== 0
  ) {
    throw new Error("No appointed, military, referendum, or historical office may be invented");
  }
  if (countRows(db, "office", "lineage_id = ? AND office_type = 'european_parliament_delegation'", [SLOVAKIA_LINEAGE]) !== 1) {
    throw new Error("Exactly one EP delegation may be published");
  }

  const draftDrift = countRows(
    db,
    "office_tier_classification",
    `lineage_id = ? AND (
      (tier = 'national_context' AND json_extract(raw_json, '$.row.tier') != 'national') OR
      (tier = 'regional' AND json_extract(raw_json, '$.row.tier') != 'regional') OR
      (tier = 'municipal' AND json_extract(raw_json, '$.row.tier') != 'municipal') OR
      (tier = 'other' AND json_extract(raw_json, '$.row.tier') != 'other')
    )`,
    [SLOVAKIA_LINEAGE],
  );
  if (draftDrift !== 0) throw new Error("Draft Slovakia tiers must stay on the classification row");

  if (projection) {
    const hashes = db
      .prepare(
        "SELECT adapter_version, method_version, schema_version, hash_inputs_json, fingerprint_sha256, release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
      )
      .get(SLOVAKIA_LINEAGE, projection.release.release_id) as Record<string, unknown> | undefined;
    const parsed = JSON.parse(String(hashes?.hash_inputs_json));
    if (
      parsed.adapter_version !== hashes?.adapter_version ||
      parsed.method_version !== hashes?.method_version ||
      parsed.schema_version !== hashes?.schema_version
    ) {
      throw new Error("Release version columns must match hash_inputs_json");
    }
    if (String(hashes?.fingerprint_sha256) !== CANDIDATE_FINGERPRINT || String(hashes?.release_id) !== CANDIDATE_RELEASE_ID) {
      throw new Error(
        `Slovakia fingerprint ${String(hashes?.fingerprint_sha256)} does not match the pinned candidate release ${CANDIDATE_FINGERPRINT}`,
      );
    }
    const tierInput = db
      .prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?")
      .get(SLOVAKIA_LINEAGE, TIER_PATH) as { sha256?: unknown; input_kind?: unknown } | undefined;
    if (!tierInput || String(tierInput.sha256) !== TIER_SHA256 || String(tierInput.input_kind) !== "tier_classification") {
      throw new Error("Slovakia tier retained-input hash mismatch");
    }
    const retained = countRows(db, "retained_input", "lineage_id = ?", [SLOVAKIA_LINEAGE]);
    if (retained !== EXPECTED_COUNTS.retained_inputs) throw new Error(`retained_input count ${retained}`);
    const coverage = db
      .prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(SLOVAKIA_LINEAGE, projection.release.release_id) as { research_coverage_complete?: unknown } | undefined;
    if (Number(coverage?.research_coverage_complete) !== 0) throw new Error("research_coverage_complete must stay false");
    if (
      projection.validatedCounts.documented_result_rows_omitted != null ||
      projection.validatedCounts.documented_event_rows_omitted != null ||
      projection.validatedCounts.documented_sources_omitted != null
    ) {
      throw new Error("Slovakia import must not invent documented omitted totals");
    }
  }
}
