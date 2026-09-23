# Bosnia and Herzegovina full office register — Prompt AW

## Executive summary
Prompt AW replaces the old 13-row Prompt O regional-only scope with a full state/entity/canton/local research register. No importer, SQLite, VPS, UI or repository action was performed (`applied_changes=0`).

### Counts
- **306 current offices** and **40 historical-only offices** = **346 office rows**.
- Current breakout: **4 state / 5 entity / 10 canton / 287 municipal-local**.
- Current representative bodies: **158** total = 145 local councils/assemblies + BiH House of Representatives + FBiH House of Representatives + RS National Assembly + 10 canton assemblies.
- Current direct executive/member offices: **148** = 142 direct local mayors + 3 BiH Presidency member offices + RS President + 2 RS Vice-Presidents.
- Local representative bodies: **145 current**, of which **143 direct** and 2 indirect city bodies.
- Local direct executives: **142 current**.
- **Zero European Parliament offices.**
- Draft tiers: **327 municipal / 15 regional / 4 national**.
- **937 events**, including **19 called 2026 events**; **918 result-state rows** for completed/annulled events. Prompt O continuity additionally pins **749 detailed numeric result rows** across 39 entity/canton histories.

## Local current register
The direct 2024 CEC scope provides 58 FBiH municipal councils, 53 RS municipal assemblies, 21 FBiH city councils, 10 RS city assemblies and Brčko Assembly. Sarajevo City Council and Istočno Sarajevo City Assembly are additional elected bodies filled indirectly after constituent municipal elections. Direct local executives are 111 municipal mayors plus 31 city mayors. Sarajevo, Mostar and Brčko mayors are not direct-popular offices and are excluded.

## History
Three local cycles are represented: 2016, 2020 and 2024, including the special Mostar 2020 council election, Stolac 2017 repeat, and post-cycle indirect Sarajevo/Istočno Sarajevo body elections. Three completed general cycles (2014/2018/2022) plus the called 2026 cycle are represented for every direct state/entity/canton office.

## Results scope
Every completed/annulled event has a result-state record bound to an official result publication/certification source. The prior Prompt O result artifact contains 749 detailed vote/share/seat rows for 2014/2018/2022 across the FBiH House, RS National Assembly, RS President and ten canton assemblies; AW preserves that continuity by immutable blob/table hashes plus an old→AW office crosswalk. Numeric vectors for every other completed event are not claimed complete; that remains BA-AW-G01.

## Indirect-body gate
The BiH House of Peoples, FBiH House of Peoples and RS Council of Peoples are documented as indirect and are not converted into direct popular offices. Federation executive, cantonal governments, state Council of Ministers and council-selected local mayors are likewise not fabricated.

## 2024 mayor-count source discrepancy
CEC records conflict: the 8 May 2024 English call page lists 31 city mayors plus 111 municipal mayors while also saying 143 total; the 4 October basic-information page lists 32 city mayors and 143 total. Because Sarajevo, Mostar and Brčko executives are separately evidenced as council/assembly-selected, AW keeps only the 142 direct local executive identities actually reconciled and flags BA-AW-G09.
