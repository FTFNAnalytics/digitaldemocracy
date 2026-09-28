import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { unzipSync, strFromU8 } from "fflate";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import AtlasDownloadsPage, { metadata as downloadsMetadata } from "../../app/atlas/downloads/page";
import { metadata as observatoryDownloads } from "../../app/electiondatabase/downloads/page";
import { GET as cyclesGET } from "../../app/api/atlas/cycles/[[...path]]/route";
import { GET as jurisdictionsGET } from "../../app/api/atlas/jurisdictions/[[...path]]/route";
import { GET as peopleGET } from "../../app/api/atlas/people/[[...path]]/route";
import { GET as seatsGET } from "../../app/api/atlas/seats/[[...path]]/route";
import {
  BUNDLE_CONTEST_HEADER,
  BUNDLE_CYCLE_HEADER,
  BUNDLE_JURISDICTION_HEADER,
  BUNDLE_SEAT_HEADER,
  BUNDLE_UNPLACED_HEADER,
  CYCLE_PAGE_CSV_HEADER,
  JURISDICTION_PAGE_CSV_HEADER,
  PERSON_CSV_HEADER,
  SEAT_PAGE_CSV_HEADER,
} from "../../lib/atlas/api/columns";
import { API_PAGE_SIZE, decodeCursor, encodeCursor } from "../../lib/atlas/api/cursor";
import { importAlbania } from "../../lib/atlas/albania/import";
import { loadCyclePage } from "../../lib/atlas/cycle/read";
import { rebuildDerivedInFile } from "../../lib/atlas/derive/run";
import { WITHHELD_EVIDENCE } from "../../lib/atlas/derive/seat";
import { shouldWriteDownloadBundles } from "../../lib/atlas/downloads";
import { loadJurisdictionView } from "../../lib/atlas/jurisdiction";
import { readSeatPage } from "../../lib/atlas/seat/read";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { atlasRoutes } from "../../lib/atlas/routes";
import { STATIC_SITEMAP_PATHS } from "../../lib/seo";

const repoRoot = path.join(import.meta.dirname, "../..");
const SENTINEL = "OV10-WITHHELD-SENTINEL";

function call(
  handler: (request: Request, context: { params: Promise<{ path?: string[] }> }) => Promise<Response>,
  url: string,
  segments?: string[],
) {
  return handler(new Request(url), { params: Promise.resolve({ path: segments }) });
}

