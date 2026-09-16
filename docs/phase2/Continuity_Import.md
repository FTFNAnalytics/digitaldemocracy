# Continuity import — approved packs

Justin authorized full proceed on 2026-09-16. `npm run import:atlas` loads **Albania** plus **approved** LatAm/NZ packs into the Atlas SQLite master. It does **not** import the ten residual-heavy draft packs, deploy to the VPS, or declare cutover.

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
| `all` (default) | Albania, then approved LatAm, then New Zealand |
| `albania` | Frozen Albania package only |
| `latam` | Approved Latin America packs + Mexico withhold-all-67 override |
| `nz` | Approved New Zealand package |

Each lineage is a **serial** attempt/swap. Unrelated lineages already in the published DB are preserved. The durable attempt ledger stays on `ATLAS_ATTEMPTS_SQLITE_PATH`.

Production VPS path remains `/var/lib/cdd/atlas.sqlite` (or `ATLAS_SQLITE_PATH`). This importer does not SSH or copy files to the VPS.

## What is loaded (Batch A + Batch B)

Approved continuity countries (12 packs):

- LatAm: bahamas, belize, brazil, colombia, cuba, dominica, dominican-republic, guatemala, jamaica, mexico, paraguay
- NZ: new-zealand
- Albania remains the Phase 1 storage-proof lineage (`country-package-albania`)

Mexico result rows that violate `percent_0_100` are **withheld** using the accepted override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (share NULL / share_status unknown / evidence_status disputed). Original values stay in `raw_json`. Denominators are not invented.

Status-only LatAm countries from `base.json.gz` (no offices) are imported as country rows. Office/event/result rows come only from approved shards.

## What is skipped

Draft residual-heavy packs are **not** imported:

antigua-and-barbuda, argentina, costa-rica, ecuador, el-salvador, guyana, haiti, peru, saint-kitts-and-nevis, trinidad-and-tobago.

Prompt H residual clearances, Mexico’s 95 sibling shares, and live cutover remain out of scope.

## CI

`tests/atlas/continuity-import.test.ts` covers the approved-pack gate, Albania-only import, and Albania+NZ serial publication.

`npm run test:atlas-import` (wired in GitHub CI after `npm test`) builds a temp SQLite and asserts the full approved set:

- Albania 122 offices / 0 regional
- 6,361 approved LatAm offices
- New Zealand 4 offices / 7 events / 36 historical results
- draft country offices absent
- 67 Mexico withhold rows and zero `share > 100` Mexico rows

The full import is a dedicated CI script rather than a Vitest case so the ~3 minute LatAm projection does not trip Vitest's worker RPC timeout.

The existing Albania CLI test uses `ATLAS_IMPORT_SCOPE=albania` so it stays a fast Albania-only proof.

Full `ATLAS_IMPORT_SCOPE=all` against a cold temp SQLite is on the order of a few minutes (LatAm projection + ~146k result rows). Use `albania` or `nz` when you only need those lineages.

## `/atlas` UI

The public MVP at `/atlas` reads the same SQLite file (`ATLAS_SQLITE_PATH`, else `data/master/atlas.sqlite` locally, `/var/lib/cdd/atlas.sqlite` in production). Missing or empty databases render an empty state. `/electiondatabase` is unchanged; it includes a soft link to `/atlas`.

`npm run dev` / `build` / `start` pass `--experimental-sqlite` so Next can read `node:sqlite`.
