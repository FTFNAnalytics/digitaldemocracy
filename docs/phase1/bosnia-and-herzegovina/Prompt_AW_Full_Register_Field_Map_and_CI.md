# Prompt AW — full register / field map / CI checklist

| Requirement | Status | Evidence |
|---|---|---|
| Full current state/entity/canton/local register | Done | data/office-register.jsonl; Full Register Report |
| Direct executives only where popular | Done | office register; excluded-offices.json; Identity Rules |
| Brčko Assembly / no invented direct Brčko mayor | Done | register; BA-S01/BA-S10 |
| Sarajevo & Istočno Sarajevo indirect city bodies | Done | BA-S07/08/09; event layer |
| 2016/2020/2024 local contests | Done | events.jsonl |
| 2014/2018/2022 general contests + called 2026 | Done | events.jsonl |
| Results layer, missing != zero | Done at result-state level; numeric vector depth open | results.jsonl; BA-AW-G01 |
| Historic office identities for city-status changes | Done with no guessed successor edges | historical-office-transitions.json |
| 223-column / 20-table map | Done | contracts/columns.json; Bosnia_Field_Map.md |
| Draft tiers exactly 1:1 | Done | draft-tiers.jsonl; validator |
| ≥15 acceptance examples | Done (26) | Bosnia_Acceptance_Examples.md |
| Sources + hashes | Done | source-inventory.json; sources/; SHA256SUMS |
| House of Peoples gate | Done | excluded-offices.json; BA-S20/21 |
| Zero EP offices | Done | validator; BA-S19 |
| applied_changes=0 | Done | metadata/counts/validator |
| Justin approvals unchecked | Done | JUSTIN_REPORT; metadata/validator |

## Result evidence hardening
- Done: every completed/annulled event has one result-state row.
- Done: cycle result-state rows point to official CEC result/confirmation sources, not call pages alone.
- Done: Prompt O's 749 detailed numeric rows are pinned by immutable blob/table hashes and a 13-office crosswalk.
- Open: exhaustive numeric transcription outside that retained result set (BA-AW-G01).
- Done: CEC 31/32 city-mayor aggregate conflict retained as BA-AW-G09; no synthetic office.
