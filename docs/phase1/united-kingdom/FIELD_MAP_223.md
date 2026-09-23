# Inherited 223-column field map

Exact table/column contract: `contract/columns.json`. Every column appears once below and in `contract/field-map-223.jsonl`. This is a documentary mapping, not a generated importer or populated database schema.

| # | Table.column | Documentary source | Rule |
|---|---|---|---|
| 1 | `dataset_lineage.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 2 | `dataset_lineage.provenance_kind` | primary_source_research | Original evidence plus clearly labelled rendered captures. |
| 3 | `dataset_lineage.description` | README.md | UK office and election research, limited history coverage. |
| 4 | `dataset_release.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 5 | `dataset_release.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 6 | `dataset_release.fingerprint_sha256` | external ZIP .sha256 | Computed only after ZIP closure; not self-embedded. |
| 7 | `dataset_release.hash_inputs_json` | SHA256SUMS | Every pack file except the manifest itself. |
| 8 | `dataset_release.adapter_version` | null | No importer/adapter written or changed. |
| 9 | `dataset_release.method_version` | uk-research-method-v1 | Documentary extraction version. |
| 10 | `dataset_release.schema_version` | inherited_20_tables_223_columns | Exact inherited columns.json copied without schema edits. |
| 11 | `dataset_release.research_snapshot_label` | 2026-09-23 | Research as-of date, not a poll date. |
| 12 | `dataset_release.upstream_release_id` | null | Multiple independently versioned upstream sources. |
| 13 | `dataset_release.validated_counts_json` | data/counts.json | Recomputed by validator. |
| 14 | `dataset_release.research_coverage_complete` | false | Parish universe, older history and detailed count coverage remain incomplete. |
| 15 | `dataset_release.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 16 | `retained_input.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 17 | `retained_input.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 18 | `retained_input.input_path` | source-inventory.jsonl.input_path | Relative safe archive path. |
| 19 | `retained_input.input_kind` | source-inventory.jsonl.input_kind | Original download versus rendered capture. |
| 20 | `retained_input.sha256` | source-inventory.jsonl.sha256 | SHA-256 of exact retained bytes. |
| 21 | `retained_input.byte_count` | source-inventory.jsonl.byte_count | Actual byte length. |
| 22 | `retained_input.recovery_locator` | url / resolved_download_url | Original URL plus retained path; URLs can later change. |
| 23 | `retained_input.payload_json` | source bytes and inventory metadata | Original retained input; no repaired source overwrite. |
| 24 | `country.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 25 | `country.country_code` | GB | ISO alpha-2; scope is the United Kingdom. |
| 26 | `country.name` | United Kingdom | Four nations; Crown Dependencies/BOT excluded as separate registers. |
| 27 | `country.polity_kind` | parliamentary_constitutional_monarchy | Monarch and government are not separate popular offices. |
| 28 | `country.region_id` | null | No unseen Atlas region key invented. |
| 29 | `country.coverage_status` | full_core_current_register_selected_history_parish_subset | Do not present selected parish rows as an exhaustive parish universe. |
| 30 | `country.screening_as_of_label` | 2026-09-23 | Date of research snapshot. |
| 31 | `country.notes` | record notes / RESEARCH_GAPS.md | Keep territorial and legal limitations visible. |
| 32 | `country.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 33 | `country.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 34 | `country.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 35 | `geography.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 36 | `geography.geography_id` | territory_code or reporting_unit_id, by record scope | ONS code for principal territory; derived reporting-unit key carries election/boundary vintage; never a guessed merger. |
| 37 | `geography.name` | territorial name / reporting-unit name | Original official names and source aliases retained. |
| 38 | `geography.parent_geography_id` | null unless explicit source parent | No geographical overlap or name-based succession inference. |
| 39 | `geography.effective_from_label` | source boundary_start when supplied | Do not turn first observed election into creation date. |
| 40 | `geography.effective_to_label` | source boundary_end when supplied | Missing end date is unknown, not infinity. |
| 41 | `geography.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 42 | `geography.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 43 | `geography.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 44 | `office.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 45 | `office.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 46 | `office.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 47 | `office.geography_id` | territory_code or reporting_unit_id, by record scope | ONS code for principal territory; derived reporting-unit key carries election/boundary vintage; never a guessed merger. |
| 48 | `office.name` | office-register.name | Body-level office, not one row per seat. |
| 49 | `office.office_type` | office-register.office_type | Country-specific classes are retained. |
| 50 | `office.office_status` | office-register.status | current, current_shadow, historical_only. |
| 51 | `office.record_state` | research_documentation | Never importer-ready, applied or published. |
| 52 | `office.state_note` | office notes / footprint_note | Document shadow and mixed-board limitations. |
| 53 | `office.registry_qualified` | unapproved / not materialized | Evidence supports a draft row; Justin has not approved ingestion. |
| 54 | `office.next_date_id` | next_ordinary_poll_date if explicit | No cycle arithmetic used to invent dates. |
| 55 | `office.next_date_resolution` | next_date_status | Unknown dates remain unknown. |
| 56 | `office.next_history_key` | null | No speculative future contest links. |
| 57 | `office.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 58 | `office.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 59 | `office.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 60 | `office_tier_classification.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 61 | `office_tier_classification.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 62 | `office_tier_classification.tier` | draft_tiers.draft_tier | 1:1 draft assignment, including historical rows. |
| 63 | `office_tier_classification.review_status` | draft_unapproved | All Justin approval flags false. |
| 64 | `office_tier_classification.rationale` | draft_tiers.rationale + DRAFT_TIERS.md | Scale-based proposal, not an approved taxonomy. |
| 65 | `office_tier_classification.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 66 | `office_tier_classification.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 67 | `office_tier_classification.classification_path` | data/draft-tiers.jsonl | Pack-relative path. |
| 68 | `office_tier_classification.classification_kind` | research_draft | No production classification. |
| 69 | `office_tier_classification.classification_sha256` | SHA256SUMS entry for data/draft-tiers.jsonl | Hash after complete file write. |
| 70 | `office_tier_classification.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 71 | `research_date.date_id` | documentary date token | Not separately materialized as a schema table. |
| 72 | `research_date.label` | poll_date or explicit next_ordinary_poll_date | Poll, declaration, publication and legal dates remain distinct. |
| 73 | `research_date.precision` | event.date_precision | Year-only sources remain year precision. |
| 74 | `research_date.certainty` | source_reported | Declared values are not legal assumptions. |
| 75 | `research_date.year` | year from an explicit date label | No inferred month/day. |
| 76 | `research_date.month` | month only for day-precision labels | Null for year-only EP/historical summaries. |
| 77 | `research_date.day` | day only for day-precision labels | Null for year-only summaries. |
| 78 | `research_date.range_start_id` | null | No fabricated range bound. |
| 79 | `research_date.range_end_id` | null | No fabricated range bound. |
| 80 | `research_date.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 81 | `research_date.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 82 | `research_date.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 83 | `election_event.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 84 | `election_event.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 85 | `election_event.history_key` | data/events.jsonl.event_id | Proposed research history key equals the explicit event identifier. |
| 86 | `election_event.event_id` | events.event_id | Hash of office/date/kind/scope; not a database insert. |
| 87 | `election_event.date_id` | events.poll_date | Preserve actual postponed dates. |
| 88 | `election_event.date_resolution` | events.date_precision | Notional data excluded. |
| 89 | `election_event.event_kind` | events.event_kind | General, local, executive, by-election, shadow and summary are distinct. |
| 90 | `election_event.selected_history_role` | evidenced_history | Not an invented latest-contest pointer. |
| 91 | `election_event.electoral_system` | events.electoral_system | Contemporaneous system; Senedd 2026 and mayor/PCC law vintages differ. |
| 92 | `election_event.comparability` | not automatically comparable | Boundary, ballot and aggregation scope must match. |
| 93 | `election_event.ballot_basis` | events.ballot_basis | Keep candidate marks, first preferences, list votes, percentages and seat-only summaries separate. |
| 94 | `election_event.share_unit` | result_row.share_unit | Only explicit percent values; no invented denominator. |
| 95 | `election_event.legal_outcome` | source-qualified status; null absent | Published compilation does not establish certification. |
| 96 | `election_event.record_state` | research_documentation | Never importer-ready, applied or published. |
| 97 | `election_event.state_note` | events.notes / coverage / evidence_status | Partial, unopposed and index-only coverage remains explicit. |
| 98 | `election_event.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 99 | `election_event.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 100 | `election_event.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 101 | `proceeding.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 102 | `proceeding.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 103 | `proceeding.history_key` | data/events.jsonl.event_id | Proposed research history key equals the explicit event identifier. |
| 104 | `proceeding.proceeding_id` | not materialized | No fabricated proceeding record. SV count stages are vote_type values; Waterside court certificate is a documented legal proceeding. |
| 105 | `proceeding.kind` | legal_proceeding or count-stage description | No repeat election inferred from petition or SV transfer. |
| 106 | `proceeding.sequence_no` | null unless expressly provided | No fake run-off or transfer sequence. |
| 107 | `proceeding.supersedes_id` | null | No guessed replacement chain. |
| 108 | `proceeding.legal_outcome` | Waterside certificate claim only where linked | Certificate confirms election; no annulment invented. |
| 109 | `proceeding.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 110 | `proceeding.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 111 | `proceeding.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 112 | `result_row.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 113 | `result_row.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 114 | `result_row.history_key` | data/events.jsonl.event_id | Proposed research history key equals the explicit event identifier. |
| 115 | `result_row.result_row_id` | results.result_row_id | Unique documentary row id; includes source locator and scope. |
| 116 | `result_row.proceeding_id` | not materialized | No fabricated proceeding record. SV count stages are vote_type values; Waterside court certificate is a documented legal proceeding. |
| 117 | `result_row.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 118 | `result_row.candidate_or_list_label` | results.label | Combined candidate/party label kept where split is not reliable. |
| 119 | `result_row.original_party_label` | results.party_label or raw combined label | Missing party remains null; no inferred affiliation. |
| 120 | `result_row.original_party_code` | raw.party_id for EP only if given | Codes are term scoped. |
| 121 | `result_row.party_namespace` | source_id plus EP term when applicable | Original party labels/codes remain source scoped; no global harmonization. |
| 122 | `result_row.party_mapping_id` | null | No unapproved party reconciliation. |
| 123 | `result_row.votes` | results.votes | Explicit non-negative integer or null; never a transfer reconstruction. |
| 124 | `result_row.votes_status` | results.votes_status | Missing and explicit source values are separate. |
| 125 | `result_row.share` | results.share | Explicit sourced percent; local adjusted shares stay raw. |
| 126 | `result_row.share_status` | results.share_status | Missing is not zero. |
| 127 | `result_row.share_unit` | results.share_unit | percent when share supplied; otherwise null. |
| 128 | `result_row.seats` | results.seats | Only reported allocation or counts of explicit named seat cells. |
| 129 | `result_row.seats_status` | results.seats_status | No seat allocation mathematics invented. |
| 130 | `result_row.elected_flag` | results.elected | Boolean only when source identifies outcome; local PDF bold winners not inferred. |
| 131 | `result_row.is_substitute` | null | No substitute flag in normalized evidence. |
| 132 | `result_row.evidence_status` | results.evidence_status | Official declared, official research or research compilation are distinct. |
| 133 | `result_row.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 134 | `result_row.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 135 | `result_row.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 136 | `party_mapping.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 137 | `party_mapping.party_namespace` | source_id plus EP term when applicable | Original party labels/codes remain source scoped; no global harmonization. |
| 138 | `party_mapping.mapping_id` | null | No new mappings produced. |
| 139 | `party_mapping.source_context` | source_id | Original identity namespace only. |
| 140 | `party_mapping.election_context` | event_id / EP term | No cross-vintage code equality assumption. |
| 141 | `party_mapping.original_label` | party_label / original combined label | Preserve spelling. |
| 142 | `party_mapping.original_code` | EP raw.party_id | Do not treat party UK01 as stable across terms. |
| 143 | `party_mapping.mapped_group` | null | Justin review required for political-group harmonization. |
| 144 | `party_mapping.uncertainty` | unreconciled | No implicit party continuity. |
| 145 | `party_mapping.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 146 | `party_mapping.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 147 | `party_mapping.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 148 | `source.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 149 | `source.source_namespace` | GB.SOURCE | Retained-input evidence namespace. |
| 150 | `source.source_id` | source-inventory.jsonl.source_id | Hash-backed evidence input identifier. |
| 151 | `source.publisher` | source-inventory.publisher | For mixed captures consult each claim-specific original URL. |
| 152 | `source.title` | source-inventory.title | Retained filename is a stable descriptive label; not an invented official title. |
| 153 | `source.url` | source-inventory.url + additional_capture_urls | Upstream origins; rendered captures are labelled. |
| 154 | `source.checked_as_of_label` | 2026-09-23 | Retrieval/screening date. |
| 155 | `source.evidence_grade` | source-inventory.evidence_grade | No blanket certification of compiled data. |
| 156 | `source.file_sha256` | source-inventory.sha256 | Exact bytes, not URL or semantic content. |
| 157 | `source.locator` | input_path | Original document or honest rendered capture. |
| 158 | `source.data_rights` | source-inventory.data_rights | Upstream terms; no invented open licence. |
| 159 | `source.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 160 | `source.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 161 | `source.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 162 | `record_locator.record_key` | entity primary identifier | Use office_id, event_id, result_row_id or explicit crosswalk record_key as applicable. |
| 163 | `record_locator.entity_kind` | office / event / result / legal_proceeding | Resolve by actual record class. |
| 164 | `record_locator.country_id` | GB | ISO GB pack namespace; not Great Britain-only territorial coverage. |
| 165 | `record_locator.geography_id` | territory_code or reporting_unit_id, by record scope | ONS code for principal territory; derived reporting-unit key carries election/boundary vintage; never a guessed merger. |
| 166 | `record_locator.id_namespace` | atlas.research.GB.prompt-AU | Draft documentary namespace, unapproved. |
| 167 | `record_locator.office_id` | data/office-register.jsonl.office_id | Resolve exact office foreign key; never infer a successor from the name. |
| 168 | `record_locator.history_key` | data/events.jsonl.event_id | Proposed research history key equals the explicit event identifier. |
| 169 | `record_locator.proceeding_id` | not materialized | No fabricated proceeding record. SV count stages are vote_type values; Waterside court certificate is a documented legal proceeding. |
| 170 | `record_locator.result_row_id` | data/results.jsonl.gz.result_row_id | Exact documentary result foreign key. |
| 171 | `record_locator.party_namespace` | source_id plus EP term when applicable | Original party labels/codes remain source scoped; no global harmonization. |
| 172 | `record_locator.party_mapping_id` | null | No unapproved party reconciliation. |
| 173 | `record_locator.source_namespace` | GB.SOURCE | Retained-input evidence namespace. |
| 174 | `record_locator.source_id` | source-inventory.jsonl.source_id | Hash-backed evidence input identifier. |
| 175 | `record_locator.input_path` | source-inventory.input_path | Follow source_id foreign key. |
| 176 | `record_locator.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 177 | `record_locator.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 178 | `record_locator.source_row_locator` | results.source_locator | PDF physical page, CSV row, workbook sheet/cells or named HTML section. |
| 179 | `evidence_link.evidence_id` | not materialized | Evidence remains embedded references; no pretend importer rows. |
| 180 | `evidence_link.record_key` | entity primary identifier | Use office_id, event_id, result_row_id or explicit crosswalk record_key as applicable. |
| 181 | `evidence_link.source_country_id` | GB | Publisher jurisdiction need not equal electoral territory. |
| 182 | `evidence_link.source_namespace` | GB.SOURCE | Retained-input evidence namespace. |
| 183 | `evidence_link.source_id` | source-inventory.jsonl.source_id | Hash-backed evidence input identifier. |
| 184 | `evidence_link.source_locator` | result.source_locator / office source references | Source reference alone does not prove unrelated claims. |
| 185 | `evidence_link.claim_kind` | office mechanism / result / date / legal outcome | Documented in record and research gaps. |
| 186 | `evidence_link.date_claim_id` | explicit date token where supported | No unobserved date claim. |
| 187 | `evidence_link.claim_json` | original row and raw fields | Retain values and qualifications together. |
| 188 | `evidence_link.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 189 | `evidence_link.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 190 | `unresolved_evidence.unresolved_id` | gap_id or quarantine file ordinal | Stable documentary locator; no ingestion. |
| 191 | `unresolved_evidence.record_key` | entity primary identifier | Use office_id, event_id, result_row_id or explicit crosswalk record_key as applicable. |
| 192 | `unresolved_evidence.original_token` | quarantined raw row / named ambiguity | Preserve malformed upstream CSV and image-only PDF page. |
| 193 | `unresolved_evidence.source_locator` | source filename and row/page | Do not silently discard errors. |
| 194 | `unresolved_evidence.reason` | quarantine.kind / research gap detail | Four malformed CSV rows have separate official HTML replacements. |
| 195 | `unresolved_evidence.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 196 | `unresolved_evidence.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 197 | `unresolved_evidence.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 198 | `identity_crosswalk.entity_kind` | identity-crosswalk.entity_kind | Current file contains a sourced legal proceeding; geographic successor links are withheld. |
| 199 | `identity_crosswalk.upstream_namespace` | identity-crosswalk.upstream_namespace | Retain explicit jurisdiction/source namespace. |
| 200 | `identity_crosswalk.upstream_id` | identity-crosswalk.upstream_id | Court case identifier is not an office predecessor. |
| 201 | `identity_crosswalk.record_key` | entity primary identifier | Use office_id, event_id, result_row_id or explicit crosswalk record_key as applicable. |
| 202 | `identity_crosswalk.reason` | identity-crosswalk.claim | No merger or boundary successor guessed. |
| 203 | `identity_crosswalk.lineage_id` | release-metadata.json.lineage_id | Documentary GB lineage; not a database row. |
| 204 | `identity_crosswalk.release_id` | release-metadata.json.release_id | Research snapshot identifier, not a published release receipt. |
| 205 | `identity_crosswalk.raw_json` | complete retained row and explicitly retained raw fields | Preserve original labels, component measures, qualifiers and source errors. |
| 206 | `publication_release.lineage_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 207 | `publication_release.release_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 208 | `publication_receipt.singleton` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 209 | `publication_receipt.last_publish_attempt_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 210 | `publication_receipt.attempted_lineage_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 211 | `publication_receipt.attempted_release_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 212 | `ingest_attempt.attempt_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 213 | `ingest_attempt.lineage_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 214 | `ingest_attempt.operator` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 215 | `ingest_attempt.script_version` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 216 | `ingest_attempt.started_at` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 217 | `ingest_attempt.finished_at` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 218 | `ingest_attempt.status` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 219 | `ingest_attempt.input_inventory_json` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 220 | `ingest_attempt.successful_release_id` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 221 | `ingest_attempt.publication_set_json` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 222 | `ingest_attempt.row_counts_json` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
| 223 | `ingest_attempt.error_text` | not_applicable | Research/documentation only. No publication, ingestion, production attempt, receipt, operator or success ID exists. |
