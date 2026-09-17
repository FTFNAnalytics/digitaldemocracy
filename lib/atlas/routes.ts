export const ATLAS_BASE = "/atlas";

export const atlasRoutes = {
  home: ATLAS_BASE,
  explorer: `${ATLAS_BASE}/explorer`,
  country: (countryId: string) => `${ATLAS_BASE}/countries/${encodeURIComponent(countryId)}`,
  office: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}`,
  event: (eventId: string) => `${ATLAS_BASE}/elections/${encodeURIComponent(eventId)}`,
} as const;

export const atlasNav = [
  { href: atlasRoutes.home, label: "Atlas" },
  { href: atlasRoutes.explorer, label: "Explorer" },
] as const;
