# Justin acceptance — Italy Prompt AT

Accepted 2026-09-23 (America/Edmonton) with holds left open:

- `IT-G01 — coverage_boundary`
- `IT-G02 — presidential_indirect_election`
- `IT-G03 — Camera_Senato_law_vintages`
- `IT-G04 — regional_president_selection`
- `IT-G05 — Delrio_provincial_metropolitan`
- `IT-G06 — FVG_2026_provinces`
- `IT-G07 — municipal_mayor_and_runoff_modes`
- `IT-G08 — fusioni_and_code_changes`
- `IT-G09 — special_statutes_and_autonomous_provinces`
- `IT-G10 — European_Parliament`
- `IT-G11 — June_2024_municipal_export`
- `IT-G12 — TAA_local_results`
- `IT-G13 — Firenze_and_submunicipal_scope`
- `IT-G14 — certification_preliminary_repeat`
- `IT-G15 — Bolzano_printed_arithmetic`
- `IT-G16 — history_extent`
- `IT-G17 — upcoming_alerts`
- `IT-G18 — inherited_223_column_contract`
- `IT-G19 — retrieval_and_reference_quality`

Counts: 15917 current / 696 historical / 8 pending FVG offices; 515 events / 606,051 results (results/events omitted from this slim land zip). Draft tiers T1=4 / T2=38 / T3=11 / T4=16568 (16621 rows 1:1 with offices). research_coverage_complete stays false. No importer/VPS in this land.
Full ZIP SHA-256 `4e8a6b6d0006727e2af2b10fb4054679861656b94ef4147c8ff927c56396809d`.

Do not invent circoscrizioni, Delrio popular provinces, FVG election dates, runoff rows, or repaired Bolzano arithmetic.


## Land slim notes
- Docs and the supplied tier file only. No `data/research/italy/` register in this land
- `sources/`, `results.jsonl.gz`, `events.jsonl`, reporting units, calendar, territorial register, office-history coverage, and other bulky dumps omitted. `SHA256SUMS` is the full-pack manifest, including omitted paths
- `README.md`, `justin-report.md`, and `data/approval-state.json` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- File-level `Justin_accepted` stays false, `review_status` stays `needs_review`, and `draft_for_human_review` stays true. Per-office `justin_approved` stays false and per-office `review_status` stays `unapproved_draft`. Acceptance is this receipt, with IT-G01–IT-G19 open
- `research_coverage_complete` stays false
- Checked-in tier file SHA-256: `d286962e262a2fbf35deed41b96a98c11a0c7a4d88de239420a23e5fd6aa55fb` (pack `schemas/atlas/tiers/italy.json`, included as supplied)
- Included `data/draft-tiers.jsonl` SHA-256: `78ded26d2829452862245330bfc99131d890436d46709021db5aa176db963d8e` (matches the full-pack manifest)
- Rebased onto main `09e05015` (United Kingdom Prompt AU #78). Shared indexes keep both the United Kingdom lines and the Italy lines

## Out of scope this land
- Italy `import:atlas` importer (no `lib/atlas/italy/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=italy` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
