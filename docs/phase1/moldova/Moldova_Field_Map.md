# 223-column field map

This is a documentation map against the inherited contract. No importer, SQL, migrations, operational records or publication writes are supplied. Every column appears exactly once.

| Table.column | Research source / treatment |
|---|---|
| `country.country_id` | Literal moldova, research scope only. |
| `country.country_code` | Literal MD, Republic of Moldova. |
| `country.name` | Republic of Moldova. |
| `country.polity_kind` | Republic, as named by Constitution; no competing state identity. |
| `country.region_id` | NULL: no target region mapping supplied. |
| `country.coverage_status` | Current elected register reconciled; historical and numeric coverage partial. |
| `country.screening_as_of_label` | 2026-09-28. |
| `country.notes` | metadata.scope_gate and Moldova_Research_Gaps.md. |
| `country.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `country.release_id` | NULL: no operational release exists. |
| `country.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `dataset_lineage.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `dataset_lineage.provenance_kind` | Primary records with labelled secondary factual transcriptions and inherited reference crosswalk. |
| `dataset_lineage.description` | Prompt BC Moldova research documentation only. |
| `dataset_release.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `dataset_release.release_id` | NULL: no operational release exists. |
| `dataset_release.fingerprint_sha256` | External final ZIP SHA supplied separately; no operational release fingerprint. |
| `dataset_release.hash_inputs_json` | SHA256SUMS and source-inventory; distinguish original bytes, extracts and retrieval receipts. |
| `dataset_release.adapter_version` | NULL: no adapter/importer created. |
| `dataset_release.method_version` | md-bc-research-v1 (documentation label). |
| `dataset_release.schema_version` | Inherited 20-table / 223-column reference contract; not a database migration. |
| `dataset_release.research_snapshot_label` | 2026-09-28. |
| `dataset_release.upstream_release_id` | NULL: prior workbook is a retained reference, not a release. |
| `dataset_release.validated_counts_json` | metadata.counts and validation-report.json. |
| `dataset_release.research_coverage_complete` | false: full certified history is not established. |
| `dataset_release.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `election_event.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `election_event.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `election_event.history_key` | events.history_key joined by event_id. |
| `election_event.event_id` | events.event_id, a research key. |
| `election_event.date_id` | NULL operational ID; research date text lives in events.date / cycle_year / source_as_of. |
| `election_event.date_resolution` | events.date_resolution; day or cycle_only. Never use source capture date as election date. |
| `election_event.event_kind` | events.event_kind; polls, constituency polls, rosters, seat summaries, snapshots and scheduled events distinguished. |
| `election_event.selected_history_role` | Research evidence only; no automatic latest-three or alert selection. |
| `election_event.electoral_system` | events.ballot_basis and era rules in identity documentation; no universal system backcast. |
| `election_event.comparability` | events.comparability plus coverage qualifiers; roster and ballot figures cannot be pooled. |
| `election_event.ballot_basis` | events.ballot_basis. |
| `election_event.share_unit` | percent only for printed vote shares; no seat-share substitution. |
| `election_event.legal_outcome` | events.legal_outcome; not_transcribed is not certification. |
| `election_event.record_state` | research_draft; never published/approved. |
| `election_event.state_note` | Relevant scope, identity, evidence and legal-status qualifiers in each research object. |
| `election_event.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `election_event.release_id` | NULL: no operational release exists. |
| `election_event.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `evidence_link.evidence_id` | NULL operational ID; links embedded as source_refs arrays. |
| `evidence_link.record_key` | office_id, event_id or result_row_id appropriate to the source-linked object. |
| `evidence_link.source_country_id` | Literal moldova. |
| `evidence_link.source_namespace` | moldova-bc-research-sources (proposed reference label only). |
| `evidence_link.source_id` | sources/source-inventory.jsonl.source_id. |
| `evidence_link.source_locator` | source_refs[].locator; original table indices zero-based, spreadsheet row numbers one-based. |
| `evidence_link.claim_kind` | Identity, date, selection-mode, result, roster-count or legal-status claim as described by the locator. |
| `evidence_link.date_claim_id` | NULL: no date-claim table populated. |
| `evidence_link.claim_json` | Research claim plus source_ref and any conflict/hold qualifier. |
| `evidence_link.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `evidence_link.release_id` | NULL: no operational release exists. |
| `geography.country_id` | Literal moldova, research scope only. |
| `geography.geography_id` | office-register.geography_id -> data/geographies.jsonl.geography_id. |
| `geography.name` | geographies.name; current and explicitly identified pre-2025 versions. |
| `geography.parent_geography_id` | geographies.parent_geography_id; administrative parents are not additional offices. |
| `geography.effective_from_label` | NULL unless source establishes the exact territorial validity date. |
| `geography.effective_to_label` | NULL; Law 145 territorial change is not an inferred mandate end date. |
| `geography.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `geography.release_id` | NULL: no operational release exists. |
| `geography.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `identity_crosswalk.entity_kind` | office; reference crosswalk only. |
| `identity_crosswalk.upstream_namespace` | identity-crosswalk.upstream_namespace. |
| `identity_crosswalk.upstream_id` | identity-crosswalk.upstream_id. |
| `identity_crosswalk.record_key` | office_id, event_id or result_row_id appropriate to the source-linked object. |
| `identity_crosswalk.reason` | identity-crosswalk.relationship and condition; no successor inference. |
| `identity_crosswalk.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `identity_crosswalk.release_id` | NULL: no operational release exists. |
| `identity_crosswalk.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `ingest_attempt.attempt_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.lineage_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.operator` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.script_version` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.started_at` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.finished_at` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.status` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.input_inventory_json` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.successful_release_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.publication_set_json` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.row_counts_json` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `ingest_attempt.error_text` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `office.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `office.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `office.country_id` | Literal moldova, research scope only. |
| `office.geography_id` | office-register.geography_id -> data/geographies.jsonl.geography_id. |
| `office.name` | office-register.name: normalized descriptive label, not a claim that every charter uses the exact wording. |
| `office.office_type` | office-register.office_type. |
| `office.office_status` | current or historical_only. |
| `office.record_state` | research_draft; never published/approved. |
| `office.state_note` | Relevant scope, identity, evidence and legal-status qualifiers in each research object. |
| `office.registry_qualified` | true means supported elected body in this research scope; not publication approval. |
| `office.next_date_id` | NULL operational date ID; only source-confirmed next_election_date supplied. |
| `office.next_date_resolution` | day for eight scheduled offices, otherwise unknown. |
| `office.next_history_key` | Upcoming event history_key where present, otherwise NULL. |
| `office.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `office.release_id` | NULL: no operational release exists. |
| `office.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `office_tier_classification.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `office_tier_classification.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `office_tier_classification.tier` | draft-tiers.draft_tier: national/autonomous/raion/municipal. |
| `office_tier_classification.review_status` | draft_unapproved; justin_approved=false. |
| `office_tier_classification.rationale` | draft-tiers.basis. |
| `office_tier_classification.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `office_tier_classification.release_id` | NULL: no operational release exists. |
| `office_tier_classification.classification_path` | data/draft-tiers.jsonl. |
| `office_tier_classification.classification_kind` | Draft institutional level; no swing/competitiveness inference. |
| `office_tier_classification.classification_sha256` | Actual draft-tiers file SHA from SHA256SUMS. |
| `office_tier_classification.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `party_mapping.country_id` | Literal moldova, research scope only. |
| `party_mapping.party_namespace` | NULL: no Atlas party namespace resolved. |
| `party_mapping.mapping_id` | NULL: no party mapping created. |
| `party_mapping.source_context` | Result source_id and locator. |
| `party_mapping.election_context` | Result event_id and cycle_year. |
| `party_mapping.original_label` | Contextual source party/list/candidate label. |
| `party_mapping.original_code` | Source code only when printed. |
| `party_mapping.mapped_group` | NULL: no harmonization or party-successor link. |
| `party_mapping.uncertainty` | Source pools, independent candidates and duplicate names preserved without invented entity identity. |
| `party_mapping.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `party_mapping.release_id` | NULL: no operational release exists. |
| `party_mapping.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `proceeding.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `proceeding.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `proceeding.history_key` | events.history_key joined by event_id. |
| `proceeding.proceeding_id` | NULL operational proceeding identity; rounds/repeats have separate event IDs. |
| `proceeding.kind` | Round/repeat/annulment qualifier in events; no operational proceeding row. |
| `proceeding.sequence_no` | NULL unless sourced; do not impose an inferred legal sequence. |
| `proceeding.supersedes_id` | NULL: no guessed supersession/successor links. |
| `proceeding.legal_outcome` | events.legal_outcome; not_transcribed is not certification. |
| `proceeding.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `proceeding.release_id` | NULL: no operational release exists. |
| `proceeding.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `publication_receipt.singleton` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `publication_receipt.last_publish_attempt_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `publication_receipt.attempted_lineage_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `publication_receipt.attempted_release_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `publication_release.lineage_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `publication_release.release_id` | NOT POPULATED: research-only pack, applied_changes=0; no ingest, publication receipt or release exists. |
| `record_locator.record_key` | office_id, event_id or result_row_id appropriate to the source-linked object. |
| `record_locator.entity_kind` | Office/event/result/source according to research file. |
| `record_locator.country_id` | Literal moldova, research scope only. |
| `record_locator.geography_id` | office-register.geography_id -> data/geographies.jsonl.geography_id. |
| `record_locator.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `record_locator.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `record_locator.history_key` | events.history_key joined by event_id. |
| `record_locator.proceeding_id` | NULL operational proceeding identity; rounds/repeats have separate event IDs. |
| `record_locator.result_row_id` | results.result_row_id. |
| `record_locator.party_namespace` | NULL: no Atlas party namespace resolved. |
| `record_locator.party_mapping_id` | NULL. |
| `record_locator.source_namespace` | moldova-bc-research-sources (proposed reference label only). |
| `record_locator.source_id` | sources/source-inventory.jsonl.source_id. |
| `record_locator.input_path` | Retained path from source inventory or the normalized research file. |
| `record_locator.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `record_locator.release_id` | NULL: no operational release exists. |
| `record_locator.source_row_locator` | source_refs[].locator, including exact member row list for derived seat counts. |
| `research_date.date_id` | NULL operational ID; research date text lives in events.date / cycle_year / source_as_of. |
| `research_date.label` | ISO date when sourced; cycle year otherwise, with source_as_of separate. |
| `research_date.precision` | day for exact polls; year/cycle for rosters. |
| `research_date.certainty` | Source reported or scheduled; no invented ordinary-cycle dates. |
| `research_date.year` | events.cycle_year; may differ from actual delayed ballot year. |
| `research_date.month` | ISO date month when day known, otherwise NULL. |
| `research_date.day` | ISO date day when known, otherwise NULL. |
| `research_date.range_start_id` | NULL: no operational date range. |
| `research_date.range_end_id` | NULL: no operational date range. |
| `research_date.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `research_date.release_id` | NULL: no operational release exists. |
| `research_date.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `result_row.id_namespace` | office-register.id_namespace: atlas-research-md-bc. |
| `result_row.office_id` | data/office-register.jsonl.office_id; foreign-key references in events/results/tiers. |
| `result_row.history_key` | events.history_key joined by event_id. |
| `result_row.result_row_id` | results.result_row_id; ordinal keeps distinct homonymous candidates separate. |
| `result_row.proceeding_id` | NULL operational proceeding identity; rounds/repeats have separate event IDs. |
| `result_row.country_id` | Literal moldova, research scope only. |
| `result_row.candidate_or_list_label` | results.candidate_or_list_label. |
| `result_row.original_party_label` | results.original_party_label, exactly contextual; source pools remain pools. |
| `result_row.original_party_code` | results.original_party_code when explicitly available, otherwise NULL. |
| `result_row.party_namespace` | NULL: no Atlas party namespace resolved. |
| `result_row.party_mapping_id` | NULL: party identity mappings not approved. |
| `result_row.votes` | results.votes; null is missing, not zero. |
| `result_row.votes_status` | results.votes_status. |
| `result_row.share` | results.share; only source-printed percentage, never silently computed. |
| `result_row.share_status` | results.share_status. |
| `result_row.share_unit` | results.share_unit: percent or null. |
| `result_row.seats` | results.seats; includes explicitly labelled counts of named elected members, never executive winner=1. |
| `result_row.seats_status` | results.seats_status; source_reported / derived_count_of_official_named_members / missing. |
| `result_row.elected_flag` | results.elected_flag only where explicitly established; highest votes alone do not establish a legal mandate. |
| `result_row.is_substitute` | NULL unless source establishes substitution; no substitute flags inferred. |
| `result_row.evidence_status` | results.evidence_status; certified, displayed return, roster, secondary, snapshot remain distinct. |
| `result_row.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `result_row.release_id` | NULL: no operational release exists. |
| `result_row.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `retained_input.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `retained_input.release_id` | NULL: no operational release exists. |
| `retained_input.input_path` | Retained path from source inventory or the normalized research file. |
| `retained_input.input_kind` | Original official record, user reference, factual extract or schema reference as identified in inventory. |
| `retained_input.sha256` | SHA256SUMS value for retained artifact bytes; original-response SHA is separate. |
| `retained_input.byte_count` | Actual file size when retained; unavailable originals remain NULL. |
| `retained_input.recovery_locator` | Source URL or inherited reference location; signed storage URLs are not persisted. |
| `retained_input.payload_json` | Source inventory entry, including original hash and retained artifact path. |
| `source.country_id` | Literal moldova, research scope only. |
| `source.source_namespace` | moldova-bc-research-sources (proposed reference label only). |
| `source.source_id` | sources/source-inventory.jsonl.source_id. |
| `source.publisher` | source-inventory.publisher. |
| `source.title` | source-inventory.title. |
| `source.url` | source-inventory.url; null for user-owned reference. |
| `source.checked_as_of_label` | 2026-09-28. |
| `source.evidence_grade` | source-inventory.evidence_grade. |
| `source.file_sha256` | Original response SHA only when bytes fetched; not the normalized extract hash. |
| `source.locator` | retained_original_path and retained_fact_paths. |
| `source.data_rights` | No license inferred. Facts/statutory material and official records used for research; secondary pages are not republished wholesale. |
| `source.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `source.release_id` | NULL: no operational release exists. |
| `source.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
| `unresolved_evidence.unresolved_id` | MD-BC-G01 onward from research-gaps.json; plus specific evidence/held files. |
| `unresolved_evidence.record_key` | office_id, event_id or result_row_id appropriate to the source-linked object. |
| `unresolved_evidence.original_token` | Original ambiguous or conflicting label/value, e.g. CORNEȘTI or the 2024 runoff alternative totals. |
| `unresolved_evidence.source_locator` | source_refs[].locator; original table indices zero-based, spreadsheet row numbers one-based. |
| `unresolved_evidence.reason` | research-gaps.resolution_needed and documented holding treatment. |
| `unresolved_evidence.lineage_id` | Documentation reference country-package-moldova; no operational lineage row created. |
| `unresolved_evidence.release_id` | NULL: no operational release exists. |
| `unresolved_evidence.raw_json` | Corresponding research object, preserving source_refs, evidence/status qualifiers and explicit nulls. |
