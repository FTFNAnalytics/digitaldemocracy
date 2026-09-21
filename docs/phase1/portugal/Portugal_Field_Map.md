# Portugal → Atlas field map — Prompt AD

Pinned main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. **Draft documentary specification; importer/SQLite/VPS/UI Not run.** Exactly223 columns across20 requested tables. schema_migration remains DDL-owned. No runtime publication/attempt rows are authored as research.

## Sources and conversion contract

Root `data/research/portugal/`: O=office-register.json; G=geographies.json; E=events.json; P=proceedings.json; R=results.jsonl.gz; S=sources.json; U=research-gaps.json; CW=identity-crosswalk.json. T=`schemas/atlas/tiers/portugal.json`. The source→documentary projection is specified in [Source_Projection_Contract.md](Source_Projection_Contract.md); this map specifies documentary→DDL. [Portugal_Identity_Rules.md](Portugal_Identity_Rules.md) defines exactC/H/K and keys. All original workbooks/PDF/HTML/JS and archive members remain retained input; never execute source formulas/scripts.

One office row is a body or mandate, not necessarily an independent ballot. CM votes are not recopied to its president; AF votes are not recopied to its junta or president. CNE mandate0/Plenário creates no AF. Unknown extra upstream columns survive raw_json and byte-identical retained input. Historic alias qualification is explicitly0 pending review; no guessed successors.

Each field inherits its table's full natural key and source evidence. Reject any mismatch between source cells and projection, missing resolved FK, source hash or DDL domain. Every missing scalar remainsNULL with correspondingunknown status; explicit0 remains0/zero. Runtime tests below are future gates, not executedCI.

