# Justin acceptance — North Macedonia Prompt AZ

Accepted 2026-09-25 (America/Edmonton) with pack research holds left open. Stable ids below follow `data/research-gaps.json` key order. Open and `partly_resolved` gaps stay open. Pack-resolved statuses stay as recorded; this land does not reopen them and does not close an open hold.

Counts: 164 current / 8 historical-only offices (172 rows); 81 current councils + 81 popular mayors + Parliament + popular President. Current direct executives: 82 (81 local + President). Historical-only: 4 councils + 4 mayors (Drugovo, Vraneshtica, Zajas, Oslomej). Full pack 813 events / 1700 results (812 past, 1 upcoming; 1699 numeric rows and 1 unresolved-vote row). Those `data/events.jsonl` and `data/results.jsonl` bytes, and the entire `sources/` tree, are omitted from this slim land and are not reconstructed. Draft tiers: 2 national + 170 municipal (172 rows 1:1). European Parliament offices: 0. Regional offices: 0. `office_successor_edges` stays empty. `research_coverage_complete` stays false. Every draft tier row `justin_approved` stays false. No importer, VPS, or `ATLAS_IMPORT_SCOPE` change in this land.

Attached ZIP SHA-256 `0ecd5c5254246cbfd00981c03ff642c6136736c6d45b1a61d563223ef0370a4d` (matches the brief). `data/draft-tiers.jsonl` SHA-256 `61335b650f482f461b8545785f24dd8d404087efeca34c9d6dd681c8f4033dea`. Checked-in `schemas/atlas/tiers/north-macedonia.json` SHA-256 `3910a381b31456f4a46e52c39825012cb3b1f92c1e4c18ab501a9a713991572d` (pretty JSON of the same 172 rows; field values unchanged).

Do not invent offices, votes, successor edges, a popular 1991 presidential contest, council-elected mayor offices, a European Parliament office, or a zero for a blank, dash, or untranscribed cell. The 2013 Kichevo territorial claim stays `documented_territorial_reorganization_not_office_identity`. The 2019 country rename does not create a new office.

## Holds left open

