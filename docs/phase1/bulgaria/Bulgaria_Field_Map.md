# Bulgaria — 223-column documentary field map

Exactly **223 columns across 20 tables**, keyed by the frozen contract in `contracts/columns.json`. Every P destination mapping is retained below and in the machine-readable map, with a BI-specific rule. This is documentation, not executable import code. New BI research IDs are not asserted to be live Atlas IDs. `schema_migration` is outside this country map; no migrations run.

P source locator abbreviations and raw-envelope definition remain in `baseline/Prompt_P/Bulgaria_Field_Map.md`. The historical approval in that archived map applies to the 530 P municipality-wide offices only. BI calendar evidence supplements P's null next-date cells without changing the archived cells.

## country

Country BG / bulgaria, existing scope retained; coverage remains partial.

| Column | BI source / conversion / null policy |
| --- | --- |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| country_code | bulgaria / BG as appropriate; no extra country identity. |
| name | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| polity_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| region_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| coverage_status | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| screening_as_of_label | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| notes | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Country BG / bulgaria, existing scope retained; coverage remains partial. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | M.country + declared package slug | Literal bulgaria. | country_id | No new country from shared Read me text. |
| country_code | extract.py CODE constant | BG; frozen extract.py CODE constant. | country_id | Do not convert province-like ID fragments into regional offices. |
| name | M.country | Copy `Bulgaria`. | country_id | Nonempty. |
| polity_kind | Country Bulgaria in M and accepted Europe plan | sovereign_country. | country_id | No new country or territorial parent from other-country regional methodology. |
| region_id | Accepted Europe package/plan | europe. | country_id | Geographic landing region, not office tier. |
| coverage_status | coverage.status/remaining + Nts. Scope and remaining gaps | partial. | country_id | Explicit remaining gaps, not a nonexistent M.coverage_complete field. |
| screening_as_of_label | No separate Bulgaria screening-as-of field | NULL; no separately supplied screening-as-of date. | country_id | NULL; M.research_snapshot belongs to dataset_release. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Preserve archived CIK gaps, original certificates, decisive outcomes, 2027 village eligibility and post-28-August replacement snapshot caveat. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## dataset_lineage

Existing P lineage contract retained as proposal; BI is documentary evidence, no live lineage insert.

