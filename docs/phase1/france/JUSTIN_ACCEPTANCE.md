# Justin acceptance — France Prompt AR

**Date:** 2026-09-22 (America/Edmonton)
**Decision:** Accept with holds **G01–G21** left open.
**Counts (validated):** 35,112 current · 2,738 historical · 119,554 events · 1,193,657 results
**Full ZIP SHA-256:** `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9`
**applied_changes:** 0 (research land only; no importer)

Do **not** invent hold resolutions, popular mayor contests where the mayor is council-selected, EPCI popular contests, guessed commune-nouvelle successor edges, or zero-fill missing results.

## Accepted
- Full current in-scope office register: 35,112 current offices on the COG 2026-01-01 vintage
- 2,738 historical-only offices already in the register
- Draft tiers exactly 1:1 with offices: T1 **4** / T2 **45** / T3 **96** / T4 **37,705**
- Direct executives current: **1** (`FR-PRESIDENT`). Other current elected bodies: 35,111. Local direct executives: 0
- Mayors and local executive presidents stay council/assembly-selected. No popular mayor contest was added
- Ordinary EPCI popular contests stay excluded. Métropole de Lyon stays the included metropolitan council
- `successor-crosswalk.json` stays empty. No guessed commune-nouvelle successor edge was added
- 38 source arithmetic discrepancies stay retained. No invented correction
- Chatain (86063) 2026 round-one empty list label stays empty
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation-report.json`: **PASS** (`applied_changes=0`; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)
1. G01 — Presidential rounds
2. G02 — Senate indirect election
3. G03 — Municipal mayoral selection
4. G04 — Regional and departmental executives
5. G05 — Commune-nouvelle identities
6. G06 — 2015–2016 regional reform
7. G07 — Departmental and special-collectivity coverage
8. G08 — Mayotte transition
9. G09 — Overseas scope
10. G10 — New Caledonia provincial returns
11. G11 — Wallis-Futuna repeat election
12. G12 — Polynesian municipal returns
13. G13 — EPCI exclusion and Lyon exception
14. G14 — PLM separate ballots
15. G15 — EP seats and vote universes
16. G16 — Certification, corrections and arithmetic
17. G17 — History coverage and partial elections
18. G18 — 2014 candidate/list regime
19. G19 — Upcoming window
20. G20 — Tier authority
21. G21 — Source list identity missing (Chatain empty list label)

No hold was amended or closed. All 21 stay `open_or_explicit_exclusion`. No popular mayor contest, EPCI popular contest, guessed commune-nouvelle successor edge, or zero-filled missing result was invented for this landing.

`FR-EP` stays inside draft tier 1 (`national/EP`). It was not reclassified to `other`. Draft tiers 2 and 3 both project to schema `regional` while `draft_tier` still distinguishes them. PLM sector councils stay draft tier 4 (`municipal/PLM`) and were not moved to `other`. G20 stays open: these are not closed production IDs.

## Authoritative pack counts
- 35,112 current + 2,738 historical offices (37,850)
- Current by type: municipal 34,952; departmental 95; regional 14; single territorial 3; metropolitan 1; arrondissement/sector 34; overseas territorial 5; NC congress 1; provincial 3; national lower/upper 1+1; president 1; EP 1
- Historical by type: municipal 2,719; regional 18; single territorial 1
- Events 119,554; reporting units 173,409; results 1,193,657 (full pack; omitted from this slim land)
- Current overseas offices: 228
- Direct executive current: 1
- Draft tiers: T1 4 / T2 45 / T3 96 / T4 37,705
- Schema projection (no draft bucket split): national 4 / regional 141 / municipal 37,705 / other 0
- Full review ZIP SHA-256: `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9`
- Slim land attachment SHA-256: `0cd3af1b55ce18b6d0985fbd5c62fb91988a1037ddfe30e55b0e37ef77265498`
- Landed from main `bee1215e74e57609b15aed1c9788715ff15b0be1`
- Structural validation-report.json: PASS
- Predecessor draft tier SHA-256: `8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a`
- Approved tier file SHA-256: `727dd2d4152b46c65a77ec0fb73d606631dad2c567474fb61a12d7bd596a970a`
- Omitted `data/results.jsonl` SHA-256 (manifest only): `b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9`
- Omitted `data/events.jsonl` SHA-256 (manifest only): `dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03`
- Omitted `data/reporting-units.jsonl` SHA-256 (manifest only): `2a4fedbf8a111719eec65d4ec3bb4261ac2b9c16627adc8f3402d278f7d5b89d`

## Land slim notes
- `sources/` omitted (87 hashed captures listed in `SHA256SUMS` and `source-inventory.json`)
- `data/results.jsonl`, `data/events.jsonl`, and `data/reporting-units.jsonl` omitted. Counts above are the full-pack counts. Those rows are not in this PR and were not reconstructed
- `docs/phase1/france/SHA256SUMS` is the full-pack manifest, including omitted paths
- Documentary contract bytes are `contracts/Inherited_223_Column_Contract.md` and `contracts/columns.json` (no `*.ts`; `tsconfig.json` unchanged)
- `Justin_Report.md` stays the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- `validate.py` expects the pack root, including omitted results, events, reporting units, and `sources/`, and draft `justin_approved=false`. It is not an npm script and was not re-run after this accept-with-holds
- Per-office `review_status` stays `needs_review`. File status is `approved` with holds open

## Out of scope this land
- France `import:atlas` importer (no `lib/atlas/france/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=france` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
