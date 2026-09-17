# Mexico 95-sibling event-level reconciliation — DRAFT

**Recommendation: withhold the resolved share bundle for all 95 listed siblings, subject to Justin's acceptance.** Preserve the accepted 67 withholds and all 162 result identities. No numeric replacement is proposed. All 27 event denominator/basis/completeness conflicts remain open even if these new bundles are accepted.

Pinned current main: **`6e6426fe17f6f542b58b68f8607124e007b852ff`**, repository `FTFNAnalytics/digitaldemocracy`, inspected 2026-09-17. Main was pinned through GitHub's commit/tree API; every materialized governing/source file was verified against that immutable tree's Git blob SHA. The plan is byte-identical to the already-read governing plan. Main includes the current Continuity_Import.md; older Prompt C/D/F status prose is historical where it conflicts with the live accepted override. No locked product decisions reopened.

Live predecessor `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` hashes to **`5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9`**, exactly the requested baseline. Its production_accepted/executable_override flags are true, disposition withhold_all_67; its 201 scalar changes remain untouched. Approved Mexico tier file SHA `fc0fc95e1a090992fac40d2852abdb244a05f9ca6b780b96b70efb7730f46483` also remains untouched. This task changes no repository files, frozen research, tiers, DDL, importer, UI or VPS state and grants no residual-pack approval.

“Current” below means the frozen derivative as projected by pinned main plus the accepted 67-row override. The 95 targets are disjoint from all predecessor targets, so their recorded share/evidence values are unchanged under that baseline. **No live VPS/database read or importer execution was performed.** Any later application must recheck actual staged guards and release inputs.

## Inventory and dispositions

| Reconciled inventory | Count |
| --- | ---: |
| Named event groups MX-G01…MX-G27 | 27 |
| Existing accepted withhold rows / scalars | 67 / 201 |
| Unique unchanged sibling rows | 95 |
| Total supplied result rows in these events | 162 |
| Groups with siblings | 26 |
| Group without siblings | MX-G11: all 7 rows already withheld |
| New proposed sibling bundles / scalar changes | 95 / 285 |
| Proposed keep-as-is / numeric replacements | 0 / 0 |
| Applied changes in this task | 0 |
| Event conflicts remaining open after proposed withholding | 27 |

All 95 sibling shares are positive, in percent_0_100, share_status=recorded and evidence_status=recorded. They range from 1.3266509 to 92.4072984. Votes remain the supplied positive recorded counts. All 95 seat values are NULL/status=unknown; no seats or votes are filled with zero. This inventory is not evidence that the candidate list is complete or the vote totals certified.

## What the arithmetic establishes—and what remains unresolved

For **every sibling**, supplied share equals `100 × supplied votes / supplied total_ballots` within 4.954717525151864e-08 percentage points (the stored rounding envelope). It is the **same denominator relationship** as the already-withheld exception rows. The lower candidate numerator merely keeps these 95 values within the 0–100 domain; it does not establish a different, validated denominator.

For every one of the 27 events, candidate vote sum equals supplied valid_votes, exceeds supplied total_ballots, and `_vote_ok=false`. All 162 raw alternate shares exactly match `100 × supplied votes / supplied valid_votes`; each full raw alternate vector sums to 100 within binary64 tolerance. Those are credible percentage-scale calculations, not established official percentages and not evidence of basis points. Their numerical coherence does not independently authenticate the denominator, territorial extent, candidate aggregation or event completeness. No raw alternate is selected, recomputed into production, or relabelled as certified.

After the accepted 67 withholds, the remaining sibling percentages alone still sum above 100 in **15 groups**. In the other 11 sibling-bearing groups, a sum below 100 does not validate the denominator or turn an incomplete vector into a complete one. MX-G11 has no remaining numeric shares: its zero **sum of an empty numeric set** is not an observed zero-percentage vector and does not close its research conflict. No row is dropped.

The normalized ballotBasis is candidate_marks for all 27 groups. The raw basis is “Valid candidate/list votes; largest reported territorial segment when multiple segments exist,” source_distribution=“Por Candidaturas,” with segments=1. Pinned `scripts/import/normalize.ts` lines 461–477 match the word “multiple” in that contextual phrase and prefer reported_share over raw.share. That heuristic does not independently prove a multiple-vote ballot. Candidate-mark systems can legitimately have more marks than voters; therefore **a sum above 100 alone is not a universal legal invalidity test**. Here the source basis, two denominator conventions and failed source check are unresolved. Neither candidate_marks nor valid_votes is newly accepted as the reconciled electoral basis by this pack.

The supplied total_check, null_votes and unregistered_votes are retained in each group table. total_check is source diagnostic context, not a separately certified total. Missing null/unregistered counts remain NULL, never substituted with zero to force an equation. Votes remain unchanged and visible only with the existing incomplete/conflicted provenance; leaving them untouched does not certify them. Share-only withholding is a reversible uncertainty disposition, not proof that the whole election is reconciled.

## Evidence, exact locators and limits

Every JSON pointer below addresses **decoded JSON**. sha256 always authenticates the original compressed file bytes, not reserialized/decoded JSON. Use the following aliases only for readability; the inventory and proposed changes contain full paths/hashes for every occurrence.

| Alias | Exact input path | SHA-256 |
| --- | --- | --- |
| A: accepted override | data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json | `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9` |
| D: normalized Mexico derivative | data/research/countries/mexico.json.gz | `a8080cf83f12ede942158d0457f91074a61ab4311e96074fa4bd713eadae5b9e` |
| O: original retained country object | data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz | `4a2850e4a22bbd997716b43b56e487950048816cb112b4d2806265f0e0a45c2a` |

All four cited source_inputs in A were verified. Each D event/result, O history/party, full event/office/HK/result key and A membership pointer was reconciled, without rebuilding IDs. O is retained original country research, not an independently obtained INE response. The catalogue has 27 existing source IDs, API request objects and response-file hashes; the claimed response hashes are absent from the retained archive inventory. They remain source metadata, not falsely verified recovered response bytes. Existing source IDs/FKs resolve to real catalogue rows; they are never remapped from opaque API keys. Full request dictionaries and source catalogue pointers appear in Mexico_Sibling_Inventory.json.

There is **no hard identity/hash conflict** with the accepted predecessor. No superseding change to its 67 bundles is warranted. The new sibling proposals have supersedes_change_id=NULL and identity_binding=NULL because they are disjoint additive targets. No primary response, certified return, recount or catalogue mapping was newly obtained in this task; source references support preserving the conflict and proposed withholding, not a numeric correction.

## Primary evidence required before numeric reconciliation

Each named group requires an evidence packet bound to its existing office/event/HK and exact frozen source request:

1. Recover the original response bytes matching that group's catalogue response hash, or a clearly versioned new primary response with retrieval time, full request and an explicit comparison to the frozen claim. A country derivative alone cannot stand in for those bytes.
2. Obtain primary catalogue documentation or an official response that binds the opaque gIdCatCargo/gIdCatEdo/gIdCatmunicipio/ambito keys to the correct 2018 municipal contest and territorial scope. Preserve existing Atlas IDs; do not infer API geography from the office's “14” prefix or silently rewrite gIdCatEdo=16.
3. Obtain the complete official candidate/coalition distribution and its legally defined vote/mark/ballot denominator, geographic aggregation and segment selection. Reconcile candidate votes, valid votes, ballots, null/unregistered categories, duplicate coalition votes, missing candidates and rounding under that documented convention.
4. Check certification, supplementary election/recount/court modifications and event sequence with dated primary locators. Preserve separate contests and narrower/wider territories; do not merge them by year or candidate label.
5. Produce a full 162-row/group-scoped comparison identifying every discrepancy and every retained missing value. A whole-event percentage vector can be called reconciled only after its basis, scope, complete roster and applicable totals are evidenced, competing claims are resolved explicitly, and Justin accepts the exact guarded corrections. Restoring any of the original 67 withheld shares needs an explicit superseding proposal with original claims retained. No such restoration is proposed here.

## Amendment and acceptance contract

[mexico-sibling-reconciliation-PROPOSED.json](mexico-sibling-reconciliation-PROPOSED.json) is atlas-override/1, **production_accepted=false**, **executable_override=false**, status DRAFT_FOR_JUSTIN_ACCEPTANCE. It stays under docs/phase2/decisions, outside production override discovery. It pins A's full SHA as a mandatory unchanged predecessor. Each of the 95 full-PK targets has exactly this indivisible bundle:

| Field | Exact original guard | Proposed replacement | Decision |
| --- | --- | --- | --- |
| share | Per-row supplied numeric value listed below | NULL | withhold |
| share_status | recorded | unknown | withhold |
| evidence_status | recorded | disputed | withhold |

All 12 change-object keys follow Prompt C/D: change_id, target_table, full target_key, field, expected_original, replacement, decision, reason, origin, claims[], supersedes_change_id, identity_binding. Full target_key is exactly `(id_namespace,office_id,history_key,result_row_id)`; event_id is separately cross-checked. Each change retains seven sourced claims: supplied share, unaccepted raw alternate, valid_votes, total_ballots, candidate votes, failed vote check and raw basis. Numeric claim certainty is NULL. No arbitrary source FK, invented certified total, unit change, vote/seat change or silent NULL coercion.

