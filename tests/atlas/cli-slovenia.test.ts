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

describe("atlas CLI Slovenia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Slovenia Prompt AJ and does not treat all as Slovenia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-slovenia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "slovenia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=slovenia");
    expect(result.stdout).toContain("lineage=country-package-slovenia");
    expect(result.stdout).not.toContain("lineage=country-package-slovakia");
    expect(result.stdout).not.toContain("lineage=country-package-montenegro");
    expect(result.stdout).toContain("slovenia_offices=428");
    expect(result.stdout).toContain("slovenia_current=428");
    expect(result.stdout).toContain("slovenia_historical=0");
    expect(result.stdout).toContain("slovenia_draft_tier_municipal=424");
    expect(result.stdout).toContain("slovenia_draft_tier_regional=0");
    expect(result.stdout).toContain("slovenia_draft_tier_national=3");
    expect(result.stdout).toContain("slovenia_draft_tier_other=1");
    expect(result.stdout).toContain("slovenia_schema_national=3");
    expect(result.stdout).toContain("slovenia_schema_regional=0");
    expect(result.stdout).toContain("slovenia_schema_municipal=424");
    expect(result.stdout).toContain("slovenia_schema_other=1");
    expect(result.stdout).toContain("slovenia_result_rows=0");
    expect(result.stdout).toContain("slovenia_event_rows=0");
    expect(result.stdout).not.toContain("slovenia_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("slovenia_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("slovenia_documented_sources_omitted");
    expect(result.stdout).toContain("slovenia_sources=0");
    expect(result.stdout).toContain("slovenia_unresolved=10");
    expect(result.stdout).toContain("slovenia_open_holds=10");
    expect(result.stdout).toContain("slovenia_approved=0");
    expect(result.stdout).toContain("slovenia_needs_review=428");
    expect(result.stdout).toContain("slovenia_direct_executive_offices=213");
    expect(result.stdout).toContain("slovenia_councils_chambers_delegation=215");
    expect(result.stdout).toContain("slovenia_municipal_councils=212");
    expect(result.stdout).toContain("slovenia_municipal_mayors=212");
    expect(result.stdout).toContain("slovenia_national_assembly_offices=1");
    expect(result.stdout).toContain("slovenia_national_council_offices=1");
    expect(result.stdout).toContain("slovenia_president_offices=1");
    expect(result.stdout).toContain("slovenia_ep_offices=1");
    expect(result.stdout).toContain("slovenia_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("slovenia_research_dates=0");
    expect(result.stdout).toContain("slovenia_geographies=213");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 428 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'SI-DZ'").get()).toMatchObject({
        office_type: "national_assembly",
      });
      expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'SI-DS'").get()).toMatchObject({
        office_type: "national_council",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'SI-PRESIDENT'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 428 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 10 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-slovenia"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Slovenia");
    expect(atlasImportStatusMessage()).toContain("slovenia");
    expect(atlasImportStatusMessage()).toContain("does not import Slovenia");
    expect(atlasImportStatusMessage()).toContain("does not import Slovakia");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-slovenia-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-slovenia-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
  });
});
