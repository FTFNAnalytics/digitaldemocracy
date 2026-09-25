# Albania field map — Prompt BA

Exactly **20 tables / 223 columns**. The table/column names are the inherited contract, not new schema. The prior detailed field-map review is retained unchanged under `reference/`. This BA addendum maps the expanded research records and states every unapplied/unknown field. No importer, SQL, schema migration or application change is supplied.

The four core files are normalized research documents, not complete production table dumps. Research `national` tier corresponds to contract `national_context` only as documented below. Existing namespace/lineage references are preserved without assigning a release or operational receipt.

## country — 11 columns

| Column | BA research mapping |
| --- | --- |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| country_code | Literal AL; metadata.json.country_code. |
| name | Albania. |
| polity_kind | Republic; post-1991 identity gate applies. |
| region_id | Null; no production region ID allocated. |
| coverage_status | Current national/municipal register complete; nested advisory census and historic numeric coverage incomplete. |
| screening_as_of_label | 2026-09-24 from metadata.json.as_of. |
| notes | metadata.json.notes and applicable coverage/identity/research-gap narrative. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## dataset_lineage — 3 columns

| Column | BA research mapping |
| --- | --- |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| provenance_kind | Research/documentation recovery and fresh public-source transcription; reference only. |
| description | Prompt BA Albania pack; no ingestion or publication. |

## dataset_release — 12 columns

| Column | BA research mapping |
| --- | --- |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| fingerprint_sha256 | Unassigned: ZIP SHA is an artifact digest, not a production release fingerprint. |
| hash_inputs_json | data/input-inventory.json plus source-inventory and SHA256SUMS; no operational hash-input contract claimed. |
| adapter_version | Null; no adapter written or run. |
| method_version | Research method documented in README, Coverage and Identity Rules; no production method release. |
| schema_version | Inherited 20-table/223-column reference; no database schema version assigned. |
| research_snapshot_label | 2026-09-24. |
| upstream_release_id | Null; recovered briefing/workbook are source artifacts, not a proven release binding. |
| validated_counts_json | data/counts.json after successful read-only validation. |
| research_coverage_complete | False; see metadata.json and data/research-gaps.json. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## election_event — 18 columns

| Column | BA research mapping |
| --- | --- |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| history_key | data/events.jsonl.history_key; join result.event_id to event. Preserve inherited date keys. |
| event_id | data/events.jsonl.event_id. |
| date_id | Unassigned research-date identity; event.date/date_label/date_precision/range fields retain evidence. |
| date_resolution | event.date_precision and date_role; scheduled day is not actual polling. |
| event_kind | event.event_kind; cycle_result is a summary, not an additional poll. |
| selected_history_role | All sourced BA events retained; prior three-selected-event role is recovery context only. |
| electoral_system | Office.selection_mode plus dated cycle source; mixed-system cycle seats and list votes kept distinct. |
| comparability | event.comparability and gap G21; no swing score inferred. |
| ballot_basis | event.result_scope and result.vote_basis / seat_basis; no merging list and single-member votes. |
| share_unit | Percent when share present; percent labels never imply raw vote totals. |
| legal_outcome | data/events.jsonl.legal_outcome, including annulled, cancelled schedule and unresolved phases. |
| record_state | Research documented; future application/binding unapproved. |
| state_note | event.note, coverage_note, result_coverage and legal_outcome. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## evidence_link — 11 columns

| Column | BA research mapping |
| --- | --- |
| evidence_id | Unassigned; research source references are in events/results/offices. |
| record_key | Research reference to office_id, event_id, result_id, source_id or gap_id; production record locator not assigned. |
| source_country_id | albania. |
| source_namespace | albania research-source context; recovered legacy source IDs retained without claiming the full frozen catalogue. |
| source_id | data/source-inventory.json.source_id; result.source_id or event.source_ids identifies supporting source. |
| source_locator | Result.origin, source factual-extract locator or source note; preserve document body/page/section distinctions. |
| claim_kind | Office identity, selection law, date, vote, seat, winner or legal outcome as stated in factual extract. |
| date_claim_id | Null unless a separately established dated claim exists; no fabricated key. |
| claim_json | Applicable normalized factual-extract object plus record status and locator. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |

## geography — 9 columns

| Column | BA research mapping |
| --- | --- |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| geography_id | office-register.geography_id for inherited offices; null for unbound new historical/national research geographies. |
| name | office.geography and original qark/district/unit labels; Dimal alias preserved. |
| parent_geography_id | Null: parent office references for historical boroughs do not invent production geography hierarchy IDs. |
| effective_from_label | Sourced territorial vintage only; exact day null unless explicitly established. |
| effective_to_label | Null for unresolved unit continuity; no blanket abolition day inferred from reform. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## identity_crosswalk — 8 columns

| Column | BA research mapping |
| --- | --- |
| entity_kind | data/identity-crosswalk.json.entity_kind (office for retained legacy bindings). |
| upstream_namespace | Recovered Albania office-ID context; not an assumed production namespace. |
| upstream_id | data/identity-crosswalk.json.upstream_id. |
| record_key | Research reference to office_id, event_id, result_id, source_id or gap_id; production record locator not assigned. |
| reason | data/identity-crosswalk.json.reason; no guessed merger edges. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## ingest_attempt — 12 columns

| Column | BA research mapping |
| --- | --- |
| attempt_id | No row emitted. attempt_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| lineage_id | No row emitted. lineage_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| operator | No row emitted. operator is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| script_version | No row emitted. script_version is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| started_at | No row emitted. started_at is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| finished_at | No row emitted. finished_at is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| status | No row emitted. status is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| input_inventory_json | No row emitted. input_inventory_json is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| successful_release_id | No row emitted. successful_release_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| publication_set_json | No row emitted. publication_set_json is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| row_counts_json | No row emitted. row_counts_json is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| error_text | No row emitted. error_text is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |

## office — 16 columns

| Column | BA research mapping |
| --- | --- |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| geography_id | office-register.geography_id for inherited offices; null for unbound new historical/national research geographies. |
| name | office-register.name, preserving source spelling/vintage. |
| office_type | office-register.office_type; national_legislature, municipal_council, mayor or historical borough variants. |
| office_status | office-register.status: current or historical_only; historical_only does not prove abolition. |
| record_state | Research draft; existing IDs retained, new bindings unapproved. |
| state_note | office.identity_status and territory_vintage; gaps G03/G05/G20. |
| registry_qualified | True for sourced national/municipal elected-body inventory; not implementation approval or exhaustive community-body coverage. |
| next_date_id | Null; expected cycle year is not a scheduled date. |
| next_date_resolution | Unresolved exact polling date; see cycle-outlook.json. |
| next_history_key | Null; no upcoming event key fabricated. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## office_tier_classification — 11 columns

| Column | BA research mapping |
| --- | --- |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| tier | draft-tiers.tier; research national corresponds to inherited national_context, municipal to municipal, other to other. |
| review_status | draft_unapproved; all justin_approved=false. |
| rationale | draft-tiers.rationale. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| classification_path | data/draft-tiers.jsonl. |
| classification_kind | Research draft, 1:1 with office register. |
| classification_sha256 | SHA256SUMS digest of data/draft-tiers.jsonl; not a deployed classification release. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## party_mapping — 12 columns

| Column | BA research mapping |
| --- | --- |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| party_namespace | Unassigned; no cross-cycle party namespace or mapping approved. |
| mapping_id | Null; no party-mapping rows proposed. |
| source_context | Result.source_id and source original label. |
| election_context | Result.event_id, joined office and history_key. |
| original_label | Result.original_party_label if present, otherwise party_label; retain coalition text. |
| original_code | Result.original_party_code when explicitly provided, else null. |
| mapped_group | Null; no inferred family, ideological group or coalition continuity. |
| uncertainty | Gap G21; aggregates and cross-cycle equivalence unresolved. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## proceeding — 11 columns

