# Switzerland import on the VPS

Switzerland is lineage `country-package-switzerland`. Justin accepted the Prompt U evidenced subset on 2026-09-19: **2,805 current + 11 historical** (2,816 classifications). Tiers are 2,402 municipal / 52 regional / 2 national / 360 other. **Accepted-with-holds / approved subset only.** Full-register certification remains OPEN.

Holds stay open (do not invent clearances):

- 308 commune executive gaps (VD 284, SZ 24)
- Thin historic/merger archive (586 historical geographies vs 11 historical offices)
- 1,938 communes without positive elected-parliament evidence (citizen-assembly caveat)
- Mode-variance / disputed result rows (16)

Do not invent held commune executives or fabricate merger histories. Slim pack omitted bulky primary-source bytes; do not invent those files.

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

# Staging import of Switzerland only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=switzerland npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, and New Zealand as well.

Expected Switzerland lines:

```
lineage=country-package-switzerland
switzerland_offices=2816
switzerland_current=2805
switzerland_historical=11
switzerland_municipal=2402
switzerland_regional=52
switzerland_national=2
switzerland_other=360
switzerland_selected_histories=1196
switzerland_prospective_events=0
switzerland_result_rows=8094
switzerland_proceedings=136
switzerland_sources=57
switzerland_unresolved=1938
switzerland_held_commune_executives=308
```

A second run with unchanged `data/research/switzerland/` + approved `schemas/atlas/tiers/switzerland.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-switzerland.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-switzerland-attempts.sqlite
ATLAS_IMPORT_SCOPE=switzerland npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Held VD/SZ commune executives are not invented.
