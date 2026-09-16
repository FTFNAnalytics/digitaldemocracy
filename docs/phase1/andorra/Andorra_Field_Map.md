# Andorra → Atlas master field map

**Prompt J documentation draft for Cursor implementation.** Repository `FTFNAnalytics/digitaldemocracy`; pinned PR #19 `cursor/phase2-tier-drafts-d71d` at **bc1d1a9b1c437ca0da309e3820967d4e29ff919d**, fetched 2026-09-16. Main was `9065dcdfc0cbc78171dad35b60742ae232b6dd00`. Use `docs/phase1/andorra/` consistently for this handoff; the folder follows Prompt C's contract and does not reclassify Andorra as the Phase 1 proof. Albania remains the completed storage proof; Andorra is Europe target #2, Alderney follows, Armenia is last among early targets.

Authoritative inputs: pinned `docs/atlas-plan.md`; both `schemas/atlas/migrations/000*.sql`; `docs/phase1/Phase1_DDL_Rationale.md`; Albania field-map/identity/examples/checklist; current `lib/atlas/identity.ts`; bridge `lib/observatory/adapters/europe.ts` and `tables.ts`; frozen package and approved T. Historical prose in the plan/Albania docs still calls some tier files missing/draft. The pinned **approved** Andorra file and this prompt govern its current status; no approval is requested or reverted.

The master and ledger migrations are unchanged. This map covers **223 destination columns across 20 tables**, plus operational schema_migration notes. [Identity rules](Andorra_Identity_Rules.md) define every key; [acceptance examples](Andorra_Acceptance_Examples.md) specify future behavior; [checklist](Prompt_J_Field_Map_and_CI.md) distinguishes completed mapping from **Not run** importer/CI execution. No SQLite research rows are loaded.

## Baseline

| Validated count | Value |
| --- | ---: |
| current_offices | 7 |
| historical_offices | 0 |
| geographies | 7 |
| selected_histories | 21 |
| result_rows | 53 |
| control_observations_retained | 7 |
| national_polls_retained | 1 |
| source_catalogue_rows | 10 |
| inline_only_sources | 3 |
| sources | 13 |
| briefings_retained | 7 |
| municipal_offices | 7 |
| regional_offices | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| package_files_retained | 27 |

Office-register SHA-256: `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f`. Approved tier SHA-256: `b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014`. Exact source byte inventory and documentation fingerprint vector: [Andorra_Input_Inventory.json](Andorra_Input_Inventory.json). All seven tier rows are municipal; no regional office is supplied. Zero is a valid regional **numerator**, not a sourced denominator or proof of 0% coverage.

Historical dates: **7 day + 14 year**, all certainty unknown. Seven null next-date register cells; both cohort date cells null. Results: 53 positive votes, 53 positive shares, 9 zero seats and 44 positive seats; no result numeric cells missing. Raw competition scores contain **one real zero (Encamp)** and **two nulls (Canillo, La Massana)**. Preserve both; no metric computation. The source `coverage_complete=false`, `site_ingestion_status=pending_adapter`, remaining gaps and dated control limitations survive successful mapping.

## Source notation and lossless envelope

`P = data/countries/andorra/`. Append the listed relative filename directly. For table F, row i and literal column c at index j, source pointer is `/rows/i/j`; workbook row is F.source_rows[i], never i+2. Indices are zero-based. Read F.sheet/columns/rows/source_rows together; reject malformed row shape, duplicate column names and identity type errors.

| Alias | Exact input |
| --- | --- |
| M | P + manifest.json |
| O | P + tables/office-register.json; Office register |
| H | P + tables/history-index.json; History index (single file) |
| D | P + tables/detailed-returns.json; Detailed returns (single file) |
| S | P + tables/sources.json; Sources |
| Nts | P + tables/country-notes.json; Country notes |
| Cal | P + tables/election-calendar.json; Election calendar |
| Ctl | P + tables/governing-control.json; Governing control |
| Poll | P + tables/polling-evidence.json; Polling evidence |
| BF | P + briefings/{exact Office ID}.html; inert original bytes |
| T | schemas/atlas/tiers/andorra.json; classifications[]; approved unchanged |

All **27 package files + T = 28 retained inputs** are fingerprinted. The 23 manifest-listed files are validated against manifest hashes/lengths; the four additional tracked files are manifest.json, README.md, extract.py and validate.py. Retain cached-formulas.json, history-index-crosscheck.json, coverage.json, source-links.json, country-coverage/parameters/read-me tables and andorra.html in full. The independent crosscheck adds **zero events**. Package scripts are retained as bytes, never executed by an importer. A separate read-only package validator was run for this documentation review.

