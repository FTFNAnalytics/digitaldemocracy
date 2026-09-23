# Worked acceptance examples

## 1. 68-council denominator

Register has exactly 54 Malta and 14 Gozo local councils, matched against the Address Registrar; each has one mayor and one deputy row.

## 2. Distinct Rabat offices

Ir-Rabat (Malta) and Ir-Rabat (Għawdex) resolve to different office IDs.

## 3. Distinct Żebbuġ offices

Malta and Gozo Żebbuġ remain different legal offices, never name-only joins.

## 4. No presidential popular tally

2024 President selection has House_resolution basis and unknown parliamentary tally; popular first preferences/share are absent.

## 5. No retroactive supermajority

2019 President event is not described as operating under the 2020 two-thirds amendment.

## 6. Mayor majority route

A leading first-count councillor of the absolute-majority party may assume office under article 25; this does not create a second ballot.

## 7. Mayor fallback route

Where article 25(1)/(2) does not fill the post, councillors elect the mayor/deputy. Do not apply a national direct-executive template.

## 8. Regional footing

Include six elected regional presidencies; do not create a popular regional parliament or elected appointed administrative staff.

## 9. Regional nominations are not wins

The four sole nominees in regional-nominations-not-results.json retain elected=null pending an outcome source.

## 10. Historic Gozo separation

1961 Gozo Civic Council and presidency remain historical rows with no invented successor edge.

## 11. Mtarfa creation gate

Do not add Mtarfa to a 1993 founding denominator or infer a merger from its 1999 creation.

## 12. Staggered local cycles

2013 and 2015 each have 34 council events; together they form the preceding ordinary return for every council, not 68 events in each year.

## 13. Mdina no poll

2024 and 2019 source notices explicitly say no election was held. Five returned candidates have null vote fields, not fabricated zero first preferences.

## 14. Floriana 2019 count 1

Published 23 non-transferable papers at count 1 reconcile candidate tallies to 1,379 valid votes; do not force candidate totals to equal valid ballots alone.

## 15. Separate STV measures

Candidate first preferences appear once in results. Later tallies and signed deltas remain in stv-counts.json; never sum 64,204 observations as votes cast.

## 16. Missing delta

An ellipsis transfer remains null with transfer_raw preserved. A reported numeric zero remains numeric zero.

## 17. Count-of-election tally

An elected card may display a later tally. Do not copy that into first preferences; use the Count 1 cell.

## 18. Initial versus replacement

Explicit elected-count markers disambiguate original winners from later casual/co-opted entries in mixed return displays.

## 19. Candidate identity

Within-source candidate IDs resolve spacing variants, such as Chetcuti, Claire; name normalization alone is not a cross-cycle person ID.

## 20. Thirteen reporting districts

One House event contains thirteen initial five-seat reporting units; there are no thirteen invented parliament offices.

## 21. Two-district candidacy

The same person may have two source candidate observations; do not count those as two people in a membership roster.

## 22. 2026 date conflict

Event polling is 30 May 2026, from EC declarations. The portal summary label 27 April 2026 survives as a conflict annotation.

## 23. Additional seats

Article 52 awards two seats on 31 May and Article 52A awards twelve on 16 June 2026; no fresh popular votes are attached.

## 24. EP entitlement change

Retain the initial five-seat 2004 and 2009 contests separately from later six-seat entitlement.

## 25. EP evidence phases

2024 party vote shares are final results; seats are constitutive-session values. Neither is silently called a preliminary projection or independently certified Gazette transcription.

## 26. Reported zero seats

EP Other parties has reported seats=0. Unknown candidate seats remain null.

## 27. No guessed party merger

Original labels such as AD + PD and predecessor labels stay source-native until reviewed party alignment.

## 28. Boundary comparability

Same council identity does not guarantee identical historical boundary polygons; comparison remains boundary-qualified.

## 29. Tier equality

Every office, current or historical, has exactly one draft tier row and no orphan classification.

## 30. Field contract

Exactly 223 unique table/column pairs match the retained 20-table contract; no padding columns.

## 31. Source recoverability

Every source ID resolves to a retained file with an exact SHA-256 hash and declared capture kind.

## 32. Tamper rejection

Changing results.json bytes after manifest creation makes the validator fail.

## 33. FK rejection

A result whose event_id is unknown fails semantic validation, even if hashes are intentionally bypassed in the validator self-test.

## 34. Approval rejection

Any true justin_approved or checked Justin box fails; all review boxes remain unchecked.

## 35. Operational boundary

applied_changes remains zero; no database, importer, UI, VPS or repository changes.

## 36. Alert policy

2029/2031 ordinary horizons do not remove offices/history. Future exact days stay null absent a verified call.
