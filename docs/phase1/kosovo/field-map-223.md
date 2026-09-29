# Inherited 223-column field map

20 tables, 223 entries. Documentation only; all applied flags false.

| # | Table | Column | Mapping / hold |
|---:|---|---|---|
| 1 | country | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 2 | country | country_code | XK, user-assigned research marker, not an ISO claim. |
| 3 | country | name | Kosovo*; scope gate, no diplomatic conclusion. |
| 4 | country | polity_kind | NULL: diplomatic classification not inferred. |
| 5 | country | region_id | NULL: region target not supplied. |
| 6 | country | coverage_status | Core complete; nested, history and numeric incomplete. |
| 7 | country | screening_as_of_label | 2026-09-29 calendar update; inherited evidence retains its original date. |
| 8 | country | notes | metadata.scope_gate and research-gaps. |
| 9 | country | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 10 | country | release_id | NULL: no operational release. |
| 11 | country | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 12 | dataset_lineage | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 13 | dataset_lineage | provenance_kind | Fresh primary-source research and labelled derivative preservation. |
| 14 | dataset_lineage | description | Prompt BH Kosovo research documentation; supersedes BB. |
| 15 | dataset_release | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 16 | dataset_release | release_id | NULL: no operational release. |
| 17 | dataset_release | fingerprint_sha256 | External final ZIP SHA; no operational release fingerprint. |
| 18 | dataset_release | hash_inputs_json | SHA256SUMS and source inventory, preserving hash scope. |
| 19 | dataset_release | adapter_version | NULL: no importer. |
| 20 | dataset_release | method_version | bb-research-doc-v1. |
| 21 | dataset_release | schema_version | Inherited 20-table / 223-column contract; no schema change. |
| 22 | dataset_release | research_snapshot_label | 2026-09-29 calendar update; inherited evidence retains its original date. |
| 23 | dataset_release | upstream_release_id | NULL. |
| 24 | dataset_release | validated_counts_json | data/counts.json, research row counts. |
| 25 | dataset_release | research_coverage_complete | false. |
| 26 | dataset_release | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 27 | election_event | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 28 | election_event | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 29 | election_event | history_key | events.history_key; includes phase/kind, not date alone. |
| 30 | election_event | event_id | events.event_id, deterministic country/history-key hash. |
| 31 | election_event | date_id | NULL: no target date ID; explicit events.date remains. |
| 32 | election_event | date_resolution | events.date_precision. |
| 33 | election_event | event_kind | events.event_kind; repeat, recall and snapshot distinguished. |
| 34 | election_event | selected_history_role | NULL: history selector not applied. |
| 35 | election_event | electoral_system | office.selection_mode + legal source; preserve historic regime gate. |
| 36 | election_event | comparability | events.comparability and applicable research gap. |
| 37 | election_event | ballot_basis | events.result_scope and valid_votes_basis. |
| 38 | election_event | share_unit | percent; no aggregate event share invented. |
| 39 | election_event | legal_outcome | events.legal_outcome. |
| 40 | election_event | record_state | research_draft. |
| 41 | election_event | state_note | events.coverage_note/evidence_status. |
| 42 | election_event | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 43 | election_event | release_id | NULL: no operational release. |
| 44 | election_event | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 45 | evidence_link | evidence_id | NULL: no target evidence identity; normalized facts link research records. |
| 46 | evidence_link | record_key | office_id/event_id/result_id as applicable. |
| 47 | evidence_link | source_country_id | kosovo. |
| 48 | evidence_link | source_namespace | kosovo-research-sources-bb-v1; documentation label. |
| 49 | evidence_link | source_id | source-inventory.source_id. |
| 50 | evidence_link | source_locator | source URL + result.origin table/page/cell/metadata key. |
| 51 | evidence_link | claim_kind | Existence, selection, calendar, certification or numerical return; kept distinct. |
| 52 | evidence_link | date_claim_id | NULL. |
| 53 | evidence_link | claim_json | sources/normalized/<source_id>.json factual records. |
| 54 | evidence_link | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 55 | evidence_link | release_id | NULL: no operational release. |
| 56 | geography | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 57 | geography | geography_id | office-register.geography_id; internal territorial-vintage research key. |
| 58 | geography | name | office.geography / identity-crosswalk municipality lookup. |
| 59 | geography | parent_geography_id | NULL: no inferred regional hierarchy. |
| 60 | geography | effective_from_label | NULL until office-specific legal date established. |
| 61 | geography | effective_to_label | NULL: historical-only does not imply abolition. |
| 62 | geography | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 63 | geography | release_id | NULL: no operational release. |
| 64 | geography | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 65 | identity_crosswalk | entity_kind | Office/geography or source archive code. |
| 66 | identity_crosswalk | upstream_namespace | OSCE early matrix or Dplus archive; not assumed official ballot namespace. |
| 67 | identity_crosswalk | upstream_id | identity-crosswalk source-code lookup or result.origin.archive_entity_id. |
| 68 | identity_crosswalk | record_key | Research office/result key. |
| 69 | identity_crosswalk | reason | Source-specific matching only; no automatic successor relation. |
| 70 | identity_crosswalk | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 71 | identity_crosswalk | release_id | NULL: no operational release. |
| 72 | identity_crosswalk | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 73 | ingest_attempt | attempt_id | NULL: no ingest. |
| 74 | ingest_attempt | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 75 | ingest_attempt | operator | NULL. |
| 76 | ingest_attempt | script_version | NULL: validator is research-only. |
| 77 | ingest_attempt | started_at | NULL. |
| 78 | ingest_attempt | finished_at | NULL. |
| 79 | ingest_attempt | status | not_attempted. |
| 80 | ingest_attempt | input_inventory_json | reference/input-artifacts.json for research audit only. |
| 81 | ingest_attempt | successful_release_id | NULL. |
| 82 | ingest_attempt | publication_set_json | NULL: no publication. |
| 83 | ingest_attempt | row_counts_json | Research counts only, not ingestion counts. |
| 84 | ingest_attempt | error_text | NULL: no attempt. |
| 85 | office | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 86 | office | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 87 | office | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 88 | office | geography_id | office-register.geography_id; internal territorial-vintage research key. |
| 89 | office | name | office-register.name. |
| 90 | office | office_type | national_legislature / municipal_assembly / mayor only. |
| 91 | office | office_status | office-register.status. |
| 92 | office | record_state | draft_unapproved. |
| 93 | office | state_note | territory_vintage and identity_status. |
| 94 | office | registry_qualified | Source-qualified core row, not Justin acceptance. |
| 95 | office | next_date_id | NULL: no confirmed next polling day. |
| 96 | office | next_date_resolution | unconfirmed. |
| 97 | office | next_history_key | NULL: no future event fabricated. |
| 98 | office | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 99 | office | release_id | NULL: no operational release. |
| 100 | office | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 101 | office_tier_classification | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 102 | office_tier_classification | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 103 | office_tier_classification | tier | draft-tiers.draft_tier: national or municipal. |
| 104 | office_tier_classification | review_status | draft_unapproved. |
| 105 | office_tier_classification | rationale | draft-tiers.basis; institutional level independent of horizon. |
| 106 | office_tier_classification | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 107 | office_tier_classification | release_id | NULL: no operational release. |
| 108 | office_tier_classification | classification_path | data/draft-tiers.jsonl. |
| 109 | office_tier_classification | classification_kind | research_draft_1_to_1. |
| 110 | office_tier_classification | classification_sha256 | Manifest hash of data/draft-tiers.jsonl. |
| 111 | office_tier_classification | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 112 | party_mapping | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 113 | party_mapping | party_namespace | NULL: no global party namespace. |
| 114 | party_mapping | mapping_id | NULL: no party identity allocated. |
| 115 | party_mapping | source_context | Result source ID / source vintage. |
| 116 | party_mapping | election_context | Result event_id. |
| 117 | party_mapping | original_label | result.party_label or reported candidate/list label. |
| 118 | party_mapping | original_code | result.origin source_ballot_id or archive_entity_id with namespace. |
| 119 | party_mapping | mapped_group | NULL: no party-family or successor assignment. |
| 120 | party_mapping | uncertainty | Original labels and provenance gates; no guessed coalition edge. |
| 121 | party_mapping | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 122 | party_mapping | release_id | NULL: no operational release. |
| 123 | party_mapping | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 124 | proceeding | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 125 | proceeding | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 126 | proceeding | history_key | events.history_key; includes phase/kind, not date alone. |
| 127 | proceeding | proceeding_id | NULL: target ID not allocated; phase proceedings retained in events. |
| 128 | proceeding | kind | events.event_kind where applicable. |
| 129 | proceeding | sequence_no | NULL unless explicit phase evidence; never from folder labels. |
| 130 | proceeding | supersedes_id | NULL: no guessed supersession edge. |
| 131 | proceeding | legal_outcome | events.legal_outcome or not_assessed. |
| 132 | proceeding | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 133 | proceeding | release_id | NULL: no operational release. |
| 134 | proceeding | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 135 | publication_receipt | singleton | NULL: no publication receipt. |
| 136 | publication_receipt | last_publish_attempt_id | NULL. |
| 137 | publication_receipt | attempted_lineage_id | NULL. |
| 138 | publication_receipt | attempted_release_id | NULL. |
| 139 | publication_release | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 140 | publication_release | release_id | NULL: no operational release. |
| 141 | record_locator | record_key | Research office_id/event_id/result_id. |
| 142 | record_locator | entity_kind | office/event/result/source. |
| 143 | record_locator | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 144 | record_locator | geography_id | office-register.geography_id; internal territorial-vintage research key. |
| 145 | record_locator | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 146 | record_locator | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 147 | record_locator | history_key | events.history_key; includes phase/kind, not date alone. |
| 148 | record_locator | proceeding_id | NULL: target ID not allocated; phase proceedings retained in events. |
| 149 | record_locator | result_row_id | results.result_id; research field alias only. |
| 150 | record_locator | party_namespace | NULL: no global party namespace. |
| 151 | record_locator | party_mapping_id | NULL: no party mapping. |
| 152 | record_locator | source_namespace | kosovo-research-sources-bb-v1; documentation label. |
| 153 | record_locator | source_id | source-inventory.source_id. |
| 154 | record_locator | input_path | Relevant data JSONL or normalized source fact file. |
| 155 | record_locator | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 156 | record_locator | release_id | NULL: no operational release. |
| 157 | record_locator | source_row_locator | result.origin, source metadata key, PDF page/cell or table locator. |
| 158 | research_date | date_id | NULL: no target date allocation. |
| 159 | research_date | label | events.date_label or separately identified source date; never interchangeable. |
| 160 | research_date | precision | events.date_precision. |
| 161 | research_date | certainty | Source day, or year-only held snapshot. |
| 162 | research_date | year | Cycle year is events.cycle_year; poll year only from explicit date. |
| 163 | research_date | month | Explicit date month only; else NULL. |
| 164 | research_date | day | Explicit date day only; else NULL. |
| 165 | research_date | range_start_id | NULL. |
| 166 | research_date | range_end_id | NULL. |
| 167 | research_date | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 168 | research_date | release_id | NULL: no operational release. |
| 169 | research_date | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 170 | result_row | id_namespace | metadata.id_namespace=kosovo-research-bb-v1. |
| 171 | result_row | office_id | office-register.office_id; source-vintage IDs distinct from current IDs. |
| 172 | result_row | history_key | events.history_key; includes phase/kind, not date alone. |
| 173 | result_row | result_row_id | results.result_id. |
| 174 | result_row | proceeding_id | NULL: target ID not allocated; phase proceedings retained in events. |
| 175 | result_row | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 176 | result_row | candidate_or_list_label | results.candidate_or_list_label. |
| 177 | result_row | original_party_label | results.party_label; null for unbound affiliation. |
| 178 | result_row | original_party_code | origin.source_party_id/source_ballot_id with source namespace. |
| 179 | result_row | party_namespace | NULL: no global party namespace. |
| 180 | result_row | party_mapping_id | NULL: no party mapping. |
| 181 | result_row | votes | results.votes; missing remains null. |
| 182 | result_row | votes_status | reported / source_zero / untranscribed. |
| 183 | result_row | share | results.share in percent; conflicting value null. |
| 184 | result_row | share_status | reported / derived_from_reported_valid_total / untranscribed / source_conflict_withheld. |
| 185 | result_row | share_unit | percent. |
| 186 | result_row | seats | results.seats; explicit printed cells only. |
| 187 | result_row | seats_status | reported / source_zero / untranscribed; blank/hyphen not zero. |
| 188 | result_row | elected_flag | results.elected; not archive Elected or preliminary_leader. |
| 189 | result_row | is_substitute | NULL: not inferred. |
| 190 | result_row | evidence_status | results.evidence_status; independent of cycle certification date. |
| 191 | result_row | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 192 | result_row | release_id | NULL: no operational release. |
| 193 | result_row | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 194 | retained_input | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 195 | retained_input | release_id | NULL: no operational release. |
| 196 | retained_input | input_path | Pack-relative normalized fact/reference path. |
| 197 | retained_input | input_kind | research_facts/reference_metadata; original reports not redistributed. |
| 198 | retained_input | sha256 | Normalized hash for bundled fact bytes; original hash for original downloaded bytes, distinct scope. |
| 199 | retained_input | byte_count | Byte length for the corresponding hash scope. |
| 200 | retained_input | recovery_locator | Source URL / original filename / normalized path. |
| 201 | retained_input | payload_json | Normalized factual transcription. |
| 202 | source | country_id | metadata.country_id=kosovo; Atlas scope only. |
| 203 | source | source_namespace | kosovo-research-sources-bb-v1; documentation label. |
| 204 | source | source_id | source-inventory.source_id. |
| 205 | source | publisher | source-inventory.publisher_class and source URL. |
| 206 | source | title | source-inventory.title. |
| 207 | source | url | source-inventory.url. |
| 208 | source | checked_as_of_label | 2026-09-29 calendar update; inherited evidence retains its original date. |
| 209 | source | evidence_grade | Publisher class + retrieval status; numerical finality separately qualified. |
| 210 | source | file_sha256 | original_sha256 if downloaded; NULL for web-only; normalized_sha256 is a different hash. |
| 211 | source | locator | normalized_path and result.origin. |
| 212 | source | data_rights | No blanket rights assertion; factual transcriptions only, no full reports. |
| 213 | source | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 214 | source | release_id | NULL: no operational release. |
| 215 | source | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
| 216 | unresolved_evidence | unresolved_id | research-gaps.gap_id or explicit diagnostic key. |
| 217 | unresolved_evidence | record_key | Relevant office/event/result key or named gap scope. |
| 218 | unresolved_evidence | original_token | Retained malformed token, blank/hyphen, conflicting share or archive phase label. |
| 219 | unresolved_evidence | source_locator | URL/PDF page/metadata ID from source fact or diagnostic. |
| 220 | unresolved_evidence | reason | research-gaps.detail/closure_requirement. |
| 221 | unresolved_evidence | lineage_id | Research reference country-package-kosovo; no operational lineage created. |
| 222 | unresolved_evidence | release_id | NULL: no operational release. |
| 223 | unresolved_evidence | raw_json | Corresponding normalized research object; preserve evidence and null statuses. |
