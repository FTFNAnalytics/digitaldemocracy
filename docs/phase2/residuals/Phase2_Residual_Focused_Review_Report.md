# Phase 2 residual focused-review report — DRAFT

**Later write (2026-09-16):** Justin accepted the 285 `clear_flag` members (H2-01 / H3-01 / H3-02). Those flags are applied; see [Phase2_Residual_Clearance_Application_Report.md](Phase2_Residual_Clearance_Application_Report.md). Keep-open / defer batches and the 1,010 uncertainty-only appendix remain unapplied. Country packs are still not approved.

**Original Prompt H review text follows (inventory snapshot before the 285-row write).** All exact pre-application rows, current rationales at review time, hashed pointers and evidence records are in `residual-open-inventory.json`. Country-pack approval and any optional uncertainty-only edit are separate decisions.

**All 1,425 residual rows were accounted for in this review. The subsequent accepted write rewrote only El Salvador and Argentina clearance rows; no country pack was approved, and the accepted Mexico share override was untouched.**

Baseline main `9065dcdfc0cbc78171dad35b60742ae232b6dd00`; Prompt G `3e92b8b40b472539ba33d1e23f736872b53470aa`; Batch A approval `035f26e427266acc55bbbfec58e45b1661a77b88`. PR #19 now has head `3af7dfa3ce23cc14480bc718e065b265e3a2f10c` with Batch B also approved. The ten residual tier files and all open queue items are identical to G; current PR hashes guard this pack. All twelve approved Batch A/B files are protected. The upstream PR also contains implementation work; it was outside this review and no importer, UI, DDL or VPS work was performed.

## Recommended decisions

| Slice | Rows | Proposed full clearances | Keep open | Defer with reason | Memo |
| --- | --- | --- | --- | --- | --- |
| H1 | 1004 | 0 | 1004 | 0 | H1_haiti.md |
| H2 | 262 | 262 | 0 | 0 | H2_el-salvador.md |
| H3 | 120 | 23 | 12 | 85 | H3_argentina.md |
| H4 | 39 | 0 | 24 | 15 | H4_small.md |

Recommend **285 conditional focused-flag clearances** (El Salvador 262 and Argentina 23), **1,040 keep-open** dispositions and **100 deferrals**. All are proposals pending Justin; applied changes remain empty. El Salvador’s recommendation depends on explicit acceptance of the retained 262-record crosswalk, whose source response was not independently recovered here. Argentina’s 23 proposed clearances address notes that identify outside-window references, not current-office status. No tier correction is proposed.

The separate optional appendix lists **1,010** uncertainty-only changes: Haiti 1,004, Costa Rica one, Ecuador two and Guyana three. Default remains deferred. If only the 285 full clearances were later accepted, human flags would be 1,140 and uncertainty would remain 1,116. If only the optional appendix were accepted, human flags would remain 1,425 and uncertainty would be 106. If both were separately accepted, those counts would be 1,140 and 106. **Actual counts after this task remain 1,425 and 1,116.**

## Current residual counts

| Country | Human review | Tier uncertain | Current file SHA-256 |
| --- | --- | --- | --- |
| antigua-and-barbuda | 1 | 1 | 0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d |
| argentina | 120 | 84 | e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf |
| costa-rica | 4 | 4 | 51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06 |
| ecuador | 2 | 2 | 5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762 |
| el-salvador | 262 | 0 | fb83d13490131fe99bf3da5d1c8e03818125ec4eba3290c362cc2bb535a82906 |
| guyana | 3 | 3 | 739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe |
| haiti | 1004 | 1004 | dd4938cd5fa0abc969d8ae6e57543d617d3157db130778d780c85e1dc90f02ae |
| peru | 11 | 0 | 9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd |
| saint-kitts-and-nevis | 6 | 6 | 6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171 |
| trinidad-and-tobago | 12 | 12 | 905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f |

## Evidence findings and limits

