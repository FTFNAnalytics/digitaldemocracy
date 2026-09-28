# Slovakia import

Slovakia is lineage `country-package-slovakia`. Justin accepted Prompt AI on 2026-09-22 (America/Edmonton) with holds **SK-HISTORICAL-UNIVERSE, SK-LOCAL-OLDER-VECTORS, SK-LOCAL-MISSING-CYCLES, SK-REPEATS-CERTIFICATION, SK-VUC-INTRODUCTION, SK-CITY-PART-TIER, SK-EP, SK-HOMONYMS-UNKEYED, SK-2026-CALL, and SK-AGGREGATES** left open. The register is **5,871 offices = 5,871 current + 0 historical**. Draft tiers stay 5,774 municipal / 16 regional / 2 national / 79 other. Every classification is published `needs_review`. Zero classifications are Justin-approved. `research_coverage_complete` stays false.

Current offices are 2,887 municipal councils, 2,887 direct municipal mayors, 39 Bratislava/Košice city-part councils, 39 direct city-part mayors, 8 VUC assemblies, 8 direct VUC chairs, the National Council `SK-NRSR`, the direct presidency `SK-PRESIDENT`, and the EP delegation `SK-EP`. Direct executives stay 2,935. Councils, assemblies, the chamber, and the delegation stay 2,936. City-part offices stay drafted `other`. EP stays drafted `other`.

This importer publishes **0 election events**, **0 result rows**, and **0 sources**. `data/research/slovakia/` and `Slovakia_Identity_Vectors.json` are not in this land. They are not projected, and no omitted-total counter is invented. No successor edge is invented. No next-date or 2026 call is coerced into a research date. No VPS deploy.

Official municipality names and parent geography links stay in the omitted geography and office-register files. Published office names are the documentary office ids. Geography ids follow `Slovakia_Identity_Rules.md` (`SK`, `SK-VUC-k`, `SK-OBEC-c`).

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Slovakia.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-slovakia.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-slovakia-attempts.sqlite \
ATLAS_IMPORT_SCOPE=slovakia \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Slovakia.

Expected Slovakia lines:

```
lineage=country-package-slovakia
slovakia_offices=5871
slovakia_current=5871
slovakia_historical=0
slovakia_draft_tier_municipal=5774
slovakia_draft_tier_regional=16
slovakia_draft_tier_national=2
slovakia_draft_tier_other=79
slovakia_schema_national=2
slovakia_schema_regional=16
slovakia_schema_municipal=5774
slovakia_schema_other=79
slovakia_result_rows=0
slovakia_event_rows=0
slovakia_sources=0
slovakia_unresolved=10
slovakia_open_holds=10
slovakia_approved=0
slovakia_needs_review=5871
slovakia_direct_executive_offices=2935
slovakia_councils_assemblies_chambers_delegation=2936
slovakia_municipal_councils=2887
slovakia_municipal_mayors=2887
slovakia_city_part_councils=39
slovakia_city_part_mayors=39
slovakia_vuc_assemblies=8
slovakia_vuc_chairs=8
slovakia_ep_offices=1
slovakia_explicit_predecessor_edges=0
slovakia_geographies=2935
```
