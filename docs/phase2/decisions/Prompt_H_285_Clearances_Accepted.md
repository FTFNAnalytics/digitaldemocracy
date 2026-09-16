# Prompt H — 285 residual clearances accepted

**Justin accepted all 285 Prompt H conditional residual clearances on 2026-09-16**, including El Salvador’s retained crosswalk evidence caveat. No primary UNDP municipal-map PDF re-verification is required.

This records focused-flag clearances only. It does **not** approve any residual-heavy country pack. El Salvador, Argentina, Haiti and the other eight residual-heavy files stay `draft_for_human_review`. Batch A/B (12 approved packs) and the accepted Mexico share override were not rewritten. Optional 1,010 uncertainty-only proposals remain deferred.

## Accepted batches

| Batch | Country | Rows | Action | Evidence limit |
| --- | --- | ---: | --- | --- |
| H2-01 | el-salvador | 262 | clear `human_review_required` | Retained predecessor-to-current crosswalk accepted as sufficient; not certification of unchanged boundaries or merged office IDs |
| H3-01 | argentina | 19 | clear `human_review_required` | Outside-window Santa Fe mayor notes; frozen reference status retained |
| H3-02 | argentina | 4 | clear `human_review_required` | Outside-window Córdoba shared-ballot / tribunal notes; shared-ballot separation retained |
| **Total** | | **285** | | |

Keep-open and defer-with-reason batches (Haiti 1,004; remaining Argentina 97; H4 small packs) were **not** accepted here.

## What changed

Each of the 285 classification rows had `human_review_required` flipped `true` → `false` and `rationale` replaced with the batch `replacement_after_acceptance` text. `office_id`, `tier`, `tier_uncertain`, `evidence`, pack `status`, and `source_inputs` were not edited.

| File | Pre-application SHA-256 | Post-application SHA-256 | Pack status |
| --- | --- | --- | --- |
| `schemas/atlas/tiers/el-salvador.json` | `fb83d13490131fe99bf3da5d1c8e03818125ec4eba3290c362cc2bb535a82906` | `40f5b3ee3579072dd30749900b076619a1557f5e5233435c35bf651b151a107d` | still `draft_for_human_review` |
| `schemas/atlas/tiers/argentina.json` | `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf` | `9bbb8b088dbbc094cf6a657bd280038d817e8e5d3c2d3803d8f0e303d0b945fb` | still `draft_for_human_review` |

After this write: 1,140 residual human-review flags remain (1,425 − 285). El Salvador focused flags are 0; Argentina focused flags are 97. `tier_uncertain` remains 1,116.

## El Salvador crosswalk caveat

H2-01’s recommendation depended on explicit acceptance of the retained 262-record predecessor crosswalk. The UNDP municipal-map PDF was not independently re-read in Prompt H (response hash absent from the retained archive; remote file exceeded the reader size limit). **Justin accepted that derivative-evidence limit.** The clearance does not certify unchanged legal boundaries, convert historical offices to current, or merge predecessor IDs into the 44 current municipal offices.

## Still not done

- No residual-heavy pack approval (10 packs remain draft, including zero-flag El Salvador).
- No optional 1,010 uncertainty-only edits.
- Haiti 1,004 keep-open.
- Mexico share override untouched (`5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9`).
- No VPS deploy, merge, or continuity publication/cutover.

See [../residuals/Phase2_Residual_Clearance_Application_Report.md](../residuals/Phase2_Residual_Clearance_Application_Report.md) for the write-out counts.
