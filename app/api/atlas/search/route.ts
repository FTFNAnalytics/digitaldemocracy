import { publicSearchHit, search, SEARCH_ENGINE, sqliteFts5Enabled } from "@/lib/atlas/search";
import { parseAtlasSearchParams, SearchInputError } from "@/lib/atlas/search-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const query = parseAtlasSearchParams(url.searchParams);
    const results = search(query).map(publicSearchHit);
    return Response.json(
      {
        engine: SEARCH_ENGINE,
        fts5: sqliteFts5Enabled(),
        mode: query.mode,
        q: query.q,
        results,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (error) {
    if (error instanceof SearchInputError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    throw error;
  }
}
