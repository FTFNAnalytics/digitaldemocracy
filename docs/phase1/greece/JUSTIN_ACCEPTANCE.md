# Justin acceptance — Greece Prompt AM Rebuilt

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 693 current + 10 historical offices (703 total); 2,774 events; 3,555 proceedings; 14,004 result rows / 8,021 distinct source observations

## Accepted
- Full current office register
- 332 current municipal councils + 332 current mayors
- 13 current regional councils + 13 current governors
- Parliament (`GR-PARL`), indirect presidency (`GR-PRES`), and one Greek EP delegation (`GR-EP`, drafted `other`)
- President `GR-PRES` remains `parliamentary_indirect` / `direct_executive=false` — no fabricated popular ballot
- No PM, cabinet, or prefect rows
- Five abolished municipalities retained as historical council/mayor pairs (10 historical offices). No Kallikratis or Kleisthenis successor edges
- Draft tiers: 674 municipal / 26 regional / 2 national / 1 other (one classification per office)
- Current direct executives: 345. Historical direct executives: 5
- 14,004 result rows are projections of 8,021 distinct source observations (`observation_id` / `shared_ballot_id`). They are not 14,004 independent ballot totals
- Missing results stay gaps. No zero was invented for an absent return
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (`applied_changes=0`; research completeness is not claimed; `historical_numeric_coverage_complete=false`; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. GR-G01 — presidential indirect election (1974, 1975, 1980, 1985, 1990, 1995 ballots incomplete)
2. GR-G02 — 2019 regional station denominators (`ANumTm` vs configured `CountTm`) for all 13 regions
3. GR-G03 — Messini 2014 tied runoff (electoral code 9255; `GR-M-9255-C` / `GR-M-9255-M`; 9,236–9,236; `WIN_ID=0`; 17 of 33 council seats allocated)
4. GR-G04 — Kallikratis / Kleisthenis succession (`partially_resolved` as supplied: 10 historical offices retained; no successor edges asserted; not closed)
5. GR-G05 — earlier parliamentary vote vectors (ten cycles 1974–2000 are seat-winners only)
6. GR-G06 — European Parliament (1981 event-only; 1984–2009 seats/shares without exact votes)
7. GR-G07 — source finality (archive snapshots are not court certification)
8. GR-G08 — pre-2010 municipal history (Kapodistrias and earlier not supplied)
9. GR-G09 — party and person identity (`review_required`; no canonical aliases asserted)
10. GR-G10 — retrieval and original bytes (HTTP 502/403; one labelled web-extract is not an original-PDF digest)

No hold was amended or closed. No Kallikratis successor edge, PM/cabinet/prefect row, popular presidential ballot, or zero-filled missing result was invented for this landing.

## Local source holds (open)
Fourteen rows in `data/research/greece/source-holds.json` stay open:

- Messini 2014 (`2014::dhm_d::9255`): incomplete seat allocation and missing winner. Both runoff tallies are retained. No winner was chosen.
- 2019 regional station snapshots `2019::snom_n::1` through `2019::snom_n::13` (`GR-R-01` through `GR-R-13` councils and governors): `partial_station_snapshot=true`. Reported candidate values stay as published. These snapshots are not relabelled fully certified.

## Authoritative pack counts
- 693 current + 10 historical offices
- 2,774 events; 3,555 proceedings; 14,004 result rows; 8,021 distinct observations; 1,366 authority-cycle vectors; 781 observed runoffs
- Draft tiers: municipal 674 / regional 26 / national 2 / other 1
- Current direct executives 345; historical direct executives 5
- Hashed source artifacts in the full pack: 2,807 (omitted from this slim land)
- Full review ZIP SHA-256: `356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb` (MATCH the Rebuilt pack)
- Rebased onto main `917f8b100e7c08b07f155ade84044bb09d533518` (merge of Romania Prompt AL #68; Romania head `23c02e86`). Hungary, Romania, and the other country lines on the shared indexes are retained.
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `57f425425b5bbb646df5dee39a04789e6aa4ed8501c7033867b2327f1aee6c59`
- Approved tier file SHA-256: `97c2587226c8e7cb1bf50233e6ff23844eeda52437a6e852efb41266dd3c88b6`

## Land slim notes
- `data/research/greece/sources/` omitted (2,807 hashed artifacts; about 244MB in the full Rebuilt ZIP)
- `scripts/validate_greece_pack.py` and `scripts/source_parsers.py` are not in the slim land. `docs/phase1/greece/SHA256SUMS` is the full-pack manifest, including those omitted paths
- `results.jsonl.gz` and `ballot-observations.jsonl.gz` are included (they were in the slim pack)
- Documentary SQL contracts are under `docs/phase1/greece/contracts/` (no `*.ts`; `tsconfig.json` unchanged)
- `docs/phase1/greece/JUSTIN_REPORT.md` and `validation.json` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- Per-office `review_status` stays `needs_review`. File status is `approved` with holds open

## Out of scope this land
- Greece `import:atlas` importer (no `lib/atlas/greece/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=greece`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
