# Prompt L — tiers, field map and CI checklist

Pinned main `7af805b5dbb123c4cd3f0e6ccd2ea63bc5f34d45`. Approved Armenia tier SHA **`2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`**; predecessor `9b100ffab2b9f878914721711d4878567868bd5ac923b294af02ef15bbfaefe5`. Part1 approval is explicitly authorized by Prompt L and emitted as a deliverable only. Field-map folder: `docs/phase1/armenia/`. All mapping work below is **Done**; importer/publication execution is **Not run**. No DDL changes, importer, UI, VPS or other-country/continuity work.

## Required mapping outputs

| Requirement | Status | Pointer |
| --- | --- | --- |
| Pin current main and authoritative contracts | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — Opening baseline; inventory pinned_main_commit |
| Verify chunks/payload/inventory/register and recovery | Done | [Armenia_Input_Inventory.json](Armenia_Input_Inventory.json) — hash_inputs and recovery_metadata |
| Finalize full approved Armenia JSON before mapping | Done | [../../../schemas/atlas/tiers/armenia.json](../../../schemas/atlas/tiers/armenia.json) — Use archive-root schemas/atlas/tiers/armenia.json; see README |
| Exact71-ID equality; municipal71/regional0 | Done | [Armenia_Input_Inventory.json](Armenia_Input_Inventory.json) — verified_counts; validation.json |
| Record draft→approved digest and explicit authority | Done | [Armenia_Input_Inventory.json](Armenia_Input_Inventory.json) — predecessor_draft_tier_sha256 / approved_tier_sha256 |
| Retain five boundary/calendar reviews without changing tiers | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — Tier approval and five retained research reviews |
| Preserve8 existing mayors; no new mayor IDs for55 proportional councils | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Example2 |
| No unsuffixed Vedi token as an identity or alias | Done | [Armenia_Identity_Rules.md](Armenia_Identity_Rules.md) — Offices and geography |
| dataset_lineage and dataset_release every column | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — dataset_lineage / dataset_release |
| retained_input:8 outer+91 members+T; packed virtual paths | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — Source notation and retained_input |
| country and geography every column; nullable parents | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — country / geography |
| office and office_tier_classification every column | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — office / office_tier_classification |
| research_date and election_event every column | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — research_date / election_event |
| proceeding no supplied rows; all columns accounted | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — proceeding |
| result_row all columns and97 exact identities | Done | [Armenia_Identity_Vectors.json](Armenia_Identity_Vectors.json) — results; field-map result_row |
| party_mapping no sourced concordance; all columns accounted | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — party_mapping |
| source catalogue union, inline sources and aliases | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — source / Sources and evidence traversal |
| record_locator,evidence_link,unresolved_evidence every column | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — three named table sections |
| identity_crosswalk and immutable public keys | Done | [Armenia_Identity_Rules.md](Armenia_Identity_Rules.md) — Alias namespaces and result bindings |
| publication_release,publication_receipt,ingest_attempt all columns | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — three named table sections |
| H/IX overlap, no duplicate histories or summary results | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Examples3 and7 |
| 30 prospective events and41 missing next dates | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — Event attachment, certainty and overlap |
| Partial precision and conflicting claims policy | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Examples5 and10 |
| Missing versus zero votes/shares/seats/control | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Examples3,4,10,12 |
| Coverage/calendar/raw extensions/all14 tables every column | Done | [Armenia_Field_Map.md](Armenia_Field_Map.md) — Complete source-column disposition |
| Briefing HTML/XLSX/formulas retained inertly by hash | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Example12 |
| Unchanged re-import and effective-input fingerprint | Done | [Armenia_Identity_Rules.md](Armenia_Identity_Rules.md) — Fingerprint and release identity |
| Incomplete refresh is not deletion | Done | [Armenia_Identity_Rules.md](Armenia_Identity_Rules.md) — Overrides, incomplete refresh and publication |
| Honest empty regional calendar passes | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — Example1 |
| At least8 worked examples with exact locators | Done | [Armenia_Acceptance_Examples.md](Armenia_Acceptance_Examples.md) — 12 examples; real values and isolated synthetic probes separated |
| Manifest, byte protection, ID/pointer validation | Done | [validation.json](validation.json) — Documentation checks; SHA256SUMS verification |

