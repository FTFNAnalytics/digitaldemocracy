import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { GET } from "../../app/api/atlas/search/route";
import AtlasSearchPage from "../../app/atlas/search/page";
import { SearchPalette } from "../../components/atlas/search-palette";
import { importAlbania } from "../../lib/atlas/albania/import";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import { listAtlasExplorerOffices } from "../../lib/atlas/read";
import { compareRanked, rankScore } from "../../lib/atlas/search/rank";
import { sqliteFts5Enabled } from "../../lib/atlas/search/schema";
import { foldSearchText, highlightSnippet } from "../../lib/atlas/search/text";
import { search } from "../../lib/atlas/search";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...props }, children),
  };
});

const repoRoot = path.join(import.meta.dirname, "../..");
const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function searchHash(filePath: string): string {
  const db = new DatabaseSync(filePath, { readOnly: true });
  try {
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'search_%' ORDER BY name",
      )
      .all()
      .map((row) => String(row.name));
    const hash = createHash("sha256");
    for (const name of tables) {
      const columns = db.prepare(`PRAGMA table_info("${name}")`).all();
      const names = columns.map((column) => String(column.name));
      const order = names.map((column) => `"${column}"`).join(", ");
      const rows = db.prepare(`SELECT ${order} FROM "${name}" ORDER BY ${order}`).all();
      hash.update(name);
      for (const row of rows) hash.update(JSON.stringify(names.map((column) => row[column] ?? null)));
    }
    return hash.digest("hex");
  } finally {
    db.close();
  }
}

function insertLineage(
  db: DatabaseSync,
  lineageId: string,
  releaseId: string,
  fingerprint: string,
  countryId: string,
  countryCode: string,
  countryName: string,
  regionId: string,
) {
  db.prepare("INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'country_package', ?)").run(
    lineageId,
    countryName,
  );
  db.prepare(
    `INSERT INTO dataset_release (
       lineage_id, release_id, fingerprint_sha256, hash_inputs_json, adapter_version, method_version,
       schema_version, validated_counts_json, research_coverage_complete
     ) VALUES (?, ?, ?, '{}', 'fixture', 'fixture', 'fixture', '{}', 0)`,
  ).run(lineageId, releaseId, fingerprint);
  db.prepare("INSERT INTO publication_release (lineage_id, release_id) VALUES (?, ?)").run(lineageId, releaseId);
  db.prepare(
    `INSERT INTO retained_input (
       lineage_id, release_id, input_path, input_kind, sha256, byte_count, recovery_locator
     ) VALUES (?, ?, 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?, 2, 'fixture')`,
  ).run(lineageId, releaseId, fingerprint);
  db.prepare(
    `INSERT INTO country (
       country_id, country_code, name, polity_kind, region_id, coverage_status, lineage_id, release_id
     ) VALUES (?, ?, ?, 'sovereign_country', ?, 'partial', ?, ?)`,
  ).run(countryId, countryCode, countryName, regionId, lineageId, releaseId);
}

