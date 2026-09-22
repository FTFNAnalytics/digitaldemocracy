# Hungary identity rules — draft for Justin

Pin `3b21c584c1b59663c5c4ae1bad775618293ac0fa`. Namespace `cdd-observatory-v1`; lineage/source namespace `country-package-hungary`; country `hungary`, ISO `HU`. IDs below are documentary Atlas proposals derived from evidenced bodies; they are not claimed to be NVI-issued office identifiers. No synthetic body, mayor, successor or office is created from an election window.

## Canonical encoding

`C(x)` is compact sorted-object-key UTF-8 JSON (no ASCII escaping, no trailing newline); arrays retain order. `H(x)=SHA256(C(x))`; `key(prefix,x)=prefix+"-"+H(x)[0:24]`. Matches pinned `normalize.ts` for this pack’s strings/integers/nulls. File SHA hashes exact bytes, not C(x). Source Hungarian names preserve accents/case. ID hash inputs use exact retained strings; normalization is only an explicit cross-source jurisdiction lookup aid.

## Office/geography identities

| Body | Stable office rule | Geographic rule |
|---|---|---|
| Municipal/district council | `HU-NVI-<2-digit county>-<3-digit settlement>-C` | `HU-NVI-<county>-<settlement>` |
| Direct mayor of same jurisdiction | same prefix + `-M` | same geography; separate ballot, not duplicate tier |
| County assembly | `HU-NVI-<county>-A` for 19 actual noncapital county codes | `HU-NVI-<county>` |
| Budapest citywide assembly | `HU-BUDAPEST-A` | `HU-NVI-01`; one dual-remit body |
| Budapest citywide direct mayor | `HU-BUDAPEST-M` | `HU-NVI-01`; distinct from 23 district mayors |
| Parliament | `HU-OGY` | `HU` |
| Indirect President | `HU-PRES` | `HU`; indirect_parliamentary |
| EP delegation | `HU-EP` | `HU`; proposed other |

No standalone járás council, direct county chair, cabinet or PM is manufactured. Official local statutory descriptors are combined with retained jurisdiction names to form readable labels. Body existence is evidenced by statute plus NVI roster/election sources. The 2024 andJanuary 2026 rosters reconcile 3177 jurisdictions: 3154 outside Budapest and 23 districts. Budapest citywide is added once from its own law/ballot source. Raw territorial text contains one NUL/quote-corrupted duplicate county token for Zalaszabar; cleaning lexical delimiters to the already-existing 20-241 identifier is recorded, not a guessed merger. Roman vs numeric Budapest district aliases are explicit 1–23 equivalences. No arbitrary name fuzzy matching.

`geography` IDs are documentary NVI-qualified codes, not KSH identifiers. Historical identity binds only where the 2014 county/settlement code AND normalized official name match current evidence. Mismatches go to historical-binding-review.json; no silent crosswalk. Earlier abolished offices are an open recovery gate; zero recovered historical-only rows does not assert zero abolished governments.

## Events and results

`HK = office_id + "::" + source_cycle_token`, tokens ONK2014, ONK2024, OGY2022, OGY2026, EP2024, PRES2017/PRES2022/PRES2024 only where an actual source supports that office/event. An ordinary general date does not manufacture events for every office. `event_id=key("event",[N,office_id,HK])`.

`result_row_id=key("result",[N,office_id,HK,"main",ballot_component,candidate_source_key])`. Complete vectors are supplied for every result. Components distinguish municipal mayor, small-community candidate marks, council ward, county list, capital list/compensation, national party/minority lists, individual parliamentary constituencies, domestic EP county subsets, and presidential legal resolutions. Never combine components into extra office rows.

