# Coverage and counting

| Measure | Current | Historical-only |
| --- | --- | --- |
| National offices | 1 | 0 |
| Local councils | 61 | 384 |
| Direct local executives | 61 | 384 |
| All office rows | 123 | 768 |

Events: **1,180** (24 national; 1,156 local). Results: **8,229** (185 national; 8,044 local). Draft tiers: **891**, one per office: national **1**, municipal **868**, other **22** (2011 Tirana boroughs).

There are 1,160 event records with at least one result row. A result row may carry votes, seats, or a certified winner only. The 384 historical elected-head rows have no transcribed votes, shares or seats. The 3,775 historical council rows contain only explicit nonblank seat allocations; omitted blank cells are preserved in `historical-2011-blank-seat-cells.json` and are not zero-valued results.

## By cycle and scope

| Cycle | Scope | Event records | Result rows | Rows with votes | Rows with seats |
| --- | --- | --- | --- | --- | --- |
| 1992 | national | 3 | 5 | 0 | 5 |
| 1996 | national | 4 | 5 | 0 | 5 |
| 1997 | national | 3 | 7 | 0 | 7 |
| 2001 | national | 6 | 8 | 0 | 8 |
| 2005 | national | 3 | 11 | 10 | 11 |
| 2009 | national | 1 | 35 | 35 | 35 |
| 2011 | local | 772 | 4159 | 0 | 3775 |
| 2013 | national | 1 | 68 | 68 | 68 |
| 2015 | local | 122 | 2215 | 2215 | 2058 |
| 2016 | local | 2 | 2 | 2 | 0 |
| 2017 | national | 1 | 18 | 18 | 18 |
| 2017 | local | 1 | 3 | 3 | 0 |
| 2019 | local | 122 | 621 | 621 | 524 |
| 2021 | national | 1 | 17 | 17 | 17 |
| 2022 | local | 6 | 19 | 19 | 0 |
| 2023 | local | 124 | 1010 | 1010 | 862 |
| 2024 | local | 1 | 2 | 2 | 0 |
| 2025 | national | 1 | 11 | 11 | 11 |
| 2025 | local | 6 | 13 | 13 | 0 |

## Reading event kinds

| Kind | Records |
| --- | --- |
| cancelled_poll | 2 |
| cycle_result | 773 |
| first_round | 5 |
| ordinary_election | 370 |
| ordinary_election_annulled | 1 |
| repeat_election | 1 |
| repeat_poll | 5 |
| repeat_poll_date_unresolved | 2 |
| replacement_election | 16 |
| scheduled_poll_cancelled | 1 |
| second_round | 4 |

Cycle summaries (773: 768 local plus five early national cycles) are not extra polling days. National mixed-system polling phases have separate event records and refer to their cycle summary. Final seats are not attached to only the first round. The 2011 local final registers include any repeats; their summary events have year precision rather than an invented common final election day.

The 2023 Rrogozhinë annulled poll carries the later recounted archive vector (5,129/5,108), not the original count and not a valid winning mandate. Its 23 July repeat has its own event and reported numeric vector. CEC Decision 718, body-dated 1 August 2023, separately establishes the winning mandate. Its filename date is not used as polling or certificate date.

The 9 November 2025 Tirana record is a cancelled scheduled poll. The Court suspended its decree on 9 October and announced annulment on 3 November. No vote/result rows or successor poll are invented. Five other municipal replacement polls did take place that day.

## Numeric and certification limits

The 2015, 2019 and 2023 current-map council vectors sum respectively to 1,595, 1,619 and 1,613 seats. These are cycle-specific allocations, not permanently fixed sizes. The 2011 source sums to 6,152.

2019 inherited votes retain their preliminary evidence status even though later final materials were recovered. Most 2023 portal vectors do not prove certification on their own. Secondary reports used for some replacements remain labelled as such. The preserved earlier 3,843 result rows match the recovered workbook vote/seat vectors and ordering; that is not independent certification of every inherited cell.

The CEC's final 2025 national table totals 1,606,057 votes and 140 seats. The ODIHR final observation report reproduces preliminary CEC figures (its footnote 131), which are retained only in the comparison file. No duplicate election or additional main result vector is created.

The 2021 ODIHR table's list/candidate votes sum to 1,578,117, while its summary labels 1,661,176 valid votes. Both observations are documented, and reported percentages are retained. The inconsistent summary is not used to recompute shares. Earlier national percentages with untranscribed vote totals are not converted into votes.

## Remaining history

National result coverage starts in 1992 and includes 1996, 1997, 2001, 2005, 2009, 2013, 2017, 2021 and 2025. The March–April 1991 election is held at the constitutional transition gate; it is not silently mapped to today's Republic office. Earlier communist/People's Assembly identities are excluded.

The 2011 historical local census and all 61 pairs in each 2015, 2019 and 2023 ordinary cycle are present. The selected older local cycles, all phase-level repeat returns, all historic by-elections and all village/community elections are not claimed complete. See research gaps. Dates in `cycle-outlook.json` are cycle expectations with null exact polling dates, not scheduled events.
