# Serbia acceptance examples — Prompt AX

## 1. National Assembly
`RS-NAT-ASSEMBLY` is one country-wide elected chamber; no Prime Minister office is derived from it.

## 2. President
`RS-NAT-PRESIDENT` is the only current direct-executive office in this pack.

## 3. 2012 first round
`RS-PRES-2012-R1` preserves 12 candidate rows and does not mark a winner because no candidate had a majority.

## 4. 2012 runoff
`RS-PRES-2012-R2` is a distinct legal round; Tomislav Nikolić is marked elected from the retained final result.

## 5. 2017 presidency
One round only; no synthetic runoff is created.

## 6. 2022 presidency
One round only; no synthetic runoff is created.

## 7. Vojvodina Assembly
`RS-VOJ-ASSEMBLY` is a directly elected regional assembly.

## 8. Vojvodina executive
No Provincial Government president office is created because the Assembly elects the Provincial Government.

## 9. Belgrade City Assembly
Grad Beograd has a local assembly office.

## 10. Belgrade mayor
No direct Belgrade mayor office is created; mayor selection is by the assembly.

## 11. Barajevo
Barajevo is a separate elected city-municipality assembly under Grad Beograd.

## 12. Palilula collision
Palilula (Beograd) and Palilula (Niš) receive distinct IDs keyed by parent.

## 13. Užice filter
Grad Užice is a top-level office; Sevojno is separately elected; the central statistical `Užice` subunit with no councillors is not an office.

## 14. Požarevac filter
Grad Požarevac and Kostolac are offices; the central statistical `Požarevac` subunit with no separate councillors is not.

## 15. Vranje filter
Grad Vranje and Vranjska Banja are offices; the central statistical `Vranje` subunit with no separate councillors is not.

## 16. Local count
145 top-level local assemblies + 25 elected city-municipality assemblies = 170 local offices.

## 17. Kosovo gate
No Kosovo municipal/parallel office is included; zero rows is a scope gate, not an adjudication of sovereignty.

## 18. No EP
European Parliament office count is exactly zero.

## 19. Missing local vector
A local event result-state row with votes=null/not_transcribed is not converted to zero.

## 20. 2016 Zaječar
SORS identifies Zaječar as a 2013 off-cycle case in the 2016 bulletin; event precision is year, not an invented day.

## 21. 2016 Belgrade
Grad Beograd uses 2014 year precision in the 2016 bulletin series.

## 22. 2020 dates
Per-office 2020-series dates are unknown in this pack rather than automatically set to the national election day.

## 23. Latest off-cycle
Latest events use exact 2021–2024 jurisdiction dates from SORS Appendix 1.

## 24. Tiers 1:1
Every one of the 173 office rows has exactly one draft tier row and zero approval.

## 25. No successor edges
The successor crosswalk is empty; no status-reform or merger edge is guessed.

## 26. Direct executives
Validator requires exactly one current direct executive and zero local direct executives.

## Retry additions
18. Vršac municipality→city status change is source-identified; no boundary/merger edge is invented.
19. Kikinda municipality→city status change is source-identified.
20. Pirot municipality→city status change is source-identified.
21. Bor municipality→city status change is source-identified; its 2016 event is rebound to the historical municipality assembly identity.
22. Prokuplje municipality→city status change is source-identified; its 2016 event is rebound to the historical identity.
23. National Assembly 2016 has its own official final event/result vector.
24. Ten 29 March 2026 local contests are distinct exact-date events, not folded into the 2024 source collection.
25. Kladovo 2026 final-report availability does not authorize invented numeric values.
26. All new tier rows remain `draft_for_human_review` and `justin_approved=false`.
