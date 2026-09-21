# Estonia → Atlas field map — Prompt AF (DRAFT)

Pinned main `f7b5c81ebd39f1774edea7cde5b4155031d92647`. **20 destination tables / 223 columns**; unchanged DDL copies are reference-only under `contract-reference/`. Machine-readable per-column contract: `column-map.json`; exact column names: `contract-columns.json`. No SQL/importer runs in this task.

All relative research paths below start at `data/research/estonia/`. Aliases: O office, G geography, E event, Pp proceeding, Rr result, S source, C country, X crosswalk, T tier, I inventory, K counts. C(x) in identity expressions means canonical JSON, distinct from country alias C. L/N/R are defined in Identity Rules. JSON pointers zero-based; XML/HTML table indexes one-based.

Draft tier SHA `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`. Draft classifications block production acceptance; no SQL tier inference. 78 current municipal councils plus Riigikogu, president and EP delegation; zero regional offices. The alert window never excludes an office or history.

## Source extraction and retained structure

All source XML/ZIP/HTML bytes and 923 unpacked ZIP members retain hashes. `archive-member-inventory.json` maps member→archive→original URL source. Unpacked XML does not create an extra source publication. `register-source-rows.json` supplies names/codes at each of four local cycles. Current roster is the 78 **municipality-level detailed-return files** of KOV 2025 joined exactly to RESULTS/adminUnit/code, not all metadata subdivisions. 2013 uses POSTELECTION_PARTICIPATION_INFO; 2017 uses RESULTS; 2021/2025 use RESULTS. Register names preserve Estonian orthography and the source's Jõhvi merger annotation.

`results.json` contains candidate-level rows, never a mix of candidates and additive party aggregates. KOV: districts/district/voteDistributionByParties/party/candidates/candidate, votesDistributionCell[name=R]/value only. RK2015/19: VOTING_RESULT_IN_COUNTIES/data/votingResult/districts/district/votesDistributionByParties/party/candidates/candidate, cell[name=Hääli kokku], one per candidate; flags join ELECTION_RESULT exact candidateRegNumber. RK2023/EP2024: RESULTS votesAndMandates party and independentCandidates candidate blocks. EP2014/2019: allCandidates only. Presidential candidate/votes tables: ballot-scoped HTML table+ row. Source status is official_archive_snapshot; certification acts are not inferred.

Unknown XML tags, quotas, comparative figures, paper/electronic/station splits, source attributes, code variants and metadata survive original retained bytes, plus full normalized row.raw. `nonadditive-list-summaries.json` retains **2,999** party/list/total rows, including mandate counts and percentages; they do not add events or result_rows. No tightness/margin/forecast table. 2013 global valid-vote disagreement (625,334 XML versus 625,336 general statistics) is an open evidence conflict, not a repaired number. All 457 per-event source-vector checks pass; these do not settle that cross-source conflict.

Presidential proceedings carry exact ballot dates in raw_json and linked documentary research_date IDs. The DDL has no proceeding date column, so no new column is invented. 1992 mixed franchise uses event ballot_basis unknown and precise ballot-level basis. Nullable candidate seats remain distinct from explicit elected/reserved flags.

## Common identity, null and FK rules

All data rows carry their own L/R and source origins. NULL means absent/unresolved, never numeric zero. Missing tables (canonical party_mapping) emit no rows. Omitting a previously published row in a refresh is not deletion. Every resolved office/event/proceeding/geography/source FK must resolve fully; a broken known-source reference fails staged publication. Genuine unresolved source tokens are separate evidence records on real targets.

Every column below inherits the source selector, identity rules and validation gate printed for its table; its conversion/null cell adds exact field-level behavior. No runtime receipt/attempt is supplied by this documentation.

## dataset_lineage

Source selector: `country.json /; I.lineage_id`.

Identity / evidence / FK / validation assertion: L exact, provenance country_package. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `dataset_lineage.lineage_id` | L |
| `dataset_lineage.provenance_kind` | country_package |
| `dataset_lineage.description` | New Estonia research lineage: full 2025 official council roster plus national bodies and source-identified historic offices; historical depth partial. |

