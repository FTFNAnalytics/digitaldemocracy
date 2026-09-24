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

describe("atlas CLI Germany", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Germany Prompt AS and does not treat all as Germany",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-germany-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "germany",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=germany");
      expect(result.stdout).toContain("lineage=country-package-germany");
      expect(result.stdout).not.toContain("lineage=country-package-france");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-greece");
      expect(result.stdout).not.toContain("lineage=country-package-luxembourg");
      expect(result.stdout).not.toContain("lineage=country-package-malta");
      expect(result.stdout).not.toContain("lineage=country-package-cyprus");
      expect(result.stdout).toContain("germany_offices=22630");
      expect(result.stdout).toContain("germany_current=21960");
      expect(result.stdout).toContain("germany_historical=670");
      expect(result.stdout).toContain("germany_draft_tier_1=3");
      expect(result.stdout).toContain("germany_draft_tier_2=20");
      expect(result.stdout).toContain("germany_draft_tier_3=552");
      expect(result.stdout).toContain("germany_draft_tier_4=22055");
      expect(result.stdout).toContain("germany_schema_national=3");
      expect(result.stdout).toContain("germany_schema_regional=572");
      expect(result.stdout).toContain("germany_schema_municipal=22055");
      expect(result.stdout).toContain("germany_schema_other=0");
      expect(result.stdout).toContain("germany_result_rows=0");
      expect(result.stdout).toContain("germany_event_rows=0");
      expect(result.stdout).not.toContain("germany_documented_result_rows_omitted");
      expect(result.stdout).not.toContain("germany_documented_event_rows_omitted");
      expect(result.stdout).toContain("germany_sources=0");
      expect(result.stdout).toContain("germany_unresolved=23");
      expect(result.stdout).toContain("germany_approved=0");
      expect(result.stdout).toContain("germany_needs_review=22630");
      expect(result.stdout).toContain("germany_current_municipal_councils=10718");
      expect(result.stdout).toContain("germany_direct_executive_offices=9585");
      expect(result.stdout).toContain("germany_historical_direct_executives=610");
      expect(result.stdout).toContain("germany_schleswig_holstein_direct_mayors=86");
      expect(result.stdout).toContain("germany_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("germany_research_dates=0");
      expect(result.stdout).toContain("germany_geographies=22628");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 22630 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'DE-BT'").get()).toMatchObject({
          office_type: "bundestag",
        });
        expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'DE-EP'").get()).toMatchObject({
          tier: "national_context",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 670 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 23 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-germany"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Germany");
      expect(atlasImportStatusMessage()).toContain("germany");
      expect(atlasImportStatusMessage()).toContain("does not import Germany");
      expect(atlasImportStatusMessage()).toContain("does not import France");
    },
    300_000,
  );
});