Locator object: `{input_path,sha256,json_pointer,sheet,source_row,column,html_anchor_index}`, unused keys null; root JSON pointer is empty string. HTML anchors use zero-based document `<a>` order. Heading provenance is the BF input hash plus `h3_index` and exact heading text in supplemental raw. For inherited path collisions add `retained_input_path`; input_path remains original. Stable occurrence tuple is `[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]`, excluding mutable hash/release.

Raw envelope: `{origin:locator,row:original_object,columns:original_columns_or_null,values:original_row_or_null,supplemental:original_supporting_items}`. For tabular input row is the exact zip of columns/values; supplemental items carry their own locators. Unknown upstream keys/columns remain in raw and complete retained_input.payload_json; **no invented extension columns**. Original bytes remain recoverable by hash regardless of JSON reserialization. Operational binding/override metadata is labelled separately from research claims.

JSON null → SQL NULL except explicit status fields. Optional empty strings → NULL in typed scalar slots only, original retained raw. IDs cannot be blank or coerced; no trimming/Unicode normalization. Numeric strings, nonfinite values and invalid calendar dates fail pending an explicit documented conversion. All projected entities cite their own `(L,R)`; `N=cdd-observatory-v1`, `L=country-package-andorra`, R defined by the identity document. Required FKs fail closed; nullable unknowns never conceal partial composite references.

