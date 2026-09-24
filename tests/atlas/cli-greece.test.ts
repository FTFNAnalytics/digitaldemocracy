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

describe("atlas CLI Greece", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Greece Prompt AM 693 current offices and does not treat all as Greece",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-greece-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "greece",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=greece");
      expect(result.stdout).toContain("lineage=country-package-greece");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).toContain("greece_offices=703");
      expect(result.stdout).toContain("greece_current=693");
      expect(result.stdout).toContain("greece_historical=10");
      expect(result.stdout).toContain("greece_municipal=674");
      expect(result.stdout).toContain("greece_regional=26");
      expect(result.stdout).toContain("greece_national=2");
      expect(result.stdout).toContain("greece_other=1");
      expect(result.stdout).toContain("greece_selected_histories=2774");
      expect(result.stdout).toContain("greece_prospective_events=0");
      expect(result.stdout).toContain("greece_result_rows=14004");
      expect(result.stdout).toContain("greece_proceedings=3555");
      expect(result.stdout).toContain("greece_sources=0");
      expect(result.stdout).toContain("greece_unresolved=24");
      expect(result.stdout).toContain("greece_approved=0");
      expect(result.stdout).toContain("greece_needs_review=703");
      expect(result.stdout).toContain("greece_current_direct_executive_offices=345");
      expect(result.stdout).toContain("greece_historical_direct_executive_offices=5");
      expect(result.stdout).toContain("greece_current_municipal_councils=332");
      expect(result.stdout).toContain("greece_current_mayors=332");
      expect(result.stdout).toContain("greece_current_regional_councils=13");
      expect(result.stdout).toContain("greece_current_governors=13");
      expect(result.stdout).toContain("greece_geographies=351");
      expect(result.stdout).toContain("greece_distinct_observations=8021");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 703 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 2774 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 3555 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 14004 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'GR-PRES'").get()).toMatchObject({
          office_type: "president",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 10 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 24 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-greece"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Greece");
      expect(atlasImportStatusMessage()).toContain("greece");
      expect(atlasImportStatusMessage()).toContain("does not import Greece");
    },
    180_000,
  );
});
