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

describe("atlas CLI Chile", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Chile Prompt BJ and does not treat all as Chile", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-chile-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "chile",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=chile");
    expect(result.stdout).toContain("lineage=country-package-chile");
    expect(result.stdout).not.toContain("lineage=country-package-uruguay");
    expect(result.stdout).not.toContain("lineage=country-package-kosovo");
    expect(result.stdout).toContain("chile_offices=727");
    expect(result.stdout).toContain("chile_current=725");
    expect(result.stdout).toContain("chile_historical=2");
    expect(result.stdout).toContain("chile_draft_tier_national_context=5");
    expect(result.stdout).toContain("chile_draft_tier_regional=32");
    expect(result.stdout).toContain("chile_draft_tier_municipal=690");
    expect(result.stdout).toContain("chile_schema_national=5");
    expect(result.stdout).toContain("chile_schema_regional=32");
    expect(result.stdout).toContain("chile_schema_municipal=690");
    expect(result.stdout).toContain("chile_schema_other=0");
    expect(result.stdout).toContain("chile_result_rows=0");
    expect(result.stdout).toContain("chile_event_rows=0");
    expect(result.stdout).not.toContain("chile_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("chile_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("chile_documented_sources_omitted");
    expect(result.stdout).toContain("chile_sources=0");
    expect(result.stdout).toContain("chile_unresolved=20");
    expect(result.stdout).toContain("chile_open_holds=20");
    expect(result.stdout).toContain("chile_approved=0");
    expect(result.stdout).toContain("chile_needs_review=727");
    expect(result.stdout).toContain("chile_current_direct_executives=362");
    expect(result.stdout).toContain("chile_current_councils=361");
    expect(result.stdout).toContain("chile_current_national_chambers=2");
    expect(result.stdout).toContain("chile_current_mayors=345");
    expect(result.stdout).toContain("chile_current_municipal_councils=345");
    expect(result.stdout).toContain("chile_current_governors=16");
    expect(result.stdout).toContain("chile_current_core=16");
    expect(result.stdout).toContain("chile_ep_offices=0");
    expect(result.stdout).toContain("chile_provincial_elected_offices=0");
    expect(result.stdout).toContain("chile_mercosur_offices=0");
    expect(result.stdout).toContain("chile_andean_offices=0");
    expect(result.stdout).toContain("chile_appointed_intendente_offices=0");
    expect(result.stdout).toContain("chile_comunas=346");
    expect(result.stdout).toContain("chile_municipal_administrations=345");
    expect(result.stdout).toContain("chile_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("chile_research_dates=0");
    expect(result.stdout).toContain("chile_applied_calendar_rows=0");
    expect(result.stdout).toContain("chile_geographies=362");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 727 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'cl-president'").get()).toMatchObject({
        office_type: "president",
        name: "Presidente de la República",
      });
      expect(master.prepare("SELECT tier, review_status FROM office_tier_classification WHERE office_id = 'cl-gov-01'").get()).toMatchObject({
        tier: "regional",
        review_status: "needs_review",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 2 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 725 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 20 });
      expect(master.prepare("SELECT country_code, coverage_status FROM country").get()).toMatchObject({
        country_code: "CL",
        coverage_status: "partial",
      });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-chile"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Chile");
    expect(atlasImportStatusMessage()).toContain("chile");
    expect(atlasImportStatusMessage()).toContain("does not import Chile");
    expect(atlasImportStatusMessage()).toContain("does not import Kosovo");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-chile-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-chile-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("chile");
  });
});
