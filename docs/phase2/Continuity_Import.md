# Continuity import — approved packs

Justin authorized full proceed on 2026-09-16. `npm run import:atlas` loads **Albania**, **Andorra**, **Alderney**, **Armenia**, **Austria**, **Belgium**, **Bosnia and Herzegovina**, **Bulgaria**, **Netherlands**, **Switzerland**, **Denmark**, **Sweden**, **Finland**, **Norway**, **Ireland**, **Poland**, **Czechia**, **Croatia**, **Portugal**, **Spain**, **Estonia**, and **approved** LatAm/NZ packs into the Atlas SQLite master. **Latvia** (`ATLAS_IMPORT_SCOPE=latvia`) and **Lithuania** (`ATLAS_IMPORT_SCOPE=lithuania`) are scoped importers; the default `all` scope does not import them. It does **not** import the remaining residual-heavy draft packs, deploy to the VPS, or declare cutover.

## How to run

```bash
# Temporary paths (required in CI / laptops; never the VPS DB unless you mean it)
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite

npm run migrate:atlas   # optional; import applies migrations itself
npm run import:atlas    # default ATLAS_IMPORT_SCOPE=all
```

Scopes:

| `ATLAS_IMPORT_SCOPE` | What loads |
| --- | --- |
| `all` (default) | Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bosnia and Herzegovina, Bulgaria, Netherlands, Switzerland, then approved LatAm, then New Zealand, then Denmark, then Sweden, then Finland, then Norway, then Ireland, then Poland, then Czechia, then Croatia, then Portugal, then Spain, then Estonia. Does not load Latvia or Lithuania |
| `albania` | Frozen Albania package only |
| `andorra` | Frozen Andorra package only (7 municipal / 0 regional) |
| `alderney` | Frozen Alderney package only (2 other / 0 regional; conditional 2026 dates) |
| `armenia` | Frozen Armenia package only (71 municipal / 0 regional; 30 source-reported called 2026 dates) |
| `austria` | Frozen Austria package only (2,034 municipal / 4 regional; 0 prospective dates; St. Georgen 2015 hold retained) |
| `belgium` | Prompt S2 research pack only (1,179 current + 55 historical; 1,185 municipal / 15 regional / 2 national / 32 other) |
| `bosnia` | Frozen Bosnia and Herzegovina package only (13 regional / 0 municipal; 10 approved + 3 needs_review entity holds) |
| `bulgaria` | Frozen Bulgaria package only (**530** accepted municipal / 0 regional; 3,067 held district/village rows unpublished) |
| `denmark` | Prompt X research pack only (**106 current + 240 historical**; 324 municipal / 20 regional / 1 national / 1 other) |
| `sweden` | Prompt Y research pack only (**313 current + 7 historical**; 292 municipal / 25 regional / 1 national / 2 other) |
| `finland` | Prompt Z research pack only (**333 current + 170 historical**; 478 municipal / 22 regional / 2 national / 1 other) |
| `ireland` | Prompt AB research pack only (**36 current + 86 historical**; 118 municipal / 0 regional / 3 national / 1 other; nine named holds; Northern Ireland excluded) |
| `poland` | Prompt AC slim pack only (**5,310 current + 2 historical**; 4,960 municipal / 330 regional / 3 national / 19 other; powiat tier left open; 0 result rows) |
| `czechia` | Prompt V research pack only (**6,411 current + 13 historical**; 6,257 municipal / 14 regional / 3 national / 150 other; omitted `results.jsonl.gz` is not invented) |
| `croatia` | Prompt W research pack only (**1,234 current + 11 historical**; 1,187 municipal / 55 regional / 2 national / 1 other) |
| `portugal` | Prompt AD research pack only (**10,666 current + 8,168 historical**; 927 municipal / 2 regional / 2 national / 17,903 other; parish bodies stay other) |
| `spain` | Prompt AE slim pack only (**8,204 current + 4 historical**; 8,133 municipal / 68 regional / 2 national / 5 other; omitted results and sources are not invented) |
| `estonia` | Prompt AF slim pack only (**81 current + 200 historical**; 278 municipal / 0 regional / 2 national / 1 other; omitted results stay 0 rows) |
| `latvia` | Prompt AG pack only (**45 current + 121 historical**; 163 municipal / 0 regional / 2 national / 1 other; 1,383 result rows). Not part of `all` |
| `lithuania` | Prompt AH slim pack only (**123 current + 0 historical**; 120 municipal / 0 regional / 2 national / 1 other; draft tiers stay `needs_review`; 130 result rows). Not part of `all` |
| `netherlands` | Prompt T research pack only (432 current + 69 historical; 414 municipal / 12 regional / 3 national / 72 other) |
| `norway` | Prompt AA research pack only (**389 current + 537 historical**; 876 municipal / 32 regional / 1 national / 17 other; named holds retained) |
| `switzerland` | Prompt U research pack only (**2,805 current + 11 historical**; 2,402 municipal / 52 regional / 2 national / 360 other; 308 commune executives held) |
| `latam` | Approved Latin America packs + Mexico withhold-all-67 override |
| `nz` | Approved New Zealand package |

