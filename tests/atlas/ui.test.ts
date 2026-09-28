import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...props }, children),
  };
});
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAlderney } from "../../lib/atlas/alderney/import";
import { importAndorra } from "../../lib/atlas/andorra/import";
import { importArmenia } from "../../lib/atlas/armenia/import";
import { importBosnia } from "../../lib/atlas/bosnia-and-herzegovina/import";
import { importNewZealand } from "../../lib/atlas/continuity/nz";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { loadAtlasCatalog, getAtlasCountry, listAtlasEvents, listAtlasOffices, listAtlasRegionalCalendar, listAtlasExplorerOffices, lookupAtlasEvent, lookupAtlasOffice } from "../../lib/atlas/read";
import { parseAtlasExplorerFilters, serializeAtlasExplorerFilters, emptyAtlasExplorerFilters } from "../../lib/atlas/filters";
import { importAlbania } from "../../lib/atlas/albania/import";
import { DIMAL_MAYOR_ID } from "../../lib/atlas/albania/identity";
import { AmbiguousIdentifier } from "../../components/atlas/ambiguous";
import { Breadcrumb } from "../../components/atlas/breadcrumb";
import { CoverageBar, CoverageChip } from "../../components/atlas/coverage";
import { EmptyState } from "../../components/atlas/empty-state";
import { JurisdictionTemplate } from "../../components/atlas/jurisdiction-template";
import { PageHeader } from "../../components/atlas/page-header";
import { ProvenanceFooter } from "../../components/atlas/provenance-footer";
import { RecordDetails } from "../../components/atlas/record-details";
import { ResultsTable } from "../../components/atlas/results-table";
import type { AtlasCoverageSnapshot } from "../../components/atlas/types";
import AtlasIndexPage from "../../app/atlas/page";
import AtlasCountryPage from "../../app/atlas/countries/[countryId]/page";
import AtlasJurisdictionPage from "../../app/atlas/[country]/[[...path]]/page";
import { getRedirectStatusCodeFromError, getURLFromRedirectError } from "next/dist/client/components/redirect";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import AtlasOfficePage from "../../app/atlas/offices/[officeId]/page";
import AtlasEventPage, { FoundEventPage } from "../../app/atlas/elections/[eventId]/page";
import ReadingKitPage, { metadata as readingKitMetadata } from "../../app/atlas/reading-kit/page";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Atlas SQLite UI catalog", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("renders a missing-database empty state instead of throwing", () => {
    const missing = path.join(os.tmpdir(), "atlas-missing-ui.sqlite");
    const catalog = loadAtlasCatalog(missing);
    expect(catalog.status).toBe("missing");
    expect(catalog.countries).toEqual([]);
    expect(catalog.message).toMatch(/No Atlas SQLite file/);
    expect(listAtlasExplorerOffices({ q: "westport", country: "", tier: "", region: "" }, missing)).toEqual([]);
    expect(lookupAtlasEvent("next-154f7bfa6ea99d09c5a47d7c", missing)).toEqual({ status: "missing" });
    expect(lookupAtlasOffice("NZ-BULLER-WESTPORT-2026", missing)).toEqual({ status: "missing" });
  });

  it("renders an empty-database state after migrate with no import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-empty-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("empty");
    expect(catalog.totals.offices).toBe(0);
    expect(catalog.message).toMatch(/no published lineages/);
  });

  it("lists New Zealand offices from an imported Atlas file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-nz-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importNewZealand({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["new-zealand"]);
    expect(catalog.countries[0]?.officeCount).toBe(4);
    const country = getAtlasCountry("new-zealand", sqlitePath);
    expect(country?.name).toBe("New Zealand");
    const offices = listAtlasOffices("new-zealand", sqlitePath);
    expect(offices).toHaveLength(4);
    expect(offices.some((row) => row.officeId === "NZ-BULLER-WESTPORT-2026")).toBe(true);
    expect(getAtlasCountry("argentina", sqlitePath)).toBeNull();
    expect(lookupAtlasOffice("NZ-BULLER-WESTPORT-2026", sqlitePath).status).toBe("found");
    const event = lookupAtlasEvent("next-154f7bfa6ea99d09c5a47d7c", sqlitePath);
    expect(event.status).toBe("found");
    if (event.status === "found") {
      expect(event.record.officeId).toBe("NZ-BULLER-WESTPORT-2026");
      expect(event.record.selectedHistoryRole).toBe("none");
    }
    expect(lookupAtlasEvent("missing-event-id", sqlitePath)).toEqual({ status: "missing" });
    expect(lookupAtlasOffice("missing-office-id", sqlitePath)).toEqual({ status: "missing" });

    const explorer = listAtlasExplorerOffices(emptyAtlasExplorerFilters(), sqlitePath);
    expect(explorer).toHaveLength(4);
    expect(explorer.every((row) => row.regionId === "oceania")).toBe(true);
    expect(listAtlasExplorerOffices({ q: "westport", country: "", tier: "", region: "" }, sqlitePath).map((row) => row.officeId)).toEqual([
      "NZ-BULLER-WESTPORT-2026",
    ]);
    expect(listAtlasExplorerOffices({ q: "", country: "new-zealand", tier: "municipal", region: "" }, sqlitePath)).toHaveLength(3);
    expect(listAtlasExplorerOffices({ q: "", country: "", tier: "", region: "europe" }, sqlitePath)).toEqual([]);
  });

  it("shows Andorra's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-andorra-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAndorra({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["andorra"]);
    expect(catalog.countries[0]?.officeCount).toBe(7);
    const country = getAtlasCountry("andorra", sqlitePath);
    expect(country?.name).toBe("Andorra");
    expect(listAtlasOffices("andorra", sqlitePath)).toHaveLength(7);
    expect(listAtlasExplorerOffices({ q: "", country: "andorra", tier: "", region: "europe" }, sqlitePath)).toHaveLength(7);
    const regional = listAtlasRegionalCalendar("andorra", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe("No regional tier in this package; seven municipal councils.");
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Alderney's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-alderney-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAlderney({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["alderney"]);
    expect(catalog.countries[0]?.officeCount).toBe(2);
    const country = getAtlasCountry("alderney", sqlitePath);
    expect(country?.name).toBe("Alderney");
    expect(country?.polityKind).toBe("territory");
    const offices = listAtlasOffices("alderney", sqlitePath);
    expect(offices).toHaveLength(2);
    expect(offices.every((row) => row.tier === "other")).toBe(true);
    expect(offices.find((row) => row.officeId === "GG-ALD-STATES")?.nextCertainty).toBe("conditional");
    expect(offices.find((row) => row.officeId === "GG-ALD-PLEB")?.nextCertainty).toBe("conditional");
    const regional = listAtlasRegionalCalendar("alderney", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe(
      "No regional tier in this package; two territorial office/contest records classified other.",
    );
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Armenia's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-armenia-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importArmenia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["armenia"]);
    expect(catalog.countries[0]?.officeCount).toBe(71);
    const country = getAtlasCountry("armenia", sqlitePath);
    expect(country?.name).toBe("Armenia");
    expect(country?.polityKind).toBe("sovereign_country");
    const offices = listAtlasOffices("armenia", sqlitePath);
    expect(offices).toHaveLength(71);
    expect(offices.every((row) => row.tier === "municipal")).toBe(true);
    expect(offices.find((row) => row.officeId === "AM-AKHURYAN-C")?.nextCertainty).toBe("called");
    expect(lookupAtlasOffice("AM-AKHURYAN-C", sqlitePath).status).toBe("found");
    expect(offices.find((row) => row.officeId === "AM-VEDI-C")?.nextCertainty).toBeNull();
    const regional = listAtlasRegionalCalendar("armenia", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe(
      "No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.",
    );
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Bosnia and Herzegovina's populated regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bosnia-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importBosnia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["bosnia-and-herzegovina"]);
    expect(catalog.countries[0]?.officeCount).toBe(346);
    const country = getAtlasCountry("bosnia-and-herzegovina", sqlitePath);
    expect(country?.name).toBe("Bosnia and Herzegovina");
    expect(country?.polityKind).toBe("sovereign_country");
    const offices = listAtlasOffices("bosnia-and-herzegovina", sqlitePath);
    expect(offices).toHaveLength(346);
    expect(offices.filter((row) => row.tier === "regional")).toHaveLength(15);
    expect(offices.filter((row) => row.tier === "municipal")).toHaveLength(327);
    expect(offices.filter((row) => row.tier === "national_context")).toHaveLength(4);
    expect(offices.find((row) => row.officeId === "BA-REG-CANTON-05")?.nextCertainty).toBeNull();
    expect(offices.find((row) => row.officeId === "BA-REG-RS-PRES")?.officeType).toBe("entity_direct_executive");
    expect(offices.find((row) => row.officeId === "BA-REG-RS-NA")?.officeType).toBe("entity_legislature");
    expect(lookupAtlasOffice("BA-REG-CANTON-05", sqlitePath).status).toBe("found");
    expect(offices.some((row) => row.officeId === "BA-LOC-BRCKO-ASSEMBLY")).toBe(true);
    expect(offices.some((row) => /BRCKO-MAYOR|Mayor of Brčko|Mayor of Brcko/i.test(`${row.officeId} ${row.name}`))).toBe(false);
    const regional = listAtlasRegionalCalendar("bosnia-and-herzegovina", sqlitePath);
    expect(regional.offices).toHaveLength(15);
    expect(regional.count).toBe(15);
    expect(regional.label).toContain("15 regional offices");
    expect(regional.label).toContain("BA-AW-G01");
    expect(regional.label).toContain("not invented");
    expect(regional.denominatorKnown).toBe(false);
    expect(listAtlasExplorerOffices({ q: "", country: "bosnia-and-herzegovina", tier: "regional", region: "europe" }, sqlitePath)).toHaveLength(15);
    expect(listAtlasExplorerOffices({ q: "", country: "bosnia-and-herzegovina", tier: "municipal", region: "" }, sqlitePath).length).toBe(327);
  });
});

