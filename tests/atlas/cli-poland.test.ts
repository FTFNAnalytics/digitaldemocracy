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

describe("atlas CLI Poland", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Poland Prompt AC 5310 current + 2 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-poland-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "poland",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-poland");
      expect(result.stdout).toContain("poland_offices=5312");
      expect(result.stdout).toContain("poland_current=5310");
      expect(result.stdout).toContain("poland_historical=2");
      expect(result.stdout).toContain("poland_municipal=4960");
      expect(result.stdout).toContain("poland_regional=330");
      expect(result.stdout).toContain("poland_national=3");
      expect(result.stdout).toContain("poland_other=19");
      expect(result.stdout).toContain("poland_powiat=314");
      expect(result.stdout).toContain("poland_sejmiks=16");
      expect(result.stdout).toContain("poland_selected_histories=15914");
      expect(result.stdout).toContain("poland_prospective_events=56");
      expect(result.stdout).toContain("poland_result_rows=0");
      expect(result.stdout).toContain("poland_proceedings=9773");
      expect(result.stdout).toContain("poland_unresolved=12");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 5312 });
        expect(master.prepare("SELECT geography_id FROM office WHERE office_id = 'PL-020101-C'").get()).toMatchObject({
          geography_id: "PL-020101",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({
          n: 2,
        });
        expect(
          master
            .prepare(
              "SELECT COUNT(*) AS n FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_type = 'county_council' AND t.tier = 'regional'",
            )
            .get(),
        ).toMatchObject({ n: 314 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'").get()).toMatchObject({
          n: 3,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'").get()).toMatchObject({
          n: 56,
        });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Poland");
      expect(atlasImportStatusMessage()).toContain("poland");
    },
    300_000,
  );
});
