import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsMoldova, scopeImportsUkraine } from "../../lib/atlas/continuity/import";
import {
  ARC_HISTORICAL_ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  KYIV_COUNCIL_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  SAMPLE_CITY_DISTRICT_ID,
  SEVASTOPOL_HISTORICAL_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
  VINNYTSIA_HISTORICAL_RAION_ID,
} from "../../lib/atlas/ukraine/identity";
import { importUkraine } from "../../lib/atlas/ukraine/import";
import { UkrainePreflightError, scanUkraineInventory } from "../../lib/atlas/ukraine/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Ukraine Atlas importer", () => {
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

  it("keeps Ukraine out of the all scope and leaves Moldova scoped", () => {
    expect(scopeImportsUkraine("ukraine")).toBe(true);
    expect(scopeImportsUkraine("all")).toBe(false);
    expect(scopeImportsUkraine("moldova")).toBe(false);
    expect(scopeImportsUkraine("montenegro")).toBe(false);
    expect(scopeImportsMoldova("ukraine")).toBe(false);
    expect(scopeImportsMoldova("all")).toBe(false);
  });

  it("scans the Prompt BD pack and pins the supplied tier bytes", () => {
    const inventory = scanUkraineInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(3005);
    expect(inventory.offices).toHaveLength(3005);
    expect(inventory.geographies).toHaveLength(1583);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.parentsLeftNull).toBe(9);
    expect(inventory.territorialHoldRows).toBe(374);
    expect(inventory.gaps).toHaveLength(19);
    expect(inventory.tiers.every((row) => row.status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(29);
    expect(String(inventory.intendedInventory.full_zip_sha256_documentary)).toBe(FULL_ZIP_SHA256);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanUkraineInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(UkrainePreflightError);
  });

  it("imports 3000 current and 5 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-ukraine-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importUkraine({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "ukraine-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(3005);
    expect(first.counts.current_offices).toBe(3000);
    expect(first.counts.historical_offices).toBe(5);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(2);
    expect(first.counts.draft_tier_regional).toBe(24);
    expect(first.counts.draft_tier_autonomous).toBe(1);
    expect(first.counts.draft_tier_raion).toBe(120);
    expect(first.counts.draft_tier_local).toBe(2843);
    expect(first.counts.draft_tier_city_district).toBe(15);
    expect(first.counts.schema_national).toBe(2);
    expect(first.counts.schema_regional).toBe(145);
    expect(first.counts.schema_municipal).toBe(2858);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.current_direct_executives).toBe(1422);
    expect(first.counts.historical_direct_executives).toBe(0);
    expect(first.counts.current_local_mayors).toBe(1421);
    expect(first.counts.current_local_councils).toBe(1421);
    expect(first.counts.current_councils).toBe(1577);
    expect(first.counts.current_legislatures).toBe(1);
    expect(first.counts.current_raion_councils).toBe(119);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.occupying_power_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(19);
    expect(first.counts.named_open_holds).toBe(19);
    expect(first.counts.closed_gaps).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(3005);
    expect(first.counts.geographies).toBe(1583);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.unnamed_current_heads).toBe(23);
    expect(first.counts.territorial_hold_rows).toBe(374);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(3005);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(3000);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(5);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PARLIAMENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "president",
      });
      expect(db.prepare("SELECT next_date_id, next_date_resolution FROM office WHERE office_id = ?").get(KYIV_COUNCIL_ID)).toMatchObject({
        next_date_id: null,
        next_date_resolution: "unknown",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(VINNYTSIA_HISTORICAL_RAION_ID)).toMatchObject({
        office_status: "historical",
        office_type: "raion_council",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(ARC_HISTORICAL_ASSEMBLY_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SEVASTOPOL_HISTORICAL_COUNCIL_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(
        db.prepare("SELECT tier, json_extract(raw_json, '$.row.tier') AS draft_tier FROM office_tier_classification WHERE office_id = ?").get(
          SAMPLE_CITY_DISTRICT_ID,
        ),
      ).toMatchObject({
        tier: "municipal",
        draft_tier: "city_district",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(19);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
      expect(Number(db.prepare("SELECT json_extract(raw_json, '$.row.justin_approved') AS approved FROM office_tier_classification WHERE json_extract(raw_json, '$.row.justin_approved') != 0").get()?.approved ?? 0)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("ukraine", sqlitePath);
    expect(calendar.count).toBe(145);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("UA-BD-G01");
    expect(calendar.label).toContain("not projected");

    const second = importUkraine({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "ukraine-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(3000);
    expect(second.counts.historical_offices).toBe(5);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });
});
