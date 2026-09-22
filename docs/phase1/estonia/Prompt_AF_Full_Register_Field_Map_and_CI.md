# Prompt AF — mapping and CI checklist

DRAFT. Mapping checks Done below mean documentation/data artifacts exist and are independently checked by the pack validator. They do not assert importer execution. All Justin approvals unchecked.

| Required artifact / research mapping | Status | Pointer |
|---|---|---|
| Main pinned; protected scope unchanged |Done|Estonia_Input_Inventory.json /pin /protection|
| Current + historical register with stable source identities |Done|office-register.json; register-source-rows.json|
|2013/2017/2021/2025 rosters; Tallinn district exclusion |Done|Report; Acceptance 1–3|
|Presidential indirect mode and 1992 exception |Done|Identity Rules; Acceptance 10–12|
|No direct mayor fabrication |Done|EE-G04; Acceptance 13|
|Draft tiers exactly 1:1; no approvals |Done|schemas/atlas/tiers/estonia.json|
|223 destination columns /20 tables |Done|Estonia_Field_Map.md; column-map.json|
|Events/results/proceedings exact source binding |Done|research JSON; Identity Vectors|
|No list/aggregate/breakdown double count |Done|Field Map extraction contract; nonadditive-list-summaries.json|
|NULL/zero/elected flag distinction |Done|Acceptance 7–9|
|Partial and out-of-window dates |Done|Acceptance 4–6; EE-G07|
|Broken resolved FK vs unresolved token |Done|Acceptance 17; Field Map evidence tables|
|Incomplete refresh and publication set coexistence |Done|Acceptance 18/20; Identity Rules|
|Full source/member inventories and recovery hashes |Done|Input Inventory; archive-member-inventory.json|
|Named historical/legal/certification gaps |Done|Research Gaps; human-review.json|
|At least 15 worked examples |Done|20 Acceptance Examples|
|Read-only package validator and manifest |Done|root validate.py; validation.json; SHA 256 SUMS|

| Future implementation/publication gate | Execution status | Required assertion |
|---|---|---|
|import: atlas Estonia /SQLite migration |Not run|DDL unchanged; draft-tier acceptance prerequisite fails closed|
|Unchanged reimport |Not run|new attempt ID, same per-lineage release and deterministic entity IDs|
|Corrected accepted input/override |Not run|new fingerprint/release; guard original values, preserve claims/IDs|
|Poison FK rollback |Not run|whole staged transaction fails; durable failure ledger persists; last good publication served|
|Resolved source FKs |Not run|broken country/namespace/source key fails; never fabricate source|
|Unresolved original citations |Not run|explicit unresolved row on real locator; no fake resolved FK|
|Fixture exclusion |Not run|reject FIX-/FXT- identities and fixture provenance|
|Missing≠zero |Not run|NULL/unknown versus 0/zero, booleans independent of seats|
|Date precision / conflicts |Not run|year/month/day stay exact; no day filling; disputed claims retained and date withheld|
|Tier file drives classification |Not run|no calendar/cohort classifier; national mapsnational_context; regional 0 passes|
|Round/history overlap |Not run|one event percycle, presidential ballots separate; no summaries as extra rows|
|Incomplete refresh |Not run|omitted prior office/event retained; deletion requires explicit evidence|
|Unrelated lineages / citations |Not run|other release IDs/rows unchanged; citations join own release|
|Atomic publication |Not run|same-FS staging; WAL checkpoint/close; fsync; atomic rename; last good on failure|
|VPS /UI /redirects |Not run|no deployment or/electiondatabase change authorized|

- [ ] Justin approves tiers.
- [ ] Justin accepts/amends the evidence gaps.
- [ ] Justin accepts this handoff for separate implementation.
