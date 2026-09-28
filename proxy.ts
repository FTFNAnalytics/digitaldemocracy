import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ATLAS_ALIAS_REDIRECT_STATUS,
  aliasCanonicalPath,
  countryCanonicalPath,
  isReservedSlugSegment,
  isStaticAtlasRoot,
} from "@/lib/atlas/jurisdiction";

/**
 * Next.js treats a folder named `_kit` as private and will not route it.
 * `/atlas/_kit` rewrites to the gated reading-kit page.
 * Readable seat aliases and office CSV URLs rewrite before jurisdiction 301s.
 * Slug aliases and /atlas/countries/[countryId] answer 301 before the page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/atlas/_kit") {
    const url = request.nextUrl.clone();
    url.pathname = "/atlas/reading-kit";
    return NextResponse.rewrite(url);
  }

  const csv = pathname.match(/^\/atlas\/offices\/([^/]+)\.csv$/);
  if (csv?.[1]) {
    const url = request.nextUrl.clone();
    url.pathname = `/atlas/offices/${csv[1]}/csv`;
    return NextResponse.rewrite(url);
  }

  const cycleCsv = pathname.match(/^\/atlas\/([^/]+)\/elections\/(\d{4}-\d{2}-\d{2})\.csv$/);
  if (cycleCsv?.[1] && cycleCsv[2]) {
    const url = request.nextUrl.clone();
    url.pathname = `/atlas/${cycleCsv[1]}/elections/${cycleCsv[2]}/csv`;
    return NextResponse.rewrite(url);
  }

  const seat = pathname.match(/^\/atlas\/(.+)\/seats\/([^/]+)$/);
  if (seat?.[1] && seat[2] && !seat[1].split("/").includes("seats")) {
    const url = request.nextUrl.clone();
    url.pathname = `/atlas/seat-alias/${seat[1]}/${seat[2]}`;
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl;
  const countryAlias = url.pathname.match(/^\/atlas\/countries\/([^/]+)\/?$/);
  if (countryAlias?.[1]) {
    const destination = countryCanonicalPath(decodeURIComponent(countryAlias[1]));
    if (destination && destination !== url.pathname) {
      const target = url.clone();
      target.pathname = destination;
      return NextResponse.redirect(target, ATLAS_ALIAS_REDIRECT_STATUS);
    }
    return NextResponse.next();
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "atlas" || parts.length < 2) return NextResponse.next();
  const country = decodeURIComponent(parts[1] ?? "");
  const rest = parts.slice(2).map((segment) => decodeURIComponent(segment));
  if (isStaticAtlasRoot(country) || isReservedSlugSegment(country) || rest.some((segment) => isReservedSlugSegment(segment))) {
    return NextResponse.next();
  }
  const destination = aliasCanonicalPath([country, ...rest].join("/"));
  if (!destination || destination === url.pathname) return NextResponse.next();
  const target = url.clone();
  target.pathname = destination;
  return NextResponse.redirect(target, ATLAS_ALIAS_REDIRECT_STATUS);
}

export const config = {
  matcher: ["/atlas", "/atlas/:path*"],
};