| Column | BI source / conversion / null policy |
| --- | --- |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| provenance_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Existing P lineage contract retained as proposal; BI is documentary evidence, no live lineage insert. |
| description | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Existing P lineage contract retained as proposal; BI is documentary evidence, no live lineage insert. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + proposed country-package identity | Fixed `country-package-bulgaria`; never a per-run ID. | L; PK | One Bulgaria source-dataset lineage; no existing Bulgaria public release claimed. |
| provenance_kind | M + inventory/README package contract | country_package; frozen XZ-packed extract at PR #16. Manifest has no schema_version field. | L | Reject fixture/unknown provenance; verify packed payload before reading rows. |
| description | M.country | `Bulgaria frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline.

| Column | BI source / conversion / null policy |
| --- | --- |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| fingerprint_sha256 | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| hash_inputs_json | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| adapter_version | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| method_version | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| schema_version | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| research_snapshot_label | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| upstream_release_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentation release only; actual importer/release record absent. BI snapshot 2026-09-29; P snapshot retained in baseline. |
| validated_counts_json | Bulgaria_Counts.json with current/historical/held and event/result scope breakdown. |
| research_coverage_complete | false; named archival and roster gaps persist. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | 54 outer files +3617 payload members +T +applicable overrides +versions | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-bulgaria-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_snapshot | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Copy 2026-09-11; do not substitute M.packaged or attempt timestamp. |
| upstream_release_id | No supplied public release alias | NULL; L is reserved lineage identity, not an invented already-public release alias. | R | Archive provenance remains raw; candidate R is separate. |
| validated_counts_json | Recomputed O/J/H/IX/D/F/X/SM/SC/Cal | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | 3597 offices; 8661 selected events; 25817 typed result rows; 7746 F and 2591 X retained separately; 3973 canonical sources. |
| research_coverage_complete | coverage.status/remaining and Nts. Scope and remaining gaps | 0, from explicit remaining coverage gaps; M has no coverage_complete boolean. | R | No invented coverage_complete source property; coverage remains partial. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve M.website_ingestion=pending and original coverage gaps; documentation is not live publication status. |

## election_event

data/BI_New_Events.json, distinct event_id by office/date/round; raw result revision is not a new polling event.

| Column | BI source / conversion / null policy |
| --- | --- |
| id_namespace | P: cdd-observatory-v1 unchanged. BI research IDs are proposals, not a claimed live namespace. |
| office_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| history_key | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| event_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| date_id | Not materialized: retain date/date_end from documentary event and its source; future Atlas date ID requires reviewed namespace. |
| date_resolution | day for called/past exact dates; explicit two-day GNA range retained. Year/formula calendar never padded. |
| event_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json, distinct event_id by office/date/round; raw result revision is not a new polling event. |
| selected_history_role | BI research draft; P selected remains original. |
| electoral_system | electoral_system or NULL; era-specific details not extrapolated. |
| comparability | coverage and quality_hold; no scoring performed. |
| ballot_basis | Use result share_basis; ambiguous source denominator remains held. |
| share_unit | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json, distinct event_id by office/date/round; raw result revision is not a new polling event. |
| legal_outcome | result_status with certification/revision distinction; original P unknown outcomes unchanged. |
| record_state | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json, distinct event_id by office/date/round; raw result revision is not a new polling event. |
| state_note | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json, distinct event_id by office/date/round; raw result revision is not a new polling event. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | H. Office ID namespace | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H. Office ID | Copy exact. | (N,office_id,history_key) | Every selected event binds exact O office with full namespace. |
| history_key | H. Office ID/Year/Ballot date if recorded | office_id+"::"+decimal Year+"::"+exact ballot date. | (N,office_id,HK) | 8661 H=IX keys, no extra master history table. F/X add zero selected events. |
| event_id | Proposed deterministic bridge-compatible identity | key("event",[CID,HK]). | (N,event_id) | 8661 unique candidate IDs; namespace on all uniqueness/FKs. No claim that XZ package already has public Atlas IDs. |
| date_id | H date owner | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | 8661 real date rows; no synthesized F/X dates or prospective events. |
| date_resolution | Parsed historical or prospective date + documented conflicts | resolved for 8661 supplied day labels; certainty remains unknown. | (N,office_id,HK) | Future conflicting claims require NULL selected pointer and retained independent date claims. |
| event_kind | No structured ordinary/special/repeat field in H | unknown baseline. | (N,office_id,HK) | Raw HTML phase labels retained. Do not infer event kind solely from year or calendar URL. |
| selected_history_role | H membership or O future date | selected for 8661 H rows. | (N,office_id,HK) | First round and decisive runoff stay one source cycle; F/X are not extra selected histories. Selected does not mean certificate verified. |
| electoral_system | No dedicated historical system field | NULL; no separate explicit system field supplied. | (N,office_id,HK) | Do not infer from office name, vote basis or current council structure. |
| comparability | H. Coverage +H. Comparability status | Join exact nonempty strings with " · "; originals remain raw. | (N,office_id,HK) | 7022 Eligible vote basis; 1639 Unscored/inapplicable. No score computation. |
| ballot_basis | H. Vote basis | Votes for electoral lists, excluding none-of-the-above→list_votes; two Votes for named candidates labels→valid_votes; Official rounded candidate percentages; vote counts unavailable→unknown. | (N,office_id,HK) | 795 list_votes, 7645 valid_votes, 221 unknown events. Preserve none-of-the-above exclusion and percentage-only wording raw. |
| share_unit | H/D supplied percentage convention | percent_0_100; no rescaling. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | No explicit historical legal outcome; future as of research snapshot | unknown for all baseline selected events. | (N,office_id,HK) | Public CIK republication and archived summary do not prove original certificates verified. |
| record_state | H or supplied O next membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row +IX counterpart +F/X retained-reference pointers +BF locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Do not merge unresolved numeric claims into H. No separate event from HTML duplicate. |

## evidence_link

Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged.

| Column | BI source / conversion / null policy |
| --- | --- |
| evidence_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| record_key | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| source_country_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| source_namespace | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| source_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| source_locator | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| claim_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| date_claim_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| claim_json | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Event/result/calendar source_ids and source_locator, plus original P evidence links unchanged. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | bulgaria. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-bulgaria. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H/IX event and date; D result; O calendar_context; Cal input calendar_context; Nts country screening; F/X input stage_observation; HTML input artifact_reference. | evidence_id | Stage citations target retained input, never fabricate an event FK. Source table catalogue rows retained with original metadata. |
| date_claim_id | H/IX selected event date where claim_kind=date | Own date_id for date claim;otherwise NULL. | evidence_id | F/X date text stays retained input; no typed date claim without a real event binding. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## geography

P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents.

| Column | BI source / conversion / null policy |
| --- | --- |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| geography_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents. |
| name | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents. |
| parent_geography_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents. |
| effective_from_label | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents. |
| effective_to_label | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P geography IDs unchanged; new national/EP geography binding held for Atlas identity review; no inferred regional parents. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | O. Country + M.country | `bulgaria`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O. Office ID plus country ID | G=key("geo",[CID,exact office_id]); country-specific disambiguated binding. | (country_id,G) | 3597 unique Gs. Legacy name/type keys have272 collision groups covering630 offices; never merge those places. |
| name | O. Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent geography supplied; NULL. No province/geometry fabrication. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row +exact Office ID/type/jurisdiction +old name/type key | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original names and legacy collision group retained. No guessed municipality/province parents or geometry. |

## identity_crosswalk

P exact aliases retained; BI-to-live crosswalk held; no successor links.

| Column | BI source / conversion / null policy |
| --- | --- |
| entity_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P exact aliases retained; BI-to-live crosswalk held; no successor links. |
| upstream_namespace | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P exact aliases retained; BI-to-live crosswalk held; no successor links. |
| upstream_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P exact aliases retained; BI-to-live crosswalk held; no successor links. |
| record_key | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P exact aliases retained; BI-to-live crosswalk held; no successor links. |
| reason | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. P exact aliases retained; BI-to-live crosswalk held; no successor links. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | No ambiguous old geography alias. Legacy collision groups remain non-executable provenance in Inventory; exact office-code binding is canonical. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | preserved_package_id, proposed_bridge_compatible_id, package_source_id, exact_url_catalogue_alias, baseline_row_binding, documented_identity_correction. | Crosswalk PK | Geography disambiguation is a documented new country rule; event/result IDs preserve current bridge formulas. No claim of already-public Bulgarian IDs. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## ingest_attempt

NO ROW: no importer or database action performed.

| Column | BI source / conversion / null policy |
| --- | --- |
| attempt_id | NO ROW: no importer or database action performed. |
| lineage_id | NO ROW: no importer or database action performed. |
| operator | NO ROW: no importer or database action performed. |
| script_version | NO ROW: no importer or database action performed. |
| started_at | NO ROW: no importer or database action performed. |
| finished_at | NO ROW: no importer or database action performed. |
| status | NO ROW: no importer or database action performed. |
| input_inventory_json | NO ROW: no importer or database action performed. |
| successful_release_id | NO ROW: no importer or database action performed. |
| publication_set_json | NO ROW: no importer or database action performed. |
| row_counts_json | NO ROW: no importer or database action performed. |
| error_text | NO ROW: no importer or database action performed. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| attempt_id | Operational invocation | `attempt-` + lowercase UUIDv4; one fresh unique value per run. This is the only random identifier. | attempt_id | New on unchanged import; never public research identity. |
| lineage_id | Requested country identity | L. | attempt_id | Logical link, no cross-DB FK. |
| operator | Authenticated operator/service identity | Actual value, nonempty; not invented name. | attempt_id | Required preflight input. |
| script_version | Actual importer build identity | Actual immutable build/version; field-map contract version alone is not executing script version. | attempt_id | Record even failed input attempts; exclude from hash except semantic adapter version. |
| started_at | UTC clock at invocation | RFC3339 UTC timestamp with Z; operational only. | attempt_id | Commit started row before staging writes. |
| finished_at | UTC clock at terminal transition | NULL while started; real timestamp when terminal. | attempt_id | Never backdate research. |
| status | Publication state machine | started→succeeded after verified durable swap, or failed before publication; recover ambiguous swap first. | attempt_id | Terminal immutable; no replace/delete. |
| input_inventory_json | Preflight scan of intended inputs / versions | Canonical JSON manifest with known hashes/bytes, missing entries as null hash + error; include intended T path. Immutable after started. | attempt_id | Inventory cannot invent hash for missing T; reverify bytes after logging. |
| successful_release_id | Verified published release | NULL started/failed; R succeeded. | attempt_id | Must match master receipt and selected release logically. |
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Bulgaria. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## office

Bulgaria_Office_Register.json; retain all P IDs and scope dispositions; four explicit new research IDs.

| Column | BI source / conversion / null policy |
| --- | --- |
| id_namespace | P: cdd-observatory-v1 unchanged. BI research IDs are proposals, not a claimed live namespace. |
| office_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| geography_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Office_Register.json; retain all P IDs and scope dispositions; four explicit new research IDs. |
| name | office string |
| office_type | family string; mapping to production enum pending |
| office_status | lifecycle; production enum review pending |
| record_state | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Office_Register.json; retain all P IDs and scope dispositions; four explicit new research IDs. |
| state_note | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Office_Register.json; retain all P IDs and scope dispositions; four explicit new research IDs. |
| registry_qualified | No new true flag: BI additions draft, P held rows unqualified for production. |
| next_date_id | NULL in inherited P bytes; new calendar stays separate with explicit formula precision; no live ID minted. |
| next_date_resolution | Use Upcoming_Elections.date_basis/date_precision only after calendar identity review; no forced exact day. |
| next_history_key | NULL: calendar is separate research, not a published next-event pointer. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O. Office ID) | No release hash in namespace. |
| office_id | O. Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | Exact 3597 O IDs; O/J sets and rows equal. 265 Mayor +265 Municipal council +35 District mayor +3032 Village mayor. |
| country_id | O. Country + M.country | `bulgaria`; exact Bulgaria label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O. Office ID | G bound to exact office ID as above. | (N,office_id) | Same-country FK; two same-name villages retain separate Gs. No legacy ambiguous alias. |
| name | O. Jurisdiction + O. Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O. Office | Exact Mayor / Municipal council / District mayor / Village mayor. | (N,office_id) | Institution type stays separate from proposed geographic grouping; district/village scope explicitly reviewed. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O. Next polling date | NULL for 3597. | (N,office_id) | Cal dates also NULL; no date from expected autumn 2027 briefing prose. |
| next_date_resolution | Same date inputs | unknown for 3597. | (N,office_id) | Pending date is not an in-window confirmed event. |
| next_history_key | No explicit O next date | NULL baseline. | (N,office_id) | No prospective event created. Preserve existing future binding on incomplete refresh. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row +identical J counterpart locators +BF artifact +T review scope | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Retain all score/eligibility/coverage fields, including null/zero; no current-control inference. |

## office_tier_classification

Bulgaria_Draft_Tiers.json, exactly one classification per register row; no BI approval.

| Column | BI source / conversion / null policy |
| --- | --- |
| id_namespace | P: cdd-observatory-v1 unchanged. BI research IDs are proposals, not a claimed live namespace. |
| office_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| tier | Draft national / other (EP supranational scope) / municipal; no regional rows. |
| review_status | Inherited P acceptance is provenance; new BI classifications unapproved; 3,067 submunicipal hold. |
| rationale | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Draft_Tiers.json, exactly one classification per register row; no BI approval. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| classification_path | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Draft_Tiers.json, exactly one classification per register row; no BI approval. |
| classification_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Draft_Tiers.json, exactly one classification per register row; no BI approval. |
| classification_sha256 | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Draft_Tiers.json, exactly one classification per register row; no BI approval. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O. Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | municipal→municipal for 3597 draft proposals. | (N,office_id) | 0 regional/national/council/other. 3067 submunicipal assignments flagged; no calendar classifier. Legacy council metadata not emitted to DDL. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | needs_review for all 3597 because pack is draft; explicit future null-tier hold→unknown. | (N,office_id) | 3067 human_review_required/tier_uncertain=true; 530 municipality-wide rows still need pack approval. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/bulgaria.json`. | (N,office_id) | Deliverable draft only, not claimed committed or approved. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Exact T bytes | cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0 | (N,office_id) | Exact candidate retained-input hash; approval/revision changes T and fingerprint. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

