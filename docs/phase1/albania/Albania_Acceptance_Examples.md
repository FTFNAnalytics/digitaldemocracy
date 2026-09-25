# Acceptance examples

These are required behaviours and review cases, not Justin acceptance. All approval fields are false.

| ID | Scenario / input | Expected behaviour |
| --- | --- | --- |
| AL-BA-A01 | Current register — 61 municipal units | 123 current offices: 61 mayors, 61 councils, one Assembly. |
| AL-BA-A02 | Paired local bodies — Any current municipality | Separate M and C IDs; neither is a party/candidate. |
| AL-BA-A03 | President — Constitution Article 87 | No popular presidential office; selection recorded as Assembly election. |
| AL-BA-A04 | Mayor selection — Electoral Code Article 166 | Direct plurality; tie by lot; no invented general runoff. |
| AL-BA-A05 | Regional tier — Qark and prefect labels | No popular regional office rows. |
| AL-BA-A06 | European Parliament — EU candidate status | EP office and event count zero. |
| AL-BA-A07 | Alert horizon — Expected Assembly cycle 2029 | Retain office/history; exact next day null. |
| AL-BA-A08 | Legacy Belsh binding — AL-13-M | Retained Belsh ID; do not reassign it to Cërrik. |
| AL-BA-A09 | Legacy geography — AL-13-M | geo-99a7b8d0e325a448c5e7c7ca retained. |
| AL-BA-A10 | Legacy event identity — AL-13-M::2023::2023-05-14 | event-9b7cd1a6a6d27850e712e6a7 retained. |
| AL-BA-A11 | Rename — Ura Vajgurore / Dimal | AL-05-M/C retained; no successor or extra current rows. |
| AL-BA-A12 | Reform vintage — 2011 CEC register | 768 historical rows sourced; no automatic current continuity. |
| AL-BA-A13 | Tirana nesting — 11 historical boroughs | 22 historical office rows with historical Tirana parent references. |
| AL-BA-A14 | Nested community scope — Law 139/2015 Articles 68–70 | Keep locality-specific advisory-board census as an explicit hold. |
| AL-BA-A15 | 2011 winner only — A CEC elected head | elected=true; votes/share/seats null, not 0 or 1. |
| AL-BA-A16 | 2011 council blank — Blank party cell | No zero-result row generated; blank audited separately. |
| AL-BA-A17 | 2011 council total — CEC seat allocations | 3,775 nonblank rows, 6,152 seats. |
| AL-BA-A18 | Cancelled Paper/Pishaj — 8 May 2011 mayor ballot errors | Cancelled poll and undated repeat separate; neither assigned final cycle totals. |
| AL-BA-A19 | Mixed national system — 1992–2005 early cycles | Final allocation attached to cycle summary; phases remain separate. |
| AL-BA-A20 | Historic chamber size — 1997 national allocation | 155 seats retained rather than forced to current 140. |
| AL-BA-A21 | National transition — March–April 1991 | Gate identity; do not create post-1991 Republic results by assumption. |
| AL-BA-A22 | Full 2015 restoration — Prior selection omitted 15 mayor contests | Restore them from primary bulletin; keep all earlier IDs/results. |
| AL-BA-A23 | Inherited result order — 3,843 recovered baseline rows | Preserve vote/seat vectors and row index; do not sort by winner. |
| AL-BA-A24 | 2019 preliminary — Official preliminary vote table | Do not relabel final merely because later final material was found. |
| AL-BA-A25 | Rrogozhinë May 2023 — Annulled recounted return | Two reported vote rows 5,129/5,108; no winning mandate. |
| AL-BA-A26 | Rrogozhinë July 2023 — 23 July repeat | Separate event with sourced repeat link and mandate certificate date 1 August. |
| AL-BA-A27 | Tirana November 2025 — Scheduled election cancelled | Scheduled date preserved, zero result rows; no zero-vote candidate invented. |
| AL-BA-A28 | Dibër September 2016 — Calendar/candidacy source | Event retained with no invented return. |
| AL-BA-A29 | 2021 discrepancy — Annex rows versus summary | Keep diagnostic; reported shares unchanged, no false denominator. |
| AL-BA-A30 | 2025 final return — CEC final national table | 11 main rows; 1,606,057 votes; 140 seats. Preliminary comparison outside main results. |
| AL-BA-A31 | Draft tiers — 891 office rows | Exactly one unapproved tier row per office; histogram 1/868/22. |
| AL-BA-A32 | Source hashes — Retained extract vs original PDF | Hash both separately when original available; missing original digest stays null. |
| AL-BA-A33 | No mutation — Run validator | Read-only output, applied_changes=0, all approvals false. |
| AL-BA-A34 | Other prompts — AY and AX reminders | ME-AY-G01–G11 remain held; no Serbia validation or acceptance claimed. |
