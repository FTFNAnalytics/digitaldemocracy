# Identity and result rules

1. `GB` means the United Kingdom. Nation is a separate field. Crown Dependencies and Overseas Territories are excluded from separate office registers.
2. The office grain is an elected body or a single directly elected executive. The Commons is one office; 650 constituency contests are reporting units. A multi-member council is one office, not one office per councillor.
3. Principal councils use retained ONS territory codes plus office role. A mayor and council in the same territory have separate IDs. A code is not proof of perpetual legal identity; structural-law exceptions require explicit evidence.
4. Current, current_shadow and historical_only are different statuses. Shadow bodies coexist temporarily with operational predecessors but do not inflate the operational council count.
5. Preserve source names/accents and record explicit aliases. Punctuation and known abbreviation matching is for labels, not a successor graph. No guessed merger edges are supplied.
6. Commons reporting units carry boundary-set URL/code. Local wards carry source election vintage. Same ward/constituency name across cycles is not automatic geographical identity. Notional results are excluded.
7. Event identity uses office, date, kind and ballot/reporting scope. An event record may be a component or summary of the same real-world poll. Event counts are not counts of unique polling days. Never sum overlapping summaries and granular returns.
8. Actual delayed poll dates take precedence over the ordinary May election date when expressly documented. Year-only EP or longitudinal historical tables stay year precision. A declaration/publication date is not silently a polling date.
9. Candidate votes, first preferences, regional-list votes, London-wide votes, STV transfers, SV final totals, percentages and seat allocations are separate universes. Do not aggregate them as comparable vote counts.
10. Candidate marks in a multi-member plurality ward are not unique voters. Local handbook adjusted shares stay raw. Winners are null when formatting or complete seat evidence is unavailable; rank is not used to invent multi-member outcomes.
11. Missing votes/shares/seats remain null with status. Explicit source zeros are retained only in their correct meaning. Unopposed placeholder zero is not an actual zero-vote result.
12. Original party labels and codes remain source/term scoped. A recurring EP code such as UK01 is not assumed to identify one stable party across terms. No canonical party mapping has been applied.
13. FPTP mayor/PCC contests, supplementary-vote count stages and STV transfers are different. The July 2026 GM two-stage SV count is one poll, not an invented run-off date or second election.
14. Court proceedings need explicit legal outcomes. The Waterside petition confirms the return; it creates no repeat election. No supersedes link is inferred merely from publication order.
15. EP shares and constitutive seats retain separate source statuses. The 2019–2024 term label does not extend UK participation past Brexit. Never create a 2024 UK EP event.
16. A retained hash proves bytes, not truth or legal certification. Preserve discrepancies, source-specific status and original evidence. Four malformed CSV rows have separately sourced HTML replacements; original malformed rows remain quarantined.
17. All proposed tiers, identity choices and any future import need Justin review. This pack performs research/documentation only, with applied_changes=0.