Justin may accept or reject each named group; accepting a group selects exactly its listed bundles. All boxes default unchecked. An unaccepted group has no effect. A future row-level exception must name whole bundle IDs explicitly; partial one/two-field application is prohibited. Validate original guards against the staged effective state after preserving A, then validate all selected bundles and source FKs before any lineage publication. Existing 67 targets must remain NULL/unknown/disputed. If all 95 are accepted, the affected events have 162 explicitly withheld shares and 486 total scalar dispositions including the predecessor; **they still are not numerically reconciled**.

The 27 event conflicts are retained as proposal/inventory research-review metadata. **No event-table scalar changes are proposed.** There is no invented event-conflict DDL column, certification status or unresolved source FK. After acceptance, retained override provenance and evidence_link claim_kind=override can attach the documented conflict to actual event/result locators under the governing contract. A missing primary response is a research/recovery gap, distinct from an unmatched citation token; the existing catalogue source is real. Unmatched future tokens use explicit unresolved_evidence; a known source missing from staging fails FK validation.

**Implementation boundary:** pinned `lib/atlas/continuity/latam.ts` discovers one accepted Mexico file and requires exactly 201 applied scalar changes. This draft cannot be dropped into that path or automatically executed. Future separately authorized implementation must support a hash-pinned additive accepted amendment (preferred, preserving A byte-for-byte), or a separately reviewed versioned composite preserving A's full audit/claims. Full-PK guards, indivisible bundles and acceptance filtering require verification; the current hard-coded loop alone does not establish them. No importer edits were made here. An accepted amendment changes only the LatAm effective-input fingerprint/release; new attempts remain distinct from release IDs, and unrelated Europe/NZ release selections/citations must remain intact.

## Group summary

“Siblings sum” is the arithmetic sum of currently nonwithheld supplied shares, not a reconciled event percentage. Full event vectors retain all source rows in inventory; no rows are dropped for passing/failing the percent domain.

| Group / office | Existing withheld / siblings / total | Candidate sum = supplied valid | Supplied ballots | Siblings sum | Proposed action |
| --- | --- | ---: | ---: | ---: | --- |
| MX-G01 / MX-M-14-8 | 2 / 5 / 7 | 32020 | 4855 | 77.6107106 | Withhold listed siblings |
| MX-G02 / MX-M-14-13 | 4 / 2 / 6 | 25723 | 3364 | 132.6991676 | Withhold listed siblings |
| MX-G03 / MX-M-14-16 | 2 / 3 / 5 | 17180 | 4561 | 91.0765184 | Withhold listed siblings |
| MX-G04 / MX-M-14-21 | 2 / 4 / 6 | 8707 | 1699 | 163.6256622 | Withhold listed siblings |
| MX-G05 / MX-M-14-31 | 2 / 5 / 7 | 23121 | 6330 | 150.742496 | Withhold listed siblings |
| MX-G06 / MX-M-14-28 | 2 / 2 / 4 | 10032 | 3561 | 45.9702331 | Withhold listed siblings |
| MX-G07 / MX-M-14-30 | 2 / 2 / 4 | 9201 | 1494 | 81.8607765 | Withhold listed siblings |
| MX-G08 / MX-M-14-9 | 2 / 4 / 6 | 9143 | 2294 | 162.9468179 | Withhold listed siblings |
| MX-G09 / MX-M-14-39 | 1 / 4 / 5 | 9686 | 3013 | 162.2635247 | Withhold listed siblings |
| MX-G10 / MX-M-14-72 | 4 / 1 / 5 | 60973 | 1279 | 52.0719312 | Withhold listed siblings |
| MX-G11 / MX-M-14-41 | 7 / 0 / 7 | 751471 | 2538 | 0 | No new scalars; keep conflict open |
| MX-G12 / MX-M-14-46 | 2 / 3 / 5 | 17227 | 4609 | 77.9561727 | Withhold listed siblings |
| MX-G13 / MX-M-14-45 | 2 / 2 / 4 | 11498 | 3392 | 37.735849 | Withhold listed siblings |
| MX-G14 / MX-M-14-55 | 3 / 4 / 7 | 65554 | 3155 | 90.0792393 | Withhold listed siblings |
| MX-G15 / MX-M-14-60 | 3 / 3 / 6 | 7169 | 1393 | 68.700646 | Withhold listed siblings |
| MX-G16 / MX-M-14-61 | 1 / 5 / 6 | 7302 | 2483 | 163.7535239 | Withhold listed siblings |
| MX-G17 / MX-M-14-65 | 3 / 5 / 8 | 42063 | 7041 | 105.9934669 | Withhold listed siblings |
| MX-G18 / MX-M-14-66 | 1 / 3 / 4 | 12843 | 2343 | 232.223645 | Withhold listed siblings |
| MX-G19 / MX-M-14-69 | 3 / 9 / 12 | 104161 | 6073 | 260.4149514 | Withhold listed siblings |
| MX-G20 / MX-M-14-75 | 5 / 1 / 6 | 27770 | 1991 | 39.9296836 | Withhold listed siblings |
| MX-G21 / MX-M-14-79 | 3 / 2 / 5 | 13880 | 1820 | 78.9560439 | Withhold listed siblings |
| MX-G22 / MX-M-14-99 | 4 / 4 / 8 | 247717 | 14582 | 183.8910986 | Withhold listed siblings |
| MX-G23 / MX-M-14-84 | 2 / 4 / 6 | 29787 | 8006 | 122.8703472 | Withhold listed siblings |
| MX-G24 / MX-M-14-92 | 1 / 4 / 5 | 15269 | 6142 | 146.4669489 | Withhold listed siblings |
| MX-G25 / MX-M-14-94 | 2 / 6 / 8 | 60294 | 17160 | 123.5897436 | Withhold listed siblings |
| MX-G26 / MX-M-14-70 | 1 / 3 / 4 | 6168 | 2287 | 149.3659816 | Withhold listed siblings |
| MX-G27 / MX-M-14-124 | 1 / 5 / 6 | 25841 | 7637 | 160.874689 | Withhold listed siblings |

## Exact group decisions and sibling rows

Every table row below is explicitly a member of A.unchanged_sibling_result_ids; full membership pointers are in inventory. Votes/seats/statuses are current, not proposed replacements. Raw alternate is unaccepted. The group header supplies the exact office, event and HK for every listed row. Current share_status and evidence_status are both recorded throughout. Bundle IDs and all three change IDs are enumerated in the proposed JSON.

### MX-G01 — ARANDAS — Municipal government

- office_id: `MX-M-14-8`; event_id: `event-c53481f1c2af40473903c6dd`
- history_key: `MX-M-14-8|mx_returns_AYUN_14_8_2018||1166`; id_namespace: `cdd-observatory-v1`
- D event `/events/3018`; O history `/histories/1166`; A group `/groups/0`
- Geography `ARANDAS / JALISCO` at D `/geographies/319`; source `mexico--S1eff289274` at D `/sources/1167`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `1eff289274324133de876ac94c81b5d1c3141e2fd5654b5f07a2569dd801a57f` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":938}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 32020 / 32020 |
| total_ballots / total_check | 4855 / 27273 |
| null_votes / unregistered_votes | 108 / NULL (missing) |
| valid_votes ÷ total_ballots | 6.595262615859938 |
| Full supplied share sum / raw alternate sum | 659.5262616 / 100.0 |
| Existing withheld / siblings remaining | 2 / 5 |
| Remaining sibling share sum | 77.6107106 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 5 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-c53481f1c2af40473903c6dd-r2` / PT_MORENA_ES | 38.722966 / recorded / recorded | 1880 / recorded; NULL / unknown | 38.722966 / 5.871330418488444 | `/events/3018/resultRows/2` / `/histories/1166/parties/2` |
| `event-c53481f1c2af40473903c6dd-r3` / CAND_IND36 | 16.807415 / recorded / recorded | 816 / recorded; NULL / unknown | 16.807415 / 2.54840724547158 | `/events/3018/resultRows/3` / `/histories/1166/parties/3` |
| `event-c53481f1c2af40473903c6dd-r4` / PANAL | 9.5777549 / recorded / recorded | 465 / recorded; NULL / unknown | 9.5777549 / 1.4522173641474079 | `/events/3018/resultRows/4` / `/histories/1166/parties/4` |
| `event-c53481f1c2af40473903c6dd-r5` / PVEM | 6.5293512 / recorded / recorded | 317 / recorded; NULL / unknown | 6.5293512 / 0.9900062460961899 | `/events/3018/resultRows/5` / `/histories/1166/parties/5` |
| `event-c53481f1c2af40473903c6dd-r6` / CAND_IND35 | 5.9732235 / recorded / recorded | 290 / recorded; NULL / unknown | 5.9732235 / 0.905683947532792 | `/events/3018/resultRows/6` / `/histories/1166/parties/6` |

Justin decision — exact group scope: 5 bundles / 15 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G01
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G02 — ATOTONILCO EL ALTO — Municipal government

- office_id: `MX-M-14-13`; event_id: `event-298a2c0f453cc4423e10d6d9`
- history_key: `MX-M-14-13|mx_returns_AYUN_14_13_2018||1170`; id_namespace: `cdd-observatory-v1`
- D event `/events/3022`; O history `/histories/1170`; A group `/groups/1`
- Geography `ATOTONILCO EL ALTO / JALISCO` at D `/geographies/324`; source `mexico--Sf5c54791b3` at D `/sources/1171`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `f5c54791b37862286a758eea8ba089b22ce14bc6c6e6438e7f73b41163c89968` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":943}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 25723 / 25723 |
| total_ballots / total_check | 3364 / 22464 |
| null_votes / unregistered_votes | 105 / NULL (missing) |
| valid_votes ÷ total_ballots | 7.646551724137931 |
| Full supplied share sum / raw alternate sum | 764.6551723 / 100.0 |
| Existing withheld / siblings remaining | 4 / 2 |
| Remaining sibling share sum | 132.6991676 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 2 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 4 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-298a2c0f453cc4423e10d6d9-r4` / PVEM | 75.980975 / recorded / recorded | 2556 / recorded; NULL / unknown | 75.980975 / 9.93663258562376 | `/events/3022/resultRows/4` / `/histories/1170/parties/4` |
| `event-298a2c0f453cc4423e10d6d9-r5` / CAND_IND6 | 56.7181926 / recorded / recorded | 1908 / recorded; NULL / unknown | 56.7181926 / 7.4174862963106944 | `/events/3022/resultRows/5` / `/histories/1170/parties/5` |