## dataset_release

Source selector: `I.hash_inputs; counts.json; country.json`.

Identity / evidence / FK / validation assertion: Fingerprint excludes attempts/time/unrelated lineages; coverage complete 0. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `dataset_release.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `dataset_release.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `dataset_release.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `dataset_release.fingerprint_sha256` | H(I.hash_inputs), canonical UTF-8 JSON; never ZIP bytes/clock/attempt. |
| `dataset_release.hash_inputs_json` | C(I.hash_inputs), exact sorted effective descriptors, tier draft bytes, overrides=[] and adapter/method/schema versions. |
| `dataset_release.adapter_version` | atlas-estonia-full-register/1 |
| `dataset_release.method_version` | atlas-preserve-evidence/1 |
| `dataset_release.schema_version` | atlas-master/1 |
| `dataset_release.research_snapshot_label` | C.research_snapshot_label; acquisition date is not election date. |
| `dataset_release.upstream_release_id` | NULL: this new Estonia research has no pre-existing public release alias. |
| `dataset_release.validated_counts_json` | C(K) after future import validation; documentary pack counts are not a success receipt. |
| `dataset_release.research_coverage_complete` | 0: pre-2013 local history, 2021 presidency, territorial binding and archive certification gates remain open. |

## publication_release

Source selector: `Future candidate release + existing complete publication set`.

Identity / evidence / FK / validation assertion: Replace only L member; other lineages/rows/citations unchanged. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `publication_release.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `publication_release.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |

## publication_receipt

Source selector: `Future verified atomic publication receipt`.

Identity / evidence / FK / validation assertion: Actual atomic publication only; not citation owner. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `publication_receipt.singleton` | 1, future runtime only. |
| `publication_receipt.last_publish_attempt_id` | Current durable runtime attempt ID after validated staged publication; not a release ID. |
| `publication_receipt.attempted_lineage_id` | L |
| `publication_receipt.attempted_release_id` | R |

## retained_input

Source selector: `I.hash_inputs.inputs[*]`.

Identity / evidence / FK / validation assertion: Every hash and byte length exact; all ZIP members recoverable; HTML/JS never executed. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `retained_input.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `retained_input.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `retained_input.input_path` | Exact I.hash_inputs.inputs[].input_path relative to pack/repository recovery root; preserve spelling and percent escapes. |
| `retained_input.input_kind` | Descriptor input_kind: source artifacts=artifact; derived research=package; tiers=tier_classification. |
| `retained_input.sha256` | SHA-256 of exact bytes, equals descriptor sha 256; immutable. |
| `retained_input.byte_count` | Exact byte length, not character count or decompressed estimate. |
| `retained_input.recovery_locator` | Immutable approved pack location + exact relative input_path; verify byte hash before use; no filesystem path fabricated as URL. |
| `retained_input.payload_json` | JSON package documents → C(full parsed document). XML/ZIP/HTML/JS/SQL/TS are retained bytes; payload_json NULL, immutable recovery locator. Never execute retained website scripts. Each unpacked member retains original ZIP path/member/hash. |

## country

Source selector: `country.json /`.

Identity / evidence / FK / validation assertion: One Estonia row; partial historical coverage explicit. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `country.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `country.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `country.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `country.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `country.country_code` | EE from C.country_code. |
| `country.name` | Eesti from C.name. |
| `country.polity_kind` | sovereign_country |
| `country.region_id` | europe; continent scope not office tier. |
| `country.coverage_status` | partial |
| `country.screening_as_of_label` | 2026-09-21; source-specific snapshots retained separately. |
| `country.notes` | Join C.notes as human text; retain full arrays and research gaps in raw_json. |

## geography

Source selector: `geography.json /i`.

Identity / evidence / FK / validation assertion: 279 source-grounded geographic IDs; nullable parents; no invented legal effective dates or successors. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `geography.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `geography.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `geography.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `geography.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `geography.geography_id` | Exact G.geography_id; country-scoped PK. |
| `geography.name` | G.name preserves official source orthography; display labels never PK. |
| `geography.parent_geography_id` | G.parent_geography_id; NULL here. County/district grouping remains in source XML; no self-parent for Tallinn/Tartu. |
| `geography.effective_from_label` | G.valid_from or NULL; observation cycle is not establishment date. |
| `geography.effective_to_label` | G.valid_to or NULL; never derive abolition day from absence. |

## research_date

Source selector: `events.json /i/date; office-register.json /i/next_date; proceedings.json /i/date_label`.

Identity / evidence / FK / validation assertion: 215 event years without fabricated day; future 2027/2029 year-only; calendar-valid day dates; certainty is separate from precision. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `research_date.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `research_date.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `research_date.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `research_date.date_id` | date- + H([N, ownerType, ownerId, slot]); event/E.event_id/election, office/O.office_id/next, or proceeding/Pp.proceeding_id/ballot. No next row when O.next_date=NULL. |
| `research_date.label` | E.date.label or O.next_date.label or Pp.date_label exactly. Event 2013 dates are year-only; no unsourced day. |
| `research_date.precision` | E.date.precision or O.next_date.precision; proceeding dates day. 2013 local and upcoming metadata year; month/day NULL. |
| `research_date.certainty` | E.date.certainty=called; O.next_date.certainty=expected; proceeding sourced ballot date called. No claim that official archive means certified. |
| `research_date.year` | Supplied date year; NULL only unknown/range. |
| `research_date.month` | Supplied month or NULL for year/unknown. |
| `research_date.day` | Supplied day or NULL for year/month/unknown. |
| `research_date.range_start_id` | NULL in this pack; future range must point to sourced ordered non-range endpoints. |
| `research_date.range_end_id` | NULL in this pack; never infer range from a term length. |

