export const ATLAS_BASE = "/atlas";

function encodedSlugPath(slugPath: string): string {
  return slugPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export const atlasRoutes = {
  home: ATLAS_BASE,
  explorer: `${ATLAS_BASE}/explorer`,
  releases: `${ATLAS_BASE}/releases`,
  search: `${ATLAS_BASE}/search`,
  downloads: `${ATLAS_BASE}/downloads`,
  country: (countryId: string) => `${ATLAS_BASE}/countries/${encodeURIComponent(countryId)}`,
  office: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}`,
  officeCsv: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}.csv`,
  event: (eventId: string) => `${ATLAS_BASE}/elections/${encodeURIComponent(eventId)}`,
  jurisdiction: (slugPath: string) => `${ATLAS_BASE}/${encodedSlugPath(slugPath)}`,
  seat: (slugPath: string) => `${ATLAS_BASE}/${encodedSlugPath(slugPath)}`,
  candidateSearch: (label: string) =>
    `${ATLAS_BASE}/search?${new URLSearchParams({ mode: "candidate", q: label }).toString()}`,
} as const;

/** /atlas/{country}/elections/{YYYY-MM-DD} or /{YYYY}, plus an optional place scope. */
export function cyclePublicPath(countrySlug: string, dateToken: string, scopeSegments: string[] = []): string {
  const head = `${ATLAS_BASE}/${encodeURIComponent(countrySlug)}/elections/${encodeURIComponent(dateToken)}`;
  if (scopeSegments.length === 0) return head;
  return `${head}/${scopeSegments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

/** Full-day CSV. Every contest on that resolved day, not a scoped subset. */
export function cycleCsvPath(countrySlug: string, isoDate: string): string {
  return `${ATLAS_BASE}/${encodeURIComponent(countrySlug)}/elections/${encodeURIComponent(isoDate)}.csv`;
}

/** Public seat alias: /atlas/{jurisdiction slug_path}/seats/{office-slug}. */
export function parseSeatAliasPath(
  country: string,
  path: string[],
): { jurisdictionSlugPath: string; officeSlug: string } | null {
  const seatsAt = path.indexOf("seats");
  if (seatsAt < 0) return null;
  if (path.indexOf("seats", seatsAt + 1) !== -1) return null;
  if (path.length !== seatsAt + 2) return null;
  const officeSlug = path[seatsAt + 1];
  if (!officeSlug || !country) return null;
  return {
    jurisdictionSlugPath: [country, ...path.slice(0, seatsAt)].join("/"),
    officeSlug,
  };
}

export const atlasNav = [
  { href: atlasRoutes.home, label: "Atlas" },
  { href: atlasRoutes.explorer, label: "Explorer" },
] as const;
