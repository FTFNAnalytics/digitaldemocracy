# Election Atlas — Phase 0 inventory report

Status: `draft_for_human_review`. Rebuilt from in-repo package files. No `/electiondatabase` route changes. No Atlas DDL or import.

## Europe packages (4)

Checked-in early European packages: Albania, Andorra, Alderney, Armenia. Combined office-register rows: **202**. Proposed regional-tier offices: **0**.

| Package | Adapter | Register offices | Proposed tier | Regional |
| --- | --- | ---: | --- | ---: |
| Albania | `europe-country-extract/1` | 122 | municipal (61 mayors + 61 councils) | 0 |
| Andorra | `europe-country-extract/1` | 7 | municipal (communal councils) | 0 |
| Alderney | `europe-country-extract/1` | 2 | other (**approved** 2026-09-16) | 0 |
| Armenia | `armenia-packed-europe/1` | 71 | municipal (community offices) | 0 |

Workbook calendar strings such as Albania/Andorra `Regional / municipal` are **not** classifiers. Classification files are at `schemas/atlas/tiers/<slug>.json`. Each file's `office_id` set equals its source register exactly.

## Albania storage proof

Albania is the Phase 1 **storage-proof** target, not a regional-calendar launch. This inventory supplies the 122-row municipal draft that ingest will need. SQLite entity DDL, Albania import proof, and the unverified 2027 map are **not** in this change. `npm run import:atlas` remains blocked.

## Regional calendar proof

There is **no populated regional-calendar proof** in today's Europe packages. The European regional numerator is 0. That empty numerator does not fail Albania storage proof.

## Andorra empty-state demo

Andorra's seven communal councils are municipal. The package is the labelled empty regional-calendar demo: a country can sit in the publication set with **no regional-tier offices**.

## Armenia last

Armenia stays last among early European targets. Packed payload register: 71 community offices, all municipal. Proportional councils elect the mayor; missing mayor rows were not invented. Boundary/calendar flags: `AM-ARARAT-C`, `AM-MASIS-C`, `AM-PAMBAK-C`, `AM-VANADZOR-C`, `AM-VEDI-C` (Prompt A token `AM-VEDI` is not a register ID).

## Alderney `other` approved

`GG-ALD-STATES` and `GG-ALD-PLEB` are **approved** `other` (territorial legislature / representation). Seat counts are not extra office IDs. Product owner approved 2026-09-16. Channel Islands are low priority for the broader Atlas.

## LatAm + NZ continuity counts

Latin America lineage `latin-america-fe5e91689def` totals, recomputed from committed `data/research` shards:

- current offices: 18229
- historical offices: 414
- histories: 40509
- result rows: 269740
- briefings: 18643
- match to `manifest.json` `validatedCounts`: true

Those figures are this lineage's own counts, not Europe coverage. New Zealand: **4** by-election offices from `data/countries/new-zealand/dataset.json` `races[]`.

Machine-readable companions: `docs/phase0/inventory.json`, `docs/phase0/continuity-counts.json`, `docs/phase0/human-review.json`.
