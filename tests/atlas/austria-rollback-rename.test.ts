import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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

describe("Prompt N Austria rename rollback gates", () => {
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
    "discards staging on an injected rename failure and keeps the published SHA",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-austria-rename-"));
      tempDirs.push(dir);
      const options = {
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "atlas-ci",
      };

      importAustria(options);
      const prior = fileSha256(options.sqlitePath);
      expect(() => importAustria({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
      expect(fileSha256(options.sqlitePath)).toBe(prior);
      expect(latestAttempt(options.attemptsPath).status).toBe("failed");
      expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();
    },
    600_000,
  );
});
