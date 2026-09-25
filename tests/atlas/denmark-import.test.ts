import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  COPENHAGEN_COUNCIL_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  FOLKETING_ID,
  GRENAA_HISTORICAL_ID,
  LINEAGE_ID,
  NORDDJURS_ID,
  OEST_2025_HISTORY_KEY,
  RETIRING_REGION_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/denmark/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importDenmark } from "../../lib/atlas/denmark/import";
import { DenmarkPreflightError, scanDenmarkInventory } from "../../lib/atlas/denmark/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Denmark Atlas importer", () => {
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

  it("scans the accepted Prompt X research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanDenmarkInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(346);
    expect(inventory.events).toHaveLength(1849);
    expect(inventory.results).toHaveLength(25391);
    expect(inventory.geographies).toHaveLength(345);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
  });

  it("imports 106 current + 240 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-denmark-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importDenmark({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "denmark-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(106);
    expect(first.counts.historical_offices).toBe(240);
    expect(first.counts.offices).toBe(346);
    expect(first.counts.municipal_offices).toBe(324);
    expect(first.counts.regional_offices).toBe(20);
    expect(first.counts.national_offices).toBe(1);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(1849);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(25391);
    expect(first.counts.unresolved_evidence).toBe(105);
    expect(first.counts.unresolved_candidate_bindings).toBe(98);
    expect(first.counts.mayor_result_rows).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(293);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(346);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(240);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(COPENHAGEN_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(GRENAA_HISTORICAL_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(NORDDJURS_ID)).toMatchObject({
        office_status: "current",
      });
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id = ? AND history_key LIKE '%::2025::%'")
            .get(RETIRING_REGION_ID)?.n,
        ),
      ).toBe(0);
      expect(db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(OEST_2025_HISTORY_KEY)).toBeTruthy();
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(FOLKETING_ID),
      ).toMatchObject({ tier: "national_context" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (name LIKE '%Inatsisartut%' OR name LIKE '%Løgting%')")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("denmark", sqlitePath);
    expect(calendar.count).toBe(20);
    expect(calendar.label).toContain("20 regional offices");
    expect(calendar.label).toMatch(/Greenland\/Faroe/);

    const second = importDenmark({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "denmark-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Denmark into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-denmark-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-denmark-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const denmark = importDenmark({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-denmark-test",
    });
    expect(denmark.counts.current_offices).toBe(106);
    expect(denmark.counts.historical_offices).toBe(240);
    expect(denmark.counts.offices).toBe(346);
    expect(denmark.counts.regional_offices).toBe(20);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(346);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-denmark-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importDenmark({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "denmark-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "denmark-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanDenmarkInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(DenmarkPreflightError);
  });
});
