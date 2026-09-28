import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js treats a folder named `_kit` as private and will not route it.
 * `/atlas/_kit` rewrites to the gated reading-kit page.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/atlas/_kit") {
    const url = request.nextUrl.clone();
    url.pathname = "/atlas/reading-kit";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/atlas/_kit"],
};
