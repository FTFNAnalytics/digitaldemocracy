# Justin acceptance — Romania Prompt AL

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 6,460 current + 0 historical-only offices (6,460 total); 19,343 events; 23 result rows (national/EP only)

## Accepted
- Full current SIRUTA 2025 office register
- Councils/assemblies: 3,230. Direct executives: 3,229
- 41 județ councils + 41 county presidents; Bucharest General Council + general mayor; 3,180 ordinary local UAT council/mayor pairs; 6 Bucharest sector council/mayor pairs
- President `RO-PRES` is popularly elected (`direct_election=true`)
- No prefect, prime minister, or cabinet rows
- County presidents are marked direct for current law; 2016 council investiture is not a popular-election event (no 2016 `-P` events)
- 2024 presidential first round `RO-PRES-2024-R1` stays `annulled`; no successor edge to the 2025 rerun
- Draft tiers: 6,372 municipal / 84 regional / 3 national / 1 other
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (research completeness is not claimed; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. RO-G01 — local-results (missing ≠ zero)
2. RO-G02 — president full vectors + 2024 annulment handling
3. RO-G03 — county-president legal/returns (2016 investiture not popular)
4. RO-G04 — Bucharest sectors
5. RO-G05 — EP 2014/2019
6. RO-G06 — territorial-history (no guessed merger edges)
7. RO-G07 — parliament detail

No hold was amended or closed. No historical-only office, local result vector, successor or merger edge, 2016 county-president popular contest, or neighbourhood board was invented for this landing.

Soft note left open with RO-G05: `RO-EP` has `direct_election=false` and `tier_uncertain=true` while voters elect the list. The supplied 2024 aggregate (seats sum to 33, including an explicit 0-seat “Other parties” row) is retained. 2014/2019 vectors were not invented. The office stays drafted `other`.

## Authoritative pack counts
- 6,460 current + 0 historical offices
- 19,343 events; 23 result rows (events `RO-SEN-2024`, `RO-CD-2024`, `RO-EP-2024`, `RO-PRES-2025-R2` only)
- Draft tiers: municipal 6,372 / regional 84 / national 3 / other 1
- Județ councils 41 / presidents 41; ordinary local UATs 3,180; Bucharest sectors 6
- ZIP SHA-256: `4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf` (MATCH)
- Landed from main `1729e321ab31a5922d8ef7fb66236319511ddeda`
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `eb64c80668c2f079f33bbfeee765aa63948143f4d273371caa3e35a52ee005ce`
- Approved tier file SHA-256: `0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04`

## Land slim notes
- Review ZIP is already the slim pack. Landed research bytes match `docs/phase1/romania/SHA256SUMS`
- `events.json` is `events.json.gz` only (no uncompressed twin)
- `results.json` is the supplied 23 national/EP rows only; local vectors stay absent
- Documentary SQL contracts are under `docs/phase1/romania/contracts/` (no `contract-reference/*.ts`; `tsconfig.json` unchanged)
- `validate.py` is the review-pack validator. It expects the pack root and `status=draft_for_human_review`. It is not an npm script and was not re-run after this accept-with-holds
- `validation.json` records the pre-acceptance offline integrity run: **PASS**

## Out of scope this land
- Romania `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
- VPS deploy or live import
