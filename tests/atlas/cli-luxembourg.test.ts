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

describe("atlas CLI Luxembourg", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Luxembourg Prompt AO and does not treat all as Luxembourg",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-luxembourg-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "luxembourg",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=luxembourg");
      expect(result.stdout).toContain("lineage=country-package-luxembourg");
      expect(result.stdout).not.toContain("lineage=country-package-latvia");
      expect(result.stdout).not.toContain("lineage=country-package-lithuania");
      expect(result.stdout).not.toContain("lineage=country-package-hungary");
      expect(result.stdout).not.toContain("lineage=country-package-romania");
      expect(result.stdout).not.toContain("lineage=country-package-greece");
      expect(result.stdout).toContain("luxembourg_offices=130");
      expect(result.stdout).toContain("luxembourg_current=102");
      expect(result.stdout).toContain("luxembourg_historical=28");
      expect(result.stdout).toContain("luxembourg_municipal=128");
      expect(result.stdout).toContain("luxembourg_regional=0");
      expect(result.stdout).toContain("luxembourg_national=1");
      expect(result.stdout).toContain("luxembourg_other=1");
      expect(result.stdout).toContain("luxembourg_selected_histories=438");
      expect(result.stdout).toContain("luxembourg_prospective_events=0");
      expect(result.stdout).toContain("luxembourg_result_rows=0");
      expect(result.stdout).toContain("luxembourg_documented_result_rows_omitted=48197");
      expect(result.stdout).toContain("luxembourg_observation_envelopes=702");
      expect(result.stdout).toContain("luxembourg_sources=0");
      expect(result.stdout).toContain("luxembourg_unresolved=11");
      expect(result.stdout).toContain("luxembourg_approved=0");
      expect(result.stdout).toContain("luxembourg_needs_review=130");
      expect(result.stdout).toContain("luxembourg_current_communal_councils=100");
      expect(result.stdout).toContain("luxembourg_historical_communal_councils=28");
      expect(result.stdout).toContain("luxembourg_direct_executive_offices=0");
      expect(result.stdout).toContain("luxembourg_explicit_predecessor_edges=28");
      expect(result.stdout).toContain("luxembourg_geographies=129");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 130 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 438 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'LU-PARLIAMENT'").get()).toMatchObject({
          office_type: "parliament",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 28 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 28 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 11 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-luxembourg"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Luxembourg");
      expect(atlasImportStatusMessage()).toContain("luxembourg");
      expect(atlasImportStatusMessage()).toContain("does not import Luxembourg");
    },
    180_000,
  );
});
