import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atlasImportStatusMessage } from "../../lib/atlas/import-status";
import {
  PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH,
  PRODUCTION_ATLAS_SQLITE_PATH,
} from "../../lib/atlas/paths";

const repoRoot = path.join(import.meta.dirname, "../..");

const MASTER_TABLES = [
  "country",
  "dataset_lineage",
  "dataset_release",
  "election_event",
  "evidence_link",
  "geography",
  "identity_crosswalk",
  "office",
  "office_tier_classification",
  "party_mapping",
  "proceeding",
  "publication_receipt",
  "publication_release",
  "record_locator",
  "research_date",
  "result_row",
  "retained_input",
  "schema_migration",
  "source",
  "unresolved_evidence",
];

function runAtlasScript(script: string, env: Record<string, string | undefined>) {
  const experimental = script.includes("migrate.ts") || script.includes("import.ts");
  const args = [
    ...(experimental ? ["--experimental-sqlite", "--no-warnings"] : []),
    "--import",
    "tsx",
    script,
  ];
  return spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function tableNames(filePath: string): string[] {
  const db = new DatabaseSync(filePath, { readOnly: true });
  try {
    return db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all()
      .map((row) => String(row.name));
  } finally {
    db.close();
  }
}

describe("atlas CLI stubs", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("migrate:atlas applies attempt log and master SQL to separate databases", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-migrate-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = runAtlasScript("scripts/atlas/migrate.ts", {
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
    });
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain("migrate:atlas");
    expect(first.stdout).toContain(sqlitePath);
    expect(first.stdout).toContain(attemptsPath);
    expect(first.stdout).toContain("0001_atlas_attempt_log");
    expect(first.stdout).toContain("0002_atlas_master");
    expect(first.stdout).not.toContain("import:atlas remains blocked");

    expect(tableNames(attemptsPath)).toEqual(["ingest_attempt", "schema_migration"]);
    expect(tableNames(sqlitePath)).toEqual(MASTER_TABLES);

    const attempts = new DatabaseSync(attemptsPath, { readOnly: true });
    try {
      const version = attempts.prepare("SELECT version, description FROM schema_migration").get();
      expect(version).toMatchObject({
        version: 1,
        description: "Atlas durable attempt ledger draft",
      });
      expect(attempts.prepare("SELECT COUNT(*) AS n FROM ingest_attempt").get()).toMatchObject({ n: 0 });
    } finally {
      attempts.close();
    }

    const master = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      const version = master.prepare("SELECT version, description FROM schema_migration").get();
      expect(version).toMatchObject({
        version: 1,
        description: "Atlas Phase 1 master draft",
      });
      expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM country").get()).toMatchObject({ n: 0 });
      expect(master.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 0 });
    } finally {
      master.close();
    }

    const second = runAtlasScript("scripts/atlas/migrate.ts", {
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
    });
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain("Already applied to attempts DB: 0001_atlas_attempt_log");
    expect(second.stdout).toContain("Already applied to master DB: 0002_atlas_master");
  });

  it("migrate:atlas refuses an unexpected existing schema", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-migrate-existing-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    writeFileSync(sqlitePath, "");
    const bootstrap = new DatabaseSync(sqlitePath);
    try {
      bootstrap.exec("CREATE TABLE schema_version (version INTEGER PRIMARY KEY);");
    } finally {
      bootstrap.close();
    }

    const result = runAtlasScript("scripts/atlas/migrate.ts", {
      ATLAS_SQLITE_PATH: sqlitePath,
      ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
    });
    expect(result.status, result.stdout).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/Unexpected existing schema/);
  });

  it(
    "import:atlas loads Albania into temporary databases",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasScript("scripts/atlas/import.ts", {
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "albania",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("offices=122");
      expect(result.stdout).toContain("selected_histories=366");
      expect(result.stdout).toContain("result_rows=3843");
      expect(result.stdout).toContain("regional=0");
      expect(result.stderr).not.toContain("Election Atlas import is not available yet");

      const attempts = new DatabaseSync(attemptsPath, { readOnly: true });
      try {
        const row = attempts.prepare("SELECT status, successful_release_id FROM ingest_attempt").get();
        expect(row?.status).toBe("succeeded");
        expect(row?.successful_release_id).toBeTruthy();
      } finally {
        attempts.close();
      }

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 122 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'AL-13-M'").get(),
        ).toMatchObject({ geography_id: "geo-99a7b8d0e325a448c5e7c7ca" });
      } finally {
        master.close();
      }

      expect(atlasImportStatusMessage()).toContain("Albania import is available");
      expect(atlasImportStatusMessage()).toContain(PRODUCTION_ATLAS_SQLITE_PATH);
      expect(atlasImportStatusMessage()).toContain(PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH);
      expect(atlasImportStatusMessage()).toContain("/electiondatabase");
    },
    180_000,
  );

  it(
    "import:atlas loads Andorra into temporary databases",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-andorra-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasScript("scripts/atlas/import.ts", {
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "andorra",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-andorra");
      expect(result.stdout).toContain("andorra_offices=7");
      expect(result.stdout).toContain("andorra_selected_histories=21");
      expect(result.stdout).toContain("andorra_result_rows=53");
      expect(result.stdout).toContain("andorra_regional=0");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 7 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'AD-M-05'").get(),
        ).toMatchObject({ geography_id: "geo-59eee2ef1a3df387bf66a0f6" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 0 });
      } finally {
        master.close();
      }
    },
    60_000,
  );

  it(
    "import:atlas loads Alderney into temporary databases",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-import-alderney-cli-"));
      tempDirs.push(dir);
      const sqlitePath = path.join(dir, "atlas.sqlite");
      const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
      const result = runAtlasScript("scripts/atlas/import.ts", {
        ATLAS_SQLITE_PATH: sqlitePath,
        ATLAS_ATTEMPTS_SQLITE_PATH: attemptsPath,
        ATLAS_OPERATOR: "atlas-cli-test",
        ATLAS_IMPORT_SCOPE: "alderney",
        OBSERVATORY_FIXTURES: "",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("import:atlas");
      expect(result.stdout).toContain("lineage=country-package-alderney");
      expect(result.stdout).toContain("alderney_offices=2");
      expect(result.stdout).toContain("alderney_other=2");
      expect(result.stdout).toContain("alderney_selected_histories=6");
      expect(result.stdout).toContain("alderney_result_rows=27");
      expect(result.stdout).toContain("alderney_regional=0");

      const master = new DatabaseSync(sqlitePath, { readOnly: true });
      try {
        expect(master.prepare("SELECT COUNT(*) AS n FROM office").get()).toMatchObject({ n: 2 });
        expect(
          master.prepare("SELECT geography_id FROM office WHERE office_id = 'GG-ALD-STATES'").get(),
        ).toMatchObject({ geography_id: "geo-5b23b4b4235736678bfe4b68" });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE tier = 'regional'")
            .get(),
        ).toMatchObject({ n: 0 });
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM research_date WHERE certainty = 'conditional'")
            .get(),
        ).toMatchObject({ n: 2 });
      } finally {
        master.close();
      }
    },
    60_000,
  );
});

describe("gitignore sqlite binaries", () => {
  it("ignores sqlite database files and WAL/SHM siblings", () => {
    const gitignore = spawnSync("git", ["check-ignore", "-v", "data/master/atlas.sqlite"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(gitignore.status).toBe(0);
    expect(gitignore.stdout).toMatch(/\.sqlite/);

    const attempts = spawnSync("git", ["check-ignore", "-v", "data/master/atlas-attempts.sqlite"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(attempts.status).toBe(0);

    const wal = spawnSync("git", ["check-ignore", "-v", "data/master/atlas.sqlite-wal"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(wal.status).toBe(0);

    const readme = spawnSync("git", ["check-ignore", "-v", "data/master/README.md"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(readme.status).not.toBe(0);
  });
});
