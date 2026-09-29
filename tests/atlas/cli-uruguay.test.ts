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

describe("atlas CLI Uruguay", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Uruguay Prompt BF and does not treat all as Uruguay", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-uruguay-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "uruguay",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=uruguay");
    expect(result.stdout).toContain("lineage=country-package-uruguay");
    expect(result.stdout).not.toContain("lineage=country-package-ukraine");
    expect(result.stdout).not.toContain("lineage=country-package-moldova");
    expect(result.stdout).toContain("uruguay_offices=338");
    expect(result.stdout).toContain("uruguay_current=314");
    expect(result.stdout).toContain("uruguay_historical=24");
    expect(result.stdout).toContain("uruguay_draft_tier_national=6");
    expect(result.stdout).toContain("uruguay_draft_tier_regional=57");
    expect(result.stdout).toContain("uruguay_draft_tier_local=275");
    expect(result.stdout).toContain("uruguay_schema_national=6");
    expect(result.stdout).toContain("uruguay_schema_regional=57");
    expect(result.stdout).toContain("uruguay_schema_municipal=275");
    expect(result.stdout).toContain("uruguay_schema_other=0");
    expect(result.stdout).toContain("uruguay_result_rows=0");
    expect(result.stdout).toContain("uruguay_event_rows=0");
    expect(result.stdout).not.toContain("uruguay_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("uruguay_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("uruguay_documented_sources_omitted");
    expect(result.stdout).toContain("uruguay_sources=0");
    expect(result.stdout).toContain("uruguay_unresolved=15");
    expect(result.stdout).toContain("uruguay_open_holds=14");
    expect(result.stdout).toContain("uruguay_documented_not_implemented=1");
    expect(result.stdout).toContain("uruguay_approved=0");
    expect(result.stdout).toContain("uruguay_needs_review=338");
    expect(result.stdout).toContain("uruguay_current_popular_executive_roles=157");
    expect(result.stdout).toContain("uruguay_current_list_selected_alcaldes=136");
    expect(result.stdout).toContain("uruguay_current_councils=155");
    expect(result.stdout).toContain("uruguay_current_national_chambers=2");
    expect(result.stdout).toContain("uruguay_current_intendentes=19");
    expect(result.stdout).toContain("uruguay_separate_executive_ballot_offices=20");
    expect(result.stdout).toContain("uruguay_ep_offices=0");
    expect(result.stdout).toContain("uruguay_mercosur_offices=0");
    expect(result.stdout).toContain("uruguay_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("uruguay_research_dates=0");
    expect(result.stdout).toContain("uruguay_applied_calendar_rows=0");
    expect(result.stdout).toContain("uruguay_geographies=159");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 338 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'UY-N-PRES'").get()).toMatchObject({
        office_type: "president",
        name: "Presidente de la República",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'UY-N-SEN'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 24 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 314 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 15 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-uruguay"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Uruguay");
    expect(atlasImportStatusMessage()).toContain("uruguay");
    expect(atlasImportStatusMessage()).toContain("does not import Uruguay");
    expect(atlasImportStatusMessage()).toContain("does not import Ukraine");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-uruguay-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-uruguay-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("uruguay");
  });
});
