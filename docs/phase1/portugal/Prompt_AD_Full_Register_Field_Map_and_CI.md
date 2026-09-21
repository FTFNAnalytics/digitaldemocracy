# Prompt AD — full-register field map and CI checklist

Mapping completion does not approve research or run an importer. Draft tiers and named holds await Justin.

| Required work/gate | Status | Pointer |
|---|---|---|
|Pinned main and unchanged DDL|Done|Inventory; contracts; field map|
|Complete captured current municipal/parish source register|Done|Register; source projection; validator|
|Historical source-era retention and explicit alias holds|Done|Identity Rules; historical registry_qualified0; gaps|
|National/regional/EP offices and real electoral modes|Done|Report; institutional sources; office.election_mode|
|One tier row per office, all draft|Done|schemas/atlas/tiers/portugal.json; validator|
|Every223 destination column mapped|Done|Portugal_Field_Map.md; column-map.json|
|Alloffice/event/result/source/geography vectors|Done|Portugal_Identity_Vectors.json|
|At least15 real-locator acceptance examples|Done|23 examples; acceptance-examples.json|
|Source/archivemember hashes and inventory|Done|Inventory; Archive_Member_Inventory; SHA256SUMS|
|Published numerical conflicts explicitly preserved|Done|aggregate-conflicts; disputed results; gaps|
|CM/AF votes not duplicated to derived heads/juntas|Done|Source projection; examples1–3; validator|
|Local year precision / unknown next / repeat gates|Done|Examples8,11; gaps|
|Read-only package validator and checksum validation|Done|validation.json; external receipt|
|Unchanged re-import/new attempt/same release|Not run|Future importer: examples20|
|Changed accepted source fingerprint with stableIDs|Not run|Future importer: example21|
|Poison FK rollback + durable failure ledger|Not run|Future importer: example13|
|Missing versuszero and percentage-domain enforcement|Not run|Future importer: examples9–10,17–19|
|Unknown date versus fabricated exactday|Not run|Future importer: examples8,11|
|Unresolved tokens versus broken resolvedFK|Not run|Future importer: examples12–13|
|Fixture exclusion and effective-source allowlist|Not run|Future importer: example23|
|Incomplete refresh retention|Not run|Future importer: example22|
|Multi-lineage citations/publication-set coexistence|Not run|Future importer: example23; Identity Rules|
|Drafttier and open conflict acceptance gate|Not run|Future importer must require accepted files/policy|
|Same-FS stage/WAL/fsync/atomicrename/failure recovery|Not run|Future publication; fieldmap protocol|
|SQLite/VPS/UI/redirect work|Not run|Outofscope; applied_changes0|

- [ ] Justin accepts scope, mechanism and historical alias policy.
- [ ] Justin accepts/amends draft tier category policy.
- [ ] Justin accepts each published numerical conflict/hold disposition.
- [ ] Justin authorizes future implementation/publication separately.

No approvals applied. applied_changes=0 for repository/importer/SQLite/VPS/UI.