Each lineage is a **serial** attempt/swap. Unrelated lineages already in the published DB are preserved. The durable attempt ledger stays on `ATLAS_ATTEMPTS_SQLITE_PATH`.

Production VPS path remains `/var/lib/cdd/atlas.sqlite` (or `ATLAS_SQLITE_PATH`). This importer does not SSH or copy files to the VPS.

## What is loaded (Batch A + Batch B + El Salvador + Argentina)

Approved continuity countries (14 packs):

- LatAm: argentina, bahamas, belize, brazil, colombia, cuba, dominica, dominican-republic, el-salvador, guatemala, jamaica, mexico, paraguay
- NZ: new-zealand
- Albania remains the Phase 1 storage-proof lineage (`country-package-albania`)
- Andorra is Europe #2 (`country-package-andorra`): 7 municipal communal councils, 0 regional. Run with `ATLAS_IMPORT_SCOPE=andorra`.
- Alderney is Europe #3 (`country-package-alderney`; 2 other / 0 regional). Run with `ATLAS_IMPORT_SCOPE=alderney`.
- Armenia is Europe #4 (`country-package-armenia`; 71 municipal / 0 regional). Five nested boundary/calendar research reviews stay open; no invented mayor IDs, mergers, or postponements. Run with `ATLAS_IMPORT_SCOPE=armenia`.
- Austria is Europe #5 (`country-package-austria`; 2,034 municipal / 4 regional). St. Georgen `AT-OOE-41119-M::2015::` remains an open stage-binding hold. No invented Europe regional layers beyond the four approved IDs. Run with `ATLAS_IMPORT_SCOPE=austria`. VPS note: [Austria_Import.md](../phase1/austria/Austria_Import.md).
- Belgium is Prompt S2 (`country-package-belgium`; **1,179 current + 55 historical**). 1,185 municipal / 15 regional / 2 national / 32 other. Remaining-universe, Bilzen, Saint-Josse, and 35 unbound IBZ 2000 notes stay open. Do not invent municipal or indirect rows beyond the accepted pack. Run with `ATLAS_IMPORT_SCOPE=belgium`.
- Bosnia and Herzegovina is Europe #6 (`country-package-bosnia-and-herzegovina`; **13 regional / 0 municipal**). 10 cantonal assemblies are `approved`; entity offices `BA-F` / `BA-R` / `BA-G` stay `needs_review`. Research holds remain open (RS presidential replacement/repeat, coalitions, 2026-10-04 calendar certainty). Do not invent Brčko or municipal offices. Run with `ATLAS_IMPORT_SCOPE=bosnia`.
- Bulgaria is Prompt P (`country-package-bulgaria`; **530** accepted municipal / **0** regional). 3,067 district/village rows stay held. Градец / qualification-change research remains retained input. Run with `ATLAS_IMPORT_SCOPE=bulgaria`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Bulgaria_Import.md](../phase1/bulgaria/Bulgaria_Import.md).
- Netherlands is Prompt T (`country-package-netherlands`; **432 current + 69 historical**). 414 municipal / 12 regional / 3 national / 72 other. Hilversum/Wijdemeren merger binding, named historic gaps, and ~147 focused-tier reviews stay open. Appointed mayors have no election rows. Run with `ATLAS_IMPORT_SCOPE=netherlands`. See [Netherlands_Import.md](../phase1/netherlands/Netherlands_Import.md).
- Switzerland is Prompt U (`country-package-switzerland`; **2,805 current + 11 historical**). 2,402 municipal / 52 regional / 2 national / 360 other. 308 commune-executive gaps, thin historic/merger archive, 1,938 parliament caveats, and 16 disputed rows stay open. Do not invent held commune executives. Run with `ATLAS_IMPORT_SCOPE=switzerland`. See [Switzerland_Import.md](../phase1/switzerland/Switzerland_Import.md).
- Denmark is Prompt X (`country-package-denmark`; **106 current + 240 historical**). 324 municipal / 20 regional / 1 national / 1 other. Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, and EP-detail notes stay open. No popular mayor rows. Run with `ATLAS_IMPORT_SCOPE=denmark`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Denmark_Import.md](../phase1/denmark/Denmark_Import.md).
- Sweden is Prompt Y (`country-package-sweden`; **313 current + 7 historical**). 292 municipal / 25 regional / 1 national / 2 other. Named holds stay open (Gotland municipal, EP+Sameting other, 2026 preliminary locals, historic boundary/party/repeat notes, Färgelanda 1973). No popular kommunalråd / prime-minister / cabinet rows. Run with `ATLAS_IMPORT_SCOPE=sweden`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Sweden_Import.md](../phase1/sweden/Sweden_Import.md).
- Finland is Prompt Z (`country-package-finland`; **333 current + 170 historical**). 478 municipal / 22 regional / 2 national / 1 other. Named holds stay open (historic mergers, early Åland dates, wellbeing transition, EP detail, cycle legal detail, party categories, missing results). No popular appointed-manager / prime-minister / cabinet rows. Run with `ATLAS_IMPORT_SCOPE=finland`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Finland_Import.md](../phase1/finland/Finland_Import.md).
- Norway is Prompt AA (`country-package-norway`; **389 current + 537 historical**). 876 municipal / 32 regional / 1 national / 17 other. Named holds stay open: SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES. Oslo bystyre stays the municipal `NO-M0301-C` office; no separate Oslo fylkesting. No popular mayor / prime-minister / cabinet or EP rows. Run with `ATLAS_IMPORT_SCOPE=norway`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Norway_Import.md](../phase1/norway/Norway_Import.md).
- Ireland is Prompt AB (`country-package-ireland`; **36 current + 86 historical**). 118 municipal / 0 regional / 3 national / 1 other. Nine named holds stay open. Northern Ireland is excluded. No guessed merger successors, EP result vectors, later presidential returns, Taoiseach nominee rows, or council-selected mayor contests. Run with `ATLAS_IMPORT_SCOPE=ireland`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Ireland_Import.md](../phase1/ireland/Ireland_Import.md).
- Poland is Prompt AC (`country-package-poland`; **5,310 current + 2 historical**). 4,960 municipal / 330 regional / 3 national / 19 other. The 330 regional rows are 16 voivodeship sejmiks + 314 powiat councils; PL-POWIAT-TIER stays open and powiat rows are not reclassified. Historic Ostrowice stays unbound. No appointed voivode or PM/cabinet rows. Slim land omits result bytes; none are invented. Run with `ATLAS_IMPORT_SCOPE=poland`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Poland_Import.md](../phase1/poland/Poland_Import.md).
- Czechia is Prompt V (`country-package-czechia`; **6,411 current + 13 historical**). 6,257 municipal / 14 regional / 3 national / 150 other. Named holds stay open (municipal recalculated percent, historical code binding, Prague dual-status, military–civilian transition, current roster validity, executive mode, historic depth, legal-outcome repeat audit, EP party scope, dates and next cycles). President is the only direct executive. Prague stays one body. Slim land omits `results.jsonl.gz`; result rows are not invented. Run with `ATLAS_IMPORT_SCOPE=czechia`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Czechia_Import.md](../phase1/czechia/Czechia_Import.md).
- Croatia is Prompt W (`country-package-croatia`; **1,234 current + 11 historical**). 1,187 municipal / 55 regional / 2 national / 1 other. Named holds stay open (current roster validity, Zagreb dual, deputy eligibility, territorial reforms, special/supplementary returns, missing Biskupija 2017, Tar-Vabriga placeholder, seats/legal finality, Sabor minority basis, party identity, EP detail, dates/next cycles, excluded auxiliary). Zagreb stays one dual city/county pair. No invented successors, seat allocations, or zero-filled missing returns. Run with `ATLAS_IMPORT_SCOPE=croatia`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Croatia_Import.md](../phase1/croatia/Croatia_Import.md).
- Portugal is Prompt AD (`country-package-portugal`; **10,666 current + 8,168 historical**). 927 municipal / 2 regional / 2 national / 17,903 other. Historical rows are unresolved aliases, not proved abolitions. Parish assemblies, juntas, and parish presidents stay other while PARISH-TIER is open. All 17 named holds stay open. No second mayoral ballot, plenary assembly, or popular regional-government president. Run with `ATLAS_IMPORT_SCOPE=portugal`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Portugal README](../phase1/portugal/README.md).
- Spain is Prompt AE (`country-package-spain`; **8,204 current + 4 historical**). 8,133 municipal / 68 regional / 2 national / 5 other. The 68 regional rows are 17 autonomous-community parliaments + 38 ordinary provincial councils + 3 Basque foral assemblies + 10 additional island councils. Ceuta, Melilla, Formentera, and Aran stay other. 78 concejo-abierto direct executives stay on the same municipal mandate. Diputaciones have no inferred constitution events. Slim land omits results and sources; those rows are not invented. Holds ES-G01–ES-G12 stay open. Run with `ATLAS_IMPORT_SCOPE=spain`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Spain_Import.md](../phase1/spain/Spain_Import.md).
- Estonia is Prompt AF (`country-package-estonia`; **81 current + 200 historical**). 278 municipal / 0 regional / 2 national / 1 other. Holds EE-G01–EE-G09 stay open. Slim land omits results; imported result rows stay 0. Run with `ATLAS_IMPORT_SCOPE=estonia`. `all` also publishes Estonia. See [Estonia README](../phase1/estonia/README.md).
- Latvia is Prompt AG (`country-package-latvia`; **45 current + 121 historical**). 163 municipal / 0 regional / 2 national / 1 other. Holds LV-G01–LV-G09 stay open. Historical 121 rows are identity records, not abolished councils. Run with `ATLAS_IMPORT_SCOPE=latvia` only. `all` does not import Latvia. See [Latvia_Import.md](../phase1/latvia/Latvia_Import.md).
- Lithuania is Prompt AH (`country-package-lithuania`; **123 current + 0 historical**). 120 municipal / 0 regional / 2 national / 1 other. Draft tiers stay `needs_review`. Holds LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, LT-PARTY-PRECISION, LT-NEXT-AND-LEGAL, and LT-EXCLUSIONS stay open. Run with `ATLAS_IMPORT_SCOPE=lithuania` only. `all` does not import Lithuania. See [Lithuania_Import.md](../phase1/lithuania/Lithuania_Import.md).

