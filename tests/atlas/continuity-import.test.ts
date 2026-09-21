import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { importAlderney } from "../../lib/atlas/alderney/import";
import { importAndorra } from "../../lib/atlas/andorra/import";
import { importArmenia } from "../../lib/atlas/armenia/import";
import { importBelgium } from "../../lib/atlas/belgium/import";
import { importBosnia } from "../../lib/atlas/bosnia-and-herzegovina/import";
import { importAtlasLineages, parseImportScope } from "../../lib/atlas/continuity/import";
import { NZ_LINEAGE_ID } from "../../lib/atlas/continuity/nz";
import {
  approvedContinuityPacks,
  draftContinuityPacks,
} from "../../lib/atlas/continuity/approved";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { LINEAGE_ID as ALDERNEY_LINEAGE } from "../../lib/atlas/alderney/identity";
import { LINEAGE_ID as ANDORRA_LINEAGE } from "../../lib/atlas/andorra/identity";
import { LINEAGE_ID as ARMENIA_LINEAGE } from "../../lib/atlas/armenia/identity";
import { LINEAGE_ID as BELGIUM_LINEAGE } from "../../lib/atlas/belgium/identity";
import { LINEAGE_ID as BOSNIA_LINEAGE } from "../../lib/atlas/bosnia-and-herzegovina/identity";

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
    expect(parseImportScope("andorra")).toBe("andorra");
    expect(parseImportScope("alderney")).toBe("alderney");
    expect(parseImportScope("armenia")).toBe("armenia");
    expect(parseImportScope("austria")).toBe("austria");
    expect(parseImportScope("belgium")).toBe("belgium");
    expect(parseImportScope("bosnia")).toBe("bosnia");
    expect(parseImportScope("bulgaria")).toBe("bulgaria");
    expect(parseImportScope("denmark")).toBe("denmark");
    expect(parseImportScope("netherlands")).toBe("netherlands");
    expect(parseImportScope("sweden")).toBe("sweden");
    expect(parseImportScope("switzerland")).toBe("switzerland");
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

  it("imports Albania then Andorra into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-andorra-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-andorra-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const andorra = importAndorra({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-andorra-test",
    });
    expect(andorra.counts.current_offices).toBe(7);
    expect(andorra.counts.regional_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ANDORRA_LINEAGE)?.n),
      ).toBe(7);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, ANDORRA_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

  it("imports Albania then Alderney into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-alderney-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-alderney-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const alderney = importAlderney({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-alderney-test",
    });
    expect(alderney.counts.current_offices).toBe(2);
    expect(alderney.counts.regional_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALDERNEY_LINEAGE)?.n),
      ).toBe(2);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, ALDERNEY_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

  it("imports Albania then Armenia into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-armenia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-armenia-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const armenia = importArmenia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-armenia-test",
    });
    expect(armenia.counts.current_offices).toBe(71);
    expect(armenia.counts.municipal_offices).toBe(71);
    expect(armenia.counts.regional_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ARMENIA_LINEAGE)?.n),
      ).toBe(71);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, ARMENIA_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

  it("imports Albania then Bosnia and Herzegovina into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-bosnia-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-bosnia-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const bosnia = importBosnia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-bosnia-test",
    });
    expect(bosnia.counts.current_offices).toBe(13);
    expect(bosnia.counts.regional_offices).toBe(13);
    expect(bosnia.counts.municipal_offices).toBe(0);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(BOSNIA_LINEAGE)?.n),
      ).toBe(13);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, BOSNIA_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

  it("imports Albania then Belgium into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-belgium-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-belgium-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const belgium = importBelgium({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-belgium-test",
    });
    expect(belgium.counts.current_offices).toBe(1179);
    expect(belgium.counts.historical_offices).toBe(55);
    expect(belgium.counts.regional_offices).toBe(15);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(BELGIUM_LINEAGE)?.n),
      ).toBe(1234);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, BELGIUM_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

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
