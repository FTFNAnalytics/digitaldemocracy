import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BISKUPIJA_2017_HISTORY_KEY,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DEPUTY_EXAMPLE_ID,
  DRAFT_TIER_SHA256,
  DUGO_SELO_COUNCIL_ID,
  DUGO_SELO_EXECUTIVE_ID,
  EP_ID,
  FULL_PACK_DOCUMENTARY_FINGERPRINT,
  HISTORICAL_DEPUTY_ID,
  LINEAGE_ID,
  NAMED_HOLDS,
  PRESIDENT_ID,
  SABOR_ID,
  STARI_GRAD_THIRD_PROCEEDING_ID,
  TAR_VABRIGA_HISTORY_KEY,
  TIER_PATH,
  TIER_SHA256,
  ZAGREB_COUNCIL_ID,
  ZAGREB_EXECUTIVE_ID,
  ZAGREBACKA_COUNCIL_ID,
} from "../../lib/atlas/croatia/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importCroatia } from "../../lib/atlas/croatia/import";
import { CroatiaPreflightError, scanCroatiaInventory } from "../../lib/atlas/croatia/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Croatia Atlas importer", () => {
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

  it("scans the accepted Prompt W slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanCroatiaInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(1245);
    expect(inventory.events).toHaveLength(3834);
    expect(inventory.results).toHaveLength(15907);
    expect(inventory.proceedings).toHaveLength(2418);
    expect(inventory.geographies).toHaveLength(577);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(FULL_PACK_DOCUMENTARY_FINGERPRINT);
    expect(inventory.tiers.status).toBe("approved");
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("results.jsonl.gz"))).toBe(true);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("events.json.gz"))).toBe(true);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("/events.json"))).toBe(false);
    expect(inventory.researchGaps.map((row) => row.original_token).sort()).toEqual([...NAMED_HOLDS].sort());
  });

  it("imports 1234 current + 11 historical offices and keeps Zagreb one regional pair", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-croatia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importCroatia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "croatia-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(1234);
    expect(first.counts.historical_offices).toBe(11);
    expect(first.counts.offices).toBe(1245);
    expect(first.counts.municipal_offices).toBe(1187);
    expect(first.counts.regional_offices).toBe(55);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.executive_tickets).toBe(577);
    expect(first.counts.current_deputies).toBe(79);
    expect(first.counts.assemblies).toBe(576);
    expect(first.counts.total_events).toBe(3834);
    expect(first.counts.selected_histories).toBe(3833);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.placeholder_events).toBe(1);
    expect(first.counts.result_rows).toBe(15907);
    expect(first.counts.proceedings).toBe(2418);
    expect(first.counts.unresolved_evidence).toBe(13);
    expect(first.counts.needs_review_classifications).toBe(93);
    expect(first.counts.successor_edges).toBe(0);
    expect(first.counts.known_seats).toBe(0);
    expect(first.counts.tar_vabriga_results).toBe(0);
    expect(first.counts.biskupija_2017_deputy_events).toBe(0);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1245);
      expect(
        db.prepare("SELECT office_status, geography_id, next_date_id FROM office WHERE office_id = ?").get(ZAGREB_COUNCIL_ID),
      ).toMatchObject({
        office_status: "current",
        geography_id: "HR-Z21",
        next_date_id: null,
      });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(ZAGREB_COUNCIL_ID),
      ).toMatchObject({ tier: "regional", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(ZAGREB_EXECUTIVE_ID),
      ).toMatchObject({ tier: "regional", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(ZAGREBACKA_COUNCIL_ID),
      ).toMatchObject({ tier: "regional" });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = 'HR-G1333-C'").get()).toBeUndefined();
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = 'HR-G1333-E'").get()).toBeUndefined();
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(DUGO_SELO_COUNCIL_ID)).toMatchObject({
        office_type: "council",
      });
      expect(db.prepare("SELECT office_type FROM office WHERE office_id = ?").get(DUGO_SELO_EXECUTIVE_ID)).toMatchObject({
        office_type: "direct_executive",
      });
      expect(
        db.prepare("SELECT office_status, office_type FROM office WHERE office_id = ?").get(DEPUTY_EXAMPLE_ID),
      ).toMatchObject({ office_status: "current", office_type: "direct_deputy" });
      expect(
        db.prepare("SELECT office_status, next_date_id FROM office WHERE office_id = ?").get(HISTORICAL_DEPUTY_ID),
      ).toMatchObject({ office_status: "historical", next_date_id: null });
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(SABOR_ID)).toMatchObject({
        tier: "national_context",
      });
      expect(db.prepare("SELECT tier FROM office_tier_classification WHERE office_id = ?").get(PRESIDENT_ID)).toMatchObject({
        tier: "national_context",
      });
      expect(db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID)).toMatchObject({
        tier: "other",
        review_status: "needs_review",
      });
      expect(db.prepare("SELECT event_id FROM election_event WHERE history_key = ?").get(BISKUPIJA_2017_HISTORY_KEY)).toBeUndefined();
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE history_key = ?").get(TAR_VABRIGA_HISTORY_KEY)?.n),
      ).toBe(0);
      expect(
        db.prepare("SELECT kind, sequence_no, supersedes_id FROM proceeding WHERE proceeding_id = ?").get(STARI_GRAD_THIRD_PROCEEDING_ID),
      ).toMatchObject({ kind: "runoff", sequence_no: 3, supersedes_id: null });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND seats IS NOT NULL").get(LINEAGE_ID)?.n),
      ).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM party_mapping WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      for (const hold of NAMED_HOLDS) {
        expect(
          Number(
            db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE lineage_id = ? AND original_token = ?").get(LINEAGE_ID, hold)?.n,
          ),
        ).toBe(1);
      }
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("croatia", sqlitePath);
    expect(calendar.count).toBe(55);
    expect(calendar.label).toContain("55 regional offices");
    expect(calendar.label).toContain("ZAGREB-DUAL");
    expect(calendar.label).toContain("Zagrebačka");

    const second = importCroatia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "croatia-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Croatia into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-croatia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-croatia-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const croatia = importCroatia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-croatia-test",
    });
    expect(croatia.counts.offices).toBe(1245);
    expect(croatia.counts.regional_offices).toBe(55);
    expect(croatia.counts.result_rows).toBe(15907);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(122);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(1245);
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
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-croatia-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importCroatia({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "croatia-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "croatia-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8"));
    approved.status = "draft";
    approved.production_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanCroatiaInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(CroatiaPreflightError);
  });
});
