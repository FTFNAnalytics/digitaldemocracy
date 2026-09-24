import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsBosnia, scopeImportsIceland } from "../../lib/atlas/continuity/import";
import {
  BRCKO_ASSEMBLY_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  GAP_STATUS,
  IDENTITY_VECTOR_GIT_BLOB,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  RS_PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/bosnia-and-herzegovina/identity";
import { importBosnia } from "../../lib/atlas/bosnia-and-herzegovina/import";
import { BosniaPreflightError, scanBosniaInventory } from "../../lib/atlas/bosnia-and-herzegovina/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Bosnia and Herzegovina Atlas importer", () => {
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

  it("keeps Bosnia out of the all scope", () => {
    expect(scopeImportsBosnia("bosnia")).toBe(true);
    expect(scopeImportsBosnia("all")).toBe(false);
    expect(scopeImportsBosnia("iceland")).toBe(false);
    expect(scopeImportsBosnia("italy")).toBe(false);
    expect(scopeImportsBosnia("latvia")).toBe(false);
    expect(scopeImportsBosnia("lithuania")).toBe(false);
    expect(scopeImportsBosnia("hungary")).toBe(false);
    expect(scopeImportsBosnia("romania")).toBe(false);
    expect(scopeImportsBosnia("greece")).toBe(false);
    expect(scopeImportsBosnia("luxembourg")).toBe(false);
    expect(scopeImportsBosnia("malta")).toBe(false);
    expect(scopeImportsBosnia("cyprus")).toBe(false);
    expect(scopeImportsBosnia("france")).toBe(false);
    expect(scopeImportsBosnia("germany")).toBe(false);
    expect(scopeImportsBosnia("united_kingdom")).toBe(false);
    expect(scopeImportsIceland("bosnia")).toBe(false);
    expect(scopeImportsIceland("all")).toBe(false);
  });

  it("scans the Prompt AW slim pack and pins the supplied tier bytes", () => {
    const inventory = scanBosniaInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(346);
    expect(inventory.offices).toHaveLength(346);
    expect(inventory.geographies).toHaveLength(160);
    expect(inventory.transitions).toHaveLength(20);
    expect(inventory.transitions.every((row) => row.successor_edge_asserted === false)).toBe(true);
    expect(inventory.gaps).toHaveLength(9);
    expect(inventory.tiers.every((row) => row.review_status === "draft_for_human_review" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.byPath.has("docs/phase1/bosnia-and-herzegovina/data/results.jsonl")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/bosnia-and-herzegovina/data/events.jsonl")).toBe(false);
    expect(inventory.byPath.has("docs/phase1/bosnia-and-herzegovina/sources")).toBe(false);
    expect(inventory.byPath.has("data/countries/bosnia-and-herzegovina")).toBe(false);
    expect(inventory.promptO.identity_vector_git_blob_sha).toBe(IDENTITY_VECTOR_GIT_BLOB);
    expect(inventory.promptO.prior_detailed_result_rows).toBe(749);
    expect(inventory.promptO.retranscription_policy).toContain("not a new import");
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(37);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanBosniaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(BosniaPreflightError);
  });

  it("imports 306 current and 40 historical offices with 0 events and 0 result rows, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bosnia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBosnia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bosnia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(346);
    expect(first.counts.current_offices).toBe(306);
    expect(first.counts.historical_offices).toBe(40);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(4);
    expect(first.counts.draft_tier_regional).toBe(15);
    expect(first.counts.draft_tier_municipal).toBe(327);
    expect(first.counts.schema_national).toBe(4);
    expect(first.counts.schema_regional).toBe(15);
    expect(first.counts.schema_municipal).toBe(327);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.direct_executive_offices).toBe(148);
    expect(first.counts.current_councils_chambers_assemblies).toBe(158);
    expect(first.counts.current_state).toBe(4);
    expect(first.counts.current_entity).toBe(5);
    expect(first.counts.current_canton).toBe(10);
    expect(first.counts.current_municipal_local).toBe(287);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(9);
    expect(first.counts.named_open_holds).toBe(9);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(346);
    expect(first.counts.geographies).toBe(160);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.brcko_mayor_offices).toBe(0);
    expect(first.counts.brcko_assembly_offices).toBe(1);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(346);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(306);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(40);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get("BA-NAT-HOR")).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(RS_PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "entity_direct_executive",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(BRCKO_ASSEMBLY_ID)).toMatchObject({
        office_type: "district_assembly",
      });
      expect(db.prepare("SELECT next_date_id, next_date_resolution FROM office WHERE office_id = ?").get(RS_PRESIDENT_ID)).toMatchObject({
        next_date_id: null,
        next_date_resolution: "unknown",
      });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = 'BA-G'").get()).toBeUndefined();
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(9);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
      const vectors = db
        .prepare("SELECT sha256, byte_count FROM retained_input WHERE input_path = 'docs/phase1/bosnia-and-herzegovina/Bosnia_Identity_Vectors.json'")
        .get() as { sha256: string; byte_count: number };
      expect(vectors.byte_count).toBe(1159136);
      expect(vectors.sha256).toHaveLength(64);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("bosnia-and-herzegovina", sqlitePath);
    expect(calendar.count).toBe(15);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("BA-AW-G01");
    expect(calendar.label).toContain("not invented");

    const second = importBosnia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bosnia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(306);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
  });

  it("refuses fixture injection", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bosnia-fixtures-"));
    tempDirs.push(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() =>
      importBosnia({
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "bosnia-test",
      }),
    ).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
  });
});
