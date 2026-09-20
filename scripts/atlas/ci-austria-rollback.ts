#!/usr/bin/env npx tsx
/**
 * CI proof: Austria poison rollback, rename-failure discard, and coverage-change release.
 * Kept out of Vitest because two full Austria imports exceed Vitest's 60s worker RPC timeout.
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria } from "../../lib/atlas/austria/import";
import { LINEAGE_ID, sha256Hex } from "../../lib/atlas/austria/identity";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";

function fail(message: string): never {
  console.error(`test:austria-rollback failed: ${message}`);
  process.exit(1);
}

function fileSha256(filePath: string): string {
  return sha256Hex(readFileSync(filePath));
}

function latestAttempt(attemptsPath: string): Record<string, unknown> {
  const db = openAtlasDatabase(attemptsPath, { readOnly: true });
  try {
    const row = db.prepare("SELECT * FROM ingest_attempt ORDER BY started_at DESC, rowid DESC LIMIT 1").get();
    if (!row) fail("No ingest_attempt rows");
    return row;
  } finally {
    db.close();
  }
}

function main() {
  delete process.env.OBSERVATORY_FIXTURES;
  const root = process.cwd();
  const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-ci-austria-rollback-"));
  const options = {
    root,
    sqlitePath: path.join(dir, "atlas.sqlite"),
    attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
    operator: "atlas-ci",
  };
  console.log(`test:austria-rollback sqlite=${options.sqlitePath}`);
  try {
    const first = importAustria(options);
    const prior = fileSha256(options.sqlitePath);

    try {
      importAustria({
        ...options,
        poisonAfterWrite: (db) => {
          db.exec("PRAGMA foreign_keys = OFF;");
          db.prepare("DELETE FROM source WHERE source_id = ?").run("austria--Saa268dd490");
          db.exec("PRAGMA foreign_keys = ON;");
        },
      });
      fail("poison write was expected to throw");
    } catch (error) {
      if (!/foreign_key_check|FOREIGN|source/i.test(String(error))) {
        fail(`poison error ${String(error)}`);
      }
    }
    if (fileSha256(options.sqlitePath) !== prior) fail("poison changed published SHA");
    const poisonAttempt = latestAttempt(options.attemptsPath);
    if (poisonAttempt.status !== "failed") fail(`poison status ${String(poisonAttempt.status)}`);
    if (poisonAttempt.successful_release_id != null) fail("poison recorded a successful release");
    if (existsSync(`${options.sqlitePath}.staging`)) fail("poison left a staging file");
    console.log("test:austria-rollback poison ok");

    try {
      importAustria({ ...options, failBeforeRename: true });
      fail("rename failure was expected to throw");
    } catch (error) {
      if (!/Injected failure before rename/.test(String(error))) {
        fail(`rename error ${String(error)}`);
      }
    }
    if (fileSha256(options.sqlitePath) !== prior) fail("rename failure changed published SHA");
    const renameAttempt = latestAttempt(options.attemptsPath);
    if (renameAttempt.status !== "failed") fail(`rename status ${String(renameAttempt.status)}`);
    if (renameAttempt.successful_release_id != null) fail("rename recorded a successful release");
    console.log("test:austria-rollback rename ok");

    const coverageDir = path.join(dir, "coverage-package");
    cpSync(path.join(root, "data/countries/austria"), coverageDir, { recursive: true });
    const coveragePath = path.join(coverageDir, "coverage.json");
    const coverage = JSON.parse(readFileSync(coveragePath, "utf8")) as { remaining: string };
    coverage.remaining = `${coverage.remaining} test-only remaining note.`;
    writeFileSync(coveragePath, `${JSON.stringify(coverage)}\n`);
    const changed = importAustria({ ...options, packageDir: coverageDir, requireGitTrackedPackage: false });
    if (changed.releaseId === first.releaseId) fail("coverage change reused the prior release");
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      if (countRows(master, "office_tier_classification", "tier = 'municipal'") !== 2034) {
        fail("municipal count after coverage change");
      }
      if (countRows(master, "office_tier_classification", "tier = 'regional'") !== 4) {
        fail("regional count after coverage change");
      }
      const releases = master.prepare("SELECT COUNT(*) AS n FROM dataset_release").get();
      if (Number(releases?.n) !== 2) fail(`dataset_release count ${String(releases?.n)}`);
      const selected = master.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
      if (String(selected?.release_id) !== changed.releaseId) {
        fail(`selected release ${String(selected?.release_id)}`);
      }
    } finally {
      master.close();
    }
    if (fileSha256(options.sqlitePath) === prior) fail("coverage change left published SHA unchanged");
    console.log("test:austria-rollback coverage ok");
    console.log(`test:austria-rollback ok first=${first.releaseId} changed=${changed.releaseId}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