## office

Source selector: `office-register.json /i`.

Identity / evidence / FK / validation assertion: Exact 281 IDs: 81 current/ 200 historical; no mayor/district/county extras; geography and tier FKs resolve. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `office.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `office.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `office.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office.geography_id` | O.geography_id, FK to (estonia, G.geography_id). |
| `office.name` | O.office_name; exact source jurisdiction spelling preserved in O.official_jurisdiction_name. Volikogu suffix is display description, not a new source identity. |
| `office.office_type` | O.office_type: local_government_council/national_parliament/national_president/european_parliament_delegation; independent from geographic tier. |
| `office.office_status` | current if O.current=true, historical otherwise; 200 historical EHAK codes remain active records. |
| `office.record_state` | active; historical is not deleted/withdrawn. Explicit future withdrawal requires sourced state note. |
| `office.state_note` | NULL while active; research holds retained in raw_json, not fabricated withdrawals. |
| `office.registry_qualified` | 0 when O.holds nonempty, 1 otherwise. Qualification does not approve draft tiers. |
| `office.next_date_id` | date- + H([N, office, O.office_id, next]) when O.next_date non-NULL; otherwise NULL. |
| `office.next_date_resolution` | resolved for supplied year-only next metadata; unknown when NULL. Resolved does not mean day certainty. |
| `office.next_history_key` | NULL: next years are metadata, no prospective event manufactured. |

## office_tier_classification

Source selector: `schemas/atlas/tiers/estonia.json /classifications/i`.

