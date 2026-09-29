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

describe("atlas CLI Ukraine", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Ukraine Prompt BD and does not treat all as Ukraine", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-ukraine-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "ukraine",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=ukraine");
    expect(result.stdout).toContain("lineage=country-package-ukraine");
    expect(result.stdout).not.toContain("lineage=country-package-moldova");
    expect(result.stdout).not.toContain("lineage=country-package-montenegro");
    expect(result.stdout).toContain("ukraine_offices=3005");
    expect(result.stdout).toContain("ukraine_current=3000");
    expect(result.stdout).toContain("ukraine_historical=5");
    expect(result.stdout).toContain("ukraine_draft_tier_national=2");
    expect(result.stdout).toContain("ukraine_draft_tier_regional=24");
    expect(result.stdout).toContain("ukraine_draft_tier_autonomous=1");
    expect(result.stdout).toContain("ukraine_draft_tier_raion=120");
    expect(result.stdout).toContain("ukraine_draft_tier_local=2843");
    expect(result.stdout).toContain("ukraine_draft_tier_city_district=15");
    expect(result.stdout).toContain("ukraine_schema_national=2");
    expect(result.stdout).toContain("ukraine_schema_regional=145");
    expect(result.stdout).toContain("ukraine_schema_municipal=2858");
    expect(result.stdout).toContain("ukraine_schema_other=0");
    expect(result.stdout).toContain("ukraine_result_rows=0");
    expect(result.stdout).toContain("ukraine_event_rows=0");
    expect(result.stdout).not.toContain("ukraine_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("ukraine_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("ukraine_documented_sources_omitted");
    expect(result.stdout).toContain("ukraine_sources=0");
    expect(result.stdout).toContain("ukraine_unresolved=19");
    expect(result.stdout).toContain("ukraine_open_holds=19");
    expect(result.stdout).toContain("ukraine_approved=0");
    expect(result.stdout).toContain("ukraine_needs_review=3005");
    expect(result.stdout).toContain("ukraine_current_direct_executives=1422");
    expect(result.stdout).toContain("ukraine_historical_direct_executives=0");
    expect(result.stdout).toContain("ukraine_current_councils=1577");
    expect(result.stdout).toContain("ukraine_current_legislatures=1");
    expect(result.stdout).toContain("ukraine_ep_offices=0");
    expect(result.stdout).toContain("ukraine_occupying_power_offices=0");
    expect(result.stdout).toContain("ukraine_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("ukraine_research_dates=0");
    expect(result.stdout).toContain("ukraine_geographies=1583");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 3005 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'UA-NAT-PARL'").get()).toMatchObject({
        office_type: "national_assembly",
        name: "Верховна Рада України",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'UA-NAT-PRES'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 5 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 3000 });
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
      expect(lineages).toEqual(["country-package-ukraine"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Ukraine");
    expect(atlasImportStatusMessage()).toContain("ukraine");
    expect(atlasImportStatusMessage()).toContain("does not import Ukraine");
    expect(atlasImportStatusMessage()).toContain("does not import Moldova");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-ukraine-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-ukraine-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("ukraine");
  });
});
