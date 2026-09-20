# Austria import on the VPS

Austria is lineage `country-package-austria`. Approved tiers are 2,034 municipal + 4 regional (2,038 offices). The St. Georgen hold `AT-OOE-41119-M::2015::` stays open: both first-ballot and final-ballot claims are retained; do not invent a clearance.

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

# Staging import of Austria only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=austria npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, LatAm, and New Zealand as well.

Expected Austria lines:

```
lineage=country-package-austria
austria_offices=2038
austria_municipal=2034
austria_selected_histories=5956
austria_prospective_events=0
austria_result_rows=16336
austria_regional=4
```

A second run with unchanged package + approved `schemas/atlas/tiers/austria.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=austria npm run import:atlas
```

Poison rollback, rename-failure discard, and coverage-change release run as `npm run test:austria-rollback` (outside Vitest because two full Austria imports exceed the 60s worker RPC timeout).
