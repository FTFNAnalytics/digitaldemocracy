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
  country: (countryId: string) => `${ATLAS_BASE}/countries/${encodeURIComponent(countryId)}`,
  office: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}`,
  officeCsv: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}.csv`,
  event: (eventId: string) => `${ATLAS_BASE}/elections/${encodeURIComponent(eventId)}`,
  jurisdiction: (slugPath: string) => `${ATLAS_BASE}/${encodedSlugPath(slugPath)}`,
  seat: (slugPath: string) => `${ATLAS_BASE}/${encodedSlugPath(slugPath)}`,
} as const;

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
