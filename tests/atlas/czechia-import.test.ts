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
  EP_ID,
  FULL_PACK_DOCUMENTARY_FINGERPRINT,
  HISTORICAL_EXAMPLE_ID,
  LINEAGE_ID,
  PRAGUE_ASSEMBLY_ID,
  PRESIDENT_ID,
  PROSPECTIVE_EXAMPLE_HISTORY_KEY,
  REGIONAL_2008_HISTORY_KEY,
  REGIONAL_EXAMPLE_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/czechia/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importCzechia } from "../../lib/atlas/czechia/import";
import { CzechiaPreflightError, scanCzechiaInventory } from "../../lib/atlas/czechia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Czechia Atlas importer", () => {
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

  it("scans the accepted Prompt V slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanCzechiaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(6424);
    expect(inventory.events).toHaveLength(46236);
    expect(inventory.proceedings).toHaveLength(934);
    expect(inventory.geographies).toHaveLength(6421);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(FULL_PACK_DOCUMENTARY_FINGERPRINT);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("results.jsonl.gz"))).toBe(false);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("events.json.gz"))).toBe(true);
  });

  it("imports 6411 current + 13 historical offices and keeps Prague one regional body", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-czechia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importCzechia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "czechia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(6411);
    expect(first.counts.historical_offices).toBe(13);
    expect(first.counts.offices).toBe(6424);
    expect(first.counts.municipal_offices).toBe(6257);
    expect(first.counts.regional_offices).toBe(14);
    expect(first.counts.national_offices).toBe(3);
    expect(first.counts.other_offices).toBe(150);
    expect(first.counts.borough_councils).toBe(149);
    expect(first.counts.prague_assemblies).toBe(1);
    expect(first.counts.direct_national_executives).toBe(1);
    expect(first.counts.direct_local_executives).toBe(0);
    expect(first.counts.total_events).toBe(46236);
    expect(first.counts.prospective_events).toBe(6421);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.proceedings).toBe(934);
    expect(first.counts.unresolved_evidence).toBe(10);
    expect(first.counts.needs_review_classifications).toBe(155);
    expect(first.counts.successor_edges).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(6424);
      expect(
        db.prepare("SELECT office_status, geography_id, next_history_key FROM office WHERE office_id = ?").get(PRAGUE_ASSEMBLY_ID),
      ).toMatchObject({
        office_status: "current",
        geography_id: "CZ-M554782",
        next_history_key: "CZ-M554782-C::kv:20261009",
      });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRAGUE_ASSEMBLY_ID),
      ).toMatchObject({ tier: "regional", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(BOROUGH_EXAMPLE_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(REGIONAL_EXAMPLE_ID),
      ).toMatchObject({ tier: "regional", review_status: "approved" });
      expect(
        db.prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?").get(HISTORICAL_EXAMPLE_ID),
      ).toMatchObject({ office_status: "historical", next_date_id: null });
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      const yearEvent = db
        .prepare(
          "SELECT d.precision, d.year, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?",
        )
        .get(REGIONAL_2008_HISTORY_KEY);
      expect(yearEvent).toMatchObject({ precision: "year", year: 2008, month: null, day: null });
      const prospective = db
        .prepare("SELECT selected_history_role, legal_outcome FROM election_event WHERE history_key = ?")
        .get(PROSPECTIVE_EXAMPLE_HISTORY_KEY);
      expect(prospective).toMatchObject({ selected_history_role: "none", legal_outcome: "unknown" });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type = 'capital_regional_municipal_assembly'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(1);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("czechia", sqlitePath);
    expect(calendar.count).toBe(14);
    expect(calendar.label).toContain("13 kraj assemblies");
    expect(calendar.label).toContain("PRAGUE-DUAL-STATUS");
    expect(calendar.label).toContain("none are invented");

    const second = importCzechia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "czechia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Czechia into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-czechia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-czechia-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const czechia = importCzechia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-czechia-test",
    });
    expect(czechia.counts.offices).toBe(6424);
    expect(czechia.counts.prague_assemblies).toBe(1);
    expect(czechia.counts.result_rows).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(122);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(6424);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-czechia-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importCzechia({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "czechia-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "czechia-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanCzechiaInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(CzechiaPreflightError);
  });
});
