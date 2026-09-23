# Cyprus → Atlas: 223-column field map

Documentation only. The inherited contract contains 20 tables and 223 columns. The prior contract text is retained unchanged as historical provenance; its Bosnia examples are not Cyprus facts. No live schema verification or migration was performed.

| Table | Column | Cyprus mapping |
|---|---|---|
| dataset_lineage | lineage_id | Proposed country-package-cyprus; no lineage written. |
| dataset_lineage | provenance_kind | country_package |
| dataset_lineage | description | Cyprus Prompt AQ research handoff; no implementation or operational changes. |
| dataset_release | lineage_id | Proposed country-package-cyprus; no lineage written. |
| dataset_release | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| dataset_release | fingerprint_sha256 | Future release hash is not set. ZIP and package file hashes are delivery integrity only. |
| dataset_release | hash_inputs_json | Sorted retained source inventory plus contract, field-map and identity-rule hashes. |
| dataset_release | adapter_version | cyprus-field-map/1 documentation label only; no importer authored. |
| dataset_release | method_version | cyprus-source-preservation/1 |
| dataset_release | schema_version | Inherited 223-column contract pin; no live schema verification. |
| dataset_release | research_snapshot_label | 2026-09-22 |
| dataset_release | upstream_release_id | NULL; independent official snapshots have no invented shared release. |
| dataset_release | validated_counts_json | data/counts.json plus validation-report.json, with completeness=false. |
| dataset_release | research_coverage_complete | false |
| dataset_release | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| retained_input | lineage_id | Proposed country-package-cyprus; no lineage written. |
| retained_input | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| retained_input | input_path | source-inventory.input_path; package-relative retained input path. |
| retained_input | input_kind | source-inventory.capture_kind |
| retained_input | sha256 | SHA-256 of exact retained bytes. |
| retained_input | byte_count | source-inventory.byte_count |
| retained_input | recovery_locator | Original source URL; stable snapshot file is retained for reproducibility. |
| retained_input | payload_json | Retained payload descriptor with relative path/hash, not a production blob. |
| country | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| country | country_code | CY |
| country | name | Source-preserved entity name; aliases in identity-aliases / quarter-name-aliases. |
| country | polity_kind | Republic; elected president and legislature. |
| country | region_id | Europe (draft taxonomy), Republic scope. |
| country | coverage_status | current_named_register_with_open_reconciliation_gate; historical_selected_not_exhaustive. |
| country | screening_as_of_label | 2026-09-22 |
| country | notes | Research gaps and territorial limits; applied_changes=0. |
| country | lineage_id | Proposed country-package-cyprus; no lineage written. |
| country | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| country | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| geography | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| geography | geography_id | office-register.geography_id; municipality CYSTAT code or community EC identity; Spilia-Kourdali explicit unresolved-code token. |
| geography | name | Source-preserved entity name; aliases in identity-aliases / quarter-name-aliases. |
| geography | parent_geography_id | Explicit municipal parent from reviewed CYSTAT municipal-quarter hierarchy; no guessed territorial successor. |
| geography | effective_from_label | NULL unless sourced legal commencement; statistical code date is not automatic office creation. |
| geography | effective_to_label | Historical end dates remain NULL pending legal reform verification. |
| geography | lineage_id | Proposed country-package-cyprus; no lineage written. |
| geography | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| geography | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| office | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| office | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| office | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| office | geography_id | office-register.geography_id; municipality CYSTAT code or community EC identity; Spilia-Kourdali explicit unresolved-code token. |
| office | name | Source-preserved entity name; aliases in identity-aliases / quarter-name-aliases. |
| office | office_type | office-register.office_type. |
| office | office_status | office-register.status: current or historical_only. |
| office | record_state | draft_research; never approved/published. |
| office | state_note | Carry territorial, round, certification, reform and missing-data gates verbatim. |
| office | registry_qualified | false pending Justin review and unresolved 285/286 community reconciliation. |
| office | next_date_id | No exact next poll day. calendar.json contains only nominal year / unresolved date. |
| office | next_date_resolution | year_expected or unresolved; alert window does not filter register/history. |
| office | next_history_key | NULL; no invented future contest. |
| office | lineage_id | Proposed country-package-cyprus; no lineage written. |
| office | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| office | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| office_tier_classification | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| office_tier_classification | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| office_tier_classification | tier | draft-tiers.tier, exactly one row per current or historical office. |
| office_tier_classification | review_status | draft_for_human_review; Justin approval remains false. |
| office_tier_classification | rationale | draft-tiers.rationale plus mechanism/footprint gates. |
| office_tier_classification | lineage_id | Proposed country-package-cyprus; no lineage written. |
| office_tier_classification | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| office_tier_classification | classification_path | data/draft-tiers.json |
| office_tier_classification | classification_kind | draft_for_human_review |
| office_tier_classification | classification_sha256 | SHA-256 of data/draft-tiers.json |
| office_tier_classification | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| research_date | date_id | Proposed CY date token from events.date + date_precision + certainty. |
| research_date | label | Date label exactly at source-supported precision. |
| research_date | precision | day or year; never add 01-01 to year-only history. |
| research_date | certainty | observed for supported poll dates; expected for nominal future years only. |
| research_date | year | Parse year from date label only. |
| research_date | month | Parse month only for day-precision dates, else NULL. |
| research_date | day | Parse day only for day-precision dates, else NULL. |
| research_date | range_start_id | NULL unless an explicit source range is supplied. |
| research_date | range_end_id | NULL unless an explicit source range is supplied. |
| research_date | lineage_id | Proposed country-package-cyprus; no lineage written. |
| research_date | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| research_date | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| election_event | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| election_event | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| election_event | history_key | events.event_id; round-specific suffix R1/R2 retained. |
| election_event | event_id | events.event_id; no exact dates are part of identity unless source verified. |
| election_event | date_id | Proposed CY date token from events.date + date_precision + certainty. |
| election_event | date_resolution | events.date_precision with sourced-versus-year-only certainty. |
| election_event | event_kind | events.event_type, including unopposed/no-poll returns. |
| election_event | selected_history_role | observed_history, with three auxiliary religious-group returns explicitly typed. |
| election_event | electoral_system | events.electoral_system; President two-round plurality/majority as documented. |
| election_event | comparability | Preserve system, electorate, geographical version, round and result kind. Reforms are comparability gates. |
| election_event | ballot_basis | events.ballot_basis; national aggregates retain the official electorate, independent of local territorial exclusions. |
| election_event | share_unit | Per-result source_fraction or percent; convert only with explicit method. |
| election_event | legal_outcome | Only source-declared elected/unopposed/seat outcome; no winner inferred merely from maximum votes. |
| election_event | record_state | draft_research; never approved/published. |
| election_event | state_note | Carry territorial, round, certification, reform and missing-data gates verbatim. |
| election_event | lineage_id | Proposed country-package-cyprus; no lineage written. |
| election_event | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| election_event | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| proceeding | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| proceeding | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| proceeding | history_key | events.event_id; round-specific suffix R1/R2 retained. |
| proceeding | proceeding_id | Proposed event_id + source-view/reporting-unit key; preserve rounds and source corrections separately. |
| proceeding | kind | Typed source view / round / correction / event kind; no STV proceeding invented. |
| proceeding | sequence_no | Presidential round number when applicable; otherwise only explicit source sequence. |
| proceeding | supersedes_id | NULL unless correction explicitly links two source versions; no guessed supersession. |
| proceeding | legal_outcome | Only source-declared elected/unopposed/seat outcome; no winner inferred merely from maximum votes. |
| proceeding | lineage_id | Proposed country-package-cyprus; no lineage written. |
| proceeding | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| proceeding | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| result_row | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| result_row | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| result_row | history_key | events.event_id; round-specific suffix R1/R2 retained. |
| result_row | result_row_id | Proposed canonical event + unit + source ID + source locator + result_kind; results.result_id is a pack-local row locator only. |
| result_row | proceeding_id | Proposed event_id + source-view/reporting-unit key; preserve rounds and source corrections separately. |
| result_row | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| result_row | candidate_or_list_label | results.name in source language; source candidate ID is election-scoped. |
| result_row | original_party_label | results.party_label where present; else source list label for list_ballot only. |
| result_row | original_party_code | NULL unless a code is explicitly supplied; names are not codes. |
| result_row | party_namespace | event-and-reporting-unit scoped source labels; no automatic cross-election political identity. |
| result_row | party_mapping_id | NULL; no political grouping or cross-cycle party continuity inferred. |
| result_row | votes | results.votes with result_kind; candidate preferences are not additive to list ballots. |
| result_row | votes_status | reported / not_reported / no_poll as preserved. |
| result_row | share | results.share exactly as source; optional derived normalization must preserve source units. |
| result_row | share_status | reported only when share is present; otherwise unknown. |
| result_row | share_unit | Per-result source_fraction or percent; convert only with explicit method. |
| result_row | seats | results.seats for separate seat observations; council composition seats are not election party seats. |
| result_row | seats_status | reported only when seats is present; otherwise unknown. |
| result_row | elected_flag | results.elected; null is not false. |
| result_row | is_substitute | NULL; later replacement notes are not an original election preference count. |
| result_row | evidence_status | source status retained: official portal, open-data return or parliamentary/EP report; Gazette verification separate. |
| result_row | lineage_id | Proposed country-package-cyprus; no lineage written. |
| result_row | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| result_row | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| party_mapping | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| party_mapping | party_namespace | event-and-reporting-unit scoped source labels; no automatic cross-election political identity. |
| party_mapping | mapping_id | No party mapping rows. Alias mappings are distinct reviewed identity evidence. |
| party_mapping | source_context | Source ID, locator and reporting unit of the original political label. |
| party_mapping | election_context | Event/round + reporting unit, not a nationwide popular universe for unopposed religious returns. |
| party_mapping | original_label | Exact source political label, if any. |
| party_mapping | original_code | Source-supplied political code only; NULL when absent. |
| party_mapping | mapped_group | NULL; party mapping omitted. |
| party_mapping | uncertainty | Unresolved alias, certification, temporal or territorial gate retained explicitly. |
| party_mapping | lineage_id | Proposed country-package-cyprus; no lineage written. |
| party_mapping | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| party_mapping | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| source | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| source | source_namespace | cyprus-primary-sources-aq |
| source | source_id | source-inventory.source_id, tied to retained payload path. |
| source | publisher | source-inventory.publisher |
| source | title | source-inventory.title |
| source | url | source-inventory.url; extracted web snapshots are labelled as such. |
| source | checked_as_of_label | 2026-09-22 |
| source | evidence_grade | source-inventory.evidence_grade |
| source | file_sha256 | source-inventory.sha256 of exact retained bytes. |
| source | locator | source-inventory.input_path plus record locator. |
| source | data_rights | source-inventory.data_rights; no ownership inferred. |
| source | lineage_id | Proposed country-package-cyprus; no lineage written. |
| source | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| source | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| record_locator | record_key | Typed canonical research key (office/event/unit/result/source); do not merge distinct entity kinds. |
| record_locator | entity_kind | office, geography, event, unit, result or source as explicitly typed. |
| record_locator | country_id | Proposed CY (Republic of Cyprus); no database row written. |
| record_locator | geography_id | office-register.geography_id; municipality CYSTAT code or community EC identity; Spilia-Kourdali explicit unresolved-code token. |
| record_locator | id_namespace | cyprus-research-aq-v1, scoped to the Republic electoral footprint. |
| record_locator | office_id | data/office-register.json office_id; historical and post-reform identities are distinct. |
| record_locator | history_key | events.event_id; round-specific suffix R1/R2 retained. |
| record_locator | proceeding_id | Proposed event_id + source-view/reporting-unit key; preserve rounds and source corrections separately. |
| record_locator | result_row_id | Proposed canonical event + unit + source ID + source locator + result_kind; results.result_id is a pack-local row locator only. |
| record_locator | party_namespace | event-and-reporting-unit scoped source labels; no automatic cross-election political identity. |
| record_locator | party_mapping_id | NULL; no political grouping or cross-cycle party continuity inferred. |
| record_locator | source_namespace | cyprus-primary-sources-aq |
| record_locator | source_id | source-inventory.source_id, tied to retained payload path. |
| record_locator | input_path | source-inventory.input_path; package-relative retained input path. |
| record_locator | lineage_id | Proposed country-package-cyprus; no lineage written. |
| record_locator | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| record_locator | source_row_locator | Exact source_locator on the corresponding research record. |
| evidence_link | evidence_id | Future canonical hash of record key + source ID + locator + claim kind; no persisted evidence rows. |
| evidence_link | record_key | Typed canonical research key (office/event/unit/result/source); do not merge distinct entity kinds. |
| evidence_link | source_country_id | CY |
| evidence_link | source_namespace | cyprus-primary-sources-aq |
| evidence_link | source_id | source-inventory.source_id, tied to retained payload path. |
| evidence_link | source_locator | Record source_locator or specific table/CSV row/JSON pointer. |
| evidence_link | claim_kind | Identity / selection mechanism / territorial footing / date / ballot value / seat declaration / unresolved claim. |
| evidence_link | date_claim_id | Only when source supports date precision; otherwise NULL. |
| evidence_link | claim_json | Source-supported claim and its status; never fill an unknown with zero. |
| evidence_link | lineage_id | Proposed country-package-cyprus; no lineage written. |
| evidence_link | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| unresolved_evidence | unresolved_id | Stable proposed gate ID from research-gaps.json plus record key. |
| unresolved_evidence | record_key | Typed canonical research key (office/event/unit/result/source); do not merge distinct entity kinds. |
| unresolved_evidence | original_token | Unresolved source name, malformed field or ambiguous date exactly as retained. |
| unresolved_evidence | source_locator | Record source_locator or specific table/CSV row/JSON pointer. |
| unresolved_evidence | reason | Named gap, excluded-source-observations reason, or extraction-issues kind. |
| unresolved_evidence | lineage_id | Proposed country-package-cyprus; no lineage written. |
| unresolved_evidence | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| unresolved_evidence | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| identity_crosswalk | entity_kind | office, geography, event, unit, result or source as explicitly typed. |
| identity_crosswalk | upstream_namespace | CYSTAT geocode / Central Electoral Service area ID, with vintage and election context. |
| identity_crosswalk | upstream_id | Explicit source code only; no arithmetic conversion used as identity evidence. |
| identity_crosswalk | record_key | Typed canonical research key (office/event/unit/result/source); do not merge distinct entity kinds. |
| identity_crosswalk | reason | Named gap, excluded-source-observations reason, or extraction-issues kind. |
| identity_crosswalk | lineage_id | Proposed country-package-cyprus; no lineage written. |
| identity_crosswalk | release_id | NULL operationally. Future release fingerprint requires reviewed canonical input inventory; no release created. |
| identity_crosswalk | raw_json | Preserve the corresponding complete research record, status, source IDs, source locator and unresolved claims. |
| publication_release | lineage_id | NOT EXECUTED. No publication_release row is created; lineage_id is operational-only and has no research value assigned. |
| publication_release | release_id | NOT EXECUTED. No publication_release row is created; release_id is operational-only and has no research value assigned. |
| publication_receipt | singleton | NOT EXECUTED. No publication_receipt row is created; singleton is operational-only and has no research value assigned. |
| publication_receipt | last_publish_attempt_id | NOT EXECUTED. No publication_receipt row is created; last_publish_attempt_id is operational-only and has no research value assigned. |
| publication_receipt | attempted_lineage_id | NOT EXECUTED. No publication_receipt row is created; attempted_lineage_id is operational-only and has no research value assigned. |
| publication_receipt | attempted_release_id | NOT EXECUTED. No publication_receipt row is created; attempted_release_id is operational-only and has no research value assigned. |
| ingest_attempt | attempt_id | NOT EXECUTED. No ingest_attempt row is created; attempt_id is operational-only and has no research value assigned. |
| ingest_attempt | lineage_id | NOT EXECUTED. No ingest_attempt row is created; lineage_id is operational-only and has no research value assigned. |
| ingest_attempt | operator | NOT EXECUTED. No ingest_attempt row is created; operator is operational-only and has no research value assigned. |
| ingest_attempt | script_version | NOT EXECUTED. No ingest_attempt row is created; script_version is operational-only and has no research value assigned. |
| ingest_attempt | started_at | NOT EXECUTED. No ingest_attempt row is created; started_at is operational-only and has no research value assigned. |
| ingest_attempt | finished_at | NOT EXECUTED. No ingest_attempt row is created; finished_at is operational-only and has no research value assigned. |
| ingest_attempt | status | NOT EXECUTED. No ingest_attempt row is created; status is operational-only and has no research value assigned. |
| ingest_attempt | input_inventory_json | NOT EXECUTED. No ingest_attempt row is created; input_inventory_json is operational-only and has no research value assigned. |
| ingest_attempt | successful_release_id | NOT EXECUTED. No ingest_attempt row is created; successful_release_id is operational-only and has no research value assigned. |
| ingest_attempt | publication_set_json | NOT EXECUTED. No ingest_attempt row is created; publication_set_json is operational-only and has no research value assigned. |
| ingest_attempt | row_counts_json | NOT EXECUTED. No ingest_attempt row is created; row_counts_json is operational-only and has no research value assigned. |
| ingest_attempt | error_text | NOT EXECUTED. No ingest_attempt row is created; error_text is operational-only and has no research value assigned. |
