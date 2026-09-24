# Prompt AS — field map and CI checklist

Mapping work is documented for the supplied research projection; holds DE-G01–DE-G23 remain open. Justin accepted the pack with those holds. `research_coverage_complete` stays false. The importer is `ATLAS_IMPORT_SCOPE=germany` only — see [Germany_Import.md](Germany_Import.md). `all` does not publish Germany.

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
| Importer / publication CI | Landed | `ATLAS_IMPORT_SCOPE=germany` only; not part of `all`. 0 result rows and 0 event rows. See [Germany_Import.md](Germany_Import.md). VPS deploy was not run |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Office register and results loaded from retained bytes | Landed from the supplied tier file only. Omitted register, results, and events stay unpublished (0 result rows, 0 events) |
| Tier file is sole classifier | Landed. Numeric tiers stay on the row. Schema column is the required interchange |
| Missing SH mayors stay uninvented (DE-G06) | Landed (86 verified direct mayors) |
| Subdivision rosters stay uninvented (DE-G10) | Landed |
| Successor edges stay unasserted (DE-G09) | Landed (0 identity crosswalk rows) |
| Withheld seat panels stay unrepaired (DE-G23) | Landed (no result rows) |
| Other country lineages unchanged | Landed (`germany` does not load them; `all` does not load Germany) |
| No office/history filtering by the upcoming 18-month window | Landed (0 research dates; no prospective events) |

- [x] Justin accepts this handoff with named holds DE-G01–DE-G23 left open.
- [x] Justin authorizes implementation (`ATLAS_IMPORT_SCOPE=germany`; not part of `all`).
