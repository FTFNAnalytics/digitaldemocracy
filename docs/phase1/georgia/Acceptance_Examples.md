# Georgia BG — acceptance examples

These are review examples, not approvals.

| ID | Case | Expected |
|---|---|---|
| GE-BG-A01 | GE and scope | Country fields are georgia / GE, never US-GA; no parallel-institution office IDs. |
| GE-BG-A02 | Current inventory | 64 ordinary municipal councils + 64 popular mayors + Parliament + Adjara = 130 ordinary-cycle offices. |
| GE-BG-A03 | Five continued councils | Exactly five current_scope_hold council offices under article164; no direct gamgebeli rows for them. |
| GE-BG-A04 | Tbilisi nesting | DECs 1–10 combine into one city council and one mayor; no district popular offices. |
| GE-BG-A05 | EP exclusion | EP offices = 0. |
| GE-BG-A06 | Indirect President | No current popular president; indirect calendar context has no office IDs. |
| GE-BG-A07 | President rounds | 2018 first round and runoff have 25 and 2 published candidate rows, respectively. |
| GE-BG-A08 | 1992 chair | 1992 popular head-of-state/Chair is separate from President and Parliament votes. |
| GE-BG-A09 | Adjara history | 2001 lower chamber, upper chamber and popular head are separate historical offices; no current popular regional head. |
| GE-BG-A10 | Municipal reform | 14 historical 2014 geographies × 2 offices plus seven pre-2014 councils; no successor links. |
| GE-BG-A11 | Draft tiers | Exactly one draft unapproved tier per each office, including holds/history. |
| GE-BG-A12 | Upcoming prominence | Every calendar row country_surface_prominent=true; outside-window ordinary formulas are retained. |
| GE-BG-A13 | No invented days | Every future exact_date remains null; formula years use sourced terms. |
| GE-BG-A14 | Current code | Calendar uses replacement Election Code; no current council runoff invented from 2021 rules. |
| GE-BG-A15 | Blank votes | Source blanks are null; partial sums are audit-only. |
| GE-BG-A16 | Runoff nonparticipants | Zero/absent columns do not create runoff candidates; Tbilisi 2021 has exactly two runoff candidates. |
| GE-BG-A17 | Subtotal exclusion | 2017 Tbilisi Kaladze vote total is 204061, not doubled by district total rows. |
| GE-BG-A18 | Independent aggregate | 2014 Tbilisi runoff official aggregates 84350 and 222066 do not fill blank precinct cells. |
| GE-BG-A19 | 2003 annulment | Annulled 2003 PR component has no result rows; 2004 repeat is separate. |
| GE-BG-A20 | Missing 2004 total | United Communist Party in 2004 PR repeat has votes=null, never zero. |
| GE-BG-A21 | Signed Adjara 2024 | 11 protocol rows; explicit seat awards sum21; blank seat cells remain null. |
| GE-BG-A22 | 2021 seats | All64 council final seat vectors total2068; distinct result kind prevents treating them as PR-only. |
| GE-BG-A23 | 1992 component seats | The 24 published multi-member allocations sum150; no total-chamber seat figure inferred. |
| GE-BG-A24 | Source hashes | Every retained source has exact byte length and SHA-256 plus URL; failed retrieval is not a source absence assertion. |
| GE-BG-A25 | 223 contract | Exactly223 unique table.column entries match the retained contract in original order. |
| GE-BG-A26 | Approval state | All Justin approvals false and all Markdown boxes unchecked; applied_changes=0. |
| GE-BG-A27 | Offline integrity | Validator reads pack only, checks foreign keys, identifiers, counts, dates and every checksum. |
