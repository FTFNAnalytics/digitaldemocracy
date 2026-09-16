import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { importAtlasLineages, parseImportScope } from "../../lib/atlas/continuity/import";
import { LATAM_LINEAGE_ID } from "../../lib/atlas/continuity/latam";
import { NZ_LINEAGE_ID } from "../../lib/atlas/continuity/nz";
import {
  approvedContinuityPacks,
  draftContinuityPacks,
} from "../../lib/atlas/continuity/approved";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("approved-pack gate", () => {
  it("exposes 12 approved continuity packs and 10 residual drafts", () => {
    expect(approvedContinuityPacks(repoRoot).map((pack) => pack.countryId).sort()).toEqual([
      "bahamas",
      "belize",
      "brazil",
      "colombia",
      "cuba",
      "dominica",
      "dominican-republic",
      "guatemala",
      "jamaica",
      "mexico",
      "new-zealand",
      "paraguay",
    ]);
    expect(draftContinuityPacks(repoRoot).map((pack) => pack.countryId).sort()).toEqual([
      "antigua-and-barbuda",
      "argentina",
      "costa-rica",
      "ecuador",
      "el-salvador",
      "guyana",
      "haiti",
      "peru",
      "saint-kitts-and-nevis",
      "trinidad-and-tobago",
    ]);
    for (const pack of approvedContinuityPacks(repoRoot)) {
      expect(pack.focusedReviews).toBe(0);
      expect(pack.status).toBe("approved");
    }
  });

  it("parses ATLAS_IMPORT_SCOPE and rejects unknown values", () => {
    expect(parseImportScope("all")).toBe("all");
    expect(parseImportScope("albania")).toBe("albania");
    expect(parseImportScope("latam")).toBe("latam");
    expect(parseImportScope("nz")).toBe("nz");
    expect(() => parseImportScope("europe")).toThrow(/Unknown ATLAS_IMPORT_SCOPE/);
  });
});

describe("multi-lineage continuity import", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "imports Albania plus approved Batch A+B packs and skips residual drafts",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-continuity-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = importAtlasLineages(
        {
          root: repoRoot,
          sqlitePath,
          attemptsPath,
          operator: "continuity-test",
        },
        "all",
      );

      expect(result.albania?.counts.current_offices).toBe(122);
      expect(result.latam?.counts.offices).toBe(6361);
      expect(result.nz?.counts.offices).toBe(4);
      expect(result.nz?.counts.events).toBe(7);
      expect(result.nz?.counts.result_rows).toBe(36);
      expect(result.latam?.skippedDraftCountries).toEqual(
        draftContinuityPacks(repoRoot)
          .filter((pack) => pack.lineageId === LATAM_LINEAGE_ID)
          .map((pack) => pack.countryId)
          .sort(),
      );

      const db = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(
          Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
        ).toBe(122);
        expect(
          Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LATAM_LINEAGE_ID)?.n),
        ).toBe(6361);
        expect(
          Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(NZ_LINEAGE_ID)?.n),
        ).toBe(4);

        const approved = [
          "bahamas",
          "belize",
          "brazil",
          "colombia",
          "cuba",
          "dominica",
          "dominican-republic",
          "guatemala",
          "jamaica",
          "mexico",
          "paraguay",
        ];
        for (const country of approved) {
          const n = Number(
            db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND country_id = ?").get(LATAM_LINEAGE_ID, country)
              ?.n,
          );
          expect(n, country).toBeGreaterThan(0);
        }
        for (const pack of result.latam!.skippedDraftCountries) {
          expect(
            Number(
              db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND country_id = ?").get(LATAM_LINEAGE_ID, pack)
                ?.n,
            ),
          ).toBe(0);
        }

        expect(
          Number(
            db
              .prepare(
                `SELECT COUNT(*) AS n FROM result_row
                 WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NULL AND share_status = 'unknown' AND evidence_status = 'disputed'`,
              )
              .get(LATAM_LINEAGE_ID)?.n,
          ),
        ).toBe(67);
        expect(
          Number(
            db
              .prepare(
                `SELECT COUNT(*) AS n FROM result_row
                 WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NOT NULL AND share > 100`,
              )
              .get(LATAM_LINEAGE_ID)?.n,
          ),
        ).toBe(0);

        const lineages = db
          .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual([ALBANIA_LINEAGE, NZ_LINEAGE_ID, LATAM_LINEAGE_ID].sort());
      } finally {
        db.close();
      }
    },
    600_000,
  );

  it("keeps the Albania-only importer working after continuity modules land", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-only-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-only-test",
    });
    expect(result.counts.current_offices).toBe(122);
    expect(result.counts.regional_offices).toBe(0);
  });
});
