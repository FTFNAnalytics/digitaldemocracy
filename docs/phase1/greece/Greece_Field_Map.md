# Greece field map: all 223 supplied contract columns

This is an explicit mapping specification, not an importer. No SQL is executed. All release/publication/attempt fields remain operationally unassigned.

## ingest_attempt

| Column | Research mapping |
|---|---|
| `attempt_id` | No attempt row created. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `operator` | Unassigned; Justin has not authorized ingestion. |
| `script_version` | No importer script supplied. |
| `started_at` | NULL; no ingest started. |
| `finished_at` | NULL; no ingest completed. |
| `status` | No status; research validation is not ingest success. |
| `input_inventory_json` | Would require authorized operational attempt inventory; current source inventory is documentation only. |
| `successful_release_id` | NULL; never fabricate success. |
| `publication_set_json` | NULL; no publication set selected. |
| `row_counts_json` | No operational attempt counts; research counts remain in counts.json. |
| `error_text` | No ingest attempted. Retrieval errors/gaps are research evidence, not fabricated ingest failures. |

## dataset_lineage

| Column | Research mapping |
|---|---|
| `lineage_id` | Proposed country-package-greece; not written. |
| `provenance_kind` | country_package, if later authorized. |
| `description` | Greece research package, rebuilt official-source snapshot. |

## dataset_release

| Column | Research mapping |
|---|---|
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned; never mint a successful release for this research job. |
| `fingerprint_sha256` | Future canonical input/override/version fingerprint, NOT the ZIP digest. |
| `hash_inputs_json` | Future sorted inventory, tier checksum, overrides (none), method and schema versions. |
| `adapter_version` | No importer/adapter supplied. |
| `method_version` | Research extraction v2 only; not an importer version. |
| `schema_version` | Read-only supplied 0001/0002 contracts; 223 documented columns. |
| `research_snapshot_label` | 2026-09-22 research retrieval. |
| `upstream_release_id` | NULL; no upstream Atlas release asserted. |
| `validated_counts_json` | counts.json is a research count artifact only. |
| `research_coverage_complete` | 0: explicit historical/source-finality gaps remain. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## publication_release

| Column | Research mapping |
|---|---|
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |

## publication_receipt

| Column | Research mapping |
|---|---|
| `singleton` | No receipt row; no publication. |
| `last_publish_attempt_id` | Unassigned; no publication attempt. |
| `attempted_lineage_id` | Unassigned; research did not attempt publication. |
| `attempted_release_id` | Unassigned; no release pointer mutation. |

## retained_input

| Column | Research mapping |
|---|---|
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `input_path` | Exact package-relative retained file path; see SHA256SUMS. |
| `input_kind` | package for delivered research inputs; tier_classification for tier file; artifact for frozen HTML/JS/PDF. |
| `sha256` | SHA-256 of original file bytes, not reserialized JSON. Manifest hashes are recomputed by the validator. |
| `byte_count` | Original-byte count in inventory/manifest. |
| `recovery_locator` | Exact retained relative path plus original URL where known. |
| `payload_json` | Original JSON where valid JSON; NULL for HTML/JS/PDF. Never treat arbitrary JS as JSON or execute source code. |

## country

| Column | Research mapping |
|---|---|
| `country_id` | Constant greece; ISO country code GR is separate. |
| `country_code` | GR. |
| `name` | Source name as retained; Greek accents and source aliases preserved. Display normalization does not change identity. |
| `polity_kind` | sovereign_country. |
| `region_id` | Europe; this is not an office tier. |
| `coverage_status` | partial: current register complete, historical numeric vectors have explicit gaps. |
| `screening_as_of_label` | 2026-09-22; retrieval date, not election day. |
| `notes` | Full office/history scope is independent of the 18-month alert horizon. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## geography

| Column | Research mapping |
|---|---|
| `country_id` | Constant greece; ISO country code GR is separate. |
| `geography_id` | Exact source-coded geography_id. Split versions have PRE2019 suffix. Never join by name alone. |
| `name` | Source name as retained; Greek accents and source aliases preserved. Display normalization does not change identity. |
| `parent_geography_id` | Source regionId to GR-R-##; regions to GR. The two Irakleio municipalities are separately identified by region. |
| `effective_from_label` | 2019-09-01 for the twelve constituted split units; 2011-01-01 for five historical Kallikratis units as stated in circular 83. Otherwise unknown. |
| `effective_to_label` | 2019-08-31 for the five abolished municipalities, from circular 83; current units NULL. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## research_date

