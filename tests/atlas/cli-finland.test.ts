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

describe("atlas CLI Finland", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Finland Prompt Z 333 current + 170 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-finland-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "finland",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-finland");
      expect(result.stdout).toContain("finland_offices=503");
      expect(result.stdout).toContain("finland_current=333");
      expect(result.stdout).toContain("finland_historical=170");
      expect(result.stdout).toContain("finland_municipal=478");
      expect(result.stdout).toContain("finland_regional=22");
      expect(result.stdout).toContain("finland_national=2");
      expect(result.stdout).toContain("finland_other=1");
      expect(result.stdout).toContain("finland_selected_histories=5241");
      expect(result.stdout).toContain("finland_prospective_events=0");
      expect(result.stdout).toContain("finland_result_rows=37471");
      expect(result.stdout).toContain("finland_proceedings=11");
      expect(result.stdout).toContain("finland_unresolved=7");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 503 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'FI-M091-C'").get(),
        ).toMatchObject({ geography_id: "FI-M091" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'")
            .get(),
        ).toMatchObject({ n: 170 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 22 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'")
            .get(),
        ).toMatchObject({ n: 2 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM proceeding")
            .get(),
        ).toMatchObject({ n: 11 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'")
            .get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Finland");
      expect(atlasImportStatusMessage()).toContain("finland");
    },
    300_000,
  );
});
