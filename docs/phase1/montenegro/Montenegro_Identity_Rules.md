# Montenegro identity rules — Prompt AY

Research/documentation only; `applied_changes=0`.

## Office identity
- Namespace: `montenegro-research-ay-v1`.
- National IDs: `ME-NAT-PARLIAMENT`, `ME-NAT-PRESIDENT`.
- Current local assemblies: `ME-LOC-<source name>-ASM`.
- Historical nested bodies use separate `ME-HIST-*` identities.
- Name/status changes never create successor links by inference.

## Event identity
- Office + source-supported date label + round where applicable.
- Day precision only when sourced; year-only dates remain year precision.
- 2023 presidential rounds are separate events.
- Budva's May and November 2024 elections are separate events.
- Šavnik 2022 remains unresolved/incomplete.

## Results
- Numeric values are copied only where transcribed from official sources.
- Missing/untranscribed values are `null`, not zero.
- Result-state rows can document an event/result archive without pretending full list-level numeric transcription.
- Source arithmetic disagreements remain disagreements: 2006 source valid ballots = 338,835; listed vote sum = 338,833.

## Executives
- President is directly elected.
- Municipal presidents/mayors are elected by local assemblies; direct local executive rows = 0.

## Scope gates
- Post-independence Montenegro national-office history only.
- Serbia-and-Montenegro federal offices excluded.
- Montenegro is not an EU Member State; EP offices = 0.
