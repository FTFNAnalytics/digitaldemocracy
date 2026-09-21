# Latvia → Atlas field map — Prompt AG (DRAFT)

Pinned main `f7b5c81ebd39f1774edea7cde5b4155031d92647`. **20 tables /223 columns**. Exact machine-readable maps: `column-map.json`, `contract-columns.json`. Reference-only pinned DDL copies remain unchanged. Draft tier SHA `7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce`. All tiers need Justin acceptance; no SQL tier inference or positive regional requirement.

Research paths start `data/research/latvia/`. O=office, G=geography, E=event, Pp=proceeding, Rr=result, S=source, C=country, X=crosswalk, T=tier, I=inventory, K=counts. C(x) means canonical JSON in identity expressions. L/N/R are fixed in Identity Rules. JSON indexes0-based; XML/HTML tables/rows1-based. A field inherits its table's source selector and exact ID/FK/assertion below; its conversion cell supplies field-specific behavior. No destination columns are invented.

## Extraction contract

Current42 councils: CVK2025 municipal pages, table1 list results; table2 totals reconcile votes. Five region navigation groupings are not offices. Statutory annex confirms7 state-city council jurisdictions +35 novadi, despite ten places holding state-city status. Exact current names remain sourced, not generated translations.

2017 XML: only DepartmentResultModel with Type=2 creates council/event/list rows;119 instances. Id remains source alias, CandidateListId is result identity. CandidateListResults/ValidMarkCount/Count→votes; /Percentage→share; ElectedCandidateCount/Count→seats. Full CandidateListsResults and precinct/region/national aggregates stay retained_input, never extra additive results. The119 historical snapshot identities are a conservative hold, not a count of abolished councils.

2021 main archive has40 per-council result tables. Separate VRD2021 page has2 September contests. RD2020 contains one Riga extraordinary contest. Current43 post-reform observations are not43 June 2021 events. Enlarged Madona 2025 does not erase 2021 Madona/Varakļāni. Earlier cycle pages are context-only until full office/return normalization.

National/EP normalize only all-country list tables for 2014/2018/2022 Saeima and 2014/2019/2024 EP. Source-preserved seven 2022 shares have competing current-summary claims and statusdisputed. No clamping, inferred denominator, or alternate selection. Printed blankseats→NULL/unknown; explicit 0→0/zero. All210 complete list vectors reconcile to distinct supplied valid-ballot totals. This does not make every event certified.

Presidential evidence is parliamentary:1993/1996/1999 occurrence only;2003 winner 88 withyearprecision;2015 fifth-round winner 55;2023 first-round 25/42/10. The retained signed PDF is visually transcribed (pages 1/4), not claimed as OCR-certified. Its ballot form 6 is not the round sequence. Full opposing counts and87 valid/10 against-all remain raw. No popular presidential denominator, invented candidates or missing rounds.

Unknown/raw source fields remain lossless: full original XML/HTML/PDF/JS plus raw row cells/objects and precise locators. No new metric tables or importer code. Margins and candidate preference calculations are deferred. Every data row carries its own L/R. Missing scalar isNULL, never0. Missing whole canonical party table emits0 rows. Incomplete refresh retains omitted published identities.

## dataset_lineage

Source: `country.json /; I.lineage_id`.

Identity, evidence/FK and validation: Exact country-package-latvia. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `dataset_lineage.lineage_id` | L |
| `dataset_lineage.provenance_kind` | country_package |
| `dataset_lineage.description` | New Latvia research lineage: full42 current council roster + national bodies; historical snapshots and ballot coverage explicitly partial. |

## dataset_release

Source: `I.hash_inputs; counts.json; country.json`.

