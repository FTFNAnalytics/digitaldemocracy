# Italy — inherited 223-column field map

This is a semantic review document, not an importer. Exact contract: 20 tables, 223 columns. Every table/column pair appears once. No target rows, surrogate IDs or publication receipts are created.

| Table | Column | Artifact | Documentary mapping |
|---|---|---|---|
| dataset_lineage | lineage_id | README.md | Documentary lineage italy-prompt-at; no production lineage written. |
| dataset_lineage | provenance_kind | README.md | Official territorial roster, public election return or attributed primary legal evidence; see source inventory. |
| dataset_lineage | description | README.md | Italy Prompt AT documentary pack with explicitly bounded history and scope. |
| dataset_release | lineage_id | data/counts.json | Documentary lineage italy-prompt-at; no production lineage written. |
| dataset_release | release_id | data/counts.json | Documentary snapshot IT-2026-09-23; not a production release. |
| dataset_release | fingerprint_sha256 | data/counts.json | External ZIP SHA-256 plus per-file SHA256SUMS; never a self-referential hash. |
| dataset_release | hash_inputs_json | data/counts.json | data/source-inventory.json lists exact retained byte hashes and recovery URLs. |
| dataset_release | adapter_version | data/counts.json | Not applicable: no importer/adapter is written or run. |
| dataset_release | method_version | data/counts.json | IT-AT-documentary-v1; extraction methods described in methodology.md. |
| dataset_release | schema_version | data/counts.json | Inherited 20-table/223-column inventory; no live schema version asserted. |
| dataset_release | research_snapshot_label | data/counts.json | 2026-09-23; temporal source vintages retained separately. |
| dataset_release | upstream_release_id | data/counts.json | Null unless supplied by an official source; snapshot date is not an upstream release identifier. |
| dataset_release | validated_counts_json | data/counts.json | data/counts.json and validation-report.json; counts of records are not votes. |
| dataset_release | research_coverage_complete | data/counts.json | False: remaining history, submunicipal and certification gates are explicit. |
| dataset_release | raw_json | data/counts.json | Retain the original source observation and its locator; preserve unsupported values as null. |
| retained_input | lineage_id | data/source-inventory.json | Documentary lineage italy-prompt-at; no production lineage written. |
| retained_input | release_id | data/source-inventory.json | Documentary snapshot IT-2026-09-23; not a production release. |
| retained_input | input_path | data/source-inventory.json | Relative sources/ path from data/source-inventory.json. |
| retained_input | input_kind | data/source-inventory.json | Detected format in source inventory; misleading file extension is not trusted. |
| retained_input | sha256 | data/source-inventory.json | SHA-256 of exact retained bytes, not a reconstructed web page. |
| retained_input | byte_count | data/source-inventory.json | Actual retained file byte length. |
| retained_input | recovery_locator | data/source-inventory.json | Recorded public recovery URL; viewer lineage and embedded authority URLs retained. |
| retained_input | payload_json | data/source-inventory.json | Exact raw observation; search/rendered extracts remain distinct from original page bytes. |
| country | country_id | README.md | Documentary ISO code IT; production surrogate remains unresolved. |
| country | country_code | README.md | IT. |
| country | name | README.md | Exact source-derived geography or body name for this entity. |
| country | polity_kind | README.md | Republic; parliamentary government; indirectly elected head of state. |
| country | region_id | README.md | Unsupported production supranational region identifier remains null; not an ISTAT region code. |
| country | coverage_status | README.md | Core current enumeration with bounded numeric history; overall research incomplete. |
| country | screening_as_of_label | README.md | 2026-09-23. |
| country | notes | README.md | Relevant source vintage, selection mechanism and named unresolved gate. |
| country | lineage_id | README.md | Documentary lineage italy-prompt-at; no production lineage written. |
| country | release_id | README.md | Documentary snapshot IT-2026-09-23; not a production release. |
| country | raw_json | README.md | Retain the original source observation and its locator; preserve unsupported values as null. |
| geography | country_id | data/territorial-register.jsonl | Documentary ISO code IT; production surrogate remains unresolved. |
| geography | geography_id | data/territorial-register.jsonl | Documentary ISTAT geography identity qualified by level and vintage; reporting units use separate IDs. |
| geography | name | data/territorial-register.jsonl | Exact source-derived geography or body name for this entity. |
| geography | parent_geography_id | data/territorial-register.jsonl | Only explicit SITUAS current hierarchy or historically sourced parent; no inferred historical parent. |
| geography | effective_from_label | data/territorial-register.jsonl | Only an explicit official effective date; current extraction date is not office creation. |
| geography | effective_to_label | data/territorial-register.jsonl | Official ES extinction date for historical commune identity; otherwise null. |
| geography | lineage_id | data/territorial-register.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| geography | release_id | data/territorial-register.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| geography | raw_json | data/territorial-register.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| office | id_namespace | data/office-register.jsonl | Research namespace IT; namespaces retain body and electoral vintage. |
| office | office_id | data/office-register.jsonl | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| office | country_id | data/office-register.jsonl | Documentary ISO code IT; production surrogate remains unresolved. |
| office | geography_id | data/office-register.jsonl | Documentary ISTAT geography identity qualified by level and vintage; reporting units use separate IDs. |
| office | name | data/office-register.jsonl | Exact source-derived geography or body name for this entity. |
| office | office_type | data/office-register.jsonl | Documented collective body, direct executive or indirect national head of state class. |
| office | office_status | data/office-register.jsonl | current, historical_only or statutory_pending_first_election; do not conflate. |
| office | record_state | data/office-register.jsonl | Unapproved documentary research; no production state transition. |
| office | state_note | data/office-register.jsonl | Selection mode, territorial footing and source limitations; no incumbent assertion. |
| office | registry_qualified | data/office-register.jsonl | Only documentary qualification; no production approval implied. Pending FVG rows stay separate. |
| office | next_date_id | data/office-register.jsonl | Null; no exact future date has been normalized in this pack. |
| office | next_date_resolution | data/office-register.jsonl | unresolved; calendar retains every current office outside the alert window too. |
| office | next_history_key | data/office-register.jsonl | Null until an official future event is identified; no synthetic cycle. |
| office | lineage_id | data/office-register.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| office | release_id | data/office-register.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| office | raw_json | data/office-register.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| office_tier_classification | id_namespace | data/draft-tiers.jsonl | Research namespace IT; namespaces retain body and electoral vintage. |
| office_tier_classification | office_id | data/draft-tiers.jsonl | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| office_tier_classification | tier | data/draft-tiers.jsonl | data/draft-tiers.jsonl draft_tier, one per office: 1 national/EP; 2 regional; 3 provincial; 4 municipal/submunicipal. |
| office_tier_classification | review_status | data/draft-tiers.jsonl | unapproved_draft; justin_approved=false. |
| office_tier_classification | rationale | data/draft-tiers.jsonl | Proposed body-level jurisdiction tier, including separate historical and pending rows. |
| office_tier_classification | lineage_id | data/draft-tiers.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| office_tier_classification | release_id | data/draft-tiers.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| office_tier_classification | classification_path | data/draft-tiers.jsonl | data/draft-tiers.jsonl. |
| office_tier_classification | classification_kind | data/draft-tiers.jsonl | documentary_unapproved_draft. |
| office_tier_classification | classification_sha256 | data/draft-tiers.jsonl | SHA256SUMS hash for the draft-tier file; no approved classification fingerprint. |
| office_tier_classification | raw_json | data/draft-tiers.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| research_date | date_id | data/events.jsonl | Documentary date identity would retain exact date/range/year precision; no target ID materialized. |
| research_date | label | data/events.jsonl | Exact source date or cycle label; a year is not January 1. |
| research_date | precision | data/events.jsonl | day, year or unknown as actually evidenced; publication timestamp is separate. |
| research_date | certainty | data/events.jsonl | source_evidenced or unresolved; never promoted by inference from term lengths. |
| research_date | year | data/events.jsonl | Explicit year from date/cycle evidence; historical EP entries support year only. |
| research_date | month | data/events.jsonl | Source month only for exact dated evidence; null for year-only or unknown dates. |
| research_date | day | data/events.jsonl | Source day only for exact dated evidence; null for year-only or unknown dates. |
| research_date | range_start_id | data/events.jsonl | Only an explicitly sourced poll_start_date; not an assumed first day. |
| research_date | range_end_id | data/events.jsonl | Only an explicitly sourced poll_end_date/date convention; do not synthesize a second day. |
| research_date | lineage_id | data/events.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| research_date | release_id | data/events.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| research_date | raw_json | data/events.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| election_event | id_namespace | data/events.jsonl | Research namespace IT; namespaces retain body and electoral vintage. |
| election_event | office_id | data/events.jsonl | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| election_event | history_key | data/events.jsonl | Documentary office + source cycle + variant; cycle_label alone is not globally unique. |
| election_event | event_id | data/events.jsonl | data/events.jsonl event_id; indirect presidential ballots remain distinct numbered events. |
| election_event | date_id | data/events.jsonl | Documentary date identity would retain exact date/range/year precision; no target ID materialized. |
| election_event | date_resolution | data/events.jsonl | data/events.jsonl date_precision and source date; unknown means unknown. |
| election_event | event_kind | data/events.jsonl | Popular chamber/council/executive poll or indirect presidential assembly ballot; source variant retained. |
| election_event | selected_history_role | data/events.jsonl | Documented historic evidence, not a selected production winner/latest history. |
| election_event | electoral_system | data/events.jsonl | Cycle-specific legal regime; mixed national ballot, regional/special local rules or indirect presidency. No allocation algorithm. |
| election_event | comparability | data/events.jsonl | Source-era geography and ballot basis only; no automatic modern-territory comparison or aggregation. |
| election_event | ballot_basis | data/events.jsonl | popular_ballot or indirect_assembly_ballot; joint-ticket and reporting scope qualifications retained. |
| election_event | share_unit | data/events.jsonl | Percent only when the publisher supplies a percentage; denominator not reconstructed. |
| election_event | legal_outcome | data/events.jsonl | Null unless explicit proclamation or official legal determination is supplied. |
| election_event | record_state | data/events.jsonl | Unapproved documentary research; no production state transition. |
| election_event | state_note | data/events.jsonl | Selection mode, territorial footing and source limitations; no incumbent assertion. |
| election_event | lineage_id | data/events.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| election_event | release_id | data/events.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| election_event | raw_json | data/events.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| proceeding | id_namespace | data/events.jsonl | Research namespace IT; namespaces retain body and electoral vintage. |
| proceeding | office_id | data/events.jsonl | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| proceeding | history_key | data/events.jsonl | Documentary office + source cycle + variant; cycle_label alone is not globally unique. |
| proceeding | proceeding_id | data/events.jsonl | Documentary event variant would identify a round/ballot; no production proceeding row created. |
| proceeding | kind | data/events.jsonl | Presidential ballot number, ordinary poll or explicitly evidenced mayoral round; never an inferred repeat. |
| proceeding | sequence_no | data/events.jsonl | Only source ballot_number or explicit round-1/round-2; no invented intermediate rounds. |
| proceeding | supersedes_id | data/events.jsonl | Null: no repeat/recount supersession is inferred from chronological order. |
| proceeding | legal_outcome | data/events.jsonl | Null unless explicit proclamation or official legal determination is supplied. |
| proceeding | lineage_id | data/events.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| proceeding | release_id | data/events.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| proceeding | raw_json | data/events.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| result_row | id_namespace | data/results.jsonl.gz | Research namespace IT; namespaces retain body and electoral vintage. |
| result_row | office_id | data/results.jsonl.gz | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| result_row | history_key | data/results.jsonl.gz | Documentary office + source cycle + variant; cycle_label alone is not globally unique. |
| result_row | result_row_id | data/results.jsonl.gz | data/results.jsonl.gz result_id. Sequential ID is pack-local, not a permanent production identity. |
| result_row | proceeding_id | data/results.jsonl.gz | Documentary event variant would identify a round/ballot; no production proceeding row created. |
| result_row | country_id | data/results.jsonl.gz | Documentary ISO code IT; production surrogate remains unresolved. |
| result_row | candidate_or_list_label | data/results.jsonl.gz | Published label, including combined table-row labels when separate identities cannot safely be extracted. |
| result_row | original_party_label | data/results.jsonl.gz | Source party/list label only; no harmonized party or organization office. |
| result_row | original_party_code | data/results.jsonl.gz | Only source_party_id or explicit source list number, qualified by event/reporting context. |
| result_row | party_namespace | data/results.jsonl.gz | Source and election scoped; never equate a local list number with a national party ID. |
| result_row | party_mapping_id | data/results.jsonl.gz | Null: no cross-cycle party harmonization is asserted. |
| result_row | votes | data/results.jsonl.gz | Published integer in its declared vote_type and reporting grain. Metric records are not contestant votes. |
| result_row | votes_status | data/results.jsonl.gz | reported, explicitly_zero or missing according to source; null never becomes zero. |
| result_row | share | data/results.jsonl.gz | Only supplied published_percent/published_percent_raw; do not calculate votes from rounded shares. |
| result_row | share_status | data/results.jsonl.gz | reported or missing; inferred normalized fractions are not written. |
| result_row | share_unit | data/results.jsonl.gz | Percent only when the publisher supplies a percentage; denominator not reconstructed. |
| result_row | seats | data/results.jsonl.gz | Published seat allocation only. council_capacity and printed aggregate totals are separate metric kinds. |
| result_row | seats_status | data/results.jsonl.gz | reported, explicitly_zero or missing; a dash remains missing, never an invented zero. |
| result_row | elected_flag | data/results.jsonl.gz | Null unless explicit source election status is interpreted with its codebook; not deduced from rank. |
| result_row | is_substitute | data/results.jsonl.gz | Null unless source explicitly identifies substitute status. |
| result_row | evidence_status | data/results.jsonl.gz | Source-published status and numeric quality flag; official hosting is not certification. |
| result_row | lineage_id | data/results.jsonl.gz | Documentary lineage italy-prompt-at; no production lineage written. |
| result_row | release_id | data/results.jsonl.gz | Documentary snapshot IT-2026-09-23; not a production release. |
| result_row | raw_json | data/results.jsonl.gz | Retain the original source observation and its locator; preserve unsupported values as null. |
| party_mapping | country_id | docs/phase1/italy/identity-rules.md | Documentary ISO code IT; production surrogate remains unresolved. |
| party_mapping | party_namespace | docs/phase1/italy/identity-rules.md | Source and election scoped; never equate a local list number with a national party ID. |
| party_mapping | mapping_id | docs/phase1/italy/identity-rules.md | Null: no synthetic harmonized party mapping. |
| party_mapping | source_context | docs/phase1/italy/identity-rules.md | Exact source_id, reporting unit and source row. |
| party_mapping | election_context | docs/phase1/italy/identity-rules.md | Exact event_id, source cycle and ballot/reporting scope. |
| party_mapping | original_label | docs/phase1/italy/identity-rules.md | Unmodified published label or source token. |
| party_mapping | original_code | docs/phase1/italy/identity-rules.md | Explicit upstream code; territorial recoding is not a merger. |
| party_mapping | mapped_group | docs/phase1/italy/identity-rules.md | Null: no guessed party grouping. |
| party_mapping | uncertainty | docs/phase1/italy/identity-rules.md | Explicit ambiguity or unprocessed mapping; not a probability invented by this pack. |
| party_mapping | lineage_id | docs/phase1/italy/identity-rules.md | Documentary lineage italy-prompt-at; no production lineage written. |
| party_mapping | release_id | docs/phase1/italy/identity-rules.md | Documentary snapshot IT-2026-09-23; not a production release. |
| party_mapping | raw_json | docs/phase1/italy/identity-rules.md | Retain the original source observation and its locator; preserve unsupported values as null. |
| source | country_id | data/source-inventory.json | Documentary ISO code IT; production surrogate remains unresolved. |
| source | source_namespace | data/source-inventory.json | IT-S retained-source namespace. |
| source | source_id | data/source-inventory.json | IT-S-<retained filename>; unique within the source inventory. |
| source | publisher | data/source-inventory.json | Original public authority host or explicitly authority-linked publisher; viewer URL lineage retained. |
| source | title | data/source-inventory.json | Retained document title/filename; extension errors are flagged. |
| source | url | data/source-inventory.json | Exact public URL recorded at collection; no invented locator. |
| source | checked_as_of_label | data/source-inventory.json | 2026-09-23 collection/research reference date. |
| source | evidence_grade | data/source-inventory.json | Inventory grade distinguishes exact official bytes, archive table, search extract and shell. |
| source | file_sha256 | data/source-inventory.json | Exact source byte SHA-256 in source inventory. |
| source | locator | data/source-inventory.json | input_path plus source_row/page/JSON pointer or archive object ID. |
| source | data_rights | data/source-inventory.json | Publisher rights retained; no new licence claimed. |
| source | lineage_id | data/source-inventory.json | Documentary lineage italy-prompt-at; no production lineage written. |
| source | release_id | data/source-inventory.json | Documentary snapshot IT-2026-09-23; not a production release. |
| source | raw_json | data/source-inventory.json | Retain the original source observation and its locator; preserve unsupported values as null. |
| record_locator | record_key | data/results.jsonl.gz | Entity type plus documentary ID; not a target database row ID. |
| record_locator | entity_kind | data/results.jsonl.gz | Office, territorial unit, event, reporting unit or result observation; no party organizations as offices. |
| record_locator | country_id | data/results.jsonl.gz | Documentary ISO code IT; production surrogate remains unresolved. |
| record_locator | geography_id | data/results.jsonl.gz | Documentary ISTAT geography identity qualified by level and vintage; reporting units use separate IDs. |
| record_locator | id_namespace | data/results.jsonl.gz | Research namespace IT; namespaces retain body and electoral vintage. |
| record_locator | office_id | data/results.jsonl.gz | data/office-register.jsonl office_id; one statutory body or executive per identity. |
| record_locator | history_key | data/results.jsonl.gz | Documentary office + source cycle + variant; cycle_label alone is not globally unique. |
| record_locator | proceeding_id | data/results.jsonl.gz | Documentary event variant would identify a round/ballot; no production proceeding row created. |
| record_locator | result_row_id | data/results.jsonl.gz | data/results.jsonl.gz result_id. Sequential ID is pack-local, not a permanent production identity. |
| record_locator | party_namespace | data/results.jsonl.gz | Source and election scoped; never equate a local list number with a national party ID. |
| record_locator | party_mapping_id | data/results.jsonl.gz | Null: no cross-cycle party harmonization is asserted. |
| record_locator | source_namespace | data/results.jsonl.gz | IT-S retained-source namespace. |
| record_locator | source_id | data/results.jsonl.gz | IT-S-<retained filename>; unique within the source inventory. |
| record_locator | input_path | data/results.jsonl.gz | Relative sources/ path from data/source-inventory.json. |
| record_locator | lineage_id | data/results.jsonl.gz | Documentary lineage italy-prompt-at; no production lineage written. |
| record_locator | release_id | data/results.jsonl.gz | Documentary snapshot IT-2026-09-23; not a production release. |
| record_locator | source_row_locator | data/results.jsonl.gz | CSV header-aware row number, JSON pointer, table row or PDF page/row as stored. |
| evidence_link | evidence_id | data/source-inventory.json | Documentary record/source/locator combination; no production evidence ID materialized. |
| evidence_link | record_key | data/source-inventory.json | Entity type plus documentary ID; not a target database row ID. |
| evidence_link | source_country_id | data/source-inventory.json | IT for these Italian source claims; EP institutional publisher remains identified. |
| evidence_link | source_namespace | data/source-inventory.json | IT-S retained-source namespace. |
| evidence_link | source_id | data/source-inventory.json | IT-S-<retained filename>; unique within the source inventory. |
| evidence_link | source_locator | data/source-inventory.json | Preserve original source_row or page/table locator and raw text where supplied. |
| evidence_link | claim_kind | data/source-inventory.json | Existence, selection mode, date, observed votes/seats, territorial relation or unresolved source conflict. |
| evidence_link | date_claim_id | data/source-inventory.json | Null unless an explicit documentary date claim is materialized; no target ID invented. |
| evidence_link | claim_json | data/source-inventory.json | Exact claim observation and limitations, with source_id and locator. |
| evidence_link | lineage_id | data/source-inventory.json | Documentary lineage italy-prompt-at; no production lineage written. |
| evidence_link | release_id | data/source-inventory.json | Documentary snapshot IT-2026-09-23; not a production release. |
| unresolved_evidence | unresolved_id | data/research-gaps.json | data/research-gaps.json gap_id or explicit extraction/audit record identifier. |
| unresolved_evidence | record_key | data/research-gaps.json | Entity type plus documentary ID; not a target database row ID. |
| unresolved_evidence | original_token | data/research-gaps.json | Unresolved original source literal, retained without substitution. |
| unresolved_evidence | source_locator | data/research-gaps.json | Preserve original source_row or page/table locator and raw text where supplied. |
| unresolved_evidence | reason | data/research-gaps.json | Named gap, missing attachment, ambiguous layout or arithmetic discrepancy; missing is not zero. |
| unresolved_evidence | lineage_id | data/research-gaps.json | Documentary lineage italy-prompt-at; no production lineage written. |
| unresolved_evidence | release_id | data/research-gaps.json | Documentary snapshot IT-2026-09-23; not a production release. |
| unresolved_evidence | raw_json | data/research-gaps.json | Retain the original source observation and its locator; preserve unsupported values as null. |
| identity_crosswalk | entity_kind | data/successor-crosswalk.jsonl | Office, territorial unit, event, reporting unit or result observation; no party organizations as offices. |
| identity_crosswalk | upstream_namespace | data/successor-crosswalk.jsonl | ISTAT SITUAS territory vintage, specific electoral publisher or source-specific list namespace. |
| identity_crosswalk | upstream_id | data/successor-crosswalk.jsonl | Only explicit original territory/list/document ID; no guessed successor identity. |
| identity_crosswalk | record_key | data/successor-crosswalk.jsonl | Entity type plus documentary ID; not a target database row ID. |
| identity_crosswalk | reason | data/successor-crosswalk.jsonl | Named gap, missing attachment, ambiguous layout or arithmetic discrepancy; missing is not zero. |
| identity_crosswalk | lineage_id | data/successor-crosswalk.jsonl | Documentary lineage italy-prompt-at; no production lineage written. |
| identity_crosswalk | release_id | data/successor-crosswalk.jsonl | Documentary snapshot IT-2026-09-23; not a production release. |
| identity_crosswalk | raw_json | data/successor-crosswalk.jsonl | Retain the original source observation and its locator; preserve unsupported values as null. |
| publication_release | lineage_id | data/approval-state.json | Documentary lineage italy-prompt-at; no production lineage written. |
| publication_release | release_id | data/approval-state.json | Documentary snapshot IT-2026-09-23; not a production release. |
| publication_receipt | singleton | data/approval-state.json | Not applicable: no publication receipt exists. |
| publication_receipt | last_publish_attempt_id | data/approval-state.json | Null: no publication or importer attempt occurred. |
| publication_receipt | attempted_lineage_id | data/approval-state.json | Null: no publication attempt occurred. |
| publication_receipt | attempted_release_id | data/approval-state.json | Null: no publication attempt occurred. |
| ingest_attempt | attempt_id | data/approval-state.json | Null: no production ingest was attempted. |
| ingest_attempt | lineage_id | data/approval-state.json | Documentary lineage italy-prompt-at; no production lineage written. |
| ingest_attempt | operator | data/approval-state.json | Not applicable to a production ingest; this is a research artifact. |
| ingest_attempt | script_version | data/approval-state.json | No importer version; only standalone documentary validator supplied. |
| ingest_attempt | started_at | data/approval-state.json | Null for production ingest; no start time invented. |
| ingest_attempt | finished_at | data/approval-state.json | Null for production ingest; no finish time invented. |
| ingest_attempt | status | data/approval-state.json | Not run for production ingest; documentary validation status is separate. |
| ingest_attempt | input_inventory_json | data/approval-state.json | data/source-inventory.json documents retained evidence, not an ingest transaction. |
| ingest_attempt | successful_release_id | data/approval-state.json | Null: no release applied or published. |
| ingest_attempt | publication_set_json | data/approval-state.json | Empty/not applicable: applied_changes=0. |
| ingest_attempt | row_counts_json | data/approval-state.json | data/counts.json counts documentary rows only, not inserted database rows. |
| ingest_attempt | error_text | data/approval-state.json | No production attempt; extraction issues and named research gaps are separate artifacts. |