Mexico result rows that violate `percent_0_100` are **withheld** using the accepted override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (share NULL / share_status unknown / evidence_status disputed). Original values stay in `raw_json`. Denominators are not invented.

Status-only LatAm countries from `base.json.gz` (no offices) are imported as country rows. Office/event/result rows come only from approved shards.

## What is skipped

Draft residual-heavy packs are **not** imported:

antigua-and-barbuda, costa-rica, ecuador, guyana, haiti, peru, saint-kitts-and-nevis, trinidad-and-tobago.

Haiti keep-open residuals, Mexico’s 95 sibling shares, and live cutover remain out of scope.

## CI

`tests/atlas/continuity-import.test.ts` covers the approved-pack gate, Albania-only import, and Albania+NZ/Andorra/Alderney/Armenia/Belgium/Bosnia serial publication. Heavier serial cases are split so no Vitest file exceeds the 60s worker RPC timeout: `tests/atlas/continuity-import-heavy.test.ts` (Austria, Bulgaria), `tests/atlas/continuity-import-switzerland.test.ts` (Netherlands, Switzerland), `tests/atlas/denmark-import.test.ts` (Albania+Denmark), `tests/atlas/sweden-import.test.ts` (Albania+Sweden), `tests/atlas/finland-import.test.ts` (Albania+Finland), `tests/atlas/norway-import.test.ts` (Albania+Norway), `tests/atlas/ireland-import.test.ts` (Albania+Ireland), `tests/atlas/poland-import.test.ts` (Albania+Poland), `tests/atlas/cli-sweden.test.ts` (Sweden CLI smoke), `tests/atlas/cli-finland.test.ts` (Finland CLI smoke), `tests/atlas/cli-norway.test.ts` (Norway CLI smoke), `tests/atlas/cli-ireland.test.ts` (Ireland CLI smoke), and `tests/atlas/cli-poland.test.ts` (Poland CLI smoke), `tests/atlas/czechia-import.test.ts` (Albania+Czechia), `tests/atlas/cli-czechia.test.ts` (Czechia CLI smoke), `tests/atlas/croatia-import.test.ts` (Albania+Croatia), `tests/atlas/cli-croatia.test.ts` (Croatia CLI smoke), `tests/atlas/portugal-import.test.ts` (Portugal importer), `tests/atlas/cli-portugal.test.ts` (Portugal CLI smoke), `tests/atlas/spain-import.test.ts` (Spain importer), and `tests/atlas/cli-spain.test.ts` (Spain CLI smoke). Denmark's CLI smoke is `tests/atlas/cli-denmark.test.ts`, kept out of `tests/atlas/cli.test.ts` so that file stays under the Vitest worker RPC timeout.

