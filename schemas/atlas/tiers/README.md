# Per-country office tier classification

Checked-in files here map each package office ID to a proposed Atlas tier and to
schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` /
`council` / `other`).

These files are the Atlas classifiers. Workbook calendar cohort strings such as
Albania `Regional / municipal` are **not** classifiers.

Files were rebuilt from each package’s office register (one row per `office_id`;
no invented IDs). See [docs/phase0/REPORT.md](../../../docs/phase0/REPORT.md).
Albania municipal and Alderney `other` are **`approved`**. Andorra is **`approved`** (Justin 2026-09-16; 7 communal councils). Armenia is **`approved`** (Prompt L 2026-09-17; 71 municipal / 0 regional). Five Armenia boundary/calendar research reviews remain open separately from geographic-tier approval. Austria is **`approved`** (Prompt N 2026-09-17; 2,034 municipal / 4 regional). The Austria package is on main (PR #11, `f0f2c86`); `import:atlas` loads the lineage. The St. Georgen am Walde 2015 publication hold and open calendar/boundary research notes remain. Bosnia and Herzegovina is **`approved`** (Prompt O 2026-09-17; **all 13 regional**). The Bosnia package is on main (PR #15, `33454ab`); import with `ATLAS_IMPORT_SCOPE=bosnia`. Open RS presidential / coalition / calendar-certainty notes remain; do not invent Brčko or municipal offices. Bulgaria is **`approved` with a hold** (Prompt P 2026-09-19; **530 municipality-wide municipal accepted**, **3,067 district/village held**, **0 regional**). The Bulgaria package is on main (PR #16 head `de354127`); `import:atlas` with `ATLAS_IMPORT_SCOPE=bulgaria` loads only the 530 accepted rows unless submunicipal policy changes. Градец / qualification-change notes remain open. Belgium is **`approved`** (Prompt S2 2026-09-19; **1,179 current + 55 historical**; 1,185 municipal / 15 regional / 2 national / 32 other). Research lives at `data/research/belgium-s2/`; import with `ATLAS_IMPORT_SCOPE=belgium`. Remaining-universe indirect-body gaps stay open. Netherlands is **`approved`** (Prompt T 2026-09-19; **432 current + 69 historical**; 414 municipal / 12 regional / 3 national / 72 other). Research lives at `data/research/netherlands/`; import with `ATLAS_IMPORT_SCOPE=netherlands`. Hilversum/Wijdemeren successor binding, named historic gaps, and ~147 focused-tier reviews stay open. Switzerland is **`approved` with holds** (Prompt U 2026-09-19; **2,805 current + 11 historical accepted subset**; 2,402 municipal / 52 regional / 2 national / 360 other). Research lives at `data/research/switzerland/`; import with `ATLAS_IMPORT_SCOPE=switzerland`. Full-register certification remains OPEN. 308 commune-executive gaps (VD 284, SZ 24), thin historic/merger archive, 1,938 parliament caveats, and disputed-result notes stay open. Denmark is **`approved`** (Prompt X 2026-09-19; **106 current + 240 historical**; 324 municipal / 20 regional / 1 national / 1 other). Research lives at `data/research/denmark/`; import with `ATLAS_IMPORT_SCOPE=denmark`. Greenland/Faroe Realm coverage gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps stay open. No popular mayor rows. Sweden is **`approved` with holds** (Prompt Y 2026-09-19; **313 current + 7 historical**; 292 municipal / 25 regional / 1 national / 2 other). Research lives at `data/research/sweden/`; import with `ATLAS_IMPORT_SCOPE=sweden`. Named holds SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS, SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, and SE-FARGELANDA-1973 stay open. No popular kommunalråd / prime-minister / cabinet rows. Finland is **`approved` with holds** (Prompt Z 2026-09-19; **333 current + 170 historical**; 478 municipal / 22 regional / 2 national / 1 other). Research lives at `data/research/finland/`; import with `ATLAS_IMPORT_SCOPE=finland`. Named holds FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and FI-MISSING-RESULTS stay open. No popular manager / prime-minister / cabinet rows. Norway is **`approved` with holds** (Prompt AA 2026-09-19; **389 current + 537 historical**; 876 municipal / 32 regional / 1 national / 17 other). Research lives at `data/research/norway/`; import with `ATLAS_IMPORT_SCOPE=norway`. Named holds SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES stay open. No popular mayor / prime-minister / cabinet or EP rows. Ireland is **`approved` with holds** (Prompt AB 2026-09-20; **36 current + 86 historical**; 118 municipal / 0 regional / 3 national / 1 other). Research lives at `data/research/ireland/`; the Atlas importer waits. Named holds IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS stay open. Northern Ireland is excluded. Poland is **`approved` with holds** (Prompt AC 2026-09-20; **5,310 current + 2 historical**; 4,960 municipal / 330 regional / 3 national / 19 other). Research lives at `data/research/poland/`; import with `ATLAS_IMPORT_SCOPE=poland`. Named holds PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS, PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY, PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES, PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES stay open. 16 sejmiks + 314 powiat councils remain drafted regional (PL-POWIAT-TIER left open — do not reclassify). Czechia is **`approved` with holds** (Prompt V 2026-09-20; **6,411 current + 13 historical**; 6,257 municipal / 14 regional / 3 national / 150 other). Research lives at `data/research/czechia/`; import with `ATLAS_IMPORT_SCOPE=czechia`. Slim land omits `results.jsonl.gz`; result rows are not invented. Named holds MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, and DATES-AND-NEXT-CYCLES stay open. President is the only direct executive; 0 direct local executives. Croatia is **`approved` with holds** (Prompt W 2026-09-20; **1,234 current + 11 historical**; 1,187 municipal / 55 regional / 2 national / 1 other). Research lives at `data/research/croatia/`; import with `ATLAS_IMPORT_SCOPE=croatia`. Named holds CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY, TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017, TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS, PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY stay open. Current: 577 executive tickets + 79 independently elected deputies + 576 assemblies. Portugal is **`approved` with holds** (Prompt AD 2026-09-21; **10,666 current + 8,168 historical**; 927 municipal / 2 regional / 2 national / 17,903 other). Research lives at `data/research/portugal/`; the Atlas importer waits. Named holds CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37, PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS, DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF, PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022, EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, and CERTIFICATION-AND-MARGINS stay open. Current: 308 municípios / 3,258 freguesias (37 plenary). Historical = unresolved aliases (PARISH-REFORM-2013-2025). Parish share remains drafted `other` (PARISH-TIER — do not reclassify). Spain is **`approved` with holds** (Prompt AE 2026-09-21; **8,204 current + 4 historical**; 8,133 municipal / 68 regional / 2 national / 5 other). Research lives at `data/research/spain/`; the Atlas importer waits. Named holds ES-G01, ES-G02, ES-G03, ES-G04, ES-G05, ES-G06, ES-G07, ES-G08, ES-G09, ES-G10, ES-G11, and ES-G12 stay open. Estonia is **`approved` with holds** (Prompt AF 2026-09-21; **81 current + 200 historical**; 278 municipal / 0 regional / 2 national / 1 other). Research lives at `data/research/estonia/`; import with `ATLAS_IMPORT_SCOPE=estonia`. Named holds EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and EE-G09 stay open. Current direct-executive offices are 0; the presidency is indirect. Latvia is **`approved` with holds** (Prompt AG 2026-09-21; **45 current + 121 historical**; 163 municipal / 0 regional / 2 national / 1 other). Research lives at `data/research/latvia/`; the Atlas importer waits. Named holds LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, and LV-G09 stay open. Historical 121 rows are identity records, not abolished councils. Current direct-executive offices are 0; the presidency is indirect. Hungary is **`approved` with holds** (Prompt AK 2026-09-22; **6,378 current + 0 historical**; 6,355 municipal / 20 regional / 2 national / 1 other). Research lives at `data/research/hungary/`; the Atlas importer waits. Named holds HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS (documented exclusion), and HU-UPCOMING stay open. Direct mayors are 3,178; the presidency is indirect. Romania is **`approved` with holds** (Prompt AL 2026-09-22; **6,460 current + 0 historical**; 6,372 municipal / 84 regional / 3 national / 1 other). Research lives at `data/research/romania/`; the Atlas importer waits. Named holds RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07 stay open. The presidency is popular. County presidents are marked direct for current law; 2016 was council investiture and is not a popular-election event. No local result vectors were invented. Greece is **accepted with holds** (Prompt AM 2026-09-22; **693 current + 10 historical**; 674 municipal / 26 regional / 2 national / 1 other). Research lives at `data/research/greece/`; the Atlas importer waits. Named holds GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09, and GR-G10 stay open, plus 14 local source holds. President `GR-PRES` is parliamentary indirect. No Kallikratis successor edges were added. Luxembourg is **`approved` with holds** (Prompt AO 2026-09-22; **102 current + 28 historical**; 128 municipal / 0 regional / 1 national / 1 other). Research lives at `data/research/luxembourg/`; the Atlas importer waits. Named holds LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and LU-G11 stay open. LU-G01 (Grand Duke) and LU-G02 (mayors) are resolved exclusions. Direct executives are 0. No guessed merger edges and no invented 1994 EP votes. France is **`approved` with holds** (Prompt AR 2026-09-22; **35,112 current + 2,738 historical**; draft T1 4 / T2 45 / T3 96 / T4 37,705). Research lives at `data/research/france/`; the Atlas importer waits. Named holds G01–G21 stay open. Direct executives current: 1 (president). `FR-EP` stays draft tier 1 and was not moved to `other`. No popular mayor contest, EPCI popular contest, guessed commune-nouvelle edge, or zero-filled result was invented. Cyprus is **`approved` with holds** (Prompt AQ 2026-09-22; **714 current + 174 historical**; 877 municipal / 5 regional / 5 national / 1 other). Research lives at `data/research/cyprus/`; the Atlas importer waits. Named holds CY-G01, CY-G02, CY-G03, CY-G04, CY-G05, CY-G06, CY-G07, CY-G08, CY-G09, CY-G10, CY-G11, CY-G12, CY-G13, CY-G14, and CY-G15 stay open. The 285-versus-286 community count stays unresolved. No 286th free-area community, TRNC office, 2024 successor edge, Spilia code join, or zero-filled local return was added. The successor crosswalk stays empty. EP stays drafted `other`. Direct executives are 404. Malta is **`approved` with holds** (Prompt AP 2026-09-22; **213 current + 2 historical**; 204 municipal / 8 regional / 2 national / 1 other). Research lives at `data/research/malta/`; the Atlas importer waits. Named holds from `Malta_Research_Gaps` stay open: presidential earlier resolutions and House division tallies, STV paper-level transfers, post-election casual/co-option, mayoral first-meeting audit, local creation and boundary history, regional sole-nominee and successor gaps, Gozo Civic Council depth, EP replacements and the sixth-seat transition, certified-versus-preliminary labels, and the production-schema pin. Standalone direct-executive offices are 0. Mayors and deputies are not separate popular ballots. The presidency is indirect. No successor link from the Gozo Civic Council to the modern Gozo Region.
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
| [`switzerland.json`](switzerland.json) | 2816 | `municipal` (2402) + `regional` (52) + `national` (2) + `other` (360) | **Accepted-with-holds** 2026-09-19 (Justin / Prompt U). 2,805 current + 11 historical subset. HOLD 308 commune executives (VD 284, SZ 24), thin historic, 1,938 parliament caveats. Full-register certification OPEN. Importer via `ATLAS_IMPORT_SCOPE=switzerland` |
| [`denmark.json`](denmark.json) | 346 | `municipal` (324) + `regional` (20) + `national` (1) + `other` (1) | **Approved** 2026-09-19 (Justin / Prompt X). 106 current + 240 historical. Greenland/Faroe Realm, 2007/earlier mergers, KMD/DST holes, 98 candidate bindings, and EP detail stay open. Importer via `ATLAS_IMPORT_SCOPE=denmark` |
| [`sweden.json`](sweden.json) | 320 | `municipal` (292) + `regional` (25) + `national` (1) + `other` (2) | **Accepted-with-holds** 2026-09-19 (Justin / Prompt Y). 313 current + 7 historical. HOLD Gotland municipal, EP+Sameting other, 2026 preliminary locals, historic boundary/party/repeat notes, Färgelanda 1973. Importer via `ATLAS_IMPORT_SCOPE=sweden` |
| [`finland.json`](finland.json) | 503 | `municipal` (478) + `regional` (22) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-19 (Justin / Prompt Z). 333 current + 170 historical. HOLD historic mergers, early Åland dates, wellbeing transition, EP detail, cycle legal detail, party categories, missing results. Importer via `ATLAS_IMPORT_SCOPE=finland` |
| [`norway.json`](norway.json) | 926 | `municipal` (876) + `regional` (32) + `national` (1) + `other` (17) | **Accepted-with-holds** 2026-09-19 (Justin / Prompt AA). 389 current + 537 historical. HOLD Sami 2025 98d conflict, 2020/2024 reform, Oslo borough / Longyearbyen history, legal repeats, county aggregates, older Sami, municipal depth, party categories. Importer via `ATLAS_IMPORT_SCOPE=norway` |
| [`ireland.json`](ireland.json) | 122 | `municipal` (118) + `regional` (0) + `national` (3) + `other` (1) | **Accepted-with-holds** 2026-09-20 (Justin / Prompt AB). 36 current + 86 historical. HOLD 2014 reform successors, 2019/2024 local vectors, Seanad panels, EP results, Dáil encoding/STV, latest president, mayor limit, Northern Ireland exclusion, regional appointments. Importer via `ATLAS_IMPORT_SCOPE=ireland` |
| [`poland.json`](poland.json) | 5312 | `municipal` (4960) + `regional` (330) + `national` (3) + `other` (19) | **Accepted-with-holds** 2026-09-20 (Justin / Prompt AC). 5,310 current + 2 historical. HOLD historic territories, 1990–1999 reforms, cycle legal status, 2019 share unit, special-return detail, Warsaw auxiliary, powiat tier (16 sejmiks + 314 powiat drafted regional — do not reclassify), EP scope, title/boundary changes, older national history, margins/parties, next dates. Results omitted from slim land. Importer: `ATLAS_IMPORT_SCOPE=poland` |
| [`czechia.json`](czechia.json) | 6424 | `municipal` (6257) + `regional` (14) + `national` (3) + `other` (150) | **Accepted-with-holds** 2026-09-20 (Justin / Prompt V). 6,411 current + 13 historical. HOLD municipal recalculated percent, historical code binding, Prague dual-status, military–civilian transition, current roster validity, executive mode, historic depth, legal-outcome repeat audit, EP party scope, dates and next cycles. Results omitted from slim land. Importer via `ATLAS_IMPORT_SCOPE=czechia` |
| [`croatia.json`](croatia.json) | 1245 | `municipal` (1187) + `regional` (55) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-20 (Justin / Prompt W). 1,234 current + 11 historical. HOLD current roster validity, Zagreb dual, deputy eligibility, territorial reforms, special/supplementary, missing Biskupija 2017, Tar-Vabriga placeholder, seats/legal finality, Sabor minority basis, party identity, EP detail, dates/next cycles, excluded auxiliary. Importer via `ATLAS_IMPORT_SCOPE=croatia` |
| [`portugal.json`](portugal.json) | 18834 | `municipal` (927) + `regional` (2) + `national` (2) + `other` (17903) | **Accepted-with-holds** 2026-09-21 (Justin / Prompt AD). 10,666 current + 8,168 historical. HOLD current register date, indirect/list-head, plenary 37, parish reform 2013–2025 (historical = unresolved aliases — do not treat as proved abolitions), parish tier (17,903 other kept as drafted — do not reclassify), legacy code conflicts, dates/repeats/specials, published aggregate conflicts, PR 2026 runoff, PR 2016 Margarita, Azores compensation, Madeira correction, AR Europe 2022, EP detail, pre-2009/candidates, MAI feed holes, certification/margins. Atlas importer waits |
| [`spain.json`](spain.json) | 8208 | `municipal` (8133) + `regional` (68) + `national` (2) + `other` (5) | **Accepted-with-holds** 2026-09-21 (Justin / Prompt AE). 8,204 current + 4 historical. HOLD ES-G01–ES-G12 (municipal modes pending, scanned returns, disputed duplicates, provincial Diputaciones chronology, Ceuta/Melilla/Formentera/Aran/Basque Juntas tier policy, island currency, calendar unknowns, submunicipal scope, source acquisition, result interpretation). 78 explicit concejo-abierto direct executives; 3,762 municipal modes still pending. Results omitted from slim land. Atlas importer waits |
| [`estonia.json`](estonia.json) | 281 | `municipal` (278) + `regional` (0) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-21 (Justin / Prompt AF). 81 current + 200 historical. HOLD EE-G01 2017 reform/successor bindings, EE-G02 pre-2013/special history, EE-G03 2021 presidential gap, EE-G04 mayor-mode legal text, EE-G05 EP tier/replacements, EE-G06 2013 625334 vs 625336, EE-G07 date precision, EE-G08 Jõhvi transition, EE-G09 nonadditive interpretation. Current direct-executive offices 0. Importer via `ATLAS_IMPORT_SCOPE=estonia` |
| [`latvia.json`](latvia.json) | 166 | `municipal` (163) + `regional` (0) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-21 (Justin / Prompt AG). 45 current + 121 historical. HOLD LV-G01 2021 reform/cross-epoch identities, LV-G02 earlier history/repeats, LV-G03 incomplete presidential ballots, LV-G04 chair vs executive director, LV-G05 EP replacements, LV-G06 seven 2022 percentage conflicts, LV-G07 certification/grain, LV-G08 dates, LV-G09 retained source scope. Historical 121 rows are identity records, not abolished councils. Current direct-executive offices 0. Atlas importer waits |
| [`hungary.json`](hungary.json) | 6378 | `municipal` (6355) + `regional` (20) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AK). 6,378 current + 0 historical. HOLD HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS (documented exclusion), HU-UPCOMING. Direct mayors 3,178; councils/assemblies 3,198. Presidency indirect. Bozsok/Pakod 2024 return gaps open. Results omitted from slim land. Atlas importer waits |
| [`romania.json`](romania.json) | 6460 | `municipal` (6372) + `regional` (84) + `national` (3) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AL). 6,460 current + 0 historical. HOLD RO-G01 local-results (missing ≠ zero), RO-G02 president vectors and 2024 annulment, RO-G03 county-president legal/returns (2016 investiture not popular), RO-G04 Bucharest sectors, RO-G05 EP 2014/2019, RO-G06 territorial-history (no guessed merger edges), RO-G07 parliament detail. Direct executives 3,229; councils/assemblies 3,230. 23 national/EP result rows only. Atlas importer waits |
| [`greece.json`](greece.json) | 703 | `municipal` (674) + `regional` (26) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AM Rebuilt). 693 current + 10 historical. HOLD GR-G01–GR-G10 plus 14 local source holds (2019 regional station denominators; Messini 2014 tied runoff). President `GR-PRES` parliamentary indirect. No PM/cabinet/prefect rows. No Kallikratis successor edges. Per-office review stays `needs_review`. Sources omitted from slim land. Atlas importer waits |
| [`luxembourg.json`](luxembourg.json) | 130 | `municipal` (128) + `regional` (0) + `national` (1) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AO). 102 current + 28 historical. HOLD LU-G03–LU-G11. LU-G01 Grand Duke and LU-G02 mayors are resolved exclusions. Direct executives 0. 28 explicit merger edges. 1994 EP Grevenmacher LSAP votes not invented. `results.json` and sources omitted from slim land. Atlas importer waits |
| [`france.json`](france.json) | 37850 | draft T1 (4) + T2 (45) + T3 (96) + T4 (37705); schema projection `national` (4) + `regional` (141) + `municipal` (37705) + `other` (0) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AR). 35,112 current + 2,738 historical. HOLD G01–G21. Direct executives current: 1. `FR-EP` stays draft tier 1. PLM sectors stay draft tier 4. Successor crosswalk empty. Results omitted from slim land. Atlas importer waits |
| [`cyprus.json`](cyprus.json) | 888 | `municipal` (877) + `regional` (5) + `national` (5) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AQ). 714 current + 174 historical. HOLD CY-G01–CY-G15. Communities file 285 versus ministry overview 286. Successor crosswalk empty. Spilia Kourdali code unresolved. Results and sources omitted from slim land. Atlas importer waits |
| [`malta.json`](malta.json) | 215 | `municipal` (204) + `regional` (8) + `national` (2) + `other` (1) | **Accepted-with-holds** 2026-09-22 (Justin / Prompt AP). 213 current + 2 historical. HOLD presidential tallies, STV paper transfers, post-election casual/co-option, mayoral first-meeting audit, local creation/boundaries, regional sole nominees, Gozo Civic Council, EP replacements/sixth seat, certification labels, production-schema pin. Direct executives 0. `stv-counts.json`, `results.json`, and sources omitted from slim land. Atlas importer waits |

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
those bytes. Import with `ATLAS_IMPORT_SCOPE=switzerland`; do not use `all`
on the VPS for this lineage.

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
not invent those bytes. Import with `ATLAS_IMPORT_SCOPE=denmark`; do not use
`all` on the VPS for this lineage.

**Sweden** is **approved with holds** (Prompt Y, Justin 2026-09-19
America/Edmonton; SHA-256
`dc13885023d2d454dae39272a5fe668e384e7606d4f2f89a3df136e9f0170ef7`;
predecessor draft `ba95b2671f56b45077e9a4987e54d59438793cdfe053d8486de04dc54c0f2139`).
Exact 320 office IDs: **313 current + 7 historical** (292 municipal /
25 regional / 1 national / 2 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
SE-GOTLAND-TIER (keep municipal `SE-K0980-C`; no second regional office),
SE-EP-SAM-TIER (EP and elected Sameting remain `other`),
SE-2026-COUNT-IN-PROGRESS (310 local 2026 vectors remain preliminary),
SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT,
and SE-FARGELANDA-1973 (hypothetical 1973 seats withheld from typed seats).
Focused-tier review rows (10) keep drafted tiers; Justin accepted the
register universe. No popular kommunalråd / prime-minister / cabinet rows.
Do not invent a second Gotland regional office or fabricate 2026 final
local counts. Research tables live at `data/research/sweden/`. Slim pack
omitted bulky sources; do not invent those bytes. Import with
`ATLAS_IMPORT_SCOPE=sweden`; do not use `all` on the VPS for this lineage.

**Finland** is **approved with holds** (Prompt Z, Justin 2026-09-19
America/Edmonton; SHA-256
`15edd48df39caae6cfefec9b20b0a20a7bafcfe7e919accbb46d056924083d53`;
predecessor draft `7c3a4c1c17538d5600a10c655e7fb18b12f977a1ef79c7608f9869d813df2797`).
Exact 503 office IDs: **333 current + 170 historical** (478 municipal /
22 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION,
FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and
FI-MISSING-RESULTS. All 308 current municipal councils are present,
including 16 Åland councils; Helsinki is counted once. Focused-review
flags remain on FI-EP and the 170 historical municipal offices; Justin
accepted the register universe. No popular appointed-manager / prime-minister
/ cabinet rows. Do not invent merger successors, early Åland contests,
wellbeing predecessors, or missing result scalars. Research tables live
at `data/research/finland/`. Slim pack omitted bulky sources; do not
invent those bytes. Import with `ATLAS_IMPORT_SCOPE=finland`; do not use
`all` on the VPS for this lineage.

**Norway** is **approved with holds** (Prompt AA, Justin 2026-09-19
America/Edmonton; SHA-256
`8ff8fc545ab326b135ac8a116d013c3dbecce377750e26dfc008bcea134db827`;
predecessor draft `dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0`).
Exact 926 office IDs: **389 current + 537 historical** (876 municipal /
32 regional / 1 national / 17 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY,
LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES,
SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES. All
357 current municipal councils and 14 separate county councils are present;
Oslo bystyre is counted once for combined municipal/county functions.
Focused-review flags remain on boroughs, Sámediggi, Longyearbyen, Oslo
bystyre, and historical offices; Justin accepted the register universe. No
popular mayor / prime-minister / cabinet or EP rows. Do not invent merger
successors, borough/Longyearbyen result histories, certified legal
outcomes, or missing result scalars. Research tables live at
`data/research/norway/`. Slim pack omitted bulky sources; do not invent
those bytes. Import with `ATLAS_IMPORT_SCOPE=norway`; do not use `all`
on the VPS for this lineage.

**Ireland** is **approved with holds** (Prompt AB, Justin 2026-09-20
America/Edmonton; SHA-256
`f4426e0df1b99d6e3330c345e33a83022cf654b180c659e03c0e889ae4327ca0`;
predecessor draft `0683410a3e3b8f1c1bc5b69df0793fd5bbba524658556a51ca76d3aeb7ae3470`).
Exact 122 office IDs: **36 current + 86 historical** (118 municipal /
0 regional / 3 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS,
IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT,
IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS. All 31
current local authority councils are present, plus Dáil Éireann, Seanad
Éireann, President of Ireland, Ireland EP delegation (`other`), and the
directly elected Mayor of Limerick. 86 historical councils (75 town, 5
borough, 6 pre-2014 city/county) stay with sourced 2009 contexts; no
guessed merger successors. Northern Ireland is excluded from this
Republic of Ireland pack. Regional assemblies under SI573/2014 Article 5
are councillor appointments, not a popular regional tier. Focused-review
flags remain on historical councils, EP, and Seanad; Justin accepted the
register universe. Do not invent merger successors, EP result vectors,
recent presidential returns, or missing first-preference scalars.
Research tables live at `data/research/ireland/`. Slim pack omitted bulky
sources; do not invent those bytes. Import with `ATLAS_IMPORT_SCOPE=ireland`;
do not use `all` on the VPS for this lineage.

**Poland** is **approved with holds** (Prompt AC, Justin 2026-09-20
America/Edmonton; SHA-256
`8316357779f24b8f0ffe58640ef6d32370dff2c2e4f7e7dcf7e4ee23440e6d14`;
predecessor draft `bd11a49634b12aa699e0ead91aff64a68e257efe6fc3fc542c44818a2167f2cd`).
Exact 5,312 office IDs: **5,310 current + 2 historical** (4,960 municipal /
330 regional / 3 national / 19 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS,
PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY,
PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES,
PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES.
Sejm, Senat, President of the Republic, and the Poland EP delegation are
present, plus 16 voivodeship sejmiks, 314 powiat councils, 2,479 current
municipal councils, and 2,479 current direct municipal executives.
Historic Ostrowice council and wójt are retained without invented
successor edges. **PL-POWIAT-TIER is left open:** 16 sejmiks + 314 powiat
councils are drafted `regional` — do not reclassify and do not report 330
as 330 voivodeships. Warsaw district councils and the EP delegation remain
`other`. No appointed voivode or popular PM/cabinet rows. Do not invent
historic territories, pre-1999 reform archives, omitted result files, or
merger successors. Research tables live at `data/research/poland/`. Slim
pack omitted bulky sources and `results.jsonl.gz` / `result-identity-vectors.jsonl.gz`;
do not invent those bytes. Import with `ATLAS_IMPORT_SCOPE=poland`.

**Czechia** is **approved with holds** (Prompt V, Justin 2026-09-20
America/Edmonton; SHA-256
`6b7c856cf164a0d04fc58048783593591855e40c626b0a0ee767d666910bd66a`;
predecessor draft `465c61ab0836ec18fd03c1e6af922e9918a184be00237fd238f0107386235244`).
Exact 6,424 office IDs: **6,411 current + 13 historical** (6,257 municipal /
14 regional / 3 national / 150 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS,
MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE,
HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, and
DATES-AND-NEXT-CYCLES. President of the Czech Republic is the only direct
executive; direct local / regional executives are 0 (council-selected
mayors and governors excluded). 6,420 council / assembly offices are
retained. Prague city assembly (`CZ-M554782-C`) is one regional proposal
with municipal dual function; borough councils and the EP delegation remain
`other`. Historical CISOB / municipal codes are retained with no invented
successors. Focused-review flags remain on boroughs, Prague, EP, and
historical identities (155); Justin accepted the register universe. Do not
invent merger edges, municipal vote-share corrections, omitted
`results.jsonl.gz`, or identity vector blobs. Research tables live at
`data/research/czechia/`. Slim pack omitted bulky sources, `results.jsonl.gz`,
and identity vectors; `events.json` is carried as `events.json.gz` only.
Do not invent those bytes. The Atlas importer waits.

**Croatia** is **approved with holds** (Prompt W, Justin 2026-09-20
America/Edmonton; SHA-256
`2f5c00d677e1756ac3dd553295df5ef84b547bfe0927c1f3c1aa249c433b430a`;
predecessor draft `e5528335fbf28ccec62187574e4928e087cd53f56fa03e47e67f8c8dad58a48d`).
Exact 1,245 office IDs: **1,234 current + 11 historical** (1,187 municipal /
55 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY,
TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017,
TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS,
PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, and EXCLUDED-AUXILIARY.
Current scope is the captured DIP 2025 ordinary local/regional ballot
register plus Sabor, President, and EP: 577 executive tickets + 79
independently elected deputies + 576 assemblies. Zagreb is one dual
city/county assembly/executive pair (`HR-Z21-C` / `HR-Z21-E`, proposed
regional), separate from Zagrebačka županija. Historical independently
elected deputy identities are retained with no invented successor edges.
Sabor and President are `national`; EP remains `other`. Do not invent
omitted `sources/` bytes, seat allocations, or merger successors.
Research tables live at `data/research/croatia/`. Slim pack omitted bulky
sources; `events.json` is carried as `events.json.gz` only;
`results.jsonl.gz` is retained. Import with `ATLAS_IMPORT_SCOPE=croatia`.

**Portugal** is **approved with holds** (Prompt AD, Justin 2026-09-21
America/Edmonton; SHA-256
`47f4fac833e61bad953abfb72f6e3253a1f4c2d7f35938b73de57f7b07724caa`;
predecessor draft `5155830f9141ebe7607d51e888e804f63fe2305426d20998ff6e16917da5d651`).
Exact 18,834 office IDs: **10,666 current + 8,168 historical** (927 municipal /
2 regional / 2 national / 17,903 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37,
PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS,
DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF,
PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022,
EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, and
CERTIFICATION-AND-MARGINS. Current scope is the CNE 2025 mandate register:
308 municípios and 3,258 freguesias (including 37 plenary parishes).
Municipal assemblies, Câmaras, and municipal president mandates are 308
each. Parish assemblies are 3,221; juntas and parish presidents are 3,258
each. Câmara presidents are winning-list heads: no second mayoral ballot
is invented. Regional executive appointments are documented without popular
election rows. **PARISH-REFORM-2013-2025 is left open:** 8,168 historical
records are unresolved aliases, not proved abolitions. **PARISH-TIER is
left open:** parish bodies/heads remain drafted `other` — do not
reclassify and do not report 17,903 as municipal. Assembleia da República
and Presidente da República are `national`; Azores and Madeira assemblies
are `regional`; EP remains `other`. Do not invent omitted `sources/`
bytes, uncompressed `results.json`, identity vector blobs, or merger
successors. Research tables live at `data/research/portugal/`. Slim pack
omitted bulky sources, uncompressed `results.json`, and
`Portugal_Identity_Vectors.json`; `events.json`, `office-register.json`,
`identity-crosswalk.json`, `register-bindings.json`, and
`return-reconciliation.json` are carried as `.gz` only;
`results.jsonl.gz` is retained. The Atlas importer waits.

**Spain** is **approved with holds** (Prompt AE, Justin 2026-09-21)
America/Edmonton; SHA-256
`61f8176df88a09d097e5d557b5a8cadf91acc7c28b5cf4f4ead79071b4364049`;
predecessor draft `f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f`).
Exact 8,208 office IDs: **8,204 current + 4 historical** (8,133 municipal /
68 regional / 2 national / 5 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
ES-G01, ES-G02, ES-G03, ES-G04, ES-G05, ES-G06, ES-G07, ES-G08, ES-G09,
ES-G10, ES-G11, and ES-G12. All 8,132 current INE municipal territorial
entries are retained. Explicit concejo-abierto direct executives: 78;
3,762 municipal modes still pending. Formentera is counted once as a
combined municipal/island body (`other`). Ceuta/Melilla and Aran remain
`other`; Basque elected Juntas are distinct from executive Diputaciones.
Congress and Senate are `national`; EP remains `other`. Do not invent
omitted `sources/` bytes, `results.json`, identity vectors, ordinary
direct mayors, or hold resolutions. Research tables live at
`data/research/spain/`. Slim pack omitted bulky sources, `results.json`,
and identity vectors; `events.json` is carried as `events.json.gz` only.
The Atlas importer waits.

**Estonia** is **approved with holds** (Prompt AF, Justin 2026-09-21
America/Edmonton; SHA-256
`bf86952fe8966a792166064e6505932ce590c3643951a802ba55896a332cfa8d`;
predecessor draft `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`).
Exact 281 office IDs: **81 current + 200 historical** (278 municipal /
0 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, and
EE-G09. Current scope is 78 municipal councils, Riigikogu, the indirect
presidency, and the Estonia EP delegation (`other`). Current
direct-executive offices are 0. Local rosters are 2013=215, 2017=79,
2021=79, 2025=78. The 200 historical EHAK-coded councils stay separate;
no successor edges were added. Do not invent 2017 successor bindings,
pre-2013 or special history, a 2021 presidential row, mayor ballots, EP
replacements, a 625,334 vs 625,336 correction, date refinements, a Jõhvi
successor edge, or nonadditive candidate shares. Research tables live at
`data/research/estonia/`. Slim pack omitted `results.json`,
`Estonia_Identity_Vectors.json`, and raw `sources/`; `events.json`,
nonadditive summaries, and the input inventory are normal JSON. Do not
invent those bytes. Importer via `ATLAS_IMPORT_SCOPE=estonia` (0 result
rows; omitted `results.json` is not invented).

**Latvia** is **approved with holds** (Prompt AG, Justin 2026-09-21
America/Edmonton; SHA-256
`227f743ab91c6d86f711be2fd5314e3e7c573da233b9a61187c8a3b37abb34f3`;
predecessor draft `7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce`).
Exact 166 office IDs: **45 current + 121 historical** (163 municipal /
0 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, and
LV-G09. Current scope is 42 municipal councils (7 state-city + 35 novadi),
Saeima, the indirect presidency, and the Latvia EP delegation (`other`).
Current direct-executive offices are 0. Rosters are PV2017=119, post-reform
observations 43, and PV2025=42. The 121 historical rows are identity
records, not abolished councils; no successor edges were added. Do not
invent 2021 cross-epoch merges, earlier history or repeat cycles,
presidential ballot vectors, a popular chair or executive director, EP
replacements, a choice among the seven 2022 percentage conflicts,
certification calls, date refinements, or omitted source bytes. Research
tables live at `data/research/latvia/`. Slim pack omitted
`Latvia_Identity_Vectors.json` and raw `sources/`; `results.json` is
normal JSON. Do not invent those bytes. The Atlas importer waits.

**Hungary** is **approved with holds** (Prompt AK, Justin 2026-09-22
America/Edmonton; SHA-256
`3be45f777e8c3c5bcbd02825a18f4cd327c2b31478753b6863de48799dcec9cd`;
predecessor draft `fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a`).
Exact 6,378 office IDs: **6,378 current + 0 historical** (6,355 municipal /
20 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE,
HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS,
HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS,
HU-CHAIRS-JARAS (documented exclusion), and HU-UPCOMING. Current scope is
3,177 municipal/district councils, 3,177 direct municipal/district mayors,
19 county assemblies, one Budapest capital assembly, one direct capital
mayor, Országgyűlés, the indirect presidency, and the Hungary EP
delegation (`other`). Direct mayors: 3,178. Councils/assemblies: 3,198.
No PM/cabinet, direct county chair, or járás council was added.
0 historical-only offices is not proof of zero abolished bodies; the
successor crosswalk stays empty. Budapest capital assembly stays drafted
regional and the capital mayor stays drafted municipal (HU-BUDAPEST).
EP stays drafted `other` (HU-EP). Bozsok council (`HU-NVI-18-012-C`),
Bozsok mayor (`HU-NVI-18-012-M`), and Pakod council (`HU-NVI-20-160-C`)
stay without 2024 numeric returns; no zero was invented. Do not invent
omitted `sources/` bytes, `results.json`, identity vectors, historical
offices, or hold resolutions. Research tables live at
`data/research/hungary/`. Slim pack omitted bulky sources, `results.json`,
and identity vectors. The Atlas importer waits.

**Romania** is **approved with holds** (Prompt AL, Justin 2026-09-22
America/Edmonton; SHA-256
`0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04`;
predecessor draft `eb64c80668c2f079f33bbfeee765aa63948143f4d273371caa3e35a52ee005ce`).
Exact 6,460 office IDs: **6,460 current + 0 historical** (6,372 municipal /
84 regional / 3 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07. Current scope
is 3,180 ordinary local UAT councils, 3,180 direct mayors, 41 județ
councils, 41 county presidents, six Bucharest sector councils, six sector
mayors, Bucharest General Council, the Bucharest general mayor, Camera
Deputaților, Senat, the popular presidency, and the Romania EP delegation
(`other`, `tier_uncertain`). Direct executives: 3,229. Councils/assemblies:
3,230. No prefect, prime minister, cabinet, or neighbourhood board was
added. County presidents are marked direct for current law; 2016 was
council investiture and has no popular-election event (RO-G03).
`RO-PRES-2024-R1` stays annulled with no successor edge to 2025 (RO-G02).
`RO-EP` stays drafted `other` with `direct_election=false` as supplied
(RO-G05). 23 result rows are national/EP only (`RO-SEN-2024`,
`RO-CD-2024`, `RO-EP-2024`, `RO-PRES-2025-R2`). Missing local vectors stay
absent (RO-G01). No successor or merger edge was added (RO-G06). Research
tables live at `data/research/romania/`. `events.json` is carried as
`events.json.gz` only. Do not invent local result vectors, historical-only
offices, or hold resolutions. The Atlas importer waits.
**Cyprus** is **approved with holds** (Prompt AQ, Justin 2026-09-22
`383512b2601296f78fa33da1376a387ebdb488bd80b426c0a94e2b22efb3eebb`;
predecessor draft `bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde`).
Exact 888 office IDs: **714 current + 174 historical** (877 municipal /
5 regional / 5 national / 1 other). Standing policy retains offices and
CY-G01, CY-G02, CY-G03, CY-G04, CY-G05, CY-G06, CY-G07, CY-G08, CY-G09,
CY-G10, CY-G11, CY-G12, CY-G13, CY-G14, and CY-G15. Current scope is 20
municipal councils, 20 mayors, 93 deputy mayors, 285 community councils,
285 community leaders, five DLGO presidents, the House, the President,
three religious-group representatives, and the Cyprus EP delegation
(`other`). Historical scope is 28 municipal councils, 28 mayors, 59
community councils, and 59 community leaders. Direct executives: 404.
The communities file stays at 285 against a ministry overview of 286.
The successor crosswalk stays empty. Spilia Agios Antonios and Spilia
Kourdali stay separate. Per-office `review_status` stays `needs_review`.
Do not invent the missing 286th free-area community, a TRNC office, a
2024 reform successor edge, a Spilia code join, a zero-filled missing
local return, omitted `sources/` bytes, or `results.json`. Research
tables live at `data/research/cyprus/`. Slim land omitted `sources/` and
`results.json`. The Atlas importer waits.

**Malta** is **approved with holds** (Prompt AP, Justin 2026-09-22
America/Edmonton; SHA-256
`49e0238e4c00ede6839a8c9d77fb11fe43646a8add8c906320da696cad1839c8`;
predecessor draft `5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18`).
Exact 215 office IDs: **213 current + 2 historical** (204 municipal /
8 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
presidential earlier resolutions and House division tallies, STV
paper-level transfers, post-election casual/co-option normalization,
the mayoral first-meeting audit, local creation and boundary history,
regional sole-nominee and successor gaps, Gozo Civic Council depth, EP
replacements and the sixth-seat transition, certified-versus-preliminary
labels, and the production-schema pin. Current scope is 68 local councils
(54 Malta / 14 Gozo), 68 mayors, 68 deputy mayors, six indirect regional
presidents, the House, the indirect President, and the Malta EP
delegation (`other`). Historical scope is the Gozo Civic Council and its
president. Standalone direct-executive offices: 0. Mayors and deputies
stay conditional first-preference or council election. The successor
crosswalk stays empty. Four 2021 regional sole nominees stay nominations.
Per-office `review_status` stays `needs_review`. Do not invent a popular
presidential or mayor ballot, an STV transfer paper, a missing House
division tally, a Gozo successor edge, omitted `sources/` bytes,
`results.json`, or `stv-counts.json`. Research tables live at
`data/research/malta/`. Slim land omitted `sources/`, `results.json`, and
`stv-counts.json`. The Atlas importer waits.

**Greece** is **approved with holds** (Prompt AM Rebuilt, Justin 2026-09-22
America/Edmonton; SHA-256
`97c2587226c8e7cb1bf50233e6ff23844eeda52437a6e852efb41266dd3c88b6`;
predecessor draft `57f425425b5bbb646df5dee39a04789e6aa4ed8501c7033867b2327f1aee6c59`).
Exact 703 office IDs: **693 current + 10 historical** (674 municipal /
26 regional / 2 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09,
and GR-G10, plus 14 local source holds. Current scope is 332 municipal
councils, 332 direct mayors, 13 regional councils, 13 direct governors,
Parliament, the indirect presidency (`GR-PRES`, `parliamentary_indirect`),
and the Greek EP delegation (`GR-EP`, drafted `other`). Current direct
executives: 345. Historical direct executives: 5. No PM, cabinet, or
prefect row was added. Five abolished municipalities stay historical
council/mayor pairs; the identity crosswalk asserts no successor edges
(GR-G04 stays `partially_resolved` as supplied and is not closed). Messini
2014 (`GR-M-9255-C`, `GR-M-9255-M`) stays a tied runoff with 17 of 33
seats allocated and no winner chosen. 2019 regional station snapshots
`2019::snom_n::1` through `2019::snom_n::13` stay open. 14,004 result rows
are 8,021 distinct observations; missing results stay gaps. Per-office
`review_status` stays `needs_review`. Do not invent omitted `sources/`
bytes, Kallikratis successor edges, or zero-filled results. Research
tables live at `data/research/greece/`. Slim land omits `sources/` (2,807
artifacts). The Atlas importer waits.

**France** is **approved with holds** (Prompt AR, Justin 2026-09-22
America/Edmonton; SHA-256
`727dd2d4152b46c65a77ec0fb73d606631dad2c567474fb61a12d7bd596a970a`;
predecessor draft `8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a`).
Exact 37,850 office IDs: **35,112 current + 2,738 historical**. Draft tiers
are unchanged: T1 4 / T2 45 / T3 96 / T4 37,705. Schema projection, without
splitting a draft bucket: national 4 (draft 1, including `FR-EP`) / regional
141 (draft 2 + draft 3; `draft_tier` still distinguishes them) / municipal
37,705 (draft 4, including 34 PLM sector councils) / other 0. Standing
policy retains offices and historic rows outside the ~18-month alert window.
Named holds stay open: G01, G02, G03, G04, G05, G06, G07, G08, G09, G10,
G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, and G21. Current scope is
34,952 municipal councils, 95 departmental councils, 14 regional councils,
3 single territorial assemblies, the Lyon metropolitan council, 34
arrondissement/sector councils, 5 overseas territorial assemblies, the New
Caledonia congress, 3 provincial assemblies, Assemblée nationale, Sénat, the
popular presidency, and the France EP delegation. Direct executives current:
1. Mayors and local executive presidents stay council-selected. Ordinary
EPCI stay excluded. The successor crosswalk stays empty (G05). `FR-EP` stays
draft tier 1; G20 stays open and EP was not reclassified to `other`. PLM
sector councils stay draft tier 4 (G14). Missing results, events, and
reporting units stay absent. Do not invent popular mayor contests, EPCI
popular contests, guessed commune-nouvelle edges, omitted `sources/` bytes,
or zero-filled results. Research tables live at `data/research/france/`.
Slim pack omitted `sources/`, `results.jsonl`, `events.jsonl`, and
`reporting-units.jsonl`. The Atlas importer waits.

**Luxembourg** is **approved with holds** (Prompt AO, Justin 2026-09-22
America/Edmonton; SHA-256
`e1d109b024c466677ef084838192bb2bad101c8ad12010b28f6d35879c736169`;
predecessor draft `9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad`).
Exact 130 office IDs: **102 current + 28 historical** (128 municipal /
0 regional / 1 national / 1 other). Standing policy retains offices and
historic rows outside the ~18-month alert window. Named holds stay open:
LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and
LU-G11. LU-G01 (Grand Duke) and LU-G02 (mayors) are resolved exclusions;
no popular contest was added. Current scope is 100 communal councils,
Chambre des Députés, and the Luxembourg EP delegation (`other`).
Direct executives: 0. Regional offices: 0. The merger crosswalk stays
at 28 explicit portal predecessor edges. The 1994 Grevenmacher EP LSAP
block stays missing; those votes were not invented. Per-office
`review_status` stays `needs_review`. Do not invent omitted `sources/`
bytes, `results.json`, guessed merger edges, or hold resolutions.
Research tables live at `data/research/luxembourg/`. Slim pack omitted
`sources/` and `results.json`. The Atlas importer waits.

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
Andorra, Alderney, Armenia, Austria, Bosnia and Herzegovina, Bulgaria, Belgium, Netherlands, Switzerland, Denmark, Sweden, Finland, Norway, Ireland, Poland, Czechia, Croatia, Portugal, Spain, Estonia, Latvia, Hungary, Romania, Greece, Luxembourg, France, Cyprus, and Malta files above are unchanged.

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
