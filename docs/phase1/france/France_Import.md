# France import on the VPS

France is lineage `country-package-france`. Justin accepted Prompt AR offices on 2026-09-22 with named holds: **35,112 current + 2,738 historical** (37,850 classifications). Every classification stays `needs_review`. Schema projection: 37,705 municipal / 141 regional / 4 national / 0 other. Draft labels stay T1 4 / T2 45 / T3 96 / T4 37,705. `FR-EP` stays `national_context`. PLM sector councils stay municipal. Current direct executives: 1 (`FR-PRESIDENT`). Mayors stay council-selected. Ordinary EPCI stay excluded. The successor crosswalk stays empty. Current and historical Paris stay separate places. Mayotte stays the single transitional departmental council `FR-CT-976R`. Named holds stay open: G01 through G21, status `open_or_explicit_exclusion`. Do not invent a popular mayor contest, an EPCI popular contest, a guessed commune-nouvelle successor edge, a second Mayotte assembly, or a zero-filled missing result.

The slim pack omits `results.jsonl` (1,193,657 result rows; manifest SHA-256 `b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9`), `events.jsonl` (119,554 events; manifest SHA-256 `dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03`), `reporting-units.jsonl` (173,409 rows; manifest SHA-256 `2a4fedbf8a111719eec65d4ec3bb4261ac2b9c16627adc8f3402d278f7d5b89d`), and `sources/` (87 hashed captures). This importer publishes **0 result rows** and **0 election events**. Office-history coverage and territorial movements are not substitutes for the omitted files. Source rows are not invented from the inventory. The review ZIP SHA-256 `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9` is not this release. The slim candidate fingerprint is `c16f647d9ac17cc021fdc3f07e5f1e951ae2f0a75a2c70878f8a908eb3c5f5e7`. Approved tier bytes are `727dd2d4152b46c65a77ec0fb73d606631dad2c567474fb61a12d7bd596a970a`.

114 authored calendar labels become next-date metadata (112 month-precision 2028-03 rows, the Senate day 2026-09-27, and the presidential year 2027). They are not prospective events. 34,998 current offices stay undated. No alert was created.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import France.

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

# Staging import of France only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=france npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish France.

Expected France lines:

```
lineage=country-package-france
france_offices=37850
france_current=35112
france_historical=2738
france_municipal=37705
france_regional=141
france_national=4
france_other=0
france_selected_histories=0
france_prospective_events=0
france_result_rows=0
france_documented_result_rows_omitted=1193657
france_documented_event_rows_omitted=119554
france_documented_reporting_units_omitted=173409
france_sources=0
france_unresolved=21
france_approved=0
france_needs_review=37850
france_current_municipal_councils=34952
france_current_departmental_councils=95
france_current_regional_councils=14
france_current_single_territorial_assemblies=3
france_current_metropolitan_councils=1
france_current_sector_councils=34
france_direct_executive_offices=1
france_historical_direct_executives=0
france_explicit_predecessor_edges=0
france_research_dates=114
france_calendar_called_days=1
france_geographies=37847
```

A second run with unchanged `data/research/france/` + approved `schemas/atlas/tiers/france.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-france.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-france-attempts.sqlite
ATLAS_IMPORT_SCOPE=france npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros. The 1,193,657 omitted result rows and 119,554 omitted events are not invented. No prospective event is created.
