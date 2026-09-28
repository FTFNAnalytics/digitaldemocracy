import { createHash } from "node:crypto";
import { loadCyclePage } from "../cycle/read";
import { readAtlasDerived } from "../publication";
import { publicationEtag } from "./stamp";
import { AtlasQueryError, parseListQuery } from "./cursor";
import {
  cyclePageCsv,
  jurisdictionPageCsv,
  listCycleExport,
  listJurisdictionExport,
  listPersonExport,
  listSeatExport,
  PERSON_DEPENDENCY,
  personCsv,
  readPersonExport,
  resolveJurisdictionExport,
  resolveSeatExport,
  seatPageCsv,
} from "./data";
import { apiError, csvResponse, etagMatches, jsonResponse, notModified, redirectResponse } from "./http";

export type AtlasCollection = "jurisdictions" | "seats" | "cycles" | "people";

const PREFIX: Record<AtlasCollection, string> = {
  jurisdictions: "/api/atlas/jurisdictions",
  seats: "/api/atlas/seats",
  cycles: "/api/atlas/cycles",
  people: "/api/atlas/people",
};

export function splitFormat(segments: string[]): { segments: string[]; format: "json" | "csv" } {
  if (segments.length === 0) return { segments, format: "json" };
  const last = segments[segments.length - 1] ?? "";
  if (last.endsWith(".csv") && last.length > 4) {
    return { segments: [...segments.slice(0, -1), last.slice(0, -4)], format: "csv" };
  }
  return { segments, format: "json" };
}

function resourceEtag(publication: string, request: Request): string {
  const url = new URL(request.url);
  return createHash("sha256").update(`${publication}\n${url.pathname}\n${url.search}`).digest("hex");
}

function apiLocation(collection: AtlasCollection, segments: string[], format: "json" | "csv"): string {
  const encoded = segments.map((segment) => encodeURIComponent(segment));
  if (format === "csv" && encoded.length > 0) {
    encoded[encoded.length - 1] = `${encoded[encoded.length - 1]}.csv`;
  }
  return `${PREFIX[collection]}/${encoded.join("/")}`;
}

function safeFilename(segments: string[]): string {
  const name = segments.join("_").replace(/[^A-Za-z0-9._-]+/g, "_");
  return `${name || "atlas"}.csv`;
}

export async function serveAtlasExport(
  request: Request,
  collection: AtlasCollection,
  rawSegments: string[],
): Promise<Response> {
  const publication = await readAtlasDerived("api-publication-etag", () => publicationEtag());
  const etag = resourceEtag(publication, request);
  try {
    const { segments, format } = splitFormat(rawSegments);
    if (segments.length === 0) {
      if (format === "csv") return apiError(404, "not_found", etag);
      const query = parseListQuery(new URL(request.url));
      const body = await readAtlasDerived(`api-list:${collection}:${request.url}`, () => {
        if (collection === "jurisdictions") return listJurisdictionExport(query);
        if (collection === "seats") return listSeatExport(query);
        if (collection === "cycles") return listCycleExport(query);
        return listPersonExport(query);
      });
      if (etagMatches(request.headers.get("if-none-match"), etag)) return notModified(etag);
      return jsonResponse(body, etag);
    }
    const payload = await readAtlasDerived(`api-detail:${collection}:${format}:${segments.join("/")}`, () =>
      detail(collection, segments, format),
    );
    if (payload.kind === "redirect") return redirectResponse(apiLocation(collection, payload.segments, format), etag);
    if (payload.kind === "missing") return jsonResponse(payload.body, etag, payload.status);
    if (payload.kind === "csv") {
      if (etagMatches(request.headers.get("if-none-match"), etag)) return notModified(etag);
      return csvResponse(payload.body, etag, payload.filename);
    }
    const status = payload.status ?? 200;
    if (status === 200 && etagMatches(request.headers.get("if-none-match"), etag)) return notModified(etag);
    return jsonResponse(payload.body, etag, status);
  } catch (error) {
    if (error instanceof AtlasQueryError) return apiError(error.status, error.message, etag);
    throw error;
  }
}