describe("atlas api contracts", () => {
  it("snapshots CSV headers", () => {
    expect(JURISDICTION_PAGE_CSV_HEADER.join(",")).toMatchInlineSnapshot(
      `"row_kind,name,level,slug_path,jurisdiction_key,office_id,id_namespace,held_by,since,last_share,last_share_unit,cycle_key,iso_date,contest_count,label,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
    expect(SEAT_PAGE_CSV_HEADER.join(",")).toMatchInlineSnapshot(
      `"cycle,winner,party,votes,share,margin,turnout,source_ids,snapshot_label,evidence_status,event_id,history_key,office_id,id_namespace,result_row_id,record_id,release_id"`,
    );
    expect(CYCLE_PAGE_CSV_HEADER.join(",")).toMatchInlineSnapshot(
      `"contest,candidate_or_list,party,votes,votes_status,share,share_status,share_unit,seats,seats_status,elected,source_ids,snapshot_label,evidence_status,event_id,history_key,office_id,id_namespace,result_row_id,record_id,release_id"`,
    );
    expect(PERSON_CSV_HEADER.join(",")).toMatchInlineSnapshot(
      `"person_id,slug,canonical_label,country_id,review_status,alias_labels,year,election,seat,result,votes,share,margin,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
    expect(BUNDLE_JURISDICTION_HEADER.join(",")).toMatchInlineSnapshot(
      `"jurisdiction_key,country_id,geography_id,parent_key,depth,level_label,name,slug,slug_path,office_count,event_count,first_event_year,last_event_year,coverage_status,ambiguous,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
    expect(BUNDLE_SEAT_HEADER.join(",")).toMatchInlineSnapshot(
      `"id_namespace,office_id,country_id,office_name,current_holder_label,current_holder_party_label,current_since_date_id,last_selected_event_id,last_share,last_share_unit,last_margin,next_date_id,status_reason,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
    expect(BUNDLE_CYCLE_HEADER.join(",")).toMatchInlineSnapshot(
      `"cycle_key,country_id,date_id,iso_date,contest_count,scope_key,tiers,kinds,label,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
    expect(BUNDLE_CONTEST_HEADER.join(",")).toMatchInlineSnapshot(
      `"country_id,id_namespace,office_id,office_name,event_id,history_key,iso_date,candidate_or_list,party,votes,votes_status,share,share_status,share_unit,seats,seats_status,elected_flag,source_ids,snapshot_label,evidence_status,result_row_id,record_id,release_id"`,
    );
    expect(BUNDLE_UNPLACED_HEADER.join(",")).toMatchInlineSnapshot(
      `"id_namespace,office_id,history_key,country_id,year,date_id,date_precision,date_resolution,source_ids,snapshot_label,evidence_status,record_id,release_id"`,
    );
  });

  it("keeps API routes out of the sitemap and the download page in it", async () => {
    const rules = robots().rules;
    const disallow = Array.isArray(rules) ? rules.flatMap((rule) => rule.disallow ?? []) : (rules.disallow ?? []);
    const blocked = Array.isArray(disallow) ? disallow : [disallow];
    expect(blocked).toContain("/api/");
    expect(blocked).not.toContain("/atlas/downloads");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase/downloads");
    const entries = await sitemap({ id: Promise.resolve("0") });
    expect(entries.some((entry) => entry.url === "https://center4digitaldemocracy.com/atlas/downloads")).toBe(true);
    expect(entries.some((entry) => entry.url.includes("/api/"))).toBe(false);
    expect(downloadsMetadata.robots).toBeUndefined();
    expect(downloadsMetadata.alternates?.canonical).toBe(atlasRoutes.downloads);
    expect(observatoryDownloads.alternates?.canonical).toBe("/electiondatabase/downloads");
  });

  it("recommends an nginx limit for /api/ and writes bundles outside vitest", () => {
    const deploy = readFileSync(path.join(repoRoot, "docs/deploy.md"), "utf8");
    expect(deploy).toContain("limit_req_zone $binary_remote_addr zone=atlas_api:10m rate=10r/s;");
    expect(deploy).toContain("location /api/");
    expect(shouldWriteDownloadBundles({ VITEST: "1" })).toBe(false);
    expect(shouldWriteDownloadBundles({ VITEST: "1", ATLAS_DOWNLOADS_DIR: "/tmp/atlas-downloads" })).toBe(true);
    expect(shouldWriteDownloadBundles({})).toBe(true);
    expect(decodeCursor(encodeCursor("albania/tirane"))).toBe("albania/tirane");
    expect(decodeCursor("not a cursor")).toBeNull();
  });
});

describe("Albania atlas twins", () => {
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  const previousDownloads = process.env.ATLAS_DOWNLOADS_DIR;
  let dir = "";
  let sqlitePath = "";
  let downloadsDir = "";
  let withheldOfficeId = "";
  let withheldNamespace = "";
  let keptLabel = "";

  beforeAll(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    delete process.env.ATLAS_DOWNLOADS_DIR;
    dir = mkdtempSync(path.join(os.tmpdir(), "atlas-api-"));
    sqlitePath = path.join(dir, "atlas.sqlite");
    downloadsDir = path.join(dir, "downloads");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
      operator: "api-test",
    });
    keptLabel = "Kept Candidate";
    const db = openAtlasDatabase(sqlitePath);
    try {
      const office = db
        .prepare(
          `SELECT id_namespace, office_id, country_id, lineage_id, release_id
           FROM office WHERE country_id = 'albania' ORDER BY office_id LIMIT 1`,
        )
        .get() as {
        id_namespace: string;
        office_id: string;
        country_id: string;
        lineage_id: string;
        release_id: string;
      };
      withheldOfficeId = office.office_id;
      withheldNamespace = office.id_namespace;
      db.exec("BEGIN IMMEDIATE;");
      db.prepare(
        `INSERT INTO research_date (
           date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
         ) VALUES ('ov10-date', '2015-06-21', 'day', 'called', 2015, 6, 21, NULL, NULL, ?, ?, '{}')`,
      ).run(office.lineage_id, office.release_id);
      db.prepare(
        `INSERT INTO election_event (
           id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind, selected_history_role,
           electoral_system, comparability, ballot_basis, share_unit, legal_outcome, record_state, state_note,
           lineage_id, release_id, raw_json
         ) VALUES (?, ?, 'ov10-h', 'ov10-event', 'ov10-date', 'resolved', 'ordinary', 'selected', NULL, NULL, 'valid_votes', 'percent_0_100', 'certified', 'active', NULL, ?, ?, '{}')`,
      ).run(office.id_namespace, office.office_id, office.lineage_id, office.release_id);
      db.prepare(
        `INSERT INTO proceeding (
           id_namespace, office_id, history_key, proceeding_id, kind, sequence_no, supersedes_id, legal_outcome,
           lineage_id, release_id, raw_json
         ) VALUES (?, ?, 'ov10-h', 'ov10-p', 'first_round', 1, NULL, 'certified', ?, ?, '{}')`,
      ).run(office.id_namespace, office.office_id, office.lineage_id, office.release_id);
      const insertResult = db.prepare(
        `INSERT INTO result_row (
           id_namespace, office_id, history_key, result_row_id, proceeding_id, country_id, candidate_or_list_label,
           original_party_label, original_party_code, party_namespace, party_mapping_id, votes, votes_status, share,
           share_status, share_unit, seats, seats_status, elected_flag, is_substitute, evidence_status, lineage_id, release_id, raw_json
         ) VALUES (?, ?, 'ov10-h', ?, 'ov10-p', ?, ?, NULL, NULL, NULL, NULL, ?, 'recorded', ?, 'recorded', 'percent_0_100', NULL, 'unknown', ?, NULL, ?, ?, ?, '{}')`,
      );
      insertResult.run(
        office.id_namespace,
        office.office_id,
        "ov10-kept",
        office.country_id,
        keptLabel,
        100,
        60,
        1,
        "recorded",
        office.lineage_id,
        office.release_id,
      );
      insertResult.run(
        office.id_namespace,
        office.office_id,
        "ov10-withheld",
        office.country_id,
        SENTINEL,
        10,
        10,
        1,
        "disputed",
        office.lineage_id,
        office.release_id,
      );
      db.exec("COMMIT;");
    } catch (error) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // The transaction may already be closed.
      }
      throw error;
    } finally {
      db.close();
    }
    process.env.ATLAS_DOWNLOADS_DIR = downloadsDir;
    rebuildDerivedInFile(sqlitePath);
  });

  afterAll(() => {
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (previousDownloads === undefined) delete process.env.ATLAS_DOWNLOADS_DIR;
    else process.env.ATLAS_DOWNLOADS_DIR = previousDownloads;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("returns JSON twins equal to the page readers", async () => {
    const country = loadJurisdictionView("albania", sqlitePath);
    expect(country).not.toBeNull();
    const countryResponse = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions/albania", ["albania"]);
    expect(countryResponse.status).toBe(200);
    expect(await countryResponse.json()).toEqual(JSON.parse(JSON.stringify(country)));

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    let municipality = "";
    let office: { office_id: string; id_namespace: string };
    let isoDate = "";
    try {
      municipality = String(
        db.prepare(`SELECT slug_path FROM derived_jurisdiction WHERE slug_path LIKE 'albania/%' ORDER BY slug_path LIMIT 1`).get()
          ?.slug_path,
      );
      office = db
        .prepare(
          `SELECT o.office_id, o.id_namespace
           FROM office o
           WHERE o.country_id = 'albania'
             AND o.office_id <> ?
             AND (SELECT COUNT(*) FROM office o2 WHERE o2.office_id = o.office_id) = 1
             AND NOT EXISTS (
               SELECT 1 FROM result_row r
               WHERE r.id_namespace = o.id_namespace AND r.office_id = o.office_id
                 AND r.evidence_status IN (${[...WITHHELD_EVIDENCE].map(() => "?").join(", ")})
             )
           ORDER BY o.office_id
           LIMIT 1`,
        )
        .get(withheldOfficeId, ...WITHHELD_EVIDENCE) as { office_id: string; id_namespace: string };
      isoDate = String(db.prepare(`SELECT iso_date FROM derived_cycle WHERE country_id = 'albania' ORDER BY iso_date LIMIT 1`).get()?.iso_date);
    } finally {
      db.close();
    }

    const place = loadJurisdictionView(municipality, sqlitePath);
    const placeResponse = await call(
      jurisdictionsGET,
      `http://127.0.0.1/api/atlas/jurisdictions/${municipality}`,
      municipality.split("/"),
    );
    expect(placeResponse.status).toBe(200);
    expect(await placeResponse.json()).toEqual(JSON.parse(JSON.stringify(place)));

    const seat = readSeatPage(office.id_namespace, office.office_id, sqlitePath);
    const seatResponse = await call(seatsGET, `http://127.0.0.1/api/atlas/seats/${office.office_id}`, [office.office_id]);
    expect(seatResponse.status).toBe(200);
    expect(await seatResponse.json()).toEqual(JSON.parse(JSON.stringify(seat)));

    const cycle = loadCyclePage({ country: "albania", dateToken: isoDate }, sqlitePath);
    expect(cycle.status).toBe("ready");
    if (cycle.status !== "ready") return;
    const cycleResponse = await call(cyclesGET, `http://127.0.0.1/api/atlas/cycles/albania/${isoDate}`, ["albania", isoDate]);
    expect(cycleResponse.status).toBe(200);
    expect(await cycleResponse.json()).toEqual(JSON.parse(JSON.stringify(cycle.model)));
  });

  it("serves CSV twins with the snapshotted headers", async () => {
    const jurisdiction = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions/albania.csv", ["albania.csv"]);
    expect(jurisdiction.headers.get("content-type")).toContain("text/csv");
    expect(jurisdiction.headers.get("x-robots-tag")).toBe("noindex");
    expect((await jurisdiction.text()).split("\n")[0]).toBe(JURISDICTION_PAGE_CSV_HEADER.join(","));

    const seat = await call(seatsGET, `http://127.0.0.1/api/atlas/seats/${withheldOfficeId}.csv`, [`${withheldOfficeId}.csv`]);
    expect((await seat.text()).split("\n")[0]).toBe(SEAT_PAGE_CSV_HEADER.join(","));

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    const isoDate = String(db.prepare(`SELECT iso_date FROM derived_cycle WHERE country_id = 'albania' ORDER BY iso_date LIMIT 1`).get()?.iso_date);
    db.close();
    const cycle = await call(cyclesGET, `http://127.0.0.1/api/atlas/cycles/albania/${isoDate}.csv`, ["albania", `${isoDate}.csv`]);
    expect((await cycle.text()).split("\n")[0]).toBe(CYCLE_PAGE_CSV_HEADER.join(","));
  });

  it("round-trips cursor pages without skips or duplicates", async () => {
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    const expected = db
      .prepare(`SELECT slug_path FROM derived_jurisdiction ORDER BY slug_path`)
      .all()
      .map((row) => String(row.slug_path));
    db.close();
    expect(expected.length).toBeGreaterThan(API_PAGE_SIZE === 200 ? 2 : 0);

    const seen: string[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < expected.length; page += 1) {
      const url = new URL("http://127.0.0.1/api/atlas/jurisdictions");
      url.searchParams.set("limit", "2");
      url.searchParams.set("country", "albania");
      if (cursor) url.searchParams.set("cursor", cursor);
      const response = await call(jurisdictionsGET, url.toString(), []);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        items: Array<{ slugPath: string }>;
        pageSize: number;
        nextCursor: string | null;
      };
      expect(body.pageSize).toBe(2);
      expect(body.items.length).toBeGreaterThan(0);
      expect(body.items.length).toBeLessThanOrEqual(2);
      seen.push(...body.items.map((item) => item.slugPath));
      if (!body.nextCursor) break;
      cursor = body.nextCursor;
    }
    expect(seen).toEqual(expected.filter((slug) => slug === "albania" || slug.startsWith("albania/")));
    expect(new Set(seen).size).toBe(seen.length);

    const full = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions?country=albania");
    const fullBody = (await full.json()) as { pageSize: number; nextCursor: string | null; items: unknown[] };
    expect(fullBody.pageSize).toBe(200);
    expect(fullBody.items.length).toBe(Math.min(API_PAGE_SIZE, seen.length));
    if (seen.length > API_PAGE_SIZE) expect(fullBody.nextCursor).toBeTruthy();
    else expect(fullBody.nextCursor).toBeNull();

    const badCursor = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions?cursor=not-a-cursor");
    expect(badCursor.status).toBe(400);
    const badLimit = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions?limit=201");
    expect(badLimit.status).toBe(400);
  });

  it("returns 304 when the publication ETag matches", async () => {
    const first = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions/albania", ["albania"]);
    const etag = first.headers.get("etag");
    expect(etag).toMatch(/^"[0-9a-f]{64}"$/);
    expect(first.headers.get("cache-control")).toBe("public, no-cache");
    const second = await jurisdictionsGET(
      new Request("http://127.0.0.1/api/atlas/jurisdictions/albania", { headers: { "if-none-match": etag ?? "" } }),
      { params: Promise.resolve({ path: ["albania"] }) },
    );
    expect(second.status).toBe(304);
  });

  it("leaves withheld rows out of JSON, CSV, and the country zip", async () => {
    const bodies: string[] = [];
    const jurisdiction = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions/albania", ["albania"]);
    bodies.push(JSON.stringify(await jurisdiction.json()));
    const jurisdictionCsv = await call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions/albania.csv", ["albania.csv"]);
    bodies.push(await jurisdictionCsv.text());
    const seat = await call(seatsGET, `http://127.0.0.1/api/atlas/seats/${withheldNamespace}/${withheldOfficeId}`, [
      withheldNamespace,
      withheldOfficeId,
    ]);
    bodies.push(JSON.stringify(await seat.json()));
    const seatCsv = await call(seatsGET, `http://127.0.0.1/api/atlas/seats/${withheldOfficeId}.csv`, [`${withheldOfficeId}.csv`]);
    bodies.push(await seatCsv.text());
    const lists = await Promise.all([
      call(jurisdictionsGET, "http://127.0.0.1/api/atlas/jurisdictions?country=albania"),
      call(seatsGET, "http://127.0.0.1/api/atlas/seats?country=albania"),
      call(cyclesGET, "http://127.0.0.1/api/atlas/cycles?country=albania"),
    ]);
    for (const response of lists) bodies.push(JSON.stringify(await response.json()));

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    const dates = db
      .prepare(`SELECT iso_date FROM derived_cycle WHERE country_id = 'albania' ORDER BY iso_date`)
      .all()
      .map((row) => String(row.iso_date));
    db.close();
    for (const isoDate of dates) {
      const json = await call(cyclesGET, `http://127.0.0.1/api/atlas/cycles/albania/${isoDate}`, ["albania", isoDate]);
      bodies.push(JSON.stringify(await json.json()));
      const csv = await call(cyclesGET, `http://127.0.0.1/api/atlas/cycles/albania/${isoDate}.csv`, ["albania", `${isoDate}.csv`]);
      bodies.push(await csv.text());
    }

    const zipPath = path.join(downloadsDir, "albania.zip");
    const zip = unzipSync(readFileSync(zipPath));
    const members = ["jurisdictions.csv", "seats.csv", "cycles.csv", "contests.csv", "unplaced.csv", "people.csv", "LICENSE", "SHA256SUMS"];
    for (const name of members) {
      expect(zip[name], name).toBeTruthy();
      bodies.push(strFromU8(zip[name]!));
    }
    expect(strFromU8(zip["people.csv"]!).split("\n")[0]).toBe(PERSON_CSV_HEADER.join(","));
    expect(strFromU8(zip.LICENSE)).toContain("data_rights");
    expect(strFromU8(zip.LICENSE)).toContain("unknown");
    const contests = strFromU8(zip["contests.csv"]!);
    expect(contests).toContain(keptLabel);
    const checksumFile = readFileSync(path.join(downloadsDir, "albania.zip.sha256"), "utf8").trim().split(/\s+/)[0];
    const actual = createHash("sha256").update(readFileSync(zipPath)).digest("hex");
    expect(checksumFile).toBe(actual);

    for (const body of bodies) expect(body).not.toContain(SENTINEL);
  });

  it("lists the Albania bundle on the downloads page", async () => {
    const html = renderToStaticMarkup(await AtlasDownloadsPage());
    expect(html).toContain("/atlas/downloads/albania.zip");
    expect(html).toContain("/electiondatabase/downloads");
    expect(html).not.toContain("lineage");
    expect(html).not.toContain("namespace");
    expect(html).not.toContain(SENTINEL);
  });

  it("stubs person endpoints until the person tables exist, then hides withheld aliases", async () => {
    const missing = await call(peopleGET, "http://127.0.0.1/api/atlas/people");
    expect(missing.status).toBe(200);
    expect(await missing.json()).toEqual({
      available: false,
      dependency: "OV-09",
      items: [],
      pageSize: 200,
      nextCursor: null,
    });
    const missingOne = await call(peopleGET, "http://127.0.0.1/api/atlas/people/someone", ["someone"]);
    expect(missingOne.status).toBe(404);

    const db = openAtlasDatabase(sqlitePath);
    try {
      db.exec(`
        CREATE TABLE person (
          person_id TEXT PRIMARY KEY,
          canonical_label TEXT NOT NULL,
          country_id TEXT NOT NULL,
          review_status TEXT NOT NULL
        );
        CREATE TABLE person_alias (
          person_id TEXT NOT NULL,
          country_id TEXT NOT NULL,
          candidate_or_list_label TEXT NOT NULL,
          office_scope TEXT,
          review_status TEXT NOT NULL
        );
      `);
      db.prepare(`INSERT INTO person (person_id, canonical_label, country_id, review_status) VALUES (?, ?, 'albania', 'approved')`).run(
        "person-kept",
        keptLabel,
      );
      db.prepare(`INSERT INTO person (person_id, canonical_label, country_id, review_status) VALUES ('person-draft', 'Draft Person', 'albania', 'draft_for_human_review')`).run();
      db.prepare(
        `INSERT INTO person_alias (person_id, country_id, candidate_or_list_label, office_scope, review_status)
         VALUES ('person-kept', 'albania', ?, NULL, 'approved')`,
      ).run(keptLabel);
      db.prepare(
        `INSERT INTO person_alias (person_id, country_id, candidate_or_list_label, office_scope, review_status)
         VALUES ('person-kept', 'albania', ?, NULL, 'approved')`,
      ).run(SENTINEL);

      const list = await call(peopleGET, "http://127.0.0.1/api/atlas/people?country=albania");
      const body = (await list.json()) as { available: boolean; items: Array<{ personId: string; history: unknown[] }> };
      expect(body.available).toBe(true);
      expect(body.items.map((item) => item.personId)).toEqual(["person-kept"]);
      const detail = await call(peopleGET, "http://127.0.0.1/api/atlas/people/person-kept", ["person-kept"]);
      const person = await detail.json();
      expect(JSON.stringify(person)).toContain(keptLabel);
      expect(JSON.stringify(person)).not.toContain(SENTINEL);
      const csv = await call(peopleGET, "http://127.0.0.1/api/atlas/people/person-kept.csv", ["person-kept.csv"]);
      const csvText = await csv.text();
      expect(csvText.split("\n")[0]).toBe(PERSON_CSV_HEADER.join(","));
      expect(csvText).toContain(keptLabel);
      expect(csvText).not.toContain(SENTINEL);
    } finally {
      db.exec(`DROP TABLE IF EXISTS person_alias; DROP TABLE IF EXISTS person;`);
      db.close();
    }
  });
});
