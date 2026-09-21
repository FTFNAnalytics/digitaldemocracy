# Prompt AE — Spain field-map and CI checklist

DRAFT for Justin/Cursor review. Mapping and documentary validation are distinct from implementation. No repository, importer, SQLite, VPS or UI action occurred. All production approval boxes remain unchecked.

## Required research / mapping work

| Requirement | Status | Evidence |
|---|---|---|
| Pin actual main and unchanged contracts | Done | Spain_Input_Inventory.json /pin, /contracts |
| Full current INE municipal territorial set | Done | 8,132 codes; register-source-rows.json, validator |
| Explicit current institutional-mode limitation | Done — open research gate | Spain_Research_Gaps.md ES-G01; 3,762 current pending modes + 78 currency holds |
| Historical office retention, no guessed successors | Done | Four historical codes; Identity Rules; ES-G06 |
| National/autonomous/provincial/foral/island scope | Done — reconciliation holds documented | Full Register Report scope table; office origins |
| Correct ordinary alcalde versus concejo abierto distinction | Done | Acceptance examples 1–3; LOREG origins |
| Draft tiers exactly 1:1, no automatic approval | Done | schemas/atlas/tiers/spain.json; human-review.json |
| Complete 223-column / 20-table mapping | Done | Spain_Field_Map.md, column-map.json |
| Deterministic full office/event/result/source/geography vectors | Done | Spain_Identity_Vectors.json |
| Fingerprint/release/attempt distinction | Done | Inventory /hash_inputs; Identity Rules |
| Event overlap, original/correction distinction | Done — correction research open | result-publication-bindings.json; disputed duplicate inventory |
| Missing versus zero and uncertainty | Done | Acceptance numeric examples; source cells retained |
| Raw/unknown column retention and source recovery | Done | original sources, derived source blocks, field map |
| Unresolved citations versus broken known FK | Done | Field Map evidence sections; acceptance example |
| At least 15 worked acceptance examples | Done | Spain_Acceptance_Examples.md (28 examples) |
| Source hashes, protected-repository non-mutation | Done | Inventory and validation.json; research-only output location |
| Publication ownership, unrelated lineages, incomplete refresh | Done | Identity Rules; future protocol in Field Map |
| Package validator and checksum manifest | Done | validate.py; validation.json; SHA256SUMS |
| Research complete / all result corrections accepted | **Not complete** | ES-G01–ES-G12; country coverage remains partial |

## Future importer / publication execution gates

| Gate | Execution status | Required assertion |
|---|---|---|
| Tier approval precondition | Not run | Draft never counts as approved regional coverage; retain all residual holds |
| Unchanged re-import | Not run | New durable attempt ID, identical lineage R |
| Corrected effective input/override | Not run | New R, stable entity IDs, guarded originals preserved |
| Poison FK rollback | Not run | Candidate discarded; durable failure remains; prior set serves |
| Broken resolved source | Not run | Fail closed, no fabricated source/unresolved escape |
| Actual unresolved source token | Not run | Verbatim token + locator + reason, real target, no fake source FK |
| Missing≠zero / date precision | Not run | NULL/status pairs, explicit 0, no invented polling day |
| Candidate marks / national totals | Not run | No double-counting province totals or treating marks as electors |
| Original/correction / duplicate dispute | Not run | Exact guarded reconciliation before final-result claims |
| Fixture exclusion | Not run | Reject FIX-/FXT- and semantic fixture content |
| Incomplete refresh | Not run | Omitted prior identities retained with source hashes or fail |
| Cross-lineage publication | Not run | LatAm/NZ/other Europe rows and release IDs unchanged |
| SQLite integrity/FK/cycle gates | Not run | All typed FKs, semantic raw refs, dates and graph invariants pass |
| Same-filesystem WAL/atomic publication | Not run | Checkpoint/close/fsync/rename/directory-fsync; last-good rollback |
| Crash recovery / restore drill | Not run | Reconcile receipt with durable ledger and preserved backups |
| Web alerts / /atlas / VPS | Not run | Alert window filters only upcoming; no redirects or deployment here |

- [ ] Justin accepts draft tier classification scope.
- [ ] Justin accepts or keeps each named research hold.
- [ ] Justin approves a future implementation plan separately.
