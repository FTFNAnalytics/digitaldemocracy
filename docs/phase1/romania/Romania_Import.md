# Romania import on the VPS

Romania is lineage `country-package-romania`. Justin accepted Prompt AL offices on 2026-09-22 with named holds: **6,460 current + 0 historical-only** (6,460 classifications). Every classification stays `needs_review`: 6,372 municipal / 84 regional / 3 national / 1 other. Current scope is 3,180 ordinary local UAT council/mayor pairs, 41 județ councils, 41 county presidents, Bucharest General Council, the Bucharest general mayor, six sector council/mayor pairs, Camera Deputaților, Senat, the popularly elected president, and the Romania EP delegation. Councils/assemblies: 3,230. Direct executives: 3,229. Named holds stay open: RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07. Do not invent local result vectors, historical-only offices, successor or merger edges, a 2016 county-president popular contest, neighbourhood boards, or a successor from the annulled 2024 presidential first round to the 2025 rerun.

`RO-PRES` stays directly elected. `RO-PRES-2024-R1` stays `annulled`. Rounds stay separate events. No proceeding and no supersession edge is created. `RO-EP` stays `other` with `direct_election=false` as supplied. The explicit 0-seat “Other parties” row is retained. Missing votes stay null. 2014/2019 EP vectors stay absent.

`historical_office_universe_complete` is not claimed. Zero historical-only offices is a recovered-record count, not a closed historical universe (RO-G06).

The slim pack carries `events.json.gz` only. This importer does not invent an uncompressed `events.json` twin. The review ZIP SHA-256 `4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf` is not this release. The slim candidate fingerprint is `6f791ae25a838d7d24a3a660d6e60b38192353c619d44b8c0367e181528376a9`. Approved tier bytes are `0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Romania.

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

# Staging import of Romania only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=romania npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Romania.

Expected Romania lines:

```
lineage=country-package-romania
romania_offices=6460
romania_current=6460
romania_historical=0
romania_municipal=6372
romania_regional=84
romania_national=3
romania_other=1
romania_selected_histories=19343
romania_prospective_events=0
romania_result_rows=23
romania_proceedings=0
romania_sources=6
romania_unresolved=7
romania_approved=0
romania_needs_review=6460
romania_current_councils=3230
romania_current_direct_executive_offices=3229
romania_geographies=3229
```

A second run with unchanged `data/research/romania/` + approved `schemas/atlas/tiers/romania.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-romania.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-romania-attempts.sqlite
ATLAS_IMPORT_SCOPE=romania npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros.
