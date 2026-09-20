import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BELLINZONA_EXECUTIVE_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  HELD_SZ_GAP_OFFICE_ID,
  HELD_VD_GAP_OFFICE_ID,
  HISTORICAL_HORGEN_ID,
  LINEAGE_ID,
  NATIONAL_COUNCIL_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/switzerland/identity";
import { importSwitzerland } from "../../lib/atlas/switzerland/import";
import { SwitzerlandPreflightError, scanSwitzerlandInventory } from "../../lib/atlas/switzerland/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Switzerland Atlas importer", () => {
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

  it("scans the accepted Prompt U slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanSwitzerlandInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(2816);
    expect(inventory.events).toHaveLength(1443);
    expect(inventory.results).toHaveLength(8094);
    expect(inventory.geographies).toHaveLength(2723);
    expect(inventory.proceedings).toHaveLength(136);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.offices.filter((row) => row.current)).toHaveLength(2805);
    expect(inventory.offices.filter((row) => row.current === false)).toHaveLength(11);
    expect(inventory.audit.filter((row) => row.executive_body_recorded === false)).toHaveLength(308);
  });

  it("imports 2805 current + 11 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-switzerland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSwitzerland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "switzerland-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(2805);
    expect(first.counts.historical_offices).toBe(11);
    expect(first.counts.offices).toBe(2816);
    expect(first.counts.municipal_offices).toBe(2402);
    expect(first.counts.regional_offices).toBe(52);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(360);
    expect(first.counts.total_events).toBe(1443);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(8094);
    expect(first.counts.proceedings).toBe(136);
    expect(first.counts.unresolved_evidence).toBe(1938);
    expect(first.counts.held_commune_executive_gaps).toBe(308);
    expect(first.counts.held_commune_executive_gaps_vd).toBe(284);
    expect(first.counts.held_commune_executive_gaps_sz).toBe(24);
    expect(first.counts.disputed_result_rows).toBe(16);
    expect(first.counts.focused_review_flags).toBe(914);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(2816);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(11);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(NATIONAL_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "unknown",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(HISTORICAL_HORGEN_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      const bellinzona = db
        .prepare("SELECT next_date_resolution, geography_id FROM office WHERE office_id = ?")
        .get(BELLINZONA_EXECUTIVE_ID);
      expect(bellinzona).toMatchObject({ next_date_resolution: "resolved", geography_id: "CH-GM5002" });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(HELD_SZ_GAP_OFFICE_ID)).toBeUndefined();
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(HELD_VD_GAP_OFFICE_ID)).toBeUndefined();
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(136);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND evidence_status = 'disputed'").get(LINEAGE_ID)?.n),
      ).toBe(16);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("switzerland", sqlitePath);
    expect(calendar.count).toBe(52);
    expect(calendar.label).toContain("52 regional offices");
    expect(calendar.label).toMatch(/308 commune-executive/);

    const second = importSwitzerland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "switzerland-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a draft-tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-switzerland-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importSwitzerland({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "switzerland-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "switzerland-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanSwitzerlandInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(SwitzerlandPreflightError);
  });
});
