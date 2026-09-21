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

describe("atlas CLI Denmark", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Denmark Prompt X 106 current + 240 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-denmark-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "denmark",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-denmark");
      expect(result.stdout).toContain("denmark_offices=346");
      expect(result.stdout).toContain("denmark_current=106");
      expect(result.stdout).toContain("denmark_historical=240");
      expect(result.stdout).toContain("denmark_municipal=324");
      expect(result.stdout).toContain("denmark_regional=20");
      expect(result.stdout).toContain("denmark_national=1");
      expect(result.stdout).toContain("denmark_other=1");
      expect(result.stdout).toContain("denmark_selected_histories=1849");
      expect(result.stdout).toContain("denmark_prospective_events=0");
      expect(result.stdout).toContain("denmark_result_rows=25391");
      expect(result.stdout).toContain("denmark_unresolved=105");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 346 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'DK-K101-C'").get(),
        ).toMatchObject({ geography_id: "DK-K101" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'")
            .get(),
        ).toMatchObject({ n: 240 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 20 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'")
            .get(),
        ).toMatchObject({ n: 1 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'")
            .get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Denmark");
      expect(atlasImportStatusMessage()).toContain("denmark");
    },
    300_000,
  );
});
