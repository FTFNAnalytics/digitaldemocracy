# Czechia full-register research — Prompt V

**Draft for Justin; no approvals or production changes.** Main pinned at `785bae49b4b3ac6bc2ef105f33cc826caa948caf` (Norway PR47 merge), source capture 2026-09-20. This is new research, not an alteration to any frozen Europe package.

## Executive review

The pack has **6,411 current + 13 historical source-code office identities**, **46,236 events** (39,815 historical/indexed, 6,421 prospective), **169,614 result rows**, and **934 first-round/runoff proceedings**. Historical/indexed events include not-held entries and are not all certified completed contests. One directly elected executive is included: the President. **Zero direct municipal/regional executive offices**; councils and assemblies total **6,420** across current/historical identities, excluding the two national chambers and EP.

| Current scope | Offices | Proposed tier / treatment |
|---|---:|---|
| Municipal councils excluding Prague city | 6,253 | municipal |
| Prague city assembly | 1 | regional, one dual-function body |
| Borough/district councils | 140 | other; category review |
| Regional assemblies excluding Prague | 13 | regional |
| Chamber, Senate, President | 3 | national → national_context |
| Czech EP delegation | 1 | other; review |
| **Current total** | **6,411** | |
| Historical source-code identities | 13 | 4 municipal + 9 other; no guessed successors |

**All-office draft tiers:** municipal **6,257**; regional **14**; national **3**; other **150**. Exact register/tier ID equality. **155 focused flags** cover boroughs, Prague, EP and historical identity review; all packs remain draft regardless of flag count.

## Source depth and measured coverage

Primary ČSÚ [2026 municipal register](https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm) is dated 15 September and contains 6,254 whole-municipality councils +140 borough councils. Three have insufficient candidates and still remain offices. The official [CISOB territorial export](https://apl2.czso.cz/iSMS/cisdata.jsp?kodcis=43) valid20 September2026 has6,258 units: all6,254 municipality council codes match exactly; four military-area entries (Libavá, Boletice, Hradiště, Březina) have no elected council record and do not become fabricated offices. Post-capture and legal successor reconciliation remains open.

Municipal histories span six ordinary archives **2002/2006/2010/2014/2018/2022**, including supplied subsequent calls. [Senate cumulative files](https://volby.gov.cz/opendata/senat_vse/senat_vse_opendata.htm) span **1996–January2025**, including sourced by-elections. Regional returns cover five cycles **2008–2024**, Chamber six cycles **2006–2025**, EP five **2004–2024**, and President **2013/2018/2023**. 2017 Chamber and 2023 presidential corrected NSS editions are selected. Earlier source pages and unprojected candidate/precinct details remain retained with hashes; no exhaustive pre-2002 or court-completeness claim.

Municipal list-vote totals are candidate marks, not voters/ballots. **6,417 municipal recalculated percentages exceed100**; all municipal PROCHLSTR values remain exact raw research under a semantic hold and are not declared Atlas vote shares. Every affected ID is enumerated. Nine not-held zero placeholders are retained-only; genuine reported zero results remain zero. Missing XML seat attributes stay unknown.

## Open gates and implementation boundary

Justin must review tier/category proposals, PROCHLSTR semantics, 13 historical code bindings, Prague dual scope, military-to-civilian transitions, remaining history/legal/date depth and EP handling. A historical code absent today is not silently called an abolished body. No merger edge is authored. Ordinary next cycles outside the alert window remain in scope; unknown next dates never remove offices. No invented future cycle is added for national/regional/EP bodies.

The pack provides all223 destination columns, complete identity vectors and ≥15 worked acceptance examples. **Importer / SQLite / VPS / UI / repository mutations: Not run; applied_changes=0.** Documentary validator checks source projections and exact bytes only; it does not certify research completeness or authorize publication.

- [ ] Justin accepts current register and historical identity holds.
- [ ] Justin approves tier proposals.
- [ ] Justin accepts municipal share-field disposition and other named holds.
- [ ] Justin authorizes future implementation/publication (not granted here).
