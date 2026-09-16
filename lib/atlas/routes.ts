export const ATLAS_BASE = "/atlas";

export const atlasRoutes = {
  home: ATLAS_BASE,
  country: (countryId: string) => `${ATLAS_BASE}/countries/${encodeURIComponent(countryId)}`,
  office: (officeId: string) => `${ATLAS_BASE}/offices/${encodeURIComponent(officeId)}`,
} as const;