## dataset_lineage (3 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | constantsL; report | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full dataset_lineage natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `provenance_kind` | constantsL; report | country_package; new Portuguese primary-sourced research, separate from any frozen screening extract. | Inherit full dataset_lineage natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `description` | constantsL; report | Portugal complete captured2025 current CNE jurisdiction/body register, source-era historical bindings and certified maps with explicit numerical/legal holds. | Inherit full dataset_lineage natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## dataset_release (12 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | Inventory/hash_inputs | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | Inventory/hash_inputs | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | Inventory/hash_inputs | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `fingerprint_sha256` | Inventory/hash_inputs | H(Inventory /hash_inputs), compact recursively sorted UTF-8 JSON; not ZIP SHA. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `hash_inputs_json` | Inventory/hash_inputs | C(Inventory /hash_inputs): effective source/research/tier file hashes + accepted overrides(empty) + adapter/method/schema versions + DDL hashes. No attempts, wall clock, reports, vectors or unrelated lineages. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `adapter_version` | Inventory/hash_inputs | atlas-portugal-full-register/1 (documentary specification). | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `method_version` | Inventory/hash_inputs | atlas-preserve-evidence/1. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `schema_version` | Inventory/hash_inputs | atlas-master/1. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `research_snapshot_label` | Inventory/hash_inputs | 2026-09-20 source capture; not a polling date. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `upstream_release_id` | Inventory/hash_inputs | NULL: no prior Portuguese Atlas citation alias supplied. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `validated_counts_json` | Inventory/hash_inputs | Inventory /verified_counts exactly; documentary rows distinguished from imported counts. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `research_coverage_complete` | Inventory/hash_inputs | 0. Historical identity, parish reform, special/repeat dates, aggregate conflicts and post-register change gates remain. | Inherit full dataset_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## publication_release (2 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | future publication set | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full publication_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | future publication set | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full publication_release natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## publication_receipt (4 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `singleton` | future runtime | 1 in future successful staging only. | Inherit full publication_receipt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `last_publish_attempt_id` | future runtime | Actual durable ledger attempt_id; never used as citation/release identity. | Inherit full publication_receipt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `attempted_lineage_id` | future runtime | L. | Inherit full publication_receipt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `attempted_release_id` | future runtime | R, FK publication_release(L,R). | Inherit full publication_receipt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## retained_input (8 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | Inventory/hash_inputs/inputs/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | Inventory/hash_inputs/inputs/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `input_path` | Inventory/hash_inputs/inputs/i | Inventory /hash_inputs/inputs/i/input_path; exact ZIP member. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `input_kind` | Inventory/hash_inputs/inputs/i | tier_classification for tier JSON, package for original sources and derived research; override only for future accepted override; do not ingest this draft as an accepted override. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `sha256` | Inventory/hash_inputs/inputs/i | Inventory descriptor SHA256 of exact bytes; mismatch fails closed. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `byte_count` | Inventory/hash_inputs/inputs/i | Exact descriptor byte_count integer>=0. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `recovery_locator` | Inventory/hash_inputs/inputs/i | ZIP member path + SHA; future durable store must return identical original bytes. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `payload_json` | Inventory/hash_inputs/inputs/i | Exact JSON payload when applicable; NULL for gzip/XLS/XLSX/CSV/HTML/JS/binary. Preserve original artifact intact, do not execute formulas/scripts. JSONL is retained as original compressed artifact; each decoded row survives entity raw_json. | Inherit full retained_input natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## country (11 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `country_id` | report+U | Constant portugal; FK country(country_id). | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | report+U | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | report+U | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | report+U | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `country_code` | report+U | PT. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `name` | report+U | Portugal, preserving official Portuguese orthography. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `polity_kind` | report+U | sovereign_country. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `region_id` | report+U | europe; alert window does not restrict office membership. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `coverage_status` | report+U | partial: complete captured CNE2025 current territorial roster; historical/legal/repeat/alias gates explicitly open. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `screening_as_of_label` | report+U | 2026-09-20. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `notes` | report+U | C(U); parish reforms/plenaries/list-head mechanisms, regions, source-code conflicts, published aggregate discrepancies, EP and date gates. | Inherit full country natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## geography (9 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `country_id` | G/i | Constant portugal; FK country(country_id). | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | G/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | G/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | G/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `geography_id` | G/i | G /i/geography_id: PT; PT-AC/PT-MA; PT-M plus exact four-character CNE current municipal code; PT-F plus exact six-character parish code; source-era changed code/name adds -H+H([code,NFC-uppercase-whitespace-collapsed source name])[:12]. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `name` | G/i | G /i/name exactly; no invented translations. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `parent_geography_id` | G/i | G /i/parent_geography_id exact: current parish→source municipal prefix; current municipality→PT or evidenced autonomous region. Historical unknown parentNULL; never a guessed successor. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `effective_from_label` | G/i | NULL; a first appearance in an election archive is not a legal creation date. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `effective_to_label` | G/i | NULL: absent/current-name-variant is not a proven abolition date. | Inherit full geography natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## research_date (12 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | E/i/date or P/i/date | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | E/i/date or P/i/date | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | E/i/date or P/i/date | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `date_id` | E/i/date or P/i/date | date- + H([N,owner_kind,owner_id,slot]); event slot election uses event_id; office slot next uses office_id. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `label` | E/i/date or P/i/date | E /i/date/value: local cycle year only; AR2022 Europe year only; other typed national/regional/EP polling days as cited. P /i/date preserved as proceeding claim. Office nextNULL creates no date row. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `precision` | E/i/date or P/i/date | E.date.precision year/day; P date day. No fabricated month/day from cycle cadence. Future month/range/unknown supported. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `certainty` | E/i/date or P/i/date | E.date.certainty and P.date.certainty called for source-known historic cycle/day; unknown for absent next date. Called is DDL vocabulary, not a certification assertion. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `year` | E/i/date or P/i/date | Integer first four digits of label for known date; NULL unknown. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `month` | E/i/date or P/i/date | Only characters 6–7 of a day/month source date; otherwise NULL. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `day` | E/i/date or P/i/date | Only characters 9–10 of day-precision label; otherwise NULL. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `range_start_id` | E/i/date or P/i/date | NULL for all present date claims; future range only references two real research_date rows. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `range_end_id` | E/i/date or P/i/date | NULL for present claims; no inferred endpoint. | Inherit full research_date natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## office (16 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `id_namespace` | O/i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | O/i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `country_id` | O/i | Constant portugal; FK country(country_id). | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | O/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | O/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | O/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `geography_id` | O/i | O /i/geography_id; FK (portugal,geography_id) to G. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `name` | O/i | O /i/name: sourced jurisdiction plus legal body/mandate name. Descriptive label is authored; original official source spelling survives raw and evidence. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_type` | O/i | O /i/office_type: municipal_assembly, municipal_executive_body, municipal_president, parish_assembly, parish_executive_body, parish_president, parliament, national_president, regional_parliament, european_parliament_delegation. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_status` | O/i | O /i/office_status current or historical. Historical means source-era record pending current alias/abolition review, not proven abolished jurisdiction. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_state` | O/i | active for supplied offices; never delete/withdraw because refresh omits a record. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `state_note` | O/i | NULL for active; future explicit withdrawal/supersession requires sourced nonempty reason. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `registry_qualified` | O/i | O /i/registry_qualified:1 current CNE/body identities;0 historical code/name variants awaiting binding acceptance. Retain all rows and histories; no silent deletion. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `next_date_id` | O/i | NULL for all current documentary next fields. Future sourced next date only→date-+H([N,office,office_id,next]). | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `next_date_resolution` | O/i | unknown for all present rows; object with value NULL is not resolved. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `next_history_key` | O/i | NULL; no prospective event invented from cadence. | Inherit full office natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## office_tier_classification (11 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `id_namespace` | T/classifications/i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | T/classifications/i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | T/classifications/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | T/classifications/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | T/classifications/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `tier` | T/classifications/i | T /classifications/i/tier only: national→national_context; regional/municipal/other unchanged. Unknown would map NULL, never other. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `review_status` | T/classifications/i | needs_review for this draft. Future approved accepted file required by publication gate; no implied acceptance from clean flags. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `rationale` | T/classifications/i | T /classifications/i/rationale verbatim, nonempty; evidence is body type and geography, never calendar cohort. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `classification_path` | T/classifications/i | schemas/atlas/tiers/portugal.json. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `classification_kind` | T/classifications/i | tier_classification. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `classification_sha256` | T/classifications/i | SHA256(T exact bytes), FK same checksummed retained_input. | Inherit full office_tier_classification natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## election_event (18 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `id_namespace` | E/i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | E/i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `history_key` | E/i | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | E/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | E/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | E/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `event_id` | E/i | E /i/event_id = K(event,[portugal,N,history_key]); no random ID. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `date_id` | E/i | date- + H([N,event,event_id,election]); real research_date FK. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `date_resolution` | E/i | resolved when source year/day is supplied, unknown with explicit unknown research_date if absent; conflicting requires NULL and unresolved claims. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `event_kind` | E/i | ordinary for typed CNE cycle maps. No special event inferred from unparsed news. Presidential2026 rounds are proceedings of one cycle. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `selected_history_role` | E/i | selected for the typed published historic result context. This is not a completeness or litigation assertion. Plenary/no-return rows have no invented completed event. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `electoral_system` | E/i | NULL unless explicitly projected from a sourced institutional note; raw district/ballot structure retained. Do not infer proportional versus majority from party labels. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `comparability` | E/i | NULL. No computed competition/tightness or inferred pre/post-reform comparability. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `ballot_basis` | E/i | valid_votes for local/PR/regional/EP and AR2019+; including_blank_invalid for AR2009/2011/2015 published percentages. EP older sharesNULL. No denominator harmonization. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `share_unit` | E/i | percent_0_100. Copy source percentage values; no generated ratio. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `legal_outcome` | E/i | certified means published CNE Mapa Oficial/ata source, including corrected maps where supplied. Numerical disputes remain evidence_status disputed and explicit holds; this does not certify all subsequent court/vacancy history. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_state` | E/i | active. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `state_note` | E/i | NULL for active. | Inherit full election_event natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## proceeding (11 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `id_namespace` | P/i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | P/i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `history_key` | P/i | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | P/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | P/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | P/i | C(P row), including exact proceeding date. DDL proceeding has no date column; retain date and attach research_date through evidence_link.date_claim_id. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `proceeding_id` | P/i | P /i/proceeding_id = K(proceeding,[N,office_id,history_key,round,sequence_no]); no random IDs. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `kind` | P/i | P /i/proceeding_type: first_round/runoff for the two2026 presidential ballots only. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `sequence_no` | P/i | P /i/sequence_no1 or2 from source first/second sufrágio. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `supersedes_id` | P/i | NULL. A runoff does not erase/supersede the first-round evidence. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `legal_outcome` | P/i | certified as published CNE maps; runoff numerical caveat retained in raw/evidence. No invented annulment/certification proceedings. | Inherit full proceeding natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## source (14 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `country_id` | S/i | Constant portugal; FK country(country_id). | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | S/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | S/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | S/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_id` | S/i | S /i/source_id = portugal-- + K(source,[exactURL,NULL]). Original archive URL owns extracted-member claims; extracted member hash adds locator, not new fake URL. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_namespace` | S/i | L. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `publisher` | S/i | S /i/publisher: CNE, Assembleia da República or SGMAI as retained source host; no invented licence or publisher. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `title` | S/i | S /i/title, explicit documentary artifact title/filename, not invented publication title. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `url` | S/i | S /i/url exact retrieval URL; never manufacture unresolved URL. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `checked_as_of_label` | S/i | S /i/retrieved_at2026-09-20. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `evidence_grade` | S/i | primary_official for acquired official materials; not a legal certification flag. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `file_sha256` | S/i | S /i/sha256 exact retained bytes. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `locator` | S/i | S /i/input_path plus exact retrieval URL. Workbook evidence uses sheet and1-based cells; PDF uses original page/table row/column; archive membership retained. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `data_rights` | S/i | unknown unless exact source grants a licence. Public access alone is not licence evidence. | Inherit full source natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## party_mapping (12 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `country_id` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `party_namespace` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `mapping_id` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_context` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `election_context` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `original_label` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `original_code` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `mapped_group` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `uncertainty` | no supported mapping/omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit full party_mapping natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## result_row (24 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `id_namespace` | R decoded1-basedJSONLline | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | R decoded1-basedJSONLline | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `history_key` | R decoded1-basedJSONLline | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `country_id` | R decoded1-basedJSONLline | Constant portugal; FK country(country_id). | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | R decoded1-basedJSONLline | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | R decoded1-basedJSONLline | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | R decoded1-basedJSONLline | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `result_row_id` | R decoded1-basedJSONLline | R line/result_row_id = K(result,[N,office_id,history_key,proceeding_id-or-NULL,identity_token]); vectors include full preimage. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `proceeding_id` | R decoded1-basedJSONLline | R line/proceeding_id; exact first-round/runoff FK, otherwise NULL for council/parliament/EP candidate row. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `candidate_or_list_label` | R decoded1-basedJSONLline | R line/source_label exactly: published candidate/list name; local slot resolved only by same code/organ annex SIGLA cell. Unresolved[A] etc remain explicit source slots. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `original_party_label` | R decoded1-basedJSONLline | R line/party_name_raw;NULL personal presidential candidate or unresolved source slot. No global party equivalence. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `original_party_code` | R decoded1-basedJSONLline | R.raw.column_header only when literal source party abbreviation; bracketed[A] slots are ballot-local slots, not global party codes. For national/PDF literal abbreviations preserve raw label; otherwiseNULL. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `party_namespace` | R decoded1-basedJSONLline | NULL; no party_mapping FK. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `party_mapping_id` | R decoded1-basedJSONLline | NULL; no unsupported coalition equivalence. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `votes` | R decoded1-basedJSONLline | R line/votes copied from exact workbook Number cell or official PDF Total row; integer exact. Missing/c.r. totalNULL with original token and hold. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `votes_status` | R decoded1-basedJSONLline | R line/votes_status: NULL→unknown, 0→zero, positive→recorded; no blanket missing-to-zero. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `share` | R decoded1-basedJSONLline | R line/share copied from MapII percentage, AR sheet share cell or PDF percentage column. Decimal comma→decimal; cached Excel numeric values preserved. No computed or silently rescaled share. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `share_status` | R decoded1-basedJSONLline | R line/share_status:unknown for absent/dash,zero for explicit numeric0, recorded otherwise. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `share_unit` | R decoded1-basedJSONLline | R line/share_unit percent_0_100. Do not silently multiply ambiguous fractions; source original lexeme retained. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `seats` | R decoded1-basedJSONLline | R line/seats copied only from actual M/md/MD source cell. Numeric0→0; dash/blank→NULL unknown. No seat allocation from votes. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `seats_status` | R decoded1-basedJSONLline | R line/seats_status corresponding to exact seats scalar. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `elected_flag` | R decoded1-basedJSONLline | NULL: no winner inferred from rank. Elected-person mapIII/published candidate text retained for future exact person/outcome mapping. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `is_substitute` | R decoded1-basedJSONLline | NULL: source substitute status not projected; do not fabricate. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `evidence_status` | R decoded1-basedJSONLline | R line/evidence_status recorded or disputed. Disputed: named published aggregate conflicts,2026 runoff omissions,2024 rejected Azores candidature. Values preserved; no production override approved. | Inherit full result_row natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## record_locator (17 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `country_id` | existing target+evidence | portugal for country/geography/office/event/proceeding/result_row/source locators; NULL for input locator, as required by sparse DDL. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `id_namespace` | existing target+evidence | N for office/event/proceeding/result; NULL for country/geography/source/input. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `office_id` | existing target+evidence | Actual O ID for office/event/proceeding/result; NULL otherwise. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `history_key` | existing target+evidence | Actual HK for event/proceeding/result; NULL otherwise. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `lineage_id` | existing target+evidence | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | existing target+evidence | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_key` | existing target+evidence | rec- + H([entity_kind,...full natural-key tuple]); see Identity Rules table for exact tuple. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `entity_kind` | existing target+evidence | country/geography/office/event/proceeding/result_row/source/input/party_mapping only when corresponding real entity exists. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `geography_id` | existing target+evidence | Only geography locator: actual G ID; NULL otherwise, including office/result locators. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `proceeding_id` | existing target+evidence | Only proceeding locator: actual P ID. NULL on result locator even if result_row.proceeding_id non-NULL; obey sparse DDL shape. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `result_row_id` | existing target+evidence | Only result locator: R ID; NULL otherwise. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `party_namespace` | existing target+evidence | NULL; no mapping rows. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `party_mapping_id` | existing target+evidence | NULL; no mapping rows. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_namespace` | existing target+evidence | Only source locator: L; NULL elsewhere. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_id` | existing target+evidence | Only source locator: S source_id; NULL elsewhere. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `input_path` | existing target+evidence | Only input locator: exact retained_input path; NULL elsewhere. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_row_locator` | existing target+evidence | C({derived_path,derived_pointer_or_jsonl_line,evidence}); source XLS/XLSX sheet+1-based row/column, PDF physical page/table/row/column, or archive member. Do not use fabricated JSON pointers for workbook/PDF. | Inherit full record_locator natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## evidence_link (11 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | entity/evidence/j | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | entity/evidence/j | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `evidence_id` | entity/evidence/j | ev- + H([record_key,['portugal',L,source_id],[input_path,archive_entry,locator],claim_kind]); each exact occurrence is preserved, including conflicts. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_key` | entity/evidence/j | Exact target record_locator.record_key; broken target fails closed. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_country_id` | entity/evidence/j | portugal. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_namespace` | entity/evidence/j | L. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_id` | entity/evidence/j | Resolved S ID by exact retained source input; full source FK required. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_locator` | entity/evidence/j | C(original evidence object): retained input path/hash, archive_input_path/archive_entry when applicable, sheet/cell or PDFpage/table locators. Preserve original claim alongside conflict. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `claim_kind` | entity/evidence/j | register_identity, source_scalar, election_date, historical_binding, institutional_mode or gap as supported. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `date_claim_id` | entity/evidence/j | Actual research_date for event/proceeding date claim only. Proceeding date_id= date-+H([N,proceeding,proceeding_id,election]); otherwiseNULL. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `claim_json` | entity/evidence/j | C(original claim/source cells), including withholding/open question where applicable. No invented primary evidence. | Inherit full evidence_link natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## unresolved_evidence (8 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | U/i; unresolved-inputs/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | U/i; unresolved-inputs/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | U/i; unresolved-inputs/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `unresolved_id` | U/i; unresolved-inputs/i | unres- + H([record_key,[documented gap/source locator],original_token]). | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_key` | U/i; unresolved-inputs/i | Actual country locator for broad gaps; existing named office/event/result locator for row-specific holds. Never manufacture source FK. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `original_token` | U/i; unresolved-inputs/i | U /i/original_token or unresolved-inputs /i/token; exact token. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `source_locator` | U/i; unresolved-inputs/i | C(U.evidence or unresolved-inputs.evidence); [] if no retained primary locator; NOT SQLNULL. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `reason` | U/i; unresolved-inputs/i | Source-specific open reason, including numeric conflict, unavailable plenary return, code/name ambiguity or missing source. Broken resolved FK must fail, never be downgraded to unresolved. | Inherit full unresolved_evidence natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## identity_crosswalk (8 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | CW/i | Constant L = country-package-portugal. FK to this lineage, never another publication member. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `release_id` | CW/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `raw_json` | CW/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `entity_kind` | CW/i | office for supplied source-body code to authored Atlas identity; no implicit historical successor. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `upstream_namespace` | CW/i | CW /i/upstream_namespace cne:local-map:<year>. No legacy Observatory IDs supplied. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `upstream_id` | CW/i | CW /i/upstream_id C([source_code,source_organ,source_input_path,one_based_source_row]); includes source row to disambiguate reused/wrong legacy codes. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `record_key` | CW/i | rec- + H([office,N,CW /i/target_office_id]); exact office record locator FK. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `reason` | CW/i | Exact source row→authored office ID; unresolved historic variants stay separate. Not a merger/split or legal successor edge. | Inherit full identity_crosswalk natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## ingest_attempt (12 columns)

