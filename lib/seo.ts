import type { Metadata } from "next";
import type {
  CountryRecord,
  CoverageStatus,
  ElectionEvent,
  OfficeRecord,
} from "@/schemas/v1/normalized";
import { formatResearchDate } from "@/lib/observatory/dates";
import { eventKindLabel } from "@/lib/observatory/format";
import { obsRoutes } from "@/lib/observatory/routes";

export const SITE_URL = "https://center4digitaldemocracy.com";
export const SITE_NAME = "Center for Digital Democracy";
export const OBSERVATORY_NAME = "Subnational Election Observatory";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}

export function ogAssetPath(slug: string): string {
  return `/og/${slug}.png`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image: string;
  keywords?: string[];
  /** When true, skip the layout title template. */
  absoluteTitle?: boolean;
  ogTitle?: string;
};

export function pageMeta({
  title,
  description,
  path,
  image,
  keywords,
  absoluteTitle = false,
  ogTitle,
}: PageMetaInput): Metadata {
  const socialTitle = ogTitle ?? title;
  const imagePath = ogAssetPath(image);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: socialTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imagePath],
    },
  };
}

function coveragePhrase(status: CoverageStatus): string {
  return status.replaceAll("_", " ");
}

/**
 * Marketing homepage hashes are not distinct crawlable URLs. Branded OG
 * still lives under `public/og/` so the visual system is ready if those
 * sections become standalone routes.
 */
export const marketingHashSections = [
  { hash: "#home", title: "Home", image: "home" },
  { hash: "#about", title: "About", image: "about" },
  { hash: "#research", title: "Research", image: "research" },
  { hash: "#initiatives", title: "Initiatives", image: "initiatives" },
  { hash: "#events", title: "Events", image: "events" },
  { hash: "#connect", title: "Connect", image: "connect" },
] as const;

export const staticPageSeo = {
  home: {
    title: SITE_NAME,
    description:
      "Independent research and policy design at the intersection of digital platforms, data rights, civic AI, and election integrity.",
    path: "/",
    image: "home",
    absoluteTitle: true,
    keywords: [
      "digital democracy",
      "tech policy",
      "civic AI",
      "election integrity",
      "platform governance",
      "data rights",
    ],
  },
  observatory: {
    title: `${OBSERVATORY_NAME} · ${SITE_NAME}`,
    description:
      "Searchable subnational election research from the Center for Digital Democracy. Explore imported Latin America records, original evidence, and remaining research gaps. Coverage is not complete.",
    path: obsRoutes.home,
    image: "observatory",
    absoluteTitle: true,
    keywords: [
      "subnational elections",
      "election research",
      "Latin America elections",
    ],
  },
  observatoryAbout: {
    title: `About the observatory · ${OBSERVATORY_NAME}`,
    description:
      "The Subnational Election Observatory is a public research product of the Center for Digital Democracy. It makes subnational election research searchable, comparable, and downloadable.",
    path: obsRoutes.about,
    image: "observatory-about",
    absoluteTitle: true,
  },
  regions: {
    title: `Regions · ${OBSERVATORY_NAME}`,
    description:
      "Regional coverage in the Subnational Election Observatory. See which datasets are available, partial, screened out, or not yet supplied. South America is the default landing region.",
    path: obsRoutes.regions,
    image: "regions",
    absoluteTitle: true,
  },
  explorer: {
    title: `Election explorer · ${OBSERVATORY_NAME}`,
    description:
      "Filter subnational offices by region, country, tier, office type, date certainty, evidence status, and metric review. Filters persist in the URL so a view can be shared.",
    path: obsRoutes.explorer,
    image: "explorer",
    absoluteTitle: true,
  },
  calendar: {
    title: `Election calendar · ${OBSERVATORY_NAME}`,
    description:
      "Upcoming subnational election dates in the imported research window, including partial and conditional dates labelled as such.",
    path: obsRoutes.calendar,
    image: "calendar",
    absoluteTitle: true,
  },
  compare: {
    title: `Compare offices · ${OBSERVATORY_NAME}`,
    description:
      "Compare two to four subnational offices using imported election dates, histories, and qualified metrics. Incompatible comparisons are explained.",
    path: obsRoutes.compare,
    image: "compare",
    absoluteTitle: true,
  },
  methodology: {
    title: `Methodology · ${OBSERVATORY_NAME}`,
    description:
      "Metric formulas, eligibility, ballot comparability, event selection, geographic bridges, polling limits, and status definitions used by the Subnational Election Observatory.",
    path: obsRoutes.methodology,
    image: "methodology",
    absoluteTitle: true,
  },
  polling: {
    title: `Polling · ${OBSERVATORY_NAME}`,
    description:
      "National context and local polls in the imported release, with fieldwork dates, pollster, sample, and methodology when those fields were supplied.",
    path: obsRoutes.polling,
    image: "polling",
    absoluteTitle: true,
  },
  coverage: {
    title: `Coverage · ${OBSERVATORY_NAME}`,
    description:
      "Country table and office-level completion queue for the Subnational Election Observatory, including missing returns, registry gaps, and unresolved events.",
    path: obsRoutes.coverage,
    image: "coverage",
    absoluteTitle: true,
  },
  sources: {
    title: `Sources · ${OBSERVATORY_NAME}`,
    description:
      "Searchable evidence catalogue for imported subnational election research: publisher, title, dates, and records supported.",
    path: obsRoutes.sources,
    image: "sources",
    absoluteTitle: true,
  },
  downloads: {
    title: `Downloads · ${OBSERVATORY_NAME}`,
    description:
      "Download country workbooks, briefings, structured exports, and release artifacts from the Subnational Election Observatory.",
    path: obsRoutes.downloads,
    image: "downloads",
    absoluteTitle: true,
  },
  releases: {
    title: `Release history · ${OBSERVATORY_NAME}`,
    description:
      "Version history for the Subnational Election Observatory: schema, methods, snapshot labels, validated counts, and known gaps.",
    path: obsRoutes.releases,
    image: "releases",
    absoluteTitle: true,
  },
} satisfies Record<string, PageMetaInput>;