| Column | Research mapping |
|---|---|
| `date_id` | Future record-owned key, not an election identity. |
| `label` | Exact date label from event/proceeding, retaining year precision for older EP pages and the 1975 date conflict. |
| `precision` | day or year as retained; unknown future dates remain unknown. No invented month/day. |
| `certainty` | called for evidenced held poll labels; unknown for unsourced future dates. This does not certify results. |
| `year` | Parse only the retained known year. |
| `month` | Parse only where precision is day/month; NULL for year/unknown. |
| `day` | Parse only where precision is day; NULL otherwise. |
| `range_start_id` | NULL: this pack does not create date ranges. |
| `range_end_id` | NULL: no fabricated alert-window endpoints. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## office

| Column | Research mapping |
|---|---|
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `country_id` | Constant greece; ISO country code GR is separate. |
| `geography_id` | Exact source-coded geography_id. Split versions have PRE2019 suffix. Never join by name alone. |
| `name` | Source name as retained; Greek accents and source aliases preserved. Display normalization does not change identity. |
| `office_type` | Exact office_type, independent of tier and election mechanism. |
| `office_status` | current or historical exactly as registered; current=693, historical=10. |
| `record_state` | Research row record_state=active; historical is an office status, not a withdrawal. No unsupported supersession is asserted. |
| `state_note` | NULL for active research rows; any future withdrawal/supersession requires an explicit sourced reason. |
| `registry_qualified` | 1 for source-evidenced bodies/roles; no appointee offices. |
| `next_date_id` | NULL: no unsupported called future election date is created. |
| `next_date_resolution` | unknown; next ordinary-cycle context is discussed separately, with no date coercion. |
| `next_history_key` | NULL: no invented next event or shared latest-history link. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## office_tier_classification

| Column | Research mapping |
|---|---|
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `tier` | Interchange national maps to national_context; regional, municipal and other retain spelling. EP other remains a draft decision. |
| `review_status` | needs_review for every one of the 703 rows. Never approved. |
| `rationale` | Exact role/level rationale; alert timing never determines tier. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `classification_path` | schemas/atlas/tiers/greece.json. |
| `classification_kind` | tier_classification. |
| `classification_sha256` | Exact tier-file digest in SHA256SUMS. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## election_event

| Column | Research mapping |
|---|---|
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `history_key` | Exact office-scoped cycle key: YYYY-local, a national poll date/year, or the evidenced presidential cycle. |
| `event_id` | Exact internal greece--event-* key, explicitly not a public source election identifier. |
| `date_id` | Future typed research_date key derived from record-owned date and precision; no synthetic January 1 for years. |
| `date_resolution` | resolved to the retained precision; 1975 presidential day conflict is retained at year precision with competing day claims, not silently resolved. |
| `event_kind` | ordinary for general popular contests; indirect for Presidency. No inferred repeat election from a runoff. |
| `selected_history_role` | none until an explicit reviewed selection exists; not selected merely because recent. |
| `electoral_system` | Retain office mechanism and cycle-specific reform notes; no cross-cycle one-rule assumption. |
| `comparability` | Preserve joint-ballot projection, boundary version, council seat formula, snapshot coverage and MP-only vote universe. |
| `ballot_basis` | list_votes for published party/joint-ticket results; electors for presidential MP ballots. |
| `share_unit` | percent_0_100. |
| `legal_outcome` | Preserve record legal_outcome. 100% reporting, portal official=1 and court-reconciled are distinct facts; do not infer certified from any of them alone. |
| `record_state` | Research row record_state=active; historical is an office status, not a withdrawal. No unsupported supersession is asserted. |
| `state_note` | NULL for active research rows; any future withdrawal/supersession requires an explicit sourced reason. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## proceeding

