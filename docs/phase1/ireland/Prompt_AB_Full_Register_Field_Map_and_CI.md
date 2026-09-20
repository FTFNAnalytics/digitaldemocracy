# Prompt AB — mapping checklist and future CI

Documentation/research only; no importer, SQLite, VPS, UI or repository mutation. Artifact checks are distinct from execution gates.

## Mapping work

| Required output | Status | Pointer |
| --- | --- | --- |
| Current and historical register | Done | office-register.json; Report scope table |
| All 122 proposed tiers, no approvals | Done | schemas/atlas/tiers/ireland.json |
| Every223 destination field | Done | Ireland_Field_Map.md; column-map.json |
| Stable IDs and complete vectors | Done | Ireland_Identity_Rules.md; Ireland_Identity_Vectors.json |
| Retained sources + provenance | Done | Ireland_Input_Inventory.json; sources.json |
| 2009/2014 first-count reconciliation | Done | source-extraction-audit.json; local-book-extract.json |
| STV transfer/later-count exclusions | Done | Identity Rules; examples 7–12 |
| 2014 reform and no guessed successors | Done | research-gaps.json; historical register |
| Seanad panels/nominees/university transition | Done | Report; research-gaps.json |
| Limerick direct mayor vs appointed roles | Done | Report; example4 |
| Out-of-window dates and NI exclusion | Done | Examples1,14,22 |
| Missing≠zero and source defects | Done | Examples6–10 |
| 22 worked examples | Done | Ireland_Acceptance_Examples.md |
| Artifact validation and manifest | Done | validation.json; validate_pack.py; SHA256SUMS |

## Execution/publication

| Gate | Status |
| --- | --- |
| Production tier acceptance gate (draft rejects until Justin accepts) | Not run |
| Unchanged import: fresh attempt/same lineage release | Not run |
| Changed effective input: new guarded release | Not run |
| Poison FK rollback and durable failed attempt | Not run |
| Resolved-source missing reference fails closed | Not run |
| Explicit unresolved evidence with real target | Not run |
| Fixture/test/foreign-country exclusion | Not run |
| Tier file only; zero regional allowed | Not run |
| Missing vs reportedzero and source status | Not run |
| Month/year dates retain precision and certainty | Not run |
| STV counts not new rounds/events; LEA vectors not duplicated | Not run |
| Retain omitted offices/history on incomplete refresh | Not run |
| No invented council-selected mayor/nominee/NI rows | Not run |
| Other lineage rows/releases/citations unchanged | Not run |
| Same-FS staging, WAL checkpoint, fsync atomic rename, lastgood serving | Not run |
| Integrity/FK checks, publication receipt and durable ledger reconciliation | Not run |
| No /electiondatabase redirect or route retirement | Not run |

## Justin decisions

- [ ] Accept current/historical register.
- [ ] Accept or amend draft tiers.
- [ ] Accept named holds.
- [ ] Authorize implementation separately.
