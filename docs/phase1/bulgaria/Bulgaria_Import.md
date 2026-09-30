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

# Staging import of the Prompt BI additive scope only. Other published lineages stay in place.
# This adds 4 needs_review drafts and keeps the 530 Prompt P office IDs. It does not promote holds.
# Slim land: 0 events, 0 results, 0 sources. It does not deploy this host.
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```

`ATLAS_IMPORT_SCOPE=all` stays on the Prompt P approved classifier at `baseline/Prompt_P/Accepted_Tiers.json` (530 offices, with the Prompt P events and results). It does **not** import the four BI drafts and does **not** promote holds. Do **not** run `all` unless you intend a full re-import of the other approved lineages as well.

Expected Bulgaria lines for `ATLAS_IMPORT_SCOPE=bulgaria`:

```
lineage=country-package-bulgaria
bulgaria_offices=534
bulgaria_current=533
bulgaria_historical=1
bulgaria_municipal=530
bulgaria_inherited=530
bulgaria_needs_review=4
bulgaria_approved=530
bulgaria_selected_histories=0
bulgaria_prospective_events=0
bulgaria_result_rows=0
bulgaria_event_rows=0
bulgaria_sources=0
bulgaria_regional=0
bulgaria_held_offices=3067
```

The 530 inherited office IDs stay the Prompt P municipality-wide IDs. The four drafts (`BG-NATIONAL-ASSEMBLY`, `BG-PRESIDENT-JOINT-TICKET`, `BG-EUROPEAN-PARLIAMENT`, `BG-GRAND-NATIONAL-ASSEMBLY-1990`) publish as `needs_review` with `justin_approved` and `applied` still false. The 3,067 hold rows, including Градец, stay unpublished. A second run with unchanged BI inputs reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```
