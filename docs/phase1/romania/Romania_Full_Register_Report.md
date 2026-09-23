# Romania full-register review report — Prompt AL

**Accepted with named holds; no importer.** Landed from main `1729e321ab31a5922d8ef7fb66236319511ddeda`. Approved tier bytes SHA-256 `0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04` (predecessor draft `eb64c80668c2f079f33bbfeee765aa63948143f4d273371caa3e35a52ee005ce`). Importer/SQLite/VPS/UI applied_changes=0.

## One-page review summary

The pack enumerates **6,460 current offices**, **0 historical-only offices**, **19,343 evidenced event records**, and **23 national/EP result rows**. The 2025 SIRUTA hierarchy supplies the current register. The office universe is not filtered by the ~18-month alert window. Missing local numeric vectors stay absent. That absence is unknown, never zero.

| Scope | Offices | Proposed tier / mechanism |
|---|---:|---|
| Ordinary local UAT councils | 3180 | municipal |
| Ordinary local UAT mayors | 3180 | municipal; direct |
| Județ councils | 41 | regional |
| Județ presidents | 41 | regional; direct under current law; 2016 was council investiture |
| Bucharest sector councils | 6 | municipal |
| Bucharest sector mayors | 6 | municipal; direct |
| Bucharest General Council | 1 | regional |
| Bucharest general mayor | 1 | regional; direct |
| Camera Deputaților | 1 | national |
| Senat | 1 | national |
| President | 1 | national; popular election |
| Romania EP delegation | 1 | other; `tier_uncertain`; `direct_election=false` as supplied |

**Direct-executive offices: 3,229. Council/assembly offices: 3,230.** Draft tiers: **6,372 municipal / 84 regional / 3 national / 1 other**. No prefect, prime minister, or cabinet row. No neighbourhood board. No successor or merger edge.

The 2024 presidential first round (`RO-PRES-2024-R1`, 2024-11-24) is retained with status `annulled`. It is not a predecessor of the 2025 rerun. County-president events exist for 2020 and 2024 only (41 + 41). There is no 2016 county-president popular event.

Result rows are limited to `RO-SEN-2024` (7), `RO-CD-2024` (7), `RO-EP-2024` (7; seats sum to 33), and `RO-PRES-2025-R2` (2). Parliamentary seat cells in those rows are null. EP vote cells are null. Local 2016/2020/2024 candidate and list vectors are not in this land.

## Open holds

RO-G01 local-results; RO-G02 president full vectors and 2024 annulment handling; RO-G03 county-president legal text and returns; RO-G04 Bucharest sector circumscription identifiers; RO-G05 EP 2014/2019; RO-G06 territorial history; RO-G07 parliament detail. None is closed here.

Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).
