# Justin acceptance — Slovenia Prompt AJ

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 428 current + 0 historical-only offices (428 total); 1,706 events; 13,830 result rows in the review ZIP (not landed)

## Accepted
- Full current office register
- 212 municipal councils and 212 directly elected mayors
- Državni zbor (National Assembly), indirectly elected Državni svet (National Council), directly elected president, and the Slovenia EP delegation
- Direct executives: 213. Councils, chambers, or delegation: 215
- President `SI-PRESIDENT` is popularly elected
- National Council `SI-DS` stays indirect (local/functional electors) and drafted national, not regional
- No elected regional office, appointed PM/cabinet, or neighborhood body
- Draft tiers: 424 municipal / 0 regional / 3 national / 1 other
- EP `SI-EP` stays drafted `other` with `human_review_required` and `tier_uncertain`
- Zero recovered historical-only offices is not proof that no abolished office existed
- The 2018 Ribnica council return stays missing; no zero was invented
- 1,172 damaged source labels stay verbatim and flagged
- Official 15 November 2026 local call covers 424 prospective events; no fabricated returns
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (research completeness is not claimed; `Justin_accepted` was false in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. SI-HISTORICAL-MUNICIPAL-UNIVERSE — pre-2014 predecessors and boundary changes; no successor edges
2. SI-LOCAL-CERTIFICATION-REPEATS — 2014/2018 unofficial snapshots; certification, by-elections, recounts, and repeats not exhaustive
3. SI-MISSING-LOCAL-CYCLE — `SI-106-C::LV2018` Ribnica council return absent
4. SI-SOURCE-TEXT-DAMAGE — 1,172 result labels contain U+FFFD; no repaired spelling
5. SI-ROSTER-ALIASES — three government/election naming variants and the 2018 LUŽE binding stay pending; no fuzzy merge
6. SI-DS-COMPONENTS — National Council component repeats and older by-elections not fully normalized
7. SI-DZ-MINORITY-MANDATES — Italian/Hungarian special ballots, district preference detail, and 2026 mandate allocation not fully normalized
8. SI-EP-DETAIL — EP stays drafted `other`; 2014 numeric mandates and preference detail stay incomplete
9. SI-LOCAL-PREFERENCE — proportional council preference arrays stay raw
10. SI-NEXT-CALLS — next dates other than the 15 November 2026 local call stay unknown

No hold was amended or closed. No historical-only office, successor or merger edge, Ribnica 2018 council return, repaired source label, minority vote share, or extra next date was invented for this landing.

The pack's `SI-MEDIA-FIXTURE` exclusion stays in force: media instructional feeds stay out of numerical projection. That exclusion is not one of the ten named holds and was not closed.

## Authoritative pack counts
- 428 current + 0 historical offices
- 1,706 events (1,282 historical + 424 prospective); 13,830 result rows; 801 proceedings (review ZIP; result and event bytes not landed)
- Draft tiers: municipal 424 / regional 0 / national 3 / other 1
- Municipal councils 212 / direct mayors 212; direct executives 213; councils, chambers, or delegation 215
- Full ZIP SHA-256: `e89b8d39663ee27b1abd7016cb37e4b1ba2b03f8feea46453c60bb9be1118150` (MATCH)
- Attached slim ZIP SHA-256: `2e99029132bd6595c42b2dc711e9e7134e64a590161235715083a5b2a54f1e2b`
- Pack pin: `3b21c584c1b59663c5c4ae1bad775618293ac0fa`
- Landed from main `917f8b100e7c08b07f155ade84044bb09d533518`
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `17a836af07d10fa5ec3c0560c8281f67d60e17cd76b727360aa823b40ab201ee`
- Approved tier file SHA-256: `99d7ae507e2e25c7bb3f112a2fc2f771295fded9499cacc23e3bd1fb59f4a096`

## Land slim notes
- `docs/phase1/slovenia/Slovenia_Identity_Vectors.json` omitted (about 10 MB)
- `data/research/slovenia/` sources, results, events, and the rest of the research JSON were not in the attached slim zip and are not invented
- Documentary `contract-reference/*.ts` and SQL are retained under `docs/phase1/slovenia/contract-reference/` and excluded from `tsconfig.json` so they are not an importer
- `validate.py` is the review-pack validator. It expects the pack root and `status=draft_for_human_review`. It is not an npm script and was not re-run after this accept-with-holds
- `validation.json` records the pre-acceptance offline integrity run: **PASS**
- `SHA256SUMS` is the full review-pack manifest, including omitted members

## Out of scope this land
- Slovenia `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
- VPS deploy or live import
- `ATLAS_IMPORT_SCOPE=all`
