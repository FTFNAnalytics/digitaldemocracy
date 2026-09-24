import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsItaly, scopeImportsUK } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CAMERA_ID,
  EP_ID,
  FVG_UDINE_COUNCIL_ID,
  HOLD_IDS,
  LINEAGE_ID,
  PENDING_STATE_NOTE,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/italy/identity";
import { importItaly } from "../../lib/atlas/italy/import";
import { ItalyPreflightError, scanItalyInventory } from "../../lib/atlas/italy/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Italy Atlas importer", () => {
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

  it("keeps Italy out of the all scope", () => {
    expect(scopeImportsItaly("italy")).toBe(true);
    expect(scopeImportsItaly("all")).toBe(false);
    expect(scopeImportsItaly("latvia")).toBe(false);
    expect(scopeImportsItaly("lithuania")).toBe(false);
    expect(scopeImportsItaly("hungary")).toBe(false);
    expect(scopeImportsItaly("romania")).toBe(false);
    expect(scopeImportsItaly("greece")).toBe(false);
    expect(scopeImportsItaly("luxembourg")).toBe(false);
    expect(scopeImportsItaly("malta")).toBe(false);
    expect(scopeImportsItaly("cyprus")).toBe(false);
    expect(scopeImportsItaly("france")).toBe(false);
    expect(scopeImportsItaly("germany")).toBe(false);
    expect(scopeImportsItaly("united_kingdom")).toBe(false);
    expect(scopeImportsUK("italy")).toBe(false);
    expect(scopeImportsUK("all")).toBe(false);
  });

  it("scans the Prompt AT slim pack and pins the supplied tier bytes", () => {
    const inventory = scanItalyInventory({ root: repoRoot });
    expect(inventory.tiers.offices).toHaveLength(16621);
    expect(inventory.offices).toHaveLength(16621);
    expect(inventory.gaps).toHaveLength(19);
    expect(inventory.tiers.Justin_accepted).toBe(false);
    expect(inventory.tiers.review_status).toBe("needs_review");
    expect(inventory.tiers.draft_for_human_review).toBe(true);
    expect(inventory.tiers.offices.every((row) => row.review_status === "unapproved_draft" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.byPath.has("docs/phase1/italy/data/results.jsonl.gz")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/italy/data/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/italy/results.jsonl")).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(34);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanItalyInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(ItalyPreflightError);
  });

  it("imports 15917 current, 696 historical, and 8 pending FVG offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-italy-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importItaly({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "italy-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(16621);
    expect(first.counts.current_offices).toBe(15917);
    expect(first.counts.historical_offices).toBe(696);
    expect(first.counts.pending_fvg_offices).toBe(8);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_1).toBe(4);
    expect(first.counts.draft_tier_2).toBe(38);
    expect(first.counts.draft_tier_3).toBe(11);
    expect(first.counts.draft_tier_4).toBe(16568);
    expect(first.counts.schema_national).toBe(4);
    expect(first.counts.schema_regional).toBe(49);
    expect(first.counts.schema_municipal).toBe(16568);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(7992);
    expect(first.counts.current_collective_bodies).toBe(7924);
    expect(first.counts.current_municipal_councils).toBe(7894);
    expect(first.counts.deputy_mayors).toBe(74);
    expect(first.counts.direct_regional_presidents).toBe(18);
    expect(first.counts.ordinary_provincial_popular_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(19);
    expect(first.counts.named_holds).toBe(19);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(16621);
    expect(first.counts.geographies).toBe(8273);
    expect(first.counts.research_dates).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(16621);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(CAMERA_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(EP_ID)).toMatchObject({
        office_status: "current",
        office_type: "european_parliament_delegation",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_type: "indirect_head_of_state",
      });
      expect(db.prepare("SELECT state_note, next_date_id FROM office WHERE office_id = ?").get(FVG_UDINE_COUNCIL_ID)).toMatchObject({
        state_note: PENDING_STATE_NOTE,
        next_date_id: null,
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(19);
      expect(holds.every((row) => row.status === "open" && Number(row.closed) === 0)).toBe(true);
      expect(holds.map((row) => String(row.original_token))).toEqual([...HOLD_IDS]);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%CIRCOSCRIZ%' OR name LIKE '%Presidente del Consiglio%'").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id IN ('IT.REGIONE.02.president', 'IT.REGIONE.04.president', 'IT.PROVINCE.021.president')").get()?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("italy", sqlitePath);
    expect(calendar.count).toBe(49);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("IT-G01");
    expect(calendar.label).toContain("not invented");

    const second = importItaly({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "italy-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(15917);
    expect(second.counts.pending_fvg_offices).toBe(8);
  }, 300_000);
});
