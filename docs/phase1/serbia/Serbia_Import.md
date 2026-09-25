# Serbia import

Serbia is lineage `country-package-serbia`. Justin accepted the rebuilt Prompt AX pack with holds **RS-AX-G01 through RS-AX-G11** left open. The register is **178 offices = 173 current + 5 historical**. Draft tiers stay 2 national / 1 regional / 175 municipal. Every classification is `needs_review`. `justin_approved` stays false. `research_coverage_complete` stays false.

Current offices are the National Assembly, the directly elected President, the Vojvodina Assembly, 145 top-level local assemblies, and 25 city-municipality assemblies. Direct local executives stay 0. Direct provincial executives stay 0. Kosovo-scope offices stay 0. European Parliament offices stay 0.

The five successor-crosswalk rows are `same_territory_status_change` links (Vršac, Kikinda, Pirot, Bor, Prokuplje) with `boundary_change_claim` false. They are published as those supplied status-change edges and are not merger edges. No other successor edge is added.

This importer publishes **0 election events**, **0 result rows**, and **0 sources**. The checked-in `data/events.jsonl` (531), `data/results.jsonl` (671), `data/research-dates.jsonl`, and `sources/` extracts stay research bytes. They are retained inputs and are not projected into `election_event`, `result_row`, `research_date`, or `source`. No omitted-total counter is invented. No VPS deploy.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Serbia.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-serbia.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-serbia-attempts.sqlite \
ATLAS_IMPORT_SCOPE=serbia \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Serbia.

Expected Serbia lines:

```
lineage=country-package-serbia
serbia_offices=178
serbia_current=173
serbia_historical=5
serbia_draft_tier_national=2
serbia_draft_tier_regional=1
serbia_draft_tier_municipal=175
serbia_schema_national=2
serbia_schema_regional=1
serbia_schema_municipal=175
serbia_schema_other=0
serbia_result_rows=0
serbia_event_rows=0
serbia_sources=0
serbia_unresolved=11
serbia_open_holds=11
serbia_approved=0
serbia_needs_review=178
serbia_direct_executive_offices=1
serbia_direct_local_executive_offices=0
serbia_kosovo_scope_offices=0
serbia_ep_offices=0
serbia_explicit_predecessor_edges=5
serbia_geographies=178
```