Candidate key: exact source ballot ordinal where present; 2022 national list uses exact source list label because no independent list code is present in the selected table; 2022 OEVK uses source JKV ID plus exact candidate label. Legal presidential outcome uses `elected-person`. 2014 council component preserves exact source heading to distinguish wards from small-list ballots; this frozen identity is retained on corrections. A later authoritative correction to an identity-bearing label requires an explicit alias/crosswalk preserving existing public IDs, not silent regeneration. Votes/shares/seats/file hashes are never identity components.

No proceedings supplied: ordinary ward components are not rounds. Future repeats/annulments/recounts require their own actual process evidence and event binding; no fixed guessed identity is minted now. Numerical aggregation does not imply certification of components not supplied.

## Source, record and evidence keys

`source_id=key("src",[L,exact_acquisition_URL,archive_member_or_null])`. A downloaded XLS member has its own member-byte hash and source ID, while ZIP parent/member relationship is in archive-members.json. Blocked/CAPTCHA responses are diagnostic-only sources, never evidence of a contest/result. Preserve original links; do not remap them to an invented NVI catalogue ID.

`record_key="rec-"+H([entity_kind,...components])`:

| Kind | Components after kind |
|---|---|
| country | `hungary` |
| geography | `hungary, geography_id` |
| office | `N, office_id` |
| event | `N, office_id, HK` |
| result_row | `N, office_id, HK, result_row_id` |
| source | `hungary, L, source_id` |
| input | `L, release_id, input_path` |

SQL record_locator uses exact enum `event`/`input`, not table name election_event/retained_input. Sparse FK branches require country_id for event/result; result locator proceeding_id=NULL. No generic dangling polymorphic pointer.

`date_id="date-"+H([N,owner_type,owner_id,slot])`; event slot=`election`. All actual retained day values stay day precision. Next-date NULL produces no prospective event. Future unknown event date requires an explicit unknown research_date; conflicting date claims keep event date_id=NULL and resolution=conflicting. Correcting a date value retains the owner-slot ID.

For this adapter define `occurrenceIdentity=[input_path, archive_member_or_null, sheet_or_null, row_or_null, rows_or_null, column_or_null, columns_or_null, html_table_index_or_null, html_row_index_or_null, line_or_null, section_or_null]`. Preserve rows order from source. `evidence_id="ev-"+H([record_key,[hungary,L,source_id],occurrenceIdentity,claim_kind])`. `unresolved_id="unres-"+H([record_key,occurrenceIdentity,original_token])`. Do not include claim numeric value/hash in occurrence identity. Multi-source sums retain each contribution and operation; no fake single-cell citation.

## Release vs attempt; partial refresh

Candidate fingerprint `2cb9841dd136b34e21ac1a1373713920cbbd82a60246c55832f9e8e481987ecc` is documentary, not published. Exact input descriptors/versions are in Hungary_Input_Inventory.json. `release_id=L+"--sha256-"+H(hash_inputs)`; `hash_inputs` includes all effective package/research/artifact bytes, tier bytes, sorted accepted overrides (empty), adapter/method/schema versions, canonicalization/hash algorithm and both schema hashes. Exclude attempt UUID, operator, wall clock, database bytes and other lineages. Original acquisition timestamps inside frozen retained bytes do not change unless a new acquisition is intentionally included.

Each actual re-import creates fresh `attempt-<UUID>` in the separate durable ledger, even if unchanged. A corrected input, approved tier or accepted override changes release fingerprint; public row IDs remain. Full-target expected-original guarded `atlas-override/1` changes retain origin/claims and indivisible value/status bundles; no overrides accepted in this pack. Conflict withholds must be explicit accepted decisions, never clamping or silent NULL coercion.

Incomplete refresh retains omitted offices, histories, sources and original provenance. Build a cumulative effective-input manifest before hashing; no deletion on missing input. Country or result absence is not proof of legal abolition. Publication set coexists with all Europe/continuity lineages, and citations join through the record’s own lineage+release. Receipt identifies the latest attempt only. Failed stage leaves last good publication and durable failed attempt. All execution tests remain Not run.
