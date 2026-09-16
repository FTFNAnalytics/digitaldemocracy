# Phase 2 residual closeout report — DRAFT

**DRAFT — pending Justin; applied_changes=0. No tier JSON bytes rewritten.** Every row remains open. Exact current rationales, flags, categories, source notes and evidence locators are preserved in `residual-open-inventory.json`.

**Closeout documentation is complete; the research holds remain open.** No full flag clearance or tier correction is proposed in Prompt I. There are exactly **1,140** open residuals and **1,116** uncertain tiers, with **1,010** optional taxonomy-only edits still deferred.

Inspected main `9065dcdfc0cbc78171dad35b60742ae232b6dd00` and PR #19 head `844d578ec98c446d7df9b97e353b081be86f74d5`. The current head is the Justin-accepted H application commit. All 285 H rows are verified cleared and excluded: El Salvador 262, Argentina 23. Justin accepted the El Salvador retained-crosswalk evidence limit, so no further primary PDF check is made a condition of those completed clearances.

Twelve Batch A/B continuity packs are approved and protected. El Salvador and Argentina remain draft at this inspected head; El Salvador has zero focused flags, Argentina 97. Approval of either pack is outside this prompt. Nine countries still have open residual rows. No tier JSON bytes, pack statuses, Mexico override, frozen research, DDL, importer, UI or VPS state were rewritten.

## Current decisions by slice

| Slice | Rows | Keep open | Defer with reason | New full clearances |
| --- | --- | --- | --- | --- |
| I1 | 1004 | 1004 | 0 | 0 |
| I2 | 97 | 12 | 85 | 0 |
| I3 | 39 | 24 | 15 | 0 |

The 13 primary batches contain exact current row guards and `proposed_changes: []`: 1,040 keep-open and 100 defer-with-reason. I4’s four optional subsets contain the separately guarded 1,010 uncertainty/rationale proposals, default defer. Empty applied_changes is preserved everywhere.

## Exact residual inventory

| Country | Open rows | Tier uncertain | Current tier-file SHA-256 |
| --- | --- | --- | --- |
| haiti | 1004 | 1004 | dd4938cd5fa0abc969d8ae6e57543d617d3157db130778d780c85e1dc90f02ae |
| argentina | 97 | 84 | 9bbb8b088dbbc094cf6a657bd280038d817e8e5d3c2d3803d8f0e303d0b945fb |
| trinidad-and-tobago | 12 | 12 | 905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f |
| peru | 11 | 0 | 9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd |
| saint-kitts-and-nevis | 6 | 6 | 6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171 |
| costa-rica | 4 | 4 | 51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06 |
| guyana | 3 | 3 | 739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe |
| ecuador | 2 | 2 | 5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762 |
| antigua-and-barbuda | 1 | 1 | 0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d |

## Haiti first

The 1,004 supplied offices form 502 CASEC/ASEC ID pairs across 136 existing-prefix navigation groups. These are review aids, not certified legal sections or new parent identities. The frozen notes state that the registration-centre-derived labels are provisional and may be incomplete. The retained supplement has 140 exact office-specific variant bridges spanning 70 pairs and 570 separate legacy section references. Variant-bridge notes themselves retain legal-name review. No automatic ordinal/name join to the legacy register was made.

Haiti has **zero historical_boundary_binding residuals**. Preserve the actual submunicipal_scope/provisional_section_identity categories rather than inventing a third category. The I1 memo gives the source-code/register evidence needed for each eventual named clearance; I4 never closes identity holds.

## Argentina and smaller sets

The 97 Argentina rows are 84 unjoined Local vocales, ten known mayor/council identities with unresolved roster joins, two older Mi Granja institutions and one separate ombudsman-cycle question. No new source resolves those bindings in this task. The accepted 23 outside-window H rows are absent from the proposal set.

The 39 smaller residuals retain exact known/unknown tiers and their source-specific questions. Guyana’s three IDs have no exact entry in its retained 21 name bridges; Peru and Costa Rica have unlinked historical codes; Ecuador retains parish/predecessor distinctions; Nevis and Barbuda need distinct institutional dispositions. No tier correction or new institution is invented.

## Evidence and acceptance limits

This is a pinned-source closeout review, not fresh primary-source certification. Frozen note text, source catalogue projections, source hashes and JSON pointers are retained and checked. No legal instrument, official section register or new institutional fact was independently certified. That is why no additional full clearance is proposed. Missing evidence stays missing; no values or identifiers are filled.