`npm run test:atlas-import` (wired in GitHub CI after `npm test`) builds a temp SQLite and asserts the full approved set:

- Albania 122 offices / 0 regional
- Andorra 7 municipal offices / 0 regional / 21 events / 53 results
- Alderney 2 other offices / 0 regional / 2 conditional dates
- Armenia 71 municipal offices / 0 regional / 33 selected histories / 30 called next dates
- Austria 2,038 offices / 2,034 municipal / 4 regional / 5,956 selected histories / 0 prospective events
- Belgium 1,234 offices (1,179 current + 55 historical) / 1,185 municipal / 15 regional / 2 national / 32 other / 1,772 events / 9,238 results / 0 prospective
- Bosnia and Herzegovina 13 regional offices / 0 municipal / 39 selected histories / 13 expected 2026-10-04 dates / 10 approved + 3 needs_review
- Bulgaria 530 approved municipal offices / 0 regional / 1,590 selected histories / 10,343 results; 3,067 held district/village offices unpublished
- Netherlands 501 offices (432 current + 69 historical) / 414 municipal / 12 regional / 3 national / 72 other / 1,475 events / 13,050 results / 0 prospective / 147 needs_review
- Switzerland 2,816 offices (2,805 current + 11 historical) / 2,402 municipal / 52 regional / 2 national / 360 other / 1,443 events / 8,094 results / 136 proceedings / 0 prospective; 308 commune executives held
- Denmark 346 offices (106 current + 240 historical) / 324 municipal / 20 regional / 1 national / 1 other / 1,849 events / 25,391 results / 0 mayors
- Sweden 320 offices (313 current + 7 historical) / 292 municipal / 25 regional / 1 national / 2 other / 4,951 events / 40,991 results / 310 preliminary 2026 local vectors / 7 named holds
- Finland 503 offices (333 current + 170 historical) / 478 municipal / 22 regional / 2 national / 1 other / 5,241 events / 37,471 results / 11 presidential proceedings / 7 named holds
- Norway 926 offices (389 current + 537 historical) / 876 municipal / 32 regional / 1 national / 17 other / 10,777 events / 59,033 results / 9 named holds / 0 mayors / 0 EP / 0 Oslo fylkesting
- Ireland 122 offices (36 current + 86 historical) / 118 municipal / 0 regional / 3 national / 1 other / 196 events / 7,254 results / 9 named holds / 0 Northern Ireland offices
- Poland 5,312 offices (5,310 current + 2 historical) / 4,960 municipal / 330 regional (16 sejmiks + 314 powiat, not reclassified) / 3 national / 19 other / 16,767 events / 0 result rows / 56 prospective index entries
- Czechia 6,424 offices (6,411 current + 13 historical) / 6,257 municipal / 14 regional / 3 national / 150 other / 46,236 events / 0 invented result rows / 934 proceedings / 10 named holds
- Croatia 1,245 offices (1,234 current + 11 historical) / 1,187 municipal / 55 regional / 2 national / 1 other / 3,834 events / 15,907 results / 2,418 proceedings / 13 named holds
- Portugal 18,834 offices (10,666 current + 8,168 historical) / 927 municipal / 2 regional / 2 national / 17,903 other / 19,820 events / 66,283 results / 2 proceedings / 17 named holds / 0 list-head events
- Spain 8,208 offices (8,204 current + 4 historical) / 8,133 municipal / 68 regional / 2 national / 5 other / 20,401 events / 0 result rows / 0 proceedings / 12 named holds / 0 diputación events
- Estonia 281 offices (81 current + 200 historical) / 278 municipal / 0 regional / 2 national / 1 other / 0 result rows / 24 proceedings
- Latvia is scoped (`ATLAS_IMPORT_SCOPE=latvia`) and is not part of the `all` proof
- Lithuania is scoped (`ATLAS_IMPORT_SCOPE=lithuania`) and is proved after the `all` import: 123 offices / 120 municipal / 0 regional / 2 national / 1 other / 130 result rows / 25 proceedings
- 10,227 approved LatAm offices (Batch A+B + El Salvador + Argentina)
- New Zealand 4 offices / 7 events / 36 historical results
- draft country offices absent
- 67 Mexico withhold rows and zero `share > 100` Mexico rows

