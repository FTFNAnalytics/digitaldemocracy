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

describe("atlas CLI Moldova", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Moldova Prompt BC and does not treat all as Moldova", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-moldova-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "moldova",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=moldova");
    expect(result.stdout).toContain("lineage=country-package-moldova");
    expect(result.stdout).not.toContain("lineage=country-package-slovakia");
    expect(result.stdout).not.toContain("lineage=country-package-slovenia");
    expect(result.stdout).toContain("moldova_offices=1836");
    expect(result.stdout).toContain("moldova_current=1822");
    expect(result.stdout).toContain("moldova_historical=14");
    expect(result.stdout).toContain("moldova_draft_tier_national=2");
    expect(result.stdout).toContain("moldova_draft_tier_autonomous=2");
    expect(result.stdout).toContain("moldova_draft_tier_raion=32");
    expect(result.stdout).toContain("moldova_draft_tier_municipal=1800");
    expect(result.stdout).toContain("moldova_schema_national=2");
    expect(result.stdout).toContain("moldova_schema_regional=34");
    expect(result.stdout).toContain("moldova_schema_municipal=1800");
    expect(result.stdout).toContain("moldova_schema_other=0");
    expect(result.stdout).toContain("moldova_result_rows=0");
    expect(result.stdout).toContain("moldova_event_rows=0");
    expect(result.stdout).not.toContain("moldova_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("moldova_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("moldova_documented_sources_omitted");
    expect(result.stdout).toContain("moldova_sources=0");
    expect(result.stdout).toContain("moldova_unresolved=24");
    expect(result.stdout).toContain("moldova_open_holds=24");
    expect(result.stdout).toContain("moldova_approved=0");
    expect(result.stdout).toContain("moldova_needs_review=1836");
    expect(result.stdout).toContain("moldova_current_direct_executives=895");
    expect(result.stdout).toContain("moldova_historical_direct_executives=7");
    expect(result.stdout).toContain("moldova_ep_offices=0");
    expect(result.stdout).toContain("moldova_transnistria_parallel_offices=0");
    expect(result.stdout).toContain("moldova_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("moldova_research_dates=0");
    expect(result.stdout).toContain("moldova_geographies=934");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 1836 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'MD-NAT-PARL'").get()).toMatchObject({
        office_type: "national_assembly",
        name: "Parlamentul Republicii Moldova",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'MD-NAT-PRES'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 14 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 1822 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 24 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-moldova"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Moldova");
    expect(atlasImportStatusMessage()).toContain("moldova");
    expect(atlasImportStatusMessage()).toContain("does not import Moldova");
    expect(atlasImportStatusMessage()).toContain("does not import Slovakia");
    expect(atlasImportStatusMessage()).toContain("does not import Slovenia");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-moldova-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-moldova-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
  });
});
