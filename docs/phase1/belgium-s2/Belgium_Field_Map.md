# Belgium S2 → Atlas field map

**Prompt S2: documentation and fully accepted tiers.** Review pack main `01602ea88de411fd712858e10e3f559d5ceb3ee1`; landing base `b293da99b97a8ae008d87ee2e57210cde0678004`. Justin accepted all 1,179 current + 55 historical draft offices on 2026-09-19. Unchanged Prompt B DDL. **223 destination columns in 20 tables**, plus migration-owned schema_migration(version,description), which this package never writes. Every mapping work item is documentary; no importer/SQLite execution has occurred. T=`schemas/atlas/tiers/belgium.json`, pack status **approved**, SHA `adc7108868d7d8a7df3f6888de9dee05d4b799c2ebbc3a571e83a0ea8fe284cf` (predecessor draft `8dec06a21c01e0f0aa0228e3d152b795b0fff9522c96b2071fec334f5070ccb6`). Read with [Identity Rules](Belgium_Identity_Rules.md), [Acceptance Examples](Belgium_Acceptance_Examples.md) and [Inventory](Belgium_Input_Inventory.json).

## Source notation and lossless policy

`D=data/research/belgium-s2/`; O=D+office-register.json, E=events.json, R=results.json, G=geography.json, S=source-catalogue.json, U=unresolved-bindings.json. T=schemas/atlas/tiers/belgium.json. All JSON arrays use zero-based `/i/field` pointers. Source `evidence[]` links each derivative to original downloaded bytes; XLSX locators are sheet name and 1-based original row; HTML locators are exact XPath. Original spreadsheets, headers, corrected-cell styles, formulas/caches, candidates and unused rows remain byte-for-byte at D+sources/. HTML is inert evidence, never executable application code.

N=`cdd-observatory-v1`; L=`country-package-belgium`; RLS=the candidate release in Identity Rules (the table below calls it R where unambiguous). All research tables carry their own L/RLS; operational receipt does not transfer citation ownership. No data field named extension is invented: unknown upstream content goes into raw_json and retained_input. Missing scalars remain NULL with unknown status; explicit zero stays numeric0/zero. Retained CSV/HTML/XLSX blank/dash labels remain original raw values. No ratio is filled into absent share fields.

## Research projection and overlap

| Source family | Typed projection | Deduplication / retention rule |
|---|---|---|
| IBZ July2026 municipal workbook | 565 geographies and council/mayor pairs | Rows4–568; population columns stay raw, never electors/votes. Observation date is not boundary-effective date. |
| Federal institutional pages via retained web captures | council/mayor type evidence, ten provinces, seven legislatures | Same Flemish regional/community institution only once; Senate and French Community direct returns absent. |
| Flemish 2024/2018 general + lists workbooks | Dated council/district/social events and list votes/seats | General row gives event; list row gives result. Candidate preference sheets not another list vote vector. 2018 seats are columnP, not eligibility coefficient O. |
| Flemish 2012 workbook | 307 council events and list-ballot vectors | Sum explicitly supplied full-list and partial-list ballot categories; no seat count inferred. |
| Wallonia 2018 HTML | 253 municipal events, five province events, one CPAS event | Only 2018 columns projected. Older comparisons and subordinate district/canton/municipality province rollups raw-only. Figures labelled unofficial remain preliminary. |
| Flemish province 2024 workbook | Five province events with 15 constituency vectors | Result token includes constituency. No province total duplicate, no fake 15-province register, no province margin across district lists. |
| Brussels 2024 HTML | 19 municipal event records and list vectors | 2018 comparisons raw-only. Saint-Josse held as other/disputed until primary repeat reconciliation. Page update date is not election date. |
| IBZ 2000 municipal/province API | 555 bound municipal +10 province events | 35 unresolved municipal records retained with original IDs and candidate bindings; do not fabricate office FK. |
| IBZ 2014/2019/2024 national/regional API | 15 events: Chamber plus four directly elected regional/community assemblies in each year | Select whole-body aggregate once; constituents/cantons not extra elections. Three European Parliament aggregates raw-only, outside authored national/federated scope. |
| U and descriptive-margins.json | unresolved_evidence / retained_input | No new metric tables. Vote differences are explicit arithmetic among retrieved lists, not certified margins, mayor victories or forecasts. |