Identity, evidence/FK and validation: Same effective inputs produce sameR; no clock/attempt in hash; coverage_complete0. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `dataset_release.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `dataset_release.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `dataset_release.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `dataset_release.fingerprint_sha256` | H(I.hash_inputs), canonical UTF-8 JSON; never ZIP bytes/clock/attempt. |
| `dataset_release.hash_inputs_json` | C(I.hash_inputs), exact sorted effective descriptors, tier draft bytes, overrides=[] and adapter/method/schema versions. |
| `dataset_release.adapter_version` | atlas-latvia-full-register/1 |
| `dataset_release.method_version` | atlas-preserve-evidence/1 |
| `dataset_release.schema_version` | atlas-master/1 |
| `dataset_release.research_snapshot_label` | C.research_snapshot_label; acquisition date is not election date. |
| `dataset_release.upstream_release_id` | NULL: this new Latvia research has no pre-existing public release alias. |
| `dataset_release.validated_counts_json` | C(K) after future import validation; documentary pack counts are not a success receipt. |
| `dataset_release.research_coverage_complete` | 0: reform identity resolution, earlier returns, presidential ballot gaps, certification and7 conflicting 2022 share claims remain open. |

## publication_release

Source: `Future Latvia candidate + complete existing publication set`.

Identity, evidence/FK and validation: Preserve every non-Latvia member and citation owner. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `publication_release.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `publication_release.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |

## publication_receipt

Source: `Future successful atomic publication only`.

Identity, evidence/FK and validation: Only after real successful atomic publication; none supplied. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `publication_receipt.singleton` | 1, future runtime only. |
| `publication_receipt.last_publish_attempt_id` | Current durable runtime attempt ID after validated staged publication; not a release ID. |
| `publication_receipt.attempted_lineage_id` | L |
| `publication_receipt.attempted_release_id` | R |

## retained_input

Source: `I.hash_inputs.inputs[*]`.

Identity, evidence/FK and validation: All effective files hashed; every unknown field recoverable. Never execute HTML/JS. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `retained_input.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `retained_input.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `retained_input.input_path` | Exact I.hash_inputs.inputs[].input_path relative to pack/repository recovery root; preserve spelling and percent escapes. |
| `retained_input.input_kind` | Descriptor input_kind: source artifacts=artifact; derived research=package; tiers=tier_classification. |
| `retained_input.sha256` | SHA-256 of exact bytes, equals descriptor sha256; immutable. |
| `retained_input.byte_count` | Exact byte length, not character count or decompressed estimate. |
| `retained_input.recovery_locator` | Immutable approved pack location + exact relative input_path; verify byte hash before use; no filesystem path fabricated as URL. |
| `retained_input.payload_json` | JSON documents → C(full parsed document); XML/HTML/PDF/JS retained as exact bytes with SHA/recovery locator, payload_json NULL. Never execute website scripts. Candidate preference marks and polling-station breakdowns remain in source XML/HTML, not additional additive results. |

## country

Source: `country.json /`.

Identity, evidence/FK and validation: One Latvia country; coverage partial, current council roster verified. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `country.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `country.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `country.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `country.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `country.country_code` | LV from C.country_code. |
| `country.name` | Latvija from C.name. |
| `country.polity_kind` | sovereign_country |
| `country.region_id` | europe; continent scope not office tier. |
| `country.coverage_status` | partial |
| `country.screening_as_of_label` | 2026-09-21; source-specific snapshots retained separately. |
| `country.notes` | Join C.notes as human text; retain full arrays and research gaps in raw_json. |

## geography

Source: `geography.json /i`.

Identity, evidence/FK and validation: 164 identities, nullable parents, no guessed successor/abolition dates. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `geography.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `geography.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `geography.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `geography.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `geography.geography_id` | Exact G.geography_id; country-scoped PK. |
| `geography.name` | G.name preserves official source orthography; display labels never PK. |
| `geography.parent_geography_id` | G.parent_geography_id=NULL; election grouping Vidzeme/Latgale/etc is not a new elected regional office. |
| `geography.effective_from_label` | G.valid_from or NULL; snapshot epoch is not legal establishment day. |
| `geography.effective_to_label` | G.valid_to or NULL; no abolition date inferred from current-roster absence. |

## research_date

Source: `events.json /i/date; office-register.json /i/next_date; proceedings.json /i/date_label`.

Identity, evidence/FK and validation: PRES2003 year precision; other sourced day dates; no acquisition-date substitution; no fake local next dates. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `research_date.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `research_date.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `research_date.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `research_date.date_id` | date- + H([N,ownerType,ownerId,slot]); event/E.event_id/election, office/O.office_id/next, proceeding/Pp.proceeding_id/ballot. |
| `research_date.label` | E.date.label, O.next_date.label or Pp.date_label. PRES2003 is year-only;2026 Saeima day is an actual announced call. |
| `research_date.precision` | E.date.precision or O.next_date.precision; proceedings day. PRES2003 year -> month/day NULL. |
| `research_date.certainty` | called for sourced ballot/call dates; no automatic certainty from publication date. |
| `research_date.year` | Supplied year only. |
| `research_date.month` | Supplied month; NULL for year precision. |
| `research_date.day` | Supplied day; NULL for year/month precision. |
| `research_date.range_start_id` | NULL in this pack; future range must point to sourced ordered non-range endpoints. |
| `research_date.range_end_id` | NULL in this pack; never infer range from a term length. |

