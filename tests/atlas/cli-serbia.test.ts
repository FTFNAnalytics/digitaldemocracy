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

describe("atlas CLI Serbia", () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("import:atlas loads Serbia Prompt AX and does not treat all as Serbia", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-serbia-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runAtlasImport({
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "serbia",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("scope=serbia");
    expect(result.stdout).toContain("lineage=country-package-serbia");
    expect(result.stdout).not.toContain("lineage=country-package-montenegro");
    expect(result.stdout).toContain("serbia_offices=178");
    expect(result.stdout).toContain("serbia_current=173");
    expect(result.stdout).toContain("serbia_historical=5");
    expect(result.stdout).toContain("serbia_draft_tier_national=2");
    expect(result.stdout).toContain("serbia_draft_tier_regional=1");
    expect(result.stdout).toContain("serbia_draft_tier_municipal=175");
    expect(result.stdout).toContain("serbia_schema_national=2");
    expect(result.stdout).toContain("serbia_schema_regional=1");
    expect(result.stdout).toContain("serbia_schema_municipal=175");
    expect(result.stdout).toContain("serbia_schema_other=0");
    expect(result.stdout).toContain("serbia_result_rows=0");
    expect(result.stdout).toContain("serbia_event_rows=0");
    expect(result.stdout).toContain("serbia_sources=0");
    expect(result.stdout).toContain("serbia_unresolved=11");
    expect(result.stdout).toContain("serbia_open_holds=11");
    expect(result.stdout).toContain("serbia_approved=0");
    expect(result.stdout).toContain("serbia_needs_review=178");
    expect(result.stdout).toContain("serbia_kosovo_scope_offices=0");
    expect(result.stdout).toContain("serbia_ep_offices=0");
    expect(result.stdout).toContain("serbia_explicit_predecessor_edges=5");
    expect(result.stdout).toContain("serbia_direct_local_executive_offices=0");
    expect(result.stdout).not.toContain("serbia_documented_result_rows_omitted");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 178 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 5 });
      expect(master.prepare("SELECT research_coverage_complete FROM dataset_release").get()).toMatchObject({ research_coverage_complete: 0 });
      const lineages = master.prepare("SELECT lineage_id FROM publication_release").all().map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-serbia"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("does not import Serbia");
    expect(atlasImportStatusMessage()).toContain("Kosovo-scope offices stay 0");
  });
});
