# Prompt P — tier / field-map / CI checklist

Main `00c2ea7458ad7705aad487c4a7665d9d343b5554`, PR #16 `de3541276cd37ca749b740c229cee67475f0d317`. **Done** below means mapping/documentation verified; it is not importer success or research completeness. Justin accepted the 530 municipality-wide rows on 2026-09-19 and held the 3,067 district/village rows. **Importer / SQLite / VPS / UI = Not run; applied_changes=0.**

## Mapping deliverables

| Item | Status | Pointer |
| --- | --- | --- |
| Pins and governing contract read | Done | Input Inventory → pinned_main_commit/package; Field Map introduction |
| Frozen validator and 48 chunks verified | Done | Input Inventory; validation.json |
| Exact 3597 office tier set | Done | Tier JSON; validation.json |
| Municipal/submunicipal evidence and review flags | Done | Tier rules/classifications; Examples1–3 |
| Register SHA/bytes and candidate tier hash | Done | Input Inventory → source_register/tier_candidate_sha256 |
| All 223 destination columns mapped | Done | Field Map table sections |
| All 15 source tables/columns mapped | Done | Field Map → Source-column coverage |
| O/J register and H/IX history overlap reconciled | Done | Field Map baseline; Example4 |
| Detailed25817 full-HK bindings | Done | Vectors results; Examples8–10 |
| F7746/X2591 lossless disposition | Done | Vectors retained_observation_bindings; Examples5–7 |
| Six unbound Градец rows retained | Done | Input Inventory → first_round_unbound |
| Geography name collisions prevented | Done | Identity Rules geography; Inventory collision groups |
| Complete deterministic office/event/result/source vectors | Done | Bulgaria_Identity_Vectors.json |
| No pending-date fabrication; 0 regional | Done | Example11 |
| Dates and certainty independent | Done | Example12 |
| Missing vs zero and percentage-only vectors | Done | Examples8–10 |
| Source union/aliases and unresolved policy | Done | Examples13–14 |
| Research gaps, raw fields, score gates retained | Done | Field Map; Example15 |
| Fingerprint, attempts and incomplete refresh | Done | Identity Rules; Examples16–17 |
| Publication set and rollback specified | Done | Field Map publication; CI rows below |
| Tier approvals recorded (530 accepted / 3067 held) and protected bytes unchanged | Done | README; validation.json; Prompt_P_Bulgaria_Tiers_Accepted.md |
| ZIP checksums match | Done | SHA256SUMS and external receipt |

## Future execution gates

| Gate | Status | Required assertion |
| --- | --- | --- |
| Tier approval | Not run | Only the 530 Justin-accepted municipality-wide rows may publish; 3067 held submunicipal rows stay unpublished until policy changes. No draft or unresolved scope promoted. |
| Unchanged re-import | Not run | New attempt, same approved effective fingerprint/R and record identities. |
| Corrected import | Not run | Changed package/tier/override/version→new R; prior release auditable; stable identities. |
| Poison rollback | Not run | Failed staging discarded, separate durable failure ledger, last good stays served. |
| Resolved FKs | Not run | Broken office/geography/event/source reference fails closed. |
| Unresolved token | Not run | Exact token/locator/reason retained without made-up source FK. |
| Missing/zero | Not run | 587 unknown votes distinct from 26 zero votes; zero shares/seats preserved. |
| Dates | Not run | ISO-day certainty unknown; partial/range/conditional fixtures retain precision without invented day. |
| Tier source | Not run | T only; never cohort label or province-code inference; regional 0 passes. |
| No double-count | Not run | O/J one office set; H/IX one8661event set; F/X no extra completed cycles. |
| Stage retention | Not run | All F/X observations/source pointers retrievable; Градец exclusion exact. |
| Geography collisions | Not run | 3597 unique office-scoped Gs; no ambiguous legacy aliases. |
| Result identity refresh | Not run | Reorder/correct numbers preserves semantic IDs; ambiguous rename requires binding. |
| Fixture exclusion | Not run | FIX-/FXT-/OBSERVATORY_FIXTURES absent in production effective rows/raw dependencies. |
| Incomplete refresh | Not run | Omitted prior records and original input/tiers/aliases retained with effective fingerprint. |
| Coverage/metrics | Not run | Partial coverage stays; score gates/raw retained, no tightness/control forecast. |
| Unrelated lineages | Not run | Other publication members and record-owned citations unchanged. |
| SQLite constraints | Not run | FK/integrity checks and shape/status constraints on future staging. |
| Atomic publication | Not run | Consistent backup, same-FS staging, WAL checkpoint, close/fsync/rename/reopen. |
| Crash/restore | Not run | Receipt reconciliation and off-VPS restore demonstrated. |
| No cutover | Not run | No redirects, /electiondatabase retirement or UI/VPS changes in implementation scope without separate authorization. |

## Justin decisions — 2026-09-19

- [x] Accept 530 municipality-wide tier proposals.
- [ ] Accept or amend 3067 district/village municipal grouping proposals; clear focused flags only with explicit category/row decision. **HOLD — policy still open.**
- [ ] Accept office-ID geography disambiguation and explicit stage-retention policy for future adapter.
- [x] Keep research/calendar/qualification-change notes open as listed.
- [x] Land the country tier pack with 530 production-approved and 3067 held (this commit). Full pack approval still waits on submunicipal policy.

Municipality-wide accepted. District/village policy still open. No importer, DDL edit, VPS/UI work, continuity/Mexico edit, or `/electiondatabase` redirect change is authorized by this landing.