| Destination column | Source locator | Conversion / null policy | Identity / evidence / assertion |
|---|---|---|---|
| `lineage_id` | future durable ledger runtime | L=country-package-portugal in durable sibling ledger; logical lineage ownership only, no cross-database foreign key is fabricated. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `attempt_id` | future durable ledger runtime | Actual future newly generated attempt UUID; never authored as historical research or fingerprint input. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `operator` | future durable ledger runtime | Actual future operator supplied by runtime. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `script_version` | future durable ledger runtime | Actual future implementation version; NOT NULL. No operational row is authored here. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `started_at` | future durable ledger runtime | Actual UTC start time in durable ledger, not research capture or election date. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `finished_at` | future durable ledger runtime | NULL while started; actual UTC end time on completion. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `status` | future durable ledger runtime | started/succeeded/failed from actual execution only. No rows created by this documentation task. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `input_inventory_json` | future durable ledger runtime | C(actual effective Inventory descriptors) recorded before staging. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `successful_release_id` | future durable ledger runtime | R only on successful validation/publication; NULL failed/started. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `publication_set_json` | future durable ledger runtime | C(full actual set of lineage/release members); preserve unrelated members unchanged. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `row_counts_json` | future durable ledger runtime | Actual importer counts, not documentary counts relabelled as executed. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |
| `error_text` | future durable ledger runtime | Exact failure diagnostic on failed attempt; NULL on successful/started absent error. | Inherit full ingest_attempt natural key; source scalar and resolved FK must match; preserve raw. Runtime Not run. |

## Publication and coexistence

Draft tiers and open quantitative/identity decisions are acceptance gates. No publication is performed. After accepted research/tier/override inputs exist, stage a consistent backup on the same filesystem, preserve unrelated lineage members, validate full keys/counts, checkpoint WAL, close/fsync, atomically rename andfsync directory. Durable attempt ledger is separate; failed stage leaves last good data serving. An incomplete refresh carries omitted offices/history with their original evidence into the effective snapshot or fails closed; it does not delete them. A publication is a set of lineage release IDs, never the latest attempt. No /electiondatabase cutover.
