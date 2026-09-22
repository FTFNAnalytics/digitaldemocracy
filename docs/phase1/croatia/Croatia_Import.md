# Croatia import on the VPS

Croatia is lineage `country-package-croatia`. Justin accepted Prompt W offices on 2026-09-20 with named holds: **1,234 current + 11 historical** (1,245 classifications). Tiers are 1,187 municipal / 55 regional / 2 national / 1 other. Named holds stay open: CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY, TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017, TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS, PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY. Zagreb stays one dual city/county pair (`HR-Z21`), separate from Zagrebačka županija. Do not invent a second Zagreb body, successor edges, seat allocations, elected flags, party mappings, Tar-Vabriga result rows, or a Biskupija 2017 deputy return.

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

# Staging import of Croatia only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=croatia npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, New Zealand, Denmark, Sweden, Finland, and the other approved lineages as well.

Expected Croatia lines:

```
lineage=country-package-croatia
croatia_offices=1245
croatia_current=1234
croatia_historical=11
croatia_municipal=1187
croatia_regional=55
croatia_national=2
croatia_other=1
croatia_selected_histories=3833
croatia_prospective_events=0
croatia_result_rows=15907
croatia_proceedings=2418
croatia_sources=4367
croatia_unresolved=13
croatia_approved=1152
croatia_needs_review=93
croatia_executives=577
croatia_deputies=79
croatia_assemblies=576
```

`croatia_prospective_events=0` because every next date is unknown. The one `selected_history_role=none` row is the Tar-Vabriga 2025 placeholder, not a future contest, and it has zero typed result rows. `croatia_unresolved=13` keeps the named holds open. Typed seats and elected flags stay unknown.

A second run with unchanged `data/research/croatia/` + approved `schemas/atlas/tiers/croatia.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-croatia.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-croatia-attempts.sqlite
ATLAS_IMPORT_SCOPE=croatia npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue. `events.json` is read from `events.json.gz` only. `results.jsonl.gz` is the typed aggregate register (15,907 rows).
