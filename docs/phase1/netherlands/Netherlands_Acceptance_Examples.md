# Netherlands acceptance examples

Main `b293da99b97a8ae008d87ee2e57210cde0678004`. O/E/R shorthand follows Field Map. **Specifications for a future importer; execution Not run.** Deliberate poison/fixture examples below are not authored research data. Every real ID and original locator is drawn from the retained research tables.

## 1. Out-of-window council retained

O `/129`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; row=3; columns=A:F`. Aalsmeer remains current irrespective of alerts. Source kiesraad-gr.html main gives March 2030; expected next metadata has month precision and no invented polling day.
```json
{
  "office_id": "NL-GM0358-C",
  "office_status": "current",
  "record_state": "active",
  "tier": "municipal",
  "next_history_key": null,
  "next_date": {
    "label": "2030-03",
    "precision": "month",
    "certainty": "expected",
    "year": 2030,
    "month": 3,
    "day": null
  }
}
```


## 2. Historical-only council retained

O `/2`; `data/research/netherlands/sources/verkiezingsuitslagen-gemeenteraad-2014.zip` locator `member=GR2014_Stemmen_Per_Lijst_Per_Gemeente_Per_Stembureau.csv; CSV data rows 1,8,15,22,29,36 (1-based excluding header)`. E `/2`. Source code is absent from 2026 CBS roster; retain office_status=historical/record_state=active, no invented boundary end date or successor rebinding.
```json
{
  "office_id": "NL-GM0003-C",
  "geography_id": "NL-GM0003",
  "office_status": "historical",
  "record_state": "active",
  "effective_to_label": null
}
```


## 3. Appointed mayor is not an election

sources/mayor-appointment.html, primary municipality main text on royal appointment and 6 year term. O contains 342 municipal councils,0 mayor offices and 0 mayoral election/results. Do not duplicate O `/129`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; row=3; columns=A:F` into a mayor contest. Missing mayor election is inapplicable, not zero votes.

## 4. Explicit zero seats versus absent seats

R `/12461`; `data/research/netherlands/sources/verkiezingsuitslag-eilandsraad-2023.csv` locator `CSV data rows 106,107 (1-based excluding header)`
```json
{
  "office_id": "NL-O9001-ER",
  "result_row_id": "result-13c6a7ec8040889ca64d91ee",
  "seats": 0,
  "seats_status": "zero"
}
```
R `/17`; `data/research/netherlands/sources/ep2024.csv` locator `CSV data rows 187988 (1-based excluding header)`
```json
{
  "office_id": "NL-EP",
  "result_row_id": "result-cbe842e437c2264f75c845d3",
  "seats": null,
  "seats_status": "unknown"
}
```
One collapsed 2014 vector also has withheld votesNULL/unknown/disputed; no result has an invented vote 0; source absent seat metrics stay NULL, even when the party plausibly won none.

## 5. Honest regional calendar

