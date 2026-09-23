# Slovakia full-register research handoff

## One-page summary

Pinned `FTFNAnalytics/digitaldemocracy` main at `89726607439fa6726e7c34e30eec45357230d318` on 2026-09-21. This new research pack contains **5,871 current offices**, **0 historical-only offices recovered**, **17,569 historical cycles**, **5,868 prospective cycles**, **19 round proceedings** and **115,217 result rows**. Zero recovered historical-only offices is a named research gap, not an assertion that no abolished bodies existed.

Current scope is reconciled from official 2022 electoral rosters against the 2026 electoral territorial file: **2,887 municipalities +39 Bratislava/Košice city parts**, each with a council and direct mayor; **8 VUC assemblies +8 direct chairs**; National Council, direct President, and EP delegation. There are **2,935 direct-executive offices** and **2,936 councils/assemblies/chamber/delegation offices**. Military areas and the overseas voting category are not elected local offices. No appointed okres governor, PM/cabinet or referendum body is added.

Draft tiers: **5,774 municipal /16 regional /2 national /79 other**. The 79 focused tier reviews are 78 city-part offices and 1 EP delegation. All classifications remain `draft_for_human_review`; a focused flag=false is not approval. The 16 proposed regional offices are source-evidenced VUC bodies, not a calendar-label inference.

History covers local 2014/2018/2022, VUC 2013/2017/2022, National Council 2016/2020/2023, President 2014/2019/2024, and EP 2014/2019/2024. Local 2014/2018 council results are **elected-only**, not complete candidate vectors. 44 local office/cycle combinations have no recovered result and remain explicit gaps. Presidential and 2013 VUC-chair runoffs are proceedings, not double-counted histories.

Official call 145/2026 supplies **24 October 2026** for prospective local/VUC elections. Unknown national/EP next dates remain NULL. The alert window filters alerts only: all offices/history remain present. Historic territorial reconstruction, older cycles, repeat elections/certification, unkeyed candidate homonyms and EP mandate changes remain open. There are no computed margins or invented totals.

**Research validation only. Importer / SQLite / VPS / UI / repository changes=0; execution CI Not run.** Justin approval boxes remain unchecked. Complete mapping does not mean complete research or publishable approved data.

## Scope counts

| Body | Current offices | Draft tier | Mode |
|---|---:|---|---|
| Municipal councils |2,887|municipal|direct popular|
| Municipal mayors |2,887|municipal|direct popular|
| City-part councils |39|other, focused review|direct popular|
| City-part mayors |39|other, focused review|direct popular|
| VUC assemblies |8|regional|direct popular|
| VUC chairs |8|regional|direct popular|
| National Council |1|national|direct popular|
| President |1|national|direct popular, rounds retained|
| EP delegation |1|other, focused review|direct popular list|
| **Total** |**5,871**|**draft**| |

## Primary evidence and current-roster reconciliation