Justin decision — exact group scope: 2 bundles / 6 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G02
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G03 — AYOTLAN — Municipal government

- office_id: `MX-M-14-16`; event_id: `event-92c88013e1707162383365c7`
- history_key: `MX-M-14-16|mx_returns_AYUN_14_16_2018||1173`; id_namespace: `cdd-observatory-v1`
- D event `/events/3025`; O history `/histories/1173`; A group `/groups/2`
- Geography `AYOTLAN / JALISCO` at D `/geographies/327`; source `mexico--S42986f9db4` at D `/sources/1174`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `42986f9db4ff0ff19b1455b25505ec53f5d24b69bbf0ccf371a2b193c95700f2` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":947}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 17180 / 17180 |
| total_ballots / total_check | 4561 / 12770 |
| null_votes / unregistered_votes | 151 / NULL (missing) |
| valid_votes ÷ total_ballots | 3.7667178250383686 |
| Full supplied share sum / raw alternate sum | 376.67178260000003 / 100.0 |
| Existing withheld / siblings remaining | 2 / 3 |
| Remaining sibling share sum | 91.0765184 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 3 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-92c88013e1707162383365c7-r2` / PANAL | 33.3041 / recorded / recorded | 1519 / recorded; NULL / unknown | 33.3041 / 8.841676367869615 | `/events/3025/resultRows/2` / `/histories/1173/parties/2` |
| `event-92c88013e1707162383365c7-r3` / PRI | 32.7340496 / recorded / recorded | 1493 / recorded; NULL / unknown | 32.7340496 / 8.69033760186263 | `/events/3025/resultRows/3` / `/histories/1173/parties/3` |
| `event-92c88013e1707162383365c7-r4` / PAN_PRD_MC | 25.0383688 / recorded / recorded | 1142 / recorded; NULL / unknown | 25.0383688 / 6.647264260768336 | `/events/3025/resultRows/4` / `/histories/1173/parties/4` |

Justin decision — exact group scope: 3 bundles / 9 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G03
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G04 — CASIMIRO CASTILLO — Municipal government

- office_id: `MX-M-14-21`; event_id: `event-19049da36d1907576d30cabb`
- history_key: `MX-M-14-21|mx_returns_AYUN_14_21_2018||1178`; id_namespace: `cdd-observatory-v1`
- D event `/events/3030`; O history `/histories/1178`; A group `/groups/3`
- Geography `CASIMIRO CASTILLO / JALISCO` at D `/geographies/332`; source `mexico--S0b685ca705` at D `/sources/1179`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `0b685ca7059144e17af05632d38ae8411a7932501011a0c0abd6bb04209ab88f` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":954}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 8707 / 8707 |
| total_ballots / total_check | 1699 / 7060 |
| null_votes / unregistered_votes | 51 / 1 |
| valid_votes ÷ total_ballots | 5.1247792819305475 |
| Full supplied share sum / raw alternate sum | 512.4779283 / 100.0 |
| Existing withheld / siblings remaining | 2 / 4 |
| Remaining sibling share sum | 163.6256622 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-19049da36d1907576d30cabb-r2` / PT_MORENA_ES | 92.4072984 / recorded / recorded | 1570 / recorded; NULL / unknown | 92.4072984 / 18.03146893304238 | `/events/3030/resultRows/2` / `/histories/1178/parties/2` |
| `event-19049da36d1907576d30cabb-r3` / PAN | 50.7357269 / recorded / recorded | 862 / recorded; NULL / unknown | 50.7357269 / 9.900080395084414 | `/events/3030/resultRows/3` / `/histories/1178/parties/3` |
| `event-19049da36d1907576d30cabb-r4` / PVEM | 15.5385521 / recorded / recorded | 264 / recorded; NULL / unknown | 15.5385521 / 3.0320431836453428 | `/events/3030/resultRows/4` / `/histories/1178/parties/4` |
| `event-19049da36d1907576d30cabb-r5` / PRD | 4.9440848 / recorded / recorded | 84 / recorded; NULL / unknown | 4.9440848 / 0.9647410129780636 | `/events/3030/resultRows/5` / `/histories/1178/parties/5` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G04
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G05 — CHAPALA — Municipal government

- office_id: `MX-M-14-31`; event_id: `event-918b4b717c7d879be7f0775d`
- history_key: `MX-M-14-31|mx_returns_AYUN_14_31_2018||1179`; id_namespace: `cdd-observatory-v1`
- D event `/events/3031`; O history `/histories/1179`; A group `/groups/4`
- Geography `CHAPALA / JALISCO` at D `/geographies/342`; source `mexico--S97a7d789a2` at D `/sources/1180`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `97a7d789a240a5c0b207fb1d8b9715c40febfb4f28cbcd6106cffcf24f5555a9` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":977}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 23121 / 23121 |
| total_ballots / total_check | 6330 / 17000 |
| null_votes / unregistered_votes | 209 / NULL (missing) |
| valid_votes ÷ total_ballots | 3.65260663507109 |
| Full supplied share sum / raw alternate sum | 365.2606635 / 100.0 |
| Existing withheld / siblings remaining | 2 / 5 |
| Remaining sibling share sum | 150.74249600000002 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 5 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-918b4b717c7d879be7f0775d-r2` / PRI | 78.5781991 / recorded / recorded | 4974 / recorded; NULL / unknown | 78.5781991 / 21.512910341248215 | `/events/3031/resultRows/2` / `/histories/1179/parties/2` |
| `event-918b4b717c7d879be7f0775d-r3` / PT_MORENA_ES | 45.4818325 / recorded / recorded | 2879 / recorded; NULL / unknown | 45.4818325 / 12.451883569049782 | `/events/3031/resultRows/3` / `/histories/1179/parties/3` |
| `event-918b4b717c7d879be7f0775d-r4` / CAND_IND21 | 18.6255924 / recorded / recorded | 1179 / recorded; NULL / unknown | 18.6255924 / 5.099260412611911 | `/events/3031/resultRows/4` / `/histories/1179/parties/4` |
| `event-918b4b717c7d879be7f0775d-r5` / PVEM | 4.5655608 / recorded / recorded | 289 / recorded; NULL / unknown | 4.5655608 / 1.2499459365944379 | `/events/3031/resultRows/5` / `/histories/1179/parties/5` |
| `event-918b4b717c7d879be7f0775d-r6` / PANAL | 3.4913112 / recorded / recorded | 221 / recorded; NULL / unknown | 3.4913112 / 0.9558410103369231 | `/events/3031/resultRows/6` / `/histories/1179/parties/6` |

Justin decision — exact group scope: 5 bundles / 15 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G05
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G06 — CUAUTITLAN DE GARCIA BARRAGAN — Municipal government

- office_id: `MX-M-14-28`; event_id: `event-b0cbd05b4a1ac790c5a8e655`
- history_key: `MX-M-14-28|mx_returns_AYUN_14_28_2018||1186`; id_namespace: `cdd-observatory-v1`
- D event `/events/3038`; O history `/histories/1186`; A group `/groups/5`
- Geography `CUAUTITLAN DE GARCIA BARRAGAN / JALISCO` at D `/geographies/339`; source `mexico--Sa97b633a03` at D `/sources/1187`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `a97b633a03d23b75332986a49f757783f823f9c2ab12eadfd25eadba3d75edbc` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":969}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 10032 / 10032 |
| total_ballots / total_check | 3561 / 6546 |
| null_votes / unregistered_votes | 75 / NULL (missing) |
| valid_votes ÷ total_ballots | 2.8171861836562764 |
| Full supplied share sum / raw alternate sum | 281.71861839999997 / 100.0 |
| Existing withheld / siblings remaining | 2 / 2 |
| Remaining sibling share sum | 45.9702331 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 2 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-b0cbd05b4a1ac790c5a8e655-r2` / PRI | 39.7921932 / recorded / recorded | 1417 / recorded; NULL / unknown | 39.7921932 / 14.124800637958533 | `/events/3038/resultRows/2` / `/histories/1186/parties/2` |
| `event-b0cbd05b4a1ac790c5a8e655-r3` / PT_MORENA_ES | 6.1780399 / recorded / recorded | 220 / recorded; NULL / unknown | 6.1780399 / 2.192982456140351 | `/events/3038/resultRows/3` / `/histories/1186/parties/3` |

