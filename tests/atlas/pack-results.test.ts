import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { deflateRawSync, gzipSync } from "node:zlib";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { readReportingUnit, reportingUnitId, votesAreIncomplete } from "../../lib/atlas/pack-results/map";
import { loadCountryPackResults } from "../../lib/atlas/pack-results/load";
import { PACK_PROFILES } from "../../lib/atlas/pack-results/profiles";

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

function jsonl(rows: unknown[]): Buffer {
  return Buffer.from(`${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
}

function pollEvent(eventId: string, officeId: string, date: string): Record<string, unknown> {
  return { event_id: eventId, office_id: officeId, date, date_precision: "day", event_kind: "ordinary" };
}

function rejectReasons(filePath: string): string[] {
  const text = readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").map((line) => String((JSON.parse(line) as { reason?: string }).reason));
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

  it("refuses a research ZIP when scope is all", () => {
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
  });

  it("keeps the pinned full-pack event and result counts", () => {
    const pins = Object.fromEntries(
      PACK_PROFILES.map((profile) => [
        profile.scope,
        { events: profile.expectedEvents, results: profile.expectedResults, eventsSha256: profile.eventsSha256, resultsSha256: profile.resultsSha256 },
      ]),
    );
    expect(pins).toEqual({
      united_kingdom: {
        events: 899,
        results: 103648,
        eventsSha256: "6eff64665b8d5565d80b6e3ebf836a5249fdf9d09c7c91469b726201a945335c",
        resultsSha256: "deefc4a25be0bfe9344f91b8b2d0b84e929cc54553e4458bb425266ba27547f4",
      },
      italy: {
        events: 515,
        results: 606051,
        eventsSha256: "b97a62ebc441cb9a4e2d28c6e9fb4676b9c92f0ca955ad7e74ee5373aab881cc",
        resultsSha256: "d2adb394c50ab95df305aa0d76643aec207160930f28a8aa940f77a93f2e7431",
      },
      germany: {
        events: 13845,
        results: 1299670,
        eventsSha256: "1555ea401c9be5de66d12fb85ec0e20f980968cd7705096d3dd7a3143a9d4a18",
        resultsSha256: "8940e617c7d92f61b86844e1ced7c9df090edca139cf943c16d7cd608e1451a8",
      },
      france: {
        events: 119554,
        results: 1193657,
        eventsSha256: "dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03",
        resultsSha256: "b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9",
      },
      peru: { events: 12460, results: 97260, eventsSha256: null, resultsSha256: null },
    });
  });

  it("reads reporting-unit ids and labels from the four pack shapes", () => {
    expect(
      readReportingUnit({
        reporting_unit_id: "GB.UNIT.2dc90295d6270961c8c1",
        office_id: "GB.COMMONS",
        scope: "https://electionresults.parliament.uk/boundary-sets/7",
        name: "Aberavon",
        kind: "westminster_constituency",
        upstream_code: "W07000049",
        nation: "Wales",
        boundary_start: "2010-04-13",
        boundary_end: "2024-05-30",
      }),
    ).toEqual({ id: "GB.UNIT.2dc90295d6270961c8c1", label: "Aberavon", eventId: null });
    expect(
      readReportingUnit({
        reporting_unit_id: "IT-U-0759511d999fbae3f17e",
        event_id: "IT-E-4c607f07f829fd326bfc",
        label: "PIEMONTE 1 | CASELLE TORINESE",
        source_id: "IT-S-fixture.csv",
        source_row: 2,
        raw: {},
      }),
    ).toEqual({
      id: "IT-U-0759511d999fbae3f17e",
      label: "PIEMONTE 1 | CASELLE TORINESE",
      eventId: "IT-E-4c607f07f829fd326bfc",
    });
    expect(
      readReportingUnit({
        unit_id: "DE-BT:1949-08-14:ordinary/U/published-001",
        event_id: "DE-BT:1949-08-14:ordinary",
        source_unit_code: "published-001",
        label: "Husum – Südtondern – Eiderstedt",
        source_id: "DE-S-btw_kerg.zip",
        parent_code: "SH",
        geography_type: "published_constituency_or_aggregate",
      }),
    ).toEqual({
      id: "DE-BT:1949-08-14:ordinary/U/published-001",
      label: "Husum – Südtondern – Eiderstedt",
      eventId: "DE-BT:1949-08-14:ordinary",
    });
    expect(
      readReportingUnit({
        unit_id: "FR-MUN-01001@2026-R1|01001",
        event_id: "FR-MUN-01001@2026-R1",
        code: "01001",
        label: "L'Abergement-Clémenciat",
        unit_type: "commune",
        source_id: "FR-S-fixture",
        registered: 679,
        voters: 374,
        valid: 345,
      }),
    ).toEqual({
      id: "FR-MUN-01001@2026-R1|01001",
      label: "L'Abergement-Clémenciat",
      eventId: "FR-MUN-01001@2026-R1",
    });
    expect(readReportingUnit({ reporting_unit_id: "U", label: "A", name: "A" })).toEqual({
      id: "U",
      label: "A",
      eventId: null,
    });
    expect(readReportingUnit({ name: "No id" })).toEqual({ reason: "missing_reporting_unit_id" });
    expect(readReportingUnit({ reporting_unit_id: "U", unit_id: "V" })).toEqual({ reason: "reporting_unit_ambiguous" });
    expect(readReportingUnit({ reporting_unit_id: "U", label: "A", name: "B" })).toEqual({
      reason: "reporting_unit_label_disagrees",
    });
    expect(readReportingUnit({ unit_id: "U", event_id: "" })).toEqual({ id: "U", label: null, eventId: null });
    expect(reportingUnitId({ reporting_unit_id: "U", unit_id: "U" })).toBe("U");
    expect(reportingUnitId({ unit_id: "DE-U" })).toBe("DE-U");
    expect(reportingUnitId({})).toBeNull();
    expect(reportingUnitId({ reporting_unit_id: "U", unit_id: "V" })).toEqual({ reason: "reporting_unit_ambiguous" });
  });

  it("links a UK office/boundary unit from result rows and does not invent an event id", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-uk-units-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = new DatabaseSync(sqlitePath);
    seedCountry(db, {
      countryId: "united-kingdom",
      code: "GB",
      lineageId: "country-package-united-kingdom",
      releaseId: "rel-gb",
      namespace: "cdd-atlas-gb-research-v1",
      officeId: "GB.COMMONS",
      geographyId: "W07000049",
    });
    db.close();

    const unitId = "GB.UNIT.2dc90295d6270961c8c1";
    const event2010 = "GB.EVENT.b74484b65b97756ac61d";
    const event2015 = "GB.EVENT.2015-aberavon";
    const files: Record<string, Buffer> = {
      "data/events.jsonl": jsonl([
        pollEvent(event2010, "GB.COMMONS", "2010-05-06"),
        pollEvent(event2015, "GB.COMMONS", "2015-05-07"),
      ]),
      "data/results.jsonl.gz": gzipSync(
        jsonl([
          {
            result_row_id: "GB.RESULT.70f42f05d733bb5368eb",
            event_id: event2010,
            office_id: "GB.COMMONS",
            reporting_unit_id: unitId,
            label: "Hywel Francis",
            party_label: "Labour",
            result_kind: "contestant",
            vote_type: "candidate_votes",
            votes: 16073,
            share: 51.9187,
            share_unit: "percent",
            elected: true,
            source_id: "GB.SOURCE.commons2010-candidates.csv",
            rank: 1,
          },
          {
            result_row_id: "GB.RESULT.2015-aberavon",
            event_id: event2015,
            office_id: "GB.COMMONS",
            reporting_unit_id: unitId,
            label: "Second contestant",
            party_label: "Labour",
            result_kind: "contestant",
            vote_type: "candidate_votes",
            votes: 4,
            share: 10,
            share_unit: "percent",
            elected: false,
          },
          {
            result_row_id: "GB.RESULT.unknown-unit",
            event_id: event2010,
            office_id: "GB.COMMONS",
            reporting_unit_id: "GB.UNIT.not-in-the-file",
            label: "Missing unit",
            votes: 1,
            votes_status: "reported",
          },
        ]),
      ),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 2, results: 3 })),
      "data/reporting-units.jsonl": jsonl([
        {
          reporting_unit_id: unitId,
          office_id: "GB.COMMONS",
          scope: "https://electionresults.parliament.uk/boundary-sets/7",
          name: "Aberavon",
          kind: "westminster_constituency",
          upstream_code: "W07000049",
          nation: "Wales",
          boundary_start: "2010-04-13",
          boundary_end: "2024-05-30",
        },
        {
          reporting_unit_id: "GB.UNIT.orphan",
          office_id: "GB.COMMONS",
          name: "Unreferenced ward",
          kind: "local_ward",
        },
      ]),
    };
    const zipPath = packZip(dir, "United_Kingdom_Atlas_Prompt_AU/", files);
    const loaded = await loadCountryPackResults({
      scope: "united_kingdom",
      zipPath,
      sqlitePath,
      fixture: true,
      derive: false,
    });
    expect(loaded.eventsAccepted).toBe(2);
    expect(loaded.resultsAccepted).toBe(2);
    expect(loaded.resultsRejected).toBe(1);
    expect(rejectReasons(loaded.rejectsFile)).toEqual(["reporting_unit_unknown"]);

    const check = new DatabaseSync(sqlitePath, { readOnly: true });
    const eventIds = check
      .prepare("SELECT event_id FROM election_event ORDER BY event_id")
      .all()
      .map((row) => String(row.event_id));
    expect(eventIds).toEqual([event2010, event2015].sort());
    expect(eventIds).not.toContain(unitId);
    expect(eventIds).not.toContain("GB.UNIT.orphan");
    const row = check
      .prepare(
        `SELECT candidate_or_list_label, original_party_label, votes, elected_flag, raw_json
         FROM result_row WHERE result_row_id = 'GB.RESULT.70f42f05d733bb5368eb'`,
      )
      .get() as { candidate_or_list_label: string; original_party_label: string; votes: number; elected_flag: number; raw_json: string };
    expect(row.candidate_or_list_label).toBe("Hywel Francis");
    expect(row.original_party_label).toBe("Labour");
    expect(row.votes).toBe(16073);
    expect(row.elected_flag).toBe(1);
    const raw = JSON.parse(row.raw_json) as { row: Record<string, unknown> };
    expect(raw.row.event_id).toBe(event2010);
    expect(raw.row.reporting_unit_id).toBe(unitId);
    expect(raw.row.name).toBeUndefined();
    expect(countWhere(check, "result_row", "country_id = ?", "united-kingdom")).toBe(2);
    check.close();
  });

  it("accepts Italy reporting_unit_id, Germany unit_id, and France unit_id on results", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-eu-units-"));
    tempDirs.push(dir);

    const italyPath = path.join(dir, "italy.sqlite");
    migrateMasterDatabase(repoRoot, italyPath);
    const italyDb = new DatabaseSync(italyPath);
    seedCountry(italyDb, {
      countryId: "italy",
      code: "IT",
      lineageId: "country-package-italy",
      releaseId: "rel-it",
      namespace: "cdd-atlas-it-research-v1",
      officeId: "IT-MAYOR",
      geographyId: "IT-GEO",
    });
    italyDb.close();
    const italyEvent = "IT-E-4c607f07f829fd326bfc";
    const italyUnit = "IT-U-0759511d999fbae3f17e";
    const italyOther = "IT-E-other";
    const italyFiles: Record<string, Buffer> = {
      "data/events.jsonl": jsonl([
        pollEvent(italyEvent, "IT-MAYOR", "2024-06-09"),
        pollEvent(italyOther, "IT-MAYOR", "2024-06-23"),
      ]),
      "data/event-office-links.jsonl": Buffer.from(""),
      "data/results.jsonl.gz": gzipSync(
        jsonl([
          {
            result_id: "IT-R-1",
            event_id: italyEvent,
            reporting_unit_id: italyUnit,
            label: "Ada",
            votes: 10,
            result_kind: "contestant",
          },
          {
            result_id: "IT-R-2",
            event_id: italyOther,
            reporting_unit_id: italyUnit,
            label: "Wrong event",
            votes: 1,
          },
          {
            result_id: "IT-R-3",
            event_id: italyEvent,
            unit_id: italyUnit,
            label: "Alias",
            votes: 2,
          },
        ]),
      ),
      "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: 3 })),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 2, results: 3 })),
      "data/reporting-units.jsonl": jsonl([
        {
          reporting_unit_id: italyUnit,
          event_id: italyEvent,
          label: "PIEMONTE 1 | CASELLE TORINESE",
          source_id: "IT-S-fixture.csv",
          source_row: 2,
          raw: {},
        },
      ]),
    };
    const italyZip = packZip(dir, "Italy_Atlas_Prompt_AT/", italyFiles);
    const italy = await loadCountryPackResults({
      scope: "italy",
      zipPath: italyZip,
      sqlitePath: italyPath,
      fixture: true,
      derive: false,
    });
    expect(italy.eventsAccepted).toBe(2);
    expect(italy.resultsAccepted).toBe(2);
    expect(italy.resultsRejected).toBe(1);
    expect(italy.resultAuditRows).toBe(3);
    expect(rejectReasons(italy.rejectsFile)).toEqual(["reporting_unit_event_mismatch"]);
    const italyCheck = new DatabaseSync(italyPath, { readOnly: true });
    const italyLabels = italyCheck
      .prepare("SELECT result_row_id, candidate_or_list_label FROM result_row ORDER BY result_row_id")
      .all();
    expect(italyLabels).toEqual([
      { result_row_id: "IT-R-1", candidate_or_list_label: "Ada" },
      { result_row_id: "IT-R-3", candidate_or_list_label: "Alias" },
    ]);
    italyCheck.close();

    const germanyPath = path.join(dir, "germany.sqlite");
    migrateMasterDatabase(repoRoot, germanyPath);
    const germanyDb = new DatabaseSync(germanyPath);
    seedCountry(germanyDb, {
      countryId: "germany",
      code: "DE",
      lineageId: "country-package-germany",
      releaseId: "rel-de",
      namespace: "cdd-atlas-de-research-v1",
      officeId: "DE-BT",
      geographyId: "DE-GEO",
    });
    germanyDb.close();
    const germanyEvent = "DE-BT:1949-08-14:ordinary";
    const germanyUnit = "DE-BT:1949-08-14:ordinary/U/published-001";
    const germanyOther = "DE-BT:1953-09-06:ordinary";
    const germanyFiles: Record<string, Buffer> = {
      "data/events.jsonl": jsonl([
        pollEvent(germanyEvent, "DE-BT", "1949-08-14"),
        pollEvent(germanyOther, "DE-BT", "1953-09-06"),
      ]),
      "data/results.jsonl": jsonl([
        {
          result_id: "DE-R-1",
          event_id: germanyEvent,
          unit_id: germanyUnit,
          label: "SPD",
          result_kind: "contestant",
          votes: 120,
          percent_raw: 40,
          share_unit: "percent",
        },
        {
          result_id: "DE-R-2",
          event_id: germanyEvent,
          reporting_unit_id: germanyUnit,
          label: "Alias",
          votes: 3,
        },
        {
          result_id: "DE-R-3",
          event_id: germanyOther,
          unit_id: germanyUnit,
          label: "Wrong event",
          votes: 1,
        },
      ]),
      "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: 3 })),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 2, results: 3 })),
      "data/reporting-units.jsonl": jsonl([
        {
          unit_id: germanyUnit,
          event_id: germanyEvent,
          source_unit_code: "published-001",
          label: "Husum – Südtondern – Eiderstedt",
          source_id: "DE-S-btw_kerg.zip",
          parent_code: "SH",
          geography_type: "published_constituency_or_aggregate",
        },
      ]),
    };
    const germanyZip = packZip(dir, "Germany_Atlas_Prompt_AS/", germanyFiles);
    const germany = await loadCountryPackResults({
      scope: "germany",
      zipPath: germanyZip,
      sqlitePath: germanyPath,
      fixture: true,
      derive: false,
    });
    expect(germany.resultsAccepted).toBe(2);
    expect(germany.resultsRejected).toBe(1);
    expect(germany.resultAuditRows).toBe(3);
    expect(rejectReasons(germany.rejectsFile)).toEqual(["reporting_unit_event_mismatch"]);
    const germanyCheck = new DatabaseSync(germanyPath, { readOnly: true });
    const spd = germanyCheck
      .prepare("SELECT candidate_or_list_label, share, share_unit FROM result_row WHERE result_row_id = 'DE-R-1'")
      .get();
    expect(spd).toEqual({ candidate_or_list_label: "SPD", share: 40, share_unit: "percent_0_100" });
    expect(countWhere(germanyCheck, "result_row", "result_row_id = ?", "DE-R-2")).toBe(1);
    germanyCheck.close();

    const francePath = path.join(dir, "france.sqlite");
    migrateMasterDatabase(repoRoot, francePath);
    const franceDb = new DatabaseSync(francePath);
    seedCountry(franceDb, {
      countryId: "france",
      code: "FR",
      lineageId: "country-package-france",
      releaseId: "rel-fr",
      namespace: "cdd-atlas-fr-research-v1",
      officeId: "FR-MUN-01001",
      geographyId: "FR-GEO",
    });
    franceDb.close();
    const franceEvent = "FR-MUN-01001@2026-R1";
    const franceUnit = "FR-MUN-01001@2026-R1|01001";
    const franceOther = "FR-MUN-01001@2026-R2";
    const franceFiles: Record<string, Buffer> = {
      "data/events.jsonl": jsonl([
        pollEvent(franceEvent, "FR-MUN-01001", "2026-03-15"),
        pollEvent(franceOther, "FR-MUN-01001", "2026-03-22"),
      ]),
      "data/results.jsonl": jsonl([
        {
          result_id: "FR-R-1",
          event_id: franceEvent,
          unit_id: franceUnit,
          contestant_label: "Martin",
          votes: 120,
          votes_status: "reported",
          result_kind: "contestant",
        },
        {
          result_id: "FR-R-2",
          event_id: franceEvent,
          reporting_unit_id: franceUnit,
          contestant_label: "Alias",
          votes: 8,
          votes_status: "reported",
        },
        {
          result_id: "FR-R-3",
          event_id: franceEvent,
          unit_id: "FR-MUN-missing",
          contestant_label: "Missing unit",
          votes: 1,
          votes_status: "reported",
        },
      ]),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 2, results: 3 })),
      "data/reporting-units.jsonl": jsonl([
        {
          unit_id: franceUnit,
          event_id: franceEvent,
          code: "01001",
          label: "L'Abergement-Clémenciat",
          unit_type: "commune",
          source_id: "FR-S-fixture",
          registered: 679,
          voters: 374,
          valid: 345,
        },
      ]),
    };
    const franceZip = packZip(dir, "France_Atlas_Prompt_AR/", franceFiles);
    const france = await loadCountryPackResults({
      scope: "france",
      zipPath: franceZip,
      sqlitePath: francePath,
      fixture: true,
      derive: false,
    });
    expect(france.resultsAccepted).toBe(2);
    expect(france.resultsRejected).toBe(1);
    expect(france.resultAuditRows).toBeNull();
    expect(rejectReasons(france.rejectsFile)).toEqual(["reporting_unit_unknown"]);
    const franceCheck = new DatabaseSync(francePath, { readOnly: true });
    const martin = franceCheck
      .prepare("SELECT candidate_or_list_label FROM result_row WHERE result_row_id = 'FR-R-1'")
      .get();
    expect(martin).toEqual({ candidate_or_list_label: "Martin" });
    expect(countWhere(franceCheck, "election_event", "lineage_id = ?", "country-package-france")).toBe(2);
    franceCheck.close();
  });

  it("still rejects one reporting unit attached to two events in the unit file", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-unit-conflict-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const base = {
      "data/events.jsonl": Buffer.from(""),
      "data/results.jsonl.gz": gzipSync(Buffer.from("")),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 0, results: 0 })),
    };
    const twoEvents = packZip(dir, "United_Kingdom_Atlas_Prompt_AU/", {
      ...base,
      "data/reporting-units.jsonl": jsonl([
        { reporting_unit_id: "U1", event_id: "E1", label: "One" },
        { reporting_unit_id: "U1", event_id: "E2", label: "Two" },
      ]),
    });
    await expect(
      loadCountryPackResults({ scope: "united_kingdom", zipPath: twoEvents, sqlitePath, fixture: true, derive: false }),
    ).rejects.toThrow(/reporting unit U1 is attached to two events/);

    const bothScopes = packZip(dir, "United_Kingdom_Atlas_Prompt_AU/", {
      ...base,
      "data/reporting-units.jsonl": jsonl([
        { unit_id: "U1", name: "Boundary" },
        { unit_id: "U1", event_id: "E1", label: "Boundary" },
      ]),
    });
    await expect(
      loadCountryPackResults({
        scope: "united_kingdom",
        zipPath: bothScopes,
        sqlitePath,
        fixture: true,
        derive: false,
      }),
    ).rejects.toThrow(/both event-scoped and office\/boundary-scoped/);
  });

  it("accepts the real UK, Italy, Germany, and France result vocabularies", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-pack-vocab-"));
    tempDirs.push(dir);

    const ukKinds = [
      "contestant",
      "party_list",
      "party_aggregate",
      "party_share_and_constitutive_seats",
      "party_summary",
      "published_positive_seat_allocation",
      "published_seat_allocation",
      "unopposed_return",
      "count_stage_result",
    ];
    const ukVoteTypes = [
      "candidate_marks_not_voters",
      "candidate_votes",
      "regional_list_votes",
      "first_preferences",
      "constituency_candidate_votes",
      "national_party_vote_share",
      "seat_allocation",
      "first_preference_share_and_published_seats",
      "published_seat_allocation",
      "no_poll_unopposed",
      "london_wide_list_votes",
      "SV_first_preference",
    ];
    const ukAccepted = [
      ...ukKinds.map((kind, index) => ({
        result_row_id: `GB-K-${index}`,
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: kind,
        result_kind: kind,
        vote_type: ukVoteTypes[index],
        votes: 10,
        votes_status: "explicit_source_value",
        share: 12.5,
        share_status: "explicit_source_value",
        share_unit: "percent",
        seats: 1,
        seats_status: "explicit_source_value",
        elected: true,
      })),
      ...ukVoteTypes.slice(ukKinds.length).map((voteType, index) => ({
        result_row_id: `GB-V-${index}`,
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: voteType,
        result_kind: "contestant",
        vote_type: voteType,
        votes: 4,
        votes_status: "explicit_source_value",
        share: 51.9187,
        share_status: "explicit_source_value",
        share_unit: "percent",
        seats: null,
        seats_status: "missing",
      })),
      {
        result_row_id: "GB-ZERO",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Zero",
        result_kind: "contestant",
        vote_type: "candidate_votes",
        votes: 0,
        votes_status: "explicit_source_value",
        share: 0,
        share_status: "explicit_source_value",
        share_unit: "percent",
        seats: 0,
        seats_status: "explicit_source_value",
      },
      {
        result_row_id: "GB-MISSING",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Absent",
        result_kind: "party_summary",
        vote_type: "national_party_vote_share",
        votes: null,
        votes_status: "missing",
        share: null,
        share_status: "missing",
        seats: null,
        seats_status: "missing",
      },
      {
        result_row_id: "GB-UNLISTED",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Kept",
        result_kind: "unlisted_kind",
        vote_type: "unlisted_vote",
        votes: 6,
        votes_status: "explicit_source_value",
        seats: null,
        seats_status: "missing",
      },
    ];
    const ukRejected = [
      {
        result_row_id: "GB-BAD-VOTES",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Bad votes",
        result_kind: "contestant",
        vote_type: "candidate_votes",
        votes: 4,
        votes_status: "missing",
      },
      {
        result_row_id: "GB-BAD-SEATS",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Bad seats",
        result_kind: "contestant",
        vote_type: "seat_allocation",
        votes: 1,
        votes_status: "explicit_source_value",
        seats: 2,
        seats_status: "missing",
      },
      {
        result_row_id: "GB-BAD-SHARE",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Bad share",
        result_kind: "party_share_and_constitutive_seats",
        vote_type: "national_party_vote_share",
        votes: 1,
        votes_status: "explicit_source_value",
        share: 2,
        share_status: "missing",
        share_unit: "percent",
      },
      {
        result_row_id: "GB-BAD-EXPLICIT",
        event_id: "GB-E-1",
        office_id: "GB.COMMONS",
        label: "Explicit null",
        result_kind: "contestant",
        vote_type: "candidate_votes",
        votes: null,
        votes_status: "explicit_source_value",
      },
    ];
    const ukPath = path.join(dir, "uk.sqlite");
    migrateMasterDatabase(repoRoot, ukPath);
    const ukDb = new DatabaseSync(ukPath);
    seedCountry(ukDb, {
      countryId: "united-kingdom",
      code: "GB",
      lineageId: "country-package-united-kingdom",
      releaseId: "rel-gb",
      namespace: "cdd-atlas-gb-research-v1",
      officeId: "GB.COMMONS",
      geographyId: "GB-GEO",
    });
    ukDb.close();
    const ukResults = [...ukAccepted, ...ukRejected];
    const ukZip = packZip(dir, "United_Kingdom_Atlas_Prompt_AU/", {
      "data/events.jsonl": jsonl([pollEvent("GB-E-1", "GB.COMMONS", "2010-05-06")]),
      "data/results.jsonl.gz": gzipSync(jsonl(ukResults)),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 1, results: ukResults.length })),
    });
    const uk = await loadCountryPackResults({
      scope: "united_kingdom",
      zipPath: ukZip,
      sqlitePath: ukPath,
      fixture: true,
      derive: false,
    });
    expect(uk.resultsAccepted).toBe(ukAccepted.length);
    expect(uk.resultsRejected).toBe(ukRejected.length);
    expect(rejectReasons(uk.rejectsFile).sort()).toEqual(
      [
        "votes_status_missing_has_value",
        "seats_status_missing_has_value",
        "share_status_missing_has_value",
        "votes_status_explicit_source_value_is_null",
      ].sort(),
    );
    const ukCheck = new DatabaseSync(ukPath, { readOnly: true });
    const sourced = ukCheck
      .prepare(
        `SELECT votes, votes_status, share, share_status, seats, seats_status, candidate_or_list_label
         FROM result_row WHERE result_row_id = 'GB-K-0'`,
      )
      .get();
    expect(sourced).toEqual({
      votes: 10,
      votes_status: "recorded",
      share: 12.5,
      share_status: "recorded",
      seats: 1,
      seats_status: "recorded",
      candidate_or_list_label: "contestant",
    });
    const zero = ukCheck
      .prepare("SELECT votes, votes_status, share, share_status, seats, seats_status FROM result_row WHERE result_row_id = 'GB-ZERO'")
      .get();
    expect(zero).toEqual({
      votes: 0,
      votes_status: "zero",
      share: 0,
      share_status: "zero",
      seats: 0,
      seats_status: "zero",
    });
    const missing = ukCheck
      .prepare("SELECT votes, votes_status, share_status, seats_status, candidate_or_list_label FROM result_row WHERE result_row_id = 'GB-MISSING'")
      .get();
    expect(missing).toEqual({
      votes: null,
      votes_status: "unknown",
      share_status: "unknown",
      seats_status: "unknown",
      candidate_or_list_label: "Absent",
    });
    const storedKinds = new Set(
      ukCheck
        .prepare("SELECT raw_json FROM result_row")
        .all()
        .map((row) => String((JSON.parse(String(row.raw_json)) as { row: { result_kind: string } }).row.result_kind)),
    );
    for (const kind of [...ukKinds, "unlisted_kind"]) expect(storedKinds.has(kind)).toBe(true);
    const storedVotes = new Set(
      ukCheck
        .prepare("SELECT raw_json FROM result_row")
        .all()
        .map((row) => String((JSON.parse(String(row.raw_json)) as { row: { vote_type: string } }).row.vote_type)),
    );
    for (const voteType of [...ukVoteTypes, "unlisted_vote"]) expect(storedVotes.has(voteType)).toBe(true);
    ukCheck.close();

    const italyPath = path.join(dir, "italy.sqlite");
    migrateMasterDatabase(repoRoot, italyPath);
    const italyDb = new DatabaseSync(italyPath);
    seedCountry(italyDb, {
      countryId: "italy",
      code: "IT",
      lineageId: "country-package-italy",
      releaseId: "rel-it",
      namespace: "cdd-atlas-it-research-v1",
      officeId: "IT-MAYOR",
      geographyId: "IT-GEO",
    });
    italyDb.close();
    const italyResults = [
      {
        result_id: "IT-R-contestant",
        event_id: "IT-E-1",
        label: "Ada",
        result_kind: "contestant",
        vote_type: "published_list_votes",
        votes: 11,
        published_percent: 22.5,
      },
      {
        result_id: "IT-R-zero",
        event_id: "IT-E-1",
        label: "Zero",
        result_kind: "contestant",
        vote_type: "published_uninominal_candidate_votes",
        votes: 0,
        seats: 0,
      },
      {
        result_id: "IT-R-metric",
        event_id: "IT-E-1",
        label: "Papers",
        result_kind: "metric",
        vote_type: "reported_turnout_or_papers",
        votes: null,
        seats: null,
      },
      {
        result_id: "IT-R-unknown",
        event_id: "IT-E-1",
        label: "Kept",
        result_kind: "unlisted_kind",
        vote_type: "unlisted_vote",
        votes: 3,
      },
    ];
    const italyZip = packZip(dir, "Italy_Atlas_Prompt_AT/", {
      "data/events.jsonl": jsonl([pollEvent("IT-E-1", "IT-MAYOR", "2024-06-09")]),
      "data/event-office-links.jsonl": Buffer.from(""),
      "data/results.jsonl.gz": gzipSync(jsonl(italyResults)),
      "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: italyResults.length })),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 1, results: italyResults.length })),
    });
    const italy = await loadCountryPackResults({
      scope: "italy",
      zipPath: italyZip,
      sqlitePath: italyPath,
      fixture: true,
      derive: false,
    });
    expect(italy.resultsAccepted).toBe(italyResults.length);
    expect(italy.resultsRejected).toBe(0);
    const italyCheck = new DatabaseSync(italyPath, { readOnly: true });
    expect(
      italyCheck
        .prepare("SELECT votes, votes_status, share, share_status, share_unit FROM result_row WHERE result_row_id = 'IT-R-contestant'")
        .get(),
    ).toEqual({ votes: 11, votes_status: "recorded", share: 22.5, share_status: "recorded", share_unit: "percent_0_100" });
    expect(
      italyCheck.prepare("SELECT votes, votes_status, seats, seats_status FROM result_row WHERE result_row_id = 'IT-R-zero'").get(),
    ).toEqual({ votes: 0, votes_status: "zero", seats: 0, seats_status: "zero" });
    const metric = italyCheck
      .prepare("SELECT candidate_or_list_label, votes, votes_status, raw_json FROM result_row WHERE result_row_id = 'IT-R-metric'")
      .get() as { candidate_or_list_label: string | null; votes: number | null; votes_status: string; raw_json: string };
    expect(metric.candidate_or_list_label).toBeNull();
    expect(metric.votes).toBeNull();
    expect(metric.votes_status).toBe("unknown");
    expect((JSON.parse(metric.raw_json) as { row: { label: string; result_kind: string } }).row).toMatchObject({
      label: "Papers",
      result_kind: "metric",
      vote_type: "reported_turnout_or_papers",
    });
    italyCheck.close();

    const germanyVoteTypes = ["first_vote", "second_vote", "list_vote", "electorate_metric", "single_vote"];
    const germanyResults = germanyVoteTypes.map((voteType, index) => ({
      result_id: `DE-R-${index}`,
      event_id: "DE-E-1",
      label: voteType,
      result_kind: index === 0 ? "metric" : "contestant",
      vote_type: voteType,
      votes: index === 0 ? null : 8,
      ...(index === 1 ? { percent_raw: 15 } : {}),
    }));
    germanyResults.push({
      result_id: "DE-R-unknown",
      event_id: "DE-E-1",
      label: "Kept",
      result_kind: "unlisted_kind",
      vote_type: "unlisted_vote",
      votes: 2,
    });
    const germanyPath = path.join(dir, "germany.sqlite");
    migrateMasterDatabase(repoRoot, germanyPath);
    const germanyDb = new DatabaseSync(germanyPath);
    seedCountry(germanyDb, {
      countryId: "germany",
      code: "DE",
      lineageId: "country-package-germany",
      releaseId: "rel-de",
      namespace: "cdd-atlas-de-research-v1",
      officeId: "DE-BT",
      geographyId: "DE-GEO",
    });
    germanyDb.close();
    const germanyZip = packZip(dir, "Germany_Atlas_Prompt_AS/", {
      "data/events.jsonl": jsonl([pollEvent("DE-E-1", "DE-BT", "1949-08-14")]),
      "data/results.jsonl": jsonl(germanyResults),
      "data/result-audit.json": Buffer.from(JSON.stringify({ result_rows: germanyResults.length })),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 1, results: germanyResults.length })),
    });
    const germany = await loadCountryPackResults({
      scope: "germany",
      zipPath: germanyZip,
      sqlitePath: germanyPath,
      fixture: true,
      derive: false,
    });
    expect(germany.resultsAccepted).toBe(germanyResults.length);
    expect(germany.resultsRejected).toBe(0);
    const germanyCheck = new DatabaseSync(germanyPath, { readOnly: true });
    expect(
      germanyCheck
        .prepare("SELECT votes, votes_status, share, share_unit, candidate_or_list_label FROM result_row WHERE result_row_id = 'DE-R-1'")
        .get(),
    ).toEqual({
      votes: 8,
      votes_status: "recorded",
      share: 15,
      share_unit: "percent_0_100",
      candidate_or_list_label: "second_vote",
    });
    const deKinds = new Set(
      germanyCheck
        .prepare("SELECT raw_json FROM result_row")
        .all()
        .map((row) => String((JSON.parse(String(row.raw_json)) as { row: { result_kind: string } }).row.result_kind)),
    );
    expect([...deKinds].sort()).toEqual(["contestant", "metric", "unlisted_kind"]);
    germanyCheck.close();

    const franceResults = [
      {
        result_id: "FR-R-1",
        event_id: "FR-E-1",
        result_kind: "candidate_mark_multi_vote",
        contestant_label: "Martin",
        votes: 15,
        votes_status: "reported",
        seats: 2,
      },
      {
        result_id: "FR-R-2",
        event_id: "FR-E-1",
        result_kind: "list_ballot",
        contestant_label: "Liste",
        votes: 0,
        votes_status: "reported",
        vote_percentage_source: 40,
      },
      {
        result_id: "FR-R-3",
        event_id: "FR-E-1",
        result_kind: "list_ballot",
        contestant_label: "Absent",
        votes: null,
        votes_status: "not_supplied",
      },
      {
        result_id: "FR-R-4",
        event_id: "FR-E-1",
        result_kind: "unlisted_kind",
        contestant_label: "Kept",
        votes: 6,
        votes_status: "reported",
      },
    ];
    const francePath = path.join(dir, "france.sqlite");
    migrateMasterDatabase(repoRoot, francePath);
    const franceDb = new DatabaseSync(francePath);
    seedCountry(franceDb, {
      countryId: "france",
      code: "FR",
      lineageId: "country-package-france",
      releaseId: "rel-fr",
      namespace: "cdd-atlas-fr-research-v1",
      officeId: "FR-MUN-01001",
      geographyId: "FR-GEO",
    });
    franceDb.close();
    const franceZip = packZip(dir, "France_Atlas_Prompt_AR/", {
      "data/events.jsonl": jsonl([pollEvent("FR-E-1", "FR-MUN-01001", "2026-03-15")]),
      "data/results.jsonl": jsonl(franceResults),
      "data/counts.json": Buffer.from(JSON.stringify({ events: 1, results: franceResults.length })),
    });
    const france = await loadCountryPackResults({
      scope: "france",
      zipPath: franceZip,
      sqlitePath: francePath,
      fixture: true,
      derive: false,
    });
    expect(france.resultsAccepted).toBe(franceResults.length);
    expect(france.resultsRejected).toBe(0);
    const franceCheck = new DatabaseSync(francePath, { readOnly: true });
    expect(
      franceCheck
        .prepare("SELECT votes, votes_status, seats, seats_status, candidate_or_list_label FROM result_row WHERE result_row_id = 'FR-R-1'")
        .get(),
    ).toEqual({ votes: 15, votes_status: "recorded", seats: 2, seats_status: "recorded", candidate_or_list_label: "Martin" });
    expect(
      franceCheck.prepare("SELECT votes, votes_status, share, share_unit FROM result_row WHERE result_row_id = 'FR-R-2'").get(),
    ).toEqual({ votes: 0, votes_status: "zero", share: 40, share_unit: "percent_0_100" });
    expect(franceCheck.prepare("SELECT votes, votes_status FROM result_row WHERE result_row_id = 'FR-R-3'").get()).toEqual({
      votes: null,
      votes_status: "unknown",
    });
    franceCheck.close();
  });
});
