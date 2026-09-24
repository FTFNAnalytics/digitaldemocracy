# Lithuania import on the VPS

Lithuania is lineage `country-package-lithuania`. Justin accepted Prompt AH offices on 2026-09-22 with named holds: **123 current + 0 recovered historical** (123 classifications). Draft tiers stay `draft_for_human_review` and are not rewritten: 120 municipal / 0 regional / 2 national / 1 other. Every classification is `needs_review`. Current scope is 60 municipal councils, 60 directly elected mayors, Seimas, the directly elected president, and the Lithuania EP delegation. Direct executives: 61. Named holds stay open: LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, LT-PARTY-PRECISION, LT-NEXT-AND-LEGAL, and LT-EXCLUSIONS. Do not invent successor edges, missing result zeros, a 2015 mayor ballot day, deputy or director offices, party mappings, or a correction of the malformed runoff invalid text `1,7205`. The presidency is directly popular. 2019 is one cycle with a first round and a runoff. Eleven percentage shares stay disputed.

`historical_office_universe_complete` and `research_coverage_complete` stay false. Zero historical offices is a recovered-record count, not a closed historical universe. Mayor history is 19 winner observations from 2019, not complete returns. Council result vectors are absent and stay absent.

The slim pack omits raw `sources/` and `validate.py`. This importer publishes the 53-row `sources.json` catalogue and does not invent those bytes. The documentary full-pack fingerprint `921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918` includes the omitted artifacts and is not this release. The slim candidate fingerprint is `dfabafab9ca296bc0a1b63cd34cfbe77d76cf732b99de592d338e73cec4155eb`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Lithuania.

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

# Staging import of Lithuania only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=lithuania npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Lithuania.

Expected Lithuania lines:

```
lineage=country-package-lithuania
lithuania_offices=123
lithuania_current=123
lithuania_historical=0
lithuania_municipal=120
lithuania_regional=0
lithuania_national=2
lithuania_other=1
lithuania_selected_histories=30
lithuania_prospective_events=0
lithuania_result_rows=130
lithuania_proceedings=25
lithuania_sources=53
lithuania_unresolved=21
lithuania_approved=0
lithuania_needs_review=123
lithuania_current_councils=60
lithuania_current_direct_executive_offices=61
```

A second run with unchanged `data/research/lithuania/` + draft `schemas/atlas/tiers/lithuania.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-lithuania.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-lithuania-attempts.sqlite
ATLAS_IMPORT_SCOPE=lithuania npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros.
