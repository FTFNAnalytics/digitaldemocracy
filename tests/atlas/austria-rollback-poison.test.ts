import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria } from "../../lib/atlas/austria/import";
import { sha256Hex } from "../../lib/atlas/austria/identity";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

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

describe("Prompt N Austria poison rollback gates", () => {
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
    "rolls back a poison write and keeps the published SHA plus a failed attempt",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-austria-poison-"));
      tempDirs.push(dir);
      const options = {
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "atlas-ci",
      };

      importAustria(options);
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
    },
    600_000,
  );
});
