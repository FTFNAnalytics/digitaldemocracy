import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { importAlbania } from "../../lib/atlas/albania/import";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import { RESERVED_SLUG_SEGMENTS } from "../../lib/atlas/derive/slug";
import {
  ATLAS_ALIAS_REDIRECT_STATUS,
  aliasCanonicalPath,
  buildSitemapChunks,
  compareSeats,
  countryCanonicalPath,
  cycleListHref,
  filterPlaces,
  filterSeatsByDate,
  jurisdictionDescription,
  jurisdictionFacts,
  jurisdictionJsonLd,
  jurisdictionTitle,
  listJurisdictionSlugPaths,
  loadJurisdictionView,
  resolveJurisdictionPath,
  SEAT_PAGE_SIZE,
  type JurisdictionSeat,
} from "../../lib/atlas/jurisdiction";
import { ATLAS_DERIVED_TAG } from "../../lib/atlas/publication";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import { paginate } from "../../components/observatory/pagination";
import { GET, POST } from "../../app/api/atlas/revalidate/route";
import AtlasJurisdictionPage, { generateMetadata } from "../../app/atlas/[country]/[[...path]]/page";
import { proxy } from "../../proxy";

const repoRoot = path.join(import.meta.dirname, "../..");

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function seat(partial: Partial<JurisdictionSeat> & Pick<JurisdictionSeat, "id" | "name" | "executive">): JurisdictionSeat {
  return {
    officeId: partial.id,
    heldBy: null,
    since: null,
    lastShare: null,
    lastShareUnit: null,
    eventDates: [],
    nextLabel: null,
    nextYear: null,
    nextMonth: null,
    nextDay: null,
    ...partial,
  };
}

