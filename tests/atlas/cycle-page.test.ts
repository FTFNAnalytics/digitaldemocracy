import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { importAlbania } from "../../lib/atlas/albania/import";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import {
  assignEventPage,
  cycleLevelCounts,
  contestHref,
  precisionLabel,
} from "../../lib/atlas/cycle/format";
import { cycleCsv } from "../../lib/atlas/cycle/csv";
import { listCyclePublicPaths, loadCyclePage, type CyclePageModel } from "../../lib/atlas/cycle/read";
import { buildSitemapChunks, loadJurisdictionView } from "../../lib/atlas/jurisdiction";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { proxy } from "../../proxy";
import AtlasCyclePage, { generateMetadata } from "../../app/atlas/[country]/elections/[date]/[[...scope]]/page";
import { GET as cycleCsvRoute } from "../../app/atlas/[country]/elections/[date]/csv/route";
import AtlasEventPage from "../../app/atlas/elections/[eventId]/page";
import AtlasJurisdictionPage from "../../app/atlas/[country]/[[...path]]/page";

const repoRoot = path.join(import.meta.dirname, "../..");
const NS = "cdd-observatory-v1";
const NOTES = "Municipal ballots for this date are still being checked against the official record.";

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node);
}

function outsideRecordDetails(html: string): string {
  return html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, "");
}

function ready(country: string, dateToken: string, scope?: string[]): CyclePageModel {
  const loaded = loadCyclePage({ country, dateToken, scope }, sqlitePath);
  expect(loaded.status).toBe("ready");
  if (loaded.status !== "ready") throw new Error(loaded.status);
  return loaded.model;
}

let sqlitePath = "";
let dir = "";
let dimalSlug = "";
let otherSlug = "";

describe("cycle page assignment", () => {
  it("sends a resolved day, a month, and a range to three different pages", () => {
    const day = assignEventPage({
      dateResolution: "resolved",
      precision: "day",
      year: 2023,
      month: 5,
      day: 14,
      rangeStartYear: null,
      rangeEndYear: null,
    });
    const month = assignEventPage({
      dateResolution: "resolved",
      precision: "month",
      year: 2023,
      month: 5,
      day: null,
      rangeStartYear: null,
      rangeEndYear: null,
    });
    const range = assignEventPage({
      dateResolution: "resolved",
      precision: "range",
      year: null,
      month: null,
      day: null,
      rangeStartYear: 2021,
      rangeEndYear: 2023,
    });
    expect(day).toEqual({ kind: "day", isoDate: "2023-05-14" });
    expect(month).toEqual({ kind: "year", year: 2023 });
    expect(range).toEqual({ kind: "year", year: 2021 });
    expect(new Set([JSON.stringify(day), JSON.stringify(month), JSON.stringify(range)]).size).toBe(3);
    expect(
      assignEventPage({
        dateResolution: "resolved",
        precision: "day",
        year: 2019,
        month: 6,
        day: 30,
        rangeStartYear: null,
        rangeEndYear: null,
      }),
    ).toEqual({ kind: "day", isoDate: "2019-06-30" });
  });

  it("labels month, year, and range dates from the supplied parts", () => {
    expect(
      precisionLabel({
        precision: "month",
        label: "2023-05",
        year: 2023,
        month: 5,
        rangeStartLabel: null,
        rangeEndLabel: null,
      }),
    ).toBe("May 2023");
    expect(
      precisionLabel({
        precision: "year",
        label: "2023",
        year: 2023,
        month: null,
        rangeStartLabel: null,
        rangeEndLabel: null,
      }),
    ).toBe("2023");
    expect(
      precisionLabel({
        precision: "range",
        label: null,
        year: null,
        month: null,
        rangeStartLabel: "2021",
        rangeEndLabel: "2023",
      }),
    ).toBe("between 2021 and 2023");
  });

  it("keeps a cycle-level count only when every contest supplies the same number", () => {
    expect(cycleLevelCounts([{ registered: 1000, ballots: 800 }])).toEqual({ registered: 1000, ballots: 800 });
    expect(cycleLevelCounts([{ registered: 1000, ballots: null }])).toEqual({ registered: 1000, ballots: null });
    expect(
      cycleLevelCounts([
        { registered: 1000, ballots: 800 },
        { registered: 1000, ballots: 700 },
      ]),
    ).toEqual({ registered: 1000, ballots: null });
    expect(
      cycleLevelCounts([
        { registered: 1000, ballots: 800 },
        { registered: null, ballots: null },
      ]),
    ).toEqual({ registered: null, ballots: null });
    expect(cycleLevelCounts([])).toEqual({ registered: null, ballots: null });
  });

  it("round-trips a contest query", () => {
    const href = contestHref("/atlas/albania/elections/2023-05-14", "ov06-2023-council", "council");
    const url = new URL(href, "http://localhost");
    expect(url.pathname).toBe("/atlas/albania/elections/2023-05-14");
    expect(url.searchParams.get("contest")).toBe("ov06-2023-council");
    expect(url.searchParams.get("q")).toBe("council");
    expect(contestHref(url.pathname, url.searchParams.get("contest"), url.searchParams.get("q") ?? "")).toBe(href);
  });
});

