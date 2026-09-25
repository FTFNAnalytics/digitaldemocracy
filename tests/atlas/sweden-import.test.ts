import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BARA_HISTORICAL_ID,
  BASTAD_2014_HK,
  BASTAD_2015_HK,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  FALUN_2018_HK,
  GOTLAND_COUNCIL_ID,
  LINEAGE_ID,
  RIKSDAG_ID,
  SAMI_ID,
  SAMI_MAY_2025_HK,
  STOCKHOLM_COUNCIL_ID,
  SVEDALA_CURRENT_ID,
  SVEDALA_PRE1976_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/sweden/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importSweden } from "../../lib/atlas/sweden/import";
import { SwedenPreflightError, scanSwedenInventory } from "../../lib/atlas/sweden/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Sweden Atlas importer", () => {
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

  it("scans the accepted Prompt Y research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanSwedenInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(320);
    expect(inventory.events).toHaveLength(4951);
    expect(inventory.results).toHaveLength(40991);
    expect(inventory.geographies).toHaveLength(318);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
  });

  it("imports 313 current + 7 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-sweden-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSweden({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "sweden-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(313);
    expect(first.counts.historical_offices).toBe(7);
    expect(first.counts.offices).toBe(320);
    expect(first.counts.municipal_offices).toBe(292);
    expect(first.counts.regional_offices).toBe(25);
    expect(first.counts.national_offices).toBe(1);
    expect(first.counts.other_offices).toBe(2);
    expect(first.counts.total_events).toBe(4951);
    expect(first.counts.selected_histories).toBe(4639);
    expect(first.counts.other_histories).toBe(2);
    expect(first.counts.prospective_events).toBe(310);
    expect(first.counts.result_rows).toBe(40991);
    expect(first.counts.unresolved_evidence).toBe(7);
    expect(first.counts.mayor_result_rows).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(10);
    expect(first.counts.gotland_offices).toBe(1);
    expect(first.counts.bastad_2015_result_rows).toBe(0);
    expect(first.counts.fargelanda_1973_disputed).toBe(7);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(320);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(7);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(STOCKHOLM_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(BARA_HISTORICAL_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SVEDALA_PRE1976_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(SVEDALA_CURRENT_ID)).toMatchObject({
        office_status: "current",
      });
      expect(
        db
          .prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?")
          .get(GOTLAND_COUNCIL_ID),
      ).toMatchObject({ tier: "municipal", review_status: "needs_review" });
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id != ? AND name LIKE '%Gotland%'")
            .get(LINEAGE_ID, GOTLAND_COUNCIL_ID)?.n,
        ),
      ).toBe(0);
      expect(db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(FALUN_2018_HK)).toBeTruthy();
      expect(
        db.prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?").get(BASTAD_2014_HK),
      ).toMatchObject({ selected_history_role: "other", legal_outcome: "superseded" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE history_key = ?").get(BASTAD_2015_HK)?.n),
      ).toBe(0);
      expect(
        db.prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?").get(SAMI_MAY_2025_HK),
      ).toMatchObject({ selected_history_role: "other", legal_outcome: "annulled" });
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(RIKSDAG_ID),
      ).toMatchObject({ tier: "national_context" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SAMI_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("sweden", sqlitePath);
    expect(calendar.count).toBe(25);
    expect(calendar.label).toContain("25 regional offices");
    expect(calendar.label).toMatch(/Gotland stays the municipal/);

    const second = importSweden({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "sweden-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Sweden into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-sweden-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-sweden-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const sweden = importSweden({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-sweden-test",
    });
    expect(sweden.counts.current_offices).toBe(313);
    expect(sweden.counts.historical_offices).toBe(7);
    expect(sweden.counts.offices).toBe(320);
    expect(sweden.counts.regional_offices).toBe(25);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(320);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-sweden-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importSweden({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "sweden-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "sweden-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanSwedenInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(SwedenPreflightError);
  });
});
