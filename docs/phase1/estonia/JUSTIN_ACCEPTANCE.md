# Justin acceptance — Estonia Prompt AF

**Date:** 2026-09-21 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 81 current + 200 historical offices (281 total); 464 events; 24 presidential ballot proceedings; 49,504 result rows

## Accepted
- Full current office register + qualified historic contests
- 78 current municipal councils (volikogu) + Riigikogu + indirect presidency + Estonia EP delegation
- Current direct-executive offices: 0; current indirect presidency: 1
- 200 historical EHAK-coded council identities retained with no invented successor edges
- Draft tiers: 278 municipal / 0 regional / 2 national / 1 other
- Local rosters: 2013=215, 2017=79, 2021=79, 2025=78 (215 is the 2013 election roster, not an immediately-pre-2017 legal count)
- Standing Atlas policy (full register even outside ~18-month alert window)
- No mayor, county-governor, cabinet, or Tallinn district office invented

## Named holds (open, not blockers)
1. EE-G01 — 2017 reform and successor bindings
2. EE-G02 — pre-2013 and intervening special history
3. EE-G03 — 2021 presidential gap (indirect franchise)
4. EE-G04 — mayor-mode legal text
5. EE-G05 — EP tier and replacements
6. EE-G06 — 2013 archive conflict (XML 625,334 vs official general statistics 625,336)
7. EE-G07 — date precision
8. EE-G08 — Jõhvi–Toila transition
9. EE-G09 — nonadditive interpretation (totals, elected flags, missing scalars)

No hold was amended or closed. No successor, code-equivalence, 2021 presidential row, mayor ballot, EP replacement contest, two-vote correction, date refinement, or candidate-share derivation was invented for this landing.

## Land slim notes
- `data/research/estonia/results.json` omitted (~80 MB; 49,504 rows remain in the review ZIP)
- `docs/phase1/estonia/Estonia_Identity_Vectors.json` omitted (~19 MB)
- `data/research/estonia/sources/` and unpacked raw election XML/zips omitted
- `events.json`, `nonadditive-list-summaries.json`, and `Estonia_Input_Inventory.json` gunzipped to normal `.json` (no `.gz` twin kept)
- Full review ZIP SHA-256: `0cdc5a188b423aca789d9c2cc0ce206a493d807628865fc429114205e41d467f`
- Pinned main: `f7b5c81ebd39f1774edea7cde5b4155031d92647`
- `validation.json` records the pre-acceptance offline research integrity run: **PASS** (`Justin_approved` was false in that receipt; this file is the acceptance)
- Predecessor draft tier file SHA-256: `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`
- Approved tier file SHA-256: `bf86952fe8966a792166064e6505932ce590c3643951a802ba55896a332cfa8d`

## Out of scope this land
- Estonia `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
