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

const repoRoot = path.join(import.meta.dirname, "../..");

describe("approved-pack gate", () => {
  it("exposes 14 approved continuity packs and 8 residual drafts", () => {
    expect(approvedContinuityPacks(repoRoot).map((pack) => pack.countryId).sort()).toEqual([
      "argentina",
      "bahamas",
      "belize",
      "brazil",
      "colombia",
      "cuba",
      "dominica",
      "dominican-republic",
      "el-salvador",
      "guatemala",
      "jamaica",
      "mexico",
      "new-zealand",
      "paraguay",
    ]);
    expect(draftContinuityPacks(repoRoot).map((pack) => pack.countryId).sort()).toEqual([
      "antigua-and-barbuda",
      "costa-rica",
      "ecuador",
      "guyana",
      "haiti",
      "peru",
      "saint-kitts-and-nevis",
      "trinidad-and-tobago",
    ]);
    for (const pack of approvedContinuityPacks(repoRoot)) {
      expect(pack.status).toBe("approved");
      if (pack.countryId === "argentina") {
        expect(pack.focusedReviews).toBe(97);
      } else {
        expect(pack.focusedReviews).toBe(0);
      }
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

  it("imports Albania then New Zealand into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-nz-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = importAtlasLineages(
      {
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "albania-nz-test",
      },
      "albania",
    );
    expect(result.albania?.counts.current_offices).toBe(122);
    const nz = importAtlasLineages(
      {
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "albania-nz-test",
      },
      "nz",
    );
    expect(nz.nz?.counts.offices).toBe(4);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(NZ_LINEAGE_ID)?.n),
      ).toBe(4);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, NZ_LINEAGE_ID].sort());
    } finally {
      db.close();
    }
  });

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