type Detail =
  | { kind: "json"; body: unknown; status?: number }
  | { kind: "csv"; body: string; filename: string }
  | { kind: "redirect"; segments: string[] }
  | { kind: "missing"; status: number; body: unknown };

function detail(collection: AtlasCollection, segments: string[], format: "json" | "csv"): Detail {
  if (collection === "jurisdictions") return jurisdictionDetail(segments, format);
  if (collection === "seats") return seatDetail(segments, format);
  if (collection === "cycles") return cycleDetail(segments, format);
  return personDetail(segments, format);
}

function jurisdictionDetail(segments: string[], format: "json" | "csv"): Detail {
  const slugPath = segments.join("/");
  const hit = resolveJurisdictionExport(slugPath);
  if (hit.status === "missing") return { kind: "missing", status: 404, body: { error: "not_found" } };
  if (hit.status === "alias") return { kind: "redirect", segments: hit.slugPath.split("/") };
  if (format === "csv") {
    const csv = jurisdictionPageCsv(hit.view.jurisdiction.slugPath);
    if (!csv) return { kind: "missing", status: 404, body: { error: "not_found" } };
    return { kind: "csv", body: csv, filename: safeFilename(hit.view.jurisdiction.slugPath.split("/")) };
  }
  return { kind: "json", body: hit.view };
}

function seatDetail(segments: string[], format: "json" | "csv"): Detail {
  const hit = resolveSeatExport(segments);
  if (hit.status === "missing") return { kind: "missing", status: 404, body: { error: "not_found" } };
  if (hit.status === "ambiguous") {
    return {
      kind: "json",
      status: 409,
      body: { status: "ambiguous", namespaces: hit.namespaces, candidates: hit.candidates },
    };
  }
  if (format === "csv") {
    const csv = seatPageCsv(hit.model.idNamespace, hit.model.officeId);
    if (!csv) return { kind: "missing", status: 404, body: { error: "not_found" } };
    return { kind: "csv", body: csv, filename: safeFilename([hit.model.officeId]) };
  }
  return { kind: "json", body: hit.model };
}

function cycleDetail(segments: string[], format: "json" | "csv"): Detail {
  if (segments.length < 2) return { kind: "missing", status: 404, body: { error: "not_found" } };
  const [country, dateToken, ...scope] = segments;
  const loaded = loadCyclePage({ country: country ?? "", dateToken: dateToken ?? "", scope });
  if (loaded.status === "not_found" || loaded.status === "unavailable") {
    return { kind: "missing", status: loaded.status === "unavailable" ? 503 : 404, body: { error: loaded.status } };
  }
  if (loaded.status === "alias") {
    const match = loaded.path.match(/^\/atlas\/([^/]+)\/elections\/(.+)$/);
    if (!match) return { kind: "missing", status: 404, body: { error: "not_found" } };
    return { kind: "redirect", segments: [decodeURIComponent(match[1] ?? ""), ...match[2].split("/").map(decodeURIComponent)] };
  }
  if (format === "csv") {
    return {
      kind: "csv",
      body: cyclePageCsv(loaded.model),
      filename: safeFilename([country ?? "cycle", dateToken ?? "date", ...scope]),
    };
  }
  return { kind: "json", body: loaded.model };
}

function personDetail(segments: string[], format: "json" | "csv"): Detail {
  const slug = segments.join("/");
  const person = readPersonExport(slug);
  if (!person) {
    return {
      kind: "missing",
      status: 404,
      body: { available: false, dependency: PERSON_DEPENDENCY, person: null },
    };
  }
  if (format === "csv") return { kind: "csv", body: personCsv(person), filename: safeFilename([person.slug]) };
  return { kind: "json", body: person };
}
