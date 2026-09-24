# Prompt AR — field map and CI checklist

Mapping work is complete for the supplied research projection; holds G01–G21 remain open. Justin accepted the pack with those holds on 2026-09-22. The importer is `ATLAS_IMPORT_SCOPE=france` only — see [France_Import.md](France_Import.md). `all` does not publish France.

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
| Importer / publication CI | Landed | `ATLAS_IMPORT_SCOPE=france` only; not part of `all`. 0 result rows and 0 event rows. See [France_Import.md](France_Import.md). VPS deploy was not run |

## Future importer / publication gates

| Gate | Execution status |
|---|---|
| `import:atlas` France / SQLite migration | Landed (`ATLAS_IMPORT_SCOPE=france` only) |
| Unchanged reimport | Landed (same fingerprint reuses the release) |
| Tier file drives classification; `national` maps to `national_context` | Landed (`FR-EP` stays `national_context`) |
| Missing ≠ zero | Landed (0 published result rows and 0 published events) |
| No office filtering by the ~18-month alert window | Landed |
| VPS / UI / `/electiondatabase` redirects | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin accepts draft tiers with G01–G21 retained (2026-09-22).
- [x] Justin separately authorizes implementation (`ATLAS_IMPORT_SCOPE=france`; not part of `all`).
