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

describe("atlas CLI Hungary", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Hungary Prompt AK 6378 current offices and zero invented result rows",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-hungary-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "hungary",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=hungary");
      expect(result.stdout).toContain("lineage=country-package-hungary");
      expect(result.stdout).toContain("hungary_offices=6378");
      expect(result.stdout).toContain("hungary_current=6378");
      expect(result.stdout).toContain("hungary_historical=0");
      expect(result.stdout).toContain("hungary_municipal=6355");
      expect(result.stdout).toContain("hungary_regional=20");
      expect(result.stdout).toContain("hungary_national=2");
      expect(result.stdout).toContain("hungary_other=1");
      expect(result.stdout).toContain("hungary_selected_histories=12753");
      expect(result.stdout).toContain("hungary_prospective_events=0");
      expect(result.stdout).toContain("hungary_result_rows=0");
      expect(result.stdout).toContain("hungary_documented_result_rows_omitted=101526");
      expect(result.stdout).toContain("hungary_proceedings=0");
      expect(result.stdout).toContain("hungary_needs_review=3");
      expect(result.stdout).toContain("hungary_approved=6375");
      expect(result.stdout).toContain("hungary_council_assembly_offices=3198");
      expect(result.stdout).toContain("hungary_current_direct_executive_offices=3178");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 6378 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 0 });
        expect(
          master.prepare("SELECT office_type FROM office WHERE office_id = 'HU-PRES'").get(),
        ).toMatchObject({ office_type: "indirect_president" });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE history_key = 'HU-NVI-18-012-C::ONK2024'").get(),
        ).toMatchObject({ n: 0 });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'").get(),
        ).toMatchObject({ n: 20 });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Hungary");
      expect(atlasImportStatusMessage()).toContain("hungary");
      expect(atlasImportStatusMessage()).toContain("Hungary is not part of all");
    },
    300_000,
  );
});