For a later action, Justin must name a batch/subset or exact office list. Recheck the current whole-file SHA, classification pointer, office ID and full original row; fail closed on any mismatch. Preserve every remaining identity hold, office ID, proposed tier, source status and country-pack status unless a later instruction explicitly names a permitted change. Any source research result needs its own retained evidence locator before a new clearance proposal.

## Protected country packs

| Country | Observed status | Open flags | SHA-256 |
| --- | --- | --- | --- |
| antigua-and-barbuda | draft_for_human_review | 1 | 0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d |
| argentina | draft_for_human_review | 97 | 9bbb8b088dbbc094cf6a657bd280038d817e8e5d3c2d3803d8f0e303d0b945fb |
| bahamas | approved | 0 | 62abaf50f4c466fd20e029f9fa2822679d9bc4bf3408fd1d28db7d226eefdea0 |
| belize | approved | 0 | 3a3debb0eb68bd3e4f76e8e0eb8792163c0996106743d24dbe824f4f4bcbf416 |
| brazil | approved | 0 | 66147d032f88cfead40d9b3d340d011f07ad9dcff04e2e35d3d80dbb59c06526 |
| colombia | approved | 0 | be19471793216f78b0dca0dd41f6c1083102580b924cba344a911c55491d2b3f |
| costa-rica | draft_for_human_review | 4 | 51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06 |
| cuba | approved | 0 | 94de9fd55cfd647aaa3a2d7a1146b796377f4f52baad127d603f7afff48a31ea |
| dominica | approved | 0 | b400b4a03bafd305a228f1890132b7d9f2112aeb9bf687ffcf8efa41f496391d |
| dominican-republic | approved | 0 | ea2e1bc647bbcafff58aa6f3db249f6d27aa67241df450b3922265b4a55a15ab |
| ecuador | draft_for_human_review | 2 | 5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762 |
| el-salvador | draft_for_human_review | 0 | 40f5b3ee3579072dd30749900b076619a1557f5e5233435c35bf651b151a107d |
| guatemala | approved | 0 | 3f62704e3736df95bba2847fadeab152f2578b1147a11152cf3f52b2b181fd80 |
| guyana | draft_for_human_review | 3 | 739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe |
| haiti | draft_for_human_review | 1004 | dd4938cd5fa0abc969d8ae6e57543d617d3157db130778d780c85e1dc90f02ae |
| jamaica | approved | 0 | 45397276058dc52220fc3921d2e2e09f366252317673e11f803e0b7eab818f2c |
| mexico | approved | 0 | fc0fc95e1a090992fac40d2852abdb244a05f9ca6b780b96b70efb7730f46483 |
| new-zealand | approved | 0 | 35d1e29a5ce88f336f32829b1b83af5643510825025d672c471eed20b893ed57 |
| paraguay | approved | 0 | af670652e7c3555f6efb2284683f2428f715cc9961bc14a0c661414a611bf936 |
| peru | draft_for_human_review | 11 | 9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd |
| saint-kitts-and-nevis | draft_for_human_review | 6 | 6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171 |
| trinidad-and-tobago | draft_for_human_review | 12 | 905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f |

Accepted Mexico override SHA-256: `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9`. It was hashed only for preservation, not edited or reconsidered. `baseline-and-protection.json` also records all tier/DDL/override protection hashes and the accepted H record.

## Deliverables and verification

- `residual-open-inventory.json`: exactly 1,140 open rows, current full classifications/rationales/categories, source evidence and rebased pointers.
- `proposed-clearance-batches.json`: 13 pending keep-open/defer batches plus four optional I4 subsets; applied_changes=[].
- `I1_haiti.md`, `I2_argentina.md`, `I3_small.md`, `I4_optional_uncertainty.md`: evidence needs and exact row schedules.
- `haiti-identity-review-groups.json`: 502 existing-ID pairs with exact variant-bridge locators.
- `deferred-uncertainty-only-1010.json`: complete optional list, still deferred.
- `baseline-and-protection.json` and `validation.json`: input pins, unchanged-byte evidence and checks; validation applied_changes=0.
- `SHA256SUMS`: every payload file except the manifest itself. The external `.sha256` receipt hashes the ZIP, report and manifest, avoiding a self-referential checksum.

Validation covers exact open-ID equality, exclusion of all 285 accepted rows, current classification hashes and values, evidence pointers, optional-row coverage/disjointness, source bytes, protected approvals/override and unchanged git worktree. No importer/SQLite/UI/VPS or publication/cutover tests were run. This pack does not claim continuity publication is unblocked. Locked decisions remain /atlas, SQLite on VPS, Europe first, Russia excluded and facts first / missing ≠ zero.