describe("election cycle pages", () => {
  const previous = process.env.ATLAS_SQLITE_PATH;
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeAll(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    dir = mkdtempSync(path.join(os.tmpdir(), "atlas-cycle-"));
    sqlitePath = path.join(dir, "atlas.sqlite");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "attempts.sqlite"),
      operator: "cycle-page",
    });
    seedCycleFixtures(sqlitePath);
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const dimal = db
        .prepare(
          `SELECT j.slug_path FROM office o
           JOIN derived_jurisdiction j ON j.country_id = o.country_id AND j.geography_id = o.geography_id
           WHERE o.id_namespace = ? AND o.office_id = 'AL-05-M'`,
        )
        .get(NS) as { slug_path: string };
      const other = db
        .prepare(
          `SELECT j.slug_path FROM office o
           JOIN derived_jurisdiction j ON j.country_id = o.country_id AND j.geography_id = o.geography_id
           WHERE o.id_namespace = ? AND o.office_id = 'AL-01-M'`,
        )
        .get(NS) as { slug_path: string };
      dimalSlug = dimal.slug_path.split("/").slice(1).join("/");
      otherSlug = other.slug_path.split("/").slice(1).join("/");
    } finally {
      db.close();
    }
  });

  afterAll(() => {
    if (previous === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previous;
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("puts each fixture event on exactly one page and does not merge two days", () => {
    const pages = [
      ready("albania", "2015-06-21"),
      ready("albania", "2019-06-30"),
      ready("albania", "2023-05-14"),
      ready("albania", "2023"),
      ready("albania", "2021"),
    ];
    const ids = pages.map((model) => model.contests.map((contest) => contest.eventId));
    const flat = ids.flat();
    expect(new Set(flat).size).toBe(flat.length);
    expect(ids[0]).toEqual(["ov06-2015-mayor"]);
    expect(ids[1]?.sort()).toEqual(["ov06-2019-dimal", "ov06-2019-other"]);
    expect(new Set(ids[2])).toEqual(new Set(["ov06-2023-mayor", "ov06-2023-council", "ov06-2023-other"]));
    expect(ids[3]).toEqual(["ov06-month"]);
    expect(ids[4]).toEqual(["ov06-range"]);
    expect(loadCyclePage({ country: "albania", dateToken: "2023-02-31" }, sqlitePath).status).toBe("not_found");
    expect(loadCyclePage({ country: "albania", dateToken: "not-a-date" }, sqlitePath).status).toBe("not_found");
  });

  it("orders the year switcher and keeps a contest query on the selected contest", async () => {
    const html = markup(
      await AtlasCyclePage({
        params: Promise.resolve({ country: "albania", date: "2023-05-14" }),
        searchParams: Promise.resolve({ contest: "ov06-2023-mayor" }),
      }),
    );
    const keys = [...html.matchAll(/data-switcher="([^"]+)"/g)].map((match) => match[1]);
    expect(keys).toEqual(["2015-06-21", "2019-06-30", "2023-05-14"]);
    expect(html).toMatch(/data-switcher="2019-06-30"[^>]*data-atlas-cycle="none"/);
    expect(html).toMatch(/data-switcher="2023-05-14"[^>]*data-atlas-cycle="results"/);
    expect(html).toContain('data-selected-contest="ov06-2023-mayor"');
    expect(html).toContain("contest=ov06-2023-mayor");
    expect(html).toContain('href="/atlas/albania/elections/2023-05-14?contest=ov06-2023-council"');
    expect(html).toContain('href="/atlas/elections/ov06-2023-mayor"');
    expect(html).toContain("/seats/");
    expect(html).toContain("/atlas/search?mode=candidate");
    expect(html).toContain("plurality");
    expect(html).toContain("Valid votes");
    expect(html).toContain("Ordinary");
    expect(html).toContain("First round");
    expect(html).toContain("Runoff");
    expect(html).toContain("line-through");
    expect(html).toContain('data-cycle-tile="turnout"');
    expect(html).toContain('data-cycle-tile="ballots"');
    expect(html).toContain("80%");
    expect(html).toContain("800");
    expect(outsideRecordDetails(html)).not.toMatch(/prompt b|lineage|namespace/i);
    expect(html).not.toContain("Hidden Row");

    const model = ready("albania", "2023-05-14");
    const csvResponse = await cycleCsvRoute(new Request("http://localhost/cycle.csv"), {
      params: Promise.resolve({ country: "albania", date: "2023-05-14" }),
    });
    expect(csvResponse.status).toBe(200);
    const csvText = await csvResponse.text();
    expect(csvText).toBe(cycleCsv(model.contests));
    const tableRows = model.contests.reduce((count, contest) => count + contest.results.length, 0);
    expect(csvText.trim().split("\n")).toHaveLength(tableRows + 1);
    const selected = model.contests.find((contest) => contest.eventId === "ov06-2023-mayor");
    expect(selected?.results.length).toBeGreaterThan(0);
    for (const row of selected?.results ?? []) {
      expect(html).toContain(`data-result-row="${row.id}"`);
      expect(html).toContain(row.label ?? "");
    }
    for (const contest of model.contests) {
      for (const row of contest.results) {
        expect(row.label).toBeTruthy();
        expect(csvText).toContain(row.label ?? "");
      }
    }
    expect(csvText).not.toContain("Hidden Row");
    expect(csvText).not.toContain("Month Candidate");
  });

  it("renders the queued day without a results table and shows the country notes", async () => {
    const html = markup(
      await AtlasCyclePage({
        params: Promise.resolve({ country: "albania", date: "2019-06-30" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(html).toContain("Results for 2019-06-30 are not yet ingested");
    expect(html).toContain(NOTES);
    expect(html).toContain('data-cycle-queued="true"');
    expect(html).toContain('data-atlas-empty="queued"');
    expect(html).not.toContain("data-result-row=");
    expect(html).not.toContain('data-cycle-tile=');
    expect(outsideRecordDetails(html)).not.toMatch(/prompt b|lineage|namespace/i);
  });

  it("shows month and range precision on their own year pages", async () => {
    const monthHtml = markup(
      await AtlasCyclePage({
        params: Promise.resolve({ country: "albania", date: "2023" }),
        searchParams: Promise.resolve({}),
      }),
    );
    const rangeHtml = markup(
      await AtlasCyclePage({
        params: Promise.resolve({ country: "albania", date: "2021" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(monthHtml).toContain("May 2023");
    expect(monthHtml).toContain("Month Candidate");
    expect(monthHtml).not.toContain("Range Candidate");
    expect(monthHtml).not.toContain("Fixture Winner");
    expect(rangeHtml).toContain("between 2021 and 2023");
    expect(rangeHtml).toContain("Range Candidate");
    expect(rangeHtml).not.toContain("Month Candidate");
    expect(rangeHtml).not.toContain(".csv");
    const monthKeys = [...monthHtml.matchAll(/data-switcher="([^"]+)"/g)].map((match) => match[1]);
    expect(monthKeys).toEqual(["2021", "2023"]);
  });

  it("filters a scoped page to that place and points jurisdiction chips at the cycle route", async () => {
    expect(dimalSlug).not.toBe("");
    expect(otherSlug).not.toBe(dimalSlug);
    const scoped = ready("albania", "2023-05-14", dimalSlug.split("/"));
    expect(scoped.contests.map((contest) => contest.eventId)).toEqual(["ov06-2023-mayor"]);
    expect(ready("albania", "2023-05-14").contests.some((contest) => contest.eventId === "ov06-2023-council")).toBe(true);
    expect(scoped.switcher.map((chip) => chip.sortKey)).toEqual(["2015-06-21", "2019-06-30", "2023-05-14"]);
    expect(scoped.switcher.every((chip) => chip.href.includes(`/${dimalSlug}`))).toBe(true);
    expect(scoped.switcher.find((chip) => chip.sortKey === "2019-06-30")?.hasResults).toBe(false);

    const placeHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: dimalSlug.split("/") }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(placeHtml).toContain(`/atlas/albania/elections/2023-05-14/${dimalSlug}`);
    expect(placeHtml).not.toContain("?date=2023-05-14");

    const meta = await generateMetadata({
      params: Promise.resolve({ country: "albania", date: "2023-05-14" }),
      searchParams: Promise.resolve({}),
    });
    expect(meta.title).toEqual({ absolute: `${ready("albania", "2023-05-14").label} · Election Atlas` });
    expect(meta.alternates?.canonical).toBe("/atlas/albania/elections/2023-05-14");

    const paths = listCyclePublicPaths(sqlitePath);
    expect(paths).toContain("/atlas/albania/elections/2015-06-21");
    expect(paths).toContain("/atlas/albania/elections/2019-06-30");
    expect(paths).toContain("/atlas/albania/elections/2023-05-14");
    expect(paths).toContain("/atlas/albania/elections/2023");
    expect(paths).toContain("/atlas/albania/elections/2021");
    const chunks = buildSitemapChunks({
      staticEntries: [{ url: "https://example/atlas" }],
      jurisdictionPaths: ["albania"],
      cyclePaths: paths,
      origin: "https://example",
    });
    expect(chunks[0]?.some((entry) => entry.url === "https://example/atlas/albania/elections/2023-05-14")).toBe(true);

    const eventHtml = markup(await AtlasEventPage({ params: Promise.resolve({ eventId: "ov06-2023-mayor" }) }));
    expect(eventHtml).toContain('href="/atlas/albania/elections/2023-05-14"');
    const monthEvent = markup(await AtlasEventPage({ params: Promise.resolve({ eventId: "ov06-month" }) }));
    expect(monthEvent).toContain('href="/atlas/albania/elections/2023"');

    const rewritten = proxy(new NextRequest("http://127.0.0.1:3000/atlas/albania/elections/2023-05-14.csv"));
    const location = rewritten.headers.get("x-middleware-rewrite") ?? rewritten.headers.get("location") ?? "";
    expect(location).toContain("/atlas/albania/elections/2023-05-14/csv");
    const cycle = proxy(new NextRequest("http://127.0.0.1:3000/atlas/albania/elections/2023-05-14"));
    expect(cycle.status).not.toBe(301);
    const seat = proxy(new NextRequest("http://127.0.0.1:3000/atlas/albania/dimal/seats/mayor"));
    expect(seat.headers.get("x-middleware-rewrite") ?? "").toContain("/atlas/seat-alias/");

    await expect(
      AtlasCyclePage({
        params: Promise.resolve({ country: "albania", date: "1999-01-01" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/);

    const view = loadJurisdictionView(`albania/${dimalSlug}`, sqlitePath);
    expect(view?.cycles.some((cycleRow) => cycleRow.isoDate === "2023-05-14")).toBe(true);
  });
});

function seedCycleFixtures(filePath: string) {
  const db = openAtlasDatabase(filePath);
  try {
    const publication = db
      .prepare("SELECT lineage_id, release_id FROM publication_release WHERE lineage_id = 'country-package-albania'")
      .get() as { lineage_id: string; release_id: string };
    const office = (officeId: string) =>
      db.prepare("SELECT geography_id, country_id FROM office WHERE id_namespace = ? AND office_id = ?").get(NS, officeId) as {
        geography_id: string;
        country_id: string;
      };
    const extra = db
      .prepare(
        `SELECT office_id FROM office
         WHERE id_namespace = ? AND office_id NOT IN ('AL-05-M', 'AL-05-C', 'AL-01-M', 'AL-06-M')
         ORDER BY office_id LIMIT 1`,
      )
      .get(NS) as { office_id: string };
    expect(office("AL-05-M").country_id).toBe("albania");
    expect(extra.office_id).toBeTruthy();

    const insertDay = db.prepare(
      `INSERT INTO research_date (
         date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
       ) VALUES (?, ?, 'day', 'called', ?, ?, ?, NULL, NULL, ?, ?, '{}')`,
    );
    const insertMonth = db.prepare(
      `INSERT INTO research_date (
         date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
       ) VALUES (?, ?, 'month', 'called', ?, ?, NULL, NULL, NULL, ?, ?, '{}')`,
    );
    const insertYear = db.prepare(
      `INSERT INTO research_date (
         date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
       ) VALUES (?, ?, 'year', 'called', ?, NULL, NULL, NULL, NULL, ?, ?, '{}')`,
    );
    const insertRange = db.prepare(
      `INSERT INTO research_date (
         date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
       ) VALUES (?, ?, 'range', 'called', NULL, NULL, NULL, ?, ?, ?, ?, '{}')`,
    );
    const insertEvent = db.prepare(
      `INSERT INTO election_event (
         id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind, selected_history_role,
         electoral_system, comparability, ballot_basis, share_unit, legal_outcome, record_state, state_note,
         lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, 'resolved', 'ordinary', 'selected', ?, NULL, 'valid_votes', 'percent_0_100', 'certified', 'active', NULL, ?, ?, ?)`,
    );
    const insertProceeding = db.prepare(
      `INSERT INTO proceeding (
         id_namespace, office_id, history_key, proceeding_id, kind, sequence_no, supersedes_id, legal_outcome,
         lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, '{}')`,
    );
    const insertResult = db.prepare(
      `INSERT INTO result_row (
         id_namespace, office_id, history_key, result_row_id, proceeding_id, country_id, candidate_or_list_label,
         original_party_label, original_party_code, party_namespace, party_mapping_id, votes, votes_status, share,
         share_status, share_unit, seats, seats_status, elected_flag, is_substitute, evidence_status, lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, 'percent_0_100', NULL, 'unknown', ?, NULL, ?, ?, ?, '{}')`,
    );
    const insertWithheld = db.prepare(
      `INSERT INTO result_row (
         id_namespace, office_id, history_key, result_row_id, proceeding_id, country_id, candidate_or_list_label,
         original_party_label, original_party_code, party_namespace, party_mapping_id, votes, votes_status, share,
         share_status, share_unit, seats, seats_status, elected_flag, is_substitute, evidence_status, lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, 'structurally_unavailable', NULL, 'structurally_unavailable', 'percent_0_100', NULL, 'structurally_unavailable', NULL, NULL, 'structurally_unavailable', ?, ?, '{}')`,
    );

    const counts = JSON.stringify({ row: { registered_voters: 1000, votes_cast: 800 } });
    const lineage = publication.lineage_id;
    const release = publication.release_id;
    db.exec("BEGIN IMMEDIATE;");
    db.prepare("UPDATE country SET notes = ? WHERE country_id = 'albania'").run(NOTES);
    insertDay.run("ov06-date-2015", "2015-06-21", 2015, 6, 21, lineage, release);
    insertDay.run("ov06-date-2019", "2019-06-30", 2019, 6, 30, lineage, release);
    insertDay.run("ov06-date-2023", "2023-05-14", 2023, 5, 14, lineage, release);
    insertMonth.run("ov06-date-month", "2023-05", 2023, 5, lineage, release);
    insertYear.run("ov06-date-start", "2021", 2021, lineage, release);
    insertYear.run("ov06-date-end", "2023", 2023, lineage, release);
    insertRange.run("ov06-date-range", "between 2021 and 2023", "ov06-date-start", "ov06-date-end", lineage, release);

    insertEvent.run(NS, "AL-05-M", "ov06-h-2015", "ov06-2015-mayor", "ov06-date-2015", null, lineage, release, counts);
    insertWithheld.run(NS, "AL-05-M", "ov06-h-2015", "ov06-hidden", office("AL-05-M").country_id, "Hidden Row", "Hidden Party", lineage, release);
    insertResult.run(
      NS, "AL-05-M", "ov06-h-2015", "ov06-2015-winner", null, office("AL-05-M").country_id, "Fixture Winner", "Fixture Party",
      100, "recorded", 55, "recorded", 1, "recorded", lineage, release,
    );

    insertEvent.run(NS, "AL-05-M", "ov06-h-2019", "ov06-2019-dimal", "ov06-date-2019", null, lineage, release, "{}");
    insertEvent.run(NS, "AL-01-M", "ov06-h-2019", "ov06-2019-other", "ov06-date-2019", null, lineage, release, "{}");

    insertEvent.run(NS, "AL-05-M", "ov06-h-2023", "ov06-2023-mayor", "ov06-date-2023", "plurality", lineage, release, counts);
    insertEvent.run(NS, "AL-05-C", "ov06-h-2023-c", "ov06-2023-council", "ov06-date-2023", null, lineage, release, counts);
    insertEvent.run(NS, "AL-01-M", "ov06-h-2023-o", "ov06-2023-other", "ov06-date-2023", null, lineage, release, counts);
    insertProceeding.run(NS, "AL-05-M", "ov06-h-2023", "ov06-p-first", "first_round", 1, "certified", lineage, release);
    insertProceeding.run(NS, "AL-05-M", "ov06-h-2023", "ov06-p-runoff", "runoff", 2, "superseded", lineage, release);
    insertResult.run(
      NS, "AL-05-M", "ov06-h-2023", "ov06-2023-winner", "ov06-p-first", office("AL-05-M").country_id, "Fixture Winner", "Fixture Party",
      120, "recorded", 62, "recorded", 1, "recorded", lineage, release,
    );
    insertResult.run(
      NS, "AL-05-M", "ov06-h-2023", "ov06-2023-runner", "ov06-p-first", office("AL-05-M").country_id, "Fixture Runner-up", "Other Party",
      70, "recorded", 38, "recorded", 0, "recorded", lineage, release,
    );
    insertResult.run(
      NS, "AL-05-C", "ov06-h-2023-c", "ov06-2023-list", null, office("AL-05-C").country_id, "Fixture List", "List Party",
      40, "recorded", 40, "recorded", 1, "recorded", lineage, release,
    );
    insertResult.run(
      NS, "AL-01-M", "ov06-h-2023-o", "ov06-2023-other-row", null, office("AL-01-M").country_id, "Other Winner", "Other Party",
      80, "recorded", 51, "recorded", 1, "recorded", lineage, release,
    );

    insertEvent.run(NS, "AL-06-M", "ov06-h-month", "ov06-month", "ov06-date-month", null, lineage, release, "{}");
    insertResult.run(
      NS, "AL-06-M", "ov06-h-month", "ov06-month-row", null, office("AL-06-M").country_id, "Month Candidate", "Month Party",
      10, "recorded", 60, "recorded", 1, "recorded", lineage, release,
    );
    insertEvent.run(NS, extra.office_id, "ov06-h-range", "ov06-range", "ov06-date-range", null, lineage, release, "{}");
    insertResult.run(
      NS, extra.office_id, "ov06-h-range", "ov06-range-row", null, office(extra.office_id).country_id, "Range Candidate", "Range Party",
      12, "recorded", 50, "recorded", 1, "recorded", lineage, release,
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

  const derived = openAtlasDatabase(filePath);
  try {
    deriveAtlas(derived);
  } finally {
    derived.close();
  }
}