- [Official election catalogue](https://volby.statistics.sk/tree.html): exact retained CSV/XLSX returns, territories and cycle pages. All 187 source artifacts have hashes in Slovakia_Input_Inventory.json.
- [2022 local territory](https://volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dd.csv):2,924 rows; [two citywide rows](https://volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dx.csv) add Bratislava 582000 and Košice 599981.
- [2026 official territorial archive](https://volbysr.sk/files/REF2026_SK_csv.zip), member REF2026_SK_tab0b.csv:2,927 electoral localities. Excluding military Záhorie 500267, Lešť 518581 and Cudzina 599999 leaves exactly the 2,924 local rows in the 2022 register. Citywide bodies remain evidenced separately; a referendum territorial source does not create referendum offices/events.
- [Interior Ministry territorial list](https://www.minv.sk/?uzemne-a-spravne-usporiadanie-slovenskej-republiky&subor=233491): official parent-city and territorial context. The undated PDF includes military areas, including obsolete Javorina, so it is not treated alone as the current elected-office register.
- [Election Act 180/2014, effective 2026-06-01](https://static.slov-lex.sk/static/SK/ZZ/2014/180/20260601.html): §182(4)/§189(4) separate municipal council and direct mayor ballots; §150(4)/§157(4) regional assembly/direct chair. Historical 2013 round evidence is retained independently of current mechanism.
- [Call 145/2026, page 1 point 1](https://www.minv.sk/?volby-samosprava26&subor=570716):24 October 2026. The call is a prospective date, not evidence of nominated candidates or completed returns in every jurisdiction.

## Historical depth and result grain

| Cycle | Historical office cycles | Result rows | Grain / limits |
|---|---:|---:|---|
|EP2014|1|29|National party vector only; no territorial double-count|
|EP2019|1|31|National party vector only; no territorial double-count|
|EP2024|1|23|National party vector only; no territorial double-count|
|NRSR2016|1|23|National party vector only; no territorial double-count|
|NRSR2020|1|24|National party vector only; no territorial double-count|
|NRSR2023|1|25|National party vector only; no territorial double-count|
|OSO2014|5,843|29,459|Mayor candidates + elected-only council members|
|OSO2018|5,836|27,951|Mayor candidates + elected-only council members|
|OSO2022|5,833|48,826|All published local candidate rows; citywide tables separate|
|PRE2014|1|16|First and runoff candidate rows, one cycle|
|PRE2019|1|17|First and runoff candidate rows, one cycle|
|PRE2024|1|13|First and runoff candidate rows, one cycle|
|VUC2013|16|2,651|Candidate rows; first/runoff chair proceedings|
|VUC2017|16|2,994|Candidate rows by regional district/body|
|VUC2022|16|3,135|Candidate rows by regional district/body|

## Named open gates

- **SK-HISTORICAL-UNIVERSE** (all local offices / predecessors): Selected 2014,2018,2022 local registers reconcile to the same recovered codes; no historical-only row is inferred. Earlier1993–2010 contests and abolished/re-established bodies need primary territorial/electoral binding. The retained2003 Interior Ministry changes book covers1990–2001, not a current census. Required: Dated official creation/abolition records and matching result register; no guessed successor edges.
- **SK-LOCAL-OLDER-VECTORS** (2014 and 2018 councils): 41,647 elected-only candidate rows are preserved. Losing-candidate votes, complete ballot vectors and many district bindings are not supplied by these chosen lists. Required: Original all-candidate district returns; do not infer missing votes, seat1 or a zero for absent candidates.
- **SK-LOCAL-MISSING-CYCLES** (missing-local-cycles.json): 44 office/cycle combinations have no recovered result row. Source roster flags include council-only and no-election cases. Absence is not an abolition or zero turnout. Required: Case-specific return/protocol and any official new/repeat-election call; retain office meanwhile.
- **SK-REPEATS-CERTIFICATION** (all cycles; municipal new elections22–26): Official published returns are research claims, not a complete court/annulment/certification or vacancy universe. New-election index is retained, individual replacement cycles not yet normalized. Required: Exact event, date, office, legal outcome and original/replacement link from primary decision.
- **SK-VUC-INTRODUCTION** (8 VUC assemblies and chairs): Act302/2001 and 2001 election portal retained for institutional origin. Results before 2013 not normalized. 2013 chair first round/runoff differs from later single-round sources. Required: Historical law versions and2001/2005/2009 returns; never apply2026 mechanism retroactively.
- **SK-CITY-PART-TIER** (78 Bratislava/Košice city-part offices): Nationwide local electoral tables explicitly evidence separate council/mayor contests. Proposed other respects submunicipal scope; parent city councils and mayors are separate ballots. Required: Accept or amend category policy; no invented regional city layer.
- **SK-EP** (SK-EP): National party vectors2014/2019/2024 retained.2014 numeric party seats absent in chosen table.2019 original election allocation and later UK-withdrawal mandate changes must not be conflated. Required: Mandate activation/replacement evidence if adding person-level seating histories; tier other pending policy.
- **SK-HOMONYMS-UNKEYED** (2014 local;2018 non-IVIS councillors;2013 VUC assembly): Same-name candidates occur within a jurisdiction. Source-record documentary keys retain each occurrence; personal identity is not asserted. Required: Reviewed ballot/person crosswalk before rebinding any revised/reordered source. Never deduplicate by name.
- **SK-2026-CALL** (5,868 prospective local/VUC office cycles): Call 145/2026 fixes24 October 2026, but does not prove every office will field candidates or produce a valid ordinary return. Required: Nomination/no-election/changed-call feeds; no future votes, winners or certification invented.
- **SK-AGGREGATES** (all results): Candidate marks in multi-member districts do not constitute a single nationwide100% council vector. Shares retained exactly; cross-district sums must not be used as vote margins. No computed margins/tightness. Required: Correct source ballot denominator and district completeness before derived comparisons.

## Justin decisions

- [ ] Accept research scope and documented history gaps.
- [ ] Accept/amend city-part and EP tier policy.
- [ ] Accept draft tier file for later production approval.
- [ ] Authorize future implementation separately.
