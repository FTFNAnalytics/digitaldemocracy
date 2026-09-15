import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { observatoryDatasetJsonLd, organizationJsonLd } from "@/lib/json-ld";
import {
  SITE_URL,
  STATIC_SITEMAP_PATHS,
  countryPageMeta,
  eventPageMeta,
  marketingHashSections,
  officePageMeta,
  pageMeta,
  staticPageSeo,
} from "@/lib/seo";
import type { CountryRecord, ElectionEvent, OfficeRecord } from "@/schemas/v1/normalized";

describe("seo helpers", () => {
  it("uses the canonical production origin", () => {
    expect(SITE_URL).toBe("https://center4digitaldemocracy.com");
  });

  it("gives every static route a unique title, description, canonical, and OG image", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const paths = new Set<string>();
    const images = new Set<string>();
    for (const page of Object.values(staticPageSeo)) {
      const meta = pageMeta(page);
      expect(meta.description).toBe(page.description);
      expect(meta.alternates?.canonical).toBe(page.path);
      const ogImages = meta.openGraph?.images;
      expect(Array.isArray(ogImages) && ogImages.length).toBeTruthy();
      titles.add(page.title);
      descriptions.add(page.description);
      paths.add(page.path);
      images.add(page.image);
    }
    expect(titles.size).toBe(Object.keys(staticPageSeo).length);
    expect(descriptions.size).toBe(Object.keys(staticPageSeo).length);
    expect(paths.size).toBe(Object.keys(staticPageSeo).length);
    expect(images.size).toBe(Object.keys(staticPageSeo).length);
  });

  it("covers observatory indexes without exploding into office URLs", () => {
    expect(STATIC_SITEMAP_PATHS).toContain("/");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase/explorer");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase/calendar");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase/methodology");
    expect(STATIC_SITEMAP_PATHS).not.toContain("/electiondatabase/offices");
    expect(STATIC_SITEMAP_PATHS).not.toContain("/electiondatabase/elections");
  });

  it("documents marketing hash sections with committed OG assets", () => {
    for (const section of marketingHashSections) {
      expect(existsSync(`public/og/${section.image}.png`)).toBe(true);
    }
  });

  it("names Brazil on a country page title and description", () => {
    const country: CountryRecord = {
      id: "brazil",
      regionId: "south-america",
      names: { official: "Brazil", short: "Brazil", aliases: [] },
      kind: "sovereign_country",
      coverageStatus: "partial",
      notes: "Imported research; coverage is not complete.",
    };
    const meta = countryPageMeta(country);
    expect(JSON.stringify(meta.title)).toContain("Brazil");
    expect(meta.description).toContain("Brazil");
    expect(meta.alternates?.canonical).toBe("/electiondatabase/countries/brazil");
  });

  it("distinguishes office and election titles", () => {
    const office: OfficeRecord = {
      id: "BR-P-1",
      countryId: "brazil",
      geographyId: "br-geo",
      names: { official: "Governor of Acre", short: "Acre governor" },
      tier: "regional",
      officeType: "governor",
      status: "current",
      registryQualified: null,
      selectedHistoryKeys: [],
      allHistoryKeys: [],
      sourceIds: [],
    };
    const event: ElectionEvent = {
      id: "evt-1",
      officeId: office.id,
      countryId: "brazil",
      historyKey: "h1",
      kind: "ordinary",
      selectedHistoryRole: "none",
      electoralSystem: "unknown",
      comparability: "unknown",
      legalOutcome: "unknown",
      date: { precision: "year", certainty: "expected", year: 2026, label: "2026" },
      ballotBasis: "unknown",
      voteShareUnit: "percent_0_100",
      proceedingIds: [],
      resultRows: [],
      sourceIds: [],
    };
    const officeMeta = officePageMeta(office);
    const eventMeta = eventPageMeta(event, office);
    expect(JSON.stringify(officeMeta.title)).toContain("Governor of Acre");
    expect(JSON.stringify(eventMeta.title)).toContain("2026");
    expect(officeMeta.title).not.toEqual(eventMeta.title);
  });
});

describe("json-ld", () => {
  it("does not claim research coverage is complete", () => {
    const org = organizationJsonLd();
    expect(org.url).toBe(SITE_URL);
    const dataset = observatoryDatasetJsonLd({
      id: "test-release",
      schemaVersion: "1.1.0",
      methodVersion: "1",
      provenance: { kind: "latin_america_release", packageName: null, notes: "" },
      window: {
        startLabel: "8 September 2026",
        endLabel: "8 March 2028",
        inclusive: true,
        source: "imported_release",
      },
      snapshotLabel: null,
      retrievalRangeLabel: null,
      validatedCounts: {
        currentOffices: 1,
        historicalOffices: 0,
        histories: 0,
        resultRows: 0,
        briefings: 0,
        recomputedFromNormalizedRecords: true,
      },
      researchCoverageComplete: false,
      artifactRefs: [],
    });
    expect(dataset.additionalProperty).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "researchCoverageComplete",
          value: false,
        }),
      ]),
    );
  });
});
