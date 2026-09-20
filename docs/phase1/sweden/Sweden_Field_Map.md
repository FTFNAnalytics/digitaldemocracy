# Sweden → Atlas complete field map — DRAFT

Pinned main `94b22e8662b4d304263bef67628765f5377fd9da`. **223 destination columns across 20 research/publication/audit tables**; migration-owned schema_migration(version,applied_at) has 2 additional columns and is not research-loaded. DDL snapshots are read-only references. No importer/SQLite execution.

## Source notation and global rules

`O=data/research/sweden/office-register.json`; G=geographies.json; E=events.json; R=results.json; Q=proceedings.json; S=sources.json; CW=identity-crosswalk.json; U=research-gaps.json in the same folder. T=schemas/atlas/tiers/sweden.json. Inventory/V are the named JSONs beside this map. Array `/i` pointers are zero-based and fully enumerated in V. Every source has its original bytes/hash and exact query.

Swedish Unicode and leading-zero codes remain strings. Never default missing votes, shares or seats to0. Explicit source 0 remains0/zero. JSON-stat2 uses `/value/i` decoded by ordered `/id`, `/size` and `/dimension/<name>/category/index`; source missing-status markers remain in evidence. Val integer/decimal strings remove whitespace and replace decimal comma only; `%` stripped only for an explicit percent measure. No scale guessing or derived vote-share replacement. Raw JSON/source bytes retain unknown fields, comparison columns, candidate personal votes, turnout, invalid ballots and source notes.

Country/office existence is independent of the8 September 2026–8 March 2028alert window. All typed rows own their Sweden lineage release. Research completeness remains false. No named source token is coerced into a fabricated FK. Deterministic formulas in Identity Rules apply to every row; V supplies concrete tuples. Draft tier status blocks production until acceptance.

## dataset_lineage

Source: country/lineage constants. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| provenance_kind | country_package; newly sourced research, not an empty Europe extract. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| description | New Sweden full elected-body research: 290 municipal councils, 20 separately elected regional assemblies, Riksdagen, EP delegation, Sametinget and source-evidenced historical councils. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |


## dataset_release

Source: Inventory /hash_inputs. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| fingerprint_sha256 | H(Inventory /hash_inputs); SHA256 of compact recursively key-sorted UTF-8 JSON, not ZIP hash. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| hash_inputs_json | C(Inventory /hash_inputs), including all effective source/research/tier hashes, accepted overrides(empty here), adapter/method/schema versions and DDL hashes. Exclude reports, vectors, attempts, execution timestamps and ZIP/manifest. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| adapter_version | atlas-sweden-full-register/1 documentary contract; no implementation. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| method_version | atlas-preserve-evidence/1. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| schema_version | atlas-master/1. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| research_snapshot_label | 2026-09-20 research capture; per-source updated values stay in retained bytes. Not an election date. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| upstream_release_id | NULL; no existing public Sweden package alias supplied. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| validated_counts_json | Inventory /verified_counts; count authored documents separately from actual future imported rows. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| research_coverage_complete | 0: qualified historic totals and named gaps remain. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C({country_id:sweden,pinned_main_commit,source_inventory,coverage_complete:false}); retain original metadata, no invented release acceptance. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |


## publication_release

Source: future publication set. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |


## publication_receipt

Source: future publish receipt. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| singleton | 1 only in future successfully staged receipt. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| last_publish_attempt_id | Actual future durable attempt_id, not release identity. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| attempted_lineage_id | L. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| attempted_release_id | R; FK selected publication_release(L,R). | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |


## retained_input

Source: Inventory /hash_inputs/inputs. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| input_path | Inventory /hash_inputs/inputs/i/input_path exactly; one row for each source/derived/tier member; no self-referential output manifest input. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| input_kind | tier_classification for tier file; package for source/derived research; future accepted override only as override; diagnostic artifact as artifact. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| sha256 | SHA256(original bytes) from inventory; reject mismatch. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| byte_count | Exact byte length from inventory; integer>=0. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| recovery_locator | ZIP member path plus hash; future durable artifact store must retrieve same bytes. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| payload_json | Exact JSON value if JSON; NULL for CSV/XLSX/HTML/ZIP. Retain binaries intact; never execute embedded code or formulas. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |


