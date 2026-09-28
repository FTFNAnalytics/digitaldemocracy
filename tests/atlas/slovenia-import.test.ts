import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsSlovakia, scopeImportsSlovenia } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DZ_ID,
  EP_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/slovenia/identity";
import { importSlovenia } from "../../lib/atlas/slovenia/import";
import { SloveniaPreflightError, scanSloveniaInventory } from "../../lib/atlas/slovenia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Slovenia Atlas importer", () => {
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

  it("keeps Slovenia out of the all scope", () => {
    expect(scopeImportsSlovenia("slovenia")).toBe(true);
    expect(scopeImportsSlovenia("all")).toBe(false);
    expect(scopeImportsSlovenia("slovakia")).toBe(false);
    expect(scopeImportsSlovenia("serbia")).toBe(false);
    expect(scopeImportsSlovenia("montenegro")).toBe(false);
    expect(scopeImportsSlovakia("slovenia")).toBe(false);
    expect(scopeImportsSlovakia("all")).toBe(false);
  });

  it("scans the Prompt AJ pack and pins the supplied tier bytes", () => {
    const inventory = scanSloveniaInventory({ root: repoRoot });
    expect(inventory.tiers.classifications).toHaveLength(428);
    expect(inventory.offices).toHaveLength(428);
    expect(inventory.offices.every((office) => office.row.tier === office.cls.expectedDraftTier)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(23);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanSloveniaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(SloveniaPreflightError);
  });

  it("imports 428 current and 0 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-slovenia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSlovenia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "slovenia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(428);
    expect(first.counts.current_offices).toBe(428);
    expect(first.counts.historical_offices).toBe(0);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_municipal).toBe(424);
    expect(first.counts.draft_tier_regional).toBe(0);
    expect(first.counts.draft_tier_national).toBe(3);
    expect(first.counts.draft_tier_other).toBe(1);
    expect(first.counts.schema_national).toBe(3);
    expect(first.counts.schema_regional).toBe(0);
    expect(first.counts.schema_municipal).toBe(424);
    expect(first.counts.schema_other).toBe(1);
    expect(first.counts.direct_executive_offices).toBe(213);
    expect(first.counts.councils_chambers_delegation).toBe(215);
    expect(first.counts.municipal_councils).toBe(212);
    expect(first.counts.municipal_mayors).toBe(212);
    expect(first.counts.national_assembly_offices).toBe(1);
    expect(first.counts.national_council_offices).toBe(1);
    expect(first.counts.president_offices).toBe(1);
    expect(first.counts.ep_offices).toBe(1);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(10);
    expect(first.counts.named_open_holds).toBe(10);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(428);
    expect(first.counts.geographies).toBe(213);
    expect(first.counts.research_dates).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(428);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(DZ_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "president",
      });
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(10);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe("open");
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("slovenia", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("SI-HISTORICAL-MUNICIPAL-UNIVERSE");
    expect(calendar.label).toContain("sources stay 0");

    const second = importSlovenia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "slovenia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(428);
    expect(second.counts.historical_offices).toBe(0);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });
});
