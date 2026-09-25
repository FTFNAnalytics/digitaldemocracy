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
| `npm run import:atlas` | `scripts/atlas/import.ts` — Albania Phase 1 importer plus Andorra / Alderney / Armenia / Austria / Belgium / Bosnia and Herzegovina / Bulgaria / Netherlands / Switzerland / Denmark / Sweden / Finland / Norway / Ireland / Poland / Czechia / Croatia / Portugal / Spain / Estonia and approved LatAm/NZ continuity (`ATLAS_IMPORT_SCOPE`) |
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
| Ireland Prompt AB field map | [docs/phase1/ireland/](phase1/ireland/Prompt_AB_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=ireland`; **36 current + 86 historical accepted with holds**) |
| Poland Prompt AC field map | [docs/phase1/poland/](phase1/poland/Prompt_AC_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=poland`; **5,310 current + 2 historical**; powiat tier left open; 0 invented result rows) |
| Czechia Prompt V field map | [docs/phase1/czechia/](phase1/czechia/Prompt_V_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=czechia`; **6,411 current + 13 historical accepted with holds**; omitted `results.jsonl.gz` is not invented) |
| Croatia Prompt W field map | [docs/phase1/croatia/](phase1/croatia/Prompt_W_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=croatia`; research at `data/research/croatia/`; **1,234 current + 11 historical accepted with holds**) |
| Portugal Prompt AD field map | [docs/phase1/portugal/](phase1/portugal/Prompt_AD_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/portugal/`; **10,666 current + 8,168 historical accepted with holds**; Atlas importer waits) |
| Spain Prompt AE field map | [docs/phase1/spain/](phase1/spain/Prompt_AE_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=spain`; **8,204 current + 4 historical**; holds ES-G01–ES-G12 open; 0 invented result rows) |
| Estonia Prompt AF field map | [docs/phase1/estonia/](phase1/estonia/Prompt_AF_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=estonia`; **81 current + 200 historical**; 0 result rows from the omitted slim-pack `results.json`) |
| Latvia Prompt AG field map | [docs/phase1/latvia/](phase1/latvia/Prompt_AG_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=latvia` only, not `all`; **45 current + 121 historical**; 1,383 result rows; holds LV-G01–LV-G09 open) |
| Hungary Prompt AK field map | [docs/phase1/hungary/](phase1/hungary/Prompt_AK_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=hungary` only, not `all`; **6,378 current + 0 historical**; 0 result rows; omitted `results.json` is not invented; holds stay open) |
| Romania Prompt AL field map | [docs/phase1/romania/](phase1/romania/Prompt_AL_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=romania` only, not `all`; **6,460 current + 0 historical**; 19,343 events; 23 result rows; holds RO-G01–RO-G07 open) |
| Greece Prompt AM field map | [docs/phase1/greece/](phase1/greece/Prompt_AM_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=greece` only, not `all`; **693 current + 10 historical**; 2,774 events; 3,555 proceedings; 14,004 result rows; holds GR-G01–GR-G10 open) |
| Luxembourg Prompt AO field map | [docs/phase1/luxembourg/](phase1/luxembourg/Prompt_AO_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=luxembourg` only, not `all`; **102 current + 28 historical**; 438 events; 0 result rows; holds LU-G03–LU-G11 open) |
| France Prompt AR field map | [docs/phase1/france/](phase1/france/Prompt_AR_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=france` only, not `all`; **35,112 current + 2,738 historical**; 0 events; 0 result rows; holds G01–G21 open) |
| Cyprus Prompt AQ field map | [docs/phase1/cyprus/](phase1/cyprus/Prompt_AQ_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=cyprus` only, not `all`; **714 current + 174 historical**; 1,599 events; 0 result rows; holds CY-G01–CY-G15 open) |
| Malta Prompt AP field map | [docs/phase1/malta/](phase1/malta/Prompt_AP_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=malta` only, not `all`; **213 current + 2 historical**; 223 events; 0 result rows; named holds open) |
| Lithuania Prompt AH field map | [docs/phase1/lithuania/](phase1/lithuania/Prompt_AH_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=lithuania` only, not `all`; **123 current + 0 historical**; 130 result rows; draft tiers not rewritten; holds LT-HISTORY–LT-EXCLUSIONS open) |
| Slovakia Prompt AI field map | [docs/phase1/slovakia/](phase1/slovakia/Prompt_AI_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs+tiers only; **5,871 current + 0 historical accepted with holds**; research tables omitted; Atlas importer waits) |
| Slovenia Prompt AJ field map | [docs/phase1/slovenia/](phase1/slovenia/Prompt_AJ_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs+tiers only; **428 current + 0 historical accepted with holds**; Atlas importer waits) |
| Germany Prompt AS field map | [docs/phase1/germany/](phase1/germany/Prompt_AS_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=germany` only, not `all`; **21,960 current + 670 historical**; numeric tiers 3 / 20 / 552 / 22,055; 0 events; 0 result rows; DE-G01–DE-G23 open; `research_coverage_complete` stays false) |
| United Kingdom Prompt AU field map | [docs/phase1/united-kingdom/](phase1/united-kingdom/FIELD_MAP_223.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=united_kingdom` only, not `all`; **482 current + 2 shadow + 26 historical-only**; numeric tiers 2 / 5 / 76 / 427; 0 events; 0 result rows; G01–G27 open; `research_coverage_complete` stays false) |
| Italy Prompt AT field map | [docs/phase1/italy/](phase1/italy/README.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=italy` only, not `all`; **15,917 current + 696 historical + 8 pending FVG**; numeric tiers 4 / 38 / 11 / 16,568; 0 events; 0 result rows; IT-G01–IT-G19 open; `research_coverage_complete` stays false) |
| Iceland Prompt AV field map | [docs/phase1/iceland/](phase1/iceland/Prompt_AV_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs and tiers only; **63 current + 24 historical accepted with holds**; IS-G01 and IS-G06 open; `research_coverage_complete` stays false; Atlas importer waits) |
| Bosnia and Herzegovina Prompt AW field map | [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/Prompt_AW_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs and draft tiers only; **306 current + 40 historical-only accepted with holds**; BA-AW-G01–BA-AW-G09 open; `research_coverage_complete` stays false; Prompt O importer pin unchanged; do not use `ATLAS_IMPORT_SCOPE=all`) |
| Albania Prompt BA field map | [docs/phase1/albania/](phase1/albania/Prompt_BA_Full_Register_Field_Map_and_CI.md) — mapping **Done**; Prompt BA importer **not written** (docs and draft tiers only; **123 current + 768 historical-only accepted with holds**; AL-BA-G01–AL-BA-G21 open; `research_coverage_complete` stays false; Phase 1 importer still classifies the preserved 122 municipal rows; `ATLAS_IMPORT_SCOPE` unchanged) |
| Montenegro Prompt AY field map | [docs/phase1/montenegro/](phase1/montenegro/Prompt_AY_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs and draft tiers only; **27 current + 2 historical-only accepted with holds**; ME-AY-G01–ME-AY-G11 open; `research_coverage_complete` stays false; Atlas importer waits) |
| Serbia Prompt AX field map | [docs/phase1/serbia/](phase1/serbia/Prompt_AX_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs and tiers only; **173 current + 5 historical-only accepted with holds**; RS-AX-G01–RS-AX-G11 open; Kosovo-scope offices 0; `research_coverage_complete` stays false; Atlas importer waits) |
| North Macedonia Prompt AZ field map | [docs/phase1/north-macedonia/](phase1/north-macedonia/Prompt_AZ_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (docs and draft tiers only; **164 current + 8 historical-only accepted with holds**; MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09–MK-AZ-G12, MK-AZ-G14–MK-AZ-G17, and MK-AZ-G19–MK-AZ-G23 open; `research_coverage_complete` stays false; Atlas importer waits) |
| Named CI | `tests/atlas/import.test.ts` (Prompt C gates) and `tests/atlas/cli.test.ts` (migrate + import CLI) |
| Phase 0 inventory | `docs/phase0/` (`REPORT.md`, `inventory.json`, `continuity-counts.json`, `human-review.json`) |
| Prompt D continuity docs | [docs/phase2/](phase2/README.md) — field maps, identity rules, acceptance examples, checklist; approved-pack importer CI runs (`npm run test:atlas-import`) |
| Tier-classification files | `schemas/atlas/tiers/albania.json` (Prompt BA **draft** 1 national / 868 municipal / 22 other; Phase 1 **approved** 122 municipal bytes preserved at `docs/phase1/albania/Phase1_approved_tiers.json`); `alderney.json` (**approved** `other`); `andorra.json` (**approved** municipal, Justin 2026-09-16); `armenia.json` (**approved** municipal, Prompt L 2026-09-17; five boundary/calendar reviews remain open); `austria.json` (**approved** 2,034 municipal / 4 regional, Prompt N 2026-09-17; package on main via PR #11; St. Georgen 2015 hold retained; `import:atlas` loads the lineage); `bosnia-and-herzegovina.json` (Prompt O **approved** all 13 regional on 2026-09-17, SHA `2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501`, preserved at `docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json`; package on main via PR #15; RS presidential / coalition / calendar notes retained; importer via `ATLAS_IMPORT_SCOPE=bosnia` pins the Prompt AW schema-path SHA `96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9` and still classifies those 13 regional rows. Prompt AW draft now checked in at that schema path: **306 current + 40 historical-only accepted with holds**; 4 national / 15 regional / 327 municipal; every `justin_approved` false; BA-AW-G01–BA-AW-G09 open; `research_coverage_complete` stays false; docs and draft tiers only); `bulgaria.json` (**530 municipality-wide municipal accepted** / **3,067 district/village held**, Prompt P 2026-09-19; package PR #16 head `de354127`; no regional layer; importer loads 530 only); `belgium.json` (**1,179 current + 55 historical accepted**, Prompt S2 2026-09-19; 1,185 municipal / 15 regional / 2 national / 32 other; research at `data/research/belgium-s2/`; remaining-universe notes retained; importer via `ATLAS_IMPORT_SCOPE=belgium`); `netherlands.json` (**432 current + 69 historical accepted**, Prompt T 2026-09-19; 414 municipal / 12 regional / 3 national / 72 other; research at `data/research/netherlands/`; Hilversum/Wijdemeren and ~147 focused-tier reviews retained; importer via `ATLAS_IMPORT_SCOPE=netherlands`); `switzerland.json` (**2,805 current + 11 historical accepted subset**, Prompt U 2026-09-19; 2,402 municipal / 52 regional / 2 national / 360 other; research at `data/research/switzerland/`; 308 commune-executive holds, thin historic, 1,938 parliament caveats retained; full-register certification OPEN; importer via `ATLAS_IMPORT_SCOPE=switzerland`); `denmark.json` (**106 current + 240 historical accepted**, Prompt X 2026-09-19; 324 municipal / 20 regional / 1 national / 1 other; research at `data/research/denmark/`; Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, and EP-detail notes retained; importer via `ATLAS_IMPORT_SCOPE=denmark`); `sweden.json` (**313 current + 7 historical accepted with holds**, Prompt Y 2026-09-19; 292 municipal / 25 regional / 1 national / 2 other; research at `data/research/sweden/`; SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS, SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, and SE-FARGELANDA-1973 retained; Atlas importer waits); `finland.json` (**333 current + 170 historical accepted with holds**, Prompt Z 2026-09-19; 478 municipal / 22 regional / 2 national / 1 other; research at `data/research/finland/`; FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and FI-MISSING-RESULTS retained; importer via `ATLAS_IMPORT_SCOPE=finland`); `norway.json` (**389 current + 537 historical accepted with holds**, Prompt AA 2026-09-19; 876 municipal / 32 regional / 1 national / 17 other; research at `data/research/norway/`; SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES retained; importer via `ATLAS_IMPORT_SCOPE=norway`); `ireland.json` (**36 current + 86 historical accepted with holds**, Prompt AB 2026-09-20; 118 municipal / 0 regional / 3 national / 1 other; research at `data/research/ireland/`; IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS retained; importer via `ATLAS_IMPORT_SCOPE=ireland`); `poland.json` (**5,310 current + 2 historical accepted with holds**, Prompt AC 2026-09-20; 4,960 municipal / 330 regional / 3 national / 19 other; research at `data/research/poland/`; PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS, PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY, PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES, PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES retained; importer via `ATLAS_IMPORT_SCOPE=poland`); `czechia.json` (**6,411 current + 13 historical accepted with holds**, Prompt V 2026-09-20; 6,257 municipal / 14 regional / 3 national / 150 other; research at `data/research/czechia/`; MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, and DATES-AND-NEXT-CYCLES retained; importer via `ATLAS_IMPORT_SCOPE=czechia`; omitted `results.jsonl.gz` is not invented); `croatia.json` (**1,234 current + 11 historical accepted with holds**, Prompt W 2026-09-20; 1,187 municipal / 55 regional / 2 national / 1 other; research at `data/research/croatia/`; CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY, TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017, TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS, PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY retained; importer via `ATLAS_IMPORT_SCOPE=croatia`); `portugal.json` (**10,666 current + 8,168 historical accepted with holds**, Prompt AD 2026-09-21; 927 municipal / 2 regional / 2 national / 17,903 other; research at `data/research/portugal/`; CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37, PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS, DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF, PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022, EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, and CERTIFICATION-AND-MARGINS retained; Atlas importer waits); `spain.json` (**8,204 current + 4 historical accepted with holds**, Prompt AE 2026-09-21; 8,133 municipal / 68 regional / 2 national / 5 other; research at `data/research/spain/`; ES-G01–ES-G12 retained; importer via `ATLAS_IMPORT_SCOPE=spain`); `estonia.json` (**81 current + 200 historical accepted with holds**, Prompt AF 2026-09-21; 278 municipal / 0 regional / 2 national / 1 other; research at `data/research/estonia/`; EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and EE-G09 retained; importer via `ATLAS_IMPORT_SCOPE=estonia`); `latvia.json` (**45 current + 121 historical accepted with holds**, Prompt AG 2026-09-21; 163 municipal / 0 regional / 2 national / 1 other; research at `data/research/latvia/`; LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, and LV-G09 retained; historical 121 rows are identity records, not abolished councils; importer via `ATLAS_IMPORT_SCOPE=latvia` only, not `all`); `hungary.json` (**6,378 current + 0 historical accepted with holds**, Prompt AK 2026-09-22; 6,355 municipal / 20 regional / 2 national / 1 other; research at `data/research/hungary/`; HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS, and HU-UPCOMING retained; importer via `ATLAS_IMPORT_SCOPE=hungary` only, not `all`; omitted `results.json` stays 0 result rows); `romania.json` (**6,460 current + 0 historical accepted with holds**, Prompt AL 2026-09-22; 6,372 municipal / 84 regional / 3 national / 1 other; research at `data/research/romania/`; RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07 retained; importer via `ATLAS_IMPORT_SCOPE=romania` only, not `all`; classifications stay `needs_review`); `greece.json` (**693 current + 10 historical accepted with holds**, Prompt AM 2026-09-22; 674 municipal / 26 regional / 2 national / 1 other; research at `data/research/greece/`; GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09, and GR-G10 retained, plus 14 local source holds; President `GR-PRES` is parliamentary indirect; Atlas importer waits); `luxembourg.json` (**102 current + 28 historical accepted with holds**, Prompt AO 2026-09-22; 128 municipal / 0 regional / 1 national / 1 other; research at `data/research/luxembourg/`; LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and LU-G11 retained; LU-G01 and LU-G02 are resolved exclusions; Atlas importer waits); `france.json` (**35,112 current + 2,738 historical accepted with holds**, Prompt AR 2026-09-22; draft T1 4 / T2 45 / T3 96 / T4 37,705; schema projection national 4 / regional 141 / municipal 37,705 / other 0; research at `data/research/france/`; G01–G21 retained; Atlas importer waits); `cyprus.json` (**714 current + 174 historical accepted with holds**, Prompt AQ 2026-09-22; 877 municipal / 5 regional / 5 national / 1 other; research at `data/research/cyprus/`; CY-G01, CY-G02, CY-G03, CY-G04, CY-G05, CY-G06, CY-G07, CY-G08, CY-G09, CY-G10, CY-G11, CY-G12, CY-G13, CY-G14, and CY-G15 retained; 285 named communities versus ministry overview 286; successor crosswalk empty; importer via `ATLAS_IMPORT_SCOPE=cyprus` only, not `all`; classifications stay `needs_review`; published result rows stay 0); `malta.json` (**213 current + 2 historical accepted with holds**, Prompt AP 2026-09-22; 204 municipal / 8 regional / 2 national / 1 other; research at `data/research/malta/`; presidential tallies, STV paper transfers, post-election casual/co-option, mayoral first-meeting audit, local creation/boundaries, regional sole nominees, Gozo Civic Council, EP replacements/sixth seat, certification labels, and the production-schema pin retained; importer via `ATLAS_IMPORT_SCOPE=malta` only, not `all`; classifications stay `needs_review`; published result rows stay 0); `lithuania.json` (**123 current + 0 historical accepted with holds**, Prompt AH 2026-09-22; 120 municipal / 0 regional / 2 national / 1 other; research at `data/research/lithuania/`; draft tiers landed 1:1; LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, and LT-PARTY-PRECISION retained; importer via `ATLAS_IMPORT_SCOPE=lithuania` only, not `all`); `slovakia.json` (**5,871 current + 0 historical accepted with holds**, Prompt AI 2026-09-22; 5,774 municipal / 16 regional / 2 national / 79 other; docs+tiers only; SK-HISTORICAL-UNIVERSE, SK-LOCAL-OLDER-VECTORS, SK-LOCAL-MISSING-CYCLES, SK-REPEATS-CERTIFICATION, SK-VUC-INTRODUCTION, SK-CITY-PART-TIER, SK-EP, SK-HOMONYMS-UNKEYED, SK-2026-CALL, and SK-AGGREGATES retained; Atlas importer waits); `slovenia.json` (**428 current + 0 historical accepted with holds**, Prompt AJ 2026-09-22; 424 municipal / 0 regional / 3 national / 1 other; docs at `docs/phase1/slovenia/`; SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS, SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES, SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL, SI-LOCAL-PREFERENCE, and SI-NEXT-CALLS retained; identity vectors, sources, and results omitted; Atlas importer waits); `germany.json` (**21,960 current + 670 historical accepted with holds**, Prompt AS 2026-09-22; jurisdiction tiers 1/2/3/4 = 3 / 20 / 552 / 22,055; docs at `docs/phase1/germany/`; DE-G01–DE-G23 retained open; numeric tiers preserved on each row; `research_coverage_complete` stays false; importer via `ATLAS_IMPORT_SCOPE=germany` only, not `all`); `united-kingdom.json` (**482 current + 2 shadow + 26 historical-only accepted with holds**, Prompt AU 2026-09-23; draft tiers T1/T2/T3/T4 = 2 / 5 / 76 / 427; 510 rows 1:1; docs at `docs/phase1/united-kingdom/`; G01–G27 retained open; numeric draft tiers preserved on each row; `research_coverage_complete` stays false; importer via `ATLAS_IMPORT_SCOPE=united_kingdom` only, not `all`); `italy.json` (**15,917 current + 696 historical + 8 pending FVG accepted with holds**, Prompt AT 2026-09-23; jurisdiction tiers 1/2/3/4 = 4 / 38 / 11 / 16,568; 16,621 rows 1:1; docs at `docs/phase1/italy/`; IT-G01–IT-G19 retained open; numeric tiers not remapped; file `Justin_accepted` stays false; `research_coverage_complete` stays false; Atlas importer waits); `iceland.json` (**63 current + 24 historical accepted with holds**, Prompt AV 2026-09-23; 85 municipal / 2 national; docs at `docs/phase1/iceland/`; IS-G01 and IS-G06 retained open; every `justin_approved` stays false; `research_coverage_complete` stays false; Atlas importer waits). Prompt BA `albania.json` is **123 current + 768 historical-only accepted with holds** (1 national / 868 municipal / 22 other; every `justin_approved` stays false; AL-BA-G01–AL-BA-G21 retained open; `research_coverage_complete` stays false; Phase 1 122 municipal rows still classified; `ATLAS_IMPORT_SCOPE` unchanged); `montenegro.json` (**27 current + 2 historical-only accepted with holds**, Prompt AY 2026-09-25; 2 national / 27 municipal; 29 rows 1:1; docs at `docs/phase1/montenegro/`; ME-AY-G01–ME-AY-G11 retained open; every `justin_approved` stays false; `research_coverage_complete` stays false; Atlas importer waits); `serbia.json` (**173 current + 5 historical-only accepted with holds**, Prompt AX REBUILT 2026-09-25; 2 national / 1 regional / 175 municipal; 178 rows 1:1; docs at `docs/phase1/serbia/`; RS-AX-G01–RS-AX-G11 retained open; Kosovo-scope offices 0; every `justin_approved` stays false; `research_coverage_complete` stays false; Atlas importer waits) ; `north-macedonia.json` (**164 current + 8 historical-only accepted with holds**, Prompt AZ 2026-09-25; 170 municipal / 2 national; 172 rows 1:1; docs at `docs/phase1/north-macedonia/`; MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09–MK-AZ-G12, MK-AZ-G14–MK-AZ-G17, and MK-AZ-G19–MK-AZ-G23 retained open; every `justin_approved` stays false; `research_coverage_complete` stays false; Atlas importer waits) |

`migrate:atlas` may create local gitignored DBs with empty typed tables. Empty schema is **not** Phase 1 exit. `import:atlas` against the frozen Albania package is the storage proof: 122 offices, 366 selected histories, 3,843 result rows, 122 municipal / 0 regional, 185 sources (182 catalogue + 3 inline), 122 briefings retained, proceedings=0, party_mappings=0.

CI and local tests **must** set `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH` to temporary files. Never point them at the VPS production paths unless deliberately operating production.

**Albania Phase 1 tiers stay approved** at
`docs/phase1/albania/Phase1_approved_tiers.json` (Justin, 2026-09-16; 122
municipal offices; regional=0 by design; SHA-256
`53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`). The
checked-in `schemas/atlas/tiers/albania.json` is the Prompt BA draft
(SHA-256 `38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae`;
1 national / 868 municipal / 22 other; every `justin_approved` false). The
importer pins that schema-path checksum and still classifies the preserved
122 municipal rows. It does not publish the 891 draft offices.
`ATLAS_IMPORT_SCOPE` is unchanged. Holds AL-BA-G01–AL-BA-G21 stay open.
`research_coverage_complete` stays false.

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
[docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/Prompt_O_README.md)
(mapping Done; importer landed). Geographic tiers were **approved** (all 13
regional; SHA `2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501`,
preserved at `Prompt_O_approved_tiers.json`). The Bosnia package is on main
(PR #15, `33454ab`). Import with `ATLAS_IMPORT_SCOPE=bosnia` (do not use `all`
on the VPS for this lineage). The checked-in
`schemas/atlas/tiers/bosnia-and-herzegovina.json` is the Prompt AW draft
(SHA `96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9`).
The importer pins that schema-path checksum and still classifies the preserved
13 regional Prompt O rows.
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
(mapping Done; importer landed). Justin accepted **36 current + 86
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
Research tables land at `data/research/ireland/`. Import with `ATLAS_IMPORT_SCOPE=ireland` (do not use `all` on the VPS for this lineage). See [Ireland_Import.md](phase1/ireland/Ireland_Import.md).
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
tables land at `data/research/poland/`. Import with
`ATLAS_IMPORT_SCOPE=poland` (do not use `all` on the VPS for this lineage).
Slim pack omitted bulky sources and results; the importer publishes 0 result
rows and does not invent those bytes. See
[Poland_Import.md](phase1/poland/Poland_Import.md).
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
vector blobs. Research tables land at `data/research/czechia/`. Import
with `ATLAS_IMPORT_SCOPE=czechia`. Slim pack omitted bulky sources,
`results.jsonl.gz`, and identity vectors; result rows are not invented.
`events.json` is carried as `events.json.gz` only. See
[Czechia_Import.md](phase1/czechia/Czechia_Import.md).
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
successors. Research tables land at `data/research/croatia/`; import
with `ATLAS_IMPORT_SCOPE=croatia`. Slim pack omitted bulky sources; `events.json` is
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
Latvia Prompt AG docs are in
[docs/phase1/latvia/](phase1/latvia/README.md)
(mapping Done; execution CI Not run). Justin accepted **45 current + 121
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, and
LV-G09. Current: 42 councils + Saeima + indirect presidency + EP
delegation. Direct popular executive offices: 0. Rosters PV2017=119;
post-reform observations 43; PV2025=42 (7 state-city + 35 novadi).
Historical 121 rows are identity records, not abolished councils. Saeima
and the presidency are `national`; EP remains `other`; regional is 0.
Do not invent cross-epoch merges, earlier history, presidential ballot
vectors, a popular chair or executive director, EP replacements, a choice
among the seven 2022 percentage conflicts, certification calls, date
refinements, or omitted `sources/` and identity-vector bytes. Research
tables land at `data/research/latvia/`. Import with
`ATLAS_IMPORT_SCOPE=latvia` (do not use `all`; that scope does not publish
Latvia). See [Latvia_Import.md](phase1/latvia/Latvia_Import.md). Slim pack
omitted identity vectors and raw sources; `results.json` is normal JSON
and the importer publishes its 1,383 rows. VPS deploy is out of scope.

Spain Prompt AE docs are in
[docs/phase1/spain/](phase1/spain/README.md)
(mapping Done; importer landed). Justin accepted **8,204 current + 4
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
ES-G01–ES-G12 (municipal modes pending, scanned returns, disputed
duplicates, provincial Diputaciones chronology, Ceuta/Melilla/Formentera/Aran/Basque
Juntas tier policy, island currency, calendar unknowns, submunicipal
scope, source acquisition, result interpretation). Explicit
concejo-abierto direct executives: 78; 3,762 municipal modes still
pending. Formentera counted once. Do not invent omitted `sources/`
bytes, `results.json`, identity vectors, or hold resolutions. Research
tables land at `data/research/spain/`. Import with
`ATLAS_IMPORT_SCOPE=spain` (do not use `all` on the VPS for this
lineage). See [Spain_Import.md](phase1/spain/Spain_Import.md). Slim pack
omitted bulky sources, `results.json`, and identity vectors;
`events.json` is `events.json.gz` only.

Estonia Prompt AF docs are in
[docs/phase1/estonia/](phase1/estonia/README.md)
(mapping Done; importer landed). Justin accepted **81 current + 200
historical** offices on 2026-09-21 with named holds. Standing policy
retains offices and historic rows outside the ~18-month window. HOLD:
EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and
EE-G09. Current: 78 municipal councils, Riigikogu, indirect presidency,
and the EP delegation. Current direct-executive offices 0. Rosters
2013=215, 2017=79, 2021=79, 2025=78. Do not invent 2017 successor
bindings, pre-2013 or special history, a 2021 presidential row, mayor
ballots, EP replacements, a 625,334 vs 625,336 correction, date
refinements, a Jõhvi successor edge, or nonadditive candidate shares.
Research tables land at `data/research/estonia/`. Importer:
`ATLAS_IMPORT_SCOPE=estonia` (see [Estonia_Import.md](phase1/estonia/Estonia_Import.md)).
Slim pack omitted `results.json`, identity vectors, and raw sources;
`events.json`, nonadditive summaries, and the input inventory are normal
JSON. The importer publishes 0 result rows and does not invent omitted bytes.

Hungary Prompt AK docs are in
[docs/phase1/hungary/](phase1/hungary/README.md)
(mapping Done; importer landed). Justin accepted **6,378 current + 0
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE,
HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS,
HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS,
HU-CHAIRS-JARAS (documented exclusion), and HU-UPCOMING. Current: 3,178
direct mayors and 3,198 councils/assemblies. President is indirect.
Budapest capital assembly stays drafted regional and the capital mayor
stays drafted municipal. EP stays drafted `other`. 0 historical-only is
not proof of zero abolished offices; the successor crosswalk stays empty.
Bozsok council/mayor and Pakod council 2024 return gaps stay open (offices
retained, no zero invented). Do not invent omitted `sources/` bytes,
`results.json`, identity vectors, historical offices, or hold resolutions.
Research tables land at `data/research/hungary/`. Import with
`ATLAS_IMPORT_SCOPE=hungary` only (do not use `all`; that scope does not
publish Hungary). See [Hungary_Import.md](phase1/hungary/Hungary_Import.md).
Slim pack omitted bulky sources, `results.json`, and identity vectors.
The importer publishes 0 result rows and does not invent omitted bytes.

Romania Prompt AL docs are in
[docs/phase1/romania/](phase1/romania/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=romania` only). Justin accepted **6,460 current + 0
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07. Current: 3,180
ordinary local UAT council/mayor pairs, 41 județ councils, 41 county
presidents, Bucharest General Council, the general mayor, six sector
pairs, two chambers, the popular presidency, and the EP delegation.
Direct executives 3,229; councils/assemblies 3,230. President is
popularly elected. County presidents are marked direct for current law;
2016 was council investiture and is not a popular-election event. The
2024 presidential first round stays annulled with no successor edge to
2025. 23 result rows are national/EP only. Do not invent local result
vectors, historical-only offices, neighbourhood boards, or merger edges.
Research tables land at `data/research/romania/`. Import with `ATLAS_IMPORT_SCOPE=romania` only; `all` does not publish Romania. See [Romania_Import.md](phase1/romania/Romania_Import.md).
`events.json` is `events.json.gz` only.

