# Czechia → Atlas field map — Prompt V

Draft at main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. **20 tables / 223 columns**, unchanged DDL in contracts/. Mapping completion is not importer execution or research completeness.

## Source legend

O=data/research/czechia/office-register.json; G=geographies.json; E=events.json; P=proceedings.json; R=results.jsonl.gz (UTF-8 JSONL, 1-based line); S=sources.json; U=research-gaps.json; CW=identity-crosswalk.json (all beneath data/research/czechia). T=schemas/atlas/tiers/czechia.json. Inventory=docs/phase1/czechia/Czechia_Input_Inventory.json. Each /i is zero-based JSON array index. Every evidence object resolves its exact retained source, SHA, archive entry and CSV record/XML XPath.

Register SHA `e3e2e478bd744f7d45f13434121362b6b877928b9251a66cf1f03558a9965e69`. Draft tier SHA `465c61ab0836ec18fd03c1e6af922e9918a184be00237fd238f0107386235244`.

## Granularity and semantic decisions

Current whole-body office identity is KODZASTUP, not each RZCOCO precinct-containing row and not OBVODY=2 districts. All CSV records remain retained. Commune/city councils are municipal except Prague city assembly, proposed regional once; borough councils are other. Senate is one chamber office with constituency-scoped events, not 81 additional offices. President is the only direct executive.

Municipal historical results use KVROS list rows at (DATUMVOLEB,KODZASTUP,COBVODU,OSTRANA). Candidate KVRK, alternate CSV encodings, precinct returns and registration totals are NOT additional typed result rows. Every source archive remains intact. National/EP XML uses CR only; regional XML uses KRZAST only. Do not add national and regional aggregations of the same election. Senate cumulative SERK is authoritative here; separate Senate XML is corroboration/prospective scope, not duplicate histories. The 2017 Chamber and 2023 presidential NSS-corrected editions take precedence over earlier retained editions without changing event IDs. Presidential/Senate rounds share one scoped event.

**PROCHLSTR semantic hold:** municipal files label this as recalculated percentage, and 6,417 values exceed 100. Every supplied value survives `source_recalculated_percent` and `raw.PROCHLSTR`. It is not asserted to be an Atlas vote share. All municipal typed shares are NULL/unknown, explicitly flagged for Justin's review; votes and seats retain their source values. No production override, accepted correction, clamp, rescaling, invented denominator or dropped affected row. `share-semantic-review.json` lists every >100 row and exact evidence. Even <=100 recalculated values remain under the same semantic hold.

Nine old KVROS zero placeholders attached to explicitly not-held contests, blank return rows and invalid Senate candidates remain in retained-only-candidate-index.json, not results. Future 2026 zero-precinct XML zeros are not observed zero-vote results. Missing XML mandate attributes stay NULL even when a party appears unelected.

Dates from DATUMVOLEB/endpoints are first polling day; national/regional/EP year projections do not invent a day. Next fields may be NULL; office remains. Future out-of-window dates likewise cannot delete offices/history. Partial ranges require interval overlap, not day=1. Prague's prospective regional record is distinct from 13 regional assemblies with unknown next dates; no positive dated regional numerator is a gate.

## Column contract

Each row gives a destination, source/conversion/null rule, identity/FK and verification. Common ownership is country=czechia, N=cdd-observatory-v1, L=country-package-czechia, candidate R from Inventory. Operational tables describe future runtime values only. JSON raw envelopes retain all unknown fields. Broken resolved FKs fail closed; missing primary claims become unresolved_evidence, never invented sources.

### dataset_lineage

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | L. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `provenance_kind` | country_package; new primary-sourced Czech research. | L. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `description` | New sourced Czech elected-body research; whole council roster, Senate constituency-scoped histories, President and EP; named semantic and territorial holds. | L. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### dataset_release

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `fingerprint_sha256` | H(Inventory /hash_inputs), compact recursively sorted UTF-8 JSON; not ZIP SHA. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `hash_inputs_json` | C(Inventory /hash_inputs): effective source/research/tier file hashes + accepted overrides(empty) + adapter/method/schema versions + DDL hashes. No attempts, wall clock, reports, vectors or unrelated lineages. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `adapter_version` | atlas-czechia-full-register/1 (documentary specification). | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `method_version` | atlas-preserve-evidence/1. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `schema_version` | atlas-master/1. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `research_snapshot_label` | 2026-09-20 source capture; not a polling date. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `upstream_release_id` | NULL: no existing Czech public Atlas release alias supplied. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `validated_counts_json` | Inventory /verified_counts exactly; documentary rows distinguished from imported counts. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `research_coverage_complete` | 0: named historic/legal and special-return gaps remain. | (L,R). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### publication_release

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | L→R. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | L→R. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |

### publication_receipt

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `singleton` | 1 in future successful staging only. | singleton=1. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `last_publish_attempt_id` | Actual durable ledger attempt_id; never used as citation/release identity. | singleton=1. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `attempted_lineage_id` | L. | singleton=1. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `attempted_release_id` | R, FK publication_release(L,R). | singleton=1. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |

### retained_input

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `input_path` | Inventory /hash_inputs/inputs/i/input_path; exact ZIP member. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `input_kind` | tier_classification for tier JSON, package for original sources and derived research; override only for future accepted override; do not ingest this draft as an accepted override. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `sha256` | Inventory descriptor SHA256 of exact bytes; mismatch fails closed. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `byte_count` | Exact descriptor byte_count integer>=0. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `recovery_locator` | ZIP member path + SHA; future durable store must return identical original bytes. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `payload_json` | Exact JSON payload when applicable; NULL for gzip/XLS/XLSX/CSV/HTML/JS/binary. Preserve original artifact intact, do not execute formulas/scripts. JSONL is retained as original compressed artifact; each decoded row survives entity raw_json. | (L,R,input_path). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### country

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `country_id` | Constant czechia; FK country(country_id). | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `country_code` | CZ. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `name` | Česká republika; original Czech orthography retained. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `polity_kind` | sovereign_country. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `region_id` | europe; alert window does not restrict office membership. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `coverage_status` | partial: full captured 2026 election-body roster; CISOB code coverage reconciled; post-capture and historical/legal research remain open. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `screening_as_of_label` | 2026-09-20. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `notes` | C(U); Prague, historical code bindings, military-area transitions, executive mode, PROCHLSTR, legal/date and EP holds. | country_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### geography

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `country_id` | Constant czechia; FK country(country_id). | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `geography_id` | G /i/geography_id: CZ for country; CZ-M + source KODZASTUP left-padded to six digits; CZ-K + source KRZAST left-padded to two digits. Raw token always retained. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `name` | G /i/name exactly; no invented translations. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `parent_geography_id` | G /i/parent_geography_id from official current kvcoco.NADRZASTUP for boroughs when target exists; otherwise NULL. Never infer successor edges. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `effective_from_label` | NULL; a first appearance in an election archive is not a legal creation date. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `effective_to_label` | NULL; absent from 2026 register is not an evidenced abolition day. | (country_id,geography_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### research_date

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `date_id` | date- + H([N,owner_kind,owner_id,slot]); event slot election uses event_id; office slot next uses office_id. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `label` | E /i/date/value or O /i/next_election/value. First-day day precision is labelled first polling day, not the entire multi-day interval. Year-only dates remain year-only; no date from generation timestamp. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `precision` | Exact source-derived day/year; future month/range/unknown supported without adding day=1. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `certainty` | E.date/certainty or O.next_election/certainty exactly; called refers to source occurrence/schedule and not outcome certification. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `year` | Integer first four digits of label for known date; NULL unknown. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `month` | Only characters 6–7 of a day/month source date; otherwise NULL. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `day` | Only characters 9–10 of day-precision label; otherwise NULL. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `range_start_id` | NULL for all present date claims; future range only references two real research_date rows. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `range_end_id` | NULL for present claims; no inferred endpoint. | date_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### office

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `id_namespace` | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Exact O /i/office_id; match event/result/proceeding office_id. Authored deterministic ID preserves source ČSÚ body code. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `country_id` | Constant czechia; FK country(country_id). | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `geography_id` | O /i/geography_id; FK (czechia,geography_id) to G. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `name` | O /i/name exactly: source official body label where available; explicit descriptive label from old source components otherwise. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_type` | O /i/office_type exactly: municipal_council, borough_council, capital_regional_municipal_assembly, regional_assembly, national_lower_chamber, national_upper_chamber, direct_national_executive, european_parliament_delegation. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_status` | O /i/office_status current or historical. Historic office remains active research record. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_state` | active for supplied offices; never delete/withdraw because refresh omits a record. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `state_note` | NULL for active; future explicit withdrawal/supersession requires sourced nonempty reason. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `registry_qualified` | 1 for sourced elected body identity; does not mean all histories or tier proposals are approved. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `next_date_id` | NULL when O next_election NULL, else date- + H([N,office,office_id,next]). | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `next_date_resolution` | resolved only when O.next_election exists; unknown otherwise. Resolved is source date precision, not outcome certification. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `next_history_key` | For current municipal/borough/Prague councils: office_id + ::kv:20261009, exact prospective E FK. NULL for other bodies (Senate has multiple scoped events, no single asserted next HK). | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### office_tier_classification

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `id_namespace` | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Exact O /i/office_id; match event/result/proceeding office_id. Authored deterministic ID preserves source ČSÚ body code. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `tier` | T /classifications/i/tier only: national→national_context; regional/municipal/other unchanged. Unknown would map NULL, never other. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `review_status` | needs_review for this draft. Future approved accepted file required by publication gate; no implied acceptance from clean flags. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `rationale` | T /classifications/i/rationale verbatim, nonempty; evidence is body type and geography, never calendar cohort. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `classification_path` | schemas/atlas/tiers/czechia.json. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `classification_kind` | tier_classification. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `classification_sha256` | SHA256(T exact bytes), FK same checksummed retained_input. | (N,office_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### election_event

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `id_namespace` | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Exact O /i/office_id; match event/result/proceeding office_id. Authored deterministic ID preserves source ČSÚ body code. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `history_key` | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `event_id` | E /i/event_id = K(event,[czechia,N,history_key]); no random ID. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `date_id` | date- + H([N,event,event_id,election]); real research_date FK. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `date_resolution` | resolved when source year/day is supplied, unknown with explicit unknown research_date if absent; conflicting requires NULL and unresolved claims. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `event_kind` | E /i/event_kind. Ordinary source cycles; special additional municipal dates; Senate catalogue TYPVOLEB explicitly distinguishes ordinary/special/repeated. Round two is a proceeding, never another ordinary cycle. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `selected_history_role` | E /i/selected_history_role: selected ordinary historical events; other nonordinary/not-held historical entries; none prospective. Not-held never counted as completed result history. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `electoral_system` | NULL unless explicitly projected from a sourced institutional note; raw district/ballot structure retained. Do not infer proportional versus majority from party labels. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `comparability` | NULL. No computed competition/tightness or inferred pre/post-reform comparability. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `ballot_basis` | E /i/ballot_basis candidate_marks for municipal list-vote totals; list_votes for parliamentary/regional/EP lists; valid_votes for Senate/President. These bases must not be summed together. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `share_unit` | percent_0_100 for compatible typed shares. Municipal PROCHLSTR stays raw/retained-only under semantic hold; no forced conversion. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `legal_outcome` | E /i/legal_outcome: not_held only explicit STAV_OBCE=1; otherwise unknown pending full legal audit. Official published returns are not blanket certification. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_state` | active. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `state_note` | NULL for active. | (N,office_id,history_key); unique(N,event_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### proceeding

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `id_namespace` | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Exact O /i/office_id; match event/result/proceeding office_id. Authored deterministic ID preserves source ČSÚ body code. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `history_key` | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `proceeding_id` | P /i/proceeding_id = K(proceeding,[N,office_id,history_key,round,sequence_no]); no random IDs. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `kind` | P /i/kind first_round or runoff from supplied separate ballot returns/index fields. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `sequence_no` | P /i/sequence_no 1 or 2; explicit source round. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `supersedes_id` | NULL. A runoff does not erase/supersede the first-round evidence. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `legal_outcome` | unknown; no fabricated certification proceeding. | (N,office_id,history_key,proceeding_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### source

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `country_id` | Constant czechia; FK country(country_id). | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_id` | S /i/source_id = czechia-- + K(source,[exact URL,request-or-NULL]). One source per URL/request; retained versions linked by hashes. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_namespace` | L. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `publisher` | S /i/publisher: Český statistický úřad or Parlament České republiky from official host. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `title` | S /i/title, explicit documentary artifact title/filename, not invented publication title. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `url` | S /i/url exact retrieval URL; never manufacture unresolved URL. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `checked_as_of_label` | S /i/checked_as_of 2026-09-20. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `evidence_grade` | primary_official for acquired official materials; not a legal certification flag. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `file_sha256` | S /i/sha256 exact retained bytes. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `locator` | S /i/input_path and exact retrieval URL. CSV archive entries and XML paths are evidence locators, never fabricated JSON pointers. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `data_rights` | unknown unless original source explicitly supplies licence; public access is not an invented licence. | (country_id,L,source_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### party_mapping

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `country_id` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `party_namespace` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `mapping_id` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_context` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `election_context` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `original_label` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `original_code` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `mapped_group` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `uncertainty` | No rows in this pack. Preserve source committee name/registration signature on result_row and raw source. No approved cross-election party/coalition mapping supplied; never conflate similarly named local committees. | No rows. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### result_row

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `id_namespace` | Constant N = cdd-observatory-v1. Preserve in every office/event/result/proceeding FK. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Exact O /i/office_id; match event/result/proceeding office_id. Authored deterministic ID preserves source ČSÚ body code. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `history_key` | Exact E /i/history_key; R and P must match full (N,office_id,history_key). | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `country_id` | Constant czechia; FK country(country_id). | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `result_row_id` | R line/result_row_id = K(result,[N,office_id,history_key,proceeding_id-or-NULL,identity_token]); vectors include full preimage. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `proceeding_id` | R line/proceeding_id; exact first-round/runoff FK, otherwise NULL for council/parliament/EP candidate row. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `candidate_or_list_label` | R line/name verbatim original or explicitly joined source surname+given-name components. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `original_party_label` | R line/party_label verbatim source; NULL when absent. Do not substitute guessed party from candidate name. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `original_party_code` | R line/party_code exact source VSTRANA or election-list code; original raw retains code namespace/context. NULL for presidential XML without party information. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `party_namespace` | NULL; no party_mapping FK. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `party_mapping_id` | NULL; no unsupported coalition equivalence. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `votes` | R line/votes from municipal HLASY_STR, XML HLASY/HLASY_nKOLO, Senate HLASY_Kn. Integer exact; explicit pre-count/not-held/invalid-candidate placeholders are retained-only, not counted results. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `votes_status` | R line/votes_status: NULL→unknown, 0→zero, positive→recorded; no blanket missing-to-zero. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `share` | R line/share. Municipal PROCHLSTR is NOT projected: all 163,724 municipal entries keep recalculated_percent raw and typed share=NULL/unknown pending semantic acceptance. Other rows use explicit XML PROC_HLASU/HLASY_PROC_nKOLO or Senate PROC_Kn, no computed percentages. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Municipal semantic hold remains explicit; typed values 0–100 or NULL, raw unchanged. |
| `share_status` | R line/share_status; same missing/zero/positive discipline. NULL due unit hold is explicitly disclosed in raw/gaps. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `share_unit` | R line/share_unit percent_0_100. Do not silently multiply ambiguous fractions; source original lexeme retained. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `seats` | R line/seats: exact municipal MAND_STR, XML explicit MANDATY; missing XML attribute=NULL (never inferred 0). Senate 1→1/0→0/qualifier2→NULL; President ZVOLEN→1/NEZVOLEN→0/2.KOLO→NULL. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `seats_status` | R line/seats_status corresponding to exact seats scalar. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `elected_flag` | R line/elected_flag from explicit Senate/President outcome only; NULL list rows and unresolved qualifiers. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `is_substitute` | NULL: source substitute status not projected; do not fabricate. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `evidence_status` | recorded for sourced claims, even when one typed scalar is unknown; named disputed aggregate/units remain explicit raw holds. | (N,office_id,history_key,result_row_id). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### record_locator

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `country_id` | czechia for country/geography/office/event/proceeding/result_row/source locators; NULL for input locator, as required by sparse DDL. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `id_namespace` | N for office/event/proceeding/result; NULL for country/geography/source/input. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `office_id` | Actual O ID for office/event/proceeding/result; NULL otherwise. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `history_key` | Actual HK for event/proceeding/result; NULL otherwise. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_key` | rec- + H([entity_kind,...full natural-key tuple]); see Identity Rules table for exact tuple. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `entity_kind` | country/geography/office/event/proceeding/result_row/source/input/party_mapping only when corresponding real entity exists. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `geography_id` | Only geography locator: actual G ID; NULL otherwise, including office/result locators. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `proceeding_id` | Only proceeding locator: actual P ID. NULL on result locator even if result_row.proceeding_id non-NULL; obey sparse DDL shape. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `result_row_id` | Only result locator: R ID; NULL otherwise. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `party_namespace` | NULL; no mapping rows. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `party_mapping_id` | NULL; no mapping rows. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_namespace` | Only source locator: L; NULL elsewhere. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_id` | Only source locator: S source_id; NULL elsewhere. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `input_path` | Only input locator: exact retained_input path; NULL elsewhere. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_row_locator` | C({derived_path,derived_pointer_or_jsonl_line,evidence}); CSV 1-based logical record (header=1), ZIP archive_entry, namespace-insensitive XML XPath. Input locators alone use input_path; preserve sparse DDL slots. | record_key. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### evidence_link

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `evidence_id` | ev- + H([record_key,['czechia',L,source_id],[input_path,archive_entry,locator],claim_kind]); each exact occurrence is preserved, including conflicts. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_key` | Exact target record_locator.record_key; broken target fails closed. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_country_id` | czechia. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_namespace` | L. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_id` | Resolved S ID by exact retained source input; full source FK required. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_locator` | C(evidence occurrence including original path/hash and CSV record/XML path/archive member). | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `claim_kind` | register_identity, source_scalar, election_date, historical_binding, next_date or institutional_mode as actually supported. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `date_claim_id` | Real research_date ID only for date claim; otherwise NULL. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `claim_json` | C(original claim/source cells), including withholding/open question where applicable. No invented primary evidence. | evidence_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### unresolved_evidence

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `unresolved_id` | unres- + H([record_key,[documented gap/source locator],original_token]). | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_key` | Actual country locator for broad U gap; named office/event/result locator when supplied. Never fake office/source FK. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `original_token` | U /i/original_token exactly. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `source_locator` | C(U /i/evidence) or explicit missing primary document descriptor; absent locator becomes C([]), never SQL NULL because this field is NOT NULL. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `reason` | U /i/reason exact, including unavailable older/repeat returns, code continuity or ambiguous source unit. | unresolved_id. Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### identity_crosswalk

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | Constant L = country-package-czechia. FK to this lineage, never another publication member. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `release_id` | Candidate release R = L + --sha256- + H(Inventory /hash_inputs); only mint on future successful validation. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `raw_json` | C(entire source/derived row), including unknown fields and original source locators; never discard extra upstream columns. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `entity_kind` | office for supplied source-body code to authored Atlas identity; no implicit historical successor. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `upstream_namespace` | CW /i/upstream_namespace: csu:KODZASTUP, csu:KRZAST or explicitly authored atlas-czechia-body-name/1. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `upstream_id` | CW /i/upstream_id exact raw code or sourced body name; raw leading-zero/numeric form retained. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `record_key` | rec- + H([office,N,CW /i/target_office_id]); exact office record locator FK. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |
| `reason` | CW /i/reason verbatim; same source body identifier, no invented merger alias. | (L,upstream_namespace,upstream_id,entity_kind). Full source occurrence and same-lineage ownership; exact target FK. | Exact hash/domain/null/source projection; no fixture IDs. |

### ingest_attempt

| Destination | Source locator → conversion / NULL policy | Identity / evidence / FK | Assertion |
|---|---|---|---|
| `lineage_id` | L=country-package-czechia in durable sibling ledger; logical lineage ownership only, no cross-database foreign key is fabricated. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `attempt_id` | Actual future newly generated attempt UUID; never authored as historical research or fingerprint input. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `operator` | Actual future operator supplied by runtime. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `script_version` | Actual future implementation version; NOT NULL. No operational row is authored here. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `started_at` | Actual UTC start time in durable ledger, not research capture or election date. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `finished_at` | NULL while started; actual UTC end time on completion. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `status` | started/succeeded/failed from actual execution only. No rows created by this documentation task. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `input_inventory_json` | C(actual effective Inventory descriptors) recorded before staging. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `successful_release_id` | R only on successful validation/publication; NULL failed/started. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `publication_set_json` | C(full actual set of lineage/release members); preserve unrelated members unchanged. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `row_counts_json` | Actual importer counts, not documentary counts relabelled as executed. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |
| `error_text` | Exact failure diagnostic on failed attempt; NULL on successful/started absent error. | future attempt UUID. No operational rows authored; future durable runtime only. | Exact hash/domain/null/source projection; no fixture IDs. |

## Future publication protocol — Not run

Start durable attempt in sibling ledger; consistent SQLite backup into same-filesystem staging; replace only Czech lineage while preserving every other publication member; carry omitted offices/history with their provenance or fail pending disposition. Validate counts, tier acceptance, unresolved claims and all FKs. WAL checkpoint, close, fsync, then atomic rename and directory fsync. Failure keeps last good serving and the durable failed attempt. Re-import of unchanged effective bytes creates a new attempt, same release. No filesystem publication or SQLite execution took place.