| Column | Research mapping |
|---|---|
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `history_key` | Exact office-scoped cycle key: YYYY-local, a national poll date/year, or the evidenced presidential cycle. |
| `proceeding_id` | Exact documented proceeding_id, or NULL when the source gives a historical outcome without a known ballot or when council votes and final seats are event-level. |
| `kind` | first_round / runoff for actual local rounds; repeat for subsequent parliamentary ballots. Biography-only unknown rounds have no invented proceeding. |
| `sequence_no` | Source-evidenced sequence only; 2014-2015 links three failed ballots and the new-Parliament ballot within one research cycle. |
| `supersedes_id` | NULL. A second round does not annul or replace first-round votes. |
| `legal_outcome` | Preserve record legal_outcome. 100% reporting, portal official=1 and court-reconciled are distinct facts; do not infer certified from any of them alone. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## source

| Column | Research mapping |
|---|---|
| `country_id` | Constant greece; ISO country code GR is separate. |
| `source_namespace` | Proposed greece-official-public-sources; no cross-country source namespace reuse. |
| `source_id` | Exact greece--src-* identifier in the inventory, resolved to original bytes, URL and SHA-256. |
| `publisher` | Exact inventory publisher; SingularLogic is used only through the Ministry-linked official archive. |
| `title` | Use source role/path plus evidenced document title; no invented formal publication title. |
| `url` | Exact retrieval URL and final_url retained in raw_json. |
| `checked_as_of_label` | Inventory retrieved_at, not source publication or certification date. |
| `evidence_grade` | Primary original source unless explicitly qualified as official-hosted journalistic reprint; source-holds remain visible. |
| `file_sha256` | Inventory sha256 over original bytes. |
| `locator` | Exact package-relative source path. |
| `data_rights` | unknown unless an explicit source licence is documented; public access does not imply public domain. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## party_mapping

| Column | Research mapping |
|---|---|
| `country_id` | Constant greece; ISO country code GR is separate. |
| `party_namespace` | NULL until explicit reviewed party mapping exists. Local slate and candidate codes are scoped to authority and cycle, never global party IDs. |
| `mapping_id` | No mapping rows materialized; future key must be scoped to source/election. |
| `source_context` | Underlying observation source path plus local authority, if applicable. |
| `election_context` | Exact event history context; do not carry identifiers across cycles automatically. |
| `original_label` | Retained party/list label, including aggregate categories. |
| `original_code` | Retained source code, when present. |
| `mapped_group` | NULL. No guessed mergers, party successors or coalition equivalences. |
| `uncertainty` | Unmapped; review required before any grouping. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## result_row

| Column | Research mapping |
|---|---|
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `history_key` | Exact office-scoped cycle key: YYYY-local, a national poll date/year, or the evidenced presidential cycle. |
| `result_row_id` | Exact deterministic result_row_id bound to office, event, proceeding and underlying observation; not a source-issued ID. |
| `proceeding_id` | Exact documented proceeding_id, or NULL when the source gives a historical outcome without a known ballot or when council votes and final seats are event-level. |
| `country_id` | Constant greece; ISO country code GR is separate. |
| `candidate_or_list_label` | Exact source candidate/list label; executive labels use ticket head, councils use slate name. |
| `original_party_label` | Source slate/party label; no national-party affiliation inferred for local lists. |
| `original_party_code` | Source code only when explicitly available; election and authority scope retained. |
| `party_namespace` | NULL until explicit reviewed party mapping exists. Local slate and candidate codes are scoped to authority and cycle, never global party IDs. |
| `party_mapping_id` | NULL: no cross-cycle party/coalition equivalence has been asserted. |
| `votes` | Published AVOTES/BVOTES/VOTES or parliamentary MP ballot count. Council and executive projections refer to the same observation. |
| `votes_status` | recorded, zero, or unknown exactly; never zero-fill absent runoffs or older missing vote counts. |
| `share` | Published percentage only; no percentage manufactured for MP ballots or early EP seat-only returns. |
| `share_status` | recorded/zero if a source value exists; unknown for absent source values. |
| `share_unit` | percent_0_100; never interpret as proportion. |
| `seats` | Council final published allocation using evidenced cycle formula; national Edres+EdresEpik; EP source seats. Executive seats NULL. |
| `seats_status` | not_applicable for direct/indirect executives; source status or unknown for assemblies. Messini incomplete allocation is explicitly qualified. |
| `elected_flag` | For executives only when source winner/outcome is known and ballot is decisive; no winner from rank, max votes, tie, or first-round lead. |
| `is_substitute` | NULL; no substitute-candidate assertion. |
| `evidence_status` | recorded or preliminary as retained; missing numerical field statuses remain independent. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## record_locator

