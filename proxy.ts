import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js treats a folder named `_kit` as private and will not route it.
 * `/atlas/_kit` rewrites to the gated reading-kit page.
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

  const seat = pathname.match(/^\/atlas\/(.+)\/seats\/([^/]+)$/);
  if (seat?.[1] && seat[2] && !seat[1].split("/").includes("seats")) {
    const url = request.nextUrl.clone();
    url.pathname = `/atlas/seat-alias/${seat[1]}/${seat[2]}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/atlas/:path*"],
};
