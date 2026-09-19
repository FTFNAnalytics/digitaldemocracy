# Continuity import — approved packs

Justin authorized full proceed on 2026-09-16. `npm run import:atlas` loads **Albania**, **Andorra**, **Alderney**, **Armenia**, **Bulgaria**, and **approved** LatAm/NZ packs into the Atlas SQLite master. It does **not** import the remaining residual-heavy draft packs, deploy to the VPS, or declare cutover.

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
| `all` (default) | Albania, Andorra, Alderney, Armenia, Bulgaria, then approved LatAm, then New Zealand |
| `albania` | Frozen Albania package only |
| `andorra` | Frozen Andorra package only (7 municipal / 0 regional) |
| `alderney` | Frozen Alderney package only (2 other / 0 regional; conditional 2026 dates) |
| `armenia` | Frozen Armenia package only (71 municipal / 0 regional; 30 source-reported called 2026 dates) |
| `bulgaria` | Frozen Bulgaria package only (**530** accepted municipal / 0 regional; 3,067 held district/village rows unpublished) |
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
- Bulgaria is Prompt P (`country-package-bulgaria`; **530** accepted municipal / **0** regional). 3,067 district/village rows stay held. Градец / qualification-change research remains retained input. Run with `ATLAS_IMPORT_SCOPE=bulgaria`. Do **not** use `SCOPE=all` on the VPS unless you intend a full re-import. See [Bulgaria_Import.md](../phase1/bulgaria/Bulgaria_Import.md).

Mexico result rows that violate `percent_0_100` are **withheld** using the accepted override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (share NULL / share_status unknown / evidence_status disputed). Original values stay in `raw_json`. Denominators are not invented.

Status-only LatAm countries from `base.json.gz` (no offices) are imported as country rows. Office/event/result rows come only from approved shards.

## What is skipped

Draft residual-heavy packs are **not** imported:

antigua-and-barbuda, costa-rica, ecuador, guyana, haiti, peru, saint-kitts-and-nevis, trinidad-and-tobago.

Haiti keep-open residuals, Mexico’s 95 sibling shares, and live cutover remain out of scope.

## CI

`tests/atlas/continuity-import.test.ts` covers the approved-pack gate, Albania-only import, Albania+NZ serial publication, Albania+Andorra serial publication, Albania+Alderney serial publication, and Albania+Armenia serial publication.

`npm run test:atlas-import` (wired in GitHub CI after `npm test`) builds a temp SQLite and asserts the full approved set:

- Albania 122 offices / 0 regional
- Andorra 7 municipal offices / 0 regional / 21 events / 53 results
- Alderney 2 other offices / 0 regional / 2 conditional dates
- Armenia 71 municipal offices / 0 regional / 33 selected histories / 30 called next dates
- Bulgaria 530 approved municipal offices / 0 regional / 1,590 selected histories / 10,343 results; 3,067 held district/village offices unpublished
- 10,227 approved LatAm offices (Batch A+B + El Salvador + Argentina)
- New Zealand 4 offices / 7 events / 36 historical results
- draft country offices absent
- 67 Mexico withhold rows and zero `share > 100` Mexico rows

The full import is a dedicated CI script rather than a Vitest case so the ~3 minute LatAm projection does not trip Vitest's worker RPC timeout.

The existing Albania CLI test uses `ATLAS_IMPORT_SCOPE=albania` so it stays a fast Albania-only proof. Andorra uses `ATLAS_IMPORT_SCOPE=andorra`. Alderney uses `ATLAS_IMPORT_SCOPE=alderney`. Armenia uses `ATLAS_IMPORT_SCOPE=armenia`. Bulgaria uses `ATLAS_IMPORT_SCOPE=bulgaria`:

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-attempts.sqlite
ATLAS_IMPORT_SCOPE=armenia npm run import:atlas
ATLAS_IMPORT_SCOPE=bulgaria npm run import:atlas
```

Full `ATLAS_IMPORT_SCOPE=all` against a cold temp SQLite is on the order of a few minutes (LatAm projection + ~146k result rows + Bulgaria unpack). Use `albania`, `andorra`, `alderney`, `armenia`, `bulgaria`, or `nz` when you only need those lineages.

## `/atlas` UI

The public MVP at `/atlas` reads the same SQLite file (`ATLAS_SQLITE_PATH`, else `data/master/atlas.sqlite` locally, `/var/lib/cdd/atlas.sqlite` in production). Missing or empty databases render an empty state. `/electiondatabase` is unchanged; it includes a soft link to `/atlas`. **No `/electiondatabase` redirects** ship with this floor.

Phase 2 floor surfaces (still not cutover):

| Surface | Behaviour |
| --- | --- |
| `/atlas` | Europe-first index of loaded countries/offices |
| `/atlas/explorer` | Search/filter offices (`q`, `country`, `tier`, `region`); filters and pagination persist in the URL |
| `/atlas/countries/:id` | Country index + regional calendar empty state |
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
