import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { deflateRawSync, gzipSync } from "node:zlib";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { votesAreIncomplete } from "../../lib/atlas/pack-results/map";
import { loadCountryPackResults } from "../../lib/atlas/pack-results/load";

const repoRoot = path.join(import.meta.dirname, "../..");
const SHA = "a".repeat(64);

function sha256(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function zipFiles(entries: { name: string; data: Buffer }[]): Buffer {
  const parts: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const compressed = deflateRawSync(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    parts.push(local, name, compressed);
    centrals.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, eocd]);
}

function manifest(files: Record<string, Buffer>): Buffer {
  const lines = Object.keys(files)
    .sort()
    .map((name) => `${sha256(files[name]!)}  ${name}`);
  return Buffer.from(`${lines.join("\n")}\n`);
}

function packZip(dir: string, top: string, files: Record<string, Buffer>): string {
  const sums = manifest(files);
  const entries = Object.entries(files).map(([name, data]) => ({ name: `${top}${name}`, data }));
  entries.push({ name: `${top}SHA256SUMS`, data: sums });
  const zipPath = path.join(dir, `${top.replace(/\/$/, "")}.zip`);
  writeFileSync(zipPath, zipFiles(entries));
  return zipPath;
}

function seedCountry(
  db: DatabaseSync,
  args: {
    countryId: string;
    code: string;
    lineageId: string;
    releaseId: string;
    namespace: string;
    officeId: string;
    geographyId: string;
    withEvent?: boolean;
  },
): void {
  db.exec("BEGIN IMMEDIATE;");
  db.prepare("INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'country_package', ?)").run(
    args.lineageId,
    args.countryId,
  );
  db.prepare(
    `INSERT INTO dataset_release (
       lineage_id, release_id, fingerprint_sha256, hash_inputs_json, adapter_version, method_version,
       schema_version, validated_counts_json, research_coverage_complete
     ) VALUES (?, ?, ?, '{}', 'fixture', 'fixture', 'fixture', '{}', 0)`,
  ).run(args.lineageId, args.releaseId, SHA);
  db.prepare("INSERT INTO publication_release (lineage_id, release_id) VALUES (?, ?)").run(args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO retained_input (
       lineage_id, release_id, input_path, input_kind, sha256, byte_count, recovery_locator
     ) VALUES (?, ?, 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?, 2, 'fixture')`,
  ).run(args.lineageId, args.releaseId, SHA);
  db.prepare(
    `INSERT INTO country (
       country_id, country_code, name, polity_kind, region_id, coverage_status, lineage_id, release_id
     ) VALUES (?, ?, ?, 'sovereign_country', 'americas', 'partial', ?, ?)`,
  ).run(args.countryId, args.code, args.countryId, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO geography (country_id, geography_id, name, lineage_id, release_id) VALUES (?, ?, ?, ?, ?)`,
  ).run(args.countryId, args.geographyId, args.geographyId, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO office_tier_classification (
       id_namespace, office_id, tier, review_status, rationale, lineage_id, release_id,
       classification_path, classification_kind, classification_sha256
     ) VALUES (?, ?, 'municipal', 'needs_review', 'fixture', ?, ?, 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?)`,
  ).run(args.namespace, args.officeId, args.lineageId, args.releaseId, SHA);
  db.prepare(
    `INSERT INTO office (
       id_namespace, office_id, country_id, geography_id, name, office_type, office_status,
       record_state, next_date_resolution, lineage_id, release_id
     ) VALUES (?, ?, ?, ?, 'Fixture council', 'council', 'current', 'active', 'unknown', ?, ?)`,
  ).run(args.namespace, args.officeId, args.countryId, args.geographyId, args.lineageId, args.releaseId);
  if (args.withEvent) {
    db.prepare(
      `INSERT INTO research_date (date_id, label, precision, certainty, year, month, day, lineage_id, release_id)
       VALUES ('date-other', '2020-01-01', 'day', 'called', 2020, 1, 1, ?, ?)`,
    ).run(args.lineageId, args.releaseId);
    db.prepare(
      `INSERT INTO election_event (
         id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind,
         selected_history_role, ballot_basis, share_unit, legal_outcome, record_state, lineage_id, release_id
       ) VALUES (?, ?, 'hist-other', 'OTHER-E-1', 'date-other', 'resolved', 'ordinary', 'other', 'unknown', 'percent_0_100', 'unknown', 'active', ?, ?)`,
    ).run(args.namespace, args.officeId, args.lineageId, args.releaseId);
    db.prepare(
      `INSERT INTO result_row (
         id_namespace, office_id, history_key, result_row_id, country_id, candidate_or_list_label,
         votes, votes_status, share_status, share_unit, seats_status, evidence_status, lineage_id, release_id
       ) VALUES (?, ?, 'hist-other', 'OTHER-R-1', ?, 'Kept', 3, 'recorded', 'unknown', 'percent_0_100', 'unknown', 'unknown', ?, ?)`,
    ).run(args.namespace, args.officeId, args.countryId, args.lineageId, args.releaseId);
  }
  db.exec("COMMIT;");
}

function countWhere(db: DatabaseSync, table: string, where: string, param: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`).get(param);
  return Number(row?.n ?? 0);
}

