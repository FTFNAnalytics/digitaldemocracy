# Independent review — Peru Prompt BK (2026-11-09, America/Edmonton)

**Verdict: PASS with holds**

## Validator
`python3 validate.py` on the full pack: **PASS**, **2631** checks. Limitation stated by the pack: integrity and documentary scope pass; historical completeness and certification are not asserted. `justin_approved=false`, `applied_changes=0`.

## Counts (file-verified)
| Metric | Value |
| --- | ---: |
| Office rows | 3841 |
| Current / historical | 3840 / 1 |
| Current research accepted / held | 3838 / 2 |
| National / regional / provincial_municipal / district_municipal accepted | 4 / 50 / 392 / 3392 |
| Draft tiers (national_context / regional / municipal) | 5 / 50 / 3786 |
| Direct executives / councils / chambers+Andean | 1918 / 1917 / 3 |
| Ticket components (not independent ballot offices) | 27 |
| Documentary events / results | 12460 / 97260 |
| Certified events / results (2026 JNE proclamations) | 6 / 197 |
| Results with votes / missing_or_incomplete_do_not_zero | 97152 / 108 |
| EP / MERCOSUR offices | 0 / 0 |
| Parlamento Andino (popular delegation body) | 1 |
| Upcoming calendar rows | 18 |
| Successor edges | 0 |
| Source inventory rows | 318 |

Held offices (Sangani, Law 32729; first election undetermined): `pe-district-120307-mayor`, `pe-district-120307-council`.

## Required deliverables vs Prompt BK
All required pack artifacts present: README, Justin report, office register, draft tiers 1:1, events/results, 223-col field map, identity rules, ≥15 acceptance examples (34), source inventory+hashes, research gaps, SHA256SUMS+validator, `Peru_Upcoming_Elections.md` + `upcoming_calendar.json`. Stub filter rescinded. EP=0. Andean popular seats included. Full provincial+district municipal inventory. Calendar families beyond ~18-month window present with formulas / holds.

## Invented / unsourced data
No invented offices, EP/MERCOSUR seats, guessed successor edges, snap dates, or zero-filled incomplete votes observed. Quarantined catalog defects documented (BK-G10). October 2026 ERM results explicitly untranscribed (BK-G17), not represented as zero.

## Holds left open (pack IDs BK-G01–BK-G18; not PE-G*)
BK-G01 Historical breadth · BK-G02 Bicameral restoration · BK-G03 Presidential runoff and succession · BK-G04 Regional popularization / labels · BK-G05 Lima / Callao · BK-G06 Full territorial inventory / Sangani · BK-G07 Pion / repeat / nullity · BK-G08 Identity crosswalk and reform gate · BK-G09 Official data versus certified returns · BK-G10 Catalog and source identity defects · BK-G11 Primaries · BK-G12 Centros poblados · BK-G13 Andean / noEP / noMercosur · BK-G14 Calendar beyond alert window · BK-G15 Remaining transcription · BK-G16 223-column target contract · BK-G17 October 2026 results and certification coverage · BK-G18 Regional runoff formal call and regions.

## Justin decisions still required
1. Accept scope / identities / tiers / history / calendar (six unchecked boxes).
2. Confirm slim land (0 events/results/sources in git) vs later full-ZIP server import for history.
3. Confirm Sangani remains held until a sourced first-election date.
4. Confirm October 2026 ERM results stay out until a refresh pack transcribes them.
5. Confirm centros poblados stay submunicipal-hold (no 6,796 invented office rows).
