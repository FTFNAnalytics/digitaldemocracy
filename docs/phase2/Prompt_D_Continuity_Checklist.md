# Prompt D — continuity field-map and CI checklist

Documentation completed 2026-09-16 against main 5f46f9b03f24f4776ffb09feb390906b0ca75fdb and the saved unchanged Prompt B contract. **Done means the mapping is specified, not that tiers are approved, rows imported or CI passed.** Requested checked-in migration/Phase 0/Phase 1 paths and continuity tier files are absent on this main. No locked decision or Albania document was changed.

## Required map outputs

| Status | Required output / decision | Pointer and completion |
| --- | --- | --- |
| Done | Governing source availability | [Specification](Continuity_LatAm_Field_Map.md#governing-file-availability) — Pinned main and saved unchanged contract; requested absent paths explicitly recorded. |
| Done | Verified baseline and corrected history roles | [Specification](Continuity_LatAm_Field_Map.md#verified-baseline-and-source-paths) — 18,229+414 offices; 58,658 events; 36,750 selected+3,759 other; all source counts distinguished. |
| Done | NZ prospective/historical counts | [Specification](Continuity_NZ_Field_Map.md#verified-baseline-and-source-paths) — 4 offices,7 events,36 results,11 retained prospective candidates,12 sources. |
| Done | Exact identity/namespace preservation | [Specification](Continuity_Identity_Rules.md#namespaces-and-ownership) — Reserved L values and existing public IDs preserved; no random research keys. |
| Done | Canonical hash inventory | [Specification](Continuity_Identity_Rules.md#fingerprint-inventory-and-versions) — Original/normalized/compressed/member bytes, tiers, overrides, versions; exclude unrelated lineages/attempts. |
| Done | Tier prerequisite with no invented assignments | [Specification](Continuity_LatAm_Field_Map.md#tier-prerequisite) — Missing reviewed files block target import; status-only countries have no dummy office; zero regional allowed. |
| Done | Legacy release alias and page citation | [Specification](Continuity_Identity_Rules.md#legacy-release-alias-and-current-citation-rules) — Pinned original alias plus current own-lineage release join; never latest receipt. |
| Done | Multi-lineage publication and ledger | [Specification](Continuity_Identity_Rules.md#multi-lineage-publication-protocol) — Serial single-lineage attempts/swaps preserve complete publication set under unchanged DDL. |
| Done | Ancillary inputs and original artifacts | [Specification](Continuity_LatAm_Field_Map.md#ancillary-data-and-original-briefings) — Metrics/gates, observations, queue, artifacts/briefings retained losslessly; no computation. |
| Done | NZ candidate/notice/date evidence | [Specification](Continuity_NZ_Field_Map.md#prospective-and-historical-event-separation) — No prospective results; actual day date preserved; missing closing time remains missing. |
| Done | Raw source metadata and evidence boundary | [Specification](Continuity_Identity_Rules.md#source-identity-and-raw-evidence-boundary) — No invented publishers; real screen URLs; explicit typed traversal; unresolved differs from broken FK. |
| Done | Existing proceedings without new inference | [Specification](Continuity_LatAm_Field_Map.md#existing-proceedings-and-legal-status) — Existing 13,697 projection IDs retained with original notes; zero NZ proceedings. |
| Done | Refresh/withdrawal/conflict rules | [Specification](Continuity_Identity_Rules.md#incomplete-refresh-overrides-and-conflicts) — Omission≠deletion; stable IDs; inherited checksums; both claims retained and resolved value withheld. |
| Done | Phase 1 versus Phase 2 and default landing | [Specification](Continuity_Identity_Rules.md#phase-boundaries-and-cutover) — Albania-only Phase 1; LatAm+NZ Phase 2 continuity; Europe default; Armenia last; one data plane. |
| Done | Actual DDL incompatibilities enumerated | [67 exact Mexico rows and fail-closed policy](Continuity_LatAm_Field_Map.md#share-domain-compatibility-blocker); no automatic source changes. |
| Done | Worked examples | [Specification](Continuity_Acceptance_Examples.md) — Twelve examples with actual IDs and explicitly labelled test mutations. |

## Destination-column coverage

Each map covers all 223 fields in the 20 requested master/ledger tables, plus both schema_migration columns. Empty party/proceeding tables explicitly state NO ROW; no invented records fill required columns.

| Status | Table | LatAm mapping | NZ mapping |
| --- | --- | --- | --- |
| Done | dataset_lineage | [All columns](Continuity_LatAm_Field_Map.md#dataset_lineage) | [All columns](Continuity_NZ_Field_Map.md#dataset_lineage) |
| Done | dataset_release | [All columns](Continuity_LatAm_Field_Map.md#dataset_release) | [All columns](Continuity_NZ_Field_Map.md#dataset_release) |
| Done | retained_input | [All columns](Continuity_LatAm_Field_Map.md#retained_input) | [All columns](Continuity_NZ_Field_Map.md#retained_input) |
| Done | country | [All columns](Continuity_LatAm_Field_Map.md#country) | [All columns](Continuity_NZ_Field_Map.md#country) |
| Done | geography | [All columns](Continuity_LatAm_Field_Map.md#geography) | [All columns](Continuity_NZ_Field_Map.md#geography) |
| Done | office | [All columns](Continuity_LatAm_Field_Map.md#office) | [All columns](Continuity_NZ_Field_Map.md#office) |
| Done | office_tier_classification | [All columns](Continuity_LatAm_Field_Map.md#office_tier_classification) | [All columns](Continuity_NZ_Field_Map.md#office_tier_classification) |
| Done | research_date | [All columns](Continuity_LatAm_Field_Map.md#research_date) | [All columns](Continuity_NZ_Field_Map.md#research_date) |
| Done | election_event | [All columns](Continuity_LatAm_Field_Map.md#election_event) | [All columns](Continuity_NZ_Field_Map.md#election_event) |
| Done | proceeding | [All columns](Continuity_LatAm_Field_Map.md#proceeding) | [All columns](Continuity_NZ_Field_Map.md#proceeding) |
| Done | result_row | [All columns](Continuity_LatAm_Field_Map.md#result_row) | [All columns](Continuity_NZ_Field_Map.md#result_row) |
| Done | party_mapping | [All columns](Continuity_LatAm_Field_Map.md#party_mapping) | [All columns](Continuity_NZ_Field_Map.md#party_mapping) |
| Done | source | [All columns](Continuity_LatAm_Field_Map.md#source) | [All columns](Continuity_NZ_Field_Map.md#source) |
| Done | record_locator | [All columns](Continuity_LatAm_Field_Map.md#record_locator) | [All columns](Continuity_NZ_Field_Map.md#record_locator) |
| Done | evidence_link | [All columns](Continuity_LatAm_Field_Map.md#evidence_link) | [All columns](Continuity_NZ_Field_Map.md#evidence_link) |
| Done | unresolved_evidence | [All columns](Continuity_LatAm_Field_Map.md#unresolved_evidence) | [All columns](Continuity_NZ_Field_Map.md#unresolved_evidence) |
| Done | identity_crosswalk | [All columns](Continuity_LatAm_Field_Map.md#identity_crosswalk) | [All columns](Continuity_NZ_Field_Map.md#identity_crosswalk) |
| Done | publication_release | [All columns](Continuity_LatAm_Field_Map.md#publication_release) | [All columns](Continuity_NZ_Field_Map.md#publication_release) |
| Done | publication_receipt | [All columns](Continuity_LatAm_Field_Map.md#publication_receipt) | [All columns](Continuity_NZ_Field_Map.md#publication_receipt) |
| Done | ingest_attempt | [All columns](Continuity_LatAm_Field_Map.md#ingest_attempt) | [All columns](Continuity_NZ_Field_Map.md#ingest_attempt) |
| Done | schema_migration | [All columns](Continuity_LatAm_Field_Map.md#schema_migration-master-and-ledger) | [All columns](Continuity_NZ_Field_Map.md#schema_migration-master-and-ledger) |

## Required implementation and CI gates

The specifications below are complete. Execution status is **Not run** for every gate: this task writes documentation only. Use isolated test paths; do not load production or change frozen research. Importer work must execute these gates and attach evidence; no checkbox here substitutes for the accepted plan’s cutover evidence.

| Specification | Execution | Gate | Required assertion | Example / reference |
| --- | --- | --- | --- | --- |
| Done | Not run | Contract/migration compatibility | Verify checked-in 0001/0002 against saved Prompt B; separate master/ledger, expected versions, foreign_keys=ON and recursive_triggers=ON. No existing schema guessing. | Both maps: Governing-file availability |
| Done | Not run | Input authenticity and inventories | Verify archive +all 18,767 members +141 derivative files, NZ3 files; manifest compressed hashes vs decompressed object hashes; missing bytes fail; no frozen edits. | Identity Rules: Fingerprint inventory and versions |
| Done | Not run | Accepted tier coverage | All21 LatAm office-bearing country tier files +NZ file accepted, hashed, exact full ID sets; unknown only explicit; missing file fails; no positive-regional gate. | Example 11 |
| Done | Not run; known preflight blocker | Share-domain compatibility | All67 actual Mexico values above100/percent_0_100 fail unchanged DDL. Require reviewed per-row correction/withholding override; retain original value/unit/status, all IDs and counts. No clamp, scale, NULL coercion or dropping rows. | [Exact inventory](Continuity_LatAm_Field_Map.md#share-domain-compatibility-blocker); Example 6 |
| Done | Not run | LatAm full fidelity | 18,643 offices(18,229 current/414 historical),58,658 events,269,740 results,18,643 briefings; strict roles36,750/3,759/18,149; 13,697 existing proceedings; preserve all IDs and semantics. | Examples1,6,10,12 |
| Done | Not run | NZ full fidelity | 4 offices/7 events/36 historical results/11 retained candidates/12 sources; future votes/elected remainNULL; empty roster not unopposed; no fabricated briefing. | Examples4,7 |
| Done | Not run | Status-only countries and territory kind | All36 LatAm country/territory records including15 with zero offices/events; preserve screening notes/source links, sovereign vs territory; no dummy office. | Example 3 |
| Done | Not run | Unchanged re-import for each lineage | Twice same hash inputs→new attempts, same R, one immutable release; identity/date/content equality; operational receipt may differ. | Example 2 and analogous NZ run |
| Done | Not run | Corrected target import | Changed documented override/tier/version→new target R; unchanged public IDs preserved; old full snapshot recoverable; other lineages unchanged. | Identity Rules: Refresh bindings / overrides |
| Done | Not run | Europe-only isolation and citations | Compare all LatAm/NZ table-row semantic digests and selected pairs before/after changed and unchanged Europe import; BR-AC-G citation remains LatAm; legacy release alias pinned. | Example 1 |
| Done | Not run | Bidirectional isolation | NZ-only and LatAm-only refreshes also preserve Europe and the other continuity member; no target-only replacement of publication set. | Identity Rules: Multi-lineage publication protocol |
| Done | Not run | Identity/namespace and collision guards | All public office/event/proceeding/result/source IDs and aliases round-trip; wrong namespace child fails; no reused-rank resultID; cross-lineage collisions fail. | Examples1,7,8,10 |
| Done | Not run | All typed references | foreign_key_check empty, integrity_check ok; actual country/geography/office/event/proceeding/resolved-source/locator/crosswalk targets; nullable composite refs all-or-none. | Example 8 |
| Done | Not run | Unresolved versus broken known source | Unmatched token preserves literal/reason/location, no fabricated source; known missing NZ-S01 is fatal; historical NZ source inheritance accepted. | Examples7,8 |
| Done | Not run | Missing≠zero and score gates | LatAm actual zero/missing counts; no numeric/status mismatch; NZ absent affiliation/seat/share remains missing; retained scoreGate:false and withheld reason never cleared; no metric recomputation. | Examples6,7 |
| Done | Not run | Precision/certainty/conflicts | Real LatAm year/month/unknown and NZ actual day+unknown time round-trip; no day 1/UTC/noon guessing; validate Gregorian/range/cycles; conflicting claims preserved with NULL resolved pointer. | Examples4,5; Identity Rules: Internal locators and dates |
| Done | Not run | Proceedings and nonselected history | Keep existing other/annulled/superseded IDs and legacy proceeding provenance; no new certification or result→proceeding assignment; zero NZ proceedings. | Example 10 |
| Done | Not run | Incomplete refresh and explicit withdrawal | Retain omitted prior office/event/source/classification and raw origin; inherited inputs hashed; explicit sourced state changes keep ID/aliases addressable. | Example 12 |
| Done | Not run | Original artifacts and source data rights | LL one-to-one, original-member hashes match; cleaned HTML separate; all 125 artifact aliases retained; no execution; no invented rights/publishers. | Example 12; LatAm map ancillary section |
| Done | Not run | Fixture rejection | Reject fixture provenance/IDs/namespaces across typed and retained research payloads; environment cannot contaminate production; do not confuse validator source text with fixture records. | Example 9 |
| Done | Not run | Poison rollback and last-good serving | Durable started log before staging; inject late bad source/eventFK/corrupt input; nonzero exit, no new release, no serving-file change; other lineage pages/citations still valid; failed audit survives. | Example 8 |
| Done | Not run | Writer/WAL/fsync/rename/recovery | Exercise writer contention, same-FS staging, off-VPS backup, busy checkpoint, closed connections, reader reopen, file+directory fsync and crashes before/after rename/ledger completion. | Identity Rules: Multi-lineage publication protocol |
| Done | Not run | Serial multi-lineage receipt behavior | One target per attempt/receipt; coordinator serial; later failure leaves prior complete publication set; cutover remains blocked until all named members present. | Identity Rules: Multi-lineage publication protocol |
| Done | Not run | Restore and historical alias lookup | Restore known full prior snapshot to scratch; verify actual BR-AC-G/Barbuda ID, source and briefing; legacy alias resolves pinned immutable release not latest member. | Examples1,12 |
| Done | Not run | Existing repository gates | npm test, npm run lint, npm run validate:data, npm run build; mapping docs do not claim these importer gates passed. | Governing Prompt C gates retained |
| Done | Not run | Cutover access-log/route/canonical evidence | Harvest real old URLs; all already-public office/event/source/artifact/country destinations exist before redirects; preserve query semantics; no record→home fallback. | Accepted plan cutover checklist |
| Done | Not run | One data plane and Europe landing | All surviving post-cutover research routes use same SQLite publication set, including retained observation compatibility; no gzip fallback; Europe default; regional empty state honest; LatAm counts never Europe coverage. | Phase boundaries and cutover |

## Verification actually performed for this handoff

- Read current main plan and identity/normalization code; main remains PR17 merge. Recorded absent requested paths and used saved governing deliverables without editing them.
- Reconciled actual LatAm counts/roles and NZ counts; checked normalized public-ID uniqueness and references/value shapes. **Found 67 actual Mexico share values outside percent_0_100; listed all as an import blocker.** Other checked references and numeric/date shapes passed.
- Verified full recovered LatAm ZIP hash and all 18,767 member hashes/byte counts; all 21 country/21 briefing shard hashes, base/legacy-links hashes and 96 decoded object digests.
- Ran existing NZ package validator successfully:4 races,11 candidates,3 histories,36 historical rows.
- Checked each field map against every column of unchanged saved DDL; checked local document links and example IDs.

No Atlas research rows were loaded and no application/importer/UI code was written. No migration, tier file or frozen research bytes were edited. No production continuity fingerprint or positive regional coverage is claimed.

## Phase boundary

Phase 1 remains Albania-only. Phase 2/cutover requires both exact lineages latin-america-fe5e91689def and country-package-new-zealand, plus required reviewed Europe inputs. Europe remains default landing. Armenia remains last among early Europe targets. No full-Europe maps, tightness/competition tables, geometry or new offices are in scope.