The full import is a dedicated CI script rather than a Vitest case so the ~3 minute LatAm projection does not trip Vitest's worker RPC timeout.

The existing Albania CLI test uses `ATLAS_IMPORT_SCOPE=albania` so it stays a fast Albania-only proof. Andorra uses `ATLAS_IMPORT_SCOPE=andorra`. Alderney uses `ATLAS_IMPORT_SCOPE=alderney`. Armenia uses `ATLAS_IMPORT_SCOPE=armenia`. Austria uses `ATLAS_IMPORT_SCOPE=austria`. Belgium uses `ATLAS_IMPORT_SCOPE=belgium`. Bosnia uses `ATLAS_IMPORT_SCOPE=bosnia`. Bulgaria uses `ATLAS_IMPORT_SCOPE=bulgaria`. Netherlands uses `ATLAS_IMPORT_SCOPE=netherlands`. Switzerland uses `ATLAS_IMPORT_SCOPE=switzerland`. Denmark uses `ATLAS_IMPORT_SCOPE=denmark` in `tests/atlas/cli-denmark.test.ts`. Sweden uses `ATLAS_IMPORT_SCOPE=sweden`. Finland uses `ATLAS_IMPORT_SCOPE=finland`. Norway uses `ATLAS_IMPORT_SCOPE=norway`. Ireland uses `ATLAS_IMPORT_SCOPE=ireland`. Poland uses `ATLAS_IMPORT_SCOPE=poland` in `tests/atlas/cli-poland.test.ts`. Czechia uses `ATLAS_IMPORT_SCOPE=czechia` in `tests/atlas/cli-czechia.test.ts`. Croatia uses `ATLAS_IMPORT_SCOPE=croatia` in `tests/atlas/cli-croatia.test.ts`. Portugal uses `ATLAS_IMPORT_SCOPE=portugal` in `tests/atlas/cli-portugal.test.ts`. Spain uses `ATLAS_IMPORT_SCOPE=spain` in `tests/atlas/cli-spain.test.ts`. Estonia uses `ATLAS_IMPORT_SCOPE=estonia` in `tests/atlas/cli-estonia.test.ts`. Latvia uses `ATLAS_IMPORT_SCOPE=latvia` in `tests/atlas/cli-latvia.test.ts`. Lithuania uses `ATLAS_IMPORT_SCOPE=lithuania` in `tests/atlas/cli-lithuania.test.ts`:

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=armenia npm run import:atlas
ATLAS_IMPORT_SCOPE=austria npm run import:atlas
ATLAS_IMPORT_SCOPE=belgium npm run import:atlas
ATLAS_IMPORT_SCOPE=bosnia npm run import:atlas
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
ATLAS_IMPORT_SCOPE=netherlands npm run import:atlas
ATLAS_IMPORT_SCOPE=switzerland npm run import:atlas
ATLAS_IMPORT_SCOPE=denmark npm run import:atlas
ATLAS_IMPORT_SCOPE=sweden npm run import:atlas
ATLAS_IMPORT_SCOPE=finland npm run import:atlas
ATLAS_IMPORT_SCOPE=norway npm run import:atlas
ATLAS_IMPORT_SCOPE=ireland npm run import:atlas
ATLAS_IMPORT_SCOPE=poland npm run import:atlas
ATLAS_IMPORT_SCOPE=czechia npm run import:atlas
ATLAS_IMPORT_SCOPE=croatia npm run import:atlas
ATLAS_IMPORT_SCOPE=portugal npm run import:atlas
ATLAS_IMPORT_SCOPE=spain npm run import:atlas
ATLAS_IMPORT_SCOPE=estonia npm run import:atlas
ATLAS_IMPORT_SCOPE=latvia npm run import:atlas
ATLAS_IMPORT_SCOPE=lithuania npm run import:atlas
```

Full `ATLAS_IMPORT_SCOPE=all` against a cold temp SQLite is on the order of several minutes (Austria 16k results + Belgium S2 + LatAm projection + ~146k result rows + Bulgaria unpack + Switzerland). Denmark (25k results), Sweden (41k results), Finland (37k results), Norway (59k results), Ireland (7k results), Poland (16k events, 0 invented result rows), Czechia (46k events, 0 invented result rows), Croatia (16k results), Portugal (66k results), and Spain (20k events, 0 invented result or source rows) run last on `all`, then Estonia, so LatAm does not copy those lineages into staging. Latvia and Lithuania are not part of `all`. Use `albania`, `andorra`, `alderney`, `armenia`, `austria`, `belgium`, `bosnia`, `bulgaria`, `croatia`, `czechia`, `denmark`, `estonia`, `finland`, `ireland`, `latvia`, `lithuania`, `netherlands`, `norway`, `poland`, `portugal`, `spain`, `sweden`, `switzerland`, or `nz` when you only need those lineages.

## VPS — Bosnia scoped import only

To add Bosnia and Herzegovina to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the 13 regional Bosnia offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=bosnia npm run import:atlas
```

