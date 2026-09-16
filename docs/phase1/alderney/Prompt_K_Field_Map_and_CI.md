# Prompt K field map and CI checklist

Main pin `73b69bdd607c2ed5f70a93b52b5cd0c66f4155c9`. Documentation folder `docs/phase1/alderney/`. Approved T unchanged, SHA-256 `e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7`; **2 other / 0 regional**. Done means mapping documented/read-only source verification, not implemented import. Every execution row below is **Not run**.

## Required mapping outputs

| Status | Work specified | Pointer |
| --- | --- | --- |
| Done | Every `dataset_lineage` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#dataset_lineage) |
| Done | Every `dataset_release` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#dataset_release) |
| Done | Every `retained_input` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#retained_input) |
| Done | Every `country` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#country) |
| Done | Every `geography` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#geography) |
| Done | Every `office` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#office) |
| Done | Every `office_tier_classification` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#office_tier_classification) |
| Done | Every `research_date` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#research_date) |
| Done | Every `election_event` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#election_event) |
| Done | Every `proceeding` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#proceeding) |
| Done | Every `result_row` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#result_row) |
| Done | Every `party_mapping` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#party_mapping) |
| Done | Every `source` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#source) |
| Done | Every `record_locator` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#record_locator) |
| Done | Every `evidence_link` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#evidence_link) |
| Done | Every `unresolved_evidence` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#unresolved_evidence) |
| Done | Every `identity_crosswalk` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#identity_crosswalk) |
| Done | Every `publication_release` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#publication_release) |
| Done | Every `publication_receipt` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#publication_receipt) |
| Done | Every `ingest_attempt` column: source, conversion/null, identity, evidence/FK and validation | [Field map](Alderney_Field_Map.md#ingest_attempt) |
| Done | Pinned main, 21 exact input hashes, approved tier and unchanged DDL | [Specification](Alderney_Input_Inventory.json) |
| Done | All nine actual table schemas, absent polling/control files and unknown raw fields | [Specification](Alderney_Field_Map.md#source-column-coverage-and-absent-tables) |
| Done | Existing office/geography/eight event/27 result/source identity vectors | [Specification](Alderney_Identity_Vectors.json) |
| Done | Two separate day-precision conditional dates and shared office/event date pointers | [Specification](Alderney_Field_Map.md#conditional-dates-and-event-attachment) |
| Done | Selected vs ordinary contextual histories; no duplicate 2024 or zero-vote unopposed rows | [Specification](Alderney_Field_Map.md#selected-histories-and-additional-ordinary-context) |
| Done | 10 worked examples with actual source locators and labelled CI mutations | [Specification](Alderney_Acceptance_Examples.md) |
| Done | Lossless artifacts, unavailable scores and research coverage limitations | [Specification](Alderney_Field_Map.md#retained-artifacts-metrics-and-coverage) |
| Done | Incomplete refresh, correction binding, publication and empty regional state | [Specification](Alderney_Identity_Rules.md#overrides-refresh-and-publication) |
| Done | Document validation and byte-preservation checks | [Specification](validation.json) |

## Future implementation and publication CI

Use actual future Alderney import/publication path in temporary local/CI databases. No tests against VPS. Existing migrate:atlas/attempt ledger contract is authoritative; foreign_keys=ON and recursive_triggers=ON must be verified per connection, all SQL errors fatal, no INSERT OR REPLACE.

| Execution | Gate | Required assertion |
| --- | --- | --- |
| Not run | Schema compatibility | Exact unchanged two migration digests, separate ledger/master, STRICT/JSON support, version1; empty DB is not ingest proof. |
| Not run | Actual fidelity | Exact 2 office IDs, 2 bridge geographies, 2 approved other classifications, 6 selected+2 prospective=8 events, 8 dates, 27 results, 7 canonical sources, 2 original briefings, 21 retained inputs. Compare values/identity, not only totals. |
| Not run | Conditional dates | STATES2026-11-21 and PLEB2026-12-12 independently day/conditional; Cal final approval unverified retained. No called/statutory upgrade, range/runoff, prospective result or invented proceeding. |
| Not run | Historical context | Select exactly H rows; BF kind matching excludes nested additional context; duplicate 2024 adds no event, unopposed2022 missing marks never0. Four ordinary/two special historical kinds. |
| Not run | Unchanged re-import | Different attempts; same canonical fingerprint/R, date/event/result/source IDs and semantic content. One immutable release; receipt may change. |
| Not run | Corrected import | Source/accepted override/version changes alter only Alderney R; expected_original enforced, unchanged public IDs retained, old full snapshot/claim recoverable. |
| Not run | Poison rollback | Failure after some staging writes/before validation/before rename leaves last good master serving; discarded staging does not erase failed attempt; no successful_release_id/new public release. |
| Not run | Broken FK references | Dangling country/geography/office/event/proceeding/party/resolved-source and wrong namespace fail closed; typed locators/crosswalks resolve, no partial composite references; integrity_check ok and foreign_key_check empty on success. |
| Not run | Unresolved citations | Real unmatched token retains exact original token/locator/reason, real target, no fabricated URL/source. Known missing resolved source remains fatal. |
| Not run | Public identities | Every vector matches bridge IDs; all event/child keys carry N. Reordered result rows cannot swap candidate IDs; old next ID cannot silently represent another election cycle. |
| Not run | Approved tier authority | Exact approved T bytes/status; ID-set equality; both other, no regional requirement, no classification from cohort. Known national→national_context; unknown→NULL/unknown, not other. |
| Not run | Territory and empty region | country kind territory/codeGG-ALD; no invented sovereign/parent. Regional numerator0 with explicit label and unknown denominator; dates do not make other-tier offices regional. |
| Not run | Missing ≠ zero | Actual13 zero-seat rows remain0/zero,14 ones preserved; raw null scores stay missing; synthetic null/zero vote/share/seat probes preserve status pairs; elected/substitute NULL not false. Marks are not voters. |
| Not run | Uncertain precision/conflicts | Actual all8 day dates plus separate certainty; isolated month/year/unknown/range/conditional/conflict probes, interval overlap, no fabricated day or unknown confirmed-in-window. Invalid dates/range cycles fail; competing dates retained and single pointer withheld. |
| Not run | Fixture exclusion | FIX-/FXT-/fixture namespaces/provenance/payloads rejected from all production entities/retained inputs; OBSERVATORY_FIXTURES cannot publish fixtures. |
| Not run | Raw/score/artifact fidelity | All unknown fields and original input hashes survive; HTML inert, original additional context retained; unavailable scores/false gates withheld; no tightness/party grouping/local forecasts. |
| Not run | Absent optional inputs | No polling/control table rows or aliases fabricated; absence labelled not supplied. Missing required file fails; optional absence cannot conceal broken references. |
| Not run | Incomplete refresh | Retain omitted prior office/event/result/source/tier/aliases from real publication; inherited bytes hashed and effective tier union exact; reduced fresh first import fails. Withdrawal explicit/addressable. |
| Not run | Multi-lineage continuity | Alderney-only re-import leaves other selected R/rows/citations unchanged; complete set survives. Record-owned L/R, never latest receipt as research release. Europe remains default. |
| Not run | Filesystem protocol | Consistent same-FS staging, writer contention, WAL busy checkpoint, safe reader/sidecar handling, close/fsync/atomic rename/parent fsync; no half-published file. |
| Not run | Ledger/crash recovery | Durable started before staging; success only after verified swap/whole set, failure logged separately; receipt reconciliation for crashes before/after rename and before terminal ledger update. |
| Not run | Restore | Scratch restore of actual prior full snapshot verifies schema, publication set and known office/event; metadata-only backup insufficient. |
| Not run | Existing project gates | npm test, npm run lint, npm run validate:data, npm run build for future implementation; no unrelated package/tier/DDL/UI/override changes. |

## Verification performed for these docs

Package validate.py ran read-only and passed supplied counts, independent CSV reconciliation and manifest hashes. Input/tier/DDL bytes, exact office sets, namespaced identity vectors, date/heading bindings, source resolution, all223 destination columns and ZIP payload checksums verified. See validation.json. No SQLite databases/rows created, no importer or publication path executed, no statuses approved, no protected/repository files rewritten. Software mapping does not establish complete research or cutover readiness.
