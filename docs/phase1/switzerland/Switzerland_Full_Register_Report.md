# Switzerland full-register research handoff — Prompt U (evidenced subset accepted)

**Justin accepted 2026-09-19 (America/Edmonton): the evidenced subset of 2,805 current + 11 historical draft offices (2,816).** Accepted-with-holds / approved subset only. **Full-register certification remains OPEN.** New sourced research; not an import. Review pack pinned main `b4dcf6d891ed83a7db5b7d6eb8808671d6eec000`. Landing base `e64afc3`. No importer/SQLite/VPS/UI changes. Standing policy: retain offices and historic rows even outside the ~18-month alert window.

**This is an evidenced research pack, not a completed full-office-universe acceptance.** It contains **2,805 current and 11 historical office identities**, **1,443 historic event/component anchors**, **8,094 result observations** and **136 round proceedings**. Both federal chambers and all 26 cantonal legislatures plus 26 cantonal governments are covered. The communal register is incomplete: **308 current communes still lack an executive-body record in this pack**, and optional parliaments, presidents and special districts need further local verification. These are research gaps, not evidence that the offices do not exist. Do not invent the 308 missing commune executives or fabricate merger histories.

Pinned `FTFNAnalytics/digitaldemocracy` main: `b4dcf6d891ed83a7db5b7d6eb8808671d6eec000`. Research captured 19 September 2026. BFS's latest available municipal-register snapshot retrieved was **1 January 2026: 2,110 communes/equivalent units**; the form rejected 19 September. Later-2026 boundary/current-body reconciliation remains open. This is newly sourced research, separate from frozen Europe extracts.

| Scope | Current office rows | Historical office rows | Qualification |
| --- | --- | --- | --- |
| federal_lower_chamber | 1 | 0 | Direct/local-mode evidence retained; see office reviews |
| federal_upper_chamber | 1 | 0 | Direct/local-mode evidence retained; see office reviews |
| cantonal_legislature | 26 | 0 | Direct/local-mode evidence retained; see office reviews |
| cantonal_executive | 26 | 0 | Direct/local-mode evidence retained; see office reviews |
| communal_executive | 1801 | 6 | Direct/local-mode evidence retained; see office reviews |
| communal_president | 779 | 0 | Direct/local-mode evidence retained; see office reviews |
| communal_legislature | 171 | 5 | Direct/local-mode evidence retained; see office reviews |


Proposed tiers across every register row: **national 2, regional 52, municipal 2402, other 360**. Justin accepted this evidenced subset at those drafted tiers. Focused-review flags stay on drafted rows and do not un-accept sourced offices. Regional bodies are real cantonal institutions; this does not prove a populated dated upcoming regional calendar. `other` holds identify sourced local institutions whose electoral mode or district scope remains unresolved.

Historic depth: National Council 2011/2015/2019/2023, with national and cantonal components explicitly separated; Council of States party-seat observations back to 1971, candidate-round observations where the workbook layout binds reliably; canton parliament seats back to 1968 where a source Wahljahr exists; government Wahljahr anchors with composition retained separately; selected city election-year observations from recent BFS sheets, and older composition snapshots retained without invented election years. Source workbooks are complete retained inputs. Neither rolling snapshots nor party/candidate representations are additive election cycles.

No office is excluded because its next cycle lies beyond the alert window, 8 September 2026–8 March 2028 inclusive. Ticino's evidenced 2024 ordinary cycle plus LOC art10 supports **expected April 2028 metadata**, without inventing a day or prospective event. Other unknown next dates stay NULL. No importer, SQLite, VPS, UI, redirects or repository changes were performed; `applied_changes=0`.

## Source basis and open gaps

