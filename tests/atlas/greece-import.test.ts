import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsGreece } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  LINEAGE_ID,
  LOCAL_SOURCE_HOLD_AUTHORITIES,
  MESSINI_COUNCIL_ID,
  MESSINI_HISTORY_KEY,
  MESSINI_MAYOR_ID,
  NAMED_HOLDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/greece/identity";
import { importGreece } from "../../lib/atlas/greece/import";
import { GreecePreflightError, scanGreeceInventory } from "../../lib/atlas/greece/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Greece Atlas importer", () => {
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

  it("keeps Greece out of the all scope", () => {
    expect(scopeImportsGreece("greece")).toBe(true);
    expect(scopeImportsGreece("all")).toBe(false);
    expect(scopeImportsGreece("latvia")).toBe(false);
    expect(scopeImportsGreece("lithuania")).toBe(false);
    expect(scopeImportsGreece("hungary")).toBe(false);
    expect(scopeImportsGreece("romania")).toBe(false);
  });

  it("scans the Prompt AM slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanGreeceInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(703);
    expect(inventory.events).toHaveLength(2774);
    expect(inventory.proceedings).toHaveLength(3555);
    expect(inventory.results).toHaveLength(14004);
    expect(inventory.observations).toHaveLength(8021);
    expect(inventory.geographies).toHaveLength(351);
    expect(inventory.gaps.map((gap) => gap.gap_id)).toEqual(NAMED_HOLDS.map((hold) => hold.token));
    expect(inventory.gaps.find((gap) => gap.gap_id === "GR-G04")?.status).toBe("partially_resolved");
    expect(inventory.gaps.find((gap) => gap.gap_id === "GR-G09")?.status).toBe("review_required");
    expect(inventory.sourceHolds.map((hold) => hold.authority).sort()).toEqual([...LOCAL_SOURCE_HOLD_AUTHORITIES].sort());
    expect(inventory.byPath.has("data/research/greece/sources")).toBe(false);
    expect(inventory.byPath.has("data/research/greece/results.jsonl.gz")).toBe(true);
    expect(inventory.byPath.has("data/research/greece/ballot-observations.jsonl.gz")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.tiers.classifications.every((row) => row.review_status === "needs_review")).toBe(true);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(19);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanGreeceInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(GreecePreflightError);
  });

  it("imports 693 current and 10 historical offices, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-greece-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importGreece({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "greece-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(703);
    expect(first.counts.current_offices).toBe(693);
    expect(first.counts.historical_offices).toBe(10);
    expect(first.counts.total_events).toBe(2774);
    expect(first.counts.selected_histories).toBe(2774);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.proceedings).toBe(3555);
    expect(first.counts.result_rows).toBe(14004);
    expect(first.counts.distinct_observations).toBe(8021);
    expect(first.counts.municipal_offices).toBe(674);
    expect(first.counts.regional_offices).toBe(26);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.current_direct_executive_offices).toBe(345);
    expect(first.counts.historical_direct_executive_offices).toBe(5);
    expect(first.counts.current_municipal_councils).toBe(332);
    expect(first.counts.current_mayors).toBe(332);
    expect(first.counts.current_regional_councils).toBe(13);
    expect(first.counts.current_governors).toBe(13);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(24);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(703);
    expect(first.counts.geographies).toBe(351);
    expect(first.counts.successor_edges).toBe(0);
    expect(first.counts.identity_crosswalks).toBe(703);
    expect(first.counts.ep_1981_result_rows).toBe(0);
    expect(first.counts.messini_runoff_tie_rows).toBe(2);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(703);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(2774);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(3555);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(14004);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(10);
      expect(db.prepare("SELECT office_type, next_date_id FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_type: "president",
        next_date_id: null,
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(PARLIAMENT_ID)).toMatchObject({
        office_type: "parliament",
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ? AND supersedes_id IS NOT NULL").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE office_id = ? AND history_key = ? AND votes = 9236 AND elected_flag IS NULL").get(MESSINI_MAYOR_ID, MESSINI_HISTORY_KEY)?.n,
        ),
      ).toBe(2);
      expect(
        Number(db.prepare("SELECT COALESCE(SUM(seats), 0) AS n FROM result_row WHERE office_id = ? AND history_key = ?").get(MESSINI_COUNCIL_ID, MESSINI_HISTORY_KEY)?.n),
      ).toBe(17);
      const holds = db
        .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ? AND original_token LIKE 'GR-G%' ORDER BY original_token")
        .all(LINEAGE_ID)
        .map((row) => String(row.original_token));
      expect(holds).toEqual(["GR-G01", "GR-G02", "GR-G03", "GR-G04", "GR-G05", "GR-G06", "GR-G07", "GR-G08", "GR-G09", "GR-G10"]);
      expect(db.prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE original_token = 'GR-G04'").get()).toMatchObject({
        status: "partially_resolved",
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(24);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("greece", sqlitePath);
    expect(calendar.count).toBe(26);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("GR-G01");

    const second = importGreece({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "greece-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);
});
