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
      timeout: 120_000,
    },
  );
}

describe("atlas CLI Bosnia and Herzegovina", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Bosnia Prompt AW and does not treat all as Bosnia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-bosnia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "bosnia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=bosnia");
    expect(result.stdout).toContain("lineage=country-package-bosnia-and-herzegovina");
    expect(result.stdout).not.toContain("lineage=country-package-iceland");
    expect(result.stdout).not.toContain("lineage=country-package-italy");
    expect(result.stdout).toContain("bosnia_offices=346");
    expect(result.stdout).toContain("bosnia_current=306");
    expect(result.stdout).toContain("bosnia_historical=40");
    expect(result.stdout).toContain("bosnia_draft_tier_national=4");
    expect(result.stdout).toContain("bosnia_draft_tier_regional=15");
    expect(result.stdout).toContain("bosnia_draft_tier_municipal=327");
    expect(result.stdout).toContain("bosnia_schema_national=4");
    expect(result.stdout).toContain("bosnia_schema_regional=15");
    expect(result.stdout).toContain("bosnia_schema_municipal=327");
    expect(result.stdout).toContain("bosnia_schema_other=0");
    expect(result.stdout).toContain("bosnia_result_rows=0");
    expect(result.stdout).toContain("bosnia_event_rows=0");
    expect(result.stdout).not.toContain("bosnia_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("bosnia_documented_event_rows_omitted");
    expect(result.stdout).toContain("bosnia_sources=0");
    expect(result.stdout).toContain("bosnia_unresolved=9");
    expect(result.stdout).toContain("bosnia_open_holds=9");
    expect(result.stdout).toContain("bosnia_approved=0");
    expect(result.stdout).toContain("bosnia_needs_review=346");
    expect(result.stdout).toContain("bosnia_direct_executive_offices=148");
    expect(result.stdout).toContain("bosnia_current_councils_chambers_assemblies=158");
    expect(result.stdout).toContain("bosnia_current_state=4");
    expect(result.stdout).toContain("bosnia_current_entity=5");
    expect(result.stdout).toContain("bosnia_current_canton=10");
    expect(result.stdout).toContain("bosnia_current_municipal_local=287");
    expect(result.stdout).toContain("bosnia_ep_offices=0");
    expect(result.stdout).toContain("bosnia_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("bosnia_research_dates=0");
    expect(result.stdout).toContain("bosnia_geographies=160");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 346 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 306 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 40 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'BA-NAT-HOR'").get()).toMatchObject({
        office_type: "legislative_chamber",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'BA-NAT-PRES-BOSNIAK'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'BA-REG-RS-PRES'").get()).toMatchObject({
        tier: "regional",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 9 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-bosnia-and-herzegovina"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Bosnia and Herzegovina");
    expect(atlasImportStatusMessage()).toContain("bosnia");
    expect(atlasImportStatusMessage()).toContain("does not import Bosnia and Herzegovina");
    expect(atlasImportStatusMessage()).toContain("does not import Iceland");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-bosnia-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-bosnia-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("bosnia");
  });
});
