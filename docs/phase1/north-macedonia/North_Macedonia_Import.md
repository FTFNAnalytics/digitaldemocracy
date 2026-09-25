# North Macedonia import

North Macedonia is lineage `country-package-north-macedonia`. The scope token is `north_macedonia`. Justin accepted the Prompt AZ pack with holds **MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09 through MK-AZ-G12, MK-AZ-G14 through MK-AZ-G17, and MK-AZ-G19 through MK-AZ-G23** left open. Pack-resolved MK-AZ-G02, MK-AZ-G03, MK-AZ-G06, MK-AZ-G07, MK-AZ-G08, MK-AZ-G13, and MK-AZ-G18 stay closed as supplied and are not reopened. The register is **172 offices = 164 current + 8 historical**. Draft tiers stay 2 national / 170 municipal. Every classification is `needs_review`. `justin_approved` stays false. `research_coverage_complete` stays false.

Current offices are Parliament, the popularly elected President, 81 councils, and 81 popularly elected mayors. Current direct executives stay 82 (81 local + President). Historical-only offices are four councils and four mayors (Drugovo, Vraneshtica, Zajas, Oslomej). European Parliament offices stay 0. Regional offices stay 0. `office_successor_edges` stays empty. The 2013 Kichevo territorial claim stays `documented_territorial_reorganization_not_office_identity` and is not an office-successor edge. The 2019 country rename does not create a new office.

This slim land omits `sources/`, `data/events.jsonl`, and `data/results.jsonl`. The importer publishes **0 election events**, **0 result rows**, and **0 sources**. It does not reconstruct the full pack's 813 events, 1700 results, or 222 source extracts, and it does not emit omitted-total counters. The Brvenica 18 October 2026 label stays on the office row and is not turned into an election event. No VPS deploy.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import North Macedonia.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-north-macedonia.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-north-macedonia-attempts.sqlite \
ATLAS_IMPORT_SCOPE=north_macedonia \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish North Macedonia.

Expected North Macedonia lines:

```
lineage=country-package-north-macedonia
north_macedonia_offices=172
north_macedonia_current=164
north_macedonia_historical=8
north_macedonia_draft_tier_national=2
north_macedonia_draft_tier_municipal=170
north_macedonia_schema_national=2
north_macedonia_schema_regional=0
north_macedonia_schema_municipal=170
north_macedonia_schema_other=0
north_macedonia_result_rows=0
north_macedonia_event_rows=0
north_macedonia_sources=0
north_macedonia_unresolved=23
north_macedonia_open_holds=16
north_macedonia_closed_gaps=7
north_macedonia_approved=0
north_macedonia_needs_review=172
north_macedonia_current_direct_executives=82
north_macedonia_current_local_direct_executives=81
north_macedonia_current_councils=81
north_macedonia_current_mayors=81
north_macedonia_ep_offices=0
north_macedonia_regional_offices=0
north_macedonia_explicit_predecessor_edges=0
north_macedonia_geographies=86
```
