import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import {
  AKMENE_COUNCIL_ID,
  AKMENE_MAYOR_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DOCUMENTARY_DRAFT_FINGERPRINT,
  EP_ID,
  LINEAGE_ID,
  MALFORMED_INVALID_TOKEN,
  NAMED_HOLDS,
  PRESIDENT_2019_HK,
  PRESIDENT_DISPUTED_RESULT_ID,
  PRESIDENT_ID,
  SEIMAS_2016_HK,
  SEIMAS_ID,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/lithuania/identity";
import { importLithuania } from "../../lib/atlas/lithuania/import";
import { LithuaniaPreflightError, scanLithuaniaInventory } from "../../lib/atlas/lithuania/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Lithuania Atlas importer", () => {
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

  it("scans the Prompt AH slim pack and pins the draft-tier fingerprint", () => {
    const inventory = scanLithuaniaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(123);
    expect(inventory.events).toHaveLength(30);
    expect(inventory.results).toHaveLength(130);
    expect(inventory.geographies).toHaveLength(61);
    expect(inventory.proceedings).toHaveLength(25);
    expect(inventory.sourceCatalogue).toHaveLength(53);
    expect(inventory.byPath.has("data/research/lithuania/sources/validate.py")).toBe(false);
    expect([...inventory.byPath.keys()].some((item) => item.startsWith("data/research/lithuania/sources/"))).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(DOCUMENTARY_DRAFT_FINGERPRINT);
    expect(inventory.tiers.status).toBe("draft_for_human_review");
    expect(inventory.tiers.approval?.production_accepted).toBe(false);
    expect(inventory.byPath.get(TIER_PATH)?.sha256).toBe(TIER_SHA256);
    expect(inventory.counts.historical_office_universe_complete).toBe(false);
    expect(inventory.counts.research_coverage_complete).toBe(false);
    expect(inventory.crosswalks).toHaveLength(120);
    expect(inventory.crosswalks.every((row) => row.reason.includes("not legal successor"))).toBe(true);
  });

  it("imports 123 current offices and reuses the same release", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-lithuania-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importLithuania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "lithuania-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(123);
    expect(first.counts.historical_offices).toBe(0);
    expect(first.counts.offices).toBe(123);
    expect(first.counts.municipal_offices).toBe(120);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.total_events).toBe(30);
    expect(first.counts.selected_histories).toBe(30);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(130);
    expect(first.counts.proceedings).toBe(25);
    expect(first.counts.sources).toBe(53);
    expect(first.counts.unresolved_evidence).toBe(21);
    expect(first.counts.current_councils).toBe(60);
    expect(first.counts.current_direct_executive_offices).toBe(61);
    expect(first.counts.mayor_offices).toBe(60);
    expect(first.counts.needs_review_classifications).toBe(123);
    expect(first.counts.approved_classifications).toBe(0);
    expect(first.counts.disputed_shares).toBe(11);
    expect(first.counts.council_result_rows).toBe(0);
    expect(first.counts.mayor_result_rows).toBe(19);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(123);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'").get(LINEAGE_ID)?.n),
      ).toBe(0);
      const council = db.prepare("SELECT office_type, geography_id, next_date_id FROM office WHERE office_id = ?").get(AKMENE_COUNCIL_ID);
      const mayor = db.prepare("SELECT office_type, geography_id, next_date_id FROM office WHERE office_id = ?").get(AKMENE_MAYOR_ID);
      expect(council).toMatchObject({
        office_type: "municipal_council",
        geography_id: "LT-lsa-61244a98ecf1b6948da37f0c",
        next_date_id: null,
      });
      expect(mayor).toMatchObject({
        office_type: "direct_mayor",
        geography_id: "LT-lsa-61244a98ecf1b6948da37f0c",
        next_date_id: null,
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(SEIMAS_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      const yearDate = db
        .prepare("SELECT d.precision, d.month, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = 'LT-EP::EP2004'")
        .get();
      expect(yearDate).toMatchObject({ precision: "year", month: null, day: null });
      const monthDate = db
        .prepare("SELECT d.precision, d.label, d.day FROM election_event e JOIN research_date d ON d.date_id = e.date_id WHERE e.history_key = ?")
        .get(SEIMAS_2016_HK);
      expect(monthDate).toMatchObject({ precision: "month", label: "2016-10", day: null });
      const president = db.prepare("SELECT event_kind, electoral_system, ballot_basis FROM election_event WHERE history_key = ?").get(PRESIDENT_2019_HK);
      expect(president).toMatchObject({
        event_kind: "ordinary",
        electoral_system: "direct_popular_two_round",
        ballot_basis: "unknown",
      });
      expect(db.prepare("SELECT kind, supersedes_id FROM proceeding WHERE proceeding_id = 'proceeding-c14a7c59881496c1c079089c'").get()).toMatchObject({
        kind: "runoff",
        supersedes_id: null,
      });
      expect(db.prepare("SELECT votes, share, share_status FROM result_row WHERE result_row_id = ?").get(PRESIDENT_DISPUTED_RESULT_ID)).toMatchObject({
        votes: 446719,
        share: 31.31,
        share_status: "disputed",
      });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM party_mapping WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'").get(LINEAGE_ID)?.n)).toBe(0);
      for (const hold of NAMED_HOLDS) {
        expect(
          Number(db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?").get(LINEAGE_ID, hold.token)?.n),
        ).toBe(1);
      }
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?").get(LINEAGE_ID, MALFORMED_INVALID_TOKEN)?.n),
      ).toBe(1);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("lithuania", sqlitePath);
    expect(calendar.count).toBe(0);
    expect(calendar.label).toContain("0 regional offices");
    expect(calendar.label).toMatch(/LT-HISTORY/);

    const second = importLithuania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "lithuania-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 120_000);

  it("imports Albania then Lithuania into one master without dropping Albania", async () => {
    await new Promise((resolve) => setImmediate(resolve));
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-lithuania-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-lithuania-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const lithuania = importLithuania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-lithuania-test",
    });
    expect(lithuania.counts.current_offices).toBe(123);
    expect(lithuania.counts.historical_offices).toBe(0);
    expect(lithuania.counts.result_rows).toBe(130);
    expect(lithuania.counts.regional_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(123);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, LINEAGE_ID].sort());
    } finally {
      db.close();
    }
  }, 120_000);

  it("rejects OBSERVATORY_FIXTURES=1 and a rewritten approved tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-lithuania-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importLithuania({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "lithuania-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "lithuania-approved.json");
    const draft = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as {
      status: string;
      approval: { Justin_accepted: boolean; production_accepted: boolean };
    };
    draft.status = "approved";
    draft.approval.production_accepted = true;
    draft.approval.Justin_accepted = true;
    writeFileSync(draftPath, JSON.stringify(draft));
    expect(() =>
      scanLithuaniaInventory({
        root: repoRoot,
        tierPath: draftPath,
      }),
    ).toThrow(LithuaniaPreflightError);
  });
});
