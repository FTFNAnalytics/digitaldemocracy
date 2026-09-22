# Greece acceptance examples

These are concrete review expectations, not Justin approvals. Machine-checkable structural and source-field invariants are enforced by the offline validator; legal-source adjudication remains a human review matter.

| # | Case | Required behavior |
|---:|---|---|
| 1 | Complete current register | 693 current offices: 332 municipal pairs, 13 regional pairs and three national/European roles. |
| 2 | Historical retention | Exactly 10 historical rows, two for each of five abolished municipalities; no current duplicate pairs for abolished units. |
| 3 | Tier bijection | 703 office IDs equal the 703 tier office IDs; all reviews are needs_review and production_accepted is false. |
| 4 | Independent municipality check | 332 electoral register entries match 332 distinct TPD codes in the March 2026 Ministry PDF. |
| 5 | Homonymous municipalities | GR-M-9170 and GR-M-9305 remain distinct Ηρακλείου authorities in Attica and Crete. |
| 6 | Reused Lesbos code | GR-M-9261-PRE2019-C/M holds old Lesbos contests; GR-M-9261-C/M holds the post-reform Mytilene contests. |
| 7 | Seven new source IDs | Codes 9326–9332 have no fabricated 2010 or 2014 office events. |
| 8 | Full 2010 register | 325 municipalities plus 13 regions each have first-round observations for their council/executive pair. |
| 9 | Full 2014 register | All 338 authorities are present, including Messini with an explicit unresolved hold. |
| 10 | Full 2019 register | All 345 authorities are present on the new territorial register; old names are not overwritten. |
| 11 | Full 2023 register | All 332 municipalities and 13 regions have candidate vectors; no alert-window filtering applies. |
| 12 | Actual runoffs only | There are 781 observed local/regional runoffs across the four archives. An unused B field cannot create one. |
| 13 | 2023 runoff denominator | 84 municipalities plus six regions have second-round returns, matching the Ministry runoff guide. |
| 14 | Shared ballot identity | Each first-round local observation has exactly two linked office projections; each runoff observation has one executive projection. |
| 15 | No independent-ballot inflation | 14,004 result rows deduplicate to 8,021 source observations. Votes must not be summed across council and executive projections. |
| 16 | Council allocation scope | Council seats are event-level whole-contest allocations; a first-round candidate vote field does not make those first-round seats. |
| 17 | Cycle-specific seat fields | 2019 AEdres is used directly; 2010/2014 add AEdres+BEdres; 2023 follows the archive rendering rule. |
| 18 | Executive seat null | Every mayor, regional-governor and presidential result has seats null/not_applicable. |
| 19 | Messini tie | Both 2014 runoff candidates have 9,236 votes; winner remains null and the published 17/33 council-seat allocation is flagged. |
| 20 | 2019 regional reporting holds | All 13 reporting-station discrepancies are retained. The validator cannot turn a denominator discrepancy into certified completeness. |
| 21 | Presidential electorate | All GR-PRES events use electors=MPs; every presidential result share remains null. |
| 22 | 2025 fourth ballot | 12 February: Tasoulas 160, Giannitsis 34, Katseli 29, Kyriakou 14; 39 present-abstentions; 276 participating MPs; 24 absent. |
| 23 | 2025 third ballot source priority | 6 February original minutes record 160/34/40/14 plus 52 present-abstentions, including the declared full tally. A different editorial/live count is not substituted. |
| 24 | 2000 presidential total | 8 February original minutes record Stephanopoulos 269 and Kyrkos 10, plus 19 present-abstentions; a 265 editorial reprint is not used. |
| 25 | 2014 unsuccessful ballots | Dimas records 160, then 168, then 168 across the three 2014 ballots; none is labelled a nationwide popular victory. |
| 26 | Separate 2023 parliamentary elections | 21 May and 25 June are distinct national events. June source seats include SYRIZA 47 and KKE 21; the complete allocation totals 300. |
| 27 | 2004 full national vector | 17 published categories total 7,408,374 valid votes. The literal Christian-category count 3 is retained; missing shares and non-published seat counts stay null. |
| 28 | 1993 lexical conflict | The English >313.001 cell remains raw in comparisons. The selected Greek table independently gives KKE 313,001, so no parser strips an unexplained symbol to manufacture a number. |
| 29 | EP treatment | 2024 Ministry seats total 21, including ND 7. The 1981 event has no fabricated return rows; the outgoing 1979–1984 composition stays outside results. |
| 30 | Audit and approval invariants | All 223 contract columns are mapped, every retained artifact is hashed, self-test corruptions are rejected, applied_changes=0 and all Justin approval boxes remain unchecked. |
