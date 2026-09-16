# Per-country office tier classification

Checked-in files here map each package office ID to a proposed Atlas tier and to
schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` /
`council` / `other`).

These files are the Atlas classifiers. Workbook calendar cohort strings such as
Albania `Regional / municipal` are **not** classifiers.

Files were rebuilt from each package’s office register (one row per `office_id`;
no invented IDs). See [docs/phase0/REPORT.md](../../../docs/phase0/REPORT.md).
Albania municipal and Alderney `other` are **`approved`**. Andorra and Armenia
remain **`draft_for_human_review`**.

| File | Register rows | Proposed tier | Human review |
| --- | ---: | --- | --- |
| [`albania.json`](albania.json) | 122 | `municipal` (61 mayors + 61 councils) | **Approved** 2026-09-16 (Justin). Regional=0 is intentional. |
| [`andorra.json`](andorra.json) | 7 | `municipal` (communal councils) | Empty regional-calendar demo |
| [`alderney.json`](alderney.json) | 2 | `other` | **Approved** 2026-09-16 (product owner). Channel Islands are low priority for the broader Atlas. |
| [`armenia.json`](armenia.json) | 71 | `municipal` (community offices) | Boundary/calendar flags; keep municipal |

Vocabulary uses `national` as a proposed label. `schema_compatibility` maps
`national` → schema v1 `national_context`.

**Alderney:** `GG-ALD-STATES` and `GG-ALD-PLEB` are **approved** `other`
(territorial legislature / representation). Seat counts are not extra office
IDs. Product owner approved 2026-09-16; Channel Islands remain low priority
for the broader Atlas.

**Armenia** is last among early European targets. Proportional councils elect
the mayor; missing mayor rows were not invented. Prompt token `AM-VEDI` is
register `AM-VEDI-C`.

**Albania:** all 122 office-register rows are **approved** `municipal` (Justin,
2026-09-16) for Phase 1 storage proof. Regional count is 0 by design. Do not
invent regional or national offices. The importer must hash the accepted file
bytes; this schema has no self-hash field.

Phase 1 still needs the Albania importer and import proof. Checking in these
files is not Albania storage proof and is not a populated regional calendar.

## Prompt E continuity drafts (LatAm + New Zealand)

22 additional files (21 Latin America office-bearing countries + New Zealand)
are checked in as **`draft_for_human_review`**. Checking them in does **not**
approve them. Prompt G applied category-policy clearances only; packs remain
draft. Continuity ingest/publish remains **blocked** until these drafts
are approved. Mexico share-domain withhold-all-67 is already accepted separately.

Do not treat proposed-tier counts as approved coverage. Office IDs and proposed
labels come from the Prompt E pack; they are not invented here. Albania,
Andorra, Alderney, and Armenia files above are unchanged.

| File | Offices | Historical | Status |
| --- | ---: | ---: | --- |
| [`antigua-and-barbuda.json`](antigua-and-barbuda.json) | 1 | 0 | **draft_for_human_review** |
| [`argentina.json`](argentina.json) | 3560 | 120 | **draft_for_human_review** |
| [`bahamas.json`](bahamas.json) | 33 | 0 | **draft_for_human_review** |
| [`belize.json`](belize.json) | 19 | 0 | **draft_for_human_review** |
| [`brazil.json`](brazil.json) | 62 | 0 | **draft_for_human_review** |
| [`colombia.json`](colombia.json) | 2307 | 0 | **draft_for_human_review** |
| [`costa-rica.json`](costa-rica.json) | 670 | 4 | **draft_for_human_review** |
| [`cuba.json`](cuba.json) | 168 | 0 | **draft_for_human_review** |
| [`dominica.json`](dominica.json) | 25 | 0 | **draft_for_human_review** |
| [`dominican-republic.json`](dominican-republic.json) | 786 | 0 | **draft_for_human_review** |
| [`ecuador.json`](ecuador.json) | 1297 | 2 | **draft_for_human_review** |
| [`el-salvador.json`](el-salvador.json) | 306 | 262 | **draft_for_human_review** |
| [`guatemala.json`](guatemala.json) | 340 | 0 | **draft_for_human_review** |
| [`guyana.json`](guyana.json) | 83 | 3 | **draft_for_human_review** |
| [`haiti.json`](haiti.json) | 1153 | 0 | **draft_for_human_review** |
| [`jamaica.json`](jamaica.json) | 243 | 0 | **draft_for_human_review** |
| [`mexico.json`](mexico.json) | 1852 | 0 | **draft_for_human_review** |
| [`paraguay.json`](paraguay.json) | 526 | 0 | **draft_for_human_review** |
| [`peru.json`](peru.json) | 5039 | 11 | **draft_for_human_review** |
| [`saint-kitts-and-nevis.json`](saint-kitts-and-nevis.json) | 6 | 0 | **draft_for_human_review** |
| [`trinidad-and-tobago.json`](trinidad-and-tobago.json) | 167 | 12 | **draft_for_human_review** |
| [`new-zealand.json`](new-zealand.json) | 4 | 0 | **draft_for_human_review** |
| **TOTAL (these drafts)** | **18647** | **414** | still draft |

15 status-only LatAm countries have no tier file and no dummy offices. Pack
report, review queue, and Mexico non-executable inventory live in
[docs/phase2/tier-drafts/](../../../docs/phase2/tier-drafts/Phase2_Tier_Pack_Report.md).

See [docs/atlas-plan.md](../../../docs/atlas-plan.md) (Regional coverage counting)
and [docs/atlas-phase1.md](../../../docs/atlas-phase1.md).
