# Justin acceptance — Portugal Prompt AD

**Date:** 2026-09-21 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 10,666 current + 8,168 historical offices (18,834 total); 19,820 events; 66,283 results

## Accepted
- Full current office register + qualified historic contests
- CNE 2025 mandate register: **308 municípios** and **3,258 freguesias** (including 37 plenary parishes)
- Câmara presidents as winning-list heads (no invented second mayoral ballot)
- Draft tiers: **927 municipal / 2 regional / 2 national / 17,903 other**
- Standing Atlas policy (full register even outside ~18-month alert window)
- Historical records retained as unresolved aliases/reforms — **not** treated as 8,168 proved abolitions
- Parish bodies/heads remain drafted **other** (PARISH-TIER); do not reclassify in this landing

## Named holds (open, not blockers)
1. CURRENT-REGISTER-DATE
2. INDIRECT-AND-LIST-HEAD
3. PLENARY-37
4. PARISH-REFORM-2013-2025
5. PARISH-TIER
6. LEGACY-CODE-CONFLICTS
7. DATES-REPEATS-SPECIALS
8. PUBLISHED-AGGREGATE-CONFLICTS
9. PR-2026-RUNOFF
10. PR-2016-MARGARITA
11. AZORES-COMPENSATION
12. MADEIRA-CORRECTION
13. AR-EUROPE-2022
14. EP-DETAIL
15. PRE2009-AND-CANDIDATES
16. MAI-FEED-HOLES
17. CERTIFICATION-AND-MARGINS

## Land slim notes
- `data/research/portugal/sources/` raw primary bytes omitted (remain in review ZIP)
- `data/research/portugal/retained-archive-members/` omitted (remain in review ZIP)
- Uncompressed `results.json` (~147 MB) omitted; `results.jsonl.gz` retained
- `events.json`, `office-register.json`, `identity-crosswalk.json`, `register-bindings.json`, and `return-reconciliation.json` retained as `.gz` only (no invented uncompressed twins)
- `docs/phase1/portugal/Portugal_Identity_Vectors.json` omitted for CloudAgent attach size
- Full review ZIP SHA-256: `eb1248f22c96569874e0d504194a72d23093e5e856577bc08f71fb432cd54f7e`
- Predecessor draft tier file SHA-256: `5155830f9141ebe7607d51e888e804f63fe2305426d20998ff6e16917da5d651`

## Out of scope this land
- Portugal `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Mexico / other countries
