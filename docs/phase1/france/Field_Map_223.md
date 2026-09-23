# France → inherited 223-column contract

Documentation only; every operational_write is false. 223 rows, 20 tables.

| Table | Column | Proposed mapping / disposition |
|---|---|---|
| dataset_lineage | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| dataset_lineage | provenance_kind | country_research_package. |
| dataset_lineage | description | Prompt AR France research/documentation handoff; applied_changes=0. |
| dataset_release | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| dataset_release | release_id | NULL operationally; no release created. |
| dataset_release | fingerprint_sha256 | NULL operational release fingerprint; SHA256SUMS and ZIP hash are delivery integrity only. |
| dataset_release | hash_inputs_json | Sorted retained-source inventory and contract hashes; no production release fingerprint computation. |
| dataset_release | adapter_version | france-field-map/1 documentation label only; no importer authored. |
| dataset_release | method_version | france-source-preservation/1. |
| dataset_release | schema_version | Inherited 223-column list; live production schema not accessed. |
| dataset_release | research_snapshot_label | 2026-09-22. |
| dataset_release | upstream_release_id | NULL; independent official exports have no fabricated common release. |
| dataset_release | validated_counts_json | data/counts.json plus validation report. |
| dataset_release | research_coverage_complete | FALSE: identified history, return, succession and certification gaps remain. |
| dataset_release | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| retained_input | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| retained_input | release_id | NULL operationally; no release created. |
| retained_input | input_path | source-inventory.json.input_path relative to pack root. |
| retained_input | input_kind | source-inventory.input_kind. |
| retained_input | sha256 | SHA-256 of retained input bytes. |
| retained_input | byte_count | source-inventory.byte_count. |
| retained_input | recovery_locator | Source URL and optional workbook/sheet/row or web extraction reference. |
| retained_input | payload_json | Raw retained file metadata and qualifiers. |
| country | country_id | Proposed FR documentation key; no database identifier allocated. |
| country | country_code | FR. |
| country | name | Exact official label in office-register or COG geography; preserve Unicode. |
| country | polity_kind | Republic; bicameral legislature; directly elected President. |
| country | region_id | NULL operational identifier; France/Europe description only. |
| country | coverage_status | Current in-scope office enumeration complete at COG2026 vintage; historic research partial. |
| country | screening_as_of_label | 2026-09-22. |
| country | notes | France-specific mechanism and scope notes; missing is not zero. |
| country | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| country | release_id | NULL operationally; no release created. |
| country | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| geography | country_id | Proposed FR documentation key; no database identifier allocated. |
| geography | geography_id | Proposed COG code plus territorial vintage / historical identity gate; not an office successor link. |
| geography | name | Exact official label in office-register or COG geography; preserve Unicode. |
| geography | parent_geography_id | Only sourced administrative containment; never infer legal successor. |
| geography | effective_from_label | Source-grounded territorial effective date where established; otherwise NULL. |
| geography | effective_to_label | Source-grounded cessation gate where established; otherwise NULL. |
| geography | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| geography | release_id | NULL operationally; no release created. |
| geography | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| office | id_namespace | Proposed atlas-research-france; research keys only. |
| office | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| office | country_id | Proposed FR documentation key; no database identifier allocated. |
| office | geography_id | Proposed COG code plus territorial vintage / historical identity gate; not an office successor link. |
| office | name | Exact official label in office-register or COG geography; preserve Unicode. |
| office | office_type | office-register.office_type; councils/body offices are separate from reporting districts. |
| office | office_status | current or historical_only. |
| office | record_state | research_draft; never approval or publication. |
| office | state_note | office identity_gate / executive_mode / competence_note and relevant research gaps. |
| office | registry_qualified | Proposed scope qualification only; not production approval. |
| office | next_date_id | NULL; calendar supplies documentary candidate dates with precision. |
| office | next_date_resolution | calendar.date_status; exact local dates usually unresolved. |
| office | next_history_key | NULL; no synthetic future historical event. |
| office | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| office | release_id | NULL operationally; no release created. |
| office | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| office_tier_classification | id_namespace | Proposed atlas-research-france; research keys only. |
| office_tier_classification | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| office_tier_classification | tier | draft-tiers.tier: 1 national/EP, 2 regional/COM/NC, 3 departmental/Lyon, 4 municipal/PLM. |
| office_tier_classification | review_status | draft; all Justin approvals false. |
| office_tier_classification | rationale | Body-level draft tier rule; all historical rows also receive exactly one tier. |
| office_tier_classification | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| office_tier_classification | release_id | NULL operationally; no release created. |
| office_tier_classification | classification_path | data/draft-tiers.jsonl. |
| office_tier_classification | classification_kind | draft_for_human_review. |
| office_tier_classification | classification_sha256 | Hash of frozen draft-tiers.jsonl in SHA256SUMS; not approval evidence. |
| office_tier_classification | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| research_date | date_id | Proposed sourced date label plus precision; no production ID. |
| research_date | label | Source date or candidate/territorial label in its own context. |
| research_date | precision | day, month, year or unresolved; do not pad year-only PF returns into full dates. |
| research_date | certainty | Source-dated event, announced upcoming renewal, or unresolved as explicitly marked. |
| research_date | year | events.year or sourced calendar year. |
| research_date | month | Only from sourced day/month date; NULL for year-only. |
| research_date | day | Only from sourced day date; overseas polling-day exceptions remain noted. |
| research_date | range_start_id | NULL unless a sourced explicit range is provided. |
| research_date | range_end_id | NULL unless a sourced explicit range is provided. |
| research_date | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| research_date | release_id | NULL operationally; no release created. |
| research_date | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| election_event | id_namespace | Proposed atlas-research-france; research keys only. |
| election_event | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| election_event | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| election_event | event_id | events.jsonl.event_id. |
| election_event | date_id | Proposed sourced date label plus precision; no production ID. |
| election_event | date_resolution | events.date_precision and poll_date_note. |
| election_event | event_kind | Sourced election round/renewal; upcoming calendar rows are not historic events. |
| election_event | selected_history_role | Historical sourced observation, not asserted current officeholder state. |
| election_event | electoral_system | Mechanism described in identity rules: presidential two-round, AN two-round, Senate indirect mixed, regional/municipal list rules by vintage. |
| election_event | comparability | Use body, vintage, round, electorate type, reporting-unit type and result_kind; do not pool unlike denominators. |
| election_event | ballot_basis | Popular valid ballots, multi-candidate marks, or Senate electoral-college votes as result_kind states. |
| election_event | share_unit | Published percentage of stated denominator; NULL if absent. |
| election_event | legal_outcome | Source qualification retained. Never infer certified finality from publication alone. |
| election_event | record_state | research_draft; never approval or publication. |
| election_event | state_note | office identity_gate / executive_mode / competence_note and relevant research gaps. |
| election_event | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| election_event | release_id | NULL operationally; no release created. |
| election_event | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| proceeding | id_namespace | Proposed atlas-research-france; research keys only. |
| proceeding | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| proceeding | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| proceeding | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| proceeding | kind | Round or renewal as evidenced; no invented repeat proceeding. |
| proceeding | sequence_no | events.round, preserved independently of chronology where Senate PR and MAJ coexist. |
| proceeding | supersedes_id | NULL; no guessed judicial/merger successor link. |
| proceeding | legal_outcome | Source qualification retained. Never infer certified finality from publication alone. |
| proceeding | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| proceeding | release_id | NULL operationally; no release created. |
| proceeding | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| result_row | id_namespace | Proposed atlas-research-france; research keys only. |
| result_row | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| result_row | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| result_row | result_row_id | results.result_id; unit-scoped sequence in retained source order. |
| result_row | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| result_row | country_id | Proposed FR documentation key; no database identifier allocated. |
| result_row | candidate_or_list_label | results.contestant_label exactly as sourced, preserving accents. |
| result_row | original_party_label | List label where supplied; NULL if not supplied. Does not create party organisations. |
| result_row | original_party_code | results.political_nuance where supplied, context-specific. |
| result_row | party_namespace | Election-local Ministry nuance / exact source label; no canonical party inference. |
| result_row | party_mapping_id | NULL; no party organisations or cross-election party identity invented. |
| result_row | votes | results.votes integer or NULL. Never back-solve from share, elected member, or seat count. |
| result_row | votes_status | reported or not_supplied; an explicit numeric zero remains reported zero. |
| result_row | share | Published vote_percentage_source only; no newly calculated cross-regime share. |
| result_row | share_status | reported if a source percentage is present, otherwise not_supplied. |
| result_row | share_unit | Published percentage of stated denominator; NULL if absent. |
| result_row | seats | results.seats only when numerically sourced and attributable to that result scope. CC and repeated metropolitan/EP national seat columns are excluded from local allocations. |
| result_row | seats_status | reported for numeric seat value; not_supplied for NULL. Source zero is distinct. |
| result_row | elected_flag | TRUE only for a supplied elected marker/return; otherwise NULL, not inferred FALSE. |
| result_row | is_substitute | NULL; substitutes not normalized in this pack. |
| result_row | evidence_status | Source status and unresolved arithmetic / repeat gates; not blanket certification. |
| result_row | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| result_row | release_id | NULL operationally; no release created. |
| result_row | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| party_mapping | country_id | Proposed FR documentation key; no database identifier allocated. |
| party_mapping | party_namespace | Election-local Ministry nuance / exact source label; no canonical party inference. |
| party_mapping | mapping_id | NULL; no canonical party mapping authored. |
| party_mapping | source_context | Exact election file, year, round and publisher. |
| party_mapping | election_context | event_id and reporting unit; no cross-election party identity assertion. |
| party_mapping | original_label | Exact original source label. |
| party_mapping | original_code | Exact source nuance/panel/territory code within its namespace. |
| party_mapping | mapped_group | NULL; no speculative party family mapping. |
| party_mapping | uncertainty | Explicit research gap / unresolved evidence; never silently resolved. |
| party_mapping | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| party_mapping | release_id | NULL operationally; no release created. |
| party_mapping | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| source | country_id | Proposed FR documentation key; no database identifier allocated. |
| source | source_namespace | FR-S; retained-source namespace. |
| source | source_id | source-inventory.json.source_id; source file bytes and locator retained. |
| source | publisher | source-inventory.publisher. |
| source | title | source-inventory.title (retained filename; originating titles remain in metadata sources). |
| source | url | source-inventory.url; web extraction may contain several supporting URLs. |
| source | checked_as_of_label | 2026-09-22. |
| source | evidence_grade | Official primary source; separate discovery-only gate files and publication/finality qualification. |
| source | file_sha256 | source-inventory.sha256, exact retained bytes only. |
| source | locator | input_path plus record-specific locator. |
| source | data_rights | Publisher/resource licence and source inventory caveat; no invented licence grant. |
| source | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| source | release_id | NULL operationally; no release created. |
| source | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| record_locator | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| record_locator | entity_kind | office / event / reporting_unit / result / source / geographic movement, never office created from a reporting unit. |
| record_locator | country_id | Proposed FR documentation key; no database identifier allocated. |
| record_locator | geography_id | Proposed COG code plus territorial vintage / historical identity gate; not an office successor link. |
| record_locator | id_namespace | Proposed atlas-research-france; research keys only. |
| record_locator | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| record_locator | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| record_locator | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| record_locator | result_row_id | results.result_id; unit-scoped sequence in retained source order. |
| record_locator | party_namespace | Election-local Ministry nuance / exact source label; no canonical party inference. |
| record_locator | party_mapping_id | NULL; no party organisations or cross-election party identity invented. |
| record_locator | source_namespace | FR-S; retained-source namespace. |
| record_locator | source_id | source-inventory.json.source_id; source file bytes and locator retained. |
| record_locator | input_path | source-inventory.json.input_path relative to pack root. |
| record_locator | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| record_locator | release_id | NULL operationally; no release created. |
| record_locator | source_row_locator | Exact source_locator from normalized record; no invented page positions. |
| evidence_link | evidence_id | Proposed source_id + record_key + exact locator; no database row written. |
| evidence_link | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| evidence_link | source_country_id | Proposed FR source context; EP is supranational publisher. |
| evidence_link | source_namespace | FR-S; retained-source namespace. |
| evidence_link | source_id | source-inventory.json.source_id; source file bytes and locator retained. |
| evidence_link | source_locator | Exact file row, workbook sheet/row, PDF page, or extracted official webpage section. |
| evidence_link | claim_kind | Office existence, territorial code, mechanism, event, reported number, or unresolved gate. |
| evidence_link | date_claim_id | Source date precision context; NULL if date not established. |
| evidence_link | claim_json | Only sourced claim and qualifications; no inferred votes/seats/succession. |
| evidence_link | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| evidence_link | release_id | NULL operationally; no release created. |
| unresolved_evidence | unresolved_id | Named research gap, source-arithmetic discrepancy or extraction issue key. |
| unresolved_evidence | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| unresolved_evidence | original_token | Retained raw malformed label/code/blank value in source or extraction issue. |
| unresolved_evidence | source_locator | Exact file row, workbook sheet/row, PDF page, or extracted official webpage section. |
| unresolved_evidence | reason | Named extraction issue, identity gate or research-gap detail. |
| unresolved_evidence | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| unresolved_evidence | release_id | NULL operationally; no release created. |
| unresolved_evidence | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| identity_crosswalk | entity_kind | office / event / reporting_unit / result / source / geographic movement, never office created from a reporting unit. |
| identity_crosswalk | upstream_namespace | INSEE COG or named election publisher namespace; preserve vintage. |
| identity_crosswalk | upstream_id | Exact original territory, candidate panel or list token; normalization documented separately. |
| identity_crosswalk | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| identity_crosswalk | reason | Named extraction issue, identity gate or research-gap detail. |
| identity_crosswalk | lineage_id | Proposed france-research lineage only; no operational lineage written. |
| identity_crosswalk | release_id | NULL operationally; no release created. |
| identity_crosswalk | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| publication_release | lineage_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| publication_release | release_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| publication_receipt | singleton | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| publication_receipt | last_publish_attempt_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| publication_receipt | attempted_lineage_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| publication_receipt | attempted_release_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | attempt_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | lineage_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | operator | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | script_version | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | started_at | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | finished_at | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | status | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | input_inventory_json | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | successful_release_id | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | publication_set_json | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | row_counts_json | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
| ingest_attempt | error_text | NOT APPLICABLE / no row: research-only pack performs no ingest, publication, attempt, release or receipt write. |
