# Lithuania → Atlas field map — Prompt AH (DRAFT)

Pin `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33`. **20 tables /223 columns**; machine maps `column-map.json` and `contract-columns.json` cover the exact unchanged Prompt B DDL. Draft tier SHA `43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39`. Unknown upstream fields survive in raw/retained input, never invented columns.

## Binding conventions

Research paths start `data/research/lithuania/`. O=office, G=geography, E=event, Pp=proceeding, Rr=result, S=source, C=country, X=crosswalk, T=tier, I=inventory, K=counts. C(x) in identity expressions means compact canonical JSON, not the country object. L=`country-package-lithuania`; N=`cdd-observatory-v1`; R is the inventory candidate release. JSON pointers 0-based; HTML table/row/paragraph and PDF page indices 1-based. For every column, inherit its table's **source selector, deterministic key, evidence/FK and validation** below; the row supplies conversion/null policy. `Lithuania_Identity_Rules.md` defines all keys; full vectors enumerate every supplied entity.

## Source extraction and no-double-count rules

LSA first HTML table rows 2–61 is the 60 municipality roster. Column 3 jurisdiction plus linked municipality website supplies the identity binding; column 4 incumbent is context only. Current law I-533 article 3(6) supports the elected council and mayor; article 3(3) identifies the executive mayor. One geography and two office rows per jurisdiction. County labels do not create regional offices. Preserve source abbreviations and Lithuanian diacritics.

Municipal history: LSA 2019-03-05 article paragraphs 2–3 name 19 first-round winners. Only these 19 office-cycle/result observations are normalized; no full vector is claimed. The exact nationwide first-round date is separately bound to ODIHR 2019 PDF page 5. Approximate `beveik`/`apie` expressions retain original text and NULL share;15 numeric printed percentages retain their published precision. No vote or seat inferred from a winner claim.

Seimas:2008/2012/2016 use only the election-outcome paragraph; later parliamentary faction composition is not an election result.2012 subtotal 139 is not balanced to 141.2020 uses ODIHR PDF page 20 table: PR votes/share alongside total seats; PR/SMC components stay raw. Empty/dash cells remain NULL; explicit 0 stays 0.2024 official Seimas page supplies two dates but no normalized results. No summing PR and SMC votes or first and runoff totals.

EP: one `Composition of national seats` matrix per cycle 2004/2009/2014/2019/2024. Charts, political-group tables and country totals are duplicate/nonadditive views. Other parties remains an aggregate label, not canonical party.2004 has seats only. Year precision remains honest where this extraction has no day evidence.

President 2019: ODIHR PDF page 25, annex I, two tables.11 candidate rows attach to first-round/runoff proceedings of one cycle. Preserve printed spelling `Arvydas Juzoaitis`; do not silently substitute a different name. All 11 printed percentages have disputed status because the header and arithmetic basis conflict. Malformed invalid count `1,7205` remains raw/disputed, not a guessed integer.2024 needs-assessment report is retained as pre-election context and creates no invented completed event/result.

No history-index/master/companion duplication exists: this is new research. Full source HTML/PDF/schema CSV are retained with hashes; raw row cells and source-level claims survive. Every normalized record owns its L/R, not the newest publication receipt. No margins/tightness computation, geometry, polls, or canonical party mapping is supplied.

## dataset_lineage

Source: `country.json + literal L`.

Identity / evidence-FK / validation: Exactly country-package-lithuania; country_package provenance; no Latvia/LatAm alias reuse. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `dataset_lineage.lineage_id` | L |
| `dataset_lineage.provenance_kind` | country_package |
| `dataset_lineage.description` | New Lithuania research lineage:123 current offices; recovered history partial and historical-office universe unresolved. |

## dataset_release

Source: `Lithuania_Input_Inventory.json /hash_inputs and /fingerprint_sha256`.

