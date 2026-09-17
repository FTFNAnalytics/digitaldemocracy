# Prompt O — tier draft, field map and CI checklist

**Mapping complete; tiers unapproved; execution gates Not run.** Package PR #15 `98408339e233e8580ec535cc24e8762ff5c6533f`, main contracts `6e6426fe17f6f542b58b68f8607124e007b852ff`. Tier draft SHA `3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1`.13 exact office IDs, all proposed regional; three focused entity reviews.39 source histories+13 expected next events, 749 detailed return rows. No importer code, DDL, SQL row load, VPS, UI, other-country or continuity change; applied_changes=0.

## Required mapping outputs

| Required row | Status | Pointer |
| --- | --- | --- |
| Pinned main/PR #15 immutable inputs | Done | Input Inventory pins/manifest; Field Map opening |
| Seven outer files and exact gzip chunk | Done | Input Inventory outer_file_inventory/manifest.chunks |
| All 27 members and original workbook provenance | Done | Input Inventory unpacked_member_inventory/workbook_provenance |
| Exact 13-office tier set and register hash/bytes | Done | Tier source_register/classifications |
| Entity versus canton distinctions; no Brčko invented | Done | Field Map Entity and canton distinctions; Examples 1–3 |
| Tier draft approval/focused-review gate | Done | Field Map office_tier_classification; T rules/notes |
| All 223 destination columns in20 tables | Done | Bosnia_Field_Map.md per-table sections |
| All source columns in9 supplied tables | Done | Field Map Complete source-column disposition |
| Master 39/standalone39 overlap adds zero | Done | Field Map History overlap; Example 4 |
| 749 detailed-return bindings | Done | Field Map result_row; Identity Rules Results; Example 6 |
| Office/geography/event/result/source identities | Done | Bosnia_Identity_Rules.md; Bosnia_Identity_Vectors.json |
| Physical and semantic result bindings | Done | Identity Rules Results; Example 13 |
| Packed retention and immutable recovery | Done | Field Map Source notation; Input Inventory |
| 52 date identities with historical year precision | Done | Identity Rules Dates; Examples 4/5/16 |
| Expected scheduled day stays uncertain | Done | Field Map Date policy; Example 5 |
| Missing versus zero seat status | Done | Field Map result_row; Example 7 |
| Published Others not expanded | Done | Field Map research limitations; Example 8 |
| Unresolved evidence versus broken known FK | Done | Field Map Evidence and sources; Example 11 |
| 28 catalogue+2 inline source union | Done | Field Map Sources; Identity Rules Sources; Example 10 |
| No invented proceeding/party mapping | Done | Field Map proceeding/party_mapping; Example 9 |
| RS replacement/repeat and coalition gaps open | Done | T notes; Field Map Open research reviews; Examples 9/17 |
| No fabricated polling/control/metric rows | Done | Field Map raw retention; Example 17 |
| Release versus attempt and full publication set | Done | Identity Rules Fingerprint/Coexistence; Example 12 |
| Incomplete refresh and guarded correction | Done | Identity Rules Overrides; Examples 13/14 |
| 17 worked examples with exact locators | Done | Bosnia_Acceptance_Examples.md |
| Validation and protected bytes | Done | validation.json; root SHA256SUMS |

Done means supplied documentation/artifacts and documentary checks, not Justin approval or importer acceptance. Exact path for tier is schemas/atlas/tiers/bosnia-and-herzegovina.json; all documents below docs/phase1/bosnia-and-herzegovina/.

## Future importer and publication CI

| Gate | Execution status | Required assertion |
| --- | --- | --- |
| Accepted tier preflight | **Not run** | Reject draft T in production; future approved bytes and cleared accepted row flags must exactly cover effective offices. No automatic promotion. |
| Unchanged re-import | **Not run** | Two real attempts, different UUIDs, same approved effective R; unrelated-lineage changes do not affect Bosnia R. |
| Corrected import/guard | **Not run** | Changed package/tier/accepted override/adapter/method/schema changes R; stable IDs survive; wrong expected_original fails. |
| Payload integrity | **Not run** | Validate chunk ordering/hash/length, concat gzipSHA, inventory/all 27 members, safe paths and 35 baseline inputs; missing/corrupt/unlisted input fails. |
| History/result counts | **Not run** | 13 offices, 39 selected histories+13 next=52 events, 749 results; H/IX 39 exact overlap; no double-counting HTML/summary. |
| Entity/canton preservation | **Not run** | BA-F/BA-R/BA-G scopes preserved; BA-G not Brčko; no municipal or parent-geography invention; G bindings remain distinct. |
| Calendar qualifier | **Not run** | 13 source next dates2026-10-04, precision day/certainty expected; no called/statutory inference; approved-only regional counts and explicit pending state. |
| Date precision/conflicts | **Not run** | 39 year-only histories; future month/range/unknown/conflict probes; event unknown has nonnull unknown-date row; conflict selected pointer withheld. |
| Numeric fidelity | **Not run** | 749 positive votes/shares; seats 293 positive/369 zero/87 missing; no numeric recomputation; exact type/domain/value-status checks. |
| Residual Others and coverage | **Not run** | Keep supplied Others rows intact; no inferred complete breakdown, governing control, current holder or competition computation. |
| Source/evidence FKs | **Not run** | 28+2=30 canonical sources; preserve URL fragments; real unknown token explicit; missing known source or target fails closed. |
| Poison rollback and ledger | **Not run** | Break full event/source FK; staging rolled back/discarded, durable failed attempt survives, no successful release minted, last good master serving. |
| Fixture exclusion | **Not run** | Reject FIX-/FXT- IDs and fixture provenance in typed/retained content; test probes isolated, never published. |
| Incomplete refresh | **Not run** | Carry omitted prior rows/aliases/provenance; inherited paths enter effective fingerprint; no implicit withdrawal or deletion. |
| Result identity reorder | **Not run** | Resolve semantic aliases before row order; no index recycling; ambiguous renamed/duplicate identity requires accepted binding. |
| Full SQL integrity | **Not run** | foreign_key_check/integrity_check, required classification FK, typed locator shapes, date/parent/supersession acyclicity, invalid statuses fail. |
| Publication coexistence | **Not run** | Other Europe/LatAm/NZ rows and selected releases/citations unchanged; record cites own lineage release, not newest receipt. |
| Atomic publication/recovery | **Not run** | Consistent backup, same-FS staging, WAL checkpoint/close, fsync/rename/directory fsync, reader reopen, receipt crash recovery and restore drill. |
| RS research-gap fidelity | **Not run** | No extra replacement/repeat dates/events/proceedings; unreconciled coalition notes stay visible; no invented primary/legal verification. |
| VPS/UI/redirects | **Not run** | No deployment/UI or /electiondatabase retirement in Prompt O; website ingestion remains pending. |

## Validation actually performed

Frozen package validator, ordered chunk/payload/member hashes, original archive/workbook recovery, exact office-ID set, full 223-column coverage, 39-key master/index overlap, 749 detailed-return joins, source/numeric checks, independent deterministic vector recomputation, source locator checks and ZIP manifest verification. None loads SQLite or runs importer/publication/application tests. validation.json records scope and results. SHA256SUMS covers every payload except itself; external receipt supplies manifest/ZIP hashes to avoid impossible self-hash recursion.