O `/467`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; columns=E:F; ProvinciecodePV=PV20`. Tier draft derives from Provinciale Staten institution, not date/cohort. kiesraad-ps.html main supplies 17 March 2027. Expected after approval:12 regional offices,12 sourced in-window next-date metadata rows; no prospective event duplication.
```json
{
  "office_id": "NL-PV20-PS",
  "tier": "regional",
  "next_date": {
    "label": "2027-03-17",
    "precision": "day",
    "certainty": "expected"
  },
  "next_history_key": null
}
```
A hypothetical package subset with 0 regional offices is also valid and must render honest empty state.

## 6. Partial historic date preserved

E `/2`; data/research/netherlands/sources/verkiezingsuitslagen-gemeenteraad-2014.zip — member=GR2014_Stemmen_Per_Lijst_Per_Gemeente_Per_Stembureau.csv; CSV data rows 1,8,15,22,29,36 (1-based excluding header). The extract supports 2014 cycle here; no exact day is transcribed.
```json
{
  "history_key": "NL-GM0003-C::2014::2014",
  "event_id": "event-b44ffceb81a7151f177664c6",
  "date": {
    "label": "2014",
    "precision": "year",
    "certainty": "called",
    "year": 2014,
    "month": null,
    "day": null
  }
}
```
A later exact-day source refines this event with preserved original alias; it must not create a duplicate history.

## 7. Senate weighted versus unweighted

R `/0`; `data/research/netherlands/sources/verkiezingsuitslag-eerste-kamer-20233.zip` locator `member=EK2023_uitslag.csv; CSV data rows 86,102,103 (1-based excluding header)`
```json
{
  "office_id": "NL-EK",
  "event_kind": "indirect",
  "votes": 17,
  "source_metrics": {
    "LijstAantalZetels": 2,
    "LijstAantalGewogenStemmen": 4866,
    "LijstAantalStemmen": 17
  },
  "share": null,
  "share_status": "unknown"
}
```
votes is the supplied unweighted selector ballot count. LijstAantalGewogenStemmen remains separate raw evidence. Never divide weighted votes by 616 selector ballots or infer certified percentage/margin.

## 8. Sparse list-number join without duplicate result

R `/12768`; `data/research/netherlands/sources/verkiezingsuitslag-tweede-kamer-2025.zip` locator `member=TK2025_uitslag.csv; CSV data rows 10,30157 (1-based excluding header)`
```json
{
  "office_id": "NL-TK",
  "history_key": "NL-TK::2025::2025-10-29",
  "source_row_id": "list-1",
  "candidate_or_list_label": "PVV (Partij voor de Vrijheid)",
  "votes": 1760966,
  "seats": 26
}
```
In TK 2025 country aggregate the seat metric can omit list number. Exact region+label maps to one numbered vote list, so one result holds both metrics. If two distinct numbered lists matched the same label, stop/retain unresolved; never merge by party-family guess. Expected TK 2025 result count 27, not 42.

## 9. Provisional 2022 is not certification

R `/101`; `data/research/netherlands/sources/data-gemeenteraad-2022--GR2022_2022-03-29T15.14.zip` locator `member=01_Groningen/Telling_GR2022_Groningen.eml.xml; XPath=(//eml:TotalVotes/eml:Selection)[1]`. Source archive leesmij.txt explicitly says pre-publication and names recount gaps. Expected result evidence_status=preliminary, event legal_outcome=preliminary. Telling 510 list returns and Resultaat 520 elected candidates describe the same event; do not add 333 extraevents or candidate votes to list totals.

## 10. Merger watch needs successor binding

O `/159`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; row=134; columns=A:F`; O `/388`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; row=322; columns=A:F`. U `/0`; sources/kiesraad-mergers.html main and sources/wijdemeren-election-2026.html main name 18 November 2026 and newHilversum 1 January 2027.
```json
{
  "current_offices_retained": [
    "NL-GM0402-C",
    "NL-GM1696-C"
  ],
  "next_date_id": null,
  "next_date_resolution": "unknown",
  "announced_claim": {
    "date": "2026-11-18",
    "precision": "day",
    "certainty": "called",
    "successor_binding": "pending"
  },
  "invented_successor_office_rows": 0,
  "prospective_event_rows": 0
}
```
Expose the named watch; preserve one unresolved source claim on retained input, not two elections or fabricated current-office binding.

## 11. Resolved FK failure versus intentional unresolved claim

U `/0` is intentional unresolved successor binding with original text and real input locator. Separate isolated CI mutation: delete the source row referenced by R `/101`; `data/research/netherlands/sources/data-gemeenteraad-2022--GR2022_2022-03-29T15.14.zip` locator `member=01_Groningen/Telling_GR2022_Groningen.eml.xml; XPath=(//eml:TotalVotes/eml:Selection)[1]`. The existing resolved evidence_link must fail FK validation and rollback; do not relabel that programming error as unresolved_evidence.

## 12. Candidate and list universes remain separate

R `/6214`; `data/research/netherlands/sources/rotterdam-afrikaanderwijk.html` locator `XPath=(//tr[contains(@class,"result-list-party-container")])[1]`
```json
{
  "office_id": "NL-GM0599-WR-afrikaanderwijk",
  "candidate_or_list_label": "Abdillahi, A. (Ahmed) (m)",
  "votes": 286,
  "share": 14.8,
  "elected_flag": 1
}
```
Rotterdam candidate vector uses candidate_marks with supplied percentage. Do not attach it to municipal council NL-GM0599-C, infer a party, or sum with council list ballots. No day is fabricated from 2026 page label.

## 13. Re-import and corrected-source fingerprint

Inventory /hash_inputs yields R `country-package-netherlands--sha256-63eb6c893dfd62029b9c2b400075a8beddde4675a454d4621743eaf930fb8e48`. Two future runs with identical effective bytes/versions must have that sameR and different attemptUUIDs. Isolated corrected input changes its SHA andR, not unrelated office IDs. An accepted tier also changes R. This is documentary hashing, not an executed import.

## 14. Incomplete refresh preserves omitted offices

O `/129`; `data/research/netherlands/sources/cbs-municipalities-2026.xlsx` locator `sheet=Gemeenten_alfabetisch; row=3; columns=A:F`. Isolated partial incoming package omits this office/history. Effective data keeps previous office, tier, source, dates, histories and results; include inherited byte hashes. Do not overwrite with zero or treat omission as withdrawal. The alert-window filter never participates in deletion.

## 15. Fixture exclusion and poison rollback

Isolated fixture mutation of O /0 office_id to FIX-NL-TK must reject even if tier also changed. Separate result with nonexistent officeFK fails the whole staged Netherlands transaction. Durable attempt log records failure outside staging, while last good Netherlands and every other lineage remain served. Not run.

## 16. Publication set and draft gate

Netherlands-only update retains Belgium, early-Europe, LatAm andNZ release members. Office citations use owning(L,R), never latest receipt. Draft tier status blocks production; unflagged rows are not approved. No `/electiondatabase` redirect or deployment follows from mapping completion.

## 17. Island councils versus electoral colleges

O `/461`; `data/research/netherlands/sources/verkiezingsuitslag-eilandsraad-2023.csv` locator `CSV data rows 5,6 (1-based excluding header)`; O `/462`; `data/research/netherlands/sources/verkiezingsuitslag-kiescolleges-2023.csv` locator `CSV data rows 184,185 (1-based excluding header)`. SameBonaire geography, different directly elected bodies and result vectors. Proposed island tier municipal versus electoral-collegeother requires review; both geographic_europe_alert_eligible=false. Never fabricate a province or merge their ballot totals.

## 18. Waterboard elected component and scope

O `/480`; `data/research/netherlands/sources/data-waterschappen-2023--Verkiezingsuitslagen_Waterschappen_2023_(CSV_formaat).zip` locator `member=AB2023_Stemmen_Per_Lijst_Per_Waterschap_Per_Gemeente.csv; CSV data rows 2878,2935,2968,3084,3105,3114,3171,3228,3249,3270,3379,3412,4024,4057,4374,4589,5040,5281,5290 (1-based excluding header)`. kiesraad-ws.html distinguishes elected inhabitants and appointed reserved-interest seats. Keep 21 functionalboardoffices, proposedother; no invented dijkgraaf election or direct vote for reserved seats. Province overlap is legitimate and does not create duplicate offices.

## 19. Collapsed 2014 source vector withheld

R result for NL-GM0081-C /2014 /Blanco (lijst ); U /1. Original GR 2014 CSV has 860 rows under 10 station/list keys and 617 identical repeats. Retain every byte and original locator; one disputed observation has votes=NULL, votes_status=unknown, evidence_status=disputed; event selected_history_role=other. The arithmetic source sum stays unaccepted raw. Do not deduplicate equal values or manufacture party identities to fix the source.
