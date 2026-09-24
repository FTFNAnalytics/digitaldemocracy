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

describe("atlas CLI Romania", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Romania Prompt AL 6460 current offices and does not treat all as Romania",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-romania-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "romania",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=romania");
      expect(result.stdout).toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).toContain("romania_offices=6460");
      expect(result.stdout).toContain("romania_current=6460");
      expect(result.stdout).toContain("romania_historical=0");
      expect(result.stdout).toContain("romania_municipal=6372");
      expect(result.stdout).toContain("romania_regional=84");
      expect(result.stdout).toContain("romania_national=3");
      expect(result.stdout).toContain("romania_other=1");
      expect(result.stdout).toContain("romania_selected_histories=19343");
      expect(result.stdout).toContain("romania_prospective_events=0");
      expect(result.stdout).toContain("romania_result_rows=23");
      expect(result.stdout).toContain("romania_proceedings=0");
      expect(result.stdout).toContain("romania_sources=6");
      expect(result.stdout).toContain("romania_unresolved=7");
      expect(result.stdout).toContain("romania_approved=0");
      expect(result.stdout).toContain("romania_needs_review=6460");
      expect(result.stdout).toContain("romania_current_councils=3230");
      expect(result.stdout).toContain("romania_current_direct_executive_offices=3229");
      expect(result.stdout).toContain("romania_geographies=3229");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 6460 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 19343 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 23 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'RO-PRES'").get()).toMatchObject({
          office_type: "president",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT legal_outcome FROM election_event WHERE event_id = 'RO-PRES-2024-R1'").get()).toMatchObject({
          legal_outcome: "annulled",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 0 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-romania"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Romania");
      expect(atlasImportStatusMessage()).toContain("romania");
      expect(atlasImportStatusMessage()).toContain("does not import Romania");
    },
    180_000,
  );
});