Expected stdout includes `bosnia_offices=13`, `bosnia_regional=13`, `bosnia_municipal=0`, `bosnia_selected_histories=39`, `bosnia_prospective_events=13`, `bosnia_result_rows=749`, `bosnia_sources=30`, `bosnia_approved=10`, `bosnia_needs_review=3`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects.

Mexico withhold-all-67 remains untouched. Cutover remains out of scope. This PR does not add a VPS deploy.

## VPS — Belgium scoped import only

To add Belgium to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted S2 offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=belgium npm run import:atlas
```

Expected stdout includes `belgium_offices=1234`, `belgium_current=1179`, `belgium_historical=55`, `belgium_municipal=1185`, `belgium_regional=15`, `belgium_national=2`, `belgium_result_rows=9238`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Belgium_Import.md](../phase1/belgium-s2/Belgium_Import.md).

## VPS — Netherlands scoped import only

To add the Netherlands to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt T offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=netherlands npm run import:atlas
```

Expected stdout includes `netherlands_offices=501`, `netherlands_current=432`, `netherlands_historical=69`, `netherlands_municipal=414`, `netherlands_regional=12`, `netherlands_national=3`, `netherlands_result_rows=13050`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Netherlands_Import.md](../phase1/netherlands/Netherlands_Import.md).