## country

Source: constants + U + current geography evidence. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| country_code | SE. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| name | Sverige; language sv. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| polity_kind | sovereign_country. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| region_id | europe; no exclusions inferred from the alert window. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| coverage_status | partial: current governmental elected bodies covered; historical and live-count gaps remain explicit. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| screening_as_of_label | 2026-09-20. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| notes | C(U); Gotland is one municipal electoral council with combined responsibilities, never a second RF office. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| country_id | Constant sweden; FK country.country_id. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C({country_id:sweden,name:Sverige,language:sv,coverage_complete:false,scope_gates:U,pinned_main_commit}) | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |


## geography

Source: G. PK(country,gid); parent FK nullable.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| geography_id | G /i/geography_id exactly: SE; SE-K<four-digit code>; SE-K1263-PRE1976; SE-R<two-digit code>; SE-LT<SCB historical code>. | PK(country,gid); parent FK nullable. | Recompute scoped identity; reject collision/broken FK. |
| name | G /i/name exactly; Swedish å/ä/ö and historical labels retained; no invented translation. | PK(country,gid); parent FK nullable. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| parent_geography_id | G /i/parent_geography_id: SE or NULL for SE. No historical/current regional parent asserted from modern code prefix; no inferred merger geometry. | PK(country,gid); parent FK nullable. | Recompute scoped identity; reject collision/broken FK. |
| effective_from_label | NULL baseline: first observed snapshot and record admission are not an evidenced geography start date. Preserve all labels in raw_json. | PK(country,gid); parent FK nullable. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| effective_to_label | NULL baseline: absent from current snapshot is not an exact abolition date. Historic observations remain raw. | PK(country,gid); parent FK nullable. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| country_id | Constant sweden; FK country.country_id. | PK(country,gid); parent FK nullable. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(country,gid); parent FK nullable. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(country,gid); parent FK nullable. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire G /i); keep geography_type, language, vintage and evidence here, not invented DDL columns. | PK(country,gid); parent FK nullable. | Preserve complete JSON and verify original bytes hash. |


## research_date

Source: E.date / O.next_election. Owner-derived key; slot separates event ballot and office next.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| date_id | Vector or Identity Rules owner-based date key. | Owner-derived key; slot separates event ballot and office next. | Recompute scoped identity; reject collision/broken FK. |
| label | E /i/date/value; O /i/next_election/value. Exact string, not capture date. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| precision | E /i/date/precision or O /i/next_election/precision. SCB baseline year, explicitly sourced repeats/live dates day. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| certainty | E /i/date/certainty called for known occurrence; O next statutory or expected as authored. Certainty does not establish count finality. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| year | Integer first four digits of date/value; source cycle year stays separate in event raw. Falun source 2018→actual 2019. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| month | Parse ISO month only when precision day or month; otherwise NULL. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| day | Parse ISO day only for day precision; otherwise NULL. | Owner-derived key; slot separates event ballot and office next. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| range_start_id | NULL baseline; no range claims authored. | Owner-derived key; slot separates event ballot and office next. | Recompute scoped identity; reject collision/broken FK. |
| range_end_id | NULL baseline; no range claims authored. | Owner-derived key; slot separates event ballot and office next. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Owner-derived key; slot separates event ballot and office next. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Owner-derived key; slot separates event ballot and office next. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C({owner_type,owner_id,slot,source_date_object,evidence}); do not reinterpret withheld dates. | Owner-derived key; slot separates event ballot and office next. | Preserve complete JSON and verify original bytes hash. |


## office

