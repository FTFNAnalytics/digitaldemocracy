import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CEUTA_ID,
  CONGRESO_ID,
  DRAFT_TIER_SHA256,
  EXPECTED_COUNTS,
  FORBIDDEN_ISLAND_DUPLICATE_ID,
  FORBIDDEN_NAVARRA_DIPUTACION_ID,
  FORMENTERA_ID,
  FULL_PACK_DOCUMENTARY_FINGERPRINT,
  HISTORICAL_OFFICE_IDS,
  LINEAGE_ID,
  MADRID_COUNCIL_ID,
  MELILLA_ID,
  NAMED_HOLDS,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/spain/identity";
import { importSpain } from "../../lib/atlas/spain/import";
import { SpainPreflightError, scanSpainInventory } from "../../lib/atlas/spain/inventory";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Spain Atlas importer", () => {
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

  it("scans the accepted Prompt AE slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanSpainInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(EXPECTED_COUNTS.offices);
    expect(inventory.events).toHaveLength(EXPECTED_COUNTS.total_events);
    expect(inventory.geographies).toHaveLength(EXPECTED_COUNTS.geographies);
    expect(inventory.crosswalks).toHaveLength(EXPECTED_COUNTS.identity_crosswalks);
    expect(inventory.unboundBlockCount).toBe(EXPECTED_COUNTS.unbound_municipal_blocks);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(FULL_PACK_DOCUMENTARY_FINGERPRINT);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("results.json"))).toBe(false);
    expect(inventory.tracked.some((item) => item.input_path.includes("/sources/"))).toBe(false);
  });

  it("imports 8204 current + 4 historical offices and keeps named holds open", async () => {
    // Let Vitest ack onTaskUpdate before the synchronous SQLite import.
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-spain-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSpain({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "spain-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(8204);
    expect(first.counts.historical_offices).toBe(4);
    expect(first.counts.offices).toBe(8208);
    expect(first.counts.municipal_offices).toBe(8133);
    expect(first.counts.regional_offices).toBe(68);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(5);
    expect(first.counts.provincial_councils).toBe(38);
    expect(first.counts.island_councils).toBe(10);
    expect(first.counts.concejo_abierto).toBe(78);
    expect(first.counts.mode_pending_current).toBe(3762);
    expect(first.counts.total_events).toBe(20820);
    expect(first.counts.selected_histories).toBe(20401);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.proceedings).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(12);
    expect(first.counts.diputacion_events).toBe(0);
    expect(first.counts.approved_classifications).toBe(4311);
    expect(first.counts.needs_review_classifications).toBe(3897);
    expect(first.counts.successor_edges).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(8208);
      expect(db.prepare("SELECT office_type, geography_id, next_date_id FROM office WHERE office_id = ?").get(MADRID_COUNCIL_ID)).toMatchObject({
        office_type: "municipal_council",
        geography_id: "ES-M28079",
        next_date_id: null,
      });
      for (const officeId of HISTORICAL_OFFICE_IDS) {
        expect(db.prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?").get(officeId)).toMatchObject({
          office_status: "historical",
          next_date_id: null,
        });
      }
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(CEUTA_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(MELILLA_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(FORMENTERA_ID)).toMatchObject({
        office_type: "combined_municipal_island_council",
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id = ?").get(FORBIDDEN_ISLAND_DUPLICATE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id = ?").get(FORBIDDEN_NAVARRA_DIPUTACION_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(CONGRESO_ID)).toMatchObject({
        tier: "national_context",
      });
      const holds = db
        .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID)
        .map((row) => String(row.original_token));
      expect(holds).toEqual([...NAMED_HOLDS]);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("spain", sqlitePath);
    expect(calendar.count).toBe(68);
    expect(calendar.label).toContain("38 ordinary provincial councils");
    expect(calendar.label).toContain("Do not report 68 as 68 autonomous communities");
    expect(calendar.label).toContain("ES-G01–ES-G12");

    const second = importSpain({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "spain-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 120_000);

  it("imports Albania then Spain into one master without dropping Albania", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-spain-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-spain-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const spain = importSpain({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-spain-test",
    });
    expect(spain.counts.offices).toBe(8208);
    expect(spain.counts.result_rows).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(8208);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, LINEAGE_ID].sort());
    } finally {
      db.close();
    }
  }, 120_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a draft-tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-spain-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importSpain({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "spain-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "spain-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as {
      status: string;
      production_accepted: boolean;
    };
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanSpainInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(SpainPreflightError);
  }, 120_000);
});
