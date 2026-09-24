# Inherited Atlas 20-table / 223-column research contract

Prompt AW documentary copy of the destination column inventory. This file enumerates the exact 20 table names and 223 column names used by the retained Atlas contract. It is not a schema migration and does not claim byte identity with the earlier Prompt O narrative field-map file.

## dataset_lineage

| # | Column |
|---:|---|
| 1 | `lineage_id` |
| 2 | `provenance_kind` |
| 3 | `description` |

## dataset_release

| # | Column |
|---:|---|
| 1 | `lineage_id` |
| 2 | `release_id` |
| 3 | `fingerprint_sha256` |
| 4 | `hash_inputs_json` |
| 5 | `adapter_version` |
| 6 | `method_version` |
| 7 | `schema_version` |
| 8 | `research_snapshot_label` |
| 9 | `upstream_release_id` |
| 10 | `validated_counts_json` |
| 11 | `research_coverage_complete` |
| 12 | `raw_json` |

## retained_input

| # | Column |
|---:|---|
| 1 | `lineage_id` |
| 2 | `release_id` |
| 3 | `input_path` |
| 4 | `input_kind` |
| 5 | `sha256` |
| 6 | `byte_count` |
| 7 | `recovery_locator` |
| 8 | `payload_json` |

## country

| # | Column |
|---:|---|
| 1 | `country_id` |
| 2 | `country_code` |
| 3 | `name` |
| 4 | `polity_kind` |
| 5 | `region_id` |
| 6 | `coverage_status` |
| 7 | `screening_as_of_label` |
| 8 | `notes` |
| 9 | `lineage_id` |
| 10 | `release_id` |
| 11 | `raw_json` |

## geography

| # | Column |
|---:|---|
| 1 | `country_id` |
| 2 | `geography_id` |
| 3 | `name` |
| 4 | `parent_geography_id` |
| 5 | `effective_from_label` |
| 6 | `effective_to_label` |
| 7 | `lineage_id` |
| 8 | `release_id` |
| 9 | `raw_json` |

## office

| # | Column |
|---:|---|
| 1 | `id_namespace` |
| 2 | `office_id` |
| 3 | `country_id` |
| 4 | `geography_id` |
| 5 | `name` |
| 6 | `office_type` |
| 7 | `office_status` |
| 8 | `record_state` |
| 9 | `state_note` |
| 10 | `registry_qualified` |
| 11 | `next_date_id` |
| 12 | `next_date_resolution` |
| 13 | `next_history_key` |
| 14 | `lineage_id` |
| 15 | `release_id` |
| 16 | `raw_json` |

## office_tier_classification

| # | Column |
|---:|---|
| 1 | `id_namespace` |
| 2 | `office_id` |
| 3 | `tier` |
| 4 | `review_status` |
| 5 | `rationale` |
| 6 | `lineage_id` |
| 7 | `release_id` |
| 8 | `classification_path` |
| 9 | `classification_kind` |
| 10 | `classification_sha256` |
| 11 | `raw_json` |

## research_date

| # | Column |
|---:|---|
| 1 | `date_id` |
| 2 | `label` |
| 3 | `precision` |
| 4 | `certainty` |
| 5 | `year` |
| 6 | `month` |
| 7 | `day` |
| 8 | `range_start_id` |
| 9 | `range_end_id` |
| 10 | `lineage_id` |
| 11 | `release_id` |
| 12 | `raw_json` |

## election_event

| # | Column |
|---:|---|
| 1 | `id_namespace` |
| 2 | `office_id` |
| 3 | `history_key` |
| 4 | `event_id` |
| 5 | `date_id` |
| 6 | `date_resolution` |
| 7 | `event_kind` |
| 8 | `selected_history_role` |
| 9 | `electoral_system` |
| 10 | `comparability` |
| 11 | `ballot_basis` |
| 12 | `share_unit` |
| 13 | `legal_outcome` |
| 14 | `record_state` |
| 15 | `state_note` |
| 16 | `lineage_id` |
| 17 | `release_id` |
| 18 | `raw_json` |

## proceeding

| # | Column |
|---:|---|
| 1 | `id_namespace` |
| 2 | `office_id` |
| 3 | `history_key` |
| 4 | `proceeding_id` |
| 5 | `kind` |
| 6 | `sequence_no` |
| 7 | `supersedes_id` |
| 8 | `legal_outcome` |
| 9 | `lineage_id` |
| 10 | `release_id` |
| 11 | `raw_json` |

