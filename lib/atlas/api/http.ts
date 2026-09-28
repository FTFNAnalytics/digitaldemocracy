import { ATLAS_DERIVED_TAG } from "../publication";

/** Revalidate with the publication ETag. derive:atlas drops the server cache via ATLAS_DERIVED_TAG. */
export const ATLAS_API_CACHE_CONTROL = "public, no-cache";

export function quoteEtag(etag: string): string {
  return `"${etag}"`;
}

export function etagMatches(header: string | null, etag: string): boolean {
  if (!header) return false;
  const quoted = quoteEtag(etag);
  return header.split(",").some((part) => {
    const token = part.trim();
    return token === quoted || token === etag || token === `W/${quoted}`;
  });
}

export function atlasApiHeaders(etag: string, contentType: string, filename?: string): Headers {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", ATLAS_API_CACHE_CONTROL);
  headers.set("ETag", quoteEtag(etag));
  headers.set("X-Robots-Tag", "noindex");
  headers.set("X-Atlas-Cache-Tag", ATLAS_DERIVED_TAG);
  headers.set("X-Atlas-Publication", etag);
  if (filename) headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  return headers;
}

export function jsonResponse(body: unknown, etag: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: atlasApiHeaders(etag, "application/json; charset=utf-8"),
  });
}

export function csvResponse(body: string, etag: string, filename: string): Response {
  return new Response(body, {
    status: 200,
    headers: atlasApiHeaders(etag, "text/csv; charset=utf-8", filename),
  });
}

export function notModified(etag: string): Response {
  return new Response(null, {
    status: 304,
    headers: atlasApiHeaders(etag, "application/json; charset=utf-8"),
  });
}

export function redirectResponse(location: string, etag: string): Response {
  const headers = atlasApiHeaders(etag, "text/plain; charset=utf-8");
  headers.set("Location", location);
  return new Response(null, { status: 301, headers });
}

export function apiError(status: number, error: string, etag: string): Response {
  return jsonResponse({ error }, etag, status);
}