## dataset_lineage

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + bridge packageRelease | Fixed `country-package-andorra`; never a per-run ID. | L; PK | One source-dataset lineage, not one continent. |
| provenance_kind | M.schema_version | `country_package`; require `europe-country-extract/1`. | L | Reject fixture/unknown provenance. |
| description | M.country | `Andorra frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | All P files + T + applicable override files + version contract | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-andorra-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_checked_through | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Not today or attempt timestamp. |
| upstream_release_id | europe.ts packageRelease(inventory).id | Copy existing `country-package-andorra`. | R | Legacy alias retained; not new Atlas release ID. |
| validated_counts_json | Recomputed O/H/D/S/C/Poll/BF counts | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | Required counts and per-office semantic equality; catalogue vs inline counts distinct. |
| research_coverage_complete | M.coverage_complete | false → 0; require false for this frozen baseline. | R | Do not turn successful validation into complete coverage. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve pending_adapter; not publication status. |

## retained_input

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | Every tracked file below P; accepted T; applicable overrides | Repo-relative POSIX path, no leading slash, traversal or symlink. Inherited path rule in Identity Rules. | (L,R,input_path) | 27 baseline package files + 1 accepted tier file; inventory may grow only by explicit inputs. |
| input_kind | Path class | T=tier_classification; overrides=override; *.html=artifact; every other P file=package. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | Verify manifest.files hashes for all 23 listed entries and register fixed hash. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | `sha256:<sha256>` content-addressed locator; fetch/store bytes before publication; git commit/path also retained in inventory. | (L,R,input_path) | Resolve and rehash every locator; scratch/working-tree existence alone is insufficient. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | Full structural equality and original-byte recovery; 7 control observations + 1 national poll retained. |

## country

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | M.country; bridge slug | Literal `andorra`, existing ID. | country_id | No new country from shared Read me text. |
| country_code | M.country_code | Copy `AD`. | country_id | Unique if supplied; NULL allowed for future entries. |
| name | M.country | Copy `Andorra`. | country_id | Nonempty. |
| polity_kind | M.country / country_code; accepted plan | `sovereign_country` for Andorra. | country_id | Do not impose this value on territories. |
| region_id | M.region | Europe → `europe`; geographic region, not office tier. | country_id | Not calendar cohort. |
| coverage_status | M.coverage_complete; coverage.json.status | `partial`. | country_id | Coverage notes remain available. |
| screening_as_of_label | No separate Andorra screening-as-of field | NULL; research_checked_through belongs to release. | country_id | Do not infer from Accessed or packaged_on. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Exact late-2027 day, future nominations and comparable party-alliance concordance remain unresolved; no parish vote estimate. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `andorra`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction + O.Office + bridge key | G=key("geo",["andorra",Jurisdiction,Office]); frozen bindings retained thereafter. | (country_id,G) | 7 distinct bridge IDs; names are not PKs. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent parish, region or geometry is inferred; future FK same-country and acyclic. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row for this G | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | 7 unique IDs; fixture patterns rejected. |
| country_id | O.Country + M.country | `andorra`; exact Andorra label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N,office_id) | FK (andorra,G); preserve all seven bridge bindings. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O.Office | Verbatim `Communal council`. | (N,office_id) | Seven supplied communal councils; office type is separate from geographic tier. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date; Cal.First or scheduled date / End or runoff date | NULL for all seven; O and both Cal date cells are null. Late-2027 prose stays raw; no fabricated date/event. | (N,office_id) | A future unique structured claim may supply a date FK; conflicting claims withhold it. |
| next_date_resolution | Same date inputs | `unknown` for all 7. | (N,office_id) | No called date from broad Date status text. |
| next_history_key | No public upcoming event in this bridge baseline | NULL. | (N,office_id) | Do not create key("next",office_id) absent supplied date/event. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | municipal→municipal; national→national_context; regional/other unchanged; unknown→NULL. | (N,office_id) | 7 municipal; zero regional; ignore calendar Tier entirely. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | Known tier: approved only if accepted T.status="approved" and neither row flag true; otherwise needs_review. Unknown tier→unknown. | (N,office_id) | All seven map to approved: T.status is approved, human_review_required=false; absent tier_uncertain is not true. No status edits. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/andorra.json`. | (N,office_id) | Already present and approved at pinned commit; retain original bytes. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Accepted T bytes | Exact approved-byte SHA-256 `b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014`. | (N,office_id) | Retained-input composite path/kind/hash FK; reverify against pinned tree, never reserialize T. |
| raw_json | T.classifications[] original object | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| date_id | H owner identity + date slot; later documented date claims | `date-` + full SHA256(C([N,owner_type,owner_id,slot])); event owner_id=event_id, slot=ballot. | date_id | Stable across corrected value; each distinct claim has its own owner/slot. |
| label | H.Ballot date if recorded, else H.Year | Use supplied date label verbatim; if absent, decimal year; if both absent, empty string with unknown precision. | date_id | No fabricated "Date not supplied" as source text; original null preserved raw. |
| precision | Label grammar in § Dates | Full-string parser in Dates; baseline 7 day + 14 year. Month/range/unknown only when supplied later. | date_id | 14 absent historical days remain absent; never fill January 1. |
| certainty | No historical called/statutory/expected assertion | `unknown` for 21 historical dates. Future claims require explicit certainty mapping; no URL-based inference. | date_id | Independent of precision and legal outcome. |
| year | Parsed exact date/year label | Integer 1..9999; NULL if unknown or range. | date_id | All baseline years agree with H.Year. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; for a later explicit range use parent owner tuple with slot suffixed /start. | date_id | FK known non-range endpoint, acyclic. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; analogous owner tuple with slot suffixed /end. | date_id | FK and ordered intervals; never interpret two separate elections as runoff range. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H original date/year cells + their locator | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## election_event

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | H.Office ID identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H.Office ID | Copy exact. | (N,office_id,history_key) | FK office; every H row resolves. |
| history_key | H.Office ID / Year / Ballot date if recorded | Bridge HK exact rule in Identity Rules; preserve frozen binding on corrections. | (N,office_id,HK) | 21 unique; crosscheck slice adds zero. |
| event_id | Bridge key("event",["andorra",HK]) | Exact bridge public ID; never hash raw result values. | (N,event_id) | Unique within namespace; alias crosswalk retained. |
| date_id | H date mapped to research_date | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | Required for resolved/unknown under DDL; NULL only unresolved conflicting claims. |
| date_resolution | Parsed H date + documented override state | `resolved` for baseline; unknown if unusable label, conflicting if neither dated claim wins. | (N,office_id,HK) | Resolved means a unique supplied date at its recorded precision: 7 day and 14 year. Conflicting requires NULL date_id. |
| event_kind | BF[Office ID].h3 matched to H supplied date label, else exact decimal H.Year | Exact suffix `Ordinary election` → ordinary. | (N,office_id,HK) | 21 unique office+label matches; h3 indices 0/1/2 match 2023/2019/2015. No dates inferred from prose. |
| selected_history_role | Membership in H /rows | `selected` for all 21. | (N,office_id,HK) | Crosscheck is reconciliation only; no additional prospective or narrative event. |
| electoral_system | No dedicated voting-system field in H | NULL; Vote basis is not an electoral system. | (N,office_id,HK) | No guessed FPTP/PR/See source briefing. |
| comparability | H.Coverage + H.Comparability status | Join nonempty exact strings with ` · `; raw keeps separate values. | (N,office_id,HK) | Preserve 3 Unscored / inapplicable histories and all 2015 scanned-archive caveats. |
| ballot_basis | H.Vote basis | Exact `Valid candidate/list votes` → valid_votes for all 21. | (N,office_id,HK) | D.Vote basis must agree; do not equate marks with electors or infer a voting system. |
| share_unit | H.Leader share and D.Share on stated basis; BF Share heading | `percent_0_100`. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | H.Coverage | `unknown` for all 21. Official provenance and historical result availability are not certification. | (N,office_id,HK) | No explicit structured certification/proceeding supplied; do not infer. |
| record_state | Selected H membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row plus matched BF h3 locator/text | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## proceeding

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Andorra package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | D.Office ID | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D.Office ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D.Office ID / Year / Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | All 53 rows match exactly one selected H. |
| result_row_id | Bridge per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | Never reassign index after sorting by votes or after refresh omission. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Country + matched office | `andorra`. | (N,result_row_id) | Composite FK enforces office country. |
| candidate_or_list_label | D.Candidate or list | Exact string; NULL if absent, no invented Unlabelled source row. | (N,result_row_id) | All baseline supplied. |
| original_party_label | D.Party or proposer | Exact original D.Party or proposer text; no cross-year coalition equivalence. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | Bridge result.partyCode = D.Party or proposer | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Not a new authoritative standardized party code. |
| party_namespace | D.Year + country package source scope | `andorra/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Existing bridge namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 53 nonnull positive baseline values; safe integers, no inferred totals. |
| votes_status | D.Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | All baseline positive; independent of evidence_status. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 53 supplied counts: 9 zero, 44 positive, 0 null. Missing future seats must still stay NULL. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D.Result coverage | Case-insensitive preliminary/provisional→preliminary; otherwise recorded if votes/share supplied, else unknown. | (N,result_row_id) | Reported numbers stay numbers even when preliminary; no certification inference. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| party_namespace | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapping_id | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| source_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| election_context | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_label | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| original_code | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| mapped_group | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| uncertainty | No separate concordance collection in frozen package | NO ROW. D labels are retained in result_row. Later sourced mapping must name its country/source/election context and uncertainty; no inferred successor group. | No baseline mapping identity | 0 rows; all result.party_mapping_id NULL. Briefing nomination narrative alone is not a label-equivalence table. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | S rows / exact inline URL occurrence | `andorra`. | (andorra,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-andorra`. | (andorra,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | S.Source ID; genuine inline URL | Catalogue `andorra--` + Source ID; inline-only `andorra--` + key("url",exact URL). | Source tuple | 10 catalogue + 3 actual inline-only URLs =13 canonical sources; preserve bridge URL aliases. |
| publisher | No dedicated publisher column in S; inline context lacks explicit publisher metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S.Title | Verbatim for catalogue; NULL for three inline-only URLs (anchor labels are not asserted source titles). | Source tuple | No URL-as-title or manufactured Source reference title. |
| url | S.Source URL; genuine inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | Exact unique catalogue URL match; no fetching or claiming current availability. |
| checked_as_of_label | S.Accessed | Copy catalogue value; inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | S original row or inline URL occurrence list | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | andorra except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | If later supplied, both mapping components required. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-andorra for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator object) using exact definition below; table rows carry source_rows[i], JSON pointer, SHA and logical path. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | andorra. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-andorra. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | history→event; return→result; event date→date; control→control_observation; poll→national_poll; Cal/Nts/coverage→calendar_context; HTML-only→artifact_reference; explicit override→override. | evidence_id | No claim stronger than field context; see evidence traversal. |
| date_claim_id | H date claim or explicit documented date override | H ballot date ID only for claim_kind=date; otherwise NULL. Ancillary control/poll dates stay retained JSON. | evidence_id | FK actual research_date; independent conflicting dates preserved separately. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | `preserved_bridge_id`, `package_source_id`, `exact_url_catalogue_alias`, `baseline_row_binding`, or `documented_identity_correction`. | Crosswalk PK | Correction requires retained override; no undocumented reassignment. |
| lineage_id | Owning package M / staged lineage | `L = country-package-andorra`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Andorra row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination field | Source file / path or column | Conversion / null policy | Deterministic identity | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| attempt_id | Operational invocation | `attempt-` + lowercase UUIDv4; one fresh unique value per run. This is the only random identifier. | attempt_id | New on unchanged import; never public research identity. |
| lineage_id | Requested country identity | L. | attempt_id | Logical link, no cross-DB FK. |
| operator | Authenticated operator/service identity | Actual value, nonempty; not invented name. | attempt_id | Required preflight input. |
| script_version | Actual importer build identity | Actual immutable build/version; field-map contract version alone is not executing script version. | attempt_id | Record even failed input attempts; exclude from hash except semantic adapter version. |
| started_at | UTC clock at invocation | RFC3339 UTC timestamp with Z; operational only. | attempt_id | Commit started row before staging writes. |
| finished_at | UTC clock at terminal transition | NULL while started; real timestamp when terminal. | attempt_id | Never backdate research. |
| status | Publication state machine | started→succeeded after verified durable swap, or failed before publication; recover ambiguous swap first. | attempt_id | Terminal immutable; no replace/delete. |
| input_inventory_json | Preflight scan of intended inputs / versions | Canonical JSON manifest with known hashes/bytes, missing entries as null hash + error; include intended T path. Immutable after started. | attempt_id | Inventory cannot invent hash for missing T; reverify bytes after logging. |
| successful_release_id | Verified published release | NULL started/failed; R succeeded. | attempt_id | Must match master receipt and selected release logically. |
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Andorra. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## schema_migration