## result_row

| # | Column |
|---:|---|
| 1 | `id_namespace` |
| 2 | `office_id` |
| 3 | `history_key` |
| 4 | `result_row_id` |
| 5 | `proceeding_id` |
| 6 | `country_id` |
| 7 | `candidate_or_list_label` |
| 8 | `original_party_label` |
| 9 | `original_party_code` |
| 10 | `party_namespace` |
| 11 | `party_mapping_id` |
| 12 | `votes` |
| 13 | `votes_status` |
| 14 | `share` |
| 15 | `share_status` |
| 16 | `share_unit` |
| 17 | `seats` |
| 18 | `seats_status` |
| 19 | `elected_flag` |
| 20 | `is_substitute` |
| 21 | `evidence_status` |
| 22 | `lineage_id` |
| 23 | `release_id` |
| 24 | `raw_json` |

## party_mapping

| # | Column |
|---:|---|
| 1 | `country_id` |
| 2 | `party_namespace` |
| 3 | `mapping_id` |
| 4 | `source_context` |
| 5 | `election_context` |
| 6 | `original_label` |
| 7 | `original_code` |
| 8 | `mapped_group` |
| 9 | `uncertainty` |
| 10 | `lineage_id` |
| 11 | `release_id` |
| 12 | `raw_json` |

## source

| # | Column |
|---:|---|
| 1 | `country_id` |
| 2 | `source_namespace` |
| 3 | `source_id` |
| 4 | `publisher` |
| 5 | `title` |
| 6 | `url` |
| 7 | `checked_as_of_label` |
| 8 | `evidence_grade` |
| 9 | `file_sha256` |
| 10 | `locator` |
| 11 | `data_rights` |
| 12 | `lineage_id` |
| 13 | `release_id` |
| 14 | `raw_json` |

## record_locator

| # | Column |
|---:|---|
| 1 | `record_key` |
| 2 | `entity_kind` |
| 3 | `country_id` |
| 4 | `geography_id` |
| 5 | `id_namespace` |
| 6 | `office_id` |
| 7 | `history_key` |
| 8 | `proceeding_id` |
| 9 | `result_row_id` |
| 10 | `party_namespace` |
| 11 | `party_mapping_id` |
| 12 | `source_namespace` |
| 13 | `source_id` |
| 14 | `input_path` |
| 15 | `lineage_id` |
| 16 | `release_id` |
| 17 | `source_row_locator` |

## evidence_link

| # | Column |
|---:|---|
| 1 | `evidence_id` |
| 2 | `record_key` |
| 3 | `source_country_id` |
| 4 | `source_namespace` |
| 5 | `source_id` |
| 6 | `source_locator` |
| 7 | `claim_kind` |
| 8 | `date_claim_id` |
| 9 | `claim_json` |
| 10 | `lineage_id` |
| 11 | `release_id` |

## unresolved_evidence

| # | Column |
|---:|---|
| 1 | `unresolved_id` |
| 2 | `record_key` |
| 3 | `original_token` |
| 4 | `source_locator` |
| 5 | `reason` |
| 6 | `lineage_id` |
| 7 | `release_id` |
| 8 | `raw_json` |

## identity_crosswalk

| # | Column |
|---:|---|
| 1 | `entity_kind` |
| 2 | `upstream_namespace` |
| 3 | `upstream_id` |
| 4 | `record_key` |
| 5 | `reason` |
| 6 | `lineage_id` |
| 7 | `release_id` |
| 8 | `raw_json` |

## publication_release

| # | Column |
|---:|---|
| 1 | `lineage_id` |
| 2 | `release_id` |

## publication_receipt

| # | Column |
|---:|---|
| 1 | `singleton` |
| 2 | `last_publish_attempt_id` |
| 3 | `attempted_lineage_id` |
| 4 | `attempted_release_id` |

## ingest_attempt

| # | Column |
|---:|---|
| 1 | `attempt_id` |
| 2 | `lineage_id` |
| 3 | `operator` |
| 4 | `script_version` |
| 5 | `started_at` |
| 6 | `finished_at` |
| 7 | `status` |
| 8 | `input_inventory_json` |
| 9 | `successful_release_id` |
| 10 | `publication_set_json` |
| 11 | `row_counts_json` |
| 12 | `error_text` |
