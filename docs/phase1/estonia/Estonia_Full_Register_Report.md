# Estonia full register + historic returns — Prompt AF

DRAFT for Justin. Main pin **`f7b5c81ebd39f1774edea7cde5b4155031d92647`**. New primary-source research; no repository, importer, SQLite, VPS or UI changes (`applied_changes=0`). All tier and research approvals remain unchecked.

## Executive summary

**281 offices: 81 current + 200 historical**. Current scope is **78 municipal volikogu**, Riigikogu, the indirectly elected president and Estonia's EP delegation. Draft tiers across all rows: **278 municipal / 2 national / 1 other / 0 regional**. There are **464 historical cycle events, 24 presidential ballot proceedings and 49,504 candidate-result rows**. Current directly elected executive offices: **0**; 78 current councils and 1 indirect presidency. No mayor, county-governor, cabinet or Tallinn district office was invented.

The four official local election rosters contain **215 councils in 2013 (pre-reform election snapshot), 79 in 2017, 79 in 2021 and 78 in 2025**. The official 2025 roster names the Jõhvi–Toila merger. The 215 count is not asserted as the immediately-pre-2017 legal count. Different historical codes remain separate and no merger edges are guessed. The 200 historical rows are source-code identities, not a claim that 200 legally distinct councils were abolished; code-only changes remain a binding review. Source official names and diacritics are preserved.

Ordinary histories cover local 2013/17/21/25; Riigikogu 2015/19/23; EP2014/19/24. Presidential archive cycles 1992/96/ 2001/06/11/16/26 are included with exact ballot context; **2021 remains a named primary-source acquisition gap**. The real 1992 popular ballot is a transitional exception, followed by parliamentary choice; current presidency remains indirect.

Next Riigikogu 2027 and EP/local 2029 are sourced **year-only metadata**, not manufactured dated events. All offices/history remain irrespective of the 2026-09-08–2028-03-08 alert window. The 215 local 2013 events also preserve year precision pending explicit polling-day source binding.

Internal source-vector reconciliation passes for all 457 KOV/RK/EP events. One cross-source conflict remains: 2013 XML candidate totals 625,334 versus official general statistics 625,336. Both originals are retained without repair. Party/list summaries 2,999 are nonadditive retained inputs, not extra results. Completeness of mapping is not research completeness; legal_outcome stays unknown pending certification reconciliation.

## Scope and evidence

| Layer | Current | Historical | Tier draft | Evidence |
|---|---:|---:|---|---|
| Municipal councils |78|200|municipal|[Official open data](https://www.valimised.ee/en/archive/open-data-estonian-elections); KOV municipality-level XML + EHAK code/name |
| Riigikogu |1|0|national|RK source return XML, nationwide body |
| President |1|0|national|[Official presidential archive](https://www.valimised.ee/en/archive/president-republic-estonia-elections/president-republic-estonia-elections); indirect rounds |
| EP delegation |1|0|other|EP source XML; Justin EP-tier review |
| County / regional bodies |0|0|none|Statistical grouping does not create elected office |

Current roster input: [KOV 2025 metadata](https://opendata.valimised.ee/api/KOV_2025/metadata.json) joined to78 detailed municipal returns; ignore linnaosa metadata as separate offices. [Jõhvi official merger material](https://www.johvi.ee/vald-uudised-ja-kontakt/valla-info/uhinemislabiraakimised/) retained. Full source inventory: 223 successful URL sources plus 923 original archive members, each checksummed.

## Historic depth

| Cycle | Events | Candidate result rows | Proceedings |
|---|---:|---:|---:|
|EP_2014|1|88|0|
|EP_2019|1|66|0|
|EP_2024|1|78|0|
|KOV_2013|215|14784|0|
|KOV_2017|79|11804|0|
|KOV_2021|79|10025|0|
|KOV_2025|78|9665|0|
|PRES_1992|1|6|2|
|PRES_1996|1|13|5|
|PRES_2001|1|12|5|
|PRES_2006|1|5|4|
|PRES_2011|1|2|1|
|PRES_2016|1|16|6|
|PRES_2026|1|1|1|
|RK_2015|1|872|0|
|RK_2019|1|1099|0|
|RK_2023|1|968|0|

## Open gates and approval

Named holds EE-G01–09: historical EHAK/legal successor bindings, pre-2013/special history, 2021 presidential returns, mayor-selection legal text, EP tier/replacements, archive certification and 2013 global total conflict, partial dates, Jõhvi transition, and nonadditive/missing-field interpretation. See `Estonia_Research_Gaps.md` and exact 202-row focused review queue. No automated clearances.

Draft tier SHA-256: `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`.223 destination columns mapped; complete identity vectors included. Package validator checks research integrity and checksums only; all importer/publication CI is **Not run**.

- [ ] Justin accepts/amends the sourced register and historical scope.
- [ ] Justin approves draft tier classifications, including EP convention.
- [ ] Justin accepts/amends each named research hold; no implied blanket clearance.
- [ ] Justin authorizes later implementation in a separate task.
