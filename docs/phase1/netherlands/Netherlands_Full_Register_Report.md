# Netherlands — full-register handoff, Prompt T

**Justin accepted 2026-09-19 (America/Edmonton): all 432 current + 69 historical draft offices.** New sourced research; not an import. Review pack pinned main `b293da99b97a8ae008d87ee2e57210cde0678004`. Research captured 19 September 2026; no Netherlands frozen Europe package is presumed. No importer/SQLite/VPS/UI changes. Standing policy: retain offices and historic rows even outside the ~18-month alert window.

The unit is an elected body/mandate, not a fabricated numbered seat. The register covers all 342 CBS municipalities,12 provinces and 21 current waterboards, both national chambers, the Netherlands EP delegation, three Caribbean island councils, four Senate electoral colleges,39 Rotterdam wijkraden and eight Amsterdam committees. Mayors are appointed: **no mayoral election or mayor office row is fabricated**. Waterboard reserved seats, dijkgraaf, provincial commissioners and cabinets are not treated as directly elected contests.

| Current office type | Offices |
|---|---:|
| senate | 1 |
| european_parliament_delegation | 1 |
| municipal_council | 342 |
| administrative_committee | 1 |
| district_committee | 7 |
| neighbourhood_council | 39 |
| senate_electoral_college | 4 |
| island_council | 3 |
| provincial_states | 12 |
| house_of_representatives | 1 |
| waterboard_general_board | 21 |

Proposed tiers, including histories: **414 municipal /12 regional /3 national /72 other**. Of municipal rows 345 are current (342 councils +3 island councils) and 69 historical. National stores as national_context. Waterboards/electoral colleges/submunicipal bodies use conservative other; EP delegation national-context scope is explicitly flagged. 147 focused-review rows keep those drafted tiers; Justin accepted the register universe.

**Historic depth:** municipal 2014,2018,2022,2026; provincial/waterboard 2023; Tweede Kamer 2021,2023,2025; Senate/island councils/electoral colleges 2023; EP 2024; Amsterdam/Rotterdam 2026. All 432 current offices have at least one linked historic event. This does not establish exhaustive history or certification. Raw candidate preferences and reporting-level duplicates remain retained, not additional body-level results.

**Window affects alerts only.** The 340 municipal councils outside the named merger retain expected **March 2030** metadata (month precision). Tweede Kamer’s published ordinary date 15 May 2030 remains expected with dissolution caveat. These do not become invented prospective events. Twelve provincial assemblies have sourced 17 March 2027 next-date metadata; a future regional calendar may display those 12 after tier acceptance. Zero prospective event rows are authored. Caribbean bodies remain Dutch but carry a separate geographic scope; they must not enter a geographic-Europe numerator merely from country_id.

## Primary evidence and limits

- [CBS 2026 municipality/province roster](https://www.cbs.nl/nl-nl/onze-diensten/methoden/classificaties/overig/gemeentelijke-indelingen-per-jaar/indeling-per-jaar/gemeentelijke-indeling-op-1-januari-2026) anchors current 342 membership; exact XLSX bytes and row locators are retained.
- [Kiesraad government open-data catalogue](https://data.overheid.nl/dataset/verkiezingsuitslagen-gemeenteraad-2026) and its historical datasets supply results. Several README files expressly call CSVs research derivatives, not official certified election determinations. Aggregated polling-station/municipality totals are identified as reported subtotals, not independently certified whole-election counts.
- [Kiesraad institutions/calendar](https://www.kiesraad.nl/verkiezingen) distinguishes direct councils, indirect Senate, waterboard reserved seats and Caribbean electoral colleges. [Amsterdam 2026](https://onderzoek.amsterdam.nl/dataset/verkiezingen-gemeenteraad-stadsdeel-en-bestuurscommissies-2026) and [Rotterdam wijkraden](https://uitslagen.stembureausinrotterdam.nl/wijkraadsverkiezing26/wijken) provide submunicipal identities and results. [Municipal appointment explanation](https://www.reimerswaal.nl/nieuwe-burgemeester) documents appointed mayors.

## Named open research and acceptance issues

1. **2026 municipal omissions:** NL-GM0402-C, NL-GM1696-C are Hilversum and Wijdemeren. Primary sources announce their joint 18 November 2026 merger election for a new municipality starting 1 January 2027. Retain both current offices/history; hold successor binding as one unresolved claim. Their next_date is NULL, with the announced dated watch retained raw, rather than falsely assigning 2030 or inventing two events. Catalogue also lists a Gorinchem archive; reconcile revisions before claiming certified completeness.
2. **2022 pre-publication:** source archive leesmij.txt lists outstanding recount updates for De Wolden, Dordrecht, Hardinxveld-Giessendam, Maassluis, Oegstgeest, Olst-Wijhe and Wageningen; missing Resultaat files for Bloemendaal, De Wolden and Westerwolde; elector/seat corrections. Preserve original claims and preliminary status, never silently apply README numeric corrections as accepted overrides.
3. **2018 station coverage:** Gooise Meren and Olst-Wijhe missing from station dataset. Other source sums still need reconciliation against certified body-level totals. Older municipal/merger/special/repeat contests and pre 2023 provincial/waterboard/island histories are not exhaustive.
4. **69 historical codes:** not present in current roster; retain historical offices, no invented abolition date or successor transfer. Existing-code boundary changes require comparability review.
5. **Meaning of votes:** Senate unweighted selector votes project to votes; weighted counts stay separate raw claims. No weighted/unweighted denominator mixing. List seat fields absent from source remain NULL, not zero. Amsterdam candidate and municipal OSV revisions are retained raw; no duplicate municipal event is added.
6. **Universe audit boundary:** the statutory nationwide elected-body categories above are covered. Identified Amsterdam/Rotterdam elected submunicipal bodies are included; a nationwide audit for any additional elected advisory bodies is still open. Appointed executives, occupational/university councils and individual politician-seat rosters are outside this body-level political register. This is not a claim to enumerate every public position.
7. **Leeuwarderadeel 2014:**860 raw rows collapse to 10 station/list keys under `Blanco (lijst )`, including 617 identical records. The one authored result observation retains original evidence but withholds votes (NULL/unknown, evidence disputed); event is other/disputed. Raw arithmetic sum is unaccepted, not a repaired election total.
8. Date precision remains source-specific: some historic CSVs identify year only; no day is inferred from a presumed national cycle. Exact dates can later be reconciled by retained identity crosswalk, not duplicate insertion.

## Justin decisions — 2026-09-19

- [x] Accept register and body-level granularity (432 current + 69 historical).
- [x] Accept the register universe at drafted geographic tiers. Focused-review rows (~147) keep drafted tiers; they are not a hold of the offices.
- [x] Accept historical coverage qualifications; named gaps stay open research notes.
- [ ] Resolve Hilversum/Wijdemeren merger successor binding. **HOLD — research note stays open.**
- [ ] Authorize a future importer separately; this landing does not unblock publication by itself.
