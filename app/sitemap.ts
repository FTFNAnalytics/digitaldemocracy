import type { MetadataRoute } from "next";
import { getCountries } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { SITE_URL, STATIC_SITEMAP_PATHS } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority:
        path === "/" ? 1 : path === "/electiondatabase" ? 0.9 : 0.7,
    }),
  );

  // Country indexes only — office/event URLs would explode the sitemap
  // (tens of thousands of records) without a matching crawl budget.
  const countryEntries: MetadataRoute.Sitemap = getCountries().map(
    (country) => ({
      url: `${SITE_URL}${obsRoutes.country(country.id)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...countryEntries];
}
