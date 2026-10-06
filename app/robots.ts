import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      crawlDelay: 10,
      disallow: [
        "/atlas/_kit",
        "/atlas/reading-kit",
        "/api/",
        "/*?contest=",
        "/*?*contest=",
        "/*?results=",
        "/*?*results=",
        "/*?list=",
        "/*?*list=",
        "/atlas/search",
        "/electiondatabase/sources",
        "/atlas/explorer?",
        "/electiondatabase/explorer?",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