Operational tables in both databases remain controlled by their migrations: version=1 and each migration's literal description; PRAGMA user_version=1. No Andorra input maps to them. Both migration digests are in the input-inventory schema_inputs; no SQL modification.

## Dates

Full-string grammar: YYYY, YYYY-MM, YYYY-MM-DD, D Month YYYY or Month YYYY (English full names, case-insensitive), valid Gregorian components. Parse-only edge whitespace can be ignored; preserve original label. Invalid purported dates fail; unrecognized narrative remains unknown, not a day inferred by a loose regex. H.Year fallback is allowed only when H.Ballot date if recorded is null/blank. Supplied year/date conflicts fail pending documented correction.

21 date rows attach to 21 events: seven label=2023-12-17, precision=day, year=2023, month=12, day=17; seven label=2019 and seven label=2015, precision=year, month/day=NULL. Every certainty=unknown, because historical rows do not assert called/statutory/expected/conditional status. A resolved unique year is still year precision. No office next-date rows or upcoming events: late-2027 prose in remaining gaps is retained as contextual expectation, not a typed polling date. Cal.Date status is not a blanket certainty for historical ballots.

For future ranges, preserve independent known non-range endpoints, reject cycles and reversed intervals; compare interval overlap without storing fabricated first/last days. Unknown dates are not confirmed in-window. Independent unresolved claims get separate research_date/evidence rows; the single resolved pointer stays NULL with conflicting state. Never treat two competing dates as a runoff range. Month/range/conflict examples are isolated CI mutations, not Andorra package observations.

