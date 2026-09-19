import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria, assertAustriaFidelity } from "../../lib/atlas/austria/import";
import { AustriaPreflightError, unpackAustriaMembers } from "../../lib/atlas/austria/inventory";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  DRAFT_FINGERPRINT,
  DRAFT_RELEASE_ID,
  LINEAGE_ID,
  METHOD_V2_FINGERPRINT,
  OFFICE_NAMESPACE,
  REGIONAL_CALENDAR_LABEL,
  REGIONAL_OFFICE_IDS,
  ST_GEORGEN_HOLD_EVENT_ID,
  ST_GEORGEN_HOLD_HISTORY_KEY,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  eventIdFor,
  fingerprintSha256,
  geographyIdFor,
  sha256Hex,
} from "../../lib/atlas/austria/identity";
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

function octal(value: number, width: number): string {
  return value.toString(8).padStart(width - 1, "0") + " ";
}

function packUstar(files: Map<string, Buffer>): Buffer {
  const chunks: Buffer[] = [];
  const names = [...files.keys()].sort();
  for (const name of names) {
    const content = files.get(name)!;
    const header = Buffer.alloc(512, 0);
    const nameBytes = Buffer.from(name, "utf8");
    if (nameBytes.length > 100) throw new Error(`tar name too long: ${name}`);
    nameBytes.copy(header, 0);
    header.write("0000644", 100, 7, "utf8");
    header.write(octal(0, 8), 108, 8, "utf8");
    header.write(octal(0, 8), 116, 8, "utf8");
    header.write(octal(content.length, 12), 124, 12, "utf8");
    header.write(octal(0, 12), 136, 12, "utf8");
    header.write("0", 156, 1, "utf8");
    header.write("ustar", 257, 5, "utf8");
    header.write("00", 263, 2, "utf8");
    header.fill(0x20, 148, 156);
    let sum = 0;
    for (const byte of header) sum += byte;
    header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, 8, "utf8");
    chunks.push(header);
    chunks.push(content);
    const pad = (512 - (content.length % 512)) % 512;
    if (pad) chunks.push(Buffer.alloc(pad));
  }
  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

function xzCompress(buffer: Buffer): Buffer {
  return execFileSync("xz", ["-z", "-c", "-0"], {
    input: buffer,
    maxBuffer: 512 * 1024 * 1024,
    encoding: "buffer",
  });
}

function mutateAustriaPackage(
  destDir: string,
  mutator: (files: Map<string, Buffer>, outer: { coverage: string; manifest: Record<string, unknown> }) => void,
): void {
  cpSync(path.join(repoRoot, "data/countries/austria"), destDir, { recursive: true });
  const files = unpackAustriaMembers(destDir);
  const coveragePath = path.join(destDir, "coverage.json");
  const manifestPath = path.join(destDir, "manifest.json");
  const outer = {
    coverage: readFileSync(coveragePath, "utf8"),
    manifest: JSON.parse(readFileSync(manifestPath, "utf8")) as {
      payload_sha256: string;
      chunks: Record<string, { sha256: string; bytes: number }>;
      inventory: { path: string; sha256: string; bytes: number };
    },
  };
  mutator(files, outer);
  const inventory = JSON.parse(files.get("inventory.json")!.toString("utf8")) as {
    contents: Record<string, { sha256: string; bytes: number }>;
  };
  for (const [entry, bytes] of files) {
    if (entry === "inventory.json") continue;
    inventory.contents[entry] = { sha256: sha256Hex(bytes), bytes: bytes.length };
  }
  files.set("inventory.json", Buffer.from(`${JSON.stringify(inventory)}\n`));
  const xz = xzCompress(packUstar(files));
  for (const name of Object.keys(outer.manifest.chunks)) {
    rmSync(path.join(destDir, name), { force: true });
  }
  const chunkSize = 98304;
  const chunks: Record<string, { sha256: string; bytes: number }> = {};
  for (let offset = 0, index = 1; offset < xz.length; offset += chunkSize, index += 1) {
    const part = xz.subarray(offset, offset + chunkSize);
    const relative = `payload/data.tar.xz.part${String(index).padStart(3, "0")}`;
    writeFileSync(path.join(destDir, relative), part);
    chunks[relative] = { sha256: sha256Hex(part), bytes: part.length };
  }
  const inventoryBytes = files.get("inventory.json")!;
  outer.manifest.payload_sha256 = sha256Hex(xz);
  outer.manifest.chunks = chunks;
  outer.manifest.inventory = {
    path: "inventory.json",
    sha256: sha256Hex(inventoryBytes),
    bytes: inventoryBytes.length,
  };
  writeFileSync(manifestPath, `${JSON.stringify(outer.manifest)}\n`);
  writeFileSync(coveragePath, outer.coverage);
}

