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

describe("atlas CLI Slovakia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Slovakia Prompt AI and does not treat all as Slovakia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-slovakia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "slovakia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=slovakia");
    expect(result.stdout).toContain("lineage=country-package-slovakia");
    expect(result.stdout).not.toContain("lineage=country-package-slovenia");
    expect(result.stdout).not.toContain("lineage=country-package-montenegro");
    expect(result.stdout).toContain("slovakia_offices=5871");
    expect(result.stdout).toContain("slovakia_current=5871");
    expect(result.stdout).toContain("slovakia_historical=0");
    expect(result.stdout).toContain("slovakia_draft_tier_municipal=5774");
    expect(result.stdout).toContain("slovakia_draft_tier_regional=16");
    expect(result.stdout).toContain("slovakia_draft_tier_national=2");
    expect(result.stdout).toContain("slovakia_draft_tier_other=79");
    expect(result.stdout).toContain("slovakia_schema_national=2");
    expect(result.stdout).toContain("slovakia_schema_regional=16");
    expect(result.stdout).toContain("slovakia_schema_municipal=5774");
    expect(result.stdout).toContain("slovakia_schema_other=79");
    expect(result.stdout).toContain("slovakia_result_rows=0");
    expect(result.stdout).toContain("slovakia_event_rows=0");
    expect(result.stdout).not.toContain("slovakia_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("slovakia_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("slovakia_documented_sources_omitted");
    expect(result.stdout).toContain("slovakia_sources=0");
    expect(result.stdout).toContain("slovakia_unresolved=10");
    expect(result.stdout).toContain("slovakia_open_holds=10");
    expect(result.stdout).toContain("slovakia_approved=0");
    expect(result.stdout).toContain("slovakia_needs_review=5871");
    expect(result.stdout).toContain("slovakia_direct_executive_offices=2935");
    expect(result.stdout).toContain("slovakia_councils_assemblies_chambers_delegation=2936");
    expect(result.stdout).toContain("slovakia_municipal_councils=2887");
    expect(result.stdout).toContain("slovakia_municipal_mayors=2887");
    expect(result.stdout).toContain("slovakia_city_part_councils=39");
    expect(result.stdout).toContain("slovakia_city_part_mayors=39");
    expect(result.stdout).toContain("slovakia_vuc_assemblies=8");
    expect(result.stdout).toContain("slovakia_vuc_chairs=8");
    expect(result.stdout).toContain("slovakia_ep_offices=1");
    expect(result.stdout).toContain("slovakia_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("slovakia_research_dates=0");
    expect(result.stdout).toContain("slovakia_geographies=2935");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 5871 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'SK-NRSR'").get()).toMatchObject({
        office_type: "national_parliament",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'SK-PRESIDENT'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 5871 });
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
      expect(lineages).toEqual(["country-package-slovakia"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Slovakia");
    expect(atlasImportStatusMessage()).toContain("slovakia");
    expect(atlasImportStatusMessage()).toContain("does not import Slovakia");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-slovakia-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-slovakia-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
  });
});