- [BFS municipal register](https://www.agvchapp.bfs.admin.ch/de/state/results?SnapshotDate=01.01.2026): annual snapshots 2010–2026 retain official spelling and historical records. **586 historical geography IDs** are not fabricated into an equal number of office rows. Successor links and exact abolition dates require merger acts. Some older historic city codes predate these snapshots. The pack is not a full merger-office archive.
- [BFS cantonal parliamentary elections](https://www.bfs.admin.ch/bfs/de/home/statistiken/politik/wahlen/kantonale-wahlen/kantonsparlamente.html): party-seat histories and mixed-list share workbooks. The latter remain lossless retained observations until allocation conventions are reconciled. No invented votes, margins or certified totals.
- [BFS cantonal government elections](https://www.bfs.admin.ch/bfs/de/home/statistiken/politik/wahlen/kantonale-wahlen/kantonsregierungen.html): election-year anchors are retained, but composition snapshots can include replacements and party changes; those numbers are not labelled decisive election returns.
- [Council of States](https://www.parlament.ch/en/organe/council-of-states): 46 seats across 26 units, with six one-seat cantons (OW, NW, BS, BL, AR, AI) and twenty two-seat cantons. Do not create 52 seats or infer equal seat weights. AI's Landsgemeinde is a popular electoral mechanism; a voice vote supplies no invented numeric vote total.
- [National Council](https://www.parlament.ch/en/organe/national-council): 200 seats; constituency/candidate marks and normalized fictitious voters are different quantities. The Federal Council is indirectly elected by the Federal Assembly and has no fabricated popular office/event here.
- **Current communal holes:** {'SZ': 24, 'VD': 284} executive-body coverage gaps. `commune-coverage-audit.json` enumerates every current BFS unit, covered IDs and unresolved questions. **1938 communes lack positive elected-parliament evidence in this pack**; many use citizen assemblies, so this is not a claim that this many parliaments are missing. Optional local parliaments, separate elected vice-presidents, school/financial political commissions, civic corporations and special districts require additional jurisdiction/mode screening.
- **Election-mode variance:** FR syndic is chosen by the executive (LCo art58), so no popular presidency is invented. GE uses elected administrative councils (constitution art141). NE LCo arts25–26 permits indirect executive selection: affected executive bodies are `other` holds, with no invented popular contest. UR/GR/JU and some other local bindings remain flagged. A sourced body can exist while its direct electoral mode remains unresolved.
- **Basel:** political-city executive/legislative observations overlap the canton; no `CH-GM2701-E/L` duplicate is authored. The separate Bürgergemeinde is a different civic institution requiring independent scope review.
- **Conflicting/withheld observations:** 16 result rows have incompatible source observations for the same metric. Disputed scalars remain NULL/unknown, original claims retained. No blanket preference for the newest snapshot or alternate share calculation. See `conflicting-claims.json`.
- **Data freshness and source discrepancies:** Bern's page summary and its named parliamentary table disagree; only named bodies are used. Neuchâtel's law contains an older commune-name list despite a 2026 version label; BFS codes govern the captured geography, not a silent name merge. SGP membership names help identify institutions, but stale seat totals are not used as current seat counts. Generic body labels are marked documentary; local multilingual titles and language tags need verification where unknown.

## Justin decisions — 2026-09-19

- [x] Accept this evidenced subset and its explicit incomplete-universe scope (2,805 current + 11 historical).
- [ ] Commission/accept the remaining commune-by-commune institutional and merger bindings. **HOLD — 308 executive gaps (VD 284, SZ 24) and thin historic/merger archive stay open. Do not invent clearances.**
- [x] Accept drafted geographic tiers for the evidenced subset. Local-mode and historical review flags stay open and do not un-accept sourced rows.
- [ ] Resolve conflicting result observations and primary certification gaps. **HOLD — mode-variance / disputed rows stay open research notes.**
- [ ] Accept a future complete register / implementation handoff after the open gates are satisfied. **Not authorized. Full-register certification remains OPEN. No importer in this landing.**

**Full-register acceptance remains open. Package-integrity PASS is not research-completeness PASS.**
