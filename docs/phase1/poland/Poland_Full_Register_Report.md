# Poland full-register handoff — Prompt AC

**Draft for Justin; no production approval.** Pinned `FTFNAnalytics/digitaldemocracy` main: `785bae49b4b3ac6bc2ef105f33cc826caa948caf` (Norway Prompt AA merge). Research checked 2026-09-20. New sourced research; no frozen Europe bytes or repository files changed.

The requested current body universe reconciles exactly to official GUS2026 validity metadata and PKW elected-body returns: **5,310 current offices** plus **2 sourced historical offices**. There are **16,767 events**, **641,493 candidate/territorial result records**, and **9,773 ballot proceedings**. This is not a claim of complete electoral research or all historical institutions. Original sources and source-row locators are retained.

| Current elected body | Offices |
|---|---:|
| municipal_council | 2,479 |
| direct_municipal_executive | 2,479 |
| county_council | 314 |
| voivodeship_sejmik | 16 |
| warsaw_district_council | 18 |
| national_lower_chamber | 1 |
| national_upper_chamber | 1 |
| direct_national_executive | 1 |
| european_parliament_delegation | 1 |

Municipal councils and popular wójts/burmistrzowie/prezydenci are separate: **2,479 + 2,479**. The national President adds one direct executive: **2,480 current direct executives**, plus one historical Ostrowice executive. Current council/assembly bodies comprise 2,479 gmina councils, 314 powiat councils, 16 sejmiks, 18 Warsaw district councils and two national chambers (**2,829**); the EP delegation is separately counted. Historic Ostrowice adds one council. The 66 city-counties have one city council each, with no extra powiat council.

| Draft tier, current + historic | Offices |
|---|---:|
| municipal | 4,960 |
| regional | 330 |
| national | 3 |
| other | 19 |

The **330 proposed regional** rows are **16 sejmiks + 314 powiat councils**. Powiat category acceptance is a focused gate, not a claim that Poland has 330 voivodeships. There are 333 focused tier-review rows (powiat, Warsaw district and EP categories); every pack row still awaits Justin’s draft-tier acceptance. Tier JSON SHA-256: `bd11a49634b12aa699e0ead91aff64a68e257efe6fc3fc542c44818a2167f2cd`.

**Historic depth.** Nationwide PKW local candidate returns cover 2014, 2018 and 2024, including separate executive first-round/runoff proceedings. Sejm/Senat cover 2019/2023; President 2020/2025; EP 2019/2024. The 2020 presidential rows are 16 territorial candidate vectors, not an invented national aggregate. The index contributes **853** named special/repeated calls; their detailed returns remain unprojected. Ordinary histories, precinct aggregates, candidate files and runoff tables are never added as duplicate cycles. Ostrowice’s council and executive remain as historical offices; GUS explicitly records abolition on 2019-01-01. No successor is guessed.

**Out-of-window offices stay.** Official 2024–2029 local term labels support expected **2029** metadata only. No polling day or ordinary future event is invented. Other next dates remain unknown unless explicitly supplied by PKW’s special-call index. The 2026-09-08–2028-03-08 alert window filters alerts, never the office/history universe.

**Open gates.** GUS retains 55 additional older territorial codes without a projected elected-office identity in these acquired PKW cycles; their exact names, years and original files form `historic-territory-research-queue.json`. Earlier body registers and the 1990/1998/1999 reforms remain research work. Other holds: special-call detail (including Szczawa/Grabówka), legal certification/repeat chronology, post-election title/boundary changes, 2019 parliamentary fraction-labelled percentages, EP seat/replacement detail and earlier national cycles. Appointed voivodes, PM/cabinet and unsourced auxiliary institutions are excluded. No numeric alternate, global party mapping, margin or tightness is invented.

Artifact validation is reported in `validation.json`; importer/SQLite/VPS/UI/publication execution is **Not run**. `applied_changes=0` for all repository and production systems. Complete mapping is not complete research.

- [ ] Justin accepts the sourced register, with named research holds.
- [ ] Justin accepts/amends the powiat, Warsaw district and EP tier categories.
- [ ] Justin approves the tier file in a later explicit decision.
- [ ] Justin accepts the identity/null/date contracts for future implementation.

Primary acquisition points: [PKW2024 local returns](https://samorzad2024.pkw.gov.pl/samorzad2024/pl/dane_w_arkuszach), [PKW2018 local archive](https://wybory2018.pkw.gov.pl/pl/dane-w-arkuszach), [PKW2014 council returns](https://pkw.gov.pl/uploaded_files/1486393038_kandydaci_do_rad_2014xlsx.xlsx), and [GUS BDL unit register](https://bdl.stat.gov.pl/api/v1/units?format=json&level=6&page-size=100&page=0). The inventory retains the exact source URLs, hashes and all unit-level validity records used for the current/historical reconciliation.
