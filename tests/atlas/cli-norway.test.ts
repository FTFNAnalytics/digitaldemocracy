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

describe("atlas CLI Norway", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Norway Prompt AA 389 current + 537 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-norway-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "norway",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-norway");
      expect(result.stdout).toContain("norway_offices=926");
      expect(result.stdout).toContain("norway_current=389");
      expect(result.stdout).toContain("norway_historical=537");
      expect(result.stdout).toContain("norway_municipal=876");
      expect(result.stdout).toContain("norway_regional=32");
      expect(result.stdout).toContain("norway_national=1");
      expect(result.stdout).toContain("norway_other=17");
      expect(result.stdout).toContain("norway_selected_histories=10777");
      expect(result.stdout).toContain("norway_prospective_events=0");
      expect(result.stdout).toContain("norway_result_rows=59033");
      expect(result.stdout).toContain("norway_unresolved=9");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 926 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'NO-M0301-C'").get(),
        ).toMatchObject({ geography_id: "NO-M0301" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'")
            .get(),
        ).toMatchObject({ n: 537 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 32 });
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
          master.prepare("SELECT office_id FROM office WHERE office_id = 'NO-F03-C'").get(),
        ).toBeUndefined();
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'")
            .get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Norway");
      expect(atlasImportStatusMessage()).toContain("norway");
    },
    360_000,
  );
});