Source: O. PK(N,oid); FK(country,gid); mutual classification FK.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| geography_id | O /i/geography_id; required FK. | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| name | O /i/name; statutory source body wording or explicitly documentary body-category label plus original place name. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_type | O /i/office_type: kommunfullmäktige, regionfullmäktige, landstingsfullmäktige, national_parliament, european_parliament_delegation or indigenous_parliament. No direct kommunalråd/PM/cabinet. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_status | O /i/office_status current/historical exactly. Historical offices remain active records. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| record_state | active including historical offices; no implicit withdrawal. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| state_note | C({review_notes:O /i/review_notes,electoral_mode:O /i/electoral_mode,source_code:O /i/source_code}); do not treat a missing raw property as a separate source. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| registry_qualified | NULL: source roster does not establish future candidacy or legal ballot eligibility. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| next_date_id | Vector next_date_id only where O /i/next_election non-null; otherwise NULL. | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| next_date_resolution | resolved where O next_election exists; otherwise unknown. 2030/2029 metadata outside alert window never removes offices. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| next_history_key | NULL: next-date metadata is not a prospective event. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| id_namespace | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid); FK(country,gid); mutual classification FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| country_id | Constant sweden; FK country.country_id. | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid); FK(country,gid); mutual classification FK. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire O /i); electoral_mode, source code/vintage, coverage_complete, next metadata and review notes survive losslessly. | PK(N,oid); FK(country,gid); mutual classification FK. | Preserve complete JSON and verify original bytes hash. |


## office_tier_classification

Source: T. PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| tier | T /classifications/i/tier: national→national_context; regional/municipal/other unchanged; unknown→NULL. Never calendar strings. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| review_status | needs_review for all known draft tiers; no approved status inferred from unflagged row. NULL tier would require unknown. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| rationale | T /classifications/i/rationale exact; review categories/evidence retained raw. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| classification_path | schemas/atlas/tiers/sweden.json. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| classification_kind | tier_classification. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| classification_sha256 | Inventory /tier_sha256; FK to exact retained_input(L,R,path,kind,hash). | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| id_namespace | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(N,oid); exact office ID-set equality and retained tier path/kind/hash FK. | Preserve complete JSON and verify original bytes hash. |


## election_event

Source: E. PK(N,oid,HK); unique(N,event_id); office and date FKs.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| event_id | E /i/event_id = K(event,[sweden,N,HK]); exact vector. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| date_id | V /events/i/date_id from E /i/date object; owner event, slot ballot. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| date_resolution | resolved for every authored date including year-only historical events. Missing day does not make known year unknown. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| event_kind | E /i/event_kind ordinary/repeated exactly; full repeat replacements use SCB footnotes, not source-year guesses. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| selected_history_role | E /i/selected_history_role exactly. Annulled Sami May 2025 and ordinary Båstad 2014 are other. Partial 2026 is none. Do not discard other/none events. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| electoral_system | NULL baseline; source description retained raw, no inferred seat-allocation formula. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| comparability | NULL; no merger-adjusted historical comparability asserted. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| ballot_basis | valid_votes. OGILTIGA/VALSKOLKARE stay aggregate source context and never party rows. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| share_unit | percent_0_100 including absent shares. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| legal_outcome | E /i/legal_outcome exactly. Certified means source final complete return with mandate allocation, or final SCB statistical return; not a new independent certification. Annulled Sami original remains annulled. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| record_state | active; retained partial history is not deleted. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| state_note | C({notes:E /i/notes,reporting:E /i/reporting,source_cycle_year:E /i/source_cycle_year}); unknown absent optional properties omitted. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| id_namespace | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| history_key | E/R /i/history_key exactly; FK (N,office_id,HK). | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire E /i); valid_votes,total_ballots,source_cycle_year,notes,reporting,coverage_complete remain raw because no dedicated DDL totals columns exist. | PK(N,oid,HK); unique(N,event_id); office and date FKs. | Preserve complete JSON and verify original bytes hash. |


## proceeding

