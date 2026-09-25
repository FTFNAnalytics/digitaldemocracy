# Serbia full office register + historic contests — Prompt AX

The scoped importer is `ATLAS_IMPORT_SCOPE=serbia` — see [Serbia_Import.md](Serbia_Import.md). `all` does not import this lineage. It publishes **173 current + 5 historical** offices, **0 events**, **0 result rows**, and **0 sources**. Holds RS-AX-G01 through RS-AX-G11 stay open. Kosovo-scope offices stay 0. No VPS deploy.

**DRAFT FOR HUMAN REVIEW. Research/documentation only. `applied_changes=0`. All Justin approvals remain unchecked.**

## Headline counts
- Current offices: **173**
- Historical-only offices: **0**
- National: **2**
- Provincial: **1**
- Local: **170** = 145 top-level local-self-government assemblies + 25 separately elected city-municipality assemblies
- Current councils/chambers/assemblies: **172**
- Current direct executives: **1** — President of Serbia
- Direct local executives: **0**
- European Parliament offices: **0**
- Kosovo-scope offices in this Serbia pack: **0**
- Events: **520**
- Result rows: **641**, including **131 detailed numeric result rows**
- Draft tiers: national 2 / regional 1 / municipal 170
- Inherited Atlas contract: **20 tables / 223 columns**

## Current office register
The elected-office register is complete for the evidenced Serbia scope outside the explicit Kosovo gate. It includes the National Assembly, directly elected President, Vojvodina Assembly, all 145 top-level local-self-government assemblies outside Kosovo, and 25 separately elected city-municipality assemblies.

The statistical register's 28 city-municipality units are **not** mechanically turned into 28 elected offices. Current election tables show no separately elected councillors for the central same-name Užice, Požarevac and Vranje statistical units. Sevojno, Kostolac and Vranjska Banja are separately elected and are included.

## Selection mechanics
The President is directly elected under a majority/runoff system. Municipal presidents and city mayors are chosen by elected assemblies; there are therefore no direct municipal/city executive offices, including no direct Belgrade mayor office. Vojvodina's Provincial Government is elected by the Provincial Assembly and is not a separate popular office.

## Historic contests/results
Every current local assembly carries three official statistical contest observations: the SORS 2016 bulletin series, the SORS 2020 series, and the latest SORS 2024-bulletin series. The latest series preserves exact jurisdiction dates from 2021–2024. Named off-cycle 2013/2014/2015 cases in the 2016 bulletin are preserved at source-supported precision. The 2020 per-office poll dates are left unknown rather than assigning an unsourced common date.

National Assembly: 2020, 2022, 2023 final returns.
President: 2012 first round + runoff, 2017, 2022.
Vojvodina Assembly: 2016, 2020, 2023 final returns.

## Numeric local-results hold
The local contest/event layer is complete as a source-indexed historical layer, but exhaustive candidate/list vote and seat vectors for all local jurisdictions have **not** been transcribed. Each local event therefore has a result-state row; missing numeric values are `null/not_transcribed`, never zero. Detailed final vectors are included for the national/provincial contests and the 2024 Belgrade City Assembly as quantitative anchors.

See `Serbia_Research_Gaps.md`, `JUSTIN_REPORT.md`, and `validation-report.json`.

## AX retry additions

This retry adds five legal/source-identified historical local identities (Vršac, Kikinda, Pirot, Bor, Prokuplje), the official 2016 National Assembly return, and ten 29 March 2026 local/city-municipality contests.

Final retry counts: **173 current + 5 historical-only offices; 531 events; 671 result rows; 520 local result-state rows.**
Draft tiers are **national 2 / regional 1 / municipal 175 / other 0**.

`data/successor-crosswalk.json` now contains exactly five **same-territory status-change** links. They are not merger edges.
