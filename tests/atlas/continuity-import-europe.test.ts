import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { importAustria } from "../../lib/atlas/austria/import";
import { importBelgium } from "../../lib/atlas/belgium/import";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { LINEAGE_ID as AUSTRIA_LINEAGE } from "../../lib/atlas/austria/identity";
import { LINEAGE_ID as BELGIUM_LINEAGE } from "../../lib/atlas/belgium/identity";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("multi-lineage continuity import (Austria / Belgium)", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("imports Albania then Austria into one master without dropping Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-albania-austria-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const albania = importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-austria-test",
    });
    expect(albania.counts.current_offices).toBe(122);
    const austria = importAustria({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "albania-austria-test",
    });
    expect(austria.counts.current_offices).toBe(2038);
    expect(austria.counts.municipal_offices).toBe(2034);
    expect(austria.counts.regional_offices).toBe(4);
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(ALBANIA_LINEAGE)?.n),
      ).toBe(122);
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(AUSTRIA_LINEAGE)?.n),
      ).toBe(2038);
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual([ALBANIA_LINEAGE, AUSTRIA_LINEAGE].sort());
    } finally {
      db.close();
    }
  }, 300_000);

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
});
