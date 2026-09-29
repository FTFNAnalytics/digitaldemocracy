# Bulgaria → Atlas master field map

**Prompt P: documentation and accepted-with-hold tiers.** Main contracts `00c2ea7458ad7705aad487c4a7665d9d343b5554`; frozen PR #16 `de3541276cd37ca749b740c229cee67475f0d317` (`codex/europe-bulgaria`). Justin accepted 530 municipality-wide rows on 2026-09-19 and held 3,067 district/village rows. No importer, SQLite, VPS, UI, redirects or Mexico/continuity edits. Governing plan/DDL/identity files and prior Europe field maps were read from pinned main; locked decisions remain unchanged.

T=`schemas/atlas/tiers/bulgaria.json`, pack status **approved** with hold, SHA `9a6718fe301f440511cc9e9f9b4139b3a1e0332ef2e3e6c9b3063f67f04652ab` (predecessor draft `cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0`). Register SHA `00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559` (1309333 bytes). Exact 3597 offices:265 Mayor, 265 Municipal council, 35 District mayor, 3032 Village mayor. **Proposed municipal 3597 / regional 0**. **Production-approved 530** (Mayor + Municipal council). **Held 3067** district/village (`human_review_required: true`, `review_category: submunicipal_scope`). Future importer loads only the 530 accepted rows unless policy changes. No geographic tier from calendar labels.

The map covers all 223 destination columns across 20 research/ledger tables and every column of 15 payload tables. schema_migration.version/description are migration-owned constants, not country mappings; migrations are not run. [Identity Rules](Bulgaria_Identity_Rules.md), [Acceptance Examples](Bulgaria_Acceptance_Examples.md), [Input Inventory](Bulgaria_Input_Inventory.json), [complete Vectors](Bulgaria_Identity_Vectors.json), [CI checklist](Prompt_P_Tiers_Field_Map_and_CI.md).

## Verified baseline and reconciliation

| Measure | Count / rule |
| --- | --- |
| Register / companion register | 3597 each; every field and row equal |
| Master history table | Absent; do not invent one |
| Companion H / standalone IX | 8661 each; exact key and normalized-field equality; one event set |
| Detailed returns D | 25817; every row binds H by full source HK |
| First-round rows F | 7746; retained input only, no additional typed results or completed events |
| Unresolved rows X | 2591; retained input only, 559 office/date/phase groups |
| Prospective events / regional offices proposed | 0 / 0 |
| Sources | 3971 catalogue IDs +2 inline-only URLs=3973 |
| Input descriptors | 54 outer +3617 members +T=3672 |

A selected source history can carry an incomplete-certificate caveat. Selection is not certification. No F/X event, proceeding, result or date row is minted by this minimum adapter. This is a deliberate documented projection boundary, not loss of those datasets: every byte, row, phase, value and source is retained and every row has a Vectors binding entry. Future stage projection requires a separate accepted identity contract; do not turn 7746 candidates into7746 cycles.

7740 F rows share a unique (Office ID,Year) with H; these are **candidate context links only**, not proof that year alone uniquely establishes election stage. Six F rows at /rows/1665…1670 for BG-SLV11-b88d0d4475-V (Градец2015) have no selected H. X contains the corresponding two unresolved qualification-change runoff rows. Both datasets stay outside completed histories. X shares no Office ID+ballot-year group with selected H baseline. Do not force a nearest-date match, invent an HK or use unresolved rows as missing third histories.

All 3597 next-date cells and both Cal date cells are NULL. Expected autumn 2027 narrative stays raw; no next event/date. All 8661 historical ballot cells are actual ISO days; certainty remains unknown. 587 D rows across 221 H events have shares but no vote counts. D has 26 zero votes, 28 zero shares, 14247 zero seats; preserve missing versus zero and printed rounding without recalculation. Original current-control count 0 is an inventory count, not zero control/risk. No poll/control collection supplied.

## Source notation and exact retention

