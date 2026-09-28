/**
 * Attribution strings shown in the map corner.
 * docs/boundaries.md must contain each of these verbatim.
 */
export const ATTRIBUTIONS = {
  gisco_nuts:
    "© EuroGeographics for the administrative boundaries. Source: Eurostat – GISCO, NUTS 2024.",
  gisco_lau:
    "© EuroGeographics for the administrative boundaries. Source: Eurostat – GISCO, LAU 2023.",
  geoboundaries:
    "geoBoundaries CGAZ (William & Mary geoLab), licensed CC BY 4.0. https://www.geoboundaries.org",
  natural_earth:
    "Made with Natural Earth. Free vector and raster map data at naturalearthdata.com. Public domain.",
} as const;

export const EUROPE_LAU_PMTILES_ATTRIBUTION = `${ATTRIBUTIONS.gisco_lau}`;
