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
    },
  );
}

describe("atlas CLI Ireland", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Ireland Prompt AB 36 current + 86 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-ireland-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "ireland",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-ireland");
      expect(result.stdout).toContain("ireland_offices=122");
      expect(result.stdout).toContain("ireland_current=36");
      expect(result.stdout).toContain("ireland_historical=86");
      expect(result.stdout).toContain("ireland_municipal=118");
      expect(result.stdout).toContain("ireland_regional=0");
      expect(result.stdout).toContain("ireland_national=3");
      expect(result.stdout).toContain("ireland_other=1");
      expect(result.stdout).toContain("ireland_selected_histories=196");
      expect(result.stdout).toContain("ireland_prospective_events=0");
      expect(result.stdout).toContain("ireland_result_rows=7254");
      expect(result.stdout).toContain("ireland_unresolved=9");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 122 });
        expect(master.prepare("SELECT office_id FROM office WHERE office_id = 'IE-LIMERICK-MAYOR'").get()).toBeTruthy();
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'")
            .get(),
        ).toMatchObject({ n: 86 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM result_row WHERE office_id = 'IE-EP'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'")
            .get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Ireland");
      expect(atlasImportStatusMessage()).toContain("ireland");
    },
    120_000,
  );
});