Identity / evidence / FK / validation assertion: Exact office ID equality; national→national_context; all drafts→needs_review; regional 0 allowed. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `office_tier_classification.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office_tier_classification.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office_tier_classification.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `office_tier_classification.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office_tier_classification.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office_tier_classification.tier` | T.classifications[i].schema_v1_tier; national→national_context. Unknown would map NULL, never other. |
| `office_tier_classification.review_status` | needs_review for all draft rows, even when human_review_required=false. No pack approval in this task. |
| `office_tier_classification.rationale` | T.classifications[i].rationale verbatim. |
| `office_tier_classification.classification_path` | schemas/atlas/tiers/estonia.json |
| `office_tier_classification.classification_kind` | tier_classification |
| `office_tier_classification.classification_sha256` | ae9 f02831902 fa 9981 adf 3 aa034 bc92 dd6 c 7861 b66621 a1 ff66652 fd4 e0 daa 25 |

## election_event

Source selector: `events.json /i`.

Identity / evidence / FK / validation assertion: 464 unique N/O/HK and N/event_id tuples; no summary/round duplicate events. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `election_event.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `election_event.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `election_event.history_key` | Exact HK = office_id + :: + cycle token (KOV_YYYY/RK_YYYY/EP_YYYY/PRES_YYYY). No date or mutable label in identity. |
| `election_event.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `election_event.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `election_event.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `election_event.event_id` | E.event_id = key(event,[estonia, N, HK]); N is explicit inside hash and SQL uniqueness. |
| `election_event.date_id` | date- + H([N, event, E.event_id, election]); exact research_date FK. |
| `election_event.date_resolution` | resolved for sourced day or year precision; conflicting date claims in future → NULL date_id/conflicting and retained claims. |
| `election_event.event_kind` | indirect for presidential cycles except PRES_1992; PRES_1992 unknown because mixed transitional popular+ parliamentary franchise; others ordinary. Full mechanism preserved raw. |
| `election_event.selected_history_role` | E.event_role=selected; not a claim of certification or exhaustive history. |
| `election_event.electoral_system` | E.election_mode literal; current president indirect_riigikogu_or_electoral_body, 1992 transitional_popular_then_riigikogu; no inferred PR formula. |
| `election_event.comparability` | NULL; no inferred boundary or ballot comparability. |
| `election_event.ballot_basis` | candidate_marks for KOV/RK/EP; electors for indirect presidency; unknown for mixed PRES_1992, whose round-level basis stays raw. |
| `election_event.share_unit` | percent_0_100; only four supplied 1992 popular candidate percentages normalized; no computation. |
| `election_event.legal_outcome` | unknown: source is official archived result but per-event certification act not exhaustively matched. Preserve elected flags without inventing certified status. |
| `election_event.record_state` | active |
| `election_event.state_note` | NULL while active; holds and raw source text remain in raw_json. |

## proceeding

Source selector: `proceedings.json /i`.

