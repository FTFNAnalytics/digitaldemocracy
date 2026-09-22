# Estonia import on the VPS

Estonia is lineage `country-package-estonia`. Justin accepted Prompt AF offices on 2026-09-21 with named holds: **81 current + 200 historical** (281 classifications). Tiers are 278 municipal / 0 regional / 2 national / 1 other. Current scope is 78 municipal councils, Riigikogu, the indirect presidency, and the Estonia EP delegation. Current direct-executive offices: 0. Named holds stay open: EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and EE-G09. Do not invent mayors, successor edges, a 2021 presidential row, EP replacement contests, a 625,334 vs 625,336 correction, date refinements, or nonadditive candidate shares. The presidency stays indirect except the evidenced 1992 popular-ballot exception.

The slim pack omits `results.json` (49,504 rows), identity vectors, and raw `sources/`. This importer publishes **0 result rows** and does not invent those bytes. `nonadditive-list-summaries.json` stays a retained input.

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

# Staging import of Estonia only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=estonia npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, Netherlands, Switzerland, LatAm, New Zealand, Denmark, Sweden, and Finland as well.

Expected Estonia lines:

```
lineage=country-package-estonia
estonia_offices=281
estonia_current=81
estonia_historical=200
estonia_municipal=278
estonia_regional=0
estonia_national=2
estonia_other=1
estonia_selected_histories=464
estonia_prospective_events=0
estonia_result_rows=0
estonia_proceedings=24
estonia_sources=223
estonia_unresolved=9
estonia_approved=79
estonia_needs_review=202
estonia_current_councils=78
estonia_current_direct_executive_offices=0
```

A second run with unchanged `data/research/estonia/` + approved `schemas/atlas/tiers/estonia.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-estonia.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-estonia-attempts.sqlite
ATLAS_IMPORT_SCOPE=estonia npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Next-date metadata is not a prospective event. Year-only 2027/2029 next dates stay year precision.
