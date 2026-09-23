# Iceland — 223-column field map

Exact inherited 20-table / 223-column column-name contract. Research/documentation only; `applied_changes=0`. Operational publication and ingest rows are NOT EXECUTED. Missing source values remain NULL, never synthetic zero.

| Table | Column | Iceland mapping / disposition |
|---|---|---|
| `dataset_lineage` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_lineage` | `provenance_kind` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_lineage` | `description` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `fingerprint_sha256` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `hash_inputs_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `adapter_version` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `method_version` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `schema_version` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `research_snapshot_label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `upstream_release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `validated_counts_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `research_coverage_complete` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `dataset_release` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `retained_input` | `lineage_id` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `release_id` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `input_path` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `input_kind` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `sha256` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `byte_count` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `recovery_locator` | Package-relative retained evidence file plus SHA-256/byte count. |
| `retained_input` | `payload_json` | Package-relative retained evidence file plus SHA-256/byte count. |
| `country` | `country_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `country_code` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `name` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `polity_kind` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `region_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `coverage_status` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `screening_as_of_label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `notes` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `country` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `country_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `geography_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `name` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `parent_geography_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `effective_from_label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `effective_to_label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `geography` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `office` | `id_namespace` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `office_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `country_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `geography_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `name` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `office_type` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `office_status` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `record_state` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `state_note` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `registry_qualified` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `next_date_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `next_date_resolution` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `next_history_key` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `lineage_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `release_id` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office` | `raw_json` | Map from `data/office-register.json`; temporal municipal identity and source-supported status preserved. |
| `office_tier_classification` | `id_namespace` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `office_id` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `tier` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `review_status` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `rationale` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `lineage_id` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `release_id` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_path` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_kind` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_sha256` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `raw_json` | Map 1:1 from `data/draft-tiers.json`; `draft_for_human_review`; Justin approval false. |
| `research_date` | `date_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `precision` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `certainty` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `year` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `month` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `day` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `range_start_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `range_end_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `research_date` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `election_event` | `id_namespace` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `office_id` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `history_key` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `event_id` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `date_id` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `date_resolution` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `event_kind` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `selected_history_role` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `electoral_system` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `comparability` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `ballot_basis` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `share_unit` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `legal_outcome` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `record_state` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `state_note` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `lineage_id` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `release_id` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `election_event` | `raw_json` | Map from `data/events.json`; cycle/date/mode and source IDs preserved; no invented contest. |
| `proceeding` | `id_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `office_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `history_key` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `proceeding_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `kind` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `sequence_no` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `supersedes_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `legal_outcome` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `proceeding` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `result_row` | `id_namespace` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `office_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `history_key` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `result_row_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `proceeding_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `country_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `candidate_or_list_label` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `original_party_label` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `original_party_code` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `party_namespace` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `party_mapping_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `votes` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `votes_status` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `share` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `share_status` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `share_unit` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `seats` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `seats_status` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `elected_flag` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `is_substitute` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `evidence_status` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `lineage_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `release_id` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `result_row` | `raw_json` | Map from `data/results.json`; null numeric with explicit status is valid and not coerced to zero. |
| `party_mapping` | `country_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `party_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `mapping_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `source_context` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `election_context` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `original_label` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `original_code` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `mapped_group` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `uncertainty` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `party_mapping` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `source` | `country_id` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `source_namespace` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `source_id` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `publisher` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `title` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `url` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `checked_as_of_label` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `evidence_grade` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `file_sha256` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `locator` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `data_rights` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `lineage_id` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `release_id` | Map from `data/source-inventory.json`, including retained extract hash. |
| `source` | `raw_json` | Map from `data/source-inventory.json`, including retained extract hash. |
| `record_locator` | `record_key` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `entity_kind` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `country_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `geography_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `id_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `office_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `history_key` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `proceeding_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `result_row_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `party_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `party_mapping_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `source_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `source_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `input_path` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `record_locator` | `source_row_locator` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `evidence_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `record_key` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `source_country_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `source_namespace` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `source_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `source_locator` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `claim_kind` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `date_claim_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `claim_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `evidence_link` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `unresolved_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `record_key` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `original_token` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `source_locator` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `reason` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `lineage_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `release_id` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `unresolved_evidence` | `raw_json` | Project from retained research records/raw metadata when source-supported; otherwise NULL/NO ROW according to inherited contract. |
| `identity_crosswalk` | `entity_kind` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `upstream_namespace` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `upstream_id` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `record_key` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `reason` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `lineage_id` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `release_id` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `identity_crosswalk` | `raw_json` | Map only source-supported merger successor edges from `data/identity-crosswalk.json`. |
| `publication_release` | `lineage_id` | NOT EXECUTED; no operational row is created. |
| `publication_release` | `release_id` | NOT EXECUTED; no operational row is created. |
| `publication_receipt` | `singleton` | NOT EXECUTED; no operational row is created. |
| `publication_receipt` | `last_publish_attempt_id` | NOT EXECUTED; no operational row is created. |
| `publication_receipt` | `attempted_lineage_id` | NOT EXECUTED; no operational row is created. |
| `publication_receipt` | `attempted_release_id` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `attempt_id` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `lineage_id` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `operator` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `script_version` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `started_at` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `finished_at` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `status` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `input_inventory_json` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `successful_release_id` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `publication_set_json` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `row_counts_json` | NOT EXECUTED; no operational row is created. |
| `ingest_attempt` | `error_text` | NOT EXECUTED; no operational row is created. |
