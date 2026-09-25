# Prompt AY — Full register, field map and CI checklist

| Requirement | Status | Evidence |
|---|---|---|
| Full current national + 25 local elected-body register | Done | `data/office-register.jsonl` |
| Direct-executive policy | Done | President only; `ME-AY-G06` |
| Historical nested local identities | Done with no-successor hold | `data/transition-relations.json` |
| Parliament / President history | Done; 2016 parliament numeric held open | events/results |
| Local contest history | Done for researched archive cycles; numeric depth partial | events/results + gaps |
| 2023 presidential runoff split | Done | two events |
| Šavnik unresolved state | Done | `ME-AY-G02` |
| EP offices zero | Done | validator + `ME-AY-G08` |
| Draft tiers 1:1 | Done | `data/draft-tiers.jsonl` |
| 20-table / 223-column mapping | Done | contracts + field map |
| ≥15 acceptance examples | Done | 25 examples |
| Source inventory + hashes | Done; normalized-extract hashes only | source inventory |
| SHA256SUMS + validator | Done | root |
| Repo/importer/SQLite/VPS/UI changes | Not run | `applied_changes=0` |