NO NEW ROW; no researched cross-year party equivalence. Source labels preserved.

| Column | BI source / conversion / null policy |
| --- | --- |
| country_id | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| party_namespace | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| mapping_id | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| source_context | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| election_context | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| original_label | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| original_code | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| mapped_group | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| uncertainty | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| lineage_id | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| release_id | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |
| raw_json | NO NEW ROW; no researched cross-year party equivalence. Source labels preserved. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| party_namespace | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapping_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| source_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| election_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_label | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_code | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapped_group | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| uncertainty | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## proceeding

NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity.

| Column | BI source / conversion / null policy |
| --- | --- |
| id_namespace | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| office_id | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| history_key | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| proceeding_id | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| kind | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| sequence_no | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| supersedes_id | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| legal_outcome | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| lineage_id | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| release_id | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |
| raw_json | NO NEW ROW; BI rounds are explicit event records; P F/X projection requires separately reviewed stage identity. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| office_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| history_key | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| proceeding_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| kind | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| sequence_no | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| supersedes_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| legal_outcome | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| lineage_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| release_id | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |
| raw_json | F/X and HTML phase narratives | NO ROW in this minimum projection; all stage observations retained losslessly and indexed in Vectors. No invented proceeding IDs or sequence. | None baseline | 0 typed proceedings. A separate reviewed stage binding is required before future projection; F/X never inflate completed counts. |

