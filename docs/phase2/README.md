# Election Atlas — Phase 2 continuity documentation

Prompt D continuity field maps live here. Prompt E/G LatAm/NZ tier files are checked in; **Batch A, Batch B, El Salvador, and Argentina are approved** (2026-09-16) and the remaining **8 residual-heavy packs** stay **`draft_for_human_review`**. Andorra is an approved Phase 0 Europe pack (importer on main). Prompt F decision drafts live under [decisions/](decisions/README.md). **Mexico share production override is still withhold-all-67** (2026-09-16). Justin accepted Prompt M **95 sibling withholds** on 2026-09-17 as disposition; docs PR [#27](https://github.com/FTFNAnalytics/digitaldemocracy/pull/27) **landed** and the production override is unchanged until an importer amendment. **Approved packs import** via `npm run import:atlas`; residual-heavy drafts are skipped. `/atlas` index/countries/offices exist. `/atlas/explorer` is not on main. Cutover remains out of scope.

1. **Prompt D maps are the import contract; approved packs now load.** `npm run import:atlas` (default `ATLAS_IMPORT_SCOPE=all`) imports Albania, Andorra, Alderney, Armenia, Bosnia and Herzegovina, plus Batch A+B packs. Residual-heavy drafts are skipped. See [Continuity_Import.md](Continuity_Import.md).

2. **Authored against main `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`**, where `schemas/atlas/migrations/`, `docs/phase0/`, and `docs/phase1/` were absent. Those paths **now exist on PR #18**. Prompt B contract hashes still match the checked-in files:
   - `0001_atlas_attempt_log.sql` SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
   - `0002_atlas_master.sql` SHA-256 `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`
   The Prompt D maps name the same bytes as `001_atlas_attempt_log.sql` / `001_atlas_master.sql`. Paths on this PR use the checked-in `0001_` / `0002_` filenames.

3. **Material findings**
   - LatAm 40,509 historical subtotal = 36,750 selected + 3,759 other; total events 58,658 with 18,149 prospective.
   - 67 Mexico result rows with share>100 / `percent_0_100` are a **hard LatAm publish blocker** unless a reviewed override withholds or corrects them. Justin accepted withhold-all-67 on 2026-09-16; do not clamp, scale, or drop those rows. Production override is still those 67. Prompt M 95 sibling withholds: Justin accepted 2026-09-17; docs PR #27 landed; not executable yet.

4. **Prompt E/G packs are checked in; Batch A+B plus El Salvador and Argentina are approved.** 21 LatAm country files + `new-zealand.json` live under `schemas/atlas/tiers/`. Justin approved Batches A and B, then El Salvador and Argentina (2026-09-16); the remaining 8 residual-heavy packs stay **`draft_for_human_review`**. The Mexico share-domain inventory at `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain-DRAFT.json` remains non-executable history. `import:atlas` loads approved packs only.

5. **Mexico share disposition accepted; Prompt G applied category-policy clearances; Batch A+B packs approved.** Justin accepted withhold-all-67 on 2026-09-16 (America/Edmonton). Discoverable override: `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (`production_accepted=true`; still original 67). Prompt M 95 sibling withholds accepted 2026-09-17; docs PR #27 landed; not executable yet. Historical proposal remains `docs/phase2/decisions/mexico-share-domain-PROPOSED.json`. See [tier-drafts/](tier-drafts/Phase2_Tier_Policy_Application_Report.md), [decisions/Batch_A_Tier_Pack_Approvals.md](decisions/Batch_A_Tier_Pack_Approvals.md), [decisions/Batch_B_Tier_Pack_Approvals.md](decisions/Batch_B_Tier_Pack_Approvals.md), and [decisions/](decisions/README.md).

6. **Do not** approve Haiti or the other large-queue residual-heavy packs here. **Do not** modify frozen research bytes. **Do not** SSH/deploy to VPS from this PR.

7. **Prompt H residual review pack** lives under [residuals/](residuals/README.md). 1,425 residuals inventoried. **Justin accepted all 285 conditional clearances on 2026-09-16** (El Salvador 262 including retained crosswalk caveat + Argentina 23). **Justin then approved the El Salvador, Argentina, and Andorra packs** (status only; Argentina still has 97 focused-review rows). Haiti 1,004 keep-open; **1,140 residuals still open**; 1,010 uncertainty-only still deferred.

8. **Prompt I residual closeout pack landed as drafts** under [closeout/](closeout/Phase2_Residual_Closeout_Report.md). `applied_changes=0`; 1,140 residuals keep-open/defer; 1,010 uncertainty-only still deferred. No tier JSON rewritten; no pack status flips; Mexico override untouched.

| File | Role |
| --- | --- |
| [Prompt_D_Continuity_Checklist.md](Prompt_D_Continuity_Checklist.md) | Required outputs and CI gates; approved-pack import CI now runs (`npm run test:atlas-import`); residual-heavy packs still skipped |
| [Continuity_LatAm_Field_Map.md](Continuity_LatAm_Field_Map.md) | Latin America → Atlas column map |
| [Continuity_NZ_Field_Map.md](Continuity_NZ_Field_Map.md) | New Zealand → Atlas column map |
| [Continuity_Identity_Rules.md](Continuity_Identity_Rules.md) | Namespaces, fingerprint, multi-lineage protocol |
| [Continuity_Acceptance_Examples.md](Continuity_Acceptance_Examples.md) | Twelve worked examples |
| [Continuity_Import.md](Continuity_Import.md) | How to run `import:atlas` for approved packs; `/atlas` SQLite UI; what is skipped |
| [tier-drafts/](tier-drafts/Phase2_Tier_Policy_Application_Report.md) | Prompt E/G packs (Batch A+B + ES/AR approved; 8 still draft; Prompt G: 5,426 clearances; Prompt H: +285 residual clearances; 1,140 residuals still open; Mexico inventory non-executable) |
| [decisions/](decisions/README.md) | Prompt F pack: Mexico withhold-all-67 **accepted** 2026-09-16 (production override still 67); Prompt M 95 sibling withholds accepted 2026-09-17 (docs PR #27 landed; not executable yet); [Batch A](decisions/Batch_A_Tier_Pack_Approvals.md), [Batch B](decisions/Batch_B_Tier_Pack_Approvals.md), and [ES+AR+Andorra](decisions/ES_AR_Andorra_Pack_Approvals.md) packs approved; 8 residual-heavy packs still draft |
| [residuals/](residuals/README.md) | Prompt H pack: 1,425 inventoried; **285 clearances applied** 2026-09-16 (ES+AR); ES/AR packs later approved; 1,140 still open; 1,010 uncertainty-only deferred |
| [closeout/](closeout/Phase2_Residual_Closeout_Report.md) | Prompt I residual closeout pack (**DRAFT**; `applied_changes=0`; 1,140 keep-open/defer; 1,010 uncertainty deferred; no tier JSON rewritten) |
