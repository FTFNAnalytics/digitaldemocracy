# Belgium S2 acceptance examples

**Specifications, not executed importer/SQLite tests.** Review pack main `01602ea88de411fd712858e10e3f559d5ceb3ee1`; landing base `b293da99b97a8ae008d87ee2e57210cde0678004`. Justin accepted all 1,234 draft offices on 2026-09-19. O/E/R denote the authored register/events/results under data/research/belgium-s2. Each original locator resolves to retained bytes in the review pack. Deliberate CI mutations are labelled and never become research rows.

## 1. Out-of-window current office retained

O `/0`; original `data/research/belgium-s2/sources/ibz-current-communes-2026.xlsx` — `sheet=stat-1-1_f;row=4;columns=A:B`. Expected office remains current and municipal; next year metadata does not create an election event.
```json
{
  "office_id": "BE-11001-C",
  "office_status": "current",
  "next_date_resolution": "resolved",
  "next_history_key": null,
  "next_date": {
    "label": "2030",
    "precision": "year",
    "certainty": "expected",
    "year": 2030,
    "month": null,
    "day": null
  }
}
```


## 2. Historical-only jurisdiction retained

O `/1130`; original `data/research/belgium-s2/sources/fl-municipal-2018.xlsx` — `sheet=algemeen;row=30`. Its code is absent from July2026 roster but exists in a historic source. Keep office_status=historical and record_state=active; no inferred deletion or effective end date. Successor review remains open.
```json
{
  "office_id": "BE-46003-C",
  "geography_id": "BE-NIS-46003",
  "office_status": "historical",
  "record_state": "active",
  "effective_to_label": null
}
```


## 3. Empty frozen extract is not an election universe

Frozen PR #14 manifest.summary.office_records=0 and payload hash `454c334e45705cb11f239753641375ae462c23b8dcfc800710b83b2fe4d4d0d0` remain historical provenance. New O contains 1234 sourced rows from new inputs. A future refresh must not replace this register with zero because the old screening package is incomplete. Preserve both input sets and country coverage_status=partial.

## 4. Flanders2030 narrative is not a dated event

Source `sources/fl-election-scope.html`, main text saying site updates from October2029 for2030. O BE-11001-C next_election label2030 becomes one expected year-date; zero prospective event rows. October2029 is a website-update time, not an election date. Reject invented2030-10-13 and refuse window-based office exclusion.

## 5. Missing seats differ from explicit zero

R `/6`; `data/research/belgium-s2/sources/fl-municipal-2024.xlsx` — `sheet=lijsten;row=10`
```json
{
  "result_row_id": "result-08480e02590247a94765029c",
  "office_id": "BE-41002-C",
  "seats": 0,
  "seats_status": "zero"
}
```
R `/516`; `data/research/belgium-s2/sources/fl-municipal-2024.xlsx` — `sheet=lijsten;row=520`
```json
{
  "result_row_id": "result-589b451cdbcbc82715e90d8c",
  "office_id": "BE-73028-C",
  "seats": null,
  "seats_status": "unknown"
}
```
Never fill missing seat count from list rank or candidate elected flags.

## 6. Council ballots never become mayor votes

O `/1`; original `data/research/belgium-s2/sources/ibz-current-communes-2026.xlsx` — `sheet=stat-1-1_f;row=4;columns=A:B`. The municipal institution source proves a mayor office. Result rows for BE-11001-C remain on that council. Expected mayor election/result count=0 in S2; mayor appointment/control=NULL, not zero votes. Both current offices survive.

## 7. Regional/community overlap is one parliament

O `/1228`; original `data/research/belgium-s2/sources/institutions-web-2.json` — `Belgium.be named institutional page`. E `/1182`; source `data/research/belgium-s2/sources/ibz-regions-2014-2024.json` pointer `/7`. One124-seat Flemish parliament, no second community clone. All15 regional offices remain registered, but upcoming in-window regional calendar count is0. Historic regional depth is not a forthcoming alert.
```json
{
  "office_id": "BE-FL-P",
  "history_key": "BE-FL-P::2024::2024-06-09",
  "event_id": "event-fb50575be3efd990070a2a32",
  "tier": "regional"
}
```


