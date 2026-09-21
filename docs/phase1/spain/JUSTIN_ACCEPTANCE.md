# Justin acceptance — Spain Prompt AE

**Date:** 2026-09-21 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 8,204 current + 4 historical offices (8,208 total); 20,820 events; 91,413 result rows

## Accepted
- Full current office register + qualified historic contests
- All 8,132 current INE municipal territorial entries retained
- 17 autonomous-community parliaments, 38 ordinary indirect provincial councils, 3 foral assemblies, 10 additional island councils
- Formentera counted once as a combined municipal/island body (proposed `other`)
- Ceuta / Melilla autonomous-city assemblies proposed `other`; Aran special assembly proposed `other`
- Congress and Senate `national` (maps to `national_context`); Spanish EP delegation `other`
- Draft tiers: 8,133 municipal / 68 regional / 2 national / 5 other
- Explicit concejo-abierto direct executives: 78; 3,762 municipal modes still pending
- Standing Atlas policy (full register even outside ~18-month alert window)
- Structural `validation.json`: **PASS** (research completeness is not claimed)

## Named holds (open, not blockers)
1. ES-G01 — Current municipal ballot modes (3,762 current pending modes + 78 concejo-abierto currency holds)
2. ES-G02 — Scanned municipal results and extraction coverage
3. ES-G03 — Corrections and conflicting originals (disputed duplicates)
4. ES-G04 — Regional, Senate, foral and island numeric depth
5. ES-G05 — Provincial indirect bodies (Diputaciones chronology)
6. ES-G06 — Historic municipal changes
7. ES-G07 — Special territorial regimes (Ceuta/Melilla/Formentera/Aran/Basque Juntas tier policy)
8. ES-G08 — Island source currency
9. ES-G09 — Upcoming calendar and alert scope (all next dates unknown)
10. ES-G10 — Submunicipal and special district universe
11. ES-G11 — Source acquisition
12. ES-G12 — Result interpretation

No hold is resolved in this landing.

## Authoritative pack counts
- 8,204 current + 4 historical offices
- 20,820 events; 91,413 result rows
- Draft tiers: municipal 8,133 / regional 68 / national 2 / other 5
- Explicit concejo-abierto direct executives: 78; 3,762 municipal modes still pending
- ZIP SHA-256: `bf735f4e3c3f246bf345faf2b47b6c12717b52bf38eb24696f1fff5d5d8ca1e2`
- Pack pin: `f7b5c81ebd39f1774edea7cde5b4155031d92647`
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f`

## Land slim notes
- `data/research/spain/sources/` raw primary bytes omitted (remain in review ZIP)
- `results.json` (~127 MB) omitted; do not invent
- `docs/phase1/spain/Spain_Identity_Vectors.json` (~58 MB) omitted; do not invent
- `events.json` retained as `events.json.gz` only (no invented uncompressed twin)
- `register-source-rows.json` omitted
- Full review ZIP SHA-256: `bf735f4e3c3f246bf345faf2b47b6c12717b52bf38eb24696f1fff5d5d8ca1e2`

## Out of scope this land
- Spain `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Mexico / other countries