P=`data/countries/bulgaria/`; V=P+unpacked/ is a virtual member path, not a committed directory. JSON pointers are zero-based RFC6901; sheet/source_rows are original spreadsheet locators. Every file/member SHA and length is in Inventory. Reconstruct the 48 XZ chunks in manifest order; verify chunk hashes/lengths and concat hash, decompress, reject links/duplicate/absolute/traversal/unlisted tar members, verify inventory.json then all 3616 other members. The frozen extractor reproduced exact pinned chunk bytes from the original Europe archive; no frozen bytes were changed.

| Alias | Path |
| --- | --- |
| M / Cov | P+manifest.json / coverage.json |
| O / J | V+tables/master/office-register.json / V+tables/companion/office-register.json |
| H / IX | V+tables/companion/history-index.json / V+history-index.json |
| D | V+tables/companion/detailed-returns.json |
| F / X | V+tables/companion/first-round-returns.json / V+tables/companion/unresolved-history.json |
| S=SM/SC | V+tables/master/sources.json / V+tables/companion/sources.json |
| Cal / Nts | V+tables/master/election-calendar.json / V+tables/master/country-notes.json |
| BF | V+Office_Briefings/Offices/<exact office_id>.html; country HTML also retained |
| T | schemas/atlas/tiers/bulgaria.json |

Canonical raw envelope: {origin:locator,row:original row/object,columns:original columns or null,values:original array or null,supplemental:related raw values/locators}. Locator contains input_path, sha256, json_pointer, sheet, source_row, column, html_anchor_index with explicit nulls when absent. Store JSON values unaltered; hash original bytes, not raw reserialization. Keep all unknown keys and original strings, including combined party/coalition labels. HTML/scripts/formulas are inert artifact bytes; never execute. Shared workbook originals remain in checksummed archive, not supplied as payload workbooks. Recovery locators must name immutable commit/member/content hash, not a scratch path.

## Geographic identity exception

Name+office-type bridge geography formula yields 3239 unique keys for 3597 offices:272 ambiguous groups cover 630 office rows (358 collisions beyond first members). Example: two Абланица village mayors BG-BLG52-fc5837f6a1-V and BG-PAZ08-fc5837f6a1-V. Use **G=key("geo",[CID,exact office_id])** for all Bulgaria rows, preserving supplied jurisdiction/type as labels. This avoids merging distinct places and uses no invented political office. No parent inferred from province-like prefixes. Legacy name/type key is retained in Vectors; alias it only when its office target is unique. Ambiguous legacy key must not redirect to any arbitrary office/geography. No Bulgaria public geography IDs were established by this handoff.

## Source-column coverage

Every entire table, including sheet/columns/source_rows/rows and unknown keys, is retained. The following table adds typed projection/disposition for every source column. i is exact zero-based row index; original sheet row=source_rows[i].

