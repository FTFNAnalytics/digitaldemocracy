# Czechia import on the VPS

Czechia is lineage `country-package-czechia`. Justin accepted all Prompt V offices on 2026-09-20 with named holds: **6,411 current + 13 historical** (6,424 classifications). Tiers are 6,257 municipal / 14 regional / 3 national / 150 other. Named holds stay open: MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, and DATES-AND-NEXT-CYCLES. Do not invent a second Prague office, council-selected mayor or governor rows, historical successors, or municipal vote-share corrections.

`/electiondatabase` redirects and Mexico overrides are unchanged. This note does not deploy to the VPS.

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

# Staging import of Czechia only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=czechia npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, New Zealand, Denmark, Sweden, and the other approved lineages as well.

Expected Czechia lines:

```
lineage=country-package-czechia
czechia_offices=6424
czechia_current=6411
czechia_historical=13
czechia_municipal=6257
czechia_regional=14
czechia_national=3
czechia_other=150
czechia_boroughs=149
czechia_prague=1
czechia_selected_histories=38749
czechia_prospective_events=6421
czechia_result_rows=0
czechia_proceedings=934
czechia_sources=221
czechia_unresolved=10
czechia_approved=6269
czechia_needs_review=155
```

`czechia_result_rows=0` because the slim land omits `results.jsonl.gz`. Those 169,614 documentary rows are not invented. Municipal PROCHLSTR percentages stay unprojected under MUNICIPAL-RECALCULATED-PERCENT. `czechia_prospective_events=6421` are authored `kv:20261009` vectors with `selected_history_role=none`. They are not certified outcomes.

A second run with unchanged `data/research/czechia/` + approved `schemas/atlas/tiers/czechia.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-czechia.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-czechia-attempts.sqlite
ATLAS_IMPORT_SCOPE=czechia npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes and result rows are not invented; `sources.json` is the catalogue. `events.json` is read from `events.json.gz` only.