describe("Atlas explorer URL filters", () => {
  it("round-trips q, country, tier, and region", () => {
    const parsed = parseAtlasExplorerFilters({
      q: "westport",
      country: "new-zealand",
      tier: "municipal",
      region: "oceania",
    });
    const params = serializeAtlasExplorerFilters(parsed);
    expect(params.get("q")).toBe("westport");
    expect(params.get("country")).toBe("new-zealand");
    expect(params.get("tier")).toBe("municipal");
    expect(params.get("region")).toBe("oceania");
  });

  it("ignores empty defaults", () => {
    const parsed = parseAtlasExplorerFilters({});
    expect(parsed).toEqual({ q: "", country: "", tier: "", region: "" });
    expect(serializeAtlasExplorerFilters(parsed).toString()).toBe("");
  });
});

const IMPORT_VOCAB = /prompt b|lineage|namespace/i;

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function outsideRecordDetails(html: string): string {
  return html.replace(/<details\b[^>]*data-atlas-record-details="true"[^>]*>[\s\S]*?<\/details>/gi, "");
}

function assertReaderCopy(html: string): void {
  const visible = outsideRecordDetails(html);
  expect(visible).not.toMatch(IMPORT_VOCAB);
  expect(html.includes("data-atlas-record-details") || !IMPORT_VOCAB.test(html)).toBe(true);
}

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...sourceFiles(full));
    else if (entry.endsWith(".tsx")) found.push(full);
  }
  return found;
}

