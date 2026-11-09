# Slim land note — Peru Prompt BK

This land publishes docs + draft tiers + office/roster/calendar structured data only.

**Omitted from this slim land (documentary totals only; do not invent as published rows):**
- `events.jsonl` (12,460 documentary events)
- `results.jsonl` (97,260 documentary results; ~85 MB / ~3.1 MB gzipped)
- `sources/raw/**` and `sources/text/**` (official bytes; ~471 MB)
- `methods/**` bulk extraction helpers
- Heavy diagnostics (`catalog_year_conflict_holds.json`, `catalog_year_conflict_result_observations.jsonl`, `identity_match_holds.json` detail payloads kept out of git; hold *titles* remain in `Research_Gaps.md`)

Published events: **0**. Published results: **0**. Published sources: **0**.

Full-pack documentary figures remain in `counts.json` / Justin report / `Validation_Report.json`. Upcoming calendar docs (`Peru_Upcoming_Elections.md`, `data/upcoming_calendar.json`) are included and must remain documentary for the Peru country surface (2030 regional/municipal; 2031 national), including outside the ~18-month global alert window.

LatAm empty-stub filter is rescinded in these docs only; live Peru stub is unchanged by this zip alone.

**Files that must stay outside git for server import** (full ZIP `/workspace/uploads/Peru_Prompt_BK_2026-10-31.zip`, sha256 `955ca87d…95cb`):
- `events.jsonl`
- `results.jsonl`
- `sources/raw/**`, `sources/text/**`
- related certified/extraction audit companions used only with the full payload

A separate importer PR is expected to load those from the full ZIP kept outside git (`ATLAS_IMPORT_SCOPE=peru`), after Justin signs the acceptance checklist.
