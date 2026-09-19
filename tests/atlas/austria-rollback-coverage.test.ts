import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria } from "../../lib/atlas/austria/import";
import { LINEAGE_ID, sha256Hex } from "../../lib/atlas/austria/identity";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

function fileSha256(filePath: string): string {
  return sha256Hex(readFileSync(filePath));
}

describe("Prompt N Austria coverage-change gates", () => {
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
    "mints a new release when coverage.json remaining text changes",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-austria-coverage-"));
      tempDirs.push(dir);
      const options = {
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "atlas-ci",
      };

      const first = importAustria(options);
      const firstSha = fileSha256(options.sqlitePath);
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
      expect(firstSha).not.toBe(fileSha256(options.sqlitePath));
    },
    600_000,
  );
});