## Evidence traversal and resolution

Make typed record_locator rows for each country, geography, office, event, result, source and retained input. Date/tier/metric are not locator entity kinds: date evidence targets an event/office; classification provenance uses the retained-input composite FK and original T row. Baseline has no proceedings or party mappings. All unused locator target fields are NULL; require both DDL shape constraints and target existence.

Match exact catalogue Source ID, then exact URL. Ten catalogue IDs and URLs are unique. Three real inline-only URLs in source-links.json become source rows with absent publisher/title/access date NULL:

- https://ari.ad/images/imgs/actualitat/enquesta_politica/INFORME%20POLITICA%202026%20DESCRIPTIU_final1.pdf
- https://en.wikipedia.org/wiki/List_of_elections_in_2027
- https://www.eleccions.ad/

These are frozen-source references, not claims of current web availability. No external pages were retrieved to enrich them. Preserve exact URL encoding and bridge URL aliases; do not strip paths/query/percent encoding.

| Citation occurrence | Target / claim_kind | Handling |
| --- | --- | --- |
| H.Source URL | event locator; event and date | Separate date link references actual research_date; retain original H row |
| D.Source URL | result locator; result | Each row's exact source, never presumed from a different event |
| O.Calendar evidence | office; calendar_context | All seven null, so no fabricated citation |
| O/Nts.Detailed workbook | raw artifact provenance | Match manifest workbook entry/hash; not an HTTP source or unresolved token |
| Nts.Screen evidence; coverage.json.screen_source | country; calendar_context | Exact inline URL; no polling-day inference |
| Cal.Source URL | Cal input; calendar_context | Preserve C085, mixed Tier label, null start/end, expected-cycle text; no tier/date classification from cohort |
| Ctl.Control source / Poll source | Ctl input; control_observation / national_poll | Seven dated rows retain exact Office ID and source-date/limits; no new officeholder entity or tenure inference |
| Poll.Source URL | Poll input; national_poll | One record, all denominators, dates, sample limits and contextual assessment |
| BF / andorra.html external href | corresponding artifact input; artifact_reference | Inert parse, original anchor index, exact URL resolver |
| BF selected h3 | event raw supplemental | Exact office+label binding; all 21 end with Ordinary election; no extra event or source invented |
| S rows / source-links arrays | source/input raw provenance | Not automatic all-to-all evidence links |
| T classification row | classification retained-input FK | Register path/hash plus exact /classifications/i; no remote URL manufactured |

