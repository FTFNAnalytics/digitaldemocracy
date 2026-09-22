# Prompt AK — field map and CI checklist

Mapping work is complete for the supplied research projection; research gaps remain open. No production acceptance or implementation claims.

| Item | Status | Pointer |
|---|---|---|
|Pinned main and byte-exact authoritative DDL references|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Current source roster and county/municipal/capital distinction|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Full stable office IDs and geographic aliases|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Draft tiers exact 1: 1 with register; no approval|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Sourced event/result bindings with component separation|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Presidential indirect mechanism and missing vote totals|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|No direct county chair or appointed executive fabrication|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Historical rows retained regardless of alert window|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Partial historic scope and successor gates named|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Raw source/unknown fields retained|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|223 destination fields mapped|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Complete documentary identity vectors and release fingerprint|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|At least 15 worked examples and exact locators|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Source inventory/hash manifest and research validator|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|
|Justin boxes unchecked; no repository mutation|Done|Report / Field Map / Identity Rules / Input Inventory / acceptance-vectors.json / validation.json|

## Destination coverage

|Table|Columns|Mapping status|
|---|---:|---|
|dataset_lineage|3|Done — Hungary_Field_Map.md#dataset_lineage|
|dataset_release|12|Done — Hungary_Field_Map.md#dataset_release|
|publication_release|2|Done — Hungary_Field_Map.md#publication_release|
|publication_receipt|4|Done — Hungary_Field_Map.md#publication_receipt|
|retained_input|8|Done — Hungary_Field_Map.md#retained_input|
|country|11|Done — Hungary_Field_Map.md#country|
|geography|9|Done — Hungary_Field_Map.md#geography|
|research_date|12|Done — Hungary_Field_Map.md#research_date|
|office|16|Done — Hungary_Field_Map.md#office|
|office_tier_classification|11|Done — Hungary_Field_Map.md#office_tier_classification|
|election_event|18|Done — Hungary_Field_Map.md#election_event|
|proceeding|11|Done — Hungary_Field_Map.md#proceeding|
|source|14|Done — Hungary_Field_Map.md#source|
|party_mapping|12|Done — Hungary_Field_Map.md#party_mapping|
|result_row|24|Done — Hungary_Field_Map.md#result_row|
|record_locator|17|Done — Hungary_Field_Map.md#record_locator|
|evidence_link|11|Done — Hungary_Field_Map.md#evidence_link|
|unresolved_evidence|8|Done — Hungary_Field_Map.md#unresolved_evidence|
|identity_crosswalk|8|Done — Hungary_Field_Map.md#identity_crosswalk|
|ingest_attempt|12|Done — Hungary_Field_Map.md#ingest_attempt|

## Future importer/publication gates

|Gate|Execution status|
|---|---|
|Actual unchanged re-import creates new durable attempt and same lineage release|Not run|
|Corrected accepted input changes release without changing public row IDs|Not run|
|Poison FK rollback keeps last good serving DB and durable failed attempt|Not run|
|Broken resolved source FK fails closed; unresolved token is separate|Not run|
|Fixture prefixes and instructional feeds rejected|Not run|
|Tier file is sole classifier; calendar cohorts excluded|Not run|
|Missing/zero and partial/conditional/conflicting dates preserved|Not run|
|Incomplete refresh retains omitted office and inherited effective inputs|Not run|
|Other Europe/LatAm/NZ lineages and citation ownership unchanged|Not run|
|2024 precinct/candidate-number aggregation and 2022/2026 components round-trip|Not run|
|Presidential elector mechanism and EP domestic subset labels preserved in serving app|Not run|
|Same-FS staging, WAL checkpoint, fsync, atomic rename, startup receipt reconciliation|Not run|
|Read-only serving connection, permissions/backups/last-good rollback|Not run|
|No office/history filtering by upcoming 18-month window|Not run|

- [ ] Justin accepts this draft handoff.
- [ ] Justin approves tiers (no status flip in this pack).
- [ ] Justin accepts applicable research holds or commissions follow-up.

`applied_changes=0`; importer/SQLite/VPS/UI all Not run.
