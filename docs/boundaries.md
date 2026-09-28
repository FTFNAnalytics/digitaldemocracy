# Boundary crosswalk

Geometry is evidence. A shape is emitted only when a reviewed crosswalk row has `review_status` `approved`, a `jurisdiction_key`, and a parent key. A name match is a draft proposal. It is not approval.

This pipeline does not change `geography` rows. It writes the shape files. OV-08 draws them. GADM is not used. Its licence is non-commercial.

## Dependency on OV-01

`0005_atlas_boundary.sql` stores `jurisdiction_key` and does not declare a foreign key to `derived_jurisdiction`. OV-01 is on main (`0003_atlas_derived.sql`). Search is `0004`. Office slugs are `0006`.

`npm run boundaries:match` reads `derived_jurisdiction` when the table is present (`jurisdiction_key`, `country_id`, `geography_id`, `parent_key`, `name`, `level_label`). A missing required column throws. The matcher does not guess a schema. Albania, when that table is absent, still falls back to the 61 current mayor rows in `docs/phase1/albania/data/office-register.jsonl`. That fallback leaves `jurisdiction_key` null.

OV-01 stays one jurisdiction per geography. Mayor and council offices keep distinct `geography_id` values, and seat pages keep both. Derive does not collapse them. Boundary matching needs one place per municipality, so `loadPlacesFromDerived` applies a structural rule only when the `office` table is present:

- A geography whose offices are all historical is not a current place and is left out of the match. Albania's 373 historical bashki/komuna pairs stay out. They are not approved and they do not get shapes.
- A folded name + parent + level group that is exactly one current executive geography (single-seat office type, such as `mayor`) plus collective siblings (council, assembly, and the other multi-seat types) keeps the executive geography. The council geography does not get a second LAU row. Its shape is the approved executive place's key.
- Any other duplicate group is returned whole. Two current executive geographies that share a name stay ambiguous, and so does an executive paired with an office type that is not collective. The matcher still refuses those.

A parent name is the parent row's name when that parent is subnational. A parent whose level is `country` is the file's country scope, the same scope as `CNTR_CODE`, so the boundary parent name is null while `parent_key` stays the country key (`country:albania` for Albania). The matcher is unchanged: a subnational parent supplied on only one side stays unmatched, and two supplied parent names must still fold-equal.

Research `territorial_unit_id` values such as `AL-13` are not INSTAT or LAU codes. The derived place does not carry them, so `binding_territorial_unit_id` is null. They are not used as `code_supplied`.

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

`boundaries:match` always writes `review_status` `draft_for_human_review`. It prints the match rate and every unmatched jurisdiction. It refuses to overwrite a file that already contains an approved row. `--check` regenerates the proposal. A draft file must match that proposal byte for byte. An approved file must match the proposal's links (keys, codes, names, parents, method) and must keep non-null `jurisdiction_key` and `parent_key`. Approval notes are allowed to differ from the draft proposal.

`boundaries:build` throws before writing if the file or any row is not `approved`, or if `jurisdiction_key` or `parent_key` is null. Approved rows become:

- `public/atlas/geo/{parent_key}.json` — children TopoJSON (mapshaper `keep-shapes`, quantization `1e5`, about one vertex per 50 m at region level and per 10 m at municipal level). A colon in the parent key becomes an underscore in the file name (`country:albania` → `country_albania.json`). Region files over 300 KB are refused. These files are gitignored.
- `public/atlas/geo/europe-lau.pmtiles` — one PMTiles v3 archive with a single z0 Mapbox Vector Tile of the approved `gisco_lau` features. It is not a full zoom pyramid. The tile is gzip-compressed. Features that are not `gisco_lau` are left out of this archive. OV-08 loads this archive only for a Europe-wide zoom. A jurisdiction page loads the TopoJSON file for that parent (`country:albania` → `/atlas/geo/country_albania.json`) and does not request the PMTiles archive. The world index does not use either file: it draws a simplified Natural Earth 110m outline (`lib/atlas/map/world-land.json`).

Bbox and centroid are computed from the source GeoJSON (mean of the largest exterior ring) and written with `UPDATE` onto an existing `derived_jurisdiction` row. The builder does not insert derived rows. If the table is absent, those fields stay pending and the shape files are still written for approved rows.

`approvedCrosswalkSha256` is null until the file and every row are `approved` and every `jurisdiction_key` is set. That hash is the derive input once Justin approves a country.

## Albania

`schemas/atlas/boundaries/albania.json` is approved. Justin's 2026-09-28 discretion (via Genevieve) covers this file after the current-executive dedupe above. Every row uses the current mayor `jurisdiction_key` (`geo:albania:{geography_id}`) and `parent_key` `country:albania`.

- 61 current municipalities. Historical bashki/komuna pairs are excluded from the match.
- 59 `name_parent_exact`.
- 2 `name_parent_fuzzy`: Fushë-Arrëz ↔ LAU `Fushë Arrës` (`AL151`, distance 1); Vau-Dejës ↔ LAU `Vau I Dejës` (`AL155`, distance 2).
- Dimal matches the LAU name Dimal.
- `binding_territorial_unit_id` is null. The boundary code is the LAU id.

CI checks this file with `--check` against a database built by `ATLAS_IMPORT_SCOPE=albania` (migrations through 0006, derive during import). The register fallback, used only when `derived_jurisdiction` is absent, is still a 61-row draft with null keys and is not the committed file. A two-polygon GeoJSON fixture checks TopoJSON parsing, feature count, and the PMTiles archive without a live GIS download.
