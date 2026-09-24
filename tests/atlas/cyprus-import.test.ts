import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsCyprus } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  HOUSE_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_ID,
  REL_ARM_ID,
  SPILIA_ANTONIOS_COUNCIL_ID,
  SPILIA_KOURDALI_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/cyprus/identity";
import { importCyprus } from "../../lib/atlas/cyprus/import";
import { CyprusPreflightError, scanCyprusInventory } from "../../lib/atlas/cyprus/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Cyprus Atlas importer", () => {
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

  it("keeps Cyprus out of the all scope", () => {
    expect(scopeImportsCyprus("cyprus")).toBe(true);
    expect(scopeImportsCyprus("all")).toBe(false);
    expect(scopeImportsCyprus("latvia")).toBe(false);
    expect(scopeImportsCyprus("lithuania")).toBe(false);
    expect(scopeImportsCyprus("hungary")).toBe(false);
    expect(scopeImportsCyprus("romania")).toBe(false);
    expect(scopeImportsCyprus("greece")).toBe(false);
    expect(scopeImportsCyprus("luxembourg")).toBe(false);
    expect(scopeImportsCyprus("malta")).toBe(false);
  });

  it("scans the Prompt AQ slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanCyprusInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(888);
    expect(inventory.events).toHaveLength(1599);
    expect(inventory.successorCrosswalk).toHaveLength(0);
    expect(inventory.countsFile.results).toBe(11112);
    expect(inventory.countsFile.result_kinds.candidate_preference).toBe(5201);
    expect(inventory.reportingUnits).toHaveLength(1679);
    expect(inventory.reportingUnits.length).not.toBe(11112);
    expect(inventory.communities).toHaveLength(285);
    expect(inventory.countsFile.ministry_overview_communities).toBe(286);
    expect(inventory.byPath.has("data/research/cyprus/results.json")).toBe(false);
    expect(inventory.byPath.has("data/research/cyprus/sources")).toBe(false);
    expect(inventory.byPath.has("data/research/cyprus/counts.json")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.tiers.classifications.every((row) => row.review_status === "needs_review")).toBe(true);
    expect(inventory.tiers.justin_approval?.holds_open).toEqual(NAMED_HOLDS.map((hold) => hold.token));
    expect(inventory.tiers.justin_approval?.holds_resolved).toEqual([]);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(22);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanCyprusInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(CyprusPreflightError);
  });

  it("imports 714 current and 174 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-cyprus-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importCyprus({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "cyprus-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(888);
    expect(first.counts.current_offices).toBe(714);
    expect(first.counts.historical_offices).toBe(174);
    expect(first.counts.total_events).toBe(1599);
    expect(first.counts.selected_histories).toBe(1599);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBe(11112);
    expect(first.counts.municipal_offices).toBe(877);
    expect(first.counts.regional_offices).toBe(5);
    expect(first.counts.national_offices).toBe(5);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.direct_executive_offices).toBe(404);
    expect(first.counts.historical_direct_executives).toBe(87);
    expect(first.counts.current_local_councils).toBe(305);
    expect(first.counts.current_municipal_councils).toBe(20);
    expect(first.counts.current_mayors).toBe(20);
    expect(first.counts.current_deputy_mayors).toBe(93);
    expect(first.counts.current_community_councils).toBe(285);
    expect(first.counts.current_community_leaders).toBe(285);
    expect(first.counts.current_dlgo_presidents).toBe(5);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.guessed_merger_edges).toBe(0);
    expect(first.counts.named_communities).toBe(285);
    expect(first.counts.ministry_overview_communities).toBe(286);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(15);
    expect(first.counts.named_holds).toBe(15);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(888);
    expect(first.counts.geographies).toBe(494);
    expect(first.counts.year_only_events).toBe(7);
    expect(first.counts.offices_without_events).toBe(88);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(888);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1599);
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
      ).toBe(174);
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
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(REL_ARM_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      const spilia = db
        .prepare("SELECT office_id, geography_id FROM office WHERE office_id IN (?, ?) ORDER BY office_id")
        .all(SPILIA_ANTONIOS_COUNCIL_ID, SPILIA_KOURDALI_COUNCIL_ID);
      expect(spilia).toEqual([
        { office_id: SPILIA_ANTONIOS_COUNCIL_ID, geography_id: "CY-COM-1401" },
        { office_id: SPILIA_KOURDALI_COUNCIL_ID, geography_id: "CY-COM-SPILIA-KOURDALI" },
      ]);
      const holds = db
        .prepare("SELECT original_token, json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID);
      expect(holds).toHaveLength(15);
      expect(holds.every((row) => row.status === "open")).toBe(true);
      expect(
        db.prepare("SELECT legal_outcome FROM election_event WHERE office_id = ?").all(PRESIDENT_ID).every((row) => row.legal_outcome === "unknown"),
      ).toBe(true);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ? AND precision = 'year'").get(LINEAGE_ID)?.n)).toBe(7);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("cyprus", sqlitePath);
    expect(calendar.count).toBe(5);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("successor crosswalk stays empty");
    expect(calendar.label).toContain("not invented");

    const second = importCyprus({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "cyprus-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
  }, 120_000);
});
