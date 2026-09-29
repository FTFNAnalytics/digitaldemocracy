# Chile — 223-column documentary field map

Pinned Atlas main: `702ac3a0717ab822b7d619e6e26ab012f499ff6e`. The 20-table contract contains 223 columns, excluding the migration bookkeeping table. The pinned DDL is retained as text and never executed. Later derived/search/person migrations are not silently folded into the requested contract. This is mapping documentation, not an import payload.

| Table | Column | Mapping / hold |
|---|---|---|
| country | country_id | constant chile |
| country | country_code | constant CL |
| country | name | sourced country, geography or office name |
| country | polity_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | region_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | coverage_status | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | screening_as_of_label | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | notes | documentary notes and named research holds |
| country | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| country | raw_json | lossless source facts / retained summary cells / record metadata |
| dataset_lineage | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_lineage | provenance_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_lineage | description | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | fingerprint_sha256 | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | hash_inputs_json | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | adapter_version | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | method_version | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | schema_version | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | research_snapshot_label | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | upstream_release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | validated_counts_json | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| dataset_release | research_coverage_complete | false: named result, alias, era and repeat gates remain |
| dataset_release | raw_json | lossless source facts / retained summary cells / record metadata |
| election_event | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| election_event | office_id | office_register.office_id; pending aliases remain null |
| election_event | history_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | event_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | date_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | date_resolution | formula/year, exact historical day, two-day range or research hold |
| election_event | event_kind | events.event_kind; distinguish runoff, partial repeat, partial annulment and final-dataset hold |
| election_event | selected_history_role | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | electoral_system | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | comparability | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | ballot_basis | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | share_unit | fraction where explicitly retained; null otherwise |
| election_event | legal_outcome | only sourced legal decision; null otherwise |
| election_event | record_state | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | state_note | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| election_event | raw_json | lossless source facts / retained summary cells / record metadata |
| evidence_link | evidence_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | record_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | source_country_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | source_namespace | official publisher namespace; documentary proposal only |
| evidence_link | source_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | source_locator | source_refs or source_aggregate_refs and article locator |
| evidence_link | claim_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | date_claim_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | claim_json | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| evidence_link | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | country_id | constant chile |
| geography | geography_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | name | sourced country, geography or office name |
| geography | parent_geography_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | effective_from_label | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | effective_to_label | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| geography | raw_json | lossless source facts / retained summary cells / record metadata |
| identity_crosswalk | entity_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | upstream_namespace | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | upstream_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | record_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | reason | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| identity_crosswalk | raw_json | lossless source facts / retained summary cells / record metadata |
| ingest_attempt | attempt_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | lineage_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | operator | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | script_version | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | started_at | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | finished_at | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | status | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | input_inventory_json | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | successful_release_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | publication_set_json | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | row_counts_json | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| ingest_attempt | error_text | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| office | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| office | office_id | office_register.office_id; pending aliases remain null |
| office | country_id | constant chile |
| office | geography_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | name | sourced country, geography or office name |
| office | office_type | office_register.office_family; target enum review required |
| office | office_status | current / historical_only from office register |
| office | record_state | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | state_note | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | registry_qualified | documentary office evidence; does not imply approved production publication |
| office | next_date_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | next_date_resolution | formula_year; pending formal call |
| office | next_history_key | upcoming_calendar_id (documentary association only) |
| office | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office | raw_json | lossless source facts / retained summary cells / record metadata |
| office_tier_classification | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| office_tier_classification | office_id | office_register.office_id; pending aliases remain null |
| office_tier_classification | tier | draft_tiers.tier: national_context, regional, municipal |
| office_tier_classification | review_status | unreviewed; Justin approval false |
| office_tier_classification | rationale | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office_tier_classification | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office_tier_classification | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office_tier_classification | classification_path | data/draft_tiers.json |
| office_tier_classification | classification_kind | draft_research |
| office_tier_classification | classification_sha256 | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| office_tier_classification | raw_json | lossless source facts / retained summary cells / record metadata |
| party_mapping | country_id | constant chile |
| party_mapping | party_namespace | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | mapping_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | source_context | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | election_context | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | original_label | source party label, unchanged |
| party_mapping | original_code | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | mapped_group | null; no party-family classification undertaken |
| party_mapping | uncertainty | explicit named research gap |
| party_mapping | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| party_mapping | raw_json | lossless source facts / retained summary cells / record metadata |
| proceeding | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| proceeding | office_id | office_register.office_id; pending aliases remain null |
| proceeding | history_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | proceeding_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | sequence_no | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | supersedes_id | null unless exact legal proceeding relation independently sourced; no guessed edge |
| proceeding | legal_outcome | only sourced legal decision; null otherwise |
| proceeding | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| proceeding | raw_json | lossless source facts / retained summary cells / record metadata |
| publication_receipt | singleton | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| publication_receipt | last_publish_attempt_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| publication_receipt | attempted_lineage_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| publication_receipt | attempted_release_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| publication_release | lineage_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| publication_release | release_id | Not instantiated: no ingestion, publication, successful release or receipt occurred (applied_changes=0). |
| record_locator | record_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | entity_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | country_id | constant chile |
| record_locator | geography_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| record_locator | office_id | office_register.office_id; pending aliases remain null |
| record_locator | history_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | proceeding_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | result_row_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | party_namespace | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | party_mapping_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | source_namespace | official publisher namespace; documentary proposal only |
| record_locator | source_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | input_path | retained pack-relative file path |
| record_locator | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| record_locator | source_row_locator | source_refs or source_aggregate_refs; non-contiguous spans require predicate |
| research_date | date_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| research_date | label | source date/formula; not guessed exact future day |
| research_date | precision | formula_year / day / range / unknown |
| research_date | certainty | statutory_formula / official_historical / research_hold |
| research_date | year | sourced year or explicitly derived next ordinary occurrence year |
| research_date | month | null for uncalled upcoming formulas; only sourced exact historical dates |
| research_date | day | null for uncalled upcoming formulas; only sourced exact historical dates |
| research_date | range_start_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| research_date | range_end_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| research_date | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| research_date | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| research_date | raw_json | lossless source facts / retained summary cells / record metadata |
| result_row | id_namespace | proposed documentary namespace atlasresearch-cl-bj; no production minting |
| result_row | office_id | office_register.office_id; pending aliases remain null |
| result_row | history_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | result_row_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | proceeding_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | country_id | constant chile |
| result_row | candidate_or_list_label | results.candidate_or_label; result_kind separates candidates and totals |
| result_row | original_party_label | party_source_label losslessly; no ideological assignment |
| result_row | original_party_code | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | party_namespace | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | party_mapping_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | votes | results.votes; sum only explicitly sourced components |
| result_row | votes_status | source_reported / derived_sum / missing; no missing-to-zero coercion |
| result_row | share | results.share, never infer from absent votes |
| result_row | share_status | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | share_unit | fraction where explicitly retained; null otherwise |
| result_row | seats | explicit winner indicator permits 1 per elected candidate; otherwise null |
| result_row | seats_status | explicit_elected_candidate or missing, no chamber-total allocation |
| result_row | elected_flag | explicit source marker / elected sheet; absence stays null |
| result_row | is_substitute | null except explicit source; parenthetical alternatives not merged as primary people |
| result_row | evidence_status | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| result_row | raw_json | lossless source facts / retained summary cells / record metadata |
| retained_input | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| retained_input | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| retained_input | input_path | retained pack-relative file path |
| retained_input | input_kind | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| retained_input | sha256 | retained file byte SHA-256 |
| retained_input | byte_count | retained file byte_count |
| retained_input | recovery_locator | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| retained_input | payload_json | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | country_id | constant chile |
| source | source_namespace | official publisher namespace; documentary proposal only |
| source | source_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | publisher | Source_Inventory.publisher |
| source | title | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | url | Source_Inventory.url or source_aliases.url |
| source | checked_as_of_label | 2026-09-29 research snapshot |
| source | evidence_grade | certified_TRICEL, certified_TER_published_SERvel, official historical or hold |
| source | file_sha256 | retained source SHA-256 with hash_semantics |
| source | locator | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | data_rights | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| source | raw_json | lossless source facts / retained summary cells / record metadata |
| unresolved_evidence | unresolved_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | record_key | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | original_token | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | source_locator | source_refs or source_aggregate_refs and article locator |
| unresolved_evidence | reason | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | lineage_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | release_id | No value supplied in this research pack; target application metadata or unresolved mapping. Do not fabricate or default. |
| unresolved_evidence | raw_json | lossless source facts / retained summary cells / record metadata |
