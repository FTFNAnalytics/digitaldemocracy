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

describe("atlas CLI Kosovo", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Kosovo Prompt BH and does not treat all as Kosovo", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-kosovo-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "kosovo",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=kosovo");
    expect(result.stdout).toContain("lineage=country-package-kosovo");
    expect(result.stdout).not.toContain("lineage=country-package-serbia");
    expect(result.stdout).not.toContain("lineage=country-package-georgia");
    expect(result.stdout).toContain("kosovo_offices=138");
    expect(result.stdout).toContain("kosovo_current=77");
    expect(result.stdout).toContain("kosovo_historical=61");
    expect(result.stdout).toContain("kosovo_draft_tier_national=2");
    expect(result.stdout).toContain("kosovo_draft_tier_municipal=136");
    expect(result.stdout).toContain("kosovo_schema_national=2");
    expect(result.stdout).toContain("kosovo_schema_regional=0");
    expect(result.stdout).toContain("kosovo_schema_municipal=136");
    expect(result.stdout).toContain("kosovo_schema_other=0");
    expect(result.stdout).toContain("kosovo_result_rows=0");
    expect(result.stdout).toContain("kosovo_event_rows=0");
    expect(result.stdout).not.toContain("kosovo_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("kosovo_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("kosovo_documented_sources_omitted");
    expect(result.stdout).toContain("kosovo_sources=0");
    expect(result.stdout).toContain("kosovo_unresolved=19");
    expect(result.stdout).toContain("kosovo_open_holds=19");
    expect(result.stdout).toContain("kosovo_approved=0");
    expect(result.stdout).toContain("kosovo_needs_review=138");
    expect(result.stdout).toContain("kosovo_current_direct_executives=38");
    expect(result.stdout).toContain("kosovo_historical_direct_executives=30");
    expect(result.stdout).toContain("kosovo_current_mayors=38");
    expect(result.stdout).toContain("kosovo_current_municipal_assemblies=38");
    expect(result.stdout).toContain("kosovo_assembly=1");
    expect(result.stdout).toContain("kosovo_historical_assembly=1");
    expect(result.stdout).toContain("kosovo_ep_offices=0");
    expect(result.stdout).toContain("kosovo_serbia_scope_offices=0");
    expect(result.stdout).toContain("kosovo_popular_president_offices=0");
    expect(result.stdout).toContain("kosovo_popular_regional_offices=0");
    expect(result.stdout).toContain("kosovo_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("kosovo_research_dates=0");
    expect(result.stdout).toContain("kosovo_applied_calendar_rows=0");
    expect(result.stdout).toContain("kosovo_geographies=69");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 138 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'XK-NAT-ASSEMBLY'").get()).toMatchObject({
        office_type: "national_legislature",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'XK-01-M'").get()).toMatchObject({
        tier: "municipal",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 61 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 77 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 19 });
      expect(master.prepare("SELECT country_code FROM country").get()).toMatchObject({ country_code: "XK" });
      expect(master.prepare("SELECT COUNT(*) AS n FROM country WHERE country_id = 'serbia'").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-kosovo"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Kosovo");
    expect(atlasImportStatusMessage()).toContain("kosovo");
    expect(atlasImportStatusMessage()).toContain("does not import Kosovo");
    expect(atlasImportStatusMessage()).toContain("does not import Serbia");
    expect(atlasImportStatusMessage()).toContain("does not import Georgia");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-kosovo-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-kosovo-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("kosovo");
  });
});
