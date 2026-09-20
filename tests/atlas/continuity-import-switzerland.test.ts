import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { importNetherlands } from "../../lib/atlas/netherlands/import";
import { importSwitzerland } from "../../lib/atlas/switzerland/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { LINEAGE_ID as NETHERLANDS_LINEAGE } from "../../lib/atlas/netherlands/identity";
import { LINEAGE_ID as SWITZERLAND_LINEAGE } from "../../lib/atlas/switzerland/identity";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Netherlands and Switzerland continuity import", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("imports Albania then Netherlands into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-netherlands-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-netherlands-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const netherlands = importNetherlands({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-netherlands-test",
    });
    expect(netherlands.counts.current_offices).toBe(432);
    expect(netherlands.counts.historical_offices).toBe(69);
    expect(netherlands.counts.regional_offices).toBe(12);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(NETHERLANDS_LINEAGE)?.n),
      ).toBe(501);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, NETHERLANDS_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 180_000);

  it("imports Albania then Switzerland into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-switzerland-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-switzerland-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const switzerland = importSwitzerland({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-switzerland-test",
    });
    expect(switzerland.counts.current_offices).toBe(2805);
    expect(switzerland.counts.historical_offices).toBe(11);
    expect(switzerland.counts.regional_offices).toBe(52);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(SWITZERLAND_LINEAGE)?.n),
      ).toBe(2816);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, SWITZERLAND_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 300_000);
});