| Column | Research mapping |
|---|---|
| `record_key` | Future deterministic encoding of the actual typed target's complete key; no untyped free-form target FK. |
| `entity_kind` | Infer only from actual target kind (country, geography, office, event, proceeding, result_row, source, input); validate one legal target shape. |
| `country_id` | Constant greece; ISO country code GR is separate. |
| `geography_id` | Exact source-coded geography_id. Split versions have PRE2019 suffix. Never join by name alone. |
| `id_namespace` | Research namespace greece-ypes-research-v2; IDs are declared internal research identities, not official public election IDs. |
| `office_id` | Exact office_id; national GR-PARL / GR-PRES / GR-EP; source-coded municipal/regional identities, including five PRE2019 versions. |
| `history_key` | Exact office-scoped cycle key: YYYY-local, a national poll date/year, or the evidenced presidential cycle. |
| `proceeding_id` | Exact documented proceeding_id, or NULL when the source gives a historical outcome without a known ballot or when council votes and final seats are event-level. |
| `result_row_id` | Exact deterministic result_row_id bound to office, event, proceeding and underlying observation; not a source-issued ID. |
| `party_namespace` | NULL until explicit reviewed party mapping exists. Local slate and candidate codes are scoped to authority and cycle, never global party IDs. |
| `party_mapping_id` | NULL: no cross-cycle party/coalition equivalence has been asserted. |
| `source_namespace` | Proposed greece-official-public-sources; no cross-country source namespace reuse. |
| `source_id` | Exact greece--src-* identifier in the inventory, resolved to original bytes, URL and SHA-256. |
| `input_path` | Exact package-relative retained file path; see SHA256SUMS. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `source_row_locator` | Retained observation locator and source path, not a generic homepage citation. |

## evidence_link

| Column | Research mapping |
|---|---|
| `evidence_id` | Future deterministic target+source+claim key. |
| `record_key` | Future deterministic encoding of the actual typed target's complete key; no untyped free-form target FK. |
| `source_country_id` | greece. |
| `source_namespace` | Proposed greece-official-public-sources; no cross-country source namespace reuse. |
| `source_id` | Exact greece--src-* identifier in the inventory, resolved to original bytes, URL and SHA-256. |
| `source_locator` | Exact JSON pointer / JS variable and key / HTML table row / PDF page recorded on the underlying observation; preserve page-number convention. |
| `claim_kind` | Identity, date, votes, seats, mechanism, reform or source-conflict as evidenced. |
| `date_claim_id` | Future typed date claim only for explicit date evidence; otherwise NULL. |
| `claim_json` | Retain source pointer, source fields/formula and claim scope; no certification inferred. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |

## unresolved_evidence

| Column | Research mapping |
|---|---|
| `unresolved_id` | Stable research gap/hold key. |
| `record_key` | Future deterministic encoding of the actual typed target's complete key; no untyped free-form target FK. |
| `original_token` | Exact unresolved source datum or missing field label. |
| `source_locator` | Exact JSON pointer / JS variable and key / HTML table row / PDF page recorded on the underlying observation; preserve page-number convention. |
| `reason` | Specific gap/hold explanation and named closure evidence; not a generic incomplete-history label. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

## identity_crosswalk

| Column | Research mapping |
|---|---|
| `entity_kind` | Infer only from actual target kind (country, geography, office, event, proceeding, result_row, source, input); validate one legal target shape. |
| `upstream_namespace` | Exact source/cycle/version/role-scoped upstream_namespace. |
| `upstream_id` | Exact authority code + office role; historical version scope prevents reused-code collision. |
| `record_key` | Future deterministic encoding of the actual typed target's complete key; no untyped free-form target FK. |
| `reason` | Source authority/role correspondence; no old ordinal IDs or guessed merger edge. |
| `lineage_id` | Proposed country-package-greece only; no lineage or release has been written. |
| `release_id` | Unassigned. A future authorized import must supply the verified immutable release ID; never use an attempt ID. |
| `raw_json` | Losslessly retain the complete corresponding research row, source codes/lexemes, null reasons, locators and interpretive qualifiers. Do not discard shared_ballot_id. |

