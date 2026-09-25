import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atlasImportStatusMessage } from "../../lib/atlas/import-status";

const repoRoot = path.join(import.meta.dirname, "../..");

function runAtlasImport(env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, ["--experimental-sqlite", "--no-warnings", "--import", "tsx", "scripts/atlas/import.ts"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 120_000,
  });
}

describe("atlas CLI North Macedonia", () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("import:atlas loads North Macedonia Prompt AZ and does not treat all as North Macedonia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-north-macedonia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "north_macedonia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("scope=north_macedonia");
    expect(result.stdout).toContain("lineage=country-package-north-macedonia");
    expect(result.stdout).not.toContain("lineage=country-package-montenegro");
    expect(result.stdout).toContain("north_macedonia_offices=172");
    expect(result.stdout).toContain("north_macedonia_current=164");
    expect(result.stdout).toContain("north_macedonia_historical=8");
    expect(result.stdout).toContain("north_macedonia_draft_tier_national=2");
    expect(result.stdout).toContain("north_macedonia_draft_tier_municipal=170");
    expect(result.stdout).toContain("north_macedonia_schema_national=2");
    expect(result.stdout).toContain("north_macedonia_schema_regional=0");
    expect(result.stdout).toContain("north_macedonia_schema_municipal=170");
    expect(result.stdout).toContain("north_macedonia_schema_other=0");
    expect(result.stdout).toContain("north_macedonia_result_rows=0");
    expect(result.stdout).toContain("north_macedonia_event_rows=0");
    expect(result.stdout).toContain("north_macedonia_sources=0");
    expect(result.stdout).toContain("north_macedonia_unresolved=23");
    expect(result.stdout).toContain("north_macedonia_open_holds=16");
    expect(result.stdout).toContain("north_macedonia_closed_gaps=7");
    expect(result.stdout).toContain("north_macedonia_approved=0");
    expect(result.stdout).toContain("north_macedonia_needs_review=172");
    expect(result.stdout).toContain("north_macedonia_current_direct_executives=82");
    expect(result.stdout).toContain("north_macedonia_current_local_direct_executives=81");
    expect(result.stdout).toContain("north_macedonia_current_councils=81");
    expect(result.stdout).toContain("north_macedonia_current_mayors=81");
    expect(result.stdout).toContain("north_macedonia_ep_offices=0");
    expect(result.stdout).toContain("north_macedonia_regional_offices=0");
    expect(result.stdout).toContain("north_macedonia_explicit_predecessor_edges=0");
    expect(result.stdout).toContain("north_macedonia_geographies=86");
    expect(result.stdout).not.toContain("north_macedonia_documented_result_rows_omitted");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 172 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({ research_coverage_complete: 0 });
      const lineages = master.prepare("SELECT lineage_id FROM publication_release").all().map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-north-macedonia"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("ATLAS_IMPORT_SCOPE=north_macedonia");
    expect(atlasImportStatusMessage()).toContain("does not import North Macedonia");
  });
});
