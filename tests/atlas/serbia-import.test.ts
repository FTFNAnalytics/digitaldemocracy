import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsMontenegro, scopeImportsSerbia } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  GAP_STATUS,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  STATUS_CHANGE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  VOJVODINA_ID,
} from "../../lib/atlas/serbia/identity";
import { importSerbia } from "../../lib/atlas/serbia/import";
import { SerbiaPreflightError, scanSerbiaInventory } from "../../lib/atlas/serbia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Serbia Atlas importer", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("keeps Serbia out of the all scope", () => {
    expect(scopeImportsSerbia("serbia")).toBe(true);
    expect(scopeImportsSerbia("all")).toBe(false);
    expect(scopeImportsSerbia("montenegro")).toBe(false);
    expect(scopeImportsMontenegro("serbia")).toBe(false);
  });

  it("scans the Prompt AX pack and pins the supplied tier bytes", () => {
    const inventory = scanSerbiaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(178);
    expect(inventory.geographies).toHaveLength(178);
    expect(inventory.statusChanges).toHaveLength(5);
    expect(inventory.statusChanges.every((row) => row.boundary_change_claim === false)).toBe(true);
    expect(inventory.gaps).toHaveLength(11);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(59);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanSerbiaInventory({ root: repoRoot, tierPath: path.join(repoRoot, "package.json"), requireGitTrackedPackage: false }),
    ).toThrow(SerbiaPreflightError);
  });

  it("imports 173 current and 5 historical offices with 0 events, 0 results, and 0 sources", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-serbia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importSerbia({ root: repoRoot, sqlitePath, attemptsPath, operator: "serbia-test" });
    expect(first.reusedRelease).toBe(false);
    expect(first.counts.offices).toBe(178);
    expect(first.counts.current_offices).toBe(173);
    expect(first.counts.historical_offices).toBe(5);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.draft_tier_national).toBe(2);
    expect(first.counts.draft_tier_regional).toBe(1);
    expect(first.counts.draft_tier_municipal).toBe(175);
    expect(first.counts.schema_regional).toBe(1);
    expect(first.counts.kosovo_scope_offices).toBe(0);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(5);
    expect(first.counts.direct_executive_offices).toBe(1);
    expect(first.counts.direct_local_executive_offices).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(178);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.named_open_holds).toBe(11);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ? AND upstream_namespace = ?").get(LINEAGE_ID, STATUS_CHANGE_NAMESPACE)?.n)).toBe(5);
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "president",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(VOJVODINA_ID)).toMatchObject({
        tier: "regional",
        review_status: "needs_review",
      });
      const holds = db
        .prepare("SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ?")
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(11);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("serbia", sqlitePath);
    expect(calendar.count).toBe(1);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("Vojvodina");
    expect(calendar.label).toContain("RS-AX-G01");

    const second = importSerbia({ root: repoRoot, sqlitePath, attemptsPath, operator: "serbia-test" });
    expect(second.reusedRelease).toBe(true);
    expect(second.counts.explicit_predecessor_edges).toBe(5);
    expect(second.counts.result_rows).toBe(0);
  });
});
