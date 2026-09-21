# Continuity import — approved packs

Justin authorized full proceed on 2026-09-16. `npm run import:atlas` loads **Albania**, **Andorra**, **Alderney**, **Armenia**, **Austria**, **Belgium**, **Bosnia and Herzegovina**, **Bulgaria**, **Netherlands**, **Switzerland**, **Denmark**, **Sweden**, **Finland**, **Norway**, and **approved** LatAm/NZ packs into the Atlas SQLite master. It does **not** import the remaining residual-heavy draft packs, deploy to the VPS, or declare cutover.

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
| `all` (default) | Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bosnia and Herzegovina, Bulgaria, Netherlands, Switzerland, then approved LatAm, then New Zealand, then Denmark, then Sweden, then Finland, then Norway |
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

Mexico result rows that violate `percent_0_100` are **withheld** using the accepted override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (share NULL / share_status unknown / evidence_status disputed). Original values stay in `raw_json`. Denominators are not invented.

Status-only LatAm countries from `base.json.gz` (no offices) are imported as country rows. Office/event/result rows come only from approved shards.

## What is skipped

Draft residual-heavy packs are **not** imported:

antigua-and-barbuda, costa-rica, ecuador, guyana, haiti, peru, saint-kitts-and-nevis, trinidad-and-tobago.

Haiti keep-open residuals, Mexico’s 95 sibling shares, and live cutover remain out of scope.

## CI

`tests/atlas/continuity-import.test.ts` covers the approved-pack gate, Albania-only import, and Albania+NZ/Andorra/Alderney/Armenia/Belgium/Bosnia serial publication. Heavier serial cases are split so no Vitest file exceeds the 60s worker RPC timeout: `tests/atlas/continuity-import-heavy.test.ts` (Austria, Bulgaria), `tests/atlas/continuity-import-switzerland.test.ts` (Netherlands, Switzerland), `tests/atlas/denmark-import.test.ts` (Albania+Denmark), `tests/atlas/sweden-import.test.ts` (Albania+Sweden), `tests/atlas/finland-import.test.ts` (Albania+Finland), `tests/atlas/norway-import.test.ts` (Albania+Norway), `tests/atlas/cli-sweden.test.ts` (Sweden CLI smoke), `tests/atlas/cli-finland.test.ts` (Finland CLI smoke), and `tests/atlas/cli-norway.test.ts` (Norway CLI smoke).

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
- 10,227 approved LatAm offices (Batch A+B + El Salvador + Argentina)
- New Zealand 4 offices / 7 events / 36 historical results
- draft country offices absent
- 67 Mexico withhold rows and zero `share > 100` Mexico rows

The full import is a dedicated CI script rather than a Vitest case so the ~3 minute LatAm projection does not trip Vitest's worker RPC timeout.

The existing Albania CLI test uses `ATLAS_IMPORT_SCOPE=albania` so it stays a fast Albania-only proof. Andorra uses `ATLAS_IMPORT_SCOPE=andorra`. Alderney uses `ATLAS_IMPORT_SCOPE=alderney`. Armenia uses `ATLAS_IMPORT_SCOPE=armenia`. Austria uses `ATLAS_IMPORT_SCOPE=austria`. Belgium uses `ATLAS_IMPORT_SCOPE=belgium`. Bosnia uses `ATLAS_IMPORT_SCOPE=bosnia`. Bulgaria uses `ATLAS_IMPORT_SCOPE=bulgaria`. Netherlands uses `ATLAS_IMPORT_SCOPE=netherlands`. Switzerland uses `ATLAS_IMPORT_SCOPE=switzerland`. Denmark uses `ATLAS_IMPORT_SCOPE=denmark`. Sweden uses `ATLAS_IMPORT_SCOPE=sweden`. Finland uses `ATLAS_IMPORT_SCOPE=finland`. Norway uses `ATLAS_IMPORT_SCOPE=norway`:

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
```

Full `ATLAS_IMPORT_SCOPE=all` against a cold temp SQLite is on the order of several minutes (Austria 16k results + Belgium S2 + LatAm projection + ~146k result rows + Bulgaria unpack + Switzerland). Denmark (25k results), Sweden (41k results), Finland (37k results), and Norway (59k results) run last on `all` so LatAm does not copy those lineages into staging. Use `albania`, `andorra`, `alderney`, `armenia`, `austria`, `belgium`, `bosnia`, `bulgaria`, `denmark`, `finland`, `netherlands`, `norway`, `sweden`, `switzerland`, or `nz` when you only need those lineages.

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

## `/atlas` UI

The public MVP at `/atlas` reads the same SQLite file (`ATLAS_SQLITE_PATH`, else `data/master/atlas.sqlite` locally, `/var/lib/cdd/atlas.sqlite` in production). Missing or empty databases render an empty state. `/electiondatabase` is unchanged; it includes a soft link to `/atlas`. **No `/electiondatabase` redirects** ship with this floor.

Phase 2 floor surfaces (still not cutover):

| Surface | Behaviour |
| --- | --- |
| `/atlas` | Europe-first index of loaded countries/offices |
| `/atlas/explorer` | Search/filter offices (`q`, `country`, `tier`, `region`); filters and pagination persist in the URL |
| `/atlas/countries/:id` | Country index + regional calendar (populated for Belgium, Bosnia and Herzegovina, Netherlands, Switzerland, Denmark, Sweden, Finland, and Norway; honest empty states for Andorra / Alderney / Armenia / Bulgaria) |
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