function insertOffice(
  db: DatabaseSync,
  args: {
    namespace: string;
    officeId: string;
    countryId: string;
    geographyId: string;
    geographyName: string;
    officeName: string;
    lineageId: string;
    releaseId: string;
    fingerprint: string;
    dateId: string;
    year: number;
    month: number;
    day: number;
    historyKey: string;
    eventId: string;
    label: string;
    party: string | null;
    evidence: string;
    resultId: string;
  },
) {
  db.prepare(
    `INSERT INTO geography (
       country_id, geography_id, name, lineage_id, release_id
     ) VALUES (?, ?, ?, ?, ?)`,
  ).run(args.countryId, args.geographyId, args.geographyName, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO research_date (
       date_id, label, precision, certainty, year, month, day, lineage_id, release_id
     ) VALUES (?, ?, 'day', 'called', ?, ?, ?, ?, ?)`,
  ).run(args.dateId, args.dateId, args.year, args.month, args.day, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO office (
       id_namespace, office_id, country_id, geography_id, name, office_type, office_status,
       record_state, next_date_resolution, lineage_id, release_id
     ) VALUES (?, ?, ?, ?, ?, 'mayor', 'current', 'active', 'unknown', ?, ?)`,
  ).run(args.namespace, args.officeId, args.countryId, args.geographyId, args.officeName, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO office_tier_classification (
       id_namespace, office_id, tier, review_status, rationale, lineage_id, release_id,
       classification_path, classification_kind, classification_sha256
     ) VALUES (?, ?, 'municipal', 'needs_review', 'fixture', ?, ?, 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?)`,
  ).run(args.namespace, args.officeId, args.lineageId, args.releaseId, args.fingerprint);
  db.prepare(
    `INSERT INTO election_event (
       id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind,
       selected_history_role, ballot_basis, share_unit, legal_outcome, record_state, lineage_id, release_id
     ) VALUES (?, ?, ?, ?, ?, 'resolved', 'ordinary', 'selected', 'valid_votes', 'percent_0_100', 'certified', 'active', ?, ?)`,
  ).run(args.namespace, args.officeId, args.historyKey, args.eventId, args.dateId, args.lineageId, args.releaseId);
  db.prepare(
    `INSERT INTO result_row (
       id_namespace, office_id, history_key, result_row_id, country_id, candidate_or_list_label,
       original_party_label, votes_status, share_status, share_unit, seats_status, elected_flag,
       evidence_status, lineage_id, release_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unknown', 'unknown', 'percent_0_100', 'unknown', 1, ?, ?, ?)`,
  ).run(
    args.namespace,
    args.officeId,
    args.historyKey,
    args.resultId,
    args.countryId,
    args.label,
    args.party,
    args.evidence,
    args.lineageId,
    args.releaseId,
  );
}

describe("search text and ranking", () => {
  it("reports FTS5 unavailable and keeps the migration on trigram tables", () => {
    expect(sqliteFts5Enabled()).toBe(false);
    const sql = readFileSync(path.join(repoRoot, "schemas/atlas/migrations/0004_atlas_search.sql"), "utf8");
    const executable = sql.replace(/--.*$/gm, "");
    expect(executable).not.toMatch(/fts5/i);
    expect(sql).toContain("search_seat_trigram");
    expect(sql).toContain("search_cycle_trigram");
    expect(sql).toContain("search_candidate_trigram");
  });

  it("folds diacritics and punctuation without merging distinct letters", () => {
    expect(foldSearchText("Tiranë")).toBe("tirane");
    expect(foldSearchText("Tiranë — Kryetar bashkie")).toBe("tirane kryetar bashkie");
    expect(highlightSnippet("Tiranë mayor", ["tirane", "mayor"])).toContain("<mark");
    expect(highlightSnippet("Tiranë mayor", ["tirane", "mayor"])).toContain("Tiranë");
    expect(highlightSnippet("A < B", ["a"])).not.toContain("< B");
  });

  it("boosts an exact name and a later year, and breaks ties toward Europe", () => {
    expect(rankScore(1, true, 1990)).toBeGreaterThan(rankScore(1, false, 2024));
    expect(rankScore(1, false, 2024)).toBeGreaterThan(rankScore(1, false, 1990));
    const europe = { score: 2, regionRank: 0, year: 2019, title: "Zed", searchId: 2 };
    const americas = { score: 2, regionRank: 1, year: 2024, title: "Aaa", searchId: 1 };
    expect(compareRanked(europe, americas)).toBeLessThan(0);
  });
});

describe("Atlas search index", () => {
  const tempDirs: string[] = [];
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("rebuilds search rows and finds the Tirana mayor with or without the diacritic", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-search-al-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAlbania({ root: repoRoot, sqlitePath, attemptsPath, operator: "search-test" });
    process.env.ATLAS_SQLITE_PATH = sqlitePath;

    const before = searchHash(sqlitePath);
    const db = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(db);
    } finally {
      db.close();
    }
    expect(searchHash(sqlitePath)).toBe(before);

    const read = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const seats = read.prepare("SELECT COUNT(*) AS n FROM search_seat").get() as { n: number };
      const offices = read.prepare("SELECT COUNT(*) AS n FROM office").get() as { n: number };
      expect(seats.n).toBe(offices.n);
      expect(seats.n).toBeGreaterThan(0);
      const virtual = read
        .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE sql LIKE '%fts5%'")
        .get() as { n: number };
      expect(virtual.n).toBe(0);
    } finally {
      read.close();
    }

    for (const q of ["tiranë mayor", "tirane mayor", "tiran"]) {
      const hits = search({ mode: "seat", q, limit: 10 }, sqlitePath);
      expect(hits[0]?.officeId, q).toBe("AL-53-M");
      expect(hits[0]?.snippet).toContain("<mark");
      expect(hits[0]?.disambiguation).toContain("albania/tirane");
      expect(hits[0]?.disambiguation).toContain("Holder not supplied");
      expect(JSON.stringify(hits[0])).not.toMatch(/id_namespace|lineage/);
    }

    expect(
      listAtlasExplorerOffices({ q: "tiranë mayor", country: "", tier: "", region: "" }, sqlitePath).map(
        (office) => office.officeId,
      ),
    ).toContain("AL-53-M");
    expect(search({ mode: "seat", q: "tirane mayor", level: "municipality", limit: 5 }, sqlitePath)[0]?.officeId).toBe(
      "AL-53-M",
    );
    expect(search({ mode: "seat", q: "tirane mayor", level: "country", limit: 5 }, sqlitePath)).toEqual([]);
    expect(search({ mode: "seat", q: "tirane mayor", yearFrom: 2020, yearTo: 2024, limit: 5 }, sqlitePath)).toEqual([]);

    const pageHtml = markup(
      await AtlasSearchPage({
        searchParams: Promise.resolve({ mode: "seat", q: "tirane mayor" }),
      }),
    );
    expect(pageHtml).toContain("Tiranë");
    expect(pageHtml).toContain("/atlas/offices/AL-53-M");
    expect(pageHtml).toContain("<mark");
    expect(pageHtml).toContain("data-search-keyboard");
    expect(pageHtml).not.toMatch(/id_namespace|lineage/);

    const palette = markup(createElement(SearchPalette));
    expect(palette).toContain('href="/atlas/search"');
    expect(palette).toContain("Control+K");

    const rejected = await GET(new Request(`http://atlas.local/api/atlas/search?mode=seat&q=${"a".repeat(201)}`));
    expect(rejected.status).toBe(400);
    expect(rejected.headers.get("cache-control")).toBe("no-store");
    const accepted = await GET(new Request("http://atlas.local/api/atlas/search?mode=seat&q=tirane%20mayor"));
    expect(accepted.status).toBe(200);
    expect(accepted.headers.get("cache-control")).toBe("public, max-age=300");
    const body = (await accepted.json()) as { engine: string; fts5: boolean; results: Array<{ officeId: string }> };
    expect(body.engine).toBe("trigram-like");
    expect(body.fts5).toBe(false);
    expect(body.results[0]?.officeId).toBe("AL-53-M");
    expect(JSON.stringify(body)).not.toMatch(/id_namespace|lineage/);
  });

  it("keeps one candidate row per country and drops withheld labels", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-search-fx-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = openAtlasDatabase(sqlitePath);
    try {
      db.exec("BEGIN IMMEDIATE;");
      insertLineage(db, "lineage-al", "rel-al", SHA_A, "albania", "AL", "Albania", "europe");
      insertLineage(db, "lineage-xl", "rel-xl", SHA_B, "exampleland", "XL", "Example Land", "americas");
      insertOffice(db, {
        namespace: "ns-al",
        officeId: "AL-PLACE-M",
        countryId: "albania",
        geographyId: "geo-al",
        geographyName: "Place",
        officeName: "Mayor of Place",
        lineageId: "lineage-al",
        releaseId: "rel-al",
        fingerprint: SHA_A,
        dateId: "date-al",
        year: 2019,
        month: 5,
        day: 14,
        historyKey: "hist-al",
        eventId: "event-al",
        label: "Ada Shared",
        party: "List A",
        evidence: "recorded",
        resultId: "result-al",
      });
      db.prepare(
        `INSERT INTO result_row (
           id_namespace, office_id, history_key, result_row_id, country_id, candidate_or_list_label,
           original_party_label, votes_status, share_status, share_unit, seats_status, elected_flag,
           evidence_status, lineage_id, release_id
         ) VALUES ('ns-al', 'AL-PLACE-M', 'hist-al', 'result-hidden', 'albania', 'Hidden Label', 'List A',
           'unknown', 'unknown', 'percent_0_100', 'unknown', 0, 'disputed', 'lineage-al', 'rel-al')`,
      ).run();
      insertOffice(db, {
        namespace: "ns-xl",
        officeId: "XL-PLACE-M",
        countryId: "exampleland",
        geographyId: "geo-xl",
        geographyName: "Other",
        officeName: "Mayor of Other",
        lineageId: "lineage-xl",
        releaseId: "rel-xl",
        fingerprint: SHA_B,
        dateId: "date-xl",
        year: 2021,
        month: 6,
        day: 1,
        historyKey: "hist-xl",
        eventId: "event-xl",
        label: "Ada Shared",
        party: "List A",
        evidence: "recorded",
        resultId: "result-xl",
      });
      db.exec("COMMIT;");
      deriveAtlas(db);
    } finally {
      db.close();
    }
    const first = searchHash(sqlitePath);
    const again = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(again);
    } finally {
      again.close();
    }
    expect(searchHash(sqlitePath)).toBe(first);

    const hits = search({ mode: "candidate", q: "Ada Shared", limit: 10 }, sqlitePath);
    expect(hits).toHaveLength(2);
    expect(hits.map((hit) => hit.countryId).sort()).toEqual(["albania", "exampleland"]);
    expect(hits.every((hit) => hit.title === "Ada Shared")).toBe(true);
    expect(hits.find((hit) => hit.countryId === "albania")?.disambiguation).toContain("Mayor of Place");
    expect(hits.find((hit) => hit.countryId === "albania")?.disambiguation).toContain("2019");
    expect(hits.find((hit) => hit.countryId === "exampleland")?.disambiguation).toContain("2021");
    expect(JSON.stringify(hits)).not.toMatch(/id_namespace|lineage/);
    expect(search({ mode: "candidate", q: "Hidden Label", limit: 10 }, sqlitePath)).toEqual([]);

    const cycle = search({ mode: "cycle", q: "2019-05-14", limit: 5 }, sqlitePath);
    expect(cycle).toHaveLength(1);
    expect(cycle[0]?.disambiguation).toBe("2019-05-14 · 1 contest");
    expect(cycle[0]?.countryId).toBe("albania");
  });
});
