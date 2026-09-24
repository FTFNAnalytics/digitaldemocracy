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

describe("atlas CLI Latvia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Latvia Prompt AG 45 current + 121 historical offices",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-latvia-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "latvia",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=latvia");
      expect(result.stdout).toContain("lineage=country-package-latvia");
      expect(result.stdout).toContain("latvia_offices=166");
      expect(result.stdout).toContain("latvia_current=45");
      expect(result.stdout).toContain("latvia_historical=121");
      expect(result.stdout).toContain("latvia_municipal=163");
      expect(result.stdout).toContain("latvia_regional=0");
      expect(result.stdout).toContain("latvia_national=2");
      expect(result.stdout).toContain("latvia_other=1");
      expect(result.stdout).toContain("latvia_selected_histories=216");
      expect(result.stdout).toContain("latvia_prospective_events=1");
      expect(result.stdout).toContain("latvia_result_rows=1383");
      expect(result.stdout).toContain("latvia_proceedings=2");
      expect(result.stdout).toContain("latvia_unresolved=16");
      expect(result.stdout).toContain("latvia_current_councils=42");
      expect(result.stdout).toContain("latvia_current_direct_executive_offices=0");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 166 });
        expect(master.prepare("SELECT geography_id FROM office WHERE office_id = 'LV-LOCAL-2021-riga-C'").get()).toMatchObject({
          geography_id: "LV-LOCAL-2021-riga",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({
          n: 121,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'").get()).toMatchObject({
          n: 0,
        });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'national_context'").get(),
        ).toMatchObject({ n: 2 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE selected_history_role = 'none'").get()).toMatchObject({
          n: 1,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 2 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 1383 });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id LIKE '%-M' OR office_type LIKE '%mayor%'").get(),
        ).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT event_kind FROM election_event WHERE history_key = 'LV-PRESIDENT::PRES2003'").get()).toMatchObject({
          event_kind: "indirect",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id = 'LV-LOCAL-2021-riga-C' AND history_key LIKE '%PV2021%'").get()).toMatchObject({
          n: 0,
        });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Latvia");
      expect(atlasImportStatusMessage()).toContain("latvia");
    },
    300_000,
  );
});
