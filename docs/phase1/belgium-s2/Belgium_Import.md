# Belgium import on the VPS

Belgium is lineage `country-package-belgium`. Justin accepted all Prompt S2 offices on 2026-09-19: **1,179 current + 55 historical** (1,234 classifications). Tiers are 1,185 municipal / 15 regional / 2 national / 32 other. Open research notes stay open: remaining-universe indirect-body gaps, historic successor/code-change review, Bilzen 2018 date conflict, Saint-Josse 2024 repeat, and 35 unbound IBZ 2000 aliases. Do not invent municipal or indirect rows beyond the accepted pack.

`/electiondatabase` redirects and Mexico overrides are unchanged.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Bosnia/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Belgium only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=belgium npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Bosnia, LatAm, and New Zealand as well.

Expected Belgium lines:

```
lineage=country-package-belgium
belgium_offices=1234
belgium_current=1179
belgium_historical=55
belgium_municipal=1185
belgium_regional=15
belgium_national=2
belgium_other=32
belgium_selected_histories=1770
belgium_prospective_events=0
belgium_result_rows=9238
belgium_sources=460
belgium_unresolved=37
```

A second run with unchanged `data/research/belgium-s2/` + approved `schemas/atlas/tiers/belgium.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-belgium.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-belgium-attempts.sqlite
ATLAS_IMPORT_SCOPE=belgium npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Frozen PR #14 zero-office screening extract is not the source of offices.