Cyprus Prompt AQ docs are in
[docs/phase1/cyprus/](phase1/cyprus/README.md)
(mapping Done; execution CI Not run). Justin accepted **714 current + 174
historical** offices on 2026-09-22 with holds CY-G01–CY-G15 left open.
Standing policy retains offices and historic rows outside the ~18-month
alert window. HOLD: CY-G01 current community completeness (285 named
versus ministry overview 286; no 286th council invented), CY-G02
post-1974 footprint (no TRNC offices), CY-G03 2024 reform successors
(crosswalk stays empty), CY-G04 Spilia code join, CY-G05 presidential
rounds, CY-G06 municipal and community executives, CY-G07 EP history,
CY-G08 certification, CY-G09 malformed 2016 preference rows, CY-G10 date
precision, CY-G11 missing local returns (no zero-fill), CY-G12 House
universes and religious representatives, CY-G13 statistical units versus
elected councils, CY-G14 district organisations, and CY-G15 inherited
contract. Current: 20 municipal councils, 20 mayors, 93 deputy mayors,
285 community councils, 285 community leaders, five DLGO presidents, the
House, the President, three religious-group representatives, and the EP
delegation. Historical: 28 municipal councils, 28 mayors, 59 community
councils, and 59 community leaders. Direct executives: 404. Draft tiers
are 877 municipal / 5 regional / 5 national / 1 other. EP stays drafted
`other`. The successor crosswalk stays empty. Do not invent the missing
286th free-area community, a TRNC office, a 2024 reform successor edge,
a Spilia code join, a zero-filled missing local return, omitted
`sources/` bytes, or `results.json`. Research tables land at
`data/research/cyprus/`. Import with `ATLAS_IMPORT_SCOPE=cyprus` only; `all` does not publish Cyprus. Published result rows stay 0. Slim land omitted
`sources/` and `results.json`. Do not invent omitted bytes.

