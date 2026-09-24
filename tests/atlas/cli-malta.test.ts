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
      timeout: 180_000,
    },
  );
}

describe("atlas CLI Malta", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Malta Prompt AP and does not treat all as Malta",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-malta-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "malta",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=malta");
      expect(result.stdout).toContain("lineage=country-package-malta");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-greece");
      expect(result.stdout).not.toContain("lineage=country-package-luxembourg");
      expect(result.stdout).toContain("malta_offices=215");
      expect(result.stdout).toContain("malta_current=213");
      expect(result.stdout).toContain("malta_historical=2");
      expect(result.stdout).toContain("malta_municipal=204");
      expect(result.stdout).toContain("malta_regional=8");
      expect(result.stdout).toContain("malta_national=2");
      expect(result.stdout).toContain("malta_other=1");
      expect(result.stdout).toContain("malta_selected_histories=223");
      expect(result.stdout).toContain("malta_prospective_events=0");
      expect(result.stdout).toContain("malta_result_rows=0");
      expect(result.stdout).toContain("malta_documented_result_rows_omitted=4084");
      expect(result.stdout).toContain("malta_documented_stv_count_observations_omitted=64204");
      expect(result.stdout).toContain("malta_documented_numeric_first_preference_rows_omitted=4050");
      expect(result.stdout).toContain("malta_sources=0");
      expect(result.stdout).toContain("malta_unresolved=10");
      expect(result.stdout).toContain("malta_approved=0");
      expect(result.stdout).toContain("malta_needs_review=215");
      expect(result.stdout).toContain("malta_current_local_councils=68");
      expect(result.stdout).toContain("malta_malta_local_councils=54");
      expect(result.stdout).toContain("malta_gozo_local_councils=14");
      expect(result.stdout).toContain("malta_current_mayors=68");
      expect(result.stdout).toContain("malta_current_deputy_mayors=68");
      expect(result.stdout).toContain("malta_current_indirect_regional_presidents=6");
      expect(result.stdout).toContain("malta_direct_executive_offices=0");
      expect(result.stdout).toContain("malta_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("malta_regional_nominations=4");
      expect(result.stdout).toContain("malta_geographies=76");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 215 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 223 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'MT-HOR'").get()).toMatchObject({
          office_type: "national_parliament",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 2 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 10 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-malta"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Malta");
      expect(atlasImportStatusMessage()).toContain("malta");
      expect(atlasImportStatusMessage()).toContain("does not import Malta");
    },
    180_000,
  );
});
