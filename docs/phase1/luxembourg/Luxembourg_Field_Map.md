# Luxembourg → Atlas 223-column field map

Documentation only. Exact 223 destination names / 20 tables inherited from the retained Bosnia contract (its schema pin is stated in that file). No claim of a fresh production-schema audit. All projections below are proposed and require review; applied_changes=0.

Raw retention is mandatory: reporting scope, unit, result kind, source certification, and uncontested semantics must survive projection. Never combine candidate and list vectors or national and constituent breakdowns.

## dataset_lineage

| Destination | Luxembourg source / disposition |
|---|---|
| lineage_id | Fixed country-package-luxembourg. |
| provenance_kind | country_package |
| description | Luxembourg Prompt AO official-source research handoff. |

## dataset_release

| Destination | Luxembourg source / disposition |
|---|---|
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| fingerprint_sha256 | SHA256 of sorted path/hash list plus contract/identity/map versions and accepted tiers; excludes clock and attempt ID. |
| hash_inputs_json | Canonical object of those exact inputs; draft tier status prevents publication. |
| adapter_version | atlas-luxembourg-field-map/1 (documentation identifier, no importer). |
| method_version | atlas-preserve-evidence/1 |
| schema_version | Inherited atlas-master/1 contract; current production migration execution Not run. |
| research_snapshot_label | 2026-09-22 |
| upstream_release_id | Prompt-AO-Luxembourg |
| validated_counts_json | Computed validator output, not hard-coded source counts. |
| research_coverage_complete | 0: historical supplement/certification gaps remain documented. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## retained_input

| Destination | Luxembourg source / disposition |
|---|---|
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| input_path | Source inventory.path or exact data/ relative member path. |
| input_kind | artifact for sources; package for data/docs/contract; tier_classification for draft-tiers. |
| sha256 | Exact retained bytes SHA-256. |
| byte_count | Exact retained bytes length. |
| recovery_locator | ZIP relative member path. |
| payload_json | Source descriptor, including capture_kind; never pretend web extract is original PDF. |

## country

| Destination | Luxembourg source / disposition |
|---|---|
| country_id | Fixed luxembourg. |
| country_code | LU |
| name | Luxembourg |
| polity_kind | constitutional_monarchy |
| region_id | europe |
| coverage_status | full_current_register_historical_archive_coverage_with_explicit_gaps |
| screening_as_of_label | 2026-09-22 |
| notes | Grand Duke hereditary; mayor appointed from council majority; no popular executive offices. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## geography

| Destination | Luxembourg source / disposition |
|---|---|
| country_id | Fixed luxembourg. |
| geography_id | LU-G- + office_id; country geography for Parliament and EP, distinct pre-merger geography for historic councils. |
| name | office.commune, otherwise Luxembourg. |
| parent_geography_id | Luxembourg country geography for communes; NULL for country. Cantons are geography, not elected regional offices. |
| effective_from_label | merger-crosswalk.effective_date when known; otherwise NULL. |
| effective_to_label | Evidence-supported merger effective_date for predecessor; otherwise NULL, not inferred from absent results. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## office

| Destination | Luxembourg source / disposition |
|---|---|
| id_namespace | Proposed cdd-atlas-lu-research-v1; crosswalk required before an existing namespace is reused. |
| office_id | office-register.office_id, or events[results.event_id].office_id; exact FK. |
| country_id | Fixed luxembourg. |
| geography_id | LU-G- + office_id; country geography for Parliament and EP, distinct pre-merger geography for historic councils. |
| name | office-register.name |
| office_type | office-register.office_type |
| office_status | office-register.status |
| record_state | active (retained historical offices are active research records, with office_status=historical). |
| state_note | Boundary, source status and uncontested notes; NULL if absent. |
| registry_qualified | 1 for all sourced included offices. |
| next_date_id | NULL; no called future polling day established. |
| next_date_resolution | unknown |
| next_history_key | NULL |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## office_tier_classification

| Destination | Luxembourg source / disposition |
|---|---|
| id_namespace | Proposed cdd-atlas-lu-research-v1; crosswalk required before an existing namespace is reused. |
| office_id | office-register.office_id, or events[results.event_id].office_id; exact FK. |
| tier | draft-tiers.tier exact office 1:1. |
| review_status | needs_review |
| rationale | Communal council municipal; national Parliament national; EP delegation other; no regional elected body. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| classification_path | data/draft-tiers.json |
| classification_kind | draft_for_human_review |
| classification_sha256 | SHA256 of exact draft-tiers.json bytes. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## research_date