Bilzen’s updated2018 workbook contains contradictory row/header dates; preserve HK alias but withhold resolved date and selected-history status. No general law that a web portal says complete can set legal_outcome=certified. Historical legal outcomes, special/repeat dispositions and current office qualification remain separately reviewable.

## Cardinality and granularity

1,234 office/tier rows, 647 geography rows, 1,772 event records, 9,238 list-result rows; zero prospective events, proceedings and party mappings. These are documentary record counts, not asserted production-load counts. Sources with inaccessible/challenge status do not become evidence sources. Justin accepted the 1,234 office IDs; a future importer is separately authorized. The full current roster of 565 municipalities is independent of the alert window; 55 historical coded council records also survive. Other indirect institutions remain a stated universe gap, not an inferred zero.

## Column contract

Each section supplies its PK/FK and validation rule. A cell’s source pointer is relative to its named D JSON file unless a raw original sheet/HTML/API pointer is specified. Shared L/R ownership and raw envelope rules are repeated where needed. NULL is SQL NULL, not the string 'NULL'.

## dataset_lineage

One row PK L; country_package provenance. No replacement of unrelated lineage identity.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `provenance_kind` | Constant country_package; S2 is newly authored research, not the empty frozen extract. | One row PK L; country_package provenance. No replacement of unrelated lineage identity. |
| `description` | Belgium current-register and historic primary-source research; coverage partial. | One row PK L; country_package provenance. No replacement of unrelated lineage identity. |

## dataset_release

Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `fingerprint_sha256` | H(Input Inventory /hash_inputs); 64 lowercase hex; exact candidate vector. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `hash_inputs_json` | C(Input Inventory /hash_inputs); sorted effective descriptors, tier, overrides and versions; include inherited dependencies on refresh. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `adapter_version` | atlas-belgium-full-register/1; proposed, not implemented. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `method_version` | atlas-preserve-evidence/1. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `schema_version` | atlas-master/1. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `research_snapshot_label` | 2026-09-19 research capture; municipal roster as_of=2026-07-01 remains raw, never ballot date. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `upstream_release_id` | NULL: no S2 public release alias exists. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `validated_counts_json` | Recomputed inventory /verified_counts, including current/historical/held and raw-only counts; never claim coverage complete. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `research_coverage_complete` | 0; source gaps and unresolved bindings remain. | Immutable PK (L,R), unique fingerprint. Candidate only; draft-tier approval remains a gate. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## publication_release

One selected R per lineage; preserve the full existing publication set.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |

## publication_receipt

Singleton receipt only after future successful staged publication; operational, not citation identity.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `singleton` | 1, only future staged publication receipt. | Singleton receipt only after future successful staged publication; operational, not citation identity. |
| `last_publish_attempt_id` | Future durable ledger attempt_id; never reused as release_id. | Singleton receipt only after future successful staged publication; operational, not citation identity. |
| `attempted_lineage_id` | L; attempted lineage only. | Singleton receipt only after future successful staged publication; operational, not citation identity. |
| `attempted_release_id` | R; FK to publication_release(L,R). | Singleton receipt only after future successful staged publication; operational, not citation identity. |

## retained_input

PK (L,R,input_path); every referenced source/classification recoverable by original hash.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `input_path` | Each effective input /path; stable relative package path; exact path is part of PK. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |
| `input_kind` | tier_classification for schemas/atlas/tiers/belgium.json; package for research JSON and raw sources; override only future accepted override; artifact for supporting nonresearch diagnostics. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |
| `sha256` | SHA256 of original bytes, not reserialized JSON. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |
| `byte_count` | Actual byte length; integer >=0. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |
| `recovery_locator` | Archive member path in this pack plus SHA; future durable object locator must resolve same bytes. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |
| `payload_json` | Exact JSON value for valid JSON sources; NULL for XLSX/HTML and other binaries. Do not execute scripts/formulas. | PK (L,R,input_path); every referenced source/classification recoverable by original hash. |

## country