export const STATIC_SITEMAP_PATHS = [
  staticPageSeo.home.path,
  staticPageSeo.observatory.path,
  staticPageSeo.observatoryAbout.path,
  staticPageSeo.regions.path,
  staticPageSeo.explorer.path,
  staticPageSeo.calendar.path,
  staticPageSeo.compare.path,
  staticPageSeo.methodology.path,
  staticPageSeo.polling.path,
  staticPageSeo.coverage.path,
  staticPageSeo.sources.path,
  staticPageSeo.downloads.path,
  staticPageSeo.releases.path,
] as const;

export function countryPageMeta(country: CountryRecord): Metadata {
  const socialTitle = `${country.names.official} · ${OBSERVATORY_NAME}`;
  const title = `${country.names.official} subnational elections · ${OBSERVATORY_NAME}`;
  const kind = country.kind === "territory" ? "territory" : "country";
  const description = country.screening
    ? `Screening record for ${country.names.official} (${kind}) in the Subnational Election Observatory. As of ${country.screening.asOfLabel}: ${country.screening.reason}`
    : `Subnational election research for ${country.names.official} (${coveragePhrase(country.coverageStatus)} coverage) from the Center for Digital Democracy. Offices, sources, and remaining research gaps are listed on this page.`;
  const path = obsRoutes.country(country.id);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}

export function officePageMeta(
  office: OfficeRecord,
  country?: CountryRecord,
): Metadata {
  const place = country?.names.official ?? office.countryId;
  const title = `${office.names.official} · ${OBSERVATORY_NAME}`;
  const description = `${office.names.official} — ${office.tier} ${office.officeType} in ${place}. Subnational election research from the Center for Digital Democracy. An imported office does not imply complete returns or confirmed current officeholders.`;
  const path = obsRoutes.office(office.id);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function originalBriefingPageMeta(
  office: OfficeRecord,
  country?: CountryRecord,
): Metadata {
  const place = country?.names.official ?? office.countryId;
  const title = `${office.names.official} original briefing · ${OBSERVATORY_NAME}`;
  const description = `Original research briefing for ${office.names.official} in ${place}. Source qualifications and evidence gaps are retained.`;
  const path = `${obsRoutes.office(office.id)}/original`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function eventPageMeta(
  event: ElectionEvent,
  office?: OfficeRecord,
  country?: CountryRecord,
): Metadata {
  const dateLabel = formatResearchDate(event.date);
  const officeName = office?.names.short ?? office?.names.official ?? "Office";
  const place = country?.names.official ?? event.countryId;
  const title = `${officeName} — ${dateLabel} · ${OBSERVATORY_NAME}`;
  const description = `${eventKindLabel(event.kind)} election record for ${officeName} in ${place} (${dateLabel}) in the Subnational Election Observatory.`;
  const path = obsRoutes.event(event.id);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const missingRecordMeta: Metadata = {
  title: "Record not found",
  robots: { index: false, follow: true },
};

export const robotsAllow: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};