describe("jurisdiction route helpers", () => {
  it("reserves seats, elections, people, and search before any place lookup", () => {
    expect([...RESERVED_SLUG_SEGMENTS].sort()).toEqual(["elections", "people", "search", "seats"]);
    for (const segment of ["seats", "elections", "people", "search"]) {
      expect(resolveJurisdictionPath("albania", [segment], path.join(os.tmpdir(), "missing-atlas.sqlite")).status).toBe(
        "reserved",
      );
      expect(resolveJurisdictionPath("albania", ["tirane", segment], path.join(os.tmpdir(), "missing-atlas.sqlite")).status).toBe(
        "reserved",
      );
      expect(resolveJurisdictionPath(segment, undefined, path.join(os.tmpdir(), "missing-atlas.sqlite")).status).toBe(
        "reserved",
      );
    }
    expect(aliasCanonicalPath("offices/some-office", path.join(os.tmpdir(), "missing-atlas.sqlite"))).toBeNull();
    expect(aliasCanonicalPath("elections/some-event", path.join(os.tmpdir(), "missing-atlas.sqlite"))).toBeNull();
  });

  it("builds titles, facts, and honest administrative JSON-LD", () => {
    expect(jurisdictionTitle("Tiranë", "Albania")).toBe("Tiranë · Albania · Election Atlas");
    expect(jurisdictionTitle("Albania", "Albania")).toBe("Albania · Albania · Election Atlas");
    const facts = jurisdictionFacts(
      {
        jurisdictionKey: "country:albania",
        countryId: "albania",
        geographyId: null,
        parentKey: null,
        depth: 0,
        levelLabel: "country",
        name: "Albania",
        slug: "albania",
        slugPath: "albania",
        officeCount: 2,
        eventCount: 0,
        firstEventYear: null,
        lastEventYear: null,
        coverageStatus: "partial",
        ambiguous: 0,
      },
      null,
    );
    expect(facts).toContainEqual({ label: "Elections", value: "0" });
    expect(facts).toContainEqual({ label: "Results span", value: "not supplied" });
    expect(facts).toContainEqual({ label: "Offices with results", value: "not supplied" });
    const description = jurisdictionDescription("Albania", "Albania", "Country", facts);
    expect(description).toContain("Offices: 2");
    expect(description).toContain("not supplied");
    expect(jurisdictionJsonLd("Albania", null)).toEqual({
      "@context": "https://schema.org",
      "@type": "AdministrativeArea",
      name: "Albania",
    });
    expect(jurisdictionJsonLd("Tiranë", "Albania")).toEqual({
      "@context": "https://schema.org",
      "@type": "AdministrativeArea",
      name: "Tiranë",
      containedInPlace: { "@type": "AdministrativeArea", name: "Albania" },
    });
  });

  it("links cycle chips to the election-day page, keeping a deeper place as the scope", () => {
    expect(
      cycleListHref({ contestCount: 1, eventId: "evt-1", isoDate: "2023-05-14", slugPath: "albania/tirane" }),
    ).toBe("/atlas/albania/elections/2023-05-14/tirane");
    expect(cycleListHref({ contestCount: 1, eventId: null, isoDate: "2023-05-14", slugPath: "albania" })).toBe(
      "/atlas/albania/elections/2023-05-14",
    );
    expect(cycleListHref({ contestCount: 4, eventId: "evt-1", isoDate: "2023-05-14", slugPath: "albania/berat" })).toBe(
      "/atlas/albania/elections/2023-05-14/berat",
    );
    expect(
      cycleListHref({ contestCount: 2, eventId: null, isoDate: "2019-06-30", slugPath: "albania/qark/dimal" }),
    ).toBe("/atlas/albania/elections/2019-06-30/qark/dimal");
  });

  it("lists executive seats first and pages them at 50", () => {
    const rows = [
      seat({ id: "b", name: "Council", executive: false }),
      seat({ id: "a", name: "Mayor", executive: true }),
      seat({ id: "c", name: "Assembly", executive: false }),
    ].sort(compareSeats);
    expect(rows.map((row) => row.name)).toEqual(["Mayor", "Assembly", "Council"]);
    const many = Array.from({ length: 51 }, (_, index) =>
      seat({ id: `s-${index}`, name: `Seat ${String(index).padStart(2, "0")}`, executive: index === 50 }),
    ).sort(compareSeats);
    expect(many[0]?.name).toBe("Seat 50");
    const page = paginate(many, { page: "2" }, "page", SEAT_PAGE_SIZE);
    expect(page.items).toHaveLength(1);
    expect(page.pages).toBe(2);
    const dated = filterSeatsByDate(
      [seat({ id: "1", name: "Mayor", executive: true, eventDates: ["2023-05-14"] }), seat({ id: "2", name: "Other", executive: false })],
      "2023-05-14",
    );
    expect(dated.map((row) => row.id)).toEqual(["1"]);
    expect(filterPlaces([{ name: "Tiranë", level: "municipality" }, { name: "Berat", level: "municipality" }], { q: "tir", kind: "" })).toEqual([
      { name: "Tiranë", level: "municipality" },
    ]);
  });

  it("chunks sitemap URLs only after 50,000", () => {
    const single = buildSitemapChunks({
      staticEntries: [{ url: "https://example/atlas" }],
      jurisdictionPaths: ["albania", "albania/tirane"],
      origin: "https://example",
    });
    expect(single).toHaveLength(1);
    expect(single[0]?.map((entry) => entry.url)).toEqual([
      "https://example/atlas",
      "https://example/atlas/albania",
      "https://example/atlas/albania/tirane",
    ]);
    const paths = Array.from({ length: 50_000 }, (_, index) => `c/${index}`);
    const chunks = buildSitemapChunks({
      staticEntries: [{ url: "https://example/a" }],
      jurisdictionPaths: paths,
      origin: "https://example",
      limit: 50_000,
    });
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(50_000);
    expect(chunks[1]).toHaveLength(1);
    expect(chunks[1]?.[0]?.url).toBe("https://example/atlas/c/49999");
  });

  it("keeps office and event routes, and revalidates derived pages by tag", () => {
    expect(readFileSync(path.join(repoRoot, "app/atlas/[country]/[[...path]]/page.tsx"), "utf8")).toMatch(/revalidate = false/);
    expect(readFileSync(path.join(repoRoot, "scripts/atlas/derive.ts"), "utf8")).toContain("revalidateAtlasDerivedTag");
    expect(readFileSync(path.join(repoRoot, "lib/atlas/publish.ts"), "utf8")).toContain("revalidateAtlasDerivedTag");
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).not.toMatch(/source:\s*["']\/electiondatabase/);
    expect(nextConfig).not.toMatch(/permanent:\s*true/);
    expect(ATLAS_DERIVED_TAG).toBe("atlas-derived");
    expect(ATLAS_ALIAS_REDIRECT_STATUS).toBe(301);
  });

  it("hides the revalidate route unless the publication secret matches", async () => {
    expect((await GET()).status).toBe(404);
    const previous = process.env.ATLAS_REVALIDATE_SECRET;
    delete process.env.ATLAS_REVALIDATE_SECRET;
    const missing = await POST(new Request("http://127.0.0.1/api/atlas/revalidate", { method: "POST" }));
    expect(missing.status).toBe(404);
    process.env.ATLAS_REVALIDATE_SECRET = "test-secret";
    const wrong = await POST(
      new Request("http://127.0.0.1/api/atlas/revalidate", {
        method: "POST",
        headers: { authorization: "Bearer other" },
      }),
    );
    expect(wrong.status).toBe(404);
    if (previous === undefined) delete process.env.ATLAS_REVALIDATE_SECRET;
    else process.env.ATLAS_REVALIDATE_SECRET = previous;
  });
});

describe("Albania jurisdiction pages", () => {
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  let dir = "";
  let sqlitePath = "";

  beforeAll(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    dir = mkdtempSync(path.join(os.tmpdir(), "atlas-jurisdiction-"));
    sqlitePath = path.join(dir, "atlas.sqlite");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
      operator: "jurisdiction-test",
    });
  });

  afterAll(() => {
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("resolves the country and a municipality, and 404s an unknown slug", async () => {
    const country = resolveJurisdictionPath("albania", undefined, sqlitePath);
    expect(country.status).toBe("canonical");
    if (country.status !== "canonical") return;
    expect(country.jurisdiction.levelLabel).toBe("country");
    expect(country.jurisdiction.slugPath).toBe("albania");

    const municipality = resolveJurisdictionPath("albania", ["tirane"], sqlitePath);
    expect(municipality.status).toBe("canonical");
    if (municipality.status !== "canonical") return;
    expect(municipality.jurisdiction.levelLabel).toBe("municipality");
    expect(municipality.jurisdiction.name).toMatch(/Tiran/);

    expect(resolveJurisdictionPath("albania", ["not-a-real-place"], sqlitePath).status).toBe("not_found");
    expect(resolveJurisdictionPath("no-such-country", undefined, sqlitePath).status).toBe("not_found");
    expect(countryCanonicalPath("albania", sqlitePath)).toBe("/atlas/albania");

    const paths = listJurisdictionSlugPaths(sqlitePath);
    expect(paths).toContain("albania");
    expect(paths).toContain("albania/tirane");
    const chunks = buildSitemapChunks({
      staticEntries: [{ url: "https://center4digitaldemocracy.com/atlas" }],
      jurisdictionPaths: paths,
      origin: "https://center4digitaldemocracy.com",
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.some((entry) => entry.url === "https://center4digitaldemocracy.com/atlas/albania")).toBe(true);
    expect(chunks[0]?.some((entry) => entry.url === "https://center4digitaldemocracy.com/atlas/albania/tirane")).toBe(true);

    const meta = await generateMetadata({
      params: Promise.resolve({ country: "albania", path: ["tirane"] }),
      searchParams: Promise.resolve({}),
    });
    expect(meta.title).toEqual({ absolute: `${municipality.jurisdiction.name} · Albania · Election Atlas` });
    expect(meta.description).toContain("Offices:");
    expect(meta.alternates?.canonical).toBe("/atlas/albania/tirane");

    const countryHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(countryHtml).toContain('data-atlas-map-slot="true"');
    expect(countryHtml).toContain('data-atlas-map-mount');
    expect(countryHtml).toContain("Map pending boundary review");
    expect(countryHtml).toContain('aria-label="Places"');
    expect(countryHtml).toContain("Filter places");
    expect(countryHtml).toContain("Tiran");
    expect(countryHtml).toContain("No seats at this level");
    expect(countryHtml).toContain("No election cycles");
    expect(countryHtml).toContain("AdministrativeArea");
    expect(countryHtml).not.toContain("containedInPlace");
    expect(countryHtml).not.toContain("data-atlas-upcoming-elections");
    expect(countryHtml).not.toMatch(/prompt b|lineage|namespace/i);

    const filtered = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania" }),
        searchParams: Promise.resolve({ q: "zzzz-no-place" }),
      }),
    );
    expect(filtered).toContain("No places match this filter");
    expect(filtered).not.toContain(">Tiran");

    const placeHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: ["tirane"] }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(placeHtml).toContain("containedInPlace");
    expect(placeHtml).toContain("Albania");
    expect(placeHtml).toContain("not supplied");
    expect(placeHtml).toContain("/atlas/offices/");
    const view = loadJurisdictionView("albania/tirane", sqlitePath);
    expect(view?.seats.length).toBeGreaterThan(0);
    const executive = view?.seats.find((row) => row.executive);
    const other = view?.seats.find((row) => !row.executive);
    if (executive && other) {
      expect(placeHtml.indexOf(executive.name)).toBeGreaterThan(-1);
      expect(placeHtml.indexOf(executive.name)).toBeLessThan(placeHtml.indexOf(other.name));
    }

    await expect(
      AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: ["seats"] }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/);
    await expect(
      AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: ["missing-place"] }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/);

    const countryRedirect = proxy(new NextRequest("http://127.0.0.1:3000/atlas/countries/albania"));
    expect(countryRedirect.status).toBe(301);
    expect(new URL(countryRedirect.headers.get("location") ?? "").pathname).toBe("/atlas/albania");
    const reserved = proxy(new NextRequest("http://127.0.0.1:3000/atlas/albania/search"));
    expect(reserved.status).not.toBe(301);
    const office = proxy(new NextRequest("http://127.0.0.1:3000/atlas/offices/some-office"));
    expect(office.status).not.toBe(301);
    const legacy = proxy(new NextRequest("http://127.0.0.1:3000/electiondatabase/countries/albania"));
    expect(legacy.status).not.toBe(301);
  });

  it("resolves a region path and 301s a renamed slug", async () => {
    const db = openAtlasDatabase(sqlitePath);
    let parentSlug = "";
    let childPath = "";
    try {
      const tirane = db
        .prepare(
          `SELECT geography_id FROM derived_jurisdiction WHERE country_id = 'albania' AND slug_path = 'albania/tirane'`,
        )
        .get();
      expect(tirane?.geography_id).toBeTruthy();
      db.prepare(
        `INSERT INTO geography (
           country_id, geography_id, name, parent_geography_id, effective_from_label, effective_to_label,
           lineage_id, release_id, raw_json
         )
         SELECT country_id, 'ov04-region', 'Fixture region', NULL, NULL, NULL, lineage_id, release_id, '{}'
         FROM geography WHERE country_id = 'albania' LIMIT 1`,
      ).run();
      db.prepare(
        `UPDATE geography SET parent_geography_id = 'ov04-region' WHERE country_id = 'albania' AND geography_id = ?`,
      ).run(String(tirane?.geography_id));
      deriveAtlas(db);
      const region = db
        .prepare(`SELECT slug_path, level_label FROM derived_jurisdiction WHERE geography_id = 'ov04-region'`)
        .get();
      const child = db
        .prepare(
          `SELECT slug_path, level_label FROM derived_jurisdiction WHERE country_id = 'albania' AND geography_id = ?`,
        )
        .get(String(tirane?.geography_id));
      parentSlug = String(region?.slug_path);
      childPath = String(child?.slug_path);
      expect(region?.level_label).toBe("region");
      expect(child?.level_label).toBe("municipality");
      expect(childPath.startsWith(`${parentSlug}/`)).toBe(true);
    } finally {
      db.close();
    }

    const regionHit = resolveJurisdictionPath("albania", parentSlug.split("/").slice(1), sqlitePath);
    expect(regionHit.status).toBe("canonical");
    if (regionHit.status === "canonical") expect(regionHit.jurisdiction.levelLabel).toBe("region");

    const childHit = resolveJurisdictionPath("albania", childPath.split("/").slice(1), sqlitePath);
    expect(childHit.status).toBe("canonical");
    if (childHit.status === "canonical") expect(childHit.jurisdiction.levelLabel).toBe("municipality");

    const alias = resolveJurisdictionPath("albania", ["tirane"], sqlitePath);
    expect(alias.status).toBe("alias");
    if (alias.status === "alias") expect(alias.canonicalPath).toBe(`/atlas/${childPath}`);

    const response = proxy(new NextRequest("http://127.0.0.1:3000/atlas/albania/tirane"));
    expect(response.status).toBe(301);
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe(`/atlas/${childPath}`);

    await expect(
      AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: ["tirane"] }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(/NEXT_REDIRECT/);

    const regionHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "albania", path: parentSlug.split("/").slice(1) }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(regionHtml).toContain("Region");
    expect(regionHtml).toContain("Tiran");
    expect(regionHtml).toContain('data-atlas-map-mount');
  });
});