## publication_receipt

NO ROW: no publication attempted.

| Column | BI source / conversion / null policy |
| --- | --- |
| singleton | NO ROW: no publication attempted. |
| last_publish_attempt_id | NO ROW: no publication attempted. |
| attempted_lineage_id | NO ROW: no publication attempted. |
| attempted_release_id | NO ROW: no publication attempted. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## publication_release

NO ROW: nothing published.

| Column | BI source / conversion / null policy |
| --- | --- |
| lineage_id | NO ROW: nothing published. |
| release_id | NO ROW: nothing published. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## record_locator

Documentary JSON pointer/source locator proposal; no operational locator rows minted.

| Column | BI source / conversion / null policy |
| --- | --- |
| record_key | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| entity_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| geography_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| id_namespace | P: cdd-observatory-v1 unchanged. BI research IDs are proposals, not a claimed live namespace. |
| office_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| history_key | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| proceeding_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| result_row_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| party_namespace | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| party_mapping_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| source_namespace | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| source_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| input_path | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| source_row_locator | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Documentary JSON pointer/source locator proposal; no operational locator rows minted. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | bulgaria except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party_mapping target; result party labels remain election-scoped source context. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-bulgaria for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator) defined in Source notation; includes member archive_entry, exact source_rows[i], pointer and SHA. | record_key | Exact original input path, SHA, sheet, source_rows and pointer; HTML anchor index if applicable. No invented archive_entry field required. |

