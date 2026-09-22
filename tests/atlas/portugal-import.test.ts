import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  AGUEDA_PCM_ID,
  ALPHANUMERIC_AF_ID,
  ALPHANUMERIC_GEOGRAPHY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PARISH_AF_ID,
  PLENARY_AF_ID,
  TIER_SHA256,
} from "../../lib/atlas/portugal/identity";
import { importPortugal } from "../../lib/atlas/portugal/import";
import { scanPortugalInventory } from "../../lib/atlas/portugal/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Portugal Atlas importer", () => {
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

  it("scans the accepted Prompt AD research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanPortugalInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(18834);
    expect(inventory.events).toHaveLength(19820);
    expect(inventory.results).toHaveLength(66283);
    expect(inventory.geographies).toHaveLength(6328);
    expect(inventory.proceedings).toHaveLength(2);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(TIER_SHA256).not.toBe("5155830f9141ebe7607d51e888e804f63fe2305426d20998ff6e16917da5d651");
    expect(inventory.researchGaps.map((row) => row.original_token)).toEqual([...NAMED_HOLDS]);
    expect(inventory.researchGaps.every((row) => row.status === "open")).toBe(true);
  });

  it(
    "imports 10666 current + 8168 historical offices and reuses the same release",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-portugal-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const first = importPortugal({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "portugal-test",
      });
      expect(first.reusedRelease).toBe(false);
      expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
      expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
      expect(first.counts.current_offices).toBe(10666);
      expect(first.counts.historical_offices).toBe(8168);
      expect(first.counts.offices).toBe(18834);
      expect(first.counts.municipal_offices).toBe(927);
      expect(first.counts.regional_offices).toBe(2);
      expect(first.counts.national_offices).toBe(2);
      expect(first.counts.other_offices).toBe(17903);
      expect(first.counts.total_events).toBe(19820);
      expect(first.counts.prospective_events).toBe(0);
      expect(first.counts.result_rows).toBe(66283);
      expect(first.counts.proceedings).toBe(2);
      expect(first.counts.list_head_events).toBe(0);
      expect(first.counts.list_head_results).toBe(0);
      expect(first.counts.current_plenary_af_offices).toBe(0);
      expect(first.counts.unresolved_research_gaps).toBe(17);
      expect(first.counts.needs_review_classifications).toBe(18214);

      const db = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PARISH_AF_ID)).toMatchObject({
          tier: "other",
          review_status: "needs_review",
        });
        expect(db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(ALPHANUMERIC_AF_ID)).toMatchObject({
          geography_id: ALPHANUMERIC_GEOGRAPHY_ID,
        });
        expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(PLENARY_AF_ID)).toMatchObject({
          office_status: "historical",
        });
        expect(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id = ?").get(AGUEDA_PCM_ID)).toMatchObject({
          n: 0,
        });
        expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
          tier: "other",
          review_status: "needs_review",
        });
        expect(
          db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ?").get(LINEAGE_ID),
        ).toMatchObject({ n: 347 });
        for (const hold of NAMED_HOLDS) {
          expect(
            db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE original_token = ?").get(hold),
          ).toMatchObject({ n: 1 });
        }
      } finally {
        db.close();
      }

      const calendar = listAtlasRegionalCalendar("portugal", sqlitePath);
      expect(calendar.count).toBe(2);
      expect(calendar.label).toMatch(/Açores/);
      expect(calendar.label).toMatch(/PARISH-TIER/);

      const second = importPortugal({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "portugal-test",
      });
      expect(second.reusedRelease).toBe(true);
      expect(second.releaseId).toBe(first.releaseId);
    },
    300_000,
  );
});
