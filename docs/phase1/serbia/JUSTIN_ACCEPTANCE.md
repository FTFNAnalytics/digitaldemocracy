# Justin acceptance — Serbia Prompt AX REBUILT

Accepted 2026-09-25 (America/Edmonton) with holds left open:

- `RS-AX-G01 — local numeric vectors` (`open`)
- `RS-AX-G02 — presidential runoff` (`documented`)
- `RS-AX-G03 — Vojvodina executive` (`documented`)
- `RS-AX-G04 — mayors` (`documented`)
- `RS-AX-G05 — Kosovo scope gate` (`scope_gate`)
- `RS-AX-G06 — European Parliament` (`documented`)
- `RS-AX-G07 — historical status reforms` (`documented_partial`)
- `RS-AX-G08 — 2020 local dates` (`open`)
- `RS-AX-G09 — source bytes` (`documented`)
- `RS-AX-G10 — city municipality filter` (`documented`)
- `RS-AX-G11 — 2026 local numeric finality` (`open`)

This land does not close RS-AX-G01–RS-AX-G11. Pack statuses above are the statuses in `data/research-gaps.json`.

Kosovo scope gate: Kosovo-scope offices in this Serbia pack stay **0**. No office name contains Kosovo or Metohija. No dual-sovereignty row is added.

Counts: 173 current / 5 historical-only offices (178 rows). Current local assemblies 170 (145 top-level + 25 city-municipality). Current councils/chambers/assemblies 172. Direct executives 1 (President). Direct local executives 0. Direct provincial executives 0. European Parliament offices 0. Events 531. Results 671, including 520 local result-state rows whose votes, shares, and seats stay null. Draft tiers: national 2 / regional 1 / municipal 175 (178 rows, 1:1). Five successor-crosswalk rows are `same_territory_status_change` with `boundary_change_claim` false (Vršac, Kikinda, Pirot, Bor, Prokuplje). They are not merger edges. `research_coverage_complete` stays false. No importer, VPS, or `ATLAS_IMPORT_SCOPE` in this land.

Full ZIP SHA-256 `f3d10fdacac987acd10d82af364478510ac302db120084186909a420a518c864`.

Do not invent local numeric vectors, Kosovo-scope offices, European Parliament offices, direct local executives, or successor edges beyond the five sourced status changes. Untranscribed vote, share, and seat cells stay null / `not_transcribed`, never 0.

`applied_changes=0`. `JUSTIN_REPORT.md` approval boxes stay unchecked. Every draft tier row keeps `justin_approved` false and `review_status` `draft_for_human_review`. `metadata.json` has no `research_coverage_complete` boolean; this land does not set one to true. The field map leaves the operational release NULL / not executed. `python3 docs/phase1/serbia/validate.py` PASS (178 offices, 531 events, 671 results, 20 tables / 223 columns).