| Source table | Column | Locator | Projection / retention |
| --- | --- | --- | --- |
| V+tables/companion/detailed-returns.json | Office ID | /rows/i/0; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Country | /rows/i/1; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Jurisdiction | /rows/i/2; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Year | /rows/i/3; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Ballot date if recorded | /rows/i/4; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Electoral unit | /rows/i/5; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Candidate or list | /rows/i/6; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Party or proposer | /rows/i/7; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Votes or marks | /rows/i/8; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Share on stated basis | /rows/i/9; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Seats | /rows/i/10; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Result coverage | /rows/i/11; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Vote basis | /rows/i/12; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/detailed-returns.json | Source URL | /rows/i/13; Detailed returns, source_rows[i] | D result_row and exact H binding; full row raw |
| V+tables/companion/first-round-returns.json | Office ID | /rows/i/0; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Country | /rows/i/1; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Jurisdiction | /rows/i/2; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Year | /rows/i/3; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Candidate or list | /rows/i/4; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Party | /rows/i/5; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Votes | /rows/i/6; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Share on source basis | /rows/i/7; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Coverage | /rows/i/8; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/first-round-returns.json | Source URL | /rows/i/9; First round returns, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/history-index.json | Office ID | /rows/i/0; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Country | /rows/i/1; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Jurisdiction | /rows/i/2; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Ballot date if recorded | /rows/i/3; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Year | /rows/i/4; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Leading candidate or party | /rows/i/5; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Leader share | /rows/i/6; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Runner-up candidate or party | /rows/i/7; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Runner-up share | /rows/i/8; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Vote basis | /rows/i/9; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Coverage | /rows/i/10; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Comparability status | /rows/i/11; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/history-index.json | Source URL | /rows/i/12; History index, source_rows[i] | H primary event/date; all coverage/comparability preserved; no summary-to-result duplication |
| V+tables/companion/office-register.json | Office ID | /rows/i/0; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Country | /rows/i/1; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Jurisdiction | /rows/i/2; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Office | /rows/i/3; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Next polling date | /rows/i/4; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | History entries | /rows/i/5; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Latest eligible gap pp | /rows/i/6; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Middle gap pp | /rows/i/7; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Oldest gap pp | /rows/i/8; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Weighted gap pp | /rows/i/9; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Competition score | /rows/i/10; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Historical competition screen | /rows/i/11; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Pedersen interval 1 pp | /rows/i/12; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Pedersen interval 2 pp | /rows/i/13; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Mean Pedersen pp | /rows/i/14; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Margin dispersion pp | /rows/i/15; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Volatility interpretation | /rows/i/16; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Polling and government watch | /rows/i/17; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Historical coverage | /rows/i/18; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Detailed workbook | /rows/i/19; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/office-register.json | Calendar evidence | /rows/i/20; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/companion/parameters.json | Assumption | /rows/i/0; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/companion/parameters.json | Value | /rows/i/1; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/companion/parameters.json | Definition | /rows/i/2; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/companion/read-me.json | Topic | /rows/i/0; Read me, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/companion/read-me.json | Use and interpretation | /rows/i/1; Read me, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/companion/sources.json | Source ID | /rows/i/0; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/companion/sources.json | Title | /rows/i/1; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/companion/sources.json | Source URL | /rows/i/2; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/companion/sources.json | Evidence grade | /rows/i/3; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/companion/sources.json | Accessed | /rows/i/4; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/companion/unresolved-history.json | Office ID | /rows/i/0; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Jurisdiction | /rows/i/1; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Ballot date | /rows/i/2; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Phase | /rows/i/3; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Candidate | /rows/i/4; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Party | /rows/i/5; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Votes | /rows/i/6; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Share | /rows/i/7; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Missing evidence | /rows/i/8; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Vote basis | /rows/i/9; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/companion/unresolved-history.json | Source URL | /rows/i/10; Unresolved history, source_rows[i] | retained input only; per-row origin/source/context binding in Vectors; no selected event/result/proceeding |
| V+tables/master/country-coverage.json | Country or territory | /rows/i/0; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Office records | /rows/i/1; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Historical entries | /rows/i/2; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Three entries | /rows/i/3; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Competition scores | /rows/i/4; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Grouped volatility scores | /rows/i/5; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Sourced current control | /rows/i/6; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-coverage.json | Calendar cohorts | /rows/i/7; Country coverage, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-notes.json | Country or territory | /rows/i/0; Country notes, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-notes.json | Scope and remaining gaps | /rows/i/1; Country notes, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-notes.json | Election calendar | /rows/i/2; Country notes, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-notes.json | Detailed workbook | /rows/i/3; Country notes, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/country-notes.json | Screen evidence | /rows/i/4; Country notes, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/election-calendar.json | Cohort ID | /rows/i/0; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Country | /rows/i/1; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Election cohort | /rows/i/2; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Tier | /rows/i/3; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | First or scheduled date | /rows/i/4; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | End or runoff date | /rows/i/5; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Date status | /rows/i/6; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Historical cycles | /rows/i/7; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Coverage and timing | /rows/i/8; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Prior-call units if known | /rows/i/9; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/election-calendar.json | Source URL | /rows/i/10; Election calendar, source_rows[i] | retained calendar context only; no next event or tier from text |
| V+tables/master/office-register.json | Office ID | /rows/i/0; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Country | /rows/i/1; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Jurisdiction | /rows/i/2; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Office | /rows/i/3; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Next polling date | /rows/i/4; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | History entries | /rows/i/5; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Latest eligible gap pp | /rows/i/6; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Middle gap pp | /rows/i/7; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Oldest gap pp | /rows/i/8; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Weighted gap pp | /rows/i/9; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Competition score | /rows/i/10; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Historical competition screen | /rows/i/11; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Pedersen interval 1 pp | /rows/i/12; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Pedersen interval 2 pp | /rows/i/13; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Mean Pedersen pp | /rows/i/14; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Margin dispersion pp | /rows/i/15; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Volatility interpretation | /rows/i/16; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Polling and government watch | /rows/i/17; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Historical coverage | /rows/i/18; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Detailed workbook | /rows/i/19; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/office-register.json | Calendar evidence | /rows/i/20; Office register, source_rows[i] | O primary office/geography; J exact reconciliation only; all score/coverage fields retained raw |
| V+tables/master/parameters.json | Assumption | /rows/i/0; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/parameters.json | Value | /rows/i/1; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/parameters.json | Definition | /rows/i/2; Parameters, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/read-me.json | Topic | /rows/i/0; Read me, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/read-me.json | Use and interpretation | /rows/i/1; Read me, source_rows[i] | retained_input.payload_json and owning raw envelope; no inferred metric/event |
| V+tables/master/sources.json | Source ID | /rows/i/0; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/master/sources.json | Title | /rows/i/1; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/master/sources.json | Source URL | /rows/i/2; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/master/sources.json | Evidence grade | /rows/i/3; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |
| V+tables/master/sources.json | Accessed | /rows/i/4; Sources, source_rows[i] | source catalogue with equal-ID dedup and both origins; exact metadata/URL |

