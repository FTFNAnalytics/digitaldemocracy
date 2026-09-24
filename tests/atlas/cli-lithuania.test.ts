import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atlasImportStatusMessage } from "../../lib/atlas/import-status";

const repoRoot = path.join(import.meta.dirname, "../..");

function runAtlasImport(env: Record<string, string | undefined>) {
  return spawnSync(
    process.execPath,
    ["--experimental-sqlite", "--no-warnings", "--import", "tsx", "scripts/atlas/import.ts"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, ...env },
      timeout: 180_000,
    },
  );
}

describe("atlas CLI Lithuania", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Lithuania Prompt AH 123 current offices",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-lithuania-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "lithuania",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=lithuania");
      expect(result.stdout).toContain("lineage=country-package-lithuania");
      expect(result.stdout).toContain("lithuania_offices=123");
      expect(result.stdout).toContain("lithuania_current=123");
      expect(result.stdout).toContain("lithuania_historical=0");
      expect(result.stdout).toContain("lithuania_municipal=120");
      expect(result.stdout).toContain("lithuania_regional=0");
      expect(result.stdout).toContain("lithuania_national=2");
      expect(result.stdout).toContain("lithuania_other=1");
      expect(result.stdout).toContain("lithuania_selected_histories=30");
      expect(result.stdout).toContain("lithuania_prospective_events=0");
      expect(result.stdout).toContain("lithuania_result_rows=130");
      expect(result.stdout).toContain("lithuania_proceedings=25");
      expect(result.stdout).toContain("lithuania_sources=53");
      expect(result.stdout).toContain("lithuania_unresolved=21");
      expect(result.stdout).toContain("lithuania_approved=0");
      expect(result.stdout).toContain("lithuania_needs_review=123");
      expect(result.stdout).toContain("lithuania_current_councils=60");
      expect(result.stdout).toContain("lithuania_current_direct_executive_offices=61");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 123 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'LT-lsa-61244a98ecf1b6948da37f0c-M'").get()).toMatchObject({
          office_type: "direct_mayor",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE review_status = 'needs_review'").get()).toMatchObject({
          n: 123,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 130 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row WHERE share_status = 'disputed'").get()).toMatchObject({ n: 11 });
        expect(master.prepare("SELECT electoral_system FROM election_event WHERE history_key = 'LT-PRESIDENT::PRE2019'").get()).toMatchObject({
          electoral_system: "direct_popular_two_round",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding WHERE supersedes_id IS NOT NULL").get()).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Lithuania");
      expect(atlasImportStatusMessage()).toContain("lithuania");
    },
    180_000,
  );
});
