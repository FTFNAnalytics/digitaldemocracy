# Prompt U mapping and acceptance checklist

Pinned main `b4dcf6d891ed83a7db5b7d6eb8808671d6eec000`. Research extraction/document checks are completed work; production/importer tests are **Not run**. Justin accepted the evidenced subset of 2,805 current + 11 historical draft offices on 2026-09-19. **Importer / SQLite / VPS / UI applied_changes=0.** Full-register certification remains OPEN. Standing scope policy is preserved.

| Requirement | Status | Pointer / gate |
| --- | --- | --- |
| Pinned authoritative main/DDL/identity contract | Done | Inventory pin and schema hashes; Field Map 223 columns |
| Sourced office register and every-row draft tiers | Done | office-register.json; T exact ID equality |
| Evidenced-subset register (2,805 current + 11 historical) | **Accepted 2026-09-19** | Report; validation.json |
| Full current office universe | **Open / HOLD** | 308 commune executive gaps (VD 284, SZ 24); commune-coverage-audit.json |
| Complete historic merger/predecessor office register | **Open / HOLD** | 586 historical geographies vs 11 historical offices |
| Full destination-column mapping | Done | Field Map 20 tables / 223 columns; column-map.json |
| Deterministic identities and complete vectors | Done | Identity Rules; Identity Vectors all typed research rows |
| Source retention and reproducible inventories | Done | Input Inventory; raw sources; SHA256SUMS |
| Rounds/overlap and missing≠zero documented | Done | Examples 6, 11–15, 20; Field Map retention rules |
| At least 15 worked examples | Done | 21 worked examples with real locators or labelled isolated CI mutations |
| Unresolved evidence and broken FK distinction | Done | Example 16; source/locator maps |
| Justin register/tier acceptance | **Accepted-with-holds 2026-09-19** | 2,805 current + 11 historical; holds recorded |
| Package JSON/ID/FK/value/manifest checks | Done | validation.json from package-only validator |
| Citizen-assembly parliament caveat | **Open / HOLD** | 1,938 communes without positive elected-parliament evidence |
| Mode-variance / disputed result rows | **Open / HOLD** | conflicting-claims.json; 16 disputed rows |
| Unchanged re-import: new attempt, same release | Not run | Future importer and durable ledger test |
| Corrected input: new release, stable IDs | Not run | Future importer; old claims retained |
| Poison FK rollback/last-good publication | Not run | Future transactional/staging test |
| Missing≠zero, partial date, fixture exclusion | Not run | Future importer gates; documentary examples do not execute them |
| Incomplete refresh retains omitted offices/dependencies | Not run | Future inherited-input fingerprint gate |
| Multi-lineage citation/publication coexistence | Not run | Other lineage release IDs and bytes unchanged |
| Same-FS staging/WAL checkpoint/fsync/atomic rename | Not run | Future filesystem publication gate |
| Importer / SQLite / VPS / UI | Not run | No implementation or deployment in this pack |

## Justin decisions — 2026-09-19

- [x] Justin accepts the evidenced subset and its explicit incomplete-universe scope (2,805 current + 11 historical).
- [x] Justin accepts drafted geographic tiers for the evidenced subset. Focused-review flags stay open.
- [ ] Justin accepts closure of full-universe research gaps. **HOLD — 308 commune executives, thin historic/merger archive, 1,938 parliament caveats, and disputed-result notes stay open. Do not invent clearances.**
- [ ] Justin authorizes a later implementation handoff. **Not authorized in this landing. Full-register certification remains OPEN.**

`applied_changes=0`. Execution CI is **Not run**. Integrity validation does not mark research completeness as passed. No `/electiondatabase` redirects and no Mexico edits.
