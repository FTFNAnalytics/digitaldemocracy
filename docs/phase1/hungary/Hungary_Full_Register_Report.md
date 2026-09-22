# Hungary full-register review report — Prompt AK

**Draft for Justin; no approval or import.** Pinned main `3b21c584c1b59663c5c4ae1bad775618293ac0fa` (2026-09-22). Proposed tier bytes SHA-256 `fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a`. This new sourced research is separate from frozen country packages. Repository/importer/SQLite/VPS/UI applied_changes=0.

## One-page review summary

The pack enumerates **6,378 current ordinary territorial/national/EP offices**, **0 recovered historical-only offices**, **12,753 evidenced historical events**, and **101,526 result rows**. It reconciles the 3177 municipal/district jurisdictions in NVI 2024 territorial data with NVI’s January 2026 polling-place roster. There are 3154 noncapital settlements plus 23 Budapest districts; Budapest’s own citywide bodies are separate. The later September 2026 legal-change audit remains open because KSH acquisitions were rejected. Zero recovered historical-only bodies does not assert that Hungary had no abolished local governments.

| Scope | Offices | Proposed tier / mechanism |
|---|---:|---|
| Municipal/district councils |3177|municipal; small-list and mixed ward/compensation mechanisms preserved|
| Municipal/district direct mayors |3177|municipal; popular vote|
| County assemblies |19|regional; no invented direct county chairs|
| Budapest Assembly |1|regional proposed; one dual-remit body|
| Budapest direct mayor |1|municipal proposed; separate from district mayors|
| Országgyűlés |1|national; mixed constituency/list components|
| President |1|national; indirect parliamentary election|
| Hungarian EP delegation |1|other proposed; domestic returns subset only|

**Direct-executive offices: 3,178. Council/assembly offices: 3,198** (including Parliament, excluding EP delegation). No county-chair, járás, PM/cabinet, or fake popular-president contest. Draft tiers: **6,355 municipal / 20 regional / 2 national / 1 other**. All office IDs are stable documentary derivatives of evidenced source bodies; none is presented as an official NVI office identifier.

History includes recovered 2014 and 2024 local/county/capital returns, 2022 and 2026 parliamentary components, 2024 EP domestic subsets, and 2017/2022/2024 presidential legal election outcomes. President vote totals are unknown; EP domestic sums are not full national totals. Numeric precinct aggregations are expressly research sums with all source cells, not falsely source-printed totals. 2024 local seat allocations missing from selected sheets remain unknown. Current offices remain even with next date unknown or out of the 18-month alert window; no prospective dates/events manufactured.

**Open gates:** 2019 local/EP and older parliamentary archives; comprehensive repeats/by-elections and judicial chronology; pre 2014 abolished offices/successors; KSH current legal register; 2026 presidential/constitutional changes; 2026 nationality/list seat components; EP overseas/final allocation; nationality self-government body register. The latter official files are retained but not normalized as ordinary territorial councils: geographical subtotals cannot manufacture extra bodies. This is not a claim of exhaustive historic or additional cultural-autonomy coverage.

## Verified inventory and depth

| Cycle | Events | Result rows |
|---|---:|---:|
|EP2024|1|220|
|OGY2022|1|682|
|OGY2026|1|664|
|ONK2014|6,375|52,152|
|ONK2024|6,372|47,805|
|PRES2017|1|1|
|PRES2022|1|1|
|PRES2024|1|1|

Exact acquisition/normalization counts appear in counts.json and historical-acquisition.json; source access failures are inventoried. Register/tier exact set equality, destination-column coverage and checksums are package validations, not importer CI or research completeness. All source bytes, workbook parameter sheets, unprojected columns and numeric contexts are retained. No aggregate denominator or successor edge is guessed.

The selected 2024 return sheets lack Bozsok council (`HU-NVI-18-012-C`), Bozsok mayor (`HU-NVI-18-012-M`) and Pakod council (`HU-NVI-20-160-C`). All three offices remain in the register; absent returns do not become zero-vote results. Exact gap pointers are in `office-cycle-gaps.json`.

## Primary evidence and boundaries

NVI 2024 downloadable final returns: https://www.valasztas.hu/letoltheto-es-feldolgozhato-adatok_onk2024 . NVI 2026 polling-place register and parliamentary source links: https://www.valasztas.hu/ogy2026-letoltheto-es-tovabbfeldolgozhato-adatok . NVI 2022 aggregate archive: https://www.valasztas.hu/ogy2022-letoltheto-es-tovabbfeldolgozhato-adatok . NVI 2014 local archive: https://static.valasztas.hu/dyn/onk14/szavossz/hu/eredind.html . All followed source links and retained hashes are in the inventory.

Local election mechanisms: Act L 2010 (https://njt.jog.gov.hu/jogszabaly/2010-50-00-00), especially §12 direct mayors; Act CLXXXIX 2011 (https://njt.jog.gov.hu/jogszabaly/2011-189-00-00), §§3,23 and 27. Presidency: Fundamental Law Articles 9–11 and actual election resolutions 7/2017,6/2022,3/2024. Selection mode does not imply a popular nationwide presidential ballot. Resolution adoption dates are not inauguration dates. Retained laws are source snapshots; later law changes require explicit review.

## Justin decisions — all pending

- [ ] Accept or amend ordinary office register and explicit scope/completeness gates.
- [ ] Accept or amend all draft tiers, especially Budapest and EP.
- [ ] Accept historical component/date/result bindings and disclosed partial vectors.
- [ ] Prioritize named legal-register, minority-government, older-cycle and repeat-election holds.
- [ ] Authorize a future implementation task separately. No importer is included here.