Justin decision — exact group scope: 2 bundles / 6 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G06
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G07 — CUQUIO — Municipal government

- office_id: `MX-M-14-30`; event_id: `event-64a407db171425962b4ef38f`
- history_key: `MX-M-14-30|mx_returns_AYUN_14_30_2018||1188`; id_namespace: `cdd-observatory-v1`
- D event `/events/3040`; O history `/histories/1188`; A group `/groups/6`
- Geography `CUQUIO / JALISCO` at D `/geographies/341`; source `mexico--Sba8b882e21` at D `/sources/1189`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `ba8b882e2162f5f5e2de459c329d0f75795ce4bfcff039070e7cadcefcd39bbe` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":975}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 9201 / 9201 |
| total_ballots / total_check | 1494 / 7729 |
| null_votes / unregistered_votes | 21 / 1 |
| valid_votes ÷ total_ballots | 6.158634538152611 |
| Full supplied share sum / raw alternate sum | 615.8634539 / 100.0 |
| Existing withheld / siblings remaining | 2 / 2 |
| Remaining sibling share sum | 81.8607765 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 2 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-64a407db171425962b4ef38f-r2` / PRI | 73.2262383 / recorded / recorded | 1094 / recorded; NULL / unknown | 73.2262383 / 11.890011955222258 | `/events/3040/resultRows/2` / `/histories/1188/parties/2` |
| `event-64a407db171425962b4ef38f-r3` / PAN | 8.6345382 / recorded / recorded | 129 / recorded; NULL / unknown | 8.6345382 / 1.4020215194000651 | `/events/3040/resultRows/3` / `/histories/1188/parties/3` |

Justin decision — exact group scope: 2 bundles / 6 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G07
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G08 — EL ARENAL — Municipal government

- office_id: `MX-M-14-9`; event_id: `event-41b5e28438be4be40ced8c46`
- history_key: `MX-M-14-9|mx_returns_AYUN_14_9_2018||1191`; id_namespace: `cdd-observatory-v1`
- D event `/events/3043`; O history `/histories/1191`; A group `/groups/7`
- Geography `EL ARENAL / JALISCO` at D `/geographies/320`; source `mexico--Sf410af82e1` at D `/sources/1192`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `f410af82e14578b77e4f38d1a747c59b66c9c4d5589e202570400dbe744be21a` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":939}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 9143 / 9143 |
| total_ballots / total_check | 2294 / 6902 |
| null_votes / unregistered_votes | 53 / NULL (missing) |
| valid_votes ÷ total_ballots | 3.9856146469049696 |
| Full supplied share sum / raw alternate sum | 398.5614649 / 100.0 |
| Existing withheld / siblings remaining | 2 / 4 |
| Remaining sibling share sum | 162.94681789999999 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-41b5e28438be4be40ced8c46-r2` / PANAL | 84.3940715 / recorded / recorded | 1936 / recorded; NULL / unknown | 84.3940715 / 21.174669145794596 | `/events/3043/resultRows/2` / `/histories/1191/parties/2` |
| `event-41b5e28438be4be40ced8c46-r3` / PRI | 46.5562337 / recorded / recorded | 1068 / recorded; NULL / unknown | 46.5562337 / 11.681067483320573 | `/events/3043/resultRows/3` / `/histories/1191/parties/3` |
| `event-41b5e28438be4be40ced8c46-r4` / PT_MORENA_ES | 22.5806452 / recorded / recorded | 518 / recorded; NULL / unknown | 22.5806452 / 5.665536475992563 | `/events/3043/resultRows/4` / `/histories/1191/parties/4` |
| `event-41b5e28438be4be40ced8c46-r5` / PVEM | 9.4158675 / recorded / recorded | 216 / recorded; NULL / unknown | 9.4158675 / 2.362463086514273 | `/events/3043/resultRows/5` / `/histories/1191/parties/5` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G08
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G09 — EL GRULLO — Municipal government

- office_id: `MX-M-14-39`; event_id: `event-f948e1f268f5ea5989968def`
- history_key: `MX-M-14-39|mx_returns_AYUN_14_39_2018||1192`; id_namespace: `cdd-observatory-v1`
- D event `/events/3044`; O history `/histories/1192`; A group `/groups/8`
- Geography `EL GRULLO / JALISCO` at D `/geographies/350`; source `mexico--S5b38e302d8` at D `/sources/1193`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `5b38e302d8e0e37df9f3e876b963b8ab3ba4b59d0c20c989c8cc02da088d9a06` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":998}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 9686 / 9686 |
| total_ballots / total_check | 3013 / 6767 |
| null_votes / unregistered_votes | 93 / 1 |
| valid_votes ÷ total_ballots | 3.2147361433786923 |
| Full supplied share sum / raw alternate sum | 321.4736143 / 100.0 |
| Existing withheld / siblings remaining | 1 / 4 |
| Remaining sibling share sum | 162.2635247 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-f948e1f268f5ea5989968def-r1` / PRI | 86.7905742 / recorded / recorded | 2615 / recorded; NULL / unknown | 86.7905742 / 26.997728680569896 | `/events/3044/resultRows/1` / `/histories/1192/parties/1` |
| `event-f948e1f268f5ea5989968def-r2` / PT_MORENA_ES | 57.8493196 / recorded / recorded | 1743 / recorded; NULL / unknown | 57.8493196 / 17.99504439397068 | `/events/3044/resultRows/2` / `/histories/1192/parties/2` |
| `event-f948e1f268f5ea5989968def-r3` / PANAL | 15.3667441 / recorded / recorded | 463 / recorded; NULL / unknown | 15.3667441 / 4.780094982448896 | `/events/3044/resultRows/3` / `/histories/1192/parties/3` |
| `event-f948e1f268f5ea5989968def-r4` / PVEM | 2.2568868 / recorded / recorded | 68 / recorded; NULL / unknown | 2.2568868 / 0.7020441874870947 | `/events/3044/resultRows/4` / `/histories/1192/parties/4` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G09
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G10 — EL SALTO — Municipal government

- office_id: `MX-M-14-72`; event_id: `event-f314e00cea66c0327fca32fd`
- history_key: `MX-M-14-72|mx_returns_AYUN_14_72_2018||1194`; id_namespace: `cdd-observatory-v1`
- D event `/events/3046`; O history `/histories/1194`; A group `/groups/9`
- Geography `EL SALTO / JALISCO` at D `/geographies/383`; source `mexico--Sd625a1be94` at D `/sources/1195`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `d625a1be9441d6d59c829868d7975a441516ca922278b5783285189a979a576b` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1081}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 60973 / 60973 |
| total_ballots / total_check | 1279 / 59719 |
| null_votes / unregistered_votes | 25 / NULL (missing) |
| valid_votes ÷ total_ballots | 47.67240031274433 |
| Full supplied share sum / raw alternate sum | 4767.2400313 / 100.0 |
| Existing withheld / siblings remaining | 4 / 1 |
| Remaining sibling share sum | 52.0719312 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 1 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 4 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-f314e00cea66c0327fca32fd-r4` / PANAL | 52.0719312 / recorded / recorded | 666 / recorded; NULL / unknown | 52.0719312 / 1.0922867498728945 | `/events/3046/resultRows/4` / `/histories/1194/parties/4` |

Justin decision — exact group scope: 1 bundles / 3 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G10
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G11 — GUADALAJARA — Municipal government

- office_id: `MX-M-14-41`; event_id: `event-ec64f89df4fc3e6a2f07d2ab`
- history_key: `MX-M-14-41|mx_returns_AYUN_14_41_2018||1199`; id_namespace: `cdd-observatory-v1`
- D event `/events/3051`; O history `/histories/1199`; A group `/groups/10`
- Geography `GUADALAJARA / JALISCO` at D `/geographies/352`; source `mexico--Sb7d2d40043` at D `/sources/1200`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `b7d2d40043f8507b9eaddd811e126ee6b567060349b7e03b72c4bdde708e6fe9` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1002}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 751471 / 751471 |
| total_ballots / total_check | 2538 / 749042 |
| null_votes / unregistered_votes | 109 / NULL (missing) |
| valid_votes ÷ total_ballots | 296.0878644602049 |
| Full supplied share sum / raw alternate sum | 29608.7864459 / 100.0 |
| Existing withheld / siblings remaining | 7 / 0 |
| Remaining sibling share sum | No remaining numeric shares; not an observed zero |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all seven original shares remain explicitly withheld. There is no sibling to change and no empty-row placeholder. The denominator, ballot basis and completeness conflict persists; recover the exact primary packet above before any percentage is restored. This group contributes zero new changes, while preserving all seven accepted bundles.

- [ ] Acknowledge no new scalar changes; keep the event research conflict open
- [ ] Request the primary evidence packet before considering a separate superseding restoration proposal

Reviewer/date: ____________________. Acknowledgment cannot reverse an accepted withhold.

### MX-G12 — IXTLAHUACAN DE LOS MEMBRILLOS — Municipal government