Malta Prompt AP docs are in
[docs/phase1/malta/](phase1/malta/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=malta` only, not `all`). Justin accepted **213 current + 2
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
presidential earlier resolutions and House division tallies, STV
paper-level transfers, post-election casual/co-option normalization,
the mayoral first-meeting audit, local creation and boundary history,
regional sole-nominee and successor gaps, Gozo Civic Council depth, EP
replacements and the sixth-seat transition, certified-versus-preliminary
labels, and the production-schema pin. Current: 68 local councils
(54 Malta / 14 Gozo), 68 mayors, 68 deputy mayors, six indirect regional
presidents, the House, the indirect President, and the EP delegation.
Historical: Gozo Civic Council and its president. Standalone
direct-executive offices 0. Draft tiers are 204 municipal / 8 regional /
2 national / 1 other. EP stays drafted `other`. The successor crosswalk
stays empty. Four 2021 regional sole nominees stay nominations. Do not
invent a popular presidential or mayor ballot, an STV transfer paper, a
missing House division tally, a Gozo successor edge, omitted `sources/`
bytes, `results.json`, or `stv-counts.json`. Research tables land at
`data/research/malta/`. Import with `ATLAS_IMPORT_SCOPE=malta` only; `all` does not publish Malta. Published result rows stay 0.
Slim land omitted `sources/`, `results.json`, and `stv-counts.json`. Do not invent omitted
bytes.

Greece Prompt AM Rebuilt docs are in
[docs/phase1/greece/](phase1/greece/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=greece` only). Justin accepted **693 current + 10
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09,
and GR-G10, plus 14 local source holds (13 regional 2019 station
denominators; Messini 2014 tied runoff). Current: 332 municipal councils,
332 direct mayors, 13 regional councils, 13 direct governors, Parliament,
the indirect presidency, and one EP delegation. President `GR-PRES` is
`parliamentary_indirect`. No PM, cabinet, or prefect rows. Five abolished
municipalities stay historical council/mayor pairs; no Kallikratis
successor edges. 14,004 result rows are 8,021 distinct observations;
missing results stay gaps. Research tables land at
`data/research/greece/`. Import with `ATLAS_IMPORT_SCOPE=greece` only; `all` does not publish Greece. See [Greece_Import.md](phase1/greece/Greece_Import.md). Slim land omits `sources/`
(2,807 artifacts). Do not invent omitted bytes.
France Prompt AR docs are in
[docs/phase1/france/](phase1/france/README.md)
(mapping Done; execution CI Not run). Justin accepted **35,112 current + 2,738
historical** offices on 2026-09-22 with holds G01–G21 left open. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G13, G14, G15,
G16, G17, G18, G19, G20, and G21. Current: 34,952 municipal councils, 95
departmental councils, 14 regional councils, 3 single territorial assemblies,
the Lyon metropolitan council, 34 PLM sector councils, overseas and New
Caledonia assemblies, two chambers, the popular presidency, and the EP
delegation. Direct executives current: 1. Mayors stay council-selected. Ordinary
EPCI stay excluded. Draft tiers stay T1 4 / T2 45 / T3 96 / T4 37,705.
`FR-EP` stays draft tier 1 and was not moved to `other`. The successor
crosswalk stays empty. Do not invent popular mayor contests, EPCI popular
contests, guessed commune-nouvelle edges, or zero-filled results.
Research tables land at `data/research/france/`. Import with `ATLAS_IMPORT_SCOPE=france` only; `all` does not publish France. Published events and result rows stay 0. Slim land omitted
`sources/`, `results.jsonl`, `events.jsonl`, and `reporting-units.jsonl`. See [France_Import.md](phase1/france/France_Import.md).

