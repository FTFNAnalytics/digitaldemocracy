# 223-column inherited Atlas field map

This is the exact inherited 20-table /223-field name contract, SHA-256 `8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae`. It is a documentary mapping, not an importer and not a claim that each research JSONL file has 223 columns. Operational publication/ingest tables have no fabricated rows. No target writes are permitted.

|#|Table|Column|Research file|Mapping / hold|Disposition|
|---|---|---|---|---|---|
|1|`country`|`country_id`|manifest.json|constant: uruguay|DOCUMENTATION_ONLY|
|2|`country`|`country_code`|manifest.json|constant: UY|DOCUMENTATION_ONLY|
|3|`country`|`name`|manifest.json|country_scope|DOCUMENTATION_ONLY|
|4|`country`|`polity_kind`|manifest.json|constitutional elected institutions within BF scope|DOCUMENTATION_ONLY|
|5|`country`|`region_id`|manifest.json|null; geographic grouping not asserted|DOCUMENTATION_ONLY|
|6|`country`|`coverage_status`|manifest.json|coverage_status|DOCUMENTATION_ONLY|
|7|`country`|`screening_as_of_label`|manifest.json|as_of_utc|DOCUMENTATION_ONLY|
|8|`country`|`notes`|manifest.json|description|DOCUMENTATION_ONLY|
|9|`country`|`lineage_id`|manifest.json|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|10|`country`|`release_id`|manifest.json|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|11|`country`|`raw_json`|manifest.json|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|12|`dataset_lineage`|`lineage_id`|manifest.json|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|13|`dataset_lineage`|`provenance_kind`|manifest.json|constant: public_source_documentary_research|DOCUMENTATION_ONLY|
|14|`dataset_lineage`|`description`|manifest.json|manifest.description|DOCUMENTATION_ONLY|
|15|`dataset_release`|`lineage_id`|manifest.json|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|16|`dataset_release`|`release_id`|manifest.json|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|17|`dataset_release`|`fingerprint_sha256`|manifest.json|SHA 256 SUMS file digest; package ZIP SHA is supplied separately|DOCUMENTATION_ONLY|
|18|`dataset_release`|`hash_inputs_json`|manifest.json|SHA 256 SUMS entries; no circular self-hash|DOCUMENTATION_ONLY|
|19|`dataset_release`|`adapter_version`|manifest.json|null; no importer|DOCUMENTATION_ONLY|
|20|`dataset_release`|`method_version`|manifest.json|constant: UY-BF-documentary-v1|DOCUMENTATION_ONLY|
|21|`dataset_release`|`schema_version`|manifest.json|contracts/inheritance.json inherited_sha 256|DOCUMENTATION_ONLY|
|22|`dataset_release`|`research_snapshot_label`|manifest.json|as_of_utc|DOCUMENTATION_ONLY|
|23|`dataset_release`|`upstream_release_id`|manifest.json|null; multiple sources, not one asserted release|DOCUMENTATION_ONLY|
|24|`dataset_release`|`validated_counts_json`|manifest.json|counts.json|DOCUMENTATION_ONLY|
|25|`dataset_release`|`research_coverage_complete`|manifest.json|false: current register complete, historic numerics incomplete|DOCUMENTATION_ONLY|
|26|`dataset_release`|`raw_json`|manifest.json|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|27|`election_event`|`id_namespace`|data/events.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|28|`election_event`|`office_id`|data/events.jsonl|office_id|DOCUMENTATION_ONLY|
|29|`election_event`|`history_key`|data/events.jsonl|office_id + event_id documentary composite, never guessed cross-era identity|DOCUMENTATION_ONLY|
|30|`election_event`|`event_id`|data/events.jsonl|event_id|DOCUMENTATION_ONLY|
|31|`election_event`|`date_id`|data/events.jsonl|event_date -> UY-DATE-{event_date}|DOCUMENTATION_ONLY|
|32|`election_event`|`date_resolution`|data/events.jsonl|constant: day|DOCUMENTATION_ONLY|
|33|`election_event`|`event_kind`|data/events.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|34|`election_event`|`selected_history_role`|data/events.jsonl|event_kind and shared_ballot_event_id|DOCUMENTATION_ONLY|
|35|`election_event`|`electoral_system`|data/events.jsonl|electoral_system / vote_basis; null if not transcribed|DOCUMENTATION_ONLY|
|36|`election_event`|`comparability`|data/events.jsonl|vote_basis + era gate + shared ballot group|DOCUMENTATION_ONLY|
|37|`election_event`|`ballot_basis`|data/events.jsonl|vote_basis|DOCUMENTATION_ONLY|
|38|`election_event`|`share_unit`|data/events.jsonl|percent only if actually transcribed; all shares here null|DOCUMENTATION_ONLY|
|39|`election_event`|`legal_outcome`|data/events.jsonl|event_status, not automatic certification|DOCUMENTATION_ONLY|
|40|`election_event`|`record_state`|data/events.jsonl|constant: draft_unapproved|DOCUMENTATION_ONLY|
|41|`election_event`|`state_note`|data/events.jsonl|result_coverage / certification_status|DOCUMENTATION_ONLY|
|42|`election_event`|`lineage_id`|data/events.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|43|`election_event`|`release_id`|data/events.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|44|`election_event`|`raw_json`|data/events.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|45|`evidence_link`|`evidence_id`|data/evidence-links.jsonl|evidence_id|DOCUMENTATION_ONLY|
|46|`evidence_link`|`record_key`|data/evidence-links.jsonl|record_key|DOCUMENTATION_ONLY|
|47|`evidence_link`|`source_country_id`|data/evidence-links.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|48|`evidence_link`|`source_namespace`|data/evidence-links.jsonl|constant: uruguay_BF_research|DOCUMENTATION_ONLY|
|49|`evidence_link`|`source_id`|data/evidence-links.jsonl|source_id|DOCUMENTATION_ONLY|
|50|`evidence_link`|`source_locator`|data/evidence-links.jsonl|source_locator|DOCUMENTATION_ONLY|
|51|`evidence_link`|`claim_kind`|data/evidence-links.jsonl|claim_kind|DOCUMENTATION_ONLY|
|52|`evidence_link`|`date_claim_id`|data/evidence-links.jsonl|null; source record identifies date, no invented standalone claim ID|DOCUMENTATION_ONLY|
|53|`evidence_link`|`claim_json`|data/evidence-links.jsonl|entire evidence record|DOCUMENTATION_ONLY|
|54|`evidence_link`|`lineage_id`|data/evidence-links.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|55|`evidence_link`|`release_id`|data/evidence-links.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|56|`geography`|`country_id`|data/geography.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|57|`geography`|`geography_id`|data/geography.jsonl|geography_id|DOCUMENTATION_ONLY|
|58|`geography`|`name`|data/geography.jsonl|name|DOCUMENTATION_ONLY|
|59|`geography`|`parent_geography_id`|data/geography.jsonl|parent_geography_id|DOCUMENTATION_ONLY|
|60|`geography`|`effective_from_label`|data/geography.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|61|`geography`|`effective_to_label`|data/geography.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|62|`geography`|`lineage_id`|data/geography.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|63|`geography`|`release_id`|data/geography.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|64|`geography`|`raw_json`|data/geography.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|65|`identity_crosswalk`|`entity_kind`|data/identity-crosswalk.jsonl|entity_kind|DOCUMENTATION_ONLY|
|66|`identity_crosswalk`|`upstream_namespace`|data/identity-crosswalk.jsonl|upstream_namespace|DOCUMENTATION_ONLY|
|67|`identity_crosswalk`|`upstream_id`|data/identity-crosswalk.jsonl|upstream_id|DOCUMENTATION_ONLY|
|68|`identity_crosswalk`|`record_key`|data/identity-crosswalk.jsonl|record_key|DOCUMENTATION_ONLY|
|69|`identity_crosswalk`|`reason`|data/identity-crosswalk.jsonl|reason|DOCUMENTATION_ONLY|
|70|`identity_crosswalk`|`lineage_id`|data/identity-crosswalk.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|71|`identity_crosswalk`|`release_id`|data/identity-crosswalk.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|72|`identity_crosswalk`|`raw_json`|data/identity-crosswalk.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|73|`ingest_attempt`|`attempt_id`|—|No operation|NO_OPERATION_NO_ROW|
|74|`ingest_attempt`|`lineage_id`|—|No operation|NO_OPERATION_NO_ROW|
|75|`ingest_attempt`|`operator`|—|No operation|NO_OPERATION_NO_ROW|
|76|`ingest_attempt`|`script_version`|—|No operation|NO_OPERATION_NO_ROW|
|77|`ingest_attempt`|`started_at`|—|No operation|NO_OPERATION_NO_ROW|
|78|`ingest_attempt`|`finished_at`|—|No operation|NO_OPERATION_NO_ROW|
|79|`ingest_attempt`|`status`|—|No operation|NO_OPERATION_NO_ROW|
|80|`ingest_attempt`|`input_inventory_json`|—|No operation|NO_OPERATION_NO_ROW|
|81|`ingest_attempt`|`successful_release_id`|—|No operation|NO_OPERATION_NO_ROW|
|82|`ingest_attempt`|`publication_set_json`|—|No operation|NO_OPERATION_NO_ROW|
|83|`ingest_attempt`|`row_counts_json`|—|No operation|NO_OPERATION_NO_ROW|
|84|`ingest_attempt`|`error_text`|—|No operation|NO_OPERATION_NO_ROW|
|85|`office`|`id_namespace`|data/office-register.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|86|`office`|`office_id`|data/office-register.jsonl|office_id|DOCUMENTATION_ONLY|
|87|`office`|`country_id`|data/office-register.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|88|`office`|`geography_id`|data/office-register.jsonl|geography_id|DOCUMENTATION_ONLY|
|89|`office`|`name`|data/office-register.jsonl|name_local|DOCUMENTATION_ONLY|
|90|`office`|`office_type`|data/office-register.jsonl|office_kind|DOCUMENTATION_ONLY|
|91|`office`|`office_status`|data/office-register.jsonl|office_status|DOCUMENTATION_ONLY|
|92|`office`|`record_state`|data/office-register.jsonl|constant: draft_unapproved|DOCUMENTATION_ONLY|
|93|`office`|`state_note`|data/office-register.jsonl|selection_note / era_gate / seat_count_note|DOCUMENTATION_ONLY|
|94|`office`|`registry_qualified`|data/office-register.jsonl|current_register_complete_for_BF_enumerated_scope; historical_only separately tagged|DOCUMENTATION_ONLY|
|95|`office`|`next_date_id`|data/office-register.jsonl|next_calendar_ids[0] -> research-dates.date_id; all options in raw_json|DOCUMENTATION_ONLY|
|96|`office`|`next_date_resolution`|data/office-register.jsonl|constant: formula_and_year; null for historical_only|DOCUMENTATION_ONLY|
|97|`office`|`next_history_key`|data/office-register.jsonl|null; no future held event invented|DOCUMENTATION_ONLY|
|98|`office`|`lineage_id`|data/office-register.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|99|`office`|`release_id`|data/office-register.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|100|`office`|`raw_json`|data/office-register.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|101|`office_tier_classification`|`id_namespace`|data/draft-tiers.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|102|`office_tier_classification`|`office_id`|data/draft-tiers.jsonl|office_id|DOCUMENTATION_ONLY|
|103|`office_tier_classification`|`tier`|data/draft-tiers.jsonl|draft_tier|DOCUMENTATION_ONLY|
|104|`office_tier_classification`|`review_status`|data/draft-tiers.jsonl|status|DOCUMENTATION_ONLY|
|105|`office_tier_classification`|`rationale`|data/draft-tiers.jsonl|basis|DOCUMENTATION_ONLY|
|106|`office_tier_classification`|`lineage_id`|data/draft-tiers.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|107|`office_tier_classification`|`release_id`|data/draft-tiers.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|108|`office_tier_classification`|`classification_path`|data/draft-tiers.jsonl|data/draft-tiers.jsonl|DOCUMENTATION_ONLY|
|109|`office_tier_classification`|`classification_kind`|data/draft-tiers.jsonl|constant: draft_institutional_level|DOCUMENTATION_ONLY|
|110|`office_tier_classification`|`classification_sha256`|data/draft-tiers.jsonl|SHA 256 SUMS entry for data/draft-tiers.jsonl|DOCUMENTATION_ONLY|
|111|`office_tier_classification`|`raw_json`|data/draft-tiers.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|112|`party_mapping`|`country_id`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|113|`party_mapping`|`party_namespace`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|114|`party_mapping`|`mapping_id`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|115|`party_mapping`|`source_context`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|116|`party_mapping`|`election_context`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|117|`party_mapping`|`original_label`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|118|`party_mapping`|`original_code`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|119|`party_mapping`|`mapped_group`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|120|`party_mapping`|`uncertainty`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|121|`party_mapping`|`lineage_id`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|122|`party_mapping`|`release_id`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|123|`party_mapping`|`raw_json`|—|null; source-local party labels retained in results, no harmonized mapping asserted|HELD_NO_SYNTHETIC_ROW|
|124|`proceeding`|`id_namespace`|data/proceedings.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|125|`proceeding`|`office_id`|data/proceedings.jsonl|office_id|DOCUMENTATION_ONLY|
|126|`proceeding`|`history_key`|data/proceedings.jsonl|office_id + event_id documentary composite, never guessed cross-era identity|DOCUMENTATION_ONLY|
|127|`proceeding`|`proceeding_id`|data/proceedings.jsonl|proceeding_id|DOCUMENTATION_ONLY|
|128|`proceeding`|`kind`|data/proceedings.jsonl|kind|DOCUMENTATION_ONLY|
|129|`proceeding`|`sequence_no`|data/proceedings.jsonl|null; no fabricated proceeding sequence|DOCUMENTATION_ONLY|
|130|`proceeding`|`supersedes_id`|data/proceedings.jsonl|null; no successor/supersession inference|DOCUMENTATION_ONLY|
|131|`proceeding`|`legal_outcome`|data/proceedings.jsonl|tie_break_draw, not a new poll|DOCUMENTATION_ONLY|
|132|`proceeding`|`lineage_id`|data/proceedings.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|133|`proceeding`|`release_id`|data/proceedings.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|134|`proceeding`|`raw_json`|data/proceedings.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|135|`publication_receipt`|`singleton`|—|No operation|NO_OPERATION_NO_ROW|
|136|`publication_receipt`|`last_publish_attempt_id`|—|No operation|NO_OPERATION_NO_ROW|
|137|`publication_receipt`|`attempted_lineage_id`|—|No operation|NO_OPERATION_NO_ROW|
|138|`publication_receipt`|`attempted_release_id`|—|No operation|NO_OPERATION_NO_ROW|
|139|`publication_release`|`lineage_id`|—|No operation|NO_OPERATION_NO_ROW|
|140|`publication_release`|`release_id`|—|No operation|NO_OPERATION_NO_ROW|
|141|`record_locator`|`record_key`|data/evidence-links.jsonl|record_key|DOCUMENTATION_ONLY|
|142|`record_locator`|`entity_kind`|data/evidence-links.jsonl|claim_kind -> office/event/result documentary entity|DOCUMENTATION_ONLY|
|143|`record_locator`|`country_id`|data/evidence-links.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|144|`record_locator`|`geography_id`|data/evidence-links.jsonl|geography_id|DOCUMENTATION_ONLY|
|145|`record_locator`|`id_namespace`|data/evidence-links.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|146|`record_locator`|`office_id`|data/evidence-links.jsonl|office_id|DOCUMENTATION_ONLY|
|147|`record_locator`|`history_key`|data/evidence-links.jsonl|office_id + event_id documentary composite, never guessed cross-era identity|DOCUMENTATION_ONLY|
|148|`record_locator`|`proceeding_id`|data/evidence-links.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|149|`record_locator`|`result_row_id`|data/evidence-links.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|150|`record_locator`|`party_namespace`|data/evidence-links.jsonl|source-local lema context; no international party group map|DOCUMENTATION_ONLY|
|151|`record_locator`|`party_mapping_id`|data/evidence-links.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|152|`record_locator`|`source_namespace`|data/evidence-links.jsonl|constant: uruguay_BF_research|DOCUMENTATION_ONLY|
|153|`record_locator`|`source_id`|data/evidence-links.jsonl|source_id|DOCUMENTATION_ONLY|
|154|`record_locator`|`input_path`|data/evidence-links.jsonl|source_id -> source inventory artifact_path|DOCUMENTATION_ONLY|
|155|`record_locator`|`lineage_id`|data/evidence-links.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|156|`record_locator`|`release_id`|data/evidence-links.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|157|`record_locator`|`source_row_locator`|data/evidence-links.jsonl|source_locator|DOCUMENTATION_ONLY|
|158|`research_date`|`date_id`|data/research-dates.jsonl|date_id|DOCUMENTATION_ONLY|
|159|`research_date`|`label`|data/research-dates.jsonl|label|DOCUMENTATION_ONLY|
|160|`research_date`|`precision`|data/research-dates.jsonl|precision|DOCUMENTATION_ONLY|
|161|`research_date`|`certainty`|data/research-dates.jsonl|certainty|DOCUMENTATION_ONLY|
|162|`research_date`|`year`|data/research-dates.jsonl|year|DOCUMENTATION_ONLY|
|163|`research_date`|`month`|data/research-dates.jsonl|month|DOCUMENTATION_ONLY|
|164|`research_date`|`day`|data/research-dates.jsonl|day|DOCUMENTATION_ONLY|
|165|`research_date`|`range_start_id`|data/research-dates.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|166|`research_date`|`range_end_id`|data/research-dates.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|167|`research_date`|`lineage_id`|data/research-dates.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|168|`research_date`|`release_id`|data/research-dates.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|169|`research_date`|`raw_json`|data/research-dates.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|170|`result_row`|`id_namespace`|data/results.jsonl|constant: UY-BF-research|DOCUMENTATION_ONLY|
|171|`result_row`|`office_id`|data/results.jsonl|office_id|DOCUMENTATION_ONLY|
|172|`result_row`|`history_key`|data/results.jsonl|office_id + event_id documentary composite, never guessed cross-era identity|DOCUMENTATION_ONLY|
|173|`result_row`|`result_row_id`|data/results.jsonl|result_id|DOCUMENTATION_ONLY|
|174|`result_row`|`proceeding_id`|data/results.jsonl|null; not supplied or not applicable|DOCUMENTATION_ONLY|
|175|`result_row`|`country_id`|data/results.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|176|`result_row`|`candidate_or_list_label`|data/results.jsonl|contestant_name|DOCUMENTATION_ONLY|
|177|`result_row`|`original_party_label`|data/results.jsonl|original_party_label or source-local party-lema label; no cross-era merge|DOCUMENTATION_ONLY|
|178|`result_row`|`original_party_code`|data/results.jsonl|null; not normalized|DOCUMENTATION_ONLY|
|179|`result_row`|`party_namespace`|data/results.jsonl|source-local lema context; no international party group map|DOCUMENTATION_ONLY|
|180|`result_row`|`party_mapping_id`|data/results.jsonl|null; no asserted durable party identity|DOCUMENTATION_ONLY|
|181|`result_row`|`votes`|data/results.jsonl|votes|DOCUMENTATION_ONLY|
|182|`result_row`|`votes_status`|data/results.jsonl|votes_status|DOCUMENTATION_ONLY|
|183|`result_row`|`share`|data/results.jsonl|vote_share_percent (null)|DOCUMENTATION_ONLY|
|184|`result_row`|`share_status`|data/results.jsonl|share_status|DOCUMENTATION_ONLY|
|185|`result_row`|`share_unit`|data/results.jsonl|percent only if actually transcribed; all shares here null|DOCUMENTATION_ONLY|
|186|`result_row`|`seats`|data/results.jsonl|seats|DOCUMENTATION_ONLY|
|187|`result_row`|`seats_status`|data/results.jsonl|seats_status|DOCUMENTATION_ONLY|
|188|`result_row`|`elected_flag`|data/results.jsonl|elected_flag; only explicit winner/proclaimed identity|DOCUMENTATION_ONLY|
|189|`result_row`|`is_substitute`|data/results.jsonl|null; substitute candidate vectors not imported|DOCUMENTATION_ONLY|
|190|`result_row`|`evidence_status`|data/results.jsonl|certification_status|DOCUMENTATION_ONLY|
|191|`result_row`|`lineage_id`|data/results.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|192|`result_row`|`release_id`|data/results.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|193|`result_row`|`raw_json`|data/results.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|194|`retained_input`|`lineage_id`|sources/source-inventory.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|195|`retained_input`|`release_id`|sources/source-inventory.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|196|`retained_input`|`input_path`|sources/source-inventory.jsonl|artifact_path|DOCUMENTATION_ONLY|
|197|`retained_input`|`input_kind`|sources/source-inventory.jsonl|artifact_kind|DOCUMENTATION_ONLY|
|198|`retained_input`|`sha256`|sources/source-inventory.jsonl|sha 256|DOCUMENTATION_ONLY|
|199|`retained_input`|`byte_count`|sources/source-inventory.jsonl|bytes|DOCUMENTATION_ONLY|
|200|`retained_input`|`recovery_locator`|sources/source-inventory.jsonl|url|DOCUMENTATION_ONLY|
|201|`retained_input`|`payload_json`|sources/source-inventory.jsonl|entire source inventory record|DOCUMENTATION_ONLY|
|202|`source`|`country_id`|sources/source-inventory.jsonl|constant: uruguay|DOCUMENTATION_ONLY|
|203|`source`|`source_namespace`|sources/source-inventory.jsonl|constant: uruguay_BF_research|DOCUMENTATION_ONLY|
|204|`source`|`source_id`|sources/source-inventory.jsonl|source_id|DOCUMENTATION_ONLY|
|205|`source`|`publisher`|sources/source-inventory.jsonl|publisher|DOCUMENTATION_ONLY|
|206|`source`|`title`|sources/source-inventory.jsonl|title|DOCUMENTATION_ONLY|
|207|`source`|`url`|sources/source-inventory.jsonl|url|DOCUMENTATION_ONLY|
|208|`source`|`checked_as_of_label`|sources/source-inventory.jsonl|retrieved_utc|DOCUMENTATION_ONLY|
|209|`source`|`evidence_grade`|sources/source-inventory.jsonl|artifact_kind + record-specific certification status|DOCUMENTATION_ONLY|
|210|`source`|`file_sha256`|sources/source-inventory.jsonl|sha 256|DOCUMENTATION_ONLY|
|211|`source`|`locator`|sources/source-inventory.jsonl|artifact_path|DOCUMENTATION_ONLY|
|212|`source`|`data_rights`|sources/source-inventory.jsonl|license|DOCUMENTATION_ONLY|
|213|`source`|`lineage_id`|sources/source-inventory.jsonl|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|214|`source`|`release_id`|sources/source-inventory.jsonl|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|215|`source`|`raw_json`|sources/source-inventory.jsonl|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
|216|`unresolved_evidence`|`unresolved_id`|research-gaps.json|gap_id|DOCUMENTATION_ONLY|
|217|`unresolved_evidence`|`record_key`|research-gaps.json|gap-specific scope / referenced rows|DOCUMENTATION_ONLY|
|218|`unresolved_evidence`|`original_token`|research-gaps.json|detail; source raw label retained where relevant|DOCUMENTATION_ONLY|
|219|`unresolved_evidence`|`source_locator`|research-gaps.json|source_ids + linked gap detail|DOCUMENTATION_ONLY|
|220|`unresolved_evidence`|`reason`|research-gaps.json|required_research_or_rule|DOCUMENTATION_ONLY|
|221|`unresolved_evidence`|`lineage_id`|research-gaps.json|constant: UY-PROMPT-BF-RESEARCH|DOCUMENTATION_ONLY|
|222|`unresolved_evidence`|`release_id`|research-gaps.json|constant: UY-BF-2026-09-29-DRAFT|DOCUMENTATION_ONLY|
|223|`unresolved_evidence`|`raw_json`|research-gaps.json|entire documentary source row, preserving nulls, aliases, modes, ballot links and evidence status|DOCUMENTATION_ONLY|