describe("Austria identity anchors", () => {
  it("preserves documented geography, event, and hold public IDs", () => {
    expect(geographyIdFor("Abfaltersbach", "Mayor")).toBe("geo-d3a525f5a87408bb04efd267");
    expect(geographyIdFor("Carinthia", "State legislature")).toBe("geo-7842b5b67d2aa6b79214f9f3");
    expect(geographyIdFor("St.Georgen am Walde", "Mayor")).toBe("geo-71094c0200bc990c72916c31");
    expect(eventIdFor("AT-TY-C-70201::2022::")).toBe("event-4b14e098bb06b69d66290f60");
    expect(eventIdFor("AT-BG-10602-M::2022::")).toBe("event-e41173a85dde8b05f2639a6d");
    expect(eventIdFor("AU-ab9fc7cefb::2022::")).toBe("event-971743b1a1be1a05388e750b");
    expect(eventIdFor(ST_GEORGEN_HOLD_HISTORY_KEY)).toBe(ST_GEORGEN_HOLD_EVENT_ID);
  });

  it("hashes the approved Austria tier file bytes without rewriting them", () => {
    expect(hashFile(TIER_PATH)).toBe(TIER_SHA256);
  });

  it("reproduces the documented draft fingerprint and method_version=2 hash probe", () => {
    const inventory = JSON.parse(
      readFileSync(path.join(repoRoot, "docs/phase1/austria/Austria_Input_Inventory.json"), "utf8"),
    ) as {
      hash_inputs: Parameters<typeof buildHashInputs>[0];
    };
    const hashInputs = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
    });
    expect(fingerprintSha256(hashInputs)).toBe(DRAFT_FINGERPRINT);
    expect(`${LINEAGE_ID}--sha256-${DRAFT_FINGERPRINT}`).toBe(DRAFT_RELEASE_ID);
    const methodV2 = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
      methodVersion: "atlas-preserve-evidence/2",
    });
    expect(fingerprintSha256(methodV2)).toBe(METHOD_V2_FINGERPRINT);
  });
});

