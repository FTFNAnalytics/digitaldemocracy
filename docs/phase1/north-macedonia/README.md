# North Macedonia full register — Prompt AZ / ACCEPTED WITH HOLDS

The scoped importer is `ATLAS_IMPORT_SCOPE=north_macedonia` — see [North_Macedonia_Import.md](North_Macedonia_Import.md). `all` does not import this lineage. It publishes **164 current + 8 historical** offices, **0 events**, **0 result rows**, and **0 sources**. Holds MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09 through MK-AZ-G12, MK-AZ-G14 through MK-AZ-G17, and MK-AZ-G19 through MK-AZ-G23 stay open. No VPS deploy.

**164 current + 8 historical-only offices (172 total); 813 events; 1700 result records in the full pack.** Draft tiers: 170 municipal / 2 national (172 rows, 1:1). Justin accepted 2026-09-25 (America/Edmonton) with the open and partly resolved pack gaps left open.

Start: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md) and [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Tiers: `schemas/atlas/tiers/north-macedonia.json` (included as supplied). There is no `data/research/north-macedonia/` tree. `sources/`, `data/events.jsonl`, and `data/results.jsonl` stay omitted.

`research_coverage_complete` stays false. Current offices are Parliament, the popularly elected President, 81 councils, and 81 popularly elected mayors (80 municipalities plus the City of Skopje). Historical-only offices are four councils and four mayors for Drugovo, Vraneshtica, Zajas, and Oslomej. Current direct executives are 82. European Parliament offices are 0. Regional offices are 0. `office_successor_edges` stays empty. The 2013 Kichevo territorial claim is not an office identity. The 2019 country rename does not create a new office.

Named holds stay open:

- MK-AZ-G01 — presidential runoff (`open`). Do not back-apply the current registered-voter threshold to 1994, 1999, or 2004.
- MK-AZ-G04 — 2004 municipal reforms (`open`). No guessed pre-2004 offices or merger edges.
- MK-AZ-G05 — 2013 municipal reforms (`partly_resolved`). Eight historical-only offices only. No successor edge.
- MK-AZ-G09 — local council history (`open`). Older council list vectors stay untranscribed.
- MK-AZ-G10 — local mayor history (`open`). 2017 and 2021 returns stay party/cohort aggregates.
- MK-AZ-G11 — January 2026 repeated mayors (`open`). Four events stay without numeric results.
- MK-AZ-G12 — current-law original (`open`). Gazette 116/2025 was not transcribed.
- MK-AZ-G14 — 2025 certification (`open`). Processing completion is not legal finality.
- MK-AZ-G15 — 2014 presidential runoff conflict (`open`). Pendarovski numeric fields stay null.
- MK-AZ-G16 — national arithmetic (`open`). Diagnostics stay retained. Totals are not reconstructed.
- MK-AZ-G17 — portal reconstruction conflict (`open`). Final-decision series only.
- MK-AZ-G19 — blank, dash, and seats (`open`). Blank and `--` stay null. Explicit source 0 stays 0.
- MK-AZ-G20 — older national history (`open`). 1994 seats stay supplemental, not a single round.
- MK-AZ-G21 — 2013 runoffs (`open`). Unidentified municipal runoff participants stay unguessed.
- MK-AZ-G22 — future cycles (`open`). Only Brvenica 18 October 2026 is an upcoming alert.
- MK-AZ-G23 — 2017 anomalous share tokens (`open`). Shares outside 0–100 stay withheld.

MK-AZ-G02, MK-AZ-G03, MK-AZ-G06, MK-AZ-G07, MK-AZ-G08, MK-AZ-G13, and MK-AZ-G18 were already resolved in the pack. This land does not reopen them and does not close the open holds.

`applied_changes=0`. No importer, SQLite, VPS, or UI. Execution CI **Not run**. Slim land omits `sources/`, `data/events.jsonl`, and `data/results.jsonl` (see [SLIM_LAND_NOTE.md](SLIM_LAND_NOTE.md) and [SHA256SUMS](SHA256SUMS)). `metadata.json` and `JUSTIN_REPORT.md` stay the pre-acceptance receipt: approvals unchecked. Per-office `justin_approved` stays false, `review_status` stays `draft_for_human_review`, and `classification_kind` stays `research_draft`.

Checked-in tier bytes: `3910a381b31456f4a46e52c39825012cb3b1f92c1e4c18ab501a9a713991572d`. Pack `data/draft-tiers.jsonl`: `61335b650f482f461b8545785f24dd8d404087efeca34c9d6dd681c8f4033dea`. Full review ZIP SHA-256 `0ecd5c5254246cbfd00981c03ff642c6136736c6d45b1a61d563223ef0370a4d`.

`SHA256SUMS` is the full-pack manifest, including omitted `sources/`, `data/events.jsonl`, and `data/results.jsonl`. Its `README.md` line is the pre-land pack README (`b39a3da55fa252070f73a6cc2133c2e652a89beac48b2f9402473841459f5046`). `validate.py` expects that full pack root. It is not an npm script and was not re-run on this slim tree. `validation-report.json` is the full-pack PASS receipt (39/39, `applied_changes=0`).

- [x] Justin accepts the register with the open and partly resolved MK-AZ holds left open (2026-09-25).
- [x] Justin accepts the supplied draft tiers (170 municipal / 2 national; every `justin_approved` stays false).
- [ ] Justin separately authorizes implementation.

## Pack README (pre-acceptance research text)

Research snapshot: **24 September 2026**. **applied_changes=0**. Every Justin approval remains unchecked. This pack contains research files and an offline validator; it makes no importer, SQLite, VPS, UI or repository changes.

The **current office register is complete for the requested elected-body scope**. Historical numeric coverage is **partial**, and `research_coverage_complete=false`. This is not a certified-results database or an implementation approval.

| Measure | National | Local | Total |
|---|---:|---:|---:|
| Current offices | 2 | 162 | 164 |
| Historical-only offices | 0 | 8 | 8 |
| Events | 27 | 786 | 813 |
| Result records | 86 | 1614 | 1700 |
| Draft tiers | 2 national | 170 municipal | 172 |

Current offices consist of one national legislature, one directly elected President, 81 councils and 81 directly elected mayors. Current direct executives: **82**. Historical-only offices: four councils and four mayors. **European Parliament offices: 0; regional elected offices: 0.**

There are 812 past events and 1 upcoming event. Result records contain 1699 numeric rows and 1 row with unresolved votes; 449 events have some result records. Supplemental 1994 cycle seats are excluded from the main result count.

### Pack contents

- `data/office-register.jsonl`: 172 draft identities, current/historical status, selection mode, geography and sources.
- `data/draft-tiers.jsonl`: exactly one unapproved tier per office.
- `data/events.jsonl` and `data/results.jsonl`: source-qualified events and results; distinct presidential rounds, municipal runoffs and repeat voting. Omitted from this slim land.
- `data/elected-rosters-2025.json`: displayed elected names supporting derived council seat counts.
- `contracts/columns.json`, `contracts/column-map.json` and `North_Macedonia_Field_Map.md`: all inherited 20 tables / 223 columns, each mapped exactly once for documentation only.
- Identity, research-gap, acceptance, register and source-inventory documents; `JUSTIN_REPORT.md`.
- `sources/normalized/`: omitted from this slim land. Original reports are not redistributed.
- `SHA256SUMS`, `validate.py`, `validation-report.json`: integrity and structural checks. The validator was run on the full pack, not on this slim tree.

### Coverage and limits

| Period / scope | Included | Remaining limit |
|---|---|---|
| Current office register | All 80 municipalities and separate City of Skopje; council and popular mayor for each; Parliament and President | Statutory original-file consolidation still desirable; Ministry directory omission documented |
| 2025 local first round | All 81 council list vote vectors and all 81 mayor candidate vote vectors | Dashboard certification not established by processing completion |
| 2025 council seats | Elected-name rosters for all 81 councils; counts by displayed ballot-list position | Derived roster counts; no zero assigned merely because a list is absent from roster |
| 2025 mayor runoffs | All 33 candidate vote vectors | Signed finality decisions not attached |
| Shuto Orizari 2025 council | 19 October vector plus 2 November cumulative vector and elected roster | Do not add both vectors together |
| January 2026 repeated mayor elections | Four office-specific dated events | SEC portal verification page prevented numeric capture |
| 2017 and 2021 mayors | All 81 first-round offices per cycle; 35 and 45 runoff rows respectively | Reported party/cohort aggregates, not all individual candidate identities; two 2021 first rounds invalid and without numeric vectors |
| 2013, 2017, 2021 councils | All 81 office events per cycle; numeric 2013 City of Skopje vector | Other older council list-level vectors not transcribed |
| 2013 mayor history | First-round events; Skopje runoff; four expressly named 21 April repeats | Other municipal runoff identities not reconstructed |
| Historic former municipalities | Eight office rows for Drugovo, Vraneshtica, Zajas and Oslomej; 2009 first-round election records | Source-joined existence evidence; local numeric results not transcribed |
| National history | Dated independent-republic events from 1994; numeric 2009/2014/2019/2024 presidential and 2014/2016/2020/2024 parliamentary returns | Older numeric vectors and repeat proceedings incomplete; source conflicts retained |

### Rules that matter

The approximately 18-month window filters upcoming alerts only. All current offices and sourced past history remain in scope. Only Brvenica's explicitly scheduled **18 October 2026** mayor election is emitted as an upcoming event; exact ordinary-cycle dates are not extrapolated.

Missing, untranscribed, ambiguous and unmapped values remain `null` with status. Explicit source zero is retained. A dash is not zero. Party/cohort mayor aggregates are labelled `party_group_aggregate`; they are not invented candidates. Vote shares retain their source basis. A dashboard's processing percentage is never a candidate share or a certification decision.

Presidential first rounds and runoffs have separate event IDs. In 2024, the first-round winning threshold was more than half of **all registered voters**; runoff validity required at least 40% turnout. These rules are not blindly projected onto older legal regimes.

Run `python3 validate.py` from the full pack root (events, results, and sources included). This slim land does not contain those files.
