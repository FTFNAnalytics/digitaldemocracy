# Worked acceptance examples

## 1. Current denominator

100 council IDs exactly match current government georegister, plus LU-PARLIAMENT and LU-EP: 102 current.

## 2. No regional offices

All 12 cantons and legacy districts remain geography only; regional tier count is zero.

## 3. No hereditary ballot

Search offices/events for Grand Duke returns zero; explanatory source remains in inventory.

## 4. No mayor ballot

direct_executive=false on every office. Council candidate with most votes is not assigned a mayoral event.

## 5. Berdorf delay

LU-C-berdorf@2023-10-08 has 15 candidate rows, nine ELU. No June 11 competitive Berdorf event.

## 6. Berdorf ballots

1080 ballots, 42 invalid, 1038 valid in observation; sum candidate votes is not turnout.

## 7. Nommern uncontested

LU-C-nommern@2023-06-11 has seven candidate return rows with votes=null, reported_votes=0, not_applicable_uncontested. No two invented winners.

## 8. Consdorf vacancies

LU-C-consdorf@2011-10-09 retains five source-elected candidates and nine council seats. Future filling of four seats remains a gap.

## 9. Habscht sections

Both 2017 Hobscheid and Septfontaines reporting groups bind LU-C-habscht@2017-10-08, not two offices.

## 10. Käerjeng sections

2011 Bascharage and Clemency bind LU-C-kaerjeng@2011-10-09; source section council-seat counts must not each be compared with whole council elected total.

## 11. Wiltz boundary

LU-C-wiltz-pre-merger owns 2005/2011 returns; LU-C-wiltz owns 2017/2023. Both endpoints exist in merger crosswalk.

## 12. Esch-sur-Sûre boundary

2005 LU-C-esch-sur-sure-pre-merger remains distinct from the incoming 2011 council and current enlarged commune.

## 13. Groussbus-Wal

Grosbous and Wahl predecessor rows remain historical; 2023 section returns bind current Groussbus-Wal council, effective merger 2023-09-01.

## 14. Bous-Waldbredimus

Two predecessors attach by explicit portal evidence; no inference based solely on hyphenated name.

## 15. EP not national parliament

LU-EP tier other and LU-PARLIAMENT national. Both directly elected assemblies, neither executive.

## 16. 2019 EP official

Selected 2019 XML typeResultat=OFFICIEL; earlier election-night XML is not projected as a duplicate.

## 17. Unofficial is not final

2017/2023 communal XML OFFICIEUX retained irrespective of bureaux completion.

## 18. Cast votes versus lists

Candidate and list rows have separate result_kind; do not sum both into national vote totals.

## 19. 1994 scope

Rows at commune_reporting_unit are components of one national/EP event, not elections of 118 extra commune councils.

## 20. Missing seats

Candidate.elected may be known while candidate.seats is null. Do not coerce null to zero.

## 21. Published zero

An actual list.seats=0 remains reported zero; distinguish from missing seats.

## 22. No invented date

A four-digit national event label has year precision and no month/day.

## 23. Exact field contract

20 tables and 223 unique table-column pairs, derived from retained previous contract; no padding columns.

## 24. Tier coverage

office IDs and draft tier IDs are exact equal sets, each approval false.

## 25. Source recovery

Every result source URL resolves to one source-inventory entry and a hash-verified local capture.

## 26. Corruption failure

Alter results bytes after SHA256SUMS generation: validator must fail hash check.

## 27. Dangling FK failure

Unknown event_id in a result is rejected even if hash checking is explicitly skipped for semantic test.

## 28. Scope protection

No importer, SQL, database, VPS, UI or git changes. applied_changes=0.

## 29. Approval protection

A true justin_approved or checked markdown box fails validation.

## 30. Calendar policy

Office/history retention is independent of the 18-month alert filter. No current office removed for distant next cycle.