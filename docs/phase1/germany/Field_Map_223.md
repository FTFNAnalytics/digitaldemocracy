# Germany: 223-column documentary map

20 inherited tables; 223 unique mappings. No operational writes.

| Table | Column | Proposed mapping / disposition |
|---|---|---|
| dataset_lineage | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| dataset_lineage | provenance_kind | country_research_package. |
| dataset_lineage | description | Prompt AS Germany research/documentation; applied_changes=0. |
| dataset_release | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| dataset_release | release_id | NULL operationally; no release created. |
| dataset_release | fingerprint_sha256 | NULL operational release fingerprint; SHA256SUMS and ZIP hash are delivery integrity only. |
| dataset_release | hash_inputs_json | Sorted retained-source inventory and contract hashes; no production release fingerprint computation. |
| dataset_release | adapter_version | germany-field-map/1, documentary label; no importer authored. |
| dataset_release | method_version | germany-source-preservation/1. |
| dataset_release | schema_version | Exact inherited 223-column contract; live schema not inspected. |
| dataset_release | research_snapshot_label | 2026-09-23. |
| dataset_release | upstream_release_id | NULL; independent official exports have no fabricated common release. |
| dataset_release | validated_counts_json | data/counts.json, result-audit.json and validation-report.json. |
| dataset_release | research_coverage_complete | FALSE; outstanding direct-executive, submunicipal, historical, succession and source-conflict gates. |
| dataset_release | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| retained_input | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| retained_input | release_id | NULL operationally; no release created. |
| retained_input | input_path | source-inventory.input_path, relative to pack root. |
| retained_input | input_kind | Source file format; no executable importer input is defined. |
| retained_input | sha256 | SHA-256 of retained input bytes. |
| retained_input | byte_count | source-inventory.byte_count. |
| retained_input | recovery_locator | Source URL and optional workbook/sheet/row or web extraction reference. |
| retained_input | payload_json | Raw retained file metadata and qualifiers. |
| country | country_id | Proposed DE documentation key; no database identifier allocated. |
| country | country_code | DE. |
| country | name | Exact official territorial/body label, preserving Unicode and source-era form. |
| country | polity_kind | Federal parliamentary republic; Bundestag direct, Bundespräsident indirect, Bundesrat excluded from popular register. |
| country | region_id | NULL operational identifier; Europe description only. |
| country | coverage_status | Core territorial office scope enumerated at 2026-08-31; full requested current scope incomplete; history partial. See research-gaps. |
| country | screening_as_of_label | 2026-09-23. |
| country | notes | Germany mechanism and coverage qualifications; first/second votes are not rounds; missing is not zero. |
| country | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| country | release_id | NULL operationally; no release created. |
| country | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| geography | country_id | Proposed DE documentation key; no database identifier allocated. |
| geography | geography_id | Research namespace plus source-era AGS/ARS or explicitly sourced local key; no successor inference. |
| geography | name | Exact official territorial/body label, preserving Unicode and source-era form. |
| geography | parent_geography_id | Only sourced administrative containment; never legal succession. |
| geography | effective_from_label | Only a sourced legal effective date; otherwise NULL. |
| geography | effective_to_label | NULL unless exact cessation is sourced; obsolete code alone does not prove legal abolition. |
| geography | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| geography | release_id | NULL operationally; no release created. |
| geography | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| office | id_namespace | Proposed atlas-research-germany; research keys only. |
| office | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| office | country_id | Proposed DE documentation key; no database identifier allocated. |
| office | geography_id | Research namespace plus source-era AGS/ARS or explicitly sourced local key; no successor inference. |
| office | name | Exact official territorial/body label, preserving Unicode and source-era form. |
| office | office_type | office-register.office_type; councils/body offices are separate from reporting districts. |
| office | office_status | current or historical_only. |
| office | record_state | research_draft; no approval, ingest or publication. |
| office | state_note | Land mode, city-state exception, source-era identity gate and relevant named research gaps. |
| office | registry_qualified | Research qualification only, with scope gaps; not operational approval. |
| office | next_date_id | NULL; calendar supplies documentary candidate dates with precision. |
| office | next_date_resolution | calendar.date_status; exact local dates usually unresolved. |
| office | next_history_key | NULL; no synthetic future historical event. |
| office | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| office | release_id | NULL operationally; no release created. |
| office | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| office_tier_classification | id_namespace | Proposed atlas-research-germany; research keys only. |
| office_tier_classification | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| office_tier_classification | tier | Draft: 1 federal/EP; 2 Land; 3 Kreis/Bezirk/regional; 4 municipality/association/borough. One per office. |
| office_tier_classification | review_status | draft; all Justin approvals false. |
| office_tier_classification | rationale | Body-level draft jurisdiction rule; every historical office also has one tier. |
| office_tier_classification | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| office_tier_classification | release_id | NULL operationally; no release created. |
| office_tier_classification | classification_path | data/draft-tiers.jsonl. |
| office_tier_classification | classification_kind | draft_for_human_review. |
| office_tier_classification | classification_sha256 | SHA256SUMS hash of frozen draft-tiers.jsonl; integrity is not approval. |
| office_tier_classification | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| research_date | date_id | Proposed documentary date key only; no production identifier. |
| research_date | label | Source date or candidate/territorial label in its own context. |
| research_date | precision | day or sourced calendar year; unresolved dates remain NULL. |
| research_date | certainty | Source-dated event, announced upcoming renewal, or unresolved as explicitly marked. |
| research_date | year | events.year or sourced calendar year. |
| research_date | month | Only from sourced day/month date; NULL for year-only. |
| research_date | day | Only from sourced day date; no interpolation from term lengths. |
| research_date | range_start_id | NULL unless a sourced explicit range is provided. |
| research_date | range_end_id | NULL unless a sourced explicit range is provided. |
| research_date | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| research_date | release_id | NULL operationally; no release created. |
| research_date | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| election_event | id_namespace | Proposed atlas-research-germany; research keys only. |
| election_event | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| election_event | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| election_event | event_id | events.jsonl.event_id. |
| election_event | date_id | Proposed documentary date key only; no production identifier. |
| election_event | date_resolution | events.date plus explicit source or cycle/repeat qualifier; unknown dates remain absent. |
| election_event | event_kind | Sourced election round/renewal; upcoming calendar rows are not historic events. |
| election_event | selected_history_role | Sourced historic observation; no inference of current officeholder or effective government. |
| election_event | electoral_system | Cycle-specific Bundestag rules; indirect Federal Convention; Land-specific and local legal mechanisms. No reconstructed seat mathematics. |
| election_event | comparability | Require office, cycle, ballot variant, vote_type, result_kind, electorate and geography; do not sum national and subordinate units. |
| election_event | ballot_basis | Reported popular votes, multi-vote totals, weighted votes retained outside raw votes, or Federal Convention ballots, explicitly distinguished. |
| election_event | share_unit | Published percentage of stated denominator; NULL if absent. |
| election_event | legal_outcome | Published final, preliminary, convention record, Endergebnis or unresolved source conflict as event.result_status states. |
| election_event | record_state | research_draft; no approval, ingest or publication. |
| election_event | state_note | Land mode, city-state exception, source-era identity gate and relevant named research gaps. |
| election_event | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| election_event | release_id | NULL operationally; no release created. |
| election_event | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| proceeding | id_namespace | Proposed atlas-research-germany; research keys only. |
| proceeding | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| proceeding | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| proceeding | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| proceeding | kind | Round or renewal as evidenced; no invented repeat proceeding. |
| proceeding | sequence_no | Only sourced ballot_number or variant; first and second votes are components of the same election. |
| proceeding | supersedes_id | NULL for office continuity; the separate source-coded territorial crosswalk does not assert office succession or a judicial replacement edge. |
| proceeding | legal_outcome | Published final, preliminary, convention record, Endergebnis or unresolved source conflict as event.result_status states. |
| proceeding | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| proceeding | release_id | NULL operationally; no release created. |
| proceeding | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| result_row | id_namespace | Proposed atlas-research-germany; research keys only. |
| result_row | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| result_row | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| result_row | result_row_id | results.result_id, unique documentary sequence; source locator is authoritative, sequence is not a production key. |
| result_row | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| result_row | country_id | Proposed DE documentation key; no database identifier allocated. |
| result_row | candidate_or_list_label | results.label when result_kind is contestant/seat_allocation; metric labels are not candidates. |
| result_row | original_party_label | Exact source party/list/nomination label; local WGR slots are not national party identities. |
| result_row | original_party_code | Explicit source_field/source_group_slot or nomination type, scoped to its source and reporting unit. |
| result_row | party_namespace | Source + event + reporting unit; preserve local party slots; no canonical party organisation is created. |
| result_row | party_mapping_id | NULL; no party organisations or cross-election party identity invented. |
| result_row | votes | results.votes, numeric source observation or NULL. Filter result_kind and vote_type before treating a count as contestant votes; weighted figures never fill raw votes. |
| result_row | votes_status | reported or not_supplied; an explicit numeric zero remains reported zero. |
| result_row | share | Published raw percentage within results.raw / percent_raw, if supplied; no reconstructed common denominator. |
| result_row | share_status | reported if a source percentage is present, otherwise not_supplied. |
| result_row | share_unit | Published percentage of stated denominator; NULL if absent. |
| result_row | seats | results.seats where numerically reported; total, allocated, occupied and unoccupied meanings remain distinct; missing stays NULL; a dash is zero only where the source legend explicitly defines it as zero. Conflicting historical seat figures are withheld with raw values preserved. |
| result_row | seats_status | reported for numeric seat value; not_supplied for NULL. Source zero is distinct. |
| result_row | elected_flag | Only an explicit elected marker or source winner text; no majority arithmetic inference. |
| result_row | is_substitute | NULL; substitutes not normalized in this pack. |
| result_row | evidence_status | event.result_status plus source disposition and named gap; no blanket certification. |
| result_row | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| result_row | release_id | NULL operationally; no release created. |
| result_row | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| party_mapping | country_id | Proposed DE documentation key; no database identifier allocated. |
| party_mapping | party_namespace | Source + event + reporting unit; preserve local party slots; no canonical party organisation is created. |
| party_mapping | mapping_id | NULL; no canonical party mapping authored. |
| party_mapping | source_context | Exact source file/member/sheet/row/page and election-era territory. |
| party_mapping | election_context | event_id plus reporting unit, with first/second vote type and historical territorial footprint. |
| party_mapping | original_label | Exact original source label. |
| party_mapping | original_code | Exact source nuance/panel/territory code within its namespace. |
| party_mapping | mapped_group | NULL; no speculative party family mapping. |
| party_mapping | uncertainty | Explicit research gap / unresolved evidence; never silently resolved. |
| party_mapping | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| party_mapping | release_id | NULL operationally; no release created. |
| party_mapping | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| source | country_id | Proposed DE documentation key; no database identifier allocated. |
| source | source_namespace | DE-S; exact retained-source namespace. |
| source | source_id | data/source-inventory.json.source_id; retained bytes and URL. |
| source | publisher | Source-inventory publisher host; authority linkage is retained through the official index/landing page. |
| source | title | source-inventory.title (retained filename; originating titles remain in metadata sources). |
| source | url | source-inventory.url; web extraction may contain several supporting URLs. |
| source | checked_as_of_label | 2026-09-23. |
| source | evidence_grade | Official primary source; separate discovery-only gate files and publication/finality qualification. |
| source | file_sha256 | source-inventory.sha256, exact retained bytes only. |
| source | locator | input_path plus record-specific locator. |
| source | data_rights | Publisher rights apply; source inventory does not assert a new licence. |
| source | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| source | release_id | NULL operationally; no release created. |
| source | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| record_locator | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| record_locator | entity_kind | office / event / reporting_unit / result / source / geographic movement, never office created from a reporting unit. |
| record_locator | country_id | Proposed DE documentation key; no database identifier allocated. |
| record_locator | geography_id | Research namespace plus source-era AGS/ARS or explicitly sourced local key; no successor inference. |
| record_locator | id_namespace | Proposed atlas-research-germany; research keys only. |
| record_locator | office_id | office-register.jsonl.office_id; historical gates are part of identity. |
| record_locator | history_key | events.jsonl.event_id groups office, sourced cycle, round and ballot regime. |
| record_locator | proceeding_id | Proposed event_id; different rounds are distinct proceedings. No operational write. |
| record_locator | result_row_id | results.result_id, unique documentary sequence; source locator is authoritative, sequence is not a production key. |
| record_locator | party_namespace | Source + event + reporting unit; preserve local party slots; no canonical party organisation is created. |
| record_locator | party_mapping_id | NULL; no party organisations or cross-election party identity invented. |
| record_locator | source_namespace | DE-S; exact retained-source namespace. |
| record_locator | source_id | data/source-inventory.json.source_id; retained bytes and URL. |
| record_locator | input_path | source-inventory.input_path, relative to pack root. |
| record_locator | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| record_locator | release_id | NULL operationally; no release created. |
| record_locator | source_row_locator | The normalized record source_row, source_member, source_sheet, source_page or whole-table context. |
| evidence_link | evidence_id | Proposed source_id + record_key + exact locator; no database row written. |
| evidence_link | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| evidence_link | source_country_id | Proposed DE source context; EP sources may be supranational. |
| evidence_link | source_namespace | DE-S; exact retained-source namespace. |
| evidence_link | source_id | data/source-inventory.json.source_id; retained bytes and URL. |
| evidence_link | source_locator | Retained source ID plus row/member/sheet/page where emitted; otherwise the named whole-table/page scope. |
| evidence_link | claim_kind | Office existence, territorial code, mechanism, event, reported number, or unresolved gate. |
| evidence_link | date_claim_id | Source date precision context; NULL if date not established. |
| evidence_link | claim_json | Only sourced claim and qualifications; no inferred votes/seats/succession. |
| evidence_link | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| evidence_link | release_id | NULL operationally; no release created. |
| unresolved_evidence | unresolved_id | Named research gap, source-arithmetic discrepancy or extraction issue key. |
| unresolved_evidence | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| unresolved_evidence | original_token | Retained raw malformed label/code/blank value in source or extraction issue. |
| unresolved_evidence | source_locator | Retained source ID plus row/member/sheet/page where emitted; otherwise the named whole-table/page scope. |
| unresolved_evidence | reason | Named Germany research gap, source conflict, extraction or identity gate. |
| unresolved_evidence | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| unresolved_evidence | release_id | NULL operationally; no release created. |
| unresolved_evidence | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| identity_crosswalk | entity_kind | office / event / reporting_unit / result / source / geographic movement, never office created from a reporting unit. |
| identity_crosswalk | upstream_namespace | Destatis GV100AD, named Land election publisher or federal election archive; retain vintage. |
| identity_crosswalk | upstream_id | Exact original territory, candidate panel or list token; normalization documented separately. |
| identity_crosswalk | record_key | Research record identity: office_id, event_id, unit_id or result_id as applicable. |
| identity_crosswalk | reason | Named Germany research gap, source conflict, extraction or identity gate. |
| identity_crosswalk | lineage_id | Proposed germany-research documentary lineage only; no operational lineage written. |
| identity_crosswalk | release_id | NULL operationally; no release created. |
| identity_crosswalk | raw_json | Preserve original scoped record, source locator, electorate type, date precision and unresolved qualifiers. |
| publication_release | lineage_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| publication_release | release_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| publication_receipt | singleton | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| publication_receipt | last_publish_attempt_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| publication_receipt | attempted_lineage_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| publication_receipt | attempted_release_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | attempt_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | lineage_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | operator | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | script_version | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | started_at | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | finished_at | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | status | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | input_inventory_json | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | successful_release_id | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | publication_set_json | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | row_counts_json | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
| ingest_attempt | error_text | NOT APPLICABLE: research-only; no ingest attempt, operational publication, release or receipt row. |
