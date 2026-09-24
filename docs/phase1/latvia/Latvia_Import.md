# Latvia import on the VPS

Latvia is lineage `country-package-latvia`. Justin accepted Prompt AG offices on 2026-09-21 with named holds: **45 current + 121 historical** (166 classifications). Tiers are 163 municipal / 0 regional / 2 national / 1 other. Current scope is 42 municipal councils (7 state-city + 35 novadi), Saeima, the indirect presidency, and the Latvia EP delegation. Current direct-executive offices: 0. Named holds stay open: LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, and LV-G09. Do not invent successor edges, popular mayors, executive-director ballots, presidential popular ballots, EP replacement contests, or a choice among the seven competing 2022 percentage claims. The presidency stays Saeima-indirect. The 121 historical rows are identity records, not an abolished-council count.

The slim pack publishes `results.json` (1,383 rows). Raw `sources/` and identity vectors were omitted. This importer does not invent those bytes. Seven 2022 Saeima shares stay disputed, with both claims retained and no alternate selected.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Latvia.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production. This PR does not deploy to the VPS.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Belgium/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Latvia only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=latvia npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Latvia.

Expected Latvia lines:

```
lineage=country-package-latvia
latvia_offices=166
latvia_current=45
latvia_historical=121
latvia_municipal=163
latvia_regional=0
latvia_national=2
latvia_other=1
latvia_selected_histories=216
latvia_prospective_events=1
latvia_result_rows=1383
latvia_proceedings=2
latvia_sources=188
latvia_unresolved=16
latvia_approved=42
latvia_needs_review=124
latvia_current_councils=42
latvia_current_direct_executive_offices=0
```

`latvia_unresolved=16` is the nine open holds LV-G01–LV-G09 plus the seven open 2022 share-conflict tokens. A second run with unchanged `data/research/latvia/` + approved `schemas/atlas/tiers/latvia.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-latvia.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-latvia-attempts.sqlite
ATLAS_IMPORT_SCOPE=latvia npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. The only prospective event is the called Saeima contest on 2026-10-03. PRES2003 stays year precision.
