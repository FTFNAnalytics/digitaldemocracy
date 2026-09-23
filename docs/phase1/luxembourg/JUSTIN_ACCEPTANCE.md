# Justin acceptance — Luxembourg Prompt AO

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 102 current + 28 historical offices (130 total); 438 events; 48,197 result observations in the full pack

## Accepted
- Full current office register: 100 communal councils + Chambre des Députés + one Luxembourg EP delegation
- 28 historical communal-council identities, each with an explicit portal predecessor edge
- Draft tiers: 128 municipal / 0 regional / 1 national / 1 other (one classification per office)
- Direct executives: 0. Regional offices: 0
- Grand Duke: **LU-G01 resolved exclusion** — hereditary head of state; no popular office, event, or result
- Mayors: **LU-G02 resolved exclusion** — appointed by the Grand Duke on a council majority; no popular mayoral contest
- EP office stays `ep_delegation` / tier `other`
- Merger crosswalk stays the 28 explicit predecessor edges. No guessed edge was added
- 1994 EP Grevenmacher LSAP block stays missing. No residual vote total was invented
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (`applied_changes=0`; `research_coverage_complete=false`; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. LU-G03 — communal mergers (bounded; 28 explicit edges; 2011-law and Wiltz effective days not independently projected; pre-2005 universes not exhaustively reconstructed)
2. LU-G04 — supplementary elections / uncontested vacancies (open; no invented later winners)
3. LU-G05 — certification (open; official-publisher unofficial snapshots stay unofficial)
4. LU-G06 — EP depth (bounded; 1994 is communal reporting-unit data; pre-1994 not claimed)
5. LU-G07 — parliament seat-vector transcription (bounded; 1994 certified seat vector incomplete)
6. LU-G08 — dates precision (bounded; year-only rows stay year-only; no 1 January fill)
7. LU-G09 — Berdorf 2023 PDF capture limit (proclamation extraction; original PDF download returned 403)
8. LU-G10 — raw 2005 totals inconsistencies (review; raw zeros preserved, not repaired)
9. LU-G11 — 1994 EP Grevenmacher LSAP archive defect (open; missing LSAP block not inferred)

No hold was amended or closed. LU-G01 and LU-G02 stay documented resolved exclusions. No Grand Duke or mayor popular contest, guessed merger edge, or missing 1994 EP vote was invented for this landing.

## Authoritative pack counts
- 102 current + 28 historical offices
- Communal councils: 100 current / 28 historical
- Parliament / EP: 1 / 1
- 438 office-cycle events; 48,197 result observations; 48,033 numeric vote rows; 159 uncontested candidate rows
- 388 source captures in the full pack (omitted from this slim land)
- Draft tiers: municipal 128 / regional 0 / national 1 / other 1
- Full review ZIP SHA-256: `93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da` (validation note MATCH; 13,622,152 bytes)
- Slim land attachment SHA-256: `4a2b6c238708d380e1d01fdf53fd46c0aea8ddba76a8b2d25ddd98e701055a3a`
- Landed from main `5935187e8f0df09c4436c4feaba1869dafb4090e`
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad`
- Approved tier file SHA-256: `e1d109b024c466677ef084838192bb2bad101c8ad12010b28f6d35879c736169`
- Omitted `data/results.json` SHA-256 (manifest only): `0f6f5d1fd3b1d3d15518ea367327a2a7520ff0b34bc744975b13ab33c144f329`

## Land slim notes
- `sources/` omitted (388 hashed captures listed in `SHA256SUMS` and `source-inventory.json`)
- `data/results.json` omitted (48,197 result rows remain in the full ZIP). `observations.json` is the 702 source-statistic envelopes that were in the slim pack; it is not a substitute for `results.json`
- `docs/phase1/luxembourg/SHA256SUMS` is the full-pack manifest, including omitted paths
- Documentary contract bytes are `contracts/Inherited_223_Column_Contract.md` and `contracts/columns.json` (no `*.ts`; `tsconfig.json` unchanged)
- `JUSTIN_REPORT.md`, `Luxembourg_Pack_README.md`, and `validation.json` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- `validate.py` expects the pack root, including omitted `results.json` and `sources/`, and draft `justin_approved=false`. It is not an npm script and was not re-run after this accept-with-holds
- Per-office `review_status` stays `needs_review`. File status is `approved` with holds open

## Out of scope this land
- Luxembourg `import:atlas` importer (no `lib/atlas/luxembourg/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=luxembourg` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