Identity / evidence / FK / validation assertion: 24 exact ballot IDs; same-office/event FK; no invented supersedes edge. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `proceeding.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `proceeding.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `proceeding.history_key` | Exact HK = office_id + :: + cycle token (KOV_YYYY/RK_YYYY/EP_YYYY/PRES_YYYY). No date or mutable label in identity. |
| `proceeding.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `proceeding.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `proceeding.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `proceeding.proceeding_id` | Pp.proceeding_id = key(proceeding,[N, O, HK, ballot-<sequence>]). |
| `proceeding.kind` | Pp.proceeding_kind first_round/runoff/repeat. Runoff means statutory subsequent ballot in this mapping; 2016 renewed Riigikogu election is repeat, with exact stage raw. |
| `proceeding.sequence_no` | Pp.sequence positive supplied-order integer within cycle. |
| `proceeding.supersedes_id` | NULL: subsequent ballot does not erase earlier ballot. |
| `proceeding.legal_outcome` | unknown; no certification proceeding inferred from a narrative. |

## source

Source selector: `sources.json /i`.

Identity / evidence / FK / validation assertion: Every success source hash resolves; unavailable URLs and legal shells are not invented evidentiary text. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `source.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `source.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `source.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `source.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `source.source_id` | S.source_id = estonia-- + key(url, S.url). |
| `source.source_namespace` | L |
| `source.publisher` | State Electoral Office/National Electoral Committee for valimised.ee/vvk.ee; Jõhvi Vald for johvi.ee; Riigi Teataja for its retained shell; derive from verified host only. |
| `source.title` | NULL if not explicitly extracted. Source filenames/URLs survive raw; do not turn them into asserted publication titles. |
| `source.url` | S.url exact, including query/percent encoding; no aggressive URL canonicalization. |
| `source.checked_as_of_label` | S.retrieved_on |
| `source.evidence_grade` | primary_source; content_use marks legal JavaScript shells as not legal evidence. |
| `source.file_sha256` | S.sha 256 exact retained source bytes. |
| `source.locator` | C({input_path: S.input_path, sha 256: S.sha 256}); archive member locators carried by evidence_link. |
| `source.data_rights` | CC BY 4.0 for XML election open data covered by retained official open-data page; otherwise unknown. No broader site licence inference. |

## party_mapping

Source selector: `No supplied canonical party mappings`.

Identity / evidence / FK / validation assertion: Zero rows; retain original codes/labels without unsupported equivalence. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `party_mapping.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `party_mapping.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `party_mapping.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `party_mapping.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `party_mapping.party_namespace` | OMIT TABLE ROWS: no accepted coalition/party crosswalk supplied. |
| `party_mapping.mapping_id` | No row; original labels are not a fabricated canonical mapping. |
| `party_mapping.source_context` | No row; future mapping must include exact source scope. |
| `party_mapping.election_context` | No row; future mapping must be election-specific. |
| `party_mapping.original_label` | No mapping row; preserve Rr.original_party_label / candidate_or_list_label. |
| `party_mapping.original_code` | No mapping row; no invented party code. |
| `party_mapping.mapped_group` | No row; never infer equivalence from names. |
| `party_mapping.uncertainty` | No row; mapping is unsupported, not silently certain. |

## result_row

Source selector: `results.json /i`.

Identity / evidence / FK / validation assertion: 49,504 unique rows; exact event/proceeding/source FK; numeric/status pairs; no candidate+ party duplication. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `result_row.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `result_row.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `result_row.history_key` | Exact HK = office_id + :: + cycle token (KOV_YYYY/RK_YYYY/EP_YYYY/PRES_YYYY). No date or mutable label in identity. |
| `result_row.country_id` | Literal estonia from C.country_id; except record_locator uses sparse target shape below. |
| `result_row.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `result_row.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `result_row.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `result_row.result_row_id` | Rr.result_row_id = key(result,[N, O, HK, Pp.proceeding_id or main, Rr.candidate_source_id]). Source candidate number is preserved; presidency uses exact supplied candidate name within ballot. |
| `result_row.proceeding_id` | Rr.proceeding_id; non-NULL only presidential ballots; full N/O/HK/Pp FK. |
| `result_row.candidate_or_list_label` | Rr.candidate_or_list_label exact extracted label; raw source text/header retained. |
| `result_row.original_party_label` | Rr.original_party_label exact XML parent party/list; NULL for independent block without explicit name and presidential rows. No coalition equivalence inferred. |
| `result_row.original_party_code` | Rr.original_party_code or NULL exactly; codes remain scoped to original event. |
| `result_row.party_namespace` | NULL; no mapping supplied. |
| `result_row.party_mapping_id` | NULL; unsupported party normalization not a broken FK. |
| `result_row.votes` | Rr.votes integer from printed cell. Explicit 0 stays 0; missing stays NULL. Never sum candidate marks as electors. |
| `result_row.votes_status` | Rr.votes_status recorded/zero/disputed, paired with value; no zero fill. |
| `result_row.share` | Rr.share exact supplied 1992 national popular percentage only; otherwise NULL. List percentages retained separately, never copied onto candidates. |
| `result_row.share_status` | Rr.share_status (recorded for four 1992 rows; unknown elsewhere). |
| `result_row.share_unit` | percent_0_100, inherited from event convention; no numeric share asserted. |
| `result_row.seats` | Rr.seats=NULL. Candidate elected flag is separate; list mandate numbers remain nonadditive-list-summaries.json, not duplicated candidate seat totals. |
| `result_row.seats_status` | Rr.seats_status recorded/zero/unknown/disputed; blank is not zero. |
| `result_row.elected_flag` | Rr.elected_flag from explicit XML true/false; NULL absent. Old RK 2015/19 flag joins exact candidateRegNumber from election-result file and verifies votes; origin retained in raw. |
| `result_row.is_substitute` | Rr.is_substitute from explicit reserved true/false, otherwise NULL. |
| `result_row.evidence_status` | Rr.evidence_status=recorded; official provenance is not certification. |

