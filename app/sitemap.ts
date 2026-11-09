import type { MetadataRoute } from "next";
import { loadPublicSitemap } from "@/lib/atlas/sitemap";
import { readAtlasDerived } from "@/lib/atlas/publication";

/**
 * One document at /sitemap.xml.
 * `generateSitemaps` only published /sitemap/[id].xml and left /sitemap.xml as
 * a 404, while also walking every derived place. This list is the static
 * pages plus Atlas countries from derived_country_summary, cached with the
 * other derived reads until derive revalidates that tag.
 * Rendered per request so a build without the master DB does not freeze an
 * empty country list; the summary read itself stays on the derived cache.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return readAtlasDerived("public-sitemap", () => loadPublicSitemap());
}
