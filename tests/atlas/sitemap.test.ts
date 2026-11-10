import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { countryJurisdictionKey } from "../../lib/atlas/derive/project";
import { foldSlug } from "../../lib/atlas/derive/slug";
import { listSitemapCountryPaths, loadPublicSitemap, sitemapPathAllowed } from "../../lib/atlas/sitemap";

describe("public sitemap", () => {
  const tempDirs: string[] = [];
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;

  afterEach(() => {
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("rejects crawler query URLs and the paths robots disallows", () => {
    expect(sitemapPathAllowed("/atlas/france")).toBe(true);
    expect(sitemapPathAllowed("/atlas/downloads")).toBe(true);
    expect(sitemapPathAllowed("/atlas/search")).toBe(false);
    expect(sitemapPathAllowed("/electiondatabase/sources")).toBe(false);
    expect(sitemapPathAllowed("/api/atlas/jurisdictions")).toBe(false);
    expect(sitemapPathAllowed("/atlas/france?results=1")).toBe(false);
    expect(sitemapPathAllowed("/atlas/france?list=1")).toBe(false);
    expect(sitemapPathAllowed("/atlas/albania/elections/2023-05-14?contest=1")).toBe(false);
    const rules = robots().rules;
    const sitemapUrl = robots().sitemap;
    expect(sitemapUrl).toBe("https://center4digitaldemocracy.com/sitemap.xml");
    expect(Array.isArray(rules) ? rules[0]?.crawlDelay : rules.crawlDelay).toBe(10);
  });

  it("lists Atlas countries from the summary table and one primary-key slug lookup", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-sitemap-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const db = new DatabaseSync(sqlitePath);
    db.exec(`
      CREATE TABLE derived_country_summary (
        country_id TEXT PRIMARY KEY,
        offices INTEGER NOT NULL,
        events INTEGER NOT NULL,
        result_rows INTEGER NOT NULL
      );
      CREATE TABLE derived_jurisdiction (
        jurisdiction_key TEXT PRIMARY KEY,
        country_id TEXT NOT NULL,
        slug_path TEXT NOT NULL,
        depth INTEGER NOT NULL
      );
      CREATE TABLE result_row (
        country_id TEXT NOT NULL,
        raw_json TEXT NOT NULL
      );
    `);
    const insertSummary = db.prepare(
      `INSERT INTO derived_country_summary (country_id, offices, events, result_rows) VALUES (?, ?, ?, ?)`,
    );
    const insertPlace = db.prepare(
      `INSERT INTO derived_jurisdiction (jurisdiction_key, country_id, slug_path, depth) VALUES (?, ?, ?, ?)`,
    );
    insertSummary.run("france", 37850, 0, 0);
    insertSummary.run("austria", 2038, 5956, 16336);
    insertSummary.run("empty-land", 0, 0, 0);
    insertSummary.run("united_kingdom", 510, 0, 0);
    insertPlace.run(countryJurisdictionKey("france"), "france", "france", 0);
    insertPlace.run("geo:france:paris", "france", "france/paris", 1);
    for (let index = 0; index < 500; index += 1) {
      insertPlace.run(`geo:france:child-${index}`, "france", `france/child-${index}`, 2);
    }
    insertPlace.run(countryJurisdictionKey("austria"), "austria", "austria", 0);
    db.close();

    expect(countryJurisdictionKey("france")).toBe("country:france");
    const paths = listSitemapCountryPaths(sqlitePath);
    expect(paths).toEqual(["/atlas/austria", "/atlas/france", "/atlas/united-kingdom"]);
    expect(foldSlug("united_kingdom")).toBe("united-kingdom");
    expect(paths.some((path) => path.includes("/france/"))).toBe(false);

    const entries = loadPublicSitemap(sqlitePath);
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://center4digitaldemocracy.com/atlas/france");
    expect(urls).toContain("https://center4digitaldemocracy.com/atlas/downloads");
    expect(urls).toContain("https://center4digitaldemocracy.com/");
    expect(urls.some((url) => url.includes("?"))).toBe(false);
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/atlas/search"))).toBe(false);
    expect(urls.some((url) => url.includes("/atlas/france/"))).toBe(false);
    expect(urls.some((url) => url.includes("/elections/"))).toBe(false);
  });

  it("serves the cached sitemap function without a chunk id", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-sitemap-fn-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const db = new DatabaseSync(sqlitePath);
    db.exec(`
      CREATE TABLE derived_country_summary (
        country_id TEXT PRIMARY KEY,
        offices INTEGER NOT NULL,
        events INTEGER NOT NULL,
        result_rows INTEGER NOT NULL
      );
    `);
    db.prepare(
      `INSERT INTO derived_country_summary (country_id, offices, events, result_rows) VALUES ('germany', 22630, 0, 0)`,
    ).run();
    db.close();
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    const entries = await sitemap();
    expect(entries.some((entry) => entry.url === "https://center4digitaldemocracy.com/atlas/germany")).toBe(true);
    expect(entries.some((entry) => entry.url.includes("?"))).toBe(false);
  });
});