| Destination | Luxembourg source / disposition |
|---|---|
| date_id | LU-D- + exact label + precision; no missing day invented. |
| label | events.date |
| precision | events.date_precision |
| certainty | observed for sourced dates; year-only remains year precision. Uncontested dates are cycle labels, not polling. |
| year | First four digits of events.date. |
| month | Digits 6–7 only for day precision, else NULL. |
| day | Digits 9–10 only for day precision, else NULL. |
| range_start_id | NULL |
| range_end_id | NULL |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## election_event

| Destination | Luxembourg source / disposition |
|---|---|
| id_namespace | Proposed cdd-atlas-lu-research-v1; crosswalk required before an existing namespace is reused. |
| office_id | office-register.office_id, or events[results.event_id].office_id; exact FK. |
| history_key | events.event_id (stable office + source-supported election date/year). |
| event_id | events.event_id; one council/cycle, sections share it. |
| date_id | LU-D- + exact label + precision; no missing day invented. |
| date_resolution | resolved to source-backed label, independent of precision. |
| event_kind | events.event_type |
| selected_history_role | historical |
| electoral_system | Source modeScrutin / 2011 header / HTML details, retained in observations; NULL where unestablished. |
| comparability | Boundary-qualified; no cross-merger comparability. Separate national/constituency/commune reporting scopes. |
| ballot_basis | Panachage/multiple votes; candidate and list totals not additive. Uncontested units have no popular vote vector. |
| share_unit | percent |
| legal_outcome | Source result_status only; unofficial does not imply certified. |
| record_state | active (retained historical offices are active research records, with office_status=historical). |
| state_note | events.uncontested_reporting_units, date_role, result_status and observation exceptions. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## proceeding

| Destination | Luxembourg source / disposition |
|---|---|
| id_namespace | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| office_id | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| history_key | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| proceeding_id | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| kind | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| sequence_no | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| supersedes_id | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| legal_outcome | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| lineage_id | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| release_id | NO ROW — No separate proceeding records established; no fake runoff/repeat. |
| raw_json | NO ROW — No separate proceeding records established; no fake runoff/repeat. |

## result_row

| Destination | Luxembourg source / disposition |
|---|---|
| id_namespace | Proposed cdd-atlas-lu-research-v1; crosswalk required before an existing namespace is reused. |
| office_id | office-register.office_id, or events[results.event_id].office_id; exact FK. |
| history_key | events.event_id (stable office + source-supported election date/year). |
| result_row_id | results.result_id |
| proceeding_id | NULL; no separately established proceedings in this pack. |
| country_id | Fixed luxembourg. |
| candidate_or_list_label | results.name |
| original_party_label | results.party_label |
| original_party_code | Source list numero/id if provided in raw, otherwise NULL. |
| party_namespace | NULL; no canonical party mappings invented. |
| party_mapping_id | NULL; original labels retained. |
| votes | results.votes; NULL for uncontested placeholders (reported_votes=0 retained in raw). |
| votes_status | results.votes_status; no unknown-to-zero conversion. |
| share | results.vote_share_pct; preserve percent units, never convert to first-preference share. |
| share_status | reported if nonnull, otherwise unknown. |
| share_unit | percent |
| seats | results.seats; candidate elected flag is not fabricated party seats. |
| seats_status | reported if nonnull, otherwise unknown. |
| elected_flag | ELU/oui true, NON_ELU/non false; NULL for reporting-unit-only candidate tables. |
| is_substitute | NULL unless explicitly established; not inferred from losing rank. |
| evidence_status | results.result_status, source status retained separately from numerical completeness. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## party_mapping

| Destination | Luxembourg source / disposition |
|---|---|
| country_id | NO ROW — No reviewed canonical party alignment. |
| party_namespace | NO ROW — No reviewed canonical party alignment. |
| mapping_id | NO ROW — No reviewed canonical party alignment. |
| source_context | NO ROW — No reviewed canonical party alignment. |
| election_context | NO ROW — No reviewed canonical party alignment. |
| original_label | NO ROW — No reviewed canonical party alignment. |
| original_code | NO ROW — No reviewed canonical party alignment. |
| mapped_group | NO ROW — No reviewed canonical party alignment. |
| uncertainty | NO ROW — No reviewed canonical party alignment. |
| lineage_id | NO ROW — No reviewed canonical party alignment. |
| release_id | NO ROW — No reviewed canonical party alignment. |
| raw_json | NO ROW — No reviewed canonical party alignment. |

## source

