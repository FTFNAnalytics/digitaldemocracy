import { org } from "@/lib/content";
import { OBSERVATORY_NAME, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { DatasetRelease } from "@/schemas/v1/normalized";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ResearchOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: org.shortName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: org.lede,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/atlas/explorer?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function observatoryDatasetJsonLd(release: DatasetRelease) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/electiondatabase#dataset`,
    name: OBSERVATORY_NAME,
    description:
      "Imported subnational election research records published by the Center for Digital Democracy. Remaining research gaps are listed on the site; coverage is not complete.",
    url: `${SITE_URL}/electiondatabase`,
    creator: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
    inLanguage: "en",
    identifier: release.id,
    temporalCoverage: `${release.window.startLabel}/${release.window.endLabel}`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "researchCoverageComplete",
        value: false,
      },
      {
        "@type": "PropertyValue",
        name: "importedCurrentOffices",
        value: release.validatedCounts.currentOffices,
      },
      {
        "@type": "PropertyValue",
        name: "importedHistoricalOffices",
        value: release.validatedCounts.historicalOffices,
      },
      {
        "@type": "PropertyValue",
        name: "importedHistories",
        value: release.validatedCounts.histories,
      },
    ],
  };
}