Identity / evidence-FK / validation: Identical effective inputs → same R; attempt ID/clock/ZIP checksum excluded. Coverage complete=0. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `dataset_release.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `dataset_release.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `dataset_release.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `dataset_release.fingerprint_sha256` | H(I.hash_inputs), canonical UTF-8 JSON; never ZIP bytes/clock/attempt. |
| `dataset_release.hash_inputs_json` | C(I.hash_inputs), exact sorted effective descriptors, tier draft bytes, overrides=[] and adapter/method/schema versions. |
| `dataset_release.adapter_version` | atlas-lithuania-full-register/1 |
| `dataset_release.method_version` | atlas-preserve-evidence/1 |
| `dataset_release.schema_version` | atlas-master/1 |
| `dataset_release.research_snapshot_label` | C.research_snapshot_label; acquisition date is not election date. |
| `dataset_release.upstream_release_id` | NULL: this new Lithuania research has no pre-existing public release alias. |
| `dataset_release.validated_counts_json` | C(K) after future import validation; documentary pack counts are not a success receipt. |
| `dataset_release.research_coverage_complete` | 0: municipal candidate vectors, historical territorial identities, recent presidential results, certification and disputed presidential percentages remain open. |

## publication_release

Source: `future candidate Lithuania member plus all served lineages`.

Identity / evidence-FK / validation: One member per lineage; Europe refresh cannot change unrelated citations/rows. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `publication_release.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `publication_release.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |

## publication_receipt

Source: `future successful publication only`.

Identity / evidence-FK / validation: Only after successful actual atomic publication; no success receipt supplied. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `publication_receipt.singleton` | 1, future runtime only. |
| `publication_receipt.last_publish_attempt_id` | Current durable runtime attempt ID after validated staged publication; not a release ID. |
| `publication_receipt.attempted_lineage_id` | L |
| `publication_receipt.attempted_release_id` | R |

## retained_input

Source: `inventory /hash_inputs/inputs/* + exact file bytes`.

Identity / evidence-FK / validation: Each descriptor hash and byte count match; every unmodelled original field survives. Metadata-only/error shells support no missing fact. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `retained_input.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `retained_input.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `retained_input.input_path` | Exact I.hash_inputs.inputs[].input_path relative to pack/repository recovery root; preserve spelling and percent escapes. |
| `retained_input.input_kind` | Descriptor input_kind: source artifacts=artifact; derived research=package; tiers=tier_classification. |
| `retained_input.sha256` | SHA-256 of exact bytes, equals descriptor sha256; immutable. |
| `retained_input.byte_count` | Exact byte length, not character count or decompressed estimate. |
| `retained_input.recovery_locator` | Immutable approved pack location + exact relative input_path; verify byte hash before use; no filesystem path fabricated as URL. |
| `retained_input.payload_json` | Full parsed JSON → canonical JSON; HTML/PDF and schema CSV → NULL payload_json plus exact retained bytes/recovery locator. All unknown cells, source prose, numeric claims and unresolved tokens remain recoverable. No script execution. |

## country

Source: `country.json`.

Identity / evidence-FK / validation: One sovereign Lithuania record, LT/europe/partial. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `country.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `country.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `country.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `country.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `country.country_code` | LT from C.country_code. |
| `country.name` | Lietuva from C.name. |
| `country.polity_kind` | sovereign_country |
| `country.region_id` | europe; continent scope not office tier. |
| `country.coverage_status` | partial |
| `country.screening_as_of_label` | 2026-09-21; source-specific snapshots retained separately. |
| `country.notes` | Join C.notes as human text; retain full arrays and research gaps in raw_json. |

## geography

Source: `geography.json /i`.

Identity / evidence-FK / validation: 61 IDs including national LT; municipal parents LT; no successor edges. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `geography.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `geography.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `geography.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `geography.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `geography.geography_id` | Exact G.geography_id; country-scoped PK. |
| `geography.name` | G.name preserves official source orthography; display labels never PK. |
| `geography.parent_geography_id` | G.parent_geography_id: LT for 60 municipalities; NULL for national LT. County labels remain raw; no elected regional office inferred. |
| `geography.effective_from_label` | G.valid_from=NULL; source snapshot is not founding date. |
| `geography.effective_to_label` | G.valid_to=NULL; missing future snapshot is not abolition. |

## research_date

Source: `events.json /i/date; proceedings.json /i/date`.

Identity / evidence-FK / validation: Year/month/day components match precision; no inauguration/publication date substituted. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `research_date.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `research_date.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `research_date.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `research_date.date_id` | date-+H([N, ownerType, ownerID, slot]); event/E.event_id/election; proceeding/Pp.proceeding_id/ballot. Next dates absent. |
| `research_date.label` | E.date.label or Pp.date.label. Seimas 2008/2012 and EP 2004–2024 year-only; Seimas 2016 month-only; explicit day only where actually recovered. |
| `research_date.precision` | E.date.precision or Pp.date.precision; no day substituted from first sitting/publication. |
| `research_date.certainty` | E.date.certainty/Pp.date.certainty=called for retrospective source occurrence. Planned but unverified past presidential 2024 call retained as context only, not normalized occurrence. |
| `research_date.year` | Exact supplied year. |
| `research_date.month` | Exact supplied month, NULL for year precision. |
| `research_date.day` | Exact supplied day, NULL for month/year precision. |
| `research_date.range_start_id` | NULL in this pack; future range must point to sourced ordered non-range endpoints. |
| `research_date.range_end_id` | NULL in this pack; never infer range from a term length. |

## office

Source: `office-register.json /i`.

Identity / evidence-FK / validation: 123 unique existing documentary IDs; exactly 60 council+60 mayor pairs and 3 national/supranational offices. All source aliases trace to roster or institution. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `office.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `office.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `office.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office.geography_id` | O.geography_id, FK to (lithuania, G.geography_id). |
| `office.name` | O.office_name: exact LSA abbreviated jurisdiction plus statutory body descriptor; no manufactured full translation. |
| `office.office_type` | O.office_type: municipal_council/direct_mayor/national_parliament/direct_president/european_parliament_delegation. Mode and geographic tier separate. |
| `office.office_status` | current if O.current; all 123 current in this recovered register. Historical zero is not a completeness assertion. |
| `office.record_state` | active; historical is not deleted/withdrawn. Explicit future withdrawal requires sourced state note. |
| `office.state_note` | NULL while active; research holds retained in raw_json, not fabricated withdrawals. |
| `office.registry_qualified` | 0 until applicable holds and draft acceptance are reviewed; source-backed current scope still retained. |
| `office.next_date_id` | NULL for every office: no exact next call recovered. Term-length narrative is not a next date. |
| `office.next_date_resolution` | unknown; no next date inferred from legal term or alert window. |
| `office.next_history_key` | NULL; no synthesized prospective event. |

## office_tier_classification

Source: `schemas/atlas/tiers/lithuania.json /classifications/i`.

Identity / evidence-FK / validation: Exact 123 office set; municipal 120/national 2/other 1/regional 0; draft requires Justin approval before production. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `office_tier_classification.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office_tier_classification.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office_tier_classification.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `office_tier_classification.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office_tier_classification.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office_tier_classification.tier` | T.classifications[i].schema_v 1_tier; national→national_context. Unknown would map NULL, never other. |
| `office_tier_classification.review_status` | needs_review for all draft rows, even when human_review_required=false. No pack approval in this task. |
| `office_tier_classification.rationale` | T.classifications[i].rationale verbatim. |
| `office_tier_classification.classification_path` | schemas/atlas/tiers/lithuania.json |
| `office_tier_classification.classification_kind` | tier_classification |
| `office_tier_classification.classification_sha256` | 43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39 |

## election_event

Source: `events.json /i`.

Identity / evidence-FK / validation: 30 unique N/O/HK and event IDs; history not filtered by upcoming window. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `election_event.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `election_event.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `election_event.history_key` | Exact HK=office_id+::+cycle: EPYYYY/SEIYYYY/PRE2019/SAV2019. Round/date refinement never changes HK. |
| `election_event.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `election_event.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `election_event.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `election_event.event_id` | E.event_id = key(event,[lithuania, N, HK]); N is explicit inside hash and SQL uniqueness. |
| `election_event.date_id` | date- + H([N, event, E.event_id, election]); exact research_date FK. |
| `election_event.date_resolution` | resolved for recovered year/month/day occurrence; precision is independent of resolution. |
| `election_event.event_kind` | E.event_kind=ordinary for 30 recovered cycles. Repeat/by-election references retained as research notes until exact event binding. |
| `election_event.selected_history_role` | selected for evidenced historical cycle; this does not certify numeric completeness. No prospective rows. |
| `election_event.electoral_system` | direct_popular_mixed for LT-SEIMAS; direct_popular_two_round for LT-PRESIDENT and direct_mayor; direct_popular_list for municipal councils and EP. O/E basic direct_popular mode enriched by retained constitutional/legal sources, never by tier. |
| `election_event.comparability` | NULL; no inferred boundary or ballot comparability. |
| `election_event.ballot_basis` | unknown: source grains differ; PRE2019 percentage denominator is disputed; SEI2020 PR votes versus total seats remain explicitly distinct in raw. Do not claim valid_votes basis for all rows. |
| `election_event.share_unit` | percent_0_100 |
| `election_event.legal_outcome` | E.legal_outcome=unknown; official publication/final-result republication alone does not resolve all court/annulment checks. |
| `election_event.record_state` | active |
| `election_event.state_note` | NULL while active; holds and raw source text remain in raw_json. |

## proceeding

Source: `proceedings.json /i`.

Identity / evidence-FK / validation: 25 unique round IDs; full N/O/HK FK; rounds never counted as extra cycles. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `proceeding.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `proceeding.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `proceeding.history_key` | Exact HK=office_id+::+cycle: EPYYYY/SEIYYYY/PRE2019/SAV2019. Round/date refinement never changes HK. |
| `proceeding.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `proceeding.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `proceeding.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `proceeding.proceeding_id` | Pp.proceeding_id=key(proceeding,[N, O, HK, ballot-<sequence>]). |
| `proceeding.kind` | Pp.kind=first_round or runoff; sequence is an actual ballot round, not source document number. |
| `proceeding.sequence_no` | Pp.sequence:1 or 2;19 mayor first rounds,2 presidential rounds,4 Seimas rounds. Missing rounds not inserted. |
| `proceeding.supersedes_id` | NULL: subsequent ballot does not erase earlier ballot. |
| `proceeding.legal_outcome` | unknown; elected observations do not fabricate formal certification. |

## source

Source: `sources.json /i`.

Identity / evidence-FK / validation: 53 unique URL identities; exact hashes; not all retained pages are claim-bearing. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `source.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `source.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `source.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `source.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `source.source_id` | S.source_id = lithuania-- + key(url, S.url). |
| `source.source_namespace` | L |
| `source.publisher` | S.publisher exact attribution; OSCE republication distinct from directly acquired VRK; LSA association report distinct from electoral certification. |
| `source.title` | Source HTML title/PDF title when explicitly extracted; otherwise NULL. URL is not invented title. |
| `source.url` | S.url exact, including query/percent encoding; no aggressive URL canonicalization. |
| `source.checked_as_of_label` | S.retrieved_on |
| `source.evidence_grade` | S.evidence_grade=official_publication; row-level origin identifies legal, roster, narrative or republication use. Error/navigation/schema shells are never numeric evidence. |
| `source.file_sha256` | S.sha256 exact retained source bytes. |
| `source.locator` | C({input_path: S.input_path, sha256: S.sha256}); row/page locators in evidence. |
| `source.data_rights` | unknown unless source-specific licence is explicitly retained. LSA attribution notice retained; no general permission inferred. |

## party_mapping

Source: `No canonical mapping supplied:0rows`.

Identity / evidence-FK / validation: Zero rows until evidenced mapping; original list names/codes preserved. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `party_mapping.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `party_mapping.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `party_mapping.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
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

Source: `results.json /i`.

Identity / evidence-FK / validation: 130 unique IDs; full office/event/optional proceeding tuple resolves; exact numeric/status pairs;11 disputed shares retained. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `result_row.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `result_row.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `result_row.history_key` | Exact HK=office_id+::+cycle: EPYYYY/SEIYYYY/PRE2019/SAV2019. Round/date refinement never changes HK. |
| `result_row.country_id` | Literal lithuania from C.country_id; except record_locator uses sparse target shape below. |
| `result_row.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `result_row.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `result_row.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `result_row.result_row_id` | Rr.result_row_id = key(result,[N, O, HK, Pp.proceeding_id or main, Rr.candidate_source_id]). Source candidate number is preserved; presidency uses exact supplied candidate name within ballot. |
| `result_row.proceeding_id` | Rr.proceeding_id for 19 mayor and 11 presidential result claims. SEI2020 whole-event combined seat summary has NULL; PR and SMC seat components retained raw. |
| `result_row.candidate_or_list_label` | Rr.candidate_or_list_label exact extracted label; raw source text/header retained. |
| `result_row.original_party_label` | Rr.original_party_label; NULL for candidate and Other parties/Independents aggregates; no unsupported candidate-party match. |
| `result_row.original_party_code` | Rr.original_party_code, exact EP code or source event-scoped label. No canonical legal-party identity. |
| `result_row.party_namespace` | NULL; no mapping supplied. |
| `result_row.party_mapping_id` | NULL; unsupported party normalization not a broken FK. |
| `result_row.votes` | Rr.votes:17 SEI2020 PR counts or 11 PRE2019 candidate counts; otherwise NULL. No votes reverse-calculated from shares/seats. |
| `result_row.votes_status` | Rr.votes_status exact recorded/zero/unknown. |
| `result_row.share` | Rr.share exact published number where supported;4 approximate mayor percentage expressions remain NULL with raw text.11 PRE2019 percentages remain numeric disputed, not automatically corrected. |
| `result_row.share_status` | Rr.share_status; unknown for absent/approximate; disputed for 11 presidential claims; recorded for exact printed percentages. Source-reported precision is not certified precision. |
| `result_row.share_unit` | Rr.share_unit=percent_0_100. |
| `result_row.seats` | Rr.seats: printed total seats only; NULL for candidate winners and source dash/absence. Explicit 0 retains 0. No winner→1 inference. |
| `result_row.seats_status` | Rr.seats_status exact; source dash is unknown, printed 0 is zero. |
| `result_row.elected_flag` | Rr.elected_flag:19 source-reported mayor winners true; presidential first round false, runoff winner true/loser false; list/seat summaries NULL. |
| `result_row.is_substitute` | NULL; no mandate replacement claims normalized. |
| `result_row.evidence_status` | Rr.evidence_status: disputed for 11 presidential denominator conflicts; recorded for source claims. Partial vector status in raw is not numeric zero. |

## record_locator

Source: `complete typed entity keys in identity vectors`.

Identity / evidence-FK / validation: Exactly one sparse typed target; result locator has NULL proceeding_id even if result row has a proceeding. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `record_locator.country_id` | lithuania for country/geography/office/event/proceeding/result_row/source; NULL input. |
| `record_locator.id_namespace` | N for office/event/proceeding/result_row; NULL otherwise. |
| `record_locator.office_id` | O for office/event/proceeding/result_row only. |
| `record_locator.history_key` | HK for event/proceeding/result_row only. |
| `record_locator.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `record_locator.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
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
| `record_locator.source_row_locator` | C({derived_path, derived_json_pointer, origins}); JSON 0-based, HTML tables/rows/paragraphs 1-based, PDF pages 1-based. Sparse result locator.proceeding_id stays NULL even when result.proceeding_id populated. |

## evidence_link

Source: `origins[]; raw.date_origin for mayor date claim`.

Identity / evidence-FK / validation: Full country/source_namespace/source_id FK and row origin; claim types remain distinct. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `evidence_link.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `evidence_link.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `evidence_link.evidence_id` | ev-+H([record_key,[lithuania, L, source_id], occurrenceIdentity, claim_kind]); occurrenceIdentity=origin excluding source_id. |
| `evidence_link.record_key` | Typed existing record_locator.record_key. |
| `evidence_link.source_country_id` | lithuania |
| `evidence_link.source_namespace` | L |
| `evidence_link.source_id` | Exact origin.source_id (or verified path→S lookup). A missing known source fails import; never fabricate a source. |
| `evidence_link.source_locator` | C(exact origin locator path+hash+table/row or PDF page+table+row or legal article). |
| `evidence_link.claim_kind` | identity/geography/date/result/provenance; source acquisition time is not election date. |
| `evidence_link.date_claim_id` | Date claim only: event or next-date row; NULL otherwise. Proceeding dates retained with dedicated research_date and raw reference because proceeding has no date FK. |
| `evidence_link.claim_json` | C({origin, supplied_claim, holds}); both conflicting claims preserved, no unsupported reconciliation. |

## unresolved_evidence

Source: `unresolved-aggregate-claims.json + malformed invalid claim in return-reconciliation.json`.

Identity / evidence-FK / validation: Real target record, exact unresolved/conflicting token; a broken known FK fails closed. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `unresolved_evidence.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `unresolved_evidence.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `unresolved_evidence.raw_json` | C(original token and provenance); this table has no source FK by design. |
| `unresolved_evidence.unresolved_id` | unres- + H([record_key, occurrenceIdentity, original_token]). |
| `unresolved_evidence.record_key` | Existing real entity or input record locator; unresolved evidence never creates an office. |
| `unresolved_evidence.original_token` | Exact token from unresolved-aggregate-claims.json for PRE2019 denominator disputes; malformed runoff invalid token retained separately in return-reconciliation.json. Broken known source ID always fails closed, not converted into unresolved token. |
| `unresolved_evidence.source_locator` | C(exact retained source/gap-file pointer and supplied token). |
| `unresolved_evidence.reason` | Specific resolution failure from source-acquisition-gaps or future original citation. Research coverage gap alone is not an invented citation. |

## identity_crosswalk

Source: `identity-crosswalk.json /i`.

Identity / evidence-FK / validation: Source alias only, no fabricated temporal successor. Exact typed keys follow the Identity Rules and complete vectors.

| Destination column | Source → conversion / null policy |
|---|---|
| `identity_crosswalk.lineage_id` | Constant L = country-package-lithuania. Never derive from latest publication receipt. |
| `identity_crosswalk.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `identity_crosswalk.raw_json` | C({origin, row, columns: null, values: null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `identity_crosswalk.entity_kind` | X.entity_kind |
| `identity_crosswalk.upstream_namespace` | X.upstream_namespace=lsa: municipality-website:2026-snapshot:<office_type>. This is source URL alias, not a successor edge or official territorial code. |
| `identity_crosswalk.upstream_id` | X.upstream_id exact retained LSA municipality website URL. No spelling-based successor links. |
| `identity_crosswalk.record_key` | X.record_key → real typed locator. |
| `identity_crosswalk.reason` | X.reason; never infer merger/split/successor from this alias. |

## ingest_attempt

Source: `future separate durable ledger only`.

Identity / evidence-FK / validation: New attempt every run, separately durable; no attempt executed in this documentation task. Exact typed keys follow the Identity Rules and complete vectors.

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
| `ingest_attempt.publication_set_json` | NULL until success; then full set of all lineage/release pairs, including unchanged non-Lithuania members. |
| `ingest_attempt.row_counts_json` | NULL until actual success; future observed counts, not this report masquerading as execution. |
| `ingest_attempt.error_text` | NULL except failed; preserve exact error reason; no fabricated successful run. |

## Future publication protocol — execution Not run

Durable attempt start in sibling ledger; same-filesystem staging; explicit accepted tiers/overrides; full resolved-reference and multi-lineage validation; checkpoint/close WAL; fsync staging and directory; atomic rename. Failure leaves last good publication serving and records durable failure. Incomplete refresh retains omitted existing identities. No SQL tier inference or positive regional numerator gate.
