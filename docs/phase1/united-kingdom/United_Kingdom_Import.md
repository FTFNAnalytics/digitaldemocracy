# United Kingdom import on the VPS

The United Kingdom is lineage `country-package-united-kingdom`. Justin accepted Prompt AU offices on 2026-09-23 (America/Edmonton) with named holds: **482 current + 2 shadow (`current_shadow`) + 26 historical-only** (510 classifications). Numeric draft tiers stay **2 / 5 / 76 / 427**. Every published classification stays `needs_review`. Per-office file `review_status` stays `draft_unapproved` and `justin_approved` stays false. The schema column is only the Atlas interchange of those numeric tiers (tier 1 `national_context`, tiers 2 and 3 `regional`, tier 4 `municipal`, other 0). It does not replace the numeric label. Operational principal councils stay 382. Current direct executives stay 64 (27 direct mayors + 37 standalone PCC/PFCC). The parish/town subset stays 27. The two Surrey shadow authorities stay `current_shadow` and outside the 382. SQL `office_status` stores shadow rows as `current` because the schema has no shadow value; `state_note` keeps `current_shadow`. The historical EP delegation stays historical-only. No post-Brexit EP office, Crown Dependency or BOT office, Lords contest, monarch contest, or Prime Minister contest is created. Reorganisation labels do not become successor edges. Named holds stay open: G01 through G27. Do not invent a parish universe, a successor edge, a current EP office, or a repaired result.

The slim land omits `sources/`, `results.jsonl.gz`, `events.jsonl`, and reporting units. `docs/phase1/united-kingdom/data/counts.json` still records the full-pack figures (899 events / 103,648 results). This importer publishes **0 result rows** and **0 election events**. It does not emit documented-omitted totals for those missing files. Office names and types come from the checked-in office register. Source rows are not invented from `source-inventory.jsonl` or `SHA256SUMS`. The review ZIP SHA-256 `57dc361fe4043f8a5cdc430f482864f0fcd51cea6ef90319c74c85ca7cba1303` is not this release. Checked-in tier bytes are `1f268369474f533b4af58e80b997176d7dac676f13ccdace2be7ec1111457334`.

One explicit Isles of Scilly next date (`2029-05-03`) is retained from the office register. It is not a prospective event and it does not create an alert. Every other next date stays unknown. `research_coverage_complete` stays false.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import the United Kingdom.

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

# Staging import of the United Kingdom only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=united_kingdom npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish the United Kingdom.

Expected United Kingdom lines:

```
lineage=country-package-united-kingdom
united_kingdom_offices=510
united_kingdom_current=482
united_kingdom_current_shadow=2
united_kingdom_historical=26
united_kingdom_draft_tier_1=2
united_kingdom_draft_tier_2=5
united_kingdom_draft_tier_3=76
united_kingdom_draft_tier_4=427
united_kingdom_schema_national=2
united_kingdom_schema_regional=81
united_kingdom_schema_municipal=427
united_kingdom_schema_other=0
united_kingdom_selected_histories=0
united_kingdom_prospective_events=0
united_kingdom_result_rows=0
united_kingdom_event_rows=0
united_kingdom_sources=0
united_kingdom_unresolved=27
united_kingdom_approved=0
united_kingdom_needs_review=510
united_kingdom_principal_councils=382
united_kingdom_england_principal=317
united_kingdom_northern_ireland_principal=11
united_kingdom_scotland_principal=32
united_kingdom_wales_principal=22
united_kingdom_direct_executive_offices=64
united_kingdom_direct_mayors=27
united_kingdom_standalone_pcc=37
united_kingdom_parish_town_councils=27
united_kingdom_historical_direct_executives=7
united_kingdom_explicit_predecessor_edges=0
united_kingdom_research_dates=1
united_kingdom_geographies=496
```

A second run with unchanged docs + supplied `schemas/atlas/tiers/united-kingdom.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-united-kingdom.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-united-kingdom-attempts.sqlite
ATLAS_IMPORT_SCOPE=united_kingdom npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. The Isles of Scilly 2029-05-03 date stays next-date metadata, not a prospective event. Missing results stay gaps, not zeros. The omitted result and event files are not invented and are not given omitted-total counters. No successor edge is created.
