import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsMalta } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  GOZO_CIVIC_ID,
  HOUSE_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/malta/identity";
import { importMalta } from "../../lib/atlas/malta/import";
import { MaltaPreflightError, scanMaltaInventory } from "../../lib/atlas/malta/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Malta Atlas importer", () => {
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

  it("keeps Malta out of the all scope", () => {
    expect(scopeImportsMalta("malta")).toBe(true);
    expect(scopeImportsMalta("all")).toBe(false);
    expect(scopeImportsMalta("latvia")).toBe(false);
    expect(scopeImportsMalta("lithuania")).toBe(false);
    expect(scopeImportsMalta("hungary")).toBe(false);
    expect(scopeImportsMalta("romania")).toBe(false);
    expect(scopeImportsMalta("greece")).toBe(false);
    expect(scopeImportsMalta("luxembourg")).toBe(false);
  });

  it("scans the Prompt AP slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanMaltaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(215);
    expect(inventory.events).toHaveLength(223);
    expect(inventory.successorCrosswalk).toHaveLength(0);
    expect(inventory.nominations).toHaveLength(4);
    expect(inventory.countsFile.results).toBe(4084);
    expect(inventory.countsFile.stv_count_observations).toBe(64204);
    expect(inventory.countsFile.numeric_first_preference_rows).toBe(4050);
    expect(inventory.countTotals).toHaveLength(7118);
    expect(inventory.countTotals.length).not.toBe(4084);
    expect(inventory.countTotals.length).not.toBe(64204);
    expect(inventory.byPath.has("data/research/malta/results.json")).toBe(false);
    expect(inventory.byPath.has("data/research/malta/stv-counts.json")).toBe(false);
    expect(inventory.byPath.has("data/research/malta/sources")).toBe(false);
    expect(inventory.byPath.has("data/research/malta/counts.json")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.tiers.classifications.every((row) => row.review_status === "needs_review")).toBe(true);
    expect(inventory.tiers.justin_approval?.holds_open).toEqual(NAMED_HOLDS.map((hold) => hold.token));
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(16);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanMaltaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(MaltaPreflightError);
  });

  it("imports 213 current and 2 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-malta-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importMalta({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "malta-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(215);
    expect(first.counts.current_offices).toBe(213);
    expect(first.counts.historical_offices).toBe(2);
    expect(first.counts.total_events).toBe(223);
    expect(first.counts.selected_histories).toBe(223);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBe(4084);
    expect(first.counts.documented_stv_count_observations_omitted).toBe(64204);
    expect(first.counts.documented_numeric_first_preference_rows_omitted).toBe(4050);
    expect(first.counts.count_total_rows).toBe(7118);
    expect(first.counts.municipal_offices).toBe(204);
    expect(first.counts.regional_offices).toBe(8);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.direct_executive_offices).toBe(0);
    expect(first.counts.current_local_councils).toBe(68);
    expect(first.counts.malta_local_councils).toBe(54);
    expect(first.counts.gozo_local_councils).toBe(14);
    expect(first.counts.current_mayors).toBe(68);
    expect(first.counts.current_deputy_mayors).toBe(68);
    expect(first.counts.current_indirect_regional_presidents).toBe(6);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.guessed_merger_edges).toBe(0);
    expect(first.counts.regional_nominations).toBe(4);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(10);
    expect(first.counts.named_holds).toBe(10);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(215);
    expect(first.counts.geographies).toBe(76);
    expect(first.counts.year_only_events).toBe(0);
    expect(first.counts.offices_without_events).toBe(140);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(215);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(223);
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
      ).toBe(2);
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(HOUSE_ID)).toMatchObject({
        office_type: "national_parliament",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(HOUSE_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(GOZO_CIVIC_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM election_event WHERE office_id IN (SELECT office_id FROM office WHERE office_type IN ('mayor','deputy_mayor'))",
            )
            .get()?.n,
        ),
      ).toBe(0);
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM election_event WHERE office_id IN ('MT-RP-eastern-region','MT-RP-port-region','MT-RP-southern-region','MT-RP-western-region')",
            )
            .get()?.n,
        ),
      ).toBe(0);
      const holds = db
        .prepare("SELECT original_token, json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(10);
      expect(holds.every((row) => row.status === "open")).toBe(true);
      expect(db.prepare("SELECT legal_outcome FROM election_event WHERE office_id = ?").all(PRESIDENT_ID).every((row) => row.legal_outcome === "unknown")).toBe(true);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("malta", sqlitePath);
    expect(calendar.count).toBe(8);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("sole nominees");
    expect(calendar.label).toContain("successor crosswalk stays empty");

    const second = importMalta({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "malta-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
  }, 120_000);
});
