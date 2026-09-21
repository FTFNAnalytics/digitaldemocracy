# Finland import on the VPS

Finland is lineage `country-package-finland`. Justin accepted Prompt Z offices on 2026-09-19 with named holds: **333 current + 170 historical** (503 classifications). Tiers are 478 municipal / 22 regional / 2 national / 1 other. Named holds stay open: FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and FI-MISSING-RESULTS. Do not invent merger successors, early Åland contests, wellbeing predecessors, missing result scalars, popular appointed-manager / prime-minister / cabinet rows, or a Helsinki county office.

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

# Staging import of Finland only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=finland npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Belgium, Bosnia, Bulgaria, LatAm, New Zealand, and Denmark as well.

Expected Finland lines:

```
lineage=country-package-finland
finland_offices=503
finland_current=333
finland_historical=170
finland_municipal=478
finland_regional=22
finland_national=2
finland_other=1
finland_selected_histories=5241
finland_prospective_events=0
finland_result_rows=37471
finland_proceedings=11
finland_sources=67
finland_unresolved=7
finland_approved=332
finland_needs_review=171
```

A second run with unchanged `data/research/finland/` + approved `schemas/atlas/tiers/finland.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-finland.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-finland-attempts.sqlite
ATLAS_IMPORT_SCOPE=finland npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Slim-pack bulky source bytes are not invented; `sources.json` is the catalogue. Next-date metadata is not a prospective event. Compact `results.json` is hashed into the fingerprint; `retained_input.payload_json` is left null so the 80MB extract is not duplicated in SQLite.
