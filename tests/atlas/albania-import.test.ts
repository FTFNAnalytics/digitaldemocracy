import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsAlbania, scopeImportsBosnia } from "../../lib/atlas/continuity/import";
import {
  ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DIMAL_MAYOR_ID,
  GAP_STATUS,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PHASE1_APPROVED_TIER_SHA256,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/albania/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { AlbaniaPreflightError, scanAlbaniaInventory } from "../../lib/atlas/albania/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Albania Atlas importer", () => {
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

  it("keeps Albania out of the all scope", () => {
    expect(scopeImportsAlbania("albania")).toBe(true);
    expect(scopeImportsAlbania("all")).toBe(false);
    expect(scopeImportsAlbania("bosnia")).toBe(false);
    expect(scopeImportsAlbania("iceland")).toBe(false);
    expect(scopeImportsBosnia("albania")).toBe(false);
    expect(scopeImportsBosnia("all")).toBe(false);
  });

  it("scans the Prompt BA slim pack and pins the supplied tier bytes", () => {
    const inventory = scanAlbaniaInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(891);
    expect(inventory.offices).toHaveLength(891);
    expect(inventory.geographies).toHaveLength(891);
    expect(inventory.gaps).toHaveLength(21);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.phase1OfficeIds).toHaveLength(122);
    expect(inventory.tiers.every((row) => row.review_status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.byPath.has("docs/phase1/albania/data/results.jsonl")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/albania/data/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/albania/sources")).toBe(false);
    expect(inventory.byPath.has("data/countries/albania")).toBe(false);
    expect(inventory.byPath.get("docs/phase1/albania/Phase1_approved_tiers.json")?.sha256).toBe(PHASE1_APPROVED_TIER_SHA256);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(40);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanAlbaniaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(AlbaniaPreflightError);
  });

  it("imports 123 current and 768 historical offices with 0 events and 0 result rows, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(891);
    expect(first.counts.current_offices).toBe(123);
    expect(first.counts.historical_offices).toBe(768);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(1);
    expect(first.counts.draft_tier_municipal).toBe(868);
    expect(first.counts.draft_tier_other).toBe(22);
    expect(first.counts.schema_national).toBe(1);
    expect(first.counts.schema_regional).toBe(0);
    expect(first.counts.schema_municipal).toBe(868);
    expect(first.counts.schema_other).toBe(22);
    expect(first.counts.current_direct_executives).toBe(61);
    expect(first.counts.historical_direct_executives).toBe(384);
    expect(first.counts.current_mayors).toBe(61);
    expect(first.counts.current_councils).toBe(61);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.popular_presidential_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(21);
    expect(first.counts.named_open_holds).toBe(21);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(891);
    expect(first.counts.geographies).toBe(891);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.phase1_ids_still_current).toBe(122);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(123);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(768);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(ASSEMBLY_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT geography_id, office_status FROM office WHERE office_id = 'AL-13-M'").get()).toMatchObject({
        geography_id: "geo-99a7b8d0e325a448c5e7c7ca",
        office_status: "current",
      });
      expect(db.prepare("SELECT name, office_status FROM office WHERE office_id = ?").get(DIMAL_MAYOR_ID)).toMatchObject({
        office_status: "current",
      });
      expect(String((db.prepare("SELECT name FROM office WHERE office_id = ?").get(DIMAL_MAYOR_ID) as { name: string }).name)).toContain("Dimal");
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(21);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
      const phase1 = db
        .prepare("SELECT sha256 FROM retained_input WHERE input_path = 'docs/phase1/albania/Phase1_approved_tiers.json'")
        .get() as { sha256: string };
      expect(phase1.sha256).toBe(PHASE1_APPROVED_TIER_SHA256);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("albania", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("AL-BA-G01");
    expect(calendar.label).toContain("not invented");

    const second = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(123);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });

  it("refuses fixture injection", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-fixtures-"));
    tempDirs.push(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() =>
      importAlbania({
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "albania-test",
      }),
    ).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
  });
});
