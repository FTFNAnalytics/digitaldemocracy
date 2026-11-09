# Peru — exact 223-column documentary field map

Derived from the retained master 211-column and attempt-ledger 12-column contracts; migration bookkeeping excluded. NoSQL executed and no importer written. Every target column is explicitly represented. Source-specific extra fields remain in documentary JSON and are not discarded.

| # | Table.column | Source | Documentary mapping |
|---:|---|---|---|
| 1 | `ingest_attempt.attempt_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 2 | `ingest_attempt.lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 3 | `ingest_attempt.operator` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 4 | `ingest_attempt.script_version` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 5 | `ingest_attempt.started_at` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 6 | `ingest_attempt.finished_at` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 7 | `ingest_attempt.status` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 8 | `ingest_attempt.input_inventory_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 9 | `ingest_attempt.successful_release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 10 | `ingest_attempt.publication_set_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 11 | `ingest_attempt.row_counts_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 12 | `ingest_attempt.error_text` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 13 | `dataset_lineage.lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 14 | `dataset_lineage.provenance_kind` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 15 | `dataset_lineage.description` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 16 | `dataset_release.lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 17 | `dataset_release.release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 18 | `dataset_release.fingerprint_sha256` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 19 | `dataset_release.hash_inputs_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 20 | `dataset_release.adapter_version` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 21 | `dataset_release.method_version` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 22 | `dataset_release.schema_version` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 23 | `dataset_release.research_snapshot_label` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 24 | `dataset_release.upstream_release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 25 | `dataset_release.validated_counts_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 26 | `dataset_release.research_coverage_complete` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 27 | `dataset_release.raw_json` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 28 | `publication_release.lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 29 | `publication_release.release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 30 | `publication_receipt.singleton` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 31 | `publication_receipt.last_publish_attempt_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 32 | `publication_receipt.attempted_lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 33 | `publication_receipt.attempted_release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 34 | `retained_input.lineage_id` | source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 35 | `retained_input.release_id` | source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 36 | `retained_input.input_path` | source_inventory.json | file |
| 37 | `retained_input.input_kind` | source_inventory.json | retained_official_source_bytes |
| 38 | `retained_input.sha256` | source_inventory.json | sha 256 |
| 39 | `retained_input.byte_count` | source_inventory.json | bytes |
| 40 | `retained_input.recovery_locator` | source_inventory.json | url + localpackpath |
| 41 | `retained_input.payload_json` | source_inventory.json | sourceinventory record |
| 42 | `country.country_id` | manifest.json | constant peru |
| 43 | `country.country_code` | manifest.json | constant PE |
| 44 | `country.name` | manifest.json | constant República del Perú |
| 45 | `country.polity_kind` | manifest.json | Not supplied in this documentary pack; retain as an explicit target-mapping hold, never synthesize a nonnull value. |
| 46 | `country.region_id` | manifest.json | Not supplied in this documentary pack; retain as an explicit target-mapping hold, never synthesize a nonnull value. |
| 47 | `country.coverage_status` | manifest.json | manifest.coverage; do not coerce research_coverage_complete=false to full certification |
| 48 | `country.screening_as_of_label` | manifest.json | manifest.as_of |
| 49 | `country.notes` | manifest.json | README + Research_Gaps |
| 50 | `country.lineage_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 51 | `country.release_id` | manifest.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 52 | `country.raw_json` | manifest.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 53 | `geography.country_id` | municipal_roster.json + regional_roster.json | constant peru |
| 54 | `geography.geography_id` | municipal_roster.json + regional_roster.json | Documentary INEI-based municipal ID or named regional ID; target identity review pending |
| 55 | `geography.name` | municipal_roster.json + regional_roster.json | source territorial name |
| 56 | `geography.parent_geography_id` | municipal_roster.json + regional_roster.json | Source-backed department/province relationship; no successor edge |
| 57 | `geography.effective_from_label` | municipal_roster.json + regional_roster.json | null unless explicit creation/era source |
| 58 | `geography.effective_to_label` | municipal_roster.json + regional_roster.json | null unless explicit abolition source |
| 59 | `geography.lineage_id` | municipal_roster.json + regional_roster.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 60 | `geography.release_id` | municipal_roster.json + regional_roster.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 61 | `geography.raw_json` | municipal_roster.json + regional_roster.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 62 | `research_date.date_id` | upcoming_calendar.json + events.jsonl | documentary derived date key only after precision review |
| 63 | `research_date.label` | upcoming_calendar.json + events.jsonl | date or next_date_or_formula |
| 64 | `research_date.precision` | upcoming_calendar.json + events.jsonl | date_precision; formula/year when day unknown |
| 65 | `research_date.certainty` | upcoming_calendar.json + events.jsonl | date_basis/date_status |
| 66 | `research_date.year` | upcoming_calendar.json + events.jsonl | year/next_occurrence_year |
| 67 | `research_date.month` | upcoming_calendar.json + events.jsonl | parse only exact source date |
| 68 | `research_date.day` | upcoming_calendar.json + events.jsonl | parse only exact source date |
| 69 | `research_date.range_start_id` | upcoming_calendar.json + events.jsonl | unassigned unless source establishes range |
| 70 | `research_date.range_end_id` | upcoming_calendar.json + events.jsonl | unassigned unless source establishes range |
| 71 | `research_date.lineage_id` | upcoming_calendar.json + events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 72 | `research_date.release_id` | upcoming_calendar.json + events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 73 | `research_date.raw_json` | upcoming_calendar.json + events.jsonl | lossless complete documentary source record; preserve source-specific fields and nulls |
| 74 | `office.id_namespace` | office_register.json | constant PE-BK-research (documentary only) |
| 75 | `office.office_id` | office_register.json | office_id |
| 76 | `office.country_id` | office_register.json | constant peru |
| 77 | `office.geography_id` | office_register.json | territory; separate geography projection required |
| 78 | `office.name` | office_register.json | name |
| 79 | `office.office_type` | office_register.json | family; target enum review required |
| 80 | `office.office_status` | office_register.json | era_status |
| 81 | `office.record_state` | office_register.json | disposition; research_accept is not production approval |
| 82 | `office.state_note` | office_register.json | hold_reason when present |
| 83 | `office.registry_qualified` | office_register.json | true only for research_accept scope; hold is not qualified |
| 84 | `office.next_date_id` | office_register.json | Resolve via upcoming_calendar; do not invent exact dates |
| 85 | `office.next_date_resolution` | office_register.json | official_call / formula / research_hold |
| 86 | `office.next_history_key` | office_register.json | not assigned until reviewed event projection |
| 87 | `office.lineage_id` | office_register.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 88 | `office.release_id` | office_register.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 89 | `office.raw_json` | office_register.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 90 | `office_tier_classification.id_namespace` | draft_tiers.json | constant PE-BK-research (documentary only) |
| 91 | `office_tier_classification.office_id` | draft_tiers.json | office_id |
| 92 | `office_tier_classification.tier` | draft_tiers.json | draft_tier |
| 93 | `office_tier_classification.review_status` | draft_tiers.json | constant needs_review |
| 94 | `office_tier_classification.rationale` | draft_tiers.json | family/level and explicit disposition |
| 95 | `office_tier_classification.lineage_id` | draft_tiers.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 96 | `office_tier_classification.release_id` | draft_tiers.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 97 | `office_tier_classification.classification_path` | draft_tiers.json | draft_tiers.json |
| 98 | `office_tier_classification.classification_kind` | draft_tiers.json | draft_documentary |
| 99 | `office_tier_classification.classification_sha256` | draft_tiers.json | SHA 256 SUMS entry for draft_tiers.json |
| 100 | `office_tier_classification.raw_json` | draft_tiers.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 101 | `election_event.id_namespace` | events.jsonl | constant PE-BK-research (documentary only) |
| 102 | `election_event.office_id` | events.jsonl | office_ids[]; one shared ballot may link 2 bodies; target fanout hold |
| 103 | `election_event.history_key` | events.jsonl | event_id as documentary candidate only |
| 104 | `election_event.event_id` | events.jsonl | event_id |
| 105 | `election_event.date_id` | events.jsonl | reviewed research_date mapping |
| 106 | `election_event.date_resolution` | events.jsonl | date_status/date_precision |
| 107 | `election_event.event_kind` | events.jsonl | event_type |
| 108 | `election_event.selected_history_role` | events.jsonl | not assigned; no near-term filter applied |
| 109 | `election_event.electoral_system` | events.jsonl | law/era notes; no inferred winner formula |
| 110 | `election_event.comparability` | events.jsonl | era and scope gates in Research_Gaps |
| 111 | `election_event.ballot_basis` | events.jsonl | joint municipal ballot / executive ticket / Senate segment as documented |
| 112 | `election_event.share_unit` | events.jsonl | percent where source percent |
| 113 | `election_event.legal_outcome` | events.jsonl | result_status; distinct from winner and certification |
| 114 | `election_event.record_state` | events.jsonl | disposition |
| 115 | `election_event.state_note` | events.jsonl | state_note / source_schema_hold |
| 116 | `election_event.lineage_id` | events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 117 | `election_event.release_id` | events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 118 | `election_event.raw_json` | events.jsonl | lossless complete documentary source record; preserve source-specific fields and nulls |
| 119 | `proceeding.id_namespace` | events.jsonl | constant PE-BK-research (documentary only) |
| 120 | `proceeding.office_id` | events.jsonl | linked event.office_ids; target fanout hold |
| 121 | `proceeding.history_key` | events.jsonl | event_id candidate |
| 122 | `proceeding.proceeding_id` | events.jsonl | not minted; source-defined event round only |
| 123 | `proceeding.kind` | events.jsonl | event_type/round |
| 124 | `proceeding.sequence_no` | events.jsonl | round only when sourced; null for unresolved repeats |
| 125 | `proceeding.supersedes_id` | events.jsonl | null; no guessed proceeding edges |
| 126 | `proceeding.legal_outcome` | events.jsonl | source-specific certification, repeat/annulment held |
| 127 | `proceeding.lineage_id` | events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 128 | `proceeding.release_id` | events.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 129 | `proceeding.raw_json` | events.jsonl | lossless complete documentary source record; preserve source-specific fields and nulls |
| 130 | `source.country_id` | source_inventory.json | constant peru |
| 131 | `source.source_namespace` | source_inventory.json | constant PE-BK-sources |
| 132 | `source.source_id` | source_inventory.json | source_id |
| 133 | `source.publisher` | source_inventory.json | publisher, refined by originalURL/authority |
| 134 | `source.title` | source_inventory.json | original_filename; source title may be discrepant and is not assumed |
| 135 | `source.url` | source_inventory.json | url |
| 136 | `source.checked_as_of_label` | source_inventory.json | retrieved_as_of |
| 137 | `source.evidence_grade` | source_inventory.json | certified JNE versus official published ONPE distinction |
| 138 | `source.file_sha256` | source_inventory.json | sha 256 |
| 139 | `source.locator` | source_inventory.json | file |
| 140 | `source.data_rights` | source_inventory.json | original source terms; no invented licence |
| 141 | `source.lineage_id` | source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 142 | `source.release_id` | source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 143 | `source.raw_json` | source_inventory.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 144 | `party_mapping.country_id` | results.jsonl | constant peru |
| 145 | `party_mapping.party_namespace` | results.jsonl | event/source scoped only |
| 146 | `party_mapping.mapping_id` | results.jsonl | not minted; no party-family mapping authorized |
| 147 | `party_mapping.source_context` | results.jsonl | source_file |
| 148 | `party_mapping.election_context` | results.jsonl | event_id |
| 149 | `party_mapping.original_label` | results.jsonl | choice_name |
| 150 | `party_mapping.original_code` | results.jsonl | choice_source_id if present |
| 151 | `party_mapping.mapped_group` | results.jsonl | null; no inferred family |
| 152 | `party_mapping.uncertainty` | results.jsonl | source/event-scoped; cross-cycle match held |
| 153 | `party_mapping.lineage_id` | results.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 154 | `party_mapping.release_id` | results.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 155 | `party_mapping.raw_json` | results.jsonl | lossless complete documentary source record; preserve source-specific fields and nulls |
| 156 | `result_row.id_namespace` | results.jsonl | constant PE-BK-research (documentary only) |
| 157 | `result_row.office_id` | results.jsonl | linked event.office_ids; target fanout held |
| 158 | `result_row.history_key` | results.jsonl | event_id candidate |
| 159 | `result_row.result_row_id` | results.jsonl | result_id |
| 160 | `result_row.proceeding_id` | results.jsonl | unassigned target proceeding key |
| 161 | `result_row.country_id` | results.jsonl | constant peru |
| 162 | `result_row.candidate_or_list_label` | results.jsonl | choice_name; result_grain preserves candidate versus list |
| 163 | `result_row.original_party_label` | results.jsonl | party if candidate else choice_name for list |
| 164 | `result_row.original_party_code` | results.jsonl | choice_source_id only where source supplies |
| 165 | `result_row.party_namespace` | results.jsonl | event/source scope |
| 166 | `result_row.party_mapping_id` | results.jsonl | null; no approved mapping |
| 167 | `result_row.votes` | results.jsonl | votes only; observed_vote_sum is not promoted when incomplete |
| 168 | `result_row.votes_status` | results.jsonl | votes_status / missing_cells / quality_hold |
| 169 | `result_row.share` | results.jsonl | share_pct |
| 170 | `result_row.share_status` | results.jsonl | source_numeric when present; otherwise untranscribed |
| 171 | `result_row.share_unit` | results.jsonl | percent; combined Senate threshold share separately tagged |
| 172 | `result_row.seats` | results.jsonl | seats only where final source established; null otherwise |
| 173 | `result_row.seats_status` | results.jsonl | certified_source or untranscribed |
| 174 | `result_row.elected_flag` | results.jsonl | only explicit source condition; no plurality-derived inference |
| 175 | `result_row.is_substitute` | results.jsonl | election_condition when source says suplente; otherwise unknown |
| 176 | `result_row.evidence_status` | results.jsonl | result_status + quality_hold |
| 177 | `result_row.lineage_id` | results.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 178 | `result_row.release_id` | results.jsonl | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 179 | `result_row.raw_json` | results.jsonl | lossless complete documentary source record; preserve source-specific fields and nulls |
| 180 | `record_locator.record_key` | events.jsonl + results.jsonl + source_inventory.json | documentary office/event/result/source key, not target minted ID |
| 181 | `record_locator.entity_kind` | events.jsonl + results.jsonl + source_inventory.json | office/event/result/source |
| 182 | `record_locator.country_id` | events.jsonl + results.jsonl + source_inventory.json | constant peru |
| 183 | `record_locator.geography_id` | events.jsonl + results.jsonl + source_inventory.json | source-backed territory; target geography projection pending |
| 184 | `record_locator.id_namespace` | events.jsonl + results.jsonl + source_inventory.json | constant PE-BK-research (documentary only) |
| 185 | `record_locator.office_id` | events.jsonl + results.jsonl + source_inventory.json | linked documentary office ID; target identity approval pending |
| 186 | `record_locator.history_key` | events.jsonl + results.jsonl + source_inventory.json | documentary event_id; reviewed target key not minted |
| 187 | `record_locator.proceeding_id` | events.jsonl + results.jsonl + source_inventory.json | not minted; round/proceeding projection held |
| 188 | `record_locator.result_row_id` | events.jsonl + results.jsonl + source_inventory.json | documentary result_id |
| 189 | `record_locator.party_namespace` | events.jsonl + results.jsonl + source_inventory.json | event/source scoped; no inferred party family |
| 190 | `record_locator.party_mapping_id` | events.jsonl + results.jsonl + source_inventory.json | null; no approved party mapping |
| 191 | `record_locator.source_namespace` | events.jsonl + results.jsonl + source_inventory.json | constant PE-BK-sources |
| 192 | `record_locator.source_id` | events.jsonl + results.jsonl + source_inventory.json | resolve source_file through source_inventory |
| 193 | `record_locator.input_path` | events.jsonl + results.jsonl + source_inventory.json | source_file resolved by sourceinventory |
| 194 | `record_locator.lineage_id` | events.jsonl + results.jsonl + source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 195 | `record_locator.release_id` | events.jsonl + results.jsonl + source_inventory.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 196 | `record_locator.source_row_locator` | events.jsonl + results.jsonl + source_inventory.json | source_locator or archive_member + source-column + source geography + row counts/ranges; noncontiguous aggregate requires predicate |
| 197 | `evidence_link.evidence_id` | source_inventory.json + source locators on records | documentary evidence link key not minted |
| 198 | `evidence_link.record_key` | source_inventory.json + source locators on records | source-bearing record key |
| 199 | `evidence_link.source_country_id` | source_inventory.json + source locators on records | constant peru |
| 200 | `evidence_link.source_namespace` | source_inventory.json + source locators on records | constant PE-BK-sources |
| 201 | `evidence_link.source_id` | source_inventory.json + source locators on records | sourceinventory ID resolved by filename |
| 202 | `evidence_link.source_locator` | source_inventory.json + source locators on records | record source locator |
| 203 | `evidence_link.claim_kind` | source_inventory.json + source locators on records | office_scope / date / vote / seat / hold |
| 204 | `evidence_link.date_claim_id` | source_inventory.json + source locators on records | not minted; calendar/date projection pending |
| 205 | `evidence_link.claim_json` | source_inventory.json + source locators on records | preserve complete documentary record |
| 206 | `evidence_link.lineage_id` | source_inventory.json + source locators on records | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 207 | `evidence_link.release_id` | source_inventory.json + source locators on records | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 208 | `unresolved_evidence.unresolved_id` | research_gaps.json + identity_match_holds.json + extraction_audit.json | gap_id or documentary hold key |
| 209 | `unresolved_evidence.record_key` | research_gaps.json + identity_match_holds.json + extraction_audit.json | associated office/event/result key when known |
| 210 | `unresolved_evidence.original_token` | research_gaps.json + identity_match_holds.json + extraction_audit.json | preserved missing_tokens or source label |
| 211 | `unresolved_evidence.source_locator` | research_gaps.json + identity_match_holds.json + extraction_audit.json | retained source filename / row evidence |
| 212 | `unresolved_evidence.reason` | research_gaps.json + identity_match_holds.json + extraction_audit.json | gap detail / hold reason |
| 213 | `unresolved_evidence.lineage_id` | research_gaps.json + identity_match_holds.json + extraction_audit.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 214 | `unresolved_evidence.release_id` | research_gaps.json + identity_match_holds.json + extraction_audit.json | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 215 | `unresolved_evidence.raw_json` | research_gaps.json + identity_match_holds.json + extraction_audit.json | lossless complete documentary source record; preserve source-specific fields and nulls |
| 216 | `identity_crosswalk.entity_kind` | Identity_Rules.md | geography/office documentary observation |
| 217 | `identity_crosswalk.upstream_namespace` | Identity_Rules.md | INEI or ONPE dataset-specific; never conflated |
| 218 | `identity_crosswalk.upstream_id` | Identity_Rules.md | raw code and name tuple |
| 219 | `identity_crosswalk.record_key` | Identity_Rules.md | exact normalized-name match only; unmatched stays held |
| 220 | `identity_crosswalk.reason` | Identity_Rules.md | Identity_Rules; zero guessed successor links |
| 221 | `identity_crosswalk.lineage_id` | Identity_Rules.md | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 222 | `identity_crosswalk.release_id` | Identity_Rules.md | NOT APPLICABLE: no target release, lineage, publication or ingest attempt is created. Required target value remains a future reviewed blocker, not a fabricated ID. |
| 223 | `identity_crosswalk.raw_json` | Identity_Rules.md | lossless complete documentary source record; preserve source-specific fields and nulls |
