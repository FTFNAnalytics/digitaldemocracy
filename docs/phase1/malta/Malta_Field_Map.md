# Malta — 223-column field map

Exact inherited 20-table / 223-column contract. Documentation only; applied_changes=0. The retained contract includes its prior schema pin. No fresh production schema audit is claimed. Required fields lacking evidence block future projection; they are never filled with made-up values.

## dataset_lineage

| Column | Proposed mapping / disposition |
|---|---|
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| provenance_kind | country_package |
| description | Malta Prompt AP research/documentation handoff. |

## dataset_release

| Column | Proposed mapping / disposition |
|---|---|
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| fingerprint_sha256 | SHA256 of canonical sorted input paths/hashes plus contract, method, field-map and tier versions. Exclude wall clock and attempt IDs. |
| hash_inputs_json | That exact canonical effective-input inventory. |
| adapter_version | malta-field-map/1; documentation label only, no importer written. |
| method_version | malta-source-preservation/1 |
| schema_version | Inherited pinned Atlas contract retained in contract/; fresh production-schema verification not performed. |
| research_snapshot_label | 2026-09-22 |
| upstream_release_id | Prompt-AP-Malta |
| validated_counts_json | Computed validation-report counts. |
| research_coverage_complete | 0: scoped historic coverage and remaining gaps are explicit. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## retained_input

| Column | Proposed mapping / disposition |
|---|---|
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| input_path | Exact retained source or data relative path. |
| input_kind | source artifact / documentation artifact / draft tier classification |
| sha256 | SHA256 of exact retained file bytes. |
| byte_count | Exact byte length. |
| recovery_locator | ZIP relative member path. |
| payload_json | Source descriptor with capture_kind, original URL and retained path; a DOM extraction is not mislabeled original HTML/PDF. |

## country

| Column | Proposed mapping / disposition |
|---|---|
| country_id | malta |
| country_code | MT |
| name | Malta |
| polity_kind | parliamentary_republic |
| region_id | europe |
| coverage_status | full_current_office_register_with_bounded_historical_returns |
| screening_as_of_label | 2026-09-22 |
| notes | President indirectly elected; mayor/deputy route conditional on council result; six indirectly elected regional presidents; no regional popular parliament. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## geography

| Column | Proposed mapping / disposition |
|---|---|
| country_id | malta |
| geography_id | Proposed MT-G- + legal locality/region identity; district is a reporting-unit geography, never an extra parliament office. |
| name | office.locality / region, otherwise Malta; reporting-unit area for source district scope. |
| parent_geography_id | Sourced parent only; no successor geography inferred. |
| effective_from_label | NULL unless explicitly established by territorial gate; no blanket 1993 polling day. |
| effective_to_label | Historic Gozo council end_label=1973 with year precision; unverified boundaries stay NULL. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## office

| Column | Proposed mapping / disposition |
|---|---|
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| country_id | malta |
| geography_id | Proposed MT-G- + legal locality/region identity; district is a reporting-unit geography, never an extra parliament office. |
| name | office-register.name |
| office_type | office-register.office_type; preserve mechanism fields in raw_json. |
| office_status | office-register.status |
| record_state | active research record; office_status distinguishes current from historical. |
| state_note | Source status, no-poll, electoral-college and boundary/date caveats. |
| registry_qualified | 1 for supported offices in this register. |
| next_date_id | NULL: no future exact called date established. |
| next_date_resolution | unknown_exact_day; calendar year/rule in raw_json. |
| next_history_key | NULL |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## office_tier_classification

| Column | Proposed mapping / disposition |
|---|---|
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| tier | draft-tiers.tier, exact 1:1 office identity. |
| review_status | needs_review |
| rationale | Municipal for each council/mayor/deputy; national for House/President; regional for regional presidency/Gozo civic history; other for EP. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| classification_path | data/draft-tiers.json |
| classification_kind | draft_for_human_review |
| classification_sha256 | Exact file SHA256; all Justin approvals false. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## research_date

| Column | Proposed mapping / disposition |
|---|---|
| date_id | Proposed MT-D- + exact date label and precision. |
| label | events.date; source label and conflict disposition retained separately. |
| precision | events.date_precision |
| certainty | observed source date; 2026 poll resolved from explicit EC declaration over summary-page date. |
| year | Source-supported year. |
| month | Only if source precision allows; otherwise NULL. |
| day | Only if source precision allows; otherwise NULL. |
| range_start_id | NULL unless actual sourced range |
| range_end_id | NULL unless actual sourced range |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## election_event