- office_id: `MX-M-14-46`; event_id: `event-619ff82171e36f20f4716553`
- history_key: `MX-M-14-46|mx_returns_AYUN_14_46_2018||1203`; id_namespace: `cdd-observatory-v1`
- D event `/events/3055`; O history `/histories/1203`; A group `/groups/11`
- Geography `IXTLAHUACAN DE LOS MEMBRILLOS / JALISCO` at D `/geographies/357`; source `mexico--S6043f4570a` at D `/sources/1204`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `6043f4570ad3aef1d9a019fa7b4d49a0444963735385171bca4836cc124ffad9` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1013}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 17227 / 17227 |
| total_ballots / total_check | 4609 / 12755 |
| null_votes / unregistered_votes | 137 / NULL (missing) |
| valid_votes ÷ total_ballots | 3.7376871338685183 |
| Full supplied share sum / raw alternate sum | 373.7687134 / 100.0 |
| Existing withheld / siblings remaining | 2 / 3 |
| Remaining sibling share sum | 77.9561727 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 3 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-619ff82171e36f20f4716553-r2` / PT_MORENA_ES | 56.9103927 / recorded / recorded | 2623 / recorded; NULL / unknown | 56.9103927 / 15.226098566204215 | `/events/3055/resultRows/2` / `/histories/1203/parties/2` |
| `event-619ff82171e36f20f4716553-r3` / PVEM | 13.9292688 / recorded / recorded | 642 / recorded; NULL / unknown | 13.9292688 / 3.7267080745341614 | `/events/3055/resultRows/3` / `/histories/1203/parties/3` |
| `event-619ff82171e36f20f4716553-r4` / PANAL | 7.1165112 / recorded / recorded | 328 / recorded; NULL / unknown | 7.1165112 / 1.9039879259302257 | `/events/3055/resultRows/4` / `/histories/1203/parties/4` |

Justin decision — exact group scope: 3 bundles / 9 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G12
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G13 — LA HUERTA — Municipal government

- office_id: `MX-M-14-45`; event_id: `event-c385c21b3823dd30d6d9a447`
- history_key: `MX-M-14-45|mx_returns_AYUN_14_45_2018||1213`; id_namespace: `cdd-observatory-v1`
- D event `/events/3065`; O history `/histories/1213`; A group `/groups/12`
- Geography `LA HUERTA / JALISCO` at D `/geographies/356`; source `mexico--S2f44bd3d55` at D `/sources/1214`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `2f44bd3d556ee1fd4b135cb3ffaa87dd8e2c6034d94c122d9ed77e19a19308d4` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1012}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 11498 / 11498 |
| total_ballots / total_check | 3392 / 8184 |
| null_votes / unregistered_votes | 77 / 1 |
| valid_votes ÷ total_ballots | 3.389740566037736 |
| Full supplied share sum / raw alternate sum | 338.9740565 / 100.0 |
| Existing withheld / siblings remaining | 2 / 2 |
| Remaining sibling share sum | 37.735848999999995 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 2 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-c385c21b3823dd30d6d9a447-r2` / PT_MORENA_ES | 36.4091981 / recorded / recorded | 1235 / recorded; NULL / unknown | 36.4091981 / 10.740998434510349 | `/events/3065/resultRows/2` / `/histories/1213/parties/2` |
| `event-c385c21b3823dd30d6d9a447-r3` / PVEM | 1.3266509 / recorded / recorded | 45 / recorded; NULL / unknown | 1.3266509 / 0.39137241259349453 | `/events/3065/resultRows/3` / `/histories/1213/parties/3` |

Justin decision — exact group scope: 2 bundles / 6 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G13
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G14 — LAGOS DE MORENO — Municipal government

- office_id: `MX-M-14-55`; event_id: `event-86ce39fd123295258857fb16`
- history_key: `MX-M-14-55|mx_returns_AYUN_14_55_2018||1215`; id_namespace: `cdd-observatory-v1`
- D event `/events/3067`; O history `/histories/1215`; A group `/groups/13`
- Geography `LAGOS DE MORENO / JALISCO` at D `/geographies/366`; source `mexico--S9d59ebbb73` at D `/sources/1216`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `9d59ebbb73db1ecec2a02727de9d22c6a427e105d8882c3e9167a2b393f76af7` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1038}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 65554 / 65554 |
| total_ballots / total_check | 3155 / 62495 |
| null_votes / unregistered_votes | 96 / NULL (missing) |
| valid_votes ÷ total_ballots | 20.777812995245643 |
| Full supplied share sum / raw alternate sum | 2077.7812995 / 100.0 |
| Existing withheld / siblings remaining | 3 / 4 |
| Remaining sibling share sum | 90.0792393 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 3 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-86ce39fd123295258857fb16-r3` / CAND_IND30 | 28.1141046 / recorded / recorded | 887 / recorded; NULL / unknown | 28.1141046 / 1.353082954510785 | `/events/3067/resultRows/3` / `/histories/1215/parties/3` |
| `event-86ce39fd123295258857fb16-r4` / PVEM | 24.5958796 / recorded / recorded | 776 / recorded; NULL / unknown | 24.5958796 / 1.1837569027061658 | `/events/3067/resultRows/4` / `/histories/1215/parties/4` |
| `event-86ce39fd123295258857fb16-r5` / CAND_IND13 | 23.6767036 / recorded / recorded | 747 / recorded; NULL / unknown | 23.6767036 / 1.1395185648473014 | `/events/3067/resultRows/5` / `/histories/1215/parties/5` |
| `event-86ce39fd123295258857fb16-r6` / PANAL | 13.6925515 / recorded / recorded | 432 / recorded; NULL / unknown | 13.6925515 / 0.6589986881044635 | `/events/3067/resultRows/6` / `/histories/1215/parties/6` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G14
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G15 — MASCOTA — Municipal government

- office_id: `MX-M-14-60`; event_id: `event-3df08b5bc971df4f4b5c05a5`
- history_key: `MX-M-14-60|mx_returns_AYUN_14_60_2018||1217`; id_namespace: `cdd-observatory-v1`
- D event `/events/3069`; O history `/histories/1217`; A group `/groups/14`
- Geography `MASCOTA / JALISCO` at D `/geographies/371`; source `mexico--S6e9be464b0` at D `/sources/1218`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `6e9be464b0ad9f03b2968e9822970b1504a6ec3018259937d6286fd23a99946b` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1052}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 7169 / 7169 |
| total_ballots / total_check | 1393 / 5776 |
| null_votes / unregistered_votes | NULL (missing) / NULL (missing) |
| valid_votes ÷ total_ballots | 5.146446518305815 |
| Full supplied share sum / raw alternate sum | 514.6446518 / 100.0 |
| Existing withheld / siblings remaining | 3 / 3 |
| Remaining sibling share sum | 68.700646 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 3 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 3 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-3df08b5bc971df4f4b5c05a5-r3` / PAN | 59.5836324 / recorded / recorded | 830 / recorded; NULL / unknown | 59.5836324 / 11.577625889245361 | `/events/3069/resultRows/3` / `/histories/1217/parties/3` |
| `event-3df08b5bc971df4f4b5c05a5-r4` / PANAL | 6.4608758 / recorded / recorded | 90 / recorded; NULL / unknown | 6.4608758 / 1.2554052169061236 | `/events/3069/resultRows/4` / `/histories/1217/parties/4` |
| `event-3df08b5bc971df4f4b5c05a5-r5` / PVEM | 2.6561378 / recorded / recorded | 37 / recorded; NULL / unknown | 2.6561378 / 0.5161110336169619 | `/events/3069/resultRows/5` / `/histories/1217/parties/5` |

Justin decision — exact group scope: 3 bundles / 9 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G15
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G16 — MAZAMITLA — Municipal government

