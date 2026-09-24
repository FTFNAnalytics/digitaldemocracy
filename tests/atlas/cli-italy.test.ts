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

describe("atlas CLI Italy", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Italy Prompt AT and does not treat all as Italy",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-italy-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "italy",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=italy");
      expect(result.stdout).toContain("lineage=country-package-italy");
      expect(result.stdout).not.toContain("lineage=country-package-united-kingdom");
      expect(result.stdout).not.toContain("lineage=country-package-germany");
      expect(result.stdout).not.toContain("lineage=country-package-france");
      expect(result.stdout).not.toContain("lineage=country-package-cyprus");
      expect(result.stdout).not.toContain("lineage=country-package-malta");
      expect(result.stdout).toContain("italy_offices=16621");
      expect(result.stdout).toContain("italy_current=15917");
      expect(result.stdout).toContain("italy_historical=696");
      expect(result.stdout).toContain("italy_pending_fvg=8");
      expect(result.stdout).toContain("italy_draft_tier_1=4");
      expect(result.stdout).toContain("italy_draft_tier_2=38");
      expect(result.stdout).toContain("italy_draft_tier_3=11");
      expect(result.stdout).toContain("italy_draft_tier_4=16568");
      expect(result.stdout).toContain("italy_schema_national=4");
      expect(result.stdout).toContain("italy_schema_regional=49");
      expect(result.stdout).toContain("italy_schema_municipal=16568");
      expect(result.stdout).toContain("italy_schema_other=0");
      expect(result.stdout).toContain("italy_result_rows=0");
      expect(result.stdout).toContain("italy_event_rows=0");
      expect(result.stdout).not.toContain("italy_documented_result_rows_omitted");
      expect(result.stdout).not.toContain("italy_documented_event_rows_omitted");
      expect(result.stdout).toContain("italy_sources=0");
      expect(result.stdout).toContain("italy_unresolved=19");
      expect(result.stdout).toContain("italy_approved=0");
      expect(result.stdout).toContain("italy_needs_review=16621");
      expect(result.stdout).toContain("italy_direct_executive_offices=7992");
      expect(result.stdout).toContain("italy_current_collective_bodies=7924");
      expect(result.stdout).toContain("italy_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("italy_research_dates=0");
      expect(result.stdout).toContain("italy_geographies=8273");
      expect(result.stdout).toContain("italy_ordinary_provincial_popular_offices=0");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 16621 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'IT.NATIONAL.camera'").get()).toMatchObject({
          office_type: "national_lower_chamber",
          name: "Camera dei Deputati",
        });
        expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'IT.EP'").get()).toMatchObject({
          tier: "national_context",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 696 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE state_note = 'statutory_pending_first_election'").get()).toMatchObject({
          n: 8,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 19 });
        expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
          research_coverage_complete: 0,
        });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-italy"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Italy");
      expect(atlasImportStatusMessage()).toContain("italy");
      expect(atlasImportStatusMessage()).toContain("does not import Italy");
      expect(atlasImportStatusMessage()).toContain("does not import the United Kingdom");
    },
    300_000,
  );
});