## VPS — Switzerland scoped import only

To add Switzerland to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt U offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=switzerland npm run import:atlas
```

Expected stdout includes `switzerland_offices=2816`, `switzerland_current=2805`, `switzerland_historical=11`, `switzerland_municipal=2402`, `switzerland_regional=52`, `switzerland_national=2`, `switzerland_result_rows=8094`, `switzerland_held_commune_executives=308`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Switzerland_Import.md](../phase1/switzerland/Switzerland_Import.md).

## VPS — Denmark scoped import only

To add Denmark to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt X offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=denmark npm run import:atlas
```

Expected stdout includes `denmark_offices=346`, `denmark_current=106`, `denmark_historical=240`, `denmark_municipal=324`, `denmark_regional=20`, `denmark_national=1`, `denmark_other=1`, `denmark_selected_histories=1849`, `denmark_prospective_events=0`, `denmark_result_rows=25391`, `denmark_sources=49`, `denmark_unresolved=105`, `denmark_approved=53`, `denmark_needs_review=293`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Denmark_Import.md](../phase1/denmark/Denmark_Import.md).

Greenland/Faroe Realm coverage, 2007/earlier merger successor bindings, KMD/DST holes, 98 candidate bindings, and EP detail notes stay open. No popular mayor rows. Mexico withhold-all-67 remains untouched.

## VPS — Sweden scoped import only

To add Sweden to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt Y offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=sweden npm run import:atlas
```

Expected stdout includes `sweden_offices=320`, `sweden_current=313`, `sweden_historical=7`, `sweden_municipal=292`, `sweden_regional=25`, `sweden_national=1`, `sweden_other=2`, `sweden_selected_histories=4639`, `sweden_prospective_events=310`, `sweden_result_rows=40991`, `sweden_sources=356`, `sweden_unresolved=7`, `sweden_approved=310`, `sweden_needs_review=10`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Sweden_Import.md](../phase1/sweden/Sweden_Import.md).

Named holds stay open. No popular kommunalråd / prime-minister / cabinet rows. Mexico withhold-all-67 remains untouched.

## VPS — Finland scoped import only

To add Finland to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt Z offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=finland npm run import:atlas
```

Expected stdout includes `finland_offices=503`, `finland_current=333`, `finland_historical=170`, `finland_municipal=478`, `finland_regional=22`, `finland_national=2`, `finland_other=1`, `finland_selected_histories=5241`, `finland_prospective_events=0`, `finland_result_rows=37471`, `finland_proceedings=11`, `finland_sources=67`, `finland_unresolved=7`, `finland_approved=332`, `finland_needs_review=171`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Finland_Import.md](../phase1/finland/Finland_Import.md).

Named holds stay open (historic mergers, early Åland dates, wellbeing transition, EP detail, cycle legal detail, party categories, missing results). No popular appointed-manager / prime-minister / cabinet rows. Mexico withhold-all-67 remains untouched.

## VPS — Norway scoped import only

To add Norway to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt AA offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=norway npm run import:atlas
```

Expected stdout includes `norway_offices=926`, `norway_current=389`, `norway_historical=537`, `norway_municipal=876`, `norway_regional=32`, `norway_national=1`, `norway_other=17`, `norway_selected_histories=10777`, `norway_prospective_events=0`, `norway_result_rows=59033`, `norway_sources=82`, `norway_unresolved=9`, `norway_approved=371`, `norway_needs_review=555`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Norway_Import.md](../phase1/norway/Norway_Import.md).

Named holds stay open. Oslo bystyre stays municipal; no `NO-F03-C` office. No popular mayor / prime-minister / cabinet or EP rows. Mexico withhold-all-67 remains untouched.

## VPS — Ireland scoped import only

To add Ireland to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt AB offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=ireland npm run import:atlas
```

Expected stdout includes `ireland_offices=122`, `ireland_current=36`, `ireland_historical=86`, `ireland_municipal=118`, `ireland_regional=0`, `ireland_national=3`, `ireland_other=1`, `ireland_selected_histories=196`, `ireland_prospective_events=0`, `ireland_result_rows=7254`, `ireland_sources=52`, `ireland_unresolved=9`, `ireland_approved=34`, `ireland_needs_review=88`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Ireland_Import.md](../phase1/ireland/Ireland_Import.md).

Named holds IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, and IE-REGIONAL-APPOINTMENTS stay open. Northern Ireland stays excluded.

## VPS — Czechia scoped import only

To add Czechia to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt V offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=czechia npm run import:atlas
```

Expected stdout includes `czechia_offices=6424`, `czechia_current=6411`, `czechia_historical=13`, `czechia_municipal=6257`, `czechia_regional=14`, `czechia_national=3`, `czechia_other=150`, `czechia_result_rows=0`, `czechia_proceedings=934`, `czechia_unresolved=10`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Czechia_Import.md](../phase1/czechia/Czechia_Import.md).

Named holds stay open. Prague stays one body. Omitted `results.jsonl.gz` rows are not invented. Mexico withhold-all-67 remains untouched.

## VPS — Croatia scoped import only

To add Croatia to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt W offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=croatia npm run import:atlas
```

