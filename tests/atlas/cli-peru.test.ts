import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atlasImportStatusMessage } from "../../lib/atlas/import-status";

const repoRoot = path.join(import.meta.dirname, "../..");

function runNode(script: string, args: string[], env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, ["--experimental-sqlite", "--no-warnings", "--import", "tsx", script, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 240_000,
  });
}

describe("atlas CLI Peru", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("import:atlas loads Peru Prompt BK and derive:atlas:country reads that country", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-peru-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const result = runNode("scripts/atlas/import.ts", [], {
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
      ATLAS_OPERATOR: "atlas-cli-test",
      ATLAS_IMPORT_SCOPE: "peru",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("scope=peru");
    expect(result.stdout).toContain("lineage=country-package-peru");
    expect(result.stdout).toContain("peru_offices=3841");
    expect(result.stdout).toContain("peru_current=3840");
    expect(result.stdout).toContain("peru_historical=1");
    expect(result.stdout).toContain("peru_current_research_accepted=3838");
    expect(result.stdout).toContain("peru_current_held=2");
    expect(result.stdout).toContain("peru_draft_tier_national_context=5");
    expect(result.stdout).toContain("peru_draft_tier_regional=50");
    expect(result.stdout).toContain("peru_draft_tier_municipal=3786");
    expect(result.stdout).toContain("peru_result_rows=0");
    expect(result.stdout).toContain("peru_event_rows=0");
    expect(result.stdout).toContain("peru_sources=0");
    expect(result.stdout).toContain("peru_open_holds=18");
    expect(result.stdout).toContain("peru_needs_review=3841");
    expect(result.stdout).toContain("peru_applied_calendar_rows=0");
    expect(result.stdout).toContain("peru_upcoming_calendar_rows=18");
    expect(result.stdout).toContain("peru_centros_poblados_offices=0");
    expect(result.stdout).toContain("peru_ep_offices=0");
    expect(result.stdout).toContain("peru_mercosur_offices=0");
    expect(result.stdout).toContain("peru_andean_offices=1");
    expect(result.stdout).not.toContain("peru_documented_result_rows_omitted");

    const derived = runNode("scripts/atlas/derive.ts", ["--country=peru"], {
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_IMPORT_SCOPE: "peru",
    });
    expect(derived.status, derived.stderr).toBe(0);
    expect(derived.stdout).toContain("derive:atlas:country");
    expect(derived.stdout).toContain("country_id=peru");
    expect(derived.stdout).toContain("office_slugs=3841");

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'current'").get()).toMatchObject({ n: 3840 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT coverage_status FROM country WHERE country_id = 'peru'").get()).toMatchObject({
        coverage_status: "partial",
      });
      const lineages = master
        .prepare("SELECT lineage_id FROM publication_release")
        .all()
        .map((row) => String(row.lineage_id));
      expect(lineages).toEqual(["country-package-peru"]);
    } finally {
      master.close();
    }

    expect(atlasImportStatusMessage()).toContain("ATLAS_IMPORT_SCOPE=peru");
    expect(atlasImportStatusMessage()).toContain("does not import Peru");
  });

  it("rejects an unknown ATLAS_IMPORT_SCOPE", () => {
    const result = runNode("scripts/atlas/import.ts", [], {
      ATLAS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-peru-unused.sqlite"),
      ATLAS_ATTEMPTS_SQLITE_PATH: path.join(os.tmpdir(), "atlas-peru-unused-attempts.sqlite"),
      ATLAS_IMPORT_SCOPE: "europe",
      OBSERVATORY_FIXTURES: "",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown ATLAS_IMPORT_SCOPE");
    expect(result.stderr).toContain("peru");
  });
});
