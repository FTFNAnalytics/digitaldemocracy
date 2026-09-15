import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { atlasImportBlockedMessage } from "../../lib/atlas/import-status";
import { PRODUCTION_ATLAS_SQLITE_PATH } from "../../lib/atlas/paths";

const repoRoot = path.join(import.meta.dirname, "../..");

function runAtlasScript(script: string, env: Record<string, string | undefined>) {
  const experimental = script.includes("migrate.ts");
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

describe("atlas CLI stubs", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("migrate:atlas applies schema_version and atlas_meta to ATLAS_SQLITE_PATH", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-migrate-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const first = runAtlasScript("scripts/atlas/migrate.ts", { ATLAS_SQLITE_PATH: sqlitePath });
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain("migrate:atlas");
    expect(first.stdout).toContain(sqlitePath);
    expect(first.stdout).toContain("0001_schema_version");

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      const version = db.prepare("SELECT version, name FROM schema_version").get();
      expect(version).toMatchObject({ version: 1, name: "schema_version" });
      const ddl = db.prepare("SELECT value FROM atlas_meta WHERE key = 'entity_ddl'").get();
      expect(ddl).toMatchObject({ value: "pending_review" });
    } finally {
      db.close();
    }

    const second = runAtlasScript("scripts/atlas/migrate.ts", { ATLAS_SQLITE_PATH: sqlitePath });
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain("Already applied: 0001_schema_version");
  });

  it("import:atlas fails clearly until Albania ingest and entity DDL land", () => {
    const result = runAtlasScript("scripts/atlas/import.ts", {});
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Election Atlas import is not available yet");
    expect(result.stderr).toContain("Albania");
    expect(result.stderr).toContain("tier-classification");
    expect(result.stderr).toContain(PRODUCTION_ATLAS_SQLITE_PATH);
    expect(result.stderr).toContain("/electiondatabase");
    expect(result.stderr).not.toContain("invent");
    expect(atlasImportBlockedMessage()).toContain("docs/atlas-phase1.md");
  });
});

describe("gitignore sqlite binaries", () => {
  it("ignores sqlite database files and WAL/SHM siblings", () => {
    const gitignore = spawnSync("git", ["check-ignore", "-v", "data/master/atlas.sqlite"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(gitignore.status).toBe(0);
    expect(gitignore.stdout).toMatch(/\.sqlite/);

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
