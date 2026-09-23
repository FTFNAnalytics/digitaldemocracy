# Justin report — Malta Prompt AP

Research/documentation only. **applied_changes=0**. The requested current office register and bounded historical return series are delivered; historical coverage is not claimed exhaustive.

## Counts

- current_offices: 213
- historical_offices: 2
- events: 223
- results: 4084
- numeric_first_preference_rows: 4050
- stv_count_observations: 64204
- current_local_councils: 68
- malta_local_councils: 54
- gozo_local_councils: 14
- historical_local_council_rows: 0
- historical_gozo_civic_council_rows: 1
- current_mayors: 68
- current_deputy_mayors: 68
- current_indirect_regional_presidents: 6
- standalone_direct_executive_offices: 0
- all_draft_tier_histogram: {'municipal': 204, 'regional': 8, 'national': 2, 'other': 1}
- source_inventory_entries: 1144
- distinct_source_files: 1139
- applied_changes: 0

Current office breakdown: 68 councils, 68 mayors, 68 deputy mayors, six indirectly elected regional presidents, House, President of Malta and EP delegation. The two historical offices are the Gozo Civic Council and its presidency. There are **zero standalone directly elected executive contests**. Mayors/deputies use the conditional council-ballot-derived or council-selected mechanism; this count does not erase those 136 offices.

## Council history

| Cycle | Council returns | Candidate result rows |
|---|---:|---:|
| 2013 | 34 | 365 |
| 2015 | 34 | 378 |
| 2019 | 68 | 726 |
| 2024 | 68 | 707 |

Six House cycles: 2003, 2008, 2013, 2017, 2022, 2026, each with all 13 district reporting units. Five EP cycles: 2004, 2009, 2014, 2019, 2024. Indirect presidential returns: 2019 and 2024. Northern and Gozo regional-list outcomes: 2021. Historic Gozo election/selection: 1961. Two additional-seat proceedings: 2026.

Results count measures first-preference candidate observations, uncontested returns, selected indirect outcomes, additional-seat awards and EP corroboration rows. STV count observations are a separate table and are not added to that result count. Derived party aggregates must not be added to candidate ballots. Post-election card annotations are retained separately and do not imply a complete casual-election/certification audit.

## Validation and remaining review

Run `python validate.py` from the extracted pack (Python standard library only). It checks hashes, references, the 223-column contract, office/tier equality, original elected-seat totals, all first-count balances, source capture coverage, no-poll semantics and approval protection. `validation-report.json` records the executed result. The validator self-test demonstrates rejection of a broken event reference, a changed approval flag and a corrupted source file.

Research gaps remain explicit: earlier local cycles/boundary instruments, numeric indirect tallies, regional sole-nominee declarations, historic Gozo full returns, and exhaustive casual/court/EP replacement proceedings. The 18-month window filters alerts only; it does not filter this register/history.

## Justin approvals

- [ ] Scope and current office register accepted
- [ ] Historical coverage and gaps accepted
- [ ] Indirect / derivative executive mechanisms accepted
- [ ] Draft tiers accepted
- [ ] Identity and territorial rules accepted
- [ ] 223-column mapping accepted
- [ ] Source evidence and validation accepted
- [ ] Publication/import/deployment approved

All approval boxes remain unchecked. No operational action is proposed as already executed.

