import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import type { MetadataRoute } from "next";
import { getCountries } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { SITE_URL, STATIC_SITEMAP_PATHS } from "@/lib/seo";
import { foldSlug } from "./derive/slug";
import { jurisdictionPublicPath } from "./jurisdiction";
import { resolveAtlasSqlitePath } from "./paths";
import { atlasRoutes } from "./routes";
import { openAtlasDatabase, tableExists } from "./sqlite";

/** Paths robots.txt disallows outright. Query shapes are rejected separately. */
const EXCLUDED_PATHS = new Set([
  "/atlas/_kit",
  "/atlas/reading-kit",
  "/atlas/search",
  "/electiondatabase/sources",
]);

export function sitemapPathAllowed(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.includes("?")) return false;
  if (path === "/api" || path.startsWith("/api/")) return false;
  if (EXCLUDED_PATHS.has(path)) return false;
  return true;
}

/**
 * Atlas country URLs for the sitemap.
 * Reads `derived_country_summary` (one row per country) and, when present,
 * the country jurisdiction by primary key (`country:<id>`). It does not scan
 * `derived_jurisdiction`, `derived_cycle`, or `result_row`.
 */
export function listSitemapCountryPaths(sqlitePath = resolveAtlasSqlitePath()): string[] {
  if (!existsSync(sqlitePath)) return [];
  let db: DatabaseSync | null = null;
  try {
    db = openAtlasDatabase(sqlitePath, { readOnly: true });
    if (!tableExists(db, "derived_country_summary")) return [];
    const countries = db
      .prepare(`SELECT country_id FROM derived_country_summary WHERE offices > 0 ORDER BY country_id`)
      .all() as Array<{ country_id: string }>;
    const lookup = tableExists(db, "derived_jurisdiction")
      ? db.prepare(`SELECT slug_path FROM derived_jurisdiction WHERE jurisdiction_key = ?`)
      : null;
    const paths: string[] = [];
    for (const row of countries) {
      const countryId = String(row.country_id ?? "").trim();
      if (!countryId) continue;
      const stored = lookup?.get(`country:${countryId}`) as { slug_path?: unknown } | undefined;
      const fromRow = stored?.slug_path == null ? "" : String(stored.slug_path).trim();
      const slugPath = fromRow || foldSlug(countryId);
      if (!slugPath || slugPath.includes("/")) continue;
      paths.push(jurisdictionPublicPath(slugPath));
    }
    return paths;
  } catch {
    return [];
  } finally {
    db?.close();
  }
}

type SitemapEntry = MetadataRoute.Sitemap[number];

function addEntry(
  entries: MetadataRoute.Sitemap,
  seen: Set<string>,
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
) {
  if (!sitemapPathAllowed(path) || seen.has(path)) return;
  seen.add(path);
  entries.push({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  });
}

/** Static pages, observatory country pages, and Atlas country pages. No query URLs. */
export function loadPublicSitemap(sqlitePath = resolveAtlasSqlitePath()): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  for (const path of STATIC_SITEMAP_PATHS) {
    const priority = path === "/" ? 1 : path === "/electiondatabase" ? 0.9 : 0.7;
    addEntry(entries, seen, path, path === "/" ? "weekly" : "monthly", priority);
  }
  addEntry(entries, seen, atlasRoutes.releases, "monthly", 0.5);
  addEntry(entries, seen, atlasRoutes.downloads, "weekly", 0.6);
  for (const country of getCountries()) {
    addEntry(entries, seen, obsRoutes.country(country.id), "weekly", 0.6);
  }
  for (const path of listSitemapCountryPaths(sqlitePath)) {
    addEntry(entries, seen, path, "weekly", 0.6);
  }
  return entries;
}