describe("Prompt N Austria import gates", () => {
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
    "imports Austria with approved counts, four regional IDs, retained St. Georgen hold, and unchanged re-import",
    () => {
      const dir = tempDir("atlas-austria-import-");
      const options = pathsFor(dir);

      const first = importAustria(options);
      expect(first.reusedRelease).toBe(false);
      expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
      expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
      expect(first.counts).toMatchObject({
        current_offices: 2038,
        selected_histories: 5956,
        prospective_events: 0,
        total_events: 5956,
        research_dates: 5956,
        historical_dates_day: 58,
        historical_dates_year: 5898,
        result_rows: 16336,
        sources: 97,
        distinct_catalogue_sources: 93,
        inline_only_sources: 4,
        municipal_offices: 2034,
        regional_offices: 4,
        mayor_offices: 1017,
        municipal_council_offices: 1017,
        unknown_next_dates: 2038,
        office_briefings_retained: 2038,
        country_briefings_retained: 1,
        poll_records_retained: 1,
        control_observations_supplied: 0,
        proceedings: 0,
        party_mappings: 0,
        retained_inputs: 2084,
      });

      const publishedSha = fileSha256(options.sqlitePath);
      const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        assertAustriaFidelity(master);
        expect(countRows(master, "office", "lineage_id = ?", [LINEAGE_ID])).toBe(2038);
        expect(countRows(master, "election_event", "lineage_id = ?", [LINEAGE_ID])).toBe(5956);
        expect(countRows(master, "result_row", "lineage_id = ?", [LINEAGE_ID])).toBe(16336);
        expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID])).toBe(2034);
        expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(4);
        expect(countRows(master, "proceeding", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
        expect(countRows(master, "party_mapping", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
        const regionalIds = master
          .prepare(
            `SELECT o.office_id FROM office o
             JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
             WHERE o.country_id = 'austria' AND t.tier = 'regional'
             ORDER BY o.office_id`,
          )
          .all()
          .map((row) => String(row.office_id));
        expect(regionalIds).toEqual([...REGIONAL_OFFICE_IDS].sort());
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')")
            .get(),
        ).toMatchObject({ n: 0 });

        const hold = master
          .prepare("SELECT history_key, raw_json FROM election_event WHERE event_id = ?")
          .get(ST_GEORGEN_HOLD_EVENT_ID);
        expect(hold).toMatchObject({ history_key: ST_GEORGEN_HOLD_HISTORY_KEY });
        expect(JSON.parse(String(hold?.raw_json)).supplemental.publication_hold).toBe(true);
        expect(countRows(master, "result_row", "history_key = ?", [ST_GEORGEN_HOLD_HISTORY_KEY])).toBe(4);

        const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(release?.release_id)).toBe(first.releaseId);
        expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
        expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
        expect(release).toMatchObject({
          adapter_version: "atlas-austria-field-map/1",
          method_version: "atlas-preserve-evidence/1",
          schema_version: "atlas-master/1",
          research_snapshot_label: "2026-09-11",
          upstream_release_id: LINEAGE_ID,
          research_coverage_complete: 0,
        });
      } finally {
        master.close();
      }

      const regional = listAtlasRegionalCalendar("austria", options.sqlitePath);
      expect(regional.count).toBe(4);
      expect(regional.offices.map((row) => row.officeId).sort()).toEqual([...REGIONAL_OFFICE_IDS].sort());
      expect(regional.label).toBe(REGIONAL_CALENDAR_LABEL);
      expect(regional.denominatorKnown).toBe(false);

      const firstAttempt = latestAttempt(options.attemptsPath);
      expect(firstAttempt).toMatchObject({
        attempt_id: first.attemptId,
        status: "succeeded",
        successful_release_id: first.releaseId,
        operator: "atlas-ci",
        script_version: "atlas-import/1.0.0",
      });

      const second = importAustria(options);
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
        importAustria({
          ...options,
          poisonAfterWrite: (db) => {
            db.exec("PRAGMA foreign_keys = OFF;");
            db.prepare("DELETE FROM source WHERE source_id = ?").run("austria--Saa268dd490");
            db.exec("PRAGMA foreign_keys = ON;");
          },
        }),
      ).toThrow(/foreign_key_check|FOREIGN|source/i);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      const poisonAttempt = latestAttempt(options.attemptsPath);
      expect(poisonAttempt.status).toBe("failed");
      expect(poisonAttempt.successful_release_id).toBeNull();
      expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

      expect(() => importAustria({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
      expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
      expect(latestAttempt(options.attemptsPath).status).toBe("failed");
      expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();

      const coverageDir = path.join(dir, "coverage-package");
      cpSync(path.join(repoRoot, "data/countries/austria"), coverageDir, { recursive: true });
      const coveragePath = path.join(coverageDir, "coverage.json");
      const coverage = JSON.parse(readFileSync(coveragePath, "utf8")) as { remaining: string };
      coverage.remaining = `${coverage.remaining} test-only remaining note.`;
      writeFileSync(coveragePath, `${JSON.stringify(coverage)}\n`);
      const changed = importAustria({ ...options, packageDir: coverageDir, requireGitTrackedPackage: false });
      expect(changed.releaseId).not.toBe(first.releaseId);
      const master3 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        expect(countRows(master3, "office_tier_classification", "tier = 'municipal'")).toBe(2034);
        expect(countRows(master3, "office_tier_classification", "tier = 'regional'")).toBe(4);
        expect(master3.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 2 });
        const selected = master3.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(selected?.release_id)).toBe(changed.releaseId);
      } finally {
        master3.close();
      }
      expect(publishedSha).not.toBe(fileSha256(options.sqlitePath));
    },
    600_000,
  );

  it("rejects missing and non-approved tier files with a durable failed attempt", () => {
    const dir = tempDir("atlas-austria-tiers-");
    const options = pathsFor(dir);
    const missingPath = path.join(dir, "missing-austria.json");
    expect(() => importAustria({ ...options, tierPath: missingPath })).toThrow(AustriaPreflightError);
    const missing = latestAttempt(options.attemptsPath);
    expect(missing.status).toBe("failed");
    expect(missing.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);

    const draftPath = path.join(dir, "draft-austria.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as { status: string };
    approved.status = "draft_for_human_review";
    writeFileSync(draftPath, `${JSON.stringify(approved, null, 2)}\n`);
    expect(() => importAustria({ ...options, tierPath: draftPath })).toThrow(/status is "draft_for_human_review"/);
    const draft = latestAttempt(options.attemptsPath);
    expect(draft.status).toBe("failed");
    expect(draft.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects OBSERVATORY_FIXTURES=1, FIX- tokens, and corrupt packed chunks", () => {
    const dir = tempDir("atlas-austria-fixtures-");
    const options = pathsFor(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() => importAustria(options)).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
    const envAttempt = latestAttempt(options.attemptsPath);
    expect(envAttempt.status).toBe("failed");
    expect(envAttempt.successful_release_id).toBeNull();
    delete process.env.OBSERVATORY_FIXTURES;

    const tainted = path.join(dir, "tainted-package");
    mutateAustriaPackage(tainted, (files) => {
      const sourcesPath = "tables/companion/sources.json";
      const sources = JSON.parse(files.get(sourcesPath)!.toString("utf8")) as { rows: unknown[][] };
      sources.rows[0]![0] = "FIX-Saa268dd490";
      files.set(sourcesPath, Buffer.from(`${JSON.stringify(sources)}\n`));
    });
    expect(() => importAustria({ ...options, packageDir: tainted, requireGitTrackedPackage: false })).toThrow(
      /Fixture|FIX-/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);

    const corrupt = path.join(dir, "corrupt-package");
    cpSync(path.join(repoRoot, "data/countries/austria"), corrupt, { recursive: true });
    const chunk = path.join(corrupt, "payload/data.tar.xz.part001");
    const bytes = readFileSync(chunk);
    bytes[0] = bytes[0]! ^ 0xff;
    writeFileSync(chunk, bytes);
    expect(() => importAustria({ ...options, packageDir: corrupt, requireGitTrackedPackage: false })).toThrow(
      /chunk mismatch|payload/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);
  }, 180_000);

  it("records unmatched citation tokens as unresolved evidence without inventing a source", () => {
    const dir = tempDir("atlas-austria-unresolved-");
    const options = pathsFor(dir);
    const copy = path.join(dir, "unresolved-package");
    mutateAustriaPackage(copy, (files) => {
      const returnsPath = "tables/companion/full-results.json";
      const table = JSON.parse(files.get(returnsPath)!.toString("utf8")) as { rows: unknown[][] };
      table.rows[0]![7] = "TEST-UNMATCHED-CITATION";
      table.rows[0]![8] = "TEST-UNMATCHED-CITATION";
      files.set(returnsPath, Buffer.from(`${JSON.stringify(table)}\n`));
    });
    const result = importAustria({ ...options, packageDir: copy, requireGitTrackedPackage: false });
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
      expect(master.prepare("SELECT 1 AS ok FROM source WHERE url = 'TEST-UNMATCHED-CITATION'").get()).toBeUndefined();
      expect(
        master.prepare("SELECT event_id FROM election_event WHERE event_id = ?").get(ST_GEORGEN_HOLD_EVENT_ID),
      ).toBeTruthy();
    } finally {
      master.close();
    }
  }, 300_000);

  it("rejects a second writer and missing≠zero status mismatches", () => {
    const dir = tempDir("atlas-austria-lock-");
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const fd = acquireWriterLock(sqlitePath);
    try {
      expect(() =>
        importAustria({
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
            '${OFFICE_NAMESPACE}', 'AT-TY-C-70201', 'AT-TY-C-70201::2022::', 'event-x-r0', 'austria',
            NULL, 'zero', 1, 'recorded', 'percent_0_100', NULL, 'unknown',
            'unknown', 'country-package-austria', 'country-package-austria--sha256-dead', '{}'
          );
        `),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
