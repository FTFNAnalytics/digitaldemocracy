# Germany import on the VPS

Germany is lineage `country-package-germany`. Justin accepted Prompt AS offices on 2026-09-22 with named holds: **21,960 current + 670 historical** (22,630 classifications). Numeric jurisdiction tiers stay **3 / 20 / 552 / 22,055**. Every published classification stays `needs_review`. Per-office file `review_status` stays `draft_unapproved` and `justin_approved` stays false. The schema column is only the Atlas interchange of those numeric tiers (tier 1 `national_context`, tiers 2 and 3 `regional`, tier 4 `municipal`, other 0). It does not replace the numeric label. Bundespräsident stays indirect. Bundesrat, Land executives, Baden-Württemberg and Schleswig-Holstein Landräte, and Lower Saxony member-municipal mayors stay absent. Schleswig-Holstein stays at 86 verified direct mayors. The 26 territorial relations do not become successor edges. Named holds stay open: DE-G01 through DE-G23. Do not invent a missing Schleswig-Holstein mayor, a subdivision roster, a successor edge, or a repaired seat panel.

The slim land has no `data/research/germany/` tree. `results.jsonl`, `events.jsonl`, reporting units, the office register, the calendar, and `sources/` are omitted. This importer publishes **0 result rows** and **0 election events**. It does not emit documented-omitted totals for those missing files. Office ids in `schemas/atlas/tiers/germany.json` are the published identities. Source rows are not invented from `SHA256SUMS`. The review ZIP SHA-256 `c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6` is not this release. Checked-in tier bytes are `99a83b35f8d5e71c7249a70db6c8b7fb71d2f2f1f5a6234eeec8fd3a17a2e89a`.

No next-date metadata is created. No alert was created. `research_coverage_complete` stays false.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Germany.

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

# Staging import of Germany only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=germany npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Germany.

Expected Germany lines:

```
lineage=country-package-germany
germany_offices=22630
germany_current=21960
germany_historical=670
germany_draft_tier_1=3
germany_draft_tier_2=20
germany_draft_tier_3=552
germany_draft_tier_4=22055
germany_schema_national=3
germany_schema_regional=572
germany_schema_municipal=22055
germany_schema_other=0
germany_selected_histories=0
germany_prospective_events=0
germany_result_rows=0
germany_event_rows=0
germany_sources=0
germany_unresolved=23
germany_approved=0
germany_needs_review=22630
germany_current_municipal_councils=10718
germany_current_municipal_mayors=9075
germany_current_kreis_councils=294
germany_current_kreis_executives=248
germany_current_association_councils=262
germany_current_association_executives=262
germany_current_land_parliaments=16
germany_current_local_councils=12356
germany_direct_executive_offices=9585
germany_historical_direct_executives=610
germany_historical_council_codes=54
germany_historical_mayor_codes=610
germany_historical_assemblies=6
germany_schleswig_holstein_direct_mayors=86
germany_explicit_predecessor_edges=0
germany_research_dates=0
germany_geographies=22628
```

A second run with unchanged docs + supplied `schemas/atlas/tiers/germany.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-germany.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-germany-attempts.sqlite
ATLAS_IMPORT_SCOPE=germany npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps. Omitted result and event files are not invented, and this importer does not publish a reconstructed omitted-total counter for them.
