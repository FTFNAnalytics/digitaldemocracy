import type { MetadataRoute } from "next";
import { buildSitemapChunks, listJurisdictionSlugPaths } from "@/lib/atlas/jurisdiction";
import { getCountries } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { SITE_URL, STATIC_SITEMAP_PATHS } from "@/lib/seo";
import { atlasRoutes } from "@/lib/atlas/routes";

function loadChunks() {
  const staticEntries = [
    ...STATIC_SITEMAP_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/electiondatabase" ? 0.9 : 0.7,
    })),
    {
      url: `${SITE_URL}${atlasRoutes.releases}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...getCountries().map((country) => ({
      url: `${SITE_URL}${obsRoutes.country(country.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
  return buildSitemapChunks({
    staticEntries,
    jurisdictionPaths: listJurisdictionSlugPaths(),
    origin: SITE_URL,
  });
}

export async function generateSitemaps() {
  const chunks = loadChunks();
  return chunks.map((_, id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const chunks = loadChunks();
  return chunks[id] ?? [];
}
