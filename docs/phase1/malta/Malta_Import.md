# Malta import on the VPS

Malta is lineage `country-package-malta`. Justin accepted Prompt AP offices on 2026-09-22 with named holds: **213 current + 2 historical** (215 classifications). Every classification stays `needs_review`: 204 municipal / 8 regional / 2 national / 1 other. Current scope is 68 local councils (54 Malta / 14 Gozo), 68 mayors, 68 deputy mayors, 6 indirect regional presidents, the House of Representatives (`MT-HOR`), the President of Malta (`MT-PRESIDENT`), and one Malta EP delegation (`MT-EP`, drafted `other`). Historical scope is the Gozo Civic Council and its president. Standalone direct-executive offices: 0. Mayors and deputy mayors stay `conditional_first_preference_rule_or_council_election` with `standalone_popular_executive_ballot=false`. The President stays `indirect_House_resolution`. Four 2021 regional sole nominees stay nominations. The successor crosswalk stays empty. Named holds stay open: Presidential indirect election, STV transfers, Post-election changes, Mayoral selection, Local creation and boundaries, Regional bodies, Gozo Civic Council, European Parliament, Certified versus preliminary, and Exact inherited field contract. Do not invent a popular presidential or mayor ballot, an STV transfer paper, a House division tally, or a Gozo successor edge.

`MT-EP` stays `other`. `MT-HOR` and `MT-PRESIDENT` stay `national_context`. Legal outcomes stay `unknown` (certified versus preliminary is open). Calendar `exact_poll_date` values stay null and are not prospective events.

The slim pack omits `data/results.json` (4,084 result rows; manifest SHA-256 `4ecb57ee354b0cc5b9787abae57342cc08fb53eb3c430a2d061e00d8a8bd187f`), `data/stv-counts.json` (64,204 observations; manifest SHA-256 `3fec21da7cd4461bf548df0fb4d1d7c623b62d551b0ce3d91d09a29a0c51693b`), and `sources/` (1,139 hashed captures). This importer publishes **0 result rows**. `count-totals.json` (7,118 rows), `party-aggregates-derived.json`, and `reporting-units.json` are not substitutes for the omitted files. Source rows are not invented from the inventory. The review ZIP SHA-256 `ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb` is not this release. The slim candidate fingerprint is `65d2a39b91f07164afd5f12f738252dbe26768bd28bfba2ef1613d87d5ffd338`. Approved tier bytes are `49e0238e4c00ede6839a8c9d77fb11fe43646a8add8c906320da696cad1839c8`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Malta.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production. This PR does not deploy.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Belgium/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Malta only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=malta npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Malta.

Expected Malta lines:

```
lineage=country-package-malta
malta_offices=215
malta_current=213
malta_historical=2
malta_municipal=204
malta_regional=8
malta_national=2
malta_other=1
malta_selected_histories=223
malta_prospective_events=0
malta_result_rows=0
malta_documented_result_rows_omitted=4084
malta_documented_stv_count_observations_omitted=64204
malta_documented_numeric_first_preference_rows_omitted=4050
malta_sources=0
malta_unresolved=10
malta_approved=0
malta_needs_review=215
malta_current_local_councils=68
malta_malta_local_councils=54
malta_gozo_local_councils=14
malta_current_mayors=68
malta_current_deputy_mayors=68
malta_current_indirect_regional_presidents=6
malta_direct_executive_offices=0
malta_explicit_predecessor_edges=0
malta_regional_nominations=4
malta_geographies=76
```

A second run with unchanged `data/research/malta/` + approved `schemas/atlas/tiers/malta.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-malta.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-malta-attempts.sqlite
ATLAS_IMPORT_SCOPE=malta npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros. The 4,084 omitted result rows and 64,204 omitted STV observations are not invented. Authored events are the selected history of the accepted register. No prospective event is created.
