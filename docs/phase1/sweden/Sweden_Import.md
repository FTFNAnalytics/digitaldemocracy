# Sweden import on the VPS

Sweden is lineage `country-package-sweden`. Justin accepted all Prompt Y offices on 2026-09-19 with named holds: **313 current + 7 historical** (320 classifications). Tiers are 292 municipal / 25 regional / 1 national / 2 other. Named holds stay open: SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS, SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, and SE-FARGELANDA-1973. Do not invent a second Gotland regional office, popular kommunalråd / prime-minister / cabinet rows, or fabricate 2026 final local counts.

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

# Staging import of Sweden only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=sweden npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, New Zealand, Denmark, and the other approved lineages as well.

Expected Sweden lines:

```
lineage=country-package-sweden
sweden_offices=320
sweden_current=313
sweden_historical=7
sweden_municipal=292
sweden_regional=25
sweden_national=1
sweden_other=2
sweden_selected_histories=4639
sweden_prospective_events=310
sweden_result_rows=40991
sweden_sources=356
sweden_unresolved=7
sweden_approved=310
sweden_needs_review=10
```

`sweden_prospective_events=310` are authored 2026 local vectors with `selected_history_role=none` and `legal_outcome=preliminary`. They are not invented next-date events. 2030 / EP 2029 remain year-precision office metadata.

A second run with unchanged `data/research/sweden/` + approved `schemas/atlas/tiers/sweden.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-sweden.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-sweden-attempts.sqlite
ATLAS_IMPORT_SCOPE=sweden npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue.
