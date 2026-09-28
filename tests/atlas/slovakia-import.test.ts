import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsSlovakia, scopeImportsBosnia } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  LINEAGE_ID,
  NRSR_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/slovakia/identity";
import { importSlovakia } from "../../lib/atlas/slovakia/import";
import { SlovakiaPreflightError, scanSlovakiaInventory } from "../../lib/atlas/slovakia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Slovakia Atlas importer", () => {
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

  it("keeps Slovakia out of the all scope", () => {
    expect(scopeImportsSlovakia("slovakia")).toBe(true);
    expect(scopeImportsSlovakia("all")).toBe(false);
    expect(scopeImportsSlovakia("serbia")).toBe(false);
    expect(scopeImportsSlovakia("montenegro")).toBe(false);
    expect(scopeImportsSlovakia("bosnia")).toBe(false);
    expect(scopeImportsBosnia("slovakia")).toBe(false);
    expect(scopeImportsBosnia("all")).toBe(false);
  });

  it("scans the Prompt AI pack and pins the supplied tier bytes", () => {
    const inventory = scanSlovakiaInventory({ root: repoRoot });
    expect(inventory.tiers.classifications).toHaveLength(5871);
    expect(inventory.offices).toHaveLength(5871);
    expect(inventory.offices.every((office) => office.row.tier === office.cls.expectedDraftTier)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(25);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanSlovakiaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(SlovakiaPreflightError);
  });

  it("imports 5871 current and 0 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-slovakia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSlovakia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "slovakia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(5871);
    expect(first.counts.current_offices).toBe(5871);
    expect(first.counts.historical_offices).toBe(0);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_municipal).toBe(5774);
    expect(first.counts.draft_tier_regional).toBe(16);
    expect(first.counts.draft_tier_national).toBe(2);
    expect(first.counts.draft_tier_other).toBe(79);
    expect(first.counts.schema_national).toBe(2);
    expect(first.counts.schema_regional).toBe(16);
    expect(first.counts.schema_municipal).toBe(5774);
    expect(first.counts.schema_other).toBe(79);
    expect(first.counts.direct_executive_offices).toBe(2935);
    expect(first.counts.councils_assemblies_chambers_delegation).toBe(2936);
    expect(first.counts.municipal_councils).toBe(2887);
    expect(first.counts.municipal_mayors).toBe(2887);
    expect(first.counts.city_part_councils).toBe(39);
    expect(first.counts.city_part_mayors).toBe(39);
    expect(first.counts.vuc_assemblies).toBe(8);
    expect(first.counts.vuc_chairs).toBe(8);
    expect(first.counts.ep_offices).toBe(1);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(10);
    expect(first.counts.named_open_holds).toBe(10);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(5871);
    expect(first.counts.geographies).toBe(2935);
    expect(first.counts.research_dates).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(5871);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(NRSR_ID)).toMatchObject({
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

    const calendar = listAtlasRegionalCalendar("slovakia", sqlitePath);
    expect(calendar.count).toBe(16);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("SK-HISTORICAL-UNIVERSE");
    expect(calendar.label).toContain("sources stay 0");

    const second = importSlovakia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "slovakia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(5871);
    expect(second.counts.historical_offices).toBe(0);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });
});
