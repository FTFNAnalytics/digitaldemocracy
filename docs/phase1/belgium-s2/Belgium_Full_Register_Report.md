# Belgium full-register + historic handoff — Prompt S2

**Justin accepted 2026-09-19 (America/Edmonton): all 1,179 current + 55 historical draft offices.** New research; not an import or an amendment to the frozen zero-office extract. Review pack pinned main `01602ea88de411fd712858e10e3f559d5ceb3ee1`; landing base `b293da99b97a8ae008d87ee2e57210cde0678004`. Research checked 19 September 2026; current municipality roster dated 1 July 2026. The study window, 8 September 2026–8 March 2028, filters upcoming alerts only. Standing policy: retain offices and historic rows even outside that window.

| Register component | Current office rows |
|---|---:|
| municipal council | 565 |
| mayor | 565 |
| district council | 10 |
| social welfare council | 8 |
| directly elected aldermen | 7 |
| social welfare standing bureau | 7 |
| provincial council | 10 |
| parliament | 7 |

**1,179 current + 55 historical = 1,234 sourced office rows; 1,772 historical event records and 9,238 list-result rows.** All 565 current municipalities are covered by council/mayor pairs: Flanders 285, Wallonia 261, Brussels-Capital 19. Assembly seats are recorded as capacities where sourced; they are not invented numbered offices. The merged Flemish regional/community parliament is one body. Senate and French Community Parliament remain offices without invented direct-election returns.

Approved tiers across current and historical rows: **1,185 municipal / 15 regional / 2 national / 32 other**. National maps to `national_context`. Fifteen regional offices do not imply any upcoming in-window event: **zero dated upcoming events are authored**. Flanders’ expected 2030 cycle is year-precision metadata, including on retained out-of-window offices.

The register is complete for current municipality-wide council/mayor pairs and the ten provincial/seven federal or federated legislatures identified here. **It is not yet a verified census of every indirect social-welfare/community-commission organ, executive position or individual seat.** Those extensions remain open; no synthetic rows fill the gaps. Historic predecessor codes are preserved, with exact successor/code-change review still required for 55 rows.

Historical coverage is uneven: official IBZ 2000 municipal/provincial returns; Flemish municipal 2012 and updated 2018 workbooks; Walloon 2018 municipalities/provinces and Comines-Warneton CPAS; Flemish and Brussels 2024 local returns; and IBZ federal/federated 2014/2019/2024 returns. Candidate workbooks and unused reporting rollups are retained losslessly, not counted again as list results. The 2018 workbook’s Bilzen 2019-repeat note conflicts with row dates: its date remains unresolved. Saint-Josse’s 2024 record is held from selected history pending repeat reconciliation. Thirty-five IBZ 2000 municipality bindings remain unresolved. Missing archived cycles, Wallonia/German-speaking local 2024 returns, mayor appointments, special/repeat decisions and certification remain research gaps. **Coverage_complete=false.**

Sources: [IBZ population roster](https://www.ibz.rrn.fgov.be/fr/citoyen/registre-national-et-population/population/statistiques-de-population), [Flemish official result downloads](https://www.vlaanderen.be/vlaanderen-kiest/resultaten), [Wallonia 2018](https://electionslocales.wallonie.be/resultats/2018/fr/election%EF%B9%96el=CG.html), [Brussels 2024](https://elections2024.brussels/fr/counting/index.html), [IBZ election API](https://api.electionresults.belgium.be/swagger/index.html). Exact retrieved bytes, row locators, URLs and SHA-256s accompany the pack.

- [x] Justin accepts register granularity and remaining-universe gaps (gaps stay documented open notes).
- [x] Justin accepts tier categories and historical bindings (all 1,234 draft offices).
- [ ] Justin accepts each resolved evidence disposition before implementation. **Open research holds remain:** Bilzen date conflict, Saint-Josse 2024 repeat, 35 unbound IBZ 2000 records, historic successor/code-change review.

**Repo mutation lands docs + research tables + approved tiers only. Importer / SQLite / VPS / UI: applied_changes=0; execution Not run.** Frozen PR #14 bytes and unrelated lineages are untouched.
