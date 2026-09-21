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

describe("atlas CLI Czechia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Czechia Prompt V 6411 current + 13 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-czechia-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "czechia",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-czechia");
      expect(result.stdout).toContain("czechia_offices=6424");
      expect(result.stdout).toContain("czechia_current=6411");
      expect(result.stdout).toContain("czechia_historical=13");
      expect(result.stdout).toContain("czechia_municipal=6257");
      expect(result.stdout).toContain("czechia_regional=14");
      expect(result.stdout).toContain("czechia_national=3");
      expect(result.stdout).toContain("czechia_other=150");
      expect(result.stdout).toContain("czechia_boroughs=149");
      expect(result.stdout).toContain("czechia_prague=1");
      expect(result.stdout).toContain("czechia_selected_histories=38749");
      expect(result.stdout).toContain("czechia_prospective_events=6421");
      expect(result.stdout).toContain("czechia_result_rows=0");
      expect(result.stdout).toContain("czechia_proceedings=934");
      expect(result.stdout).toContain("czechia_unresolved=10");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 6424 });
        expect(master.prepare("SELECT geography_id FROM office WHERE office_id = 'CZ-M554782-C'").get()).toMatchObject({
          geography_id: "CZ-M554782",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({
          n: 13,
        });
        expect(
          master
            .prepare(
              "SELECT COUNT(*) AS n FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_type = 'borough_council' AND t.tier = 'other'",
            )
            .get(),
        ).toMatchObject({ n: 149 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'").get()).toMatchObject({
          n: 3,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'").get()).toMatchObject({
          n: 6421,
        });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Czechia");
      expect(atlasImportStatusMessage()).toContain("czechia");
    },
    300_000,
  );
});
