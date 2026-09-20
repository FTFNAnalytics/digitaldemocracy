# Denmark import on the VPS

Denmark is lineage `country-package-denmark`. Justin accepted all Prompt X offices on 2026-09-19: **106 current + 240 historical** (346 classifications). Tiers are 324 municipal / 20 regional / 1 national / 1 other. Open research notes stay open: Greenland/Faroe Realm coverage gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps. Do not invent Greenland/Faroe offices, popular mayor rows, or fabricate merger clearances.

`/electiondatabase` redirects and Mexico overrides are unchanged.

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

# Staging import of Denmark only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=denmark npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, and New Zealand as well.

Expected Denmark lines:

```
lineage=country-package-denmark
denmark_offices=346
denmark_current=106
denmark_historical=240
denmark_municipal=324
denmark_regional=20
denmark_national=1
denmark_other=1
denmark_selected_histories=1849
denmark_prospective_events=0
denmark_result_rows=25391
denmark_sources=49
denmark_unresolved=105
denmark_approved=53
denmark_needs_review=293
```

A second run with unchanged `data/research/denmark/` + approved `schemas/atlas/tiers/denmark.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-denmark.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-denmark-attempts.sqlite
ATLAS_IMPORT_SCOPE=denmark npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue.