- Haiti has 502 CASEC and 502 ASEC records; the notes expressly call the section identities provisional. There are **zero historical_boundary_binding Haiti residuals**. The 140 retained section-label bridges also leave legal-name review open; 570 legacy section references do not establish automatic one-to-one identity.
- El Salvador’s retained supplementary JSON contains exactly 262 unique predecessor bridges to 44 existing current IDs, with source/page locators, plus 88 explicitly analytical aggregates. Do not turn those aggregates into events. The referenced [UNDP municipal-map PDF](https://www.undp.org/sites/g/files/zskgke326/files/2024-08/pdfmapasocioeconomico13agosto.pdf) was not read: its response hash is absent from the retained archive inventory, and the remote reader rejected its 16,880,092-byte size. This link is a verification target, not evidence of newly checked pages.
- Argentina separates 23 outside-window references from 94 unjoined Entre Ríos records, two older Mi Granja institutions and one ombudsman-cycle question. “Historical” in the derivative is not itself proof of abolition or a changed boundary.
- Guyana’s three exact residual IDs are absent from the retained 21-row name-bridge list. Known PR-component scope is separate from identity and whole-council composition.
- Trinidad/Costa Rica generic ballots remain unknown; island institutions remain other pending disposition. No calendar cohort, arbitrary code prefix or missing source was used to create a tier or office.

## How to review and accept a later change

1. Choose H1–H4 or a named machine batch. H1 has 136 existing-ID-prefix navigation groups; H2 has 44 existing-current-office groups. Neither requires a mass vote.
2. Read the current full classification, exact raw note, source catalogue entries and any supplementary relationship record in `residual-open-inventory.json`. Hashes cover compressed source bytes; JSON pointers address decoded JSON.
3. Record Justin’s decision for exact batch IDs or explicit office lists and accepted evidence limits. Empty applied_changes and null decisions mean no effect.
4. Before a later write, verify file SHA-256, pointer, office ID and every expected original field. Apply only the named flag/rationale changes; tier, office identity, historical status and pack status stay untouched. Stale guards, partial row selection without exact enumeration, or missing source binding fail closed.
5. Refresh review queues and hashes only in that later authorized revision. No approval of Batch A/B, Mexico, a country pack or publication is implied by accepting a residual recommendation.

## Protected approvals and override

| Country | Observed status | Protected SHA-256 |
| --- | --- | --- |
| bahamas | approved | 62abaf50f4c466fd20e029f9fa2822679d9bc4bf3408fd1d28db7d226eefdea0 |
| belize | approved | 3a3debb0eb68bd3e4f76e8e0eb8792163c0996106743d24dbe824f4f4bcbf416 |
| brazil | approved | 66147d032f88cfead40d9b3d340d011f07ad9dcff04e2e35d3d80dbb59c06526 |
| colombia | approved | be19471793216f78b0dca0dd41f6c1083102580b924cba344a911c55491d2b3f |
| cuba | approved | 94de9fd55cfd647aaa3a2d7a1146b796377f4f52baad127d603f7afff48a31ea |
| dominica | approved | b400b4a03bafd305a228f1890132b7d9f2112aeb9bf687ffcf8efa41f496391d |
| dominican-republic | approved | ea2e1bc647bbcafff58aa6f3db249f6d27aa67241df450b3922265b4a55a15ab |
| guatemala | approved | 3f62704e3736df95bba2847fadeab152f2578b1147a11152cf3f52b2b181fd80 |
| jamaica | approved | 45397276058dc52220fc3921d2e2e09f366252317673e11f803e0b7eab818f2c |
| mexico | approved | fc0fc95e1a090992fac40d2852abdb244a05f9ca6b780b96b70efb7730f46483 |
| new-zealand | approved | 35d1e29a5ce88f336f32829b1b83af5643510825025d672c471eed20b893ed57 |
| paraguay | approved | af670652e7c3555f6efb2284683f2428f715cc9961bc14a0c661414a611bf936 |

Accepted Mexico override `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json`: SHA-256 `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9`. Read only for protection hashing, not altered or re-evaluated. Protected DDL and Albania hashes are in `baseline-and-protection.json`.

## Files and validation

`residual-open-inventory.json` contains all 1,425 exact current classifications; `proposed-clearance-batches.json` contains 16 reviewable batches with empty applied changes. The four memos provide row schedules. The optional JSON and Markdown enumerate all 1,010 deferred rows separately. `baseline-and-protection.json` records approvals, source hashes and evidence checks; `validation.json` records coverage/preservation results. `SHA256SUMS` hashes every payload file except itself; external `Phase2_Residual_Review_Pack_DRAFT.sha256` hashes the ZIP, report and manifest to avoid a self-referential digest.

No source response, institutional fact, office, vote, date or tier was invented. Existing product decisions remain intact: /atlas, SQLite master on VPS, Europe-first launch, Russia excluded, facts first and missing ≠ zero. This review does not validate importer/citation/cutover gates or claim continuity publication is unblocked.
