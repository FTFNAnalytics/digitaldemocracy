# Election Atlas — Phase 1 scaffolding

Working notes for the first implementation PR. The contract remains
[atlas-plan.md](atlas-plan.md). This file records what has landed and which
Prompt C gates are automated versus deferred.

`/electiondatabase` stays the live observatory until cutover. **`/atlas` index /
countries / offices exist.** **No redirects.** `/atlas/explorer` is not on main.

Phase 0 inventory drafts (Europe packages, tier files, LatAm/NZ continuity) live
in [docs/phase0/REPORT.md](phase0/REPORT.md). Prompt B / Prompt C artifacts live in
[docs/phase1/](phase1/Phase1_DDL_Rationale.md). Prompt D continuity documentation
and approved-pack import live in [docs/phase2/](phase2/README.md)
(`npm run test:atlas-import` runs in CI). Live `main` as of 2026-09-17 is
summarized at the top of [atlas-plan.md](atlas-plan.md).

## What this PR lands

| Item | Location |
| --- | --- |
| Gitignore SQLite binaries | `.gitignore` (`*.sqlite`, `-wal`, `-shm`, `-journal`; `data/master/` contents) |
| Path override | `ATLAS_SQLITE_PATH` via `lib/atlas/paths.ts`. Default: `data/master/atlas.sqlite`. Production: `/var/lib/cdd/atlas.sqlite` |
| Attempt ledger path | `ATLAS_ATTEMPTS_SQLITE_PATH`. Default: `data/master/atlas-attempts.sqlite`. Production: `/var/lib/cdd/atlas-attempts.sqlite` |
| `npm run migrate:atlas` | `scripts/atlas/migrate.ts` — applies attempt-log SQL to the attempts DB and master SQL to the master DB |
| `npm run import:atlas` | `scripts/atlas/import.ts` — Albania Phase 1 importer plus Andorra / Alderney / Armenia / Austria / Belgium / Bosnia and Herzegovina / Bulgaria / Netherlands / Switzerland / Denmark / Finland and approved LatAm/NZ continuity (`ATLAS_IMPORT_SCOPE`) |
| Albania importer | `lib/atlas/albania/` (`import.ts`, `inventory.ts`, `project.ts`, `write.ts`) plus shared `lib/atlas/{ledger,publish,sqlite,identity,apply-migrations}.ts` |
| Attempt-log DDL | `schemas/atlas/migrations/0001_atlas_attempt_log.sql` (**attempts DB only**) |
| Master DDL | `schemas/atlas/migrations/0002_atlas_master.sql` (**master/staging only**) |
| Prompt B rationale | [docs/phase1/Phase1_DDL_Rationale.md](phase1/Phase1_DDL_Rationale.md) |
| Prompt C checklist | [docs/phase1/Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md) |
| Albania field map | [docs/phase1/Albania_Field_Map.md](phase1/Albania_Field_Map.md) |
| Albania identity rules | [docs/phase1/Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) |
| Albania acceptance examples | [docs/phase1/Albania_Acceptance_Examples.md](phase1/Albania_Acceptance_Examples.md) |
| Andorra Prompt J field map | [docs/phase1/andorra/](phase1/andorra/Prompt_J_Field_Map_and_CI.md) — Europe #2 mapping **Done**; importer landed (PR #23) |
| Armenia Prompt L field map | [docs/phase1/armenia/](phase1/armenia/Prompt_L_Tiers_Field_Map_and_CI.md) — Europe #4 mapping **Done**; importer landed (PR #26) |
| Austria Prompt N field map | [docs/phase1/austria/](phase1/austria/Prompt_N_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=austria`; 2,038 offices) |
| Bosnia Prompt O field map | [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/Prompt_O_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=bosnia`) |
| Bulgaria Prompt P field map | [docs/phase1/bulgaria/](phase1/bulgaria/Prompt_P_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer loads **530** accepted municipal offices only (`ATLAS_IMPORT_SCOPE=bulgaria`; package PR #16 head `de354127`; 3,067 submunicipal held) |
| Belgium Prompt S2 field map | [docs/phase1/belgium-s2/](phase1/belgium-s2/Prompt_S2_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=belgium`; **1,179 current + 55 historical**) |
| Netherlands Prompt T field map | [docs/phase1/netherlands/](phase1/netherlands/Prompt_T_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=netherlands`; **432 current + 69 historical**) |
| Switzerland Prompt U field map | [docs/phase1/switzerland/](phase1/switzerland/Prompt_U_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=switzerland`; **2,805 current + 11 historical**; 308 commune-executive holds retained; full-register certification OPEN) |
| Denmark Prompt X field map | [docs/phase1/denmark/](phase1/denmark/Prompt_X_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=denmark`; **106 current + 240 historical**) |
| Sweden Prompt Y field map | [docs/phase1/sweden/](phase1/sweden/Prompt_Y_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=sweden`; **313 current + 7 historical**) |
| Finland Prompt Z field map | [docs/phase1/finland/](phase1/finland/Prompt_Z_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=finland`; **333 current + 170 historical**) |
| Norway Prompt AA field map | [docs/phase1/norway/](phase1/norway/Prompt_AA_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=norway`; **389 current + 537 historical**; named holds retained) |
| Ireland Prompt AB field map | [docs/phase1/ireland/](phase1/ireland/Prompt_AB_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/ireland/`; **36 current + 86 historical accepted with holds**; Atlas importer waits) |
| Poland Prompt AC field map | [docs/phase1/poland/](phase1/poland/Prompt_AC_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/poland/`; **5,310 current + 2 historical accepted with holds**; Atlas importer waits) |
| Czechia Prompt V field map | [docs/phase1/czechia/](phase1/czechia/Prompt_V_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/czechia/`; **6,411 current + 13 historical accepted with holds**; Atlas importer waits) |
| Croatia Prompt W field map | [docs/phase1/croatia/](phase1/croatia/Prompt_W_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/croatia/`; **1,234 current + 11 historical accepted with holds**; Atlas importer waits) |
| Portugal Prompt AD field map | [docs/phase1/portugal/](phase1/portugal/Prompt_AD_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/portugal/`; **10,666 current + 8,168 historical accepted with holds**; Atlas importer waits) |
| Spain Prompt AE field map | [docs/phase1/spain/](phase1/spain/Prompt_AE_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/spain/`; **8,204 current + 4 historical accepted with holds**; Atlas importer waits) |
| Estonia Prompt AF field map | [docs/phase1/estonia/](phase1/estonia/Prompt_AF_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/estonia/`; **81 current + 200 historical accepted with holds**; Atlas importer waits) |
| Named CI | `tests/atlas/import.test.ts` (Prompt C gates) and `tests/atlas/cli.test.ts` (migrate + import CLI) |
| Phase 0 inventory | `docs/phase0/` (`REPORT.md`, `inventory.json`, `continuity-counts.json`, `human-review.json`) |
| Prompt D continuity docs | [docs/phase2/](phase2/README.md) — field maps, identity rules, acceptance examples, checklist; approved-pack importer CI runs (`npm run test:atlas-import`) |
| Tier-classification files | `schemas/atlas/tiers/albania.json` (**approved** municipal); `alderney.json` (**approved** `other`); `andorra.json` (**approved** municipal, Justin 2026-09-16); `armenia.json` (**approved** municipal, Prompt L 2026-09-17; five boundary/calendar reviews remain open); `austria.json` (**approved** 2,034 municipal / 4 regional, Prompt N 2026-09-17; package on main via PR #11; St. Georgen 2015 hold retained; `import:atlas` loads the lineage); `bosnia-and-herzegovina.json` (**approved** all 13 regional, Prompt O 2026-09-17; package on main via PR #15; RS presidential / coalition / calendar notes retained; importer via `ATLAS_IMPORT_SCOPE=bosnia`); `bulgaria.json` (**530 municipality-wide municipal accepted** / **3,067 district/village held**, Prompt P 2026-09-19; package PR #16 head `de354127`; no regional layer; importer loads 530 only); `belgium.json` (**1,179 current + 55 historical accepted**, Prompt S2 2026-09-19; 1,185 municipal / 15 regional / 2 national / 32 other; research at `data/research/belgium-s2/`; remaining-universe notes retained; importer via `ATLAS_IMPORT_SCOPE=belgium`); `netherlands.json` (**432 current + 69 historical accepted**, Prompt T 2026-09-19; 414 municipal / 12 regional / 3 national / 72 other; research at `data/research/netherlands/`; Hilversum/Wijdemeren and ~147 focused-tier reviews retained; importer via `ATLAS_IMPORT_SCOPE=netherlands`); `switzerland.json` (**2,805 current + 11 historical accepted subset**, Prompt U 2026-09-19; 2,402 municipal / 52 regional / 2 national / 360 other; research at `data/research/switzerland/`; 308 commune-executive holds, thin historic, 1,938 parliament caveats retained; full-register certification OPEN; importer via `ATLAS_IMPORT_SCOPE=switzerland`); `denmark.json` (**106 current + 240 historical accepted**, Prompt X 2026-09-19; 324 municipal / 20 regional / 1 national / 1 other; research at `data/research/denmark/`; Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, and EP-detail notes retained; importer via `ATLAS_IMPORT_SCOPE=denmark`); `sweden.json` (**313 current + 7 historical accepted with holds**, Prompt Y 2026-09-19; 292 municipal / 25 regional / 1 national / 2 other; research at `data/research/sweden/`; SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS, SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, and SE-FARGELANDA-1973 retained; Atlas importer waits); `finland.json` (**333 current + 170 historical accepted with holds**, Prompt Z 2026-09-19; 478 municipal / 22 regional / 2 national / 1 other; research at `data/research/finland/`; FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and FI-MISSING-RESULTS retained; importer via `ATLAS_IMPORT_SCOPE=finland`); `norway.json` (**389 current + 537 historical accepted with holds**, Prompt AA 2026-09-19; 876 municipal / 32 regional / 1 national / 17 other; research at `data/research/norway/`; SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES retained; importer via `ATLAS_IMPORT_SCOPE=norway`); `ireland.json` (**36 current + 86 historical accepted with holds**, Prompt AB 2026-09-20; 118 municipal / 0 regional / 3 national / 1 other; research at `data/research/ireland/`; IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS retained; Atlas importer waits); `poland.json` (**5,310 current + 2 historical accepted with holds**, Prompt AC 2026-09-20; 4,960 municipal / 330 regional / 3 national / 19 other; research at `data/research/poland/`; PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS, PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY, PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES, PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES retained; Atlas importer waits); `czechia.json` (**6,411 current + 13 historical accepted with holds**, Prompt V 2026-09-20; 6,257 municipal / 14 regional / 3 national / 150 other; research at `data/research/czechia/`; MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, and DATES-AND-NEXT-CYCLES retained; Atlas importer waits); `croatia.json` (**1,234 current + 11 historical accepted with holds**, Prompt W 2026-09-20; 1,187 municipal / 55 regional / 2 national / 1 other; research at `data/research/croatia/`; CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY, TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017, TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS, PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY retained; Atlas importer waits); `portugal.json` (**10,666 current + 8,168 historical accepted with holds**, Prompt AD 2026-09-21; 927 municipal / 2 regional / 2 national / 17,903 other; research at `data/research/portugal/`; CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37, PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS, DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF, PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022, EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, and CERTIFICATION-AND-MARGINS retained; Atlas importer waits); `spain.json` (**8,204 current + 4 historical accepted with holds**, Prompt AE 2026-09-21; 8,133 municipal / 68 regional / 2 national / 5 other; research at `data/research/spain/`; ES-G01–ES-G12 retained; Atlas importer waits); `estonia.json` (**81 current + 200 historical accepted with holds**, Prompt AF 2026-09-21; 278 municipal / 0 regional / 2 national / 1 other; research at `data/research/estonia/`; EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and EE-G09 retained; Atlas importer waits) |

`migrate:atlas` may create local gitignored DBs with empty typed tables. Empty schema is **not** Phase 1 exit. `import:atlas` against the frozen Albania package is the storage proof: 122 offices, 366 selected histories, 3,843 result rows, 122 municipal / 0 regional, 185 sources (182 catalogue + 3 inline), 122 briefings retained, proceedings=0, party_mappings=0.

CI and local tests **must** set `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH` to temporary files. Never point them at the VPS production paths unless deliberately operating production.

**Albania tiers are approved.** Justin approved `schemas/atlas/tiers/albania.json`
on 2026-09-16: 122 municipal offices, regional=0 by design. The importer hashes
the accepted bytes (SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`).
Do not reuse a draft-path fingerprint.

Alderney `other` is **approved** (2026-09-16); Channel Islands are low priority
for the broader Atlas. Andorra Prompt J docs are in
[docs/phase1/andorra/](phase1/andorra/README.md); the Andorra importer landed
(PR #23). Alderney Prompt K docs are in
[docs/phase1/alderney/](phase1/alderney/README.md); the Alderney importer landed
(PR #24). Armenia Prompt L docs are in
[docs/phase1/armenia/](phase1/armenia/README.md); the Armenia importer landed
(PR #26). Geographic tiers are **approved** (71 municipal / 0 regional). Five
boundary/calendar research reviews remain open separately from tier approval.
Austria Prompt N docs are in
[docs/phase1/austria/](phase1/austria/README.md) (mapping Done; importer landed);
geographic tiers are **approved** (2,034 municipal / 4 regional). The Austria
package is on main (PR #11, `f0f2c86`). Publication hold
`AT-OOE-41119-M::2015::` and open calendar/boundary notes remain.
Bosnia Prompt O docs are in
[docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md)
(mapping Done; importer landed). Geographic tiers are **approved** (all 13
regional). The Bosnia package is on main (PR #15, `33454ab`). Import with
`ATLAS_IMPORT_SCOPE=bosnia` (do not use `all` on the VPS for this lineage).
Open RS presidential replacement/repeat, governing coalition, and
2026-10-04 calendar-certainty notes remain; do not invent Brčko or municipal
offices.
Bulgaria Prompt P docs are in
[docs/phase1/bulgaria/](phase1/bulgaria/README.md)
(mapping Done; importer landed). Justin accepted **530** municipality-wide
municipal rows (265 Mayor + 265 Municipal council) on 2026-09-19 and **held
3,067** district/village rows for submunicipal policy. Regional count is 0; do
not invent a regional layer. `ATLAS_IMPORT_SCOPE=bulgaria` loads only the 530
accepted rows unless policy changes. Градец / qualification-change notes remain
open. The country package is the PR #16 tree (`de354127`). See
[Bulgaria_Import.md](phase1/bulgaria/Bulgaria_Import.md).
Belgium Prompt S2 docs are in
[docs/phase1/belgium-s2/](phase1/belgium-s2/README.md)
(mapping Done; importer landed). Justin accepted **1,179 current + 55
historical** offices on 2026-09-19 (municipality pairs plus
district/OCMW/provincial/parliament/other). Standing policy retains offices and
historic rows outside the ~18-month window. Remaining-universe indirect-body
gaps, Bilzen / Saint-Josse / 35 unbound IBZ 2000 notes stay open. Research
tables land at `data/research/belgium-s2/`. Import with
`ATLAS_IMPORT_SCOPE=belgium` (do not use `all` on the VPS for this lineage).
Frozen PR #14 screening extract is not overwritten.
Netherlands Prompt T docs are in
[docs/phase1/netherlands/](phase1/netherlands/README.md)
(mapping Done; importer landed). Justin accepted **432 current + 69
historical** offices on 2026-09-19. Standing policy retains offices and
historic rows outside the ~18-month window. Hilversum/Wijdemeren merger
successor binding, named historic gaps, and ~147 focused-tier reviews stay
open. Appointed mayors: no mayoral election rows. Research tables land at
`data/research/netherlands/`. Import with `ATLAS_IMPORT_SCOPE=netherlands`
(do not use `all` on the VPS for this lineage). Slim pack omitted bulky
sources; do not invent those bytes.
Switzerland Prompt U docs are in
[docs/phase1/switzerland/](phase1/switzerland/README.md)
(mapping Done; importer landed). Justin accepted the **evidenced subset:
2,805 current + 11 historical** offices on 2026-09-19. Accepted-with-holds /
approved subset only. Full-register certification remains OPEN. HOLD: 308
commune-executive gaps (VD 284, SZ 24), thin historic/merger archive, 1,938
parliament caveats, and mode-variance / disputed result rows. Do not invent
missing commune executives or fabricate merger histories. Research tables land
at `data/research/switzerland/`. Import with
`ATLAS_IMPORT_SCOPE=switzerland` (do not use `all` on the VPS for this lineage).
Slim pack omitted bulky sources; do not invent those bytes. See
[Switzerland_Import.md](phase1/switzerland/Switzerland_Import.md).
Denmark Prompt X docs are in
[docs/phase1/denmark/](phase1/denmark/README.md)
(mapping Done; importer landed). Justin accepted **106 current + 240
historical** offices on 2026-09-19. Standing policy retains offices and
historic rows outside the ~18-month window. Greenland/Faroe Realm coverage
gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98
unresolved candidate bindings, and EP detail gaps stay open. No popular
mayor rows (council-elected borgmester). Do not invent Greenland/Faroe
offices or fabricate merger clearances. Research tables land at
`data/research/denmark/`. Import with
`ATLAS_IMPORT_SCOPE=denmark` (do not use `all` on the VPS for this lineage).
See [Denmark_Import.md](phase1/denmark/Denmark_Import.md). Slim pack omitted bulky
sources; do not invent those bytes.
Sweden Prompt Y docs are in
[docs/phase1/sweden/](phase1/sweden/README.md)
(mapping Done; execution CI Not run). Justin accepted **313 current + 7
historical** offices on 2026-09-19 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS,
SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT,
and SE-FARGELANDA-1973. No popular kommunalråd / prime-minister / cabinet
rows. Do not invent a second Gotland regional office or fabricate 2026
final local counts. Research tables land at `data/research/sweden/`; Atlas
importer waits. Slim pack omitted bulky sources; do not invent those
bytes.
Finland Prompt Z docs are in
[docs/phase1/finland/](phase1/finland/README.md)
(mapping Done; importer landed). Justin accepted **333 current + 170
historical** offices on 2026-09-19 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION,
FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and
FI-MISSING-RESULTS. All 308 current municipal councils (incl. 16 Åland).
No popular manager / prime-minister / cabinet rows. Do not invent merger
successors, early Åland contests, wellbeing predecessors, or missing
result scalars. Research tables land at `data/research/finland/`. Import
with `ATLAS_IMPORT_SCOPE=finland` (do not use `all` on the VPS for this
lineage). See [Finland_Import.md](phase1/finland/Finland_Import.md). Slim
pack omitted bulky sources; do not invent those bytes.
Norway Prompt AA docs are in
[docs/phase1/norway/](phase1/norway/README.md)
(mapping Done; importer landed). Justin accepted **389 current + 537
historical** offices on 2026-09-19 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY,
LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES,
SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES. All
357 current municipal councils and 14 county councils. Oslo bystyre
once; 15 boroughs + Sámediggi + Longyearbyen as `other`. No popular
mayor / prime-minister / cabinet or EP rows. Do not invent merger
successors, borough/Longyearbyen result histories, certified legal
outcomes, or missing result scalars. Research tables land at
`data/research/norway/`. Import with
`ATLAS_IMPORT_SCOPE=norway` (do not use `all` on the VPS for this lineage).
See [Norway_Import.md](phase1/norway/Norway_Import.md). Slim pack omitted bulky
sources; do not invent those bytes.
Ireland Prompt AB docs are in
[docs/phase1/ireland/](phase1/ireland/README.md)
(mapping Done; execution CI Not run). Justin accepted **36 current + 86
historical** offices on 2026-09-20 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS,
IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT,
IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS. All 31
current local authority councils, Dáil, Seanad, presidency, EP
delegation, and the directly elected Mayor of Limerick. Northern
Ireland excluded. Regional assemblies are appointments, not a popular
regional tier. Do not invent merger successors, EP result vectors,
recent presidential returns, or missing first-preference scalars.
Research tables land at `data/research/ireland/`; Atlas importer waits.
Slim pack omitted bulky sources; do not invent those bytes.
Poland Prompt AC docs are in
[docs/phase1/poland/](phase1/poland/README.md)
(mapping Done; execution CI Not run). Justin accepted **5,310 current + 2
historical** offices on 2026-09-20 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS,
PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY,
PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES,
PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES.
Sejm, Senat, presidency, EP delegation, 16 sejmiks, 314 powiat councils,
2,479 municipal councils and matching direct executives retained.
Historic Ostrowice retained without invented successor edges.
PL-POWIAT-TIER left open (16 sejmiks + 314 powiat councils drafted
regional — do not reclassify). Do not invent historic territories,
pre-1999 reform archives, result files, or merger successors. Research
tables land at `data/research/poland/`; Atlas importer waits. Slim pack
omitted bulky sources and results; do not invent those bytes.
Czechia Prompt V docs are in
[docs/phase1/czechia/](phase1/czechia/README.md)
(mapping Done; execution CI Not run). Justin accepted **6,411 current + 13
historical** offices on 2026-09-20 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING,
PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY,
EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE,
and DATES-AND-NEXT-CYCLES. President is the only direct executive; 0
direct local / regional executives; 6,420 council / assembly offices.
Prague retained as one city/region body. Historical CISOB / municipal
codes retained with no invented successors. Do not invent merger edges,
municipal vote-share corrections, or omitted `results.jsonl.gz` / identity
vector blobs. Research tables land at `data/research/czechia/`; Atlas
importer waits. Slim pack omitted bulky sources, `results.jsonl.gz`, and
identity vectors; do not invent those bytes. `events.json` is carried as
`events.json.gz` only.
Croatia Prompt W docs are in
[docs/phase1/croatia/](phase1/croatia/README.md)
(mapping Done; execution CI Not run). Justin accepted **1,234 current + 11
historical** offices on 2026-09-20 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY,
TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017,
TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS,
PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY.
Current: 577 executive tickets + 79 independently elected deputies + 576
assemblies. Zagreb retained as one dual city/county assembly/executive
pair, separate from Zagrebačka županija. Historical independently
elected deputy identities retained with no invented successor edges.
Do not invent omitted `sources/` bytes, seat allocations, or merger
successors. Research tables land at `data/research/croatia/`; Atlas
importer waits. Slim pack omitted bulky sources; `events.json` is
`events.json.gz` only; `results.jsonl.gz` retained.
Portugal Prompt AD docs are in
[docs/phase1/portugal/](phase1/portugal/README.md)
(mapping Done; execution CI Not run). Justin accepted **10,666 current + 8,168
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37,
PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS,
DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF,
PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022,
EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, and
CERTIFICATION-AND-MARGINS. Current: 308 municípios / 3,258 freguesias
(37 plenary). Historical records are unresolved aliases, not 8,168 proved
abolitions (PARISH-REFORM-2013-2025). Parish bodies/heads remain drafted
`other` (PARISH-TIER — do not reclassify). Assembleia da República and
Presidente da República are `national`; Azores and Madeira assemblies are
`regional`; EP remains `other`. Câmara presidents are winning-list heads
(no invented second mayoral ballot). Do not invent omitted `sources/`
bytes, uncompressed `results.json`, identity vectors, or merger successors.
Research tables land at `data/research/portugal/`; Atlas importer waits.
Slim pack omitted bulky sources; `events.json`, `office-register.json`,
`identity-crosswalk.json`, `register-bindings.json`, and
`return-reconciliation.json` are `.gz` only; `results.jsonl.gz` retained.

Spain Prompt AE docs are in
[docs/phase1/spain/](phase1/spain/README.md)
(mapping Done; execution CI Not run). Justin accepted **8,204 current + 4
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
ES-G01–ES-G12 (municipal modes pending, scanned returns, disputed
duplicates, provincial Diputaciones chronology, Ceuta/Melilla/Formentera/Aran/Basque
Juntas tier policy, island currency, calendar unknowns, submunicipal
scope, source acquisition, result interpretation). Explicit
concejo-abierto direct executives: 78; 3,762 municipal modes still
pending. Formentera counted once. Do not invent omitted `sources/`
bytes, `results.json`, identity vectors, or hold resolutions. Research
tables land at `data/research/spain/`; Atlas importer waits. Slim pack
omitted bulky sources, `results.json`, and identity vectors;
`events.json` is `events.json.gz` only.

Estonia Prompt AF docs are in
[docs/phase1/estonia/](phase1/estonia/README.md)
(mapping Done; execution CI Not run). Justin accepted **81 current + 200
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and
EE-G09. Current: 78 municipal councils, Riigikogu, indirect presidency,
and the EP delegation. Current direct-executive offices 0. Rosters
2013=215, 2017=79, 2021=79, 2025=78. Do not invent 2017 successor
bindings, pre-2013 or special history, a 2021 presidential row, mayor
ballots, EP replacements, a 625,334 vs 625,336 correction, date
refinements, a Jõhvi successor edge, or nonadditive candidate shares.
Research tables land at `data/research/estonia/`; Atlas importer waits.
Slim pack omitted `results.json`, identity vectors, and raw sources;
`events.json`, nonadditive summaries, and the input inventory are normal
JSON. Do not invent omitted bytes.

### Fingerprint `schema_inputs` paths

[Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) names DDL
`schema_inputs` as `001_atlas_attempt_log.sql` and `001_atlas_master.sql`,
with SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
and `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`.

Checked-in migrations are `0001_atlas_attempt_log.sql` and
`0002_atlas_master.sql`. Those files currently have the **same bytes** (and
therefore the same hashes) as the Identity Rules entries. Fingerprint
`schema_inputs` **paths** use the checked-in migration filenames.
Do not rewrite the Identity Rules hashes unless the SQL bytes differ.

## Prompt C automated CI vs deferred

Gates from [Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md)
§ “Phase 1 required automated CI assertions”:

| Gate | Status | Where |
| --- | --- | --- |
| Fresh migration | **Automated.** Both SQL files on separate new DBs; unexpected existing schema refused; version/description match. | `tests/atlas/cli.test.ts` |
| Actual Albania fidelity | **Automated.** Counts plus spot ID/value equality (AL-13-M geo, event-9b7cd1a6a6d27850e712e6a7, r0 Arif 4564 / NULL seats, r1 Bedri 4515, AL-13-C r8 zero seats, URL alias → Sfaae00802d, Rrogozhinë May 2023 absent, 163 files + T retained, crosscheck not an event). | `tests/atlas/import.test.ts`, `assertAlbaniaFidelity` |
| Unchanged re-import | **Automated.** New `attempt_id`, same `release_id` / fingerprint, one immutable `dataset_release` row. | `tests/atlas/import.test.ts` |
| Corrected import | **Partial.** Calendar-cohort mutant in an isolated package copy yields a new release, retains prior `dataset_release`, preserves office/event IDs, still 122 municipal. **TODO (Prompt C “Corrected import”):** mutant D-row votes + documented override restoring 4564; D-row reorder keeping Arif r0; identity-label mutation without binding must fail. | `tests/atlas/import.test.ts` calendar copy; override path not implemented |
| Poison rollback | **Automated.** Dangling source FK after staged writes; failure before rename; broken history URL. Failed attempt, `successful_release_id` NULL, prior published bytes unchanged, staging discarded. | `tests/atlas/import.test.ts` |
| Namespace and public IDs | **Partial.** Documented geo/event IDs and catalogue URL alias. **TODO (Prompt C “Namespace and public IDs”):** separate-namespace non-cross-link fixture; wrong-namespace child FK insert. | identity unit tests + fidelity |
| Broken references | **Automated** for known omitted source / FK check / integrity_check. Typed locators exist for imported rows. | `assertIntegrity`, poison/broken-source tests |
| Unresolved evidence | **Deferred.** **TODO (Prompt C “Unresolved evidence” / Example 7):** empty-catalogue resolver unit fixture for an unmatched token. Baseline has no unmatched citation; omitting a known source is fail-closed, not unresolved. | — |
| Missing ≠ zero | **Automated.** Arif seats NULL/unknown vs Agrare 0/zero; 399 missing / 1876 zero; CHECK rejects NULL+zero and 0+unknown. | `tests/atlas/import.test.ts` |
| Precision, certainty, conflicts | **Partial.** All 366 baseline dates stored as day precision. **TODO (Prompt C “Precision, certainty, conflicts” / Examples 5–6):** month/year information-loss overrides; invalid-day fail; conflicting-claim withhold fixture on AL-52-M July event. | baseline day dates only |
| Tier source and empty state | **Automated.** Register SHA + 122 municipal / 0 regional; calendar `Tier` mutation does not change stored classifications; missing T and non-approved T fail closed with a durable failed attempt. | `tests/atlas/import.test.ts` |
| Fixture exclusion | **Automated.** `OBSERVATORY_FIXTURES=1` cannot publish; FIX-/FXT- tokens in retained JSON fail; SQL prefix CHECKs remain. | `tests/atlas/import.test.ts` |
| Score gates | **Automated as retained-input check.** No tightness/competition table is created; 45 control + 1 poll survive in `retained_input.payload_json`. Albania extract has no `score_gate` boolean to invent. | `tests/atlas/import.test.ts` |
| Incomplete refresh | **Deferred.** **TODO (Prompt C “Incomplete refresh” / Example 8):** omit AL-13-M from a later incomplete package and require carry-forward. | — |
| Publication continuity | **Deferred.** **TODO (Prompt C “Publication continuity”):** small metadata fixture for additional lineage IDs without a LatAm load. | — |
| Filesystem publication / recovery | **Partial.** Same-FS staging, WAL checkpoint, atomic rename, fsync, writer lock, interrupted `started` reconciliation. **TODO (Prompt C “Filesystem publication / recovery”):** busy WAL, fsync failure injection, crash-before/after-rename, never-delete-live-WAL probes. | `lib/atlas/publish.ts`, `lib/atlas/ledger.ts` |
| Restore | **Deferred.** **TODO (Prompt C “Restore”):** restore a known prior snapshot into a scratch path and verify schema/release/office content. Prior release metadata is retained on corrected import; full snapshot restore is not yet a named test. | — |
| Existing project gates | **Required in CI.** `npm test`, `npm run lint`, `npm run validate:data`, `npm run build`. `/atlas` index/countries/offices exist; `/electiondatabase` still live; no redirects. | `.github/workflows/ci.yml`, `tests/atlas/routes.test.ts` |

## Phase 1 exit criteria (not all claimed here)

From [atlas-plan.md](atlas-plan.md) Phase 1. Exit only when all of these are done:

1. Phase 1 PRs added no public routes. Later PRs added `/atlas` index/countries/offices; `/electiondatabase` remains live; **no redirects**.
2. `.gitignore` for `*.sqlite` / `data/master/` (this PR).
3. `ATLAS_SQLITE_PATH` (this PR) and `ATLAS_ATTEMPTS_SQLITE_PATH` (this PR).
4. `migrate:atlas` / `import:atlas` entrypoints (this PR; import is the Albania importer).
5. **DDL reviewed** against the identity table (Prompt B draft is checked in).
6. **Albania tier-classification file** checked in and **approved** (122 municipal; not calendar cohort strings).
7. **Albania import proof** into SQLite (atomic publish, failed-import rollback, unchanged re-import → new `attempt_id` / same `release_id`) — implemented; CI covers the named rows above.
8. Named ingest acceptance rows as **required automated CI tests** — implemented for the automated subset; deferred rows are TODOs tied to the Prompt C table.
9. VPS path readiness allowed as ops hygiene — **not** an exit.

Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.
A zero regional-tier numerator for Albania does not fail storage proof.

Deferred Prompt C rows above are **not** waived. They remain required before claiming a full Phase 1 exit against every checklist row.

## Remaining artifacts / review

| Artifact | Status in this PR |
| --- | --- |
| Full entity DDL | Prompt B draft checked in (`0001_atlas_attempt_log.sql` + `0002_atlas_master.sql`). |
| Prompt C field map | **Documentation complete.** Mapping specified; importer CI now runs the automated subset. |
| Albania importer | **Landed** for the frozen Albania package. `import:atlas` publishes lineage `country-package-albania`. |
| Albania tier file | **Approved** 2026-09-16 at `schemas/atlas/tiers/albania.json` (122 municipal office IDs; regional=0 intentional). |
| Alderney `other` | **Approved** 2026-09-16 at `schemas/atlas/tiers/alderney.json`. |
| Albania map | Proposed 46-municipality 2027 map is unverified in the package; geometry is not invented. |
| Prompt D continuity docs | **Documentation complete** in [docs/phase2/](phase2/README.md). Approved LatAm/NZ packs import; residual-heavy drafts skipped. No invented tiers. Production Mexico override still original 67. |
| Andorra Prompt J field map | **Documentation complete** in [docs/phase1/andorra/](phase1/andorra/README.md). Importer landed (PR #23). |
| Alderney Prompt K / Armenia Prompt L | Importers landed (PRs #24 / #26). Tiers approved. |
| Austria Prompt N field map | **Documentation complete** in [docs/phase1/austria/](phase1/austria/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=austria`; 2,038 offices). Package on main via PR #11. Approved `austria.json` is 2,034 municipal / 4 regional. |
| Bosnia Prompt O field map | **Documentation complete** in [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=bosnia`). Package on main via PR #15. Approved `bosnia-and-herzegovina.json` is all 13 regional. |
| Bulgaria Prompt P field map | **Importer landed** in [docs/phase1/bulgaria/](phase1/bulgaria/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=bulgaria` publishes 530 accepted municipal offices / 0 regional. Package PR #16 head `de354127`. 3,067 district/village rows stay held. |
| Belgium Prompt S2 field map | **Documentation complete** in [docs/phase1/belgium-s2/](phase1/belgium-s2/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=belgium`). Research at `data/research/belgium-s2/`. `belgium.json` is 1,179 current + 55 historical accepted (1,185 municipal / 15 regional / 2 national / 32 other). |
| Netherlands Prompt T field map | **Importer landed** in [docs/phase1/netherlands/](phase1/netherlands/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=netherlands` publishes 432 current + 69 historical offices. Hilversum/Wijdemeren and 147 focused-tier reviews stay open. |
| Switzerland Prompt U field map | **Importer landed** in [docs/phase1/switzerland/](phase1/switzerland/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=switzerland` publishes 2,805 current + 11 historical accepted offices. Research at `data/research/switzerland/`. `switzerland.json` is 2,402 municipal / 52 regional / 2 national / 360 other. 308 commune-executive holds remain unpublished. Full-register certification OPEN. |
| Denmark Prompt X field map | **Documentation complete** in [docs/phase1/denmark/](phase1/denmark/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=denmark`). Research at `data/research/denmark/`. `denmark.json` is 106 current + 240 historical accepted (324 municipal / 20 regional / 1 national / 1 other). |
| Sweden Prompt Y field map | **Documentation complete** in [docs/phase1/sweden/](phase1/sweden/README.md). Mapping Done; importer CI Not run. Research at `data/research/sweden/`. `sweden.json` is 313 current + 7 historical accepted with holds (292 municipal / 25 regional / 1 national / 2 other). |
| Finland Prompt Z field map | **Documentation complete** in [docs/phase1/finland/](phase1/finland/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=finland`). Research at `data/research/finland/`. `finland.json` is 333 current + 170 historical accepted with holds (478 municipal / 22 regional / 2 national / 1 other). |
| Norway Prompt AA field map | **Documentation complete** in [docs/phase1/norway/](phase1/norway/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=norway`). Research at `data/research/norway/`. `norway.json` is 389 current + 537 historical accepted with holds (876 municipal / 32 regional / 1 national / 17 other). |
| Ireland Prompt AB field map | **Documentation complete** in [docs/phase1/ireland/](phase1/ireland/README.md). Mapping Done; importer CI Not run. Research at `data/research/ireland/`. `ireland.json` is 36 current + 86 historical accepted with holds (118 municipal / 0 regional / 3 national / 1 other). |
| Poland Prompt AC field map | **Documentation complete** in [docs/phase1/poland/](phase1/poland/README.md). Mapping Done; importer CI Not run. Research at `data/research/poland/`. `poland.json` is 5,310 current + 2 historical accepted with holds (4,960 municipal / 330 regional / 3 national / 19 other). Results omitted from slim land. |
| Czechia Prompt V field map | **Documentation complete** in [docs/phase1/czechia/](phase1/czechia/README.md). Mapping Done; importer CI Not run. Research at `data/research/czechia/`. `czechia.json` is 6,411 current + 13 historical accepted with holds (6,257 municipal / 14 regional / 3 national / 150 other). |
| Croatia Prompt W field map | **Documentation complete** in [docs/phase1/croatia/](phase1/croatia/README.md). Mapping Done; importer CI Not run. Research at `data/research/croatia/`. `croatia.json` is 1,234 current + 11 historical accepted with holds (1,187 municipal / 55 regional / 2 national / 1 other). |
| Portugal Prompt AD field map | **Documentation complete** in [docs/phase1/portugal/](phase1/portugal/README.md). Mapping Done; importer CI Not run. Research at `data/research/portugal/`. `portugal.json` is 10,666 current + 8,168 historical accepted with holds (927 municipal / 2 regional / 2 national / 17,903 other). |
| Spain Prompt AE field map | **Documentation complete** in [docs/phase1/spain/](phase1/spain/README.md). Mapping Done; importer CI Not run. Research at `data/research/spain/`. `spain.json` is 8,204 current + 4 historical accepted with holds (8,133 municipal / 68 regional / 2 national / 5 other). |
| Estonia Prompt AF field map | **Documentation complete** in [docs/phase1/estonia/](phase1/estonia/README.md). Mapping Done; importer CI Not run. Research at `data/research/estonia/`. `estonia.json` is 81 current + 200 historical accepted with holds (278 municipal / 0 regional / 2 national / 1 other). Results, identity vectors, and raw sources omitted from the slim land. |

Still out of scope: redirects, cutover, residual-heavy draft packs, and tightness. Austria, Belgium, Bosnia, and Bulgaria `import:atlas` load their approved lineages; the observatory still skips Austria/Bulgaria XZ and Bosnia gzip. Prompt M 95 sibling withholds: disposition accepted 2026-09-17 and docs PR #27 landed; production override remains 67.
