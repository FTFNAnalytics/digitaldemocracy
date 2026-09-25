import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { scopeImportsHungary } from "../../lib/atlas/continuity/import";
import {
  BUDAPEST_ASSEMBLY_ID,
  BUDAPEST_MAYOR_ID,
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DOCUMENTARY_DRAFT_FINGERPRINT,
  DRAFT_TIER_SHA256,
  EP_ID,
  LINEAGE_ID,
  PARLIAMENT_ID,
  PRESIDENT_ID,
  RETURN_GAP_OFFICE_IDS,
  TIER_PATH,
  TIER_SHA256,
} from "../../lib/atlas/hungary/identity";
import { importAlbania } from "../../lib/atlas/albania/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { importHungary } from "../../lib/atlas/hungary/import";
import { HungaryPreflightError, scanHungaryInventory } from "../../lib/atlas/hungary/inventory";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Hungary Atlas importer", () => {
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

  it("keeps Hungary out of ATLAS_IMPORT_SCOPE=all", () => {
    expect(scopeImportsHungary("hungary")).toBe(true);
    expect(scopeImportsHungary("all")).toBe(false);
    expect(scopeImportsHungary("estonia")).toBe(false);
  });

  it("scans the accepted Prompt AK slim pack and pins the approved-tier fingerprint", () => {
    const inventory = scanHungaryInventory({ root: repoRoot });
    expect(inventory.offices).toHaveLength(6378);
    expect(inventory.events).toHaveLength(12753);
    expect(inventory.proceedings).toHaveLength(0);
    expect(inventory.geographies).toHaveLength(3198);
    expect(inventory.counts.results).toBe(101526);
    expect(inventory.counts.coverage_complete).toBe(false);
    expect(inventory.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(inventory.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(inventory.fingerprint).not.toBe(DOCUMENTARY_DRAFT_FINGERPRINT);
    expect(inventory.tiers.status).toBe("approved");
    expect(inventory.tiers.production_accepted).toBe(true);
    expect(TIER_SHA256).not.toBe(DRAFT_TIER_SHA256);
    expect(inventory.byPath.has("data/research/hungary/results.json")).toBe(false);
    expect(inventory.byPath.has("data/research/hungary/identity-crosswalk.json")).toBe(false);
    expect(inventory.tracked.some((item) => item.input_path.includes("/sources/"))).toBe(false);
    expect(inventory.tracked.some((item) => item.input_path.endsWith("/sources.json"))).toBe(true);
  });

  it("imports 6378 current offices and does not invent omitted result rows", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-hungary-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importHungary({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "hungary-test",
    });
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts.current_offices).toBe(6378);
    expect(first.counts.historical_offices).toBe(0);
    expect(first.counts.offices).toBe(6378);
    expect(first.counts.municipal_offices).toBe(6355);
    expect(first.counts.regional_offices).toBe(20);
    expect(first.counts.national_offices).toBe(2);
    expect(first.counts.other_offices).toBe(1);
    expect(first.counts.current_direct_executive_offices).toBe(3178);
    expect(first.counts.council_assembly_offices).toBe(3198);
    expect(first.counts.total_events).toBe(12753);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.documented_result_rows_omitted).toBe(101526);
    expect(first.counts.proceedings).toBe(0);
    expect(first.counts.unresolved_evidence).toBe(16);
    expect(first.counts.needs_review_classifications).toBe(3);
    expect(first.counts.approved_classifications).toBe(6375);
    expect(first.counts.successor_edges).toBe(0);
    expect(first.counts.events_onk2024).toBe(6372);

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(6378);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(0);
      expect(
        db.prepare("SELECT office_type, tier, review_status FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_id = ?").get(PRESIDENT_ID),
      ).toMatchObject({ office_type: "indirect_president", tier: "national_context" });
      expect(
        db.prepare("SELECT event_kind, ballot_basis FROM election_event WHERE history_key = 'HU-PRES::PRES2024'").get(),
      ).toMatchObject({ event_kind: "indirect", ballot_basis: "electors" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(BUDAPEST_ASSEMBLY_ID),
      ).toMatchObject({ tier: "regional", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(BUDAPEST_MAYOR_ID),
      ).toMatchObject({ tier: "municipal", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(EP_ID),
      ).toMatchObject({ tier: "other", review_status: "needs_review" });
      expect(
        db.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = ?").get(PARLIAMENT_ID),
      ).toMatchObject({ tier: "national_context", review_status: "approved" });
      for (const officeId of RETURN_GAP_OFFICE_IDS) {
        expect(db.prepare("SELECT office_status FROM office WHERE office_id = ?").get(officeId)).toMatchObject({
          office_status: "current",
        });
        expect(
          db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE history_key = ?").get(`${officeId}::ONK2024`),
        ).toMatchObject({ n: 0 });
      }
      expect(
        Number(
          db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type IN ('direct_mayor','direct_capital_mayor')").get(LINEAGE_ID)?.n,
        ),
      ).toBe(3178);
    } finally {
      db.close();
    }

    const calendar = listAtlasRegionalCalendar("hungary", sqlitePath);
    expect(calendar.count).toBe(20);
    expect(calendar.label).toContain("19 county assemblies");
    expect(calendar.label).toContain("HU-CHAIRS-JARAS");
    expect(calendar.label).toContain("not invented");

    const second = importHungary({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "hungary-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 300_000);

  it("imports Albania then Hungary into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-hungary-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-hungary-test",
    });
    expect(albania.counts.current_offices).toBe(123);
    const hungary = importHungary({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-hungary-test",
    });
    expect(hungary.counts.offices).toBe(6378);
    expect(hungary.counts.result_rows).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n)).toBe(891);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(6378);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, LINEAGE_ID].sort());
    } finally {
      db.close();
    }
  }, 300_000);

  it("rejects OBSERVATORY_FIXTURES=1 and does not upgrade a draft tier file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-hungary-gates-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    process.env.OBSERVATORY_FIXTURES = "1";
    try {
      expect(() =>
        importHungary({
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "hungary-fixture",
        }),
      ).toThrow(/OBSERVATORY_FIXTURES/);
    } finally {
      delete process.env.OBSERVATORY_FIXTURES;
    }

    const draftPath = path.join(dir, "hungary-draft.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as {
      status: string;
      production_accepted: boolean;
      approval: { Justin_accepted: boolean };
    };
    approved.status = "draft_for_human_review";
    approved.production_accepted = false;
    approved.approval.Justin_accepted = false;
    writeFileSync(draftPath, JSON.stringify(approved));
    expect(() =>
      scanHungaryInventory({
        root: repoRoot,
        tierPath: draftPath,
        requireGitTrackedPackage: false,
      }),
    ).toThrow(HungaryPreflightError);
  });
});