Luxembourg Prompt AO docs are in
[docs/phase1/luxembourg/](phase1/luxembourg/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=luxembourg` only, not `all`). Justin accepted **102 current + 28
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and
LU-G11. LU-G01 (Grand Duke) and LU-G02 (mayors) are resolved exclusions.
Current: 100 communal councils, Chambre des Députés, and the EP
delegation. Direct executives 0. Regional offices 0. Draft tiers are
128 municipal / 0 regional / 1 national / 1 other. EP stays drafted
`other`. The merger crosswalk stays at 28 explicit portal edges. The
1994 Grevenmacher EP LSAP block stays missing. Do not invent a Grand
Duke or mayor popular contest, a guessed merger edge, omitted
`sources/` bytes, `results.json`, or missing 1994 EP votes. Research
tables land at `data/research/luxembourg/`. Import with `ATLAS_IMPORT_SCOPE=luxembourg` only; `all` does not publish Luxembourg. Published result rows stay 0.
Slim pack omitted `sources/` and `results.json`. Do not invent omitted
bytes.

Lithuania Prompt AH docs are in
[docs/phase1/lithuania/](phase1/lithuania/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=lithuania` only, not `all`). Justin accepted **123 current + 0
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR,
LT-SEIMAS-GRAIN, LT-EP-DETAIL, and LT-PARTY-PRECISION.
`Lithuania_Research_Gaps.md` also leaves LT-NEXT-AND-LEGAL and
LT-EXCLUSIONS open. Current: 60 municipal councils, 60 direct mayors,
Seimas, the popular presidency, and the EP delegation. Direct executives
61; councils/parliamentary bodies 62. Draft tiers landed 1:1
(`draft_for_human_review`; not rewritten). Zero recovered historical-only
offices is not proof none existed. No successor edge was guessed. Eleven
2019 presidential shares stay disputed. Mayor history is 19 winner
observations, not complete returns. Missing results stay gaps, not zeros.
Research tables land at `data/research/lithuania/`. Import with
`ATLAS_IMPORT_SCOPE=lithuania` (do not use `all`; that scope does not publish
Lithuania). See [Lithuania_Import.md](phase1/lithuania/Lithuania_Import.md).
Slim pack omitted raw `sources/` and `validate.py`. The importer publishes
the 53-row sources catalogue and 130 result rows. VPS deploy is out of scope.

