# Justin acceptance — Albania Prompt BA

Accepted 2026-09-25 (America/Edmonton) with holds AL-BA-G01 through AL-BA-G21 left open:

- `AL-BA-G01 — presidential_selection`
- `AL-BA-G02 — mayor_selection`
- `AL-BA-G03 — 2014_2015_reform`
- `AL-BA-G04 — dimal_rename`
- `AL-BA-G05 — nested_local_bodies`
- `AL-BA-G06 — no_popular_regional_tier`
- `AL-BA-G07 — no_ep`
- `AL-BA-G08 — rrogozhine_annulment_repeat`
- `AL-BA-G09 — replacement_contests`
- `AL-BA-G10 — tirana_2025_cancelled_schedule`
- `AL-BA-G11 — 2011_repeat_phases`
- `AL-BA-G12 — 1991_republic_gate`
- `AL-BA-G13 — early_national_numeric_coverage`
- `AL-BA-G14 — 2021_arithmetic`
- `AL-BA-G15 — 2025_final_vs_preliminary`
- `AL-BA-G16 — inherited_result_certification`
- `AL-BA-G17 — older_local_history`
- `AL-BA-G18 — future_cycles_and_reform`
- `AL-BA-G19 — source_retrieval_and_hash_scope`
- `AL-BA-G20 — identity_contract_recovery`
- `AL-BA-G21 — party_and_coalition_comparability`

Counts: 123 current / 768 historical-only offices (891 rows); 1,180 events / 8,229 results (events and results omitted from this slim land; retained in the full pack). Draft tiers: 1 national / 868 municipal / 22 other (891 rows, 1:1). European Parliament offices: 0. Popular presidential offices: 0 (the President is Assembly-elected). Mayors are directly elected. Popular qark and prefecture offices: 0. `office_successor_edges` stays empty. `research_coverage_complete` stays false. Every draft tier row keeps `justin_approved: false`.

The Phase 1 approved classifier (122 municipal, SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`) is preserved at `Phase1_approved_tiers.json`. The schema path `schemas/atlas/tiers/albania.json` is the Prompt BA draft (SHA-256 `38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae`). The existing importer pins that schema-path checksum and still classifies the preserved 122 municipal rows. It does not publish the 891 draft offices. `ATLAS_IMPORT_SCOPE` is unchanged. No VPS deploy.

Do not invent offices, vote or seat values, popular presidential or EP offices, or successor edges. Untranscribed numeric cells remain null, never 0. The 768 historical-only rows are source-vintage identities, not proved abolitions. No importer of the Prompt BA register is authorized by this land.

Full ZIP SHA-256 `411d72969c246c71b8c050993707242dc338f01ddc8f7e0858b17f3e909a654e`.
