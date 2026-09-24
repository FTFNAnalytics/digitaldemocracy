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

describe("atlas CLI France", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads France Prompt AR and does not treat all as France",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-france-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "france",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=france");
      expect(result.stdout).toContain("lineage=country-package-france");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-greece");
      expect(result.stdout).not.toContain("lineage=country-package-luxembourg");
      expect(result.stdout).not.toContain("lineage=country-package-malta");
      expect(result.stdout).not.toContain("lineage=country-package-cyprus");
      expect(result.stdout).toContain("france_offices=37850");
      expect(result.stdout).toContain("france_current=35112");
      expect(result.stdout).toContain("france_historical=2738");
      expect(result.stdout).toContain("france_municipal=37705");
      expect(result.stdout).toContain("france_regional=141");
      expect(result.stdout).toContain("france_national=4");
      expect(result.stdout).toContain("france_other=0");
      expect(result.stdout).toContain("france_selected_histories=0");
      expect(result.stdout).toContain("france_prospective_events=0");
      expect(result.stdout).toContain("france_result_rows=0");
      expect(result.stdout).toContain("france_documented_result_rows_omitted=1193657");
      expect(result.stdout).toContain("france_documented_event_rows_omitted=119554");
      expect(result.stdout).toContain("france_documented_reporting_units_omitted=173409");
      expect(result.stdout).toContain("france_sources=0");
      expect(result.stdout).toContain("france_unresolved=21");
      expect(result.stdout).toContain("france_approved=0");
      expect(result.stdout).toContain("france_needs_review=37850");
      expect(result.stdout).toContain("france_current_municipal_councils=34952");
      expect(result.stdout).toContain("france_direct_executive_offices=1");
      expect(result.stdout).toContain("france_historical_direct_executives=0");
      expect(result.stdout).toContain("france_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("france_research_dates=114");
      expect(result.stdout).toContain("france_geographies=37847");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 37850 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'FR-PRESIDENT'").get()).toMatchObject({
          office_type: "president",
        });
        expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'FR-EP'").get()).toMatchObject({
          tier: "national_context",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 2738 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 21 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-france"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("France");
      expect(atlasImportStatusMessage()).toContain("france");
      expect(atlasImportStatusMessage()).toContain("does not import France");
      expect(atlasImportStatusMessage()).toContain("does not import Cyprus");
    },
    300_000,
  );
});
