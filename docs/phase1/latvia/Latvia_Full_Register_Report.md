# Latvia full-register review — Prompt AG (DRAFT)

**45 current offices:** 42 local councils, Saeima, indirectly elected President and one EP delegation. **121 historical source-identity records** are retained separately. These are **not 121 abolished councils**: 119 are the entire 2017 snapshot awaiting legal cross-epoch deduplication, plus 2021 Madona and Varakļāni. Full current register coverage is verified; historical identity and research completeness remain explicitly open.

Pinned `FTFNAnalytics/digitaldemocracy` main: `f7b5c81ebd39f1774edea7cde5b4155031d92647` (2026-09-21). New research lineage `country-package-latvia`. Repository/importer/SQLite/VPS/UI `applied_changes=0`; no production approvals.

| Scope | Current | Historical identity records | Proposed tier |
|---|---:|---:|---|
| Local councils |42|121|municipal|
| Saeima |1|0|national|
| President |1|0|national; indirect Saeima ballot|
| EP delegation |1|0|other, review|
| Total |45|121|163 municipal /2 national /1 other /0 regional|

**217 events:** 216 historical +1 announced prospective Saeima event. **1,383 result rows**, 2 presidential proceedings. Direct popular executive offices: **0**. Current municipal councils: 42; council chair is council-elected, executive director appointed. Regional navigation and planning bodies do not become offices.

The 2017 CVK roster contains 119 councils, explicitly a 2017 snapshot, not the immediately-pre-2021 legal count. Post-reform observations total 43: 40 June 2021 contests, two September 2021 contests and Riga elected in 2020. The current 2025 election roster has 42 councils: seven state-city councils and 35 novadi. Ten places have state-city status, but that is not ten independent city councils. No guessed merger/successor edges. Primary territorial law and preserved originals support the distinction.

History includes complete list vectors for 2017/2021/2025 local cycles, Riga 2020, Saeima 2014/2018/2022 and EP 2014/2019/2024. All 210 vectors reconcile to their supplied valid ballots; candidate preference/station/district data are retained raw, not counted again. Presidential 1993/1996/1999/2003/2015/2023 evidence is partial, with actual support results only where recovered. No full presidential ballot-universe claim.

Only next Saeima 2026-10-03 is emitted as a real announced future event. Unknown/out-of-window local and EP next dates never drop their offices/history. PRES2003 is year-only. Missing seat cells stay NULL; explicit 0 stays 0.

**Open gates:** LV-G01 historical legal identity consolidation; pre 2017/deeper special histories; complete presidential protocols; EP mandate details; certification/repeats; seven conflicting 2022 percentage claims. All original values and competing claims retained; no numeric alternate accepted. Package integrity PASS does not authorize import or assert complete research.

Primary evidence: [CVK 2025 results](https://dati.cvk.lv/PV2025/velesanu-rezultati/), [2017 CVK open data](https://data.gov.lv/dati/dataset/2017-gada-republikas-pilsetas-domes-un-novada-domes-velesanu-rezultati-un-veletaju-aktivitate), [territorial law](https://likumi.lv/ta/id/315654-administrativo-teritoriju-un-apdzivoto-vietu-likums), [local-government law](https://likumi.lv/ta/id/336956), [presidential mechanism](https://www.president.lv/en/election-president-latvia). Every retained file is hashed in the inventory.

- [ ] Justin accepts the current register and scope.
- [ ] Justin resolves/accepts named historical identity holds.
- [ ] Justin approves draft tiers and separately adjudicates disputed claims.
