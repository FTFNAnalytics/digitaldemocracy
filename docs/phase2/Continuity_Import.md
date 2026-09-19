# Continuity import — approved packs

Justin authorized full proceed on 2026-09-16. `npm run import:atlas` loads **Albania**, **Andorra**, **Alderney**, **Armenia**, **Belgium**, **Bosnia and Herzegovina**, **Bulgaria**, **Netherlands**, and **approved** LatAm/NZ packs into the Atlas SQLite master. It does **not** import the remaining residual-heavy draft packs, deploy to the VPS, or declare cutover.

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
| `all` (default) | Albania, Andorra, Alderney, Armenia, Belgium, Bosnia and Herzegovina, Bulgaria, Netherlands, then approved LatAm, then New Zealand |
| `albania` | Frozen Albania package only |
| `andorra` | Frozen Andorra package only (7 municipal / 0 regional) |
| `alderney` | Frozen Alderney package only (2 other / 0 regional; conditional 2026 dates) |
| `armenia` | Frozen Armenia package only (71 municipal / 0 regional; 30 source-reported called 2026 dates) |
| `belgium` | Prompt S2 research pack only (1,179 current + 55 historical; 1,185 municipal / 15 regional / 2 national / 32 other) |
| `bosnia` | Frozen Bosnia and Herzegovina package only (13 regional / 0 municipal; 10 approved + 3 needs_review entity holds) |
| `bulgaria` | Frozen Bulgaria package only (**530** accepted municipal / 0 regional; 3,067 held district/village rows unpublished) |
| `netherlands` | Prompt T research pack only (432 current + 69 historical; 414 municipal / 12 regional / 3 national / 72 other) |
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
- Belgium is Prompt S2 (`country-package-belgium`; **1,179 current + 55 historical**). 1,185 municipal / 15 regional / 2 national / 32 other. Remaining-universe, Bilzen, Saint-Josse, and 35 unbound IBZ 2000 notes stay open. Do not invent municipal or indirect rows beyond the accepted pack. Run with `ATLAS_IMPORT_SCOPE=belgium`.
- Bosnia and Herzegovina is Europe #5 (`country-package-bosnia-and-herzegovina`; **13 regional / 0 municipal**). 10 cantonal assemblies are `approved`; entity offices `BA-F` / `BA-R` / `BA-G` stay `needs_review`. Research holds remain open (RS presidential replacement/repeat, coalitions, 2026-10-04 calendar certainty). Do not invent Brčko or municipal offices. Run with `ATLAS_IMPORT_SCOPE=bosnia`.
- Bulgaria is Prompt P (`country-package-bulgaria`; **530** accepted municipal / **0** regional). 3,067 district/village rows stay held. Градец / qualification-change research remains retained input. Run with `ATLAS_IMPORT_SCOPE=bulgaria`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Bulgaria_Import.md](../phase1/bulgaria/Bulgaria_Import.md).
- Netherlands is Prompt T (`country-package-netherlands`; **432 current + 69 historical**). 414 municipal / 12 regional / 3 national / 72 other. Hilversum/Wijdemeren merger binding, named historic gaps, and ~147 focused-tier reviews stay open. Appointed mayors have no election rows. Run with `ATLAS_IMPORT_SCOPE=netherlands`. See [Netherlands_Import.md](../phase1/netherlands/Netherlands_Import.md).

Mexico result rows that violate `percent_0_100` are **withheld** using the accepted override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (share NULL / share_status unknown / evidence_status disputed). Original values stay in `raw_json`. Denominators are not invented.

Status-only LatAm countries from `base.json.gz` (no offices) are imported as country rows. Office/event/result rows come only from approved shards.

## What is skipped

Draft residual-heavy packs are **not** imported:

antigua-and-barbuda, costa-rica, ecuador, guyana, haiti, peru, saint-kitts-and-nevis, trinidad-and-tobago.

Haiti keep-open residuals, Mexico’s 95 sibling shares, and live cutover remain out of scope.

## CI

`tests/atlas/continuity-import.test.ts` covers the approved-pack gate, Albania-only import, Albania+NZ serial publication, Albania+Andorra serial publication, Albania+Alderney serial publication, Albania+Armenia serial publication, Albania+Bosnia serial publication, Albania+Belgium serial publication, Albania+Bulgaria serial publication, and Albania+Netherlands serial publication.

`npm run test:atlas-import` (wired in GitHub CI after `npm test`) builds a temp SQLite and asserts the full approved set:

