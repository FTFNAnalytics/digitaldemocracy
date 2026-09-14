# Election database — progress

Resume file for the Subnational Election Observatory (`/electiondatabase`).

## Software vs research

| Question | Status |
|---|---|
| Software delivery of the first slice (IA, schemas, stubs, fixtures, nav) | **In progress / this PR** |
| Research coverage complete | **No** |

## Blocking input

**`Latin_America_Races_and_Briefings.zip` has not been supplied.**

Do not invent elections. Until the zip is in the tree (or `ELECTION_RELEASE_ZIP` / `--zip` points at it):

- Public pages must stay in the awaiting-release / fixture-only state.
- `npm run import:data` and `npm run validate:data` fail with an explicit missing-package message.
- `npm run import:data -- --fixtures` and `npm run validate:data -- --fixtures` are layout/smoke-test only.

Search paths: repo root, `data/incoming/`, `incoming/`, `research/`.

## What is implemented

- Observatory IA under `/electiondatabase` (home, regions, country, explorer, office, event, compare, calendar, polling, coverage, sources, downloads, methodology, releases, about).
- Versioned schemas: `schemas/v1/normalized.ts`, `input-manifest.ts`, `reconciliation.ts`.
- Synthetic fixture dataset labelled `synthetic_fixture` (`data/normalized/synthetic-fixture-v0.ts`).
- URL-persisted filters on explorer, compare, calendar, polling, coverage, sources.
- Marketing header / research / footer links to `/electiondatabase`.
- CI formula, Pedersen helper, date precision rules, missing-vs-zero helpers, tests.

## What is not implemented

- Real adapters bound to inspected release file shapes.
- Filename-to-office briefing redirect manifest (must be confirmed from actual files).
- Partitioned `public/data/` shards for a full-data build.
- Import diff between successive real releases.
- GitHub large-file / artifact hosting for workbooks and PDFs.

## When the zip lands

1. Place it at `data/incoming/Latin_America_Races_and_Briefings.zip` (do not commit the archive unless an explicit large-file strategy is approved).
2. Inventory and hash; classify with `scripts/import/classify.ts` + `INPUT_MANIFEST`.
3. Implement South America adapters first (`country-json`, completion queue, screens, polling reconcile).
4. Bypass known legacy defects (`release_summary.json` totals; stale `Build_Status` briefing count).
5. Recompute totals from normalized records; write `data/releases/reconciliation-report.json`.
6. Wire office → detail pages to real IDs. Keep fixtures in `tests/fixtures/` only.
7. Do **not** claim research coverage is complete. South American research is explicitly incomplete.

## Known semantic cases to re-test on real data

See the build prompt §9: Ecuador 1,292 register entries vs March 2027 contests; Cali directory snapshots ≠ elections; uncleared three-cycle CI; party-code collisions; accented names; partial dates.

## Commands

```bash
npm run dev
npm run import:data          # fails without the zip
npm run validate:data        # fails without the zip
npm run import:data -- --fixtures
npm run validate:data -- --fixtures
npm test
npm run build
```