describe("full research ZIP results", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("keeps an incomplete Peru vote null and does not turn it into zero", () => {
    expect(votesAreIncomplete({ votes: null, missing_vote_components: 2 })).toBe(true);
    expect(votesAreIncomplete({ votes: 0, votes_incomplete: true })).toBe(true);
    expect(votesAreIncomplete({ votes: "" })).toBe(true);
    expect(votesAreIncomplete({ votes: 0, votes_status: "reported" })).toBe(false);
    expect(votesAreIncomplete({ votes: 12 })).toBe(false);
  });

  it("loads a Peru Prompt BK shaped fixture and a data/ pack without touching another country", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-results-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = new DatabaseSync(sqlitePath);
    seedCountry(db, {
      countryId: "peru",
      code: "PE",
      lineageId: "country-package-peru",
      releaseId: "rel-pe",
      namespace: "ns-pe",
      officeId: "PE-OFF-1",
      geographyId: "PE-GEO",
    });
    seedCountry(db, {
      countryId: "kept-land",
      code: "KL",
      lineageId: "country-package-kept",
      releaseId: "rel-kl",
      namespace: "ns-kl",
      officeId: "KL-OFF-1",
      geographyId: "KL-GEO",
      withEvent: true,
    });
    db.close();

    const events = [
      JSON.stringify({
        event_id: "PE-E-1",
        office_id: "PE-OFF-1",
        date: "2022-10-02",
        election_year: 2022,
        event_kind: "municipal",
      }),
      JSON.stringify({ event_id: "PE-E-2", office_id: null, date: null, election_year: 2022, mapping_state: "hold" }),
      JSON.stringify({ event_id: "PE-E-3", office_id: "PE-OFF-1", date: null, election_year: 2018, event_kind: "regional" }),
    ].join("\n") + "\n";
    const results = [
      JSON.stringify({
        result_id: "PE-R-1",
        event_id: "PE-E-1",
        votes: 120,
        candidate_or_label: "Ada",
        share: 0.4,
        elected: true,
        ticket_component_id: "PE-TC-1",
        result_kind: "candidate",
      }),
      JSON.stringify({
        result_id: "PE-R-2",
        event_id: "PE-E-1",
        votes: null,
        missing_vote_components: 2,
        votes_status: "incomplete",
        candidate_or_label: "Incomplete",
      }),
      JSON.stringify({
        result_id: "PE-R-3",
        event_id: "PE-E-1",
        votes: 0,
        votes_incomplete: true,
        candidate_or_label: "Flagged zero",
      }),
      JSON.stringify({
        result_id: "PE-R-4",
        event_id: "PE-E-1",
        votes: 0,
        votes_status: "reported",
        candidate_or_label: "Real zero",
      }),
      JSON.stringify({ result_id: "PE-R-5", event_id: "PE-E-MISSING", votes: 5, candidate_or_label: "Nope" }),
      JSON.stringify({
        result_id: "PE-R-6",
        event_id: "PE-E-1",
        votes: 11,
        candidate_or_label: "Missing component",
        ticket_component_id: "PE-TC-NO",
      }),
      JSON.stringify({ result_id: "PE-R-7", event_id: "PE-E-1", votes: "", candidate_or_label: "Blank token" }),
    ].join("\n") + "\n";
    const files: Record<string, Buffer> = {
      "events.jsonl": Buffer.from(events),
      "results.jsonl": Buffer.from(results),
      "counts.json": Buffer.from(JSON.stringify({ events: 3, results: 7 })),
      "ticket_components.json": Buffer.from(JSON.stringify([{ ticket_component_id: "PE-TC-1", label: "Ada" }])),
      "successor_edges.json": Buffer.from(
        JSON.stringify([{ from_office_id: "PE-OFF-1", to_office_id: "PE-NEW", asserted: false }]),
      ),
      "upcoming_calendar.json": Buffer.from(JSON.stringify([{ calendar_id: "PE-UP-1", exact_date: null }])),
      "validate.py": Buffer.from("print('read-only')\n"),
      "sources/raw/onpe.txt": Buffer.from("raw\n"),
      "sources/text/onpe.txt": Buffer.from("text\n"),
    };
    const zipPath = packZip(dir, "Peru_Prompt_BK_2026-10-31/", files);

    const first = await loadCountryPackResults({
      scope: "peru",
      zipPath,
      sqlitePath,
      fixture: true,
      derive: true,
    });
    expect(first.wrote).toBe(true);
    expect(first.eventsAccepted).toBe(2);
    expect(first.eventsRejected).toBe(1);
    expect(first.resultsAccepted).toBe(5);
    expect(first.resultsRejected).toBe(2);
    expect(first.officeRegister).toBe("absent");
    expect(first.successorEdgesNoted).toBe(1);
    expect(first.upcomingCalendarNoted).toBe(1);
    expect(first.ticketComponents).toBe(1);
    expect(first.derivedCycles).toBeGreaterThan(0);
    expect(first.eventsFile).toBe("Peru_Prompt_BK_2026-10-31/events.jsonl");

    const check = new DatabaseSync(sqlitePath, { readOnly: true });
    const peruVotes = check
      .prepare(
        `SELECT result_row_id, votes, votes_status, share, share_unit, elected_flag
         FROM result_row WHERE country_id = 'peru' ORDER BY result_row_id`,
      )
      .all();
    expect(peruVotes).toEqual([
      { result_row_id: "PE-R-1", votes: 120, votes_status: "recorded", share: 0.4, share_unit: "proportion_0_1", elected_flag: 1 },
      { result_row_id: "PE-R-2", votes: null, votes_status: "unknown", share: null, share_unit: "proportion_0_1", elected_flag: null },
      { result_row_id: "PE-R-3", votes: null, votes_status: "unknown", share: null, share_unit: "proportion_0_1", elected_flag: null },
      { result_row_id: "PE-R-4", votes: 0, votes_status: "zero", share: null, share_unit: "proportion_0_1", elected_flag: null },
      { result_row_id: "PE-R-7", votes: null, votes_status: "unknown", share: null, share_unit: "proportion_0_1", elected_flag: null },
    ]);
    expect(countWhere(check, "office", "country_id = ?", "peru")).toBe(1);
    expect(countWhere(check, "result_row", "country_id = ?", "kept-land")).toBe(1);
    expect(countWhere(check, "election_event", "lineage_id = ?", "country-package-kept")).toBe(1);
    const yearEvent = check.prepare("SELECT date_resolution FROM election_event WHERE event_id = 'PE-E-3'").get();
    expect(yearEvent?.date_resolution).toBe("resolved");
    check.close();

    const again = await loadCountryPackResults({
      scope: "peru",
      zipPath,
      sqlitePath,
      fixture: true,
      derive: false,
    });
    expect(again.resultsAccepted).toBe(5);
    const after = new DatabaseSync(sqlitePath, { readOnly: true });
    expect(countWhere(after, "result_row", "country_id = ?", "peru")).toBe(5);
    expect(countWhere(after, "result_row", "country_id = ?", "kept-land")).toBe(1);
    after.close();

    const dry = await loadCountryPackResults({
      scope: "peru",
      zipPath,
      sqlitePath,
      fixture: true,
      dryRun: true,
      derive: false,
    });
    expect(dry.wrote).toBe(false);
    expect(dry.resultsAccepted).toBe(5);

    await expect(
      loadCountryPackResults({ scope: "peru", zipPath, sqlitePath, fixture: false, derive: false }),
    ).rejects.toThrow(/12460 events/);
    const still = new DatabaseSync(sqlitePath, { readOnly: true });
    expect(countWhere(still, "result_row", "country_id = ?", "peru")).toBe(5);
    still.close();

    const ukEvents =
      [
        JSON.stringify({
          event_id: "GB-E-1",
          office_id: "GB.LOCAL.E06000001.council",
          poll_date: "2021-05-06",
          date_precision: "day",
          event_kind: "local",
          ballot_basis: "candidate_marks",
        }),
        JSON.stringify({
          event_id: "GB-E-missing",
          office_id: "GB.NOT.REAL",
          poll_date: "2021-05-06",
          date_precision: "day",
        }),
      ].join("\n") + "\n";
    const ukResults =
      [
        JSON.stringify({
          result_row_id: "GB-R-1",
          event_id: "GB-E-1",
          votes: 10,
          votes_status: "reported",
          label: "Ada",
          share: 55,
          share_unit: "percent",
          reporting_unit_id: "U1",
        }),
        JSON.stringify({
          result_row_id: "GB-R-2",
          event_id: "GB-E-missing",
          votes: 1,
          votes_status: "reported",
          label: "No",
          reporting_unit_id: "U1",
        }),
        JSON.stringify({
          result_row_id: "GB-R-3",
          event_id: "GB-E-1",
          votes: 4,
          votes_status: "reported",
          label: "No unit",
          share: 12,
          reporting_unit_id: "U1",
        }),
      ].join("\n") + "\n";
    const ukDb = new DatabaseSync(sqlitePath);
    seedCountry(ukDb, {
      countryId: "united-kingdom",
      code: "GB",
      lineageId: "country-package-united-kingdom",
      releaseId: "rel-gb",
      namespace: "cdd-atlas-gb-research-v1",
      officeId: "GB.LOCAL.E06000001.council",
      geographyId: "E06000001",
    });
    ukDb.close();
    const ukFiles: Record<string, Buffer> = {
      "data/events.jsonl": Buffer.from(ukEvents),
      "data/results.jsonl.gz": gzipSync(Buffer.from(ukResults)),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 2, results: 3 })),
      "data/reporting-units.jsonl": Buffer.from(JSON.stringify({ reporting_unit_id: "U1", event_id: "GB-E-1" }) + "\n"),
    };
    const ukZip = packZip(dir, "United_Kingdom_Atlas_Prompt_AU/", ukFiles);
    const uk = await loadCountryPackResults({
      scope: "united_kingdom",
      zipPath: ukZip,
      sqlitePath,
      fixture: true,
      derive: false,
    });
    expect(uk.eventsFile).toBe("United_Kingdom_Atlas_Prompt_AU/data/events.jsonl");
    expect(uk.resultsFile).toBe("United_Kingdom_Atlas_Prompt_AU/data/results.jsonl.gz");
    expect(uk.eventsAccepted).toBe(1);
    expect(uk.resultsAccepted).toBe(1);
    expect(uk.resultsRejected).toBe(2);
    expect(uk.eventOfficeLinks).toBe(0);
    expect(uk.resultAuditRows).toBeNull();
    const ukCheck = new DatabaseSync(sqlitePath, { readOnly: true });
    const ukRow = ukCheck.prepare("SELECT votes, share, share_unit FROM result_row WHERE result_row_id = 'GB-R-1'").get();
    expect(ukRow).toEqual({ votes: 10, share: 55, share_unit: "percent_0_100" });
    expect(countWhere(ukCheck, "result_row", "country_id = ?", "peru")).toBe(5);
    ukCheck.close();

    const derive = spawnSync(
      process.execPath,
      ["--experimental-sqlite", "--no-warnings", "--import", "tsx", "scripts/atlas/derive.ts", "--country=peru"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, ATLAS_SQLITE_PATH: sqlitePath, OBSERVATORY_FIXTURES: "" },
      },
    );
    expect(derive.status, derive.stderr).toBe(0);
    expect(derive.stdout).toContain("derive:atlas:country");
    expect(derive.stdout).toContain("country_id=peru");
  });

  it("streams an Italy Prompt AT zip, honours event-office links, and checks result-audit", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-italy-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = new DatabaseSync(sqlitePath);
    seedCountry(db, {
      countryId: "italy",
      code: "IT",
      lineageId: "country-package-italy",
      releaseId: "rel-it",
      namespace: "ns-it",
      officeId: "IT-MAYOR",
      geographyId: "IT-GEO",
    });
    db.exec("BEGIN IMMEDIATE;");
    db.prepare(
      `INSERT INTO office_tier_classification (
         id_namespace, office_id, tier, review_status, rationale, lineage_id, release_id,
         classification_path, classification_kind, classification_sha256
       ) VALUES ('ns-it', 'IT-COUNCIL', 'municipal', 'needs_review', 'fixture', 'country-package-italy', 'rel-it', 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?)`,
    ).run(SHA);
    db.prepare(
      `INSERT INTO office (
         id_namespace, office_id, country_id, geography_id, name, office_type, office_status,
         record_state, next_date_resolution, lineage_id, release_id
       ) VALUES ('ns-it', 'IT-COUNCIL', 'italy', 'IT-GEO', 'Fixture council', 'council', 'current', 'active', 'unknown', 'country-package-italy', 'rel-it')`,
    ).run();
    db.exec("COMMIT;");
    db.close();

    const events =
      JSON.stringify({
        event_id: "IT-E-1",
        office_id: "IT-MAYOR",
        date: "2024-06-09",
        date_precision: "day",
        event_kind: "municipal",
      }) + "\n";
    const links = [
      JSON.stringify({
        event_id: "IT-E-1",
        office_id: "IT-COUNCIL",
        relationship: "same_joint_list_mayor_ballot",
        vote_duplication_permitted: false,
      }),
      JSON.stringify({
        event_id: "IT-E-1",
        office_id: "IT-MISSING",
        relationship: "same_joint_list_mayor_ballot",
        vote_duplication_permitted: false,
      }),
      JSON.stringify({
        event_id: "IT-E-1",
        office_id: "IT-COUNCIL",
        relationship: "same_joint_list_mayor_ballot",
        vote_duplication_permitted: true,
      }),
    ].join("\n") + "\n";
    const results =
      [
        JSON.stringify({ result_id: "IT-R-1", event_id: "IT-E-1", votes: 10, votes_status: "reported", label: "Ada" }),
        JSON.stringify({
          result_id: "IT-R-2",
          event_id: "IT-E-1",
          votes: null,
          missing_vote_components: 1,
          label: "Gap",
        }),
      ].join("\n") + "\n";
    const files: Record<string, Buffer> = {
      "data/events.jsonl": Buffer.from(events),
      "data/event-office-links.jsonl": Buffer.from(links),
      "data/results.jsonl.gz": gzipSync(Buffer.from(results)),
      "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: 2, result_kinds: { contestant: 2 } })),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 1, results: 2 })),
    };
    const zipPath = packZip(dir, "Italy_Atlas_Prompt_AT/", files);
    const loaded = await loadCountryPackResults({
      scope: "italy",
      zipPath,
      sqlitePath,
      fixture: true,
      derive: false,
    });
    expect(loaded.eventsFile).toBe("Italy_Atlas_Prompt_AT/data/events.jsonl");
    expect(loaded.resultsFile).toBe("Italy_Atlas_Prompt_AT/data/results.jsonl.gz");
    expect(loaded.eventOfficeLinks).toBe(1);
    expect(loaded.eventOfficeLinksRejected).toBe(2);
    expect(loaded.resultAuditRows).toBe(2);
    expect(loaded.resultsAccepted).toBe(2);

    const check = new DatabaseSync(sqlitePath, { readOnly: true });
    expect(countWhere(check, "result_row", "office_id = ?", "IT-MAYOR")).toBe(2);
    expect(countWhere(check, "result_row", "office_id = ?", "IT-COUNCIL")).toBe(0);
    const raw = String(check.prepare("SELECT raw_json FROM election_event WHERE event_id = 'IT-E-1'").get()?.raw_json);
    expect(raw).toContain("same_joint_list_mayor_ballot");
    expect(raw).toContain("IT-COUNCIL");
    expect(raw).not.toContain("vote_duplication_permitted\":true");
    const gap = check.prepare("SELECT votes FROM result_row WHERE result_row_id = 'IT-R-2'").get();
    expect(gap?.votes).toBeNull();
    check.close();
    expect(readdirSync(dir).some((name) => name === "events.jsonl" || name === "results.jsonl")).toBe(false);

    const badAudit = { ...files, "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: 99 })) };
    const badZip = packZip(dir, "Italy_Atlas_Prompt_AT/", badAudit);
    await expect(
      loadCountryPackResults({ scope: "italy", zipPath: badZip, sqlitePath, fixture: true, derive: false }),
    ).rejects.toThrow(/result-audit.json result_rows=99/);
    const still = new DatabaseSync(sqlitePath, { readOnly: true });
    expect(countWhere(still, "result_row", "office_id = ?", "IT-MAYOR")).toBe(2);
    still.close();
  });

  it("refuses scope all and a Peru run without a ZIP", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-cli-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const run = (env: Record<string, string>) =>
      spawnSync(process.execPath, ["--experimental-sqlite", "--no-warnings", "--import", "tsx", "scripts/atlas/import.ts"], {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, ATLAS_SQLITE_PATH: sqlitePath, ATLAS_ATTEMPTS_SQLITE_PATH: path.join(dir, "attempts.sqlite"), ...env },
      });
    const all = run({ ATLAS_IMPORT_SCOPE: "all", ATLAS_PACK_ZIP: path.join(dir, "missing.zip") });
    expect(all.status).not.toBe(0);
    expect(all.stderr).toContain("ATLAS_IMPORT_SCOPE is all");
    const bare = run({ ATLAS_IMPORT_SCOPE: "peru" });
    expect(bare.status).not.toBe(0);
    expect(bare.stderr).toContain("full research ZIP");
  });
});
