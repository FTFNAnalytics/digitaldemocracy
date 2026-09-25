# Albania import

Albania is lineage `country-package-albania`. Justin accepted Prompt BA with holds **AL-BA-G01 through AL-BA-G21** left open. The live register is **891 offices = 123 current + 768 historical**. Draft tiers stay 1 national / 868 municipal / 22 other. Every classification is `needs_review`. `justin_approved` stays false. `research_coverage_complete` stays false.

The Phase 1 classifier at `Phase1_approved_tiers.json` (122 municipal, SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`) stays documentary. It is not the published classification set. The schema path `schemas/atlas/tiers/albania.json` is the Prompt BA draft (SHA-256 `38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae`).

Current offices are the Assembly, 61 municipal councils, and 61 directly elected mayors. Historical-only rows are 768 source-vintage 2011 identities, not 768 proved abolitions. The President is Assembly-elected; popular presidential offices stay 0. European Parliament offices stay 0. Popular qark and prefecture offices stay 0. `office_successor_edges` stays empty. Dimal remains the sourced rename of Ura Vajgurore on AL-05-M/C.

Slim land omits `sources/`, `data/events.jsonl`, and `data/results.jsonl`. This importer publishes **0 election events**, **0 result rows**, and **0 sources**. It does not invent omitted totals from the full pack's 1,180 events, 8,229 results, or 169 sources. No VPS deploy.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Albania.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-albania.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-albania-attempts.sqlite \
ATLAS_IMPORT_SCOPE=albania \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Albania.

Expected Albania lines:

```
lineage=country-package-albania
albania_offices=891
albania_current=123
albania_historical=768
albania_draft_tier_national=1
albania_draft_tier_municipal=868
albania_draft_tier_other=22
albania_schema_national=1
albania_schema_regional=0
albania_schema_municipal=868
albania_schema_other=22
albania_result_rows=0
albania_event_rows=0
albania_sources=0
albania_unresolved=21
albania_open_holds=21
albania_approved=0
albania_needs_review=891
albania_current_direct_executives=61
albania_historical_direct_executives=384
albania_current_mayors=61
albania_current_councils=61
albania_ep_offices=0
albania_explicit_predecessor_edges=0
albania_geographies=891
```
