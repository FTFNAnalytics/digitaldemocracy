# North Macedonia — inherited 223-column field map

Documentation only. No destination writes. Every inherited table.column occurs exactly once in contracts/column-map.json. Research records are review artifacts, not an importer payload.

| Table | Column | Mapping / disposition |
|---|---|---|
| country | country_id | MK research country key; not an assigned production ID |
| country | country_code | MK |
| country | name | corresponding office or geography name; preserve source spelling |
| country | polity_kind | independent republic |
| country | region_id | null; no production region mapping assigned |
| country | coverage_status | full current office register; partial historical numeric coverage |
| country | screening_as_of_label | 2026-09-24 |
| country | notes | metadata.json.notes |
| country | lineage_id | null; prospective research lineage only |
| country | release_id | null; no operational release created |
| country | raw_json | retain the complete originating research record |
| dataset_lineage | lineage_id | null; prospective research lineage only |
| dataset_lineage | provenance_kind | documentation_research_only |
| dataset_lineage | description | research descriptive text only |
| dataset_release | lineage_id | null; prospective research lineage only |
| dataset_release | release_id | null; no operational release created |
| dataset_release | fingerprint_sha256 | external ZIP SHA256; no self-referential ZIP hash inside ZIP |
| dataset_release | hash_inputs_json | SHA256SUMS inventory |
| dataset_release | adapter_version | null; no adapter written |
| dataset_release | method_version | AZ research-v1 |
| dataset_release | schema_version | inherited20tables223columns |
| dataset_release | research_snapshot_label | 2026-09-24 |
| dataset_release | upstream_release_id | null; no single upstream release |
| dataset_release | validated_counts_json | data/counts.json |
| dataset_release | research_coverage_complete | false |
| dataset_release | raw_json | retain the complete originating research record |
| election_event | id_namespace | north-macedonia-research-az-v1 |
| election_event | office_id | data/office-register.jsonl.office_id |
| election_event | history_key | data/events.jsonl.history_key (shared by source cycle; rounds are separate events) |
| election_event | event_id | data/events.jsonl.event_id |
| election_event | date_id | prospective date key for event.date_label |
| election_event | date_resolution | event.date_precision |
| election_event | event_kind | event.event_kind |
| election_event | selected_history_role | round / partial repeat / cumulative return; no automatic latest-final selection |
| election_event | electoral_system | event.electoral_system, with historical-law gate |
| election_event | comparability | event.comparability; territorial and ballot-basis gates apply |
| election_event | ballot_basis | result.share_basis; unknown stays unknown |
| election_event | share_unit | percent if reported, otherwise null |
| election_event | legal_outcome | event.legal_outcome |
| election_event | record_state | research_draft |
| election_event | state_note | originating record.state_note |
| election_event | lineage_id | null; prospective research lineage only |
| election_event | release_id | null; no operational release created |
| election_event | raw_json | retain the complete originating research record |
| evidence_link | evidence_id | prospective typed link, no operational ID |
| evidence_link | record_key | research local typed key; never a fabricated production row ID |
| evidence_link | source_country_id | MK |
| evidence_link | source_namespace | research-source-id only |
| evidence_link | source_id | data/source-inventory.json.source_id |
| evidence_link | source_locator | result.source_locator or source URL and annex page |
| evidence_link | claim_kind | office scope, selection, date, result, or territorial claim |
| evidence_link | date_claim_id | null; source date labels retained |
| evidence_link | claim_json | normalized source extract and linked research records |
| evidence_link | lineage_id | null; prospective research lineage only |
| evidence_link | release_id | null; no operational release created |
| geography | country_id | MK research country key; not an assigned production ID |
| geography | geography_id | data/office-register.jsonl.geography_id |
| geography | name | corresponding office or geography name; preserve source spelling |
| geography | parent_geography_id | Skopje component -> City of Skopje; all other municipalities -> MK; city -> MK |
| geography | effective_from_label | null unless exact commencement is sourced; do not use election date as automatic creation date |
| geography | effective_to_label | historical four: 2013 local elections, label precision; current null |
| geography | lineage_id | null; prospective research lineage only |
| geography | release_id | null; no operational release created |
| geography | raw_json | retain the complete originating research record |
| identity_crosswalk | entity_kind | geography spelling alias or country-name alias only |
| identity_crosswalk | upstream_namespace | source publisher/site |
| identity_crosswalk | upstream_id | null unless directly observed (URL preserved, not assumed permanent key) |
| identity_crosswalk | record_key | research local typed key; never a fabricated production row ID |
| identity_crosswalk | reason | observed same source geography or documented name change; no office succession guessed |
| identity_crosswalk | lineage_id | null; prospective research lineage only |
| identity_crosswalk | release_id | null; no operational release created |
| identity_crosswalk | raw_json | retain the complete originating research record |
| ingest_attempt | attempt_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | lineage_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | operator | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | script_version | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | started_at | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | finished_at | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | status | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | input_inventory_json | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | successful_release_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | publication_set_json | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | row_counts_json | NOT WRITTEN: operational table excluded by applied_changes=0 |
| ingest_attempt | error_text | NOT WRITTEN: operational table excluded by applied_changes=0 |
| office | id_namespace | north-macedonia-research-az-v1 |
| office | office_id | data/office-register.jsonl.office_id |
| office | country_id | MK research country key; not an assigned production ID |
| office | geography_id | data/office-register.jsonl.geography_id |
| office | name | corresponding office or geography name; preserve source spelling |
| office | office_type | office.office_type |
| office | office_status | office.status: current or historical_only |
| office | record_state | research_draft |
| office | state_note | originating record.state_note |
| office | registry_qualified | draft scope established from primary sources; not an operational approval |
| office | next_date_id | null; draft next-date label only Brvenica2026-10-18 |
| office | next_date_resolution | day only for explicitly scheduled Brvenica; otherwise unknown |
| office | next_history_key | null; no future ordinary contest key invented |
| office | lineage_id | null; prospective research lineage only |
| office | release_id | null; no operational release created |
| office | raw_json | retain the complete originating research record |
| office_tier_classification | id_namespace | north-macedonia-research-az-v1 |
| office_tier_classification | office_id | data/office-register.jsonl.office_id |
| office_tier_classification | tier | draft-tier.tier |
| office_tier_classification | review_status | draft_for_human_review |
| office_tier_classification | rationale | draft-tier.rationale |
| office_tier_classification | lineage_id | null; prospective research lineage only |
| office_tier_classification | release_id | null; no operational release created |
| office_tier_classification | classification_path | data/draft-tiers.jsonl |
| office_tier_classification | classification_kind | research_draft |
| office_tier_classification | classification_sha256 | manifest hash of draft-tiers file |
| office_tier_classification | raw_json | retain the complete originating research record |
| party_mapping | country_id | MK research country key; not an assigned production ID |
| party_mapping | party_namespace | null; mapping deferred |
| party_mapping | mapping_id | null; none assigned |
| party_mapping | source_context | source_id and source_locator |
| party_mapping | election_context | event_id + round + year; no cross-cycle coalition identity merge |
| party_mapping | original_label | source party/list spelling |
| party_mapping | original_code | null; no source party code transcribed |
| party_mapping | mapped_group | null; no ideology/group guess |
| party_mapping | uncertainty | unmapped_pending_review |
| party_mapping | lineage_id | null; prospective research lineage only |
| party_mapping | release_id | null; no operational release created |
| party_mapping | raw_json | retain the complete originating research record |
| proceeding | id_namespace | north-macedonia-research-az-v1 |
| proceeding | office_id | data/office-register.jsonl.office_id |
| proceeding | history_key | data/events.jsonl.history_key (shared by source cycle; rounds are separate events) |
| proceeding | proceeding_id | no operational proceedings emitted; event.event_id can identify draft round/repeat evidence |
| proceeding | kind | event.event_kind |
| proceeding | sequence_no | event.round only if source establishes order |
| proceeding | supersedes_id | null; no guessed successor or supersession edges |
| proceeding | legal_outcome | event.legal_outcome |
| proceeding | lineage_id | null; prospective research lineage only |
| proceeding | release_id | null; no operational release created |
| proceeding | raw_json | retain the complete originating research record |
| publication_receipt | singleton | NOT WRITTEN: operational table excluded by applied_changes=0 |
| publication_receipt | last_publish_attempt_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| publication_receipt | attempted_lineage_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| publication_receipt | attempted_release_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| publication_release | lineage_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| publication_release | release_id | NOT WRITTEN: operational table excluded by applied_changes=0 |
| record_locator | record_key | research local typed key; never a fabricated production row ID |
| record_locator | entity_kind | office / event / result / source typed research record |
| record_locator | country_id | MK research country key; not an assigned production ID |
| record_locator | geography_id | data/office-register.jsonl.geography_id |
| record_locator | id_namespace | north-macedonia-research-az-v1 |
| record_locator | office_id | data/office-register.jsonl.office_id |
| record_locator | history_key | data/events.jsonl.history_key (shared by source cycle; rounds are separate events) |
| record_locator | proceeding_id | result.event_id as draft relation only |
| record_locator | result_row_id | result.result_id |
| record_locator | party_namespace | null |
| record_locator | party_mapping_id | null |
| record_locator | source_namespace | research-source-id only |
| record_locator | source_id | data/source-inventory.json.source_id |
| record_locator | input_path | source.retained_extract_path |
| record_locator | lineage_id | null; prospective research lineage only |
| record_locator | release_id | null; no operational release created |
| record_locator | source_row_locator | result.source_locator |
| research_date | date_id | prospective key from exact date_label; not written |
| research_date | label | event.date_label; source literal date retained in note |
| research_date | precision | event.date_precision |
| research_date | certainty | source-supported or unresolved, never inferred exact date |
| research_date | year | parse only from sourced date_label |
| research_date | month | parse only if precision permits |
| research_date | day | parse only if precision permits |
| research_date | range_start_id | null unless a sourced date range requires it |
| research_date | range_end_id | null unless a sourced date range requires it |
| research_date | lineage_id | null; prospective research lineage only |
| research_date | release_id | null; no operational release created |
| research_date | raw_json | retain the complete originating research record |
| result_row | id_namespace | north-macedonia-research-az-v1 |
| result_row | office_id | data/office-register.jsonl.office_id |
| result_row | history_key | data/events.jsonl.history_key (shared by source cycle; rounds are separate events) |
| result_row | result_row_id | result.result_id |
| result_row | proceeding_id | draft link via result.event_id; no production proceeding assigned |
| result_row | country_id | MK research country key; not an assigned production ID |
| result_row | candidate_or_list_label | result.candidate_or_list_label; party_group_aggregate is NOT a candidate |
| result_row | original_party_label | result.original_party_label or group label; no normalized ideology assigned |
| result_row | original_party_code | null; ballot position is not party code |
| result_row | party_namespace | null; no production party mapping |
| result_row | party_mapping_id | null; unresolved by design |
| result_row | votes | result.votes |
| result_row | votes_status | result.votes_status |
| result_row | share | result.share; source percentage, not 0–1 fraction |
| result_row | share_status | result.share_status |
| result_row | share_unit | result.share_unit |
| result_row | seats | result.seats; reported or counted elected roster only |
| result_row | seats_status | result.seats_status |
| result_row | elected_flag | null unless source explicitly establishes winner; never max-votes shortcut |
| result_row | is_substitute | null; no substitute appointments modeled |
| result_row | evidence_status | result.evidence_status |
| result_row | lineage_id | null; prospective research lineage only |
| result_row | release_id | null; no operational release created |
| result_row | raw_json | retain the complete originating research record |
| retained_input | lineage_id | null; prospective research lineage only |
| retained_input | release_id | null; no operational release created |
| retained_input | input_path | source.retained_extract_path |
| retained_input | input_kind | normalized_source_extract |
| retained_input | sha256 | source.retained_extract_sha256 |
| retained_input | byte_count | source.retained_extract_byte_count |
| retained_input | recovery_locator | source.url |
| retained_input | payload_json | normalized factual extract |
| source | country_id | MK research country key; not an assigned production ID |
| source | source_namespace | research-source-id only |
| source | source_id | data/source-inventory.json.source_id |
| source | publisher | source.publisher |
| source | title | source.title |
| source | url | source.url |
| source | checked_as_of_label | source.checked_as_of_label |
| source | evidence_grade | source.evidence_grade |
| source | file_sha256 | retained_extract_sha256 for bundled extract; original_file_sha256 separately in raw_json |
| source | locator | source.retained_extract_path |
| source | data_rights | factual extracts with attribution; original reports not redistributed |
| source | lineage_id | null; prospective research lineage only |
| source | release_id | null; no operational release created |
| source | raw_json | retain the complete originating research record |
| unresolved_evidence | unresolved_id | data/research-gaps.json.gap_id |
| unresolved_evidence | record_key | research local typed key; never a fabricated production row ID |
| unresolved_evidence | original_token | result.raw_tokens or documented conflict tokens |
| unresolved_evidence | source_locator | result.source_locator or source URL and annex page |
| unresolved_evidence | reason | gap.description |
| unresolved_evidence | lineage_id | null; prospective research lineage only |
| unresolved_evidence | release_id | null; no operational release created |
| unresolved_evidence | raw_json | retain the complete originating research record |