- office_id: `MX-M-14-61`; event_id: `event-52a50cf2eb98abe76786ac07`
- history_key: `MX-M-14-61|mx_returns_AYUN_14_61_2018||1218`; id_namespace: `cdd-observatory-v1`
- D event `/events/3070`; O history `/histories/1218`; A group `/groups/15`
- Geography `MAZAMITLA / JALISCO` at D `/geographies/372`; source `mexico--Sf751f22c8f` at D `/sources/1219`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `f751f22c8f6beb96911795eef0d7aa8afc31dc522c82fb6f63ea205b1fb1ccae` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1054}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 7302 / 7302 |
| total_ballots / total_check | 2483 / 4876 |
| null_votes / unregistered_votes | 57 / NULL (missing) |
| valid_votes ÷ total_ballots | 2.9407974224728153 |
| Full supplied share sum / raw alternate sum | 294.0797422 / 100.0 |
| Existing withheld / siblings remaining | 1 / 5 |
| Remaining sibling share sum | 163.7535239 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 5 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-52a50cf2eb98abe76786ac07-r1` / PRI | 83.326621 / recorded / recorded | 2069 / recorded; NULL / unknown | 83.326621 / 28.33470282114489 | `/events/3070/resultRows/1` / `/histories/1218/parties/1` |
| `event-52a50cf2eb98abe76786ac07-r2` / MC | 58.5179219 / recorded / recorded | 1453 / recorded; NULL / unknown | 58.5179219 / 19.898657901944674 | `/events/3070/resultRows/2` / `/histories/1218/parties/2` |
| `event-52a50cf2eb98abe76786ac07-r3` / PT_MORENA_ES | 14.0555779 / recorded / recorded | 349 / recorded; NULL / unknown | 14.0555779 / 4.779512462339085 | `/events/3070/resultRows/3` / `/histories/1218/parties/3` |
| `event-52a50cf2eb98abe76786ac07-r4` / PANAL | 4.4703987 / recorded / recorded | 111 / recorded; NULL / unknown | 4.4703987 / 1.5201314708299096 | `/events/3070/resultRows/4` / `/histories/1218/parties/4` |
| `event-52a50cf2eb98abe76786ac07-r5` / PAN | 3.3830044 / recorded / recorded | 84 / recorded; NULL / unknown | 3.3830044 / 1.1503697617091209 | `/events/3070/resultRows/5` / `/histories/1218/parties/5` |

Justin decision — exact group scope: 5 bundles / 15 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G16
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G17 — OCOTLAN — Municipal government

- office_id: `MX-M-14-65`; event_id: `event-e06ac8eeb6c9d6b541c24002`
- history_key: `MX-M-14-65|mx_returns_AYUN_14_65_2018||1222`; id_namespace: `cdd-observatory-v1`
- D event `/events/3074`; O history `/histories/1222`; A group `/groups/16`
- Geography `OCOTLAN / JALISCO` at D `/geographies/376`; source `mexico--S5cd993e24b` at D `/sources/1223`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `5cd993e24bdb2920276fa26f61d35724ceb5768131cea5231791bd593d96a494` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1064}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 42063 / 42063 |
| total_ballots / total_check | 7041 / 35314 |
| null_votes / unregistered_votes | 291 / 1 |
| valid_votes ÷ total_ballots | 5.974009373668513 |
| Full supplied share sum / raw alternate sum | 597.4009374 / 100.0 |
| Existing withheld / siblings remaining | 3 / 5 |
| Remaining sibling share sum | 105.9934669 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 5 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 3 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-e06ac8eeb6c9d6b541c24002-r3` / PRI | 64.791933 / recorded / recorded | 4562 / recorded; NULL / unknown | 64.791933 / 10.845636307443597 | `/events/3074/resultRows/3` / `/histories/1222/parties/3` |
| `event-e06ac8eeb6c9d6b541c24002-r4` / PANAL | 15.9778441 / recorded / recorded | 1125 / recorded; NULL / unknown | 15.9778441 / 2.674559589187647 | `/events/3074/resultRows/4` / `/histories/1222/parties/4` |
| `event-e06ac8eeb6c9d6b541c24002-r5` / CAND_IND2 | 9.7855418 / recorded / recorded | 689 / recorded; NULL / unknown | 9.7855418 / 1.6380191617335902 | `/events/3074/resultRows/5` / `/histories/1222/parties/5` |
| `event-e06ac8eeb6c9d6b541c24002-r6` / PRD | 7.9960233 / recorded / recorded | 563 / recorded; NULL / unknown | 7.9960233 / 1.3384684877445736 | `/events/3074/resultRows/6` / `/histories/1222/parties/6` |
| `event-e06ac8eeb6c9d6b541c24002-r7` / PVEM | 7.4421247 / recorded / recorded | 524 / recorded; NULL / unknown | 7.4421247 / 1.2457504219860684 | `/events/3074/resultRows/7` / `/histories/1222/parties/7` |

Justin decision — exact group scope: 5 bundles / 15 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G17
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G18 — OJUELOS DE JALISCO — Municipal government

- office_id: `MX-M-14-66`; event_id: `event-f23d9bed9c5ee4d751673373`
- history_key: `MX-M-14-66|mx_returns_AYUN_14_66_2018||1223`; id_namespace: `cdd-observatory-v1`
- D event `/events/3075`; O history `/histories/1223`; A group `/groups/17`
- Geography `OJUELOS DE JALISCO / JALISCO` at D `/geographies/377`; source `mexico--Sc1f6d8a67f` at D `/sources/1224`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `c1f6d8a67f0fbf2fa20eae247edb15395d33fe3a5ffbe4560a4f26e1da867494` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1067}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 12843 / 12843 |
| total_ballots / total_check | 2343 / 10535 |
| null_votes / unregistered_votes | 35 / NULL (missing) |
| valid_votes ÷ total_ballots | 5.481434058898848 |
| Full supplied share sum / raw alternate sum | 548.143406 / 100.0 |
| Existing withheld / siblings remaining | 1 / 3 |
| Remaining sibling share sum | 232.22364499999998 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 3 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-f23d9bed9c5ee4d751673373-r1` / PT_MORENA_ES | 88.0068289 / recorded / recorded | 2062 / recorded; NULL / unknown | 88.0068289 / 16.055438760414233 | `/events/3075/resultRows/1` / `/histories/1223/parties/1` |
| `event-f23d9bed9c5ee4d751673373-r2` / PRI | 79.1293214 / recorded / recorded | 1854 / recorded; NULL / unknown | 79.1293214 / 14.435879467414155 | `/events/3075/resultRows/2` / `/histories/1223/parties/2` |
| `event-f23d9bed9c5ee4d751673373-r3` / PVEM | 65.0874947 / recorded / recorded | 1525 / recorded; NULL / unknown | 65.0874947 / 11.874172701082301 | `/events/3075/resultRows/3` / `/histories/1223/parties/3` |

Justin decision — exact group scope: 3 bundles / 9 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G18
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G19 — PUERTO VALLARTA — Municipal government

- office_id: `MX-M-14-69`; event_id: `event-059a6b37f94b7f6d382cbe8d`
- history_key: `MX-M-14-69|mx_returns_AYUN_14_69_2018||1226`; id_namespace: `cdd-observatory-v1`
- D event `/events/3078`; O history `/histories/1226`; A group `/groups/18`
- Geography `PUERTO VALLARTA / JALISCO` at D `/geographies/380`; source `mexico--Sce3331aa35` at D `/sources/1227`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `ce3331aa3547d97da3e792806c0642f0077eee097aa582bec3eb663a0edcce38` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1074}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 104161 / 104161 |
| total_ballots / total_check | 6073 / 98344 |
| null_votes / unregistered_votes | 252 / 4 |
| valid_votes ÷ total_ballots | 17.151490202535815 |
| Full supplied share sum / raw alternate sum | 1715.1490202999998 / 100.0 |
| Existing withheld / siblings remaining | 3 / 9 |
| Remaining sibling share sum | 260.4149514 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 9 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 3 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-059a6b37f94b7f6d382cbe8d-r3` / PAN | 89.3627532 / recorded / recorded | 5427 / recorded; NULL / unknown | 89.3627532 / 5.210203435066868 | `/events/3078/resultRows/3` / `/histories/1226/parties/3` |
| `event-059a6b37f94b7f6d382cbe8d-r4` / PANAL | 34.661617 / recorded / recorded | 2105 / recorded; NULL / unknown | 34.661617 / 2.0209099375006 | `/events/3078/resultRows/4` / `/histories/1226/parties/4` |
| `event-059a6b37f94b7f6d382cbe8d-r5` / PVEM | 28.3220813 / recorded / recorded | 1720 / recorded; NULL / unknown | 28.3220813 / 1.6512898301667611 | `/events/3078/resultRows/5` / `/histories/1226/parties/5` |
| `event-059a6b37f94b7f6d382cbe8d-r6` / CAND_IND19 | 26.7083814 / recorded / recorded | 1622 / recorded; NULL / unknown | 26.7083814 / 1.5572047119363293 | `/events/3078/resultRows/6` / `/histories/1226/parties/6` |
| `event-059a6b37f94b7f6d382cbe8d-r7` / CAND_IND1 | 21.949613 / recorded / recorded | 1333 / recorded; NULL / unknown | 21.949613 / 1.2797496183792398 | `/events/3078/resultRows/7` / `/histories/1226/parties/7` |
| `event-059a6b37f94b7f6d382cbe8d-r8` / CAND_IND24 | 21.4556233 / recorded / recorded | 1303 / recorded; NULL / unknown | 21.4556233 / 1.2509480515740057 | `/events/3078/resultRows/8` / `/histories/1226/parties/8` |
| `event-059a6b37f94b7f6d382cbe8d-r9` / PRD | 16.8285855 / recorded / recorded | 1022 / recorded; NULL / unknown | 16.8285855 / 0.9811733758316452 | `/events/3078/resultRows/9` / `/histories/1226/parties/9` |
| `event-059a6b37f94b7f6d382cbe8d-r10` / CAND_IND43 | 13.9305121 / recorded / recorded | 846 / recorded; NULL / unknown | 13.9305121 / 0.8122041839076046 | `/events/3078/resultRows/10` / `/histories/1226/parties/10` |
| `event-059a6b37f94b7f6d382cbe8d-r11` / CAND_IND44 | 7.1957846 / recorded / recorded | 437 / recorded; NULL / unknown | 7.1957846 / 0.41954282312957825 | `/events/3078/resultRows/11` / `/histories/1226/parties/11` |

Justin decision — exact group scope: 9 bundles / 27 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G19
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G20 — SAN JUAN DE LOS LAGOS — Municipal government

