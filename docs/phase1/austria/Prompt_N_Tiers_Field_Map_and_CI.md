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
| Tier approval | **Passed** (`tests/atlas/austria-import.test.ts`) | Reject draft T for production; Justin-accepted bytes `1c303f748b6fa706bea71d750b5e50be8ab27acc7baf166fe01e0b85e9da69eb`; 2038 offices. |
| Unchanged re-import | **Passed** | Two attempts, one release for identical approved inputs; second run `reused_release=yes`. |
| Changed input/correction | **Passed** (`npm run test:austria-rollback`) | Package change alters R; offices/tiers survive; new release selected. |
| Payload integrity | **Passed** | 19 chunk bytes/hash/order, concat XZ, 2058 members, 2084 retained inputs; corrupt/missing chunk fails. |
| Counts and overlap | **Passed** (hold retained, not cleared) | 2038 offices, 5956 events, 16336 result rows; 5944 H/IX overlap and 12 index-only; St. Georgen `AT-OOE-41119-M::2015::` stays an open hold with four first-ballot rows. |
| Field and numeric fidelity | **Passed** | 400 zero seats versus 7180 missing seats; missing≠zero CHECK; votes/shares preserved. |
| Date precision and certainty | **Passed** | 58 source-annotated day dates, 5898 year-only; Forchtenstein 2022 repeat keeps cycle HK with 3 September 2023 ballot day. |
| Regional calendar honesty | **Passed** | 4 regional IDs only; zero prospective/next events; `denominatorKnown=false`. |
| Resolved and unresolved evidence | **Passed** | 93+4=97 source union; unmatched citation token records unresolved_evidence; no invented source row. |
| Poison rollback +durable ledger | **Passed** (`npm run test:austria-rollback`) | Broken source FK rolls back staging; failed ledger row survives; published SHA unchanged. |
| Fixture exclusion | **Passed** | `OBSERVATORY_FIXTURES=1` and `FIX-` tokens fail; no published DB. |
| Incomplete refresh | **Not run** | Carry omitted offices/events/results/tiers/evidence/aliases and exact origin bytes; inherited paths enter effective fingerprint; no implicit deletion. |
| Semantic identity bindings | **Not run** | Reorder source results while keeping old semantic aliases; reject ambiguous identity; no rowindex reassignment or index recycling. |
| Publication coexistence | **Passed** (`tests/atlas/continuity-import.test.ts`) | Albania 122 offices remain after Austria import; each lineage joins its own `(lineage_id, release_id)`. |
| Full SQL integrity | **Passed** (importer `assertIntegrity`) | foreign_key_check/integrity_check on staging and published; invalid seats status pairs fail. |
| Atomic publication | **Passed** (`npm run test:austria-rollback`; no off-VPS restore drill) | Staging discard on injected failure; previous publication still serving. |
| Research fidelity | **Passed** | Proceedings=0; party_mappings=0; poll file retained as input only; absent control table not fabricated; no invented regional dates. |
| Deployment/UI/cutover | **Not run** | Not part of this importer PR. No VPS/UI/redirects or `/electiondatabase` retirement. |

## Checks actually performed for this documentation pack

Package validator PASS, archive and original workbook hashes, deterministic recovery of 19 chunks matching PR blob IDs,2058 member hashes,exact tier/register ID equality,full-column mapping inventory,history/result joins,source union,deterministic vector recomputation,protected pinned-byte verification,Markdown link checks and ZIP manifest verification. Importer proof: `ATLAS_IMPORT_SCOPE=austria npm run import:atlas` against temp DBs published 2038 offices / 2034 municipal / 4 regional / 5956 events / 16336 results (fingerprint `57088577a272603291d3f501d5d35256360e67fb17732a6a55893b2ed0bf08b1`). Remaining Not-run gates are incomplete-refresh inheritance, semantic reorder aliases, off-VPS restore drill, and deployment/cutover. Validation details are in validation.json. Root SHA256SUMS covers every payload file except itself; its digest and ZIP digest are external receipt values because self-containing hashes are impossible.