## Future importer and publication CI

These retain the Prompt B/C/J/K gates, adding packed-input and Armenia-specific assertions. Documentation verification does not satisfy execution gates.

| Gate | Execution status | Required assertion |
| --- | --- | --- |
| Packed input integrity/security | Not run | Corrupt chunk/length/order/payload/member/inventory hash or traversal/link/duplicate name rejects; no partial import. |
| Tier approval gate | Not run | Use finalized approved SHA only; T/O exact set; approved geographic tier, nested open research reviews retained. |
| No inferred tier | Not run | Cohort strings or historical “regional index” filenames cannot classify offices;0 regional passes. |
| Counts round-trip | Not run | 71 offices,71 geographies,33 selected+30 next=63 events/dates,97 results,20 sources,100 retained inputs; no index double count. |
| Identity preservation | Not run | All office/event/result/geography/source alias vectors match; no invented mayor/token ID; row reorder/corrected counts preserve bindings. |
| Unchanged re-import | Not run | Fresh attempt_id; same effective fingerprint/R; no duplicate rows/events/aliases; receipt/ledger coherent. |
| Changed accepted input | Not run | Changed tier/package/accepted override/adapter/method/schema yields new R; no timestamp-only release churn. |
| Poison transaction rollback | Not run | Broken known source FK fails stage; durable failed ledger survives; last-good publication and unrelated lineages continue serving. |
| Unresolved versus broken FK | Not run | Unknown citation token explicit unresolved record; known resolved missing FK remains fatal; target locator must exist. |
| Missing versus zero | Not run | Null votes/shares/seats remain unknown; explicit0=zero;2 seats-only returns survive; no derived shares from partial counts. |
| Date fidelity | Not run | 63 baseline day dates; source-specific certainty; null next dates preserved; month/year/range probes no fabricated day; conflict pointer withheld. |
| Event/result provenance | Not run | Vedi two actual elections; no extra2016 predecessor selected event; preliminary qualifier retained; no invented proceedings/party mappings. |
| Fixture exclusion | Not run | FIX-/FXT- IDs, fixture provenance and test-only overrides reject before serving. |
| Incomplete refresh | Not run | Omitted prior office/event/result/source/tier retained with original bytes and effective inherited inputs; no silent withdrawals. |
| Raw retention | Not run | All14 workbook tables,91 members and8 outer inputs preserved; unknown fields/raw/formulas/HTML inert; no metrics computed. |
| Foreign keys and domains | Not run | PRAGMA foreign_keys enabled; foreign_key_check and integrity_check pass; one typed target shape; all status/value/domain constraints. |
| Publication set isolation | Not run | Armenia-only import preserves every unrelated release pair and citation owner; readers join through record L/R. |
| Same-FS atomic publication | Not run | Durable ledger outside staging; checkpoint WAL,close,fsync,atomic rename,parent fsync; failed stage leaves prior file serving. |
| Crash recovery | Not run | Crash-before/after rename reconciles receipt and ledger; no false succeeded attempt or lost audit. |
| Immutable release input store | Not run | Every recovery locator resolves exact bytes; previous release snapshots retained; no dependence on scratch paths. |

## Validation performed here

Read-only supplied package validation; byte/hash and git-blob checks; exact ID sets and 33-H/IX overlap; source union and designated reference checks; 223 destination-column coverage; every generated locator resolvable; deterministic identity/fingerprint vectors; document links and ZIP manifest. See validation.json for precise scope. No SQLite rows were loaded and no importer or publication CI was run.

The 71 municipal tiers are approved; five boundary/calendar research reviews remain open. Research coverage stays partial, and a zero regional numerator is explicitly correct. Approval is limited to Armenia's supplied geographic tier assignments and does not approve new boundary/date claims.
