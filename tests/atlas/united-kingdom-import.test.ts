import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsGermany, scopeImportsUK } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COMMONS_ID,
  EP_ID,
  HOLD_IDS,
  LINEAGE_ID,
  LONDON_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/united-kingdom/identity";
import { importUnitedKingdom } from "../../lib/atlas/united-kingdom/import";
import { UnitedKingdomPreflightError, scanUnitedKingdomInventory } from "../../lib/atlas/united-kingdom/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("United Kingdom Atlas importer", () => {
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

  it("keeps the United Kingdom out of the all scope", () => {
    expect(scopeImportsUK("united_kingdom")).toBe(true);
    expect(scopeImportsUK("all")).toBe(false);
    expect(scopeImportsUK("latvia")).toBe(false);
    expect(scopeImportsUK("lithuania")).toBe(false);
    expect(scopeImportsUK("hungary")).toBe(false);
    expect(scopeImportsUK("romania")).toBe(false);
    expect(scopeImportsUK("greece")).toBe(false);
    expect(scopeImportsUK("luxembourg")).toBe(false);
    expect(scopeImportsUK("malta")).toBe(false);
    expect(scopeImportsUK("cyprus")).toBe(false);
    expect(scopeImportsUK("france")).toBe(false);
    expect(scopeImportsUK("germany")).toBe(false);
    expect(scopeImportsGermany("united_kingdom")).toBe(false);
    expect(scopeImportsGermany("all")).toBe(false);
  });

  it("scans the Prompt AU slim pack and pins the supplied tier bytes", () => {
    const inventory = scanUnitedKingdomInventory({ root: repoRoot });
    expect(inventory.tiers.offices).toHaveLength(510);
    expect(inventory.offices).toHaveLength(510);
    expect(inventory.gaps).toHaveLength(27);
    expect(inventory.tiers.Justin_accepted).toBe(false);
    expect(inventory.tiers.review_status).toBe("needs_review");
    expect(inventory.tiers.draft_for_human_review).toBe(true);
    expect(inventory.tiers.offices.every((row) => row.review_status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.byPath.has("docs/phase1/united-kingdom/data/results.jsonl.gz")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/united-kingdom/data/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/united-kingdom/results.jsonl")).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(26);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanUnitedKingdomInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(UnitedKingdomPreflightError);
  });

  it("imports 482 current, 2 shadow, and 26 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-united-kingdom-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importUnitedKingdom({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "united-kingdom-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(510);
    expect(first.counts.current_offices).toBe(482);
    expect(first.counts.current_shadow_offices).toBe(2);
    expect(first.counts.historical_offices).toBe(26);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_1).toBe(2);
    expect(first.counts.draft_tier_2).toBe(5);
    expect(first.counts.draft_tier_3).toBe(76);
    expect(first.counts.draft_tier_4).toBe(427);
    expect(first.counts.schema_national).toBe(2);
    expect(first.counts.schema_regional).toBe(81);
    expect(first.counts.schema_municipal).toBe(427);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(64);
    expect(first.counts.direct_mayors).toBe(27);
    expect(first.counts.standalone_pcc).toBe(37);
    expect(first.counts.principal_councils).toBe(382);
    expect(first.counts.parish_town_councils).toBe(27);
    expect(first.counts.historical_direct_executives).toBe(7);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(27);
    expect(first.counts.named_holds).toBe(27);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(510);
    expect(first.counts.geographies).toBe(496);
    expect(first.counts.research_dates).toBe(1);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(510);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(COMMONS_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(EP_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_european_parliament_delegation",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(LONDON_MAYOR_ID)).toMatchObject({
        office_type: "direct_london_mayor",
      });
      expect(db.prepare("SELECT state_note FROM office WHERE office_id = 'GB.SHADOW.east-surrey'").get()).toMatchObject({
        state_note: "current_shadow",
      });
      expect(db.prepare("SELECT label FROM research_date").get()).toMatchObject({ label: "2029-05-03" });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(27);
      expect(holds.every((row) => row.status === "open" && Number(row.closed) === 0)).toBe(true);
      expect(holds.map((row) => String(row.original_token))).toEqual([...HOLD_IDS]);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%LORDS%' OR name LIKE '%Prime Minister%'").get()?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current' AND office_type LIKE '%european_parliament%'")
            .get()?.n,
        ),
      ).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("united-kingdom", sqlitePath);
    expect(calendar.count).toBe(81);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("G01");
    expect(calendar.label).toContain("not invented");

    const second = importUnitedKingdom({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "united-kingdom-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(482);
  }, 120_000);
});
