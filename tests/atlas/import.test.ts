import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAlbania, assertAlbaniaFidelity } from "../../lib/atlas/albania/import";
import { AlbaniaPreflightError } from "../../lib/atlas/albania/inventory";
import {
  APPROVED_TIER_PATH,
  APPROVED_TIER_SHA256,
  DRAFT_TIER_SHA256,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
  TIER_PATH,
  eventIdFor,
  geographyIdFor,
  sha256Hex,
} from "../../lib/atlas/identity";
import { acquireWriterLock, releaseWriterLock } from "../../lib/atlas/publish";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";

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

describe("Albania identity anchors", () => {
  it("preserves documented geography and event public IDs", () => {
    expect(geographyIdFor("Belsh", "Mayor")).toBe("geo-99a7b8d0e325a448c5e7c7ca");
    expect(geographyIdFor("Belsh", "Municipal council")).toBe("geo-29ca1a846eec3250b36d39f9");
    expect(geographyIdFor("Rrogozhinë", "Mayor")).toBe("geo-cb91810264cd90d2ef316d0e");
    expect(eventIdFor("AL-13-M::2023::2023-05-14")).toBe("event-9b7cd1a6a6d27850e712e6a7");
  });

  it("hashes the approved Albania tier file bytes", () => {
    expect(hashFile(APPROVED_TIER_PATH)).toBe(APPROVED_TIER_SHA256);
    expect(hashFile(TIER_PATH)).toBe(DRAFT_TIER_SHA256);
  });
});

