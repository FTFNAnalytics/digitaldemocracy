# Ireland import on the VPS

Ireland is lineage `country-package-ireland`. Justin accepted all Prompt AB offices on 2026-09-20 with named holds: **36 current + 86 historical** (122 classifications). Tiers are 118 municipal / 0 regional / 3 national / 1 other. Open holds stay open: IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS. Do not invent Northern Ireland offices, 2014 merger successors, EP result vectors, later presidential returns, Taoiseach nominee rows, or council-selected mayor contests.

`/electiondatabase` redirects and Mexico overrides are unchanged. This importer does not deploy to the VPS.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Belgium/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Ireland only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=ireland npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bosnia, Bulgaria, Netherlands, Switzerland, Denmark, LatAm, and New Zealand as well.

Expected Ireland lines:

```
lineage=country-package-ireland
ireland_offices=122
ireland_current=36
ireland_historical=86
ireland_municipal=118
ireland_regional=0
ireland_national=3
ireland_other=1
ireland_selected_histories=196
ireland_prospective_events=0
ireland_result_rows=7254
ireland_sources=52
ireland_unresolved=9
ireland_approved=34
ireland_needs_review=88
```

A second run with unchanged `data/research/ireland/` + approved `schemas/atlas/tiers/ireland.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-ireland.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-ireland-attempts.sqlite
ATLAS_IMPORT_SCOPE=ireland npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue. Regional assemblies stay out of the regional tier. Northern Ireland stays excluded.
