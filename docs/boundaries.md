# Boundary crosswalk

Geometry is evidence. A shape is emitted only when a reviewed crosswalk row has `review_status` `approved`, a `jurisdiction_key`, and a parent key. A name match is a draft proposal. It is not approval.

This pipeline does not change `geography` rows. It does not add map UI (that is OV-08). GADM is not used. Its licence is non-commercial.

## Dependency on OV-01

`0005_atlas_boundary.sql` stores `jurisdiction_key` and does not declare a foreign key to `derived_jurisdiction`. OV-01 is on main (`0003_atlas_derived.sql`). Search is `0004`. Office slugs are `0006`.

`npm run boundaries:match` reads `derived_jurisdiction` when the table is present (`jurisdiction_key`, `country_id`, `geography_id`, `parent_key`, `name`, `level_label`). Parent name is the parent row's `name`. A missing required column throws. The matcher does not guess a schema. Albania, when that table is absent, still falls back to the 61 current mayor rows in `docs/phase1/albania/data/office-register.jsonl`. That fallback leaves `jurisdiction_key` null and sets `binding_geography_id` to the mayor geography id. The loader and the builder refuse a null key, so the committed Albania file does not emit a shape.

Albania master geographies are one row per office, and `parent_geography_id` stays null. Derive therefore does not dedupe a municipality. A 2026-09-28 rematch imported the phase 1 pack with `ATLAS_IMPORT_SCOPE=albania`, applied migrations through 0006, and ran `derive:atlas`. `loadPlacesFromDerived` then returned 868 `level_label = municipality` rows. Every parent is Albania (`parent_key` `country:albania`). Folded name + parent + level forms 434 pairs and 0 unique names. Each pair is one mayor geography and one municipal-council geography: 61 current pairs and 373 historical bashki/komuna pairs. `boundaries:match` against `tests/fixtures/boundaries/lau-albania-2023.csv` reported `0/868`. Every unmatched reason is `ambiguous jurisdiction: more than one row shares folded name, parent, and level`, including Fushë-Arrëz and Vau-Dejës. No LAU code was copied onto either geography.

The matcher was not changed. A parent supplied on only one side stays unmatched, and two supplied parents must still fold-equal. The LAU fixture has no parent column, so `readLauAttributeCsv` sets `parent_name` null. A unique derived place whose parent is Albania would also stay unmatched on that one-sided rule. Albania never reached that gate, because no municipality name is unique. Discretion to approve after a clean rematch does not cover this file.

The committed `schemas/atlas/boundaries/albania.json` stays that register-fallback draft. Replacing it with the derived proposal would drop the 61 LAU codes and would still not authorise a shape. Do not pick the mayor row, or any other row, in order to force a name join across the duplicate geographies.

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

- 61 current municipalities, one row each, bound to the mayor `geography_id` from the register fallback.
- 59 `name_parent_exact` (folded name, and both parent names empty).
- 2 `name_parent_fuzzy`: Fushë-Arrëz ↔ LAU `Fushë Arrës` (`AL151`, distance 1); Vau-Dejës ↔ LAU `Vau I Dejës` (`AL155`, distance 2).
- Dimal matches the LAU name Dimal. The territorial-unit ids on the rows are research ids, not LAU codes.
- `jurisdiction_key` is null on every row. The derived rematch above did not fill those keys.

CI round-trips this file against `tests/fixtures/boundaries/lau-albania-2023.csv` when `derived_jurisdiction` is absent (the 61 Albania rows of the attribute table, not the raw Europe download). The same `--check` against the derived Albania database fails, because the proposal is 0/868. A two-polygon GeoJSON fixture checks TopoJSON parsing, feature count, and the PMTiles archive without a live GIS download.