| Column | Proposed mapping / disposition |
|---|---|
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| history_key | Stable office + supported election date + proceeding kind where necessary. |
| event_id | events.event_id; national district returns share the one national event. |
| date_id | Proposed MT-D- + exact date label and precision. |
| date_resolution | resolved_source_label |
| event_kind | events.event_type; distinguish election, uncontested return, indirect election, additional-seat declaration. |
| selected_history_role | historical |
| electoral_system | events.electoral_system; popular STV only where applicable. |
| comparability | District and locality scopes remain separate; boundary comparability not assumed. |
| ballot_basis | events.ballot_basis; no popular vote universe for the President or regional councillor ballots. |
| share_unit | percent where reported |
| legal_outcome | Source-described declaration; not an automatic claim of Gazette certification. |
| record_state | active research record; office_status distinguishes current from historical. |
| state_note | Source status, no-poll, electoral-college and boundary/date caveats. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## proceeding

| Column | Proposed mapping / disposition |
|---|---|
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| history_key | Stable office + supported election date + proceeding kind where necessary. |
| proceeding_id | Proposed proceeding ID only for explicitly sourced additional-seat declarations; otherwise NULL. |
| kind | NULL if not applicable or not established. A required target constraint blocks projection pending review; preserve owning evidence in raw_json. |
| sequence_no | NULL if not applicable or not established. A required target constraint blocks projection pending review; preserve owning evidence in raw_json. |
| supersedes_id | NULL if not applicable or not established. A required target constraint blocks projection pending review; preserve owning evidence in raw_json. |
| legal_outcome | NULL if not applicable or not established. A required target constraint blocks projection pending review; preserve owning evidence in raw_json. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## result_row

| Column | Proposed mapping / disposition |
|---|---|
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| history_key | Stable office + supported election date + proceeding kind where necessary. |
| result_row_id | results.result_id |
| proceeding_id | Proposed proceeding ID only for explicitly sourced additional-seat declarations; otherwise NULL. |
| country_id | malta |
| candidate_or_list_label | results.name |
| original_party_label | results.party_label; literal source spelling. |
| original_party_code | NULL unless explicitly given; do not guess code from label. |
| party_namespace | NULL: canonical party mapping not reviewed. |
| party_mapping_id | NULL: preserve source party labels. |
| votes | results.votes = first-count candidate tally only. STV transfers/count tallies remain separate fidelity records; never sum counts. |
| votes_status | results.votes_status; missing/ellipsis, unopposed and indirect tally not known are distinct. |
| share | results.share; EP source-reported percent only, no invented candidate denominator. |
| share_status | reported if nonnull; otherwise unknown/not_applicable by mechanism. |
| share_unit | percent |
| seats | results.seats only where explicitly stated; initial candidate elected flag is separate. |
| seats_status | reported if nonnull, else unknown; preserve actual EP Other parties seats=0. |
| elected_flag | results.elected refers to original count for candidate-first-preference rows. Later casual/constitutional entries are retained in post-election observations, not silently promoted to initial winners. |
| is_substitute | NULL unless source establishes it. |
| evidence_status | Event/source result status plus row-specific EP final/constitutive qualifier. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## party_mapping

| Column | Proposed mapping / disposition |
|---|---|
| country_id | NO ROW — No approved canonical alignment. |
| party_namespace | NO ROW — No approved canonical alignment. |
| mapping_id | NO ROW — No approved canonical alignment. |
| source_context | NO ROW — No approved canonical alignment. |
| election_context | NO ROW — No approved canonical alignment. |
| original_label | NO ROW — No approved canonical alignment. |
| original_code | NO ROW — No approved canonical alignment. |
| mapped_group | NO ROW — No approved canonical alignment. |
| uncertainty | NO ROW — No approved canonical alignment. |
| lineage_id | NO ROW — No approved canonical alignment. |
| release_id | NO ROW — No approved canonical alignment. |
| raw_json | NO ROW — No approved canonical alignment. |

## source

| Column | Proposed mapping / disposition |
|---|---|
| country_id | malta |
| source_namespace | malta-official-research |
| source_id | Exact source-inventory.source_id; hashes cover the retained capture kind, not necessarily original server bytes. |
| publisher | source-inventory.publisher_host |
| title | Source page heading or retained capture descriptor |
| url | source-inventory.url |
| checked_as_of_label | 2026-09-22 |
| evidence_grade | Official publisher; capture precision and legal certification separately stated. |
| file_sha256 | source-inventory.sha256 |
| locator | source-inventory.path |
| data_rights | Source-specific; this pack does not assert a blanket licence. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## record_locator

