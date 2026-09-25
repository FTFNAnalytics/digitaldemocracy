import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsMontenegro, scopeImportsNorthMacedonia } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CLOSED_GAP_IDS,
  GAP_STATUS,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/north-macedonia/identity";
import { importNorthMacedonia } from "../../lib/atlas/north-macedonia/import";
import { NorthMacedoniaPreflightError, scanNorthMacedoniaInventory } from "../../lib/atlas/north-macedonia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("North Macedonia Atlas importer", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("keeps North Macedonia out of the all scope", () => {
    expect(scopeImportsNorthMacedonia("north_macedonia")).toBe(true);
    expect(scopeImportsNorthMacedonia("all")).toBe(false);
    expect(scopeImportsNorthMacedonia("montenegro")).toBe(false);
    expect(scopeImportsMontenegro("north_macedonia")).toBe(false);
  });

  it("scans the Prompt AZ pack and pins the supplied tier bytes", () => {
    const inventory = scanNorthMacedoniaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(172);
    expect(inventory.geographies).toHaveLength(86);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.gaps).toHaveLength(23);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(33);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanNorthMacedoniaInventory({ root: repoRoot, tierPath: path.join(repoRoot, "package.json"), requireGitTrackedPackage: false }),
    ).toThrow(NorthMacedoniaPreflightError);
  });

  it("imports 164 current and 8 historical offices with 0 events, 0 results, and 0 sources", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-north-macedonia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importNorthMacedonia({ root: repoRoot, sqlitePath, attemptsPath, operator: "north-macedonia-test" });
    expect(first.reusedRelease).toBe(false);
    expect(first.counts.offices).toBe(172);
    expect(first.counts.current_offices).toBe(164);
    expect(first.counts.historical_offices).toBe(8);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.schema_regional).toBe(0);
    expect(first.counts.named_open_holds).toBe(16);
    expect(first.counts.closed_gaps).toBe(7);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.current_direct_executives).toBe(82);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);

    const second = importNorthMacedonia({ root: repoRoot, sqlitePath, attemptsPath, operator: "north-macedonia-test" });
    expect(second.reusedRelease).toBe(true);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      const parliament = db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PARLIAMENT_ID) as {
        office_status: string;
        office_type: string;
      };
      expect(parliament).toMatchObject({ office_status: "current", office_type: "national_legislature" });
      const president = db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(PRESIDENT_ID) as { office_status: string };
      expect(president.office_status).toBe("current");
      expect(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(db.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({ research_coverage_complete: 0 });
      for (const token of OPEN_HOLD_IDS) {
        const row = db
          .prepare("SELECT json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE original_token = ?")
          .get(token) as { closed: number };
        expect(row.closed, token).toBe(0);
        expect(GAP_STATUS[token]).toBeTruthy();
      }
      for (const token of CLOSED_GAP_IDS) {
        const row = db
          .prepare("SELECT json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE original_token = ?")
          .get(token) as { closed: number };
        expect(row.closed, token).toBe(1);
      }
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("north-macedonia", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.label).toContain("MK-AZ-G01");
    expect(calendar.label).toContain("not projected");
    expect(calendar.denominatorKnown).toBe(false);
  });
});
