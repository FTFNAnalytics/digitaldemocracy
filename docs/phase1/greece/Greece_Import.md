# Greece import on the VPS

Greece is lineage `country-package-greece`. Justin accepted Prompt AM Rebuilt offices on 2026-09-22 with named holds: **693 current + 10 historical** (703 classifications). Every classification stays `needs_review`: 674 municipal / 26 regional / 2 national / 1 other. Current scope is 332 municipal councils, 332 direct mayors, 13 regional councils, 13 direct governors, Parliament (`GR-PARL`), the indirect presidency (`GR-PRES`), and one Greek EP delegation (`GR-EP`, drafted `other`). Current direct executives: 345. Historical direct executives: 5. Named holds stay open: GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09, and GR-G10. Fourteen local source holds stay open (Messini 2014 `2014::dhm_d::9255` and `2019::snom_n::1` through `2019::snom_n::13`). Do not invent Kallikratis or Kleisthenis successor edges, PM, cabinet, or prefect rows, a popular presidential ballot, or zero-filled missing results.

`GR-PRES` stays `parliamentary_indirect` with `direct_executive=false`. Presidential shares stay absent. `GR-EP` stays `other`. The 1981 EP event stays without a return vector. The 1979–1984 outgoing snapshot is retained and is not imported as an election result. Messini 2014 stays a 9,236–9,236 tie with `elected_flag` null and 17 of 33 council seats. GR-G04 stays `partially_resolved` as supplied and is not closed. GR-G09 stays `review_required`.

`historical_office_universe_complete` is not claimed. The 10 historical offices are the five abolished municipal council/mayor pairs, not a closed pre-2010 universe (GR-G08).

The slim pack omits `data/research/greece/sources/` (2,807 hashed artifacts). This importer does not invent source rows from `source_id` strings. Result rows are read from `results.jsonl.gz` and checked against `ballot-observations.jsonl.gz` (8,021 distinct observations, 14,004 projections). The review ZIP SHA-256 `356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb` is not this release. The slim candidate fingerprint is `cd6102c446ca8899fc84849521d6c706bcc85c640c05861458ac709c4edec436`. Approved tier bytes are `97c2587226c8e7cb1bf50233e6ff23844eeda52437a6e852efb41266dd3c88b6`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Greece.

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

# Staging import of Greece only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=greece npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Greece.

Expected Greece lines:

```
lineage=country-package-greece
greece_offices=703
greece_current=693
greece_historical=10
greece_municipal=674
greece_regional=26
greece_national=2
greece_other=1
greece_selected_histories=2774
greece_prospective_events=0
greece_result_rows=14004
greece_proceedings=3555
greece_sources=0
greece_unresolved=24
greece_approved=0
greece_needs_review=703
greece_current_direct_executive_offices=345
greece_historical_direct_executive_offices=5
greece_current_municipal_councils=332
greece_current_mayors=332
greece_current_regional_councils=13
greece_current_governors=13
greece_geographies=351
greece_distinct_observations=8021
```

A second run with unchanged `data/research/greece/` + approved `schemas/atlas/tiers/greece.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-greece.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-greece-attempts.sqlite
ATLAS_IMPORT_SCOPE=greece npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros. Authored held events are the selected history of the accepted register. No prospective event is created.