describe("Prompt C Albania import gates", () => {
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

  it(
    "imports Albania with required counts, IDs, missing≠zero, tiers, and unchanged re-import",
    () => {
      const dir = tempDir("atlas-import-");
      const options = pathsFor(dir);

      const first = importAlbania(options);
      expect(first.reusedRelease).toBe(false);
      expect(first.counts).toMatchObject({
        current_offices: 122,
        selected_histories: 366,
        result_rows: 3843,
        sources: 185,
        source_catalogue_rows: 182,
        inline_only_sources: 3,
        municipal_offices: 122,
        regional_offices: 0,
        briefings_retained: 122,
        control_observations_retained: 45,
        national_polls_retained: 1,
        proceedings: 0,
        party_mappings: 0,
      });

      const publishedSha = fileSha256(options.sqlitePath);
      const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        assertAlbaniaFidelity(master);
        expect(countRows(master, "office")).toBe(122);
        expect(countRows(master, "election_event")).toBe(366);
        expect(countRows(master, "result_row")).toBe(3843);
        expect(countRows(master, "office_tier_classification", "tier = 'municipal'")).toBe(122);
        expect(countRows(master, "office_tier_classification", "tier = 'regional'")).toBe(0);
        expect(countRows(master, "proceeding")).toBe(0);
        expect(countRows(master, "party_mapping")).toBe(0);
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM retained_input WHERE input_path LIKE '%/briefings/%.html'").get(),
        ).toMatchObject({ n: 122 });
        expect(
          master
            .prepare(
              "SELECT COUNT(*) AS n FROM retained_input WHERE input_path = 'data/countries/albania/history-index-crosscheck.json'",
            )
            .get(),
        ).toMatchObject({ n: 1 });
        expect(
          master.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')").get(),
        ).toMatchObject({ n: 0 });

        const arif = master
          .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status, elected_flag, is_substitute FROM result_row WHERE result_row_id = ?")
          .get("event-9b7cd1a6a6d27850e712e6a7-r0");
        expect(arif).toMatchObject({
          votes: 4564,
          votes_status: "recorded",
          share_status: "recorded",
          seats: null,
          seats_status: "unknown",
          elected_flag: null,
          is_substitute: null,
        });
        expect(Number(arif?.share)).toBe(50.26985350809561);

        const agrare = master
          .prepare("SELECT votes, seats, seats_status FROM result_row WHERE result_row_id = ?")
          .get("event-42aa961113176bd7302e00d8-r8");
        expect(agrare).toMatchObject({ votes: 326, seats: 0, seats_status: "zero" });

        const nullZero = master.prepare("SELECT COUNT(*) AS n FROM result_row WHERE seats IS NULL").get();
        const zeroSeats = master.prepare("SELECT COUNT(*) AS n FROM result_row WHERE seats = 0").get();
        expect(nullZero).toMatchObject({ n: 399 });
        expect(zeroSeats).toMatchObject({ n: 1876 });

        const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(release?.release_id)).toBe(first.releaseId);
        expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
        expect(String(release?.release_id)).toBe(`${LINEAGE_ID}--sha256-${first.fingerprint}`);
        expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
        const hashInputs = JSON.parse(String(release?.hash_inputs_json)) as {
          schema_inputs: Array<{ input_path: string }>;
          adapter_version: string;
          method_version: string;
          schema_version: string;
          overrides: unknown[];
        };
        expect(hashInputs.schema_inputs.map((row) => row.input_path)).toEqual([
          "0001_atlas_attempt_log.sql",
          "0002_atlas_master.sql",
        ]);
        expect(hashInputs.overrides).toEqual([]);
        expect(release).toMatchObject({
          adapter_version: hashInputs.adapter_version,
          method_version: hashInputs.method_version,
          schema_version: hashInputs.schema_version,
          research_snapshot_label: "2026-09-11",
          upstream_release_id: LINEAGE_ID,
          research_coverage_complete: 0,
        });
        const tierInput = master
          .prepare("SELECT sha256, input_kind FROM retained_input WHERE input_path = ?")
          .get(TIER_PATH);
        expect(tierInput).toMatchObject({ sha256: DRAFT_TIER_SHA256, input_kind: "tier_classification" });

        const control = master
          .prepare("SELECT payload_json FROM retained_input WHERE input_path = 'data/countries/albania/tables/governing-control.json'")
          .get();
        expect(JSON.parse(String(control?.payload_json)).rows).toHaveLength(45);
        const poll = master
          .prepare("SELECT payload_json FROM retained_input WHERE input_path = 'data/countries/albania/tables/polling-evidence.json'")
          .get();
        expect(JSON.parse(String(poll?.payload_json)).rows).toHaveLength(1);

        const rrogozhineCouncil = master
          .prepare("SELECT event_id FROM election_event WHERE history_key = 'AL-52-C::2023::2023-05-14'")
          .get();
        expect(rrogozhineCouncil?.event_id).toBeTruthy();
      } finally {
        master.close();
      }

      const firstAttempt = latestAttempt(options.attemptsPath);
      expect(firstAttempt).toMatchObject({
        attempt_id: first.attemptId,
        status: "succeeded",
        successful_release_id: first.releaseId,
        operator: "atlas-ci",
        script_version: "atlas-import/1.0.0",
      });
      expect(firstAttempt.successful_release_id).not.toBe(firstAttempt.attempt_id);

      const second = importAlbania(options);
      expect(second.attemptId).not.toBe(first.attemptId);
      expect(second.releaseId).toBe(first.releaseId);
      expect(second.fingerprint).toBe(first.fingerprint);
      expect(second.reusedRelease).toBe(true);

      const master2 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        expect(master2.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 1 });
        const receipt = master2.prepare("SELECT last_publish_attempt_id, attempted_release_id FROM publication_receipt").get();
        expect(receipt).toMatchObject({
          last_publish_attempt_id: second.attemptId,
          attempted_release_id: first.releaseId,
        });
        const arif = master2
          .prepare("SELECT candidate_or_list_label, votes FROM result_row WHERE result_row_id = ?")
          .get("event-9b7cd1a6a6d27850e712e6a7-r0");
        expect(arif).toMatchObject({ candidate_or_list_label: "Arif Faik Tafani", votes: 4564 });
      } finally {
        master2.close();
      }

      const poisonPrior = fileSha256(options.sqlitePath);
      expect(() =>
        importAlbania({
          ...options,
          poisonAfterWrite: (db) => {
            db.exec("PRAGMA foreign_keys = OFF;");
            db.prepare("DELETE FROM source WHERE source_id = ?").run("albania--Sfaae00802d");
            db.exec("PRAGMA foreign_keys = ON;");
          },
        }),
      ).toThrow(/foreign_key_check|FOREIGN|source/i);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      const poisonAttempt = latestAttempt(options.attemptsPath);
      expect(poisonAttempt.status).toBe("failed");
      expect(poisonAttempt.successful_release_id).toBeNull();
      expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

      expect(() => importAlbania({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      const renameAttempt = latestAttempt(options.attemptsPath);
      expect(renameAttempt.status).toBe("failed");
      expect(renameAttempt.successful_release_id).toBeNull();

      const brokenDir = path.join(dir, "broken-package");
      cpSync(path.join(repoRoot, "data/countries/albania"), brokenDir, { recursive: true });
      const historyPath = path.join(brokenDir, "tables/history-index-001.json");
      const history = readFileSync(historyPath, "utf8");
      writeFileSync(
        historyPath,
        history.replace(
          "https://iemis.kqz.gov.al/results2023/input/results/json_all_summary_0_bashki_lh.txt",
          "https://example.invalid/missing-source",
        ),
      );
      updateManifestEntry(brokenDir, "tables/history-index-001.json");
      expect(() => importAlbania({ ...options, packageDir: brokenDir, requireGitTrackedPackage: false })).toThrow(
        /Broken source reference/,
      );
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();

      const calendarDir = path.join(dir, "calendar-package");
      cpSync(path.join(repoRoot, "data/countries/albania"), calendarDir, { recursive: true });
      const calendarPath = path.join(calendarDir, "tables/election-calendar.json");
      writeFileSync(
        calendarPath,
        readFileSync(calendarPath, "utf8").replace("Regional / municipal", "National"),
      );
      updateManifestEntry(calendarDir, "tables/election-calendar.json");
      const calendar = importAlbania({ ...options, packageDir: calendarDir, requireGitTrackedPackage: false });
      expect(calendar.releaseId).not.toBe(first.releaseId);
      expect(calendar.fingerprint).not.toBe(first.fingerprint);
      const master3 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        expect(countRows(master3, "office_tier_classification", "tier = 'municipal'")).toBe(122);
        expect(countRows(master3, "office_tier_classification", "tier = 'regional'")).toBe(0);
        expect(master3.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 2 });
        expect(
          master3.prepare("SELECT office_id FROM office WHERE office_id = 'AL-13-M'").get(),
        ).toMatchObject({ office_id: "AL-13-M" });
        expect(
          master3.prepare("SELECT event_id FROM election_event WHERE event_id = 'event-9b7cd1a6a6d27850e712e6a7'").get(),
        ).toBeTruthy();
        const selected = master3.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(selected?.release_id)).toBe(calendar.releaseId);
        expect(
          master3.prepare("SELECT release_id FROM dataset_release WHERE release_id = ?").get(first.releaseId),
        ).toBeTruthy();
      } finally {
        master3.close();
      }

      expect(publishedSha).not.toBe(fileSha256(options.sqlitePath));
    },
    180_000,
  );

  it("rejects missing and non-approved tier files with a durable failed attempt", () => {
    const dir = tempDir("atlas-tiers-");
    const options = pathsFor(dir);
    const missingPath = path.join(dir, "missing-albania.json");
    expect(() => importAlbania({ ...options, tierPath: missingPath })).toThrow(AlbaniaPreflightError);
    const missing = latestAttempt(options.attemptsPath);
    expect(missing.status).toBe("failed");
    expect(missing.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);

    const draftPath = path.join(dir, "draft-albania.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, APPROVED_TIER_PATH), "utf8")) as { status: string };
    approved.status = "draft_for_human_review";
    writeFileSync(draftPath, `${JSON.stringify(approved, null, 2)}\n`);
    expect(() => importAlbania({ ...options, tierPath: draftPath })).toThrow(/status is "draft_for_human_review"/);
    const draft = latestAttempt(options.attemptsPath);
    expect(draft.status).toBe("failed");
    expect(draft.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects OBSERVATORY_FIXTURES=1 and FIX-/FXT- retained tokens", () => {
    const dir = tempDir("atlas-fixtures-");
    const options = pathsFor(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() => importAlbania(options)).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
    const envAttempt = latestAttempt(options.attemptsPath);
    expect(envAttempt.status).toBe("failed");
    expect(envAttempt.successful_release_id).toBeNull();
    delete process.env.OBSERVATORY_FIXTURES;

    const tainted = path.join(dir, "tainted-package");
    cpSync(path.join(repoRoot, "data/countries/albania"), tainted, { recursive: true });
    const controlPath = path.join(tainted, "tables/governing-control.json");
    const control = JSON.parse(readFileSync(controlPath, "utf8")) as { rows: unknown[][] };
    control.rows[0]![0] = "FIX-AL-13-M";
    writeFileSync(controlPath, `${JSON.stringify(control)}\n`);
    updateManifestEntry(tainted, "tables/governing-control.json");
    expect(() => importAlbania({ ...options, packageDir: tainted, requireGitTrackedPackage: false })).toThrow(
      /Fixture token rejected/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects a second writer and missing≠zero status mismatches", () => {
    const dir = tempDir("atlas-lock-");
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const fd = acquireWriterLock(sqlitePath);
    try {
      expect(() =>
        importAlbania({
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
            '${OFFICE_NAMESPACE}', 'AL-13-M', 'AL-13-M::2023::2023-05-14', 'event-x-r0', 'albania',
            NULL, 'zero', 1, 'recorded', 'percent_0_100', NULL, 'unknown',
            'unknown', 'country-package-albania', 'country-package-albania--sha256-dead', '{}'
          );
        `),
      ).toThrow();
      expect(() =>
        db.exec(`
          INSERT INTO result_row (
            id_namespace, office_id, history_key, result_row_id, country_id,
            votes, votes_status, share, share_status, share_unit, seats, seats_status,
            evidence_status, lineage_id, release_id, raw_json
          ) VALUES (
            '${OFFICE_NAMESPACE}', 'AL-13-M', 'AL-13-M::2023::2023-05-14', 'event-x-r1', 'albania',
            0, 'unknown', 1, 'recorded', 'percent_0_100', 0, 'zero',
            'unknown', 'country-package-albania', 'country-package-albania--sha256-dead', '{}'
          );
        `),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
