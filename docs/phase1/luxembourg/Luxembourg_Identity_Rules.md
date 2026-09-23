# Luxembourg identity and evidence rules

Research-only proposed identities; no importer or database code. Applied changes: 0.

1. Current office denominator is 100 communes, independently matched name-for-name against government Geoportail collection 302 (100 returned/100 matched, sync 2026-09-20). Parliament and EP add two offices. Canton/district labels do not create regional elected offices.
2. Office unit is the elected body, not each councillor seat. No Grand Duke, cabinet/PM, mayor or college executive rows: these are not separate popular offices.
3. IDs LU-C-<explicit commune key>, LU-PARLIAMENT and LU-EP are proposed research IDs. Normalize accents/punctuation only after resolving the explicit source-to-commune mapping. Never infer a historical merger from a similar name.
4. Esch-sur-Sûre, Clervaux and Schengen in 2005 and Wiltz through 2011 carry -pre-merger IDs. These are different territories from the current same-name council. The official fusion page explicitly establishes the predecessor membership. Missing effective days remain null.
5. Aerenzdallgemeng maps to Vallée de l'Ernz; historical source Remerschen maps to the pre-merger Schengen identity. These are recorded labels, not new councils. Raw names remain untouched.
6. The 2011 Käerjeng Bascharage/Clemency and 2017 Habscht Hobscheid/Septfontaines records are electoral sections of a single incoming council. Internal SECTION elements likewise attach to the parent commune; never manufacture a council per section.
7. Event ID is office ID + @ + sourced date/year. Election organized before a merger takes effect elects the incoming body where source says so; it is not a claim that the legal merger already took effect on polling day.
8. Uncontested returns may appear in the ordinary-cycle file. An all-elected, all-zero candidate group is classified as an uncontested source return, with raw zeros retained and normalized votes null/not_applicable_uncontested. This is not zero support or a competitive election.
9. Source ID is LUS- plus first 24 SHA-256 hex characters of exact URL; result ID is LUR- plus 24 hex characters of SHA-256(source URL + | + locator + | + event ID). Include reporting level/section and exact source locator. Do not deduplicate different geographical observations by candidate name.
10. National, constituency and commune-level reporting vectors are alternative granularities. Do not sum national totals with their geographical components, or candidate votes with list totals. Luxembourg panachage totals count votes, not one voter per party. No swing/volatility metric computed.
11. Candidate votes in 1994 commune breakdowns do not establish whether that candidate won a national seat. elected_flag remains null there. Constitutive EP seats are a distinct seat-allocation observation.
12. Published zero seats and genuine cast zero votes remain zero. Missing shares/seats remain null. No missing opponent, total, runoff, date, seat or successor invented.
13. Source files labelled OFFICIEUX remain unofficial even when 100% of bureaux reported. 2019 EP OFFICIEL and Berdorf proclamation have their own statuses. Retained parliamentary 1994 PDFs are primary evidence but their mere inclusion does not certify HTML-derived rows.
14. Fingerprint is canonical sorted path/hash inventory plus contract/map/method version and accepted tier/override bytes; clocks and attempt IDs do not enter stable identity. Unchanged future import must preserve IDs; changed source evidence creates a new release while preserving prior provenance. No such import was run.
15. Reject broken known FKs, duplicate IDs, corrupt hashes, unexpected current office denominator and checked approvals. A structural validation pass is not proof that every historical supplemental election has been researched.

16. The 1994, 1999 and 2004 EP HTML candidate figures are nominative votes excluding list votes. Their vote_basis is explicitly candidate_nominative_votes_excluding_list_votes. From 2009 the selected EP candidate vectors include list-derived votes. These are not comparable without a documented transformation.
