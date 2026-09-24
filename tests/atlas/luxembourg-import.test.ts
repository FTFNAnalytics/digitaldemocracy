import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsLuxembourg } from "../../lib/atlas/continuity/import";
import {
  BERDORF_EVENT_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_1994_EVENT_ID,
  EP_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PARLIAMENT_ID,
  RESOLVED_EXCLUSIONS,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/luxembourg/identity";
import { importLuxembourg } from "../../lib/atlas/luxembourg/import";
import { LuxembourgPreflightError, scanLuxembourgInventory } from "../../lib/atlas/luxembourg/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Luxembourg Atlas importer", () => {
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

  it("keeps Luxembourg out of the all scope", () => {
    expect(scopeImportsLuxembourg("luxembourg")).toBe(true);
    expect(scopeImportsLuxembourg("all")).toBe(false);
    expect(scopeImportsLuxembourg("latvia")).toBe(false);
    expect(scopeImportsLuxembourg("lithuania")).toBe(false);
    expect(scopeImportsLuxembourg("hungary")).toBe(false);
    expect(scopeImportsLuxembourg("romania")).toBe(false);
    expect(scopeImportsLuxembourg("greece")).toBe(false);
  });

  it("scans the Prompt AO slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanLuxembourgInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(130);
    expect(inventory.events).toHaveLength(438);
    expect(inventory.mergers).toHaveLength(28);
    expect(inventory.observations).toHaveLength(702);
    expect(inventory.countsFile.result_rows).toBe(48197);
    expect(inventory.gaps.map((gap) => gap.id)).toEqual([...RESOLVED_EXCLUSIONS, ...NAMED_HOLDS].map((hold) => hold.token));
    expect(inventory.gaps.find((gap) => gap.id === "LU-G01")?.status).toBe("resolved_exclusion");
    expect(inventory.gaps.find((gap) => gap.id === "LU-G02")?.status).toBe("resolved_exclusion");
    expect(inventory.gaps.find((gap) => gap.id === "LU-G09")?.status).toBe("resolved_with_capture_limit");
    expect(inventory.gaps.find((gap) => gap.id === "LU-G11")?.status).toBe("open");
    expect(inventory.byPath.has("data/research/luxembourg/results.json")).toBe(false);
    expect(inventory.byPath.has("data/research/luxembourg/sources")).toBe(false);
    expect(inventory.byPath.has("data/research/luxembourg/observations.json")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.tiers.classifications.every((row) => row.review_status === "needs_review")).toBe(true);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(10);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanLuxembourgInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(LuxembourgPreflightError);
  });

  it("imports 102 current and 28 historical offices with 0 result rows, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-luxembourg-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importLuxembourg({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "luxembourg-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(130);
    expect(first.counts.current_offices).toBe(102);
    expect(first.counts.historical_offices).toBe(28);
    expect(first.counts.total_events).toBe(438);
    expect(first.counts.selected_histories).toBe(438);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBe(48197);
    expect(first.counts.observation_envelopes).toBe(702);
    expect(first.counts.observation_nested_result_counts).not.toBe(48197);
    expect(first.counts.municipal_offices).toBe(128);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.national_offices).toBe(1);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.direct_executive_offices).toBe(0);
    expect(first.counts.current_communal_councils).toBe(100);
    expect(first.counts.historical_communal_councils).toBe(28);
    expect(first.counts.explicit_predecessor_edges).toBe(28);
    expect(first.counts.guessed_merger_edges).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(11);
    expect(first.counts.named_holds).toBe(9);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(130);
    expect(first.counts.geographies).toBe(129);
    expect(first.counts.year_only_events).toBe(8);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(130);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(438);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(28);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(28);
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(PARLIAMENT_ID)).toMatchObject({
        office_type: "parliament",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PARLIAMENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(
        db.prepare("SELECT precision FROM research_date d JOIN election_event e ON e.date_id = d.date_id WHERE e.event_id = ?").get(EP_1994_EVENT_ID),
      ).toMatchObject({ precision: "year" });
      expect(
        db.prepare("SELECT legal_outcome, json_extract(raw_json, '$.row.result_status') AS result_status FROM election_event WHERE event_id = ?").get(BERDORF_EVENT_ID),
      ).toMatchObject({ legal_outcome: "unknown", result_status: "official_proclamation" });
      const holds = db
        .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ? AND original_token LIKE 'LU-G%' ORDER BY original_token")
        .all(LINEAGE_ID)
        .map((row) => String(row.original_token));
      expect(holds).toEqual(["LU-G01", "LU-G02", "LU-G03", "LU-G04", "LU-G05", "LU-G06", "LU-G07", "LU-G08", "LU-G09", "LU-G10", "LU-G11"]);
      expect(db.prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE original_token = 'LU-G01'").get()).toMatchObject({
        status: "resolved_exclusion",
      });
      expect(db.prepare("SELECT json_extract(raw_json, '$.row.status') AS status FROM unresolved_evidence WHERE original_token = 'LU-G11'").get()).toMatchObject({
        status: "open",
      });
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (office_type LIKE '%mayor%' OR name LIKE '%Grand-Duc%')")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("luxembourg", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("LU-G03");

    const second = importLuxembourg({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "luxembourg-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.counts.result_rows).toBe(0);
  }, 120_000);
});
