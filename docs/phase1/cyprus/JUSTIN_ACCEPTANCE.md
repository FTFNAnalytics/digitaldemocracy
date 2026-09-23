# Justin acceptance — Cyprus Prompt AQ

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 714 current + 174 historical offices (888 total); 1,599 events; 11,112 result observations in the full pack

## Accepted
- Full current office register as named in the slim pack: 20 municipal councils, 20 mayors, 93 deputy mayors, 285 community councils, 285 community leaders, 5 District Local Government Organisation presidents, the House, the President, 3 religious-group representatives, and one EP delegation
- 174 historical offices: 28 municipal councils, 28 mayors, 59 community councils, and 59 community leaders
- Draft tiers: 877 municipal / 5 regional / 5 national / 1 other (one classification per office)
- Current direct executives: 404 (20 mayors + 93 deputy mayors + 285 community leaders + 5 DLGO presidents + 1 President)
- Current local councils: 305 (20 municipal + 285 community)
- Communities file stays at **285** named free-area councils. Ministry overview **286** stays unresolved. No 286th free-area community was added
- Occupied municipalities, occupied-community local offices, and all TRNC offices stay out of the local register
- Successor crosswalk stays empty. No 2024 reform successor edge was guessed
- Spilia Agios Antonios (`CY-COM-1401`) and Spilia Kourdali (`CY-COM-SPILIA-KOURDALI`) stay separate. Kourdali keeps an unresolved Electoral Service area code. No code join and no invented Kourdali results
- Alampra, Akoursos, Tera, and Pelathousa stay without fabricated historical office pairs
- Missing local returns stay missing. No zero was filled in
- EP stays one delegation on tier `other`. The five national rows are the House, the President, and three non-voting religious representatives
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (`applied_changes=0`; `current_register_complete=false`; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)

These are CY-G01–CY-G15. None was closed, amended, or resolved. Justin accepted all of them explicitly on 2026-09-22.

1. CY-G01 — Current community completeness (blocking). Electoral composition table names 285 free-area community councils; ministry overview says 286. No 286th council was identifiable with sufficient certainty, and none was invented.
2. CY-G02 — Post-1974 electoral footprint (scope gate). Only administered local municipalities and communities are instantiated. Nine occupied municipalities, occupied-community local offices, and all TRNC offices stay excluded. National House, President, and EP totals keep their official electorate.
3. CY-G03 — 2024 reform and predecessors (blocking for successor links). 28 historical municipal pairs and 59 historical community pairs are source-identified identities, not successor edges. Gazette merger instruments, cessation dates, and successor edges stay gated. The crosswalk stays empty.
4. CY-G04 — Spilia sub-community identity (blocking for code join). Spilia Agios Antonios and Spilia Kourdali stay separate named councils. Kourdali has no safely matched Electoral Service area ID.
5. CY-G05 — Presidential rounds and constitutional vice-presidency (coverage). Retained cycles stay as in the pack. Earlier cycles, unopposed returns, and Gazette declarations are not exhaustively normalized. No vice-presidential office was added.
6. CY-G06 — Municipal and community executives (mechanism gate). Mayors and deputies have separate popular footing. Community leaders are elected by community voters. Community deputies are council-selected and are not separate popular offices. Council seat totals overlap with separately registered executives.
7. CY-G07 — EP history and mandates (coverage). One delegation row. Earlier seats and individual preference outcomes are not fully normalized.
8. CY-G08 — Certification, election night, and corrections (blocking for certified label). A government host or 100% count is not Gazette certification.
9. CY-G09 — Malformed 2016 community preference rows (row-level quarantine). Three Ora preference rows stay withheld from normalized results.
10. CY-G10 — Historic date precision (date gate). Year-only rows stay year-only. Publication dates do not become poll dates.
11. CY-G11 — Missing local returns / unopposed and repeat polls (coverage). A missing return is not unopposed election, zero votes, abolition, or appointment.
12. CY-G12 — House electoral universes and religious representatives (scope gate). 56 filled legislative seats and 24 uncontested Turkish-Cypriot seats stay as sourced. Three religious representatives have no plenary vote. Do not infer 59 voting seats.
13. CY-G13 — Statistical units versus elected councils (identity gate). CYSTAT units without an elected council are not instantiated.
14. CY-G14 — District organisations and service clusters (scope gate). Five DLGO presidents stay. Appointed board members, ex-officio service-cluster seats, and district state administrations were not added as popular contests.
15. CY-G15 — Inherited contract and approval (approval gate). The 223-column contract is the inherited pin, not a reverified production schema. Per-office `review_status` stays `needs_review`.

No hold was amended or closed. No 286th free-area community, TRNC office, guessed 2024 reform successor edge, Spilia code join, or zero-filled missing local return was invented for this landing.

## Authoritative pack counts
- 714 current + 174 historical offices (status `current` / `historical_only`)
- Municipalities: 20. Named administered communities: 285. Ministry overview communities: 286 (unreconciled)
- Current local councils: 305. Current direct executives: 404
- Historical local councils: 87. Historical direct executives: 87
- 1,599 events; 1,679 reporting units; 11,112 result observations in the full pack
- 156 source payloads in the full pack (omitted from this slim land)
- Draft tiers: municipal 877 / regional 5 / national 5 / other 1
- Full review ZIP SHA-256: `0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad` (validation note MATCH; slim land attachment is not that digest)
- Slim land attachment SHA-256: `c0c26e5c63db25fe26b77e2ae4936f5eeef0f77dca2083918e10c2fed51e3df2` (`cyprus-aq-land-slim` upload, 242124 bytes). The 34 hashed files present in that zip matched `SHA256SUMS`. The manifest also lists omitted `data/results.json` and 156 `sources/` paths. The outer slim-zip digest is not the full-pack digest
- Landed from main `a62bd29f5b0848a69ff14062397d331647cf7ee0`
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde`
- Approved tier file SHA-256: `383512b2601296f78fa33da1376a387ebdb488bd80b426c0a94e2b22efb3eebb`
- Office register SHA-256: `8523b4a2a6179584b7beb8a7b0c83c21b4b89cce761d696f232e3e8e74e2b47c`
- Omitted `data/results.json` SHA-256 (manifest only): `13abc8a38053bdf44146be63fb15a1673137ed868054ebd4880146c2e44a3b04`

## Land slim notes
- `sources/` omitted (156 hashed captures listed in `SHA256SUMS` and `source-inventory.json`; not in the slim zip)
- `data/results.json` omitted (11,112 result rows remain in the full ZIP; not in the slim zip)
- `docs/phase1/cyprus/SHA256SUMS` is the full-pack manifest, including omitted paths
- Documentary contract bytes are `contracts/Inherited_223_Column_Contract.md` and `contracts/columns.json` (no `*.ts`; `tsconfig.json` unchanged)
- `JUSTIN_REPORT.md`, `Cyprus_Justin_Report.md`, and `validation.json` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- `validate.py` expects the pack root, including omitted `results.json` and `sources/`, and draft `justin_approved=false`. It is not an npm script and was not re-run after this accept-with-holds
- Per-office `review_status` stays `needs_review`. File status is `approved` with holds open
- Research JSON keeps `justin_approved=false`. Acceptance is this file and `schemas/atlas/tiers/cyprus.json`

## Out of scope this land
- Cyprus `import:atlas` importer (no `lib/atlas/cyprus/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=cyprus` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