Slovakia Prompt AI docs are in
[docs/phase1/slovakia/](phase1/slovakia/README.md)
(mapping Done; execution CI Not run). Justin accepted **5,871 current + 0
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
SK-HISTORICAL-UNIVERSE, SK-LOCAL-OLDER-VECTORS, SK-LOCAL-MISSING-CYCLES,
SK-REPEATS-CERTIFICATION, SK-VUC-INTRODUCTION, SK-CITY-PART-TIER, SK-EP,
SK-HOMONYMS-UNKEYED, SK-2026-CALL, and SK-AGGREGATES. Current: 2,887
municipal council/mayor pairs, 39 Bratislava/Košice city-part pairs, 8 VUC
assemblies, 8 direct chairs, the National Council, the direct presidency,
and the EP delegation. Direct executives 2,935;
councils/assemblies/chamber/delegation 2,936. City-part offices stay
drafted `other`. EP stays drafted `other`. 0 historical-only is not proof
of zero abolished offices. 44 missing local office-cycle bindings stay
absent. 2014/2018 council rows stay elected-only. Do not invent omitted
`data/research/slovakia/` bytes, result rows, identity vectors, historical
offices, or hold resolutions. This land is docs + tiers only; Atlas

Slovenia Prompt AJ docs are in
[docs/phase1/slovenia/](phase1/slovenia/README.md)
(mapping Done; execution CI Not run). Justin accepted **428 current + 0
historical** offices on 2026-09-22 with named holds. Standing policy
retains offices and historic rows outside the ~18-month alert window. HOLD:
SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS,
SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES,
SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL,
SI-LOCAL-PREFERENCE, and SI-NEXT-CALLS. Current: 212 municipal councils,
212 direct mayors, the National Assembly, the indirect National Council,
the popular presidency, and the EP delegation. Direct executives 213;
councils, chambers, or delegation 215. President is popularly elected.
National Council is indirect. EP stays drafted `other`. Zero regional
offices is the evidenced empty state. 0 historical-only is not proof of
zero abolished offices. The 2018 Ribnica council return stays missing.
1,172 damaged labels stay unrepaired. Roster aliases stay unapproved.
Do not invent omitted sources, results, identity vectors, historical
offices, or hold resolutions. This land is docs and tiers only; Atlas
importer waits.

