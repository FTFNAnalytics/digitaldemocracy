import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsMoldova, scopeImportsSlovakia, scopeImportsSlovenia } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CALINESTI_HISTORICAL_MAYOR_ID,
  FULL_ZIP_SHA256,
  GAGAUZIA_ASSEMBLY_ID,
  GAP_STATUS,
  LEOVA_HISTORICAL_COUNCIL_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/moldova/identity";
import { importMoldova } from "../../lib/atlas/moldova/import";
import { MoldovaPreflightError, scanMoldovaInventory } from "../../lib/atlas/moldova/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Moldova Atlas importer", () => {
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

  it("keeps Moldova out of the all scope and leaves Slovakia and Slovenia scoped", () => {
    expect(scopeImportsMoldova("moldova")).toBe(true);
    expect(scopeImportsMoldova("all")).toBe(false);
    expect(scopeImportsMoldova("slovakia")).toBe(false);
    expect(scopeImportsMoldova("slovenia")).toBe(false);
    expect(scopeImportsMoldova("montenegro")).toBe(false);
    expect(scopeImportsSlovakia("moldova")).toBe(false);
    expect(scopeImportsSlovakia("all")).toBe(false);
    expect(scopeImportsSlovenia("moldova")).toBe(false);
    expect(scopeImportsSlovenia("all")).toBe(false);
  });

  it("scans the Prompt BC pack and pins the supplied tier bytes", () => {
    const inventory = scanMoldovaInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(1836);
    expect(inventory.offices).toHaveLength(1836);
    expect(inventory.geographies).toHaveLength(934);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.referenceCrosswalkRows).toBe(1802);
    expect(inventory.gaps).toHaveLength(24);
    expect(inventory.tiers.every((row) => row.review_status === "draft_for_human_review" && row.justin_approved === false)).toBe(true);
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
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanMoldovaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(MoldovaPreflightError);
  });

  it("imports 1822 current and 14 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-moldova-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importMoldova({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "moldova-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(1836);
    expect(first.counts.current_offices).toBe(1822);
    expect(first.counts.historical_offices).toBe(14);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(2);
    expect(first.counts.draft_tier_autonomous).toBe(2);
    expect(first.counts.draft_tier_raion).toBe(32);
    expect(first.counts.draft_tier_municipal).toBe(1800);
    expect(first.counts.schema_national).toBe(2);
    expect(first.counts.schema_regional).toBe(34);
    expect(first.counts.schema_municipal).toBe(1800);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.current_direct_executives).toBe(895);
    expect(first.counts.historical_direct_executives).toBe(7);
    expect(first.counts.current_local_mayors).toBe(893);
    expect(first.counts.current_local_councils).toBe(893);
    expect(first.counts.current_raion_councils).toBe(32);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.transnistria_parallel_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(24);
    expect(first.counts.named_open_holds).toBe(24);
    expect(first.counts.closed_gaps).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(1836);
    expect(first.counts.geographies).toBe(934);
    expect(first.counts.research_dates).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1836);
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
      expect(db.prepare("SELECT next_date_id, next_date_resolution FROM office WHERE office_id = ?").get(GAGAUZIA_ASSEMBLY_ID)).toMatchObject({
        next_date_id: null,
        next_date_resolution: "unknown",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(LEOVA_HISTORICAL_COUNCIL_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(CALINESTI_HISTORICAL_MAYOR_ID)).toMatchObject({
        office_status: "historical",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(24);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("moldova", sqlitePath);
    expect(calendar.count).toBe(34);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("MD-BC-G01");
    expect(calendar.label).toContain("not projected");

    const second = importMoldova({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "moldova-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(1822);
    expect(second.counts.historical_offices).toBe(14);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });
});
