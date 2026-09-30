# Bulgaria import on the VPS

Bulgaria is lineage `country-package-bulgaria`.

`ATLAS_IMPORT_SCOPE=bulgaria` is the Prompt BI additive slim import. It publishes **534** offices: the exact **530** Prompt P municipality-wide IDs plus **4** national/EP/GNA drafts as `needs_review`. `justin_approved` and `applied` stay false on those drafts. It publishes **0** of the **3,067** submunicipal holds, including Градец `BG-SLV11-b88d0d4475-V`. Slim land publishes **0** events, **0** results, and **0** sources. Regional elected offices stay **0**.

`ATLAS_IMPORT_SCOPE=all` stays Prompt P only: **530** accepted municipality-wide offices, with the preserved classifier at `docs/phase1/bulgaria/baseline/Prompt_P/Accepted_Tiers.json`. It must not promote the BI drafts or the holds. The draft `schemas/atlas/tiers/bulgaria.json` does not abort that preflight.

Do not invent a regional layer. `/electiondatabase` redirects and Mexico overrides are unchanged.

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

# Prompt BI additive import. Does not publish holds and does not run inside `all`.
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```

On a database that already has the Prompt P Bulgaria release, this command copies `atlas.sqlite` to the staging file and then **upgrades that copy in place**. It keeps the 530 office rows, inserts the 4 drafts, and deletes only Bulgaria events, results, sources, and dates. It does not clear the office table and it does not rebuild derived rows or search postings for the rest of the atlas. The first run should log `bulgaria_write_mode=additive` and then finish. A second run with the same inputs logs `bulgaria_write_mode=reuse`.

Do not wait out a multi-tens-of-minutes silent `pread64` after the staging file appears. That pattern was the old clear-and-reload: SQLite scanned global child tables once per deleted Bulgaria office, with the rollback journal stuck around the size of those Bulgaria rows, and then failed a foreign key check against derived seat rows.

Seat slugs and search text for the 4 new drafts are not rebuilt here. The office count does not depend on that rebuild. `npm run derive:atlas` still rewrites derived tables for the whole database; it is not part of this upgrade.

Do **not** run `ATLAS_IMPORT_SCOPE=all` to promote BI drafts or holds. `all` reloads Prompt P only (530 offices) and also re-imports the other published lineages.

Expected Prompt BI lines:

```
lineage=country-package-bulgaria
bulgaria_offices=534
bulgaria_current=533
bulgaria_historical=1
bulgaria_municipal=530
bulgaria_needs_review=4
bulgaria_approved=530
bulgaria_selected_histories=0
bulgaria_prospective_events=0
bulgaria_result_rows=0
bulgaria_sources=0
bulgaria_regional=0
bulgaria_held_offices=3067
```

A second run with unchanged BI inputs reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```
