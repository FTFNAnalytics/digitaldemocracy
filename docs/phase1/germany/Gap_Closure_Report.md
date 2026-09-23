# Germany gap-closure report

Research as of 23 September 2026. The earlier incomplete pack has been materially extended and corrected. **The full requested Germany scope remains incomplete.** No office identities or numerical returns were manufactured to claim completion. `applied_changes=0`; all Justin approvals remain unchecked.

| Measure | Previous pack | Revised pack | Change |
|---|---:|---:|---:|
| Current offices | 20,892 | 21,960 | +1,068 |
| Historical-only office identities | 664 | 670 | +6 |
| Event / ballot versions | 8,651 | 13,845 | +5,194 |
| Reporting units | 41,305 | 47,762 | +6,457 |
| Result records, including metrics | 1,225,652 | 1,299,670 | +74,018 |
| Current direct executives | 9,548 | 9,585 | +37 |
| Current local councils / assemblies | 11,325 | 12,356 | +1,031 |
| Retained source files | 232 | 5,073 | +4,841 |

## Completed additions and corrections

| Gap addressed | Delivered evidence and disposition |
|---|---|
| Indirect presidential history | All 17 Federal Conventions, 1949–2022, and 26 ballot events. Bundestag's official historical PDF supplies candidates, explicit No option where present, abstentions and invalid ballots; no popular presidential electorate. |
| NRW borough councils | 141 current Bezirksvertretungen across the 23 cities, with 2025 vote/seat returns. The source's five current Krefeld boroughs are used. Sources: nw2025-heft3.pdf and nw2025-heft4.pdf. |
| Saxon local representative bodies | 853 Ortschaft councils and ten Dresden borough councils, with source ORS keys and consolidated 2024 returns. Individual later repeat dates stay unresolved instead of being assigned the ordinary-cycle anchor. Source: sn2024-ortschaft-results.xlsx, sn2024-ortschaft-seats.xlsx, and Dresden's official election gazette. |
| Munich borough councils | All 25 Bezirksausschüsse and 2026 whole-borough returns, from the municipal result archive and seat CSV. |
| Schleswig-Holstein direct mayors | Increased verified current offices from 49 to 86 using official municipal election notices, results, statutes and office-mode pages. This is an expanded verified subset. |
| Inhabited non-municipal districts | Lohheide and Osterheide elected inhabitants' councils added, correcting the blanket non-municipal exclusion. Future announced seat counts are labelled with the 1 November 2026 term start. No administrative-head popular office invented. |
| Brandenburg local history | 413 municipal council returns; Hirschfeld March 2024 date and the September Bad Liebenwerda / Cottbus repeats preserve source-specific variants. |
| Rheinland-Pfalz local history | 4,724 raw election endpoints retained with dispositions, producing 2,668 sourced root ballot records across local council/executive classes. Nested reporting areas are not extra offices. Two unidentified candidate returns remain quarantined. |
| NRW local history | All published 2025 district-member council tables and municipal/Kreis executive tables normalized where the source supplies a contest. Comparison periods remain separate; a no-election heading is not an election. |
| Earlier Land history | 256 dated compilation event versions from 1946 onward, including six source-established historical body identities and explicit historical territorial footprints. Later source returns remain separate. |
| Hamburg date conflict | Duplicated 1991 heading resolved to 19 September 1993 using two independent official dated sources. The original panel is retained. The distinct 1987 and 1991 tables remain separate events. |
| MV 2026 retrieval gap | Official preliminary first-/second-vote totals recovered from the September 21 press annex and reconciled independently. Complete final allocation and detailed constituency returns remain unresolved. |
| Territorial relationships | 133 official change rows; 26 source-coded whole-unit relationships involving retained historic council codes. Both effective-date fields and publication locators are preserved. No office continuity is asserted. |

## Corrections that deliberately withhold numbers

The expanded Land extraction revealed 15 incompatible printed seat panels, including some post-1990 tables present in the earlier pack. The dated tables and the publication's comparison section disagree. Normalized seats for all 15 panels are now null; raw observations from both sections remain available in `historical-source-discrepancies.json` and the source PDF. Bavaria 1950 additionally repeats incompatible party labels, so its normalized contestant votes are withheld. A matching arithmetic sum inside one table cannot determine which source values are correct.

The two RP endpoints without candidate identities contain small numeric tallies whose electorate cannot safely be assumed. They do not create popular-contest events. In 1,498 RP ballot units, published candidate rows do not cover every valid ballot choice; in 180 units, source party seats do not cover the stated council size. These have explicit partial-coverage gates and null reconciliation targets. No No votes, write-ins or vacant seats are back-solved. Source-specific NRW dash-as-zero semantics are documented; this exception does not turn other missing values into zero.

## Remaining work required for full scope

| Remaining gate | Concrete missing evidence / access limitation | What is already preserved |
|---|---|---|
| SH executive modes | 991 municipality-mode classifications remain unresolved, largely because a complete current statute/cooperation roster was not established. This does **not** mean 991 additional direct mayors exist. | One disposition per all 10,747 municipalities; 86 verified SH direct mayors and 27 SH assembly-selected exceptions. |
| Elected subdivisions outside completed classes | Named rosters and applicable current statutes remain incomplete for BW, BB, HE, NI, RP, SL, ST and TH, including directly elected local leaders where applicable. | BB official 2024 counts: 1,317 Ortsbeiräte and 344 directly elected Ortsvorsteher. NI's 2026 election notice lists 1,095 subdivision bodies, with the new term starting November 1. RP subdivision results rely on local publishers; SL's local result index is retained. TH's retained catalogue offers a paid 2022 brochure but no free complete current roster in the observed listing. Counts are not fabricated name lists. |
| Conflicting historical seats and labels | Independent original returns for the exact 15 seat-conflict dates and Bavaria 1950 party labels. | Both conflicting published observations and a machine-readable discrepancy list. |
| Berlin 2026 exports | Corrected official exports and final-status evidence. Files linked as 2026 contain 2021 dates. | Original bytes, hashes and an explicit quarantine; no reassigned 2026 numbers. |
| Source labels / detailed returns | Three unresolved Bavarian nomination columns; two RP candidate-identity endpoints; missing candidate/No/seat details; final MV 2026 and other certification records. | Explicit source-level or unit-level gates; missing remains null. |
| Historical depth and legal continuity | Earlier local cycles across many Länder; remaining retired-code reform acts; actual Saxon local repeat dates; current versus later effective territorial changes. | Source-vintage identities, 26 narrow territorial relations, election-era footprints, and per-office history coverage. No GDR office is current. |

No paywall was bypassed and no purchase was made. These gaps require additional authoritative source collection; none is treated as zero, a negative legal finding, or an approval.

## Integrity and review

The revised pack retains all required artifact classes: README, office register, exactly one draft tier per office, events/results, inherited 223-column field map, identity rules, 51 acceptance examples, source inventory with 5,073 byte hashes, named research gaps, SHA256SUMS, read-only validator and Justin report. The final validator report supplies the frozen PASS/FAIL outcome. The numerical audit records 52,793 checks and zero arithmetic exceptions, limited to comparable sourced values; it does not certify withheld values or full scope.

- [ ] Justin approves the expanded office register.
- [ ] Justin approves the draft tiers and historical normalization.
- [ ] Justin resolves or accepts the remaining scope and source gates.
- [ ] Justin separately authorizes any implementation or publication.