## office

Source: `office-register.json /i`.

Identity, evidence/FK and validation: 166 source-grounded identities:45 current and121 historical snapshot identities. No invented mayor. Legal cross-epoch uniqueness pendingLV-G01. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `office.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `office.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `office.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office.geography_id` | O.geography_id, FK to (latvia,G.geography_id). |
| `office.name` | O.office_name; exact source jurisdiction orthography retained. Dome suffix is body descriptor. |
| `office.office_type` | O.office_type local_government_council/national_parliament/national_president/european_parliament_delegation; geographic tier separate. |
| `office.office_status` | current if O.current, historical otherwise. Historical means source-epoch record, NOT proof of abolition; legal identity deduplication is held for review. |
| `office.record_state` | active; historical is not deleted/withdrawn. Explicit future withdrawal requires sourced state note. |
| `office.state_note` | NULL while active; research holds retained in raw_json, not fabricated withdrawals. |
| `office.registry_qualified` | 0 when O.holds nonempty,1 otherwise; no draft approval implied. |
| `office.next_date_id` | date-+H([N,office,O.office_id,next]) only when O.next_date exists (LV-SAEIMA). Others NULL. |
| `office.next_date_resolution` | resolved for sourced 2026 Saeima call; unknown otherwise. Unknown next date never drops office. |
| `office.next_history_key` | O.next_history_key for LV-SAEIMA::SV2026; NULL otherwise. |

## office_tier_classification

Source: `schemas/atlas/tiers/latvia.json /classifications/i`.

Identity, evidence/FK and validation: Exact166 ID set; draft only; national→national_context; municipal163/national2/other1/regional0. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `office_tier_classification.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `office_tier_classification.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `office_tier_classification.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `office_tier_classification.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `office_tier_classification.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `office_tier_classification.tier` | T.classifications[i].schema_v1_tier; national→national_context. Unknown would map NULL, never other. |
| `office_tier_classification.review_status` | needs_review for all draft rows, even when human_review_required=false. No pack approval in this task. |
| `office_tier_classification.rationale` | T.classifications[i].rationale verbatim. |
| `office_tier_classification.classification_path` | schemas/atlas/tiers/latvia.json |
| `office_tier_classification.classification_kind` | tier_classification |
| `office_tier_classification.classification_sha256` | 7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce |

## election_event

Source: `events.json /i`.

Identity, evidence/FK and validation: 217 unique N/O/HK and N/event_id keys;216 historic+1 prospective. No station/round duplication. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `election_event.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `election_event.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `election_event.history_key` | Exact HK=office_id+::+cycle (PV2017/PV2021/VRD2021/RD2020/PV2025/SVYYYY/EPYYYY/PRESYYYY). No date/label in ID. |
| `election_event.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `election_event.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `election_event.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `election_event.event_id` | E.event_id = key(event,[latvia,N,HK]); N is explicit inside hash and SQL uniqueness. |
| `election_event.date_id` | date- + H([N,event,E.event_id,election]); exact research_date FK. |
| `election_event.date_resolution` | resolved for supplied day or year precision; conflicting future date claims withhold date_id and use conflicting. |
| `election_event.event_kind` | indirect for PRES; special for RD2020 extraordinary replacement council election; ordinary for other cycles. Mechanism remains raw. |
| `election_event.selected_history_role` | none for prospective SV2026; selected for supplied historic cycles, including explicitly incomplete presidential evidence. Does not mean complete or certified. |
| `election_event.electoral_system` | E.election_mode; indirect_saeima for president; direct_popular_list for national/EP/local ballots. |
| `election_event.comparability` | NULL; no inferred boundary or ballot comparability. |
| `election_event.ballot_basis` | electors for presidency; unknown for list-share denominator because valid_envelopes has no exact schema enum. raw_json carries valid_envelopes plus distinct valid ballot totals. Never substitute valid_votes silently. |
| `election_event.share_unit` | percent_0_100; preserve supplied percentages, do not renormalize to100. |
| `election_event.legal_outcome` | certified for EP2014 only: retained CVK cycle page explicitly says results approved30 May 2014. not_held for SV2026; unknown for other historic events pending exact approval/repeat binding. Official provenance alone is not certification. |
| `election_event.record_state` | active |
| `election_event.state_note` | NULL while active; holds and raw source text remain in raw_json. |

