# Croatia → Atlas field map — Prompt W

Pinned main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. **Draft; no import/SQL execution.** All223 columns in 20 requested tables; schema_migration is DDL-owned. Runtime-only rows are instructions, not research records.

## Source aliases

Research aliases rooted at `data/research/croatia/`: O=office-register.json; G=geographies.json; E=events.json; P=proceedings.json; R=results.jsonl.gz (1-based decoded JSONL line); S=sources.json; U=research-gaps.json; CW=identity-crosswalk.json. T=schemas/atlas/tiers/croatia.json. Inventory and vectors sit beside this map. Every entity provides exact primary evidence input_path/sha256/locator/source_id and losslessraw.

[Source_Projection_Contract.md](Source_Projection_Contract.md) specifies original fields→documentary row; this table specifies documentary row→DDL. [Croatia_Identity_Rules.md](Croatia_Identity_Rules.md) definesC/H/K,N/L and natural keys. Every scalar inherits its table row identity, never creates an extra office/event. Every row below must preserve unknown source fields inraw_json/retained_input; reject source hash mismatch and broken resolvedFK; preserveNULL, genuine0 and partial precision. Runtime gates are Not run.

## dataset_lineage (3 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | constants L; README | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit dataset_lineage natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `provenance_kind` | constants L; README | country_package; new primary-sourced Croatian research. | Inherit dataset_lineage natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `description` | constants L; README | New sourced Croatia councils, direct executives, independent deputies, national bodies and historic ballots with holds. | Inherit dataset_lineage natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## dataset_release (12 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | Inventory /hash_inputs | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | Inventory /hash_inputs | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | Inventory /hash_inputs | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `fingerprint_sha256` | Inventory /hash_inputs | H(Inventory /hash_inputs), compact recursively sorted UTF-8 JSON; not ZIP SHA. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `hash_inputs_json` | Inventory /hash_inputs | C(Inventory /hash_inputs): effective source/research/tier file hashes + accepted overrides(empty) + adapter/method/schema versions + DDL hashes. No attempts, wall clock, reports, vectors or unrelated lineages. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `adapter_version` | Inventory /hash_inputs | atlas-croatia-full-register/1 (documentary specification). | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `method_version` | Inventory /hash_inputs | atlas-preserve-evidence/1. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `schema_version` | Inventory /hash_inputs | atlas-master/1. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `research_snapshot_label` | Inventory /hash_inputs | 2026-09-20 source capture; not a polling date. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `upstream_release_id` | Inventory /hash_inputs | NULL: no existing Croatian public Atlas release alias supplied. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `validated_counts_json` | Inventory /hash_inputs | Inventory /verified_counts exactly; documentary rows distinguished from imported counts. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `research_coverage_complete` | Inventory /hash_inputs | 0: named historic/legal and special-return gaps remain. | Inherit dataset_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## publication_release (2 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | future publication set | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit publication_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | future publication set | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit publication_release natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## publication_receipt (4 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `singleton` | future runtime | 1 in future successful staging only. | Inherit publication_receipt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `last_publish_attempt_id` | future runtime | Actual durable ledger attempt_id; never used as citation/release identity. | Inherit publication_receipt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `attempted_lineage_id` | future runtime | L. | Inherit publication_receipt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `attempted_release_id` | future runtime | R, FK publication_release(L,R). | Inherit publication_receipt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## retained_input (8 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | Inventory /hash_inputs/inputs/i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | Inventory /hash_inputs/inputs/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `input_path` | Inventory /hash_inputs/inputs/i | Inventory /hash_inputs/inputs/i/input_path; exact ZIP member. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `input_kind` | Inventory /hash_inputs/inputs/i | tier_classification for tier JSON, package for original sources and derived research; override only for future accepted override; do not ingest this draft as an accepted override. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `sha256` | Inventory /hash_inputs/inputs/i | Inventory descriptor SHA256 of exact bytes; mismatch fails closed. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `byte_count` | Inventory /hash_inputs/inputs/i | Exact descriptor byte_count integer>=0. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `recovery_locator` | Inventory /hash_inputs/inputs/i | ZIP member path + SHA; future durable store must return identical original bytes. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `payload_json` | Inventory /hash_inputs/inputs/i | Exact JSON payload when applicable; NULL for gzip/XLS/XLSX/CSV/HTML/JS/binary. Preserve original artifact intact, do not execute formulas/scripts. JSONL is retained as original compressed artifact; each decoded row survives entity raw_json. | Inherit retained_input natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## country (11 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `country_id` | README+U | Constant croatia; FK country(country_id). | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | README+U | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | README+U | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | README+U | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `country_code` | README+U | HR. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `name` | README+U | Republika Hrvatska; source Croatian orthography. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `polity_kind` | README+U | sovereign_country. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `region_id` | README+U | europe; alert window does not restrict office membership. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `coverage_status` | README+U | partial: captured2025 ordinary ballot register plus national bodies; historical territorial/special/legal/seat gates remain. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `screening_as_of_label` | README+U | 2026-09-20. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `notes` | README+U | C(U); named Zagreb, deputy, reform, special, placeholder, seat/legal, party, minority-basis, EP and date holds. | Inherit country natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## geography (9 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `country_id` | G /i | Constant croatia; FK country(country_id). | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | G /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | G /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | G /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `geography_id` | G /i | G /i/geography_id: HR; HR-Z plus two-digit county code; HR-G plus four-digit grop. Zagreb1333 is served byHR-Z21 only. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `name` | G /i | G /i/name exactly; no invented translations. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `parent_geography_id` | G /i | G /i/parent_geography_id from DIP gradOpcina.codetop; county→HR; local→HR-Z<codetop>. No successors. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `effective_from_label` | G /i | NULL; a first appearance in an election archive is not a legal creation date. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `effective_to_label` | G /i | NULL; absent-current deputy eligibility is not territorial abolition. | Inherit geography natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## research_date (12 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | E /i/date; O /i/next_election | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | E /i/date; O /i/next_election | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | E /i/date; O /i/next_election | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `date_id` | E /i/date; O /i/next_election | date- + H([N,owner_kind,owner_id,slot]); event slot election uses event_id; office slot next uses office_id. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `label` | E /i/date; O /i/next_election | E /i/date/value; local first polling day from viewh2; national/EP source-year. O.next_election/valueNULL creates no next date row. Never generation datum/vrijeme. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `precision` | E /i/date; O /i/next_election | Exact source-derived day/year; future month/range/unknown supported without adding day=1. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `certainty` | E /i/date; O /i/next_election | E.date/certainty or O.next_election/certainty exactly; called refers to source occurrence/schedule and not outcome certification. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `year` | E /i/date; O /i/next_election | Integer first four digits of label for known date; NULL unknown. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `month` | E /i/date; O /i/next_election | Only characters 6–7 of a day/month source date; otherwise NULL. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `day` | E /i/date; O /i/next_election | Only characters 9–10 of day-precision label; otherwise NULL. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `range_start_id` | E /i/date; O /i/next_election | NULL for all present date claims; future range only references two real research_date rows. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `range_end_id` | E /i/date; O /i/next_election | NULL for present claims; no inferred endpoint. | Inherit research_date natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## office (16 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `id_namespace` | O /i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | O /i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `country_id` | O /i | Constant croatia; FK country(country_id). | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | O /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | O /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | O /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `geography_id` | O /i | O /i/geography_id; FK (croatia,geography_id) to G. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `name` | O /i | O /i/name exactly: source official body label where available; explicit descriptive label from old source components otherwise. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_type` | O /i | O /i/office_type: council, direct_executive, direct_deputy, parliament, european_parliament_delegation. Tier stays separate. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_status` | O /i | O /i/office_status current or historical. Historic office remains active research record. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_state` | O /i | active for supplied offices; never delete/withdraw because refresh omits a record. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `state_note` | O /i | NULL for active; future explicit withdrawal/supersession requires sourced nonempty reason. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `registry_qualified` | O /i | 1 for sourced elected body identity; does not mean all histories or tier proposals are approved. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `next_date_id` | O /i | NULL: all present O.next_election/value unknown. Future known date→date-+H([N,office,office_id,next]). | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `next_date_resolution` | O /i | unknown for all present rows; object with valueNULL is not resolved. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `next_history_key` | O /i | NULL; no prospective event invented from cadence. | Inherit office natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## office_tier_classification (11 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `id_namespace` | T /classifications/i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | T /classifications/i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | T /classifications/i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | T /classifications/i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | T /classifications/i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `tier` | T /classifications/i | T /classifications/i/tier only: national→national_context; regional/municipal/other unchanged. Unknown would map NULL, never other. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `review_status` | T /classifications/i | needs_review for this draft. Future approved accepted file required by publication gate; no implied acceptance from clean flags. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `rationale` | T /classifications/i | T /classifications/i/rationale verbatim, nonempty; evidence is body type and geography, never calendar cohort. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `classification_path` | T /classifications/i | schemas/atlas/tiers/croatia.json. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `classification_kind` | T /classifications/i | tier_classification. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `classification_sha256` | T /classifications/i | SHA256(T exact bytes), FK same checksummed retained_input. | Inherit office_tier_classification natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## election_event (18 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `id_namespace` | E /i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | E /i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `history_key` | E /i | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | E /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | E /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | E /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `event_id` | E /i | E /i/event_id = K(event,[croatia,N,history_key]); no random ID. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `date_id` | E /i | date- + H([N,event,event_id,election]); real research_date FK. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `date_resolution` | E /i | resolved when source year/day is supplied, unknown with explicit unknown research_date if absent; conflicting requires NULL and unresolved claims. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `event_kind` | E /i | E /i/event_kind ordinary; runoff/third round is a proceeding. Unprojected special calls stay retained/unresolved. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `selected_history_role` | E /i | E /i/selected_history_role selected for sourced historic return cycles; none Tar-Vabriga2025 placeholder. Selected does not mean certified. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `electoral_system` | E /i | NULL unless explicitly projected from a sourced institutional note; raw district/ballot structure retained. Do not infer proportional versus majority from party labels. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `comparability` | E /i | NULL. No computed competition/tightness or inferred pre/post-reform comparability. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `ballot_basis` | E /i | E /i/ballot_basis valid_votes for council/list; including_blank_invalid for executive/deputy/President; unknown for Sabor minority. No cross-basis sums. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `share_unit` | E /i | percent_0_100 from compatible source posto/CSV percentage; no computed share. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `legal_outcome` | E /i | unknown throughout pending court/certification audit; blank source does not implynot_held. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_state` | E /i | active. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `state_note` | E /i | NULL for active. | Inherit election_event natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## proceeding (11 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `id_namespace` | P /i | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | P /i | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `history_key` | P /i | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | P /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | P /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | P /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `proceeding_id` | P /i | P /i/proceeding_id = K(proceeding,[N,office_id,history_key,round,sequence_no]); no random IDs. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `kind` | P /i | P /i/proceeding_type: first_round or runoff. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `sequence_no` | P /i | P /i/sequence_no 1/2/3 from archive round path;3 only explicitly advertised Stari Grad 2017. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `supersedes_id` | P /i | NULL. A runoff does not erase/supersede the first-round evidence. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `legal_outcome` | P /i | unknown; no fabricated certification proceeding. | Inherit proceeding natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## source (14 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `country_id` | S /i | Constant croatia; FK country(country_id). | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | S /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | S /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | S /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_id` | S /i | S /i/source_id = croatia-- + K(source,[exact URL,request-or-NULL]). One source per URL/request; retained versions linked by hashes. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_namespace` | S /i | L. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `publisher` | S /i | DIP (Državno izborno povjerenstvo Republike Hrvatske) for izbori.hr; ministry for mpudt.gov.hr; host-derived publisher. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `title` | S /i | S /i/title, explicit documentary artifact title/filename, not invented publication title. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `url` | S /i | S /i/url exact retrieval URL; never manufacture unresolved URL. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `checked_as_of_label` | S /i | S /i/retrieved_at2026-09-20. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `evidence_grade` | S /i | primary_official for acquired official materials; not a legal certification flag. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `file_sha256` | S /i | S /i/sha256 exact retained bytes. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `locator` | S /i | S /i/input_path+URL; static JS literal/JSON pointer/1-based semicolon line, not invented JSON pointers. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `data_rights` | S /i | unknown unless original source explicitly supplies licence; public access is not an invented licence. | Inherit source natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## party_mapping (12 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `country_id` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `party_namespace` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `mapping_id` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_context` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `election_context` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `original_label` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `original_code` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `mapped_group` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `uncertainty` | no source / omit | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | Inherit party_mapping natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## result_row (24 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `id_namespace` | R decoded JSONL line | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | R decoded JSONL line | O /i/office_id exact authored code-based identity; source codes inraw/CW. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `history_key` | R decoded JSONL line | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `country_id` | R decoded JSONL line | Constant croatia; FK country(country_id). | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | R decoded JSONL line | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | R decoded JSONL line | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | R decoded JSONL line | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `result_row_id` | R decoded JSONL line | R line/result_row_id = K(result,[N,office_id,history_key,proceeding_id-or-NULL,identity_token]); vectors include full preimage. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `proceeding_id` | R decoded JSONL line | R line/proceeding_id; exact first-round/runoff FK, otherwise NULL for council/parliament/EP candidate row. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `candidate_or_list_label` | R decoded JSONL line | For council/list rows use R line/party_name_raw when nonNULL, else source_label; direct candidate uses source_label. Original list-head label survives raw. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `original_party_label` | R decoded JSONL line | R line/party_name_raw; NULL absent. Original arrays/CSV retained raw; no party mapping. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `original_party_code` | R decoded JSONL line | For local council types06/08: JSON raw.jedinstvenaSifra or2017 raw[41]. Sabor list type02 in2015/16: raw[34];2020/24: raw.jedinstvenaSifra. NULL other rows; candidate/list ordinals are not party codes. All source signatures retained raw. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `party_namespace` | R decoded JSONL line | NULL; no party_mapping FK. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `party_mapping_id` | R decoded JSONL line | NULL; no unsupported coalition equivalence. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `votes` | R decoded JSONL line | R line/votes from JSON glasova / Source_Projection_Contract exact year-specific CSV fields; integer exact. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `votes_status` | R decoded JSONL line | R line/votes_status: NULL→unknown, 0→zero, positive→recorded; no blanket missing-to-zero. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `share` | R decoded JSONL line | R line/share from JSON posto or explicit CSV percent; comma→decimal; never clamp/rescale/calculate. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `share_status` | R decoded JSONL line | R line/share_status; same missing/zero/positive discipline. NULL due unit hold is explicitly disclosed in raw/gaps. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `share_unit` | R decoded JSONL line | R line/share_unit percent_0_100. Do not silently multiply ambiguous fractions; source original lexeme retained. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `seats` | R decoded JSONL line | NULL throughout: no seat allocation or winner inference. Original legacy metadata retained for review. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `seats_status` | R decoded JSONL line | R line/seats_status corresponding to exact seats scalar. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `elected_flag` | R decoded JSONL line | NULL throughout; no winner from rank. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `is_substitute` | R decoded JSONL line | NULL: source substitute status not projected; do not fabricate. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `evidence_status` | R decoded JSONL line | recorded for sourced claims, even when one typed scalar is unknown; named disputed aggregate/units remain explicit raw holds. | Inherit result_row natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## record_locator (17 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `country_id` | target entity+evidence | croatia for country/geography/office/event/proceeding/result_row/source locators; NULL for input locator, as required by sparse DDL. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `id_namespace` | target entity+evidence | N for office/event/proceeding/result; NULL for country/geography/source/input. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `office_id` | target entity+evidence | Actual O ID for office/event/proceeding/result; NULL otherwise. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `history_key` | target entity+evidence | Actual HK for event/proceeding/result; NULL otherwise. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `lineage_id` | target entity+evidence | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | target entity+evidence | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_key` | target entity+evidence | rec- + H([entity_kind,...full natural-key tuple]); see Identity Rules table for exact tuple. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `entity_kind` | target entity+evidence | country/geography/office/event/proceeding/result_row/source/input/party_mapping only when corresponding real entity exists. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `geography_id` | target entity+evidence | Only geography locator: actual G ID; NULL otherwise, including office/result locators. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `proceeding_id` | target entity+evidence | Only proceeding locator: actual P ID. NULL on result locator even if result_row.proceeding_id non-NULL; obey sparse DDL shape. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `result_row_id` | target entity+evidence | Only result locator: R ID; NULL otherwise. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `party_namespace` | target entity+evidence | NULL; no mapping rows. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `party_mapping_id` | target entity+evidence | NULL; no mapping rows. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_namespace` | target entity+evidence | Only source locator: L; NULL elsewhere. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_id` | target entity+evidence | Only source locator: S source_id; NULL elsewhere. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `input_path` | target entity+evidence | Only input locator: exact retained_input path; NULL elsewhere. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_row_locator` | target entity+evidence | C({derived_path,derived_pointer_or_jsonl_line,evidence}); JSON pointer, 1-based newline semicolon line or static JS literal. No script/formula execution. | Inherit record_locator natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## evidence_link (11 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | entity /evidence/j | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | entity /evidence/j | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `evidence_id` | entity /evidence/j | ev- + H([record_key,['croatia',L,source_id],[input_path,archive_entry,locator],claim_kind]); each exact occurrence is preserved, including conflicts. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_key` | entity /evidence/j | Exact target record_locator.record_key; broken target fails closed. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_country_id` | entity /evidence/j | croatia. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_namespace` | entity /evidence/j | L. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_id` | entity /evidence/j | Resolved S ID by exact retained source input; full source FK required. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_locator` | entity /evidence/j | C(evidence occurrence including original path/hash and CSV record/XML path/archive member). | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `claim_kind` | entity /evidence/j | register_identity, source_scalar, election_date, historical_binding, next_date or institutional_mode as actually supported. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `date_claim_id` | entity /evidence/j | Real research_date ID only for date claim; otherwise NULL. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `claim_json` | entity /evidence/j | C(original claim/source cells), including withholding/open question where applicable. No invented primary evidence. | Inherit evidence_link natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## unresolved_evidence (8 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | U /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | U /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | U /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `unresolved_id` | U /i | unres- + H([record_key,[documented gap/source locator],original_token]). | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_key` | U /i | Actual country locator for broad U gap; named office/event/result locator when supplied. Never fake office/source FK. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `original_token` | U /i | U /i/original_token exactly. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `source_locator` | U /i | C(U /i/evidence) or explicit missing primary document descriptor; absent locator becomes C([]), never SQL NULL because this field is NOT NULL. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `reason` | U /i | U /i/reason exact, including unavailable older/repeat returns, code continuity or ambiguous source unit. | Inherit unresolved_evidence natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## identity_crosswalk (8 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | CW /i | Constant L = country-package-croatia. FK to this lineage, never another publication member. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `release_id` | CW /i | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `raw_json` | CW /i | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `entity_kind` | CW /i | office for supplied source-body code to authored Atlas identity; no implicit historical successor. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `upstream_namespace` | CW /i | CW /i/upstream_namespace dip:local-ballot:<year> or atlas-croatia-evidenced-body/1. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `upstream_id` | CW /i | CW /i/upstream_id canonical [ballot_code,codetop,label] or sourced body name; source year isolates changing ballot slots. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `record_key` | CW /i | rec- + H([office,N,CW /i/target_office_id]); exact office record locator FK. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `reason` | CW /i | CW /i/reason verbatim; same source body identifier, no invented merger alias. | Inherit identity_crosswalk natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## ingest_attempt (12 columns)

