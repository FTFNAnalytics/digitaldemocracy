import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  AALSMEER_COUNCIL_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  HILVERSUM_ID,
  HISTORICAL_EXAMPLE_ID,
  LEEUWARDERADEEL_2014_HK,
  LINEAGE_ID,
  TIER_PATH,
  TIER_SHA256,
  WIJDEMEREN_ID,
} from "../../lib/atlas/netherlands/identity";
import { importNetherlands } from "../../lib/atlas/netherlands/import";
import { NetherlandsPreflightError, scanNetherlandsInventory } from "../../lib/atlas/netherlands/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Netherlands Atlas importer", () => {
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

  it("scans the accepted Prompt T research pack and pins the slim-pack fingerprint", () => {
    const inventory = scanNetherlandsInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(501);
    expect(inventory.offices.filter((row) => row.current).length).toBe(432);
    expect(inventory.offices.filter((row) => row.current === false).length).toBe(69);
    expect(inventory.events).toHaveLength(1475);
    expect(inventory.results).toHaveLength(13050);
    expect(inventory.geographies).toHaveLength(496);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.offices.some((row) => row.office_type === "mayor")).toBe(false);
  });

  it("imports 432 current + 69 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-netherlands-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importNetherlands({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "netherlands-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(432);
    expect(first.counts.historical_offices).toBe(69);
    expect(first.counts.offices).toBe(501);
    expect(first.counts.municipal_offices).toBe(414);
    expect(first.counts.regional_offices).toBe(12);
    expect(first.counts.national_offices).toBe(3);
    expect(first.counts.other_offices).toBe(72);
    expect(first.counts.approved_classifications).toBe(354);
    expect(first.counts.needs_review_classifications).toBe(147);
    expect(first.counts.total_events).toBe(1475);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(13050);
    expect(first.counts.unresolved_evidence).toBe(2);
    expect(first.counts.mayor_offices).toBe(0);
    expect(first.counts.mayor_result_rows).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(501);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(69);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(AALSMEER_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(HISTORICAL_EXAMPLE_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      for (const officeId of [HILVERSUM_ID, WIJDEMEREN_ID]) {
        const merger = db
          .prepare("SELECT office_status, next_date_id, next_history_key FROM office WHERE office_id = ?")
          .get(officeId);
        expect(merger).toMatchObject({ office_status: "current", next_date_id: null, next_history_key: null });
      }
      const lee = db
        .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
        .get(LEEUWARDERADEEL_2014_HK);
      expect(lee).toMatchObject({ selected_history_role: "other", legal_outcome: "disputed" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type = 'mayor'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("netherlands", sqlitePath);
    expect(calendar.count).toBe(12);
    expect(calendar.label).toContain("12 regional offices");
    expect(calendar.label).toMatch(/Hilversum\/Wijdemeren/);

    const second = importNetherlands({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "netherlands-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a draft-tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-netherlands-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importNetherlands({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "netherlands-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "netherlands-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanNetherlandsInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(NetherlandsPreflightError);
  });
});
