# Acceptance examples

These 30 cases define the pack’s review invariants; they do not approve publication or eliminate evidence holds.

| ID | Case | Expected treatment |
|---|---|---|
| MD-BC-A01 | Full register outside alert horizon | 1,822 current offices survive; only eight have source-confirmed upcoming event dates. |
| MD-BC-A02 | One tier per office | 1,836 unique office IDs and exactly 1,836 draft tier rows; approvals false. |
| MD-BC-A03 | Two national popular institutions | Parliament and President only; no popular PM or Cabinet. |
| MD-BC-A04 | Indirect presidential era | No popular presidential event in 2000–2015 or before the 2016 restoration. |
| MD-BC-A05 | Separate presidential rounds | Nine dated rounds, including separate 2024-10-20 and 2024-11-03 events. |
| MD-BC-A06 | 2024 runoff conflict | Court totals 930139 and 750430 retained; secondary alternative only in evidence hold. |
| MD-BC-A07 | No current EP offices | EP office/event count is zero; candidate status stays a scope note. |
| MD-BC-A08 | No parallel Transnistrian institutions | No PMR/twin president/twin capital office; contested territories stay holds. |
| MD-BC-A09 | Elected raion tier | Exactly 32 councils, zero popular raion-president offices. |
| MD-BC-A10 | Gagauzia bodies | Exactly one autonomous Assembly and one Bashkan; 26 municipal pairs counted separately. |
| MD-BC-A11 | Nested municipalities | Chișinău has 18 subordinate pairs and Bălți two, in addition to their city pairs. |
| MD-BC-A12 | No sector assemblies | Five Chișinău administrative sectors do not create office rows. |
| MD-BC-A13 | 2025 territorial transition | 893 current local pairs plus seven pre-amalgamation historical pairs. |
| MD-BC-A14 | No guessed merger graph | Zero successor links; all predecessor/successor office fields null. |
| MD-BC-A15 | Historical Leova/Călinești | Old territories and expanded current centers are distinct research rows; historical mandate end stays null. |
| MD-BC-A16 | Cornești member ambiguity | 24 member records held; neither Cornești council has a guessed 2015 member allocation. |
| MD-BC-A17 | 2015 member recount | 10,540 assigned members + 24 held = 10,564 source members; 894 council member-roster events. |
| MD-BC-A18 | Mayor roster is not ballot | 1,796 winner-only roster rows have null votes/share/seats; 2023 source_as_of is 2024-05-19. |
| MD-BC-A19 | 2019 mixed Parliament | One national list event with 50 explicitly printed seats; 51 SMD components do not create offices. |
| MD-BC-A20 | 1994 historical seat total | Seated-party total is 104, not forced to today’s 101. |
| MD-BC-A21 | 2009 recount choice | April final votes sum to 1,537,087; PCRM 760,551, not preliminary 760,139. |
| MD-BC-A22 | July 2009 absent votes | Eight reported party-share rows retain null votes. |
| MD-BC-A23 | Explicit zero retained | Novosiolovca 2023 Novicov has 0 reported votes; other missing votes remain null. |
| MD-BC-A24 | Two TOPCIU DMITRI entries | Tomai source ordinals preserve separate 103-vote and 79-vote rows. |
| MD-BC-A25 | Annulled versus repeated Gaga poll | Constituency 1 on 2016-12-04 is annulled; the 2017-03-05 repeat is another event. |
| MD-BC-A26 | Aluatu repeat/runoff dates | 2023-11-19, 2023-12-03 and 2023-12-17 remain distinct; December 3 invalid turnout preserved. |
| MD-BC-A27 | 223-column completeness | Exactly 20 reference tables and 223 unique table/column mappings; no applied mapping. |
| MD-BC-A28 | Source closure and hashes | All source references resolve; retained files match inventory/manifest hashes. |
| MD-BC-A29 | No side effects or approvals | applied_changes=0 and all Justin booleans false. Validator is read-only. |
| MD-BC-A30 | Full historical coverage not claimed | research_coverage_complete=false; explicit named holds remain. |
