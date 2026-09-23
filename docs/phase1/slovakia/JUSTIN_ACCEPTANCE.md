# Justin acceptance — Slovakia Prompt AI

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 5,871 current + 0 historical-only offices (5,871 total); 23,437 events; 19 proceedings; 115,217 result rows in the full pack

## Accepted
- Full current elected office register
- 2,887 municipal councils + 2,887 direct municipal mayors
- 39 Bratislava/Košice city-part councils + 39 direct city-part mayors (drafted `other`)
- 8 VUC assemblies + 8 direct VUC chairs (drafted regional)
- National Council `SK-NRSR` and direct presidency `SK-PRESIDENT` (drafted national)
- EP delegation `SK-EP` (drafted `other`)
- Direct executives: 2,935; councils/assemblies/chamber/delegation: 2,936
- No appointed okres governor, prime minister, cabinet, military-area, overseas, or referendum office
- Draft tiers: 5,774 municipal / 16 regional / 2 national / 79 other
- 79 focused policy flags remain (78 city-part offices + EP)
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (research completeness is not claimed; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. SK-HISTORICAL-UNIVERSE — 0 historical-only recovered is not proof of zero abolished offices; no guessed successor edges
2. SK-LOCAL-OLDER-VECTORS — 2014/2018 council rows stay elected-only; missing votes are not inferred
3. SK-LOCAL-MISSING-CYCLES — 44 local office/cycle bindings stay absent (missing ≠ zero, missing ≠ abolition)
4. SK-REPEATS-CERTIFICATION — repeats, annulments, and replacement cycles are not certified here
5. SK-VUC-INTRODUCTION — pre-2013 VUC returns are not normalized; 2026 mechanism is not applied retroactively
6. SK-CITY-PART-TIER — 78 city-part offices stay drafted `other`; no invented regional city layer
7. SK-EP — national party vectors only; tier stays `other`; 2014 seat gaps and later mandate changes stay unconflated
8. SK-HOMONYMS-UNKEYED — same-name occurrences stay source-record keyed; no name deduplication
9. SK-2026-CALL — 24 October 2026 is a prospective call only; no future votes, winners, or certification
10. SK-AGGREGATES — no computed margins or cross-district sums

No hold was amended or closed. No historical-only office, successor edge, omitted result row, source byte, or identity-vector blob was invented for this landing.

## Authoritative pack counts
- 5,871 current + 0 historical offices
- 23,437 events (17,569 historical + 5,868 prospective); 19 proceedings; 115,217 result rows in the full pack (not landed)
- Draft tiers: municipal 5,774 / regional 16 / national 2 / other 79
- Local jurisdictions 2,926 (2,887 municipalities + 39 city parts); VUC 8 assemblies + 8 chairs
- Missing local office-cycle bindings: 44
- Full ZIP SHA-256: `f1fdbec0350399ee0621cb0489a59627b1113f87f7c7f0fe0d5451f12cf25a62`
- Slim land ZIP SHA-256: `423d6c6c87ade8991a50f17b54609be2866b054df6f8839576108b2f86721a75`
- Pack pin: `89726607439fa6726e7c34e30eec45357230d318`
- Landed from main `917f8b100e7c08b07f155ade84044bb09d533518`
- Structural validation.json: PASS (pre-acceptance; `Justin_accepted` was false in that receipt)
- Predecessor draft tier SHA-256: `ce8c24f7fcc2f41439f16fca0ad428312de913815c542d3c5c46e28275559770`
- Approved tier file SHA-256: `847c8880342a0cc633b03306b3fac57f04cf93d4da98d4e0854e81db3e3c4010`

## Land slim notes
- Docs + tiers only. `data/research/slovakia/` is not in this land
- `docs/phase1/slovakia/Slovakia_Identity_Vectors.json` omitted
- `data/research/slovakia/results.json`, `sources/`, and other research tables omitted (115,217 result rows remain in the full ZIP)
- Documentary SQL/TS contracts stay under `docs/phase1/slovakia/contract-reference/` and are excluded from `tsconfig.json`
- `validate_pack.py` is the review-pack validator. It expects the full pack root and `status=draft_for_human_review`. It is not an npm script and was not re-run after this accept-with-holds
- `validation.json` records the pre-acceptance offline integrity run: **PASS**
- `SHA256SUMS` is the full-pack manifest, including omitted members

## Out of scope this land
- Slovakia `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
- VPS deploy or live import