- Albania 122 offices / 0 regional
- Andorra 7 municipal offices / 0 regional / 21 events / 53 results
- Alderney 2 other offices / 0 regional / 2 conditional dates
- Armenia 71 municipal offices / 0 regional / 33 selected histories / 30 called next dates
- Belgium 1,234 offices (1,179 current + 55 historical) / 1,185 municipal / 15 regional / 2 national / 32 other / 1,772 events / 9,238 results / 0 prospective
- Bosnia and Herzegovina 13 regional offices / 0 municipal / 39 selected histories / 13 expected 2026-10-04 dates / 10 approved + 3 needs_review
- Bulgaria 530 approved municipal offices / 0 regional / 1,590 selected histories / 10,343 results; 3,067 held district/village offices unpublished
- Netherlands 501 offices (432 current + 69 historical) / 414 municipal / 12 regional / 3 national / 72 other / 1,475 events / 13,050 results / 0 prospective / 147 needs_review
- 10,227 approved LatAm offices (Batch A+B + El Salvador + Argentina)
- New Zealand 4 offices / 7 events / 36 historical results
- draft country offices absent
- 67 Mexico withhold rows and zero `share > 100` Mexico rows

The full import is a dedicated CI script rather than a Vitest case so the ~3 minute LatAm projection does not trip Vitest's worker RPC timeout.

The existing Albania CLI test uses `ATLAS_IMPORT_SCOPE=albania` so it stays a fast Albania-only proof. Andorra uses `ATLAS_IMPORT_SCOPE=andorra`. Alderney uses `ATLAS_IMPORT_SCOPE=alderney`. Armenia uses `ATLAS_IMPORT_SCOPE=armenia`. Belgium uses `ATLAS_IMPORT_SCOPE=belgium`. Bosnia uses `ATLAS_IMPORT_SCOPE=bosnia`. Bulgaria uses `ATLAS_IMPORT_SCOPE=bulgaria`. Netherlands uses `ATLAS_IMPORT_SCOPE=netherlands`:

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=armenia npm run import:atlas
ATLAS_IMPORT_SCOPE=belgium npm run import:atlas
ATLAS_IMPORT_SCOPE=bosnia npm run import:atlas
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
ATLAS_IMPORT_SCOPE=netherlands npm run import:atlas
```

Full `ATLAS_IMPORT_SCOPE=all` against a cold temp SQLite is on the order of a few minutes (LatAm projection + ~146k result rows + Bulgaria unpack). Use `albania`, `andorra`, `alderney`, `armenia`, `belgium`, `bosnia`, `bulgaria`, `netherlands`, or `nz` when you only need those lineages.

## VPS — Bosnia scoped import only

To add Bosnia and Herzegovina to an existing production Atlas SQLite, run a **scoped** import. Do **not** use `ATLAS_IMPORT_SCOPE=all` on the VPS for this lineage: `all` re-projects LatAm (~10k offices) and is not required to publish the 13 regional Bosnia offices.

```bash
# On the VPS, against the live Atlas paths only when you mean to publish
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=bosnia npm run import:atlas
```

Expected stdout includes `bosnia_offices=13`, `bosnia_regional=13`, `bosnia_municipal=0`, `bosnia_selected_histories=39`, `bosnia_prospective_events=13`, `bosnia_result_rows=749`, `bosnia_sources=30`, `bosnia_approved=10`, `bosnia_needs_review=3`. Unrelated lineages already published in that SQLite stay selected. This importer does not SSH, copy files, or flip `/electiondatabase` redirects.

Mexico withhold-all-67 and Austria remain untouched. Cutover remains out of scope. This PR does not add a Bulgaria VPS deploy.

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

## `/atlas` UI

The public MVP at `/atlas` reads the same SQLite file (`ATLAS_SQLITE_PATH`, else `data/master/atlas.sqlite` locally, `/var/lib/cdd/atlas.sqlite` in production). Missing or empty databases render an empty state. `/electiondatabase` is unchanged; it includes a soft link to `/atlas`. **No `/electiondatabase` redirects** ship with this floor.

Phase 2 floor surfaces (still not cutover):

| Surface | Behaviour |
| --- | --- |
| `/atlas` | Europe-first index of loaded countries/offices |
| `/atlas/explorer` | Search/filter offices (`q`, `country`, `tier`, `region`); filters and pagination persist in the URL |
| `/atlas/countries/:id` | Country index + regional calendar (populated for Belgium, Bosnia and Herzegovina, and Netherlands; honest empty states for Andorra / Alderney / Armenia / Bulgaria) |
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
