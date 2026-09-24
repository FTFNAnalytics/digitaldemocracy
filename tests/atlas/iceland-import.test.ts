import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsIceland, scopeImportsItaly } from "../../lib/atlas/continuity/import";
import {
  ALTHINGI_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  GAP_STATUS,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/iceland/identity";
import { importIceland } from "../../lib/atlas/iceland/import";
import { IcelandPreflightError, scanIcelandInventory } from "../../lib/atlas/iceland/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Iceland Atlas importer", () => {
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

  it("keeps Iceland out of the all scope", () => {
    expect(scopeImportsIceland("iceland")).toBe(true);
    expect(scopeImportsIceland("all")).toBe(false);
    expect(scopeImportsIceland("italy")).toBe(false);
    expect(scopeImportsIceland("latvia")).toBe(false);
    expect(scopeImportsIceland("lithuania")).toBe(false);
    expect(scopeImportsIceland("hungary")).toBe(false);
    expect(scopeImportsIceland("romania")).toBe(false);
    expect(scopeImportsIceland("greece")).toBe(false);
    expect(scopeImportsIceland("luxembourg")).toBe(false);
    expect(scopeImportsIceland("malta")).toBe(false);
    expect(scopeImportsIceland("cyprus")).toBe(false);
    expect(scopeImportsIceland("france")).toBe(false);
    expect(scopeImportsIceland("germany")).toBe(false);
    expect(scopeImportsIceland("united_kingdom")).toBe(false);
    expect(scopeImportsItaly("iceland")).toBe(false);
    expect(scopeImportsItaly("all")).toBe(false);
  });

  it("scans the Prompt AV slim pack and pins the supplied tier bytes", () => {
    const inventory = scanIcelandInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(87);
    expect(inventory.offices).toHaveLength(87);
    expect(inventory.geographies).toHaveLength(86);
    expect(inventory.crosswalks).toHaveLength(24);
    expect(inventory.gaps).toHaveLength(6);
    expect(inventory.tiers.every((row) => row.review_status === "draft_for_human_review" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.byPath.has("docs/phase1/iceland/data/results.json")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/iceland/data/events.json")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/iceland/sources")).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(27);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanIcelandInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(IcelandPreflightError);
  });

  it("imports 63 current and 24 historical offices with 0 events and 0 result rows, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-iceland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importIceland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "iceland-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(87);
    expect(first.counts.current_offices).toBe(63);
    expect(first.counts.historical_offices).toBe(24);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(2);
    expect(first.counts.draft_tier_municipal).toBe(85);
    expect(first.counts.schema_national).toBe(2);
    expect(first.counts.schema_regional).toBe(0);
    expect(first.counts.schema_municipal).toBe(85);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(1);
    expect(first.counts.direct_municipal_executive_offices).toBe(0);
    expect(first.counts.current_municipal_councils).toBe(61);
    expect(first.counts.historical_municipal_councils).toBe(24);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(24);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(6);
    expect(first.counts.named_open_holds).toBe(2);
    expect(first.counts.closed_gaps).toBe(4);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(87);
    expect(first.counts.geographies).toBe(86);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.election_mode_restricted_proportional_list).toBe(50);
    expect(first.counts.election_mode_unrestricted).toBe(7);
    expect(first.counts.election_mode_unopposed_no_poll).toBe(4);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(87);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(24);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(ALTHINGI_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "direct_executive",
      });
      expect(db.prepare("SELECT next_date_id, next_date_resolution FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        next_date_id: null,
        next_date_resolution: "unknown",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(6);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(holds.filter((row) => Number(row.closed) === 0).map((row) => row.original_token).sort()).toEqual(["IS-G01", "IS-G06"]);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_type = 'direct_executive'").get()?.n)).toBe(1);
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("iceland", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("IS-G01");
    expect(calendar.label).toContain("not invented");

    const second = importIceland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "iceland-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(63);
    expect(second.counts.explicit_predecessor_edges).toBe(24);
  });
});
