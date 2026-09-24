# Italy import on the VPS

Italy is lineage `country-package-italy`. Justin accepted Prompt AT offices on 2026-09-23 (America/Edmonton) with named holds: **15,917 current + 696 historical-only + 8 statutory pending FVG** (16,621 classifications). Numeric draft tiers stay **4 / 38 / 11 / 16,568**. Every published classification stays `needs_review`. Per-office file `review_status` stays `unapproved_draft` and `justin_approved` stays false. The schema column is only the Atlas interchange of those numeric tiers (tier 1 `national_context`, tiers 2 and 3 `regional`, tier 4 `municipal`, other 0). It does not replace the numeric label. Current direct executives stay 7,992. Current collective bodies stay 7,924. The indirect presidency stays a national office with no popular contest. Valle d’Aosta and Trentino-Alto Adige have no invented regional president. Bolzano has no invented direct provincial president. Ordinary Delrio provincial and metropolitan bodies stay out of the popular register. The eight FVG offices stay `statutory_pending_first_election`. SQL `office_status` stores them as `current` because the schema has no pending value; `state_note` keeps `statutory_pending_first_election`. They are not counted in `italy_current`. Named holds stay open: IT-G01 through IT-G19. Do not invent circoscrizioni, Delrio popular provinces, FVG election dates, runoff rows, repaired Bolzano arithmetic, missing results, or hold resolutions.

The slim land omits `sources/`, `results.jsonl.gz`, `events.jsonl`, reporting units, the calendar, the territorial register, and office-history coverage. `docs/phase1/italy/data/counts.json` still records the full-pack figures (515 events / 606,051 results). This importer publishes **0 result rows** and **0 election events**. It does not emit documented-omitted totals for those missing files. Office names and types come from the checked-in office register. Source rows are not invented from `data/source-inventory.json`. Successor edges stay 0: the office register does not document predecessor or successor links, and fusioni/Delrio dispositions are not turned into edges. The review ZIP SHA-256 `4e8a6b6d0006727e2af2b10fb4054679861656b94ef4147c8ff927c56396809d` is not this release. Checked-in tier bytes are `d286962e262a2fbf35deed41b96a98c11a0c7a4d88de239420a23e5fd6aa55fb`.

No next ordinary poll date is supplied on the office register. None is invented, including for the pending FVG offices. `research_coverage_complete` stays false.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Italy.

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

# Staging import of Italy only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=italy npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Italy.

Expected Italy lines:

```
lineage=country-package-italy
italy_offices=16621
italy_current=15917
italy_historical=696
italy_pending_fvg=8
italy_draft_tier_1=4
italy_draft_tier_2=38
italy_draft_tier_3=11
italy_draft_tier_4=16568
italy_schema_national=4
italy_schema_regional=49
italy_schema_municipal=16568
italy_schema_other=0
italy_selected_histories=0
italy_prospective_events=0
italy_result_rows=0
italy_event_rows=0
italy_sources=0
italy_unresolved=19
italy_approved=0
italy_needs_review=16621
italy_current_municipal_councils=7894
italy_current_direct_mayors=7894
italy_deputy_mayors=74
italy_regional_councils=20
italy_direct_regional_presidents=18
italy_autonomous_provincial_councils=2
italy_direct_autonomous_provincial_presidents=1
italy_firenze_quartiere_offices=10
italy_ordinary_provincial_popular_offices=0
italy_direct_executive_offices=7992
italy_current_collective_bodies=7924
italy_historical_direct_executives=348
italy_pending_direct_executives=4
italy_explicit_predecessor_edges=0
italy_research_dates=0
italy_geographies=8273
```

A second run with unchanged docs + supplied `schemas/atlas/tiers/italy.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-italy.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-italy-attempts.sqlite
ATLAS_IMPORT_SCOPE=italy npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. Missing results stay gaps, not zeros. The omitted result and event files are not invented and are not given omitted-total counters. No successor edge is created. Pending FVG offices are not given an election date.
