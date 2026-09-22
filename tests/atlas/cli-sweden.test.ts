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

describe("atlas CLI Sweden", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Sweden Prompt Y 313 current + 7 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-sweden-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "sweden",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-sweden");
      expect(result.stdout).toContain("sweden_offices=320");
      expect(result.stdout).toContain("sweden_current=313");
      expect(result.stdout).toContain("sweden_historical=7");
      expect(result.stdout).toContain("sweden_municipal=292");
      expect(result.stdout).toContain("sweden_regional=25");
      expect(result.stdout).toContain("sweden_national=1");
      expect(result.stdout).toContain("sweden_other=2");
      expect(result.stdout).toContain("sweden_selected_histories=4639");
      expect(result.stdout).toContain("sweden_prospective_events=310");
      expect(result.stdout).toContain("sweden_result_rows=40991");
      expect(result.stdout).toContain("sweden_unresolved=7");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 320 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'SE-K0180-C'").get(),
        ).toMatchObject({ geography_id: "SE-K0180" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'")
            .get(),
        ).toMatchObject({ n: 7 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 25 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'")
            .get(),
        ).toMatchObject({ n: 1 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'")
            .get(),
        ).toMatchObject({ n: 310 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'SE-K0980-C'")
            .get(),
        ).toMatchObject({ tier: "municipal" });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Sweden");
      expect(atlasImportStatusMessage()).toContain("sweden");
    },
    300_000,
  );
});
