# Bosnia and Herzegovina — Prompt AW 223-column field map

Research/documentation only. **20 tables / 223 columns** are enumerated from the inherited Atlas destination contract. `applied_changes=0`. No live schema migration or publication is performed.

| Table | Column | AW mapping / null policy |
|---|---|---|
| `dataset_lineage` | `lineage_id` | Proposed lineage country-package-bosnia-and-herzegovina-aw; documentation only. |
| `dataset_lineage` | `provenance_kind` | Proposed lineage country-package-bosnia-and-herzegovina-aw; documentation only. |
| `dataset_lineage` | `description` | Proposed lineage country-package-bosnia-and-herzegovina-aw; documentation only. |
| `dataset_release` | `lineage_id` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `release_id` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. Operational value remains NULL in this research pack. |
| `dataset_release` | `fingerprint_sha256` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. Operational value remains NULL in this research pack. |
| `dataset_release` | `hash_inputs_json` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `adapter_version` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `method_version` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `schema_version` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `research_snapshot_label` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `upstream_release_id` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `validated_counts_json` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `research_coverage_complete` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `dataset_release` | `raw_json` | No operational release is created. Future release fields derive from reviewed retained-input hashes; ZIP hashes are delivery integrity only. |
| `retained_input` | `lineage_id` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `release_id` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. Operational value remains NULL in this research pack. |
| `retained_input` | `input_path` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `input_kind` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `sha256` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `byte_count` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `recovery_locator` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `retained_input` | `payload_json` | Map from data/source-inventory.json and normalized sources/*.json; exact remote bytes are not claimed. |
| `country` | `country_id` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `country_code` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `name` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `polity_kind` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `region_id` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `coverage_status` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `screening_as_of_label` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `notes` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `lineage_id` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `country` | `release_id` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. Operational value remains NULL in this research pack. |
| `country` | `raw_json` | Bosnia and Herzegovina country research row; candidate-EU status and scope notes preserved. |
| `geography` | `country_id` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `geography_id` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `name` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `parent_geography_id` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `effective_from_label` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `effective_to_label` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `lineage_id` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `geography` | `release_id` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. Operational value remains NULL in this research pack. |
| `geography` | `raw_json` | Map from data/geographies.jsonl; no unsourced parent or boundary dates. |
| `office` | `id_namespace` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `office_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `country_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `geography_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `name` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `office_type` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `office_status` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `record_state` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `state_note` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `registry_qualified` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `next_date_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `next_date_resolution` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `next_history_key` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `lineage_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office` | `release_id` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. Operational value remains NULL in this research pack. |
| `office` | `raw_json` | Map from data/office-register.jsonl; status/current/history and selection mode retained; no invented executive rows. |
| `office_tier_classification` | `id_namespace` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `office_id` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `tier` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `review_status` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `rationale` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `lineage_id` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `release_id` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. Operational value remains NULL in this research pack. |
| `office_tier_classification` | `classification_path` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `classification_kind` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `classification_sha256` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `office_tier_classification` | `raw_json` | Map 1:1 from data/draft-tiers.jsonl; all review_status=draft_for_human_review and Justin approval=false. |
| `research_date` | `date_id` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `label` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `precision` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `certainty` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `year` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `month` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `day` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `range_start_id` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `range_end_id` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `lineage_id` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `research_date` | `release_id` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. Operational value remains NULL in this research pack. |
| `research_date` | `raw_json` | Derived only from source-supported event dates; day precision where official date supplied; no date padding. |
| `election_event` | `id_namespace` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `office_id` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `history_key` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `event_id` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `date_id` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `date_resolution` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `event_kind` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `selected_history_role` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `electoral_system` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `comparability` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `ballot_basis` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `share_unit` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `legal_outcome` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `record_state` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `state_note` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `lineage_id` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `election_event` | `release_id` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. Operational value remains NULL in this research pack. |
| `election_event` | `raw_json` | Map from data/events.jsonl; direct/indirect/repeat/called distinctions preserved. |
| `proceeding` | `id_namespace` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `office_id` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `history_key` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `proceeding_id` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `kind` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `sequence_no` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `supersedes_id` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `legal_outcome` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `lineage_id` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `proceeding` | `release_id` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. Operational value remains NULL in this research pack. |
| `proceeding` | `raw_json` | No generic proceeding rows projected; Stolac annulment/repeat semantics live in events/raw evidence pending future canonical proceeding design. |
| `result_row` | `id_namespace` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `office_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `history_key` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `result_row_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `proceeding_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `country_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `candidate_or_list_label` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `original_party_label` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `original_party_code` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `party_namespace` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `party_mapping_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `votes` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. Missing numeric values remain NULL; missing is never coerced to zero. |
| `result_row` | `votes_status` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `share` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. Missing numeric values remain NULL; missing is never coerced to zero. |
| `result_row` | `share_status` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `share_unit` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `seats` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. Missing numeric values remain NULL; missing is never coerced to zero. |
| `result_row` | `seats_status` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `elected_flag` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `is_substitute` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `evidence_status` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `lineage_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `result_row` | `release_id` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. Operational value remains NULL in this research pack. |
| `result_row` | `raw_json` | Map from data/results.jsonl. Result-state envelopes preserve certification/availability; untranscribed votes/shares/seats are NULL/not_transcribed, never zero. |
| `party_mapping` | `country_id` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `party_namespace` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `mapping_id` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `source_context` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `election_context` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `original_label` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `original_code` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `mapped_group` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `uncertainty` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `lineage_id` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `party_mapping` | `release_id` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. Operational value remains NULL in this research pack. |
| `party_mapping` | `raw_json` | No cross-cycle party mapping rows; original party identity not inferred when result vector not transcribed. |
| `source` | `country_id` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `source_namespace` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `source_id` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `publisher` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `title` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `url` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `checked_as_of_label` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `evidence_grade` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `file_sha256` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `locator` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `data_rights` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `lineage_id` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `source` | `release_id` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. Operational value remains NULL in this research pack. |
| `source` | `raw_json` | Map from data/source-inventory.json; file_sha256 hashes normalized retained extract bytes, not remote pages. |
| `record_locator` | `record_key` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `entity_kind` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `country_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `geography_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `id_namespace` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `office_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `history_key` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `proceeding_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `result_row_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `party_namespace` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `party_mapping_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `source_namespace` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `source_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `input_path` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `lineage_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `record_locator` | `release_id` | Future projection uses typed office/event/result/source keys and package-relative source locators. Operational value remains NULL in this research pack. |
| `record_locator` | `source_row_locator` | Future projection uses typed office/event/result/source keys and package-relative source locators. |
| `evidence_link` | `evidence_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `record_key` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `source_country_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `source_namespace` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `source_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `source_locator` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `claim_kind` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `date_claim_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `claim_json` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `lineage_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. |
| `evidence_link` | `release_id` | Future evidence rows bind record keys to source IDs and claim types; no database writes performed. Operational value remains NULL in this research pack. |
| `unresolved_evidence` | `unresolved_id` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `record_key` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `original_token` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `source_locator` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `reason` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `lineage_id` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `unresolved_evidence` | `release_id` | Research gaps become unresolved evidence only in a future reviewed projection. Operational value remains NULL in this research pack. |
| `unresolved_evidence` | `raw_json` | Research gaps become unresolved evidence only in a future reviewed projection. |
| `identity_crosswalk` | `entity_kind` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `upstream_namespace` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `upstream_id` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `record_key` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `reason` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `lineage_id` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `identity_crosswalk` | `release_id` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. Operational value remains NULL in this research pack. |
| `identity_crosswalk` | `raw_json` | Basic CIK constituency codes may crosswalk offices; same code does not by itself create a legal successor edge. |
| `publication_release` | `lineage_id` | NOT EXECUTED; no publication row. |
| `publication_release` | `release_id` | NOT EXECUTED; no publication row. Operational value remains NULL in this research pack. |
| `publication_receipt` | `singleton` | NOT EXECUTED; no publication receipt. |
| `publication_receipt` | `last_publish_attempt_id` | NOT EXECUTED; no publication receipt. |
| `publication_receipt` | `attempted_lineage_id` | NOT EXECUTED; no publication receipt. |
| `publication_receipt` | `attempted_release_id` | NOT EXECUTED; no publication receipt. |
| `ingest_attempt` | `attempt_id` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `lineage_id` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `operator` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `script_version` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `started_at` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `finished_at` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `status` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `input_inventory_json` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `successful_release_id` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `publication_set_json` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `row_counts_json` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |
| `ingest_attempt` | `error_text` | NOT EXECUTED; no ingest attempt, SQLite, VPS, importer, UI or repository change. |

## Prompt AW continuity note
The destination contract remains exactly 20 tables / 223 columns. `data/prompt-o-detailed-results-reference.json` is retained-input/documentary continuity: it pins Prompt O's 749 detailed numeric rows and their old→AW office crosswalk. It does not add a 224th destination column or imply a new release/import. AW `result_row` projection must combine exact retained numeric rows only when their bytes are materialized/revalidated; all other untranscribed values stay NULL/not_transcribed.
