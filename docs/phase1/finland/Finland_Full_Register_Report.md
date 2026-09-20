# Finland full-register research handoff — ACCEPTED (with holds)

> **Accepted 2026-09-19 (America/Edmonton) by Justin:** full register with named holds (FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, FI-MISSING-RESULTS). Importer not part of this land.

## Executive summary

Pinned main **`a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`**. Source capture 20 September 2026. This research pack contains **333 current + 170 historical offices**, **5,241 election cycles**, **11 presidential round proceedings** and **37,471 result rows**. Accepted-with-holds tiers across all 503 offices: **478 municipal / 22 regional / 2 national / 1 other**. No importer, SQLite, VPS or UI changes; `applied_changes=0`. Justin accepted the register and named holds on 2026-09-19.

The 333 current offices comprise **308 municipal councils** (292 mainland, 16 Åland), **21 wellbeing-county councils**, **Åland Lagting**, **Eduskunta**, the **directly elected presidency**, and **Finland's EP delegation**. The presidency is included under the requested elected-government scope, not inferred from the appointed cabinet. Helsinki's municipal council carries combined responsibilities and appears once. The 21 mainland counties and Åland Lagting are different regional institutions, not a flattened common electoral system. [2026 municipality classification](https://stat.fi/en/luokitukset/kunta/kunta_1_20260101/), [municipal council rules](https://vaalit.fi/en/municipalities-and-municipal-councils), [county rules](https://vaalit.fi/en/wellbeing-services-counties-and-county-councils), [presidential election](https://vaalit.fi/en/presidential-election).

Every current office survives outside the alert window. The ministry explicitly lists Eduskunta **18 April 2027**, mainland municipal/county **15 April 2029**, EP **10 June 2029**, and presidential **27 January 2030**. These are next-date metadata, not extra historic events. Åland next dates remain unknown here. Historic rows remain regardless of the alert window. [Official upcoming calendar](https://vaalit.fi/en/elections-2024-2035).

Historical coverage is substantial but qualified: mainland municipal vote/share cycles **1976–2025**, Åland municipal seats **1991–2023** and votes **1999–2023**, Lagting **1979–2023**, Eduskunta **1983–2023**, EP **1996–2024**, presidency **1994–2024**, county **2022/2025**. Exact historical polling days are not inferred from annual tables. Abolished municipality codes remain separate offices with no guessed successor links. [Statistics Finland election database](https://pxdata.stat.fi/PxWeb/pxweb/en/StatFin/kvaa/), [ÅSUB election statistics](https://www.asub.ax/sv/statistik/val).

## Scope and verified depth

| Body | Current offices | Historical offices | Cycles | Result rows | Source cycle years |
| --- | --- | --- | --- | --- | --- |
| municipal_council | 308 | 170 | 5163 | 36141 | 1976,1980,1984,1988,1991,1992,1995,1996,1999,2000,2003,2004,2007,2008,2011,2012,2015,2017,2019,2021,2023,2025 |
| wellbeing_county_council | 21 | 0 | 42 | 777 | 2022,2025 |
| national_parliament | 1 | 0 | 11 | 199 | 1983,1987,1991,1995,1999,2003,2007,2011,2015,2019,2023 |
| elected_president | 1 | 0 | 6 | 61 | 1994,2000,2006,2012,2018,2024 |
| european_parliament_delegation | 1 | 0 | 7 | 101 | 1996,1999,2004,2009,2014,2019,2024 |
| autonomous_parliament | 1 | 0 | 12 | 192 | 1979,1983,1987,1991,1995,1999,2003,2007,2011,2015,2019,2023 |


Current municipality coverage is checked against all 308 entries in the independent 2026 classification. Historic coverage is **not exhaustive before 1976**, and same-code legal predecessor splits still need research. The full register refers to the requested current body classes; no claim is made to an exhaustive historical constitutional-office universe or separately researched Sámi self-government coverage.

## Results and overlap safeguards

Every original API response, POST query and metadata file is retained with SHA-256. Vote/seat sources join the same election/body/category; they do not create duplicate cycles. The 67 retained source objects include discovery and reconciliation inputs. EP elected-member detail is retained but not normalized as an additional candidate vector. No party-family mapping or certified margin is invented.

All **available** event-level party vote totals and Åland seat totals reconcile to their source aggregates. Presidential rounds are reconciled separately; never sum first and runoff votes as one percentage vector. Historical StatFin party categories can combine predecessors; source labels and notes stay intact. Åland observations labelled under later mainland years remain raw-only, using ÅSUB's actual cycle years for normalization.

Missing vs reported zero scalars: votes **3,505 / 1,024**; seats **24,936 / 4,869**; share **4,929 / 134**. These are missing-value counts, not estimates. `certified` denotes the published official statistical return, with exact annulment/repeat/court chronology still qualified where not separately reconciled.

## Named open gates

| Gate | Remaining work |
| --- | --- |
| FI-HISTORIC-MERGERS | Observed historical municipal councils retained; no successor edges, exact abolition dates or same-code predecessor splits inferred. Exhaustive legal merger audit and pre-1976 archive remain open. |
| FI-ALAND-EARLY-AND-DATES | ÅSUB table starts 1987 with aggregate-only seats; individual municipal seat vectors begin 1991, municipal votes 1999, Lagting 1979. Earlier Åland observations in StatFin mainland-cycle tables retained raw only to avoid shifted-year double counting; exact days, special/repeated elections and next Åland dates remain unverified. |
| FI-WELLBEING-TRANSITION | 21 councils elected in 2022; services transition in 2023 is not a new election. Helsinki and Åland excluded from county office generation. Any historical Kainuu elected experiment or other predecessor requires separately verified primary register and contests; no inferred successor to HVA20. |
| FI-EP-DETAIL | National party vote/share histories 1996–2024 normalized. Elected-member cube 14h8 retained without creating additional party vectors or manufacturing seat totals; full candidate roster, seats and mandate replacements await detailed reconciliation. |
| FI-CYCLE-LEGAL-DETAIL | Year-only statistical histories do not certify exact polling days or exhaustive annulment/repeat/recount chronology. Municipal 2008 electronic-voting reruns require primary event-level reconciliation before decisive-date assertions; original table vectors stay qualified. |
| FI-PARTY-CATEGORIES | Historic StatFin labels combine predecessor parties and technical aggregates. Preserve original statistical categories; no accepted party-family mappings. Only within-election code joins for votes/seats. |
| FI-MISSING-RESULTS | Pre-2012 mainland municipal seats, pre-2003 parliamentary seats and several candidate/round/date details are not normalized here. Null means missing, not zero. No fabricated municipal executives. |


A package PASS means integrity and documented projection checks passed. It does not close these research gates, approve tiers or prove importer/publication CI.

- [x] Justin accepts the current register and qualified historical scope (2026-09-19, with named holds).
- [x] Justin accepts draft tiers, including EP `other` (2026-09-19; hold FI-EP-DETAIL).
- [x] Justin accepts the named holds and source category policies (2026-09-19).
- [ ] Justin authorizes future implementation separately. **Not authorized in this landing.**
