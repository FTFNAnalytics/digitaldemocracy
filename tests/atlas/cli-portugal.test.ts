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
    },
  );
}

describe("Portugal import:atlas CLI", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Portugal Prompt AD 10666 current + 8168 historical offices",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-portugal-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "portugal",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-portugal");
      expect(result.stdout).toContain("portugal_offices=18834");
      expect(result.stdout).toContain("portugal_current=10666");
      expect(result.stdout).toContain("portugal_historical=8168");
      expect(result.stdout).toContain("portugal_municipal=927");
      expect(result.stdout).toContain("portugal_regional=2");
      expect(result.stdout).toContain("portugal_national=2");
      expect(result.stdout).toContain("portugal_other=17903");
      expect(result.stdout).toContain("portugal_selected_histories=19820");
      expect(result.stdout).toContain("portugal_prospective_events=0");
      expect(result.stdout).toContain("portugal_result_rows=66283");
      expect(result.stdout).toContain("portugal_proceedings=2");
      expect(result.stdout).toContain("portugal_unresolved=347");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 18834 });
        expect(master.prepare("SELECT geography_id FROM office WHERE office_id = 'PT-F0302FA-AF'").get()).toMatchObject({
          geography_id: "PT-F0302FA",
        });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get(),
        ).toMatchObject({ n: 8168 });
        expect(
          master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'PT-F010103-AF'").get(),
        ).toMatchObject({ tier: "other" });
        expect(
          master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'PT-AC-AL'").get(),
        ).toMatchObject({ tier: "regional" });
        expect(
          master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'PT-PR'").get(),
        ).toMatchObject({ tier: "national_context" });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id LIKE '%-PCM'").get()).toMatchObject({
          n: 0,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 2 });
        expect(
          master.prepare("SELECT supersedes_id FROM proceeding WHERE proceeding_id = 'proceeding-e965271501d97b172edf53d9'").get(),
        ).toMatchObject({ supersedes_id: null });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Portugal");
      expect(atlasImportStatusMessage()).toContain("portugal");
    },
    300_000,
  );
});
