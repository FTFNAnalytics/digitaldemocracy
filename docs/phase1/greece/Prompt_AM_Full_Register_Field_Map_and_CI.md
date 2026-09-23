# Prompt AM — field map and CI checklist

Mapping work is complete for the supplied research projection; research gaps remain open. No importer, SQLite, VPS, or UI execution is claimed. Holds GR-G01–GR-G10 stay open.

| Item | Status | Pointer |
|---|---|---|
| Current register 693 + historical 10 | Done | [counts.json](counts.json) / [JUSTIN_REPORT.md](JUSTIN_REPORT.md) |
| Draft tiers exact 1:1 with 703 offices | Done | `schemas/atlas/tiers/greece.json` |
| President `GR-PRES` parliamentary indirect | Done | [Greece_Identity_Rules.md](Greece_Identity_Rules.md) / office register |
| No PM, cabinet, or prefect rows | Done | office register `office_type` histogram |
| No Kallikratis successor edges | Done | [Greece_Research_Gaps.md](Greece_Research_Gaps.md) GR-G04 / identity crosswalk |
| 223 destination columns mapped | Done | [Greece_Field_Map.md](Greece_Field_Map.md) / [column-map.json](column-map.json) |
| Result rows linked to source observations | Done | `results.jsonl.gz` / `ballot-observations.jsonl.gz` |
| 14 local source holds preserved | Done | `data/research/greece/source-holds.json` |
| Structural validation PASS, coverage incomplete | Done | [validation.json](validation.json) |
| Justin accept-with-holds receipt | Done | [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md) |
| Importer / publication CI | Not run | no `lib/atlas/greece/` |

## Destination coverage

| Table | Columns | Mapping status |
|---|---:|---|
| ingest_attempt | 12 | Done — Greece_Field_Map.md#ingest_attempt |
| dataset_lineage | 3 | Done — Greece_Field_Map.md#dataset_lineage |
| dataset_release | 12 | Done — Greece_Field_Map.md#dataset_release |
| publication_release | 2 | Done — Greece_Field_Map.md#publication_release |
| publication_receipt | 4 | Done — Greece_Field_Map.md#publication_receipt |
| retained_input | 8 | Done — Greece_Field_Map.md#retained_input |
| country | 11 | Done — Greece_Field_Map.md#country |
| geography | 9 | Done — Greece_Field_Map.md#geography |
| research_date | 12 | Done — Greece_Field_Map.md#research_date |
| office | 16 | Done — Greece_Field_Map.md#office |
| office_tier_classification | 11 | Done — Greece_Field_Map.md#office_tier_classification |
| election_event | 18 | Done — Greece_Field_Map.md#election_event |
| proceeding | 11 | Done — Greece_Field_Map.md#proceeding |
| source | 14 | Done — Greece_Field_Map.md#source |
| party_mapping | 12 | Done — Greece_Field_Map.md#party_mapping |
| result_row | 24 | Done — Greece_Field_Map.md#result_row |
| record_locator | 17 | Done — Greece_Field_Map.md#record_locator |
| evidence_link | 11 | Done — Greece_Field_Map.md#evidence_link |
| unresolved_evidence | 8 | Done — Greece_Field_Map.md#unresolved_evidence |
| identity_crosswalk | 8 | Done — Greece_Field_Map.md#identity_crosswalk |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Actual unchanged re-import creates new durable attempt and same lineage release | Not run |
| Poison FK rollback keeps last good serving DB and durable failed attempt | Not run |
| Tier file is sole classifier; calendar cohorts excluded | Not run |
| Missing results stay gaps; no zero invented for an absent return | Not run |
| Other Europe/LatAm/NZ lineages unchanged | Not run |
| No office/history filtering by upcoming 18-month window | Not run |

`JUSTIN_REPORT.md` remains the pre-acceptance receipt (boxes unchecked). This landing does not re-run the omitted pack validator. Importer/SQLite/VPS/UI all Not run.
