# Election Atlas — Phase 2 continuity documentation

Prompt D continuity field maps live here. Prompt E LatAm/NZ tier drafts are checked in and remain **`draft_for_human_review`**. Prompt F decision drafts are checked in under [decisions/](decisions/README.md); Mexico recommend withhold-all-67; tier policies could clear 5,426 flags with 1,425 residual; **nothing is approved or applied**. Mexico inventory/PROPOSED files are non-executable. Continuity ingest is blocked. This directory is **documentation only**.

1. **Prompt D is documentation-complete; implementation CI is Not run.** The checklist marks every required map output Done and every importer/CI gate Not run. No LatAm or NZ importer is in this change.

2. **Authored against main `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`**, where `schemas/atlas/migrations/`, `docs/phase0/`, and `docs/phase1/` were absent. Those paths **now exist on PR #18**. Prompt B contract hashes still match the checked-in files:
   - `0001_atlas_attempt_log.sql` SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
   - `0002_atlas_master.sql` SHA-256 `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`
   The Prompt D maps name the same bytes as `001_atlas_attempt_log.sql` / `001_atlas_master.sql`. Paths on this PR use the checked-in `0001_` / `0002_` filenames.

3. **Material findings**
   - LatAm 40,509 historical subtotal = 36,750 selected + 3,759 other; total events 58,658 with 18,149 prospective.
   - 67 Mexico result rows with share>100 / `percent_0_100` are a **hard LatAm publish blocker** until reviewed overrides. Do not clamp, scale, or drop those rows.

4. **Prompt E drafts are checked in and still draft.** 21 LatAm country files + `new-zealand.json` live under `schemas/atlas/tiers/` with status **`draft_for_human_review`**. The Mexico share-domain inventory is at `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain-DRAFT.json` (`production_accepted=false`, non-executable; not an accepted override). Continuity ingest remains **blocked** until tiers are approved and Mexico overrides are accepted. Multi-lineage import implementation is still required.

5. **Prompt F decision drafts landed; nothing approved/applied.** See [decisions/](decisions/README.md). Mexico recommendation is withhold-all-67 (`mexico-share-domain-PROPOSED.json`, `production_accepted=false` / `executable_override=false`; not a production-discovery filename). Tier category policies **could** clear 5,426 flags with 1,425 residual; the patch appendix is not applied and no tier file is flipped to approved.

6. **Do not** implement a LatAm/NZ importer in this change. **Do not** invent or approve tiers or fix Mexico shares. **Do not** modify frozen research bytes.

| File | Role |
| --- | --- |
| [Prompt_D_Continuity_Checklist.md](Prompt_D_Continuity_Checklist.md) | Required outputs and CI gates (execution Not run) |
| [Continuity_LatAm_Field_Map.md](Continuity_LatAm_Field_Map.md) | Latin America → Atlas column map |
| [Continuity_NZ_Field_Map.md](Continuity_NZ_Field_Map.md) | New Zealand → Atlas column map |
| [Continuity_Identity_Rules.md](Continuity_Identity_Rules.md) | Namespaces, fingerprint, multi-lineage protocol |
| [Continuity_Acceptance_Examples.md](Continuity_Acceptance_Examples.md) | Twelve worked examples |
| [tier-drafts/](tier-drafts/Phase2_Tier_Pack_Report.md) | Prompt E draft pack (still draft; Mexico inventory non-executable; continuity ingest blocked) |
| [decisions/](decisions/README.md) | Prompt F decision drafts (Mexico withhold-all-67; 5,426/1,425 flag recommendation; nothing approved/applied) |