PK belgium, code BE. Coverage partial; one country shared across its lineage release.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `country_id` | Constant belgium; FK country.country_id. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `country_code` | BE; sovereign Belgium, not Brussels or language community code. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `name` | Belgium; country label from official institutional sources. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `polity_kind` | sovereign_country. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `region_id` | europe; region grouping is not geographic tier. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `coverage_status` | partial; full municipal roster does not imply full historic research. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `screening_as_of_label` | 2026-09-19; retain older S screening labels separately. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `notes` | Report gap list, register granularity, current roster as_of and alert-window-only policy; no screened_out carryover. | PK belgium, code BE. Coverage partial; one country shared across its lineage release. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## geography

PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `country_id` | Constant belgium; FK country.country_id. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `geography_id` | geography.json /i/geography_id; BE-NIS-code or BE-GEO-institution; exact vector. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `name` | geography.json /i/name; retain accented original label and aliases. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `parent_geography_id` | NULL in authored dataset; no inferred parent/geometry. Future supplied parent must resolve within Belgium and be acyclic. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `effective_from_label` | NULL; office roster observation date is not an effective boundary start. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `effective_to_label` | NULL; missing current code does not establish abolition date. | PK (belgium,geography_id); no forced parents, no inferred boundary dates. All office geography references must exist. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## research_date

PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `date_id` | Exact owner-based vector in Identity Rules; no random ID. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `label` | Event /date unless conflicting; office /next_election/label=2030. For conflict withhold resolved row and preserve claims. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `precision` | day for supplied ISO ballot date, year for 2030; no month/day padding. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `certainty` | called for supplied historical ballot dates; expected for 2030; not legal certification. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `year` | Parse first 4 digits only for known dates; 2030 for expected metadata. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `month` | ISO month for day date; NULL for year/unknown. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `day` | ISO day for day date; NULL for year/month/unknown. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `range_start_id` | NULL; no range supplied here. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `range_end_id` | NULL; no range supplied here. | PK date_id; calendar-valid components, precision/null checks, no padded future day. Conflicting resolved dates withheld. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## office

PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `id_namespace` | Constant cdd-observatory-v1; part of every office/event/result PK. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `office_id` | Source row /office_id exactly; FK (N,office_id), reject absent or fixture IDs. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `country_id` | Constant belgium; FK country.country_id. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `geography_id` | office-register.json /i/geography_id; required FK to authored geography. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `name` | office-register.json /i/name exactly; translated display labels may be added only separately. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `office_type` | office-register.json /i/office_type; preserve council/mayor/special/assembly distinction, never use as tier directly. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `office_status` | current=true → current; false → historical. 565 current municipality pairs; 55 historical coded councils retained. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `record_state` | active, including historical offices; no withdrawal inferred from age or omissions. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `state_note` | notes + binding review reason, NULL only if none; never claim certified abolition. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `registry_qualified` | NULL; no new election eligibility claim is sourced. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `next_date_id` | If /next_election exists: date vector owner office/office_id/next. Otherwise NULL. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `next_date_resolution` | resolved for sourced expected year 2030; unknown otherwise. Resolution is not certainty. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `next_history_key` | NULL: metadata-only future cycle does not invent an event. | PK (N,office_id); exactly one classification and one sourced geography per register ID. Historical status is not deletion. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## office_tier_classification

Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `id_namespace` | Constant cdd-observatory-v1; part of every office/event/result PK. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `office_id` | Source row /office_id exactly; FK (N,office_id), reject absent or fixture IDs. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `tier` | tier JSON /classifications/i/tier; national→national_context; regional/municipal/other unchanged; unknown→NULL. No SQL calendar classifier. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `review_status` | needs_review for known draft proposals; unknown only if tier NULL. Production requires Justin-approved file/accepted row policy. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `rationale` | Exact classification rationale; preserve evidence and flags in raw. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `classification_path` | schemas/atlas/tiers/belgium.json. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `classification_kind` | tier_classification. | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `classification_sha256` | Input Inventory /tier_sha256; FK to retained_input(L,R,path,kind,hash). | Mutual deferred office FK; 1:1 ID equality with entire authored register. Draft status is not production acceptance. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## election_event

PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `id_namespace` | Constant cdd-observatory-v1; part of every office/event/result PK. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `office_id` | Source row /office_id exactly; FK (N,office_id), reject absent or fixture IDs. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `history_key` | Source row /history_key exactly; FK (N,office_id,HK), never derive from a calendar cohort. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `event_id` | events.json /i/event_id; K(event,[belgium,N,HK]); unique within namespace. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `date_id` | Event date vector; NULL for Bilzen conflict; all competing claims retained. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `date_resolution` | events.json /i/date_resolution; conflicting with NULL date_id for Bilzen, resolved otherwise. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `event_kind` | ordinary for supplied ordinary-cycle rows; unresolved Bilzen stays unknown until repeat binding accepted. Historical is a temporal description, not schema enum. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `selected_history_role` | events.json /i/selected_history_role; other for disputed Bilzen/Saint-Josse; selected for retrieved other histories. Not proof of exhaustive cycles. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `electoral_system` | NULL unless separately evidenced in raw; never guess PR rules from list labels. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `comparability` | NULL; no boundary-adjusted comparison certification. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `ballot_basis` | list_votes for list returns; source denominator details remain raw. Never candidate_marks for list rows. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `share_unit` | percent_0_100 (including when every share value absent); supplied shares are already percentages. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `legal_outcome` | disputed for named conflicts; preliminary for Wallonia portal unofficial figures; unknown for other unverified certification. Do not promote complete count to certified. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `record_state` | active; held claims remain visible as disputed/other, not silent deletion. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `state_note` | events.json /i/raw and conflict notes; include district scope and incomplete certification. | PK (N,office_id,HK); unique (N,event_id); parent office exists. One cycle/date record, no comparison or reporting-rollup duplication. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## proceeding

Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `id_namespace` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `office_id` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `history_key` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `proceeding_id` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `kind` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `sequence_no` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `supersedes_id` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `legal_outcome` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Zero authored rows; no synthetic rounds. Future proceedings require sourced identifiers and event FKs. |
| `lineage_id` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | No proceeding row authored. No source provides a reviewed round/repeat proceeding identity; preserve supplied notes in event raw and unresolved_evidence. Future row requires evidenced ID, parent event FK and ordered kind/sequence; do not synthesize from cycle year. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## source

PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `country_id` | Constant belgium; FK country.country_id. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `source_namespace` | Constant L; source IDs remain scoped by country and namespace. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `source_id` | source-catalogue.json /i/source_id; exact K vector; challenge/error entries are diagnostic retained inputs and create no evidence source. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `publisher` | Hostname of successful official source URL as catalogue provenance, not invented author; multi-page tool capture uses embedded Belgium.be publisher context. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `title` | Source filename as artifact label; retain actual upstream title when present in raw; never invent a document title. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `url` | Exact successful catalogue URL; NULL for multi-page captures with component URLs retained in raw. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `checked_as_of_label` | source-catalogue.json /i/retrieved=2026-09-19; not original publication date. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `evidence_grade` | NULL; official publisher alone does not assign a research quality score. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `file_sha256` | Catalogue SHA of retrieved bytes/capture, not remote file hash when only tool representation available. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `locator` | Catalogue input_path plus embedded source evidence locator; tool-capture status explicit. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `data_rights` | NULL unless explicitly supplied; official availability does not assert a reuse licence. | PK (belgium,L,source_id); substantive retained inputs only. Challenge/failed responses never prove institutional facts. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## party_mapping

Zero authored rows. Local list labels stay local; no unsupported party-family grouping.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `country_id` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `party_namespace` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `mapping_id` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `source_context` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `election_context` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `original_label` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `original_code` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `mapped_group` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `uncertainty` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Zero authored rows. Local list labels stay local; no unsupported party-family grouping. |
| `lineage_id` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | No party_mapping row authored: supplied list labels/codes remain on result_row. No cross-election party-group harmonization or coalition equivalence accepted. Future mapping requires scoped source/election context and reviewed evidence. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## result_row

PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `id_namespace` | Constant cdd-observatory-v1; part of every office/event/result PK. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `office_id` | Source row /office_id exactly; FK (N,office_id), reject absent or fixture IDs. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `history_key` | Source row /history_key exactly; FK (N,office_id,HK), never derive from a calendar cohort. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `result_row_id` | results.json /i/result_row_id; exact K vector; includes scoped source token. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `proceeding_id` | NULL; no authored proceedings. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `country_id` | Constant belgium; FK country.country_id. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `candidate_or_list_label` | results.json /i/candidate_or_list_label exactly; list result, not mayor candidate. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `original_party_label` | results.json /i/original_party_label exactly; coalition text retained. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `original_party_code` | IBZ raw.partyId or printed list number retained as string when supplied; no invented global party code. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `party_namespace` | NULL; no accepted mapping. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `party_mapping_id` | NULL; both mapping key components remain NULL. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `votes` | results.json /i/votes integer; supplied stemcijfer / nrOfVotes / HTML votes; 2012 explicit sum of two list ballot categories recorded in raw. NULL absent; reject negative/noninteger. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `votes_status` | results.json /i/votes_status; zero if exactly0, recorded if positive, unknown if NULL; disputed/preliminary source qualification may override with documented reason. | NULL→unknown; 0→zero; positive→recorded unless explicitly qualified; reject contradictory value/status. |
| `share` | results.json /i/share numeric percent only when explicitly supplied; NULL otherwise. No vote-based percentage silently manufactured. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `share_status` | zero / recorded / unknown from actual value; disputed/preliminary qualification preserved. No NULL-to-zero. | NULL→unknown; 0→zero; positive→recorded unless explicitly qualified; reject contradictory value/status. |
| `share_unit` | percent_0_100 even for missing values; raw source absence preserved. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `seats` | results.json /i/seats; NULL if absent, explicit0 retained. Never candidate count or historical capacity. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `seats_status` | zero / recorded / unknown paired with value; no inference from winner rank. | NULL→unknown; 0→zero; positive→recorded unless explicitly qualified; reject contradictory value/status. |
| `elected_flag` | NULL for list rows; list seats do not make a person elected. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `is_substitute` | NULL; no candidate appointment projection. | PK (N,office_id,HK,result_row_id), globally unique (N,result_row_id); scoped list observations only. Every scalar status agrees with its value. |
| `evidence_status` | recorded unless source provisional/disputed; Wallonia preliminary; Bilzen and Saint-Josse disputed. This is evidence status, not legal certification. | NULL→unknown; 0→zero; positive→recorded unless explicitly qualified; reject contradictory value/status. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## record_locator

Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `record_key` | rec- + H([entity_kind,...PK]); exact Identity Rules tuples; one per typed record or retained raw record. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `entity_kind` | Exact schema enum: country, geography, office, event, result_row, source or input. No proceeding/party_mapping rows baseline. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `country_id` | belgium for typed country/geography/office/event/result_row/source; NULL for input target. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `geography_id` | Actual geography FK only for geography target; otherwise NULL. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `id_namespace` | N only for office/event/result_row; NULL for country/geography/source/input. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `office_id` | Actual office_id only for office/event/result_row; otherwise NULL. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `history_key` | Actual HK only for event/result_row; otherwise NULL. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `proceeding_id` | NULL baseline. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `result_row_id` | Result target ID only, otherwise NULL. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `party_namespace` | NULL baseline. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `party_mapping_id` | NULL baseline. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `source_namespace` | L only for source target; NULL otherwise. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `source_id` | Source target ID only; result evidence source belongs in evidence_link, not a false source-entity locator. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `input_path` | Exact retained input path only for input target; otherwise NULL. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `source_row_locator` | C({input_path,sha256,locator,derived_path,derived_pointer}); exact source occurrence, not an invented row. | Exactly one DDL target shape. Entity kinds are country/geography/office/event/result_row/source/input; irrelevant nullable keys must be NULL. |

## evidence_link

FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `evidence_id` | ev- + H([record_key,input_path,locator,claim_kind]); stable occurrence key. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `record_key` | FK locator key of target row. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `source_country_id` | belgium. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `source_namespace` | Constant L; source IDs remain scoped by country and namespace. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `source_id` | Resolved catalogue source_id for evidence input_path; absent source row → fail closed, not automatic unresolved conversion. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `source_locator` | Exact JSON pointer / XLSX row / HTML XPath from evidence[]. Multi-page captures also identify original URL. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `claim_kind` | Literal sourced claim category: register_identity, result_vector, ballot_date, institutional_scope or next_cycle_metadata. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `date_claim_id` | Date-claim FK only for explicit date evidence; NULL otherwise. Conflicting claims retain separate owner/claim dates. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `claim_json` | C(original source fields and conversion explanation); no invented quote or facts. | FK to record_locator and actual source row. Broken resolved FK is fatal; do not hide it in unresolved_evidence. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |

