# Prompt AS — field map and CI checklist

Mapping work is documented for the supplied research projection; holds DE-G01–DE-G23 remain open. Justin accepted the pack with those holds. No importer was run. `research_coverage_complete` stays false.

| Item | Status | Pointer |
|---|---|---|
| 21,960 current + 670 historical offices | Documented | Germany_Pack_README.md / Justin_Report.md |
| Draft jurisdiction tiers 3 / 20 / 552 / 22,055 | Included as supplied | `schemas/atlas/tiers/germany.json` |
| Numeric tiers not remapped | Done | JUSTIN_ACCEPTANCE.md |
| 223 destination fields / 20 inherited tables | Documented | Field_Map_223.md |
| 51 acceptance examples | Documented | Acceptance_Examples.md |
| Identity rules | Documented | Identity_Rules.md |
| Named holds DE-G01–DE-G23 left open | Done | Research_Gaps.md / JUSTIN_ACCEPTANCE.md |
| Full-pack hash manifest | Included | SHA256SUMS (omitted bulky paths stay listed) |
| Justin accept-with-holds receipt | Done | JUSTIN_ACCEPTANCE.md |
| Importer, SQLite, VPS, UI | Not run | No `lib/atlas/germany/` |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Office register and results loaded from retained bytes | Not run (omitted from this land) |
| Tier file is sole classifier | Not run |
| Missing SH mayors stay uninvented (DE-G06) | Not run |
| Subdivision rosters stay uninvented (DE-G10) | Not run |
| Successor edges stay unasserted (DE-G09) | Not run |
| Withheld seat panels stay unrepaired (DE-G23) | Not run |
| Other country lineages unchanged | Not run |
| No office/history filtering by the upcoming 18-month window | Not run |

- [x] Justin accepts this handoff with named holds DE-G01–DE-G23 left open.
- [ ] Justin authorizes implementation.