Source: Q=[]. No rows; procedural notes retained in E/raw, not inferred sequences.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| id_namespace | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| history_key | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| proceeding_id | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| kind | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| sequence_no | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| supersedes_id | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| legal_outcome | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| release_id | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | No normalized rows in Q=[]. Sourced repeat/recount/annulment notes and original return versions remain event raw/retained input. No complete procedural sequence authored; future rows require event-scoped IDs and positive evidence. This is not a claim that no legal proceedings occurred. | No rows; procedural notes retained in E/raw, not inferred sequences. | Preserve complete JSON and verify original bytes hash. |


## source

Source: S. PK(country,L,sid); exact retained bytes hash and query.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| source_id | S /i/source_id = sweden-- + K(source,[exact URL,exact request JSON or null]); API table/query is part of identity, not URL alone. | PK(country,L,sid); exact retained bytes hash and query. | Recompute scoped identity; reject collision/broken FK. |
| publisher | S /i/publisher actual official host, not invented person. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| title | S /i/input_path filename as deterministic artifact title; upstream titles remain in retained bytes. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| url | S /i/url; preserve exact POST query in raw_json for SCB table dimensions. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| checked_as_of_label | S /i/retrieved_on exactly = 2026-09-20. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| evidence_grade | NULL; official origin does not automatically certify a research derivative. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| file_sha256 | S /i/sha256 exact retrieved bytes. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| locator | S /i/input_path; exact JSON pointer, HTML table locator or XLSX sheet/cells in evidence_link. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| data_rights | Literal unknown unless a source-specific licence is accepted; no universal licence inferred from official host. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| country_id | Constant sweden; FK country.country_id. | PK(country,L,sid); exact retained bytes hash and query. | Recompute scoped identity; reject collision/broken FK. |
| source_namespace | Constant L; never latest global release alias. | PK(country,L,sid); exact retained bytes hash and query. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(country,L,sid); exact retained bytes hash and query. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(country,L,sid); exact retained bytes hash and query. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire S /i); query, source update metadata, exact bytes and provenance retained. | PK(country,L,sid); exact retained bytes hash and query. | Preserve complete JSON and verify original bytes hash. |


## party_mapping

Source: no accepted mappings. No rows; labels remain on result_row.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| country_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Recompute scoped identity; reject collision/broken FK. |
| party_namespace | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| mapping_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Recompute scoped identity; reject collision/broken FK. |
| source_context | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| election_context | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| original_label | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| original_code | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| mapped_group | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| uncertainty | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | No rows; labels remain on result_row. | Preserve complete JSON and verify original bytes hash. |


## result_row

Source: R. PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| result_row_id | R /i/result_row_id; exact scoped result token/vector. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| proceeding_id | NULL for every R /i; no invented round. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| candidate_or_list_label | R /i/name exactly; SCB modern party labels remain source wording. Statistical ÖVRIGA is not a single party. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| original_party_label | R /i/party_label exactly; includes statistical-group wording without creating a party mapping. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| original_party_code | R /i/party_code exactly; SCB letter or Valmyndigheten leading-zero numeric code. Scope to source/event; no silent letter/code harmonization. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| party_namespace | NULL baseline. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| party_mapping_id | NULL baseline. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| votes | R /i/votes: direct source scalar. No derived/clamped/normalized vote count. Missing NULL; preserve original claims. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| votes_status | R /i/votes_status: recorded positive; zero exact 0; unknown NULL. Preliminary/disputed evidence_status is independently retained. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| share | R /i/share: explicit SCB percent measure or Valmyndigheten andelRoster, percent_0_100. Archive comma/% parsing only; never votes/denominator recomputation. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| share_status | R /i/share_status, same missing/zero rule. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| share_unit | percent_0_100. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| seats | R /i/seats: source Kfmandat/Ltmandat/Riksdagsmandat/ME0109T01 scalar or matched Valmyndigheten partiMandat by exact partikod. Absent entry NULL, not zero. Färgelanda 1973 hypothetical allocation withheld, original retained. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| seats_status | R /i/seats_status, same missing/zero rule. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| elected_flag | NULL for every party/statistical-group row; no invented individual candidate mandate. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| is_substitute | NULL; no substitute appointment projection. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| evidence_status | R /i/evidence_status: recorded/preliminary/disputed as authored. Annulled and known adjusted-seat claims disputed. Future conflict policy preserves original claims; no silent replacement. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| id_namespace | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| history_key | E/R /i/history_key exactly; FK (N,office_id,HK). | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| country_id | Constant sweden; FK country.country_id. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire R /i); source rows, identity_token, original source cells, withheld claims and all unknown fields retained. SCB ÖVRIGA votes may contain parties with separate seat-only categories; do not sum them as independent vote rows. | PK(N,oid,HK,rid); full event FK; optional party/proceeding NULL. | Preserve complete JSON and verify original bytes hash. |


