# Bulgaria handoff summary — Prompt P

Justin accepted the 530 municipality-wide rows on 2026-09-19 and held the 3,067 district/village rows. Main pin at review `00c2ea7458ad7705aad487c4a7665d9d343b5554`; package baseline remains immutable PR #16 `de3541276cd37ca749b740c229cee67475f0d317`. Importer / SQLite / VPS / UI are still not run.

| Supplied office type | Count | Proposed tier | Justin 2026-09-19 | Production import |
| --- | ---: | --- | --- | --- |
| Mayor |265|municipal|**Accepted** (`human_review_required: false`)|Yes|
| Municipal council |265|municipal|**Accepted** (`human_review_required: false`)|Yes|
| District mayor |35|municipal|**HOLD** (`human_review_required: true`, `review_category: submunicipal_scope`)|No|
| Village mayor |3032|municipal|**HOLD** (`human_review_required: true`, `review_category: submunicipal_scope`)|No|
| **Total** |**3597**|**3597 municipal /0 regional**|**530 accepted / 3067 held**|**530 only**|

No regional institution is evidenced in the register. Calendar “Regional / municipal” never classifies. District/village rows retain explicit uncertainty; Justin held the category policy and did not invent a regional layer. The 2023 roster does not certify 2027 eligibility. No extra mayor rows or offices were invented. Future importer loads only the 530 accepted municipality-wide rows unless policy changes.

The frozen validator passes **3597 offices, 8661 histories, 3617 payload files**. All 48 XZ chunks match manifest SHA/length and pinned Git blobs. O/J register rows are identical; companion H and standalone IX contain the same 8661 histories and all shared fields reconcile. **25817** detailed-return rows bind those histories once. There is no master history table.

**7746 first-round** and **2591 unresolved-history** rows remain lossless retained input, indexed by exact row/source locators; no extra typed completed events/results/proceedings. The six 2015 first-round rows for **BG-SLV11-b88d0d4475-V (Градец)** and two unresolved runoff rows retain the qualification-change hold. Missing withdrawal/correction/decision evidence is not invented.

Other open work: archived CIK pages, older histories, decisive outcomes, original certificates, final 2027 village eligibility and announcements after the 28 August replacement-register snapshot. Percentage-only **587 result rows /221 events** retain shares and missing votes; no reconstructed counts. Pending next dates remain NULL for all 3597 offices: no prospective event and an honest empty regional calendar. Control/poll absence is not zero risk.

Geography name/type keys would collide across 630 offices in 272 groups. The country-specific office-ID key prevents mergers, including the two Абланица village offices **BG-BLG52-fc5837f6a1-V** and **BG-PAZ08-fc5837f6a1-V**. All collision groups and complete identity vectors are supplied.

Deliverables: 223-column Field Map; Identity Rules; 17 Acceptance Examples; complete input/identity JSON; Done/Not-run checklist; validation and SHA256SUMS. Accepted-with-hold tier SHA `9a6718fe301f440511cc9e9f9b4139b3a1e0332ef2e3e6c9b3063f67f04652ab` (predecessor draft `cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0`); register SHA `00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559` (1,309,333 bytes).

- [x] Justin accepts the municipality-wide tier proposals.
- [ ] Justin accepts/amends the district/village category policy and draft pack. **HOLD.**
- [ ] Justin accepts the identity/stage projection contract for future implementation.

**Importer / SQLite / VPS / UI = Not run; applied_changes=0.** No DDL, Mexico/LatAm/NZ, redirect or frozen research edits. Research remains partial.
