/** Immutable cache for per-view TopoJSON and the Europe PMTiles archive. */
export const ATLAS_GEO_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function atlasGeoCacheHeaders(): Array<{
  source: string;
  headers: Array<{ key: string; value: string }>;
}> {
  const headers = [{ key: "Cache-Control", value: ATLAS_GEO_CACHE_CONTROL }];
  return [
    { source: "/atlas/geo/:file.json", headers },
    { source: "/atlas/geo/:file.pmtiles", headers },
  ];
}