| Destination | Luxembourg source / disposition |
|---|---|
| country_id | Fixed luxembourg. |
| source_namespace | luxembourg-official-research |
| source_id | source-inventory.source_id, resolved by exact source_url. |
| publisher | source-inventory.publisher (official host). |
| title | Original URL basename / document heading, no invented publication date. |
| url | source-inventory.url |
| checked_as_of_label | 2026-09-22 |
| evidence_grade | official_publisher; capture/result certification are independent. |
| file_sha256 | source-inventory.sha256; Berdorf hash covers retained extraction, not inaccessible PDF bytes. |
| locator | source-inventory.path |
| data_rights | Official election portal open data CC0 where licensed; other source terms remain source-specific, not blanket relicensing. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## record_locator

| Destination | Luxembourg source / disposition |
|---|---|
| record_key | entity-kind + : + exact stable entity ID; reject broken references. |
| entity_kind | office / election_event / result_row / source per owning entity. |
| country_id | Fixed luxembourg. |
| geography_id | LU-G- + office_id; country geography for Parliament and EP, distinct pre-merger geography for historic councils. |
| id_namespace | Proposed cdd-atlas-lu-research-v1; crosswalk required before an existing namespace is reused. |
| office_id | office-register.office_id, or events[results.event_id].office_id; exact FK. |
| history_key | events.event_id (stable office + source-supported election date/year). |
| proceeding_id | NULL; no separately established proceedings in this pack. |
| result_row_id | results.result_id for result locators; otherwise NULL. |
| party_namespace | NULL; no canonical party mappings invented. |
| party_mapping_id | NULL; original labels retained. |
| source_namespace | luxembourg-official-research |
| source_id | source-inventory.source_id, resolved by exact source_url. |
| input_path | Source inventory.path or exact data/ relative member path. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| source_row_locator | results.source_locator or exact JSON row pointer / observation locator. |

## evidence_link

| Destination | Luxembourg source / disposition |
|---|---|
| evidence_id | SHA256(record_key, source_id, exact locator, claim kind). |
| record_key | entity-kind + : + exact stable entity ID; reject broken references. |
| source_country_id | luxembourg |
| source_namespace | luxembourg-official-research |
| source_id | source-inventory.source_id, resolved by exact source_url. |
| source_locator | results.source_locator or observation locator. |
| claim_kind | office_existence / result / election_date / merger as appropriate. |
| date_claim_id | Date FK only for date claims; otherwise NULL. |
| claim_json | Exact retained source values and certification qualifier. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |

## unresolved_evidence

| Destination | Luxembourg source / disposition |
|---|---|
| unresolved_id | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| record_key | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| original_token | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| source_locator | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| reason | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| lineage_id | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| release_id | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |
| raw_json | NO ROW — No unresolved source FKs are permitted; substantive research gaps are in the gap ledger, not fake source rows. |

## identity_crosswalk

| Destination | Luxembourg source / disposition |
|---|---|
| entity_kind | office |
| upstream_namespace | Luxembourg election source version + source URL |
| upstream_id | Source commune name/section plus cycle/boundary version, never name alone. |
| record_key | entity-kind + : + exact stable entity ID; reject broken references. |
| reason | Explicit aliases and merger/section distinctions in identity rules; merger edges are separate, not identity equivalence. |
| lineage_id | Fixed country-package-luxembourg. |
| release_id | Future L + --sha256- + canonical effective-input fingerprint; no release is applied. |
| raw_json | Lossless owning source object plus source URL, locator, capture SHA; preserve all fields omitted from normalized projection. |

## publication_release

| Destination | Luxembourg source / disposition |
|---|---|
| lineage_id | NO ROW — Not run; research only. |
| release_id | NO ROW — Not run; research only. |

## publication_receipt

| Destination | Luxembourg source / disposition |
|---|---|
| singleton | NO ROW — Not run; research only. |
| last_publish_attempt_id | NO ROW — Not run; research only. |
| attempted_lineage_id | NO ROW — Not run; research only. |
| attempted_release_id | NO ROW — Not run; research only. |

## ingest_attempt

| Destination | Luxembourg source / disposition |
|---|---|
| attempt_id | NO ROW — Not run; no importer/SQLite execution. |
| lineage_id | NO ROW — Not run; no importer/SQLite execution. |
| operator | NO ROW — Not run; no importer/SQLite execution. |
| script_version | NO ROW — Not run; no importer/SQLite execution. |
| started_at | NO ROW — Not run; no importer/SQLite execution. |
| finished_at | NO ROW — Not run; no importer/SQLite execution. |
| status | NO ROW — Not run; no importer/SQLite execution. |
| input_inventory_json | NO ROW — Not run; no importer/SQLite execution. |
| successful_release_id | NO ROW — Not run; no importer/SQLite execution. |
| publication_set_json | NO ROW — Not run; no importer/SQLite execution. |
| row_counts_json | NO ROW — Not run; no importer/SQLite execution. |
| error_text | NO ROW — Not run; no importer/SQLite execution. |
