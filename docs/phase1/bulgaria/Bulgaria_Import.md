# Bulgaria import on the VPS

Bulgaria is lineage `country-package-bulgaria`. Justin accepted **530** municipality-wide offices (265 Mayor + 265 Municipal council; `human_review_required: false`). The **3,067** district/village rows stay held (`submunicipal_scope`) and must not publish. Градец `BG-SLV11-b88d0d4475-V` and the qualification-change F/X rows remain retained research only. Do not invent a regional layer.

`/electiondatabase` redirects and Mexico overrides are unchanged.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Armenia/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Bulgaria only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, LatAm, and New Zealand as well.

Expected Bulgaria lines:

```
lineage=country-package-bulgaria
bulgaria_offices=530
bulgaria_municipal=530
bulgaria_selected_histories=1590
bulgaria_prospective_events=0
bulgaria_result_rows=10343
bulgaria_regional=0
bulgaria_held_offices=3067
```

A second run with unchanged package + approved `schemas/atlas/tiers/bulgaria.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```