## record_locator

Source: V and each real target. Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| record_key | rec-+H([entity_kind,...PKcomponents]); exact Identity Rules tuples. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| entity_kind | country/geography/office/event/proceeding/result_row/source/input per real target. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| country_id | sweden for typed targets except input; input target NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| geography_id | Actual gid only for geography target; all other kinds NULL (including office). | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| id_namespace | N only for office/event/result_row; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| office_id | oid only for office/event/result_row; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| history_key | HK only for event/result_row; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| proceeding_id | NULL baseline (no proceeding targets); remain NULL for result_row targets under sparse-target DDL CHECK. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| result_row_id | rid only for result_row; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| party_namespace | NULL baseline. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| party_mapping_id | NULL baseline. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| source_namespace | L only for source target; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| source_id | sid only for source target; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| input_path | Retained path only for input target; otherwise NULL. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| source_row_locator | C({derived_path,derived_pointer,source_evidence}); JSON-stat2 /value/i with dimension tuple, Val JSON exact pointer, HTML section/table/tr cell locator, XLSX sheet/cell. Never fabricate JSON pointers into HTML/XLSX. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Sparse target CHECK: only actual target columns set; result target proceeding_id remains NULL. | Recompute scoped identity; reject collision/broken FK. |


## evidence_link

Source: entity evidence[]. Both real source and target locator required; known broken reference fatal.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| evidence_id | ev-+H([record_key,[sweden,L,source_id],[input_path,json_pointer_or_locator],claim_kind]); exact identity tuple. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| record_key | FK to real target locator; no orphan invented target. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| source_country_id | sweden. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| source_id | Lookup S by evidence input_path; resolved source must exist. Missing known source→fatal. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| source_locator | C(full evidence object): original path/hash plus json_pointer or locator, with dimensions. Match S by input_path and verify hash. | Both real source and target locator required; known broken reference fatal. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| claim_kind | register_identity, historical_binding, election_date, source_scalar, disjoint_sum, institutional_mode, next_date or research_gap. | Both real source and target locator required; known broken reference fatal. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| date_claim_id | Actual research_date FK for date claim, otherwise NULL. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| claim_json | C({original_claims,conversion,scope}); raw cells stay available even when scalar NULL. No invented certification. | Both real source and target locator required; known broken reference fatal. | Preserve complete JSON and verify original bytes hash. |
| source_namespace | Constant L; never latest global release alias. | Both real source and target locator required; known broken reference fatal. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Both real source and target locator required; known broken reference fatal. | Recompute scoped identity; reject collision/broken FK. |


## unresolved_evidence

