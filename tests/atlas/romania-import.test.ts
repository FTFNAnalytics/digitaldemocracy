import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsRomania } from "../../lib/atlas/continuity/import";
import {
  ANNULLED_EVENT_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  EP_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_2025_WINNER_RESULT_ID,
  PRESIDENT_ID,
  TIER_PATH,
  TIER_SHA256,
  ZERO_SEAT_RESULT_ID,
} from "../../lib/atlas/romania/identity";
import { importRomania } from "../../lib/atlas/romania/import";
import { RomaniaPreflightError, scanRomaniaInventory } from "../../lib/atlas/romania/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Romania Atlas importer", () => {
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

  it("keeps Romania out of the all scope", () => {
    expect(scopeImportsRomania("romania")).toBe(true);
    expect(scopeImportsRomania("all")).toBe(false);
    expect(scopeImportsRomania("latvia")).toBe(false);
    expect(scopeImportsRomania("lithuania")).toBe(false);
  });

  it("scans the Prompt AL slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanRomaniaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(6460);
    expect(inventory.events).toHaveLength(19343);
    expect(inventory.results).toHaveLength(23);
    expect(inventory.geographies).toHaveLength(3229);
    expect(inventory.sourceCatalogue).toHaveLength(6);
    expect(inventory.gaps.map((gap) => gap.id)).toEqual(NAMED_HOLDS.map((hold) => hold.token));
    expect(inventory.gaps.every((gap) => gap.status === "open")).toBe(true);
    expect(inventory.byPath.has("data/research/romania/events.json")).toBe(false);
    expect(inventory.byPath.has("data/research/romania/events.json.gz")).toBe(true);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.tracked).toHaveLength(9);
  });

  it("rejects a tier file that is not the accepted bytes", () => {
    expect(() =>
      scanRomaniaInventory({
        root: repoRoot,
        tierPath: path.join(repoRoot, "package.json"),
        requireGitTrackedPackage: false,
      }),
    ).toThrow(RomaniaPreflightError);
  });

  it("imports 6460 current offices, 19343 events, and 23 results, then reuses the release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-romania-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importRomania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "romania-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.offices).toBe(6460);
    expect(first.counts.current_offices).toBe(6460);
    expect(first.counts.historical_offices).toBe(0);
    expect(first.counts.total_events).toBe(19343);
    expect(first.counts.selected_histories).toBe(19343);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(23);
    expect(first.counts.municipal_offices).toBe(6372);
    expect(first.counts.regional_offices).toBe(84);
    expect(first.counts.national_offices).toBe(3);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.direct_executive_offices).toBe(3229);
    expect(first.counts.council_assembly_offices).toBe(3230);
    expect(first.counts.sources).toBe(6);
    expect(first.counts.unresolved_evidence).toBe(7);
    expect(first.counts.proceedings).toBe(0);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.needs_review_classifications).toBe(6460);
    expect(first.counts.geographies).toBe(3229);
    expect(first.counts.successor_edges).toBe(0);
    expect(first.counts.explicit_zero_seat_rows).toBe(1);
    expect(first.counts.annulled_events).toBe(1);
    expect(first.counts.county_president_2016_events).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(6460);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(19343);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(23);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT office_type, next_date_id FROM office WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        office_type: "president",
        next_date_id: null,
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT legal_outcome, history_key FROM election_event WHERE event_id = ?").get(ANNULLED_EVENT_ID)).toMatchObject({
        legal_outcome: "annulled",
        history_key: ANNULLED_EVENT_ID,
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(db.prepare("SELECT seats, seats_status, votes FROM result_row WHERE result_row_id = ?").get(ZERO_SEAT_RESULT_ID)).toMatchObject({
        seats: 0,
        seats_status: "zero",
        votes: null,
      });
      const winner = db.prepare("SELECT votes, share, votes_status, share_status FROM result_row WHERE result_row_id = ?").get(PRESIDENT_2025_WINNER_RESULT_ID);
      expect(winner).toMatchObject({ votes: 6168642, share: null, votes_status: "recorded", share_status: "unknown" });
      expect(
        Number(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id NOT IN ('RO-SEN','RO-CD','RO-EP','RO-PRES')",
            )
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      const holds = db
        .prepare("SELECT original_token FROM unresolved_evidence WHERE lineage_id = ? ORDER BY original_token")
        .all(LINEAGE_ID)
        .map((row) => String(row.original_token));
      expect(holds).toEqual(["RO-G01", "RO-G02", "RO-G03", "RO-G04", "RO-G05", "RO-G06", "RO-G07"]);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("romania", sqlitePath);
    expect(calendar.count).toBe(84);
    expect(calendar.denominatorKnown).toBe(false);
    expect(calendar.label).toContain("RO-G01");

    const second = importRomania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "romania-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);
});
