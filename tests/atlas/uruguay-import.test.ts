import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsUkraine, scopeImportsUruguay } from "../../lib/atlas/continuity/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DOCUMENTED_NOT_IMPLEMENTED_ID,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_CNA_ID,
  LINEAGE_ID,
  OPEN_HOLD_IDS,
  PRESIDENT_ID,
  SAMPLE_ALCALDE_ID,
  SAMPLE_HISTORICAL_LOCAL_ID,
  SAMPLE_MUNICIPAL_COUNCIL_ID,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
  VICE_PRESIDENT_ID,
} from "../../lib/atlas/uruguay/identity";
import { importUruguay } from "../../lib/atlas/uruguay/import";
import { UruguayPreflightError, scanUruguayInventory } from "../../lib/atlas/uruguay/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Uruguay Atlas importer", () => {
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

  it("keeps Uruguay out of the all scope and leaves Ukraine scoped", () => {
    expect(scopeImportsUruguay("uruguay")).toBe(true);
    expect(scopeImportsUruguay("all")).toBe(false);
    expect(scopeImportsUruguay("ukraine")).toBe(false);
    expect(scopeImportsUruguay("latam")).toBe(false);
    expect(scopeImportsUkraine("uruguay")).toBe(false);
    expect(scopeImportsUkraine("all")).toBe(false);
  });

  it("scans the Prompt BF pack and pins the supplied tier bytes", () => {
    const inventory = scanUruguayInventory({ root: repoRoot });
    expect(inventory.tiers).toHaveLength(338);
    expect(inventory.offices).toHaveLength(338);
    expect(inventory.geographies).toHaveLength(159);
    expect(inventory.successorEdges).toBe(0);
    expect(inventory.parentsLeftNull).toBe(0);
    expect(inventory.upcomingCalendarRows).toBe(8);
    expect(inventory.deferredCalendarHoldRows).toBe(19);
    expect(inventory.gaps).toHaveLength(22);
    expect(inventory.tiers.every((row) => row.status === "draft_unapproved" && row.justin_approved === false)).toBe(true);
    expect(inventory.metadata.research_coverage_complete).toBe(false);
    expect(inventory.metadata.applied_changes).toBe(0);
    expect(inventory.metadata.justin_approved).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(34);
    expect(String(inventory.intendedInventory.full_zip_sha256_documentary)).toBe(FULL_ZIP_SHA256);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_result_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_event_rows_omitted")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(inventory.intendedInventory, "documented_sources_omitted")).toBe(false);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanUruguayInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(UruguayPreflightError);
  });

  it("imports 314 current and 24 historical offices with 0 events, 0 results, and 0 sources, then reuses the release", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-uruguay-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importUruguay({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "uruguay-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(338);
    expect(first.counts.current_offices).toBe(314);
    expect(first.counts.historical_offices).toBe(24);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.selected_histories).toBe(0);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBeUndefined();
    expect(first.counts.documented_event_rows_omitted).toBeUndefined();
    expect(first.counts.documented_sources_omitted).toBeUndefined();
    expect(first.counts.draft_tier_national).toBe(6);
    expect(first.counts.draft_tier_regional).toBe(57);
    expect(first.counts.draft_tier_local).toBe(275);
    expect(first.counts.schema_national).toBe(6);
    expect(first.counts.schema_regional).toBe(57);
    expect(first.counts.schema_municipal).toBe(275);
    expect(first.counts.schema_other).toBe(0);
    expect(first.counts.current_popular_executive_roles).toBe(157);
    expect(first.counts.current_list_selected_alcaldes).toBe(136);
    expect(first.counts.current_councils).toBe(155);
    expect(first.counts.current_national_chambers).toBe(2);
    expect(first.counts.current_intendentes).toBe(19);
    expect(first.counts.separate_executive_ballot_offices).toBe(20);
    expect(first.counts.ep_offices).toBe(0);
    expect(first.counts.mercosur_offices).toBe(0);
    expect(first.counts.explicit_predecessor_edges).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(15);
    expect(first.counts.named_open_holds).toBe(14);
    expect(first.counts.documented_not_implemented_holds).toBe(1);
    expect(first.counts.closed_gaps).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(338);
    expect(first.counts.geographies).toBe(159);
    expect(first.counts.research_dates).toBe(0);
    expect(first.counts.applied_calendar_rows).toBe(0);
    expect(first.counts.upcoming_calendar_family_rows).toBe(8);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(338);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'current'").get(LINEAGE_ID)?.n)).toBe(314);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(24);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SENATE_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_status: "current",
        office_type: "president",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(VICE_PRESIDENT_ID)).toMatchObject({
        office_type: "vice_president",
      });
      expect(
        db.prepare("SELECT json_extract(raw_json, '$.supplemental.separate_executive_ballot') AS separate_ballot FROM office WHERE office_id = ?").get(
          VICE_PRESIDENT_ID,
        ),
      ).toMatchObject({ separate_ballot: 0 });
      expect(db.prepare("SELECT next_date_id, next_date_resolution FROM office WHERE office_id = ?").get(SAMPLE_MUNICIPAL_COUNCIL_ID)).toMatchObject({
        next_date_id: null,
        next_date_resolution: "unknown",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(SAMPLE_ALCALDE_ID)).toMatchObject({
        office_status: "current",
        office_type: "alcalde",
      });
      expect(
        db.prepare(
          "SELECT json_extract(raw_json, '$.row.selection_mode') AS selection_mode, json_extract(raw_json, '$.supplemental.separate_ballot_contest_invented') AS invented FROM office WHERE office_id = ?",
        ).get(SAMPLE_ALCALDE_ID),
      ).toMatchObject({
        selection_mode: "popular_list_result_first_titular",
        invented: 0,
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(HISTORICAL_CNA_ID)).toMatchObject({
        office_status: "historical",
        office_type: "national_collective_executive",
      });
      expect(db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(SAMPLE_HISTORICAL_LOCAL_ID)).toMatchObject({
        office_status: "historical",
        office_type: "historical_local_council",
      });
      const holds = db
        .prepare(
          "SELECT original_token, json_extract(raw_json, '$.row.status') AS status, json_extract(raw_json, '$.row.closed') AS closed FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token",
        )
        .all(LINEAGE_ID) as Array<{ original_token: string; status: string; closed: number }>;
      expect(holds).toHaveLength(15);
      for (const token of OPEN_HOLD_IDS) {
        const hold = holds.find((row) => row.original_token === token);
        expect(hold?.status).toBe(GAP_STATUS[token]);
        expect(Number(hold?.closed)).toBe(0);
      }
      const calendarHold = holds.find((row) => row.original_token === DOCUMENTED_NOT_IMPLEMENTED_ID);
      expect(calendarHold?.status).toBe("resolved_documentation_only");
      expect(Number(calendarHold?.closed)).toBe(0);
      expect(Number(db.prepare("SELECT research_coverage_complete FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)?.research_coverage_complete)).toBe(0);
      expect(
        Number(
          db
            .prepare(
              "SELECT json_extract(raw_json, '$.row.justin_approved') AS approved FROM office_tier_classification WHERE json_extract(raw_json, '$.row.justin_approved') != 0",
            )
            .get()?.approved ?? 0,
        ),
      ).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("uruguay", sqlitePath);
    expect(calendar.count).toBe(57);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toBe("57 regional-tier offices.");
    expect(calendar.label).not.toMatch(/2029|2030|prominently|UY-NEXT/);

    const second = importUruguay({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "uruguay-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
    expect(second.counts.current_offices).toBe(314);
    expect(second.counts.historical_offices).toBe(24);
    expect(second.counts.explicit_predecessor_edges).toBe(0);
    expect(second.counts.applied_calendar_rows).toBe(0);
  });
});