Source: U. Real target locator, original unresolved token; no fabricated source FK.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| unresolved_id | unres-+H([record_key,[source_locator],original_token]); exact Identity Rules tuple. | Real target locator, original unresolved token; no fabricated source FK. | Recompute scoped identity; reject collision/broken FK. |
| record_key | Country rec(country,[sweden]) for U /i named gates; optional real office locator for listed office_ids only. No orphan target. | Real target locator, original unresolved token; no fabricated source FK. | Recompute scoped identity; reject collision/broken FK. |
| original_token | U /i/original_token; explicitly authored research-gap token, never a fabricated upstream catalogue ID. | Real target locator, original unresolved token; no fabricated source FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| source_locator | C({input_path:data/research/sweden/research-gaps.json,json_pointer:/i}); exact source evidence lives in U /i/evidence. | Real target locator, original unresolved token; no fabricated source FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| reason | U /i/reason; missing sources/bindings do not prove no office or zero votes. | Real target locator, original unresolved token; no fabricated source FK. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Real target locator, original unresolved token; no fabricated source FK. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Real target locator, original unresolved token; no fabricated source FK. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Real target locator, original unresolved token; no fabricated source FK. | Preserve complete JSON and verify original bytes hash. |


## identity_crosswalk

Source: CW. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| entity_kind | office for supplied CW entries; other entity crosswalks from complete vector source tuples when implemented. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| upstream_namespace | CW /i/upstream_namespace exactly: SCB/table/dimension or scoped code+year exception. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| upstream_id | CW /i/upstream_id exactly. Source code alone is insufficient for pre-1976 Svedala; scoped exception wins. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| record_key | rec(office,[N,CW /i/target_office_id]); referenced office must exist. No guessed successor target. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| reason | CW /i/reason. 20LG maps current Dalarna20; LG does not itself mean historical. Bara 1229 and pre-1976 Svedala retain their identities. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| raw_json | C(entire CW /i); source/current labels and evidence retained; no invented legal merger mapping. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |


## ingest_attempt

Source: future durable ledger. Operational or retained row owns L and its selected release R; exact deterministic rules below and in Identity Rules.

| Destination column | Source locator / conversion / null policy | Identity / evidence / FK | Validation assertion |
| --- | --- | --- | --- |
| attempt_id | Future fresh attempt-UUID each run; no attempt created here. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| operator | Actual future initiator, not invented Justin acceptance. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| script_version | Actual future importer version; not implemented here. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| started_at | Actual future UTC ledger start, durable before staging. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| finished_at | NULL until completion, then actual UTC. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| status | Future started/succeeded/failed per ledger; no succeeded row authored here. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| input_inventory_json | C(actual effective inventory and provenance at future attempt). | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| successful_release_id | R only on reconciled successful publication; NULL on failure. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |
| publication_set_json | NULL while started or failed; on success full lineage/release array, preserving unrelated members. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| row_counts_json | Actual measured execution counts; no documentary count represented as executed. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Preserve complete JSON and verify original bytes hash. |
| error_text | Nonempty actual failure message on failed; NULL for started/succeeded. Do not fabricate. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Enforce exact enum/value/NULL/precision rule; source missing never zero. |
| lineage_id | Constant L; ownership FK to selected Sweden publication member. | Own lineage/release; never latest global receipt. Actual runtime metadata only where specified. | Recompute scoped identity; reject collision/broken FK. |


## Overlap, partial counts and unknown fields

SCB votes and seats join on exact scope/region/party/source-year into a single result vector. National/country aggregate rows and municipal reporting components of regional/national tables never become offices. Val visibility code 2 is an overlapping summary of detailed other-party rows, retained with raw.additive_vote_row=false. Other party rows and preliminary other-party aggregates remain additive only in their documented source representation. Party aggregate ÖVRIGA remains a statistical group; older separate seat-only categories are not extra vote totals. First/previous-election comparison columns, candidate personal-vote sublists and constituency summaries remain retained raw, never a second event. 2026 preliminary and final sources must replace a claim representation under stable identity and guards, not append duplicate outcomes. Partial district counts never become certified merely because the endpoint is `_S`. Full raw payload is recoverable without copying unrecognized fields into invented DDL columns.

## Publication gates

A future importer must execute the checklist separately: durable attempt ledger; unchanged re-import idempotence; poison rollback; fixture exclusion; approved classification hash; same-FS staging/WAL checkpoint/fsync/atomic rename; preservation of other lineage members and incomplete-refresh rows. Documentation/package validation does not satisfy those execution gates.