Parameters/Read me are methodological context; regional aggregate totals cannot create Bulgarian rows. Cov string counts stay strings in raw and are parsed only for count checks. Full source fields remain available even where the typed projection is intentionally absent.

## dataset_lineage

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + proposed country-package identity | Fixed `country-package-bulgaria`; never a per-run ID. | L; PK | One Bulgaria source-dataset lineage; no existing Bulgaria public release claimed. |
| provenance_kind | M + inventory/README package contract | country_package; frozen XZ-packed extract at PR #16. Manifest has no schema_version field. | L | Reject fixture/unknown provenance; verify packed payload before reading rows. |
| description | M.country | `Bulgaria frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | 54 outer files +3617 payload members +T +applicable overrides +versions | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-bulgaria-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_snapshot | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Copy 2026-09-11; do not substitute M.packaged or attempt timestamp. |
| upstream_release_id | No supplied public release alias | NULL; L is reserved lineage identity, not an invented already-public release alias. | R | Archive provenance remains raw; candidate R is separate. |
| validated_counts_json | Recomputed O/J/H/IX/D/F/X/SM/SC/Cal | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | 3597 offices; 8661 selected events; 25817 typed result rows; 7746 F and 2591 X retained separately; 3973 canonical sources. |
| research_coverage_complete | coverage.status/remaining and Nts. Scope and remaining gaps | 0, from explicit remaining coverage gaps; M has no coverage_complete boolean. | R | No invented coverage_complete source property; coverage remains partial. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve M.website_ingestion=pending and original coverage gaps; documentation is not live publication status. |

## retained_input

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | 54 outer +3617 unpacked members +draft T | P paths for outer files; V= P+unpacked/ followed by exact tar member path for members; T unchanged logical path. Inherited paths per Identity Rules. | (L,R,input_path) | 3672 distinct candidate inputs. Draft approval gate blocks publication. |
| input_kind | Path class | T=tier_classification; HTML/XLSX/payload chunks=artifact; other outer/member files=package; accepted future overrides=override. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | 48 ordered XZ chunks, concat payload SHA, inventory and all 3617 members hash-match. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | sha256:<sha256> immutable content store; virtual member also records payload hash, exact archive_entry and pinned outer chunks in inventory. | (L,R,input_path) | All bytes recoverable and rehashed before publication; no dependency on temporary unpack directory. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | All JSON including F/X, original score gates/coverage, parameters and caches retained losslessly. HTML scripts and formulas never execute. |

## country

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | M.country + declared package slug | Literal bulgaria. | country_id | No new country from shared Read me text. |
| country_code | extract.py CODE constant | BG; frozen extract.py CODE constant. | country_id | Do not convert province-like ID fragments into regional offices. |
| name | M.country | Copy `Bulgaria`. | country_id | Nonempty. |
| polity_kind | Country Bulgaria in M and accepted Europe plan | sovereign_country. | country_id | No new country or territorial parent from other-country regional methodology. |
| region_id | Accepted Europe package/plan | europe. | country_id | Geographic landing region, not office tier. |
| coverage_status | coverage.status/remaining + Nts. Scope and remaining gaps | partial. | country_id | Explicit remaining gaps, not a nonexistent M.coverage_complete field. |
| screening_as_of_label | No separate Bulgaria screening-as-of field | NULL; no separately supplied screening-as-of date. | country_id | NULL; M.research_snapshot belongs to dataset_release. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Preserve archived CIK gaps, original certificates, decisive outcomes, 2027 village eligibility and post-28-August replacement snapshot caveat. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | O. Country + M.country | `bulgaria`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O. Office ID plus country ID | G=key("geo",[CID,exact office_id]); country-specific disambiguated binding. | (country_id,G) | 3597 unique Gs. Legacy name/type keys have272 collision groups covering630 offices; never merge those places. |
| name | O. Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent geography supplied; NULL. No province/geometry fabrication. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row +exact Office ID/type/jurisdiction +old name/type key | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original names and legacy collision group retained. No guessed municipality/province parents or geometry. |

## office

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O. Office ID) | No release hash in namespace. |
| office_id | O. Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | Exact 3597 O IDs; O/J sets and rows equal. 265 Mayor +265 Municipal council +35 District mayor +3032 Village mayor. |
| country_id | O. Country + M.country | `bulgaria`; exact Bulgaria label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O. Office ID | G bound to exact office ID as above. | (N,office_id) | Same-country FK; two same-name villages retain separate Gs. No legacy ambiguous alias. |
| name | O. Jurisdiction + O. Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O. Office | Exact Mayor / Municipal council / District mayor / Village mayor. | (N,office_id) | Institution type stays separate from proposed geographic grouping; district/village scope explicitly reviewed. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O. Next polling date | NULL for 3597. | (N,office_id) | Cal dates also NULL; no date from expected autumn 2027 briefing prose. |
| next_date_resolution | Same date inputs | unknown for 3597. | (N,office_id) | Pending date is not an in-window confirmed event. |
| next_history_key | No explicit O next date | NULL baseline. | (N,office_id) | No prospective event created. Preserve existing future binding on incomplete refresh. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row +identical J counterpart locators +BF artifact +T review scope | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Retain all score/eligibility/coverage fields, including null/zero; no current-control inference. |

## office_tier_classification

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O. Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | municipal→municipal for 3597 draft proposals. | (N,office_id) | 0 regional/national/council/other. 3067 submunicipal assignments flagged; no calendar classifier. Legacy council metadata not emitted to DDL. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | needs_review for all 3597 because pack is draft; explicit future null-tier hold→unknown. | (N,office_id) | 3067 human_review_required/tier_uncertain=true; 530 municipality-wide rows still need pack approval. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/bulgaria.json`. | (N,office_id) | Deliverable draft only, not claimed committed or approved. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Exact T bytes | cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0 | (N,office_id) | Exact candidate retained-input hash; approval/revision changes T and fingerprint. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| date_id | H event ballot owner | date-+SHA(C([N,"event",event_id,"ballot"])). | date_id | 8661  date owners, one per selected event; no office-next date rows. |
| label | H. Ballot date if recorded | Exact supplied ISO day for 8661. | date_id | No fallbacks needed baseline. Partial-date examples are explicitly isolated future CI mutations. |
| precision | Full-string date grammar | day for 8661; source cells all full ISO dates. | date_id | Future month/year/range/unknown preserves precision; no invented day1. |
| certainty | No separate historical certainty field | unknown for 8661. | date_id | Supplied day does not establish certification or statutory certainty. |
| year | Parsed H. Ballot date if recorded | Integer 1.. 9999; NULL if unknown or range. | date_id | Actual Gregorian date validation; H. Year remains cycle identity field. |
| month | Parsed month component | 1.. 12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/start. | date_id | No cohort range inferred; Cal End or runoff date isNULL. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/end. | date_id | Endpoints must be ordered/noncyclic actual claims, not day1 padding. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H date/Year +IX counterpart with exact locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | No next date inferred from Cal expected wording or snapshot. |

