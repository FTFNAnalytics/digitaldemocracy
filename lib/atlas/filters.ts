export type AtlasExplorerFilters = {
  q: string;
  country: string;
  tier: string;
  region: string;
};

export const ATLAS_EXPLORER_FILTER_KEYS: Array<keyof AtlasExplorerFilters> = [
  "q",
  "country",
  "tier",
  "region",
];

export function emptyAtlasExplorerFilters(): AtlasExplorerFilters {
  return {
    q: "",
    country: "",
    tier: "",
    region: "",
  };
}

export function parseAtlasExplorerFilters(
  params: Record<string, string | string[] | undefined>,
): AtlasExplorerFilters {
  const base = emptyAtlasExplorerFilters();
  for (const key of ATLAS_EXPLORER_FILTER_KEYS) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value != null && value !== "") {
      base[key] = value;
    }
  }
  return base;
}

export function serializeAtlasExplorerFilters(
  state: AtlasExplorerFilters,
  defaults: AtlasExplorerFilters = emptyAtlasExplorerFilters(),
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ATLAS_EXPLORER_FILTER_KEYS) {
    const value = state[key];
    if (value && value !== defaults[key]) {
      params.set(key, value);
    }
  }
  return params;
}
