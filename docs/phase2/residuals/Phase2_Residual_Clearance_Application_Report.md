# Phase 2 residual clearance application report

**Justin accepted all 285 Prompt H conditional residual clearances on 2026-09-16**, including El Salvador’s retained crosswalk evidence caveat (no primary PDF re-verification required). This write applied only the three `clear_flag` batches. Country packs were not approved.

## Counts

| Metric | Value |
| --- | ---: |
| Residual rows inventoried (Prompt H) | 1,425 |
| Clearances applied | **285** |
| Residuals still open | **1,140** |
| Uncertainty-only proposals (still deferred) | 1,010 |
| `tier_uncertain` remaining | 1,116 |
| Pack approvals | 0 |
| Tier value changes | 0 |
| Classification files rewritten | 2 (`el-salvador.json`, `argentina.json`) |

### Applied by batch

| Batch | Country | Applied | Pack status after write |
| --- | --- | ---: | --- |
| H2-01 | el-salvador | 262 | `draft_for_human_review` |
| H3-01 | argentina | 19 | `draft_for_human_review` |
| H3-02 | argentina | 4 | `draft_for_human_review` |

Keep-open / defer-with-reason batches were not applied.

## File hashes

| Path | SHA-256 |
| --- | --- |
| `schemas/atlas/tiers/el-salvador.json` (post) | `40f5b3ee3579072dd30749900b076619a1557f5e5233435c35bf651b151a107d` |
| `schemas/atlas/tiers/argentina.json` (post) | `9bbb8b088dbbc094cf6a657bd280038d817e8e5d3c2d3803d8f0e303d0b945fb` |
| Mexico override (unchanged) | `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9` |

El Salvador remaining `human_review_required=true`: 0. Argentina remaining: 97. Both files remain `draft_for_human_review`.

## Procedure

Fail-closed per member in `proposed-clearance-batches.json`: resolve `classification_json_pointer`, require `expected_original` match on office_id / tier / human_review_required / tier_uncertain / rationale / evidence, then set `human_review_required` to `replacement` (false) and `rationale` to `replacement_after_acceptance`. All 285 members matched; none were skipped.

Human-review queue: 285 items moved from open to `resolved_by_prompt_h_focused_review` with `pack_approved=false`. Open queue is 1,140.

## El Salvador caveat

Justin accepted the retained 262-record predecessor-to-current crosswalk as sufficient evidence for H2-01. Primary UNDP municipal-map PDF pages were not re-verified. Historical IDs, current IDs, events, and municipal tier values are unchanged.

## Not applied

Optional 1,010 uncertainty-only rows remain deferred. Haiti 1,004 keep-open. No Batch A/B or Mexico override bytes were rewritten.
