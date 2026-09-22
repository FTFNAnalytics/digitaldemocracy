# Justin report — Greece rebuilt research

The former pack contained only 17 selected result rows and no municipal/regional numeric vectors. It did not satisfy the historical-results request. This rebuild supplies all authority vectors and all published head-candidate/slate rows from the 2010, 2014, 2019 and 2023 Ministry archives, retains five abolished municipalities, and adds evidenced presidential and national history.

| Measure | Count |
|---|---:|
| Current offices | 693 |
| Historical offices | 10 |
| Office-cycle events | 2,774 |
| Proceedings | 3,555 |
| Office result rows | 14,004 |
| Distinct source result observations | 8,021 |
| Authority-cycle vectors | 1,366 |
| Observed local/regional runoffs | 781 |
| Hashed source artifacts | 2,807 |
| Open local source holds | 14 |
| Mapped contract columns | 223 |
| Applied changes | 0 |

Current regional offices: 13 councils + 13 directly elected governors = 26. Current municipal offices: 332 councils + 332 directly elected mayors = 664. Other current offices: Parliament, the indirectly elected President and the EP delegation = 3. Historical offices: five councils + five mayors = 10. Current direct executives = 345; historical direct executives = 5. Current subnational councils = 345; adding Parliament gives 346; EP is separately identified.

Draft tiers, all 703 offices: municipal 674; regional 26; national 2; other/EP 1. Current-only histogram: municipal 664; regional 26; national 2; other/EP 1. Exactly one draft tier exists per office; none is accepted.

The current register and four local-cycle authority denominators reconcile completely. Historical numerical coverage remains qualified: ten earlier parliamentary cycles have seat winners only, early EP exact votes and the 1981 return remain missing, and early presidential biographies do not provide all ballots. There are 14 local source holds, comprising 13 regional reporting-denominator discrepancies in 2019 and the tied/incompletely allocated Messini 2014 return. These are concrete source issues, not suppressed or zero-filled data.

The 2004 national vector was added from the Ministry's 2006 printed results volume. The 1993 malformed English KKE vote cell is resolved from the independently retained Greek Parliament table. Modern Ministry snapshots and Parliament's compilations can differ; comparison evidence is preserved without creating duplicate elections. All numerical claims point to retained files and locators.

`applied_changes=0`; production acceptance is false. No importer/SQLite/VPS/UI/repository change, ingest attempt, live tier write, release or publication was performed. The SQL contract was read and copied solely to document its 223 columns. Research scripts and validator operate on this separate deliverable.

- [ ] Justin accepts the current office register
- [ ] Justin accepts the historical office identities
- [ ] Justin accepts draft tiers
- [ ] Justin accepts the indirect presidential treatment
- [ ] Justin reviews source conflicts and outstanding historical gaps
- [ ] Justin authorizes any future implementation

Every box remains unchecked. This report requests no automatic implementation.