| Column | Proposed mapping / disposition |
|---|---|
| record_key | entity_kind + exact stable entity identifier. |
| entity_kind | office / event / result / source |
| country_id | malta |
| geography_id | Proposed MT-G- + legal locality/region identity; district is a reporting-unit geography, never an extra parliament office. |
| id_namespace | Proposed atlas-malta-research-v1; explicit reviewed crosswalk required before namespace reuse. |
| office_id | office-register.office_id; results resolve through events.event_id. |
| history_key | Stable office + supported election date + proceeding kind where necessary. |
| proceeding_id | Proposed proceeding ID only for explicitly sourced additional-seat declarations; otherwise NULL. |
| result_row_id | results.result_id |
| party_namespace | NULL: canonical party mapping not reviewed. |
| party_mapping_id | NULL: preserve source party labels. |
| source_namespace | malta-official-research |
| source_id | Exact source-inventory.source_id; hashes cover the retained capture kind, not necessarily original server bytes. |
| input_path | Exact retained source or data relative path. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| source_row_locator | results.source_locator; STV count records retain table row and column positions. |

## evidence_link

| Column | Proposed mapping / disposition |
|---|---|
| evidence_id | Deterministic hash of record key + source ID + locator + claim kind. |
| record_key | entity_kind + exact stable entity identifier. |
| source_country_id | malta |
| source_namespace | malta-official-research |
| source_id | Exact source-inventory.source_id; hashes cover the retained capture kind, not necessarily original server bytes. |
| source_locator | Exact source table/cell or declared paragraph locator. |
| claim_kind | existence / electoral mechanism / first preference / count transfer / outcome / election date / creation gate |
| date_claim_id | Date FK only for a date claim, otherwise NULL. |
| claim_json | Exact source values with result phase, ballot universe and capture kind. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |

## unresolved_evidence

| Column | Proposed mapping / disposition |
|---|---|
| unresolved_id | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| record_key | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| original_token | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| source_locator | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| reason | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| lineage_id | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| release_id | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |
| raw_json | NO ROW — No fabricated unresolved FK rows; substantive open evidence is enumerated in research-gaps. |

## identity_crosswalk

| Column | Proposed mapping / disposition |
|---|---|
| entity_kind | office / candidate observation / source reporting unit |
| upstream_namespace | EC election ID + zone ID + candidate ID; Address Registrar locality name for register. |
| upstream_id | Literal source identifier, qualified by election context. |
| record_key | entity_kind + exact stable entity identifier. |
| reason | Name normalization for matching only; preserve diacritics/raw labels. No legal merger/successor links guessed. |
| lineage_id | Fixed proposed country-package-malta; no lineage written. |
| release_id | Future lineage + SHA256 of canonical effective-input inventory; no operational release exists. |
| raw_json | Lossless owning source object plus source/capture ID and locator. Preserve electoral college, reporting scope, initial versus later selection, every STV count and original text token. |

## publication_release

| Column | Proposed mapping / disposition |
|---|---|
| lineage_id | NO ROW — Not run: research only. |
| release_id | NO ROW — Not run: research only. |

## publication_receipt

| Column | Proposed mapping / disposition |
|---|---|
| singleton | NO ROW — Not run: no publication. |
| last_publish_attempt_id | NO ROW — Not run: no publication. |
| attempted_lineage_id | NO ROW — Not run: no publication. |
| attempted_release_id | NO ROW — Not run: no publication. |

## ingest_attempt

| Column | Proposed mapping / disposition |
|---|---|
| attempt_id | NO ROW — Not run: no importer, database or operational changes. |
| lineage_id | NO ROW — Not run: no importer, database or operational changes. |
| operator | NO ROW — Not run: no importer, database or operational changes. |
| script_version | NO ROW — Not run: no importer, database or operational changes. |
| started_at | NO ROW — Not run: no importer, database or operational changes. |
| finished_at | NO ROW — Not run: no importer, database or operational changes. |
| status | NO ROW — Not run: no importer, database or operational changes. |
| input_inventory_json | NO ROW — Not run: no importer, database or operational changes. |
| successful_release_id | NO ROW — Not run: no importer, database or operational changes. |
| publication_set_json | NO ROW — Not run: no importer, database or operational changes. |
| row_counts_json | NO ROW — Not run: no importer, database or operational changes. |
| error_text | NO ROW — Not run: no importer, database or operational changes. |

