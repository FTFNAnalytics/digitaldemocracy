import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ATLAS_ALIAS_REDIRECT_STATUS,
  aliasCanonicalPath,
  countryCanonicalPath,
  isReservedSlugSegment,
  isStaticAtlasRoot,
} from "@/lib/atlas/jurisdiction";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * nginx terminates TLS and sets X-Forwarded-Proto. Next then builds the proxy
 * URL as https://<bind-host>:<port>, and NextURL rewrites 127.0.0.1 to
 * localhost, so the rewrite no longer matches the in-process origin. Next
 * fetches that absolute URL and the TLS handshake fails (EPROTO) against the
 * HTTP listener. Speak HTTP on that loopback hop. Direct HTTPS (no forwarded
 * proto) and any non-loopback host keep the request scheme.
 */
function rewriteInternally(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const forwarded = request.headers.get("x-forwarded-proto") ?? "";
  const forwardedHttps = forwarded.split(",").some((value) => value.trim().toLowerCase() === "https");
  if (forwardedHttps && url.protocol === "https:" && LOOPBACK_HOSTS.has(url.hostname)) {
    url.protocol = "http:";
  }
  return NextResponse.rewrite(url);
}

/**
 * Next.js treats a folder named `_kit` as private and will not route it.
 * `/atlas/_kit` rewrites to the gated reading-kit page.
 * Readable seat aliases and office CSV URLs rewrite before jurisdiction 301s.
 * Slug aliases and /atlas/countries/[countryId] answer 301 before the page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/atlas/_kit") {
    return rewriteInternally(request, "/atlas/reading-kit");
  }

  const csv = pathname.match(/^\/atlas\/offices\/([^/]+)\.csv$/);
  if (csv?.[1]) {
    return rewriteInternally(request, `/atlas/offices/${csv[1]}/csv`);
  }

  const cycleCsv = pathname.match(/^\/atlas\/([^/]+)\/elections\/(\d{4}-\d{2}-\d{2})\.csv$/);
  if (cycleCsv?.[1] && cycleCsv[2]) {
    return rewriteInternally(request, `/atlas/${cycleCsv[1]}/elections/${cycleCsv[2]}/csv`);
  }

  const seat = pathname.match(/^\/atlas\/(.+)\/seats\/([^/]+)$/);
  if (seat?.[1] && seat[2] && !seat[1].split("/").includes("seats")) {
    return rewriteInternally(request, `/atlas/seat-alias/${seat[1]}/${seat[2]}`);
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