- office_id: `MX-M-14-75`; event_id: `event-8e777777a3b9d15105f84139`
- history_key: `MX-M-14-75|mx_returns_AYUN_14_75_2018||1232`; id_namespace: `cdd-observatory-v1`
- D event `/events/3084`; O history `/histories/1232`; A group `/groups/19`
- Geography `SAN JUAN DE LOS LAGOS / JALISCO` at D `/geographies/386`; source `mexico--S670d610070` at D `/sources/1233`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `670d610070e073e8e781f07b61e91412c9be2035f455f43416e424f2d0f7125a` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1088}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 27770 / 27770 |
| total_ballots / total_check | 1991 / 25860 |
| null_votes / unregistered_votes | 81 / NULL (missing) |
| valid_votes ÷ total_ballots | 13.947764942240081 |
| Full supplied share sum / raw alternate sum | 1394.7764942 / 100.0 |
| Existing withheld / siblings remaining | 5 / 1 |
| Remaining sibling share sum | 39.9296836 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 1 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 5 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-8e777777a3b9d15105f84139-r5` / CAND_IND18 | 39.9296836 / recorded / recorded | 795 / recorded; NULL / unknown | 39.9296836 / 2.8628015844436443 | `/events/3084/resultRows/5` / `/histories/1232/parties/5` |

Justin decision — exact group scope: 1 bundles / 3 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G20
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G21 — SAN MARTIN HIDALGO — Municipal government

- office_id: `MX-M-14-79`; event_id: `event-7a639b48185b8b5ef8849d27`
- history_key: `MX-M-14-79|mx_returns_AYUN_14_79_2018||1237`; id_namespace: `cdd-observatory-v1`
- D event `/events/3089`; O history `/histories/1237`; A group `/groups/20`
- Geography `SAN MARTIN HIDALGO / JALISCO` at D `/geographies/390`; source `mexico--Seb36c2cbf1` at D `/sources/1238`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `eb36c2cbf1cbcfbc444702be171538836f1081b8f97906a6705cf63c0896f818` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1100}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 13880 / 13880 |
| total_ballots / total_check | 1820 / 12113 |
| null_votes / unregistered_votes | 53 / NULL (missing) |
| valid_votes ÷ total_ballots | 7.626373626373627 |
| Full supplied share sum / raw alternate sum | 762.6373626 / 100.0 |
| Existing withheld / siblings remaining | 3 / 2 |
| Remaining sibling share sum | 78.9560439 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 2 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum being below 100 does not validate the omitted denominator/context. The 3 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-7a639b48185b8b5ef8849d27-r3` / CAND_IND27 | 74.9450549 / recorded / recorded | 1364 / recorded; NULL / unknown | 74.9450549 / 9.827089337175792 | `/events/3089/resultRows/3` / `/histories/1237/parties/3` |
| `event-7a639b48185b8b5ef8849d27-r4` / PVEM | 4.010989 / recorded / recorded | 73 / recorded; NULL / unknown | 4.010989 / 0.5259365994236311 | `/events/3089/resultRows/4` / `/histories/1237/parties/4` |

Justin decision — exact group scope: 2 bundles / 6 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G21
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G22 — SAN PEDRO TLAQUEPAQUE — Municipal government

- office_id: `MX-M-14-99`; event_id: `event-215fc3e8a6326b7c02da6b1c`
- history_key: `MX-M-14-99|mx_returns_AYUN_14_99_2018||1239`; id_namespace: `cdd-observatory-v1`
- D event `/events/3091`; O history `/histories/1239`; A group `/groups/21`
- Geography `SAN PEDRO TLAQUEPAQUE / JALISCO` at D `/geographies/410`; source `mexico--S7f9c7ebcf3` at D `/sources/1240`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `7f9c7ebcf391f0d70bfccfc27a877d8421d1e0d3727bba76da07d92ab10dd9f5` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1151}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 247717 / 247717 |
| total_ballots / total_check | 14582 / 233615 |
| null_votes / unregistered_votes | 478 / 2 |
| valid_votes ÷ total_ballots | 16.98786174735976 |
| Full supplied share sum / raw alternate sum | 1698.7861747 / 100.0 |
| Existing withheld / siblings remaining | 4 / 4 |
| Remaining sibling share sum | 183.8910986 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 4 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-215fc3e8a6326b7c02da6b1c-r4` / PVEM | 61.8502263 / recorded / recorded | 9019 / recorded; NULL / unknown | 61.8502263 / 3.6408482259998305 | `/events/3091/resultRows/4` / `/histories/1239/parties/4` |
| `event-215fc3e8a6326b7c02da6b1c-r5` / CAND_IND4 | 51.549856 / recorded / recorded | 7517 / recorded; NULL / unknown | 51.549856 / 3.0345111558754545 | `/events/3091/resultRows/5` / `/histories/1239/parties/5` |
| `event-215fc3e8a6326b7c02da6b1c-r6` / CAND_IND16 | 42.3261555 / recorded / recorded | 6172 / recorded; NULL / unknown | 42.3261555 / 2.491552860724133 | `/events/3091/resultRows/6` / `/histories/1239/parties/6` |
| `event-215fc3e8a6326b7c02da6b1c-r7` / PANAL | 28.1648608 / recorded / recorded | 4107 / recorded; NULL / unknown | 28.1648608 / 1.6579403109193152 | `/events/3091/resultRows/7` / `/histories/1239/parties/7` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G22
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G23 — TALA — Municipal government

- office_id: `MX-M-14-84`; event_id: `event-db123f41cdcb10be7e5ad254`
- history_key: `MX-M-14-84|mx_returns_AYUN_14_84_2018||1244`; id_namespace: `cdd-observatory-v1`
- D event `/events/3096`; O history `/histories/1244`; A group `/groups/22`
- Geography `TALA / JALISCO` at D `/geographies/395`; source `mexico--S520fdeeb92` at D `/sources/1245`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `520fdeeb924bfbbceb12ea077bbee325df956cf391a3b8fbb662dca00a7620b2` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1111}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 29787 / 29787 |
| total_ballots / total_check | 8006 / 21964 |
| null_votes / unregistered_votes | 183 / NULL (missing) |
| valid_votes ÷ total_ballots | 3.720584561578816 |
| Full supplied share sum / raw alternate sum | 372.0584561 / 100.0 |
| Existing withheld / siblings remaining | 2 / 4 |
| Remaining sibling share sum | 122.8703472 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-db123f41cdcb10be7e5ad254-r2` / PT_MORENA_ES | 84.1868599 / recorded / recorded | 6740 / recorded; NULL / unknown | 84.1868599 / 22.627320643233624 | `/events/3096/resultRows/2` / `/histories/1244/parties/2` |
| `event-db123f41cdcb10be7e5ad254-r3` / PVEM | 18.1363977 / recorded / recorded | 1452 / recorded; NULL / unknown | 18.1363977 / 4.874609729076443 | `/events/3096/resultRows/3` / `/histories/1244/parties/3` |
| `event-db123f41cdcb10be7e5ad254-r4` / CAND_IND40 | 11.4414189 / recorded / recorded | 916 / recorded; NULL / unknown | 11.4414189 / 3.0751670191694362 | `/events/3096/resultRows/4` / `/histories/1244/parties/4` |
| `event-db123f41cdcb10be7e5ad254-r5` / PANAL | 9.1056707 / recorded / recorded | 729 / recorded; NULL / unknown | 9.1056707 / 2.4473763722429247 | `/events/3096/resultRows/5` / `/histories/1244/parties/5` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G23
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G24 — TEOCALTICHE — Municipal government