Germany Prompt AS docs are in
[docs/phase1/germany/](phase1/germany/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=germany` only). Justin accepted **21,960 current +
670 historical** offices on 2026-09-22 with named holds DE-G01–DE-G23
left open. `research_coverage_complete` stays false. Standing policy
retains offices and historic rows outside the ~18-month alert window.
Draft jurisdiction tiers are 3 / 20 / 552 / 22,055 (tiers 1 / 2 / 3 / 4)
and stay on each row. The delivered direct-executive subset is 9,585.
Schleswig-Holstein stays at 86 verified direct mayors (DE-G06). Named
subdivision rosters stay unenumerated (DE-G10). The 26 territorial
relations do not assert office continuity (DE-G09). Fifteen Land seat
panels and Bavaria 1950 party votes stay withheld (DE-G23). This land
is docs and tiers only. Import with `ATLAS_IMPORT_SCOPE=germany` only; `all` does not publish Germany. Published events and result rows stay 0. See [Germany_Import.md](phase1/germany/Germany_Import.md). Do not invent omitted `sources/` or
`results.jsonl` bytes, missing SH mayors, subdivision rosters,
successor edges, or repaired seat panels.

United Kingdom Prompt AU docs are in
[docs/phase1/united-kingdom/](phase1/united-kingdom/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=united_kingdom` only). Justin accepted **482 current + 2
shadow (`current_shadow`) + 26 historical-only** offices on 2026-09-23
(America/Edmonton) with holds G01–G27 left open.
`research_coverage_complete` stays false. Standing policy retains offices
and historic rows outside the ~18-month alert window. Draft tiers are
2 / 5 / 76 / 427 (T1 / T2 / T3 / T4; 510 rows 1:1) and stay on each row.
Current direct executives are 64. Operational principal councils stay 382.
The parish/town subset stays the source-identified 27 (G16). Historical
EP participation ends in 2019 (G19). Crown Dependencies and BOT offices
stay excluded (G20). Lords, monarch, and Prime Minister popular contests
stay excluded (G01). No guessed reorganisation edges (G13). The two Surrey
shadow authorities stay `current_shadow` (G15). Import with `ATLAS_IMPORT_SCOPE=united_kingdom` only; `all` does not publish the United Kingdom. Published events and result rows stay 0. See [United_Kingdom_Import.md](phase1/united-kingdom/United_Kingdom_Import.md). Do not invent omitted `sources/`, `results.jsonl.gz`, or
`events.jsonl` bytes, documented omitted totals, a parish universe, a post-Brexit EP office, Crown
Dependency or BOT offices, Lords/PM contests, or guessed successor edges.
Italy Prompt AT docs are in
[docs/phase1/italy/](phase1/italy/README.md)
(mapping Done; importer landed, `ATLAS_IMPORT_SCOPE=italy` only). Justin accepted **15,917 current +
696 historical** offices, plus **8 statutory pending FVG** offices, on
2026-09-23 (America/Edmonton) with named holds IT-G01–IT-G19 left open.
`research_coverage_complete` stays false. Standing policy retains offices
and historic rows outside the ~18-month alert window. Draft jurisdiction
tiers are 4 / 38 / 11 / 16,568 (tiers 1 / 2 / 3 / 4; 16,621 rows 1:1) and
are not remapped. File `Justin_accepted` stays false. Current direct
executives are 7,992. Ordinary Delrio provincial and metropolitan bodies
stay dispositions, not popular offices (IT-G05). The eight FVG offices
stay pending first election with no invented date (IT-G06). Historical
696 rows are 348 explicit ES extinctions; office successor edges stay
unasserted (IT-G08). Seven Bolzano printed discrepancies stay unrepaired
(IT-G15). Submunicipal coverage stays the five Firenze quartieri
(IT-G13). Import with `ATLAS_IMPORT_SCOPE=italy` only; `all` does not publish Italy. Published events and result rows stay 0. See [Italy_Import.md](phase1/italy/Italy_Import.md). Do not invent circoscrizioni,
Delrio popular provinces, FVG election dates, runoff rows, repaired
Bolzano arithmetic, missing results, documented omitted totals, or guessed successor edges.

Iceland Prompt AV docs are in
[docs/phase1/iceland/](phase1/iceland/README.md)
(mapping Done; execution CI Not run). Justin accepted **63 current + 24
historical** offices on 2026-09-23 (America/Edmonton) with holds IS-G01 and
IS-G06 left open. `research_coverage_complete` stays false. Standing policy
retains offices and historic rows outside the ~18-month alert window.
Draft tiers are 85 municipal / 2 national (87 rows, 1:1) and every
`justin_approved` stays false. Current offices are 61 municipal councils,
Alþingi, and the President of Iceland. Direct municipal executives are 0.
European Parliament offices are 0. The 24 predecessor links are
source-supported; no guessed edge was added. Municipal numeric vectors that
are not transcribed stay null / `not_transcribed`, never 0 (IS-G01). The
2018 turnout source views stay distinct (IS-G06). This land is docs and
tiers only. Do not invent omitted `sources/`, `events.json`, or
`results.json` bytes, municipal numeric vectors, EP offices, or municipal
direct-executive offices. Atlas importer waits.

Serbia Prompt AX REBUILT docs are in
[docs/phase1/serbia/](phase1/serbia/JUSTIN_ACCEPTANCE.md)
(mapping Done; execution CI Not run). Justin accepted **173 current + 5
historical-only** offices on 2026-09-25 (America/Edmonton) with holds
RS-AX-G01–RS-AX-G11 left open, including the Kosovo scope gate (RS-AX-G05).
`research_coverage_complete` stays false. Draft tiers are 2 national / 1
regional / 175 municipal (178 rows, 1:1) and every `justin_approved` stays
false. Kosovo-scope offices stay 0. Direct local executives stay 0.
European Parliament offices stay 0. 531 events and 671 results are retained.
520 local result-state rows stay null / `not_transcribed`. Five crosswalk
rows are sourced same-territory status changes, not merger edges. This land
is docs and tiers only. Do not set `ATLAS_IMPORT_SCOPE`. Do not invent
Kosovo-scope offices, local numeric vectors, direct local executives, EP
offices, or extra successor edges. Atlas importer waits.

Bosnia and Herzegovina Prompt AW docs are in
[docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md)
(mapping Done; execution CI Not run). Justin accepted **306 current + 40
historical-only** offices on 2026-09-23 (America/Edmonton) with holds
BA-AW-G01–BA-AW-G09 left open. `research_coverage_complete` stays false.
Draft tiers are 4 national / 15 regional / 327 municipal (346 rows 1:1).
Every `justin_approved` flag stays false. Current councils/chambers/assemblies
are 158. Current direct executives/member offices are 148. Local representative
bodies stay 145 and local direct executives stay 142. European Parliament
offices stay 0. 749 Prompt O numeric rows stay an immutable reference
(`Bosnia_Identity_Vectors.json` blob `5228f504e759b24e5b6fe36a1ad56db5b0874f29`).
No successor edges are asserted. No 143rd mayor is added (BA-AW-G09). This
land is docs and draft tiers only. Do not invent omitted `sources/`,
`events.jsonl`, or `results.jsonl` bytes, numeric vectors, legal effective
dates, stable RS vice-president identities, or guessed successor edges.
Do not set `ATLAS_IMPORT_SCOPE=all`. Atlas importer waits.

