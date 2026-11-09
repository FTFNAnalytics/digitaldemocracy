import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { scopeImportsChile, scopeImportsPeru } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CURRENT_NAMESPACE,
  HISTORICAL_CONGRESS_ID,
  OPEN_HOLD_IDS,
  PHASE2_TIER_SHA256,
  PRESIDENT_ID,
  SANGANI_COUNCIL_ID,
  SANGANI_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/peru/identity";
import { importPeru } from "../../lib/atlas/peru/import";
import { PeruPreflightError, scanPeruInventory } from "../../lib/atlas/peru/inventory";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { rebuildDerivedCountryInFile } from "../../lib/atlas/derive/run";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Peru Atlas importer", () => {
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

  it("keeps Peru out of the all scope", () => {
    expect(scopeImportsPeru("peru")).toBe(true);
    expect(scopeImportsPeru("all")).toBe(false);
    expect(scopeImportsPeru("chile")).toBe(false);
    expect(scopeImportsPeru("latam")).toBe(false);
    expect(scopeImportsChile("peru")).toBe(false);
  });

  it("scans the Prompt BK pack and keeps the Phase 2 classifier aside", () => {
    const inventory = scanPeruInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(3841);
    expect(inventory.offices).toHaveLength(3841);
    expect(inventory.geographies).toHaveLength(1919);
    expect(inventory.municipalities).toBe(1893);
    expect(inventory.regions).toBe(25);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.upcomingCalendarRows).toBe(18);
    expect(inventory.gaps.map((gap) => gap.gap_id)).toEqual([...OPEN_HOLD_IDS]);
    expect(inventory.tiers.every((row) => row.review_status === "needs_review" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(40);
    expect(inventory.intendedInventory.phase2_tier_sha256).toBe(PHASE2_TIER_SHA256);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(inventory.offices.filter((row) => row.disposition === "hold").map((row) => row.office_id).sort()).toEqual([
      SANGANI_COUNCIL_ID,
      SANGANI_MAYOR_ID,
    ]);
  });

  it("rejects a tier file that is not the BK bytes", () => {
    expect(() =>
      scanPeruInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(PeruPreflightError);
  });

  it("imports 3840 current and 1 historical office with 0 events and 0 results, then derives the country", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-peru-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importPeru({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "peru-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.counts.offices).toBe(3841);
    expect(first.counts.current_offices).toBe(3840);
    expect(first.counts.historical_offices).toBe(1);
    expect(first.counts.current_research_accepted).toBe(3838);
    expect(first.counts.current_held).toBe(2);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.applied_calendar_rows).toBe(0);
    expect(first.counts.upcoming_calendar_rows).toBe(18);
    expect(first.counts.draft_tier_national_context).toBe(5);
    expect(first.counts.draft_tier_regional).toBe(50);
    expect(first.counts.draft_tier_municipal).toBe(3786);
    expect(first.counts.needs_review_classifications).toBe(3841);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.andean_offices).toBe(1);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.mercosur_offices).toBe(0);
    expect(first.counts.centros_poblados_offices).toBe(0);
    expect(first.counts.current_direct_executives).toBe(1919);
    expect(first.counts.accepted_direct_executives).toBe(1918);
    expect(first.counts.named_open_holds).toBe(18);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();

    const derived = rebuildDerivedCountryInFile(sqlitePath, "peru");
    expect(derived.officeSlugs).toBe(3841);
    expect(derived.jurisdictions).toBeGreaterThan(0);

    const master = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT office_status FROM office WHERE office_id = ?").get(HISTORICAL_CONGRESS_ID)).toMatchObject({
        office_status: "historical",
      });
      expect(master.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(
        master.prepare("SELECT COUNT(*) AS n FROM derived_office_slug WHERE id_namespace = ?").get(CURRENT_NAMESPACE),
      ).toMatchObject({ n: 3841 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
    } finally {
      master.close();
    }

    const second = importPeru({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "peru-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.counts.offices).toBe(3841);
  });
});
