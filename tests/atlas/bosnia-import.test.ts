import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { importBosnia, assertBosniaFidelity } from "../../lib/atlas/bosnia-and-herzegovina/import";
import { BosniaPreflightError, unpackBosniaMembers } from "../../lib/atlas/bosnia-and-herzegovina/inventory";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  CEC_HOMEPAGE_SOURCE_ID,
  CEC_HOMEPAGE_URL,
  DRAFT_FINGERPRINT,
  DRAFT_METHOD_V2_FINGERPRINT,
  DRAFT_RELEASE_ID,
  EXPECTED_COUNTS,
  GORAZDE_2022_EVENT_ID,
  GORAZDE_2022_SOURCE_ID,
  GORAZDE_NEXT_EVENT_ID,
  LINEAGE_ID,
  METHOD_V2_FINGERPRINT,
  OFFICE_NAMESPACE,
  REGIONAL_CALENDAR_LABEL,
  RS_PRESIDENT_2022_EVENT_ID,
  SCREENING_SOURCE_ID,
  SCREENING_URL,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  eventIdFor,
  fingerprintSha256,
  geographyIdFor,
  looksLikeBrcko,
  nextEventIdFor,
  sha256Hex,
  urlSourceId,
} from "../../lib/atlas/bosnia-and-herzegovina/identity";
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

function mutateBosniaPackage(
  destDir: string,
  mutator: (files: Map<string, Buffer>, outer: { coverage: string; manifest: Record<string, unknown> }) => void,
): void {
  cpSync(path.join(repoRoot, "data/countries/bosnia-and-herzegovina"), destDir, { recursive: true });
  const files = unpackBosniaMembers(destDir);
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
  const gz = gzipSync(packUstar(files));
  writeFileSync(path.join(destDir, "payload/data.tar.gz.part001"), gz);
  const chunks: Record<string, { sha256: string; bytes: number }> = {
    "payload/data.tar.gz.part001": { sha256: sha256Hex(gz), bytes: gz.length },
  };
  const inventoryBytes = files.get("inventory.json")!;
  outer.manifest.payload_sha256 = sha256Hex(gz);
  outer.manifest.chunks = chunks;
  outer.manifest.inventory = {
    path: "inventory.json",
    sha256: sha256Hex(inventoryBytes),
    bytes: inventoryBytes.length,
  };
  writeFileSync(manifestPath, `${JSON.stringify(outer.manifest)}\n`);
  writeFileSync(coveragePath, outer.coverage);
}

describe("Bosnia and Herzegovina identity anchors", () => {
  it("preserves documented geography, next-event, and historical public IDs", () => {
    expect(geographyIdFor("Bosnian-Podrinje Goražde", "Cantonal assembly")).toBe("geo-6e53e543ce8632cc16493b67");
    expect(geographyIdFor("Republika Srpska", "President")).toBe("geo-8c7f8505280a44a31501a4e5");
    expect(geographyIdFor("Republika Srpska", "National Assembly")).toBe("geo-4a8173515c1229a41834fd01");
    expect(nextEventIdFor("BA-205")).toBe(GORAZDE_NEXT_EVENT_ID);
    expect(eventIdFor("BA-205::2022::")).toBe(GORAZDE_2022_EVENT_ID);
    expect(eventIdFor("BA-G::2022::")).toBe(RS_PRESIDENT_2022_EVENT_ID);
    expect(urlSourceId(CEC_HOMEPAGE_URL)).toBe(CEC_HOMEPAGE_SOURCE_ID);
    expect(urlSourceId(SCREENING_URL)).toBe(SCREENING_SOURCE_ID);
    expect(looksLikeBrcko("BA-BRC")).toBe(true);
    expect(looksLikeBrcko("Brčko District")).toBe(true);
    expect(looksLikeBrcko("BA-G")).toBe(false);
    expect(looksLikeBrcko("BA-205")).toBe(false);
  });

  it("hashes the approved Bosnia tier file bytes without rewriting them", () => {
    expect(hashFile(TIER_PATH)).toBe(TIER_SHA256);
  });

  it("reproduces the draft Prompt O fingerprint and the approved-tier candidate hash", () => {
    const inventory = JSON.parse(
      readFileSync(path.join(repoRoot, "docs/phase1/bosnia-and-herzegovina/Bosnia_Input_Inventory.json"), "utf8"),
    ) as {
      hash_inputs: Parameters<typeof buildHashInputs>[0];
    };
    const draftInputs = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
    });
    expect(fingerprintSha256(draftInputs)).toBe(DRAFT_FINGERPRINT);
    expect(`${LINEAGE_ID}--sha256-${DRAFT_FINGERPRINT}`).toBe(DRAFT_RELEASE_ID);
    const draftMethodV2 = buildHashInputs({
      inputs: inventory.hash_inputs.inputs,
      overrides: inventory.hash_inputs.overrides,
      methodVersion: "atlas-preserve-evidence/2",
    });
    expect(fingerprintSha256(draftMethodV2)).toBe(DRAFT_METHOD_V2_FINGERPRINT);

    const tierBytes = readFileSync(path.join(repoRoot, TIER_PATH));
    const approvedInputs = buildHashInputs({
      inputs: inventory.hash_inputs.inputs.map((item) =>
        item.input_path === TIER_PATH
          ? { ...item, sha256: TIER_SHA256, byte_count: tierBytes.length }
          : item,
      ),
      overrides: inventory.hash_inputs.overrides,
    });
    expect(fingerprintSha256(approvedInputs)).toBe(CANDIDATE_FINGERPRINT);
    expect(`${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`).toBe(CANDIDATE_RELEASE_ID);
    const methodV2 = buildHashInputs({
      inputs: approvedInputs.inputs,
      overrides: approvedInputs.overrides,
      methodVersion: "atlas-preserve-evidence/2",
    });
    expect(fingerprintSha256(methodV2)).toBe(METHOD_V2_FINGERPRINT);
  });
});

