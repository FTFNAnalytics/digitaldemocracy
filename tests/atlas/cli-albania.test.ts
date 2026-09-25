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

describe("atlas CLI Albania", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Albania Prompt BA and does not treat all as Albania", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-albania-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "albania",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("import:atlas");
    expect(result.stdout).toContain("scope=albania");
    expect(result.stdout).toContain("lineage=country-package-albania");
    expect(result.stdout).not.toContain("lineage=country-package-bosnia-and-herzegovina");
    expect(result.stdout).not.toContain("lineage=country-package-iceland");
    expect(result.stdout).toContain("albania_offices=891");
    expect(result.stdout).toContain("albania_current=123");
    expect(result.stdout).toContain("albania_historical=768");
    expect(result.stdout).toContain("albania_draft_tier_national=1");
    expect(result.stdout).toContain("albania_draft_tier_municipal=868");
    expect(result.stdout).toContain("albania_draft_tier_other=22");
    expect(result.stdout).toContain("albania_schema_national=1");
    expect(result.stdout).toContain("albania_schema_regional=0");
    expect(result.stdout).toContain("albania_schema_municipal=868");
    expect(result.stdout).toContain("albania_schema_other=22");
    expect(result.stdout).toContain("albania_result_rows=0");
    expect(result.stdout).toContain("albania_event_rows=0");
    expect(result.stdout).not.toContain("albania_documented_result_rows_omitted");
    expect(result.stdout).not.toContain("albania_documented_event_rows_omitted");
    expect(result.stdout).toContain("albania_sources=0");
    expect(result.stdout).toContain("albania_unresolved=21");
    expect(result.stdout).toContain("albania_open_holds=21");
    expect(result.stdout).toContain("albania_approved=0");
    expect(result.stdout).toContain("albania_needs_review=891");
    expect(result.stdout).toContain("albania_current_direct_executives=61");
    expect(result.stdout).toContain("albania_historical_direct_executives=384");
    expect(result.stdout).toContain("albania_current_mayors=61");
    expect(result.stdout).toContain("albania_current_councils=61");
    expect(result.stdout).toContain("albania_ep_offices=0");
    expect(result.stdout).toContain("albania_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("albania_geographies=891");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 891 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 123 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 768 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT office_type, geography_id FROM office WHERE office_id = 'AL-13-M'").get()).toMatchObject({
        office_type: "mayor",
        geography_id: "geo-99a7b8d0e325a448c5e7c7ca",
      });
      expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'AL-NAT-ASSEMBLY'").get()).toMatchObject({
        tier: "national_context",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 21 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({
        research_coverage_complete: 0,
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-albania"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("Albania");
    expect(atlasImportStatusMessage()).toContain("albania");
    expect(atlasImportStatusMessage()).toContain("does not import Albania");
    expect(atlasImportStatusMessage()).toContain("does not import Bosnia and Herzegovina");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-albania-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-albania-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("albania");
  });
});
