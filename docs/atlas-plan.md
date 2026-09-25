# Election Atlas — restructuring plan

**Status (2026-09-17):** Phase 0 plan is on main. Phase 1 Albania storage proof and early-Europe/continuity ingest are on main and live on the VPS at `/atlas` — Albania, Andorra, Alderney, Armenia, plus **approved** LatAm/NZ packs. Albania municipal and Alderney `other` are **approved**; Andorra, Armenia, and Austria geographic tiers are **approved**. `/atlas` UI exists (index / countries / offices). `/atlas/explorer` is **not** on main. Cutover from `/electiondatabase` is **not** done — do not flip redirects. Locked decisions (`/atlas`, SQLite, Europe-first) stand. See [Current state (2026-09-17)](#current-state-2026-09-17). Working notes: [`docs/atlas-phase1.md`](atlas-phase1.md), [`docs/phase2/`](phase2/README.md), [`schemas/atlas/tiers/`](../schemas/atlas/tiers/README.md).

**Phase 0** (this plan) is merged. **Phase 1 Albania storage proof has landed.** Phase 2 continuity ingest of approved packs and the `/atlas` shell (index / countries / offices) have landed; remaining residual-heavy packs and cutover have not. Austria `import:atlas` loads lineage `country-package-austria` (2,034 municipal / 4 regional). Bosnia and Bulgaria importers are on main. Observatory still skips Austria/Bulgaria XZ payloads.

**Product:** Center for Digital Democracy — Election Atlas  
**Repository:** [FTFNAnalytics/digitaldemocracy](https://github.com/FTFNAnalytics/digitaldemocracy)  
**Current public research app:** Subnational Election Observatory at `/electiondatabase`  
**Target public research app:** Election Atlas at `/atlas`

This plan is the working agreement for how the observatory becomes the Atlas. It does not reopen the four product-owner decisions below. Later implementation PRs execute the phases; they do not renegotiate URL, storage, first vertical, or launch depth.

---

## Current state (2026-09-17)

Verified against `FTFNAnalytics/digitaldemocracy` `main` (`3ef34d3`, Prompt N PR #28 merged after Austria package PR #11 `f0f2c86` and Prompt M docs PR #27). Do not treat the figures below as live VPS office totals; they are statuses and dispositions, not a coverage KPI.

| Surface | On main / live | Notes |
| --- | --- | --- |
| VPS `/atlas` | Live | Early Europe (Albania, Andorra, Alderney, Armenia) plus approved LatAm/NZ continuity. `/electiondatabase` remains the public observatory. |
| `/atlas` UI | Index, countries, offices | `app/atlas/page.tsx`, `countries/[countryId]`, `offices/[officeId]`. Reads Atlas SQLite. |
| `/atlas/explorer` | **Not on main** | Still required at cutover. Do not claim done. |
| Redirects / cutover | **Not done** | No `/electiondatabase` → `/atlas` redirects in `next.config.ts`. Do not flip. |
| Albania | Importer + municipal tiers **approved** (2026-09-16) | Phase 1 storage proof. Regional=0 by design. |
| Andorra | Importer (PR #23) + municipal tiers **approved** (2026-09-16) | Europe #2. |
| Alderney | Importer (PR #24) + `other` **approved** (2026-09-16) | Europe #3. Channel Islands remain low priority. |
| Armenia | Importer (PR #26) + municipal tiers **approved** (Prompt L, 2026-09-17) | Europe #4. Five boundary/calendar reviews remain open. |
| LatAm / NZ continuity | Approved packs import via `import:atlas` | 8 residual-heavy packs stay `draft_for_human_review` and are skipped. |
| Mexico shares | Production override still original **67** | Justin accepted Prompt M **95 sibling withholds** (2026-09-17) as disposition. Docs PR [#27](https://github.com/FTFNAnalytics/digitaldemocracy/pull/27) **landed**; the production override is unchanged until a later importer amendment. |
| Austria | Package + Prompt N tiers + `import:atlas` | Country package landed in PR [#11](https://github.com/FTFNAnalytics/digitaldemocracy/pull/11) (`f0f2c86`). Approved `schemas/atlas/tiers/austria.json` landed in PR [#28](https://github.com/FTFNAnalytics/digitaldemocracy/pull/28) (`3ef34d3`; 2,034 municipal + 4 regional; St. Georgen 2015 hold and calendar notes retained). `ATLAS_IMPORT_SCOPE=austria npm run import:atlas` loads the lineage. Observatory still skips the XZ payload. |
| Belgium | Prompt S2 research + approved tiers | Justin accepted **1,179 current + 55 historical** offices on 2026-09-19. Research at `data/research/belgium-s2/`; approved `schemas/atlas/tiers/belgium.json` (1,185 municipal / 15 regional / 2 national / 32 other). Remaining-universe notes retained. Atlas importer waits. Frozen PR #14 screening extract is not overwritten. No `/electiondatabase` redirects. |
| Netherlands | Prompt T research + approved tiers | Justin accepted **432 current + 69 historical** offices on 2026-09-19. Research at `data/research/netherlands/`; approved `schemas/atlas/tiers/netherlands.json` (414 municipal / 12 regional / 3 national / 72 other). Hilversum/Wijdemeren successor binding, named historic gaps, and ~147 focused-tier reviews stay open. Appointed mayors: no mayoral election rows. Importer via `ATLAS_IMPORT_SCOPE=netherlands`. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Switzerland | Prompt U research + accepted-with-holds tiers | Justin accepted the **evidenced subset: 2,805 current + 11 historical** offices on 2026-09-19. Research at `data/research/switzerland/`; `schemas/atlas/tiers/switzerland.json` (2,402 municipal / 52 regional / 2 national / 360 other). Full-register certification remains OPEN. HOLD: 308 commune-executive gaps (VD 284, SZ 24), thin historic/merger archive, 1,938 parliament caveats, mode-variance / disputed rows. Do not invent missing commune executives or fabricate merger histories. Importer via `ATLAS_IMPORT_SCOPE=switzerland`. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Denmark | Prompt X research + approved tiers | Justin accepted **106 current + 240 historical** offices on 2026-09-19. Research at `data/research/denmark/`; approved `schemas/atlas/tiers/denmark.json` (324 municipal / 20 regional / 1 national / 1 other). Greenland/Faroe Realm coverage gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps stay open. No popular mayor rows (council-elected borgmester). Do not invent Greenland/Faroe offices or fabricate merger clearances. Importer via `ATLAS_IMPORT_SCOPE=denmark`. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Sweden | Prompt Y research + accepted-with-holds tiers | Justin accepted **313 current + 7 historical** offices on 2026-09-19 with named holds. Research at `data/research/sweden/`; approved `schemas/atlas/tiers/sweden.json` (292 municipal / 25 regional / 1 national / 2 other). HOLD: SE-GOTLAND-TIER, SE-EP-SAM-TIER, SE-2026-COUNT-IN-PROGRESS, SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, SE-FARGELANDA-1973. No popular kommunalråd/PM/cabinet rows. Do not invent a second Gotland regional office or fabricate 2026 final local counts. Atlas importer waits. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Finland | Prompt Z research + accepted-with-holds tiers | Justin accepted **333 current + 170 historical** offices on 2026-09-19 with named holds. Research at `data/research/finland/`; approved `schemas/atlas/tiers/finland.json` (478 municipal / 22 regional / 2 national / 1 other). HOLD: FI-HISTORIC-MERGERS, FI-ALAND-EARLY-AND-DATES, FI-WELLBEING-TRANSITION, FI-EP-DETAIL, FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, FI-MISSING-RESULTS. All 308 current municipal councils (incl. 16 Åland). No popular manager/PM/cabinet rows. Do not invent merger successors, early Åland contests, wellbeing predecessors, or missing result scalars. Importer via `ATLAS_IMPORT_SCOPE=finland`. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Norway | Prompt AA research + accepted-with-holds tiers | Justin accepted **389 current + 537 historical** offices on 2026-09-19 with named holds. Research at `data/research/norway/`; approved `schemas/atlas/tiers/norway.json` (876 municipal / 32 regional / 1 national / 17 other). HOLD: SAMI-2025-ZERO-VOTE-SEAT-98d, REFORM-2020-2024, OSLO-BOROUGH-HISTORY, LONGYEARBYEN-HISTORY, LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, PARTY-CATEGORIES. Oslo bystyre once; 15 boroughs + Sámediggi + Longyearbyen as `other`. No popular mayor/PM/cabinet or EP rows. Do not invent merger successors, borough/Longyearbyen result histories, certified legal outcomes, or missing result scalars. Importer via `ATLAS_IMPORT_SCOPE=norway`. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Ireland | Prompt AB research + accepted-with-holds tiers | Justin accepted **36 current + 86 historical** offices on 2026-09-20 with named holds. Research at `data/research/ireland/`; approved `schemas/atlas/tiers/ireland.json` (118 municipal / 0 regional / 3 national / 1 other). HOLD: IE-2014-REFORM, IE-LOCAL-2019-2024, IE-SEANAD-PANELS, IE-EP-RESULTS, IE-DAIL-ENCODING-AND-STV, IE-PRESIDENT-LATEST, IE-MAYOR-LIMIT, IE-NORTHERN-IRELAND-EXCLUSION, IE-REGIONAL-APPOINTMENTS. All 31 current councils + Dáil + Seanad + presidency + EP delegation + Limerick direct mayor. Northern Ireland excluded. Regional assemblies are appointments, not a popular regional tier. Do not invent merger successors, EP result vectors, or missing first-preference scalars. Atlas importer waits. Slim pack omitted bulky sources; do not invent those bytes. No `/electiondatabase` redirects. |
| Poland | Prompt AC research + accepted-with-holds tiers | Justin accepted **5,310 current + 2 historical** offices on 2026-09-20 with named holds. Research at `data/research/poland/`; approved `schemas/atlas/tiers/poland.json` (4,960 municipal / 330 regional / 3 national / 19 other). HOLD: PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS, PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY, PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES, PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, PL-NEXT-DATES. 16 sejmiks + 314 powiat councils drafted regional (PL-POWIAT-TIER left open — do not reclassify). Historic Ostrowice retained. Results omitted from slim land; do not invent them. Importer via `ATLAS_IMPORT_SCOPE=poland`. Slim pack omitted bulky sources/results; do not invent those bytes. No `/electiondatabase` redirects. |
| Czechia | Prompt V research + accepted-with-holds tiers | Justin accepted **6,411 current + 13 historical** offices on 2026-09-20 with named holds. Research at `data/research/czechia/`; approved `schemas/atlas/tiers/czechia.json` (6,257 municipal / 14 regional / 3 national / 150 other). HOLD: MUNICIPAL-RECALCULATED-PERCENT, HISTORICAL-CODE-BINDING, PRAGUE-DUAL-STATUS, MILITARY-CIVILIAN-TRANSITION, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT, EP-PARTY-SCOPE, DATES-AND-NEXT-CYCLES. President is the only direct executive; 0 direct local executives; 6,420 councils. Prague retained as one city/region body. Historical codes retained with no invented successors. Importer via `ATLAS_IMPORT_SCOPE=czechia`. Slim pack omitted bulky sources, `results.jsonl.gz`, and identity vector blobs; result rows are not invented. No `/electiondatabase` redirects. No VPS deploy in the importer PR. |
| Croatia | Prompt W research + accepted-with-holds tiers | Justin accepted **1,234 current + 11 historical** offices on 2026-09-20 with named holds. Research at `data/research/croatia/`; approved `schemas/atlas/tiers/croatia.json` (1,187 municipal / 55 regional / 2 national / 1 other). HOLD: CURRENT-ROSTER-VALIDITY, ZAGREB-DUAL, DEPUTY-ELIGIBILITY, TERRITORIAL-REFORMS, SPECIAL-AND-SUPPLEMENTARY, MISSING-BISKUPIJA-2017, TAR-VABRIGA-PLACEHOLDER, SEATS-AND-LEGAL-FINALITY, SABOR-MINORITY-BASIS, PARTY-IDENTITY, EP-DETAIL, DATES-NEXT-CYCLES, EXCLUDED-AUXILIARY. Current: 577 executive tickets + 79 independently elected deputies + 576 assemblies. Zagreb retained as one dual city/county pair, separate from Zagrebačka županija. Import with `ATLAS_IMPORT_SCOPE=croatia`. Slim pack omitted bulky sources; `events.json` is `events.json.gz` only; `results.jsonl.gz` retained. Do not invent omitted `sources/` bytes. No `/electiondatabase` redirects. |
| Portugal | Prompt AD research + accepted-with-holds tiers | Justin accepted **10,666 current + 8,168 historical** offices on 2026-09-21 with named holds. Research at `data/research/portugal/`; approved `schemas/atlas/tiers/portugal.json` (927 municipal / 2 regional / 2 national / 17,903 other). HOLD: CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37, PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS, DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF, PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022, EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, CERTIFICATION-AND-MARGINS. Current: 308 municípios / 3,258 freguesias (37 plenary). Historical = unresolved aliases, not proved abolitions (PARISH-REFORM-2013-2025). Parish bodies/heads remain drafted `other` (PARISH-TIER — do not reclassify). Atlas importer waits. Slim pack omitted bulky sources, uncompressed `results.json`, and identity vectors; large tables may be `.gz` only. Do not invent omitted `sources/` or identity-vector bytes. No `/electiondatabase` redirects. |
| Spain | Prompt AE research + accepted-with-holds tiers | Justin accepted **8,204 current + 4 historical** offices on 2026-09-21 with named holds. Research at `data/research/spain/`; approved `schemas/atlas/tiers/spain.json` (8,133 municipal / 68 regional / 2 national / 5 other). HOLD: ES-G01–ES-G12 (municipal modes pending, scanned returns, disputed duplicates, provincial Diputaciones chronology, Ceuta/Melilla/Formentera/Aran/Basque Juntas tier policy, island currency, calendar unknowns, submunicipal scope, source acquisition, result interpretation). Explicit concejo-abierto direct executives: 78; 3,762 municipal modes still pending. ZIP SHA-256 `bf735f4e3c3f246bf345faf2b47b6c12717b52bf38eb24696f1fff5d5d8ca1e2`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=spain` (0 result rows and 0 source rows; omitted bytes are not invented). Slim pack omitted bulky sources, `results.json`, and identity vectors; `events.json` is `events.json.gz` only. No `/electiondatabase` redirects. |
| Estonia | Prompt AF research + accepted-with-holds tiers | Justin accepted **81 current + 200 historical** offices on 2026-09-21 with named holds. Research at `data/research/estonia/`; approved `schemas/atlas/tiers/estonia.json` (278 municipal / 0 regional / 2 national / 1 other). HOLD: EE-G01, EE-G02, EE-G03, EE-G04, EE-G05, EE-G06, EE-G07, EE-G08, EE-G09. Current: 78 municipal councils + Riigikogu + indirect presidency + EP delegation. Current direct-executive offices 0. Rosters 2013=215, 2017=79, 2021=79, 2025=78. Do not invent 2017 successor bindings, pre-2013 history, a 2021 presidential row, mayor ballots, EP replacements, a 625,334 vs 625,336 correction, date refinements, a Jõhvi successor edge, or nonadditive candidate shares. Importer via `ATLAS_IMPORT_SCOPE=estonia` (0 result rows; omitted `results.json` is not invented). Slim pack omitted `results.json`, identity vectors, and raw sources; gunzipped events, nonadditive summaries, and the input inventory to normal JSON. Do not invent omitted bytes. No `/electiondatabase` redirects. |
| Latvia | Prompt AG research + accepted-with-holds tiers | Justin accepted **45 current + 121 historical** offices on 2026-09-21 with named holds. Research at `data/research/latvia/`; approved `schemas/atlas/tiers/latvia.json` (163 municipal / 0 regional / 2 national / 1 other). HOLD: LV-G01, LV-G02, LV-G03, LV-G04, LV-G05, LV-G06, LV-G07, LV-G08, LV-G09. Current: 42 councils + Saeima + indirect presidency + EP delegation. Current direct-executive offices 0. Rosters PV2017=119; post-reform observations 43; PV2025=42 (7 state-city + 35 novadi). Historical 121 rows are identity records, not abolished councils. Do not invent 2021 cross-epoch merges, earlier history, presidential ballot vectors, a popular chair or executive director, EP replacements, a choice among the seven 2022 percentage conflicts, certification calls, date refinements, or omitted source bytes. Importer via `ATLAS_IMPORT_SCOPE=latvia` only (not `all`). Slim pack omitted identity vectors and raw sources; gunzipped `results.json` to normal JSON. Do not invent omitted bytes. No `/electiondatabase` redirects. |
| Hungary | Prompt AK research + accepted-with-holds tiers | Justin accepted **6,378 current + 0 historical** offices on 2026-09-22 with named holds. Research at `data/research/hungary/`; approved `schemas/atlas/tiers/hungary.json` (6,355 municipal / 20 regional / 2 national / 1 other). HOLD: HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS (documented exclusion), HU-UPCOMING. Current: 3,178 direct mayors + 3,198 councils/assemblies. President is indirect (no fabricated popular ballot). No PM/cabinet, direct county chairs, or járás councils. 0 historical-only is not proof of zero abolished offices; successor-crosswalk stays empty. Bozsok council/mayor and Pakod council 2024 return gaps stay open (offices retained, no zero invented). ZIP SHA-256 `03b497b92937719a2bf6e58324910aa68cdf2fbdb497203f617482bbec3bd074`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=hungary` only (not `all`). Slim pack omitted bulky sources, `results.json`, and identity vectors; imported result rows stay 0. Do not invent omitted bytes, offices, votes, or successor edges. No `/electiondatabase` redirects. |
| Romania | Prompt AL research + accepted-with-holds tiers | Justin accepted **6,460 current + 0 historical** offices on 2026-09-22 with named holds. Research at `data/research/romania/`; approved `schemas/atlas/tiers/romania.json` (6,372 municipal / 84 regional / 3 national / 1 other). HOLD: RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, RO-G07. Current: 3,180 ordinary local UAT council/mayor pairs + 41 județ councils + 41 county presidents + Bucharest General Council + general mayor + 6 sector pairs + two chambers + popular presidency + EP delegation. President is popularly elected. County presidents are marked direct for current law; 2016 was council investiture and is not a popular-election event. 2024 presidential first round stays annulled with no successor edge to 2025. 23 result rows are national/EP only; missing local vectors stay absent. No prefect/PM/cabinet rows. No guessed merger edges. ZIP SHA-256 `4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf`. Structural validation.json PASS. Import with `ATLAS_IMPORT_SCOPE=romania` only; `all` does not publish this lineage. `events.json` is `events.json.gz` only. Do not invent omitted local vectors or historical offices. No `/electiondatabase` redirects. |
| Greece | Prompt AM Rebuilt research + accepted-with-holds tiers | Justin accepted **693 current + 10 historical** offices on 2026-09-22 with named holds. Research at `data/research/greece/`; approved `schemas/atlas/tiers/greece.json` (674 municipal / 26 regional / 2 national / 1 other). HOLD: GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09, GR-G10, plus 14 local source holds (13 regional 2019 station denominators; Messini 2014 tied runoff `GR-M-9255-C` / `GR-M-9255-M`). Current: 332 municipal councils + 332 mayors + 13 regional councils + 13 governors + Parliament + indirect presidency + one EP delegation. President `GR-PRES` is `parliamentary_indirect` (no fabricated popular ballot). No PM, cabinet, or prefect rows. Five abolished municipalities are historical council/mayor pairs; no Kallikratis successor edges. 14,004 result rows are 8,021 distinct observations; missing results stay gaps. ZIP SHA-256 `356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb`. Structural validation.json PASS. Import with `ATLAS_IMPORT_SCOPE=greece` only; `all` does not publish this lineage. Slim land omits `sources/` (2,807 artifacts). Do not invent omitted bytes, successor edges, or zero-filled results. No `/electiondatabase` redirects. |
| Luxembourg | Prompt AO research + accepted-with-holds tiers | Justin accepted **102 current + 28 historical** offices on 2026-09-22 with named holds. Research at `data/research/luxembourg/`; approved `schemas/atlas/tiers/luxembourg.json` (128 municipal / 0 regional / 1 national / 1 other). HOLD: LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, LU-G11. LU-G01 (Grand Duke) and LU-G02 (mayors) are resolved exclusions: no popular contest. Current: 100 communal councils + Chambre des Députés + EP delegation. Direct executives 0. Regional offices 0. 28 explicit merger edges only; no guessed edge. 1994 EP Grevenmacher LSAP votes stay missing. ZIP SHA-256 `93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=luxembourg` only; `all` does not publish Luxembourg. Published result rows stay 0. Slim pack omitted `sources/` and `results.json`. Do not invent omitted bytes. No `/electiondatabase` redirects. |
| France | Prompt AR research + accepted-with-holds tiers | Justin accepted **35,112 current + 2,738 historical** offices on 2026-09-22 with holds G01–G21 left open. Research at `data/research/france/`; approved `schemas/atlas/tiers/france.json` (draft T1 4 / T2 45 / T3 96 / T4 37,705; schema projection national 4 / regional 141 / municipal 37,705 / other 0). HOLD: G01–G21. Current: 34,952 municipal councils + 95 departmental councils + 14 regional councils + 3 single territorial assemblies + Lyon metropolitan council + 34 PLM sector councils + overseas/NC assemblies + two chambers + popular presidency + EP delegation. Direct executives current: 1 (president). Mayors stay council-selected. Ordinary EPCI stay excluded. `FR-EP` stays draft tier 1 and was not moved to `other`. Successor crosswalk stays empty. Full ZIP SHA-256 `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9`. Structural validation-report.json PASS. Atlas importer is `ATLAS_IMPORT_SCOPE=france` only (not `all`): 37,850 offices, 0 published events, 0 published result rows. Slim pack omitted `sources/`, `results.jsonl`, `events.jsonl`, and `reporting-units.jsonl`. Do not invent omitted bytes, popular mayor contests, EPCI popular contests, guessed commune-nouvelle edges, or zero-filled results. No `/electiondatabase` redirects. |
| Cyprus | Prompt AQ research + accepted-with-holds tiers | Justin accepted **714 current + 174 historical** offices on 2026-09-22 with named holds. Research at `data/research/cyprus/`; approved `schemas/atlas/tiers/cyprus.json` (877 municipal / 5 regional / 5 national / 1 other). HOLD: CY-G01, CY-G02, CY-G03, CY-G04, CY-G05, CY-G06, CY-G07, CY-G08, CY-G09, CY-G10, CY-G11, CY-G12, CY-G13, CY-G14, CY-G15. Current: 20 municipal councils + 20 mayors + 93 deputy mayors + 285 community councils + 285 community leaders + 5 DLGO presidents + House + President + 3 religious-group representatives + EP delegation. Historical: 28 municipal councils + 28 mayors + 59 community councils + 59 community leaders. Direct executives 404. Communities file 285 versus ministry overview 286 (no 286th council invented). Successor crosswalk stays empty. Spilia Agios Antonios and Spilia Kourdali stay separate. No TRNC offices. Missing local returns stay missing (no zero-fill). ZIP SHA-256 `0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=cyprus` only; `all` does not publish Cyprus. Published result rows stay 0. Slim land omitted `sources/` and `results.json`. Do not invent omitted bytes, the 286th free-area community, a TRNC office, a 2024 successor edge, or a Spilia code join. No `/electiondatabase` redirects. |
| Malta | Prompt AP research + accepted-with-holds tiers | Justin accepted **213 current + 2 historical** offices on 2026-09-22 with named holds. Research at `data/research/malta/`; approved `schemas/atlas/tiers/malta.json` (204 municipal / 8 regional / 2 national / 1 other). HOLD: Presidential indirect election (earlier resolutions and House division tallies), STV transfers (paper-level), Post-election changes (casual/co-option), Mayoral selection (first-meeting audit), Local creation and boundaries, Regional bodies, Gozo Civic Council, European Parliament, Certified versus preliminary, Exact inherited field contract. Current: 68 local councils (54 Malta / 14 Gozo) + 68 mayors + 68 deputy mayors + 6 indirect regional presidents + House + indirect President + EP delegation. Historical: Gozo Civic Council and its president. Standalone direct-executive offices 0. Mayors and deputies are conditional first-preference or council election; no separate popular mayor ballot. President is indirect House resolution. Successor crosswalk stays empty. Four 2021 regional sole nominees stay nominations. ZIP SHA-256 `ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=malta` only; `all` does not publish Malta. Published result rows stay 0. Slim land omitted `sources/`, `results.json`, and `stv-counts.json`. Do not invent omitted bytes, popular presidential or mayor ballots, STV transfer papers, or missing House division tallies. No `/electiondatabase` redirects. |
| Lithuania | Prompt AH research + accepted-with-holds tiers | Justin accepted **123 current + 0 historical** offices on 2026-09-22 with named holds. Research at `data/research/lithuania/`; draft `schemas/atlas/tiers/lithuania.json` landed 1:1 (120 municipal / 0 regional / 2 national / 1 other; `draft_for_human_review`; `Justin_accepted` stays false). HOLD: LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, LT-PARTY-PRECISION. `Lithuania_Research_Gaps.md` also leaves LT-NEXT-AND-LEGAL and LT-EXCLUSIONS open. Current: 60 councils + 60 direct mayors + Seimas + popular presidency + EP delegation. Direct executives 61; councils/parliamentary bodies 62. Zero recovered historical-only offices is not proof none existed; no successor edge was guessed. Eleven 2019 presidential shares stay disputed. Mayor history is 19 winner observations, not complete returns. Missing results stay gaps, not zeros. ZIP SHA-256 `093cf3ec4e232ea0c45e97cdc3767e64aa991ed564dca25d48ee8a327a1a353a`. Structural validation.json PASS. Importer via `ATLAS_IMPORT_SCOPE=lithuania` only (not `all`). Slim pack omitted raw `sources/` and `validate.py`. Do not invent omitted bytes or hold resolutions. No `/electiondatabase` redirects. |
| Slovakia | Prompt AI docs + accepted-with-holds tiers | Justin accepted **5,871 current + 0 historical** offices on 2026-09-22 with named holds. Docs+tiers land only; `data/research/slovakia/`, `sources/`, and `results.json` were omitted and are not invented. Approved `schemas/atlas/tiers/slovakia.json` (5,774 municipal / 16 regional / 2 national / 79 other). HOLD: SK-HISTORICAL-UNIVERSE, SK-LOCAL-OLDER-VECTORS, SK-LOCAL-MISSING-CYCLES, SK-REPEATS-CERTIFICATION, SK-VUC-INTRODUCTION, SK-CITY-PART-TIER, SK-EP, SK-HOMONYMS-UNKEYED, SK-2026-CALL, SK-AGGREGATES. Current: 2,887 municipal council/mayor pairs + 39 Bratislava/Košice city-part council/mayor pairs + 8 VUC assemblies + 8 direct chairs + National Council + direct presidency + EP delegation. Direct executives 2,935; councils/assemblies/chamber/delegation 2,936. City-part offices stay drafted `other` (SK-CITY-PART-TIER). EP stays drafted `other` (SK-EP). 0 historical-only is not proof of zero abolished offices. 44 missing local office-cycle bindings stay absent. 2014/2018 council rows stay elected-only. No guessed successor edges. Full ZIP SHA-256 `f1fdbec0350399ee0621cb0489a59627b1113f87f7c7f0fe0d5451f12cf25a62`. Structural validation.json PASS. Atlas importer waits. `Slovakia_Identity_Vectors.json` omitted. Do not invent omitted bytes or resolve holds. No `/electiondatabase` redirects. |
| Slovenia | Prompt AJ research + accepted-with-holds tiers | Justin accepted **428 current + 0 historical** offices on 2026-09-22 with named holds. Docs at `docs/phase1/slovenia/`; approved `schemas/atlas/tiers/slovenia.json` (424 municipal / 0 regional / 3 national / 1 other). HOLD: SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS, SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES, SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL, SI-LOCAL-PREFERENCE, SI-NEXT-CALLS. Current: 212 municipal councils + 212 direct mayors + National Assembly + indirect National Council + popular presidency + EP delegation. President is popularly elected. National Council is indirect. EP stays drafted `other`. Zero regional offices is the evidenced empty state. 0 historical-only is not proof of zero abolished offices; no successor edges. The 2018 Ribnica council return stays missing (no zero invented). 1,172 damaged labels stay unrepaired. Roster aliases stay unapproved. ZIP SHA-256 `e89b8d39663ee27b1abd7016cb37e4b1ba2b03f8feea46453c60bb9be1118150`. Structural validation.json PASS. Atlas importer waits. Slim land omitted identity vectors, sources, and results. Do not invent omitted bytes or historical offices. No `/electiondatabase` redirects. |
| Germany | Prompt AS docs + accepted-with-holds tiers | Justin accepted **21,960 current + 670 historical** offices on 2026-09-22 with named holds left open. Docs at `docs/phase1/germany/`; supplied `schemas/atlas/tiers/germany.json` (jurisdiction tiers 1/2/3/4 = 3 / 20 / 552 / 22,055; numeric labels not remapped). HOLD: DE-G01, DE-G02, DE-G03, DE-G04, DE-G05, DE-G06, DE-G07, DE-G08, DE-G09, DE-G10, DE-G11, DE-G12, DE-G13, DE-G14, DE-G15, DE-G16, DE-G17, DE-G18, DE-G19, DE-G20, DE-G21, DE-G22, DE-G23. `research_coverage_complete` stays false. Delivered direct-executive subset 9,585. SH direct mayors stay the verified 86 (DE-G06). Subdivision rosters stay unenumerated (DE-G10). 26 territorial relations do not assert office continuity (DE-G09). Fifteen Land seat panels and Bavaria 1950 party votes stay withheld (DE-G23). ZIP SHA-256 `c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6`. Atlas importer is `ATLAS_IMPORT_SCOPE=germany` only (not `all`): 22,630 offices, numeric tiers 3 / 20 / 552 / 22,055 preserved on each row, 0 published events, 0 published result rows, 0 successor edges. Classifications stay `needs_review`. This land is docs and tiers only; no `data/research/germany/`. Do not invent omitted bytes, documented omitted totals, missing SH mayors, subdivision rosters, successor edges, or repaired seat panels. No `/electiondatabase` redirects. |
| United Kingdom | Prompt AU docs + accepted-with-holds tiers | Justin accepted **482 current + 2 shadow (`current_shadow`) + 26 historical-only** offices on 2026-09-23 (America/Edmonton) with holds G01–G27 left open. Docs at `docs/phase1/united-kingdom/`; supplied `schemas/atlas/tiers/united-kingdom.json` (draft tiers T1/T2/T3/T4 = 2 / 5 / 76 / 427; 510 rows 1:1; numeric labels not remapped). HOLD: G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26, G27. `research_coverage_complete` stays false. Current direct executives 64 (27 direct mayors + 37 standalone PCC/PFCC). Operational principal councils 382. The parish/town subset stays 27 (G16), not a UK-wide parish universe. Historical EP participation ends in 2019; no post-Brexit EP office (G19). Crown Dependencies and BOT offices stay excluded (G20). Lords, monarch, and Prime Minister popular contests stay excluded (G01). No guessed reorganisation edges (G13). Two Surrey shadow authorities stay `current_shadow` and outside the 382 (G15). Full ZIP SHA-256 `57dc361fe4043f8a5cdc430f482864f0fcd51cea6ef90319c74c85ca7cba1303`. Structural validation-report.json PASS. Atlas importer is `ATLAS_IMPORT_SCOPE=united_kingdom` only (not `all`): 510 offices, numeric tiers 2 / 5 / 76 / 427 preserved on each row, 0 published events, 0 published result rows, 0 successor edges. Classifications stay `needs_review`. This land has no `data/research/united-kingdom/`. Slim pack omitted `sources/`, `results.jsonl.gz`, and `events.jsonl` (899 events / 103,648 results in the full pack). Do not invent omitted bytes, documented omitted totals, a parish universe, a post-Brexit EP office, Crown Dependency or BOT offices, Lords/PM contests, or guessed reorganisation edges. No `/electiondatabase` redirects. |
| Italy | Prompt AT docs + accepted-with-holds tiers | Justin accepted **15,917 current + 696 historical** offices, plus **8 statutory pending FVG** offices, on 2026-09-23 (America/Edmonton) with named holds left open. Docs at `docs/phase1/italy/`; supplied `schemas/atlas/tiers/italy.json` (16,621 rows 1:1; jurisdiction tiers 1/2/3/4 = 4 / 38 / 11 / 16,568; numeric labels not remapped; file `Justin_accepted` stays false). HOLD: IT-G01, IT-G02, IT-G03, IT-G04, IT-G05, IT-G06, IT-G07, IT-G08, IT-G09, IT-G10, IT-G11, IT-G12, IT-G13, IT-G14, IT-G15, IT-G16, IT-G17, IT-G18, IT-G19. `research_coverage_complete` stays false. Current direct executives 7,992. Current: 7,894 councils + 7,894 mayors + 74 Valle d'Aosta joint-ticket deputy mayors + 20 regional councils + 18 direct regional presidents + Bolzano and Trento councils + Trento direct president + Camera + Senato + indirect presidency + EP delegation + 10 Firenze quartiere offices. Ordinary Delrio provincial and metropolitan bodies stay dispositions, not popular offices (IT-G05). Eight FVG offices stay `statutory_pending_first_election` with no invented date (IT-G06). Historical 696 rows are the 348 explicit ES extinctions, council and mayor; `office_successor_asserted` stays false (IT-G08). Seven Bolzano printed arithmetic discrepancies stay unrepaired (IT-G15). Submunicipal coverage stays the five Firenze quartieri; other circoscrizioni stay unenumerated (IT-G13). The June 2024 municipal export stays quarantined (IT-G11). Full ZIP SHA-256 `4e8a6b6d0006727e2af2b10fb4054679861656b94ef4147c8ff927c56396809d`. Atlas importer is `ATLAS_IMPORT_SCOPE=italy` only (not `all`): 16,621 offices, numeric tiers 4 / 38 / 11 / 16,568 preserved on each row, schema interchange 4 national / 49 regional / 16,568 municipal / 0 other, 0 published events, 0 published result rows, 0 successor edges. Classifications stay `needs_review`. This land has no `data/research/italy/`. Slim land omits `sources/`, `results.jsonl.gz`, `events.jsonl`, reporting units, calendar, territorial register, and office-history coverage (515 events / 606,051 results in the full pack). Do not invent omitted bytes, documented omitted totals, circoscrizioni, Delrio popular provinces, FVG election dates, runoff rows, repaired Bolzano arithmetic, or guessed successor edges. No `/electiondatabase` redirects. |
| Iceland | Prompt AV docs + accepted-with-holds tiers | Justin accepted **63 current + 24 historical** offices on 2026-09-23 (America/Edmonton) with holds IS-G01 and IS-G06 left open. Docs at `docs/phase1/iceland/`; supplied `schemas/atlas/tiers/iceland.json` (85 municipal / 2 national; 87 rows 1:1; every `justin_approved` stays false). HOLD: IS-G01 (municipal numeric vectors remain null / not_transcribed, never 0), IS-G06 (2018 turnout source views stay distinct). `research_coverage_complete` stays false. Current: 61 municipal councils + Alþingi + President of Iceland. Historical-only municipal offices: 24. Municipal events 74/72/64/61 (271); full pack 277 events / 393 results, omitted from this slim land. Direct municipal executives 0. Current direct executives 1 (President). EP offices 0. 24 source-supported predecessor→successor links; no guessed edge. Full ZIP SHA-256 `a86c0637188ace9f206ec3de496cc5f27e32ebdf15f5a6aa0e8a05ee02b2bb0a`. Atlas importer waits. This land is docs and tiers only. Do not invent municipal numeric vectors, guessed merger edges, EP offices, or municipal direct-executive offices. No `/electiondatabase` redirects. |
| Albania | Prompt BA docs + accepted-with-holds draft tiers | Justin accepted **123 current + 768 historical-only** offices (891) on 2026-09-25 (America/Edmonton) with holds AL-BA-G01–AL-BA-G21 left open. Docs at `docs/phase1/albania/`. The Phase 1 storage-proof row above stays. Supplied draft `schemas/atlas/tiers/albania.json` (1 national / 868 municipal / 22 other; 891 rows 1:1; every `justin_approved` false; SHA-256 `38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae`). Phase 1 approved classifier bytes (122 municipal, SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`) stay at `docs/phase1/albania/Phase1_approved_tiers.json`. The existing importer pins the Prompt BA schema-path checksum and still classifies those 122 municipal rows. `ATLAS_IMPORT_SCOPE` is unchanged. `research_coverage_complete` stays false. Current: Assembly + 61 councils + 61 direct mayors. President is Assembly-elected (no popular president office). EP offices 0. Popular qark/prefecture offices 0. Historical 768 rows are 2011 source-vintage identities, not proved abolitions. `office_successor_edges` stays empty. Full ZIP SHA-256 `411d72969c246c71b8c050993707242dc338f01ddc8f7e0858b17f3e909a654e`. Slim land omits `sources/`, `events.jsonl`, and `results.jsonl` (1,180 events / 8,229 results in the full pack). Do not invent omitted bytes, offices, votes, a popular president, an EP office, or successor edges. No `/electiondatabase` redirects. |
| Bosnia and Herzegovina | Prompt AW docs + accepted-with-holds draft tiers | Justin accepted **306 current + 40 historical-only** offices (346) on 2026-09-23 (America/Edmonton) with holds BA-AW-G01–BA-AW-G09 left open. Docs at `docs/phase1/bosnia-and-herzegovina/`; supplied draft `schemas/atlas/tiers/bosnia-and-herzegovina.json` (4 national / 15 regional / 327 municipal; 346 rows 1:1; every `justin_approved` false). Prompt O `Bosnia_Identity_Vectors.json` stays (blob `5228f504e759b24e5b6fe36a1ad56db5b0874f29`). Prompt O approved classifier bytes (13 regional, SHA-256 `2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501`) are preserved at `docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json`. The importer schema-path pin is the Prompt AW draft SHA-256 `96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9`; classifications stay those 13 regional rows. Import scope stays `bosnia`. `research_coverage_complete` stays false. Current councils/chambers/assemblies 158; current direct executives/member offices 148; local representative bodies 145; local direct executives 142; EP 0. 749 Prompt O numeric rows retained by immutable reference. 19 prospective 2026 events. No successor edges and no 143rd mayor (BA-AW-G09). Full ZIP SHA-256 `373fa241bffa6cf87d1d70df42e35f24aa1dde4faa55cc988dc1b3147f9b018e`. Slim ZIP SHA-256 `4372f4349281391b5690ae9d88ddc6a7a1d6b0b2c9bff9f485e3fe353aad1f47`. This land is docs and draft tiers only. Do not set `ATLAS_IMPORT_SCOPE=all`. Do not invent omitted `sources/`, `events.jsonl`, or `results.jsonl` bytes, numeric vectors, legal effective dates, stable RS vice-president identities, successor edges, or a 143rd mayor. No `/electiondatabase` redirects. |

Inventory, identity rules, and cutover checklists below remain the contract. The [Current repository snapshot](#current-repository-snapshot) is Phase 0 inventory context, not this as-of date.

---

## Decisions (accepted)

These four decisions are locked. Do not reopen them in implementation PRs.

### 1. URL — `/atlas`

Use **`/atlas`** as the public research product path.

Retire **`/electiondatabase`**. Permanent redirects from old paths to `/atlas` equivalents ship at **cutover**, not when implementation work begins. Cutover is defined in [Redirect strategy](#redirect-strategy): destinations must already work. Until cutover, `/electiondatabase` remains the live observatory.

### 2. Storage — SQLite on the VPS as master

**SQLite on the VPS** is the master store.

- Checked-in **schemas** and **migration / import scripts** live in git.
- The **database file** lives on the server, not as a giant binary in git.
- JSON / Parquet shards are **optional export / debug artifacts** only. They are not the source of truth and are not a substitute for the master DB.

Proposed production path:

```text
/var/lib/cdd/atlas.sqlite
```

Acceptable alternative if the VPS layout keeps data next to the app (with permissions so `www-data` can read, and the import user can write):

```text
data/master/atlas.sqlite    # under the deployed app tree
```

Override with an environment variable (proposed: `ATLAS_SQLITE_PATH`) so local development, CI, and production do not share a file. Imports run via **npm scripts** that create or update that DB (see [Storage and import](#storage-and-import)).

Creating the directory or an empty file at `/var/lib/cdd/atlas.sqlite` is **path readiness only**. It is not Phase 1 complete.

### 3. First vertical — Europe

Ship **Europe** first: country packages under `data/countries/*` that are European, plus any Europe-bound uploads.

Russia remains excluded from the European build. Latin America and New Zealand are **Phase 2 / cutover-gate ingest inputs** so already-public offices and events exist in SQLite before redirects need them. That continuity is **not** an expansion of the launch vertical and must not displace Europe as the Atlas default landing.

Australia and Japan stay not-yet-supplied. See [Redirect strategy](#redirect-strategy) and [Phases](#phases).

### 4. Depth — regional first; municipal later

Ship **regional** calendars and indexes as we build. Municipal coverage arrives later as packages arrive. **Do not block launch** on full municipal coverage.

How regional coverage is counted is defined under [Regional coverage counting](#regional-coverage-counting). Do not treat workbook calendar labels such as “Regional / municipal” as proof that regional offices exist. Today’s checked-in Europe packages may have a **zero regional-tier numerator**; that is an explicit empty state, not a Phase 1 failure.

---

## Objectives

1. Give the Center a durable public **Election Atlas** at `/atlas` whose records come from a single master store, not from in-process merges of gzip shards and one-off adapters.
2. Make **Europe** the first complete-enough vertical: regional calendars, country indexes, and honest partial coverage — not a pretend continent-wide municipal register.
3. Keep the **marketing site, SEO, and existing research packages**. The Atlas is a product-area restructure, not a site rewrite.
4. Preserve research semantics already encoded in schema v1 (missing ≠ zero, date certainty, score gates, sourced IDs). Atlas storage changes the **runtime**, not the **rules**.
5. Leave a clean ingest path from frozen country packages and the Latin America release into SQLite, so later packages drop in without inventing a second identity system.
6. At **cutover**, one data plane: every surviving research page reads the **published master** (same publication / release set). Existing public links (including non-European office/event URLs) reach the same record or a clear record page — without expanding the Europe-first launch vertical.
7. Compute **derived tightness metrics only after** a successful master load (Phase 4). Do not bake tightness into package adapters or chase-tool exports.

---

## What we keep vs change

### Keep

| Asset | Why it stays |
| --- | --- |
| Marketing homepage and in-page IA (`/`, About, Research, Initiatives, Events, Connect) | Separate product surface. Prototype forms stay prototype forms. |
| Existing SEO (canonicals, sitemap, OG images, JSON-LD) | Retarget paths to `/atlas` at cutover, together with redirects; do not discard the SEO work from PR #5. |
| Research packages as **ingest inputs** | `data/research` (Latin America release), `data/countries/*` (Europe extracts, Armenia packed payload, NZ batch), `data/incoming/` zips. Frozen bytes stay frozen. |
| Schema v1 research semantics | `schemas/v1/normalized.ts`, field mapping, data dictionary, score gates, date precision, missing-vs-zero. |
| Source-backed correction workflow | Git reviews, `data/overrides/`, research-correction issue template. No admin UI in early Atlas phases. |
| Working PR #10 bridge adapters until a replacement is proven | Do not rip them out early. See [What waits](#what-waits). |
| Standalone Next.js deploy on the VPS | `output: "standalone"`, `npm start`. Atlas adds a SQLite file beside the app; it does not require a hosted database service. |
| Tests, lint, and `npm run build` | Must keep passing. Fixtures stay labelled fixtures. |
| Original implementation brief | `docs/implementation-brief.md` remains historical. This Atlas plan supersedes it for **product shape and storage**, not for research ethics. |

### Change

| Asset | What changes |
| --- | --- |
| Public base path | `/electiondatabase` → `/atlas`, with redirects **at cutover** (destinations already work; one data plane). |
| Master store | In-memory gzip + country-package merge → SQLite master on the VPS. |
| Default vertical | Observatory home today highlights South America. Atlas **landing** highlights **Europe**. Already-public non-European records remain reachable. |
| Query path | `lib/observatory/load.ts` process cache of JSON.gz → queries against SQLite (read-only in the web process). After cutover, leftover `/electiondatabase` pages (if any) read the same published master. |
| Country-package adapters (PR #10) | **Temporary bridges** into the master. Keep them working until a replacement ingest is proven. See [PR #10 adapters](#pr-10-adapters-temporary-bridges). |
| Generated JSON in `public/data` | Optional debug/export only; not how the Atlas reads production data. |
| Launch depth | Regional calendars/indexes ship as packages exist. Municipal completeness is not a launch gate. |
| Derived tightness | New Phase 4 work **after** master load. Not part of current adapters. |

### Do not treat as deleted

Latin America research, New Zealand packages, observatory routes, and PR #10 adapter code remain until an implementation PR replaces them **after** continuity is proven. This documentation PR does not remove `/electiondatabase` or rewrite loaders.

---

## Master entities

Canonical records live in SQLite. Identifiers stay stable and namespaced. Names are not primary keys. Unknown upstream fields survive in an extensions/raw payload.

These entities are the Atlas master — a persistence design for the conceptual model already in schema v1, plus Atlas-specific ingest metadata. Implementation PRs check in DDL and TypeScript types **after** the identity rules below are used to review that DDL. This plan does not contain schema code.

### Immutable dataset release vs ingest attempt

Split these. Do not use one row for both.

| Entity | Identity | Role |
| --- | --- | --- |
| **Dataset release** (immutable) | `release_id` | A **published** snapshot of **one source-dataset lineage** (see below). Created only after an ingest attempt of that lineage validates. Never mutated in place. Failed loads do not mint a release. |
| **Ingest attempt / run** (audit) | `attempt_id` | Operational record: started/succeeded/failed, operator/script, input paths and checksums, row counts, error text, timestamps, pointer to the lineage `release_id` on success. Failed attempts are **audit trail only**. An unchanged re-import still creates a **new attempt** and must keep the **same** `release_id`. |
| **Publication** (the swapped DB file) | The **set of `release_id`s** contained in the published master | What the site is serving right now. Atomic rename replaces the whole publication. Pages cite the lineage `release_id` of the record, not “whatever attempt last swapped the file.” |

Public record pages cite that record’s lineage `release_id`. Operators debug with `attempt_id`. The `/atlas/releases` index lists published lineage releases (and may show the current publication set), never failed attempts.

#### `release_id` hash inputs and lineage

Prefer **per source-dataset lineage**, not one global hash of the whole VPS file.

Examples of lineages: the Latin America zip derivative (`latin-america-fe5e91689def` today), each European country package (or a declared Europe-extract lineage), the New Zealand batch.

`release_id` is content-derived from, and only from:

1. The lineage’s package / normalized input checksums
2. Applicable files under `data/overrides/` for that lineage
3. Adapter, method, and schema **versions** used to load it

Do **not** fold unrelated lineages into the hash. Re-importing Albania with unchanged Albania bytes, overrides, and adapter/schema versions yields a new `attempt_id` and the **same** Albania `release_id`, even if Latin America already sits in the same SQLite file.

#### How a Latin America office cites `release_id` after a Europe re-import

A Brazil (or other LatAm) office page cites the **Latin America lineage** `release_id` (today `latin-america-fe5e91689def` until that lineage’s hash inputs change). A later successful Europe ingest:

- writes a new Europe `attempt_id`
- changes the Europe lineage `release_id` only if Europe packages, Europe overrides, or Europe adapter/method/schema versions changed
- atomically publishes a new **publication set** that still includes the unchanged LatAm `release_id`

The LatAm office citation does not jump to the Europe `release_id` and does not change because the file was swapped. Cite-this-record blocks show organization, page title, **lineage `release_id` / snapshot**, URL, and sources.

### Other master entities

| Entity | Identity | Role |
| --- | --- | --- |
| **Region** | `region_id` (`europe`, `south-america`, …) | Availability: available / partial / screened_out / not_supplied / fixture_only. Europe is the Atlas **default landing**. |
| **Country / territory** | stable slug (`country_id`) | Sovereign vs territory stay separate. Screening carries an as-of date. Russia is out of the Europe build. |
| **Geographic unit** | `geography_id` | Parent geography, aliases, source codes, effective dates. Geometry only when sourced. |
| **Office** | `(id_namespace, office_id)` e.g. `AL-01-M` | Tier/type, current vs historical, registry qualification. `current` ≠ current tenure. |
| **Election event / contest** | `(id_namespace, office_id, history_key)` plus `event_id` | Date with precision and certainty, event kind, selected-history role, ballot basis, legal outcome. **Office namespace is part of the event key and every event FK.** |
| **Proceeding / result version** | `proceeding_id` | Round, recount, annulment, certification, supersession. FKs carry the same office namespace as the parent event. |
| **Result row** | `result_row_id` | Candidate/list, party namespace, votes/shares, seats, evidence. Missing ≠ zero. |
| **Party / group mapping** | `party_mapping_id` | Original label/code scoped by country/source/election; mapped group with uncertainty. |
| **Officeholder observation** | `officeholder_id` | Dated roster/term; never automatically current tenure. |
| **Electoral register observation** | `register_id` | Dated elector counts. Not a person. Do not sum overlapping office types. |
| **Poll observation** | `poll_id` | National vs local; local polls attach only to a named office. |
| **Imported metric observation** | `metric_id` | Competition index and grouped Pedersen as **imported** (with `score_gate`, review status). Not tightness. |
| **Derived tightness observation** | `tightness_id` | **Phase 4 only.** Written after master load from eligible events; never invented during ingest. |
| **Evidence / source** | `source_id` when resolved | Publisher, title, URL, hash/locator, data rights (unknown unless supplied). |
| **Unresolved evidence token** | explicit token, not an FK | Source references that do not match a catalogue row. See [Unresolved evidence](#unresolved-evidence). |
| **Research issue / coverage gap** | `issue_id` | Category, resolution state, required evidence. Aligns with chase-tool work items. |
| **Completion / chase item** | `chase_item_id` when supplied | Office- or country-level remaining work. Maps to the existing completion queue. |
| **Briefing / artifact** | `artifact_id` | Path, checksum, availability. Original binaries stay off git. |
| **Identity crosswalk** | `(id_namespace, source_id, atlas_id)` | Required before new Atlas keys are minted. See [Identity scope, uniqueness, and crosswalk](#identity-scope-uniqueness-and-crosswalk). |
| **Office tier classification** | per-country checked-in file | Authoritative `GovernmentTier` mapping for that package. See [Regional coverage counting](#regional-coverage-counting). |
| **Calendar cohort / index projection** | derived view or table | Regional calendars and country indexes. Rebuilt from master, not hand-edited. |

Preserve existing `offices[].id`, `histories[]._key`, source IDs, and package office IDs.

### Identity scope, uniqueness, and crosswalk

Approve DDL only if it implements these rules. Random IDs on each import are forbidden.

| Entity | Scope of uniqueness | Crosswalk / preservation |
| --- | --- | --- |
| Dataset release | Unique among published releases **within a lineage**. `release_id` hashes that lineage’s packages + `data/overrides/` + adapter/method/schema versions. | Map to today’s observatory `release.id` (e.g. `latin-america-fe5e91689def`) and to package archive checksums. |
| Ingest attempt | Global. `attempt_id` is unique, never reused, never equal to a `release_id`. | FK to the lineage `release_id` on success; null on failure. Unchanged re-import → new attempt, same `release_id`. |
| Publication | The published file is identified by its **set of lineage `release_id`s**. | LatAm pages keep citing the LatAm member of that set after a Europe-only re-import. |
| Region | Global `region_id`. | Stable strings already used in schema v1. |
| Country / territory | Global `country_id` (slug). `country_code` unique where present; compound codes allowed (`GG-ALD`). | Package folder slug, `manifest.country` / `country_code`, observatory `countries[].id`. |
| Geographic unit | Unique within `country_id` for a given effective interval. | Source codes and aliases; parent FK. Names are not keys. |
| Office | Unique as `(id_namespace, office_id)`. Default namespace is the upstream observatory/package office ID space. | **Preserve** `AL-01-M`, `AD-M-05`, `GG-ALD-STATES`, Latin America office IDs, NZ race IDs. If an Atlas surrogate is ever required, mint a deterministic namespaced key and **store the crosswalk before use**. |
| Event | Unique as `(id_namespace, office_id, history_key)`. `event_id` unique within the dataset. **Every event FK includes `id_namespace` (or a surrogate that embeds it).** | Preserve `histories[]._key` and today’s event IDs so old `/elections/:id` links resolve. Do not key events on bare `office_id` alone. |
| Proceeding | Unique per namespaced event + proceeding kind/sequence. | Supersession points at the surviving proceeding; withdrawn/annulled rows remain addressable. |
| Result row | Unique per proceeding/event + source row identity. | Missing ≠ zero; do not reuse a result_row_id for a different candidate. |
| Party mapping | Scoped by country + source + election context. The same code in two namespaces is two mappings. | Do not equate successor movements without evidence. |
| Source | Country-namespaced when resolved. Preserve original source ID after the existing `country--` prefix where that contract already applies. | Unresolved tokens are **not** source FKs. |
| Artifact / briefing | Checksum + original path. | Byte identity, not filename guess. |

Additional rules:

- Names, labels, and slugs used for display are not primary keys.
- Repeat import of the same lineage hash inputs yields the same identities, research dates, and `release_id`. Operational timestamps on the **attempt** may change.
- Absence of a row in a later **incomplete** package is not a delete (see [Conflict display and correction precedence](#conflict-display-and-correction-precedence)).
- Fixtures (`FIX-*` / `FXT-*`) stay in a fixture namespace and never enter a published release.

### Unresolved evidence

A source token that does not match a catalogue row is **explicit unresolved evidence**:

- Store it as an unresolved-evidence record (original token, country/office/event locator, why unresolved).
- Do **not** insert a dangling `source_id` FK.
- Do **not** fabricate a URL or publisher to make the FK succeed.
- Display copy states that the reference is unresolved. Validation may **warn**; it must not “fix” the token.

Broken FKs to offices, events, geographies, or **resolved** sources still fail closed (see acceptance checks). Unresolved evidence is a different state, not a broken reference.

---

## Storage and import

### Where the DB lives

| Environment | Path | Notes |
| --- | --- | --- |
| Production VPS (preferred) | `/var/lib/cdd/atlas.sqlite` | Directory owned for the import user; file mode so `www-data` can **read**. The Next.js process does not need write. |
| Production VPS (app-local) | `data/master/atlas.sqlite` under the deployed app | Same permission model if `/var/lib/cdd` is unavailable. |
| Local / CI | `data/master/atlas.sqlite` (gitignored) or a temp path | Created by npm scripts. Never commit the DB file. |
| Override | `ATLAS_SQLITE_PATH` | Single explicit path for import, migrate, and app read. |

**Path readiness vs Phase 1.** mkdir/`chown` of `/var/lib/cdd` (or touching an empty `atlas.sqlite`) only proves the VPS path and permissions. It is **not** a Phase 1 exit. Phase 1 exits only when the [Phase 1 checklist](#phase-1--albania-storage-proof-no-route-changes) is done, including Albania import proof and named CI tests.

Git contains:

- SQL migrations / DDL (versioned)
- import adapters and npm script entrypoints
- schema/types that describe master tables
- per-country tier-classification files
- checksums and release manifests

Git does **not** contain `.sqlite`, Parquet dumps, or the Latin America zip. Optional JSON/Parquet exports may be written under a gitignored `data/exports/` (or similar) for debug.

**Reproducibility.** The published master must be **rebuildable from git + checksummed off-git inputs** (Latin America zip, Europe archive when a package still needs it). VPS backups are for **speed** of restore, not the sole recovery path.

### How imports run

Imports **produce or update** the master DB through npm scripts. Proposed commands (names can be bikeshed in the implementing PR; the contract cannot):

```bash
# apply checked-in migrations to ATLAS_SQLITE_PATH
npm run migrate:atlas

# ingest recognized inputs into the master SQLite file
npm run import:atlas

# validate master + remaining package/release checks
npm run validate:data
```

Until those scripts exist, today’s commands remain:

- `npm run import:data` — Latin America zip → `data/research`
- `npm run import:countries` — inventory `data/countries/*` (PR #10)

The implementing PR should wire those existing importers as **bridges**: they read the same inputs and **upsert the SQLite master**, instead of (or in addition to) merging in memory. Bridges must use the checked-in [tier-classification files](#regional-coverage-counting), not calendar cohort strings.

### Atomic publication (one protocol)

A failed import must leave the **last validated published data** visible. Use this protocol; do not invent a second one.

1. **Serialize.** One writer (lockfile or equivalent). Concurrent `import:atlas` / `migrate:atlas` is an error.
2. **Durable attempt row first.** Append `attempt_id` = started to an attempt log that **does not live only inside the staging file** (sibling log DB/file on the same filesystem, or a table in the published DB that staging never replaces wholesale). Staging rollback must not erase the attempt.
3. **Stage on the same filesystem** as the published file (`atlas.sqlite.staging` next to `atlas.sqlite`, or equivalent). Do not stage on a different mount if rename would copy.
4. Load into staging. Validate (identities, namespaced FKs, missing-vs-zero, date precision, score gates, fixture exclusion, unresolved-evidence tokens).
5. On **failure:** leave published file untouched; mark attempt failed; return non-zero. Site keeps serving the previous publication.
6. On **success:**
   - Copy an **off-VPS recoverable backup** of the current published file (if any) **before** production publication. Also keep on-VPS copies: **last N** plus **one per lineage `release_id`** in the publication set.
   - **WAL checkpoint** the staging DB so the file to rename is a consistent main database, not an uncheckpointed WAL pair.
   - Ensure **release metadata is inside the file being published** (lineage `release_id`s, checksums, schema version) so it is visible atomically with the data.
   - `fsync` staging; **atomic rename** onto `atlas.sqlite`; `fsync` the directory.
   - Mark attempt succeeded with the lineage `release_id`(s) published.
7. Readers are read-only (`query_only`). After rename, reopen connections so the app does not keep a deleted inode.

Never mint a `release_id` for a failed attempt. Unchanged successful re-import: new attempt, same lineage `release_id`, new publication swap (content-identical for that lineage).

**Startup reconciliation.** If a previous publish was interrupted (staging present, rename incomplete, WAL leftover, or attempt = started with no terminal status), the app/importer on start must recover to the last good published file (or refuse to serve research) and mark the attempt failed or resume only from a documented safe point. Do not serve a half-renamed master.

**Migrate-then-deploy.** Apply migrations that the new app requires **before** switching the web process to that app version. If a live migrate of the published file is unavoidable, take an explicit brief **503** (or equivalent) rather than letting mixed schema/app versions serve pages.

**SQLite journaling.** WAL on staging and published as needed so `www-data` can read the published file while the importer writes staging. The web process must not have write permission.

Optional JSON/Parquet dumps are written **after** successful publication, never as the write-ahead path.

### Conflict display and correction precedence

Short rule set — apply in this order:

1. **Package / immutable source wins** for a given field unless a documented editorial override exists under `data/overrides/` with provenance (source, date, claim, affected IDs).
2. **Never infer deletion** from an incomplete package. A package that omits an office, event, or source that a previous validated release still carries does not delete that record. Removal requires an explicit withdrawal (below).
3. **If neither rule selects a single value** (two sourced claims, no override): **retain both with sources** and **withhold** any single resolved calendar date or metric value. Do not average, pick newest, or let the website invent a winner.
4. Overrides never rewrite frozen extract bytes. They apply at ingest into the master and remain reviewable in git.

### Withdrawal and supersession

- **Withdrawal** of a published record is explicit: a sourced withdrawal/supersession row (who, when, why, replacement ID if any). Silence is not withdrawal.
- **Supersession** of results uses the existing proceeding model (recount, annulment, certification). Annulled and superseded evidence remains addressable; it is not a second election and is not deleted.
- Withdrawn or superseded offices/events keep their IDs so old URLs still resolve to a record page that states the status.
- A **corrected** re-import (hash inputs changed) is a new ingest attempt that publishes a **new** lineage `release_id`. An **unchanged** re-import is a new attempt with the **same** `release_id`.

### Where off-git inputs can be recovered

| Input | In git? | Recovery |
| --- | --- | --- |
| Latin America zip `Latin_America_Races_and_Briefings.zip` | No | SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` in `data/research/manifest.json`. Restore from `data/incoming/` or the configured artifact host (`ELECTION_ARTIFACT_BASE_URL`). Normalized `data/research/*.json.gz` is the current committed derivative. |
| Europe archive `Europe_Excluding_Russia_Election_Data_2026-09-15.zip` | No | SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9` on country-package manifests. Country folders in git are extracts, not the zip. |
| Europe workbook `Europe_Excluding_Russia.xlsx` | No | SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665` on extract manifests. |
| Armenia packed payload | Chunks in git | Reassemble via `manifest.chunks`; `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`. Companion XLSX lives inside the tarball, not as a public artifact host. |
| New Zealand `dataset.json` | Yes | File hash `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` (SHA-256 of the committed file as of this plan revision). |
| SQLite master / backups | No | Rebuild from git + checksummed off-git inputs. On-VPS: last N + one per lineage `release_id`. Off-VPS copy required before production publication. Optional post-publish JSON/Parquet is debug. |
| Synthetic fixtures | Tests only | Must not be used to recover production. |

### PR #10 adapters (temporary bridges)

[PR #10](https://github.com/FTFNAnalytics/digitaldemocracy/pull/10) added Europe / Armenia / New Zealand adapters that map standalone packages into schema v1 at load time. That is the correct **short-term** way to show country folders on the current observatory.

For the Atlas they are **temporary bridges into the master**:

- Keep using them so frozen packages (`site_ingestion_status: pending_adapter`) do not need byte-level rewrites.
- Point their output at SQLite upserts rather than a long-term in-process merge.
- **Ban calendar cohort strings as tier classifiers** in bridges; use the checked-in per-country tier file.
- Do **not** replace working bridges early. Replacement is a later PR after a bounded SQLite ingest is proven.
- Do not treat adapter-in-memory merge as the architecture to extend for municipal coverage or tightness.

---

## Redirect strategy

### Implementation vs cutover

These are different events:

| Event | What it is | Redirects? |
| --- | --- | --- |
| **Implementation starts** | Schema, Albania storage proof, `/atlas` shell, Phase 2 continuity ingest. `/electiondatabase` stays live. | **No.** |
| **Cutover** | Destinations already work; named cutover-gate inputs are in SQLite; one data plane; [cutover checklist](#cutover-gate) signed with evidence. | **Yes**, together with SEO. |

Do not flip `/electiondatabase` redirects when `/atlas` is only a Europe landing page that 404s offices. Do not treat “we started Atlas work” as cutover.

### One data plane (partial cutover)

After cutover there is **one published master** (one publication set). Rules:

- Any `/electiondatabase` route that **survives** cutover (not yet redirected) must **read that published master**, not leftover gzip shards or an in-memory package merge from a different load.
- Prefer redirecting a surface once its `/atlas` destination works. **Explorer is a cutover requirement** (so it is not left on a second data plane). Advanced compare/polling still wait unless a harvested old URL requires a compatibility view.
- Redirects still fire **only** when the destination works.
- Office and event URLs **never** redirect to Atlas home.

### What may redirect, and where

Permanent redirects (HTTP 308 or Next.js `permanent: true`) at cutover. **Preserve query strings** (`?region=europe`, compare office IDs, explorer filters) where the destination still understands them.

**Do not** redirect office/event URLs — or already-public non-European observatory URLs — to Atlas home.

| Old path | Cutover destination | Canonical after cutover | Query params |
| --- | --- | --- | --- |
| `/electiondatabase` | `/atlas` | `/atlas` | n/a (Europe landing) |
| `/electiondatabase/regions` | `/atlas/regions` | `/atlas/regions` | preserve if used |
| `/electiondatabase/countries/:id` | `/atlas/countries/:id` | `/atlas/countries/:id` | preserve |
| `/electiondatabase/explorer` | `/atlas/explorer` (**required** at cutover) | `/atlas/explorer` | preserve `q`, `region`, filters |
| `/electiondatabase/offices/:id` | `/atlas/offices/:id` | `/atlas/offices/:id` | never `/atlas` home |
| `/electiondatabase/offices/:id/original` | `/atlas/offices/:id/original` | `/atlas/offices/:id/original` | n/a |
| `/electiondatabase/elections/:id` | `/atlas/elections/:id` | `/atlas/elections/:id` | never `/atlas` home |
| `/electiondatabase/compare` | `/atlas/compare` only if required by harvested URLs or a shipped compatibility view; else **do not redirect to home** — keep old path on the **master** or omit redirect until the surface exists | matching canonical when shipped | preserve office IDs |
| `/electiondatabase/calendar` | `/atlas/calendar` | `/atlas/calendar` | preserve month/filters; uncertain dates stay labelled |
| `/electiondatabase/polling` | same rule as compare (advanced polling waits) | when shipped | do not dump to home |
| `/electiondatabase/coverage` | `/atlas/coverage` | `/atlas/coverage` | preserve |
| `/electiondatabase/sources` | `/atlas/sources` if present; else leftover reads **master** | when shipped | preserve |
| `/electiondatabase/downloads` | `/atlas/downloads` if present; else leftover reads **master** | when shipped | preserve |
| `/electiondatabase/methodology` | `/atlas/methodology` | `/atlas/methodology` | n/a |
| `/electiondatabase/releases` | `/atlas/releases` | `/atlas/releases` | published lineage releases only |
| `/electiondatabase/about` | `/atlas/about` | `/atlas/about` | n/a |
| `/electiondatabase/artifacts/:id` | `/atlas/artifacts/:id` | `/atlas/artifacts/:id` | same artifact |

Unknown slugs still 404 (as today). Marketing homepage is never the fallback for a research URL.

The cutover PR checks this table in a [checked-in checklist](#cutover-gate) with evidence links (not a verbal “looks fine”).

### Minimal record-detail / compatibility views

Bring these **forward** (Phase 2) so cutover is possible without waiting for full Phase 3 surfaces:

- Office detail sufficient to identify the office, geography, tier, next-election date **with certainty/precision intact**, selected histories, and status (including withdrawn/superseded).
- Event detail sufficient to identify the contest, date uncertainty, legal outcome, and result rows (missing ≠ zero).
- Original briefing route where a briefing already exists.
- Country index pages for **already-public** countries, including non-European ones, even though Europe is the default landing.
- Explorer reading the published master.
- Coverage labels that do not pretend municipal or non-European completeness, and that state an **empty regional numerator** when that is the fact.

These views plus **Phase 2 ingest of Latin America and New Zealand** (named cutover-gate inputs) are how already-public offices/events exist in SQLite **before** redirects need them. They are **not** a decision to make Latin America or Oceania the launch vertical.

SEO follow-through in the **same cutover change** as redirects: canonical URLs, sitemap, robots, Open Graph, and JSON-LD `url` / `urlTemplate` move to `/atlas`. Marketing nav labels may say “Election Atlas” while keeping the rest of the homepage copy.

Do **not** add these redirects in this documentation PR.

---

## Phases

Implementation PRs should land in this order. Each phase must leave `npm run build` green and must not invent election results. Phases 1–2 can proceed on the VPS and in git **without** retiring `/electiondatabase`. Redirects wait for cutover.

See [Immediate build order](#immediate-build-order).

### Phase 0 — Amend this plan (this PR)

- Record accepted decisions (URL, SQLite, Europe, regional depth).
- Inventory actual ingest inputs; define regional coverage counting, identity rules, atomic publication, one data plane, and cutover.
- **Exit:** Justin says merge. Site still serves `/electiondatabase`. No schema or Atlas UI in this PR.

### Phase 1 — Albania storage proof (no route changes)

Separate **European storage proof** from **regional calendar proof**. Phase 1 is storage + identity + publication protocol. It is **not** a regional-calendar launch and is **not** failed if Albania’s regional numerator is zero.

Named bounded proof: **Albania** only (not a grab-bag of Europe; **Armenia is last** among early European targets and is not Phase 1).

Phase 1 PR contents:

- No public route changes
- `.gitignore` for `*.sqlite` / `data/master/`
- `ATLAS_SQLITE_PATH`
- `migrate:atlas` / `import:atlas` entrypoints
- DDL reviewed against the identity table (lineage `release_id` vs `attempt_id`, namespaced office/event keys, unresolved evidence, publication set)
- Albania **tier-classification file** (checked in; DDL-like review)
- Albania import proof into SQLite (atomic publish, failed-import rollback, unchanged re-import → new attempt / same `release_id`)
- Named ingest acceptance rows as **required automated CI tests**
- VPS path readiness allowed as ops hygiene — **not** an exit

**Exit:** CI green on those tests; Albania lineage published in a local/CI DB rebuildable from git + checksums. Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.

Keep `/electiondatabase` on the current loaders. **No public redirects. No tightness.**

### Phase 2 — Continuity ingest + `/atlas` shell (still not cutover)

Field maps and CI gates for LatAm/NZ continuity are documented in [`docs/phase2/`](phase2/README.md). Approved-pack import CI runs (`npm run test:atlas-import`); residual-heavy drafts are skipped. Do not invent tiers or alter Mexico share values in a documentation PR. Production Mexico override is still original 67; Prompt M 95 sibling withholds are accepted as disposition (docs PR #27 landed) and are not executable yet (see [Current state](#current-state-2026-09-17)).

**Named cutover-gate inputs (ingest in this phase, before redirects):** Latin America release, New Zealand package, and remaining early European packages as reviewed (Andorra, Alderney, …; **Armenia last** among those early targets). Europe remains the Atlas **default landing**. Continuity ingest ≠ expanding launch scope.

**Minimum-content floor** for the SQLite-backed `/atlas` shell:

| Surface | Floor |
| --- | --- |
| Landing | Europe default; honest partial coverage |
| Country indexes | Every country in the publication set that is already public today |
| Regional calendar | Projected from `tier = regional` only; **explicit empty state** if the European numerator is zero (expected with today’s packages) |
| Coverage labels | Regional counting rules; no PR-count KPIs |
| Office / event / original briefing | Minimal compatibility views for **all already-public IDs** (LatAm + NZ + Europe in SQLite) |
| Explorer | Required (one data plane / cutover) |

Regional **calendar proof** lives here, not in Phase 1. A zero regional-tier numerator is a labelled empty calendar, not a blocker.

`/electiondatabase` remains canonical until the cutover gate passes. Leftover observatory pages that still run in this phase should be moving onto the master; they must not mix gzip-only reads with Atlas SQLite reads for the same records.

**Exit:** Named cutover-gate inputs are in the published master; `/atlas` meets the floor; already-public office/event IDs resolve on `/atlas` **before** redirects flip.

### Cutover gate (after Phase 2 destinations work)

Not a new research-scope phase. The release allowed to retire `/electiondatabase`.

Redirects + SEO ship **together** only after the [checked-in cutover checklist](#cutover-checklist) has evidence links. Ingest-style rows that can be automated stay in CI; **cutover rows are a checklist with evidence**, not a vibe pass.

### Phase 3 — Expanded Atlas surfaces and **new packages only**

- Fuller coverage, sources, downloads, methodology, and remaining product surfaces reading SQLite.
- Ingest **new** packages only (later Europe uploads, municipal packages as they arrive, any newly supplied Australia/Japan, new overrides). Do **not** describe Latin America or New Zealand as Phase 3 ingest — they are Phase 2 / cutover-gate inputs.
- Municipal completeness still does not block launch.
- Retire in-memory gzip merge as the primary query path once Atlas reads and cutover are proven.
- Advanced compare/polling wait unless already required for a harvested old-link destination.
- **Exit:** One master, one public path after cutover, existing research still cited with original IDs and lineage `release_id`s; coverage remains partial where research is partial.

### Phase 4 — Derived tightness metrics (after master load)

- Compute tightness **only after** a successful master load, from eligible events already in SQLite.
- Store tightness as derived observations with method version, inputs, and eligibility/withholding reasons.
- Do not backfill tightness inside country-package adapters or chase-tool dumps.
- Optional export of tightness tables as JSON/Parquet debug artifacts.
- Keep imported CI / Pedersen distinct: those remain source-gated metrics, not substitutes for tightness.
- **Exit:** Tightness visible only where eligibility is documented; null stays null; no tightness claim on incomplete municipal series.

---

## Immediate build order

**Phase 0:** Amend plan (this PR) → merge when Justin says.

**Phase 1:** Un-gated by Justin’s disposition on this revision. No route changes; `.gitignore` sqlite; `ATLAS_SQLITE_PATH`; migrate/import entrypoints; DDL vs identity table; Albania tier file; Albania import proof; named CI tests; VPS path readiness ≠ exit.

**Then stop for Phase 2 review.**

Phase 2 (after that review): LatAm + NZ + remaining early Europe ingest; `/atlas` shell at the minimum-content floor; regional calendar proof (including empty numerator); explorer on the master.

Then cutover checklist → redirects + SEO together.

---

## What waits

Not launch blockers; not part of Phase 1:

- Full municipal coverage for Europe or anywhere else.
- Expanded non-European research as **launch scope** (Latin America and NZ are Phase 2 continuity ingest / cutover-gate inputs, not the default vertical).
- Advanced compare and polling products beyond what old-link continuity requires.
- Replacing working PR #10 bridge adapters early.
- Derived tightness (Phase 4).

---

## Chase-tool alignment

The chase tool is the research-operations surface for collecting dates, sources, and remaining work. The Atlas is the public publication of what has already been chased and packaged. They must share identities; they must not become two competing masters.

| Topic | Alignment |
| --- | --- |
| **Direction of data** | Chase tool → packages / uploads → Atlas import scripts → SQLite master. Atlas does not become the place researchers first record a date. |
| **Identities** | Office IDs, country slugs, history keys, and source IDs used in chase exports must round-trip, **including office namespace on event keys**. If the chase tool supplies a `chase_item_id`, store it on the completion/issue row. |
| **Calendars** | Regional calendars are projections of chased dates. Do not “confirm” a date the chase tool left uncertain. Use interval-overlap filtering and a separate unknown-date section ([Regional coverage counting](#regional-coverage-counting)). |
| **Coverage queue** | Atlas `coverage` / issues map to chase remaining-work items. Closing a gap happens in research + git/package update, then re-import — not by editing SQLite by hand on the VPS. |
| **Conflicts** | Package wins unless documented override; incomplete package ≠ deletion; if neither selects, retain both and withhold a single resolved calendar/metric value. |
| **Europe first** | Chase and ingest prioritize European regional calendars and indexes. Municipal chase items may exist in packages; Atlas will show them when present and will not wait for a full municipal chase. |
| **Adapters** | PR #10 adapters may translate chase/package tables into master rows. They are bridges, not a second chase UI, and are not replaced early. |
| **Tightness** | Not a chase-tool field. Chase captures evidence and eligibility; Atlas **derives** tightness in Phase 4 after load. |
| **Exports** | Optional JSON/Parquet shards may be fed back to chase-tool for diffing, but SQLite remains authoritative for the site. |
| **Non-replacement** | Early Atlas phases do not ship an authenticated chase/admin console. Source-backed corrections stay on GitHub. |

---

## Success metrics

Software success is not research completeness. Research coverage remains partial until a reconciled import says otherwise.

### Product targets

| Metric | Target |
| --- | --- |
| Public path | After cutover, `/atlas` is canonical; `/electiondatabase` redirects per the table. Before cutover, `/electiondatabase` remains live. |
| One data plane | After cutover, every surviving research page reads the published master (same publication set). |
| Master store | Production reads `/var/lib/cdd/atlas.sqlite` (or the app-local equivalent). No SQLite binary in git. Path existence alone is not success. Rebuildable from git + checksummed off-git inputs. |
| Ingest | `npm` import scripts create/update that DB from checked-in schemas. Phase 1 = Albania storage proof; Phase 2 = named cutover-gate inputs (LatAm, NZ, remaining early Europe). |
| First vertical | Europe is the Atlas default landing; Russia excluded; coverage labelled using [Regional coverage counting](#regional-coverage-counting). |
| Depth | Regional calendars and indexes are usable at launch, including an honest **empty** regional numerator. Municipal completeness is **not** a launch criterion. |
| Continuity | Marketing site still ships. Already-public office/event URLs keep reaching the same record (or a clear record page), including non-European IDs. |
| Tightness | Absent until Phase 4; then only from master-loaded eligible events. |
| Quality bar | `npm test`, `npm run lint`, `npm run validate:data`, and `npm run build` stay green. |

### Ingest acceptance — required automated CI tests (Phase 1 PR)

These rows **must** be automated tests in the Phase 1 PR (not manual-only):

| Check | Passes when |
| --- | --- |
| **Unchanged re-import** | Same lineage hash inputs twice → same identities, research dates, content hashes, and **`release_id`**. New `attempt_id` each time. |
| **Corrected import** | Changed package bytes or `data/overrides/` → new lineage `release_id`; previous release auditable; unchanged record IDs preserved. |
| **Failed-import rollback** | Deliberate failure leaves last validated published data visible; failed attempt logged **outside** discarded staging; not a release. |
| **Broken references** | Dangling office/event/geography/**resolved-source** FKs fail closed. Unresolved evidence tokens are explicit records, not fabricated FKs/URLs. |
| **Preserved IDs + namespace** | Upstream office IDs, history keys, source IDs, already-public event IDs round-trip. Event keys/FKs carry `id_namespace`. No random IDs. |
| **Missing vs zero** | Recorded zero stays zero; unknown/null stays missing; they never collapse. |
| **Uncertain dates** | Month/year/range/conditional/unknown stay at that precision. No invented day. Interval-overlap filtering; unknown dates are not confirmed in-window. |
| **Score gates** | `score_gate: false` never displays as cleared CI. Incomplete series stay withheld. Withheld when conflicts do not resolve to one metric. |
| **Fixture exclusion** | `FIX-*` / `FXT-*` / `OBSERVATORY_FIXTURES` never appear in a published production release or public Atlas totals. |
| **Tier file** | Albania (then other countries) classification file drives tier; calendar cohort strings are not classifiers. |

### Cutover checklist

Checked in with the cutover PR. Each row needs an **evidence link** (log excerpt, test output, screenshot path, or CI run). Not a substitute for Phase 1 CI.

| Row | Evidence |
| --- | --- |
| **Pre-cutover access-log harvest** | Harvest of real `/electiondatabase` URLs (offices, events, explorer query strings, countries) used to drive destination tests. |
| **Named cutover-gate inputs in master** | LatAm + NZ + required Europe lineages present; publication set listed. |
| **Record parity** | Harvested office/event IDs resolve on `/atlas`; missing ≠ zero; dates/score gates/fixtures as in CI. |
| **Route-level destination / canonical / query-param** | Every row in the redirect table: destination exists, canonical matches, query params preserved where specified; office/event never → `/atlas` home. |
| **Sitemap / canonical parity** | Sitemap URLs, `alternates.canonical`, OG/JSON-LD match `/atlas` after cutover; no leftover canonicals pointing at retired paths for redirected pages. |
| **One data plane** | No surviving `/electiondatabase` page reads gzip/package merge instead of the published master. Explorer is on `/atlas`. |
| **Backup / restore** | Off-VPS backup taken before production publication; restore into scratch path serves a known office ID and schema version. |
| **Startup reconciliation** | Documented recovery from interrupted rename/WAL (test or drill). |
| **Post-cutover 404 monitoring** | Watch harvested URLs and sitemap paths for 404/redirect loops after flip; owner + window named. |
| **Redirect + query-string continuity** | Same as route-level row, exercised against the harvest. |

Honesty: UI never presents fixture data as production research; never presents Latin America completeness as European completeness; never presents PR-era office counts as current Atlas coverage.

---

## Non-goals

- Implementing Atlas UI, SQLite DDL, npm import scripts, or redirects **in this PR**.
- Blocking launch on a complete municipal register for Europe (or anywhere else).
- Committing giant DB files, Parquet lakes, or original zip archives to git.
- Replacing or restyling the marketing homepage as part of Atlas work.
- Reopening `/atlas` vs `/electiondatabase`, SQLite vs JSON-in-git, Europe vs Latin America first, or regional vs municipal launch depth.
- Treating PR #10 in-memory adapters as the permanent query layer, **or** replacing those working bridges before a SQLite ingest is proven.
- Computing tightness (or any new derived index) during package ingest or inside chase-tool.
- Redirecting office/event (or other already-public record) URLs to Atlas home.
- Mixing gzip-shard reads and SQLite reads after cutover.
- Hosted Postgres/MySQL, login, or a chase-tool admin clone on the public site.
- Live scraping or API credentials as a prerequisite to build.
- Including Russia in the Europe vertical.
- Invented geometry, national-to-local swing models, or treating national polling as a local forecast.
- Claiming research coverage is complete because the software build passed.
- Treating VPS path creation as Phase 1 complete.
- Treating Albania storage proof as regional calendar proof.
- Promoting historical PR office counts (including PR #10’s “202 European package offices”) into current coverage claims.
- Open-ended “pending further audits” before Phase 1 after Justin disposes this revision.

---

## Current repository snapshot

Context for Phase 0 inventory. **Not** Atlas launch coverage. For live `main` as of 2026-09-17, see [Current state](#current-state-2026-09-17). Do not freeze these row counts as product KPIs; do not promote historical PR counts into current coverage claims.

Operational detail for the live observatory remains in [`docs/electiondatabase-progress.md`](electiondatabase-progress.md) and [`docs/electiondatabase-country-packages.md`](electiondatabase-country-packages.md). Those docs describe the system as it is; this plan describes the system as it will be.

### Runtime (as of mainline including PR #10)

- Observatory routes live under `/electiondatabase` (`lib/observatory/routes.ts`).
- Latin America release loads from `data/research`; country packages merge at runtime via `lib/observatory/adapters/`.
- Observatory home still highlights South America. `/atlas` landing highlights Europe; that is independent of keeping already-public URLs working.
- `/atlas` index / countries / offices now exist and read SQLite. `/atlas/explorer` is **not** on main. Cutover redirects are **not** on. Phase 0 scaffolding created gitignored SQLite files; Albania storage proof and approved-pack ingest have since landed.
- `data/incoming/` has no zip (only README / `.gitkeep`). Mexico share-domain production override lives under `data/overrides/atlas/latin-america-fe5e91689def/` (original 67). Fixtures stay under `tests/fixtures/` (test-only).
- `.gitignore` ignores `*.sqlite` / WAL / SHM and `data/master/` database files (Phase 1 scaffolding).

### Regional coverage counting

Use this definition in Atlas coverage labels, calendars, and success checks.

1. **Checked-in per-country tier-classification file** (reviewed like DDL). It maps each office ID in that package to schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` / `council` / `other`) from sourced office type + geography — **not** from workbook calendar cohort **Tier** strings. Bridges **must not** classify from labels such as Albania/Andorra `Regional / municipal`.
2. **Numerator (regional offices):** current tracked offices in the published master with `tier = regional` for the stated country or region.
3. **Denominator:** the sourced regional-office universe when the package or register states one (count of regional offices on the planning map / statutory list, with as-of date). If the universe is unknown, the denominator stays **unknown** — do not invent “all European regions” or “all NUTS-2 units”.
4. **No applicable regional tier / empty numerator:** if a country’s supplied register contains no regional offices, say **no regional tier in this package**. That is not “0% of a fake regional universe.” **Today’s checked-in Europe packages with approved classifiers on main (Albania, Andorra, Alderney, Armenia) may yield a European regional numerator of zero.** Austria is now on main with **4** approved regional offices (Prompt N PR #28); `import:atlas` loads them. Phase 2’s regional calendar must show empty or partial states explicitly. It does not fail Phase 1 storage proof and does not block shipping the calendar shell.
5. **Calendar filtering:**
   - **Interval overlap** for partial dates: a month- or year-precision value is in a filter window if its interval **overlaps** the window, not only if a missing day was invented as day 1.
   - **Unknown dates** go in a **separate labelled section**. Unknown is **not** confirmed in-window.
   - Called, statutory, expected, and conditional dates remain distinct. Conditional stays labelled. Year-only and missing-day values keep that precision.
   - Filter by office tier from the classification file, independently of calendar cohort strings.
6. **Municipal rows** may appear in the same country package; they are not counted in the regional numerator. Launch does not wait for them.
7. **Storage proof ≠ calendar proof.** Phase 1 Albania import can succeed with zero regional-tier offices. Phase 2 proves the regional calendar against whatever numerator the classification files yield.

### Input inventory (this revision)

Shared Europe archive (off-git): `Europe_Excluding_Russia_Election_Data_2026-09-15.zip`, SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9`. Shared workbook SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665`. Window 2026-09-08–2028-03-08 inclusive. Russia excluded. Package `coverage_complete` is false. Frozen extracts keep `site_ingestion_status: pending_adapter` (Armenia: `website_ingestion: pending`). Website adapters consume them at load time; that is **not** a published SQLite release.

**Early European target order:** **Albania** (Phase 1 bounded proof) → Andorra / Alderney (Phase 2, after review) → **Armenia last** among those early targets (packed payload; overlapping history index).

| Input | Country / scope | Adapter / kind | Checksums (plan revision) | Register / tier (from package files, not PR copy) | Validation status | Coverage gaps (as stated on the package) |
| --- | --- | --- | --- | --- | --- | --- |
| `data/countries/albania` | Albania (Europe, sovereign) — **Phase 1 proof** | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62`; `coverage.json` `7687efabe16f9e0a91037964814907d9d928b050864d3637a60703683c4973b0` | 122 office-register rows: mayor + municipal council. Calendar cohort string `Regional / municipal` is **not** a classifier. Phase 1 adds a checked-in tier file expected to mark these **municipal**. **No regional-tier offices in this package.** | Package `coverage_complete: false`. `npm run import:countries` adapter validation reported no errors at last local run; research is not complete. Country `validate.py` exists. | Next polling date uncollected; 2019 boycott blocks comparable scores (0 competition / 0 volatility); proposed 46-municipality 2027 map unverified; remaining officeholders. |
| `data/countries/andorra` | Andorra (Europe, sovereign) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f` | 7 communal councils. Calendar `Regional / municipal` is not a classifier; expected **municipal**. **No regional-tier offices in this package.** | Same as Albania (`coverage_complete: false`, `pending_adapter`). | Exact late-2027 polling day uncollected; no parish vote estimate from national sample. |
| `data/countries/alderney` | Alderney (Europe, **territory** `GG-ALD`) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9` | 2 offices (States members, plebiscite). Expected **other** (territorial legislature). Calendar dates 2026-11-21 / 2026-12-12 are **conditional**. **No regional-tier offices in this package.** | Same pending_adapter / incomplete coverage. | Final 2026 approval text and primary numerical comparison pending. |
| `data/countries/armenia` | Armenia (Europe, sovereign) — **last among early targets** | `armenia-packed-europe/1` → `armenia.ts` | `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`; inventory `e265bc4de47deaf710b248f88c059cd19d6c203236a1a3d7a5ad9ed824ad782e` | Manifest summary: 71 office records, 33 histories, 2 calendar cohorts. Companion histories overlap the regional history index (do not add). Tier mix **only** from a future classification file, not from PR office totals or calendar strings. | `website_ingestion: pending`. Packed payload verifies by chunk SHA-256. | Upcoming community roster partly confirmed; consolidation blocks three comparable cycles; `three_entries: 0`; remaining 2027 decrees. |
| `data/countries/new-zealand` | New Zealand (Oceania) — **Phase 2 cutover-gate input, not launch vertical** | `nz-research-batch/1` → `new-zealand.ts` | SHA-256 of committed `dataset.json` `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` | 4 local by-election offices (`councillor` / `community_board_member` → council). Not a national or regional register. | `site_ingestion_status: pending_adapter`. `coverage.national_screen_complete: false`. | National screen missing; 2022 Buller mirror preliminary; STV stage reports missing; metrics withheld. Already public at `/electiondatabase`. |
| `data/research` Latin America release `latin-america-fe5e91689def` | Americas — **Phase 2 cutover-gate input**; South America is default on **today’s** observatory home only | zip adapter `scripts/import/normalize.ts` → `data/research` | Immutable zip SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` | Release manifest `validatedCounts` (recomputed from normalized records, `researchCoverageComplete: false`): 18,229 current offices, 414 historical offices, 40,509 histories, 269,740 result rows, 18,643 briefings. Those figures are **this lineage’s own validated counts**, not Atlas Europe coverage. | Current observatory production load. Evidence validator exists. Zip itself is off-git. | Research remaining work is in the completion queue / country notes. Australia and Japan still **not supplied**. |
| Synthetic fixtures | Fixtureland only | `data/normalized/synthetic-fixture-v0.ts` | n/a | Excluded from all published totals. | Tests / `OBSERVATORY_FIXTURES=1` non-production only. | Must never be imported into the Atlas master as research. |
| Europe-bound uploads in `data/incoming/` | none on disk at this revision | — | — | — | Absent | **New** packages after cutover-gate inputs are Phase 3 ingest once present and checksummed. |

Package-register office totals above (122 / 7 / 2 / 71 / 4) are **file inventory**, not a claim that Atlas regional coverage equals 202 European offices or that municipal registers are launch-complete.
