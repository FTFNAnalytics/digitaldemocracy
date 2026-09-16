# Election Atlas — Phase 2 continuity documentation

Prompt D continuity field maps live here. Prompt E LatAm/NZ tier drafts are checked in and remain **`draft_for_human_review`**. Prompt F decision drafts live under [decisions/](decisions/README.md). **Mexico share disposition is accepted** (withhold-all-67, 2026-09-16). Continuity ingest remains **blocked** on approved tier packs and remaining Prompt D gates. This directory is **documentation only**.

1. **Prompt D is documentation-complete; implementation CI is Not run.** The checklist marks every required map output Done and every importer/CI gate Not run. No LatAm or NZ importer is in this change.

2. **Authored against main `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`**, where `schemas/atlas/migrations/`, `docs/phase0/`, and `docs/phase1/` were absent. Those paths **now exist on PR #18**. Prompt B contract hashes still match the checked-in files:
   - `0001_atlas_attempt_log.sql` SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
   - `0002_atlas_master.sql` SHA-256 `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`
   The Prompt D maps name the same bytes as `001_atlas_attempt_log.sql` / `001_atlas_master.sql`. Paths on this PR use the checked-in `0001_` / `0002_` filenames.

3. **Material findings**
   - LatAm 40,509 historical subtotal = 36,750 selected + 3,759 other; total events 58,658 with 18,149 prospective.
   - 67 Mexico result rows with share>100 / `percent_0_100` are a **hard LatAm publish blocker** unless a reviewed override withholds or corrects them. Justin accepted withhold-all-67 on 2026-09-16; do not clamp, scale, or drop those rows.

4. **Prompt E drafts are checked in and still draft.** 21 LatAm country files + `new-zealand.json` live under `schemas/atlas/tiers/` with status **`draft_for_human_review`**. The Mexico share-domain inventory at `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain-DRAFT.json` remains non-executable history. Continuity ingest remains **blocked** until tiers are approved. Multi-lineage import implementation is still required.

5. **Mexico share disposition accepted; Prompt G applied category-policy clearances to drafts only.** Justin accepted withhold-all-67 on 2026-09-16 (America/Edmonton). Discoverable override: `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (`production_accepted=true`; untouched by Prompt G). Historical proposal remains `docs/phase2/decisions/mexico-share-domain-PROPOSED.json`. Prompt G revised the 22 LatAm/NZ tier files in place: 5,426 flag clearances / 1,425 residuals / 1,116 `tier_uncertain` remaining; Batch A unchanged; **no pack approvals**. Packs remain **`draft_for_human_review`**. LatAm continuity remains blocked on approved tier packs and remaining Prompt D gates. See [tier-drafts/](tier-drafts/Phase2_Tier_Policy_Application_Report.md) and [decisions/](decisions/README.md).

6. **Do not** implement a LatAm/NZ importer in this change. **Do not** approve continuity tier packs. **Do not** modify frozen research bytes.

| File | Role |
| --- | --- |
| [Prompt_D_Continuity_Checklist.md](Prompt_D_Continuity_Checklist.md) | Required outputs and CI gates (execution Not run) |
| [Continuity_LatAm_Field_Map.md](Continuity_LatAm_Field_Map.md) | Latin America → Atlas column map |
| [Continuity_NZ_Field_Map.md](Continuity_NZ_Field_Map.md) | New Zealand → Atlas column map |
| [Continuity_Identity_Rules.md](Continuity_Identity_Rules.md) | Namespaces, fingerprint, multi-lineage protocol |
| [Continuity_Acceptance_Examples.md](Continuity_Acceptance_Examples.md) | Twelve worked examples |
| [tier-drafts/](tier-drafts/Phase2_Tier_Policy_Application_Report.md) | Prompt E/G draft packs (still draft; Prompt G: 5,426 clearances / 1,425 residuals; Mexico inventory non-executable) |
| [decisions/](decisions/README.md) | Prompt F pack: Mexico withhold-all-67 **accepted** 2026-09-16; tier policies still draft (5,426/6,851 could clear; 1,425 residual; not applied) |
