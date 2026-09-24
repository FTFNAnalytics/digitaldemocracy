# Bosnia and Herzegovina — Prompt AW identity rules

## Status
Research/documentation only. `applied_changes=0`. All Justin approvals are false.

## Office identity
- Namespace: `bosnia-herzegovina-research-aw-v1`.
- One row is retained per elected body or directly elected executive office in scope.
- State Presidency is represented as three member offices because the Constitution/election law provides three directly elected members with different entity/electorate footing. FBiH voters choose either a Bosniak or Croat Presidency candidate; the pack does not imply each FBiH voter elects both.
- The State House of Representatives is one chamber office. Its official 42-seat design and entity/constituency/compensatory structure are preserved as source facts; no compensatory arithmetic is synthesized.
- FBiH House of Representatives and RS National Assembly are entity legislature offices. The ten canton assemblies are ten separate regional offices.
- Republika Srpska has one President and two Vice-President offices. `VP-01` / `VP-02` are internal stable placeholders only. No fixed ethnic seat or ordering is inferred across cycles.

## Local identity
- CIK basic constituency codes anchor municipal/city direct-election identity where provided.
- Current direct representative roster = 58 FBiH municipal councils + 53 RS municipal assemblies + 21 FBiH city councils + 10 RS city assemblies + Brčko Assembly = 143.
- Sarajevo City Council and Istočno Sarajevo City Assembly are additional current elected bodies filled indirectly from constituent municipal councils/assemblies, yielding 145 current local representative bodies.
- Current direct local executives = 111 municipal mayors + 31 city mayors = 142. Mostar, Sarajevo and Brčko mayors are excluded from direct-executive rows because official CEC material documents council/assembly selection. Istočno Sarajevo city mayor is direct from 2020 onward.

## Historical type changes
Twenty basic constituencies appear as municipal bodies in an earlier official CIK local-election roster and as city bodies in a later roster. A historical municipal council/assembly row and historical municipal-mayor row are retained for each, creating 40 historical-only office rows. This is a source-identified type discontinuity. **No legal successor edge or effective date is guessed.** `data/historical-office-transitions.json` therefore has `successor_edge_asserted=false` throughout.

## Event identity
- General cycles: 2014-10-12, 2018-10-07, 2022-10-02, plus called 2026-10-04 events for the 19 direct state/entity/canton office rows.
- Local cycles: 2016, 2020, 2024. Main direct poll dates are 2016-10-02, 2020-11-15 and 2024-10-06; Mostar 2020 is a separate 2020-12-20 event.
- Stolac 2016 original council/mayor events are retained as annulled and separate valid repeats are retained on 2017-02-19. No last-wins collapse.
- Sarajevo/Istočno Sarajevo indirect city-body elections are separate events after each local cycle (2017, 2021, 2025).
- 2026 called events have `legal_outcome=not_held` and no result rows.

## Result identity and missing data
`results.jsonl` contains one result-state envelope for every completed or annulled event. It records whether the official result is confirmed/available and retains event-level legal state. The pack does **not** fabricate untranscribed candidate/list votes, shares or seats: those fields are null with explicit `not_transcribed` status. Prompt O continuity preserves 749 previously researched detailed numeric rows through `data/prompt-o-detailed-results-reference.json`, pinned to Git blob `5228f504e759b24e5b6fe36a1ad56db5b0874f29` and detailed-return SHA-256 `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`. They are not silently regenerated. A complete candidate/list numeric-vector transcription outside that retained set remains BA-AW-G01.

## Indirect chambers and executives
The BiH House of Peoples, FBiH House of Peoples and RS Council of Peoples are documented as indirect bodies and are excluded from the direct-popular register. Federation president/vice-presidents, cantonal governments, Sarajevo mayor, Mostar mayor, Brčko mayor and the state Council of Ministers are not fabricated as popular offices.

## European Parliament
Bosnia and Herzegovina is an EU candidate country, not an EU Member State. The office register must contain exactly zero European Parliament offices.

## Publication protection
No database/repository/importer/VPS/UI execution occurred. Tiers remain draft, approvals false, and any future projection must be separately authorized.

## Conflicting 2024 aggregate
The 8 May 2024 CEC English call page and 4 October basic-information page disagree on 31 versus 32 city mayors while both contextually imply a 143-total aggregate. Aggregate arithmetic is not an office identity. AW therefore does not mint an unidentified office merely to satisfy the total; BA-AW-G09 remains visible.
