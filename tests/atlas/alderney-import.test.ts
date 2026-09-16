import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAlderney, assertAlderneyFidelity } from "../../lib/atlas/alderney/import";
import { AlderneyPreflightError } from "../../lib/atlas/alderney/inventory";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  LINEAGE_ID,
  METHOD_V2_FINGERPRINT,
  OFFICE_NAMESPACE,
  REGIONAL_EMPTY_LABEL,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  eventIdFor,
  fingerprintSha256,
  geographyIdFor,
  nextEventIdFor,
  sha256Hex,
} from "../../lib/atlas/alderney/identity";
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

describe("Alderney identity anchors", () => {
  it("preserves documented geography, next-event, and historical public IDs", () => {
    expect(
      geographyIdFor("Alderney", "Plebiscite nominating two Guernsey States representatives"),
    ).toBe("geo-e421db320af0c5c106f24293");
    expect(geographyIdFor("Alderney", "States members (five of ten ordinary seats)")).toBe(
      "geo-5b23b4b4235736678bfe4b68",
    );
    expect(nextEventIdFor("GG-ALD-PLEB")).toBe("next-f2267589582f25eae0c65e96");
    expect(nextEventIdFor("GG-ALD-STATES")).toBe("next-166ad22fe0872fb2402d3f93");
    expect(eventIdFor("GG-ALD-STATES::2025::2025-03-08")).toBe("event-1e4346e3f46e487f877780f8");
    expect(eventIdFor("GG-ALD-PLEB::2024::2024-12-07")).toBe("event-7fa40c8eb8a5b88a5a05ec45");
  });

  it("hashes the approved Alderney tier file bytes without rewriting them", () => {
    expect(hashFile(TIER_PATH)).toBe(TIER_SHA256);
  });

  it("reproduces the documented fingerprint and method_version=2 hash probe", () => {
    const inventory = JSON.parse(
      readFileSync(path.join(repoRoot, "docs/phase1/alderney/Alderney_Input_Inventory.json"), "utf8"),
    ) as {
      hash_inputs: Parameters<typeof buildHashInputs>[0];
    };
    const hashInputs = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
    });
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

describe("Prompt K Alderney import gates", () => {
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

  it("imports Alderney with required counts, conditional dates, empty regional calendar, and unchanged re-import", () => {
    const dir = tempDir("atlas-alderney-import-");
    const options = pathsFor(dir);

    const first = importAlderney(options);
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts).toMatchObject({
      current_offices: 2,
      selected_histories: 6,
      prospective_events: 2,
      total_events: 8,
      research_dates: 8,
      result_rows: 27,
      sources: 7,
      source_catalogue_rows: 6,
      inline_only_sources: 1,
      other_offices: 2,
      regional_offices: 0,
      municipal_offices: 0,
      briefings_retained: 2,
      control_observations_supplied: 0,
      poll_records_supplied: 0,
      proceedings: 0,
      party_mappings: 0,
      retained_inputs: 21,
    });

    const publishedSha = fileSha256(options.sqlitePath);
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      assertAlderneyFidelity(master);
      expect(countRows(master, "office", "lineage_id = ?", [LINEAGE_ID])).toBe(2);
      expect(countRows(master, "election_event", "lineage_id = ?", [LINEAGE_ID])).toBe(8);
      expect(countRows(master, "result_row", "lineage_id = ?", [LINEAGE_ID])).toBe(27);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'other'", [LINEAGE_ID])).toBe(2);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "proceeding", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "party_mapping", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(
        master
          .prepare("SELECT COUNT(*) AS n FROM retained_input WHERE lineage_id = ? AND input_path LIKE '%/briefings/%.html'")
          .get(LINEAGE_ID),
      ).toMatchObject({ n: 2 });
      expect(
        master
          .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')")
          .get(),
      ).toMatchObject({ n: 0 });

      const statesDate = master
        .prepare("SELECT label, precision, certainty FROM research_date WHERE date_id = ?")
        .get("date-ff80f2bcf352db84b3fd35265a67c4353ff39a17a88b91c63ff5195029045745");
      expect(statesDate).toMatchObject({ label: "2026-11-21", precision: "day", certainty: "conditional" });
      const plebDate = master
        .prepare("SELECT label, precision, certainty FROM research_date WHERE date_id = ?")
        .get("date-ccd6826dfd61d30518eda1a224817bc1c8e121531c5076deafcef8e8ce3446a7");
      expect(plebDate).toMatchObject({ label: "2026-12-12", precision: "day", certainty: "conditional" });

      const cameron = master
        .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status, elected_flag, is_substitute FROM result_row WHERE result_row_id = ?")
        .get("event-1e4346e3f46e487f877780f8-r0");
      expect(cameron).toMatchObject({
        votes: 501,
        votes_status: "recorded",
        share_status: "recorded",
        seats: 1,
        seats_status: "recorded",
        elected_flag: null,
        is_substitute: null,
      });
      expect(Number(cameron?.share)).toBe(38.92773892773893);

      const stuart = master
        .prepare("SELECT votes, seats, seats_status FROM result_row WHERE result_row_id = ?")
        .get("event-7fa40c8eb8a5b88a5a05ec45-r2");
      expect(stuart).toMatchObject({ votes: 260, seats: 0, seats_status: "zero" });

      const register = JSON.parse(
        String(
          master
            .prepare("SELECT payload_json FROM retained_input WHERE input_path = 'data/countries/alderney/tables/office-register.json'")
            .get()?.payload_json,
        ),
      ) as { rows: unknown[][] };
      expect(register.rows[0]![10]).toBeNull();
      expect(register.rows[1]![10]).toBeNull();

      const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
      expect(String(release?.release_id)).toBe(first.releaseId);
      expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
      expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
      expect(release).toMatchObject({
        adapter_version: "atlas-alderney-field-map/1",
        method_version: "atlas-preserve-evidence/1",
        schema_version: "atlas-master/1",
        research_snapshot_label: "2026-09-11",
        upstream_release_id: LINEAGE_ID,
        research_coverage_complete: 0,
      });
      const documented = JSON.parse(
        readFileSync(path.join(repoRoot, "docs/phase1/alderney/Alderney_Input_Inventory.json"), "utf8"),
      ) as { hash_inputs_canonical_json: string };
      expect(String(release?.hash_inputs_json)).toBe(documented.hash_inputs_canonical_json);
    } finally {
      master.close();
    }

    const regional = listAtlasRegionalCalendar("alderney", options.sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe(REGIONAL_EMPTY_LABEL);
    expect(regional.denominatorKnown).toBe(false);

    const firstAttempt = latestAttempt(options.attemptsPath);
    expect(firstAttempt).toMatchObject({
      attempt_id: first.attemptId,
      status: "succeeded",
      successful_release_id: first.releaseId,
      operator: "atlas-ci",
      script_version: "atlas-import/1.0.0",
    });

    const second = importAlderney(options);
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
    } finally {
      master2.close();
    }

    const poisonPrior = fileSha256(options.sqlitePath);
    expect(() =>
      importAlderney({
        ...options,
        poisonAfterWrite: (db) => {
          db.exec("PRAGMA foreign_keys = OFF;");
          db.prepare("DELETE FROM source WHERE source_id = ?").run("alderney--S93e7bbcb1f");
          db.exec("PRAGMA foreign_keys = ON;");
        },
      }),
    ).toThrow(/foreign_key_check|FOREIGN|source/i);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
    const poisonAttempt = latestAttempt(options.attemptsPath);
    expect(poisonAttempt.status).toBe("failed");
    expect(poisonAttempt.successful_release_id).toBeNull();
    expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

    expect(() => importAlderney({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();

    const calendarDir = path.join(dir, "calendar-package");
    cpSync(path.join(repoRoot, "data/countries/alderney"), calendarDir, { recursive: true });
    const calendarPath = path.join(calendarDir, "tables/election-calendar.json");
    writeFileSync(
      calendarPath,
      readFileSync(calendarPath, "utf8").replace("Territorial legislature / representatives", "National"),
    );
    updateManifestEntry(calendarDir, "tables/election-calendar.json");
    const calendar = importAlderney({ ...options, packageDir: calendarDir, requireGitTrackedPackage: false });
    expect(calendar.releaseId).not.toBe(first.releaseId);
    const master3 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      expect(countRows(master3, "office_tier_classification", "tier = 'other'")).toBe(2);
      expect(countRows(master3, "office_tier_classification", "tier = 'regional'")).toBe(0);
      expect(master3.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 2 });
      const selected = master3.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
      expect(String(selected?.release_id)).toBe(calendar.releaseId);
    } finally {
      master3.close();
    }
    expect(publishedSha).not.toBe(fileSha256(options.sqlitePath));
  });

  it("rejects missing and non-approved tier files with a durable failed attempt", () => {
    const dir = tempDir("atlas-alderney-tiers-");
    const options = pathsFor(dir);
    const missingPath = path.join(dir, "missing-alderney.json");
    expect(() => importAlderney({ ...options, tierPath: missingPath })).toThrow(AlderneyPreflightError);
    const missing = latestAttempt(options.attemptsPath);
    expect(missing.status).toBe("failed");
    expect(missing.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);

    const draftPath = path.join(dir, "draft-alderney.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as { status: string };
    approved.status = "draft_for_human_review";
    writeFileSync(draftPath, `${JSON.stringify(approved, null, 2)}\n`);
    expect(() => importAlderney({ ...options, tierPath: draftPath })).toThrow(/status is "draft_for_human_review"/);
    const draft = latestAttempt(options.attemptsPath);
    expect(draft.status).toBe("failed");
    expect(draft.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects OBSERVATORY_FIXTURES=1 and FIX-/FXT- retained tokens", () => {
    const dir = tempDir("atlas-alderney-fixtures-");
    const options = pathsFor(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() => importAlderney(options)).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
    const envAttempt = latestAttempt(options.attemptsPath);
    expect(envAttempt.status).toBe("failed");
    expect(envAttempt.successful_release_id).toBeNull();
    delete process.env.OBSERVATORY_FIXTURES;

    const tainted = path.join(dir, "tainted-package");
    cpSync(path.join(repoRoot, "data/countries/alderney"), tainted, { recursive: true });
    const sourcesPath = path.join(tainted, "tables/sources.json");
    const sources = JSON.parse(readFileSync(sourcesPath, "utf8")) as { rows: unknown[][] };
    sources.rows[0]![0] = "FIX-S5951ed7d0e";
    writeFileSync(sourcesPath, `${JSON.stringify(sources)}\n`);
    updateManifestEntry(tainted, "tables/sources.json");
    expect(() => importAlderney({ ...options, packageDir: tainted, requireGitTrackedPackage: false })).toThrow(
      /Fixture token rejected/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("records unmatched citation tokens as unresolved evidence without inventing a source", () => {
    const dir = tempDir("atlas-alderney-unresolved-");
    const options = pathsFor(dir);
    const copy = path.join(dir, "unresolved-package");
    cpSync(path.join(repoRoot, "data/countries/alderney"), copy, { recursive: true });
    const historyPath = path.join(copy, "tables/history-index.json");
    writeFileSync(
      historyPath,
      readFileSync(historyPath, "utf8").replace(
        "https://www.bailiwickexpress.com/news-ge/pair-elected-to-states-of-alderney/",
        "TEST-UNMATCHED-CITATION",
      ),
    );
    updateManifestEntry(copy, "tables/history-index.json");
    const result = importAlderney({ ...options, packageDir: copy, requireGitTrackedPackage: false });
    expect(result.releaseId).not.toBe(CANDIDATE_RELEASE_ID);
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      const unresolved = master
        .prepare("SELECT original_token, reason FROM unresolved_evidence WHERE original_token = ?")
        .get("TEST-UNMATCHED-CITATION");
      expect(unresolved).toMatchObject({
        original_token: "TEST-UNMATCHED-CITATION",
        reason: "unmatched_catalogue_token",
      });
      expect(
        master.prepare("SELECT 1 AS ok FROM source WHERE url = 'TEST-UNMATCHED-CITATION'").get(),
      ).toBeUndefined();
      expect(
        master.prepare("SELECT event_id FROM election_event WHERE event_id = 'event-1e4346e3f46e487f877780f8'").get(),
      ).toBeTruthy();
    } finally {
      master.close();
    }
  });

  it("rejects a second writer and missing≠zero status mismatches", () => {
    const dir = tempDir("atlas-alderney-lock-");
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const fd = acquireWriterLock(sqlitePath);
    try {
      expect(() =>
        importAlderney({
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
            '${OFFICE_NAMESPACE}', 'GG-ALD-PLEB', 'GG-ALD-PLEB::2024::2024-12-07', 'event-x-r0', 'alderney',
            NULL, 'zero', 1, 'recorded', 'percent_0_100', NULL, 'unknown',
            'unknown', 'country-package-alderney', 'country-package-alderney--sha256-dead', '{}'
          );
        `),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
