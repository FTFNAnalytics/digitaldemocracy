# Prompt W checklist

Mapping/documentary work is separated from operational execution. Research coverage remains partial even if every mapping row is Done. The follow-up importer is `ATLAS_IMPORT_SCOPE=croatia` — see [Croatia_Import.md](Croatia_Import.md). VPS deploy stays out of scope. The checklist rows below record the Prompt W landing, when SQLite execution had not yet run.

| Requirement | Status | Evidence / future gate |
|---|---|---|
| Full current/historical register and separate direct executives | **Done** | office-register.json; Report scope table |
| Zagreb single dual body, county01 separate | **Done** | Identity Rules; examples2–3 |
| Independent versus joint-ticket deputies | **Done** | Source Projection Contract; examples4–6 |
| Exact1:1 draft tier coverage | **Done** | schemas/atlas/tiers/croatia.json; validator |
| Historic rounds/counts and original bytes | **Done** | events/proceedings/results; examples7–8 |
| 223 destination columns mapped | **Done** | Croatia_Field_Map.md; column-map.json |
| Identity/release/attempt/citation ownership | **Done** | Identity Rules; complete Identity_Vectors.json |
| Missing versus zero and precision | **Done** | examples9–13; source contract |
| Primary evidence, unresolved versus brokenFK | **Done** | sources.json; example12 |
| Party/list collision and minority/EP semantics | **Done** | examples14–16 |
| Named reforms/special/seat/legal/date gaps | **Done** | Croatia_Research_Gaps.md |
| Source/ZIP member inventory and hashes | **Done** | Input Inventory; Archive_Member_Inventory.json |
| Documentary validator and source scalar recheck | **Done** | root validate_pack.py / validation.json |
| At least15 acceptance examples | **Done** | 23 examples |
| Unchanged reimport→same release/new attempt | **Not run** | example17; future importer required |
| Corrected import, expected-original guard | **Not run** | example18; retain original claims |
| PoisonFK transaction rollback and durable ledger | **Not run** | example19; no SQLite executed |
| Fixture exclusion | **Not run** | example20 |
| Incomplete refresh retains omitted entities and sources | **Not run** | Identity Rules; fail if carry-forward inputs missing |
| Out-of-window office retained | **Not run** | example21 |
| Unrelated publication releases/citations unchanged | **Not run** | example22 |
| Partial/conflicting dates do not invent precision | **Not run** | examples9–10; unresolved conflict holds |
| Source hash/namespace/FK failures fail closed | **Not run** | all source descriptors |
| Tier file drives tier; no calendar classifier | **Not run** | approved replacement required before import |
| Same-FS staging/WAL checkpoint/fsync/atomic rename | **Not run** | Field Map publication protocol |
| No production approval/DDL/importer/UI/VPS changes | **Done** | applied_changes=0; all Justin boxes unchecked |

- [ ] Justin accepts register and named holds.
- [ ] Justin accepts tier proposals.
- [ ] Justin accepts identity/result projection.
