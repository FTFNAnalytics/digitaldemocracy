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
      timeout: 300_000,
    },
  );
}

describe("atlas CLI Croatia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Croatia Prompt W 1234 current + 11 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-croatia-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "croatia",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-croatia");
      expect(result.stdout).toContain("croatia_offices=1245");
      expect(result.stdout).toContain("croatia_current=1234");
      expect(result.stdout).toContain("croatia_historical=11");
      expect(result.stdout).toContain("croatia_municipal=1187");
      expect(result.stdout).toContain("croatia_regional=55");
      expect(result.stdout).toContain("croatia_national=2");
      expect(result.stdout).toContain("croatia_other=1");
      expect(result.stdout).toContain("croatia_selected_histories=3833");
      expect(result.stdout).toContain("croatia_prospective_events=0");
      expect(result.stdout).toContain("croatia_result_rows=15907");
      expect(result.stdout).toContain("croatia_proceedings=2418");
      expect(result.stdout).toContain("croatia_unresolved=13");
      expect(result.stdout).toContain("croatia_executives=577");
      expect(result.stdout).toContain("croatia_deputies=79");
      expect(result.stdout).toContain("croatia_assemblies=576");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 1245 });
        expect(master.prepare("SELECT geography_id FROM office WHERE office_id = 'HR-Z21-C'").get()).toMatchObject({
          geography_id: "HR-Z21",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({
          n: 11,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'").get()).toMatchObject({
          n: 2,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 15907 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row WHERE seats IS NOT NULL").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id IN ('HR-G1333-C', 'HR-G1333-E')").get()).toMatchObject({
          n: 0,
        });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Croatia");
      expect(atlasImportStatusMessage()).toContain("croatia");
    },
    300_000,
  );
});
