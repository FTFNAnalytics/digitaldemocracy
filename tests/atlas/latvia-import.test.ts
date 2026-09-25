import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DISPUTED_SHARE_RESULT_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  LINEAGE_ID,
  MADONA_2021_ID,
  MADONA_2025_ID,
  NAMED_HOLDS,
  PRESIDENT_2003_HK,
  PRESIDENT_ID,
  RIGA_2020_HK,
  RIGA_ID,
  SAEIMA_2026_HK,
  SAEIMA_ID,
  TIER_PATH,
  TIER_SHA256,
  VARAKLANI_2021_ID,
} from "../../lib/atlas/latvia/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importLatvia } from "../../lib/atlas/latvia/import";
import { LatviaPreflightError, scanLatviaInventory } from "../../lib/atlas/latvia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Latvia Atlas importer", () => {
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

  it("scans the accepted Prompt AG research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanLatviaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(166);
    expect(inventory.events).toHaveLength(217);
    expect(inventory.results).toHaveLength(1383);
    expect(inventory.geographies).toHaveLength(164);
    expect(inventory.proceedings).toHaveLength(2);
    expect(inventory.counts.current_offices).toBe(45);
    expect(inventory.counts.historical_office_identity_records).toBe(121);
    expect(inventory.byPath.has("data/research/latvia/results.json")).toBe(true);
    expect(inventory.tracked.some((item) => item.input_path.startsWith("data/research/latvia/sources/"))).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.crosswalks).toHaveLength(163);
    expect(inventory.crosswalks.every((row) => row.reason.includes("NOT a predecessor/successor"))).toBe(true);
    expect(inventory.shareClaims).toHaveLength(7);
  });

  it("imports 45 current + 121 historical offices and reuses the same release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-latvia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importLatvia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "latvia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(45);
    expect(first.counts.historical_offices).toBe(121);
    expect(first.counts.offices).toBe(166);
    expect(first.counts.municipal_offices).toBe(163);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(217);
    expect(first.counts.selected_histories).toBe(216);
    expect(first.counts.prospective_events).toBe(1);
    expect(first.counts.result_rows).toBe(1383);
    expect(first.counts.proceedings).toBe(2);
    expect(first.counts.unresolved_evidence).toBe(16);
    expect(first.counts.current_councils).toBe(42);
    expect(first.counts.current_direct_executive_offices).toBe(0);
    expect(first.counts.current_indirect_presidential_offices).toBe(1);
    expect(first.counts.needs_review_classifications).toBe(124);
    expect(first.counts.approved_classifications).toBe(42);
    expect(first.counts.president_popular_events).toBe(0);
    expect(first.counts.president_indirect_events).toBe(6);
    expect(first.counts.disputed_share_rows).toBe(7);
    expect(first.counts.roster_pv2017).toBe(119);
    expect(first.counts.roster_pv2025).toBe(42);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(166);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(121);
      const riga = db
        .prepare("SELECT office_status, next_history_key, geography_id FROM office WHERE office_id = ?")
        .get(RIGA_ID);
      expect(riga).toMatchObject({
        office_status: "current",
        next_history_key: null,
        geography_id: "LV-LOCAL-2021-riga",
      });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(MADONA_2025_ID)).toMatchObject({
        office_status: "current",
      });
      expect(
        db.prepare("SELECT office_status, record_state FROM office WHERE office_id = ?").get(MADONA_2021_ID),
      ).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(db.prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?").get(VARAKLANI_2021_ID)).toMatchObject({
        office_status: "historical",
        next_date_id: null,
      });
      const yearDate = db
        .prepare(
          "SELECT d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
        )
        .get(PRESIDENT_2003_HK);
      expect(yearDate).toMatchObject({ precision: "year", month: null, day: null });
      expect(db.prepare("SELECT event_kind, ballot_basis FROM election_event WHERE history_key = ?").get(PRESIDENT_2003_HK)).toMatchObject({
        event_kind: "indirect",
        ballot_basis: "electors",
      });
      expect(db.prepare("SELECT event_kind FROM election_event WHERE history_key = ?").get(RIGA_2020_HK)).toMatchObject({
        event_kind: "special",
      });
      expect(
        db.prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?").get(SAEIMA_2026_HK),
      ).toMatchObject({ selected_history_role: "none", legal_outcome: "not_held" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SAEIMA_ID),
      ).toMatchObject({ tier: "national_context", review_status: "approved" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID),
      ).toMatchObject({ tier: "national_context", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(db.prepare("SELECT share, share_status FROM result_row WHERE result_row_id = ?").get(DISPUTED_SHARE_RESULT_ID)).toMatchObject({
        share: 18.97,
        share_status: "disputed",
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1383);
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

    const calendar = listAtlasRegionalCalendar("latvia", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.label).toContain("0 regional offices");
    expect(calendar.label).toMatch(/LV-G01/);

    const second = importLatvia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "latvia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Latvia into one master without dropping Albania", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-latvia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-latvia-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const latvia = importLatvia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-latvia-test",
    });
    expect(latvia.counts.current_offices).toBe(45);
    expect(latvia.counts.historical_offices).toBe(121);
    expect(latvia.counts.offices).toBe(166);
    expect(latvia.counts.regional_offices).toBe(0);
    expect(latvia.counts.result_rows).toBe(1383);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(166);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-latvia-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importLatvia({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "latvia-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "latvia-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as {
      status: string;
      production_accepted: boolean;
    };
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanLatviaInventory({
        root: repoRoot,
        tierPath: draftPath,
      }),
    ).toThrow(LatviaPreflightError);
  });
});