## election_event

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | H. Office ID namespace | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H. Office ID | Copy exact. | (N,office_id,history_key) | Every selected event binds exact O office with full namespace. |
| history_key | H. Office ID/Year/Ballot date if recorded | office_id+"::"+decimal Year+"::"+exact ballot date. | (N,office_id,HK) | 8661 H=IX keys, no extra master history table. F/X add zero selected events. |
| event_id | Proposed deterministic bridge-compatible identity | key("event",[CID,HK]). | (N,event_id) | 8661 unique candidate IDs; namespace on all uniqueness/FKs. No claim that XZ package already has public Atlas IDs. |
| date_id | H date owner | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | 8661 real date rows; no synthesized F/X dates or prospective events. |
| date_resolution | Parsed historical or prospective date + documented conflicts | resolved for 8661 supplied day labels; certainty remains unknown. | (N,office_id,HK) | Future conflicting claims require NULL selected pointer and retained independent date claims. |
| event_kind | No structured ordinary/special/repeat field in H | unknown baseline. | (N,office_id,HK) | Raw HTML phase labels retained. Do not infer event kind solely from year or calendar URL. |
| selected_history_role | H membership or O future date | selected for 8661 H rows. | (N,office_id,HK) | First round and decisive runoff stay one source cycle; F/X are not extra selected histories. Selected does not mean certificate verified. |
| electoral_system | No dedicated historical system field | NULL; no separate explicit system field supplied. | (N,office_id,HK) | Do not infer from office name, vote basis or current council structure. |
| comparability | H. Coverage +H. Comparability status | Join exact nonempty strings with " · "; originals remain raw. | (N,office_id,HK) | 7022 Eligible vote basis; 1639 Unscored/inapplicable. No score computation. |
| ballot_basis | H. Vote basis | Votes for electoral lists, excluding none-of-the-above→list_votes; two Votes for named candidates labels→valid_votes; Official rounded candidate percentages; vote counts unavailable→unknown. | (N,office_id,HK) | 795 list_votes, 7645 valid_votes, 221 unknown events. Preserve none-of-the-above exclusion and percentage-only wording raw. |
| share_unit | H/D supplied percentage convention | percent_0_100; no rescaling. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | No explicit historical legal outcome; future as of research snapshot | unknown for all baseline selected events. | (N,office_id,HK) | Public CIK republication and archived summary do not prove original certificates verified. |
| record_state | H or supplied O next membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row +IX counterpart +F/X retained-reference pointers +BF locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Do not merge unresolved numeric claims into H. No separate event from HTML duplicate. |

