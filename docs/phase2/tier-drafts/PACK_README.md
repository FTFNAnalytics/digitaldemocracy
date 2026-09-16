# Phase 2 continuity tier drafts

**Drafts only for continuity tiers.** Continuity publish remains blocked until tier packs are approved; importer and cutover CI also remain required. Mexico share withhold-all-67 was accepted by Justin on 2026-09-16.

Prompt F decision drafts are checked in under `docs/phase2/decisions/`. Justin accepted Mexico withhold-all-67 on 2026-09-16; the discoverable override is `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json`. `mexico-share-domain-PROPOSED.json` and `mexico-share-domain-DRAFT.json` remain non-executable history. 95 sibling rows still need event-level reconciliation.

Prompt G applied category-policy clearances only (5,426 flags) to the 22 LatAm/NZ files; packs remain **`draft_for_human_review`**. 1,425 residual rows are unchanged; 1,116 `tier_uncertain` flags remain. Batch A hashes are unchanged. No pack approvals. Mexico override untouched. See [Phase2_Tier_Policy_Application_Report.md](Phase2_Tier_Policy_Application_Report.md).

Prepared against merged main `9065dcdfc0cbc78171dad35b60742ae232b6dd00`. This note is the Prompt E review-pack guidance, placed here rather than at the repository root. Checking in drafts does not approve them or authorize ingestion.

All office/event identities use `cdd-observatory-v1`. LatAm files belong only to `latin-america-fe5e91689def`; NZ belongs only to `country-package-new-zealand`. Preserve lineage ownership after Europe re-imports. Europe remains the default landing, Phase 1 stays Albania-only, and no positive regional count is required.

Review vocabulary: `national|regional|municipal|other|unknown`. Future Atlas mapping: national→national_context; regional/municipal/other unchanged; unknown→NULL with unknown review status. Do not copy Albania's older extra `council` vocabulary into these new packs, and do not edit Albania. Keep office_type separate. No calendar cohort, normalized legacy tier or raw tier string is used as the classifier.

Evidence pointers are RFC6901 pointers into decoded JSON. For `.gz` input_path, sha256 hashes the compressed committed bytes, then json_pointer is evaluated on the decompressed object. `objects/<digest>.gz` filenames refer to a decompressed member digest; the evidence sha256 is deliberately the compressed-file digest. Each LatAm row cites its derivative office, linked geography and original office object. Original object files are verified against the manifest member digest/byte count. NZ rows cite existing race records and their explicit authority/district/office_type.

All 18,643 LatAm offices (including 414 historical) and all four NZ office IDs appear exactly once. No files or dummy offices are generated for the 15 status-only countries. Counts count office records, not nonoverlapping electorates, distinct governments, confirmed future ballots or regional-universe coverage.

Every file has status draft_for_human_review. A row with human_review_required=false merely has no special tier question beyond pack approval. Flags mark focused institutional/scope/history review. A known proposed tier can have tier_uncertain=true; do not count it as approved coverage. Historical boundary flags alone do not change an explicit municipal institution to unknown. The 99 generic historical institution rows remain unknown pending evidence.

Open review themes: island institutions; school districts; submunicipal bodies (including populated-centre municipalities and community boards); rural local commissions; Bahamas districts; Guyana PR-component councils; Trinidad corporations; autonomous/federal districts; provincial conventions/audit bodies; historical bindings. The complete office-specific queue is in `docs/phase2/tier-drafts/human-review.json`; its resolved array is empty.

Files:

- `schemas/atlas/tiers/antigua-and-barbuda.json`
- `schemas/atlas/tiers/argentina.json`
- `schemas/atlas/tiers/bahamas.json`
- `schemas/atlas/tiers/belize.json`
- `schemas/atlas/tiers/brazil.json`
- `schemas/atlas/tiers/colombia.json`
- `schemas/atlas/tiers/costa-rica.json`
- `schemas/atlas/tiers/cuba.json`
- `schemas/atlas/tiers/dominica.json`
- `schemas/atlas/tiers/dominican-republic.json`
- `schemas/atlas/tiers/ecuador.json`
- `schemas/atlas/tiers/el-salvador.json`
- `schemas/atlas/tiers/guatemala.json`
- `schemas/atlas/tiers/guyana.json`
- `schemas/atlas/tiers/haiti.json`
- `schemas/atlas/tiers/jamaica.json`
- `schemas/atlas/tiers/mexico.json`
- `schemas/atlas/tiers/paraguay.json`
- `schemas/atlas/tiers/peru.json`
- `schemas/atlas/tiers/saint-kitts-and-nevis.json`
- `schemas/atlas/tiers/trinidad-and-tobago.json`
- `schemas/atlas/tiers/new-zealand.json`

Reports and support:

- `docs/phase2/tier-drafts/Phase2_Tier_Pack_Report.md`
- `docs/phase2/tier-drafts/human-review.json` (continuity fragment only)
- `docs/phase2/tier-drafts/inventory.json`
- `docs/phase2/tier-drafts/Mexico_Share_Domain_Override_Draft.md`
- `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain-DRAFT.json` (non-executable inventory, never an accepted override)
- `docs/phase2/tier-drafts/validation.json`
- Prompt G policy application: `Phase2_Tier_Policy_Application_Report.md`, `policy-application-inventory.json`, `policy-application-validation.json` (drafts only; 5,426 clearances / 1,425 residuals)
- Prompt F pack: `docs/phase2/decisions/` including historical `mexico-share-domain-PROPOSED.json` (`production_accepted=false`)
- Accepted Mexico override: `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` (Justin 2026-09-16 withhold-all-67; `production_accepted=true`)

No importer/UI code, SQLite research load, frozen input edits, tier-pack approvals or public route changes are part of this handoff. Mexico withhold-all-67 is recorded in the accepted override file.
