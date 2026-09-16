import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAndorra, assertAndorraFidelity } from "../../lib/atlas/andorra/import";
import { AndorraPreflightError } from "../../lib/atlas/andorra/inventory";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  LINEAGE_ID,
  METHOD_V2_FINGERPRINT,
  OFFICE_NAMESPACE,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  eventIdFor,
  fingerprintSha256,
  geographyIdFor,
  historyKey,
  sha256Hex,
} from "../../lib/atlas/andorra/identity";
import { acquireWriterLock, releaseWriterLock } from "../../lib/atlas/publish";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

function hashFile(relative: string): string {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relative)))
    .digest("hex");
}

function latestAttempt(attemptsPath: string): Record<string, unknown> {
  const db = openAtlasDatabase(attemptsPath, { readOnly: true });
  try {
    const row = db.prepare("SELECT * FROM ingest_attempt ORDER BY started_at DESC, rowid DESC LIMIT 1").get();
    if (!row) throw new Error("No ingest_attempt rows");
    return row;
  } finally {
    db.close();
  }
}

function fileSha256(filePath: string): string {
  return sha256Hex(readFileSync(filePath));
}

function updateManifestEntry(packageDir: string, relative: string): void {
  const manifestPath = path.join(packageDir, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    files: Record<string, { sha256: string; bytes: number }>;
  };
  const bytes = readFileSync(path.join(packageDir, relative));
  manifest.files[relative] = { sha256: sha256Hex(bytes), bytes: bytes.length };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

describe("Andorra identity anchors", () => {
  it("preserves documented geography, trailing-empty HK, and event public IDs", () => {
    expect(geographyIdFor("Andorra la Vella", "Communal council")).toBe("geo-59eee2ef1a3df387bf66a0f6");
    expect(geographyIdFor("Canillo", "Communal council")).toBe("geo-36b8dc9620cf766f48db2bee");
    expect(historyKey("AD-M-05", 2019, null)).toBe("AD-M-05::2019::");
    expect(eventIdFor("AD-M-05::2023::2023-12-17")).toBe("event-321b029bb122c1284e83dd89");
    expect(eventIdFor("AD-M-05::2019::")).toBe("event-02706181e65e03e35a10c899");
  });

  it("hashes the approved Andorra tier file bytes without rewriting them", () => {
    expect(hashFile(TIER_PATH)).toBe(TIER_SHA256);
  });

  it("reproduces the documented fingerprint and method_version=2 hash probe", () => {
    const inventory = JSON.parse(
      readFileSync(path.join(repoRoot, "docs/phase1/andorra/Andorra_Input_Inventory.json"), "utf8"),
    ) as {
      hash_inputs: Parameters<typeof buildHashInputs>[0] & { method_version?: string };
      hash_inputs_canonical_json: string;
    };
    const hashInputs = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
    });
    expect(JSON.stringify(JSON.parse(inventory.hash_inputs_canonical_json))).toBeDefined();
    expect(fingerprintSha256(hashInputs)).toBe(CANDIDATE_FINGERPRINT);
    expect(`${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`).toBe(CANDIDATE_RELEASE_ID);
    const methodV2 = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
      methodVersion: "atlas-preserve-evidence/2",
    });
    expect(fingerprintSha256(methodV2)).toBe(METHOD_V2_FINGERPRINT);
  });
});