## record_locator

Source selector: `Typed PKs; complete identity vectors`.

Identity / evidence / FK / validation assertion: Exactly one sparse typed target; result locator proceeding_id NULL. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `record_locator.country_id` | estonia for country/geography/office/event/proceeding/result_row/source; NULL input. |
| `record_locator.id_namespace` | N for office/event/proceeding/result_row; NULL otherwise. |
| `record_locator.office_id` | O for office/event/proceeding/result_row only. |
| `record_locator.history_key` | HK for event/proceeding/result_row only. |
| `record_locator.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `record_locator.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `record_locator.record_key` | rec- + H([entity_kind,...typed PK]); exact tuples in Identity Rules and complete vectors. |
| `record_locator.entity_kind` | country/geography/office/event/proceeding/result_row/source/input; no party_mapping rows. |
| `record_locator.geography_id` | G ID only for geography locator, NULL even for office locator. |
| `record_locator.proceeding_id` | Pp ID only for proceeding locator. NULL for result locator even when result_row.proceeding_id is populated: sparse DDL shape. |
| `record_locator.result_row_id` | Rr ID only for result_row locator. |
| `record_locator.party_namespace` | NULL |
| `record_locator.party_mapping_id` | NULL |
| `record_locator.source_namespace` | L only for source locator. |
| `record_locator.source_id` | S ID only for source locator. |
| `record_locator.input_path` | Exact retained-input path only for input locator. |
| `record_locator.source_row_locator` | C({derived_path, derived_json_pointer, origins}); JSON zero-based; XML XPath one-based after namespace stripping; HTML table/row one-based. Original XML namespaces/bytes retained. |

## evidence_link

Source selector: `origins/origin/raw.date_origin/raw.election_status_origin; exact source tuple`.

Identity / evidence / FK / validation assertion: Target/source exist; exact source XPath/table/hash preserved; date claim uses date origin, not generated timestamp. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `evidence_link.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `evidence_link.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `evidence_link.evidence_id` | ev- + H([record_key,[estonia, L, source_id], occurrenceIdentity, claim_kind]); occurrenceIdentity is full origin object excluding source_id, including XML XPath or HTML locator and archive/member hashes. |
| `evidence_link.record_key` | Typed existing record_locator.record_key. |
| `evidence_link.source_country_id` | estonia |
| `evidence_link.source_namespace` | L |
| `evidence_link.source_id` | Exact origin.source_id (or verified path→S lookup). A missing known source fails import; never fabricate a source. |
| `evidence_link.source_locator` | C(full original locator including hash, XML XPath/HTML table/row, archive path/member/hash where present). |
| `evidence_link.claim_kind` | office→identity; geography→geography; event date origin→date; result→result; proceeding→ballot; input→provenance. Do not label result XML generated timestamp as election-date evidence. |
| `evidence_link.date_claim_id` | Date claim only: event or next-date row; NULL otherwise. Proceeding dates retained with dedicated research_date and raw reference because proceeding has no date FK. |
| `evidence_link.claim_json` | C({origin, supplied_claim, holds}); both conflicting claims preserved, no unsupported reconciliation. |

## unresolved_evidence

Source selector: `source-acquisition-gaps.json; actual unresolved citation tokens only`.