## unresolved_evidence

FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `unresolved_id` | unres- + H([record_key,original_token,input_path,locator]). | FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event. |
| `record_key` | Existing office/event locator for named conflict; retained_input locator for unresolved municipality bindings. | FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event. |
| `original_token` | Original IBZ labels/level ID or exact Bilzen header/date claim; preserve token text. | FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event. |
| `source_locator` | unresolved-bindings.json /i plus original source pointer. | FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event. |
| `reason` | Exact /reason; distinguish missing binding, duplicate event and date conflict. | FK to existing office/event/input locator. Unbound 2000 records attach to retained input; named date conflicts attach to event. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Full unresolved entry, candidate codes and retained source claims. No fake source FK. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## identity_crosswalk

Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `entity_kind` | office/geography/event/result/source/retained_input kind matching locator. | Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks. |
| `upstream_namespace` | ibz-election-api/<electionId>, fl-election-workbook/<type>, wallonia-election/<year> or brussels-election/<year>; preserve authority boundaries. | Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks. |
| `upstream_id` | Exact NIS+office kind for offices; IBZ level/list ID or workbook type+code+date+list token for elections/results. Original labels remain raw. | Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks. |
| `record_key` | Resolved typed target rec key. Unresolved bindings produce no crosswalk until reviewed. | Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks. |
| `reason` | Deterministic sourced binding or explicit reviewed correction; no label-only many-to-one merger. | Scoped upstream identity maps to an existing locator; unresolved aliases do not create accepted crosswalks. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `release_id` | Candidate R from effective-input fingerprint; never attempt_id or another lineage R. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `raw_json` | Canonical lossless envelope {origin,source_row,qualifiers}; retain all original fields and evidence locators. Original bytes remain retained_input; never discard unknown columns. | Round-trip source fields and scalar types; no unknown field discarded; original-byte SHA verified. |

## ingest_attempt

Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task.

| Destination column | Source locator → conversion / NULL policy | Identity, evidence / validation assertion |
|---|---|---|
| `attempt_id` | Future attempt-UUID; fresh each run, never hash input. No attempt created here. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `lineage_id` | Constant L; FK to selected Belgium publication member. | FK selected publication_release(L,R); unchanged import keeps R; unrelated lineage ownership unchanged. |
| `operator` | Future actual initiating operator identity; not Justin approval inferred. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `script_version` | Future implemented importer version; absent/not run now. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `started_at` | Future UTC timestamp from durable ledger start; no fake execution timestamp. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `finished_at` | NULL until future finish; then actual UTC. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `status` | Future started/succeeded/failed per ledger contract; no succeeded row authored here. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `input_inventory_json` | C(effective inputs + validation provenance) at attempt start. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `successful_release_id` | R only after successful publication reconciliation; NULL on failure. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `publication_set_json` | Exact complete set of lineage/release pairs, preserving all unrelated members. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `row_counts_json` | Actual execution counts including inherited rows; NULL/empty permitted only as ledger contract allows until measured. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |
| `error_text` | Actual failure details or NULL; do not fabricate errors. | Separate durable ledger; started committed before staging; terminal records immutable. No ledger records generated in this documentation task. |

## Publication contract — future implementation only

Durably create the attempt in the separate sibling ledger before staging. Hold the writer lock; take a consistent backup of live master, preserve all other lineage release members and rows, and stage on the same filesystem. Load only reviewed effective inputs under deferred FKs; verify foreign keys, integrity, counts, tier identity equality, unresolved holds and fixture exclusion. Failure discards staging, records failed attempt and leaves last good master serving. No INSERT OR REPLACE or omission-driven deletes.

After successful gates, preserve backups, checkpoint WAL without busy frames, close staged connections, fsync the staging file, atomically rename and fsync the directory. Readers reopen read-only. Reconcile the receipt and ledger after a crash; unchanged re-import receives a new attempt but the same R. None of these operations is executed here. No `/electiondatabase` redirect or retirement is authorized.