| Column | BA research mapping |
| --- | --- |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| history_key | data/events.jsonl.history_key; join result.event_id to event. Preserve inherited date keys. |
| proceeding_id | Unassigned; events document legal outcomes but no operational proceeding row is allocated. |
| kind | Proposed evidence from event.event_kind/legal_outcome; actual proceeding identity not allocated. |
| sequence_no | Only source-established chronological order; null where phase order/date unresolved. |
| supersedes_id | Null; repeats_event_id is an event repeat relation, not automatic legal supersession. |
| legal_outcome | data/events.jsonl.legal_outcome, including annulled, cancelled schedule and unresolved phases. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## publication_receipt — 4 columns

| Column | BA research mapping |
| --- | --- |
| singleton | No row emitted. singleton is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| last_publish_attempt_id | No row emitted. last_publish_attempt_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| attempted_lineage_id | No row emitted. attempted_lineage_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| attempted_release_id | No row emitted. attempted_release_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |

## publication_release — 2 columns

| Column | BA research mapping |
| --- | --- |
| lineage_id | No row emitted. lineage_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |
| release_id | No row emitted. release_id is unassigned; no ingestion attempt, publication receipt or publication release exists in this research task. |

## record_locator — 17 columns

| Column | BA research mapping |
| --- | --- |
| record_key | Research reference to office_id, event_id, result_id, source_id or gap_id; production record locator not assigned. |
| entity_kind | Research artifact record kind: office, event, result, source, gap or tier. |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| geography_id | office-register.geography_id for inherited offices; null for unbound new historical/national research geographies. |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| history_key | data/events.jsonl.history_key; join result.event_id to event. Preserve inherited date keys. |
| proceeding_id | Unassigned; events document legal outcomes but no operational proceeding row is allocated. |
| result_row_id | Result.result_id; exact existing zero-based row identity preserved. |
| party_namespace | Unassigned; no cross-cycle party namespace or mapping approved. |
| party_mapping_id | Null: party/coalition identity unresolved across cycles. |
| source_namespace | albania research-source context; recovered legacy source IDs retained without claiming the full frozen catalogue. |
| source_id | data/source-inventory.json.source_id; result.source_id or event.source_ids identifies supporting source. |
| input_path | Retained relative path from data/source-inventory.json or SHA256SUMS; original remote files are not bundled. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| source_row_locator | Result.origin including workbook_row or source_line where recovered; otherwise explicit document/section locator. |

## research_date — 12 columns

| Column | BA research mapping |
| --- | --- |
| date_id | Unassigned; no operational research_date rows generated. |
| label | Event.date_label, date or range, preserving scheduled/certification distinctions. |
| precision | Event.date_precision: day, year or range; no invented missing month/day. |
| certainty | Sourced date, source range, cycle year, or unscheduled expectation as documented. |
| year | event.cycle_year or sourced research-date year; no inferred polling day. |
| month | Month only from an exact sourced day; null for year/range summaries. |
| day | Day only from an exact sourced day; null for year/range summaries. |
| range_start_id | Unassigned; event.date_start retains actual sourced range boundary. |
| range_end_id | Unassigned; event.date_end retains actual sourced range boundary. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## result_row — 24 columns

