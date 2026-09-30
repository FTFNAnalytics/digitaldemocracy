import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { scopeImportsChile, scopeImportsKosovo } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_CONVENTION_ID,
  HISTORICAL_COUNCIL_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  SAMPLE_CORE_ID,
  SAMPLE_GOVERNOR_ID,
  SHARED_COUNCIL_ID,
  SHARED_GEOGRAPHY_ID,
  SHARED_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/chile/identity";
import { importChile } from "../../lib/atlas/chile/import";
import { ChilePreflightError, scanChileInventory } from "../../lib/atlas/chile/inventory";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Chile Atlas importer", () => {
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

  it("keeps Chile out of the all scope and leaves Kosovo scoped", () => {
    expect(scopeImportsChile("chile")).toBe(true);
    expect(scopeImportsChile("all")).toBe(false);
    expect(scopeImportsChile("uruguay")).toBe(false);
    expect(scopeImportsChile("kosovo")).toBe(false);
    expect(scopeImportsKosovo("chile")).toBe(false);
    expect(scopeImportsKosovo("all")).toBe(false);
  });

  it("scans the Prompt BJ pack and pins the supplied tier bytes", () => {
    const inventory = scanChileInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(727);
    expect(inventory.offices).toHaveLength(727);
    expect(inventory.geographies).toHaveLength(362);
    expect(inventory.comunas).toBe(346);
    expect(inventory.municipalAdministrations).toBe(345);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.parentsLeftNull).toBe(0);
    expect(inventory.upcomingCalendarRows).toBe(14);
    expect(inventory.gaps).toHaveLength(20);
    expect(inventory.tiers.every((row) => row.status === "draft_unapproved" && row.justin_approved === false && row.applied === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(24);
    expect(String(inventory.intendedInventory.full_zip_sha256_documentary)).toBe(FULL_ZIP_SHA256);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
    expect(inventory.offices.filter((row) => row.office_status === "current")).toHaveLength(725);
    expect(inventory.offices.filter((row) => row.office_status === "historical_only")).toHaveLength(2);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanChileInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(ChilePreflightError);
  });

  it("imports 725 current and 2 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-chile-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importChile({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "chile-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(727);
    expect(first.counts.current_offices).toBe(725);
    expect(first.counts.historical_offices).toBe(2);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national_context).toBe(5);
    expect(first.counts.draft_tier_regional).toBe(32);
    expect(first.counts.draft_tier_municipal).toBe(690);
    expect(first.counts.schema_national).toBe(5);
    expect(first.counts.schema_regional).toBe(32);
    expect(first.counts.schema_municipal).toBe(690);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.current_direct_executives).toBe(362);
    expect(first.counts.current_councils).toBe(361);
    expect(first.counts.current_national_chambers).toBe(2);
    expect(first.counts.current_mayors).toBe(345);
    expect(first.counts.current_municipal_councils).toBe(345);
    expect(first.counts.current_governors).toBe(16);
    expect(first.counts.current_core).toBe(16);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.provincial_elected_offices).toBe(0);
    expect(first.counts.mercosur_offices).toBe(0);
    expect(first.counts.andean_offices).toBe(0);
    expect(first.counts.appointed_intendente_offices).toBe(0);
    expect(first.counts.comunas).toBe(346);
    expect(first.counts.municipal_administrations).toBe(345);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(20);
    expect(first.counts.named_open_holds).toBe(20);
    expect(first.counts.closed_gaps).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(727);
    expect(first.counts.geographies).toBe(362);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.applied_calendar_rows).toBe(0);
    expect(first.counts.upcoming_calendar_rows).toBe(14);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(727);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(725);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(2);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type, geography_id FROM office WHERE office_id = ?").get(SAMPLE_GOVERNOR_ID)).toMatchObject({
        office_status: "current",
        office_type: "regional_governor",
        geography_id: "CL-R-01",
      });
      expect(db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = ?").get(SAMPLE_CORE_ID)).toMatchObject({
        geography_id: "CL-R-01",
        office_type: "regional_council",
      });
      expect(db.prepare("SELECT office_status, office_type, geography_id FROM office WHERE office_id = ?").get(SHARED_MAYOR_ID)).toMatchObject({
        office_status: "current",
        office_type: "municipal_mayor",
        geography_id: SHARED_GEOGRAPHY_ID,
      });
      expect(db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(SHARED_COUNCIL_ID)).toMatchObject({
        geography_id: SHARED_GEOGRAPHY_ID,
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_CONVENTION_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_constitutional_convention",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_COUNCIL_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_constitutional_council",
      });
      expect(db.prepare("SELECT country_code, name, coverage_status FROM country WHERE country_id = 'chile'").get()).toMatchObject({
        country_code: "CL",
        name: "Chile",
        coverage_status: "partial",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(20);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%antartica%'").get()?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("chile", sqlitePath);
    expect(calendar.count).toBe(32);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toBe("32 regional-tier offices.");
    expect(calendar.label).not.toMatch(/2028|2029|Sunday|CL-BJ/);

    const second = importChile({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "chile-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.offices).toBe(727);
    expect(second.counts.current_offices).toBe(725);
    expect(second.counts.historical_offices).toBe(2);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
    expect(second.counts.applied_calendar_rows).toBe(0);
  });

  it("replaces an empty screened_out continuity stub with partial draft coverage", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-chile-stub-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const stub = openAtlasDatabase(sqlitePath);
    try {
      stub.exec("BEGIN IMMEDIATE");
      stub
        .prepare("INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'latin_america_release', ?)")
        .run("latin-america-stub", "continuity stub");
      stub
        .prepare(
          `INSERT INTO dataset_release (
             lineage_id, release_id, fingerprint_sha256, hash_inputs_json, adapter_version, method_version,
             schema_version, validated_counts_json, research_coverage_complete, raw_json
           ) VALUES (?, ?, ?, '{}', 'stub', 'stub', 'atlas-master/1', '{}', 0, '{}')`,
        )
        .run("latin-america-stub", "latin-america-stub--sha256-" + "a".repeat(64), "a".repeat(64));
      stub
        .prepare("INSERT INTO publication_release (lineage_id, release_id) VALUES (?, ?)")
        .run("latin-america-stub", "latin-america-stub--sha256-" + "a".repeat(64));
      stub
        .prepare(
          `INSERT INTO country (
             country_id, country_code, name, polity_kind, region_id, coverage_status, notes, lineage_id, release_id, raw_json
           ) VALUES ('chile', NULL, 'Chile', 'sovereign_country', 'south-america', 'screened_out', 'empty stub', 'latin-america-stub', ?, '{}')`,
        )
        .run("latin-america-stub--sha256-" + "a".repeat(64));
      stub
        .prepare(
          `INSERT INTO source (
             country_id, source_namespace, source_id, title, data_rights, lineage_id, release_id, raw_json
           ) VALUES ('chile', 'latin-america-stub', 'chile--poll', 'job approval', 'unknown', 'latin-america-stub', ?, '{}')`,
        )
        .run("latin-america-stub--sha256-" + "a".repeat(64));
      stub.exec("COMMIT");
    } finally {
      stub.close();
    }

    const imported = importChile({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "chile-stub-test",
    });
    expect(imported.counts.offices).toBe(727);
    expect(imported.counts.sources).toBe(0);
    expect(imported.counts.total_events).toBe(0);
    expect(imported.counts.result_rows).toBe(0);
    expect(imported.counts.approved_classifications).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(db.prepare("SELECT coverage_status, country_code, lineage_id FROM country WHERE country_id = 'chile'").get()).toMatchObject({
        coverage_status: "partial",
        country_code: "CL",
        lineage_id: LINEAGE_ID,
      });
      expect(db.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(db.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 727 });
      expect(db.prepare("SELECT review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        review_status: "needs_review",
      });
    } finally {
      db.close();
    }
  });
});
