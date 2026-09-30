import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { importBulgariaBi } from "../../lib/atlas/bulgaria/bi-import";
import { scanBulgariaBiInventory } from "../../lib/atlas/bulgaria/bi-inventory";
import { projectBulgariaBi } from "../../lib/atlas/bulgaria/bi-project";
import {
  BI_CANDIDATE_FINGERPRINT,
  BI_CANDIDATE_RELEASE_ID,
  BI_DRAFT_OFFICE_IDS,
  BI_SCHEMA_TIER_SHA256,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  EXPECTED_BI_COUNTS,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  PROMPT_P_TIER_PATH,
  SAMPLE_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/bulgaria/bi-identity";
import { importBulgaria } from "../../lib/atlas/bulgaria/import";
import { geographyIdFor } from "../../lib/atlas/bulgaria/identity";
import { scopeImportsBulgariaBi, scopeImportsChile } from "../../lib/atlas/continuity/import";
import { insertRow, openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Bulgaria Prompt BI additive importer", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("stays off the all scope and leaves Chile wiring alone", () => {
    expect(scopeImportsBulgariaBi("bulgaria")).toBe(true);
    expect(scopeImportsBulgariaBi("all")).toBe(false);
    expect(scopeImportsBulgariaBi("chile")).toBe(false);
    expect(scopeImportsChile("chile")).toBe(true);
    expect(scopeImportsChile("all")).toBe(false);
    expect(scopeImportsChile("bulgaria")).toBe(false);
  });

  it("pins the slim fingerprint and does not load omitted event or result files", () => {
    const inventory = scanBulgariaBiInventory({ root: repoRoot });
    expect(inventory.fingerprint).toBe(BI_CANDIDATE_FINGERPRINT);
    expect(inventory.preservedIds).toHaveLength(EXPECTED_BI_COUNTS.preserved_offices);
    expect(inventory.tracked.some((item) => (OMITTED_PATHS as readonly string[]).includes(item.input_path))).toBe(false);
    expect(inventory.intendedInventory.publish_holds).toBe(false);
  });

  it("publishes 530 preserved offices plus 4 needs_review drafts and no holds", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(first.writeMode).toBe("fresh");
    expect(first.counts.offices).toBe(534);
    expect(first.counts.current_offices).toBe(533);
    expect(first.counts.historical_offices).toBe(1);
    expect(first.counts.municipal_offices).toBe(530);
    expect(first.counts.approved_classifications).toBe(530);
    expect(first.counts.needs_review_classifications).toBe(4);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.held_offices).toBe(3067);
    expect(first.counts.prompt_bi).toBe(1);
    expect(first.reusedRelease).toBe(false);

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(534);
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      expect(db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = 'BG-VAR01-M'").get()).toMatchObject({
        geography_id: geographyIdFor("BG-VAR01-M"),
        office_type: "Mayor",
      });
      expect(
        db.prepare("SELECT review_status FROM office_tier_classification WHERE office_id = 'BG-VAR01-C'").get(),
      ).toMatchObject({ review_status: "approved" });
      for (const officeId of BI_DRAFT_OFFICE_IDS) {
        const row = db
          .prepare(
            `SELECT o.geography_id, t.review_status, t.tier,
                    json_extract(t.raw_json, '$.row.justin_approved') AS justin_approved,
                    json_extract(t.raw_json, '$.row.applied') AS applied
             FROM office o
             JOIN office_tier_classification t ON t.office_id = o.office_id
             WHERE o.office_id = ?`,
          )
          .get(officeId) as {
          geography_id: string;
          review_status: string;
          tier: string;
          justin_approved: number;
          applied: number;
        };
        expect(row.review_status).toBe("needs_review");
        expect(row.geography_id).toBe(COUNTRY_GEOGRAPHY_ID);
        expect(row.justin_approved).toBe(0);
        expect(row.applied).toBe(0);
        if (officeId === "BG-EUROPEAN-PARLIAMENT") expect(row.tier).toBe("other");
        else expect(row.tier).toBe("national_context");
      }
      expect(
        db.prepare("SELECT office_status FROM office WHERE office_id = 'BG-GRAND-NATIONAL-ASSEMBLY-1990'").get(),
      ).toMatchObject({ office_status: "historical" });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()?.n)).toBe(OPEN_HOLD_IDS.length);
      expect(
        db.prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(LINEAGE_ID, TIER_PATH),
      ).toMatchObject({ sha256: BI_SCHEMA_TIER_SHA256 });
    } finally {
      db.close();
    }

    const second = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(second.writeMode).toBe("reuse");
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);

  it("upgrades an existing Bulgaria release without rewriting preserved offices or the rest of the atlas", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-additive-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const oldRelease = `${LINEAGE_ID}--sha256-${"ab".repeat(32)}`;
    const sentinelLineage = "country-package-sentinel";
    const sentinelRelease = `${sentinelLineage}--sha256-${"cd".repeat(32)}`;
    const draftIds = new Set<string>(BI_DRAFT_OFFICE_IDS);
    const projection = projectBulgariaBi(scanBulgariaBiInventory({ root: repoRoot }));
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = openAtlasDatabase(sqlitePath);
    db.exec("PRAGMA foreign_keys = OFF;");
    db.exec("BEGIN IMMEDIATE;");
    try {
      const retarget = (row: Record<string, unknown>, releaseId: string) => ({ ...row, release_id: releaseId });
      insertRow(db, "dataset_lineage", projection.lineage);
      insertRow(db, "dataset_release", {
        ...projection.release,
        release_id: oldRelease,
        fingerprint_sha256: "ab".repeat(32),
      });
      insertRow(db, "publication_release", { lineage_id: LINEAGE_ID, release_id: oldRelease });
      insertRow(db, "country", retarget(projection.country, oldRelease));
      for (const row of projection.retainedInputs) insertRow(db, "retained_input", retarget(row, oldRelease));
      for (const row of projection.geographies) {
        if (row.geography_id === COUNTRY_GEOGRAPHY_ID) continue;
        insertRow(db, "geography", retarget(row, oldRelease));
      }
      for (const row of projection.tiers) {
        if (draftIds.has(String(row.office_id))) continue;
        insertRow(db, "office_tier_classification", retarget(row, oldRelease));
      }
      // Live Prompt P cited schemas/atlas/tiers/bulgaria.json at the approved hash.
      // That path is now the BI draft. The preserved classifier is a different path
      // and was not a retained_input on that release.
      db.prepare("DELETE FROM retained_input WHERE lineage_id = ? AND input_path = ?").run(LINEAGE_ID, PROMPT_P_TIER_PATH);
      db.prepare(
        `UPDATE retained_input
         SET input_kind = 'tier_classification', sha256 = ?, byte_count = 1, recovery_locator = ?
         WHERE lineage_id = ? AND input_path = ?`,
      ).run(TIER_SHA256, `sha256:${TIER_SHA256}`, LINEAGE_ID, TIER_PATH);
      db.prepare(
        `UPDATE office_tier_classification
         SET classification_path = ?, classification_kind = 'tier_classification', classification_sha256 = ?
         WHERE lineage_id = ?`,
      ).run(TIER_PATH, TIER_SHA256, LINEAGE_ID);
      for (const row of projection.offices) {
        if (draftIds.has(String(row.office_id))) continue;
        insertRow(
          db,
          "office",
          retarget(
            {
              ...row,
              state_note: row.office_id === SAMPLE_MAYOR_ID ? "preserve-row" : row.state_note,
            },
            oldRelease,
          ),
        );
      }
      for (const row of projection.locators) {
        if (row.entity_kind === "office" && draftIds.has(String(row.office_id))) continue;
        insertRow(db, "record_locator", retarget(row, oldRelease));
      }
      insertRow(db, "research_date", {
        date_id: "bulgaria-seed-date",
        label: "2023",
        precision: "year",
        certainty: "called",
        year: 2023,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: LINEAGE_ID,
        release_id: oldRelease,
        raw_json: "{}",
      });
      insertRow(db, "election_event", {
        id_namespace: OFFICE_NAMESPACE,
        office_id: SAMPLE_MAYOR_ID,
        history_key: "seed-hk",
        event_id: "seed-event",
        date_id: "bulgaria-seed-date",
        date_resolution: "resolved",
        event_kind: "unknown",
        selected_history_role: "selected",
        electoral_system: null,
        comparability: null,
        ballot_basis: "unknown",
        share_unit: "percent_0_100",
        legal_outcome: "unknown",
        record_state: "active",
        state_note: null,
        lineage_id: LINEAGE_ID,
        release_id: oldRelease,
        raw_json: "{}",
      });
      insertRow(db, "result_row", {
        id_namespace: OFFICE_NAMESPACE,
        office_id: SAMPLE_MAYOR_ID,
        history_key: "seed-hk",
        result_row_id: "bulgaria-seed-result",
        proceeding_id: null,
        country_id: COUNTRY_ID,
        candidate_or_list_label: "Seed",
        original_party_label: null,
        original_party_code: null,
        party_namespace: null,
        party_mapping_id: null,
        votes: null,
        votes_status: "unknown",
        share: null,
        share_status: "unknown",
        share_unit: "percent_0_100",
        seats: null,
        seats_status: "unknown",
        elected_flag: null,
        is_substitute: null,
        evidence_status: "unknown",
        lineage_id: LINEAGE_ID,
        release_id: oldRelease,
        raw_json: "{}",
      });
      insertRow(db, "source", {
        country_id: COUNTRY_ID,
        source_namespace: LINEAGE_ID,
        source_id: "bulgaria-seed-source",
        publisher: null,
        title: "seed",
        url: null,
        checked_as_of_label: null,
        evidence_grade: null,
        file_sha256: null,
        locator: null,
        data_rights: "unknown",
        lineage_id: LINEAGE_ID,
        release_id: oldRelease,
        raw_json: "{}",
      });
      insertRow(db, "record_locator", {
        record_key: "bulgaria-seed-event-locator",
        entity_kind: "event",
        country_id: COUNTRY_ID,
        geography_id: null,
        id_namespace: OFFICE_NAMESPACE,
        office_id: SAMPLE_MAYOR_ID,
        history_key: "seed-hk",
        proceeding_id: null,
        result_row_id: null,
        party_namespace: null,
        party_mapping_id: null,
        source_namespace: null,
        source_id: null,
        input_path: null,
        lineage_id: LINEAGE_ID,
        release_id: oldRelease,
        source_row_locator: null,
      });
      insertRow(db, "derived_jurisdiction", {
        jurisdiction_key: "bulgaria-country",
        country_id: COUNTRY_ID,
        geography_id: null,
        parent_key: null,
        depth: 0,
        level_label: "country",
        name: "Bulgaria",
        slug: "bulgaria",
        slug_path: "bulgaria",
        office_count: 530,
        event_count: 1,
        first_event_year: 2023,
        last_event_year: 2023,
        coverage_status: "partial",
        ambiguous: 0,
      });
      insertRow(db, "derived_coverage", {
        jurisdiction_key: "bulgaria-country",
        offices: 530,
        offices_with_any_event: 1,
        offices_with_results: 1,
        events_total: 1,
        events_with_results: 1,
        not_supplied_next_dates: 0,
        latest_snapshot_label: null,
      });
      insertRow(db, "derived_cycle", {
        cycle_key: "bulgaria-seed-cycle",
        country_id: COUNTRY_ID,
        date_id: "bulgaria-seed-date",
        iso_date: "2023-10-29",
        contest_count: 1,
        scope_key: "bulgaria-country",
        tiers_json: "[]",
        kinds_json: "[]",
        label: "Seed cycle",
      });
      insertRow(db, "derived_cycle_unplaced", {
        id_namespace: OFFICE_NAMESPACE,
        office_id: SAMPLE_MAYOR_ID,
        history_key: "seed-hk",
        country_id: COUNTRY_ID,
        year: 2023,
        date_id: "bulgaria-seed-date",
        date_precision: "year",
        date_resolution: "resolved",
      });
      insertRow(db, "derived_seat_status", {
        id_namespace: OFFICE_NAMESPACE,
        office_id: SAMPLE_MAYOR_ID,
        country_id: COUNTRY_ID,
        current_holder_label: null,
        current_holder_party_label: null,
        current_since_date_id: null,
        last_selected_event_id: "seed-event",
        last_share: null,
        last_share_unit: null,
        last_margin: null,
        next_date_id: null,
        status_reason: null,
      });

      insertRow(db, "dataset_lineage", {
        lineage_id: sentinelLineage,
        provenance_kind: "country_package",
        description: "sentinel",
      });
      insertRow(db, "dataset_release", {
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        fingerprint_sha256: "cd".repeat(32),
        hash_inputs_json: "{}",
        adapter_version: "sentinel",
        method_version: "sentinel",
        schema_version: "atlas-master/1",
        research_snapshot_label: null,
        upstream_release_id: null,
        validated_counts_json: "{}",
        research_coverage_complete: 0,
        raw_json: "{}",
      });
      insertRow(db, "publication_release", { lineage_id: sentinelLineage, release_id: sentinelRelease });
      insertRow(db, "country", {
        country_id: "sentinel",
        country_code: "QZ",
        name: "Sentinel",
        polity_kind: "sovereign_country",
        region_id: "europe",
        coverage_status: "partial",
        screening_as_of_label: null,
        notes: "sentinel",
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        raw_json: "{}",
      });
      insertRow(db, "geography", {
        country_id: "sentinel",
        geography_id: "sentinel-geo",
        name: "Sentinel",
        parent_geography_id: null,
        effective_from_label: null,
        effective_to_label: null,
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        raw_json: "{}",
      });
      insertRow(db, "retained_input", {
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        input_path: "sentinel/tiers.json",
        input_kind: "tier_classification",
        sha256: "cd".repeat(32),
        byte_count: 1,
        recovery_locator: `sha256:${"cd".repeat(32)}`,
        payload_json: null,
      });
      insertRow(db, "office_tier_classification", {
        id_namespace: "sentinel-ns",
        office_id: "SN-1",
        tier: "municipal",
        review_status: "approved",
        rationale: "sentinel",
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        classification_path: "sentinel/tiers.json",
        classification_kind: "tier_classification",
        classification_sha256: "cd".repeat(32),
        raw_json: "{}",
      });
      insertRow(db, "office", {
        id_namespace: "sentinel-ns",
        office_id: "SN-1",
        country_id: "sentinel",
        geography_id: "sentinel-geo",
        name: "Sentinel — Mayor",
        office_type: "Mayor",
        office_status: "current",
        record_state: "active",
        state_note: null,
        registry_qualified: null,
        next_date_id: null,
        next_date_resolution: "unknown",
        next_history_key: null,
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        raw_json: "{\"keep\":true}",
      });
      insertRow(db, "research_date", {
        date_id: "sentinel-date",
        label: "2024",
        precision: "year",
        certainty: "called",
        year: 2024,
        month: null,
        day: null,
        range_start_id: null,
        range_end_id: null,
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        raw_json: "{}",
      });
      insertRow(db, "election_event", {
        id_namespace: "sentinel-ns",
        office_id: "SN-1",
        history_key: "sentinel-hk",
        event_id: "sentinel-event",
        date_id: "sentinel-date",
        date_resolution: "resolved",
        event_kind: "unknown",
        selected_history_role: "selected",
        electoral_system: null,
        comparability: null,
        ballot_basis: "unknown",
        share_unit: "percent_0_100",
        legal_outcome: "unknown",
        record_state: "active",
        state_note: null,
        lineage_id: sentinelLineage,
        release_id: sentinelRelease,
        raw_json: "{}",
      });
      for (let index = 0; index < 20; index += 1) {
        insertRow(db, "result_row", {
          id_namespace: "sentinel-ns",
          office_id: "SN-1",
          history_key: "sentinel-hk",
          result_row_id: `sentinel-result-${index}`,
          proceeding_id: null,
          country_id: "sentinel",
          candidate_or_list_label: "Keep",
          original_party_label: null,
          original_party_code: null,
          party_namespace: null,
          party_mapping_id: null,
          votes: null,
          votes_status: "unknown",
          share: null,
          share_status: "unknown",
          share_unit: "percent_0_100",
          seats: null,
          seats_status: "unknown",
          elected_flag: null,
          is_substitute: null,
          evidence_status: "unknown",
          lineage_id: sentinelLineage,
          release_id: sentinelRelease,
          raw_json: "{\"keep\":true}",
        });
      }
      insertRow(db, "derived_jurisdiction", {
        jurisdiction_key: "sentinel-country",
        country_id: "sentinel",
        geography_id: null,
        parent_key: null,
        depth: 0,
        level_label: "country",
        name: "Sentinel",
        slug: "sentinel",
        slug_path: "sentinel",
        office_count: 1,
        event_count: 1,
        first_event_year: 2024,
        last_event_year: 2024,
        coverage_status: "partial",
        ambiguous: 0,
      });
      insertRow(db, "derived_coverage", {
        jurisdiction_key: "sentinel-country",
        offices: 1,
        offices_with_any_event: 1,
        offices_with_results: 1,
        events_total: 1,
        events_with_results: 1,
        not_supplied_next_dates: 0,
        latest_snapshot_label: null,
      });
      insertRow(db, "derived_cycle", {
        cycle_key: "sentinel-seed-cycle",
        country_id: "sentinel",
        date_id: "sentinel-date",
        iso_date: "2024-01-15",
        contest_count: 1,
        scope_key: "sentinel-country",
        tiers_json: "[]",
        kinds_json: "[]",
        label: "Sentinel cycle",
      });
      insertRow(db, "derived_seat_status", {
        id_namespace: "sentinel-ns",
        office_id: "SN-1",
        country_id: "sentinel",
        current_holder_label: null,
        current_holder_party_label: null,
        current_since_date_id: null,
        last_selected_event_id: "sentinel-event",
        last_share: null,
        last_share_unit: null,
        last_margin: null,
        next_date_id: null,
        status_reason: null,
      });
      db.exec("COMMIT;");
    } catch (error) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // already closed
      }
      throw error;
    } finally {
      db.exec("PRAGMA foreign_keys = ON;");
      db.close();
    }

    const upgraded = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-additive",
    });
    expect(upgraded.writeMode).toBe("additive");
    expect(upgraded.reusedRelease).toBe(false);
    expect(upgraded.counts.offices).toBe(534);
    expect(upgraded.releaseId).toBe(BI_CANDIDATE_RELEASE_ID);

    const published = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const mayor = published
        .prepare("SELECT state_note, release_id, geography_id, office_type FROM office WHERE office_id = ?")
        .get(SAMPLE_MAYOR_ID) as {
        state_note: string;
        release_id: string;
        geography_id: string;
        office_type: string;
      };
      expect(mayor.state_note).toBe("preserve-row");
      expect(mayor.release_id).toBe(BI_CANDIDATE_RELEASE_ID);
      expect(mayor.geography_id).toBe(geographyIdFor(SAMPLE_MAYOR_ID));
      expect(mayor.office_type).toBe("Mayor");
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(
        534,
      );
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM office WHERE state_note = 'preserve-row'").get()?.n)).toBe(
        1,
      );
      expect(published.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      expect(
        published
          .prepare(
            `SELECT classification_path, classification_kind, classification_sha256, review_status
             FROM office_tier_classification WHERE office_id = ?`,
          )
          .get(SAMPLE_MAYOR_ID),
      ).toMatchObject({
        classification_path: PROMPT_P_TIER_PATH,
        classification_kind: "tier_classification",
        classification_sha256: TIER_SHA256,
        review_status: "approved",
      });
      expect(
        Number(
          published
            .prepare(
              `SELECT COUNT(*) AS n FROM office_tier_classification
               WHERE lineage_id = ? AND classification_path = ? AND classification_sha256 = ? AND review_status = 'approved'`,
            )
            .get(LINEAGE_ID, PROMPT_P_TIER_PATH, TIER_SHA256)?.n,
        ),
      ).toBe(530);
      expect(
        published.prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(
          LINEAGE_ID,
          TIER_PATH,
        ),
      ).toMatchObject({ sha256: BI_SCHEMA_TIER_SHA256, input_kind: "tier_classification" });
      expect(
        published.prepare("SELECT sha256, input_kind FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(
          LINEAGE_ID,
          PROMPT_P_TIER_PATH,
        ),
      ).toMatchObject({ sha256: TIER_SHA256, input_kind: "tier_classification" });
      expect(published.prepare("PRAGMA foreign_key_check(office_tier_classification)").all()).toEqual([]);
      for (const officeId of BI_DRAFT_OFFICE_IDS) {
        expect(
          published
            .prepare(
              `SELECT review_status, classification_path, classification_kind, classification_sha256
               FROM office_tier_classification WHERE office_id = ?`,
            )
            .get(officeId),
        ).toMatchObject({
          review_status: "needs_review",
          classification_path: TIER_PATH,
          classification_kind: "tier_classification",
          classification_sha256: BI_SCHEMA_TIER_SHA256,
        });
      }
      expect(
        published.prepare("SELECT classification_path, classification_sha256, release_id FROM office_tier_classification WHERE office_id = 'SN-1'").get(),
      ).toMatchObject({
        classification_path: "sentinel/tiers.json",
        classification_sha256: "cd".repeat(32),
        release_id: sentinelRelease,
      });
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(
        0,
      );
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(
        0,
      );
      expect(
        published.prepare("SELECT record_key FROM record_locator WHERE record_key = 'bulgaria-seed-event-locator'").get(),
      ).toBeUndefined();
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(sentinelLineage)?.n)).toBe(
        20,
      );
      expect(published.prepare("SELECT raw_json FROM result_row WHERE result_row_id = 'sentinel-result-0'").get()).toMatchObject({
        raw_json: "{\"keep\":true}",
      });
      expect(published.prepare("SELECT raw_json FROM office WHERE office_id = 'SN-1'").get()).toMatchObject({
        raw_json: "{\"keep\":true}",
      });
      expect(
        Number(published.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(sentinelLineage)?.n),
      ).toBe(1);
      expect(
        published.prepare("SELECT office_count, event_count, first_event_year FROM derived_jurisdiction WHERE jurisdiction_key = 'bulgaria-country'").get(),
      ).toMatchObject({ office_count: 534, event_count: 0, first_event_year: null });
      expect(
        published.prepare("SELECT office_count, event_count FROM derived_jurisdiction WHERE jurisdiction_key = 'sentinel-country'").get(),
      ).toMatchObject({ office_count: 1, event_count: 1 });
      expect(
        published.prepare("SELECT offices, events_total, offices_with_any_event FROM derived_coverage WHERE jurisdiction_key = 'bulgaria-country'").get(),
      ).toMatchObject({ offices: 534, events_total: 0, offices_with_any_event: 0 });
      expect(published.prepare("SELECT cycle_key FROM derived_cycle WHERE cycle_key = 'bulgaria-seed-cycle'").get()).toBeUndefined();
      expect(published.prepare("SELECT cycle_key FROM derived_cycle WHERE cycle_key = 'sentinel-seed-cycle'").get()).toMatchObject({
        cycle_key: "sentinel-seed-cycle",
      });
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM derived_cycle_unplaced WHERE country_id = ?").get(COUNTRY_ID)?.n)).toBe(
        0,
      );
      expect(Number(published.prepare("SELECT COUNT(*) AS n FROM derived_seat_status WHERE country_id = ?").get(COUNTRY_ID)?.n)).toBe(
        5,
      );
      expect(
        published.prepare("SELECT last_selected_event_id, status_reason FROM derived_seat_status WHERE office_id = ?").get(SAMPLE_MAYOR_ID),
      ).toMatchObject({ last_selected_event_id: null, status_reason: "no_history" });
      expect(
        published.prepare("SELECT last_selected_event_id, status_reason FROM derived_seat_status WHERE office_id = 'SN-1'").get(),
      ).toMatchObject({ last_selected_event_id: "sentinel-event", status_reason: null });
      expect(
        published.prepare("SELECT geography_id FROM geography WHERE country_id = ? AND geography_id = ?").get(COUNTRY_ID, COUNTRY_GEOGRAPHY_ID),
      ).toMatchObject({ geography_id: COUNTRY_GEOGRAPHY_ID });
    } finally {
      published.close();
    }

    const reused = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-additive",
    });
    expect(reused.writeMode).toBe("reuse");
    expect(reused.reusedRelease).toBe(true);
    const afterReuse = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(afterReuse.prepare("SELECT state_note FROM office WHERE office_id = ?").get(SAMPLE_MAYOR_ID)).toMatchObject({
        state_note: "preserve-row",
      });
      expect(
        afterReuse.prepare("SELECT jurisdiction_key FROM derived_jurisdiction WHERE jurisdiction_key = 'sentinel-country'").get(),
      ).toMatchObject({ jurisdiction_key: "sentinel-country" });
    } finally {
      afterReuse.close();
    }
  }, 240_000);

  it("refuses fixture injection on the BI path", () => {
    process.env.OBSERVATORY_FIXTURES = "1";
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-fixtures-"));
    tempDirs.push(dir);
    expect(() =>
      importBulgariaBi({
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "bulgaria-bi-fixture",
      }),
    ).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
  }, 120_000);
});

describe("Prompt P all-path classifier", () => {
  it("still publishes only the 530 accepted offices when importBulgaria is called directly", () => {
    delete process.env.OBSERVATORY_FIXTURES;
    expect(scopeImportsBulgariaBi("all")).toBe(false);
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-p-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    try {
      const result = importBulgaria({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "bulgaria-p-test",
      });
      expect(result.counts.current_offices).toBe(530);
      expect(result.counts.municipal_offices).toBe(530);
      expect(result.counts.regional_offices).toBe(0);
      expect(result.counts.held_offices).toBe(3067);
      expect(result.counts.selected_histories).toBe(1590);
      expect(result.counts.result_rows).toBe(10343);
      expect(result.counts.prompt_bi).toBeUndefined();
      const db = openAtlasDatabase(sqlitePath, { readOnly: true });
      try {
        expect(db.prepare("SELECT office_id FROM office WHERE office_id = 'BG-NATIONAL-ASSEMBLY'").get()).toBeUndefined();
        expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      } finally {
        db.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 300_000);
});
