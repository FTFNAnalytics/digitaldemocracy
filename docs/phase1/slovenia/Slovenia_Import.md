# Slovenia import

Slovenia is lineage `country-package-slovenia`. Justin accepted Prompt AJ on 2026-09-22 (America/Edmonton) with holds **SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS, SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES, SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL, SI-LOCAL-PREFERENCE, and SI-NEXT-CALLS** left open. The register is **428 offices = 428 current + 0 historical**. Draft tiers stay 424 municipal / 0 regional / 3 national / 1 other. Every classification is published `needs_review`. Zero classifications are Justin-approved. `research_coverage_complete` stays false.

Current offices are 212 municipal councils, 212 direct municipal mayors, Državni zbor `SI-DZ`, the indirect Državni svet `SI-DS`, the direct presidency `SI-PRESIDENT`, and the EP delegation `SI-EP`. Direct executives stay 213. Councils, chambers, and the delegation stay 215. EP stays drafted `other`. There is no elected regional office.

This importer publishes **0 election events**, **0 result rows**, and **0 sources**. `data/research/slovenia/` and `Slovenia_Identity_Vectors.json` are not in this land. They are not projected, and no omitted-total counter is invented. No successor edge is invented. The 15 November 2026 local call is not coerced into a research date. The 2018 Ribnica council return stays missing. No VPS deploy.

Official municipality names stay in the omitted office register. Published office names are the documentary office ids. Geography ids follow `Slovenia_Identity_Rules.md` (`SI`, `SI-OB-c`). Country geography `SI` has a null parent. Each municipal geography parent is `SI`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Slovenia. `ATLAS_IMPORT_SCOPE=slovakia` is unchanged.

## Operator command

Use a temporary SQLite path in CI. Do not point this command at the VPS production database.

```bash
ATLAS_SQLITE_PATH=/tmp/atlas-slovenia.sqlite \
ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-slovenia-attempts.sqlite \
ATLAS_IMPORT_SCOPE=slovenia \
npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Slovenia.

Expected Slovenia lines:

```
lineage=country-package-slovenia
slovenia_offices=428
slovenia_current=428
slovenia_historical=0
slovenia_draft_tier_municipal=424
slovenia_draft_tier_regional=0
slovenia_draft_tier_national=3
slovenia_draft_tier_other=1
slovenia_schema_national=3
slovenia_schema_regional=0
slovenia_schema_municipal=424
slovenia_schema_other=1
slovenia_result_rows=0
slovenia_event_rows=0
slovenia_sources=0
slovenia_unresolved=10
slovenia_open_holds=10
slovenia_approved=0
slovenia_needs_review=428
slovenia_direct_executive_offices=213
slovenia_councils_chambers_delegation=215
slovenia_municipal_councils=212
slovenia_municipal_mayors=212
slovenia_national_assembly_offices=1
slovenia_national_council_offices=1
slovenia_president_offices=1
slovenia_ep_offices=1
slovenia_explicit_predecessor_edges=0
slovenia_geographies=213
```