## proceeding

Source: `proceedings.json /i`.

Identity, evidence/FK and validation: Two source-supported ballot records:2015 sequence 5 and 2023 sequence 1; no invented missing sequence rows. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `proceeding.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `proceeding.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `proceeding.history_key` | Exact HK=office_id+::+cycle (PV2017/PV2021/VRD2021/RD2020/PV2025/SVYYYY/EPYYYY/PRESYYYY). No date/label in ID. |
| `proceeding.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `proceeding.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `proceeding.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `proceeding.proceeding_id` | Pp.proceeding_id = key(proceeding,[N,O,HK,ballot-<sequence>]). |
| `proceeding.kind` | Pp.proceeding_kind:2015 fifth parliamentary ballot runoff;2023 first presidential round first_round. Source form number6 is NOT round 6. |
| `proceeding.sequence_no` | Pp.sequence=5 or1 respectively; missing other rounds not synthesized. |
| `proceeding.supersedes_id` | NULL: subsequent ballot does not erase earlier ballot. |
| `proceeding.legal_outcome` | unknown; source conclusion and elected status preserved without fabricated certification proceeding. |

## source

Source: `sources.json /i`.

Identity, evidence/FK and validation: All exact source hashes resolve. Search/navigation pages do not support absent numeric facts. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `source.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `source.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `source.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `source.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `source.source_id` | S.source_id = latvia-- + key(url,S.url). |
| `source.source_namespace` | L |
| `source.publisher` | CVK for cvk.lv hosts and its data.gov.lv election datasets; Latvijas Vēstnesis for likumi.lv; Presidential Chancery for president.lv; Saeima for saeima.lv hosts. |
| `source.title` | NULL if not explicitly extracted. Source filenames/URLs survive raw; do not turn them into asserted publication titles. |
| `source.url` | S.url exact, including query/percent encoding; no aggressive URL canonicalization. |
| `source.checked_as_of_label` | S.retrieved_on |
| `source.evidence_grade` | primary_source; search/nav/shell pages are recovery/context only, not evidence of absent numeric facts. |
| `source.file_sha256` | S.sha256 exact retained source bytes. |
| `source.locator` | C({input_path:S.input_path,sha256:S.sha256}); use row-level HTML/XML/PDF locators in evidence. |
| `source.data_rights` | Source-specific licence only: retain data.gov.lv metadata; otherwise unknown. No generic licence assumed. |

## party_mapping

Source: `No supported canonical party mappings: zero rows`.

Identity, evidence/FK and validation: Zero rows; raw labels and list codes preserved. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `party_mapping.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `party_mapping.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `party_mapping.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `party_mapping.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
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

Identity, evidence/FK and validation: 1383 unique rows; every event/proceeding/source FK resolves; numeric/status pairs exact;7 disputed shares retain claims. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `result_row.id_namespace` | Literal N = cdd-observatory-v1; preserve as part of every office/event/result key. |
| `result_row.office_id` | Exact O.office_id / E.office_id / Rr.office_id; never name-derived or randomly regenerated. |
| `result_row.history_key` | Exact HK=office_id+::+cycle (PV2017/PV2021/VRD2021/RD2020/PV2025/SVYYYY/EPYYYY/PRESYYYY). No date/label in ID. |
| `result_row.country_id` | Literal latvia from C.country_id; except record_locator uses sparse target shape below. |
| `result_row.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `result_row.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `result_row.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `result_row.result_row_id` | Rr.result_row_id = key(result,[N,O,HK,Pp.proceeding_id or main,Rr.candidate_source_id]). Source candidate number is preserved; presidency uses exact supplied candidate name within ballot. |
| `result_row.proceeding_id` | Rr.proceeding_id; non-NULL only presidential ballots; full N/O/HK/Pp FK. |
| `result_row.candidate_or_list_label` | Rr.candidate_or_list_label exact extracted label; raw source text/header retained. |
| `result_row.original_party_label` | Exact source list label for list results, NULL for presidential support claims; no party/coalition canonicalization. |
| `result_row.original_party_code` | Exact source list ID/number scoped to event; NULL for presidential claims. |
| `result_row.party_namespace` | NULL; no mapping supplied. |
| `result_row.party_mapping_id` | NULL; unsupported party normalization not a broken FK. |
| `result_row.votes` | Rr.votes: CVK valid list ballots or Saeima candidate PAR/support count. Never sum candidate preference marks with list ballots or rounds with each other. |
| `result_row.votes_status` | Rr.votes_status: recorded/zero/unknown as supplied. |
| `result_row.share` | Rr.share from source list percentage. Seven SV2022 archive percentages remain numeric but disputed, with alternate current-summary claims retained; no automatic replacement. President NULL. |
| `result_row.share_status` | Rr.share_status: recorded/zero/unknown/disputed; disputed is not approved for public metric use. |
| `result_row.share_unit` | percent_0_100. Source exact denominator remains in E.raw.ballot_basis_exact. |
| `result_row.seats` | Rr.seats only explicit XML ElectedCandidateCount/Count or printed list seat cell. Blank 2025 cells and missing 2018/2022/2019 EP column remain NULL, not zero. |
| `result_row.seats_status` | Rr.seats_status recorded/zero/unknown/disputed; blank is not zero. |
| `result_row.elected_flag` | True only sourced presidential winner 2003/2015; false for 2023 first round where no president elected; NULL list rows. |
| `result_row.is_substitute` | NULL: no substitute-person normalization supplied. |
| `result_row.evidence_status` | disputed for7 SV2022 share-conflict rows; recorded otherwise. Row raw retains claims and exact values. |

