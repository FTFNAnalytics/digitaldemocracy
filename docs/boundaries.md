# Boundary crosswalk

Geometry is evidence. A shape is emitted only when a reviewed crosswalk row has `review_status` `approved`, a `jurisdiction_key`, and a parent key. A name match is a draft proposal. It is not approval.

This pipeline does not change `geography` rows. It does not add map UI (that is OV-08). GADM is not used. Its licence is non-commercial.

## Dependency on OV-01

`0005_atlas_boundary.sql` stores `jurisdiction_key` and does not declare a foreign key. `derived_jurisdiction` is not on main yet (`0003` is reserved for OV-01, `0004` for OV-02).

Until that table exists:

- Albania proposals are built from the 61 current mayor rows in `docs/phase1/albania/data/office-register.jsonl`.
- `jurisdiction_key` stays null. `binding_geography_id` is the mayor geography id.
- The loader and the builder refuse a row with a null key, so no shape is written from the committed Albania file.
- `npm run boundaries:match` reads `derived_jurisdiction` when the table is present (`jurisdiction_key`, `country_id`, `geography_id`, `parent_key`, `name`, `level_label`). Parent name is the parent row's `name`. A missing required column throws. The matcher does not guess a schema.

Mayor and council offices for the same municipality have different `geography_id` values. The register fallback uses mayor rows only. After OV-01, two derived rows that share a folded name, parent, and level stay unmatched. Re-run match before asking for approval. Do not join LAU codes by name alone onto both geographies.

Research `territorial_unit_id` values such as `AL-13` are not INSTAT or LAU codes. They are stored as `binding_territorial_unit_id` and are not used as `code_supplied`.

## Sources and licences

Checksums live in `data/boundaries/manifest.json`. `npm run boundaries:fetch` writes the files to `data/boundaries/incoming/` (gitignored) and keeps a file only when the SHA-256 and byte count match. CI does not download them. Tests use `tests/fixtures/boundaries/`.

| Manifest id | What | Licence |
| --- | --- | --- |
| `gisco-lau-2023-4326-csv` | LAU 2023 attribute CSV, EPSG:4326 | Eurostat GISCO. Administrative boundaries © EuroGeographics. Free to use with the attribution below. |
| `gisco-lau-2023-4326-geojson` | LAU 2023 geometry, 1:1 million GeoJSON | Same. |
| `gisco-nuts-2024-10m-4326-geojson` | NUTS 2024, 1:10 million GeoJSON, all levels | Same family, NUTS 2024 attribution below. |
| `geoboundaries-cgaz-adm0-geojson` | geoBoundaries CGAZ ADM0 | CC BY 4.0. The checksum is the Git LFS oid of the file bytes. |
| `geoboundaries-cgaz-adm1-geojson` | geoBoundaries CGAZ ADM1 | CC BY 4.0. Same checksum note. |
| `geoboundaries-cgaz-adm2-geojson` | geoBoundaries CGAZ ADM2 | CC BY 4.0. Same checksum note. |
| `natural-earth-50m-admin-0-countries-zip` | Natural Earth 1:50m admin-0 countries | Public domain. Fetch checksums the zip. The build reads GeoJSON and does not parse this zip. |

Population and area columns on the LAU CSV are not copied into the crosswalk.

Attribution strings for the map corner (OV-08 reads the same text from `lib/atlas/boundaries/attribution.ts`):

© EuroGeographics for the administrative boundaries. Source: Eurostat – GISCO, NUTS 2024.

© EuroGeographics for the administrative boundaries. Source: Eurostat – GISCO, LAU 2023.

geoBoundaries CGAZ (William & Mary geoLab), licensed CC BY 4.0. https://www.geoboundaries.org

Made with Natural Earth. Free vector and raster map data at naturalearthdata.com. Public domain.

## Commands

```bash
npm run boundaries:fetch
npm run boundaries:match -- --country albania --lau-csv tests/fixtures/boundaries/lau-albania-2023.csv
npm run boundaries:match -- --country albania --lau-csv tests/fixtures/boundaries/lau-albania-2023.csv --check
npm run boundaries:build -- --crosswalk schemas/atlas/boundaries/albania.json --geometry path/to.geojson
```

`boundaries:match` always writes `review_status` `draft_for_human_review`. It prints the match rate and every unmatched jurisdiction. It refuses to overwrite a file that already contains an approved row. `--check` regenerates the proposal and compares it to the checked-in JSON.

`boundaries:build` throws before writing if the file or any row is not `approved`, or if `jurisdiction_key` or `parent_key` is null. Approved rows become:

- `public/atlas/geo/{parent_key}.json` — children TopoJSON (mapshaper `keep-shapes`, quantization `1e5`, about one vertex per 50 m at region level and per 10 m at municipal level). Region files over 300 KB are refused. These files are gitignored.
- `public/atlas/geo/europe-lau.pmtiles` — one PMTiles v3 archive with a single z0 Mapbox Vector Tile of the approved `gisco_lau` features. It is not a full zoom pyramid. OV-08 can ask for a pyramid later. The tile is gzip-compressed. Features that are not `gisco_lau` are left out of this archive.

Bbox and centroid are computed from the source GeoJSON (mean of the largest exterior ring) and written with `UPDATE` onto an existing `derived_jurisdiction` row. The builder does not insert derived rows. If the table is absent, those fields stay pending and the shape files are still written for approved rows.

`approvedCrosswalkSha256` is null until the file and every row are `approved` and every `jurisdiction_key` is set. That hash is the derive input once Justin approves a country.

## Albania fixture

`schemas/atlas/boundaries/albania.json` is a draft, in the same acceptance style as tier files: nothing in it authorises a shape.

- 61 current municipalities, one row each, bound to the mayor `geography_id`.
- 59 `name_parent_exact` (folded name, and both parent names empty).
- 2 `name_parent_fuzzy`: Fushë-Arrëz ↔ LAU `Fushë Arrës` (`AL151`, distance 1); Vau-Dejës ↔ LAU `Vau I Dejës` (`AL155`, distance 2).
- Dimal matches the LAU name Dimal. The territorial-unit ids on the rows are research ids, not LAU codes.
- `jurisdiction_key` is null on every row.

CI round-trips this file against `tests/fixtures/boundaries/lau-albania-2023.csv` (the 61 Albania rows of the attribute table, not the raw Europe download). A two-polygon GeoJSON fixture checks TopoJSON parsing, feature count, and the PMTiles archive without a live GIS download.
