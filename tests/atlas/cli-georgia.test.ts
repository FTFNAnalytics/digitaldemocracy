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

describe("atlas CLI Georgia", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Georgia Prompt BG and does not treat all as Georgia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-georgia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "georgia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=georgia");
    expect(result.stdout).toContain("lineage=country-package-georgia");
    expect(result.stdout).not.toContain("lineage=country-package-uruguay");
    expect(result.stdout).not.toContain("lineage=country-package-ukraine");
    expect(result.stdout).toContain("georgia_offices=176");
    expect(result.stdout).toContain("georgia_current=135");
    expect(result.stdout).toContain("georgia_ordinary_cycle=130");
    expect(result.stdout).toContain("georgia_statutory_continuation=5");
    expect(result.stdout).toContain("georgia_historical=41");
    expect(result.stdout).toContain("georgia_draft_tier_national=3");
    expect(result.stdout).toContain("georgia_draft_tier_regional=5");
    expect(result.stdout).toContain("georgia_draft_tier_local=168");
    expect(result.stdout).toContain("georgia_schema_national=3");
    expect(result.stdout).toContain("georgia_schema_regional=5");
    expect(result.stdout).toContain("georgia_schema_municipal=168");
    expect(result.stdout).toContain("georgia_schema_other=0");
    expect(result.stdout).toContain("georgia_result_rows=0");
    expect(result.stdout).toContain("georgia_event_rows=0");
    expect(result.stdout).not.toContain("georgia_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("georgia_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("georgia_documented_sources_omitted");
    expect(result.stdout).toContain("georgia_sources=0");
    expect(result.stdout).toContain("georgia_unresolved=21");
    expect(result.stdout).toContain("georgia_open_holds=21");
    expect(result.stdout).toContain("georgia_approved=0");
    expect(result.stdout).toContain("georgia_needs_review=176");
    expect(result.stdout).toContain("georgia_current_direct_executives=64");
    expect(result.stdout).toContain("georgia_historical_direct_executives=17");
    expect(result.stdout).toContain("georgia_current_mayors=64");
    expect(result.stdout).toContain("georgia_current_municipal_councils=69");
    expect(result.stdout).toContain("georgia_parliament=1");
    expect(result.stdout).toContain("georgia_adjara_supreme_council=1");
    expect(result.stdout).toContain("georgia_ep_offices=0");
    expect(result.stdout).toContain("georgia_parallel_institution_offices=0");
    expect(result.stdout).toContain("georgia_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("georgia_research_dates=0");
    expect(result.stdout).toContain("georgia_applied_calendar_rows=0");
    expect(result.stdout).toContain("georgia_geographies=92");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 176 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'GE-N-PARL'").get()).toMatchObject({
        office_type: "parliament",
        name: "Parliament of Georgia",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'GE-A-ADJ-SC'").get()).toMatchObject({
        tier: "regional",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 41 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 135 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 21 });
      expect(master.prepare("SELECT country_code FROM country").get()).toMatchObject({ country_code: "GE" });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-georgia"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Georgia");
    expect(atlasImportStatusMessage()).toContain("georgia");
    expect(atlasImportStatusMessage()).toContain("does not import Georgia");
    expect(atlasImportStatusMessage()).toContain("does not import Uruguay");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-georgia-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-georgia-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("georgia");
  });
});