Only designated citation fields and explicit external citation anchors are resolved. Relative navigation and arbitrary prose are not unresolved evidence. A genuine unknown token yields unresolved_evidence with exact token/origin/reason and a real target locator. A known resolved source missing from staging is a fatal integrity error, never demoted to unresolved. This baseline's designated references resolve to 13 sources; expected unresolved count is zero. Preserve source grade separately from publisher; file_sha256 stays NULL where no remote document bytes were supplied.

## Source-column coverage and unknown fields

Every column listed in the appendix below is retained verbatim in its whole-file retained_input.payload_json. Core rows also keep their exact row envelope. Typed mappings are explicit; “raw only” means retained research, not discarded fields. Unsupported future fields stay raw; a future field affecting keys, date semantics or conflicts requires versioned reviewed mapping before typed projection.

### country-coverage

`data/countries/andorra/tables/country-coverage.json`; sheet `Country coverage`; **1 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Country or territory | raw only; complete retained_input.payload_json and original byte locator |
| 1 | Office records | raw only; complete retained_input.payload_json and original byte locator |
| 2 | Historical entries | raw only; complete retained_input.payload_json and original byte locator |
| 3 | Three entries | raw only; complete retained_input.payload_json and original byte locator |
| 4 | Competition scores | raw only; complete retained_input.payload_json and original byte locator |
| 5 | Grouped volatility scores | raw only; complete retained_input.payload_json and original byte locator |
| 6 | Sourced current control | raw only; complete retained_input.payload_json and original byte locator |
| 7 | Calendar cohorts | raw only; complete retained_input.payload_json and original byte locator |

### country-notes

`data/countries/andorra/tables/country-notes.json`; sheet `Country notes`; **1 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Country or territory | raw + country label check |
| 1 | Scope and remaining gaps | country.notes |
| 2 | Election calendar | raw only; complete retained_input.payload_json and original byte locator |
| 3 | Detailed workbook | raw workbook artifact metadata |
| 4 | Screen evidence | country evidence_link calendar_context |

### detailed-returns

`data/countries/andorra/tables/detailed-returns.json`; sheet `Detailed returns`; **53 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | result_row.office_id / HK |
| 1 | Country | result_row.country_id |
| 2 | Jurisdiction | raw + office match |
| 3 | Year | HK; party_namespace |
| 4 | Ballot date if recorded | exact HK join |
| 5 | Electoral unit | semantic identity binding + raw (NULL baseline) |
| 6 | Candidate or list | candidate_or_list_label |
| 7 | Party or proposer | original_party_label/code; no concordance inference |
| 8 | Votes or marks | votes + votes_status |
| 9 | Share on stated basis | share + share_status + percent_0_100 |
| 10 | Seats | seats + seats_status |
| 11 | Result coverage | evidence_status + raw |
| 12 | Vote basis | raw + event basis agreement |
| 13 | Source URL | evidence_link to result |

### election-calendar

`data/countries/andorra/tables/election-calendar.json`; sheet `Election calendar`; **1 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Cohort ID | raw only; complete retained_input.payload_json and original byte locator |
| 1 | Country | raw only; complete retained_input.payload_json and original byte locator |
| 2 | Election cohort | raw only; complete retained_input.payload_json and original byte locator |
| 3 | Tier | raw only; explicitly excluded as classifier |
| 4 | First or scheduled date | raw only; complete retained_input.payload_json and original byte locator |
| 5 | End or runoff date | raw only; complete retained_input.payload_json and original byte locator |
| 6 | Date status | raw only; complete retained_input.payload_json and original byte locator |
| 7 | Historical cycles | raw only; complete retained_input.payload_json and original byte locator |
| 8 | Coverage and timing | raw only; complete retained_input.payload_json and original byte locator |
| 9 | Prior-call units if known | raw only; complete retained_input.payload_json and original byte locator |
| 10 | Source URL | input evidence_link calendar_context |

### governing-control

`data/countries/andorra/tables/governing-control.json`; sheet `Governing control`; **7 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | raw + office reference check; observation alias |
| 1 | Country | raw only; complete retained_input.payload_json and original byte locator |
| 2 | Jurisdiction | raw only; complete retained_input.payload_json and original byte locator |
| 3 | Office | raw only; complete retained_input.payload_json and original byte locator |
| 4 | Reported current control | raw only; complete retained_input.payload_json and original byte locator |
| 5 | Source date | raw only; complete retained_input.payload_json and original byte locator |
| 6 | Control source | input evidence_link control_observation |
| 7 | Evidence limits | raw only; complete retained_input.payload_json and original byte locator |
| 8 | Polling assessment | raw only; complete retained_input.payload_json and original byte locator |
| 9 | Poll source | input evidence_link national_poll |