Identity / evidence / FK / validation assertion: Real target+ original unresolved token; never use this table to excuse a broken resolved FK. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `unresolved_evidence.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `unresolved_evidence.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `unresolved_evidence.raw_json` | C(original token and provenance); this table has no source FK by design. |
| `unresolved_evidence.unresolved_id` | unres- + H([record_key, occurrenceIdentity, original_token]). |
| `unresolved_evidence.record_key` | Existing real entity or input record locator; unresolved evidence never creates an office. |
| `unresolved_evidence.original_token` | Verbatim unresolvable citation token only; failed acquisition URL may be recorded against retained gap-input locator. No fabricated source_id. |
| `unresolved_evidence.source_locator` | C(exact retained source/gap-file pointer and supplied token). |
| `unresolved_evidence.reason` | Specific resolution failure from source-acquisition-gaps or future original citation. Research coverage gap alone is not an invented citation. |

## identity_crosswalk

Source selector: `identity-crosswalk.json /i`.

Identity / evidence / FK / validation assertion: Exact EHAK alias; no name-matched successor. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `identity_crosswalk.lineage_id` | Constant L = country-package-estonia. Never derive from latest publication receipt. |
| `identity_crosswalk.release_id` | Candidate R = L + --sha 256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `identity_crosswalk.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `identity_crosswalk.entity_kind` | X.entity_kind |
| `identity_crosswalk.upstream_namespace` | X.upstream_namespace=ehak: volikogu; raw cycle snapshots retain historical context. Future documented code reuse requires reviewed versioned crosswalk, not silent merge. |
| `identity_crosswalk.upstream_id` | X.upstream_id exact official code or preserved research geography ID. |
| `identity_crosswalk.record_key` | X.record_key → real typed locator. |
| `identity_crosswalk.reason` | X.reason; never infer merger/split/successor from this alias. |

## ingest_attempt

Source selector: `Future separate durable runtime ledger`.

Identity / evidence / FK / validation assertion: New attempt per run; failure durable outside staging; no run claimed here. Full deterministic typed keys are in Identity Rules; source locators carry hashes.

| Destination column | Source → conversion / null policy |
|---|---|
| `ingest_attempt.lineage_id` | L, durable sibling ledger only. |
| `ingest_attempt.attempt_id` | attempt- + runtime UUID; new every invocation, excluded from fingerprint. |
| `ingest_attempt.operator` | Actual future operator identity; not fabricated in research pack. |
| `ingest_attempt.script_version` | Actual future importer build/version; Not run here. |
| `ingest_attempt.started_at` | Actual UTC runtime start, committed before staging. |
| `ingest_attempt.finished_at` | NULL while started; actual UTC terminal time after success/failure. |
| `ingest_attempt.status` | started first, then succeeded only after verified publication, otherwise failed; no attempt row emitted now. |
| `ingest_attempt.input_inventory_json` | C(actual attempted descriptors/version set, including unavailable-input errors). |
| `ingest_attempt.successful_release_id` | NULL on started/failed; R on verified success. Same R for unchanged reimport. |
| `ingest_attempt.publication_set_json` | NULL until success; then full set of all lineage/release pairs, including unchanged non-Estonia members. |
| `ingest_attempt.row_counts_json` | NULL until actual success; future observed counts, not this report masquerading as execution. |
| `ingest_attempt.error_text` | NULL except failed; preserve exact error reason; no fabricated successful run. |

## Publication contract (future execution only)

Create staging on the serving database filesystem. Write/commit durable attempt start outside staging. Validate all incoming rows and the full coexisting lineage set; checkpoint/close WAL, fsync file and directory as required, then atomic rename. On any failure keep last good database serving and persist failed attempt. Receipt records last successful operation; citations stay with each row's lineage/release. Draft tiers, missing required evidence, unknown schema/version, fixture IDs or poisoned references fail closed. No execution CI is claimed here.

## Conflicting aggregate claims

`unresolved-aggregate-claims.json` is a documentary review aid, with exact original locators for both 2013 totals. A future implementation binds both numeric claims through `evidence_link` to the real Estonia country locator (claim_kind=aggregate_valid_votes) and keeps their context in country/raw retained inputs. These are two resolved sources in conflict, not an unresolved citation token. No reconciled national aggregate or accepted scalar override is supplied.
