import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  AARTSELAAR_COUNCIL_ID,
  AARTSELAAR_MAYOR_ID,
  BILZEN_2018_HISTORY_KEY,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID,
  SAINT_JOSSE_2024_HISTORY_KEY,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/belgium/identity";
import { importBelgium } from "../../lib/atlas/belgium/import";
import { BelgiumPreflightError, scanBelgiumInventory } from "../../lib/atlas/belgium/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Belgium Atlas importer", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scans the accepted S2 research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanBelgiumInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(1234);
    expect(inventory.events).toHaveLength(1772);
    expect(inventory.results).toHaveLength(9238);
    expect(inventory.geographies).toHaveLength(647);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
  });

  it("imports 1179 current + 55 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-belgium-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBelgium({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "belgium-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(1179);
    expect(first.counts.historical_offices).toBe(55);
    expect(first.counts.offices).toBe(1234);
    expect(first.counts.municipal_offices).toBe(1185);
    expect(first.counts.regional_offices).toBe(15);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(32);
    expect(first.counts.total_events).toBe(1772);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(9238);
    expect(first.counts.unresolved_evidence).toBe(37);
    expect(first.counts.mayor_result_rows).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1234);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(55);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(AARTSELAAR_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const mayor = db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(AARTSELAAR_MAYOR_ID);
      expect(mayor).toMatchObject({ office_type: "mayor" });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(HISTORICAL_EXAMPLE_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      const bilzen = db
        .prepare("SELECT date_id, date_resolution, event_kind, selected_history_role FROM election_event WHERE history_key = ?")
        .get(BILZEN_2018_HISTORY_KEY);
      expect(bilzen?.date_id).toBeNull();
      expect(bilzen).toMatchObject({
        date_resolution: "conflicting",
        event_kind: "unknown",
        selected_history_role: "other",
      });
      const saintJosse = db
        .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
        .get(SAINT_JOSSE_2024_HISTORY_KEY);
      expect(saintJosse).toMatchObject({ selected_history_role: "other", legal_outcome: "disputed" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("belgium", sqlitePath);
    expect(calendar.count).toBe(15);
    expect(calendar.label).toContain("15 regional offices");
    expect(calendar.label).toMatch(/Remaining-universe/);

    const second = importBelgium({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "belgium-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a draft-tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-belgium-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importBelgium({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "belgium-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "belgium-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanBelgiumInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(BelgiumPreflightError);
  });
});