## research_date

data/BI_New_Events.json and data/Upcoming_Elections.json preserve day, range, year/formula or unknown precision.

| Column | BI source / conversion / null policy |
| --- | --- |
| date_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json and data/Upcoming_Elections.json preserve day, range, year/formula or unknown precision. |
| label | Exact event date/date_end or calendar next_label; not a derived exact day. |
| precision | day / explicit two-poll range / year_or_formula / unknown_or_conditional. |
| certainty | Official call vs formula vs research hold, separate from granularity. |
| year | Source day year, or explicit term-derived next_year; unknown remains null. |
| month | NULL for formula/year-only; only parse a source-supported ISO day. |
| day | NULL for formula/year-only; never 1 as padding. |
| range_start_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json and data/Upcoming_Elections.json preserve day, range, year/formula or unknown precision. |
| range_end_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Events.json and data/Upcoming_Elections.json preserve day, range, year/formula or unknown precision. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| date_id | H event ballot owner | date-+SHA(C([N,"event",event_id,"ballot"])). | date_id | 8661  date owners, one per selected event; no office-next date rows. |
| label | H. Ballot date if recorded | Exact supplied ISO day for 8661. | date_id | No fallbacks needed baseline. Partial-date examples are explicitly isolated future CI mutations. |
| precision | Full-string date grammar | day for 8661; source cells all full ISO dates. | date_id | Future month/year/range/unknown preserves precision; no invented day1. |
| certainty | No separate historical certainty field | unknown for 8661. | date_id | Supplied day does not establish certification or statutory certainty. |
| year | Parsed H. Ballot date if recorded | Integer 1.. 9999; NULL if unknown or range. | date_id | Actual Gregorian date validation; H. Year remains cycle identity field. |
| month | Parsed month component | 1.. 12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/start. | date_id | No cohort range inferred; Cal End or runoff date isNULL. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/end. | date_id | Endpoints must be ordered/noncyclic actual claims, not day1 padding. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H date/Year +IX counterpart with exact locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | No next date inferred from Cal expected wording or snapshot. |