## 8. Indirect assemblies retained without copied results

O `/1227`; original `data/research/belgium-s2/sources/institutions-web-1.json` — `Belgium.be named institutional page`; O `/1232`; original `data/research/belgium-s2/sources/institutions-web-1.json` — `Belgium.be named institutional page`. Senate60 and French Community94 seats are institutional capacities. No direct election rows manufactured; shared membership with other parliaments does not duplicate their public votes. Unknown appointment histories remain missing.

## 9. Bilzen date conflict withheld

E `/314`; `fl-municipal-2018.xlsx`, algemeen row1 and its Bilzen row; lijsten row2 and Bilzen list rows. Header says repeat16June2019; row date14October2018. Expected date_id=NULL/date_resolution=conflicting, legal_outcome=disputed, selected_history_role=other. Preserve both original claims and source HK; do not silently choose the header or row.
```json
{
  "office_id": "BE-73006-C",
  "history_key": "BE-73006-C::2018::2018-10-14",
  "date_id": null,
  "date_resolution": "conflicting",
  "event_kind": "unknown",
  "selected_history_role": "other"
}
```


## 10. Unresolved binding versus broken source FK

U `/1`; original `ibz-municipal-2000.json` `/93`, upstream record `165645`. Retain raw record and attach unresolved_evidence to its input locator; no invented office. Separate CI mutation: remove the resolved source row for BE-11001-C while leaving evidence_link; publication must fail closed. Do not turn a programming/FK error into an unresolved citation.

## 11. Province reporting districts are not offices

R `/9108`; `data/research/belgium-s2/sources/fl-province-2024.xlsx` — `sheet=lijsten;row=2`. Result token includes constituency; keep its raw constituency name/NIS. One province office/event has multiple distinct district vectors. Do not author15province offices, collapse repeated list names, or sum this vector with an aggregate from another source. Descriptive margins are omitted for this event.

## 12. Re-import fingerprint and attempt separation

Inventory /hash_inputs → candidate `country-package-belgium--sha256-697589ef03168fe60be3ed6a8c761dc455ce20b59453142d03053c2294498073`. Two future runs with byte-identical inputs and versions must produce that same R and distinct attempt IDs. Change one sourced result in an isolated fixture: new input hash/fingerprint/R, existing office/event keys preserved. This is a specification; no import was run.

## 13. Fixture rejection and failed publication

Isolated CI mutation of O /0/office_id to FIX-BE-11001-C must reject before publication even if tier is also altered. Poison a result office FK separately: roll back the entire Belgium staging transaction, persist the failed attempt outside staging, keep previous Belgium and all unrelated lineages served.

## 14. Incomplete refresh retains omitted rows

O `/0`; original `data/research/belgium-s2/sources/ibz-current-communes-2026.xlsx` — `sheet=stat-1-1_f;row=4;columns=A:B`. Isolated incoming partial package omits this office and its histories. Effective projection retains prior office/tier/history/result/source/crosswalk rows and hashes inherited bytes. A missing office row is not a withdrawal instruction. A later historical date outside the alert window still loads.

## 15. Unrelated citations and approval gate

Publication has Belgium L/R plus latin-america-fe5e91689def and country-package-new-zealand. Belgium-only refresh changes only its selected member; LatAm/NZ office rows cite their original lineage release. Justin accepted the Belgium tier file; this landing still does not run an importer. No receipt-based citation reassignment is inferred from completed mapping docs.

## 16. Historic depth is not certification

Wallonia2018 pages identify their figures as unofficial; retain result evidence_status=preliminary and event legal_outcome=preliminary. Older2012 comparison columns are raw-only, not extra completed histories. Saint-Josse2024 is held from selected history; a future accepted repeat needs its own primary dated source and preserved annulled claims.
