# Hungary import on the VPS

Hungary is lineage `country-package-hungary`. Justin accepted Prompt AK on 2026-09-22 with named holds still open: **6,378 current + 0 historical** offices. Landed tiers are 6,355 municipal / 20 regional / 2 national / 1 other. Three classifications stay `needs_review`: `HU-BUDAPEST-A` (regional), `HU-BUDAPEST-M` (municipal), and `HU-EP` (other). The other 6,375 classifications stay `approved`. This importer does not rewrite `schemas/atlas/tiers/hungary.json`. The landed file is already `status=approved` with `production_accepted=true`. A `draft_for_human_review` file is rejected, not upgraded.

Direct executive offices: 3,178 (3,177 municipal/district mayors + the Budapest capital mayor). Council/assembly offices: 3,198 (3,177 councils + 19 county assemblies + the Budapest capital assembly + Országgyűlés). `HU-PRES` stays `indirect_president` / `indirect_parliamentary`. No popular presidential ballot, PM, cabinet, direct county chair, járás council, historical office, or successor edge is invented.

Named holds stay open: HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS (documented exclusion), and HU-UPCOMING.

Bozsok council (`HU-NVI-18-012-C`), Bozsok mayor (`HU-NVI-18-012-M`), and Pakod council (`HU-NVI-20-160-C`) stay in the register. They keep their 2014 events and have no 2024 event. No zero return is invented (`office-cycle-gaps.json`).

The slim pack omits `results.json` (101,526 documented rows), `identity-crosswalk.json`, raw `sources/`, and `unpacked/`. This importer publishes **0 result rows** and does not invent those bytes. `sources.json` stays the catalogue. `coverage_complete` stays false.

`/electiondatabase` redirects and Mexico overrides are unchanged.

`ATLAS_IMPORT_SCOPE=all` is **not** the Hungary path. Hungary loads only when the scope is `hungary`.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production. This PR does not deploy.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Belgium/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Hungary only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=hungary npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` as the Hungary path. `all` re-imports the other published lineages and does not publish Hungary.

Expected Hungary lines:

```
lineage=country-package-hungary
hungary_offices=6378
hungary_current=6378
hungary_historical=0
hungary_municipal=6355
hungary_regional=20
hungary_national=2
hungary_other=1
hungary_selected_histories=12753
hungary_prospective_events=0
hungary_result_rows=0
hungary_documented_result_rows_omitted=101526
hungary_proceedings=0
hungary_sources=3335
hungary_unresolved=16
hungary_approved=6375
hungary_needs_review=3
hungary_council_assembly_offices=3198
hungary_current_direct_executive_offices=3178
```

`hungary_result_rows=0` is the honest slim-pack count. The 101,526 rows live in the omitted review `results.json` and are not invented.

A second run with unchanged `data/research/hungary/` + the landed `schemas/atlas/tiers/hungary.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-hungary.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-hungary-attempts.sqlite
ATLAS_IMPORT_SCOPE=hungary npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Next dates stay NULL and are not prospective events.
