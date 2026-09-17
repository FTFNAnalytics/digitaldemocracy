# Prompt M — sibling reconciliation and CI checklist

Pinned main `6e6426fe17f6f542b58b68f8607124e007b852ff`. Production override `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9` remains unchanged. This is documentation and a non-executable proposal only. Inventory/report/proposal work is **Done**; every execution gate is **Not run**. Zero applied changes, no importer/DDL/tier/UI/VPS work.

## Required documentation outputs

| Requirement | Status | Pointer |
| --- | --- | --- |
| Pin exact current main and immutable source blobs | Done | [Mexico_Sibling_Validation.json](Mexico_Sibling_Validation.json) — pinned_main_commit and checks |
| Accepted override SHA and 201 scalar guards preserved | Done | [Mexico_Sibling_Inventory.json](Mexico_Sibling_Inventory.json) — accepted_override; accepted_exception_result_ids |
| Approved Mexico tier unchanged; no other country/residual edits | Done | [Mexico_Sibling_Validation.json](Mexico_Sibling_Validation.json) — protected bytes and repository clean |
| 95 unique siblings; zero overlap with 67; 162-row partition | Done | [Mexico_Sibling_Inventory.json](Mexico_Sibling_Inventory.json) — counts, unchanged_sibling_result_ids, groups |
| All 27 groups, including MX-G11 zero siblings | Done | [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md) — Group summary and exact group decisions |
| Every sibling full PK/event/HK/current numeric+status values | Done | [Mexico_Sibling_Inventory.json](Mexico_Sibling_Inventory.json) — siblings[].current and full target identity |
| Original/derivative/member pointers and both raw share fields | Done | [Mexico_Sibling_Inventory.json](Mexico_Sibling_Inventory.json) — siblings[].origin/original_origin/raw_share_fields/membership_origin |
| Event denominators,basis,scope,completeness diagnosis | Done | [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md) — Arithmetic findings and 27 per-group diagnostic tables |
| Primary evidence required for future numerical resolution | Done | [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md) — Primary evidence required before numeric reconciliation |
| 95 indivisible bundles/285 guarded scalar proposals | Done | [mexico-sibling-reconciliation-PROPOSED.json](mexico-sibling-reconciliation-PROPOSED.json) — bundles and changes; full 12-key contract |
| No numeric alternate selected; no superseding original 67 | Done | [mexico-sibling-reconciliation-PROPOSED.json](mexico-sibling-reconciliation-PROPOSED.json) — predecessor and claims; supersedes_change_id NULL |
| Justin pending accept/reject checkboxes per group | Done | [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md) — Exact group decisions; all unchecked |
| Explicit draft/non-executable markers and no applied changes | Done | [mexico-sibling-reconciliation-PROPOSED.json](mexico-sibling-reconciliation-PROPOSED.json) — root flags and applied_changes=0 |
| Runtime integration limits identified without code changes | Done | [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md) — Implementation boundary: single file/exact 201 loop |
| Hashes, source/guard/claim validation and manifest | Done | [Mexico_Sibling_Validation.json](Mexico_Sibling_Validation.json) — documentation-only checks; SHA256SUMS |

## Future acceptance, importer and publication CI

These are requirements for a separately authorized implementation. Read-only arithmetic and JSON guard checks performed for this pack are not importer/SQLite/publication tests.

| Gate | Execution status | Required assertion |
| --- | --- | --- |
| Draft exclusion | Not run | Production discovery must ignore this docs proposal and reject false/missing acceptance/executable flags; no effect by default. |
| Predecessor hash | Not run | Require full live predecessor SHA and effective67 bundles/201 changes; drift needs review, no silent replacement. |
| Exact identity and guards | Not run | Validate all 4 PK components plus event/HK binding, source hashes and exact field values/types; result_row_id-only matching is insufficient. |
| Acceptance scope | Not run | Only Justin-named accepted groups/bundles execute; unaccepted/rejected groups untouched; MX-G11 produces0 new changes. |
| Indivisible bundles | Not run | Reject missing/extra/duplicate bundle members; apply share NULL,share_status unknown,evidence_status disputed atomically. |
| Conflict/supersedes rules | Not run | Reject unsuperseded competing changes and unknown target fields; later restores require explicit superseding claims; preserve predecessor audit. |
| Original67 regression | Not run | All 67 original shares remain NULL/unknown/disputed; no overlap with 95; combined162 only if all 95 accepted. |
| No other-field changes | Not run | Votes,seats,units,office/event/result/source IDs,basis and tier bytes remain unchanged; retained unknown seats do not become0. |
| Evidence fidelity | Not run | Preserve both supplied/raw alternate claims and origins; existing source FKs resolve; missing known source fails closed; unmatched tokens explicit. |
| Research status | Not run | All 27 event conflicts remain open; no reconciled/certified vector label or score-gate clearance from withholding alone. |
| Negative guard/hash/FK rollback | Not run | Poison mismatch,changed source hash,partial bundle or missing FK aborts whole stage; last good publication served and durable failed attempt remains. |
| Idempotency and fingerprint | Not run | Accepted effective amendment changes LatAm release only; unchanged re-import fresh attempt_id/same release_id; never reapply NULL as original numeric guard. |
| Publication coexistence | Not run | Europe/NZ and unrelated rows/releases/citations remain unchanged; own lineage/release resolves citations, not latest receipt. |
| Fixture exclusion | Not run | Test-only draft/fixtures/FIX-/FXT- identities cannot enter production publication. |
| Recovery and incomplete refresh | Not run | Original claims/source bytes/old release snapshots remain recoverable; omission is not deletion; proper inherited-input fingerprint. |
| Runtime amendment support | Not run | Implement only under separate authorization: single-file/exact 201 loop must be deliberately extended for accepted additive scope and full guards, not bypassed. |
| Atomic publication | Not run | Existing same-FS staging,WAL checkpoint,fsync,atomic swap,receipt recovery,separate durable attempt ledger apply; failed stage retains prior publication. |

## Application constraints

95 recommendations remain pending Justin.285 draft scalars in95 bundles are additive to the immutable accepted 201, not a replacement. If every new bundle is later accepted, 486 total scalar dispositions affect162 existing rows; all 27 event conflicts remain open. A selected subset must be counted from its exact bundle IDs, not hard-coded95/285. MX-G11 is a reviewed zero-new-change group. No checkboxes or root production flags are accepted by this task.

The current implementation's hard-coded201 check means this draft is deliberately not executable as-is. Scope expansion, full-PK/bundle/source guards and acceptance enforcement remain future implementation work; no count assertion is silently relaxed. The already-approved Mexico tier is unrelated to electoral denominator reconciliation.
