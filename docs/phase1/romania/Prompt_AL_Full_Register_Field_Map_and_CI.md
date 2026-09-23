# Prompt AL — field map and CI checklist

Mapping work is complete for the supplied research projection; research gaps remain open. Justin accepted the register and draft tiers with named holds. No importer execution is claimed.

| Item | Status | Pointer |
|---|---|---|
| Current SIRUTA 2025 register, stable office IDs | Done | office-register.json; Romania_Identity_Rules.md; counts.json |
| 6,460 current / 0 historical-only; councils and executives distinct | Done | counts.json; Romania_Acceptance_Examples.md |
| No prefect / PM / cabinet rows | Done | Romania_Acceptance_Examples.md 16–17 |
| County-president 2016 investiture not a popular event | Done | Romania_Identity_Rules.md; RO-G03 |
| 2024 presidential round retained as annulled; no 2025 successor edge | Done | Romania_Identity_Rules.md; RO-G02 |
| Draft tiers exactly 1:1 with the register | Done | schemas/atlas/tiers/romania.json |
| 223 destination columns / 20 tables | Done | Romania_Field_Map.md; column-map.json |
| 19,343 events; 23 national/EP result rows; missing local ≠ zero | Done | events.json.gz; results.json; RO-G01 |
| No successor or merger edges | Done | Romania_Research_Gaps.md RO-G06 |
| Named holds left open | Done | Romania_Research_Gaps.md; JUSTIN_ACCEPTANCE.md |
| At least 15 worked examples | Done | Romania_Acceptance_Examples.md (20) |
| Structural validator receipt | Done | validation.json PASS; SHA256SUMS |
| Importer / SQLite / VPS / UI | Not run | No `lib/atlas/romania/`; package.json import scripts unchanged |

## Future importer / publication gates

| Gate | Execution status |
|---|---|
| `import:atlas` Romania / SQLite migration | Not run |
| Unchanged reimport | Not run |
| Tier file drives classification; `national` maps to `national_context` | Not run |
| Missing ≠ zero | Not run |
| Annulled 2024 presidential round stays distinct from 2025 | Not run |
| No office filtering by the ~18-month alert window | Not run |
| VPS / UI / `/electiondatabase` redirects | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin accepts draft tiers with RO-G01–RO-G07 retained (2026-09-22).
- [ ] Justin separately authorizes implementation.
