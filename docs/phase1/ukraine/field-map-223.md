# Inherited 223-column field map

20 tables; 223 exact inherited columns. This maps research evidence and explicit holds; it is not an importer, schema migration or populated production database.

| # | Table.column | Disposition | Research mapping | Rule |
|---:|---|---|---|---|
| 1 | `country.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 2 | `country.country_code` | mapped_research_sidecar | manifest.json: UA | Documentation mapping only; no production row generated. |
| 3 | `country.name` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 4 | `country.polity_kind` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 5 | `country.region_id` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 6 | `country.coverage_status` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 7 | `country.screening_as_of_label` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 8 | `country.notes` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 9 | `country.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 10 | `country.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 11 | `country.raw_json` | mapped_research_sidecar | manifest.json: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 12 | `dataset_lineage.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 13 | `dataset_lineage.provenance_kind` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 14 | `dataset_lineage.description` | mapped_research_sidecar | manifest.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 15 | `dataset_release.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 16 | `dataset_release.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 17 | `dataset_release.fingerprint_sha256` | mapped_research_sidecar | SHA256SUMS: Per-file SHA-256; external ZIP hash | No recursive self-hash or invented production release fingerprint. |
| 18 | `dataset_release.hash_inputs_json` | mapped_research_sidecar | SHA256SUMS: Per-file SHA-256; external ZIP hash | No recursive self-hash or invented production release fingerprint. |
| 19 | `dataset_release.adapter_version` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 20 | `dataset_release.method_version` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 21 | `dataset_release.schema_version` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 22 | `dataset_release.research_snapshot_label` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 23 | `dataset_release.upstream_release_id` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 24 | `dataset_release.validated_counts_json` | documented_no_release | manifest.json: See manifest.json; adapters/schema release are not implemented | Documentation mapping only; no production row generated. |
| 25 | `dataset_release.research_coverage_complete` | mapped_research_sidecar | manifest.json: False | Full territorial/current register accounting; historical vectors are incomplete. |
| 26 | `dataset_release.raw_json` | mapped_research_sidecar | manifest.json: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 27 | `election_event.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 28 | `election_event.office_id` | mapped_research_sidecar | data/events.jsonl: office_id | Documentation mapping only; no production row generated. |
| 29 | `election_event.history_key` | mapped_research_sidecar | data/events.jsonl: event_id (research key only) | Documentation mapping only; no production row generated. |
| 30 | `election_event.event_id` | mapped_research_sidecar | data/events.jsonl: event_id | Documentation mapping only; no production row generated. |
| 31 | `election_event.date_id` | mapped_research_sidecar | data/events.jsonl: event_date (documented ISO label; no generated production date ID) | Documentation mapping only; no production row generated. |
| 32 | `election_event.date_resolution` | mapped_research_sidecar | data/events.jsonl: day, or explicit multi-date cycle in 1994 | Documentation mapping only; no production row generated. |
| 33 | `election_event.event_kind` | mapped_research_sidecar | data/events.jsonl: event_kind | Documentation mapping only; no production row generated. |
| 34 | `election_event.selected_history_role` | mapped_research_sidecar | data/events.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 35 | `election_event.electoral_system` | held_null_unless_explicit_source | data/events.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 36 | `election_event.comparability` | held_null_unless_explicit_source | data/events.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 37 | `election_event.ballot_basis` | mapped_research_sidecar | data/events.jsonl: component and result vote_basis | Documentation mapping only; no production row generated. |
| 38 | `election_event.share_unit` | mapped_research_sidecar | data/events.jsonl: percent | Documentation mapping only; no production row generated. |
| 39 | `election_event.legal_outcome` | mapped_research_sidecar | data/events.jsonl: event_status / legal_outcome | Documentation mapping only; no production row generated. |
| 40 | `election_event.record_state` | mapped_research_sidecar | data/events.jsonl: result_coverage / certification_status | Documentation mapping only; no production row generated. |
| 41 | `election_event.state_note` | mapped_research_sidecar | data/events.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 42 | `election_event.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 43 | `election_event.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 44 | `election_event.raw_json` | mapped_research_sidecar | data/events.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 45 | `evidence_link.evidence_id` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 46 | `evidence_link.record_key` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 47 | `evidence_link.source_country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 48 | `evidence_link.source_namespace` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 49 | `evidence_link.source_id` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 50 | `evidence_link.source_locator` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 51 | `evidence_link.claim_kind` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 52 | `evidence_link.date_claim_id` | held_null_unless_explicit_source | source_ids/source_id and source_locator in research records: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 53 | `evidence_link.claim_json` | mapped_research_provenance | source_ids/source_id and source_locator in research records: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 54 | `evidence_link.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 55 | `evidence_link.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 56 | `geography.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 57 | `geography.geography_id` | mapped_research_sidecar | data/territorial-register.jsonl: territory_code | Documentation mapping only; no production row generated. |
| 58 | `geography.name` | mapped_research_sidecar | data/territorial-register.jsonl: name | Documentation mapping only; no production row generated. |
| 59 | `geography.parent_geography_id` | mapped_research_sidecar | data/territorial-register.jsonl: region_code/raion_code/hromada_code according to category | Documentation mapping only; no production row generated. |
| 60 | `geography.effective_from_label` | held_null_unless_explicit_source | data/territorial-register.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 61 | `geography.effective_to_label` | held_null_unless_explicit_source | data/territorial-register.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 62 | `geography.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 63 | `geography.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 64 | `geography.raw_json` | mapped_research_sidecar | data/territorial-register.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 65 | `identity_crosswalk.entity_kind` | mapped_research_sidecar | data/identity-notes.jsonl: CVK namespace/body ID ↔ KATOTTG territory plus explicit identity notes | A geography cross-reference is not a successor edge. |
| 66 | `identity_crosswalk.upstream_namespace` | mapped_research_sidecar | data/identity-notes.jsonl: CVK namespace/body ID ↔ KATOTTG territory plus explicit identity notes | A geography cross-reference is not a successor edge. |
| 67 | `identity_crosswalk.upstream_id` | mapped_research_sidecar | data/identity-notes.jsonl: CVK namespace/body ID ↔ KATOTTG territory plus explicit identity notes | A geography cross-reference is not a successor edge. |
| 68 | `identity_crosswalk.record_key` | mapped_research_sidecar | data/identity-notes.jsonl: CVK namespace/body ID ↔ KATOTTG territory plus explicit identity notes | A geography cross-reference is not a successor edge. |
| 69 | `identity_crosswalk.reason` | mapped_research_sidecar | data/identity-notes.jsonl: CVK namespace/body ID ↔ KATOTTG territory plus explicit identity notes | A geography cross-reference is not a successor edge. |
| 70 | `identity_crosswalk.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 71 | `identity_crosswalk.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 72 | `identity_crosswalk.raw_json` | mapped_research_sidecar | data/identity-notes.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 73 | `ingest_attempt.attempt_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 74 | `ingest_attempt.lineage_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 75 | `ingest_attempt.operator` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 76 | `ingest_attempt.script_version` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 77 | `ingest_attempt.started_at` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 78 | `ingest_attempt.finished_at` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 79 | `ingest_attempt.status` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 80 | `ingest_attempt.input_inventory_json` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 81 | `ingest_attempt.successful_release_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 82 | `ingest_attempt.publication_set_json` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 83 | `ingest_attempt.row_counts_json` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 84 | `ingest_attempt.error_text` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 85 | `office.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 86 | `office.office_id` | mapped_research_sidecar | data/office-register.jsonl: office_id | Documentation mapping only; no production row generated. |
| 87 | `office.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 88 | `office.geography_id` | mapped_research_sidecar | data/office-register.jsonl: territory_code | Documentation mapping only; no production row generated. |
| 89 | `office.name` | mapped_research_sidecar | data/office-register.jsonl: name_local | Documentation mapping only; no production row generated. |
| 90 | `office.office_type` | mapped_research_sidecar | data/office-register.jsonl: office_kind | Documentation mapping only; no production row generated. |
| 91 | `office.office_status` | mapped_research_sidecar | data/office-register.jsonl: office_status | Documentation mapping only; no production row generated. |
| 92 | `office.record_state` | mapped_research_sidecar | data/office-register.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 93 | `office.state_note` | mapped_research_sidecar | data/office-register.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 94 | `office.registry_qualified` | mapped_research_sidecar | data/office-register.jsonl: office_status and research-gaps (not import-approved) | Documentation mapping only; no production row generated. |
| 95 | `office.next_date_id` | mapped_research_sidecar | data/office-register.jsonl: NULL — martial-law upcoming gate | Documentation mapping only; no production row generated. |
| 96 | `office.next_date_resolution` | mapped_research_sidecar | data/office-register.jsonl: NULL — no invented upcoming date | Documentation mapping only; no production row generated. |
| 97 | `office.next_history_key` | mapped_research_sidecar | data/office-register.jsonl: NULL — no invented next contest | Documentation mapping only; no production row generated. |
| 98 | `office.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 99 | `office.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 100 | `office.raw_json` | mapped_research_sidecar | data/office-register.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 101 | `office_tier_classification.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 102 | `office_tier_classification.office_id` | mapped_research_sidecar | data/draft-tiers.jsonl: office_id | Documentation mapping only; no production row generated. |
| 103 | `office_tier_classification.tier` | mapped_research_sidecar | data/draft-tiers.jsonl: draft_tier | Documentation mapping only; no production row generated. |
| 104 | `office_tier_classification.review_status` | mapped_research_sidecar | data/draft-tiers.jsonl: status / justin_approved=false | Documentation mapping only; no production row generated. |
| 105 | `office_tier_classification.rationale` | mapped_research_sidecar | data/draft-tiers.jsonl: basis | Documentation mapping only; no production row generated. |
| 106 | `office_tier_classification.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 107 | `office_tier_classification.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 108 | `office_tier_classification.classification_path` | mapped_research_sidecar | data/draft-tiers.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 109 | `office_tier_classification.classification_kind` | mapped_research_sidecar | data/draft-tiers.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 110 | `office_tier_classification.classification_sha256` | mapped_research_sidecar | SHA256SUMS: Per-file SHA-256; external ZIP hash | No recursive self-hash or invented production release fingerprint. |
| 111 | `office_tier_classification.raw_json` | mapped_research_sidecar | data/draft-tiers.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 112 | `party_mapping.country_id` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 113 | `party_mapping.party_namespace` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 114 | `party_mapping.mapping_id` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 115 | `party_mapping.source_context` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 116 | `party_mapping.election_context` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 117 | `party_mapping.original_label` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 118 | `party_mapping.original_code` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 119 | `party_mapping.mapped_group` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 120 | `party_mapping.uncertainty` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 121 | `party_mapping.lineage_id` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 122 | `party_mapping.release_id` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 123 | `party_mapping.raw_json` | held_unmapped | data/results.jsonl: Original labels retained; mapping IDs/group/code NULL | No party-family or successor mapping invented. |
| 124 | `proceeding.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 125 | `proceeding.office_id` | documented_no_proceeding_insert | event_kind/round/event_status in data/events.jsonl: Source event type/round/status; no separate production proceeding created | Documentation mapping only; no production row generated. |
| 126 | `proceeding.history_key` | documented_no_proceeding_insert | event_kind/round/event_status in data/events.jsonl: Source event type/round/status; no separate production proceeding created | Documentation mapping only; no production row generated. |
| 127 | `proceeding.proceeding_id` | held_null_unless_explicit_source | event_kind/round/event_status in data/events.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 128 | `proceeding.kind` | documented_no_proceeding_insert | event_kind/round/event_status in data/events.jsonl: Source event type/round/status; no separate production proceeding created | Documentation mapping only; no production row generated. |
| 129 | `proceeding.sequence_no` | documented_no_proceeding_insert | event_kind/round/event_status in data/events.jsonl: Source event type/round/status; no separate production proceeding created | Documentation mapping only; no production row generated. |
| 130 | `proceeding.supersedes_id` | held_null_unless_explicit_source | event_kind/round/event_status in data/events.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 131 | `proceeding.legal_outcome` | documented_no_proceeding_insert | event_kind/round/event_status in data/events.jsonl: Source event type/round/status; no separate production proceeding created | Documentation mapping only; no production row generated. |
| 132 | `proceeding.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 133 | `proceeding.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 134 | `proceeding.raw_json` | mapped_research_sidecar | event_kind/round/event_status in data/events.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 135 | `publication_receipt.singleton` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 136 | `publication_receipt.last_publish_attempt_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 137 | `publication_receipt.attempted_lineage_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 138 | `publication_receipt.attempted_release_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 139 | `publication_release.lineage_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 140 | `publication_release.release_id` | excluded_no_application | None: Not created | Research only; applied_changes=0; no ingestion or publication attempt/receipt. |
| 141 | `record_locator.record_key` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 142 | `record_locator.entity_kind` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 143 | `record_locator.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 144 | `record_locator.geography_id` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 145 | `record_locator.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 146 | `record_locator.office_id` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 147 | `record_locator.history_key` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 148 | `record_locator.proceeding_id` | held_null_unless_explicit_source | record IDs and source_locator in data/*.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 149 | `record_locator.result_row_id` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 150 | `record_locator.party_namespace` | held_null_unless_explicit_source | record IDs and source_locator in data/*.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 151 | `record_locator.party_mapping_id` | held_null_unless_explicit_source | record IDs and source_locator in data/*.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 152 | `record_locator.source_namespace` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 153 | `record_locator.source_id` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 154 | `record_locator.input_path` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 155 | `record_locator.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 156 | `record_locator.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 157 | `record_locator.source_row_locator` | mapped_research_provenance | record IDs and source_locator in data/*.jsonl: Research record IDs, source IDs, artifact paths and locators | Documentation mapping only; no production row generated. |
| 158 | `research_date.date_id` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 159 | `research_date.label` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: event_date, event_date_end, poll_dates or appointment_date with distinct roles | Documentation mapping only; no production row generated. |
| 160 | `research_date.precision` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: day for transcribed exact source dates | Documentation mapping only; no production row generated. |
| 161 | `research_date.certainty` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: source qualified; no estimated next date | Documentation mapping only; no production row generated. |
| 162 | `research_date.year` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 163 | `research_date.month` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 164 | `research_date.day` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 165 | `research_date.range_start_id` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 166 | `research_date.range_end_id` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 167 | `research_date.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 168 | `research_date.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 169 | `research_date.raw_json` | mapped_research_sidecar | event_date/event_date_end/appointment_date in data/events.jsonl and data/results.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 170 | `result_row.id_namespace` | mapped_research_sidecar | manifest.json: UA-BD-research | Documentation mapping only; no production row generated. |
| 171 | `result_row.office_id` | mapped_research_sidecar | data/results.jsonl: office_id | Documentation mapping only; no production row generated. |
| 172 | `result_row.history_key` | mapped_research_sidecar | data/results.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 173 | `result_row.result_row_id` | mapped_research_sidecar | data/results.jsonl: result_id | Documentation mapping only; no production row generated. |
| 174 | `result_row.proceeding_id` | held_null_unless_explicit_source | data/results.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 175 | `result_row.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 176 | `result_row.candidate_or_list_label` | mapped_research_sidecar | data/results.jsonl: contestant_name | Documentation mapping only; no production row generated. |
| 177 | `result_row.original_party_label` | mapped_research_sidecar | data/results.jsonl: nomination_label or party contestant_name | Documentation mapping only; no production row generated. |
| 178 | `result_row.original_party_code` | held_null_unless_explicit_source | data/results.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 179 | `result_row.party_namespace` | held_null_unless_explicit_source | data/results.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 180 | `result_row.party_mapping_id` | held_null_unless_explicit_source | data/results.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 181 | `result_row.votes` | mapped_research_sidecar | data/results.jsonl: votes | Documentation mapping only; no production row generated. |
| 182 | `result_row.votes_status` | mapped_research_sidecar | data/results.jsonl: null_not_zero / source-populated | Documentation mapping only; no production row generated. |
| 183 | `result_row.share` | mapped_research_sidecar | data/results.jsonl: vote_share_percent (string decimal) | Documentation mapping only; no production row generated. |
| 184 | `result_row.share_status` | mapped_research_sidecar | data/results.jsonl: null if not transcribed; decimal as published | Documentation mapping only; no production row generated. |
| 185 | `result_row.share_unit` | mapped_research_sidecar | data/results.jsonl: percent | Documentation mapping only; no production row generated. |
| 186 | `result_row.seats` | mapped_research_sidecar | data/results.jsonl: seats | Documentation mapping only; no production row generated. |
| 187 | `result_row.seats_status` | mapped_research_sidecar | data/results.jsonl: null if not transcribed; source value otherwise | Documentation mapping only; no production row generated. |
| 188 | `result_row.elected_flag` | mapped_research_sidecar | data/results.jsonl: outcome if positively reported; no inferred losing false | Documentation mapping only; no production row generated. |
| 189 | `result_row.is_substitute` | held_null_unless_explicit_source | data/results.jsonl: NULL / source-qualified narrative | No guessed effective date, party ID, proceeding chain, status or comparability conversion. |
| 190 | `result_row.evidence_status` | mapped_research_sidecar | data/results.jsonl: certification_status | Documentation mapping only; no production row generated. |
| 191 | `result_row.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 192 | `result_row.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 193 | `result_row.raw_json` | mapped_research_sidecar | data/results.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 194 | `retained_input.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 195 | `retained_input.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 196 | `retained_input.input_path` | mapped_research_sidecar | sources/source-inventory.jsonl: artifact_path | Documentation mapping only; no production row generated. |
| 197 | `retained_input.input_kind` | mapped_research_sidecar | sources/source-inventory.jsonl: artifact_kind | Documentation mapping only; no production row generated. |
| 198 | `retained_input.sha256` | mapped_research_sidecar | sources/source-inventory.jsonl: sha256 | Documentation mapping only; no production row generated. |
| 199 | `retained_input.byte_count` | mapped_research_sidecar | sources/source-inventory.jsonl: bytes | Documentation mapping only; no production row generated. |
| 200 | `retained_input.recovery_locator` | mapped_research_sidecar | sources/source-inventory.jsonl: url | Documentation mapping only; no production row generated. |
| 201 | `retained_input.payload_json` | mapped_research_sidecar | sources/source-inventory.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 202 | `source.country_id` | mapped_research_sidecar | manifest.json: Ukraine research scope (no production numeric ID) | Documentation mapping only; no production row generated. |
| 203 | `source.source_namespace` | mapped_research_sidecar | sources/source-inventory.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 204 | `source.source_id` | mapped_research_sidecar | sources/source-inventory.jsonl: source_id | Documentation mapping only; no production row generated. |
| 205 | `source.publisher` | mapped_research_sidecar | sources/source-inventory.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 206 | `source.title` | mapped_research_sidecar | sources/source-inventory.jsonl: title | Documentation mapping only; no production row generated. |
| 207 | `source.url` | mapped_research_sidecar | sources/source-inventory.jsonl: url | Documentation mapping only; no production row generated. |
| 208 | `source.checked_as_of_label` | mapped_research_sidecar | sources/source-inventory.jsonl: retrieved_utc | Documentation mapping only; no production row generated. |
| 209 | `source.evidence_grade` | mapped_research_sidecar | sources/source-inventory.jsonl: publisher_grade / retrieval_status / record certification_status | Documentation mapping only; no production row generated. |
| 210 | `source.file_sha256` | mapped_research_sidecar | sources/source-inventory.jsonl: sha256 | Documentation mapping only; no production row generated. |
| 211 | `source.locator` | mapped_research_sidecar | sources/source-inventory.jsonl: artifact_path | Documentation mapping only; no production row generated. |
| 212 | `source.data_rights` | mapped_research_sidecar | sources/source-inventory.jsonl: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 213 | `source.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 214 | `source.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 215 | `source.raw_json` | mapped_research_sidecar | sources/source-inventory.jsonl: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
| 216 | `unresolved_evidence.unresolved_id` | mapped_research_sidecar | research-gaps.json: gap_id | Documentation mapping only; no production row generated. |
| 217 | `unresolved_evidence.record_key` | mapped_research_sidecar | research-gaps.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 218 | `unresolved_evidence.original_token` | mapped_research_sidecar | research-gaps.json: See sidecar fields; unestablished production values remain NULL | Documentation mapping only; no production row generated. |
| 219 | `unresolved_evidence.source_locator` | mapped_research_sidecar | research-gaps.json: source_locator | Documentation mapping only; no production row generated. |
| 220 | `unresolved_evidence.reason` | mapped_research_sidecar | research-gaps.json: finding / remaining_hold | Documentation mapping only; no production row generated. |
| 221 | `unresolved_evidence.lineage_id` | mapped_research_sidecar | manifest.json: UA-BD-RESEARCH | Documentation mapping only; no production row generated. |
| 222 | `unresolved_evidence.release_id` | mapped_research_sidecar | manifest.json: 2026-09-28-draft | Documentation mapping only; no production row generated. |
| 223 | `unresolved_evidence.raw_json` | mapped_research_sidecar | research-gaps.json: Source-qualified research record / capture | Raw evidence is retained in sources; not a production JSON payload. |
