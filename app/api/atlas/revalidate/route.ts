import { revalidateTag } from "next/cache";
import { ATLAS_DERIVED_TAG } from "@/lib/atlas/publication";

export const dynamic = "force-dynamic";

function unauthorized(): Response {
  return new Response(null, { status: 404 });
}

export function GET(): Response {
  return unauthorized();
}

/** Called by derive:atlas when ATLAS_REVALIDATE_URL and ATLAS_REVALIDATE_SECRET are set. */
export function POST(request: Request): Response {
  const secret = process.env.ATLAS_REVALIDATE_SECRET?.trim();
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) return unauthorized();
  revalidateTag(ATLAS_DERIVED_TAG, { expire: 0 });
  return Response.json({ tag: ATLAS_DERIVED_TAG, revalidated: true });
}
