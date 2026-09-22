import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BOROUGH_EXAMPLE_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_TIER_SHA256,
  HISTORICAL_METADATA_ID,
  LINEAGE_ID,
  LONGYEARBYEN_ID,
  OSLO_COUNCIL_ID,
  OSLO_COUNTY_OFFICE_ID,
  SAMI_2025_HK,
  SAMI_ID,
  STORTING_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/norway/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importNorway } from "../../lib/atlas/norway/import";
import { NorwayPreflightError, scanNorwayInventory } from "../../lib/atlas/norway/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Norway Atlas importer", () => {
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

  it("scans the accepted Prompt AA research pack and pins the approved-tier fingerprint", () => {
    const inventory = scanNorwayInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(926);
    expect(inventory.events).toHaveLength(10777);
    expect(inventory.results).toHaveLength(59033);
    expect(inventory.geographies).toHaveLength(926);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
  });

  it("imports 389 current + 537 historical offices and reuses the same release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-norway-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importNorway({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "norway-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(389);
    expect(first.counts.historical_offices).toBe(537);
    expect(first.counts.offices).toBe(926);
    expect(first.counts.municipal_offices).toBe(876);
    expect(first.counts.regional_offices).toBe(32);
    expect(first.counts.national_offices).toBe(1);
    expect(first.counts.other_offices).toBe(17);
    expect(first.counts.total_events).toBe(10777);
    expect(first.counts.selected_histories).toBe(10777);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(59033);
    expect(first.counts.unresolved_evidence).toBe(9);
    expect(first.counts.mayor_result_rows).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(555);
    expect(first.counts.oslo_county_offices).toBe(0);
    expect(first.counts.oslo_borough_offices).toBe(15);
    expect(first.counts.oslo_borough_events).toBe(0);
    expect(first.counts.longyearbyen_result_rows).toBe(0);
    expect(first.counts.sami_2025_disputed).toBe(1);
    expect(first.counts.reform_successors_asserted).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(926);
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n,
        ),
      ).toBe(537);
      const council = db
        .prepare("SELECT office_status, next_date_resolution, next_history_key FROM office WHERE office_id = ?")
        .get(OSLO_COUNCIL_ID);
      expect(council).toMatchObject({
        office_status: "current",
        next_date_resolution: "resolved",
        next_history_key: null,
      });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(OSLO_COUNTY_OFFICE_ID)).toBeUndefined();
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(OSLO_COUNCIL_ID),
      ).toMatchObject({ tier: "municipal" });
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(BOROUGH_EXAMPLE_ID),
      ).toMatchObject({ tier: "other" });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id LIKE 'NO-B%'")?.get()?.n)).toBe(0);
      const historical = db
        .prepare("SELECT office_status, record_state FROM office WHERE office_id = ?")
        .get(HISTORICAL_METADATA_ID);
      expect(historical).toMatchObject({ office_status: "historical", record_state: "active" });
      expect(
        db
          .prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?")
          .get(STORTING_ID),
      ).toMatchObject({ tier: "national_context" });
      expect(
        db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(SAMI_ID),
      ).toMatchObject({ tier: "other" });
      expect(
        db.prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?").get(SAMI_2025_HK),
      ).toMatchObject({ selected_history_role: "selected", legal_outcome: "unknown" });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE office_id = ?").get(LONGYEARBYEN_ID)?.n),
      ).toBe(0);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id LIKE '%-M'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("norway", sqlitePath);
    expect(calendar.count).toBe(32);
    expect(calendar.label).toContain("32 regional offices");
    expect(calendar.label).toMatch(/Oslo bystyre stays the municipal/);

    const second = importNorway({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "norway-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Norway into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-norway-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-norway-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const norway = importNorway({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-norway-test",
    });
    expect(norway.counts.current_offices).toBe(389);
    expect(norway.counts.historical_offices).toBe(537);
    expect(norway.counts.offices).toBe(926);
    expect(norway.counts.regional_offices).toBe(32);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(926);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-norway-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importNorway({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "norway-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "norway-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanNorwayInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(NorwayPreflightError);
  });
});
