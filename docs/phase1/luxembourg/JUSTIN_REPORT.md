# Justin report — Luxembourg Prompt AO

Research and documentation only. **applied_changes=0**. No importer, SQLite, VPS, UI or repository changes.

## Count summary

| Measure | Count |
|---|---:|
| Current offices | 102 |
| Historical offices | 28 |
| Office-cycle events/returns | 438 |
| Result observations | 48197 |
| Rows with numeric vote counts | 48033 |
| Uncontested candidate return rows (no numeric vote) | 159 |
| Current communal councils | 100 |
| Historical communal councils | 28 |
| Direct executive offices | 0 |
| Elected regional offices | 0 |
| Current Parliament / EP assembly | 1 / 1 |
| Source captures | 388 |

Draft tiers, all 130 offices: municipal 128, regional 0, national 1, other/EP 1. Current-only tiers: municipal 100, national 1, other 1.

## Communal history coverage

| Cycle | Councils with returns | Candidate rows | List rows |
|---|---:|---:|---:|
| 2005 | 116 | 3198 | 162 |
| 2011 | 106 | 3319 | 188 |
| 2017 | 102 | 3575 | 202 |
| 2023 | 100 | 3846 | 241 |

Current commune names match the government's Geoportail register (100/100; synchronized 20 September 2026). Historical cycles use their own territorial footing. 2011 and 2017 returns for incoming merged councils are not backwards-projected to current boundaries without source evidence. The 28 predecessor council identities are retained with explicit merger links.

National and EP source history covers the portal's 1994–2024 election series: seven parliamentary cycles (1994, 1999, 2004, 2009, 2013, 2018, 2023) and seven EP cycles (1994, 1999, 2004, 2009, 2014, 2019, 2024). For 1994, returns are available at communal reporting-unit level; these are components of national contests, not new communal office contests. EP constitutive seat allocations are separate observations. Later returns include full candidate/list vectors at relevant national or constituency level.

**Rows are not independent elections or unique people.** Counts include candidate and list rows, plus national and constituency observations. The 1994 geographic detail contributes many rows and must not be compared directly with later national totals. Do not double-count voting observations or interpret panachage votes as individual voters. EP candidate figures for 1994/1999/2004 are explicitly labelled nominative votes excluding list votes; later candidate figures use a different basis.

## Material limitations

This is full current-register coverage and full extraction of the four supplied ordinary communal-cycle archives, not a claim to have completed every election since Luxembourg's founding. Supplemental/by-elections after underfilled uncontested returns are not exhaustive. Most returns are labelled unofficial by the official publisher. The 1994 Grevenmacher EP page omits the LSAP block, so no complete national aggregate is asserted. Older certified parliamentary seat-vector reconciliation, pre-1994 national/EP history and pre-2005 communal history remain explicit gaps. No missing data is silently zero-filled. The validator checks integrity and documented invariants, not universal historical completeness.

Berdorf's postponed October 2023 return was checked against the commune's proclamation (15 candidates, nine elected). Original PDF direct download failed; retained evidence is a web extraction verified visually, clearly labelled as such.

## Justin approvals

- [ ] Accept office identities and historic boundary distinctions
- [ ] Accept draft tiers
- [ ] Accept result semantics and source-status limitations
- [ ] Accept field map and identity rules
- [ ] Authorize any later implementation/import

All boxes intentionally unchecked.
