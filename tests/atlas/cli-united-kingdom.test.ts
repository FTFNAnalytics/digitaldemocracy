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

describe("atlas CLI United Kingdom", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "import:atlas loads United Kingdom Prompt AU and does not treat all as the United Kingdom",
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-uk-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasImport({
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "united_kingdom",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("scope=united_kingdom");
      expect(result.stdout).toContain("lineage=country-package-united-kingdom");
      expect(result.stdout).not.toContain("lineage=country-package-germany");
      expect(result.stdout).not.toContain("lineage=country-package-france");
      expect(result.stdout).not.toContain("lineage=country-package-cyprus");
      expect(result.stdout).not.toContain("lineage=country-package-malta");
      expect(result.stdout).toContain("united_kingdom_offices=510");
      expect(result.stdout).toContain("united_kingdom_current=482");
      expect(result.stdout).toContain("united_kingdom_current_shadow=2");
      expect(result.stdout).toContain("united_kingdom_historical=26");
      expect(result.stdout).toContain("united_kingdom_draft_tier_1=2");
      expect(result.stdout).toContain("united_kingdom_draft_tier_2=5");
      expect(result.stdout).toContain("united_kingdom_draft_tier_3=76");
      expect(result.stdout).toContain("united_kingdom_draft_tier_4=427");
      expect(result.stdout).toContain("united_kingdom_schema_national=2");
      expect(result.stdout).toContain("united_kingdom_schema_regional=81");
      expect(result.stdout).toContain("united_kingdom_schema_municipal=427");
      expect(result.stdout).toContain("united_kingdom_schema_other=0");
      expect(result.stdout).toContain("united_kingdom_result_rows=0");
      expect(result.stdout).toContain("united_kingdom_event_rows=0");
      expect(result.stdout).not.toContain("united_kingdom_documented_result_rows_omitted");
      expect(result.stdout).not.toContain("united_kingdom_documented_event_rows_omitted");
      expect(result.stdout).toContain("united_kingdom_sources=0");
      expect(result.stdout).toContain("united_kingdom_unresolved=27");
      expect(result.stdout).toContain("united_kingdom_approved=0");
      expect(result.stdout).toContain("united_kingdom_needs_review=510");
      expect(result.stdout).toContain("united_kingdom_principal_councils=382");
      expect(result.stdout).toContain("united_kingdom_direct_executive_offices=64");
      expect(result.stdout).toContain("united_kingdom_direct_mayors=27");
      expect(result.stdout).toContain("united_kingdom_standalone_pcc=37");
      expect(result.stdout).toContain("united_kingdom_parish_town_councils=27");
      expect(result.stdout).toContain("united_kingdom_explicit_predecessor_edges=0");
      expect(result.stdout).toContain("united_kingdom_research_dates=1");
      expect(result.stdout).toContain("united_kingdom_geographies=496");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 510 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM election_event").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM result_row").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT office_type, name FROM office WHERE office_id = 'GB.COMMONS'").get()).toMatchObject({
          office_type: "national_lower_chamber",
          name: "House of Commons",
        });
        expect(master.prepare("SELECT tier FROM office_tier_classification WHERE office_id = 'GB.EP'").get()).toMatchObject({
          tier: "national_context",
        });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE office_status = 'historical'").get()).toMatchObject({ n: 26 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM office WHERE state_note = 'current_shadow'").get()).toMatchObject({ n: 2 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM source").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM identity_crosswalk").get()).toMatchObject({ n: 0 });
        expect(master.prepare("SELECT COUNT(*) AS n FROM unresolved_evidence").get()).toMatchObject({ n: 27 });
        const lineages = master
          .prepare("SELECT lineage_id FROM publication_release")
          .all()
          .map((row) => String(row.lineage_id));
        expect(lineages).toEqual(["country-package-united-kingdom"]);
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("United Kingdom");
      expect(atlasImportStatusMessage()).toContain("united_kingdom");
      expect(atlasImportStatusMessage()).toContain("does not import the United Kingdom");
      expect(atlasImportStatusMessage()).toContain("does not import Germany");
    },
    120_000,
  );
});
