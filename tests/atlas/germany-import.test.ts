import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsFrance, scopeImportsGermany } from "../../lib/atlas/continuity/import";
import {
  BUNDESPRAESIDENT_ID,
  BUNDESTAG_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/germany/identity";
import { importGermany } from "../../lib/atlas/germany/import";
import { GermanyPreflightError, scanGermanyInventory } from "../../lib/atlas/germany/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Germany Atlas importer", () => {
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

  it("keeps Germany out of the all scope", () => {
    expect(scopeImportsGermany("germany")).toBe(true);
    expect(scopeImportsGermany("all")).toBe(false);
    expect(scopeImportsGermany("latvia")).toBe(false);
    expect(scopeImportsGermany("lithuania")).toBe(false);
    expect(scopeImportsGermany("hungary")).toBe(false);
    expect(scopeImportsGermany("romania")).toBe(false);
    expect(scopeImportsGermany("greece")).toBe(false);
    expect(scopeImportsGermany("luxembourg")).toBe(false);
    expect(scopeImportsGermany("malta")).toBe(false);
    expect(scopeImportsGermany("cyprus")).toBe(false);
    expect(scopeImportsGermany("france")).toBe(false);
    expect(scopeImportsFrance("germany")).toBe(false);
    expect(scopeImportsFrance("all")).toBe(false);
  });

  it("scans the Prompt AS slim pack and pins the supplied tier bytes", () => {
    const inventory = scanGermanyInventory({ root: repoRoot });
    expect(inventory.tiers.offices).toHaveLength(22630);
    expect(inventory.tiers.Justin_accepted).toBe(false);
    expect(inventory.tiers.review_status).toBe("needs_review");
    expect(inventory.tiers.draft_for_human_review).toBe(true);
    expect(inventory.tiers.offices.every((row) => row.review_status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.byPath.has("data/research/germany/results.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/germany/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("data/research/germany/office-register.jsonl")).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(17);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanGermanyInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(GermanyPreflightError);
  });

  it("imports 21960 current and 670 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-germany-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importGermany({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "germany-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(22630);
    expect(first.counts.current_offices).toBe(21960);
    expect(first.counts.historical_offices).toBe(670);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_1).toBe(3);
    expect(first.counts.draft_tier_2).toBe(20);
    expect(first.counts.draft_tier_3).toBe(552);
    expect(first.counts.draft_tier_4).toBe(22055);
    expect(first.counts.schema_national).toBe(3);
    expect(first.counts.schema_regional).toBe(572);
    expect(first.counts.schema_municipal).toBe(22055);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(9585);
    expect(first.counts.historical_direct_executives).toBe(610);
    expect(first.counts.current_municipal_councils).toBe(10718);
    expect(first.counts.current_municipal_mayors).toBe(9075);
    expect(first.counts.schleswig_holstein_direct_mayors).toBe(86);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(23);
    expect(first.counts.named_holds).toBe(23);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(22630);
    expect(first.counts.geographies).toBe(22628);
    expect(first.counts.research_dates).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(22630);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(BUNDESTAG_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(BUNDESPRAESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(
        db.prepare("SELECT json_extract(raw_json, '$.supplemental.selection_mode') AS mode FROM office WHERE office_id = ?").get(BUNDESPRAESIDENT_ID),
      ).toMatchObject({ mode: "indirect_electoral_college" });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(23);
      expect(holds.every((row) => row.status === "open" && Number(row.closed) === 0)).toBe(true);
      expect(holds.map((row) => String(row.original_token))).toEqual(NAMED_HOLDS.map((hold) => hold.token));
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%BUNDESRAT%'").get()?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("germany", sqlitePath);
    expect(calendar.count).toBe(572);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("DE-G01");
    expect(calendar.label).toContain("not invented");

    const second = importGermany({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "germany-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
  }, 300_000);
});
