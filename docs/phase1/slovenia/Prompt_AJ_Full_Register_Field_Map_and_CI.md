# Prompt AJ — field-map and CI checklist

Mapping/research checks are documentary work. Runtime gates are **Not run**; no SQLite or importer was executed.

| Mapping deliverable | Status | Pointer |
|---|---|---|
|Main pinned; unchangedDDLread|Done|Slovenia_Input_Inventory.json / contract-reference|
|Current212 municipalities/428 offices reconciled|Done|office-register.json / roster-bindings.json|
|Historical universe and missing-cycle gates explicit|Done|research-gaps.json / missing-local-cycles.json|
|Draft tiers exact1:1; 0 regional; approvalunchecked|Done|schemas/atlas/tiers/slovenia.json|
|All 223destinationcolumns mapped|Done|Slovenia_Field_Map.md / column-map.json|
|Complete office/event/result/source/geography/date vectors|Done|Slovenia_Identity_Vectors.json|
|National Assembly vs indirect National Council|Done|Slovenia_Identity_Rules.md / DScomponents|
|Direct mayor/presidency rounds; actual component repeats|Done|proceedings.json / acceptance examples4–10|
|Missing≠zero; fraction vs percent; no fabricated seats|Done|results.json / acceptance examples6–8,11|
|Overlap, preference, minority and fixture dispositions|Done|Slovenia_Field_Map.md / source-projection.json|
|≥15 exact worked examples|Done|Slovenia_Acceptance_Examples.md (22 examples)|
|Source URLs/hashes; named holds; protections|Done|Slovenia_Input_Inventory.json / research-gaps.json|
|Research validator/checksum manifest supplied|Done|validate.py / validation.json / SHA256SUMS|

| Future importer / publication gate | Status | Required assertion |
|---|---|---|
|Unchanged input re-import →fresh attempt, same lineage release|Not run|Unchanged input re-import →fresh attempt, same lineage release|
|Accepted correction →new fingerprint; stable IDs/crosswalk|Not run|Accepted correction →new fingerprint; stable IDs/crosswalk|
|Poison row/FK →rollback staging and durable failure ledger|Not run|Poison row/FK →rollback staging and durable failure ledger|
|Unresolved exact token stays explicit; no fabricated resolved source|Not run|Unresolved exact token stays explicit; no fabricated resolved source|
|Fixture IDs/metadata/sample data rejected; archived config alone not a research fixture|Not run|Fixture IDs/metadata/sample data rejected; archived config alone not a research fixture|
|Missing≠zero seats/votes and source-unit shares preserved|Not run|Missing≠zero seats/votes and source-unit shares preserved|
|Range/month/year/conditional dates remain exact precision; conflict withholds pointer|Not run|Range/month/year/conditional dates remain exact precision; conflict withholds pointer|
|Tier file hash/status drives tier; no calendar-label classifier; 0regionalpasses|Not run|Tier file hash/status drives tier; no calendar-label classifier; 0regionalpasses|
|Runoffs/repeats/district/minority/preference overlaps never duplicate cycles/results|Not run|Runoffs/repeats/district/minority/preference overlaps never duplicate cycles/results|
|Incomplete refresh retains omitted offices/history/evidence; inherited bytes fingerprinted|Not run|Incomplete refresh retains omitted offices/history/evidence; inherited bytes fingerprinted|
|Other lineage rows/releases/citations unchanged in publication set|Not run|Other lineage rows/releases/citations unchanged in publication set|
|Same-FS staging; foreign-key/coverage integrity; WAL checkpoint before close|Not run|Same-FS staging; foreign-key/coverage integrity; WAL checkpoint before close|
|Atomic rename + durable receipt/attempt reconciliation; fail leaves lastgood serving|Not run|Atomic rename + durable receipt/attempt reconciliation; fail leaves lastgood serving|
|No stale approved-tier hash, wrong namespace or guessed successor accepted|Not run|No stale approved-tier hash, wrong namespace or guessed successor accepted|

No repo/importer/SQLite/VPS/UI changes; applied_changes=0. Justin approvals remain unchecked.
