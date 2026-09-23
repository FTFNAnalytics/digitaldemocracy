# Lithuania full-register review — Prompt AH (DRAFT)

**123 current offices; 0 recovered historical-only offices; 30 historic events; 130 result claims.** The current roster covers all 60 municipalities listed by the Lithuanian municipalities association:60 councils and 60 direct mayors, plus Seimas, the directly elected presidency and Lithuania’s EP delegation. **Historical coverage is partial, and the extinct-office universe is unresolved.** Zero recovered historical-only offices does not establish that none existed.

Pinned `FTFNAnalytics/digitaldemocracy` main: `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33` (retrieved 2026-09-21). Research files live under `data/research/lithuania/`; handoff documents under `docs/phase1/lithuania/`. This is new research, not a revision of frozen Europe inputs.

| Register scope | Current | Historical-only recovered | Draft tier |
|---|---:|---:|---|
| Municipal councils |60|0|municipal|
| Directly elected mayors |60|0|municipal|
| Seimas |1|0|national|
| President |1|0|national|
| EP delegation |1|0|other|
| **Total** |**123**|**0**|**120 municipal /2 national /1 other /0 regional**|

**61 direct executives** =60 mayors+1 president; **62 councils/parliamentary bodies** =60 councils+Seimas+EP. Mayor and council are separate offices; appointed directors/deputies and the prime minister are excluded. The alert window filters alerts only. All 123 offices remain with unknown next dates; no future ballot day is inferred from a term length.

| Historic source coverage | Events | Result claims | Limits |
|---|---:|---:|---|
| EP 2004/2009/2014/2019/2024 |5|51|Published party/aggregate shares and seats;2004 seats only; votes absent|
| Seimas 2008/2012/2016/2020/2024 |5|49|Seat summaries;2020 PR votes;2024 occurrence only;2012 subtotal 139 retained|
| President 2019 |1|11|Two rounds;11 percentages disputed due to denominator inconsistency|
| Municipal mayors 2019 |19|19|Winner observations only;19/60 mayors;0 complete candidate vectors|
| Municipal council returns |0|0|Unrecovered, not zero results or absent offices|

There are 25 proceeding records (rounds); they are children of 30 cycles, not 25 extra elections. All five EP seat vectors reconcile to supplied totals,2020 PR votes reconcile to 1,133,561, and both 2019 presidential candidate sums reconcile to valid-vote totals. These arithmetic checks do not resolve the presidential denominator conflict or certify all legal outcomes.

Primary foundations: [LSA municipal roster](https://www.lsa.lt/nariai-savivaldybes/), [current Local Self-Government Act](https://e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/), [Seimas 2020 official history](https://www.lrs.lt/sip/portal.show?p_r=40554&p_k=2), [EP official summaries](https://results.elections.europa.eu/en/national-results/lithuania/2024-2029/), and [ODIHR 2019 report](https://odihr.osce.org/sites/default/files/f/documents/a/e/433352.pdf). Exact retained bytes, hashes and row/page locators are in the inventory and research origins. VRK access failures are recorded; schema catalogues do not substitute for result records.

**Open gates:** full municipal candidate/list returns; historical territorial identities/mergers; mayoral-law/cycle transitions; older/latest presidential results;2019 denominator and invalid-ballot conflict; Seimas mixed-grain/repeat binding; EP detail; party identities; future calls/certification. Full-register historic research is not certified complete. See `Lithuania_Research_Gaps.md` for explicit closure criteria.

Draft tier SHA-256: `43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39`. All Justin acceptance boxes remain unchecked. Package validation checks documentation/data integrity only; importer/SQLite/VPS/UI execution is **Not run**, `applied_changes=0`.

- [ ] Justin accepts the sourced current register with named holds.
- [ ] Justin accepts the proposed tiers.
- [ ] Justin accepts recovered histories with their exact limitations.