Montenegro Prompt AY docs are in
[docs/phase1/montenegro/](phase1/montenegro/README.md)
(mapping Done; execution CI Not run). Justin accepted **27 current + 2
historical-only** offices on 2026-09-25 (America/Edmonton) with holds
ME-AY-G01–ME-AY-G11 left open. `research_coverage_complete` stays false.
Draft tiers are 2 national / 27 municipal (29 rows 1:1). Every
`justin_approved` flag stays false. Current offices are Parliament, the
President, and 25 local assemblies. Historical-only nested assemblies are
Golubovci and Tuzi-within-Podgorica. Events are 71 and result rows are 153.
The only current direct executive is the President. Direct local executives
are 0. European Parliament offices are 0. Both territorial relations keep
`successor_office_id` null. This land is docs and draft tiers only. Do not
invent local numeric vectors, a Šavnik 2022 final result, older local
contests, successor edges, a state-union federal office, a 2016 parliamentary
list vector, an EP office, a prospective local election, or a two-vote
correction to the 2006 return. Do not set `ATLAS_IMPORT_SCOPE`. Atlas
importer waits.
North Macedonia Prompt AZ docs are in
[docs/phase1/north-macedonia/](phase1/north-macedonia/README.md)
(mapping Done; execution CI Not run). Justin accepted **164 current + 8
historical-only** offices on 2026-09-25 (America/Edmonton) with the open
and partly resolved MK-AZ holds left open. `research_coverage_complete`
stays false. Draft tiers are 2 national / 170 municipal (172 rows 1:1).
Every `justin_approved` flag stays false. Current offices are Parliament,
the popularly elected President, 81 councils, and 81 popular mayors.
Current direct executives are 82. Historical-only offices are four councils
and four mayors. European Parliament offices stay 0. Regional offices stay 0.
`office_successor_edges` stays empty. The 2013 Kichevo claim is territorial,
not an office identity. This land is docs and draft tiers only. Do not invent
omitted `sources/`, `events.jsonl`, or `results.jsonl` bytes, offices, votes,
or guessed successor edges. Do not add North Macedonia to `ATLAS_IMPORT_SCOPE`.
Atlas importer waits.

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
| Albania tier file | **Approved** 2026-09-16 bytes preserved at `docs/phase1/albania/Phase1_approved_tiers.json` (122 municipal office IDs; regional=0 intentional; SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`). Schema path `schemas/atlas/tiers/albania.json` is the Prompt BA draft (891 rows; `justin_approved` false). The importer still classifies the 122 approved rows. |
| Alderney `other` | **Approved** 2026-09-16 at `schemas/atlas/tiers/alderney.json`. |
| Albania map | Proposed 46-municipality 2027 map is unverified in the package; geometry is not invented. |
| Prompt D continuity docs | **Documentation complete** in [docs/phase2/](phase2/README.md). Approved LatAm/NZ packs import; residual-heavy drafts skipped. No invented tiers. Production Mexico override still original 67. |
| Andorra Prompt J field map | **Documentation complete** in [docs/phase1/andorra/](phase1/andorra/README.md). Importer landed (PR #23). |
| Alderney Prompt K / Armenia Prompt L | Importers landed (PRs #24 / #26). Tiers approved. |
| Austria Prompt N field map | **Documentation complete** in [docs/phase1/austria/](phase1/austria/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=austria`; 2,038 offices). Package on main via PR #11. Approved `austria.json` is 2,034 municipal / 4 regional. |
| Bosnia Prompt O field map | **Documentation complete** in [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/Prompt_O_README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=bosnia`). Package on main via PR #15. Approved 13 regional bytes are preserved at `Prompt_O_approved_tiers.json` (SHA `2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501`). The importer schema-path pin is the Prompt AW draft SHA `96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9`; classifications stay the 13 regional Prompt O rows. |
| Bulgaria Prompt P field map | **Importer landed** in [docs/phase1/bulgaria/](phase1/bulgaria/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=bulgaria` publishes 530 accepted municipal offices / 0 regional. Package PR #16 head `de354127`. 3,067 district/village rows stay held. |
| Belgium Prompt S2 field map | **Documentation complete** in [docs/phase1/belgium-s2/](phase1/belgium-s2/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=belgium`). Research at `data/research/belgium-s2/`. `belgium.json` is 1,179 current + 55 historical accepted (1,185 municipal / 15 regional / 2 national / 32 other). |
| Netherlands Prompt T field map | **Importer landed** in [docs/phase1/netherlands/](phase1/netherlands/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=netherlands` publishes 432 current + 69 historical offices. Hilversum/Wijdemeren and 147 focused-tier reviews stay open. |
| Switzerland Prompt U field map | **Importer landed** in [docs/phase1/switzerland/](phase1/switzerland/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=switzerland` publishes 2,805 current + 11 historical accepted offices. Research at `data/research/switzerland/`. `switzerland.json` is 2,402 municipal / 52 regional / 2 national / 360 other. 308 commune-executive holds remain unpublished. Full-register certification OPEN. |
| Denmark Prompt X field map | **Documentation complete** in [docs/phase1/denmark/](phase1/denmark/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=denmark`). Research at `data/research/denmark/`. `denmark.json` is 106 current + 240 historical accepted (324 municipal / 20 regional / 1 national / 1 other). |
| Sweden Prompt Y field map | **Documentation complete** in [docs/phase1/sweden/](phase1/sweden/README.md). Mapping Done; importer CI Not run. Research at `data/research/sweden/`. `sweden.json` is 313 current + 7 historical accepted with holds (292 municipal / 25 regional / 1 national / 2 other). |
| Finland Prompt Z field map | **Documentation complete** in [docs/phase1/finland/](phase1/finland/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=finland`). Research at `data/research/finland/`. `finland.json` is 333 current + 170 historical accepted with holds (478 municipal / 22 regional / 2 national / 1 other). |
| Norway Prompt AA field map | **Documentation complete** in [docs/phase1/norway/](phase1/norway/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=norway`). Research at `data/research/norway/`. `norway.json` is 389 current + 537 historical accepted with holds (876 municipal / 32 regional / 1 national / 17 other). |
| Ireland Prompt AB field map | **Documentation complete** in [docs/phase1/ireland/](phase1/ireland/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=ireland`). Research at `data/research/ireland/`. `ireland.json` is 36 current + 86 historical accepted with holds (118 municipal / 0 regional / 3 national / 1 other). |
| Poland Prompt AC field map | **Importer landed** in [docs/phase1/poland/](phase1/poland/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=poland` publishes 5,310 current + 2 historical offices. Research at `data/research/poland/`. `poland.json` is 4,960 municipal / 330 regional / 3 national / 19 other. Powiat tier stays open. Results omitted from slim land are not invented. |
| Czechia Prompt V field map | **Importer landed** in [docs/phase1/czechia/](phase1/czechia/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=czechia` publishes 6,411 current + 13 historical offices. Research at `data/research/czechia/`. `czechia.json` is 6,257 municipal / 14 regional / 3 national / 150 other. Omitted `results.jsonl.gz` stays unpublished. |
| Croatia Prompt W field map | **Documentation complete** in [docs/phase1/croatia/](phase1/croatia/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=croatia`). Research at `data/research/croatia/`. `croatia.json` is 1,234 current + 11 historical accepted with holds (1,187 municipal / 55 regional / 2 national / 1 other). |
| Portugal Prompt AD field map | **Documentation complete** in [docs/phase1/portugal/](phase1/portugal/README.md). Mapping Done; importer CI Not run. Research at `data/research/portugal/`. `portugal.json` is 10,666 current + 8,168 historical accepted with holds (927 municipal / 2 regional / 2 national / 17,903 other). |
| Spain Prompt AE field map | **Documentation complete** in [docs/phase1/spain/](phase1/spain/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=spain`). Research at `data/research/spain/`. `spain.json` is 8,204 current + 4 historical accepted with holds (8,133 municipal / 68 regional / 2 national / 5 other). Results and raw sources omitted from the slim land. |
| Estonia Prompt AF field map | **Documentation complete** in [docs/phase1/estonia/](phase1/estonia/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=estonia`). Research at `data/research/estonia/`. `estonia.json` is 81 current + 200 historical accepted with holds (278 municipal / 0 regional / 2 national / 1 other). Results, identity vectors, and raw sources omitted from the slim land; imported result rows stay 0. |
| Latvia Prompt AG field map | **Documentation complete** in [docs/phase1/latvia/](phase1/latvia/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=latvia`, not `all`). Research at `data/research/latvia/`. `latvia.json` is 45 current + 121 historical accepted with holds (163 municipal / 0 regional / 2 national / 1 other). Identity vectors and raw sources omitted from the slim land. Historical 121 rows are identity records, not abolished councils. `results.json` publishes 1,383 rows. |
| Hungary Prompt AK field map | **Documentation complete** in [docs/phase1/hungary/](phase1/hungary/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=hungary`, not `all`). Research at `data/research/hungary/`. `hungary.json` is 6,378 current + 0 historical accepted with holds (6,355 municipal / 20 regional / 2 national / 1 other). Results, identity vectors, and raw sources omitted from the slim land; imported result rows stay 0. |
| Romania Prompt AL field map | **Documentation complete** in [docs/phase1/romania/](phase1/romania/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=romania`, not `all`). Research at `data/research/romania/`. `romania.json` is 6,460 current + 0 historical accepted with holds (6,372 municipal / 84 regional / 3 national / 1 other). Classifications stay `needs_review`. 23 national/EP result rows retained; local vectors absent. |
| Greece Prompt AM field map | **Documentation complete** in [docs/phase1/greece/](phase1/greece/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=greece`, not `all`). Research at `data/research/greece/`. `greece.json` is 693 current + 10 historical accepted with holds (674 municipal / 26 regional / 2 national / 1 other). Classifications stay `needs_review`. 14,004 result rows retained; omitted `sources/` are not invented. Historical numeric coverage stays incomplete. |
| Luxembourg Prompt AO field map | **Documentation complete** in [docs/phase1/luxembourg/](phase1/luxembourg/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=luxembourg`, not `all`). Research at `data/research/luxembourg/`. `luxembourg.json` is 102 current + 28 historical accepted with holds (128 municipal / 0 regional / 1 national / 1 other). Classifications stay `needs_review`. Published result rows stay 0; omitted `results.json` (48,197) and raw sources are not invented. |
| France Prompt AR field map | **Documentation complete** in [docs/phase1/france/](phase1/france/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=france`, not `all`). Research at `data/research/france/`. `france.json` is 35,112 current + 2,738 historical accepted with holds (draft T1 4 / T2 45 / T3 96 / T4 37,705; schema projection 4 national / 141 regional / 37,705 municipal / 0 other). Classifications stay `needs_review`. Published events and result rows stay 0; omitted `events.jsonl`, `results.jsonl`, `reporting-units.jsonl`, and raw sources are not invented. |
| Cyprus Prompt AQ field map | **Documentation complete** in [docs/phase1/cyprus/](phase1/cyprus/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=cyprus`, not `all`). Research at `data/research/cyprus/`. `cyprus.json` is 714 current + 174 historical accepted with holds (877 municipal / 5 regional / 5 national / 1 other). Classifications stay `needs_review`. Published result rows stay 0; omitted `results.json` (11,112) and raw sources are not invented. |
| Malta Prompt AP field map | **Documentation complete** in [docs/phase1/malta/](phase1/malta/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=malta`, not `all`). Research at `data/research/malta/`. `malta.json` is 213 current + 2 historical accepted with holds (204 municipal / 8 regional / 2 national / 1 other). Classifications stay `needs_review`. Published result rows stay 0; omitted `results.json` (4,084), `stv-counts.json` (64,204), and raw sources are not invented. |
| Lithuania Prompt AH field map | **Documentation complete** in [docs/phase1/lithuania/](phase1/lithuania/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=lithuania`, not `all`). Research at `data/research/lithuania/`. `lithuania.json` is 123 current + 0 historical accepted with holds (120 municipal / 0 regional / 2 national / 1 other). Draft tiers landed 1:1 and stay `needs_review`. Raw sources omitted from the slim land. `results.json` publishes 130 rows. |
| Slovakia Prompt AI field map | **Documentation complete** in [docs/phase1/slovakia/](phase1/slovakia/README.md). Mapping Done; importer CI Not run. Docs+tiers only. `slovakia.json` is 5,871 current + 0 historical accepted with holds (5,774 municipal / 16 regional / 2 national / 79 other). Research tables, results, sources, and identity vectors omitted. |
| Slovenia Prompt AJ field map | **Documentation complete** in [docs/phase1/slovenia/](phase1/slovenia/README.md). Mapping Done; importer CI Not run. Docs and tiers only. `slovenia.json` is 428 current + 0 historical accepted with holds (424 municipal / 0 regional / 3 national / 1 other). Identity vectors, sources, and results omitted from the slim land. |
| Germany Prompt AS field map | **Documentation complete** in [docs/phase1/germany/](phase1/germany/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=germany`, not `all`). Docs and tiers only. `germany.json` is 21,960 current + 670 historical accepted with holds (jurisdiction tiers 1/2/3/4 = 3 / 20 / 552 / 22,055). Classifications stay `needs_review`. Published events and result rows stay 0; omitted results and events are not invented and are not given omitted-total counters. DE-G01–DE-G23 stay open. `research_coverage_complete` stays false. |
| United Kingdom Prompt AU field map | **Documentation complete** in [docs/phase1/united-kingdom/](phase1/united-kingdom/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=united_kingdom`, not `all`). `united-kingdom.json` is 482 current + 2 shadow + 26 historical-only accepted with holds (draft tiers T1/T2/T3/T4 = 2 / 5 / 76 / 427; 510 rows 1:1). Classifications stay `needs_review`. Published events and result rows stay 0; omitted results and events are not invented and are not given omitted-total counters. G01–G27 stay open. `research_coverage_complete` stays false. |
| Italy Prompt AT field map | **Documentation complete** in [docs/phase1/italy/](phase1/italy/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=italy`, not `all`). `italy.json` is 15,917 current + 696 historical + 8 pending FVG accepted with holds (jurisdiction tiers 1/2/3/4 = 4 / 38 / 11 / 16,568; 16,621 rows 1:1). Classifications stay `needs_review`. Published events and result rows stay 0; omitted results and events are not invented and are not given omitted-total counters. IT-G01–IT-G19 stay open. `research_coverage_complete` stays false. File `Justin_accepted` stays false. |
| Iceland Prompt AV field map | **Documentation complete** in [docs/phase1/iceland/](phase1/iceland/README.md). Mapping Done; importer CI Not run. Docs and tiers only. `iceland.json` is 63 current + 24 historical accepted with holds (85 municipal / 2 national). IS-G01 and IS-G06 stay open. Every `justin_approved` stays false. `research_coverage_complete` stays false. `sources/`, `events.json`, and `results.json` omitted from the slim land. |
| Serbia Prompt AX field map | **Documentation complete** in [docs/phase1/serbia/](phase1/serbia/README.md). Mapping Done; importer CI Not run. Docs and tiers only. `serbia.json` is 173 current + 5 historical-only accepted with holds (2 national / 1 regional / 175 municipal; 178 rows 1:1). RS-AX-G01–RS-AX-G11 stay open, including the Kosovo scope gate. Kosovo-scope offices stay 0. Every `justin_approved` stays false. `research_coverage_complete` stays false. |
| Bosnia and Herzegovina Prompt AW field map | **Documentation complete** in [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md). Mapping Done; importer CI Not run. Docs and draft tiers only. Checked-in `bosnia-and-herzegovina.json` is the Prompt AW draft: 306 current + 40 historical-only accepted with holds (4 national / 15 regional / 327 municipal; 346 rows 1:1; `justin_approved` false). BA-AW-G01–BA-AW-G09 stay open. `research_coverage_complete` stays false. Prompt O identity vectors and the approved 13-regional classifier bytes are preserved. Slim land omits `sources/`, `events.jsonl`, and `results.jsonl`. |
| Albania Prompt BA field map | **Documentation complete** in [docs/phase1/albania/](phase1/albania/README.md). Mapping Done. Docs and draft tiers only. Checked-in `albania.json` is the Prompt BA draft: 123 current + 768 historical-only accepted with holds (1 national / 868 municipal / 22 other; 891 rows 1:1; `justin_approved` false). AL-BA-G01–AL-BA-G21 stay open. `research_coverage_complete` stays false. Phase 1 approved 122-municipal bytes are preserved. The existing importer still classifies those 122 rows. `ATLAS_IMPORT_SCOPE` is unchanged. Slim land omits `sources/`, `events.jsonl`, and `results.jsonl`. |
| Montenegro Prompt AY field map | **Documentation complete** in [docs/phase1/montenegro/](phase1/montenegro/README.md). Mapping Done; importer CI Not run. Docs and draft tiers only. `montenegro.json` is 27 current + 2 historical-only accepted with holds (2 national / 27 municipal; 29 rows 1:1; every `justin_approved` false). ME-AY-G01–ME-AY-G11 stay open. `research_coverage_complete` stays false. Atlas importer waits. |
| North Macedonia Prompt AZ field map | **Documentation complete** in [docs/phase1/north-macedonia/](phase1/north-macedonia/README.md). Mapping Done; importer CI Not run. Docs and draft tiers only. Checked-in `north-macedonia.json` is the Prompt AZ draft: 164 current + 8 historical-only accepted with holds (2 national / 170 municipal; 172 rows 1:1; `justin_approved` false). MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09–MK-AZ-G12, MK-AZ-G14–MK-AZ-G17, and MK-AZ-G19–MK-AZ-G23 stay open. `research_coverage_complete` stays false. Slim land omits `sources/`, `events.jsonl`, and `results.jsonl`. Atlas importer waits. |

Still out of scope: redirects, cutover, residual-heavy draft packs, and tightness. Austria, Belgium, Bosnia, and Bulgaria `import:atlas` load their approved lineages; the observatory still skips Austria/Bulgaria XZ and Bosnia gzip. Prompt M 95 sibling withholds: disposition accepted 2026-09-17 and docs PR #27 landed; production override remains 67.
