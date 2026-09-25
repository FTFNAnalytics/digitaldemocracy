# Serbia → Atlas 223-column field map — Prompt AX

Research/documentation only. Exact inherited contract: **20 tables / 223 columns**. No importer, SQL migration, VPS, UI, publication or repository execution.

| Table | Column | Serbia mapping / disposition |
|---|---|---|
| `dataset_lineage` | `lineage_id` | Proposed `country-package-serbia` documentary lineage; not persisted. |
| `dataset_lineage` | `provenance_kind` | Proposed `country-package-serbia` documentary lineage; not persisted. |
| `dataset_lineage` | `description` | Proposed `country-package-serbia` documentary lineage; not persisted. |
| `dataset_release` | `lineage_id` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `release_id` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `fingerprint_sha256` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `hash_inputs_json` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `adapter_version` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `method_version` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `schema_version` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `research_snapshot_label` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `upstream_release_id` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `validated_counts_json` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `research_coverage_complete` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `dataset_release` | `raw_json` | Future-release mapping only; operational release remains NULL/not executed. Research snapshot is 2026-09-23 where applicable. |
| `retained_input` | `lineage_id` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `release_id` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `input_path` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `input_kind` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `sha256` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `byte_count` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `recovery_locator` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `retained_input` | `payload_json` | Map to retained normalized source extracts / pack files and exact package SHA-256; remote original bytes are not falsely claimed. |
| `country` | `country_id` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `country_code` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `name` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `polity_kind` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `region_id` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `coverage_status` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `screening_as_of_label` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `notes` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `lineage_id` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `release_id` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `country` | `raw_json` | Serbia research country row; Kosovo scope gate, coverage/gaps and applied_changes=0 retained in raw metadata. |
| `geography` | `country_id` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `geography_id` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `name` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `parent_geography_id` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `effective_from_label` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `effective_to_label` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `lineage_id` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `release_id` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `geography` | `raw_json` | Map from current SORS geography/parent evidence; no guessed effective dates or successor edges. |
| `office` | `id_namespace` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `office_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `country_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `geography_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `name` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `office_type` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `office_status` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `record_state` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `state_note` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `registry_qualified` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `next_date_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `next_date_resolution` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `next_history_key` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `lineage_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `release_id` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office` | `raw_json` | Map from `data/office-register.jsonl`; 173 current offices; next-date fields NULL absent a sourced future contest. |
| `office_tier_classification` | `id_namespace` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `office_id` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `tier` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `review_status` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `rationale` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `lineage_id` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `release_id` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_path` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_kind` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `classification_sha256` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `office_tier_classification` | `raw_json` | Map 1:1 from `data/draft-tiers.jsonl`; `draft_for_human_review`; Justin approval false. |
| `research_date` | `date_id` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `label` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `precision` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `certainty` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `year` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `month` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `day` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `range_start_id` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `range_end_id` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `lineage_id` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `release_id` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `research_date` | `raw_json` | Map from `data/research-dates.jsonl`; unknown date remains explicit unknown, never padded. |
| `election_event` | `id_namespace` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `office_id` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `history_key` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `event_id` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `date_id` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `date_resolution` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `event_kind` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `selected_history_role` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `electoral_system` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `comparability` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `ballot_basis` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `share_unit` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `legal_outcome` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `record_state` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `state_note` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `lineage_id` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `release_id` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `election_event` | `raw_json` | Map from `data/events.jsonl`; preserves presidential rounds and local source-series date precision. |
| `proceeding` | `id_namespace` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `office_id` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `history_key` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `proceeding_id` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `kind` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `sequence_no` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `supersedes_id` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `legal_outcome` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `lineage_id` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `release_id` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `proceeding` | `raw_json` | No standalone proceeding rows in this research pack; polling-station repeat context stays in event raw notes. Future projection must not invent proceedings. |
| `result_row` | `id_namespace` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `office_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `history_key` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `result_row_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `proceeding_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `country_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `candidate_or_list_label` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `original_party_label` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `original_party_code` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `party_namespace` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `party_mapping_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `votes` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `votes_status` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `share` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `share_status` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `share_unit` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `seats` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `seats_status` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `elected_flag` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `is_substitute` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `evidence_status` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `lineage_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `release_id` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `result_row` | `raw_json` | Map from `data/results.jsonl`; reported numeric values or explicit `not_transcribed`; missing != zero. |
| `party_mapping` | `country_id` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `party_namespace` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `mapping_id` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `source_context` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `election_context` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `original_label` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `original_code` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `mapped_group` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `uncertainty` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `lineage_id` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `release_id` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `party_mapping` | `raw_json` | No cross-cycle party mappings supplied; NO ROW unless later reviewed. |
| `source` | `country_id` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `source_namespace` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `source_id` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `publisher` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `title` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `url` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `checked_as_of_label` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `evidence_grade` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `file_sha256` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `locator` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `data_rights` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `lineage_id` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `release_id` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `source` | `raw_json` | Map from `data/source-inventory.json`; file hash is normalized-extract hash and that limitation is retained. |
| `record_locator` | `record_key` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `entity_kind` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `country_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `geography_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `id_namespace` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `office_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `history_key` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `proceeding_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `result_row_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `party_namespace` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `party_mapping_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `source_namespace` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `source_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `input_path` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `lineage_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `release_id` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `record_locator` | `source_row_locator` | Future deterministic locator from pack entity ID + source ID/path; source row locator NULL when not captured. |
| `evidence_link` | `evidence_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `record_key` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `source_country_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `source_namespace` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `source_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `source_locator` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `claim_kind` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `date_claim_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `claim_json` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `lineage_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `evidence_link` | `release_id` | Future link from record key to retained source ID and claim kind; no production row written. |
| `unresolved_evidence` | `unresolved_id` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `record_key` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `original_token` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `source_locator` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `reason` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `lineage_id` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `release_id` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `unresolved_evidence` | `raw_json` | Map named gates from `data/research-gaps.json` where a future projection represents unresolved evidence. |
| `identity_crosswalk` | `entity_kind` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `upstream_namespace` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `upstream_id` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `record_key` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `reason` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `lineage_id` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `release_id` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `identity_crosswalk` | `raw_json` | No predecessor/successor crosswalk rows; source IDs/parent identities only when explicit. |
| `publication_release` | `lineage_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `publication_release` | `release_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `publication_receipt` | `singleton` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `publication_receipt` | `last_publish_attempt_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `publication_receipt` | `attempted_lineage_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `publication_receipt` | `attempted_release_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `attempt_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `lineage_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `operator` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `script_version` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `started_at` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `finished_at` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `status` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `input_inventory_json` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `successful_release_id` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `publication_set_json` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `row_counts_json` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
| `ingest_attempt` | `error_text` | NOT EXECUTED. Operational-only field; no row written by Prompt AX. |