| Destination | Source locator | Conversion / null policy | Identity / evidence / validation |
|---|---|---|---|
| `lineage_id` | future durable ledger runtime | L=country-package-croatia in durable sibling ledger; logical lineage ownership only, no cross-database foreign key is fabricated. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `attempt_id` | future durable ledger runtime | Actual future newly generated attempt UUID; never authored as historical research or fingerprint input. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `operator` | future durable ledger runtime | Actual future operator supplied by runtime. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `script_version` | future durable ledger runtime | Actual future implementation version; NOT NULL. No operational row is authored here. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `started_at` | future durable ledger runtime | Actual UTC start time in durable ledger, not research capture or election date. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `finished_at` | future durable ledger runtime | NULL while started; actual UTC end time on completion. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `status` | future durable ledger runtime | started/succeeded/failed from actual execution only. No rows created by this documentation task. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `input_inventory_json` | future durable ledger runtime | C(actual effective Inventory descriptors) recorded before staging. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `successful_release_id` | future durable ledger runtime | R only on successful validation/publication; NULL failed/started. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `publication_set_json` | future durable ledger runtime | C(full actual set of lineage/release members); preserve unrelated members unchanged. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `row_counts_json` | future durable ledger runtime | Actual importer counts, not documentary counts relabelled as executed. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |
| `error_text` | future durable ledger runtime | Exact failure diagnostic on failed attempt; NULL on successful/started absent error. | Inherit ingest_attempt natural key; resolve only existing keys. Check exact source projection and DDL null/domain rule. Runtime: Not run. |

## Publication

Unchanged inputs→new durable attempt, same lineage release. Omitted office/history is carried with original source/tier bytes into effective new snapshot or importfails; absence never deletes. Only Croatia publication member changes. Consistent backup→same-FS staging→allFK/count checks→WAL checkpoint→close/fsync→atomic rename+directoryfsync. Failure leaves last good serving; separate attempt ledger survives. Importer/SQLite/filesystemCI Not run.