describe("Prompt O Bosnia and Herzegovina import gates", () => {
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

  it("imports Bosnia with 13 regional offices, open research holds, and unchanged re-import", () => {
    const dir = tempDir("atlas-bosnia-import-");
    const options = pathsFor(dir);

    const first = importBosnia(options);
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
    expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
    expect(first.counts).toMatchObject({ ...EXPECTED_COUNTS });

    const publishedSha = fileSha256(options.sqlitePath);
    const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      assertBosniaFidelity(master);
      expect(countRows(master, "office", "lineage_id = ?", [LINEAGE_ID])).toBe(13);
      expect(countRows(master, "election_event", "lineage_id = ?", [LINEAGE_ID])).toBe(52);
      expect(countRows(master, "result_row", "lineage_id = ?", [LINEAGE_ID])).toBe(749);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(13);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND review_status = 'approved'", [LINEAGE_ID])).toBe(10);
      expect(countRows(master, "office_tier_classification", "lineage_id = ? AND review_status = 'needs_review'", [LINEAGE_ID])).toBe(3);
      expect(countRows(master, "proceeding", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(countRows(master, "party_mapping", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
      expect(master.prepare("SELECT office_id FROM office WHERE office_id LIKE '%BRC%'").get()).toBeUndefined();
      expect(
        master
          .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')")
          .get(),
      ).toMatchObject({ n: 0 });

      const expectedDate = master
        .prepare("SELECT label, precision, certainty FROM research_date WHERE date_id = (SELECT next_date_id FROM office WHERE office_id = 'BA-205')")
        .get();
      expect(expectedDate).toMatchObject({ label: "2026-10-04", precision: "day", certainty: "expected" });
      expect(
        master.prepare("SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ? AND certainty = 'called'").get(LINEAGE_ID),
      ).toMatchObject({ n: 0 });

      const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
      expect(String(release?.release_id)).toBe(first.releaseId);
      expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
      expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
      expect(release).toMatchObject({
        adapter_version: "atlas-bosnia-and-herzegovina-field-map/1",
        method_version: "atlas-preserve-evidence/1",
        schema_version: "atlas-master/1",
        research_snapshot_label: "2026-09-11",
        upstream_release_id: LINEAGE_ID,
        research_coverage_complete: 0,
      });
      const documented = JSON.parse(
        readFileSync(path.join(repoRoot, "docs/phase1/bosnia-and-herzegovina/Bosnia_Input_Inventory.json"), "utf8"),
      ) as { hash_inputs_canonical_json: string };
      expect(String(release?.hash_inputs_json)).not.toBe(documented.hash_inputs_canonical_json);
      const parsed = JSON.parse(String(release?.hash_inputs_json)) as {
        inputs: Array<{ input_path: string; sha256: string }>;
      };
      expect(parsed.inputs.find((item) => item.input_path === TIER_PATH)?.sha256).toBe(TIER_SHA256);
    } finally {
      master.close();
    }

    const regional = listAtlasRegionalCalendar("bosnia-and-herzegovina", options.sqlitePath);
    expect(regional.count).toBe(13);
    expect(regional.offices).toHaveLength(13);
    expect(regional.offices.every((row) => row.tier === "regional")).toBe(true);
    expect(regional.offices.some((row) => row.officeId === "BA-G")).toBe(true);
    expect(regional.offices.some((row) => /Brčko|Brcko|BA-BRC/i.test(row.officeId) || /Brčko|Brcko/i.test(row.name))).toBe(
      false,
    );
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

    const second = importBosnia(options);
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
      importBosnia({
        ...options,
        poisonAfterWrite: (db) => {
          db.exec("PRAGMA foreign_keys = OFF;");
          db.prepare("DELETE FROM source WHERE source_id = ?").run(GORAZDE_2022_SOURCE_ID);
          db.exec("PRAGMA foreign_keys = ON;");
        },
      }),
    ).toThrow(/foreign_key_check|FOREIGN|source/i);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
    const poisonAttempt = latestAttempt(options.attemptsPath);
    expect(poisonAttempt.status).toBe("failed");
    expect(poisonAttempt.successful_release_id).toBeNull();
    expect(existsSync(`${options.sqlitePath}.staging`)).toBe(false);

    expect(() => importBosnia({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
    expect(fileSha256(options.sqlitePath)).toBe(poisonPrior);
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(latestAttempt(options.attemptsPath).successful_release_id).toBeNull();

    const coverageDir = path.join(dir, "coverage-package");
    cpSync(path.join(repoRoot, "data/countries/bosnia-and-herzegovina"), coverageDir, { recursive: true });
    const coveragePath = path.join(coverageDir, "coverage.json");
    const coverage = JSON.parse(readFileSync(coveragePath, "utf8")) as { remaining: string };
    coverage.remaining = `${coverage.remaining} test-only remaining note.`;
    writeFileSync(coveragePath, `${JSON.stringify(coverage)}\n`);
    const changed = importBosnia({ ...options, packageDir: coverageDir, requireGitTrackedPackage: false });
    expect(changed.releaseId).not.toBe(first.releaseId);
    const master3 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
    try {
      expect(countRows(master3, "office_tier_classification", "tier = 'regional'")).toBe(13);
      expect(countRows(master3, "office_tier_classification", "tier = 'municipal'")).toBe(0);
      expect(master3.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 2 });
      const selected = master3.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
      expect(String(selected?.release_id)).toBe(changed.releaseId);
    } finally {
      master3.close();
    }
    expect(publishedSha).not.toBe(fileSha256(options.sqlitePath));
  });

  it("rejects missing and non-approved tier files with a durable failed attempt", () => {
    const dir = tempDir("atlas-bosnia-tiers-");
    const options = pathsFor(dir);
    const missingPath = path.join(dir, "missing-bosnia.json");
    expect(() => importBosnia({ ...options, tierPath: missingPath })).toThrow(BosniaPreflightError);
    const missing = latestAttempt(options.attemptsPath);
    expect(missing.status).toBe("failed");
    expect(missing.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);

    const draftPath = path.join(dir, "draft-bosnia.json");
    const approved = JSON.parse(readFileSync(path.join(repoRoot, TIER_PATH), "utf8")) as { status: string };
    approved.status = "draft_for_human_review";
    writeFileSync(draftPath, `${JSON.stringify(approved, null, 2)}\n`);
    expect(() => importBosnia({ ...options, tierPath: draftPath })).toThrow(/status is "draft_for_human_review"/);
    const draft = latestAttempt(options.attemptsPath);
    expect(draft.status).toBe("failed");
    expect(draft.successful_release_id).toBeNull();
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("rejects OBSERVATORY_FIXTURES=1, FIX-/FXT- tokens, Brčko, municipal invention, and corrupt packed chunks", () => {
    const dir = tempDir("atlas-bosnia-fixtures-");
    const options = pathsFor(dir);
    process.env.OBSERVATORY_FIXTURES = "1";
    expect(() => importBosnia(options)).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
    const envAttempt = latestAttempt(options.attemptsPath);
    expect(envAttempt.status).toBe("failed");
    expect(envAttempt.successful_release_id).toBeNull();
    delete process.env.OBSERVATORY_FIXTURES;

    const tainted = path.join(dir, "tainted-package");
    mutateBosniaPackage(tainted, (files) => {
      const sourcesPath = "tables/master/sources.json";
      const sources = JSON.parse(files.get(sourcesPath)!.toString("utf8")) as { rows: unknown[][] };
      sources.rows[0]![0] = "FIX-S7dc4e82fd3";
      files.set(sourcesPath, Buffer.from(`${JSON.stringify(sources)}\n`));
    });
    expect(() => importBosnia({ ...options, packageDir: tainted, requireGitTrackedPackage: false })).toThrow(
      /Fixture|FIX-/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);

    const brcko = path.join(dir, "brcko-package");
    mutateBosniaPackage(brcko, (files) => {
      const registerPath = "tables/master/office-register.json";
      const register = JSON.parse(files.get(registerPath)!.toString("utf8")) as { columns: string[]; rows: unknown[][] };
      const idCol = register.columns.indexOf("Office ID");
      register.rows[0]![idCol] = "BA-BRC";
      files.set(registerPath, Buffer.from(`${JSON.stringify(register)}\n`));
    });
    expect(() => importBosnia({ ...options, packageDir: brcko, requireGitTrackedPackage: false })).toThrow(
      /Office register SHA-256 mismatch|Brčko|BRC/i,
    );
    expect(existsSync(options.sqlitePath)).toBe(false);

    const municipal = path.join(dir, "municipal-package");
    mutateBosniaPackage(municipal, (files) => {
      const registerPath = "tables/master/office-register.json";
      const register = JSON.parse(files.get(registerPath)!.toString("utf8")) as { columns: string[]; rows: unknown[][] };
      const officeCol = register.columns.indexOf("Office");
      register.rows[0]![officeCol] = "Mayor";
      files.set(registerPath, Buffer.from(`${JSON.stringify(register)}\n`));
    });
    expect(() => importBosnia({ ...options, packageDir: municipal, requireGitTrackedPackage: false })).toThrow(
      /Office register SHA-256 mismatch|Municipal office invented/,
    );
    expect(existsSync(options.sqlitePath)).toBe(false);

    const corrupt = path.join(dir, "corrupt-package");
    cpSync(path.join(repoRoot, "data/countries/bosnia-and-herzegovina"), corrupt, { recursive: true });
    const chunk = path.join(corrupt, "payload/data.tar.gz.part001");
    const bytes = readFileSync(chunk);
    bytes[0] = bytes[0]! ^ 0xff;
    writeFileSync(chunk, bytes);
    expect(() => importBosnia({ ...options, packageDir: corrupt, requireGitTrackedPackage: false })).toThrow(
      /chunk mismatch|payload/,
    );
    expect(latestAttempt(options.attemptsPath).status).toBe("failed");
    expect(existsSync(options.sqlitePath)).toBe(false);
  });

  it("records unmatched citation tokens as unresolved evidence without inventing a source", () => {
    const dir = tempDir("atlas-bosnia-unresolved-");
    const options = pathsFor(dir);
    const copy = path.join(dir, "unresolved-package");
    mutateBosniaPackage(copy, (files) => {
      const returnsPath = "tables/master/detailed-returns.json";
      const table = JSON.parse(files.get(returnsPath)!.toString("utf8")) as { columns: string[]; rows: unknown[][] };
      const urlCol = table.columns.indexOf("Source URL");
      table.rows[0]![urlCol] = "TEST-UNMATCHED-CITATION";
      files.set(returnsPath, Buffer.from(`${JSON.stringify(table)}\n`));
    });
    const result = importBosnia({ ...options, packageDir: copy, requireGitTrackedPackage: false });
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
        master.prepare("SELECT event_id FROM election_event WHERE event_id = ?").get(GORAZDE_2022_EVENT_ID),
      ).toBeTruthy();
    } finally {
      master.close();
    }
  });

  it("rejects a second writer and missing≠zero status mismatches", () => {
    const dir = tempDir("atlas-bosnia-lock-");
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const fd = acquireWriterLock(sqlitePath);
    try {
      expect(() =>
        importBosnia({
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
            '${OFFICE_NAMESPACE}', 'BA-205', 'BA-205::2022::', 'event-x-r0', 'bosnia-and-herzegovina',
            NULL, 'zero', 1, 'recorded', 'percent_0_100', NULL, 'unknown',
            'unknown', 'country-package-bosnia-and-herzegovina', 'country-package-bosnia-and-herzegovina--sha256-dead', '{}'
          );
        `),
      ).toThrow();
    } finally {
      db.close();
    }
  });
});