### history-index

`data/countries/andorra/tables/history-index.json`; sheet `History index`; **21 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | election_event.office_id / HK |
| 1 | Country | raw + office country check |
| 2 | Jurisdiction | raw + office identity check |
| 3 | Ballot date if recorded | research_date; HK |
| 4 | Year | research_date year fallback; HK |
| 5 | Leading candidate or party | raw only; complete retained_input.payload_json and original byte locator |
| 6 | Leader share | raw only; complete retained_input.payload_json and original byte locator |
| 7 | Runner-up candidate or party | raw only; complete retained_input.payload_json and original byte locator |
| 8 | Runner-up share | raw only; complete retained_input.payload_json and original byte locator |
| 9 | Vote basis | ballot_basis |
| 10 | Coverage | comparability; raw |
| 11 | Comparability status | comparability; raw |
| 12 | Source URL | evidence_link to event and date |

### office-register

`data/countries/andorra/tables/office-register.json`; sheet `Office register`; **7 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | office.office_id; tier join; crosswalk |
| 1 | Country | office.country_id (label check) |
| 2 | Jurisdiction | geography.name / bridge geography key; office.name |
| 3 | Office | office.office_type/name; bridge geography key |
| 4 | Next polling date | office.next_date_id/resolution (NULL baseline) |
| 5 | History entries | raw + per-office history count assertion |
| 6 | Latest eligible gap pp | raw only; complete retained_input.payload_json and original byte locator |
| 7 | Middle gap pp | raw only; complete retained_input.payload_json and original byte locator |
| 8 | Oldest gap pp | raw only; complete retained_input.payload_json and original byte locator |
| 9 | Weighted gap pp | raw only; complete retained_input.payload_json and original byte locator |
| 10 | Competition score | raw only; complete retained_input.payload_json and original byte locator |
| 11 | Historical competition screen | raw only; complete retained_input.payload_json and original byte locator |
| 12 | Pedersen interval 1 pp | raw only; complete retained_input.payload_json and original byte locator |
| 13 | Pedersen interval 2 pp | raw only; complete retained_input.payload_json and original byte locator |
| 14 | Mean Pedersen pp | raw only; complete retained_input.payload_json and original byte locator |
| 15 | Margin dispersion pp | raw only; complete retained_input.payload_json and original byte locator |
| 16 | Volatility interpretation | raw only; complete retained_input.payload_json and original byte locator |
| 17 | Polling and government watch | raw only; complete retained_input.payload_json and original byte locator |
| 18 | Historical coverage | raw only; complete retained_input.payload_json and original byte locator |
| 19 | Detailed workbook | raw artifact locator from M |
| 20 | Calendar evidence | evidence_link / unresolved_evidence when nonblank |

### parameters

`data/countries/andorra/tables/parameters.json`; sheet `Parameters`; **12 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Assumption | raw only; complete retained_input.payload_json and original byte locator |
| 1 | Value | raw only; complete retained_input.payload_json and original byte locator |
| 2 | Definition | raw only; complete retained_input.payload_json and original byte locator |

### polling-evidence

`data/countries/andorra/tables/polling-evidence.json`; sheet `Polling evidence`; **1 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Country | raw only; complete retained_input.payload_json and original byte locator |
| 1 | Scope | raw only; complete retained_input.payload_json and original byte locator |
| 2 | Pollster | raw only; complete retained_input.payload_json and original byte locator |
| 3 | Publication date | raw only; complete retained_input.payload_json and original byte locator |
| 4 | Fieldwork start | raw only; complete retained_input.payload_json and original byte locator |
| 5 | Fieldwork end | raw only; complete retained_input.payload_json and original byte locator |
| 6 | Sample n | raw only; complete retained_input.payload_json and original byte locator |
| 7 | Method | raw only; complete retained_input.payload_json and original byte locator |
| 8 | Result | raw only; complete retained_input.payload_json and original byte locator |
| 9 | Comparison | raw only; complete retained_input.payload_json and original byte locator |
| 10 | Assessment | raw only; complete retained_input.payload_json and original byte locator |
| 11 | Limits | raw only; complete retained_input.payload_json and original byte locator |
| 12 | Source URL | input evidence_link national_poll |

### read-me

