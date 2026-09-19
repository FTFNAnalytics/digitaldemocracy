# Prompt S2 — full-register field-map and CI checklist

Review pack main `01602ea88de411fd712858e10e3f559d5ceb3ee1`; landing base `b293da99b97a8ae008d87ee2e57210cde0678004`. Mapping and artifact checks in this Prompt S2 landing were separate from importer execution. Justin accepted all 1,179 current + 55 historical draft offices on 2026-09-19. The follow-up importer is `ATLAS_IMPORT_SCOPE=belgium` — see [Belgium_Import.md](Belgium_Import.md).

| Requirement | Status | Evidence / future gate |
|---|---|---|
| Register and source-byte inventory | **Done** | Belgium_Input_Inventory.json; data/research/belgium-s2/office-register.json |
| All565 municipality pairs; window-independent retention | **Done** | Report; Acceptance1–6 |
| Historic events/results and overlap rules | **Done** | Field Map / Research projection; Acceptance7–11 |
| Full223destination-column map | **Done** | Belgium_Field_Map.md,20table sections |
| Office/event/result/source/geography vectors | **Done** | Belgium_Identity_Vectors.json; Identity Rules |
| Draft tiers exact ID coverage; full accept | **Done** | schemas/atlas/tiers/belgium.json (approved 1,234) |
| Missing/zero and date conflict policy | **Done** | Acceptance5,9; Field Map research_date/result_row |
| Future office, body and historic research gaps documented | **Done** | Report and tier notes; completeness is not claimed |
| Every public position / indirect-body universe reconciled | **Open research** | Social-welfare and community-commission organs, executive/individual seat census not certified complete |
| Justin register/tier/hold approval | **Accepted 2026-09-19** | All 1,234 draft offices; remaining-universe notes stay open |
| Source publication and rights review | **Open** | Catalogue has no invented licence; not a blocker for office acceptance |
| Unchanged effective import: same R/new attempt | **Not run** | Acceptance12; future importer gate |
| Correction, inherited rows, no implicit deletions | **Not run** | Acceptance12,14 |
| Poison rollback and durable attempt ledger | **Not run** | Acceptance13 |
| Resolved-source FK rejection; explicit unresolved tokens | **Not run** | Acceptance10 |
| Fixture exclusion and identity collisions | **Not run** | Acceptance13; namespace checks |
| Tier-file-driven projection and draft rejection | **Not run** | Acceptance15 |
| Partial date/certainty and conflicting-date withholding | **Not run** | Acceptance4,9 |
| Scalar status/value checks; vote basis and overlap | **Not run** | Acceptance5,6,11,16 |
| Unrelated lineage/citation preservation | **Not run** | Acceptance15 |
| Foreign-key/integrity checks in SQLite | **Not run** | No SQLite execution authorized |
| Same-FS staging, WAL checkpoint, fsync, atomic rename | **Not run** | Field Map Publication contract |
| VPS/UI/redirects | **Not run** | Out of scope |

## Justin decisions — 2026-09-19

- [x] Accept new research register granularity and exact office IDs (1,179 current + 55 historical).
- [x] Approve 15 regional / 2 national / municipal tier proposals as drafted.
- [x] Accept 32 special-body tier proposals and retain 55 historic code bindings. Successor/code-change review stays an open note.
- [ ] Resolve Bilzen date conflict, Saint-Josse repeat and 35 unbound 2000 records. **HOLD — research notes stay open.**
- [x] Keep further primary research needed for indirect organs/current appointments as open remaining-universe notes.
- [ ] Authorize future importer implementation separately. **Not authorized in this landing.**

Office scope and history retention never depend on the alert window. No zero from the frozen screening package is a real-world denominator. No importer, DDL edit, VPS/UI work, continuity/Mexico edit, or `/electiondatabase` redirect change is authorized by this landing.
