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
      timeout: 300_000,
    },
  );
}

describe("atlas CLI Spain", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads Spain Prompt AE 8204 current + 4 historical offices",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-spain-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "spain",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-spain");
      expect(result.stdout).toContain("spain_offices=8208");
      expect(result.stdout).toContain("spain_current=8204");
      expect(result.stdout).toContain("spain_historical=4");
      expect(result.stdout).toContain("spain_municipal=8133");
      expect(result.stdout).toContain("spain_regional=68");
      expect(result.stdout).toContain("spain_national=2");
      expect(result.stdout).toContain("spain_other=5");
      expect(result.stdout).toContain("spain_diputaciones=38");
      expect(result.stdout).toContain("spain_islands=10");
      expect(result.stdout).toContain("spain_concejo_abierto=78");
      expect(result.stdout).toContain("spain_mode_pending=3762");
      expect(result.stdout).toContain("spain_selected_histories=20401");
      expect(result.stdout).toContain("spain_prospective_events=0");
      expect(result.stdout).toContain("spain_result_rows=0");
      expect(result.stdout).toContain("spain_proceedings=0");
      expect(result.stdout).toContain("spain_unresolved=12");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 8208 });
        expect(master.prepare("SELECT geography_id, office_type, next_date_id FROM office WHERE office_id = 'ES-M28079-REP'").get()).toMatchObject({
          geography_id: "ES-M28079",
          office_type: "municipal_council",
          next_date_id: null,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({
          n: 4,
        });
        expect(
          master
            .prepare(
              "SELECT tier, review_status FROM office_tier_classification WHERE office_id = 'ES-M51001-REP'",
            )
            .get(),
        ).toMatchObject({ tier: "other", review_status: "needs_review" });
        expect(
          master
            .prepare(
              "SELECT tier, review_status FROM office_tier_classification WHERE office_id = 'ES-M52001-REP'",
            )
            .get(),
        ).toMatchObject({ tier: "other", review_status: "needs_review" });
        expect(master.prepare("SELECT office_type FROM office WHERE office_id = 'ES-M07024-REP'").get()).toMatchObject({
          office_type: "combined_municipal_island_council",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_id = 'ES-I071-COUNCIL'").get()).toMatchObject({
          n: 0,
        });
        expect(
          master
            .prepare(
              "SELECT COUNT(*) AS n FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.office_type = 'provincial_council' AND t.tier = 'regional' AND t.review_status = 'needs_review'",
            )
            .get(),
        ).toMatchObject({ n: 38 });
        expect(
          master
            .prepare(
              "SELECT COUNT(*) AS n FROM election_event e JOIN office o USING (id_namespace, office_id) WHERE o.office_type = 'provincial_council'",
            )
            .get(),
        ).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_type = 'island_council'").get()).toMatchObject({
          n: 10,
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM proceeding").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT legal_outcome FROM election_event WHERE history_key = 'ES-M31243-REP::2015::2015-05-24'").get()).toMatchObject({
          legal_outcome: "disputed",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence WHERE original_token LIKE 'ES-G%'").get()).toMatchObject({
          n: 12,
        });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Spain");
      expect(atlasImportStatusMessage()).toContain("spain");
    },
    300_000,
  );
});