## result_row

data/BI_New_Results.json; exact source labels/numbers, null missing values; source order identities frozen for this evidence version.

| Column | BI source / conversion / null policy |
| --- | --- |
| id_namespace | P: cdd-observatory-v1 unchanged. BI research IDs are proposals, not a claimed live namespace. |
| office_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| history_key | Exact owning event history_key via event_id; never year-only join. |
| result_row_id | result_id proposed BI identifier; P result_row_id unchanged. |
| proceeding_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. data/BI_New_Results.json; exact source labels/numbers, null missing values; source order identities frozen for this evidence version. |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| candidate_or_list_label | label copied verbatim; aggregate_other_parties / none_of_above row_kind retained. |
| original_party_label | Retain full source label/source_raw; separate party extraction unreviewed. |
| original_party_code | NULL for BI additions unless source separately supplies a code; do not convert a name into a government code. |
| party_namespace | Research proposal: BG plus full event_id; no cross-cycle equivalence. |
| party_mapping_id | NULL; no invented party mapping. |
| votes | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| votes_status | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| share | share_percent exactly as published, percent_0_100; no recalculation. |
| share_status | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| share_unit | percent_0_100 for supplied numeric percentages. |
| seats | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| seats_status | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| elected_flag | NULL unless explicit source statement; not derived from votes or seats. |
| is_substitute | NULL; no false default. |
| evidence_status | result_status plus owning event quality_hold; recorded is not automatically certified. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | D. Office ID under N | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D. Office ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D. Office ID/Year/Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | 25817 D rows resolve to8661 H keys; no F/X typed result row baseline. |
| result_row_id | Proposed per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | Per-HK D encounter index; 25817 unique semantic identities; freeze physical/semantic aliases for later refresh. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D. Country +exact O. Office ID join | `bulgaria`. | (N,result_row_id) | All D rows label Bulgaria; composite FK country/N/office. |
| candidate_or_list_label | D. Candidate or list then D. Party or proposer | First exact nonempty source label,else NULL. | (N,result_row_id) | No invented labels; original spelling/case retained. |
| original_party_label | D. Party or proposer | Exact token or NULL;no family equivalence. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | D. Party or proposer,combined label/code convention | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Preserved source token,not new standardized party identity. |
| party_namespace | D. Year + country package source scope | `bulgaria/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Source election-cycle year namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D. Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 25204 positive integers; 26 recorded zero; 587 NULL. No percentage-to-count inference. |
| votes_status | D. Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D. Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0.. 100; round-trip numeric equality at binary64 precision. |
| share_status | D. Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | 25789 positive and 28 zero shares; no null shares. Two zero-share rows have missing votes; do not infer zero counts. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D. Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 11570 positive, 14247 zero, 0 null baseline. Do not infer elected/substitute flags or current control. |
| seats_status | D. Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D. Result coverage and supplied observations | recorded for 25817 source observations; limitations remain event/raw. | (N,result_row_id) | 587 result rows across 221 events are percentage-only: votes=NULL/unknown, shares retained. Recorded is not certified. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## retained_input

Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained.

| Column | BI source / conversion / null policy |
| --- | --- |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| input_path | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |
| input_kind | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |
| sha256 | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |
| byte_count | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |
| recovery_locator | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |
| payload_json | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Exact files named in SHA256SUMS and source inventory; original payload and expanded tables retained. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | 54 outer +3617 unpacked members +draft T | P paths for outer files; V= P+unpacked/ followed by exact tar member path for members; T unchanged logical path. Inherited paths per Identity Rules. | (L,R,input_path) | 3672 distinct candidate inputs. Draft approval gate blocks publication. |
| input_kind | Path class | T=tier_classification; HTML/XLSX/payload chunks=artifact; other outer/member files=package; accepted future overrides=override. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | 48 ordered XZ chunks, concat payload SHA, inventory and all 3617 members hash-match. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | sha256:<sha256> immutable content store; virtual member also records payload hash, exact archive_entry and pinned outer chunks in inventory. | (L,R,input_path) | All bytes recoverable and rehashed before publication; no dependency on temporary unpack directory. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | All JSON including F/X, original score gates/coverage, parameters and caches retained losslessly. HTML scripts and formulas never execute. |

## source

Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished.

| Column | BI source / conversion / null policy |
| --- | --- |
| country_id | bulgaria / BG as appropriate; no extra country identity. |
| source_namespace | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| source_id | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| publisher | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| title | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| url | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| checked_as_of_label | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| evidence_grade | retrieval_status/snapshot_kind plus event-specific result_status; baseline P evidence grade retained. |
| file_sha256 | file_sha256 only for exact saved bytes. remote_original_sha256 null when original not downloaded. |
| locator | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| data_rights | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Source_Inventory.json; raw download hash or extraction hash explicitly distinguished. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| country_id | S row or actual inline occurrence | `bulgaria`. | (bulgaria,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-bulgaria`. | (bulgaria,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | SM/SC. Source ID union +actual inline URLs | Catalogue `bulgaria--` + Source ID; inline-only `bulgaria--` + key("url",exact URL). | Source tuple | 2809 SM rows identical-ID subset of 3971 SC rows; 2 inline-only=3973 sources. Duplicate catalogue rows retained as two origins, one identity. |
| publisher | No dedicated publisher column; inline lacks metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S. Title | Verbatim for catalogue; NULL inline-only. | Source tuple | No publisher/title fabrication; catalogue metadata preserved without implying fresh verification. |
| url | S. Source URL or real inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | All catalogue URLs unique; preserve query/resId/langId and hash fragment exactly. |
| checked_as_of_label | SM/SC. Accessed | Exact source label;inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S. Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | Every SM/SC original row/origin or inline occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Equal duplicate catalogue IDs merged, not counted twice; conflicting future metadata fails review. |

## unresolved_evidence

Bulgaria_Research_Gaps.json and data/Result_Reconciliation_Holds.json; P retained observations lossless.

| Column | BI source / conversion / null policy |
| --- | --- |
| unresolved_id | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Research_Gaps.json and data/Result_Reconciliation_Holds.json; P retained observations lossless. |
| record_key | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Research_Gaps.json and data/Result_Reconciliation_Holds.json; P retained observations lossless. |
| original_token | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Research_Gaps.json and data/Result_Reconciliation_Holds.json; P retained observations lossless. |
| source_locator | Copy same-named documentary field; absence stays NULL/unknown; preserve explicit zero and exact identifier. |
| reason | Keep original P mapping for inherited rows. BI: only source-explicit same-named evidence may populate this field; otherwise NULL / no row pending field-level review. Bulgaria_Research_Gaps.json and data/Result_Reconciliation_Holds.json; P retained observations lossless. |
| lineage_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| release_id | No live value minted. Retain P contract as provenance; any BI projection requires a separately approved release fingerprint. |
| raw_json | Complete original object/source_raw plus locator; no source field dropped or normalized in place. |

Inherited P mapping (unchanged documentary rules):

| Destination column | Source locator | Conversion / null policy | Identity / FK scope | Validation assertion |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bulgaria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bulgaria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

