import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsGeorgia, scopeImportsUruguay } from "../../lib/atlas/continuity/import";
import {
  ADJARA_SUPREME_COUNCIL_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_CHAIR_ID,
  HISTORICAL_PRESIDENT_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PARLIAMENT_ID,
  SAMPLE_HISTORICAL_COUNCIL_ID,
  SAMPLE_HOLD_COUNCIL_ID,
  TBILISI_COUNCIL_ID,
  TBILISI_MAYOR_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/georgia/identity";
import { importGeorgia } from "../../lib/atlas/georgia/import";
import { GeorgiaPreflightError, scanGeorgiaInventory } from "../../lib/atlas/georgia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Georgia Atlas importer", () => {
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

  it("keeps Georgia out of the all scope and leaves Uruguay scoped", () => {
    expect(scopeImportsGeorgia("georgia")).toBe(true);
    expect(scopeImportsGeorgia("all")).toBe(false);
    expect(scopeImportsGeorgia("uruguay")).toBe(false);
    expect(scopeImportsGeorgia("ukraine")).toBe(false);
    expect(scopeImportsUruguay("georgia")).toBe(false);
    expect(scopeImportsUruguay("all")).toBe(false);
  });

  it("scans the Prompt BG pack and pins the supplied tier bytes", () => {
    const inventory = scanGeorgiaInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(176);
    expect(inventory.offices).toHaveLength(176);
    expect(inventory.geographies).toHaveLength(92);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.parentsLeftNull).toBe(0);
    expect(inventory.upcomingCalendarRows).toBe(7);
    expect(inventory.unassignedObservations).toBe(2);
    expect(inventory.gaps).toHaveLength(21);
    expect(inventory.tiers.every((row) => row.status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(39);
    expect(String(inventory.intendedInventory.full_zip_sha256_documentary)).toBe(FULL_ZIP_SHA256);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
    expect(inventory.offices.filter((row) => row.office_status === "current")).toHaveLength(130);
    expect(inventory.offices.filter((row) => row.statutory_continuation)).toHaveLength(5);
    expect(inventory.offices.filter((row) => row.office_status === "historical_only")).toHaveLength(41);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanGeorgiaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(GeorgiaPreflightError);
  });

  it("imports 130 ordinary-cycle, 5 statutory-continuation, and 41 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-georgia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importGeorgia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "georgia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(176);
    expect(first.counts.current_offices).toBe(135);
    expect(first.counts.ordinary_cycle_offices).toBe(130);
    expect(first.counts.statutory_continuation_offices).toBe(5);
    expect(first.counts.historical_offices).toBe(41);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(3);
    expect(first.counts.draft_tier_regional).toBe(5);
    expect(first.counts.draft_tier_local).toBe(168);
    expect(first.counts.schema_national).toBe(3);
    expect(first.counts.schema_regional).toBe(5);
    expect(first.counts.schema_municipal).toBe(168);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.current_direct_executives).toBe(64);
    expect(first.counts.historical_direct_executives).toBe(17);
    expect(first.counts.current_mayors).toBe(64);
    expect(first.counts.current_municipal_councils).toBe(69);
    expect(first.counts.parliament_offices).toBe(1);
    expect(first.counts.adjara_supreme_council_offices).toBe(1);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.parallel_institution_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(21);
    expect(first.counts.named_open_holds).toBe(21);
    expect(first.counts.closed_gaps).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(176);
    expect(first.counts.geographies).toBe(92);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.applied_calendar_rows).toBe(0);
    expect(first.counts.upcoming_calendar_rows).toBe(7);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(176);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(135);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(41);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PARLIAMENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(ADJARA_SUPREME_COUNCIL_ID)).toMatchObject({
        office_status: "current",
        office_type: "adjara_supreme_council",
      });
      expect(db.prepare("SELECT office_status, office_type, geography_id FROM office WHERE office_id = ?").get(TBILISI_MAYOR_ID)).toMatchObject({
        office_status: "current",
        office_type: "municipal_mayor",
        geography_id: "GE-M-001",
      });
      expect(db.prepare("SELECT geography_id FROM office WHERE office_id = ?").get(TBILISI_COUNCIL_ID)).toMatchObject({
        geography_id: "GE-M-001",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(SAMPLE_HOLD_COUNCIL_ID)).toMatchObject({
        office_status: "current",
        office_type: "statutory_continuation_council",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_PRESIDENT_ID)).toMatchObject({
        office_status: "historical",
        office_type: "popular_president",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_CHAIR_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_popular_head_of_state",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(SAMPLE_HISTORICAL_COUNCIL_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_municipal_council",
      });
      expect(db.prepare("SELECT country_code, name FROM country WHERE country_id = 'georgia'").get()).toMatchObject({
        country_code: "GE",
        name: "Georgia",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(21);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("georgia", sqlitePath);
    expect(calendar.count).toBe(5);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toBe("5 regional-tier offices.");
    expect(calendar.label).not.toMatch(/2028|2029|prominently|GE-BG-UP/);

    const second = importGeorgia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "georgia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.offices).toBe(176);
    expect(second.counts.ordinary_cycle_offices).toBe(130);
    expect(second.counts.statutory_continuation_offices).toBe(5);
    expect(second.counts.historical_offices).toBe(41);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
    expect(second.counts.applied_calendar_rows).toBe(0);
  });
});
