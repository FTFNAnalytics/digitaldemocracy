import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  ALAHARMA_HISTORICAL_ID,
  ALAND_LAGTING_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  EDUSKUNTA_ID,
  EP_ID,
  HELSINKI_COUNCIL_ID,
  HVA20_2022_HK,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_2018_HK,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/finland/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importFinland } from "../../lib/atlas/finland/import";
import { FinlandPreflightError, scanFinlandInventory } from "../../lib/atlas/finland/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Finland Atlas importer", () => {
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

  it("scans the accepted Prompt Z research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanFinlandInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(503);
    expect(inventory.events).toHaveLength(5241);
    expect(inventory.results).toHaveLength(37471);
    expect(inventory.geographies).toHaveLength(501);
    expect(inventory.proceedings).toHaveLength(11);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.researchGaps.map((row) => row.original_token).sort()).toEqual([...NAMED_HOLDS].sort());
  });

  it("imports 333 current + 170 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-finland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importFinland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "finland-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(333);
    expect(first.counts.historical_offices).toBe(170);
    expect(first.counts.offices).toBe(503);
    expect(first.counts.municipal_offices).toBe(478);
    expect(first.counts.regional_offices).toBe(22);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(5241);
    expect(first.counts.selected_histories).toBe(5241);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(37471);
    expect(first.counts.proceedings).toBe(11);
    expect(first.counts.unresolved_evidence).toBe(7);
    expect(first.counts.mayor_result_rows).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(171);
    expect(first.counts.helsinki_county_offices).toBe(0);
    expect(first.counts.president_2018_runoffs).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(503);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(170);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(HELSINKI_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(ALAHARMA_HISTORICAL_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(
        db.prepare("SELECT next_date_id FROM office WHERE office_id = ?").get(ALAND_LAGTING_ID),
      ).toMatchObject({ next_date_id: null });
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type = 'wellbeing_county_council' AND name LIKE '%Helsinki%'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      expect(db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(HVA20_2022_HK)).toBeTruthy();
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ? AND office_id LIKE 'FI-HVA%' AND history_key LIKE '%::2023::%'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE history_key = ? AND kind = 'runoff'").get(PRESIDENT_2018_HK)?.n),
      ).toBe(0);
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(EDUSKUNTA_ID),
      ).toMatchObject({ tier: "national_context" });
      expect(
        db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID),
      ).toMatchObject({ tier: "national_context" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(11);
      for (const hold of NAMED_HOLDS) {
        expect(
          Number(
            db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?").get(LINEAGE_ID, hold)?.n,
          ),
        ).toBe(1);
      }
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("finland", sqlitePath);
    expect(calendar.count).toBe(22);
    expect(calendar.label).toContain("22 regional offices");
    expect(calendar.label).toMatch(/Helsinki has one municipal/);

    const second = importFinland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "finland-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Finland into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-finland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-finland-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const finland = importFinland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-finland-test",
    });
    expect(finland.counts.current_offices).toBe(333);
    expect(finland.counts.historical_offices).toBe(170);
    expect(finland.counts.offices).toBe(503);
    expect(finland.counts.regional_offices).toBe(22);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(503);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-finland-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importFinland({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "finland-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "finland-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanFinlandInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(FinlandPreflightError);
  });
});
