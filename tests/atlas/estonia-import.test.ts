import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  JOHVI_CURRENT_ID,
  JOHVI_HISTORICAL_ID,
  KOV_2013_EXAMPLE_HK,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_1992_HK,
  PRESIDENT_ID,
  RIIGIKOGU_ID,
  TALLINN_ID,
  TIER_PATH,
  TIER_SHA256,
  TOILA_ID,
} from "../../lib/atlas/estonia/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importEstonia } from "../../lib/atlas/estonia/import";
import { EstoniaPreflightError, scanEstoniaInventory } from "../../lib/atlas/estonia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Estonia Atlas importer", () => {
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

  it("scans the accepted Prompt AF research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanEstoniaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(281);
    expect(inventory.events).toHaveLength(464);
    expect(inventory.geographies).toHaveLength(279);
    expect(inventory.proceedings).toHaveLength(24);
    expect(inventory.counts.results).toBe(49504);
    expect(inventory.byPath.has("data/research/estonia/results.json")).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.crosswalks).toHaveLength(278);
    expect(inventory.crosswalks.every((row) => row.reason.includes("not a legal successor"))).toBe(true);
  });

  it("imports 81 current + 200 historical offices and reuses the same release", async () => {
    // Let Vitest ack onTaskUpdate before the synchronous SQLite import.
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-estonia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importEstonia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "estonia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(81);
    expect(first.counts.historical_offices).toBe(200);
    expect(first.counts.offices).toBe(281);
    expect(first.counts.municipal_offices).toBe(278);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(464);
    expect(first.counts.selected_histories).toBe(464);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.proceedings).toBe(24);
    expect(first.counts.unresolved_evidence).toBe(9);
    expect(first.counts.current_councils).toBe(78);
    expect(first.counts.current_direct_executive_offices).toBe(0);
    expect(first.counts.current_indirect_presidential_offices).toBe(1);
    expect(first.counts.needs_review_classifications).toBe(202);
    expect(first.counts.approved_classifications).toBe(79);
    expect(first.counts.president_2021_events).toBe(0);
    expect(first.counts.president_indirect_events).toBe(6);
    expect(first.counts.president_1992_events).toBe(1);
    expect(first.counts.roster_2013).toBe(215);
    expect(first.counts.roster_2025).toBe(78);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(281);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(200);
      const tallinn = db
        .prepare("SELECT office_status, next_history_key, geography_id FROM office WHERE office_id = ?")
        .get(TALLINN_ID);
      expect(tallinn).toMatchObject({
        office_status: "current",
        next_history_key: null,
        geography_id: "EE-M0784",
      });
      expect(
        db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(JOHVI_CURRENT_ID),
      ).toMatchObject({ office_status: "current" });
      expect(
        db.prepare("SELECT office_status, record_state FROM office WHERE office_id = ?").get(JOHVI_HISTORICAL_ID),
      ).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(
        db.prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?").get(TOILA_ID),
      ).toMatchObject({ office_status: "historical", next_date_id: null });
      const yearDate = db
        .prepare(
          "SELECT d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
        )
        .get(KOV_2013_EXAMPLE_HK);
      expect(yearDate).toMatchObject({ precision: "year", month: null, day: null });
      const mixed = db
        .prepare("SELECT event_kind, ballot_basis FROM election_event WHERE history_key = ?")
        .get(PRESIDENT_1992_HK);
      expect(mixed).toMatchObject({ event_kind: "unknown", ballot_basis: "unknown" });
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ? AND event_kind = 'indirect' AND office_id = ?").get(LINEAGE_ID, PRESIDENT_ID)?.n,
        ),
      ).toBe(6);
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(RIIGIKOGU_ID),
      ).toMatchObject({ tier: "national_context", review_status: "approved" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID),
      ).toMatchObject({ tier: "national_context", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      for (const hold of NAMED_HOLDS) {
        expect(
          Number(
            db
              .prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?")
              .get(LINEAGE_ID, hold.token)?.n,
          ),
        ).toBe(1);
      }
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("estonia", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.label).toContain("0 regional offices");
    expect(calendar.label).toMatch(/EE-G01/);

    const second = importEstonia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "estonia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Estonia into one master without dropping Albania", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-estonia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-estonia-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const estonia = importEstonia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-estonia-test",
    });
    expect(estonia.counts.current_offices).toBe(81);
    expect(estonia.counts.historical_offices).toBe(200);
    expect(estonia.counts.offices).toBe(281);
    expect(estonia.counts.regional_offices).toBe(0);
    expect(estonia.counts.result_rows).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(281);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-estonia-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importEstonia({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "estonia-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "estonia-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanEstoniaInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(EstoniaPreflightError);
  });
});
