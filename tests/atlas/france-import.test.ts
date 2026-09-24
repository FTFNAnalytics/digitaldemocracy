import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsCyprus, scopeImportsFrance } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CHATAIN_ID,
  EP_ID,
  LINEAGE_ID,
  MAYOTTE_ID,
  NAMED_HOLDS,
  PARIS_HISTORICAL_ID,
  PARIS_ID,
  PRESIDENT_ID,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/france/identity";
import { importFrance } from "../../lib/atlas/france/import";
import { FrancePreflightError, scanFranceInventory } from "../../lib/atlas/france/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("France Atlas importer", () => {
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

  it("keeps France out of the all scope", () => {
    expect(scopeImportsFrance("france")).toBe(true);
    expect(scopeImportsFrance("all")).toBe(false);
    expect(scopeImportsFrance("latvia")).toBe(false);
    expect(scopeImportsFrance("lithuania")).toBe(false);
    expect(scopeImportsFrance("hungary")).toBe(false);
    expect(scopeImportsFrance("romania")).toBe(false);
    expect(scopeImportsFrance("greece")).toBe(false);
    expect(scopeImportsFrance("luxembourg")).toBe(false);
    expect(scopeImportsFrance("malta")).toBe(false);
    expect(scopeImportsFrance("cyprus")).toBe(false);
    expect(scopeImportsCyprus("france")).toBe(false);
    expect(scopeImportsCyprus("all")).toBe(false);
  });

  it("scans the Prompt AR slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanFranceInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(37850);
    expect(inventory.successorCrosswalk).toHaveLength(0);
    expect(inventory.countsFile.results).toBe(1193657);
    expect(inventory.countsFile.events).toBe(119554);
    expect(inventory.countsFile.reporting_units).toBe(173409);
    expect(inventory.countsFile.result_kinds.list_ballot).toBe(81091);
    expect(inventory.territorialMovements).toHaveLength(13734);
    expect(inventory.territorialMovements.length).not.toBe(1193657);
    expect(inventory.officeHistory).toHaveLength(37850);
    expect(inventory.byPath.has("data/research/france/results.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/france/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/france/reporting-units.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/france/sources")).toBe(false);
    expect(inventory.byPath.has("data/research/france/counts.json")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.tiers.classifications.every((row) => row.review_status === "needs_review")).toBe(true);
    expect(inventory.tiers.justin_approval?.holds_open).toEqual(NAMED_HOLDS.map((hold) => hold.token));
    expect(inventory.tiers.justin_approval?.holds_resolved).toEqual([]);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(17);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanFranceInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(FrancePreflightError);
  });

  it("imports 35112 current and 2738 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-france-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importFrance({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "france-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(37850);
    expect(first.counts.current_offices).toBe(35112);
    expect(first.counts.historical_offices).toBe(2738);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBe(1193657);
    expect(first.counts.documented_event_rows_omitted).toBe(119554);
    expect(first.counts.documented_reporting_units_omitted).toBe(173409);
    expect(first.counts.municipal_offices).toBe(37705);
    expect(first.counts.regional_offices).toBe(141);
    expect(first.counts.national_offices).toBe(4);
    expect(first.counts.other_offices).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(1);
    expect(first.counts.historical_direct_executives).toBe(0);
    expect(first.counts.current_municipal_councils).toBe(34952);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.guessed_merger_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(21);
    expect(first.counts.named_holds).toBe(21);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(37850);
    expect(first.counts.geographies).toBe(37847);
    expect(first.counts.research_dates).toBe(114);
    expect(first.counts.mayors).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(37850);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(2738);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SENATE_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      const paris = db
        .prepare("SELECT office_id, geography_id, office_status FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
        .all(PARIS_ID, PARIS_HISTORICAL_ID);
      expect(paris).toHaveLength(2);
      expect(new Set(paris.map((row) => String(row.geography_id))).size).toBe(2);
      expect(db.prepare("SELECT office_type, office_status FROM office WHERE office_id = ?").get(MAYOTTE_ID)).toMatchObject({
        office_type: "departmental_council",
        office_status: "current",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(CHATAIN_ID)).toMatchObject({
        office_type: "municipal_council",
      });
      const holds = db
        .prepare("SELECT original_token, json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(21);
      expect(holds.every((row) => row.status === "open_or_explicit_exclusion")).toBe(true);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ? AND precision = 'year'").get(LINEAGE_ID)?.n)).toBe(1);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_type = 'mayor'").get()?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("france", sqlitePath);
    expect(calendar.count).toBe(141);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("successor crosswalk stays empty");
    expect(calendar.label).toContain("not invented");

    const second = importFrance({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "france-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
  }, 300_000);
});
