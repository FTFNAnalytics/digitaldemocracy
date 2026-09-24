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

describe("atlas CLI Iceland", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Iceland Prompt AV and does not treat all as Iceland", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-iceland-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "iceland",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=iceland");
    expect(result.stdout).toContain("lineage=country-package-iceland");
    expect(result.stdout).not.toContain("lineage=country-package-italy");
    expect(result.stdout).not.toContain("lineage=country-package-united-kingdom");
    expect(result.stdout).toContain("iceland_offices=87");
    expect(result.stdout).toContain("iceland_current=63");
    expect(result.stdout).toContain("iceland_historical=24");
    expect(result.stdout).toContain("iceland_draft_tier_national=2");
    expect(result.stdout).toContain("iceland_draft_tier_municipal=85");
    expect(result.stdout).toContain("iceland_schema_national=2");
    expect(result.stdout).toContain("iceland_schema_regional=0");
    expect(result.stdout).toContain("iceland_schema_municipal=85");
    expect(result.stdout).toContain("iceland_schema_other=0");
    expect(result.stdout).toContain("iceland_result_rows=0");
    expect(result.stdout).toContain("iceland_event_rows=0");
    expect(result.stdout).not.toContain("iceland_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("iceland_documented_event_rows_omitted");
    expect(result.stdout).toContain("iceland_sources=0");
    expect(result.stdout).toContain("iceland_unresolved=6");
    expect(result.stdout).toContain("iceland_open_holds=2");
    expect(result.stdout).toContain("iceland_closed_gaps=4");
    expect(result.stdout).toContain("iceland_approved=0");
    expect(result.stdout).toContain("iceland_needs_review=87");
    expect(result.stdout).toContain("iceland_direct_executive_offices=1");
    expect(result.stdout).toContain("iceland_direct_municipal_executive_offices=0");
    expect(result.stdout).toContain("iceland_ep_offices=0");
    expect(result.stdout).toContain("iceland_explicit_predecessor_edges=24");
    expect(result.stdout).toContain("iceland_research_dates=0");
    expect(result.stdout).toContain("iceland_geographies=86");
    expect(result.stdout).toContain("iceland_current_municipal_councils=61");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 87 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'IS-NAT-ALTHINGI'").get()).toMatchObject({
        office_type: "legislature",
        name: "Alþingi",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'IS-NAT-PRESIDENT'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 24 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current' AND office_type = 'municipal_council'").get()).toMatchObject({
        n: 61,
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 24 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 6 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-iceland"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Iceland");
    expect(atlasImportStatusMessage()).toContain("iceland");
    expect(atlasImportStatusMessage()).toContain("does not import Iceland");
    expect(atlasImportStatusMessage()).toContain("does not import Italy");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-iceland-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-iceland-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("iceland");
  });
});
