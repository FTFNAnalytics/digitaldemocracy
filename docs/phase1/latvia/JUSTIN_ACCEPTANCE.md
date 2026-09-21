# Justin acceptance — Latvia Prompt AG

**Date:** 2026-09-21 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 45 current + 121 historical offices (166 total); 217 events (216 historic + 1 prospective); 1,383 results; 2 proceedings

## Accepted
- Full current office register + qualified historic contests
- 42 current municipal councils + Saeima + indirect presidency + Latvia EP delegation
- Current direct-executive offices: 0; current indirect presidency: 1
- 121 historical identity records retained with no invented successor edges. **121 is not an abolished-council count**
- Draft tiers: 163 municipal / 0 regional / 2 national / 1 other
- Rosters: PV2017=119; post-reform observations 43 (PV2021=40 + VRD2021=2 + RD2020=1); PV2025=42 (7 state-city + 35 novadi)
- Standing Atlas policy (full register even outside ~18-month alert window)
- No popular mayor, appointed executive director, or planning-region office invented

## Named holds (open, not blockers)
1. LV-G01 — 2021 reform and cross-epoch identities
2. LV-G02 — Earlier history and repeat ballots
3. LV-G03 — Presidential ballots are incomplete and indirect
4. LV-G04 — Council chair versus executive director
5. LV-G05 — EP delegation and replacements
6. LV-G06 — Seven competing 2022 percentage claims
7. LV-G07 — Certification, result grain and absent fields
8. LV-G08 — Dates and out-of-window alerts
9. LV-G09 — Retained source scope

No hold was amended or closed. No cross-epoch identity merge, successor edge, earlier-history row, presidential ballot vector, chair-versus-director popular contest, EP replacement contest, 2022 percentage choice, certification call, date refinement, or candidate-level normalization was invented for this landing.

## Authoritative pack counts
- 45 current offices (42 councils + Saeima + indirect president + EP)
- 121 historical identity records (not abolished councils)
- 217 events (216 historic + 1 prospective); 1,383 results; 2 proceedings
- Draft tiers: municipal 163 / regional 0 / national 2 / other 1
- Direct executives: 0
- Rosters: PV2017=119; post-reform observations 43; PV2025=42 (7 state-city + 35 novadi)
- ZIP SHA-256: `b0e93594584b3feac6da137d879eb523ce9becac8e864c3f81d6fedc6b965964`
- Pack pin: `f7b5c81ebd39f1774edea7cde5b4155031d92647`
- `validation.json`: PASS (pre-acceptance offline research integrity; `Justin_approved` was false in that receipt; this file is the acceptance)
- Predecessor draft tier SHA-256: `7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce`
- Approved tier SHA-256: `227f743ab91c6d86f711be2fd5314e3e7c573da233b9a61187c8a3b37abb34f3`

## Land slim notes
- `data/research/latvia/sources/` raw CVK / data.gov.lv XML/HTML/PDF omitted (includes the large 2017 electionresults XML)
- `docs/phase1/latvia/Latvia_Identity_Vectors.json` omitted
- `results.json.gz` gunzipped to normal `results.json` (no `.gz` twin kept)
- Full review ZIP SHA-256: `b0e93594584b3feac6da137d879eb523ce9becac8e864c3f81d6fedc6b965964`

## Out of scope this land
- Latvia `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
