# Luxembourg import on the VPS

Luxembourg is lineage `country-package-luxembourg`. Justin accepted Prompt AO offices on 2026-09-22 with named holds: **102 current + 28 historical** (130 classifications). Every classification stays `needs_review`: 128 municipal / 0 regional / 1 national / 1 other. Current scope is 100 communal councils, the Chambre des Députés (`LU-PARLIAMENT`), and one Luxembourg EP delegation (`LU-EP`, drafted `other`). Historical scope is 28 predecessor communal councils. Direct executives: 0. Regional offices: 0. Named holds stay open: LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and LU-G11. LU-G01 (Grand Duke) and LU-G02 (mayors) stay resolved exclusions. The merger crosswalk stays 28 explicit predecessor edges. Do not invent a Grand Duke or mayor popular contest, a guessed merger edge, the missing 1994 EP Grevenmacher LSAP votes, or zero-filled gaps.

`LU-EP` stays `other`. `LU-PARLIAMENT` stays `national_context`. The 1994 EP event stays a year-only label with no result rows. Berdorf 2023 (`LU-C-berdorf@2023-10-08`) stays `official_proclamation` in the source row and `legal_outcome=unknown`. LU-G09 stays `resolved_with_capture_limit` as supplied and is not closed. Year-only national and EP labels stay year precision. Unknown merger effective days stay null.

The slim pack omits `data/results.json` (48,197 result observations; manifest SHA-256 `0f6f5d1fd3b1d3d15518ea367327a2a7520ff0b34bc744975b13ab33c144f329`) and `sources/` (388 hashed captures). This importer publishes **0 result rows**. `observations.json` is 702 source-statistic envelopes and is not a substitute for `results.json`. Source rows are not invented from the inventory. The review ZIP SHA-256 `93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da` is not this release. The slim candidate fingerprint is `6635461e4efa9b22ef1aa346e4577c9355912b6e48bceb66a27a7609ad5092ba`. Approved tier bytes are `e1d109b024c466677ef084838192bb2bad101c8ad12010b28f6d35879c736169`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Luxembourg.

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

# Staging import of Luxembourg only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=luxembourg npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Luxembourg.

Expected Luxembourg lines:

```
lineage=country-package-luxembourg
luxembourg_offices=130
luxembourg_current=102
luxembourg_historical=28
luxembourg_municipal=128
luxembourg_regional=0
luxembourg_national=1
luxembourg_other=1
luxembourg_selected_histories=438
luxembourg_prospective_events=0
luxembourg_result_rows=0
luxembourg_documented_result_rows_omitted=48197
luxembourg_observation_envelopes=702
luxembourg_sources=0
luxembourg_unresolved=11
luxembourg_approved=0
luxembourg_needs_review=130
luxembourg_current_communal_councils=100
luxembourg_historical_communal_councils=28
luxembourg_direct_executive_offices=0
luxembourg_explicit_predecessor_edges=28
luxembourg_geographies=129
```

A second run with unchanged `data/research/luxembourg/` + approved `schemas/atlas/tiers/luxembourg.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-luxembourg.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-luxembourg-attempts.sqlite
ATLAS_IMPORT_SCOPE=luxembourg npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros. The 48,197 omitted result rows are not invented. Authored events are the selected history of the accepted register. No prospective event is created.
