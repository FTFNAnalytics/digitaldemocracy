# Prompt N — tiers, field map and CI checklist

**Documentation complete; geographic tiers approved 2026-09-17; importer code landed.** Package PR #11 merge `f0f2c86`; approved tier SHA `1c303f748b6fa706bea71d750b5e50be8ab27acc7baf166fe01e0b85e9da69eb` (predecessor draft `9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d`). Frozen register 2038 IDs; 2034 municipal / 4 regional; no prospective polling date supplied. St. Georgen `AT-OOE-41119-M::2015::` remains an open hold. Execution gates below are covered by `tests/atlas/austria-import.test.ts` / `ATLAS_IMPORT_SCOPE=austria npm run import:atlas`; mark each gate only after that proof. No `/electiondatabase` redirects or Mexico override changes.

## Required handoff outputs

| Item | Mapping status | Pointer |
| --- | --- | --- |
| Immutable pins and package recovery | Done | Austria_Input_Inventory.json; Field Map opening/Source notation |
| All outer files,19 chunk hashes/order,concat XZ hash | Done | Austria_Input_Inventory.json outer_file_inventory/manifest |
| Every2058 member and original workbook provenance | Done | Austria_Input_Inventory.json unpacked_member_inventory/workbook_provenance |
| Exact 2038 office tier mapping with register hash/bytes | Done | schemas/atlas/tiers/austria.json source_register/classifications |
| Four evidenced regional offices; no invented office | Done | Field Map Four regional offices outside companion; Example 1/6 |
| Tier draft approval gate and focused review flags | Done | Field Map office_tier_classification; tier rules/notes |
| Every223 destination column in20 tables | Done | Austria_Field_Map.md per-table sections |
| Every15 workbook table column and unknown/raw retention | Done | Field Map Complete source-column disposition |
| H 5944 vsIX5956 overlap;12 additions and one named binding hold | Done | Field Map Baseline/Four regional offices; Example 2/6 |
| Office/event/result/geography/source namespaces and IDs | Done | Austria_Identity_Rules.md; Austria_Identity_Vectors.json |
| Result physical/semantic binding and reorder rule | Done | Identity Rules Results and party context |
| Packed byte retention/virtual paths/recovery | Done | Field Map Source notation and recovery |
| Snapshot/window/coverage gaps retained | Done | Input Inventory manifest; Field Map Research reviews |
| Partial/year/day certainty and cycle-vs-ballot distinction | Done | Field Map Date policy; Examples 2/5/7/16 |
| No prospective dates invented; empty dated calendar | Done | Field Map Four regional offices; Example 1/7 |
| Votes/seats/shares missing-vs-zero | Done | Field Map result_row; Example 3/4/9 |
| Source catalogue union and inline-only sources | Done | Field Map Evidence traversal; Identity Rules Sources |
| Unresolved tokens versus broken resolved FK | Done | Field Map unresolved_evidence/evidence_link; Example 10 |
| No invented proceedings or party mappings | Done | Field Map proceeding/party_mapping; Identity Rules |
| Poll/control/score inputs retained only | Done | Field Map Research reviews; Example 15 |
| Release versus attempt/full publication set | Done | Identity Rules Fingerprint; Field Map operational tables |
| Override guards and stable aliases | Done | Identity Rules Overrides; Example 12 |
| Incomplete refresh is not deletion | Done | Identity Rules Overrides; Example 13 |
| 17 worked acceptance examples with exact locators | Done | Austria_Acceptance_Examples.md |
| Protected-byte and documentation validation record | Done | validation.json |
| NoImporter/SQLite/VPS/UI; applied_changes=0 | Done | validation.json; README.md |

“Done” means the specification/artifact exists and its documentary checks passed; it does not mean importer CI passed or Justin approved tiers. Examples 1–17 distinguish actual source observations from isolated future CI mutations.

## Required importer/publication execution gates

| Gate | Execution status | Required assertion |
| --- | --- | --- |
| Tier approval | **Not run** | Reject draft T for production; verify future Justin-accepted bytes and exact effective-office coverage; no silent flag/status flips. |
| Unchanged re-import | **Not run** | Two attempts,one release for identical approved effective inputs; snapshot hash remains same across unrelated-lineage changes. |
| Changed input/correction | **Not run** | Package/tier/accepted override/adapter/method/schema change alters R; stable office/event/result identities survive; exact guard mismatch fails. |
| Payload integrity | **Not run** | Validate all 19 chunk bytes/hash/order,concat XZ,2058 members and 2084 baseline descriptors; wrong/missing/unlisted member fails; safe tar checks. |
| Counts and overlap | **Not run** | 2038 offices,5956 events,16336 result rows;5944 H/IX overlap and 12 index-only; no duplicate events from HTML/summary; named St.Georgen 2015 binding hold must have an accepted resolution before publication. |
| Field and numeric fidelity | **Not run** | Full raw preservation;16336 positive votes/shares;400 zero seats versus7180 missing seats; bounds/nonfinite/type checks. |
| Date precision and certainty | **Not run** | 58 source-annotated day dates,5898 year-only;unknown certainty;3 repeats keep old cycle HK with later ballot year; future month/range/conflict probes. |
| Regional calendar honesty | **Not run** | 4 proposed regional office rows,zero baseline next events; approved-only regional coverage; no positive-count requirement or cohort classifiers. |
| Resolved and unresolved evidence | **Not run** | Catalogue ID/URL agreement,93+4=97 source union; explicit unknown token; missing known source fails closed; no fake source/target FK. |
| Poison rollback +durable ledger | **Not run** | Break full event/source FK; staging rollback,failed ledger entry survives; no release minted,previous publication still serving. |
| Fixture exclusion | **Not run** | Reject FIX-/FXT- identifiers and fixture provenance/retained content in production input universe; probes isolated. |
| Incomplete refresh | **Not run** | Carry omitted offices/events/results/tiers/evidence/aliases and exact origin bytes; inherited paths enter effective fingerprint; no implicit deletion. |
| Semantic identity bindings | **Not run** | Reorder source results while keeping old semantic aliases; reject ambiguous identity; no rowindex reassignment or index recycling. |
| Publication coexistence | **Not run** | Other Europe/LatAm/NZ lineage IDs,rows,citations unchanged; record joins own (lineage_id,release_id),not latest receipt. |
| Full SQL integrity | **Not run** | foreign_key_check/integrity_check,mandatory tier FKs,record_locator target shape,date/parent/supersession cycles; invalid value-status pairs fail. |
| Atomic publication | **Not run** | Consistent backup,same-FS staging,WAL checkpoint no outstanding frames,close/fsync/rename/directory-fsync,receipt recovery,off-VPS backup and restore drill. |
| Research fidelity | **Not run** | No synthetic predecessor municipality results,mayors,control,forecasts,proceedings,regional dates or certified outcomes; limitations stay visible. |
| Deployment/UI/cutover | **Not run** | Not part of Prompt N. No VPS/UI/redirects or /electiondatabase retirement; do not mark pending Austria ingestion complete. |

## Checks actually performed for this documentation pack

Package validator PASS, archive and original workbook hashes, deterministic recovery of 19 chunks matching PR blob IDs,2058 member hashes,exact tier/register ID equality,full-column mapping inventory,history/result joins,source union,deterministic vector recomputation,protected pinned-byte verification,Markdown link checks and ZIP manifest verification. These are input/document checks,not SQLite/importer/publication tests. Validation details are in validation.json. Root SHA256SUMS covers every payload file except itself; its digest and ZIP digest are external receipt values because self-containing hashes are impossible.
