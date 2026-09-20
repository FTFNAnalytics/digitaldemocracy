# Netherlands import on the VPS

Netherlands is lineage `country-package-netherlands`. Justin accepted all Prompt T offices on 2026-09-19: **432 current + 69 historical** (501 classifications). Tiers are 414 municipal / 12 regional / 3 national / 72 other. Open research notes stay open: Hilversum/Wijdemeren 18 November 2026 merger successor binding, named historic gaps / partial coverage, and ~147 focused-tier reviews. Appointed mayors have **no mayoral election rows**. Do not invent offices beyond the accepted pack.

`/electiondatabase` redirects and Mexico overrides are unchanged.

The landed slim pack hashes the authored research tables plus the accepted tier. Bulky primary-source bytes remain omitted; source rows are projected from the documented catalogue in `docs/phase1/netherlands/Netherlands_Input_Inventory.json`. Do not invent those missing source files.

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

# Staging import of Netherlands only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=netherlands npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, and New Zealand as well.

Expected Netherlands lines:

```
lineage=country-package-netherlands
netherlands_offices=501
netherlands_current=432
netherlands_historical=69
netherlands_municipal=414
netherlands_regional=12
netherlands_national=3
netherlands_other=72
netherlands_selected_histories=1474
netherlands_prospective_events=0
netherlands_result_rows=13050
netherlands_sources=77
netherlands_unresolved=2
netherlands_needs_review=147
```

A second run with unchanged `data/research/netherlands/` + approved `schemas/atlas/tiers/netherlands.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-netherlands.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-netherlands-attempts.sqlite
ATLAS_IMPORT_SCOPE=netherlands npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Expected 2030 dates stay year/month-precision metadata; zero dated upcoming events are authored.
