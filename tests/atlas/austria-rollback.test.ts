import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria } from "../../lib/atlas/austria/import";
import { LINEAGE_ID, sha256Hex } from "../../lib/atlas/austria/identity";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

function latestAttempt(attemptsPath: string): Record<string, unknown> {
  const db = openAtlasDatabase(attemptsPath, { readOnly: true });
  try {
    const row = db.prepare("SELECT * FROM ingest_attempt ORDER BY started_at DESC, rowid DESC LIMIT 1").get();
    if (!row) throw new Error("No ingest_attempt rows");
    return row;
  } finally {
    db.close();
  }
}

function fileSha256(filePath: string): string {
  return sha256Hex(readFileSync(filePath));
}

describe("Prompt N Austria rollback gates", () => {
  const tempDirs: string[] = [];
  const originalFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    if (originalFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = originalFixtures;
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "rolls back poison and rename failures and mints a new release when coverage changes",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-austria-rollback-"));
      tempDirs.push(dir);
      const options = {
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "atlas-ci",
      };

      const first = importAustria(options);
      const poisonPrior = fileSha256(options.sqlitePath);
      expect(() =>
        importAustria({
          ...options,
          poisonAfterWrite: (db) => {
            db.exec("PRAGMA foreign_keys = OFF;");
            db.prepare("DELETE FROM source WHERE source_id = ?").run("austria--Saa268dd490");
            db.exec("PRAGMA foreign_keys = ON;");
          },
        }),
      ).toThrow(/foreign_key_check|FOREIGN|source/i);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      const poisonAttempt = latestAttempt(options.attemptsPath);
      expect(poisonAttempt.status).toBe("failed");
      expect(poisonAttempt.successful_release_id).toBeNull();
      expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

      expect(() => importAustria({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      expect(latestAttempt(options.attemptsPath).status).toBe("failed");
      expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();

      const coverageDir = path.join(dir, "coverage-package");
      cpSync(path.join(repoRoot, "data/countries/austria"), coverageDir, { recursive: true });
      const coveragePath = path.join(coverageDir, "coverage.json");
      const coverage = JSON.parse(readFileSync(coveragePath, "utf8")) as { remaining: string };
      coverage.remaining = `${coverage.remaining} test-only remaining note.`;
      writeFileSync(coveragePath, `${JSON.stringify(coverage)}\n`);
      const changed = importAustria({ ...options, packageDir: coverageDir, requireGitTrackedPackage: false });
      expect(changed.releaseId).not.toBe(first.releaseId);
      const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        expect(countRows(master, "office_tier_classification", "tier = 'municipal'")).toBe(2034);
        expect(countRows(master, "office_tier_classification", "tier = 'regional'")).toBe(4);
        expect(master.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 2 });
        const selected = master.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(selected?.release_id)).toBe(changed.releaseId);
      } finally {
        master.close();
      }
      expect(poisonPrior).not.toBe(fileSha256(options.sqlitePath));
    },
    600_000,
  );
});