## proceeding

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| office_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| history_key | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| proceeding_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| kind | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| sequence_no | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| supersedes_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| legal_outcome | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| lineage_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| release_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| raw_json | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |

## result_row

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | D. Office ID under N | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D. Office ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D. Office ID/Year/Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | 25817 D rows resolve to8661 H keys; no F/X typed result row baseline. |
| result_row_id | Proposed per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | Per-HK D encounter index; 25817 unique semantic identities; freeze physical/semantic aliases for later refresh. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D. Country +exact O. Office ID join | `bulgaria`. | (N,result_row_id) | All D rows label Bulgaria; composite FK country/N/office. |
| candidate_or_list_label | D. Candidate or list then D. Party or proposer | First exact nonempty source label,else NULL. | (N,result_row_id) | No invented labels; original spelling/case retained. |
| original_party_label | D. Party or proposer | Exact token or NULL;no family equivalence. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | D. Party or proposer,combined label/code convention | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Preserved source token,not new standardized party identity. |
| party_namespace | D. Year + country package source scope | `bulgaria/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Source election-cycle year namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D. Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 25204 positive integers; 26 recorded zero; 587 NULL. No percentage-to-count inference. |
| votes_status | D. Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D. Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0.. 100; round-trip numeric equality at binary64 precision. |
| share_status | D. Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | 25789 positive and 28 zero shares; no null shares. Two zero-share rows have missing votes; do not infer zero counts. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D. Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 11570 positive, 14247 zero, 0 null baseline. Do not infer elected/substitute flags or current control. |
| seats_status | D. Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D. Result coverage and supplied observations | recorded for 25817 source observations; limitations remain event/raw. | (N,result_row_id) | 587 result rows across 221 events are percentage-only: votes=NULL/unknown, shares retained. Recorded is not certified. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| party_namespace | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapping_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| source_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| election_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_label | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_code | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapped_group | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| uncertainty | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | S row or actual inline occurrence | `bulgaria`. | (bulgaria,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-bulgaria`. | (bulgaria,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | SM/SC. Source ID union +actual inline URLs | Catalogue `bulgaria--` + Source ID; inline-only `bulgaria--` + key("url",exact URL). | Source tuple | 2809 SM rows identical-ID subset of 3971 SC rows; 2 inline-only=3973 sources. Duplicate catalogue rows retained as two origins, one identity. |
| publisher | No dedicated publisher column; inline lacks metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S. Title | Verbatim for catalogue; NULL inline-only. | Source tuple | No publisher/title fabrication; catalogue metadata preserved without implying fresh verification. |
| url | S. Source URL or real inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | All catalogue URLs unique; preserve query/resId/langId and hash fragment exactly. |
| checked_as_of_label | SM/SC. Accessed | Exact source label;inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S. Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | Every SM/SC original row/origin or inline occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Equal duplicate catalogue IDs merged, not counted twice; conflicting future metadata fails review. |

## record_locator

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | bulgaria except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party_mapping target; result party labels remain election-scoped source context. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-bulgaria for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator) defined in Source notation; includes member archive_entry, exact source_rows[i], pointer and SHA. | record_key | Exact original input path, SHA, sheet, source_rows and pointer; HTML anchor index if applicable. No invented archive_entry field required. |