| Column | BA research mapping |
| --- | --- |
| id_namespace | Inherited reference cdd-observatory-v1; newly allocated research IDs remain unapproved. |
| office_id | data/office-register.jsonl.office_id; events/results/tiers reference the same exact ID. |
| history_key | data/events.jsonl.history_key; join result.event_id to event. Preserve inherited date keys. |
| result_row_id | data/results.jsonl.result_id (event ID + -r + zero-based index). |
| proceeding_id | Unassigned; events document legal outcomes but no operational proceeding row is allocated. |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| candidate_or_list_label | Result.candidate_or_list_label; aggregates remain explicitly labelled. |
| original_party_label | Result.original_party_label if present, else party_label; no party inference. |
| original_party_code | Result.original_party_code when sourced; otherwise null. |
| party_namespace | Unassigned; no cross-cycle party namespace or mapping approved. |
| party_mapping_id | Null: party/coalition identity unresolved across cycles. |
| votes | Result.votes; integer or null. No share-to-vote back-calculation. |
| votes_status | Result.votes_status; explicit reported/source_zero or untranscribed. |
| share | Result.share; source percentage or explicitly derived inherited vector share; null unchanged. |
| share_status | Result.share_status plus share_basis. Derived is not source-reported. |
| share_unit | Result.share_unit = percent; not a fraction. |
| seats | Result.seats; explicit/inherited allocation or null. No one-seat fabrication for a mayor. |
| seats_status | Result.seats_status, including inherited_recorded_zero; 2011 blanks omitted and audited. |
| elected_flag | Result.elected; true only if established, false for annulled Rrogozhinë mandate, otherwise null. |
| is_substitute | Null; no substitute classification transcribed. |
| evidence_status | data/results.jsonl.evidence_status or event.evidence_status; never promote preliminary to certified. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## retained_input — 8 columns

| Column | BA research mapping |
| --- | --- |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| input_path | Retained relative path from data/source-inventory.json or SHA256SUMS; original remote files are not bundled. |
| input_kind | Normalized factual extract, reference contract or research data; originals marked not redistributed. |
| sha256 | SHA256SUMS digest for the exact retained file; original_source_sha256 is a different reference. |
| byte_count | Exact retained file length where supplied; original_byte_count is a separate attribute. |
| recovery_locator | Source URL and inventory input role; not a local path promised inside ZIP for excluded originals. |
| payload_json | Normalized facts in sources/normalized or complete applicable research record. |

## source — 14 columns

| Column | BA research mapping |
| --- | --- |
| country_id | Literal albania; metadata.json.country_id; do not allocate another country identity. |
| source_namespace | albania research-source context; recovered legacy source IDs retained without claiming the full frozen catalogue. |
| source_id | data/source-inventory.json.source_id; result.source_id or event.source_ids identifies supporting source. |
| publisher | Infer only from explicit issuing institution/title/URL; authority grade retained. No source publisher ID invented. |
| title | source-inventory.title. |
| url | source-inventory.url. |
| checked_as_of_label | source-inventory.accessed; original legacy access date remains in note. |
| evidence_grade | source-inventory.evidence_grade and record-level qualifications. |
| file_sha256 | retained_extract_sha256 for retained extract; original_sha256 only for original bytes, separately labelled. |
| locator | retained_extract_path plus source URL and page/section in facts. |
| data_rights | Public factual extraction; original reports/HTML not redistributed; no blanket license assertion. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

## unresolved_evidence — 8 columns

| Column | BA research mapping |
| --- | --- |
| unresolved_id | data/research-gaps.json.gap_id or separately described diagnostic; research identifier only. |
| record_key | Research reference to office_id, event_id, result_id, source_id or gap_id; production record locator not assigned. |
| original_token | Unresolved source unit, date, total or party label preserved in diagnostic/gap, not guessed. |
| source_locator | Result.origin, source factual-extract locator or source note; preserve document body/page/section distinctions. |
| reason | Gap finding/next_evidence, arithmetic diagnostic or unresolved proceedings issue. |
| lineage_id | Reference country-package-albania only; no operational lineage row written. |
| release_id | Unassigned / null; no operational release created. |
| raw_json | Entire originating research record, including null-status, source IDs and coverage qualifications. |

Null policy applies to all 223 fields: missing is not zero. Every mapping is applied=false. Source inventory distinguishes original-byte digests from retained-extract digests; no hash is invented for unavailable originals.