## record_locator

Source: `Typed PKs in complete identity vectors`.

Identity, evidence/FK and validation: Exactly one sparse typed target; result locator proceeding_id NULL. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `record_locator.country_id` | latvia for country/geography/office/event/proceeding/result_row/source; NULL input. |
| `record_locator.id_namespace` | N for office/event/proceeding/result_row; NULL otherwise. |
| `record_locator.office_id` | O for office/event/proceeding/result_row only. |
| `record_locator.history_key` | HK for event/proceeding/result_row only. |
| `record_locator.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
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
| `record_locator.source_row_locator` | C({derived_path,derived_json_pointer,origins}); JSON zero-based; XML XPath and HTML table/row one-based; PDF page one-based plus region/label. |

## evidence_link

Source: `origins/origin/raw.date_origin; full source tuple`.

Identity, evidence/FK and validation: Full target/source FK; source hashes and row locators preserved; date origin separate from publication timestamp. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `evidence_link.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `evidence_link.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `evidence_link.evidence_id` | ev-+H([record_key,[latvia,L,source_id],occurrenceIdentity,claim_kind]); occurrenceIdentity is original locator excluding source_id. |
| `evidence_link.record_key` | Typed existing record_locator.record_key. |
| `evidence_link.source_country_id` | latvia |
| `evidence_link.source_namespace` | L |
| `evidence_link.source_id` | Exact origin.source_id (or verified path→S lookup). A missing known source fails import; never fabricate a source. |
| `evidence_link.source_locator` | C(full original locator: path+hash+XML XPath, HTML table/row/heading, or PDF page/label). |
| `evidence_link.claim_kind` | identity/geography/date/result/ballot/provenance as asserted, never generated timestamp as election date. |
| `evidence_link.date_claim_id` | Date claim only: event or next-date row; NULL otherwise. Proceeding dates retained with dedicated research_date and raw reference because proceeding has no date FK. |
| `evidence_link.claim_json` | C({origin, supplied_claim, holds}); both conflicting claims preserved, no unsupported reconciliation. |

## unresolved_evidence

Source: `unresolved-aggregate-claims.json; actual unresolved citation tokens; failed acquisitions as input-level research notes`.

Identity, evidence/FK and validation: Real target, exact token; competing known-source claims retained; broken known FK fails closed. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `unresolved_evidence.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `unresolved_evidence.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `unresolved_evidence.raw_json` | C(original token and provenance); this table has no source FK by design. |
| `unresolved_evidence.unresolved_id` | unres- + H([record_key,occurrenceIdentity,original_token]). |
| `unresolved_evidence.record_key` | Existing real entity or input record locator; unresolved evidence never creates an office. |
| `unresolved_evidence.original_token` | Exact unresolved source token or LV-SV2022-SHARE-<list number> conflict token with both resolved claims retained. Missing known source IDs still fail closed; do not downgrade broken FK to unresolved. |
| `unresolved_evidence.source_locator` | C(exact retained source/gap-file pointer and supplied token). |
| `unresolved_evidence.reason` | Specific resolution failure from source-acquisition-gaps or future original citation. Research coverage gap alone is not an invented citation. |

## identity_crosswalk

Source: `identity-crosswalk.json /i`.

Identity, evidence/FK and validation: Source alias only; no successor inference. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
|---|---|
| `identity_crosswalk.lineage_id` | Constant L = country-package-latvia. Never derive from latest publication receipt. |
| `identity_crosswalk.release_id` | Candidate R = L + --sha256- + H(I.hash_inputs); documentary only until future approved import and successful publication. |
| `identity_crosswalk.raw_json` | C({origin, row, columns:null, values:null, supplemental}); row is the full source object; supplemental retains all unmodelled keys, source locators, mode, holds and original claims. No dropped unknown columns. |
| `identity_crosswalk.entity_kind` | X.entity_kind |
| `identity_crosswalk.upstream_namespace` | X.upstream_namespace=cvk:latvia:<identity_epoch>; exact source token scoped to epoch. No name-based successor or predecessor edge. |
| `identity_crosswalk.upstream_id` | X.upstream_id exact base64 CVK2017 ID or later URL slug. No guessed ATVK code. |
| `identity_crosswalk.record_key` | X.record_key → real typed locator. |
| `identity_crosswalk.reason` | X.reason; never infer merger/split/successor from this alias. |

## ingest_attempt

Source: `Future separate durable ledger; no attempt performed`.

Identity, evidence/FK and validation: New attempt every run; durable start/failure outside staging; executionNot run. Typed identities follow Latvia_Identity_Rules.md; full documentary vectors cover every emitted entity.

| Destination field | Source → conversion / null policy |
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
| `ingest_attempt.publication_set_json` | NULL until success; then full set of all lineage/release pairs, including unchanged non-Latvia members. |
| `ingest_attempt.row_counts_json` | NULL until actual success; future observed counts, not this report masquerading as execution. |
| `ingest_attempt.error_text` | NULL except failed; preserve exact error reason; no fabricated successful run. |

## Publication execution gates

Future importer: same-filesystem staging, separate durable attempt start, validate all lineage members and resolved FKs, checkpoint/close WAL, fsync, atomic rename. Poison/fixture/unapproved-tier/identity failure leaves last good serving. Never key citations to the newest receipt. All importer, SQLite, VPS and UI execution is **Not run**.