- `MK-AZ-G01 — presidential-runoff` (`open`). Current first-round threshold is a majority of all registered voters; runoff requires the legal turnout threshold, currently 40%. Separate source events stay retained. Do not back-apply the current threshold to 1994, 1999, or 2004. Older statutory editions and full numeric vectors remain untranscribed.
- `MK-AZ-G04 — municipal-reforms-2004` (`open`). The 2004 change from 123 to 84 municipalities is a named gate. Abolished or altered pre-2004 units and exact legal commencement provisions are not inventoried. No guessed offices, dates, or merger edges.
- `MK-AZ-G05 — municipal-reforms-2013` (`partly_resolved`). ODIHR 2013 names Kichevo, Zajas, Oslomej, Vraneshtica, and Drugovo, effective from the 2013 local elections. Four former units produce eight historical-only offices. No successor-office relation is inferred. Historical numeric local results remain incomplete.
- `MK-AZ-G09 — local-council-history` (`open`). 2025 list-level votes cover all 81 councils, plus the Shuto Orizari cumulative re-vote. 2013 City of Skopje has a numeric list/seat vector. Other 2013, 2017, and 2021 council events have no per-office numeric vectors here. Countrywide aggregates are not allocated to municipalities.
- `MK-AZ-G10 — local-mayor-history` (`open`). 2017 and 2021 mayor returns are party/cohort aggregates, including Independent and Other groups. They do not establish individual candidate identities. Historic local history before 2013 is limited to source-identified former units. Municipal runoffs and by-elections are not exhaustive.
- `MK-AZ-G11 — 2026-repeated-mayors` (`open`). 11 January 2026 repeat events stay for Centar Zhupa, Gostivar, Mavrovo i Rostushe, and Vrapchishte. Numeric results and certification instruments were not obtained.
- `MK-AZ-G12 — current-law-original` (`open`). The direct statutory PDF for Gazette 116/2025 was not transcribed. Selection rules are corroborated in primary ODIHR reports. Older legal rules and an original dated territorial-law consolidation still need review.
- `MK-AZ-G14 — certification-2025` (`open`). A displayed 100% is processed precinct coverage, not a candidate vote share and not proof of legal finality. Signed municipal/SEC finality decisions remain unattached.
- `MK-AZ-G15 — national-2014-runoff-conflict` (`open`). The ODIHR 2014 annex assigns 398077/41.14 to Halimi even though the runoff was Ivanov–Pendarovski. Pendarovski numeric fields stay null, with competing tokens preserved.
- `MK-AZ-G16 — national-arithmetic` (`open`). 2009, 2014, 2016, 2019, and 2024 source tables contain differences between turnout, valid+invalid, or candidate sums. Arithmetic diagnostics stay retained. Missing valid-ballot totals are not reconstructed.
- `MK-AZ-G17 — portal-reconstruction-conflict` (`open`). Reconstructed ep.sec.mk 2024 parliamentary totals differ from SEC final totals reproduced in ODIHR 2024. Use the final-decision series. No numeric vectors from the reconstructed 2021 council portal are adopted.
- `MK-AZ-G19 — blank-dash-and-seats` (`open`). Blank cells, untranscribed data, and `--` stay null with status. Explicit source 0 is retained. Unlisted parties retain null seats, not inferred 0. A roster count does not certify the election.
- `MK-AZ-G20 — older-national-history` (`open`). Dated independent-republic national events from 1994 are included. Complete older constituency/list/candidate vectors, repeat-voting proceedings, and era-specific rules are not fully transcribed. 1994 final seats stay supplemental cycle data, not assigned to a single round.
- `MK-AZ-G21 — 2013-runoffs` (`open`). First-round offices are covered. Only the City of Skopje runoff and four explicitly named 21 April repeats are included. Unidentified municipal runoff participants are not guessed.
- `MK-AZ-G22 — future-cycles` (`open`). Only the dated Brvenica 18 October 2026 early mayor event is an upcoming alert. Exact next ordinary election dates are not extrapolated from terms.
- `MK-AZ-G23 — 2017-anomalous-share-tokens` (`open`). Three ODIHR 2017 first-round mayor table tokens parse outside 0–100 (Makedonski Brod SDSM 4917.00, Struga VMRO 1352.00, Zhelino Other 354). Numeric shares stay withheld. Original tokens stay retained. No decimal point is guessed.

## Pack-resolved (not reopened)

- `MK-AZ-G02 — mayor-selection-mode` (`resolved`). All 80 municipal mayors and the City of Skopje mayor are popularly elected. No council-elected mayor offices.
- `MK-AZ-G03 — skopje-nesting` (`resolved`). Ten component municipalities each have a council and mayor. The City of Skopje separately has a council and mayor. Geography nesting is not office succession.
- `MK-AZ-G06 — name-change-2019` (`resolved`). 12 February 2019 Prespa entry into force. Same independent-republic office identities. No duplicate offices and no invented election.
- `MK-AZ-G07 — no-ep` (`resolved`). EU candidate, not a Member State: zero European Parliament offices, events, and results.
- `MK-AZ-G08 — independence-and-1991-president` (`resolved`). The 1990 Yugoslav constituent-republic election is excluded. The 1991 president was elected by the Assembly. The first direct presidential election is 1994.
- `MK-AZ-G13 — ministry-directory-omission` (`resolved_by_crosscheck`). The Ministry English directory lists Skopje but omits Centar. Omission is not abolition.
- `MK-AZ-G18 — debar-2021-date` (`resolved_with_source_conflict_retained`). The Debar runoff event uses 14 November 2021. Both the body statement and the annex's 14 October footnote stay recorded.