describe("Atlas reading surface", () => {
  const recorded: AtlasCoverageSnapshot = {
    offices: 4,
    officesWithAnyEvent: 3,
    officesWithResults: 2,
    eventsTotal: 6,
    eventsWithResults: 4,
    notSuppliedNextDates: 1,
    latestSnapshotLabel: "fixture-snapshot",
  };

  it("keeps colour hexes out of Atlas components and pages", () => {
    const files = [...sourceFiles(path.join(repoRoot, "components/atlas")), ...sourceFiles(path.join(repoRoot, "app/atlas"))];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    }
  });

  it("renders breadcrumb, page header, and empty states", () => {
    const crumbs = markup(
      createElement(Breadcrumb, {
        items: [
          { label: "World", href: "/atlas" },
          { label: "Albania", href: "/atlas/countries/albania" },
          { label: "Tiranë" },
        ],
      }),
    );
    expect(crumbs).toContain('aria-label="Breadcrumb"');
    expect(crumbs).toContain("World");
    expect(crumbs).toContain("›");
    expect(crumbs).toContain('aria-current="page"');

    const header = markup(
      createElement(PageHeader, {
        name: "Fixture place",
        level: "Municipality",
        facts: [{ label: "Offices", value: "2" }],
        nextElection: { label: "fixture date" },
      }),
    );
    expect(header).toContain("Fixture place");
    expect(header).toContain("Municipality");
    expect(header).toContain("border-atlas-amber");
    expect(header).toContain("Next election fixture date");

    const missingNext = markup(createElement(PageHeader, { name: "Open seat", nextElection: null }));
    expect(missingNext).toContain("Next election not supplied");
    expect(missingNext).not.toContain("border-atlas-amber");

    for (const variant of ["not_supplied", "queued", "withheld", "conflicting"] as const) {
      const html = markup(createElement(EmptyState, { variant }));
      expect(html).toContain(`data-atlas-empty="${variant}"`);
    }
    expect(markup(createElement(EmptyState, { variant: "queued" }))).toContain("Not yet ingested");
    expect(markup(createElement(EmptyState, { variant: "withheld" }))).toContain("Withheld");
  });

  it("renders the jurisdiction template with a map slot, list twin, and cycle chips", () => {
    const places = Array.from({ length: 13 }, (_, index) => ({
      id: `place-${index}`,
      name: `Fixture place ${index + 1}`,
      href: "/atlas",
      level: index % 2 === 0 ? "municipality" : "borough",
      kind: index % 2 === 0 ? "municipality" : "borough",
      coverage: index % 3 === 0 ? { ...recorded, officesWithResults: 0, eventsWithResults: 0 } : recorded,
    }));
    const html = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [
          { label: "World", href: "/atlas" },
          { label: "Fixture country", href: "/atlas" },
          { label: "Fixture region" },
        ],
        name: "Fixture region",
        level: "Region",
        facts: [{ label: "Places", value: "13" }],
        nextElection: null,
        places,
        seats: [
          { id: "seat-1", name: "Fixture seat", href: "/atlas", heldBy: null, since: null, lastResult: "Fixture result" },
        ],
        cycles: [
          { id: "cycle-a", year: "Year A", href: "/atlas", hasResults: true, label: "with results" },
          { id: "cycle-b", year: "Year B", href: "/atlas", hasResults: false, label: "without results" },
        ],
      }),
    );
    expect(html).toContain('data-atlas-map-slot="true"');
    expect(html).toContain("Map pending boundary review");
    expect(html).toContain('aria-label="Places"');
    expect(html).toContain("Filter places");
    expect(html).toContain("Held by");
    expect(html).toContain("not supplied");
    expect(html).toContain("Fixture result");
    expect(html).toContain('data-atlas-cycle="none"');
    expect(html).toContain("No results yet");
    expect(html).toContain("Results on file");
    expect(html).toContain("<caption");

    const shortList = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [{ label: "World" }],
        name: "Small",
        places: places.slice(0, 2),
        seats: [],
        cycles: [],
      }),
    );
    expect(shortList).not.toContain("Filter places");
    expect(shortList).toContain("No seats at this level");
    expect(shortList).toContain("No election cycles");
  });

  it("scales result bars to the elected row and keeps a caption", () => {
    const html = markup(
      createElement(ResultsTable, {
        caption: "Fixture results",
        shareUnit: "percent_0_100",
        rows: [
          {
            id: "a",
            label: "Fixture candidate A",
            partyLabel: "List A",
            votes: 400,
            votesStatus: "recorded",
            share: 40,
            shareStatus: "recorded",
            seats: 1,
            seatsStatus: "recorded",
            elected: true,
            evidenceStatus: "recorded",
          },
          {
            id: "b",
            label: "Fixture candidate B",
            partyLabel: "List B",
            votes: 200,
            votesStatus: "recorded",
            share: 20,
            shareStatus: "recorded",
            seats: null,
            seatsStatus: "unknown",
            elected: false,
            evidenceStatus: "recorded",
          },
          {
            id: "c",
            label: null,
            partyLabel: null,
            votes: null,
            votesStatus: "unknown",
            share: 10,
            shareStatus: "recorded",
            seats: null,
            seatsStatus: "unknown",
            elected: false,
            evidenceStatus: "disputed",
          },
        ],
      }),
    );
    expect(html).toContain("<caption");
    expect(html).toContain("Fixture results");
    expect(html).toContain(">Elected<");
    expect(html).toContain('data-atlas-bar="accent"');
    expect(html).toContain('data-atlas-bar="runner-up"');
    expect(html).toContain('data-atlas-bar="other"');
    expect(html).toContain("width:100%");
    expect(html).toContain("width:50%");
    expect(html).toContain("width:25%");
    expect(html).toContain("not supplied");
    expect(html).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });

  it("renders coverage, provenance, and collapsed record details", () => {
    const chip = markup(createElement(CoverageChip, { coverage: recorded }));
    expect(chip).toContain("Partial results");
    const queued = markup(
      createElement(CoverageChip, {
        coverage: { ...recorded, officesWithResults: 0, eventsWithResults: 0 },
      }),
    );
    expect(queued).toContain("Not yet ingested");
    const bar = markup(createElement(CoverageBar, { coverage: null }));
    expect(bar).toContain("Not supplied");
    expect(bar).not.toContain('role="meter"');
    const meter = markup(createElement(CoverageBar, { coverage: recorded }));
    expect(meter).toContain('role="meter"');
    expect(meter).toContain("2 of 4 offices with results");

    const source = markup(
      createElement(ProvenanceFooter, {
        publisher: null,
        title: "Fixture title",
        url: null,
        snapshotLabel: null,
        evidenceGrade: null,
        recordId: "fixture-record",
      }),
    );
    expect(source).toContain("Source");
    expect(source).toContain("not supplied");
    expect(source).toContain("Report a correction");
    expect(source).toContain("template=research-correction.md");
    expect(source).toContain("fixture-record");

    const details = markup(
      createElement(
        RecordDetails,
        {
          officeId: "office-1",
          idNamespace: "ns-1",
          lineageId: "country-package-albania",
          releaseId: null,
          historyKey: "hist-1",
        },
        "Prompt B uniqueness stays here.",
      ),
    );
    expect(details.startsWith("<details")).toBe(true);
    expect(details).not.toContain(" open");
    expect(details).toContain("id_namespace");
    expect(details).toContain("lineage_id");
    expect(details).toContain("history_key");
    expect(details).toContain("Prompt B uniqueness stays here.");
    expect(outsideRecordDetails(details)).not.toMatch(IMPORT_VOCAB);

    const ambiguous = markup(createElement(AmbiguousIdentifier, { kind: "office", namespaces: ["ns-a", "ns-b"] }));
    expect(ambiguous).toContain("More than one record matches");
    expect(outsideRecordDetails(ambiguous)).not.toMatch(IMPORT_VOCAB);
    expect(ambiguous).toContain("Prompt B");
  });

  it("serves the reading kit only when ATLAS_KIT=1 and marks it noindex", async () => {
    expect(readingKitMetadata.robots).toEqual({ index: false, follow: false });
    const proxy = readFileSync(path.join(repoRoot, "proxy.ts"), "utf8");
    expect(proxy).toContain('pathname === "/atlas/_kit"');
    expect(proxy).toContain('rewriteInternally(request, "/atlas/reading-kit")');
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).not.toMatch(/destination:\s*["']\/atlas/);

    const previous = process.env.ATLAS_KIT;
    delete process.env.ATLAS_KIT;
    expect(() => ReadingKitPage()).toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/);
    process.env.ATLAS_KIT = "1";
    const html = markup(await ReadingKitPage());
    expect(html).toContain("Fixture candidate A");
    expect(html).toContain("Map pending boundary review");
    expect(html).toContain("Not yet ingested");
    expect(html).toContain("Withheld");
    assertReaderCopy(html);
    if (previous === undefined) delete process.env.ATLAS_KIT;
    else process.env.ATLAS_KIT = previous;
  });

  it("keeps import vocabulary inside record details on Albania office and event pages", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-reading-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const previous = process.env.ATLAS_SQLITE_PATH;
    const previousFixtures = process.env.OBSERVATORY_FIXTURES;
    delete process.env.OBSERVATORY_FIXTURES;
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    try {
      importAlbania({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        operator: "atlas-reading-surface",
      });

      const indexHtml = markup(await AtlasIndexPage());
      let countryRedirect: unknown;
      try {
        await AtlasCountryPage({
          params: Promise.resolve({ countryId: "albania" }),
          searchParams: Promise.resolve({}),
        });
      } catch (error) {
        countryRedirect = error;
      }
      if (!isRedirectError(countryRedirect)) {
        throw new Error("expected the country alias to redirect");
      }
      expect(getURLFromRedirectError(countryRedirect)).toBe("/atlas/albania");
      expect(getRedirectStatusCodeFromError(countryRedirect)).toBe(308);
      const countryHtml = markup(
        await AtlasJurisdictionPage({
          params: Promise.resolve({ country: "albania" }),
          searchParams: Promise.resolve({}),
        }),
      );
      const officeHtml = markup(
        await AtlasOfficePage({ params: Promise.resolve({ officeId: DIMAL_MAYOR_ID }) }),
      );
      assertReaderCopy(indexHtml);
      assertReaderCopy(countryHtml);
      assertReaderCopy(officeHtml);
      expect(officeHtml).toContain("Not yet ingested");
      expect(officeHtml).toContain("Record details");
      expect(indexHtml).toContain("Europe first");
      expect(countryHtml).toContain("Albania");

      const office = lookupAtlasOffice(DIMAL_MAYOR_ID, sqlitePath);
      expect(office.status).toBe("found");
      if (office.status !== "found") return;
      expect(listAtlasEvents(DIMAL_MAYOR_ID, sqlitePath)).toEqual([]);
      const country = getAtlasCountry("albania", sqlitePath);
      const catalog = loadAtlasCatalog(sqlitePath);
      const publication = catalog.lineages.find((row) => row.lineageId === office.record.lineageId);
      const eventHtml = markup(
        createElement(FoundEventPage, {
          event: {
            eventId: office.record.officeId,
            historyKey: "",
            officeId: office.record.officeId,
            eventKind: "ordinary",
            selectedHistoryRole: "none",
            legalOutcome: "unknown",
            electoralSystem: null,
            ballotBasis: "",
            dateLabel: null,
            datePrecision: null,
            dateYear: null,
            resultCount: 0,
            idNamespace: office.record.idNamespace,
            countryId: office.record.countryId,
            countryName: country?.name ?? null,
            officeName: office.record.name,
            shareUnit: "",
            comparability: null,
            recordState: "",
          },
          results: [],
          proceedings: [],
          snapshotLabel: publication?.snapshotLabel ?? null,
          releaseId: publication?.releaseId ?? null,
          lineageId: office.record.lineageId,
          countryName: country?.name ?? null,
        }),
      );
      assertReaderCopy(eventHtml);
      expect(eventHtml).toContain("Results were not supplied");
      expect(eventHtml).toContain("Record details");
      expect(eventHtml).toContain(office.record.name);

      await expect(AtlasEventPage({ params: Promise.resolve({ eventId: "missing-albania-event" }) })).rejects.toThrow(
        /404|NEXT_HTTP_ERROR_FALLBACK/,
      );
    } finally {
      if (previous === undefined) delete process.env.ATLAS_SQLITE_PATH;
      else process.env.ATLAS_SQLITE_PATH = previous;
      if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
      else process.env.OBSERVATORY_FIXTURES = previousFixtures;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
