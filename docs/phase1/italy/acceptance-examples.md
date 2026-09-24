# Italy — acceptance examples

The standalone validator executes the corresponding structural and data checks. Passing them does not close the named research gaps.

## IT-A01 — current_roster

Input: SITUAS report 61 at 2026-09-23

Expected: 7,894 current territories; one council and one direct mayor per current comune; no alert-window filtering.

Evidence: `data/territorial-register.jsonl`.

## IT-A02 — current_name

Input: Official SITUAS rename of Vallecrosia

Expected: Use the current published name Vallecrosia al mare without creating an abolished/new pair from a rename.

Evidence: `data/official-territorial-changes.jsonl`.

## IT-A03 — historic_extinction

Input: 348 explicit ISTAT ES relationships

Expected: 696 historical-only council/mayor rows; territorial relations do not assert office succession.

Evidence: `data/successor-crosswalk.jsonl`.

## IT-A04 — sardinia_codes

Input: 2026 Sardinian administrative recoding

Expected: Retain current codes; an AP/RN code change is not a merger edge.

Evidence: `sources/istat-sardinia-recode.zip`.

## IT-A05 — councils_mayors

Input: Every current comune

Expected: 7,894 municipal councils and 7,894 mayor offices; no duplicate mayor for a runoff.

Evidence: `data/office-register.jsonl`.

## IT-A06 — vda_deputies

Input: Valle d’Aosta joint popular mayor/deputy mode

Expected: 74 additional deputy-mayor offices, with no independent deputy ballot universe.

Evidence: `sources/vda-municipal-mode.html`.

## IT-A07 — president_indirect

Input: Constitution art 83 and Quirinale winning ballots

Expected: One indirect national office; all presidential result events use indirect_assembly_ballot.

Evidence: `sources/constitution.pdf`.

## IT-A08 — president_history

Input: Quirinale 1948–2022 winning-ballot tables

Expected: 13 events; no absent preceding-ballot candidate totals or popular votes are generated.

Evidence: `data/events.jsonl`.

## IT-A09 — two_chambers

Input: Camera and Senato 2022 source files

Expected: Two separate national offices/events; no inference of life-senator popular votes.

Evidence: `sources/camera-2022-Italia-livcomune.csv`.

## IT-A10 — mixed_vote

Input: Repeated candidate total next to coalition list rows

Expected: Keep separate list/candidate vote types and deduplicate identical candidate totals within the source reporting unit.

Evidence: `data/results.jsonl.gz`.

## IT-A11 — regional_roster

Input: 20 regioni including five special statutes

Expected: 20 councils and 18 direct presidents; no direct VDA or TAA regional-president row.

Evidence: `data/office-register.jsonl`.

## IT-A12 — taa_composite

Input: TAA council composed of provincial councillors

Expected: One regional council office; no invented separate current regional ballot.

Evidence: `sources/taa-council-mode.html`.

## IT-A13 — autonomous_provinces

Input: Trento and Bolzano selection modes

Expected: Two provincial councils; only Trento has a direct provincial president.

Evidence: `sources/special-statute-web-extracts.json`.

## IT-A14 — delrio

Input: Ordinary province/metropolitan second-degree election

Expected: No ordinary popular provincial council/president rows; disposition records document exclusion.

Evidence: `data/provincial-metropolitan-dispositions.jsonl`.

## IT-A15 — fvg_transition

Input: FVG LR 7/2026 arts 18,20,27,45,78

Expected: Eight statutory pending offices, not eight current elected offices or invented first-election results.

Evidence: `sources/fvg-law2026.pdf`.

## IT-A16 — ep_history

Input: Ten EP national party tables 1979–2024

Expected: Ten cycles; earlier dates remain year-only; absent national raw votes stay null.

Evidence: `data/events.jsonl`.

## IT-A17 — ep_grain

Input: 2024 EP national shares/seats plus domestic municipal lists

Expected: Never sum national party observations and municipal observations as two sets of votes.

Evidence: `data/reporting-units.jsonl`.

## IT-A18 — wrong_export

Input: comunali-20240609.csv payload mismatch

Expected: Quarantine all values; no normalized row cites this as a municipal return.

Evidence: `sources/comunali-20240609.csv`.

## IT-A19 — july_poll

Input: Corte Palasio 2024-07-28 source return

Expected: Preserve the supplied date; do not label it a repeat without a repeat notice.

Evidence: `sources/comunali-20240728.csv`.

## IT-A20 — taa_attachments

Input: 282 official document objects, 281 attachments

Expected: Keep Lana date-only events; absent mayor or list totals are not zero.

Evidence: `data/taa-extraction-audit.json`.

## IT-A21 — taa_joint_ballot

Input: Explicit joint list/mayor table

Expected: Link the council event to the mayor office without duplicating votes.

Evidence: `data/event-office-links.jsonl`.

## IT-A22 — round2_list

Input: TAA runoff document repeats list context and reports seats

Expected: Record mayor runoff votes; list seats may reference first round, never a second-round list vote universe.

Evidence: `data/results.jsonl.gz`.

## IT-A23 — firenze_quartieri

Input: Official Firenze 2024 neighbourhood returns

Expected: Five councils and five direct presidents; no inferred nationwide uniform class.

Evidence: `sources/firenze2024-subdivisions.csv`.

## IT-A24 — publication_date

Input: Firenze publication timestamps on June 10

Expected: Keep publication timestamp in raw data, not as the June 8–9 poll date.

Evidence: `sources/firenze2024-mayor.csv`.

## IT-A25 — bolzano_history

Input: 17 Bolzano council tables 1948–2023

Expected: 17 actual dated events; early provincial components link to regional office without double counting.

Evidence: `data/events.jsonl`.

## IT-A26 — printed_conflict

Input: Seven Bolzano sum-versus-total discrepancies

Expected: Keep both source observations unchanged, set event numeric-quality flag, and report arithmetic warning.

Evidence: `data/arithmetic-audit.json`.

## IT-A27 — null_seats

Input: Dash or blank in source seat column

Expected: Null remains null; only explicit numeric zero becomes zero.

Evidence: `data/results.jsonl.gz`.

## IT-A28 — capacity

Input: Consiglieri da eleggere in TAA PDF

Expected: Capacity is a metric kind, not an additional party seat allocation.

Evidence: `data/results.jsonl.gz`.

## IT-A29 — tier_bijection

Input: All current/historical/pending office rows

Expected: Exactly one unapproved draft tier per office; no missing or duplicate classification.

Evidence: `data/draft-tiers.jsonl`.

## IT-A30 — contract

Input: Inherited Germany pack column inventory

Expected: Byte-identical 20-table/223-column contract and exact 1:1 field map.

Evidence: `contract/columns.json`.

## IT-A31 — hashes

Input: Retained sources and generated artifacts

Expected: Exact bytes match inventory and SHA256SUMS; ZIP has a separate external SHA-256.

Evidence: `data/source-inventory.json`.

## IT-A32 — approval

Input: Research-only instruction

Expected: applied_changes=0 and every Justin approval remains false/unchecked.

Evidence: `data/approval-state.json`.
