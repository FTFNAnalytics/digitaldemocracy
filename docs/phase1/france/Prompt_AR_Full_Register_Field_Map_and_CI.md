# Prompt AR — field map and CI checklist

Mapping work is complete for the supplied research projection; research gaps remain open. Justin accepted the register and draft tiers with holds G01–G21 left open. No importer execution is claimed.

| Item | Status | Pointer |
|---|---|---|
| Current COG 2026 register, stable office IDs | Done | office-register.jsonl; Identity_Rules.md; counts.json |
| 35,112 current / 2,738 historical; one draft tier per office | Done | draft-tiers.jsonl; schemas/atlas/tiers/france.json |
| Direct executives current = 1 (president); no popular mayor or EPCI contest | Done | Identity_Rules.md; G03; G04; G13 |
| Draft tiers exactly 1:1 with the register (T1 4 / T2 45 / T3 96 / T4 37,705) | Done | schemas/atlas/tiers/france.json |
| 223 destination columns / 20 tables | Done | Field_Map_223.md; contracts/columns.json |
| 119,554 events; 173,409 reporting units; 1,193,657 results in the full pack | Done | counts.json; omitted jsonl hashes in SHA256SUMS |
| Missing results not zero-filled | Done | SLIM_LAND_NOTE.md; G10; G12; G21 |
| Successor crosswalk empty; no guessed commune-nouvelle edge | Done | successor-crosswalk.json; G05 |
| Named holds left open | Done | Research_Gaps.md; JUSTIN_ACCEPTANCE.md |
| 36 acceptance examples | Done | Acceptance_Examples.md |
| Structural validator receipt | Done | validation-report.json PASS; SHA256SUMS |
| Importer / SQLite / VPS / UI | Not run | No `lib/atlas/france/`; package.json import scripts unchanged |

## Future importer / publication gates

| Gate | Execution status |
|---|---|
| `import:atlas` France / SQLite migration | Not run |
| Unchanged reimport | Not run |
| Tier file drives classification; `national` maps to `national_context` | Not run |
| Missing ≠ zero | Not run |
| No office filtering by the ~18-month alert window | Not run |
| VPS / UI / `/electiondatabase` redirects | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin accepts draft tiers with G01–G21 retained (2026-09-22).
- [ ] Justin separately authorizes implementation.
