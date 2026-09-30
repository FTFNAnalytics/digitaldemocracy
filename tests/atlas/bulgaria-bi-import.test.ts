import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importBulgariaPromptBi } from "../../lib/atlas/bulgaria/bi-import";
import { scopeImportsBulgariaPromptBi } from "../../lib/atlas/continuity/import";
import {
  BI_DRAFT_OFFICE_IDS,
  BI_SCHEMA_TIER_SHA256,
  GRADEC_OFFICE_ID,
  LINEAGE_ID,
  TIER_PATH,
  geographyIdFor,
} from "../../lib/atlas/bulgaria/identity";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Bulgaria Prompt BI additive importer", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("publishes 530 inherited offices plus 4 needs_review drafts and no holds, events, results, or sources", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-bi-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBulgariaPromptBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(first.counts.offices).toBe(534);
    expect(first.counts.current_offices).toBe(533);
    expect(first.counts.historical_offices).toBe(1);
    expect(first.counts.inherited_offices).toBe(530);
    expect(first.counts.municipal_offices).toBe(530);
    expect(first.counts.needs_review_classifications).toBe(4);
    expect(first.counts.approved_classifications).toBe(530);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.held_offices).toBe(3067);
    expect(first.counts.total_events).toBe(0);
    expect(first.counts.result_rows).toBe(0);
    expect(first.counts.sources).toBe(0);
    expect(first.counts.applied_calendar_rows).toBe(0);
    expect(first.reusedRelease).toBe(false);

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = 'BG-VAR01-M'").get()).toMatchObject({
        geography_id: geographyIdFor("BG-VAR01-M"),
        office_type: "Mayor",
      });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      const drafts = db
        .prepare(
          `SELECT office_id, review_status FROM office_tier_classification WHERE office_id IN (${BI_DRAFT_OFFICE_IDS.map(() => "?").join(",")}) ORDER BY office_id`,
        )
        .all(...BI_DRAFT_OFFICE_IDS) as Array<{ office_id: string; review_status: string }>;
      expect(drafts.map((row) => row.office_id)).toEqual([...BI_DRAFT_OFFICE_IDS]);
      expect(drafts.every((row) => row.review_status === "needs_review")).toBe(true);
      const inherited = db
        .prepare(
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND review_status = 'approved' AND tier = 'municipal'",
        )
        .get(LINEAGE_ID) as { n: number };
      expect(Number(inherited.n)).toBe(530);
      expect(
        db.prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?").get(LINEAGE_ID, TIER_PATH),
      ).toMatchObject({ sha256: BI_SCHEMA_TIER_SHA256 });
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM election_event").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM result_row").get()?.n)).toBe(0);
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM source").get()?.n)).toBe(0);
    } finally {
      db.close();
    }

    const second = importBulgariaPromptBi({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-bi-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
  }, 120_000);

  it("does not treat ATLAS_IMPORT_SCOPE=all as the Prompt BI path", () => {
    expect(scopeImportsBulgariaPromptBi("bulgaria")).toBe(true);
    expect(scopeImportsBulgariaPromptBi("all")).toBe(false);
  });
});
