# Prompt J field map and CI checklist

**Documentation draft; pinned `bc1d1a9b1c437ca0da309e3820967d4e29ff919d`.** Chosen path: `docs/phase1/andorra/`. Approved Andorra tier bytes are unchanged (`b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014`). Seven municipal, zero regional. Albania remains completed Phase 1 storage proof. These Done rows refer only to mapping/source verification; all future Andorra importer, application and publication execution gates below are **Not run**.

## Required mapping outputs

| Status | Mapping work | Pointer |
| --- | --- | --- |
| Done | Every `dataset_lineage` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: dataset_lineage](Andorra_Field_Map.md#dataset_lineage) |
| Done | Every `dataset_release` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: dataset_release](Andorra_Field_Map.md#dataset_release) |
| Done | Every `retained_input` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: retained_input](Andorra_Field_Map.md#retained_input) |
| Done | Every `country` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: country](Andorra_Field_Map.md#country) |
| Done | Every `geography` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: geography](Andorra_Field_Map.md#geography) |
| Done | Every `office` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: office](Andorra_Field_Map.md#office) |
| Done | Every `office_tier_classification` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: office_tier_classification](Andorra_Field_Map.md#office_tier_classification) |
| Done | Every `research_date` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: research_date](Andorra_Field_Map.md#research_date) |
| Done | Every `election_event` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: election_event](Andorra_Field_Map.md#election_event) |
| Done | Every `proceeding` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: proceeding](Andorra_Field_Map.md#proceeding) |
| Done | Every `result_row` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: result_row](Andorra_Field_Map.md#result_row) |
| Done | Every `party_mapping` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: party_mapping](Andorra_Field_Map.md#party_mapping) |
| Done | Every `source` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: source](Andorra_Field_Map.md#source) |
| Done | Every `record_locator` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: record_locator](Andorra_Field_Map.md#record_locator) |
| Done | Every `evidence_link` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: evidence_link](Andorra_Field_Map.md#evidence_link) |
| Done | Every `unresolved_evidence` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: unresolved_evidence](Andorra_Field_Map.md#unresolved_evidence) |
| Done | Every `identity_crosswalk` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: identity_crosswalk](Andorra_Field_Map.md#identity_crosswalk) |
| Done | Every `publication_release` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: publication_release](Andorra_Field_Map.md#publication_release) |
| Done | Every `publication_receipt` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: publication_receipt](Andorra_Field_Map.md#publication_receipt) |
| Done | Every `ingest_attempt` destination column: source, conversion/null, deterministic identity, evidence/FK and validation | [Field map: ingest_attempt](Andorra_Field_Map.md#ingest_attempt) |
| Done | Frozen package inventory, all 11 tables and unknown/raw columns | [Specification](Andorra_Field_Map.md#source-column-coverage-and-unknown-fields) |
| Done | 28 exact input descriptors, register/tier/DDL hashes and candidate fingerprint | [Specification](Andorra_Input_Inventory.json) |
| Done | Namespaced office, trailing-empty HK, event/result/source aliases and all ID vectors | [Specification](Andorra_Identity_Rules.md#histories-and-public-event-ids) |
| Done | Partial dates, unknown next date and conflicts | [Specification](Andorra_Field_Map.md#dates) |
| Done | 7 approved municipal / 0 regional and honest empty state | [Specification](Andorra_Acceptance_Examples.md#example-4--approved-municipal-tiers-and-honest-empty-regional-calendar) |
| Done | Control/poll/score gates and inert HTML retention | [Specification](Andorra_Field_Map.md#ancillary-retention-and-score-gates) |
| Done | No invented proceedings/party concordance; evidence and unresolved tokens | [Specification](Andorra_Field_Map.md#evidence-traversal-and-resolution) |
| Done | Incomplete refresh, overrides and identity retention | [Specification](Andorra_Identity_Rules.md#overrides-and-retained-identities) |
| Done | At least five worked examples: twelve supplied, source vs CI mutations labelled | [Specification](Andorra_Acceptance_Examples.md) |
| Done | Publication set, durable attempts, rollback and filesystem protocol | [Specification](Andorra_Field_Map.md#publication-and-continuity) |
| Done | All protected bytes remain unchanged; SHA manifest checked | [Specification](validation.json) |

## Future importer and publication CI

Future implementation must use the actual Andorra import/publication path in isolated scratch databases, not only unit-test mirrored transforms. Existing migrate:atlas/ledger contracts remain authoritative. Enable and verify foreign_keys=ON and recursive_triggers=ON on each applicable connection. Fail any SQL error; no INSERT OR REPLACE. No VPS or application execution in Prompt J.

| Status | Gate | Required assertion |
| --- | --- | --- |
| Not run | Migration/schema compatibility | Both unchanged migrations, separate ledger/master, supported STRICT/JSON, expected version/hash. Empty DB is not ingest proof. |
| Not run | Actual Andorra fidelity | Exact 7 office/tier IDs, 7 geographies, 21 selected events, 53 results, 13 sources (10 catalogue+3 inline), 21 date rows (7 day/14 year), 7 controls/1 poll/7 briefings retained; all 28 inputs. Compare semantic values/IDs, not totals alone. |
| Not run | Unchanged re-import | Two calls, new attempt IDs, same fingerprint/R, IDs, dates and semantic content; one immutable release. Operational receipt may change. |
| Not run | Corrected import | Isolated source/accepted override or version change → new Andorra R; unchanged identities preserved; expected_original enforced; previous rows recoverable via snapshot. |
| Not run | Poison rollback | After partial staged writes inject dangling source/event FK; fail before validation and before rename; last good master remains served, failed durable attempt survives discarded stage, no success-release pointer. |
| Not run | Broken references | Country/geography/office/event/proceeding/party/resolved-source FKs and locators/crosswalks fail closed; no partial composite reference; integrity_check=ok, foreign_key_check empty on candidate. |
| Not run | Genuine unresolved evidence | Explicit unmatched token/origin/reason retained, target exists, no source fabricated; missing known resolved source still fatal. |
| Not run | Public IDs and namespace | Every companion bridge ID/HK/source alias resolves unchanged; different namespaces never cross-link; result reorder cannot swap candidates. |
| Not run | Tier file authority | Approved T exact hash/status; one row per office, exact ID equality, all municipal; changing calendar Tier cannot change classification. National→national_context; unknown→NULL/unknown, never other. |
| Not run | Zero regional and calendar empty state | Country-scoped regional query returns zero and explicit no-regional-tier label; unknown regional denominator; no positive count gate or invented office. Europe remains default. |
| Not run | Missing ≠ zero | Nine actual zero-seat results retain zero status, raw Encamp score0 differs from Canillo null; synthetic numeric missing/zero probes preserve statuses; no missing elected/substitute→false. Shares keep precision. |
| Not run | Precision/certainty | Real 14 year-only histories stay year; seven day histories stay day; seven unknown next dates stay unknown. Synthetic month/range/conditional/conflict probes preserve precision, overlap and claims; invalid dates/range cycles fail. |
| Not run | Fixture exclusion | Reject FIX-/FXT- IDs, fixture namespaces/provenance/payload anywhere including retained inputs; OBSERVATORY_FIXTURES cannot admit production rows. |
| Not run | Raw and score gates | All 11 tables/unknown fields/formula caches/HTML byte hashes round-trip; false gate remains false, withheld remains withheld; no metric recomputation or local forecast. |
| Not run | Ancillary and artifact fidelity | Preserve 7 dated controls, poll denominators/limitations, all HTML locators and observation/poll aliases; no script execution, invented tenure or source metadata. |
| Not run | Incomplete refresh | Omitted office/event/result/source/tier retained from real prior publication; inherited inputs hashed, effective tier union exact; fresh incomplete first import fails. Explicit withdrawal alone changes state. |
| Not run | Multi-lineage publication | Existing Albania/LatAm/NZ/other selected releases, rows and citations unchanged by Andorra-only import; complete publication set retained; no other-lineage hash dependency. |
| Not run | Filesystem / crash recovery | Writer contention, same-FS stage, consistent backup, busy checkpoint, closed connections/sidecars, fsync failure, atomic rename, crash before/after swap/ledger update; last good serves or receipt is reconciled. |
| Not run | Durable attempt audit | started committed before staging; terminal append-only semantics, logical success linkage matches receipt/whole set; failure audit survives discarded stage. |
| Not run | Backup / restore | Restore prior complete snapshot in scratch; known office/event ID and release set/schema verify; release metadata alone is insufficient. |
| Not run | Existing project gates | npm test, npm run lint, npm run validate:data, npm run build with future implementation; no unrelated UI/routes/DDL/package changes. |

## Checks completed for documentation

Read-only frozen package validator and listed hash checks passed. Independent source inventory, canonical hash vectors, row pointers/ID equality, all-table/column coverage and final archive manifest were verified (see validation.json). No importer was written, no SQLite research rows loaded, no approval/status changes made. Research remains partial; the documentation does not establish cutover readiness.
