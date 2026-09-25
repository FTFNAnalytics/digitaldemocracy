import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CLONMEL_ID,
  COUNCIL_EXAMPLE_ID,
  DAIL_DUBLIN_HISTORY_KEY,
  DAIL_GALWAY_HISTORY_KEY,
  DAIL_ID,
  DRAFT_TIER_SHA256,
  EP_ID,
  LIMERICK_MAYOR_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_ID,
  SEANAD_HISTORY_KEY,
  SEANAD_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/ireland/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importIreland } from "../../lib/atlas/ireland/import";
import { IrelandPreflightError, scanIrelandInventory } from "../../lib/atlas/ireland/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Ireland Atlas importer", () => {
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

  it("scans the accepted Prompt AB research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanIrelandInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(122);
    expect(inventory.events).toHaveLength(196);
    expect(inventory.results).toHaveLength(7254);
    expect(inventory.geographies).toHaveLength(118);
    expect(inventory.researchGaps.map((row) => row.original_token)).toEqual([...NAMED_HOLDS]);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
  });

  it("imports 36 current + 86 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-ireland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importIreland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "ireland-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(36);
    expect(first.counts.historical_offices).toBe(86);
    expect(first.counts.offices).toBe(122);
    expect(first.counts.municipal_offices).toBe(118);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.national_offices).toBe(3);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(196);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(7254);
    expect(first.counts.unresolved_evidence).toBe(9);
    expect(first.counts.direct_mayor_offices).toBe(1);
    expect(first.counts.ep_result_rows).toBe(0);
    expect(first.counts.seanad_result_rows).toBe(140);
    expect(first.counts.needs_review_classifications).toBe(88);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(122);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(86);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(COUNCIL_EXAMPLE_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      const historical = db
        .prepare("SELECT office_status, record_state, next_date_id FROM office WHERE office_id = ?")
        .get(CLONMEL_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active", next_date_id: null });
      expect(
        db
          .prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?")
          .get(DAIL_ID),
      ).toMatchObject({ tier: "national_context", review_status: "approved" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SEANAD_ID),
      ).toMatchObject({ tier: "national_context", review_status: "needs_review" });
      expect(
        db.prepare("SELECT event_kind FROM election_event WHERE history_key = ?").get(SEANAD_HISTORY_KEY),
      ).toMatchObject({ event_kind: "indirect" });
      const byElections = db
        .prepare("SELECT event_id FROM election_event WHERE history_key IN (?, ?)")
        .all(DAIL_DUBLIN_HISTORY_KEY, DAIL_GALWAY_HISTORY_KEY);
      expect(byElections).toHaveLength(2);
      expect(new Set(byElections.map((row) => String(row.event_id))).size).toBe(2);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE office_id = ?").get(EP_ID)?.n),
      ).toBe(0);
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM election_event WHERE office_id = ? AND (history_key LIKE '%::2018::%' OR history_key LIKE '%::2025::%')",
            )
            .get(PRESIDENT_ID)?.n,
        ),
      ).toBe(0);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type = 'directly_elected_mayor'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(1);
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(LIMERICK_MAYOR_ID)).toBeTruthy();
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND name LIKE '%Northern Ireland%'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      const holds = db
        .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID)
        .map((row) => String(row.original_token));
      expect(holds).toEqual([...NAMED_HOLDS].sort());
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("ireland", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.label).toContain("No regional offices");
    expect(calendar.label).toMatch(/Northern Ireland/);

    const second = importIreland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "ireland-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 120_000);

  it("imports Albania then Ireland into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-ireland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-ireland-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const ireland = importIreland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-ireland-test",
    });
    expect(ireland.counts.current_offices).toBe(36);
    expect(ireland.counts.historical_offices).toBe(86);
    expect(ireland.counts.offices).toBe(122);
    expect(ireland.counts.regional_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(122);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-ireland-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importIreland({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "ireland-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "ireland-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanIrelandInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(IrelandPreflightError);
  });
});
