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

describe("atlas CLI Cyprus", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Cyprus Prompt AQ and does not treat all as Cyprus",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-cyprus-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "cyprus",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=cyprus");
      expect(result.stdout).toContain("lineage=country-package-cyprus");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-greece");
      expect(result.stdout).not.toContain("lineage=country-package-luxembourg");
      expect(result.stdout).not.toContain("lineage=country-package-malta");
      expect(result.stdout).toContain("cyprus_offices=888");
      expect(result.stdout).toContain("cyprus_current=714");
      expect(result.stdout).toContain("cyprus_historical=174");
      expect(result.stdout).toContain("cyprus_municipal=877");
      expect(result.stdout).toContain("cyprus_regional=5");
      expect(result.stdout).toContain("cyprus_national=5");
      expect(result.stdout).toContain("cyprus_other=1");
      expect(result.stdout).toContain("cyprus_selected_histories=1599");
      expect(result.stdout).toContain("cyprus_prospective_events=0");
      expect(result.stdout).toContain("cyprus_result_rows=0");
      expect(result.stdout).toContain("cyprus_documented_result_rows_omitted=11112");
      expect(result.stdout).toContain("cyprus_sources=0");
      expect(result.stdout).toContain("cyprus_unresolved=15");
      expect(result.stdout).toContain("cyprus_approved=0");
      expect(result.stdout).toContain("cyprus_needs_review=888");
      expect(result.stdout).toContain("cyprus_current_local_councils=305");
      expect(result.stdout).toContain("cyprus_current_municipal_councils=20");
      expect(result.stdout).toContain("cyprus_current_mayors=20");
      expect(result.stdout).toContain("cyprus_current_deputy_mayors=93");
      expect(result.stdout).toContain("cyprus_current_community_councils=285");
      expect(result.stdout).toContain("cyprus_current_community_leaders=285");
      expect(result.stdout).toContain("cyprus_current_dlgo_presidents=5");
      expect(result.stdout).toContain("cyprus_direct_executive_offices=404");
      expect(result.stdout).toContain("cyprus_historical_direct_executives=87");
      expect(result.stdout).toContain("cyprus_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("cyprus_named_communities=285");
      expect(result.stdout).toContain("cyprus_ministry_overview_communities=286");
      expect(result.stdout).toContain("cyprus_year_only_events=7");
      expect(result.stdout).toContain("cyprus_offices_without_events=88");
      expect(result.stdout).toContain("cyprus_geographies=494");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 888 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 1599 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'CY-HOUSE'").get()).toMatchObject({
          office_type: "national_parliament",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 174 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 15 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-cyprus"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Cyprus");
      expect(atlasImportStatusMessage()).toContain("cyprus");
      expect(atlasImportStatusMessage()).toContain("does not import Cyprus");
      expect(atlasImportStatusMessage()).toContain("does not import Malta");
    },
    180_000,
  );
});