- office_id: `MX-M-14-92`; event_id: `event-15649ecc034999cb026fbb51`
- history_key: `MX-M-14-92|mx_returns_AYUN_14_92_2018||1252`; id_namespace: `cdd-observatory-v1`
- D event `/events/3104`; O history `/histories/1252`; A group `/groups/23`
- Geography `TEOCALTICHE / JALISCO` at D `/geographies/403`; source `mexico--S63d04da156` at D `/sources/1253`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `63d04da15639b54f611117a5bf4ee0b63cfc112d5118505c4f3f8df9914e4efa` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1131}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 15269 / 15269 |
| total_ballots / total_check | 6142 / 9292 |
| null_votes / unregistered_votes | 165 / NULL (missing) |
| valid_votes ÷ total_ballots | 2.48599804623901 |
| Full supplied share sum / raw alternate sum | 248.5998046 / 100.0 |
| Existing withheld / siblings remaining | 1 / 4 |
| Remaining sibling share sum | 146.4669489 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 4 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-15649ecc034999cb026fbb51-r1` / PRI | 79.9576685 / recorded / recorded | 4911 / recorded; NULL / unknown | 79.9576685 / 32.163206496823626 | `/events/3104/resultRows/1` / `/histories/1252/parties/1` |
| `event-15649ecc034999cb026fbb51-r2` / PT_MORENA_ES | 50.2767828 / recorded / recorded | 3088 / recorded; NULL / unknown | 50.2767828 / 20.223983234003537 | `/events/3104/resultRows/2` / `/histories/1252/parties/2` |
| `event-15649ecc034999cb026fbb51-r3` / PANAL | 11.4946272 / recorded / recorded | 706 / recorded; NULL / unknown | 11.4946272 / 4.62374746217827 | `/events/3104/resultRows/3` / `/histories/1252/parties/3` |
| `event-15649ecc034999cb026fbb51-r4` / PVEM | 4.7378704 / recorded / recorded | 291 / recorded; NULL / unknown | 4.7378704 / 1.9058222542406182 | `/events/3104/resultRows/4` / `/histories/1252/parties/4` |

Justin decision — exact group scope: 4 bundles / 12 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G24
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G25 — TEPATITLAN DE MORELOS — Municipal government

- office_id: `MX-M-14-94`; event_id: `event-22322c49cf14d9e01ad14003`
- history_key: `MX-M-14-94|mx_returns_AYUN_14_94_2018||1254`; id_namespace: `cdd-observatory-v1`
- D event `/events/3106`; O history `/histories/1254`; A group `/groups/24`
- Geography `TEPATITLAN DE MORELOS / JALISCO` at D `/geographies/405`; source `mexico--S0c008755f2` at D `/sources/1255`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `0c008755f2a3ab6f093ebdba6ccd8fe2351104fe7c94b9aa679c12060413483c` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1136}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 60294 / 60294 |
| total_ballots / total_check | 17160 / 43740 |
| null_votes / unregistered_votes | 601 / 5 |
| valid_votes ÷ total_ballots | 3.5136363636363637 |
| Full supplied share sum / raw alternate sum | 351.3636363 / 100.0 |
| Existing withheld / siblings remaining | 2 / 6 |
| Remaining sibling share sum | 123.5897436 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 6 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 2 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-22322c49cf14d9e01ad14003-r2` / PVEM | 41.2062937 / recorded / recorded | 7071 / recorded; NULL / unknown | 41.2062937 / 11.727535078117226 | `/events/3106/resultRows/2` / `/histories/1254/parties/2` |
| `event-22322c49cf14d9e01ad14003-r3` / CAND_IND8 | 28.0128205 / recorded / recorded | 4807 / recorded; NULL / unknown | 28.0128205 / 7.972600922148141 | `/events/3106/resultRows/3` / `/histories/1254/parties/3` |
| `event-22322c49cf14d9e01ad14003-r4` / PRI | 26.1713287 / recorded / recorded | 4491 / recorded; NULL / unknown | 26.1713287 / 7.448502338541148 | `/events/3106/resultRows/4` / `/histories/1254/parties/4` |
| `event-22322c49cf14d9e01ad14003-r5` / PT_MORENA_ES | 19.7668998 / recorded / recorded | 3392 / recorded; NULL / unknown | 19.7668998 / 5.625767074667463 | `/events/3106/resultRows/5` / `/histories/1254/parties/5` |
| `event-22322c49cf14d9e01ad14003-r6` / PANAL | 6.7249417 / recorded / recorded | 1154 / recorded; NULL / unknown | 6.7249417 / 1.9139549540584468 | `/events/3106/resultRows/6` / `/histories/1254/parties/6` |
| `event-22322c49cf14d9e01ad14003-r7` / PRD | 1.7074592 / recorded / recorded | 293 / recorded; NULL / unknown | 1.7074592 / 0.48595216771154676 | `/events/3106/resultRows/7` / `/histories/1254/parties/7` |

Justin decision — exact group scope: 6 bundles / 18 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G25
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G26 — VILLA PURIFICACION — Municipal government

- office_id: `MX-M-14-70`; event_id: `event-7a2836aa7eac1de379d3e3e1`
- history_key: `MX-M-14-70|mx_returns_AYUN_14_70_2018||1276`; id_namespace: `cdd-observatory-v1`
- D event `/events/3128`; O history `/histories/1276`; A group `/groups/25`
- Geography `VILLA PURIFICACION / JALISCO` at D `/geographies/381`; source `mexico--Sa69e10a2f8` at D `/sources/1277`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `a69e10a2f8f3713de1ddae0a488ac976be8b021290163dc02ae9bc0f20e28faf` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1077}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 6168 / 6168 |
| total_ballots / total_check | 2287 / 4002 |
| null_votes / unregistered_votes | 120 / 1 |
| valid_votes ÷ total_ballots | 2.6969829470922604 |
| Full supplied share sum / raw alternate sum | 269.6982947 / 100.0 |
| Existing withheld / siblings remaining | 1 / 3 |
| Remaining sibling share sum | 149.3659816 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 3 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-7a2836aa7eac1de379d3e3e1-r1` / PRI | 63.6641889 / recorded / recorded | 1456 / recorded; NULL / unknown | 63.6641889 / 23.605706874189366 | `/events/3128/resultRows/1` / `/histories/1276/parties/1` |
| `event-7a2836aa7eac1de379d3e3e1-r2` / PAN | 61.7839965 / recorded / recorded | 1413 / recorded; NULL / unknown | 61.7839965 / 22.908560311284045 | `/events/3128/resultRows/2` / `/histories/1276/parties/2` |
| `event-7a2836aa7eac1de379d3e3e1-r3` / PT_MORENA_ES | 23.9177962 / recorded / recorded | 547 / recorded; NULL / unknown | 23.9177962 / 8.868352788586252 | `/events/3128/resultRows/3` / `/histories/1276/parties/3` |

Justin decision — exact group scope: 3 bundles / 9 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G26
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

### MX-G27 — ZAPOTLANEJO — Municipal government

- office_id: `MX-M-14-124`; event_id: `event-0bc8c51c406c0e5f49c66b37`
- history_key: `MX-M-14-124|mx_returns_AYUN_14_124_2018||1284`; id_namespace: `cdd-observatory-v1`
- D event `/events/3136`; O history `/histories/1284`; A group `/groups/26`
- Geography `ZAPOTLANEJO / JALISCO` at D `/geographies/435`; source `mexico--S1f8d61401c` at D `/sources/1285`
- Existing source URL: `https://sicee-api.ine.mx/api/v1/local/cards/getTarjOnceTablasamunicipiosLoc`; response hash metadata `1f8d61401c197f3b3a89ff04e763b70ae3ac99fb4d473cc4966841c0e9a078f1` (response bytes not recovered)
- Exact opaque request: `{"gAnio":2018,"gIdCatAmbitoFin":34,"gIdCatAmbitoIni":1,"gIdCatCargo":14,"gIdCatEdo":16,"gIdCatmunicipio":1205}`

| Diagnostic from supplied records | Value |
| --- | --- |
| Candidate vote sum / valid_votes | 25841 / 25841 |
| total_ballots / total_check | 7637 / 18480 |
| null_votes / unregistered_votes | 273 / 3 |
| valid_votes ÷ total_ballots | 3.383658504648422 |
| Full supplied share sum / raw alternate sum | 338.3658505 / 100.0 |
| Existing withheld / siblings remaining | 1 / 5 |
| Remaining sibling share sum | 160.874689 |
| _vote_ok / _seat_ok / segments | false / false / 1 |
| Normalized ballot_basis / raw distribution | candidate_marks / Por Candidaturas |

**Diagnosis:** all 5 siblings use this event's disputed ballots denominator; their in-domain values are not independently reconciled. Their remaining sum still exceeds 100. The 1 predecessor withholds do not repair candidate/territorial scope, ballot basis or completeness. **Recommend withholding all listed sibling bundles**, keeping the event conflict open and requesting the primary evidence packet above specifically for this exact request/source/event.

| Exact sibling result_row_id / label | Current share / share_status / evidence_status | Votes / votes_status; seats / seats_status | raw.reported_share / raw.share (unaccepted) | D row pointer / O party pointer |
| --- | --- | --- | --- | --- |
| `event-0bc8c51c406c0e5f49c66b37-r1` / PT_MORENA_ES | 61.6472437 / recorded / recorded | 4708 / recorded; NULL / unknown | 61.6472437 / 18.21910916760187 | `/events/3136/resultRows/1` / `/histories/1284/parties/1` |
| `event-0bc8c51c406c0e5f49c66b37-r2` / PRI | 61.0056305 / recorded / recorded | 4659 / recorded; NULL / unknown | 61.0056305 / 18.02948802290933 | `/events/3136/resultRows/2` / `/histories/1284/parties/2` |
| `event-0bc8c51c406c0e5f49c66b37-r3` / PAN | 22.3648029 / recorded / recorded | 1708 / recorded; NULL / unknown | 22.3648029 / 6.609651329282922 | `/events/3136/resultRows/3` / `/histories/1284/parties/3` |
| `event-0bc8c51c406c0e5f49c66b37-r4` / PVEM | 12.0204269 / recorded / recorded | 918 / recorded; NULL / unknown | 12.0204269 / 3.552494098525599 | `/events/3136/resultRows/4` / `/histories/1284/parties/4` |
| `event-0bc8c51c406c0e5f49c66b37-r5` / PRD | 3.836585 / recorded / recorded | 293 / recorded; NULL / unknown | 3.836585 / 1.1338570488758175 | `/events/3136/resultRows/5` / `/histories/1284/parties/5` |

Justin decision — exact group scope: 5 bundles / 15 new scalar changes.

- [ ] Accept all listed sibling three-field withholds for MX-G27
- [ ] Reject the new withholds; retain open event conflict and current siblings pending evidence
- [ ] Request evidenced numeric replacement; identify primary packet and locators before proposing numbers

Reviewer/date: ____________________. No selection is prefilled.

## Decision outcome and limits

The proposed new disposition is 95 withholds, zero keep-as-is certifications, zero numeric replacements and zero changes applied. “Reject” leaves the baseline untouched; it is not a scientific endorsement of the shares. Whole-event validation remains open for all 27 groups under every default outcome in this pack. No votes/seats/identities are deleted, no official percentages or certified totals invented, and no API catalogue namespace inferred. All execution CI is **Not run**. See [checklist](Prompt_M_Sibling_Reconciliation_and_CI.md), [inventory](Mexico_Sibling_Inventory.json) and [validation](Mexico_Sibling_Validation.json).
