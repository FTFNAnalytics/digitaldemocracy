# Montenegro import

Montenegro is lineage `country-package-montenegro`. Justin accepted Prompt AY with holds **ME-AY-G01 through ME-AY-G11** left open. The register is **29 offices = 27 current + 2 historical**. Draft tiers stay 2 national / 27 municipal. Every classification is `needs_review`. `justin_approved` stays false. `research_coverage_complete` stays false.

Current offices are Parliament, the directly elected President, and 25 local assemblies. Direct local executives stay 0. The two historical nested assemblies (Golubovci and Tuzi within the historical Capital City structure) stay separate from current Zeta and Tuzi. Both territorial relations keep `successor_office_id` null. European Parliament offices stay 0.

This importer publishes **0 election events**, **0 result rows**, and **0 sources**. The checked-in `data/events.jsonl` (71), `data/results.jsonl` (153), and `sources/normalized/` extracts stay research bytes. They are retained inputs and are not projected into `election_event`, `result_row`, or `source`. No omitted-total counter is invented. No successor edge is invented. No VPS deploy.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Montenegro.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-montenegro.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-montenegro-attempts.sqlite \
ATLAS_IMPORT_SCOPE=montenegro \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Montenegro.

Expected Montenegro lines:

```
lineage=country-package-montenegro
montenegro_offices=29
montenegro_current=27
montenegro_historical=2
montenegro_draft_tier_national=2
montenegro_draft_tier_municipal=27
montenegro_schema_national=2
montenegro_schema_regional=0
montenegro_schema_municipal=27
montenegro_schema_other=0
montenegro_result_rows=0
montenegro_event_rows=0
montenegro_sources=0
montenegro_unresolved=11
montenegro_open_holds=11
montenegro_approved=0
montenegro_needs_review=29
montenegro_direct_executive_offices=1
montenegro_direct_local_executive_offices=0
montenegro_current_local_assemblies=25
montenegro_ep_offices=0
montenegro_explicit_predecessor_edges=0
montenegro_geographies=28
```
