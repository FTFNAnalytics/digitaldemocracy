# Prompt V — Czechia field-map and CI checklist

Mapping and documentary checks are complete; operational execution is Not run. Tiers are draft.

## Mapping deliverables

| Requirement | State | Pointer |
|---|---|---|
| Current + historical register | Done | office-register.json; Report scope table; validator exact source ID sets |
| Draft1:1 tiers | Done | schemas/atlas/tiers/czechia.json; exact6,424 IDs |
| Prague dual body and boroughs | Done | Field Map granularity; Examples1–2 |
| Council-selected versus direct executives | Done | Identity Rules; Example5; executive counts |
| Historic returns and source bindings | Done | results.jsonl.gz; validator reprojects every result |
| Round and by-election binding | Done | Examples10–11; proceedings.json; source catalogue date types |
| Missing versus zero | Done | Example8; not-held Example13 |
| Share semantic inventory | Done | share-semantic-review.json; Example9; raw.PROCHLSTR |
| Date precision and alert policy | Done | Examples3,6,7; Field Map research_date |
| Territorial/historical holds | Done | Research Gaps; Examples4,21 |
| Full223-column map | Done | column-map.json; Field Map20 sections; unchanged DDL comparison |
| Deterministic vectors and fingerprint | Done | Identity Rules; complete JSON/JSONL vectors; Examples15–16 |
| Retained inputs/unknown fields | Done | Input Inventory; exact source archives; raw envelopes |
| Evidence/FK and unresolved distinction | Done | Example17; sparse record_locator contract |
| Incomplete refresh and multi-lineage continuity | Done | Examples18–19; Field Map publication protocol |
| Justin approvals unchecked | Done | README and Report; no accepted override or tier approval |
| Documentary validator and package hashes | Done | validate_pack.py; validation.json; SHA256SUMS |

## Future implementation/publication gates

| Gate | Execution |
|---|---|
| Unchanged re-import → new attempt, same release | Not run |
| Changed accepted effective input → new release, preserved natural IDs | Not run |
| Poison FK rollback; separate durable failed-attempt log | Not run |
| Broken resolved-source references fail closed | Not run |
| Missing primary claims explicitly unresolved, no fabricated FK | Not run |
| Prospective/not-held placeholders excluded from observed results | Not run |
| Municipal PROCHLSTR hold accepted or reviewed with evidenced semantic disposition | Not run |
| Missing≠zero and absent XML mandate NULL | Not run |
| Round1/round2 and aggregate granularity no double-count | Not run |
| Year/day/uncertain date precision; no XML generation-time dates | Not run |
| Tier status approval preflight and exact ID set | Not run |
| No invented local executive office; Prague counted once | Not run |
| Fixture exclusion | Not run |
| Historical alias/merger disposition stays explicit | Not run |
| Incomplete refresh carry-or-fail; no automatic deletion | Not run |
| Other lineage release IDs and citations unchanged | Not run |
| Staging snapshot/copy, counts and PRAGMA foreign_key_check | Not run |
| WAL checkpoint, close, fsync, same-FS atomic rename | Not run |
| Publication set/receipt and durable attempt ledger recovery | Not run |
| Live UI/VPS smoke test; no cutover redirects | Not run |

- [ ] Justin accepts research scope and named holds.
- [ ] Justin approves tier draft.
- [ ] Justin authorizes a future implementation/publication task.

`applied_changes=0` for repository/importer/SQLite/VPS/UI. Documentary validation does not make publication ready.
