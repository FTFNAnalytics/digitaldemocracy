# Per-country office tier classification

Checked-in files here map each package office ID to a proposed Atlas tier and to
schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` /
`council` / `other`).

These files are the Atlas classifiers. Workbook calendar cohort strings such as
Albania `Regional / municipal` are **not** classifiers.

Files were rebuilt from each package’s office register (one row per `office_id`;
no invented IDs). See [docs/phase0/REPORT.md](../../../docs/phase0/REPORT.md).
Albania municipal and Alderney `other` are **`approved`**. Andorra is **`approved`** (Justin 2026-09-16; 7 communal councils). Armenia is **`approved`** (Prompt L 2026-09-17; 71 municipal / 0 regional). Five Armenia boundary/calendar research reviews remain open separately from geographic-tier approval. Austria is **`approved`** (Prompt N 2026-09-17; 2,034 municipal / 4 regional). The Austria package is on main (PR #11, `f0f2c86`); `import:atlas` loads the lineage. The St. Georgen am Walde 2015 publication hold and open calendar/boundary research notes remain. Bosnia and Herzegovina is **`approved`** (Prompt O 2026-09-17; **all 13 regional**). The Bosnia package is on main (PR #15, `33454ab`); import with `ATLAS_IMPORT_SCOPE=bosnia`. Open RS presidential / coalition / calendar-certainty notes remain; do not invent Brčko or municipal offices. Bulgaria is **`approved` with a hold** (Prompt P 2026-09-19; **530 municipality-wide municipal accepted**, **3,067 district/village held**, **0 regional**). The Bulgaria package is on main (PR #16 head `de354127`); `import:atlas` with `ATLAS_IMPORT_SCOPE=bulgaria` loads only the 530 accepted rows unless submunicipal policy changes. Градец / qualification-change notes remain open. Belgium is **`approved`** (Prompt S2 2026-09-19; **1,179 current + 55 historical**; 1,185 municipal / 15 regional / 2 national / 32 other). Research lives at `data/research/belgium-s2/`; import with `ATLAS_IMPORT_SCOPE=belgium`. Remaining-universe indirect-body gaps stay open. Netherlands is **`approved`** (Prompt T 2026-09-19; **432 current + 69 historical**; 414 municipal / 12 regional / 3 national / 72 other). Research lives at `data/research/netherlands/`; import with `ATLAS_IMPORT_SCOPE=netherlands`. Hilversum/Wijdemeren successor binding, named historic gaps, and ~147 focused-tier reviews stay open. Switzerland is **`approved` with holds** (Prompt U 2026-09-19; **2,805 current + 11 historical accepted subset**; 2,402 municipal / 52 regional / 2 national / 360 other). Research lives at `data/research/switzerland/`; the Atlas importer waits. Full-register certification remains OPEN. 308 commune-executive gaps (VD 284, SZ 24), thin historic/merger archive, 1,938 parliament caveats, and disputed-result notes stay open. Denmark is **`approved`** (Prompt X 2026-09-19; **106 current + 240 historical**; 324 municipal / 20 regional / 1 national / 1 other). Research lives at `data/research/denmark/`; the Atlas importer waits. Greenland/Faroe Realm coverage gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps stay open. No popular mayor rows.

| File | Register rows | Proposed tier | Human review |
| --- | ---: | --- | --- |
| [`albania.json`](albania.json) | 122 | `municipal` (61 mayors + 61 councils) | **Approved** 2026-09-16 (Justin). Regional=0 is intentional. |
| [`andorra.json`](andorra.json) | 7 | `municipal` (communal councils) | **Approved** 2026-09-16 (Justin). Empty regional-calendar demo |
| [`alderney.json`](alderney.json) | 2 | `other` | **Approved** 2026-09-16 (product owner). Channel Islands are low priority for the broader Atlas. |
| [`armenia.json`](armenia.json) | 71 | `municipal` (community offices) | **Approved** 2026-09-17 (Prompt L). Geographic tiers only; 5 boundary/calendar reviews remain open |
| [`austria.json`](austria.json) | 2038 | `municipal` (2034) + `regional` (4) | **Approved** 2026-09-17 (Justin / Prompt N). `import:atlas` loads the lineage. Hold `AT-OOE-41119-M::2015::` retained |
| [`bosnia-and-herzegovina.json`](bosnia-and-herzegovina.json) | 13 | `regional` (13) | **Approved** 2026-09-17 (Justin / Prompt O). Package on main (PR #15); importer via `ATLAS_IMPORT_SCOPE=bosnia`. Open RS presidential / coalition / calendar notes retained |
| [`bulgaria.json`](bulgaria.json) | 3597 | `municipal` (3597 proposed; 530 accepted / 3067 held) | **Partial approve** 2026-09-19 (Justin / Prompt P). 265 Mayor + 265 Municipal council accepted. 35 District mayor + 3,032 Village mayor held (`submunicipal_scope`). Regional=0. Importer loads 530 only |
| [`belgium.json`](belgium.json) | 1234 | `municipal` (1185) + `regional` (15) + `national` (2) + `other` (32) | **Approved** 2026-09-19 (Justin / Prompt S2). 1,179 current + 55 historical. Remaining-universe notes retained. Importer via `ATLAS_IMPORT_SCOPE=belgium` |
| [`netherlands.json`](netherlands.json) | 501 | `municipal` (414) + `regional` (12) + `national` (3) + `other` (72) | **Approved** 2026-09-19 (Justin / Prompt T). 432 current + 69 historical. Focused-tier reviews (~147) and Hilversum/Wijdemeren stay open. Importer via `ATLAS_IMPORT_SCOPE=netherlands` |
| [`switzerland.json`](switzerland.json) | 2816 | `municipal` (2402) + `regional` (52) + `national` (2) + `other` (360) | **Accepted-with-holds** 2026-09-19 (Justin / Prompt U). 2,805 current + 11 historical subset. HOLD 308 commune executives (VD 284, SZ 24), thin historic, 1,938 parliament caveats. Full-register certification OPEN. Atlas importer waits |
| [`denmark.json`](denmark.json) | 346 | `municipal` (324) + `regional` (20) + `national` (1) + `other` (1) | **Approved** 2026-09-19 (Justin / Prompt X). 106 current + 240 historical. Greenland/Faroe Realm, 2007/earlier mergers, KMD/DST holes, 98 candidate bindings, and EP detail stay open. Atlas importer waits |

Vocabulary uses `national` as a proposed label. `schema_compatibility` maps
`national` → schema v1 `national_context`.

**Alderney:** `GG-ALD-STATES` and `GG-ALD-PLEB` are **approved** `other`
(territorial legislature / representation). Seat counts are not extra office
IDs. Product owner approved 2026-09-16; Channel Islands remain low priority
for the broader Atlas.

**Armenia** is last among early European targets and is **approved** municipal
(Prompt L, 2026-09-17; SHA-256
`2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`).
Proportional councils elect the mayor; missing mayor rows were not invented.
Prompt token `AM-VEDI` is register `AM-VEDI-C`. Five nested
`boundary_calendar_review` records remain `open`.

**Austria** is **approved** (Prompt N, Justin 2026-09-17 America/Edmonton;
SHA-256 `1c303f748b6fa706bea71d750b5e50be8ab27acc7baf166fe01e0b85e9da69eb`;
predecessor draft `9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d`).
Exact 2,038 office IDs: 2,034 municipal + 4 regional (`AT-KTN-A`, `AT-NOE-A`,
`AU-ab9fc7cefb`, `AU-9560299fb9`). Geographic-tier approval does not invent
prospective polling dates. Publication hold `AT-OOE-41119-M::2015::` (St. Georgen
am Walde first-ballot vs decisive yes/no) and all `notes[]` calendar/boundary
research items remain open. The country package is on main (PR #11, `f0f2c86`).
`ATLAS_IMPORT_SCOPE=austria npm run import:atlas` loads the approved lineage.

**Bosnia and Herzegovina** is **approved** (Prompt O, Justin 2026-09-17
America/Edmonton; SHA-256
`2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501`; predecessor
draft `3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1`). Exact
13 office IDs, all `regional`: 10 cantonal assemblies (`BA-201`–`BA-210`) plus
entity institutions `BA-F` (Federation HoR), `BA-R` (RS National Assembly), and
`BA-G` (RS President). Geographic-tier approval does not invent Brčko or
municipal offices and does not close open research notes (RS presidential
replacement/repeat, governing coalition histories, calendar certainty on
2026-10-04). The country package is on main (PR #15, `33454ab`). Import with
`ATLAS_IMPORT_SCOPE=bosnia`; do not use `all` on the VPS for this lineage.

**Belgium** is **approved** (Prompt S2, Justin 2026-09-19 America/Edmonton;
SHA-256 `adc7108868d7d8a7df3f6888de9dee05d4b799c2ebbc3a571e83a0ea8fe284cf`;
predecessor draft `8dec06a21c01e0f0aa0228e3d152b795b0fff9522c96b2071fec334f5070ccb6`).
Exact 1,234 office IDs: **1,179 current + 55 historical** (1,185 municipal /
15 regional / 2 national / 32 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Remaining-universe
indirect-body / community-commission / executive-seat gaps stay open, as do
Bilzen date-conflict, Saint-Josse 2024 repeat, 35 unbound IBZ 2000, and historic
successor/code-change notes. Research tables live at `data/research/belgium-s2/`.
Import with `ATLAS_IMPORT_SCOPE=belgium`; do not use `all` on the VPS for this
lineage. Frozen PR #14 zero-office screening extract is not overwritten.

**Netherlands** is **approved** (Prompt T, Justin 2026-09-19 America/Edmonton;
SHA-256 `faaf7573c678887004bc1f36f00a8496294ae23db5569278280a45642f0631b7`;
predecessor draft `81dc30e718355573cd15e3c93ff8f75364e4223612efab23cbd3393c5c94ea89`).
Exact 501 office IDs: **432 current + 69 historical** (414 municipal /
12 regional / 3 national / 72 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Hilversum/Wijdemeren merger
successor binding stays open, as do named historic gaps / partial coverage.
Focused-tier review rows (~147) keep drafted tiers; Justin accepted the
register universe. Appointed mayors: no mayoral election rows. Research tables
live at `data/research/netherlands/`. Slim pack omitted bulky sources; do not
invent those bytes. Importer via `ATLAS_IMPORT_SCOPE=netherlands`.

**Switzerland** is **approved with holds** (Prompt U, Justin 2026-09-19
America/Edmonton; SHA-256
`d1ebccfd1633aacd9b70732dcfe1f3e01df9549076d4b71efce38d436a2749f1`;
predecessor draft `0cddfca20fab058ed9f1a712515fdfd1725abda7a2e5a1b7903087135893d4bf`).
Exact 2,816 office IDs: **2,805 current + 11 historical** (2,402 municipal /
52 regional / 2 national / 360 other). Accepted-with-holds / approved subset
only. Full-register certification remains OPEN. Standing policy retains offices
and historic rows outside the ~18-month alert window. HOLD: 308 communes
without executive-body evidence (VD 284, SZ 24); thin historic/merger archive
(586 historical geographies vs 11 historical offices); 1,938 communes without
positive elected-parliament evidence (citizen-assembly caveat); mode-variance /
disputed result rows. Do not invent the 308 missing commune executives or
fabricate merger histories. Research tables live at
`data/research/switzerland/`. Slim pack omitted bulky sources; do not invent
those bytes. The Atlas importer waits.

**Denmark** is **approved** (Prompt X, Justin 2026-09-19 America/Edmonton;
SHA-256 `672d8cf0fa57345010eb03ff0cfb905574ff1394f045a60119967d9a6ed8f57e`;
predecessor draft `ba4626ab06fb811261b9e16972e3708497b63ec5717df046a3fcfaf716f811f5`).
Exact 346 office IDs: **106 current + 240 historical** (324 municipal /
20 regional / 1 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Greenland/Faroe Realm
coverage gates stay open, as do 2007/earlier merger successor bindings,
KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps.
Focused-tier review rows (293) keep drafted tiers; Justin accepted the
register universe. No popular mayor rows (council-elected borgmester). Do
not invent Greenland/Faroe offices or fabricate merger clearances. Research
tables live at `data/research/denmark/`. Slim pack omitted bulky sources; do
not invent those bytes. The Atlas importer waits.

**Albania:** all 122 office-register rows are **approved** `municipal` (Justin,
2026-09-16) for Phase 1 storage proof. Regional count is 0 by design. Do not
invent regional or national offices. The importer must hash the accepted file
bytes; this schema has no self-hash field.

Phase 1 Albania importer and import proof have landed. Checking in these
files is not a populated regional calendar.

## Prompt E continuity packs (LatAm + New Zealand)

22 additional files (21 Latin America office-bearing countries + New Zealand)
are checked in. Prompt G applied category-policy clearances only. **Justin
approved Batch A, Batch B, El Salvador, and Argentina on 2026-09-16**. The
remaining 8 residual-heavy packs stay **`draft_for_human_review`**. Approved
packs import via `npm run import:atlas`; residual-heavy drafts are skipped.
Cutover remains blocked. Mexico share-domain withhold-all-67 is the live
production override; Prompt M 95 sibling withholds are accepted (docs PR #27
landed) and are not executable yet.

Do not treat proposed-tier counts as approved coverage. Office IDs and proposed
labels come from the Prompt E pack; they are not invented here. Albania,
Andorra, Alderney, Armenia, Austria, Bosnia and Herzegovina, Bulgaria, Belgium, Netherlands, Switzerland, and Denmark files above are unchanged.

| File | Offices | Historical | Status |
| --- | ---: | ---: | --- |
| [`antigua-and-barbuda.json`](antigua-and-barbuda.json) | 1 | 0 | **draft_for_human_review** |
| [`argentina.json`](argentina.json) | 3560 | 120 | **approved** (Justin 2026-09-16; 97 focused-review rows remain) |
| [`bahamas.json`](bahamas.json) | 33 | 0 | **approved** (Justin 2026-09-16) |
| [`belize.json`](belize.json) | 19 | 0 | **approved** (Justin 2026-09-16) |
| [`brazil.json`](brazil.json) | 62 | 0 | **approved** (Justin 2026-09-16) |
| [`colombia.json`](colombia.json) | 2307 | 0 | **approved** (Justin 2026-09-16) |
| [`costa-rica.json`](costa-rica.json) | 670 | 4 | **draft_for_human_review** |
| [`cuba.json`](cuba.json) | 168 | 0 | **approved** (Justin 2026-09-16) |
| [`dominica.json`](dominica.json) | 25 | 0 | **approved** (Justin 2026-09-16) |
| [`dominican-republic.json`](dominican-republic.json) | 786 | 0 | **approved** (Justin 2026-09-16) |
| [`ecuador.json`](ecuador.json) | 1297 | 2 | **draft_for_human_review** |
| [`el-salvador.json`](el-salvador.json) | 306 | 262 | **approved** (Justin 2026-09-16) |
| [`guatemala.json`](guatemala.json) | 340 | 0 | **approved** (Justin 2026-09-16) |
| [`guyana.json`](guyana.json) | 83 | 3 | **draft_for_human_review** |
| [`haiti.json`](haiti.json) | 1153 | 0 | **draft_for_human_review** |
| [`jamaica.json`](jamaica.json) | 243 | 0 | **approved** (Justin 2026-09-16) |
| [`mexico.json`](mexico.json) | 1852 | 0 | **approved** (Justin 2026-09-16) |
| [`paraguay.json`](paraguay.json) | 526 | 0 | **approved** (Justin 2026-09-16) |
| [`peru.json`](peru.json) | 5039 | 11 | **draft_for_human_review** |
| [`saint-kitts-and-nevis.json`](saint-kitts-and-nevis.json) | 6 | 0 | **draft_for_human_review** |
| [`trinidad-and-tobago.json`](trinidad-and-tobago.json) | 167 | 12 | **draft_for_human_review** |
| [`new-zealand.json`](new-zealand.json) | 4 | 0 | **approved** (Justin 2026-09-16) |
| **TOTAL (these packs)** | **18647** | **414** | 14 approved / 8 still draft |

15 status-only LatAm countries have no tier file and no dummy offices. Pack
report, review queue, and Mexico non-executable inventory live in
[docs/phase2/tier-drafts/](../../../docs/phase2/tier-drafts/Phase2_Tier_Pack_Report.md).

See [docs/atlas-plan.md](../../../docs/atlas-plan.md) (Regional coverage counting)
and [docs/atlas-phase1.md](../../../docs/atlas-phase1.md).
