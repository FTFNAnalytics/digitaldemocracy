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

describe("atlas CLI Montenegro", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Montenegro Prompt AY and does not treat all as Montenegro", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-montenegro-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "montenegro",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=montenegro");
    expect(result.stdout).toContain("lineage=country-package-montenegro");
    expect(result.stdout).not.toContain("lineage=country-package-bosnia-and-herzegovina");
    expect(result.stdout).not.toContain("lineage=country-package-albania");
    expect(result.stdout).toContain("montenegro_offices=29");
    expect(result.stdout).toContain("montenegro_current=27");
    expect(result.stdout).toContain("montenegro_historical=2");
    expect(result.stdout).toContain("montenegro_draft_tier_national=2");
    expect(result.stdout).toContain("montenegro_draft_tier_municipal=27");
    expect(result.stdout).toContain("montenegro_schema_national=2");
    expect(result.stdout).toContain("montenegro_schema_regional=0");
    expect(result.stdout).toContain("montenegro_schema_municipal=27");
    expect(result.stdout).toContain("montenegro_schema_other=0");
    expect(result.stdout).toContain("montenegro_result_rows=0");
    expect(result.stdout).toContain("montenegro_event_rows=0");
    expect(result.stdout).not.toContain("montenegro_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("montenegro_documented_event_rows_omitted");
    expect(result.stdout).not.toContain("montenegro_documented_sources_omitted");
    expect(result.stdout).toContain("montenegro_sources=0");
    expect(result.stdout).toContain("montenegro_unresolved=11");
    expect(result.stdout).toContain("montenegro_open_holds=11");
    expect(result.stdout).toContain("montenegro_approved=0");
    expect(result.stdout).toContain("montenegro_needs_review=29");
    expect(result.stdout).toContain("montenegro_direct_executive_offices=1");
    expect(result.stdout).toContain("montenegro_direct_local_executive_offices=0");
    expect(result.stdout).toContain("montenegro_current_local_assemblies=25");
    expect(result.stdout).toContain("montenegro_ep_offices=0");
    expect(result.stdout).toContain("montenegro_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("montenegro_research_dates=0");
    expect(result.stdout).toContain("montenegro_geographies=28");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 29 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'ME-NAT-PARLIAMENT'").get()).toMatchObject({
        office_type: "national_legislature",
        name: "Skupština Crne Gore",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'ME-NAT-PRESIDENT'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 2 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current' AND office_type = 'local_assembly'").get()).toMatchObject({
        n: 25,
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 11 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-montenegro"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Montenegro");
    expect(atlasImportStatusMessage()).toContain("montenegro");
    expect(atlasImportStatusMessage()).toContain("does not import Montenegro");
    expect(atlasImportStatusMessage()).toContain("does not import Bosnia and Herzegovina");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-montenegro-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-montenegro-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
  });
});
