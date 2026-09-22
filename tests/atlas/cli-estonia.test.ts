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

describe("atlas CLI Estonia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Estonia Prompt AF 81 current + 200 historical offices",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-estonia-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "estonia",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-estonia");
      expect(result.stdout).toContain("estonia_offices=281");
      expect(result.stdout).toContain("estonia_current=81");
      expect(result.stdout).toContain("estonia_historical=200");
      expect(result.stdout).toContain("estonia_municipal=278");
      expect(result.stdout).toContain("estonia_regional=0");
      expect(result.stdout).toContain("estonia_national=2");
      expect(result.stdout).toContain("estonia_other=1");
      expect(result.stdout).toContain("estonia_selected_histories=464");
      expect(result.stdout).toContain("estonia_prospective_events=0");
      expect(result.stdout).toContain("estonia_result_rows=0");
      expect(result.stdout).toContain("estonia_proceedings=24");
      expect(result.stdout).toContain("estonia_unresolved=9");
      expect(result.stdout).toContain("estonia_current_councils=78");
      expect(result.stdout).toContain("estonia_current_direct_executive_offices=0");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 281 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'EE-M0784-C'").get(),
        ).toMatchObject({ geography_id: "EE-M0784" });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get(),
        ).toMatchObject({ n: 200 });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'").get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'")
            .get(),
        ).toMatchObject({ n: 2 });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'").get(),
        ).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 24 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT event_kind FROM election_event WHERE history_key = 'EE-PRESIDENT::PRES_1992'")
            .get(),
        ).toMatchObject({ event_kind: "unknown" });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE history_key LIKE '%PRES_2021%'").get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Estonia");
      expect(atlasImportStatusMessage()).toContain("estonia");
    },
    300_000,
  );
});