## evidence_link

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | bulgaria. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-bulgaria. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H/IX event and date; D result; O calendar_context; Cal input calendar_context; Nts country screening; F/X input stage_observation; HTML input artifact_reference. | evidence_id | Stage citations target retained input, never fabricate an event FK. Source table catalogue rows retained with original metadata. |
| date_claim_id | H/IX selected event date where claim_kind=date | Own date_id for date claim;otherwise NULL. | evidence_id | F/X date text stays retained input; no typed date claim without a real event binding. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | No ambiguous old geography alias. Legacy collision groups remain non-executable provenance in Inventory; exact office-code binding is canonical. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | preserved_package_id, proposed_bridge_compatible_id, package_source_id, exact_url_catalogue_alias, baseline_row_binding, documented_identity_correction. | Crosswalk PK | Geography disambiguation is a documented new country rule; event/result IDs preserve current bridge formulas. No claim of already-public Bulgarian IDs. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| attempt_id | Operational invocation | `attempt-` + lowercase UUIDv4; one fresh unique value per run. This is the only random identifier. | attempt_id | New on unchanged import; never public research identity. |
| lineage_id | Requested country identity | L. | attempt_id | Logical link, no cross-DB FK. |
| operator | Authenticated operator/service identity | Actual value, nonempty; not invented name. | attempt_id | Required preflight input. |
| script_version | Actual importer build identity | Actual immutable build/version; field-map contract version alone is not executing script version. | attempt_id | Record even failed input attempts; exclude from hash except semantic adapter version. |
| started_at | UTC clock at invocation | RFC3339 UTC timestamp with Z; operational only. | attempt_id | Commit started row before staging writes. |
| finished_at | UTC clock at terminal transition | NULL while started; real timestamp when terminal. | attempt_id | Never backdate research. |
| status | Publication state machine | started→succeeded after verified durable swap, or failed before publication; recover ambiguous swap first. | attempt_id | Terminal immutable; no replace/delete. |
| input_inventory_json | Preflight scan of intended inputs / versions | Canonical JSON manifest with known hashes/bytes, missing entries as null hash + error; include intended T path. Immutable after started. | attempt_id | Inventory cannot invent hash for missing T; reverify bytes after logging. |
| successful_release_id | Verified published release | NULL started/failed; R succeeded. | attempt_id | Must match master receipt and selected release logically. |
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Bulgaria. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## Evidence occurrences and exact targets