describe("Prompt J Andorra import gates", () => {
  const tempDirs: string[] = [];
  const originalFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    if (originalFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = originalFixtures;
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  function pathsFor(dir: string) {
    return {
      root: repoRoot,
      sqlitePath: path.join(dir, "atlas.sqlite"),
      attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
      operator: "atlas-ci",
    };
  }

  it("imports Andorra with required counts, IDs, missing≠zero, empty regional calendar, and unchanged re-import", () => {
    const dir = tempDir("atlas-andorra-import-");
    const options = pathsFor(dir);

    const first = importAndorra(options);
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts).toMatchObject({
      current_offices: 7,
      selected_histories: 21,
      result_rows: 53,
      sources: 13,
      source_catalogue_rows: 10,
      inline_only_sources: 3,
      municipal_offices: 7,
      regional_offices: 0,
      briefings_retained: 7,
      control_observations_retained: 7,
      national_polls_retained: 1,
      proceedings: 0,
      party_mappings: 0,
    });

    const publishedSha = fileSha256(options.sqlitePath);
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      assertAndorraFidelity(master);
      expect(countRows(master, "office", "lineage_id = ?", [LINEAGE_ID])).toBe(7);
      expect(countRows(master, "election_event", "lineage_id = ?", [LINEAGE_ID])).toBe(21);
      expect(countRows(master, "result_row", "lineage_id = ?", [LINEAGE_ID])).toBe(53);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID])).toBe(7);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "proceeding", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "party_mapping", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(
        master.prepare("SELECT COUNT(*) AS n FROM retained_input WHERE lineage_id = ? AND input_path LIKE '%/briefings/%.html'").get(LINEAGE_ID),
      ).toMatchObject({ n: 7 });
      expect(
        master
          .prepare(
            "SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')",
          )
          .get(),
      ).toMatchObject({ n: 0 });

      const enclar = master
        .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status, elected_flag, is_substitute FROM result_row WHERE result_row_id = ?")
        .get("event-321b029bb122c1284e83dd89-r0");
      expect(enclar).toMatchObject({
        votes: 1989,
        votes_status: "recorded",
        share_status: "recorded",
        seats: 9,
        seats_status: "recorded",
        elected_flag: null,
        is_substitute: null,
      });
      expect(Number(enclar?.share)).toBe(52.46636771300449);

      const register = JSON.parse(
        String(
          master
            .prepare("SELECT payload_json FROM retained_input WHERE input_path = 'data/countries/andorra/tables/office-register.json'")
            .get()?.payload_json,
        ),
      ) as { rows: unknown[][] };
      expect(register.rows[2]![10]).toBe(0);
      expect(register.rows[1]![10]).toBeNull();

      const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
      expect(String(release?.release_id)).toBe(first.releaseId);
      expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
      expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
      expect(release).toMatchObject({
        adapter_version: "atlas-andorra-field-map/1",
        method_version: "atlas-preserve-evidence/1",
        schema_version: "atlas-master/1",
        research_snapshot_label: "2026-09-11",
        upstream_release_id: LINEAGE_ID,
        research_coverage_complete: 0,
      });
      const documented = JSON.parse(
        readFileSync(path.join(repoRoot, "docs/phase1/andorra/Andorra_Input_Inventory.json"), "utf8"),
      ) as { hash_inputs_canonical_json: string };
      expect(String(release?.hash_inputs_json)).toBe(documented.hash_inputs_canonical_json);
    } finally {
      master.close();
    }

    const regional = listAtlasRegionalCalendar("andorra", options.sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe("No regional tier in this package; seven municipal councils.");
    expect(regional.denominatorKnown).toBe(false);

    const firstAttempt = latestAttempt(options.attemptsPath);
    expect(firstAttempt).toMatchObject({
      attempt_id: first.attemptId,
      status: "succeeded",
      successful_release_id: first.releaseId,
      operator: "atlas-ci",
    });

    const second = importAndorra(options);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(second.reusedRelease).toBe(true);

    const master2 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      expect(master2.prepare("SELECT COUNT(*) AS n FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID)).toMatchObject({
        n: 1,
      });
      const receipt = master2.prepare("SELECT last_publish_attempt_id, attempted_lineage_id, attempted_release_id FROM publication_receipt").get();
      expect(receipt).toMatchObject({
        last_publish_attempt_id: second.attemptId,
        attempted_lineage_id: LINEAGE_ID,
        attempted_release_id: first.releaseId,
      });
    } finally {
      master2.close();
    }

    const poisonPrior = fileSha256(options.sqlitePath);
    expect(() =>
      importAndorra({
        ...options,
        poisonAfterWrite: (db) => {
          db.exec("PRAGMA foreign_keys = OFF;");
          db.prepare("DELETE FROM source WHERE source_id = ?").run("andorra--S6550aa0914");
          db.exec("PRAGMA foreign_keys = ON;");
        },
      }),
    ).toThrow(/foreign_key_check|FOREIGN|source/i);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();
    expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

    expect(() => importAndorra({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);

    const calendarDir = path.join(dir, "calendar-package");
    cpSync(path.join(repoRoot, "data/countries/andorra"), calendarDir, { recursive: true });
    const calendarPath = path.join(calendarDir, "tables/election-calendar.json");
    writeFileSync(calendarPath, readFileSync(calendarPath, "utf8").replace("Regional / municipal", "National"));
    updateManifestEntry(calendarDir, "tables/election-calendar.json");
    const calendar = importAndorra({ ...options, packageDir: calendarDir, requireGitTrackedPackage: false });
    expect(calendar.releaseId).not.toBe(first.releaseId);
    const master3 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      expect(countRows(master3, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID])).toBe(7);
      expect(countRows(master3, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(0);
      expect(
        master3.prepare("SELECT office_id FROM office WHERE office_id = 'AD-M-05'").get(),
      ).toMatchObject({ office_id: "AD-M-05" });
    } finally {
      master3.close();
    }

    expect(publishedSha).not.toBe(fileSha256(options.sqlitePath));
  }, 60_000);

  it("preserves missing≠zero on an isolated seats mutation and records unmatched citations", () => {
    const dir = tempDir("atlas-andorra-mutations-");
    const options = pathsFor(dir);
    importAndorra(options);

    const seatsDir = path.join(dir, "seats-package");
    cpSync(path.join(repoRoot, "data/countries/andorra"), seatsDir, { recursive: true });
    const returnsPath = path.join(seatsDir, "tables/detailed-returns.json");
    const returns = JSON.parse(readFileSync(returnsPath, "utf8")) as { rows: unknown[][] };
    expect(returns.rows[4]![10]).toBe(0);
    returns.rows[4]![10] = null;
    writeFileSync(returnsPath, `${JSON.stringify(returns)}\n`);
    updateManifestEntry(seatsDir, "tables/detailed-returns.json");
    const mutated = importAndorra({ ...options, packageDir: seatsDir, requireGitTrackedPackage: false });
    expect(mutated.releaseId).not.toBe(CANDIDATE_RELEASE_ID);
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      const row = master
        .prepare("SELECT seats, seats_status, votes, share FROM result_row WHERE result_row_id = ?")
        .get("event-02706181e65e03e35a10c899-r2");
      expect(row).toMatchObject({ seats: null, seats_status: "unknown", votes: 394 });
      expect(Number(row?.share)).toBe(10.384818133895624);
    } finally {
      master.close();
    }

    const unmatchedDir = path.join(dir, "unmatched-package");
    cpSync(path.join(repoRoot, "data/countries/andorra"), unmatchedDir, { recursive: true });
    const historyPath = path.join(unmatchedDir, "tables/history-index.json");
    const history = JSON.parse(readFileSync(historyPath, "utf8")) as { rows: unknown[][] };
    history.rows[0]![12] = "TEST-UNMATCHED-CITATION";
    writeFileSync(historyPath, `${JSON.stringify(history)}\n`);
    updateManifestEntry(unmatchedDir, "tables/history-index.json");
    importAndorra({ ...options, packageDir: unmatchedDir, requireGitTrackedPackage: false });
    const master2 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      const unresolved = master2
        .prepare("SELECT original_token, reason FROM unresolved_evidence WHERE original_token = ?")
        .get("TEST-UNMATCHED-CITATION");
      expect(unresolved).toMatchObject({
        original_token: "TEST-UNMATCHED-CITATION",
        reason: "unmatched_catalogue_token",
      });
      expect(
        master2.prepare("SELECT 1 AS ok FROM source WHERE url = 'https://example.invalid/not-a-source'").get(),
      ).toBeUndefined();
    } finally {
      master2.close();
    }
  });

  it("rejects missing and non-approved tier files with a durable failed attempt", () => {
    const dir = tempDir("atlas-andorra-tiers-");
    const options = pathsFor(dir);
    const missingPath = path.join(dir, "missing-andorra.json");
    expect(() => importAndorra({ ...options, tierPath: missingPath })).toThrow(AndorraPreflightError);
    const missing = latestAttempt(options.attemptsPath);
    expect(missing.status).toBe("failed");
    expect(missing.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);

    const draftPath = path.join(dir, "draft-andorra.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as { status: string };
    approved.status = "draft_for_human_review";
    writeFileSync(draftPath, `${JSON.stringify(approved, null, 2)}\n`);
    expect(() => importAndorra({ ...options, tierPath: draftPath })).toThrow(/status is "draft_for_human_review"/);
    expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects OBSERVATORY_FIXTURES=1 and FIX-/FXT- retained tokens", () => {
    const dir = tempDir("atlas-andorra-fixtures-");
    const options = pathsFor(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() => importAndorra(options)).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    delete process.env.OBSERVATORY_FIXTURES;

    const tainted = path.join(dir, "tainted-package");
    cpSync(path.join(repoRoot, "data/countries/andorra"), tainted, { recursive: true });
    const controlPath = path.join(tainted, "tables/governing-control.json");
    const control = JSON.parse(readFileSync(controlPath, "utf8")) as { rows: unknown[][] };
    control.rows[0]![0] = "FIX-AD-M-05";
    writeFileSync(controlPath, `${JSON.stringify(control)}\n`);
    updateManifestEntry(tainted, "tables/governing-control.json");
    expect(() => importAndorra({ ...options, packageDir: tainted, requireGitTrackedPackage: false })).toThrow(
      /Fixture token rejected/,
    );
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects a second writer and missing≠zero status mismatches", () => {
    const dir = tempDir("atlas-andorra-lock-");
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const fd = acquireWriterLock(sqlitePath);
    try {
      expect(() =>
        importAndorra({
          root: repoRoot,
          sqlitePath,
          attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        }),
      ).toThrow(/Another Atlas writer/);
    } finally {
      releaseWriterLock(sqlitePath, fd);
    }

    const schemaPath = path.join(dir, "schema.sqlite");
    migrateMasterDatabase(repoRoot, schemaPath);
    const db = openAtlasDatabase(schemaPath);
    try {
      expect(() =>
        db.exec(`
          INSERT INTO result_row (
            id_namespace, office_id, history_key, result_row_id, country_id,
            votes, votes_status, share, share_status, share_unit, seats, seats_status,
            evidence_status, lineage_id, release_id, raw_json
          ) VALUES (
            '${OFFICE_NAMESPACE}', 'AD-M-05', 'AD-M-05::2019::', 'event-x-r0', 'andorra',
            NULL, 'zero', 1, 'recorded', 'percent_0_100', NULL, 'unknown',
            'unknown', 'country-package-andorra', 'country-package-andorra--sha256-dead', '{}'
          );
        `),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
