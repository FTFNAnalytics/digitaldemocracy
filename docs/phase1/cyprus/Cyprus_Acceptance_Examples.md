# Cyprus acceptance examples

These are review cases, not Justin sign-off. Machine checks are documented by validate.py and validation-report.json.

| ID | Case | Required outcome |
|---|---|---|
| CY-A01 | President 2023 R1 and R2 | Two events with one cycle_id, separate valid ballots 397317 and 394202; no transfer rows. |
| CY-A02 | President 2003 | One observed first-round event at year precision; no invented runoff. |
| CY-A03 | First-round majority | Compare a candidate only with valid ballots of that first round; do not count blanks in the threshold. |
| CY-A04 | Second-round outcome | Top-two new ballot, most valid votes wins; no invented transfer quota. |
| CY-A05 | Lefkosia reform | Current council CY-MUN-11010000-council differs from CY-HIST-MUN-1000-council. |
| CY-A06 | Statistical previous code | Record geography correspondence; successor-crosswalk stays empty without legal evidence. |
| CY-A07 | Strovolos deputy | Keep CY-MUN-11021012-deputy-1012 as a direct popular office despite no municipal-quarter subdivision. |
| CY-A08 | Community deputy | Council-selected mechanism does not generate a direct popular executive row. |
| CY-A09 | 285 versus 286 | Exactly 285 named community council rows; completeness false; no unnamed placeholder. |
| CY-A10 | Spilia Kourdali | Keep a distinct council and leader with ec_area_id null; no link to 1402. |
| CY-A11 | Occupied municipality | A Republic displaced-elector mayor return for Keryneia is excluded locally; no TRNC office is instantiated. |
| CY-A12 | Keryneia parliamentary constituency | Retain official House results even though the local territorial register excludes occupied units. |
| CY-A13 | Partial municipal occupation | Retain the administered electoral municipality and its source footprint note; do not claim control over all statistical territory. |
| CY-A14 | National House seats | 56 operative legislative seats plus 24 unfilled constitutional reservations; not 80 contested seats. |
| CY-A15 | Religious representatives | Three elected non-voting offices; do not add them to the 56 voting seats. |
| CY-A16 | Armenian 2026 unopposed return | One returned representative, votes null, votes_status no_poll; no invented nationwide popular ballot. |
| CY-A17 | Candidate preference | A 2016 councillor’s preference marks remain candidate_preference and are not added to the list vote total. |
| CY-A18 | Malformed Ora CSV | Rows 471–473 remain in extraction-issues and raw CSV; no shifted name/vote pair enters results. |
| CY-A19 | Explicit zero | Preserve source zero when present; missing votes or seats remain null. |
| CY-A20 | Blank elected marker | Do not turn an empty 2016 elected column into false without a reliable source legend. |
| CY-A21 | 2016 final appendix | Do not attach the nationwide appendix to the last locality; ballot rows must sum to locality valid ballots. |
| CY-A22 | 2024 council CSV title | List ballot rows stay list_ballot even if the dataset title mentions preference crosses. |
| CY-A23 | No local return | An office remains in the register; absent results do not prove it was unopposed or abolished. |
| CY-A24 | Five DLGOs | Five direct president rows; no popular 17-member DLGO council contest. |
| CY-A25 | Service cluster | Ex-officio community-leader membership does not create another popular election. |
| CY-A26 | EP 2024 | One delegation office, six seats in separate EP seat report; no double count with ministry ballot view. |
| CY-A27 | 2019 EP metadata | Keep year precision until the questionable 28 May metadata date is resolved. |
| CY-A28 | 2024 local poll date | Use 9 June proclamation; metadata 9 July does not overwrite it. |
| CY-A29 | 2026 correction | Use retained released CSV; do not subtract five ELAM votes a second time. |
| CY-A30 | Source changed | Any payload byte change invalidates the stored SHA and requires a new research snapshot. |
| CY-A31 | Draft tiers | 888 office rows require exactly 888 draft classifications, all unapproved. |
| CY-A32 | Window policy | Keep offices and history even when expected 2029/2031 cycles lie outside March 2028 alert cutoff. |
| CY-A33 | No operational work | Validator reads package files only; no database, network, repository, importer or publication action. |
