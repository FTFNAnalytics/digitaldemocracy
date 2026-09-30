import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importBulgariaBi } from "../../lib/atlas/bulgaria/bi-import";
import { scanBulgariaBiInventory } from "../../lib/atlas/bulgaria/bi-inventory";
import {
  BI_CANDIDATE_FINGERPRINT,
  BI_DRAFT_OFFICE_IDS,
  BI_SCHEMA_TIER_SHA256,
  COUNTRY_GEOGRAPHY_ID,
  EXPECTED_BI_COUNTS,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  OMITTED_PATHS,
  OPEN_HOLD_IDS,
  TIER_PATH,
} from "../../lib/atlas/bulgaria/bi-identity";
import { importBulgaria } from "../../lib/atlas/bulgaria/import";
import { geographyIdFor } from "../../lib/atlas/bulgaria/identity";
import { scopeImportsBulgariaBi, scopeImportsChile } from "../../lib/atlas/continuity/import";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Bulgaria Prompt BI additive importer", () => {
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

  it("stays off the all scope and leaves Chile wiring alone", () => {
    expect(scopeImportsBulgariaBi("bulgaria")).toBe(true);
    expect(scopeImportsBulgariaBi("all")).toBe(false);
    expect(scopeImportsBulgariaBi("chile")).toBe(false);
    expect(scopeImportsChile("chile")).toBe(true);
    expect(scopeImportsChile("all")).toBe(false);
    expect(scopeImportsChile("bulgaria")).toBe(false);
  });

  it("pins the slim fingerprint and does not load omitted event or result files", () => {
    const inventory = scanBulgariaBiInventory({ root: repoRoot });
    expect(inventory.fingerprint).toBe(BI_CANDIDATE_FINGERPRINT);
    expect(inventory.preservedIds).toHaveLength(EXPECTED_BI_COUNTS.preserved_offices);
    expect(inventory.tracked.some((item) => (OMITTED_PATHS as readonly string[]).includes(item.input_path))).toBe(false);
    expect(inventory.intendedInventory.publish_holds).toBe(false);
  });

  it("publishes 530 preserved offices plus 4 needs_review drafts and no holds", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(first.counts.offices).toBe(534);
    expect(first.counts.current_offices).toBe(533);
    expect(first.counts.historical_offices).toBe(1);
    expect(first.counts.municipal_offices).toBe(530);
    expect(first.counts.approved_classifications).toBe(530);
    expect(first.counts.needs_review_classifications).toBe(4);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.held_offices).toBe(3067);
    expect(first.counts.prompt_bi).toBe(1);
    expect(first.reusedRelease).toBe(false);

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(534);
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      expect(db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = 'BG-VAR01-M'").get()).toMatchObject({
        geography_id: geographyIdFor("BG-VAR01-M"),
        office_type: "Mayor",
      });
      expect(
        db.prepare("SELECT review_status FROM office_tier_classification WHERE office_id = 'BG-VAR01-C'").get(),
      ).toMatchObject({ review_status: "approved" });
      for (const officeId of BI_DRAFT_OFFICE_IDS) {
        const row = db
          .prepare(
            `SELECT o.geography_id, t.review_status, t.tier,
                    json_extract(t.raw_json, '$.row.justin_approved') AS justin_approved,
                    json_extract(t.raw_json, '$.row.applied') AS applied
             FROM office o
             JOIN office_tier_classification t ON t.office_id = o.office_id
             WHERE o.office_id = ?`,
          )
          .get(officeId) as {
          geography_id: string;
          review_status: string;
          tier: string;
          justin_approved: number;
          applied: number;
        };
        expect(row.review_status).toBe("needs_review");
        expect(row.geography_id).toBe(COUNTRY_GEOGRAPHY_ID);
        expect(row.justin_approved).toBe(0);
        expect(row.applied).toBe(0);
        if (officeId === "BG-EUROPEAN-PARLIAMENT") expect(row.tier).toBe("other");
        else expect(row.tier).toBe("national_context");
      }
      expect(
        db.prepare("SELECT office_status FROM office WHERE office_id = 'BG-GRAND-NATIONAL-ASSEMBLY-1990'").get(),
      ).toMatchObject({ office_status: "historical" });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()?.n)).toBe(OPEN_HOLD_IDS.length);
      expect(
        db.prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(LINEAGE_ID, TIER_PATH),
      ).toMatchObject({ sha256: BI_SCHEMA_TIER_SHA256 });
    } finally {
      db.close();
    }

    const second = importBulgariaBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
  }, 180_000);

  it("refuses fixture injection on the BI path", () => {
    process.env.OBSERVATORY_FIXTURES = "1";
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-fixtures-"));
    tempDirs.push(dir);
    expect(() =>
      importBulgariaBi({
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "bulgaria-bi-fixture",
      }),
    ).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
  }, 120_000);
});

describe("Prompt P all-path classifier", () => {
  it("still publishes only the 530 accepted offices when importBulgaria is called directly", () => {
    delete process.env.OBSERVATORY_FIXTURES;
    expect(scopeImportsBulgariaBi("all")).toBe(false);
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-p-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    try {
      const result = importBulgaria({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "bulgaria-p-test",
      });
      expect(result.counts.current_offices).toBe(530);
      expect(result.counts.municipal_offices).toBe(530);
      expect(result.counts.regional_offices).toBe(0);
      expect(result.counts.held_offices).toBe(3067);
      expect(result.counts.selected_histories).toBe(1590);
      expect(result.counts.result_rows).toBe(10343);
      expect(result.counts.prompt_bi).toBeUndefined();
      const db = openAtlasDatabase(sqlitePath, { readOnly: true });
      try {
        expect(db.prepare("SELECT office_id FROM office WHERE office_id = 'BG-NATIONAL-ASSEMBLY'").get()).toBeUndefined();
        expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      } finally {
        db.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 300_000);
});