Create one record_locator per typed country/geography/office/event/result/source row and per retained_input. No locator kind exists for date/tier/release; dates cite their owning event, tiers use classification-input FK. F/X source claims target their retained-input member locator, with exact row pointer in evidence source_locator and original phase in claim_json. No nonexistent event target is allowed. Source catalogue union preserves 3971 IDs and exact metadata; identical 2809 duplicated rows have two origins. URLs are unique per catalogue ID; two real inline URLs receive URL-derived sources, metadata NULL. No remote page bytes were downloaded: file_sha256=NULL; publisher=NULL; data_rights=unknown.

Deterministic citation enumeration: H. Source URL→event claim and date claim (same occurrence, distinct claim_kind); IX. Source URL→event reconciliation claim (distinct original path, no new event); D. Source URL→result claim; O. Calendar evidence→office calendar_context (no next-date claim); Cal. Source URL→Cal retained-input context; Nts. Screen evidence→country screening; F/X. Source URL→retained-input stage_observation. For each country/office HTML, enumerate literal external http/https anchors in document order (html_anchor_index counts all literal anchors starting at0); target its retained-input artifact_reference. Local navigation/script-generated templates are not sources. Catalogue metadata itself remains source.raw_json and retained inputs. Keep occurrence IDs distinct; duplicate citations do not imply independent verification.

Resolve exact source token then unique URL. All baseline designated source URLs are present in catalogue or the two actual inline URLs. Future unmatched/malformed/ambiguous token becomes unresolved_evidence against a real locator with exact token/reason. Missing already-resolved source FK is fatal, never downgraded to unresolved to pass CI. Open research gaps are not fake unresolved citations. Preserve all source claims on conflict, withhold single resolved date/metric; never average or silently choose newest.

## Publication and refresh requirements — not executed

Stage from a consistent backup of published master on the same filesystem. Commit started attempt in separate durable ledger before staging; one writer lock. Preserve unrelated lineage rows and release IDs. Validate tier approval/effective office coverage, hashes, semantic refs, fixtures, value/status pairs and full FK/integrity checks before committing candidate release. Off-VPS backup before publication; checkpoint WAL completely, close connections, fsync staged file, atomic rename, fsync directory, reopen read-only readers. Receipt and publication set live inside staged master. Success logged only after verified swap; failed pre-swap attempt keeps last good serving and durable failure ledger. Crash after rename requires receipt reconciliation.

Incomplete refresh cannot delete prior offices/events/results/tier/source/evidence/aliases. Carry original immutable inputs at collision-safe inherited paths and include them in effective fingerprint; reviewed withdrawal required for removal. Citation uses each row's lineage release, not last publication receipt. No DDL changes, importer implementation, SQLite execution, VPS/UI deployment, metrics or redirects in this task.