`data/countries/andorra/tables/read-me.json`; sheet `Read me`; **13 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Topic | raw only; complete retained_input.payload_json and original byte locator |
| 1 | Use and interpretation | raw only; complete retained_input.payload_json and original byte locator |

### sources

`data/countries/andorra/tables/sources.json`; sheet `Sources`; **10 rows**. `/columns/j` identifies `/rows/i/j`.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Source ID | source_id + aliases |
| 1 | Title | source.title |
| 2 | Source URL | source.url + resolver |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

## Ancillary retention and score gates

Seven dated control observations and one national poll stay lossless in retained_input; observation/poll bridge IDs crosswalk to their input locator and original row, not an invented entity table. Poll national sample=403 citizens is not its decided-vote n=195 or vote-plus-sympathy n=275. Preserve all source denominators and limitations; no parish forecast. Poll dates are not election dates.

All O gaps, competition/Pedersen values, interpretations, historical coverage and polling watch; all Parameters/Read me rows; cached-formulas; country notes/coverage; workbook/archive metadata stay raw. Five supplied competition values include Encamp zero; Canillo and La Massana null remain null. All seven grouped Pedersen values are null; absence is not zero and no coalition concordance is invented. There is no explicit score_gate boolean in the extracted column contract; future supplied false stays false. Do not calculate a replacement score, clear a withheld field or make metric tables.

Seven original briefings plus andorra.html are retained as artifact bytes/hash/path, payload_json=NULL. JSON files keep their entire payload. Briefing aliases bind exact office filenames. Neither scripts nor HTML run during ingestion. Display-rounded HTML percentages never replace detailed-return numeric values.

## Overrides and incomplete refresh

No Andorra overrides are supplied in this baseline; hash overrides=[]. Future separate `data/overrides/atlas/andorra/` files use atlas-override/1 from Identity Rules, full target keys, expected_original and sourced claims. Never patch frozen inputs or borrow Mexico decisions. Package wins absent an applicable documented decision. Retain conflicting claims and withhold the single date/value through the existing contract; this prompt creates no override.

Incomplete package ≠ delete. Carry omitted offices/events/results/sources and their classifications/evidence/aliases forward using original retained bytes, including deterministic inherited paths when an old/new file shares a logical path. Validate effective office/tier ID-set equality, hash inherited inputs, retain old full snapshots. Only explicit sourced withdrawal/supersession changes active status; IDs remain addressable. A first import missing any expected baseline office fails; inherited data is available only from an actual prior publication.

## Publication and continuity

Start and commit a new durable ledger attempt before staging. Build a consistent backup on the same filesystem; preserve every unrelated selected lineage and row, including Albania. A changed Andorra fingerprint selects one new Andorra R and repoints its active row provenance together; unchanged inputs reuse R with a fresh attempt/receipt. No INSERT OR REPLACE. Validate foreign_keys=ON, recursive_triggers=ON, all FKs, integrity, identities, values/statuses, tiers and counts before publication.

Checkpoint staging WAL with no busy frames, close connections and handle sidecars/readers safely, fsync the staging file, atomic rename on the same filesystem, fsync parent, then commit success in the independent ledger. Failure before swap leaves the previous master and release set serving. Reconcile receipt/ledger after ambiguous post-swap crash before assigning terminal status. Backups preserve prior row content, not only dataset_release metadata. Never blindly delete live WAL/SHM files.

Citations join through each row's own `(lineage_id,release_id)`, never the last publication receipt. Andorra-only re-import leaves LatAm/NZ/Albania releases and rows unchanged. Europe remains default; no rows from those lineages are loaded or rewritten here. Calendar regional filter includes only approved stored tier=regional: for Andorra return no rows and label **“No regional tier in this package; seven municipal councils.”** Regional universe denominator is unknown, not invented. Municipal timing context stays available without populating the regional numerator.

## Document verification

Read-only package validator passed 7 offices, 21 selected histories, 53 results, 7 control observations, 10 catalogue sources and 7 briefings; independent history reconciliation and listed file checksums passed. Additional source checks verified all 28 input hashes, approved tier bytes/ID equality, 13 canonical source URLs, 21 unique ordinary-heading matches, 7 day/14 year dates, exact history/result joins, unique semantic result bindings and 9 zero-seat values. Full 223-column mapping coverage is checked against unchanged SQL declarations; identity/hash vectors checked independently with JavaScript canonicalization. These are documentation/source checks. **Andorra importer, SQLite load, publication, application tests/lint/build and VPS checks: Not run.** Research remains partial. No repository source, tier, DDL, Mexico or continuity files changed.
