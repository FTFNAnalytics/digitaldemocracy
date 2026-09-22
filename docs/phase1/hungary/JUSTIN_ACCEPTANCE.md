# Justin acceptance — Hungary Prompt AK

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 6,378 current + 0 historical-only offices (6,378 total); 12,753 events; 101,526 result rows

## Accepted
- Full current office register
- 3,178 direct mayors (3,177 municipal/district + 1 capital) and 3,198 councils/assemblies (3,177 municipal/district councils + 19 county assemblies + Budapest capital assembly + Országgyűlés)
- President `HU-PRES` remains `indirect_president` / `indirect_parliamentary` — no fabricated popular ballot
- No PM/cabinet offices, no direct county chairs, no járás councils (`HU-CHAIRS-JARAS` documented exclusion)
- Draft tiers: 6,355 municipal / 20 regional / 2 national / 1 other
- `successor-crosswalk.json` stays empty (no guessed merges)
- Coverage remains incomplete (`coverage_complete: false`)
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (research completeness is not claimed; `Justin_accepted` was false in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. HU-CURRENT-LEGAL-REGISTER — Jan 2026 NVI roster; later legal/KSH audit open
2. HU-HISTORICAL-REFORMS — 0 historical-only recovered is not proof of zero abolished offices
3. HU-2019-ARCHIVE — 2019 local/EP and 2018 parliamentary not acquired
4. HU-SPECIAL-REPEAT — by-elections/repeats incomplete
5. HU-BUDAPEST — capital assembly regional + capital mayor municipal pending Justin tier review; recount chronology
6. HU-PRESIDENT — vote totals unknown (CAPTCHA); 2026 constitutional reconciliation open
7. HU-NATIONAL-COMPONENTS — 2026 nationality/compensation/seats not synthesized
8. HU-EP — domestic subset only; overseas/final allocation open; tier=`other` pending Justin
9. HU-NATIONALITY-SELF-GOVERNMENT — retained files not added as ordinary councils
10. HU-MUNICIPAL-SEATS — 2024 seat allocations often NULL
11. HU-CHAIRS-JARAS — documented exclusion (not a gap to invent)
12. HU-UPCOMING — next dates NULL; no invented 2029

No hold was amended or closed. No historical office, successor edge, popular presidential ballot, county chair, járás council, or zero-vote return was invented for this landing.

Bozsok council (`HU-NVI-18-012-C`), Bozsok mayor (`HU-NVI-18-012-M`), and Pakod council (`HU-NVI-20-160-C`) stay in the register without 2024 numeric returns. Those gaps stay open. No zero was invented (`office-cycle-gaps.json`).

## Land slim notes
- `data/research/hungary/results.json` omitted (101,526 rows remain in the review ZIP)
- `data/research/hungary/sources/` and `unpacked/` omitted
- `data/research/hungary/identity-crosswalk.json` omitted
- `docs/phase1/hungary/Hungary_Identity_Vectors.json` omitted
- `docs/phase1/hungary/contract-reference/` had no files in the slim pack (no documentary `*.ts` to exclude from `tsconfig.json`)
- Full review ZIP SHA-256: `03b497b92937719a2bf6e58324910aa68cdf2fbdb497203f617482bbec3bd074` (MATCH)
- Pack pin: `3b21c584c1b59663c5c4ae1bad775618293ac0fa`
- Landed on main `c621591717e8476e06e3a76cc60bfa29aab7fc0d`
- `validation.json` records the pre-acceptance offline research integrity run: **PASS** (`Justin_accepted` was false in that receipt; this file is the acceptance)
- Predecessor draft tier file SHA-256: `fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a`
- Approved tier file SHA-256: `3be45f777e8c3c5bcbd02825a18f4cd327c2b31478753b6863de48799dcec9cd`

## Out of scope this land
- Hungary `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Other countries