Expected stdout includes `croatia_offices=1245`, `croatia_current=1234`, `croatia_historical=11`, `croatia_municipal=1187`, `croatia_regional=55`, `croatia_national=2`, `croatia_other=1`, `croatia_result_rows=15907`, `croatia_proceedings=2418`, `croatia_unresolved=13`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Croatia_Import.md](../phase1/croatia/Croatia_Import.md).

Named holds stay open. Zagreb stays one dual city/county pair. Mexico withhold-all-67 remains untouched.

## VPS — Portugal scoped import only

To add Portugal to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt AD offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=portugal npm run import:atlas
```

Expected stdout includes `portugal_offices=18834`, `portugal_current=10666`, `portugal_historical=8168`, `portugal_municipal=927`, `portugal_regional=2`, `portugal_national=2`, `portugal_other=17903`, `portugal_result_rows=66283`, `portugal_proceedings=2`, `portugal_unresolved=347`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Portugal README](../phase1/portugal/README.md).

Named holds stay open, including PARISH-TIER. Parish bodies stay tier `other`. Historical rows stay unresolved aliases. Mexico withhold-all-67 remains untouched.

## VPS — Spain scoped import only

To add Spain to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the accepted Prompt AE offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=spain npm run import:atlas
```

Expected stdout includes `spain_offices=8208`, `spain_current=8204`, `spain_historical=4`, `spain_municipal=8133`, `spain_regional=68`, `spain_national=2`, `spain_other=5`, `spain_result_rows=0`, `spain_proceedings=0`, `spain_sources=0`, `spain_unresolved=12`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects. See [Spain_Import.md](../phase1/spain/Spain_Import.md).

Holds ES-G01–ES-G12 stay open. Omitted result and source bytes stay unpublished. Mexico withhold-all-67 remains untouched.

## `/atlas` UI

The public MVP at `/atlas` reads the same SQLite file (`ATLAS_SQLITE_PATH`, else `data/master/atlas.sqlite` locally, `/var/lib/cdd/atlas.sqlite` in production). Missing or empty databases render an empty state. `/electiondatabase` is unchanged; it includes a soft link to `/atlas`. **No `/electiondatabase` redirects** ship with this floor.

Phase 2 floor surfaces (still not cutover):

| Surface | Behaviour |
| --- | --- |
| `/atlas` | Europe-first index of loaded countries/offices |
| `/atlas/explorer` | Search/filter offices (`q`, `country`, `tier`, `region`); filters and pagination persist in the URL |
| `/atlas/countries/:id` | Country index + regional calendar (populated for Belgium, Bosnia and Herzegovina, Netherlands, Switzerland, Denmark, Sweden, Finland, Norway, Ireland, Poland, Czechia, Croatia, Portugal, and Spain; honest empty states for Andorra / Alderney / Armenia / Bulgaria) |
| `/atlas/offices/:id` | Soft compatibility: observatory public office IDs resolve when present as `office.office_id` |
| `/atlas/elections/:id` | Soft compatibility: observatory public event IDs resolve when present as `election_event.event_id` |

Prompt B uniqueness is `(id_namespace, office_id)` and `(id_namespace, event_id)`, not a global public ID. A bare observatory ID that matches more than one namespace is **not** silently resolved.

**Original briefing parity is schema-blocked.** `retained_input` stores path + SHA-256, not HTML. There is no briefing-body table, so `/atlas/offices/:id/original` is not served from SQLite. Do not mix gzip/package HTML with Atlas SQLite reads for the same records. Observatory original briefings stay at `/electiondatabase/offices/:id/original`.

`npm run dev` / `build` / `start` pass `--experimental-sqlite` so Next can read `node:sqlite`.

### Verify a local SQLite-backed `/atlas` explorer

Loaded database:

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
npm run import:atlas          # or ATLAS_IMPORT_SCOPE=nz for a fast smoke
npm run dev                   # Next reads ATLAS_SQLITE_PATH
```

Open `/atlas`, `/atlas/explorer`, `/atlas/offices/NZ-BULLER-WESTPORT-2026`, and `/atlas/elections/next-154f7bfa6ea99d09c5a47d7c`. `/electiondatabase` must still render.

Missing database (explorer EmptyState):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-missing.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
npm run dev
```

`/atlas/explorer` should show EmptyState with the resolved `ATLAS_SQLITE_PATH`. Do not point these env vars at `/var/lib/cdd/atlas.sqlite` unless you mean to read production.
