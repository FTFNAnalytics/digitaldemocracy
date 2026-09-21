# Norway import on the VPS

Norway is lineage `country-package-norway`. Justin accepted Prompt AA offices on 2026-09-19 with named holds: **389 current + 537 historical** (926 classifications). Tiers are 876 municipal / 32 regional / 1 national / 17 other. Named holds stay open: SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES. Do not invent a separate Oslo fylkesting (`NO-F03-C`), merger successors, borough/Longyearbyen result histories, certified legal outcomes, popular mayor / prime-minister / cabinet rows, or EP offices.

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

# Staging import of Norway only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=norway npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, and New Zealand as well.

Expected Norway lines:

```
lineage=country-package-norway
norway_offices=926
norway_current=389
norway_historical=537
norway_municipal=876
norway_regional=32
norway_national=1
norway_other=17
norway_selected_histories=10777
norway_prospective_events=0
norway_result_rows=59033
norway_sources=82
norway_unresolved=9
norway_approved=371
norway_needs_review=555
```

A second run with unchanged `data/research/norway/` + approved `schemas/atlas/tiers/norway.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-norway.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-norway-attempts.sqlite
ATLAS_IMPORT_SCOPE=norway npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. 2027 municipal/county next dates stay day-precision called metadata; Storting/Sámi 2029 stays year-expected. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue.
