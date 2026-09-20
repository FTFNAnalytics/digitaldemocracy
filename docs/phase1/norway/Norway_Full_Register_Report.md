# Norway full-register handoff — Prompt AA / DRAFT

## One-page executive

Main pin **`a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`**; source capture **20 September 2026**. The pack contains **389 current + 537 historical jurisdiction records**, **10,777 observed election cycles** and **59,033 result rows**. Draft tiers over all 926 offices: **876 municipal / 32 regional / 1 national / 17 other**. No repository, importer, SQLite, VPS or UI changes: `applied_changes=0`. Justin's approval boxes remain unchecked.

Current coverage is **357 kommunestyrer**, **14 separate fylkesting**, **Stortinget**, **Sámediggi**, **15 Oslo bydelsutvalg**, and **Longyearbyen lokalstyre**. SSB lists 15 counties, but Oslo's municipal council also exercises county functions and is counted once. No popular mayor, cabinet/PM or EP contest is invented. The extra borough and Longyearbyen bodies are directly evidenced, not inferred from statistical areas. [SSB municipality classification](https://data.ssb.no/api/klass/v1/classifications/131/codesAt?date=2026-09-20&language=nb), [SSB county classification](https://data.ssb.no/api/klass/v1/classifications/104/codesAt?date=2026-09-20&language=nb), [Oslo governance](https://www.oslo.kommune.no/politikk/slik-styres-oslo/), [Longyearbyen governance](https://www.lokalstyre.no/selvbetjening/politikk/politisk-organisering).

History spans municipal **1945–2023**, county **1975–2023**, Storting **1945–2025**, and Sámediggi **2005–2025**. The 537 historical records are sourced jurisdiction versions, **not a count of independently verified legal abolitions**. 356 eligible same-name one-to-one municipal code changes are treated as aliases; mergers/splits remain explicit source claims without invented successor links. Borough and Longyearbyen result histories remain named gaps. [SSB municipal series 01180](https://www.ssb.no/en/statbank/table/01180/), [county series 01181](https://www.ssb.no/en/statbank/table/01181/), [Storting series 08092](https://www.ssb.no/en/statbank/table/08092/), [Sami series 05924](https://www.ssb.no/en/statbank/table/05924/).

The called municipal/county date **13 September 2027** is next-election metadata. Storting/Sami **2029** is an explicitly expected four-year-cycle year, with no invented day. Longyearbyen's next date remains unknown here. The alert window excludes none of these offices or histories. [Official 2027 call](https://www.valg.no/nyheter/siste-nytt/valgdagen-blir-13.-september-2027).

County votes are **disclosed sums of official municipal reporting components**, requiring county protocol/geography reconciliation before certified claims. National/Sami seats are disclosed sums of disjoint source cells. All event legal outcomes remain **unknown**, preserving published statistical returns without inventing certification/annulment chronology. A Sami 2025 party-code conflict (98d: zero votes, one seat) is marked **disputed**, unchanged from its separate source claims. No numeric correction or substitute party code is selected.

## Verified scope and historic depth

| Body | Current | Historical versions | Events | Result rows | History |
| --- | --- | --- | --- | --- | --- |
| county_council | 14 | 18 | 222 | 2366 | 1975–2023 (13 cycles) |
| municipal_council | 357 | 519 | 10528 | 56221 | 1945–2023 (21 cycles) |
| borough_committee | 15 | 0 | 0 | 0 | Not acquired |
| national_parliament | 1 | 0 | 21 | 349 | 1945–2025 (21 cycles) |
| sami_parliament | 1 | 0 | 6 | 97 | 2005–2025 (6 cycles) |
| special_local_council | 1 | 0 | 0 | 0 | Not acquired |


Tier counts include historical offices; current tier counts are 357 municipal, 14 regional, 1 national and 17 other. Oslo's county function is documented without double counting. Sámediggi, the borough committees and Longyearbyen are proposed other for Justin review. Norway's European Parliament participation is **not applicable**, not a missing zero-seat office. Appointed/council-selected executives are excluded; no office is created from a referendum instrument.

## Source interpretation and completeness

Every original source response, POST query, metadata object and referenced page is retained with a hash. Historical cycles use source year precision. Votes and seats enrich one cycle; national/district reporting components do not multiply offices. Common/local/other list categories remain source groupings rather than invented party identities. All-zero structural municipality/year cells do not create elections. No margins, forecasts or tightness measures are manufactured.

Missing versus reported-zero scalar counts: | Field | Missing | Reported zero |
| --- | --- | --- |
| votes | 0 | 1 |
| share | 58587 | 62 |
| seats | 37462 | 2310 |


A present source zero is preserved. An absent seat match or percentage remains NULL. A conflict stays visible even if a scalar is numerically within domain. Aggregate-audit.json reports observed sums without presenting them as certified totals. Full current-register coverage does not imply complete historical, candidate-level or legal-outcome coverage.

## Open gates

| Gate | Required research |
| --- | --- |
| SAMI-2025-ZERO-VOTE-SEAT-98d | SSB whole-country vote cell is zero while the same party code has a positive elected-member sum. Preserve both claims; primary protocol reconciliation required before treating this vector as reconciled. |
| REFORM-2020-2024 | Official Klass change records retained verbatim. Only same-name one-to-one renumberings form aliases. Many-to-one/one-to-many claims are not Atlas successor links. Same-code boundary continuities and older reform records require legal review. |
| OSLO-BOROUGH-HISTORY | 15 directly elected bydelsutvalg included as other. Their election returns and pre-2004 borough predecessors are not supplied by the acquired municipal council cubes; do not reuse municipal or Storting polling-district results. |
| LONGYEARBYEN-HISTORY | Local council is evidenced as directly elected; current 2023–2027 party composition is retained raw, not promoted to election results without election protocol. Acquire 2023/2019/2015 protocols and earlier elected local-council history. |
| LEGAL-STATUS-REPEATS | Statistical series do not establish each certified/preliminary/annulled/repeated chronology. All event legal_outcome values remain unknown; published statistical returns are not relabelled certified. Obtain electoral protocols, before asserting any separate repeated proceeding. |
| COUNTY-AGGREGATES | County votes are disclosed component sums using source municipality-code prefixes. Reconcile against county electoral protocols and precise election geography, especially 2019/2023 reform cycles. No source total invented; shares remain NULL. |
| SAMI-OLDER-HISTORY | Sámediggi current assembly and 2005–2025 returns supplied. Earlier elections, candidate-level histories, and 2009 district transition detail need additional primary sources. |
| MUNICIPAL-HISTORY-DEPTH | 1945–2023 source series retained where observed; missing/all-zero municipality-year cells are not fabricated contests. Older histories, direct-mayor pilot histories and complete legal predecessor chains remain open. |
| PARTY-CATEGORIES | SSB historical common/local/other lists remain source categories; no invented coalition membership, local list identities, or global party mapping. Seat-table category coverage differs; unmatched seats remain NULL. |


- [ ] Justin accepts the current register and qualified historical identities.
- [ ] Justin accepts or amends all draft tiers.
- [ ] Justin accepts the disclosed aggregation and named research holds.
- [ ] Justin authorizes future implementation separately.
