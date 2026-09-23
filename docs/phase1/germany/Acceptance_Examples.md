# Acceptance examples

These are research invariants, not evidence of full scope completion. validate.py checks the underlying data, arithmetic, integrity and negative controls.

| ID | Topic | Expected behavior |
|---|---|---|
| A01 | Research-only | metadata.applied_changes is 0; all approval flags false; no production release. |
| A02 | Current municipalities | 10,747 municipality codes and 196 non-municipal areas; two of the latter have separately sourced elected inhabitants’ councils. |
| A03 | Municipal councils | 10,718 current municipal council rows; 27 SH assemblies and Berlin/Hamburg shared bodies do not get invented councils. |
| A04 | County bodies | 294 Kreis/special-equivalent councils; 107 independent-city-level territorial units are not duplicated as Kreis councils. |
| A05 | All Länder | Exactly 16 current Land parliament rows, including Berlin, Hamburg and Bremen. |
| A06 | Federal President | One indirect office; every presidential event electorate is federal_convention. |
| A07 | Convention ballots | All 17 conventions, 26 ballots from 1949–2022; candidates, explicit No, invalid and abstentions reconcile to ballots cast. |
| A08 | Bundesrat | No popular Bundesrat office or result event. |
| A09 | Land executives | No invented popular Minister-President, Senate or Chancellor office. |
| A10 | BW Landräte | No direct Landrat office in Land 08; Kreis councils remain. |
| A11 | SH Landräte | No direct Landrat office in Land 01; mayor scope explicitly incomplete. |
| A12 | NI members | No direct mayor for any NI municipality in a Samtgemeinde; Samtgemeinde council/executive exist. |
| A13 | One tier each | Office IDs and draft-tier IDs are exactly equal multisets with one row each. |
| A14 | Field map | Exactly 223 unique table.column entries over 20 inherited tables; operational_write=false. |
| A15 | Missing versus zero | Nulls and exact zeros remain distinct; a dash becomes zero only with an explicit source legend. |
| A16 | Weighted votes | Bavarian council weighted figures have votes=null and source raw weighted counts preserved. |
| A17 | Federal cycles | 22 Bundestag event versions: ordinary cycles 1949–2025 plus the partial-repeat update. |
| A18 | Berlin repeat | 2021 original Bundestag, 2024 partial update and 2023 Land repeat have distinct event identities. |
| A19 | EP history | One current Germany EP office; ten popular EP cycles 1979–2024; no result invented for 2029. |
| A20 | Reporting geography | All results reference a reporting unit, every unit an event, and every event a registered office. |
| A21 | Source provenance | Every normalized source reference resolves to retained bytes and a source URL with matching hash. |
| A22 | No guessed succession | 26 source-coded whole-unit territorial relations preserve both dates/provenance and explicitly do not assert office continuity. |
| A23 | Bremen | Land and Stadtbürgerschaft are distinct; 22 Beiräte and Bremerhaven council exist. |
| A24 | Other elected tiers | Seven Bavarian Bezirkstage, 12 Berlin BVV, seven Hamburg districts and three regional assemblies present. |
| A25 | Preliminary remains preliminary | NI 2026 events retain official_preliminary, distinct from final results. |
| A26 | Saxon ballot rules | Source second ballot is labelled second_ballot; no invented top-two mathematics. |
| A27 | Source conflicts | Berlin 2026 exports provide no normalized numbers; the original Hamburg panel remains with its independently evidenced 1993 resolution. |
| A28 | Alert-window policy | One calendar row per current office; offices with no exact next date or year 2029 remain present. |
| A29 | Land arithmetic | Comparable published Land vote/seat totals reconcile; 15 conflicting seat panels and Bavaria 1950 party votes remain withheld. |
| A30 | Bavaria councils | 2,127 council contests include all 2,056 municipality and 71 Landkreis councils; party seat sums reconcile. |
| A31 | Unoccupied seats | Separately published unoccupied NI seats and Saxon statutory/occupied-seat differences are preserved without invented winners. |
| A32 | No future history | All historical event dates are at or before 2026-09-23; calendar rows do not create result events. |
| A33 | Negative control: duplicate tier | Validator rejects duplicate office-tier identity in a local in-memory control. |
| A34 | Negative control: dangling event | Validator rejects an event that references an unregistered office in an in-memory control. |
| A35 | Negative control: altered bytes | SHA-256 changes when fixture bytes change; the manifest comparison rejects the mismatch. |
| A36 | Negative control: wrong mechanism | A fabricated popular presidential electorate fails the indirect-office predicate. |
| A37 | Geographic mode audit | All 10,747 municipalities have a separate executive-mode disposition; unresolved SH is explicit. |
| A38 | Integrity versus completeness | A passing validator does not change research_coverage_complete=false or any Justin approval. |
| A39 | NRW boroughs | 141 current councils, including five current Krefeld boroughs; all 2025 borough seat totals reconcile. |
| A40 | Saxony local bodies | 863 source-coded current local councils: 853 Ortschaft councils plus ten Dresden borough councils. |
| A41 | Munich boroughs | 25 distinct Bezirksausschüsse; only source whole-borough totals normalize. |
| A42 | NI inhabited districts | Lohheide and Osterheide inhabitants’ councils included; their administrative heads are not invented direct offices. |
| A43 | Land numerical quarantine | All normalized seats are null in 15 conflicting panels; Bavaria 1950 contestant votes remain null. |
| A44 | Brandenburg special dates | 413 council returns, with Hirschfeld 10 March and Bad Liebenwerda/Cottbus 22 September 2024 explicitly qualified. |
| A45 | RP missing identities | Two root endpoints without candidate identifiers do not create events or results. |
| A46 | Partial universes | RP/NRW absent No votes and incomplete seat columns have null reconciliation targets; no residual is fabricated. |
| A47 | MV preliminary recovery | 2026 first/second votes have separate reconciled preliminary units; direct mandates are not full allocation seats. |
| A48 | Historical body identity | Six former body identities stay historical-only; pre-FRG/West Berlin footprints are explicit. |
| A49 | Territorial crosswalk audit | Every source-coded relation resolves both offices and source locator; all whole-unit relations have office_continuity_asserted=false. |
| A50 | Raw electoral dispositions | All RP retained endpoints have a disposition, including unavailable/pre-start/partial returns. |
| A51 | Ordinary cycle anchor | Saxon consolidated local return dates are cycle anchors; unknown repeat dates are not invented. |
