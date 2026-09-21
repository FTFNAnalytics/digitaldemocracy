import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BOLESLAWIEC_COUNCIL_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  FULL_PACK_DOCUMENTARY_FINGERPRINT,
  LINEAGE_ID,
  OSTROWICE_COUNCIL_ID,
  OSTROWICE_EXECUTIVE_ID,
  POWIAT_EXAMPLE_ID,
  SEJM_2019_HISTORY_KEY,
  SEJM_ID,
  SEJMIK_EXAMPLE_ID,
  TIER_PATH,
  TIER_SHA256,
  WARSAW_DISTRICT_EXAMPLE_ID,
} from "../../lib/atlas/poland/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importPoland } from "../../lib/atlas/poland/import";
import { PolandPreflightError, scanPolandInventory } from "../../lib/atlas/poland/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Poland Atlas importer", () => {
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

  it("scans the accepted Prompt AC slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanPolandInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(5312);
    expect(inventory.events).toHaveLength(16767);
    expect(inventory.proceedings).toHaveLength(9773);
    expect(inventory.geographies).toHaveLength(2829);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(FULL_PACK_DOCUMENTARY_FINGERPRINT);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("results.jsonl.gz"))).toBe(false);
  });

  it("imports 5310 current + 2 historical offices and keeps powiat regional", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-poland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importPoland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "poland-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(5310);
    expect(first.counts.historical_offices).toBe(2);
    expect(first.counts.offices).toBe(5312);
    expect(first.counts.municipal_offices).toBe(4960);
    expect(first.counts.regional_offices).toBe(330);
    expect(first.counts.national_offices).toBe(3);
    expect(first.counts.other_offices).toBe(19);
    expect(first.counts.powiat_councils).toBe(314);
    expect(first.counts.voivodeship_sejmiks).toBe(16);
    expect(first.counts.total_events).toBe(16767);
    expect(first.counts.prospective_events).toBe(56);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.proceedings).toBe(9773);
    expect(first.counts.unresolved_evidence).toBe(12);
    expect(first.counts.needs_review_classifications).toBe(333);
    expect(first.counts.successor_edges).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(5312);
      const council = db
        .prepare("SELECT office_status, geography_id, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(BOLESLAWIEC_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        geography_id: "PL-020101",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      expect(
        db.prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?").get(OSTROWICE_COUNCIL_ID),
      ).toMatchObject({ office_status: "historical", record_state: "active", next_date_id: null });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(OSTROWICE_EXECUTIVE_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(POWIAT_EXAMPLE_ID),
      ).toMatchObject({ tier: "regional", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SEJMIK_EXAMPLE_ID),
      ).toMatchObject({ tier: "regional", review_status: "approved" });
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.lineage_id = ? AND o.office_type = 'county_council' AND t.tier != 'regional'",
            )
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(SEJM_ID)).toMatchObject({
        tier: "national_context",
      });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(WARSAW_DISTRICT_EXAMPLE_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      const sejm2019 = db
        .prepare(
          "SELECT d.precision, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
        )
        .get(SEJM_2019_HISTORY_KEY);
      expect(sejm2019).toMatchObject({ precision: "year", year: 2019, month: null, day: null });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (name LIKE 'Wojewoda %' OR name LIKE '%Prezes Rady Ministrów%')",
            )
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("poland", sqlitePath);
    expect(calendar.count).toBe(330);
    expect(calendar.label).toContain("314 powiat");
    expect(calendar.label).toContain("16 voivodeship sejmiks");
    expect(calendar.label).toContain("not reclassified");
    expect(calendar.label).toContain("Do not report 330 as 330 voivodeships");

    const second = importPoland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "poland-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Poland into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-poland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-poland-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const poland = importPoland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-poland-test",
    });
    expect(poland.counts.offices).toBe(5312);
    expect(poland.counts.powiat_councils).toBe(314);
    expect(poland.counts.result_rows).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(122);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(5312);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, LINEAGE_ID].sort());
    } finally {
      db.close();
    }
  }, 300_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a draft-tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-poland-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importPoland({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "poland-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "poland-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanPolandInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(PolandPreflightError);
  });
});
